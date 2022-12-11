const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const participantsComponent = document.getElementById('participants') 

const toggleCameraButton = document.getElementById('toggle-camera')
const toggleMicroButton = document.getElementById('toggle-micro')
const shareScreenButton = document.getElementById('share-button')
const svgMicOn = document.getElementById('svg-micOn')
const svgMicOff = document.getElementById('svg-micOff')
const svgCamOn = document.getElementById('svg-CamOn')
const svgCamOff = document.getElementById('svg-CamOff')
const raiseHandButton = document.getElementById('raise-hand')
const raiseHandSound = document.getElementById('raiseHandSound')

let isAdmin = false

let userStream
let userScreenStream
const peers = {}

let calls = [] // to share screen 
let streams = []

let raiseHandQueue = [] // to set user is raising hand to queue

const user = {
  userId,
  fullName,
  email,
  avatar,
}

const myPeer = new Peer(user.userId, {
  host: '0.peerjs.com',
  // host: '/',
  // port: '3001'
})
  
myPeer['fullName'] = user.fullName

var myVideo = createVideo()
myVideo.getElementsByTagName('video')[0].muted = true
myVideo.getElementsByClassName('name')[0].textContent = 'You'

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
}).then(stream => {
  userStream = stream
  userStream['userId'] = myPeer._id
  addVideoStream(myVideo, stream)
  
  myPeer.on('call', call => {
    call.answer(stream)
    const video = createVideo()
    call.on('stream', userVideoStream => {
      // console.log(userVideoStream)
      addVideoStream(video, userVideoStream)
    })
  })
  
  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
  
})

socket.on('set name for participants tab', users => {
  while (participantsComponent.firstChild) {
    participantsComponent.removeChild(participantsComponent.firstChild);
  }
  users.forEach(user => {
    participantsComponent.innerHTML += `<div class="participant">
    <div class="flex items-center pl-3">
       <div class="w-full flex text-sm max-w-xs order-2 items-center justify-between">
          <div><span class="participantName px-4 py-2 rounded-lg inline-block rounded-bl-none">${user[1].fullName}</span></div>
       </div>
       <img src="${user[1].avatar}" alt="My profile" class="w-6 h-6 rounded-full order-1">
    </div>
 </div>`
  })
})


socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

// send streamId and userObject when join room
setTimeout(() => {
  socket.on('hello', () => {
    socket.emit('streamId and userObject', userStream.id, user)
  })
}, 500)

// set id and userName for all video
socket.on('streamId and userObject', (array) => {
  arr1 = array
  setTimeout(() => {
    setUserNameAndIdForVideo(array)
  }, 1000)
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
  toggleCameraButton.setAttribute('userId', id)
})


function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  calls.push(call)
  const video = createVideo()
  call.on('stream', userVideoStream => {
    video.setAttribute('user-id', userId)
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    setTimeout(() => {
      video.remove()
    }, 50);
    
  })
  peers[userId] = call
}

function addVideoStream(video, stream) {
  let vd = video.getElementsByTagName('video')[0]
  vd.srcObject = stream
  vd.addEventListener('loadedmetadata', () => {
    vd.play()
  })
  videoGrid.append(video)
}
      
  // hide cam
