import { ipcRenderer, contextBridge } from 'electron'

const API = {
    window: {
        close: () => ipcRenderer.send("app/close"),
    }
}

contextBridge.exposeInMainWorld("appipc", API)