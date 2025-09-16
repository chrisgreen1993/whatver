# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**whatver** is a modern CLI tool and Node.js module built with TypeScript and Bun that checks npm package versions against semver ranges. It provides an intelligent command-line interface that automatically detects local packages and their semver ranges, plus a comprehensive programmatic API to analyze npm package versions, determine semver satisfaction, and filter versions based on constraints. Features include visual indicators for installed versions, horizontal column output, and smart CLI behavior based on local package detection.

## Architecture

The project follows a modern TypeScript architecture with source and build separation:

### Source Files (src/)
- **src/index.ts**: Core module that exports the main functionality
  - Uses npm registry HTTP API to fetch package versions with optimized headers
  - Leverages the `semver` library to validate ranges and check version satisfaction
  - Exports `allPackageVersions()` and `satisfiedPackageVersions()` functions with proper TypeScript typing
  - Exports `localPackageSemverRange()` and `localPackageInstalledVersion()` for local package detection
  - Includes semver range validation using `validRange()` for early error detection
  - Uses Node.js `require()` for filesystem access to package.json and node_modules
  
- **src/cli.ts**: Command-line interface wrapper
  - Uses `yargs` for modern argument parsing with proper TypeScript support
  - Implements intelligent CLI behavior that adapts based on local package presence
  - Uses `chalk` for colored terminal output with compound styling (green/yellow for ranges, magenta for installed)
  - Uses `cli-columns` for horizontal multi-column display optimized for terminals
  - Includes visual indicators (✔ checkmark) for installed versions with proper alignment
  - Contains comprehensive error handling and help text
  
- **src/types.ts**: TypeScript interfaces for the library
  - `PackageVersionInfo` interface for version data with satisfaction status
- **src/delcarations.d.ts**: Local type definitions for packages without official types

### Build Output (dist/)
- Compiled JavaScript files with declaration files (.d.ts)
- Source maps for debugging

## Development Environment

### DevBox Setup
This project uses DevBox with direnv for reproducible development environments:
```bash
# DevBox will automatically activate when entering the directory (via direnv)
# Or manually activate with:
devbox shell

# Bun is available in the DevBox environment
bun --version
```

## Development Commands

### Install Dependencies
```bash
bun install
```

### Build TypeScript
```bash
bun run build        # Build with Bun bundler + generate TypeScript declarations
```

### Type Checking
```bash
bun run type-check    # Check types without emitting files
```

### Testing
```bash
bun test            # Run test suite with Bun's built-in test runner
```

### Linting & Formatting
```bash
bun run lint        # Run Biome linter
bun run format      # Run Biome formatter
bun run check       # Run both linter and formatter checks
```

## Dependencies

### Runtime Dependencies
- **chalk**: Terminal string styling (colors) - v5.6.2
- **cli-columns**: Multi-column terminal output formatting - v4.0.0
- **semver**: Semantic versioning utilities for validation - v7.7.2
- **yargs**: Modern command-line argument parsing - latest

### Development Dependencies  
- **typescript**: TypeScript compiler - v5.9.2
- **@biomejs/biome**: Fast linter and formatter for JavaScript/TypeScript - v2.2.4
- **@types/bun**: Bun runtime type definitions (includes Node.js compatibility) - v1.2.21
- **@types/semver**: Semver type definitions - v7.7.1
- **@npm/types**: Official npm registry API type definitions - v2.1.0

### Type Definitions
- **src/delcarations.d.ts**: Local type definitions for cli-columns (no official types available)

## Module Usage

The library can be imported and used programmatically with full TypeScript support:

```typescript
import { allPackageVersions, satisfiedPackageVersions, localPackageSemverRange, localPackageInstalledVersion } from "whatver";

// Get all versions with satisfaction status
const versionInfo = await allPackageVersions("lodash", "^4.14");
// Returns Promise<PackageVersionInfo[]> where PackageVersionInfo = { version: string, satisfied: boolean }
console.log(versionInfo);

// Get only versions that satisfy the range
const satisfied = await satisfiedPackageVersions("lodash", "^4.14");
// Returns Promise<string[]> - array of version strings
console.log(satisfied);

// Local package detection
const localRange = localPackageSemverRange("lodash"); // Returns semver range from package.json
const installedVersion = localPackageInstalledVersion("lodash"); // Returns version from node_modules
```

## Key Implementation Details

- **TypeScript**: Full type safety with interfaces for all data structures
- **Bun Runtime**: Modern JavaScript runtime with fast startup and built-in TypeScript support
- **DevBox Environment**: Reproducible development environment with automatic activation via direnv
- **ESM Imports**: Modern ES module imports in TypeScript source
- **Build Pipeline**: Bun bundler for fast compilation + TypeScript for declaration files and type checking
- **npm Registry API**: Direct HTTP API calls to npm registry with optimized headers (72% smaller responses)
- **Async/Await**: Modern async patterns with fetch API
- **Error Handling**: Comprehensive error handling with proper TypeScript error typing and ignoreErrors utility
- **Semver Validation**: Early validation of semver ranges using `validRange()` for better error messages
- **Version Sorting**: Automatic sorting of versions using `semver.sort()` for consistent output
- **Local Package Detection**: Automatic detection of packages in package.json and node_modules using Node.js require()
- **Smart CLI Logic**: Intelligent behavior that shows satisfied versions by default when local range exists, all versions otherwise
- **Visual Terminal Output**: Horizontal column display with color-coded versions and alignment for visual indicators
- **Comprehensive Testing**: Test suite using Bun's built-in test runner with mock.module for proper mocking of filesystem access
- **Biome Integration**: Fast linting and formatting with Biome for consistent code quality