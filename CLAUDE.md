# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**whatver** is a modern CLI tool and Node.js module built with TypeScript and Bun that checks npm package versions against semver ranges. It provides both a command-line interface and a programmatic API to determine which versions of an npm package satisfy a given semver constraint, with colored output to highlight valid versions.

## Architecture

The project follows a modern TypeScript architecture with source and build separation:

### Source Files (src/)
- **src/lib.ts**: Core module that exports the main functionality
  - Uses `npm view` command to fetch package versions from npm registry
  - Leverages the `semver` library to validate versions against ranges
  - Returns array of `{version, satisfied}` objects with proper TypeScript typing
  
- **src/cli.ts**: Command-line interface wrapper
  - Handles argument parsing and validation with TypeScript types
  - Uses `chalk` for colored terminal output (green for valid versions)
  - Uses `cli-columns` for formatted multi-column display
  - Contains usage text and error handling
  
- **src/shared-types.ts**: Shared TypeScript interfaces used across modules
- **src/types.d.ts**: Local type definitions for packages without official types

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

### Run Development Version
```bash
bun run dev <package-name> "<semver-range>"
# Example: bun run dev lodash "^4.14"
```

### Run Compiled Version
```bash
bun run start <package-name> "<semver-range>"
# Example: bun run start lodash "^4.14"
```

### Type Checking
```bash
bun run typecheck    # Check types without emitting files
```

### Testing
Currently no test framework is configured. The package.json shows:
```bash
bun test  # Will output "Error: no test specified" and exit 1
```

## Dependencies

### Runtime Dependencies
- **chalk**: Terminal string styling (colors) - v5.6.2
- **cli-columns**: Multi-column terminal output formatting - v4.0.0
- **semver**: Semantic versioning utilities for validation - v7.7.2

### Development Dependencies  
- **typescript**: TypeScript compiler - v5.9.2
- **@types/bun**: Bun runtime type definitions (includes Node.js compatibility) - v1.2.21
- **@types/semver**: Semver type definitions - v7.7.1
- **@npm/types**: Official npm registry API type definitions - v2.1.0

### Type Definitions
- **src/types.d.ts**: Local type definitions for cli-columns (no official types available)

## Module Usage

The library can be imported and used programmatically with full TypeScript support:

```typescript
import checkVersions from "./lib.js";

const versionInfo = await checkVersions("lodash", "^4.14");
// Returns Promise<VersionInfo[]> where VersionInfo = { version: string, satisfied: boolean }
console.log(versionInfo);
```

## Key Implementation Details

- **TypeScript**: Full type safety with interfaces for all data structures
- **Bun Runtime**: Modern JavaScript runtime with fast startup and built-in TypeScript support
- **DevBox Environment**: Reproducible development environment with automatic activation via direnv
- **ESM Imports**: Modern ES module imports in TypeScript source
- **Build Pipeline**: Bun bundler for fast compilation + TypeScript for declaration files and type checking
- **npm Registry API**: Direct HTTP API calls to npm registry with optimized headers (72% smaller responses)
- **Async/Await**: Modern async patterns with fetch API
- **Error Handling**: CLI catches and displays error messages with proper TypeScript error typing