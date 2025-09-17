# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**whatver** is a modern CLI tool and Node.js module built with TypeScript and Bun that checks npm package versions against semver ranges. It provides an intelligent command-line interface that automatically detects local packages and their semver ranges, plus a comprehensive programmatic API to analyze npm package versions, determine semver satisfaction, and filter versions based on constraints. Features include visual indicators for installed versions, horizontal column output, and smart CLI behavior based on local package detection.

## Architecture

The project follows a modern TypeScript architecture with source and build separation:

### Source Files (src/)
- **src/index.ts**: Public API entry point
  - Clean re-exports of public functions: `allPackageVersions()` and `satisfiedPackageVersions()`
  - Re-exports TypeScript types: `PackageVersionInfo` and `PackageVersionOptions`
  - Serves as the main module entry point for library consumers
  - Contains no implementation details, only public API surface
  
- **src/lib.ts**: Core implementation module
  - Contains all implementation details moved from index.ts for better separation of concerns
  - Uses npm registry HTTP API with optimized headers (72% smaller responses with Accept: application/vnd.npm.install-v1+json)
  - Uses `/latest` endpoint for efficient package metadata fetching (name, description, homepage, repository)
  - Leverages the `semver` library for validation, satisfaction checking, and prerelease detection
  - Includes helper functions: `fetchPackageVersions()`, `fetchPackageInfo()`, `localPackageSemverRange()`, `localPackageInstalledVersion()`
  - Contains private type guards: `isNpmManifest()`, `isPackageJSON()`, `isNpmPackumentVersion()`, `isNpmDist()`
  - Uses Node.js `require()` for filesystem access to package.json and node_modules
  
- **src/cli.ts**: Command-line interface wrapper
  - Imports from `lib.ts` for access to all functions including internal ones
  - Uses `yargs` for modern argument parsing with proper TypeScript support and help generation
  - Implements intelligent CLI behavior with package information display and local detection
  - Uses `chalk` for colored terminal output with visual indicators and pipe-separated formatting
  - Uses `cli-columns` for horizontal multi-column display optimized for terminals
  - Displays package info with format: `packagename | homepage` and local info: `./node_modules/pkg | ✔ version | range`
  - Includes `--show-prerelease` option and `--all` flag for comprehensive version control
  - Contains comprehensive error handling, help text, and example usage
  
- **src/format.ts**: Output formatting utilities
  - `formatPackageInfo()`: Formats package name with homepage URL in pipe-separated style
  - `formatLocalPackageInfo()`: Formats local package detection with colorized indicators
  - `formatVersionString()`: Handles version styling with checkmarks and color coding
  - Uses `chalk` for consistent color theming and visual hierarchy
  - Supports different contexts: user-provided ranges vs local ranges, installed vs not installed
  
- **src/types.ts**: TypeScript interfaces for the library
  - `PackageVersionInfo` interface for version results with satisfaction status (re-exported via index.ts)
  - `PackageVersionOptions` interface for function options including prerelease control (re-exported via index.ts)
  - Part of the public API surface, available to library consumers
  
- **src/utils.ts**: Utility functions
  - `ignoreErrors()`: Helper function for graceful error handling in CLI contexts
  - Utility functions that support both CLI and library functionality
  
- **src/declarations.d.ts**: Local type definitions for packages without official types

### Build Output (dist/)
- **dist/index.js** + **dist/index.d.ts**: Public API module for library consumers (small, clean interface)
- **dist/lib.js** + **dist/lib.d.ts**: Internal implementation module (used by CLI, contains all functionality)
- **dist/cli.js**: Command-line executable with full feature set
- **dist/format.js** + **dist/format.d.ts**: Formatting utilities
- **dist/types.js** + **dist/types.d.ts**: TypeScript interfaces
- **dist/utils.js** + **dist/utils.d.ts**: Utility functions
- Source maps for debugging all modules

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
- **semver**: Semantic versioning utilities for validation and prerelease detection - v7.7.2
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

