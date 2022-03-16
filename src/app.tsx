import React, { useState, useEffect, useRef, Fragment } from 'react';
import * as ReactDOM from 'react-dom';
import socket, { peer } from './renderer'
// import socket from './renderer'
// import Peer from 'peerjs'

// let peer: Peer
type user = {name: string, id: string, me: boolean, rtcID: string}
type message = {message: string, author: string, isLiked: boolean, updoots: number, mine: boolean, isClip: boolean}
function App() {

    const [users, setUsers] = useState<user[]>([])
    const [textMessages, setMessages] = useState<message[]>([])
    const [prevMessageLength, setPrevMessageLength] = useState(0)
    const [peers, setPeers] = useState<any>({})
    const messageCont = useRef(null)
    const messageField = useRef(null)
    const nameInput = useRef(null)
    const bottomRef = useRef(null)
    const fileInput = useRef(null)
    const testImg = useRef(null)

    useEffect(() => {
        if (textMessages.length !== prevMessageLength) {
            bottomRef.current.scrollIntoView()
            setPrevMessageLength(textMessages.length)
        }
    }, [textMessages])

    useEffect(() => {
        socket.on('userJoined', (name: string, id: string, me: boolean) => {
            const temp = users
            temp.push({
                name: name,
                id: id,
                me: me,
                rtcID: null
            })
            if (!me) {
                socket.emit('iexist', name, id, peer.id)
            } else {
                document.getElementById('userInfo').setAttribute('data-id', id)
                // setPeer(new Peer(id))
            }
            
            setUsers([...temp])
        })
        socket.on('theyExist', (name: string, id: string, me: boolean, peerid: string) => {
            const temp = users
            temp.push({
                name: name,
                id: id,
                me: me,
                rtcID: peerid
            })
            setUsers([...temp])
        })
        socket.on('userLeft', (id: string) => {
            let temp = users
            const leftuser = temp.find(user => {
                return user.id === id
            })
            closeRTC(leftuser.rtcID)
            temp = temp.filter((user) => {
                return user.id !== id
            })
            setUsers([...temp])
            //render 'user left' text
        })
        socket.on('messageReceived', (message: string, name: string, id: string) => {
            setMessages(prev => {
                // console.log(prev);
                const newMessage: message = {message: message, author: name, mine: false, updoots: 0, isLiked: false, isClip: false}
                return [
                    ...prev,
                    newMessage
                ]
            })
            const tempusers = users
            const index = tempusers.map(user => user.id).indexOf(id)
            tempusers[index].name = name
            setUsers([...tempusers])
        })
        socket.on('updootConfirmReceived', (index: number) => {
            setMessages(prev => {
                const temp = prev
                temp[index].updoots++
                return [...temp]
            })
        })
        socket.on('updootCancelReceived', (index: number) => {
            setMessages(prev => {
                const temp = prev
                temp[index].updoots--
                return [...temp]
            })
        })
        socket.on('clipReceived', (base64: string, name: string, id: string) => {
            console.log('received clip');
            
            setMessages(prev => {
                // console.log(prev);
                const isMine = id === document.getElementById('userInfo').getAttribute('data-id')
                // setMyId((prev: string) => {
                //     isMine = id === prev
                //     return prev
                // })
                // console.log(id, myId, isMine);
                
                const newMessage: message = {message: base64, author: name, mine: isMine, updoots: 0, isLiked: false, isClip: true}
                return [
                    ...prev,
                    newMessage
                ]
            })
            const tempusers = users
            const index = tempusers.map(user => user.id).indexOf(id)
            tempusers[index].name = name
            setUsers([...tempusers])
        })
        
        navigator.mediaDevices.getUserMedia({
            video: false,
            // audio: {deviceId: {exact: 'default'}}
            audio: true
        }).then(stream => {
            // addVideoStream(myVideo, stream)
            // let thing: P
            peer.on('call', (call: any) => {
                console.log("got call");
                
                call.answer(stream)
                const video = document.createElement('video')
                call.on('stream', (userVideoStream: MediaStream) => {
                    addVideoStream(video, userVideoStream)
                    console.log("got stream");
                    
                })
            })
        
            // socket.on('user-connected', (userId: string) => {
            //     connectToNewUser(userId, stream)
            // })
            socket.on('peerReceived', (peerId: string, socketId: string) => {
                if (peerId === peer.id) return
                console.log("got peer" + peerId);
                const call = peer.call(peerId, stream)
                const video = document.createElement('audio')
                call.on('stream', (userVideoStream: MediaStream) => {
                    addVideoStream(video, userVideoStream)
                    console.log("got call stream" + stream);
                    
                })
                call.on('close', () => {
                    console.log("closing video");
                    
                    video.remove()
                })

                setPeers((prev: any) => {
                    prev[peerId] = call
                    console.log("peers: " + prev[peerId]);
                    
                    return prev
                })
            })
        })
        peer.on('open', (id: string) => {
            console.log(`HI ${id}`);
            setUsers(prev => {
                prev.find((user) => {
                    return user.me
                }).rtcID = id
                console.log(prev);
                
                return prev
            })
            socket.emit('peerConnect', id)
        })
    }, [])

    function closeRTC(rtcID: string) {
        if (peers[rtcID]) peers[rtcID].close()
    }

    function addVideoStream(video: HTMLAudioElement, stream: MediaStream) {
        video.srcObject = stream
        video.addEventListener('loadedmetadata', () => {
          video.play()
        })
        document.getElementById('videoGrid').append(video)
      }

    function encodeImageFileAsURL(element: File) {
        const file = element;
        const reader = new FileReader();
        reader.onloadend = function() {
        //   console.log('RESULT: ', reader.result)

            socket.emit('clipSent', reader.result, nameInput.current.value.trim() || 'Anonymous')
        //   console.log('sent clip' + reader.result);
        }
        reader.readAsDataURL(file);
      }

    function sendMessage(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const possibleFile = fileInput.current.files[0]
        if (possibleFile) {
            encodeImageFileAsURL(possibleFile)
            fileInput.current.value = ''
        }
        const messageValue = messageField.current.value.trim()
        if (messageValue === '') {
            return
        }
        const name = nameInput.current.value.trim() || 'Anonymous'
        socket.emit('messageSent', messageValue, name)
        const tempMessages: message[] = textMessages
        const newMessage: message = {
            message: messageValue,
            author: name,
            mine: true,
            updoots: 0,
            isLiked: false,
            isClip: false
        }
        tempMessages.push(newMessage)
        setMessages([...tempMessages])
        const tempusers = users
        const index = tempusers.map(user => user.me).indexOf(true)
        
        tempusers[index].name = name
        setUsers([...tempusers])
        messageField.current.value = ''
        
    }

    function handleUpdoot(index: number) {
        const temp = textMessages
        const message = temp[index]
        if (message.isLiked) {
            message.updoots--
            message.isLiked = false
            setMessages([...temp])
            socket.emit('updootCancelSent', index)
        } else {
            message.updoots++
            message.isLiked = true
            setMessages([...temp])
            socket.emit('updootConfirmSent', index)
        }
    }
    
    // Array.from(document.getElementsByClassName('clips')).forEach((element: HTMLVideoElement) => {
    //     element.addEventListener('click', () => {
    //         if (element.paused) {
    //             element.play()
    //         } else {
    //             element.pause()
    //         }
    //     })
    // })

    return (
        <div id="mainroot">
        <nav>
            <div className="left-nav">
                <span id="menuButton" className="nav-link">&#x2630;</span>
            </div>
            <h1>Chat Test</h1>
            <div className="right-nav">
                <span id="closeButton" className="nav-link">&#10006;</span>
            </div>
        </nav>
        <div id="userInfo" data-name="Anonymous"></div>
        <h1>CHATAPP</h1>
        <div id="messageContainer" ref={messageCont}>
            {<>
            {textMessages.map((msg, i) => {
                if (msg.isClip) {
                    return <video key={i} className={msg.mine ? 'myClip clips' : 'clips'} style={{width: 400, height: 300}} src={msg.message}></video>
                }
                return (<Fragment key={i}><p className={msg.mine ? 'myMessages' : ''}>{`${msg.author}: ${msg.message}`}</p>
                <div className={msg.mine ? 'myUpdootDiv' : 'updootDiv'}>
                <p className={msg.isLiked ? 'likedMsg' : ''}>{msg.updoots}</p>
                <img onClick={() => {handleUpdoot(i)}} className="updoot" src='static://static/updoot.png' /></div>
                <br/></Fragment>)
            })}
            </>}
            <div ref={bottomRef}></div>
        </div>
        <div id="nameCont">
            <input ref={nameInput} placeholder="Enter display name" type="text" id="nameInput"></input>
        </div>
        <div id="inputContainer">
            <form id="messageFieldForm" onSubmit={(e) => {sendMessage(e)}}>
                <input autoFocus ref={messageField} placeholder="Enter a message" type="textarea" id="messageField" />
                <input ref={fileInput} accept="video/mp4" type='file' ></input>
            </form>
        </div>
        <div id="currentUsers">
            {<>
            {users.map((user, i) => {
                return <p key={i} data-id={user.id} data-me={user.me}>{user.name}</p>
            })}
            </>}
        </div>
        <button onClick={() => {console.log("hi");
        }}>HI.</button>
        <img ref={testImg}></img>
        <div id="videoGrid" style={{position: 'absolute', width: 500, height: 500}}></div>
        </div>
    )
}

function render() {
  ReactDOM.render(<App />, document.getElementById('root'));
}
render();