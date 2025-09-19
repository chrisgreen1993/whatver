# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**whatver** is a CLI tool and Node.js module built with TypeScript and Bun that checks npm package versions against semver ranges. It provides intelligent CLI behavior with local package detection and a programmatic API.

## Architecture

### Source Files (src/)
- **src/index.ts**: Public API entry point - exports `allPackageVersions()`, `satisfiedPackageVersions()` and types
- **src/lib.ts**: Core implementation - npm registry API calls, semver validation, local package detection
- **src/cli.ts**: Command-line interface - uses yargs, chalk, cli-columns for terminal output
- **src/format.ts**: Output formatting utilities for colored terminal display
- **src/types.ts**: TypeScript interfaces (`PackageVersionInfo`, `PackageVersionOptions`)
- **src/utils.ts**: Utility functions like `ignoreErrors()`

## Development Commands

```bash
bun install           # Install dependencies
bun run build         # Build with Bun bundler + TypeScript declarations
bun run type-check    # Type checking only
bun test              # Run test suite
bun run lint          # Biome linter
bun run format        # Biome formatter  
bun run check         # Both linter and formatter
```

## Change Checklist

- [ ] **Write failing tests first** (unless hotfix/refactoring)
- [ ] **Implement functionality** - minimum code to make tests pass
- [ ] **Verify all tests pass** - run full test suite
- [ ] **Update README.md** - add examples and feature documentation
- [ ] **Run linting and type checking** - `bun run check` and `bun run type-check`