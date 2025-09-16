# whatver

A modern CLI tool and Node.js library for checking npm package versions against semver ranges. Built with TypeScript and Bun for fast performance and excellent developer experience.

## Features

- 🚀 **Fast**: Uses npm registry HTTP API with optimized headers for 72% smaller responses
- 🧠 **Smart CLI**: Automatically detects local packages and their semver ranges
- 📦 **Two APIs**: Get all versions with satisfaction status, or only satisfied versions
- 🔍 **Smart Validation**: Early semver range validation with helpful error messages
- 📊 **Sorted Output**: Automatic version sorting for consistent results
- 🎨 **Visual Indicators**: Color-coded output with icons for installed versions
- 🖥️ **Column Display**: Horizontal column output optimized for terminal viewing
- ✅ **Well Tested**: Comprehensive test suite covering all edge cases
- 📘 **TypeScript**: Full type safety and IntelliSense support

## CLI Usage

### Basic Usage
```bash
# Show all versions of a package
npx whatver lodash

# Show versions matching a specific range
npx whatver lodash "^4.14"
```

### Smart Local Package Detection
When run in a project directory, whatver automatically detects local packages:

```bash
# In a project with lodash in package.json
npx whatver lodash
# Automatically uses the semver range from your package.json
# Shows installed version with visual indicators

# Override with specific range
npx whatver lodash "^4.0.0"

# Show all versions with local range highlighted
npx whatver lodash --all
```

### Visual Indicators
- **✔** (magenta): Installed version from node_modules
- **Green**: Versions satisfying provided semver range
- **Yellow**: Versions satisfying local package.json range
- **Gray**: Versions not satisfying any range

![screenshot](screenshot.png)

## Library Usage

### Get all versions with satisfaction status

```typescript
import { allPackageVersions } from "whatver";

const versionInfo = await allPackageVersions("lodash", "^4.14");
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
import { satisfiedPackageVersions } from "whatver";

const satisfied = await satisfiedPackageVersions("lodash", "^4.14");
// Returns: ["4.14.0", "4.14.1", "4.15.0", "4.16.0", ...]
console.log(satisfied);
```

### Local Package Detection

```typescript
import { localPackageSemverRange, localPackageInstalledVersion } from "whatver";

// Get semver range from local package.json
try {
  const range = localPackageSemverRange("lodash");
  console.log(range); // "^4.17.21"
} catch (error) {
  console.log("Package not found in package.json");
}

// Get installed version from node_modules
try {
  const version = localPackageInstalledVersion("lodash");
  console.log(version); // "4.17.21"
} catch (error) {
  console.log("Package not installed");
}
```

### Error Handling

```typescript
import { allPackageVersions } from "whatver";

try {
  const versions = await allPackageVersions("nonexistent-package", "^1.0.0");
} catch (error) {
  console.error(error.message);
  // "Failed to fetch package versions: Package 'nonexistent-package' not found in npm registry"
}

try {
  const versions = await allPackageVersions("lodash", "invalid-semver");
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
