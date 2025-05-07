# How to generate latest types and GRPC clients from the proto files

There's a script `gen:proto` defined in [package.json](../package.json) that calls the `ts-proto` library.

```bash
brew install protobuf
npm run gen:proto
```
