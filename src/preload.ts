import { ipcRenderer, contextBridge } from 'electron'

// window.addEventListener('DOMContentLoaded', () => {
//     const replaceText = (selector, text) => {
//       const element = document.getElementById(selector)
//       if (element) element.innerText = text
//     }
  
//     for (const type of ['chrome', 'node', 'electron']) {
//       replaceText(`${type}-version`, process.versions[type])
//     }
// })
// console.log("HI");
// const closeButton = document.getElementById('closeButton')

// closeButton.addEventListener('click', () => {
//     ipcRenderer.send("app/close")
// })

const API = {
    window: {
        close: () => ipcRenderer.send("app/close"),

    }
}

contextBridge.exposeInMainWorld("appipc", API)