toggleCameraButton.addEventListener('click', () => {
  const videoTrack = userStream.getTracks().find(track => track.kind === 'video');
  if (videoTrack.enabled) {
      videoTrack.enabled = false
      toggleCameraButton.classList.remove('bg-[rgb(60,64,67)]')
      toggleCameraButton.classList.add('bg-red-500')
      svgCamOn.classList.add('hidden')
      svgCamOff.classList.remove('hidden')
    } else {
      videoTrack.enabled = true
      toggleCameraButton.classList.remove('bg-red-500')
      toggleCameraButton.classList.add('bg-[rgb(60,64,67)]')
      svgCamOn.classList.remove('hidden')
      svgCamOff.classList.add('hidden')
    }
  });
  
  // set muteButton 
  let isMute = false

  // mute mic
  toggleMicroButton.addEventListener('click', () => {
    socket.emit(ROOM_ID + 'set muteButton', !isMute, userStream.id);

    const videoTrack = userStream.getTracks().find(track => track.kind === 'audio');
    if (videoTrack.enabled) {
      videoTrack.enabled = false;
      toggleMicroButton.classList.remove('bg-[rgb(60,64,67)]')
      toggleMicroButton.classList.add('bg-red-500')
      svgMicOn.classList.add('hidden')
      svgMicOff.classList.remove('hidden')
    } else {
      videoTrack.enabled = true;
      toggleMicroButton.classList.remove('bg-red-500')
      toggleMicroButton.classList.add('bg-[rgb(60,64,67)]')
      svgMicOn.classList.remove('hidden')
      svgMicOff.classList.add('hidden')
    }
  });
  
  socket.on(ROOM_ID + 'set muteButton', (isMuteSV, muteList, userStreamId) => {
    if(userStream.id == userStreamId){
      isMute = isMuteSV
    }
    console.log(muteList)
    setMuteButtonAllVideo(muteList)
  })

  
  // raise hand 
  let isRaiseHand = false
  
  raiseHandButton.addEventListener('click', () => {
    socket.emit(ROOM_ID + 'raise hand', !isRaiseHand, userStream.id);
    const time = new Date().toLocaleTimeString()
    socket.emit(ROOM_ID + 'raise hand queue', !isRaiseHand, user, time);
  });
  
  socket.on(ROOM_ID + 'raise hand', (isRaise, userStreamId, array) => {
    setRaiseHandButtonAllVideo(array)
    if(userStream.id == userStreamId) {
      isRaiseHand = isRaise
    } else if(isRaise == true) {
      raiseHandSound.play()
    }

    if(isRaiseHand){
      raiseHandButton.classList.remove('bg-[rgb(60,64,67)]')
      raiseHandButton.classList.add('bg-blue-500')
    } else
    {
      raiseHandButton.classList.remove('bg-blue-500')
      raiseHandButton.classList.add('bg-[rgb(60,64,67)]')
    }
  })
  
  // share screen button
  shareScreenButton.addEventListener('click', () => {
    navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  }).then(stream => {
    userScreenStream = stream
    const video = createVideo()
    video.getElementsByClassName('name')[0].textContent = 'Host is sharing screen'
    addVideoStream(video, stream)
    
    calls.forEach((call) => {
      call.peerConnection.getSenders().forEach((sender) => {
        console.log(sender)
        if(sender.track.kind === "audio" && stream.getAudioTracks().length > 0){
          sender.replaceTrack(stream.getAudioTracks()[0]);
        }
        if (sender.track.kind === "video" && stream.getVideoTracks().length > 0) {
          sender.replaceTrack(stream.getVideoTracks()[0]);
        }
      });
    })
    
    // when end stream
    stream.getVideoTracks()[0].onended = function () {
      calls.forEach(call => {
        call.peerConnection.getSenders().forEach((sender) => {
          console.log(sender)
          if(sender.track.kind === "audio" && stream.getAudioTracks().length > 0){
            sender.replaceTrack(userStream.getAudioTracks()[0]);
          }
          if (sender.track.kind === "video" && stream.getVideoTracks().length > 0) {
            sender.replaceTrack(userStream.getVideoTracks()[0]);
          }
        });
      })
      video.remove()
      
    };
    
  })
})

