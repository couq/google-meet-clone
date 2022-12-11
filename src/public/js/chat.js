var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
const textingSound = document.getElementById('textingSound')

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit(ROOM_ID, input.value, user);
    input.value = '';
  }
});

socket.on(ROOM_ID, function(msg, sender) {
   // lastUserSentMessage = userId
  if(myPeer.id == sender.userId) {
  messages.innerHTML += `<div class="chat-message">
  <div class="flex items-end justify-end">
     <div class="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end">
      <div>
         <span class="px-3 rounded-lg inline-block rounded-br-none" style="color: #65676B">You</span>
      </div>
      <div>
         <span class="px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 text-white">${msg}</span>
      </div>
     </div>
     <img src="${sender.avatar}" alt="My profile" class="w-6 h-6 rounded-full order-2">
  </div>
</div>`}
    else {
      textingSound.play()
      messages.innerHTML += 
      `<div class="chat-message">
          <div class="flex items-end">
             <div class="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start">
               <div>
                  <span class="px-3 rounded-lg inline-block rounded-br-none" style="color: #65676B">${sender.fullName}</span>
               </div>
                <div><span class="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-300 text-gray-600">${msg}</span></div>
             </div>
             <img src="${sender.avatar}" alt="My profile" class="w-6 h-6 rounded-full order-1">
          </div>
       </div>
       `
    }
  window.scrollTo(0, document.body.scrollHeight);
});

document.getElementById('imgInput').addEventListener('change', function() {
   const imageURL = URL.createObjectURL(this.files[0])
   socket.emit(ROOM_ID + 'image', imageURL, user);
   }, false);
   
   // Client side
   socket.on(ROOM_ID + 'image', (image, sender) => {
       if(myPeer.id == sender.userId) {
       messages.innerHTML +=
       `<div class="chat-message">
       <div class="flex items-end justify-end">
          <div class="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end">
            <div>
               <span class="px-3 rounded-lg inline-block rounded-br-none" style="color: #65676B">${sender.fullName}</span>
            </div>
            <div><img src="${image}"/></div>
          </div>
          <img src="${sender.avatar}" alt="My profile" class="w-6 h-6 rounded-full order-2">
       </div>
    </div>`
      } else {
         textingSound.play()
         messages.innerHTML +=
       `<div class="chat-message">
       <div class="flex items-end">
          <div class="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start">
            <div>
               <span class="px-3 rounded-lg inline-block rounded-br-none" style="color: #65676B">${sender.fullName}</span>
            </div>
            <div><img src="${image}"/></div>
          </div>
          <img src="${sender.avatar}" alt="My profile" class="w-6 h-6 rounded-full order-1">
       </div>
    </div>`
      }
      //  // remove 
      //  setTimeout(() => {
      //    URL.revokeObjectURL(image)
      //  }, "1000")
   });
