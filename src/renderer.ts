/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import './app';
import { io, Socket } from 'socket.io-client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// declare const io: any;

// socket usually connects with multiple options per
// different browsers but this is fine as we are always in chromium

const socket: Socket = io("https://rb-chat.herokuapp.com/", { 
    transports: ["websocket"]
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Peer: any;
const peer = new Peer()

export {peer}

export default socket
 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const appipc: any;

const closeButton = document.getElementById('closeButton')

document.addEventListener('keydown', (e) => { //disable refresh
    if (e.ctrlKey) {
        if (e.key == 'r' || e.key == 'R') {
            e.preventDefault()
            e.stopPropagation()
        }
    }
})

// let peer = appipc.window.peer()
// console.log(thing);
// ipcMain.on('sendingPeer', (e: any, args: any) => {
//     console.log(args);
    
// })

// appipc.window.getGot()
// appipc.window.getSocket()
closeButton.addEventListener('click', () => {
    appipc.window.close()
})

// console.log('👋 This message is being logged by "renderer.js", included via webpack');
