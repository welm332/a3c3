/* preload.js, case 3 (final)*/
const { contextBridge, ipcRenderer, BrowserWindow, clipboard, dialog} = require("electron");
contextBridge.exposeInMainWorld(
    "api", {
        send: (data) => {
            ipcRenderer.send("asynchronous-message", data);
        },
        create_local_shk: async(key)=>
            await ipcRenderer.invoke('create_local_shk', key),
        delete_local_shk: async(key)=>
            await ipcRenderer.invoke('delete_local_shk', key),
        on: (channel, callback) => ipcRenderer.on(channel, (event, argv)=>callback(event, argv)),
        off: (channel, callback) => ipcRenderer.removeAllListeners(channel, (event, argv)=>callback(event, argv)),
        saveFile: async(data,path) =>{
            let i = await ipcRenderer.invoke("savefile", data,path);
            console.log(i)
            return i
        },
        get_args: async()=>
            await ipcRenderer.invoke("get_args"),
        openLoadFile: async()=>
            await ipcRenderer.send("openLoadFile"),
        create_input_window: async()=>
            await ipcRenderer.send("create_input_window"),
        search:async(url)=>{
                const { shell } = require('electron');
                await shell.openExternal(url);
    },
        send_remote_command:async(command)=>{
            await ipcRenderer.send("input_window_send",command);
    },
        chokidar_path_add: (path) => {
            ipcRenderer.send("chokidar_path_add", path)
        },
        isDirs: async (args) => await ipcRenderer.invoke("isDirs", args),
        
        show_message_box: async (type="info", title="demo", message="demoです", detail="demo", buttons=["ok", "cancel"])=> await ipcRenderer.invoke("ShowMessageBox" , type, title, message, detail, buttons),
        create_process_shell: async(process,name)=>
            await ipcRenderer.invoke('create_process_shell',process, name),
        child_process_session_stdin: async(msg,pname)=>
            await ipcRenderer.invoke(`child_process_session_stdin::${pname}`, msg),
        env: async(name)=>process.env[name]
            
    },

);
contextBridge.exposeInMainWorld(
    "requires",{
        electron_cmds:clipboard,
        cs:contextBridge,
        dirname:__dirname,
        fs: require('fs'),
        exe: require("child_process"),
        sudo_exe:require("sudo-prompt"),
        Renderer:ipcRenderer,
        path:require("path"),
        shortcut_path:require('windows-shortcuts-ps'),
        Encoding: require('encoding-japanese'),
        iconv:require("iconv-lite"),
    
        // lang:require("../node_modules/ace-builds/src/ext-language_tools.js")
        // util:require("C:/Users/taiki/Desktop/program/portfolio/150819_electron_text_editor/node_modules/ace-builds/demo/kitchen-sink/autocomplete/util")
    }
);