// アプリケーション作成用のモジュールを読み込み
const electron = require('electron');
const {dialog}  = require("electron");
const parseArgs = require('electron-args');
// console.log(ext-language_tools)
var watcher = null;
const cli = parseArgs(`
    sample-app

    open github or qiita

    Usage
      $ sample-app [file path]

    Options
      --help       show help
      --version    show version
      --userCustom,-c [custom_filename]      customfile open
      --debug,-D        debugMode

    Custom_filename
      Partial Match

    "import":window.requires.dirname+"/user_custom/py.json",
    "type":window.requires.dirname+'/user_custom/py_type.json',
    "shortcut":window.requires.dirname+'/user_custom/shortcut.jsonc',
    "settings":window.requires.dirname+"/user_custom/settings.json"



    Examples
      $ sample-app test.py
      $ sample-app -c import   === $ sample-app -c imp
`, {
    alias: {
        h: 'help',
        c: 'userCustom',
        D: "debug",
    },
    default: {
        user_custom: false,
    }
});
const args = cli.input;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const path = require('path');
const url = require('url');
const fs = require('fs');
const localShortcut = require("electron-localshortcut");
// console.log(fs.statSync(".").isDirectory())
// const dialog = electron.dialog;
let currentPath = "";


// メインウィンドウ
let mainWindow;
const isMac = (process.platform === 'darwin');
function createWindow(template=null,width=800,height=600) {
  // 'darwin' === macOS
  //------------------------------------
  // メニュー
  //------------------------------------
  // メニューを準備する

  
  // メニューを適用する
  Menu.setApplicationMenu(template);
  
  // in the main process:
  // メインウィンドウを作成します
  win = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: { 
      nodeIntegration: false, //ここはfalseのまま
      contextIsolation: true,  //trueのまま(case2と違う)
      preload: __dirname + '/preload.js', //preloadするjs指定,
      webviewTag: true
  },
  defaultFontSize:30
});
return win;
}
function onload(){
  const template = Menu.buildFromTemplate([
    ...(isMac ? [{
        label: app.name,
        submenu: [
          {role:'about',      label:`${app.name}について` },
          {type:'separator'},
          {role:'services',   label:'サービス'},
          {type:'separator'},
          {role:'hide',       label:`${app.name}を隠す`},
          {role:'hideothers', label:'ほかを隠す'},
          {role:'unhide',     label:'すべて表示'},
          {type:'separator'},
          {role:'quit',       label:`${app.name}を終了`}
        ]
      }] : []),
    {
      label: 'ファイル',
      submenu: [
        isMac ? {role:'close', label:'ウィンドウを閉じる'} : {role:'quit', label:'終了'},
        {        
          label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')}
        },
        {
          label: 'ファイルを開く',
          click: async() =>{
            BrowserWindow.getFocusedWindow().webContents.send('open_new_file');
          }
          
        }
      ]
    },
    {
      label: '編集',
      submenu: [
        {role:'undo',  label:'元に戻す'},
        {role:'redo',  label:'やり直す'},
        {type:'separator'},
        {role:'cut',   label:'切り取り'},
        {role:'copy',  label:'コピー'},
        {role:'paste', label:'貼り付け'},
        ...(isMac ? [
            {role:'pasteAndMatchStyle', label:'ペーストしてスタイルを合わせる'},
            {role:'delete',    label:'削除'},
            {role:'selectAll', label:'すべてを選択'},
            {type:'separator' },
            {
              label: 'スピーチ',
              submenu: [
                {role:'startSpeaking', label:'読み上げを開始'},
                {role:'stopSpeaking',  label:'読み上げを停止'}
              ]
            }
          ] : [
            {role:'delete',    label:'削除'},
            {type:'separator'},
            {role:'selectAll', label:'すべてを選択'}
          ])
       ]
    },
    {
      label: '表示',
      submenu: [
        {role:'reload',         label:'再読み込み'},
        {role:'forceReload',    label:'強制的に再読み込み'},
        {role:'toggleDevTools', label:'開発者ツールを表示'},
        {type:'separator'},
        {role:'resetZoom',      label:'実際のサイズ'},
        {role:'zoomIn',         label:'拡大'},
        {role:'zoomOut',        label:'縮小'},
        {type:'separator'},
        {role:'togglefullscreen', label:'フルスクリーン'}
      ]
    },
    {
      label: 'ウィンドウ',
      submenu: [
        {role:'minimize', label:'最小化'},
        {role:'zoom',     label:'ズーム'},
        ...(isMac ? [
             {type:'separator'} ,
             {role:'front',  label:'ウィンドウを手前に表示'},
             {type:'separator'},
             {role:'window', label:'ウィンドウ'}
           ] : [
             {role:'close',  label:'閉じる'}
           ])
      ]
    },
    {
      label:'ヘルプ',
      submenu: [
        {label:`${app.name} ヘルプ`},    // ToDo
        ...(isMac ? [ ] : [
          {type:'separator'} ,
          {role:'about',  label:`${app.name}について` }
        ])
      ]
    }
  ]);


  mainWindow = createWindow(template);
  const { ipcMain, globalShortcut } = require('electron');
  const log = require('electron-log');

    localShortcut.register(mainWindow, "F12",()=>{
        if(mainWindow.isDevToolsOpened() === true){
            mainWindow.closeDevTools();
        }else{
            mainWindow.webContents.openDevTools();
        }
    });

  ipcMain.handle("get_args",async () =>{
    return {
      UserCustom:cli.flags["c"], 
      Debugflag:cli.flags["D"],
      Others:args
    };
  });
  
  
    ipcMain.handle("ShowMessageBox", async (event, type="info", title="demo", message="demoです", detail="demo", buttons=["ok", "cancel"]) =>{
        const options = {
            type:type,
            title:title,
            message:message,
            detail:detail,
            buttons: buttons,
            cancelId: -1  // Esc で閉じられたときの戻り値
        };
        return dialog.showMessageBoxSync(options);
    });
  
  async function isDirs(event, args){
    dirFlagList = [];
    for(const pathName of args){
        dirFlagList.push(fs.statSync(pathName).isDirectory());
    }
    return dirFlagList;
}
  
  ipcMain.handle("isDirs", isDirs);
  ipcMain.handle("savefile",(event, data,path) => {
    currentPath = path;
    const result = saveFile(data);
    return result;
  });
  ipcMain.on("openLoadFile",() => {
    dialog.showOpenDialog(
      mainWindow,
      // どんなダイアログを出すかを指定するプロパティ
      {
        properties: ['openFile'],
        // filters: [
        //   {
        //     name: 'Desktop',
        //     extensions: ['txt', 'text', 'html', 'js',"py"]
        //   }
        // ]
      }).then(result => {
        result.canceled || mainWindow.webContents.send('read_file', result.filePaths[0]);
      })
  });
  
    ipcMain.on("create_input_window",() => {
        
        const window = createWindow(template,250,150);
        window.loadURL(url.format({
            pathname: path.join(__dirname, 'input_dialog.html'),
            protocol: 'file:',
            slashes: true
        }));
        ipcMain.on("input_window_send",(e,command)=>{
            window.hide();
             mainWindow.webContents.send("set_remote_command", command);
            
        })

        
  });

/**
 * 新規ファイルを保存します。
 */
 function saveNewFile(data) {
  const win = mainWindow
  let result = dialog.showSaveDialogSync(
    mainWindow,
    // どんなダイアログを出すかを指定するプロパティ
    {
      properties: ['openFile'],
      filters: [
        {
          name: 'Documents',
          extensions: ['py']
        }
      ]
    },
  )
  if(result !== undefined){
        currentPath = result;
        writeFile(currentPath, data);
  }
}
/**
 * ファイルを書き込みます。
 */
 function writeFile(path, data) {
  path.substring(path.length-3) === ".py" && pyright_check(path);
  fs.writeFile(path, data, (error) => {
    if (error != null) {
      alert('error : ' + error);
    }
  });
}


/**
 * ファイルを保存します。
 */
 function saveFile(data) {

  //　初期の入力エリアに設定されたテキストを保存しようとしたときは新規ファイルを作成する
  if (currentPath.indexOf("unnamed") !== -1) {
    saveNewFile(data);
    return currentPath;
  }

  const win = mainWindow;

  writeFile(currentPath, data);
  return currentPath;
  }
function pyright_check(currentPath){
  return true;
  require("child_process").exec(`npx pyright ${currentPath}`, { encoding: 'Shift_JIS' },(errs,stdout,stderr)=>{
    

    const Encoding = require('encoding-japanese');

    stdout =Encoding.convert(stdout, { from: 'SJIS', to: 'UNICODE', type: 'string' });
    stdout = stdout.substring(stdout.match("[1-9]+:[1-9]+").index).split("-");
    const out = stdout;
    
    });
}


  ipcMain.handle('create_local_shk', (event, key) => { 
    localShortcut.register(mainWindow, key,()=>{
        mainWindow.webContents.send(key);
        // event.preventDefault();
    });
  });
  
  
    ipcMain.handle('delete_local_shk', (event, key) => { 
        localShortcut.unregister(mainWindow, key);
    });
    sessions = {};
  
    ipcMain.handle('create_process_shell', (event, process, pname) => { 
        console.log(process)
        const spawnTest = (() => {
            const dir = require("child_process").spawn(process);       // <== shell: true option
            dir.stdout.on('data', (data) => {
                mainWindow.webContents.send(`child_process_session::${pname}`,{"name":pname,"type":"out","data":data});
              console.log(`spawn stdout: ${data}`);
            });
          
            dir.stderr.on('data', (data) => {
                mainWindow.webContents.send(`child_process_session::${pname}`,{"name":pname,"type":"stderr","data":data});
            });
          
            dir.on('error', (code) => {
                mainWindow.webContents.send(`child_process_session::${pname}`,{"name":pname,"type":"error","data":code});
            });
          
            dir.on('close', (code) => {
                mainWindow.webContents.send(`child_process_session::${pname}`,{"name":pname,"type":"close","data":code});
            });
          
            dir.on('exit', (code) => {
                mainWindow.webContents.send(`child_process_session::${pname}`,{"name":pname,"type":"exit","data":code});
            });
            // dir.stdin.cork();
            // dir.stdin.start();
            if(sessions[pname] === undefined){
                
                ipcMain.handle(`child_process_session_stdin::${pname}`, (event ,msg ) => {
                    console.log(msg)
                    sessions[pname].stdin.write(msg);
                  })    
            }
            sessions[pname] = dir;
            
        })();})
  

// function logPosition(event) {			console.log("screenX: " + event.screenX);			console.log("screenY: " + event.screenY);		}
// electron.app.on('mousemove', logPosition);

  localShortcut.register(mainWindow, 'Ctrl+Q', function() {
    app.quit();
  });
  // メインウィンドウに表示するURLを指定します
  // （今回はmain.jsと同じディレクトリのindex.html）
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
     
    //require
   var chokidar = require("chokidar");
    ipcMain.on("chokidar_path_add", (event, path) => {
        if(watcher === null){
        watcher = chokidar.watch(path,{
            ignored:/[\/\\]\./,
            persistent:true
        });

       //イベント定義
   watcher.on('ready',function(){
       

       
    watcher.on('change',function(path){
        mainWindow.webContents.send("file_change", path);
       //  file_changed(path);
        });
    watcher.on('unlink',function(path){
        mainWindow.webContents.send("file_delete", path);
       //  file_deleted(path);
        });
    });

    }else{
      watcher.add(path);
    }
    console.log(path);
    
    });
   

   
}

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