function createVideo () {
  const wrap = document.createElement('div')
  wrap.classList.add('videoWrapper', 'flex', 'flex-col', 'items-center', 'flex-[1_1_50%]', 'p-1', 'max-w-[50%]')
  wrap.innerHTML+= `<div class="container">
  <div class="w-full bg-gray-900 shadow-lg rounded-xl">
  <div class="flex flex-col">
  <div class="relative">
  <div class="relative h-62 w-full mb-3">
  <button class="muteButton hidden absolute top-2 right-2 bg-[rgba(0,0,0,0.3)] transition ease-in duration-300 hover:text-purple-500 shadow hover:shadow-md text-gray-500 rounded-full w-8 h-8 text-center p-1"><svg class="m-auto w-[80%]" style="fill: white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L472.1 344.7c15.2-26 23.9-56.3 23.9-88.7V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 21.2-5.1 41.1-14.2 58.7L416 300.8V96c0-53-43-96-96-96s-96 43-96 96v54.3L38.8 5.1zM344 430.4c20.4-2.8 39.7-9.1 57.3-18.2l-43.1-33.9C346.1 382 333.3 384 320 384c-70.7 0-128-57.3-128-128v-8.7L144.7 210c-.5 1.9-.7 3.9-.7 6v40c0 89.1 66.2 162.7 152 174.4V464H248c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H344V430.4z"/></svg></button>
  <button class="raishandButton hidden absolute top-2 left-2 bg-white transition ease-in duration-300 hover:text-purple-500 shadow hover:shadow-md text-gray-500 rounded-full w-8 h-8 text-center p-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M408 80c-3.994 0-7.91 .3262-11.73 .9551c-9.586-28.51-36.57-49.11-68.27-49.11c-6.457 0-12.72 .8555-18.68 2.457C296.6 13.73 273.9 0 248 0C222.1 0 199.3 13.79 186.6 34.44C180.7 32.85 174.5 32 168.1 32C128.4 32 96.01 64.3 96.01 104v121.6C90.77 224.6 85.41 224 80.01 224c-.0026 0 .0026 0 0 0C36.43 224 0 259.2 0 304.1c0 20.29 7.558 39.52 21.46 54.45l81.25 87.24C141.9 487.9 197.4 512 254.9 512h33.08C393.9 512 480 425.9 480 320V152C480 112.3 447.7 80 408 80zM432 320c0 79.41-64.59 144-143.1 144H254.9c-44.41 0-86.83-18.46-117.1-50.96l-79.76-85.63c-6.202-6.659-9.406-15.4-9.406-23.1c0-22.16 18.53-31.4 31.35-31.4c8.56 0 17.1 3.416 23.42 10.18l26.72 28.69C131.8 312.7 133.9 313.4 135.9 313.4c4.106 0 8.064-3.172 8.064-8.016V104c0-13.25 10.75-24 23.1-24c13.25 0 23.1 10.75 23.1 24v152C192 264.8 199.2 272 208 272s15.1-7.163 15.1-15.1L224 72c0-13.25 10.75-24 23.1-24c13.25 0 23.1 10.75 23.1 24v184C272 264.8 279.2 272 288 272s15.99-7.164 15.99-15.1l.0077-152.2c0-13.25 10.75-24 23.1-24c13.25 0 23.1 10.75 23.1 24v152.2C352 264.8 359.2 272 368 272s15.1-7.163 15.1-15.1V152c0-13.25 10.75-24 23.1-24c13.25 0 23.1 10.75 23.1 24V320z"/></svg></button>
  <!-- <img src="https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png" alt="Just a flower" class="rounded-full object-fill w-[200px] h-[200px] m-auto"> -->
  <video></video>
  </div>
  <!-- name -->
  <div class="absolute left-2 bottom-2 align-items-center flex w-full">
  <div class="overflow-hidden">
  <div class="userName text-white text-[18px] name">Participant</div>
  </div>
  </div>
  </div>
  </div>
  </div>
  </div>`
  return wrap
}

socket.on(ROOM_ID + 'raise hand queue', raisehandArray => {
  raiseHandQueue = []
  setRaiseHandQueue(raisehandArray)
})

