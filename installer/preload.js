const { contextBridge, ipcRenderer} = require("electron");
contextBridge.exposeInMainWorld(
    "api", {
        selectDir: ()=> ipcRenderer.invoke("open selectDir dialog"),
        install: (path, flag)=> ipcRenderer.send("install", path, flag),
        on: (channel, callback) => ipcRenderer.on(channel, (event, argv)=>callback(event, argv))
})