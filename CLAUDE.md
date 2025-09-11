# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**whatver** is a CLI tool and Node.js module that checks npm package versions against semver ranges. It provides both a command-line interface and a programmatic API to determine which versions of an npm package satisfy a given semver constraint, with colored output to highlight valid versions.

## Architecture

The project follows a simple two-file architecture:

- **lib.js**: Core module that exports the main functionality
  - Uses `npm view` command to fetch package versions from npm registry
  - Leverages the `semver` library to validate versions against ranges
  - Returns array of `{version, satisfied}` objects
  
- **cli.js**: Command-line interface wrapper
  - Handles argument parsing and validation  
  - Uses `chalk` for colored terminal output (green for valid versions)
  - Uses `cli-columns` for formatted multi-column display
  - Contains usage text and error handling

## Development Commands

### Install Dependencies
```bash
npm install
```

### Run the CLI Tool
```bash
node cli.js <package-name> "<semver-range>"
# Example: node cli.js lodash "^4.14"
```

### Install Globally for Development
```bash
npm install -g .
# Then use: whatver lodash "^4.14"
```

### Testing
Currently no test framework is configured. The package.json shows:
```bash
npm test  # Will output "Error: no test specified" and exit 1
```

## Dependencies

- **chalk**: Terminal string styling (colors)
- **cli-columns**: Multi-column terminal output formatting  
- **semver**: Semantic versioning utilities for validation

## Module Usage

The library can be imported and used programmatically:

```javascript
const checkVersions = require("./lib");

checkVersions("lodash", "^4.14").then((versionInfo) => {
  // Returns array of { version: String, satisfied: Boolean }
  console.log(versionInfo);
});
```

## Key Implementation Details

- **npm Integration**: Uses `npm view <package> versions --json` to fetch all available versions
- **Async/Await**: Modern async patterns with promisified child_process.exec
- **Error Handling**: CLI catches and displays error messages appropriately
- **No Build Process**: Pure Node.js without transpilation or bundling