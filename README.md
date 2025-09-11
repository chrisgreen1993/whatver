# whatver

https://semver.npmjs.com/ for your terminal

## Usage

```bash
npx whatver lodash "^4.14"
```
![screenshot](screenshot.png)

### As a module

```typescript
import checkVersions from "whatver";

const versionInfo = await checkVersions("lodash", "^4.14");
// Returns array of { version: string, satisfied: boolean } pairs for all versions
// E.g [{ version: "4.15.0", satisfied: true }]
console.log(versionInfo);
```
