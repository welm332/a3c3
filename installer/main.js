const electron = require('electron');
const ipcMain = electron.ipcMain;
const isMac = (process.platform === 'darwin');
const BrowserWindow = electron.BrowserWindow;
const Dialog = electron.dialog;
let mainWindow = null;
const app = electron.app;
const path = require('path');
const url = require('url');
function createWindow(template=null,width=800,height=600) {
  
  // in the main process:
  // メインウィンドウを作成します
  win = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: { 
      nodeIntegration: false, //ここはfalseのまま
      contextIsolation: true,  //trueのまま(case2と違う)
      preload: __dirname + '/preload.js' //preloadするjs指定
  },
  defaultFontSize:30
});
return win;
}
function onload(){
    mainWindow = createWindow(null);
      mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
      }));
        // メインウィンドウが閉じられたときの処理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  mainWindow.on('ready-to-show', ()=>console.log("reesd"));
  mainWindow.webContents.openDevTools();
}
  ipcMain.handle("open selectDir dialog",async () =>{
        const i =Dialog.showOpenDialogSync( mainWindow, {
            properties: ['openDirectory'],
            title: 'フォルダ(単独選択)',
            defaultPath: '.'
        });   
        return i[0];
  })
  
  ipcMain.on("install",(e,path,checked)=>{
      console.log(path,checked)
      const exec = require("child_process").exec;
      const fs = require("fs");
      const filename = `${__dirname}/../package.json`;
    //   console.log(filename)
      const json = JSON.parse(fs.readFileSync(filename));
      json["build"]["directories"]= {};
      json["build"]["directories"]["output"]  = path;
      fs.writeFileSync(filename, JSON.stringify(json, null, "\t"))
      const path_writer = require("../scripts/path_writer")
      
    // //   return
      exec(`yarn run pack `,(a,b,c)=>{
          console.log(a);
          console.log(b);
          console.log(c);
            BrowserWindow.getFocusedWindow().webContents.send('install Done');
          
      });
      if(checked){
         path_writer.add_env("path", `${path}\\win-unpacked`);
      }
      
  }
      )



//  初期化が完了した時の処理
app.on('ready', onload);


// 全てのウィンドウが閉じたときの処理
app.on('window-all-closed', () => {
  // macOSのとき以外はアプリを終了させます
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
// アプリケーションがアクティブになった時の処理(Macだと、Dockがクリックされた時）
app.on('activate', () => {
  /// メインウィンドウが消えている場合は再度メインウィンドウを作成する
  if (mainWindow === null) {
    createWindow();
  }
});