# Electron Vue Template

A simple starter template for a **Vue3** + **Electron** TypeScript based application, including **ViteJS** and **Electron Builder**.
with `SerialPort` to communicate with system serial port, `Express.js` to provide `WebCrawler` API as local server and bring silent print ability to web-eco, `Vuetify 3 Beta` as default UI framework.
 

### Install dependencies ⏬

```bash
npm install
```

### Start developing ⚒️

```bash
npm run serve
```

## Additional Commands

```bash
docker build -t tiger93064/bill-crawler-higher:latest .    # build docker image to local
docker push tiger93064/bill-crawler-higher:latest          # push docker image to hub

```

  

## Using static files

If you have any files that you want to copy over to the app directory after installation, you will need to add those files in your `src/main/static` directory.

#### Referencing static files from your main process

```js
/* Assumes src/main/static/yourFile.txt exists */

const { app } = require('electron');
const FileSystem = require('fs');
const Path = require('path');

const path = Path.join(app.getAppPath(), 'static', 'yourFile.txt');
const contents = FileSystem.readFileSync(path);
```


## Credit

forked from [Deluze/electron-vue-template](https://github.com/Deluze/electron-vue-template
)