function setRaiseHandQueue(raisehandArray) {
  for(let i = 0; i < raisehandArray.length; i++) {
    if(raisehandArray[i][1].isRaiseHand == true) {
        // console.log(raisehandArray[i][1])
        raiseHandQueue.push(raisehandArray[i][1])
    }
  }
  raiseHandQueue.sort((a, b) => a.time.localeCompare(b.time))
  
  // remove all child node
  while (queues.firstChild) {
    queues.removeChild(queues.firstChild);
  }
  
  raiseHandQueue.forEach(user => {
    queues.innerHTML += `<div class="chat-message">
    <div class="flex items-center pl-3">
       <div class="w-full flex text-sm max-w-xs order-2 items-center justify-between">
          <div><span class="px-4 py-2 rounded-lg inline-block rounded-bl-none">${user.fullName}</span></div>
          <button class="bg-white transition ease-in duration-300 hover:text-purple-500 shadow hover:shadow-md text-gray-500 rounded-full w-8 h-8 text-center p-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M408 80c-3.994 0-7.91 .3262-11.73 .9551c-9.586-28.51-36.57-49.11-68.27-49.11c-6.457 0-12.72 .8555-18.68 2.457C296.6 13.73 273.9 0 248 0C222.1 0 199.3 13.79 186.6 34.44C180.7 32.85 174.5 32 168.1 32C128.4 32 96.01 64.3 96.01 104v121.6C90.77 224.6 85.41 224 80.01 224c-.0026 0 .0026 0 0 0C36.43 224 0 259.2 0 304.1c0 20.29 7.558 39.52 21.46 54.45l81.25 87.24C141.9 487.9 197.4 512 254.9 512h33.08C393.9 512 480 425.9 480 320V152C480 112.3 447.7 80 408 80zM432 320c0 79.41-64.59 144-143.1 144H254.9c-44.41 0-86.83-18.46-117.1-50.96l-79.76-85.63c-6.202-6.659-9.406-15.4-9.406-23.1c0-22.16 18.53-31.4 31.35-31.4c8.56 0 17.1 3.416 23.42 10.18l26.72 28.69C131.8 312.7 133.9 313.4 135.9 313.4c4.106 0 8.064-3.172 8.064-8.016V104c0-13.25 10.75-24 23.1-24c13.25 0 23.1 10.75 23.1 24v152C192 264.8 199.2 272 208 272s15.1-7.163 15.1-15.1L224 72c0-13.25 10.75-24 23.1-24c13.25 0 23.1 10.75 23.1 24v184C272 264.8 279.2 272 288 272s15.99-7.164 15.99-15.1l.0077-152.2c0-13.25 10.75-24 23.1-24c13.25 0 23.1 10.75 23.1 24v152.2C352 264.8 359.2 272 368 272s15.1-7.163 15.1-15.1V152c0-13.25 10.75-24 23.1-24c13.25 0 23.1 10.75 23.1 24V320z"/></svg></button>
       </div>
       <img src="${user.avatar}" alt="My profile" class="w-6 h-6 rounded-full order-1">
    </div>
 </div>`
  })
  // console.log(raiseHandQueue)

}

function setRaiseHandButtonAllVideo (array) {
  const allVideo = document.querySelectorAll('video')
  for(let i = 0; i < allVideo.length; i++) {
    for(let j = 0; j < array.length; j++) {
      if(allVideo[i].srcObject.id == array[j][0]){
        let parent = allVideo[i].parentNode
        
        let raishandButton = parent.parentNode.getElementsByClassName('raishandButton')[0]
        if(array[j][1]){
          // if true => show button
          raishandButton.classList.remove('hidden')
        } else{
          raishandButton.classList.add('hidden')
        }
      }
    }
  }
}

function setMuteButtonAllVideo (muteList) {
  const allVideo = document.querySelectorAll('video')
  for(let i = 0; i < allVideo.length; i++) {
    for(let j = 0; j < muteList.length; j++) {
      if(allVideo[i].srcObject.id == muteList[j][0]){
        let parent = allVideo[i].parentNode
        
        let muteButton = parent.parentNode.getElementsByClassName('muteButton')[0]
        if(muteList[j][1]){
          // if true => show button
          muteButton.classList.remove('hidden')
        } else{
          muteButton.classList.add('hidden')
        }
      }
    }
  }
}

function setUserNameAndIdForVideo(array) {
  const allVideo = document.querySelectorAll('video')
  for(let i = 0; i < allVideo.length; i++) {
    for(let j = 0; j < array.length; j++) {
      if(allVideo[i].srcObject.id == array[j][0] && allVideo[i].srcObject.id !== userStream.id){
        let parent = allVideo[i].parentNode
        parent.parentNode.getElementsByClassName('userName')[0].innerText = array[j][1].fullName
        // console.log('ok')
      }
    }
  }
}
