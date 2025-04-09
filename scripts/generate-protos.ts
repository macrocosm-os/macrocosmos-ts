import * as fs from 'fs';
import * as path from 'path';
import * as protobuf from 'protobufjs';

const PROTO_DIR = path.join(__dirname, '..', 'protos');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'generated');

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
    } else if (entry.name.endsWith('.proto')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Generate TypeScript interface for a protobuf message type
function generateInterface(type: protobuf.Type, packageName: string, typeMap: Map<string, string> = new Map()): string {
  const properties = type.fieldsArray.map(field => {
    const optional = !field.required ? '?' : '';
    const isRepeated = field.repeated;
    const propertyName = field.name;
    let propertyType: string;

    if (field.resolvedType) {
      // Reference to another message type
      if (field.resolvedType instanceof protobuf.Type) {
        const typeName = field.resolvedType.name;
        propertyType = `I${typeName}`;
        
        // Store in the type map for validation
        typeMap.set(field.resolvedType.fullName, propertyType);
      } else if (field.resolvedType instanceof protobuf.Enum) {
        // Enum type
        propertyType = field.resolvedType.name;
      } else {
        propertyType = 'any';
      }
    } else {
      // Convert protobuf types to TypeScript types
      switch (field.type) {
        case 'double':
        case 'float':
        case 'int32':
        case 'uint32':
        case 'sint32':
        case 'fixed32':
        case 'sfixed32':
        case 'int64':
        case 'uint64':
        case 'sint64':
        case 'fixed64':
        case 'sfixed64':
          propertyType = 'number';
          break;
        case 'bool':
          propertyType = 'boolean';
          break;
        case 'string':
          propertyType = 'string';
          break;
        case 'bytes':
          propertyType = 'Uint8Array';
          break;
        default:
          propertyType = 'any';
      }
    }

    if (isRepeated) {
      propertyType = `${propertyType}[]`;
    }

    return `  ${propertyName}${optional}: ${propertyType};`;
  });

  return `export interface I${type.name} {
${properties.join('\n')}
}`;
}

// Generate TypeScript for all types in a protobuf namespace
function generateNamespaceTypings(
  namespace: protobuf.Namespace,
  packageName: string,
  interfaces: Set<string> = new Set(),
  parentNamespace: string = '',
  typeMap: Map<string, string> = new Map()
): string[] {
  const results: string[] = [];
  const currentNamespace = parentNamespace 
    ? `${parentNamespace}.${namespace.name}`
    : namespace.name;

  // Process nested namespaces
  for (const nestedName in namespace.nested) {
    const nested = namespace.nested[nestedName];
    
    if (nested instanceof protobuf.Type) {
      // Message type
      const messageInterface = generateInterface(nested, packageName, typeMap);
      if (!interfaces.has(nested.name)) {
        results.push(messageInterface);
        interfaces.add(nested.name);
      }

      // Process nested types inside this message
      if (nested.nested) {
        results.push(...generateNamespaceTypings(nested, packageName, interfaces, currentNamespace, typeMap));
      }
    } else if (nested instanceof protobuf.Namespace) {
      // Nested namespace
      results.push(...generateNamespaceTypings(nested, packageName, interfaces, currentNamespace, typeMap));
    } else if (nested instanceof protobuf.Enum) {
      // Enum type
      const enumValues = Object.entries(nested.values).map(([name, value]) => `  ${name} = ${value},`);
      results.push(`export enum ${nested.name} {
${enumValues.join('\n')}
}`);
    } else if (nested instanceof protobuf.Service) {
      // Service definition
      const serviceMethods = nested.methodsArray.map(method => {
        const requestType = method.resolvedRequestType 
          ? `I${method.resolvedRequestType.name}` 
          : 'any';
        const responseType = method.resolvedResponseType 
          ? `I${method.resolvedResponseType.name}` 
          : 'any';
        
        // Use generic AsyncIterable for streaming
        if (method.responseStream) {
          return `  ${method.name}(request: ${requestType}): Promise<AsyncIterable<${responseType}>>;`;
        } else {
          return `  ${method.name}(request: ${requestType}): Promise<${responseType}>;`;
        }
      });
      
      results.push(`export interface I${nested.name}Client {
${serviceMethods.join('\n')}
}`);
    }
  }

  return results;
}

// Find all proto files
const protoFiles = findProtoFiles(PROTO_DIR);

// Process each proto file
for (const protoFile of protoFiles) {
  console.log(`Processing ${protoFile}...`);
  
  try {
    const root = protobuf.loadSync(protoFile);
    const relativePath = path.relative(PROTO_DIR, protoFile);
    const outputPath = path.join(
      OUTPUT_DIR,
      path.dirname(relativePath),
      `${path.basename(relativePath, '.proto')}.ts`
    );

    // Ensure output directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Extract package name from relative path (e.g. "apex/v1/apex.proto" -> "apex.v1")
    const packageName = path.dirname(relativePath).replace(/\//g, '.');
    
    // First pass: gather all message types
    const typeMap = new Map<string, string>();

    // Generate TypeScript interfaces
    const interfaces: string[] = [];
    
    // Process all namespaces in the root
    for (const namespaceName in root.nested) {
      const namespace = root.nested[namespaceName];
      if (namespace instanceof protobuf.Namespace) {
        interfaces.push(...generateNamespaceTypings(namespace, packageName, new Set(), '', typeMap));
      }
    }

    // Second pass: fix references
    const fixedInterfaces = interfaces.map(interfaceStr => {
      // Fix type references from any to proper interface types
      return interfaceStr.replace(/: any(\[\])?;/g, (match, isArray) => {
        const propertyLine = match.split(':')[0].trim();
        const propertyName = propertyLine.replace('?', '');
        
        // Check if we have a matching type for this property name
        for (const [fullName, typeName] of typeMap.entries()) {
          // Try to match property name with type name (camelCase to PascalCase)
          const pascalCaseName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
          if (fullName.endsWith(pascalCaseName)) {
            return `: ${typeName}${isArray || ''};`;
          }
        }
        
        return match; // Keep as any if no match found
      });
    });

    // Generate the full TypeScript code
    const ts = root.toJSON();
    const content = `// Generated from ${relativePath}

// TypeScript interfaces generated from protobuf definitions
${fixedInterfaces.join('\n\n')}

// Original protobuf JSON schema
export const ${path.basename(relativePath, '.proto')} = ${JSON.stringify(ts, null, 2)};
`;

    fs.writeFileSync(outputPath, content);
    console.log(`Generated ${outputPath}`);
  } catch (error) {
    console.error(`Error processing ${protoFile}:`, error);
  }
}

console.log('Proto generation complete!'); 