The library provides a clean public API with full TypeScript support:

```typescript
import { allPackageVersions, satisfiedPackageVersions, type PackageVersionInfo, type PackageVersionOptions } from "whatver";

// Get all stable versions with satisfaction status (prerelease excluded by default)
const versionInfo: PackageVersionInfo[] = await allPackageVersions("lodash", "^4.14");
// Returns Promise<PackageVersionInfo[]> where PackageVersionInfo = { version: string, satisfied: boolean }
console.log(versionInfo);

// Include prerelease versions with typed options
const options: PackageVersionOptions = { showPrerelease: true };
const withPrerelease = await allPackageVersions("lodash", "^4.14", options);

// Get only stable versions that satisfy the range
const satisfied: string[] = await satisfiedPackageVersions("lodash", "^4.14");
// Returns Promise<string[]> - array of version strings (stable versions only)
console.log(satisfied);

// Include prerelease versions that satisfy the range
const satisfiedWithPrerelease = await satisfiedPackageVersions("lodash", "^4.14", { showPrerelease: true });
```

### Public API Surface

The public API is deliberately minimal and focused:

- **Functions**: `allPackageVersions()`, `satisfiedPackageVersions()`
- **Types**: `PackageVersionInfo`, `PackageVersionOptions`

Internal functions like `localPackageSemverRange()`, `localPackageInstalledVersion()`, `fetchPackageInfo()`, and `fetchPackageVersions()` are available in `lib.ts` but not exposed as part of the public API to maintain a clean interface for library consumers.

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
- **Prerelease Filtering**: Uses semver's `prerelease()` function to identify and filter prerelease versions by default
- **Smart CLI Logic**: Intelligent behavior that shows satisfied versions by default when local range exists, all versions otherwise
- **Visual Terminal Output**: Horizontal column display with color-coded versions and alignment for visual indicators
- **Options-Based API**: Flexible function signatures with options objects for controlling prerelease inclusion
- **Comprehensive Testing**: Test suite using Bun's built-in test runner with mock.module for proper mocking of filesystem access
- **Biome Integration**: Fast linting and formatting with Biome for consistent code quality

## Change Checklist

When implementing new functionality or making changes, follow this checklist:

- [ ] **Write failing tests first** - Add tests that describe the desired behavior before implementing (unless otherwise specified for hotfixes or refactoring)
- [ ] **Implement functionality** - Write the minimum code needed to make tests pass
- [ ] **Update function signatures and behavior** - Ensure all changes are properly typed and documented
- [ ] **Verify all tests pass** - Run full test suite to ensure no regressions
- [ ] **Update README.md** - Add new examples, CLI usage patterns, and feature documentation
- [ ] **Update CLAUDE.md** - Update implementation details, dependencies, and architectural changes
- [ ] **Update CLI help text and examples** - Ensure yargs examples and descriptions reflect new functionality
- [ ] **Run linting and type checking** - Execute `bun run check` and `bun run type-check` to ensure code quality

## Continuous Integration

The project uses GitHub Actions for CI/CD:

### **CI Workflow** (`.github/workflows/ci.yml`)
- **Triggers**: Runs on pushes to `main` and all pull requests to `main`
- **Environment**: Ubuntu latest with devbox-managed dependencies (ensures exact parity with local development)
- **Steps**:
  1. **Checkout code** - Uses `actions/checkout@v4`
  2. **Setup devbox** - Uses `jetify-com/devbox-action@v0.13.0` with caching enabled
  3. **Install dependencies** - Runs `devbox run -- bun install`
  4. **Type checking** - Runs `devbox run -- bun run type-check` (TypeScript compilation check)
  5. **Linting/Formatting** - Runs `devbox run -- bun run check` (Biome linter and formatter)
  6. **Testing** - Runs `devbox run -- bun test` (full test suite with Bun's test runner)

All checks must pass for pull requests to be merged.