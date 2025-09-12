# whatver

A modern CLI tool and Node.js library for checking npm package versions against semver ranges. Built with TypeScript and Bun for fast performance and excellent developer experience.

## Features

- 🚀 **Fast**: Uses npm registry HTTP API with optimized headers for 72% smaller responses
- 📦 **Two APIs**: Get all versions with satisfaction status, or only satisfied versions
- 🔍 **Smart Validation**: Early semver range validation with helpful error messages
- 📊 **Sorted Output**: Automatic version sorting for consistent results
- 🎨 **CLI Colors**: Highlighted output showing which versions satisfy your range
- ✅ **Well Tested**: Comprehensive test suite covering all edge cases
- 📘 **TypeScript**: Full type safety and IntelliSense support

## CLI Usage

```bash
npx whatver lodash "^4.14"
```
![screenshot](screenshot.png)

## Library Usage

### Get all versions with satisfaction status

```typescript
import { allVersions } from "whatver";

const versionInfo = await allVersions("lodash", "^4.14");
// Returns: [
//   { version: "4.14.0", satisfied: true },
//   { version: "4.15.0", satisfied: true },
//   { version: "3.10.1", satisfied: false },
//   ...
// ]
console.log(versionInfo);
```

### Get only versions that satisfy the range

```typescript
import { satisfiedVersions } from "whatver";

const satisfied = await satisfiedVersions("lodash", "^4.14");
// Returns: ["4.14.0", "4.14.1", "4.15.0", "4.16.0", ...]
console.log(satisfied);
```

### Error Handling

```typescript
import { allVersions } from "whatver";

try {
  const versions = await allVersions("nonexistent-package", "^1.0.0");
} catch (error) {
  console.error(error.message);
  // "Failed to fetch package versions: Package 'nonexistent-package' not found in npm registry"
}

try {
  const versions = await allVersions("lodash", "invalid-semver");
} catch (error) {
  console.error(error.message);
  // "Invalid semver range: invalid-semver"
}
```

## Installation

```bash
# For CLI usage
npm install -g whatver

# For library usage  
npm install whatver
```

## Development

This project uses Bun and DevBox for development:

```bash
# Install dependencies
bun install

# Build the project
bun run build

# Run tests
bun test

# Type checking
bun run type-check

# Linting and formatting
bun run check
```
