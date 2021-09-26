/* preload.js, case 3 (final)*/
const { contextBridge, ipcRenderer, BrowserWindow} = require("electron");
contextBridge.exposeInMainWorld(
    "api", {
        send: (data) => {
            ipcRenderer.send("asynchronous-message", data);
        },
        create_local_shk: async()=>
            await ipcRenderer.invoke('create_local_shk',""),
        on: (channel, callback) => ipcRenderer.on(channel, (event, argv)=>callback(event, argv)),
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

    },

);
contextBridge.exposeInMainWorld(
    "requires",{
        dirname:__dirname,
        fs: require('fs'),
        exe: require("child_process"),
        sudo_exe:require("sudo-prompt"),
        Renderer:ipcRenderer,
        path:require("path"),
        shortcut_path:require('windows-shortcuts-ps')
    }
);