require('./menu');
import Updater from './update';
import getRenderUrl from './mainUrl';
import deviceid from './utils/deviceid.js';
import handleQuit from './event/quit';
import handleMessage from './event/message';
import onCrashed from './protect/crashed';
import createTray from './protect/tray';
import autoStart from './protect/autoStart';
// import {updateHandle, sendUpdateMessage} from './autoUpdate/update'
import { autoUpdater } from "electron-updater"
const { app, BrowserWindow, ipcMain} = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
  });
  mainWindow.loadURL(getRenderUrl());
  if (process.platform === 'win32') {
    mainWindow.on('close', (event) => {
      mainWindow.hide();
      mainWindow.setSkipTaskbar(true);
      event.preventDefault();
    });
  }
  global.mainId = mainWindow.id;

  // 尝试更新
  // updateHandle(mainWindow);
}

if (process.platform === 'win32') {
  const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
  if (shouldQuit) {
    app.quit()
  };
}

const devicePromise = deviceid.get();
app.on('ready', () => {
  devicePromise
    .then(() => Updater.init())
    .then(() => createWindow())
    .then(() => handleMessage())
    .then(() => onCrashed())
    .then(() => handleQuit())
    .then(() => createTray())
    .then(() => { if (process.platform === 'win32') { autoStart() } })
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
});


// 主进程监听渲染进程传来的信息
ipcMain.on('update', (e, arg) => {
  console.log("update");
  checkForUpdates();
});
let feedUrl = 'http://127.0.0.1:8080/';
let checkForUpdates = () => {
  // 配置安装包远端服务器
  autoUpdater.setFeedURL(feedUrl);

  // 下面是自动更新的整个生命周期所发生的事件
  autoUpdater.on('error', function(message, a, b) {
    console.log(message, a, b);
      sendUpdateMessage('error', message);
  });
  autoUpdater.on('checking-for-update', function(message) {
      sendUpdateMessage('checking-for-update', message);
  });
  autoUpdater.on('update-available', function(message) {
      sendUpdateMessage('update-available', message);
  });
  autoUpdater.on('update-not-available', function(message) {
      sendUpdateMessage('update-not-available', message);
  });

  // 更新下载进度事件
  autoUpdater.on('download-progress', function(progressObj) {
      sendUpdateMessage('downloadProgress', progressObj);
  });
  // 更新下载完成事件
  autoUpdater.on('update-downloaded', function(event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
      sendUpdateMessage('isUpdateNow');
      ipcMain.on('updateNow', (e, arg) => {
          autoUpdater.quitAndInstall();
      });
  });

  //执行自动更新检查
  autoUpdater.checkForUpdates();
};

// 主进程主动发送消息给渲染进程函数
function sendUpdateMessage(message, data) {
  console.log({ message, data });
  mainWindow.webContents.send('message', { message, data });
}