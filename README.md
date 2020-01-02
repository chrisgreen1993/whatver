# whatver

https://semver.npmjs.com/ for your terminal

## Install

```bash
npm install -g whatver
```

## Usage

```bash
whatver lodash "^4.14"
```
![screenshot](screenshot.png)

### As a module

```js
const checkVersions = require("whatver")

checkVersions("lodash", "^4.14").then((versionInfo) => {
  // Returns Promise witharray of { version: String, satisfied: Boolean } pairs for all versions
  // E.g [{ version: "4.15.0", satisfied: true }]
  console.log(versionInfo)
})
```

