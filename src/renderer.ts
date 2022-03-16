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
// import Peer from 'peerjs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const io: any;

// socket usually connects with multiple options per
// different browsers but this is fine as we are always in chromium

const socket = io("https://rb-chat.herokuapp.com/", { 
    transports: ["websocket"]
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Peer: any;
// const peer = new Peer()
// const peer = appipc.window.peer()
// const peer = new Peer({host:'rb-chat.herokuapp.com', secure:true, port:'443', path: '/myapp'})
const peer = new Peer()
export default socket
export {peer}
 
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

closeButton.addEventListener('click', () => {
    appipc.window.close()
})

// console.log('👋 This message is being logged by "renderer.js", included via webpack');
