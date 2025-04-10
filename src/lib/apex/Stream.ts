export type ReadableStreamInterface = ReadableStream<Uint8Array>;

/**
 * A Stream implementation for gRPC streaming responses
 * Similar to OpenAI's Stream class but specific to Apex API
 */
export class ApexStream<Item> implements AsyncIterable<Item> {
  controller: AbortController;

  constructor(
    private iterator: () => AsyncIterator<Item>,
    controller: AbortController,
  ) {
    this.controller = controller;
  }

  /**
   * Creates a Stream from a gRPC streaming response
   */
  static fromGrpcStream<Item>(
    grpcStream: {
      on: (event: string, listener: (...args: unknown[]) => void) => void;
      cancel: () => void;
      removeAllListeners: (event: string) => void;
    },
    controller: AbortController,
  ): ApexStream<Item> {
    let consumed = false;

    // Create a more efficient implementation using direct event handling
    async function* efficientIterator(): AsyncIterator<Item, void, undefined> {
      if (consumed) {
        throw new Error(
          "Cannot iterate over a consumed stream, use `.tee()` to split the stream.",
        );
      }
      consumed = true;

      try {
        // Set up event listener cleanup function
        const cleanup = () => {
          grpcStream.removeAllListeners("data");
          grpcStream.removeAllListeners("end");
          grpcStream.removeAllListeners("error");
        };

        // Create a queue to hold chunks as they arrive
        const queue: Item[] = [];
        let streamEnded = false;
        let streamError: Error | null = null;

        // Create promises to track new data and end of stream
        let resolveData: (() => void) | null = null;

        // Set up the event handlers
        grpcStream.on("data", ((chunk: Item) => {
          queue.push(chunk);
          if (resolveData) {
            resolveData();
            resolveData = null;
          }
        }) as (...args: unknown[]) => void);

        grpcStream.on("end", () => {
          streamEnded = true;
          if (resolveData) {
            resolveData();
            resolveData = null;
          }
        });

        grpcStream.on("error", ((error: Error) => {
          streamError = error;
          if (resolveData) {
            resolveData();
            resolveData = null;
          }
        }) as (...args: unknown[]) => void);

        // Handle controller abort
        controller.signal.addEventListener("abort", () => {
          grpcStream.cancel();
          streamEnded = true;
          if (resolveData) {
            resolveData();
            resolveData = null;
          }
        });

        // Process the queue
        while (!streamEnded || queue.length > 0) {
          if (queue.length > 0) {
            yield queue.shift()!;
          } else if (!streamEnded) {
            // Wait for more data
            await new Promise<void>(resolve => {
              resolveData = resolve;
            });

            // If we got an error, throw it
            if (streamError) {
              throw new Error(String(streamError));
            }
          }
        }

        // Clean up event handlers
        cleanup();
      } catch (e) {
        // If the user calls `stream.controller.abort()`, we should exit without throwing.
        if (e instanceof Error && e.name === "AbortError") return;
        throw e;
      } finally {
        // If not done, abort the ongoing request.
        if (!controller.signal.aborted) {
          grpcStream.cancel();
          controller.abort();
        }
      }
    }

    return new ApexStream(efficientIterator, controller);
  }

  [Symbol.asyncIterator](): AsyncIterator<Item> {
    return this.iterator();
  }

  /**
   * Splits the stream into two streams which can be
   * independently read from at different speeds.
   */
  tee(): [ApexStream<Item>, ApexStream<Item>] {
    const left: Array<Promise<IteratorResult<Item>>> = [];
    const right: Array<Promise<IteratorResult<Item>>> = [];
    const iterator = this.iterator();

    const teeIterator = (
      queue: Array<Promise<IteratorResult<Item>>>,
    ): AsyncIterator<Item> => {
      return {
        next: () => {
          if (queue.length === 0) {
            const result = iterator.next();
            left.push(result);
            right.push(result);
          }
          return queue.shift()!;
        },
      };
    };

    return [
      new ApexStream(() => teeIterator(left), this.controller),
      new ApexStream(() => teeIterator(right), this.controller),
    ];
  }

  /**
   * Converts this stream to a ReadableStream
   */
  toReadableStream(): ReadableStreamInterface {
    let iter: AsyncIterator<Item>;
    const encoder = new TextEncoder();

    return new ReadableStream({
      start() {
        iter = (this as ApexStream<Item>)[Symbol.asyncIterator]();
      },
      async pull(controller) {
        try {
          const result = await iter.next();
          const value = result.value as Item;
          const done = result.done;
          if (done) {
            return controller.close();
          }

          const bytes = encoder.encode(JSON.stringify(value) + "\n");
          controller.enqueue(bytes);
        } catch (err) {
          controller.error(err);
        }
      },
      async cancel() {
        await iter.return?.();
      },
    });
  }
}
