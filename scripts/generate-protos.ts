import * as fs from "fs";
import * as path from "path";
import * as protobuf from "protobufjs";

const PROTO_DIR = path.join(__dirname, "..", "protos");
const OUTPUT_DIR = path.join(__dirname, "..", "src", "generated");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Function to recursively find all .proto files
function findProtoFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findProtoFiles(fullPath));
    } else if (entry.name.endsWith(".proto")) {
      files.push(fullPath);
    }
  }

  return files;
}

// Find all proto files
const protoFiles = findProtoFiles(PROTO_DIR);

// Process each proto file
for (const protoFile of protoFiles) {
  console.log(`Processing ${protoFile}...`);

  try {
    const relativePath = path.relative(PROTO_DIR, protoFile);

    // Load the proto file with resolving references
    const root = new protobuf.Root();
    root.resolvePath = (origin, target) => {
      // Handle well-known Google protobuf imports
      if (target.startsWith("google/protobuf/")) {
        // These will be resolved to native types, so we don't need to load them
        return target;
      }

      // Make resolvePath work correctly with imported proto files
      if (path.isAbsolute(target)) {
        return target;
      }

      // Handle relative imports
      if (origin) {
        return path.join(path.dirname(origin), target);
      }

      // Default to looking in the proto directory
      return path.join(PROTO_DIR, target);
    };

    // Load and resolve the proto file
    const loaded = root.loadSync(protoFile);
    loaded.resolveAll();

    const outputPath = path.join(
      OUTPUT_DIR,
      path.dirname(relativePath),
      `${path.basename(relativePath, ".proto")}.ts`,
    );

    // Ensure output directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Map to handle well-known protobuf types
    const wellKnownTypes = new Map<string, string>([
      ["google.protobuf.Timestamp", "Date"],
      ["Timestamp", "Date"],
      ["google.protobuf.Duration", "number"],
      ["google.protobuf.Any", "any"],
      ["google.protobuf.Empty", "{}"],
      ["google.protobuf.FieldMask", "string[]"],
    ]);

    // Set of types that should be skipped (not generated as interfaces)
    const skipTypes = new Set<string>([
      "google.protobuf.Timestamp",
      "Timestamp",
      "google.protobuf.Duration",
      "google.protobuf.Any",
      "google.protobuf.Empty",
      "google.protobuf.FieldMask",
    ]);

    // Build a registry of all protobuf types
    const messageTypeRegistry = new Map<string, protobuf.Type>();
    const enumTypeRegistry = new Map<string, protobuf.Enum>();

    // Gather all types from the root namespace
    function collectTypes(ns: protobuf.NamespaceBase) {
      for (const key in ns.nested) {
        const nested = ns.nested[key];

        if (nested instanceof protobuf.Type) {
          // Skip specific well-known types
          if (!skipTypes.has(nested.fullName) && !skipTypes.has(nested.name)) {
            messageTypeRegistry.set(nested.fullName, nested);
          }

          // Process nested types inside this message
          if (nested.nested) {
            collectTypes(nested);
          }
        } else if (nested instanceof protobuf.Enum) {
          enumTypeRegistry.set(nested.fullName, nested);
        } else if (nested instanceof protobuf.Namespace) {
          collectTypes(nested);
        }
      }
    }

    // Function to collect services from a namespace
    function collectServices(ns: protobuf.NamespaceBase) {
      const services: protobuf.Service[] = [];

      for (const key in ns.nested) {
        const nested = ns.nested[key];

        if (nested instanceof protobuf.Service) {
          services.push(nested);
        } else if (nested instanceof protobuf.Namespace) {
          services.push(...collectServices(nested));
        }
      }

      return services;
    }

    // Start collecting from the root
    collectTypes(root);
    const servicesList = collectServices(root);

    // Generate type definitions
    const interfaces: string[] = [];
    const enums: string[] = [];
    const services: string[] = [];

    // Set to track processed types to avoid duplicates
    const processedTypes = new Set<string>();

    // Helper function to check if type is already processed
    function isProcessed(name: string): boolean {
      return processedTypes.has(name);
    }

    // Helper to determine if a field might be a timestamp based on name or type
    function isTimestampField(field: protobuf.Field): boolean {
      // Check if the type name matches
      if (
        field.type === "Timestamp" ||
        field.resolvedType?.name === "Timestamp" ||
        field.resolvedType?.fullName === "google.protobuf.Timestamp"
      ) {
        return true;
      }

      // Check field naming patterns that suggest it's a timestamp
      const name = field.name.toLowerCase();
      if (
        name.endsWith("time") ||
        name.endsWith("date") ||
        name === "timestamp"
      ) {
        return true;
      }

      return false;
    }

    // Helper to map a protobuf field to TypeScript type
    function mapFieldType(field: protobuf.Field): string {
      // Special case for timestamps
      if (isTimestampField(field)) {
        return "Date";
      }

      // Check if this field has a resolved type
      if (field.resolvedType) {
        const fullTypeName = field.resolvedType.fullName;

        // Handle well-known types
        if (wellKnownTypes.has(fullTypeName)) {
          return wellKnownTypes.get(fullTypeName)!;
        }

        // Handle custom message types
        if (field.resolvedType instanceof protobuf.Type) {
          return `I${field.resolvedType.name}`;
        } else if (field.resolvedType instanceof protobuf.Enum) {
          return field.resolvedType.name;
        }
      }

      // If there's no resolved type, map primitive types
      switch (field.type) {
        case "double":
        case "float":
        case "int32":
        case "uint32":
        case "sint32":
        case "fixed32":
        case "sfixed32":
        case "int64":
        case "uint64":
        case "sint64":
        case "fixed64":
        case "sfixed64":
          return "number";
        case "bool":
          return "boolean";
        case "string":
          return "string";
        case "bytes":
          return "Uint8Array";
        default:
          // For custom message types that couldn't be resolved directly
          if (field.type) {
            // Try to look up the type in our registry
            const packageName = field.parent?.fullName
              .split(".")
              .slice(0, -1)
              .join(".");
            if (packageName) {
              const possibleFullName = `${packageName}.${field.type}`;
              if (messageTypeRegistry.has(possibleFullName)) {
                return `I${field.type}`;
              }
              if (enumTypeRegistry.has(possibleFullName)) {
                return field.type;
              }
            }

            // Look for exact type name in the registry
            for (const [fullName, type] of messageTypeRegistry.entries()) {
              if (fullName.endsWith(`.${field.type}`)) {
                return `I${type.name}`;
              }
            }

            for (const [fullName, enumType] of enumTypeRegistry.entries()) {
              if (fullName.endsWith(`.${field.type}`)) {
                return enumType.name;
              }
            }

            // Extra check for Timestamp
            if (
              field.type === "Timestamp" ||
              field.type.endsWith(".Timestamp")
            ) {
              return "Date";
            }
          }

          console.warn(
            `Unknown field type: ${field.type} for field ${field.name}`,
          );
          return "any";
      }
    }

    // Generate TypeScript interfaces for message types
    for (const [fullName, messageType] of messageTypeRegistry.entries()) {
      // Skip types that should be skipped
      if (skipTypes.has(fullName) || skipTypes.has(messageType.name)) {
        continue;
      }

      // Skip duplicates
      if (isProcessed(messageType.name)) {
        continue;
      }

      // Skip the Timestamp interface entirely
      if (messageType.name === "Timestamp") {
        continue;
      }

      processedTypes.add(messageType.name);

      const fields = messageType.fieldsArray.map(field => {
        let fieldType = mapFieldType(field);

        // For array fields
        if (field.repeated) {
          fieldType = `${fieldType}[]`;
        } else if (field.map) {
          // Handle map fields
          fieldType = `{[key: string]: ${fieldType}}`;
        }

        // All fields are optional by default in TypeScript interfaces
        return `  ${field.name}?: ${fieldType};`;
      });

      interfaces.push(`export interface I${messageType.name} {
${fields.join("\n")}
}`);
    }

    // Generate TypeScript enums
    for (const [_, enumType] of enumTypeRegistry.entries()) {
      // Skip duplicates
      if (isProcessed(enumType.name)) {
        continue;
      }

      processedTypes.add(enumType.name);

      const enumValues = Object.entries(enumType.values).map(
        ([name, value]) => `  ${name} = ${value},`,
      );

      enums.push(`export enum ${enumType.name} {
${enumValues.join("\n")}
}`);
    }

    // Generate service interfaces
    for (const service of servicesList) {
      const methods = service.methodsArray.map(method => {
        let requestType = "any";
        let responseType = "any";

        if (method.resolvedRequestType) {
          requestType = `I${method.resolvedRequestType.name}`;
        }

        if (method.resolvedResponseType) {
          responseType = `I${method.resolvedResponseType.name}`;
        }

        if (method.responseStream) {
          return `  ${method.name}(request: ${requestType}): Promise<AsyncIterable<${responseType}>>;`;
        } else {
          return `  ${method.name}(request: ${requestType}): Promise<${responseType}>;`;
        }
      });

      services.push(`export interface I${service.name}Client {
${methods.join("\n")}
}`);
    }

    // Generate the output TypeScript file
    const ts = root.toJSON();
    const content = `// Generated from ${relativePath}

// TypeScript interfaces generated from protobuf definitions
${interfaces.join("\n\n")}

${enums.length > 0 ? enums.join("\n\n") + "\n\n" : ""}
${services.length > 0 ? services.join("\n\n") : ""}

// Original protobuf JSON schema
export const ${path.basename(relativePath, ".proto")} = ${JSON.stringify(ts, null, 2)};
`;

    fs.writeFileSync(outputPath, content);
    console.log(
      `Generated ${outputPath} with ${interfaces.length} interfaces, ${enums.length} enums, and ${services.length} services`,
    );
  } catch (error) {
    console.error(`Error processing ${protoFile}:`, error);
  }
}

console.log("Proto generation complete!");
