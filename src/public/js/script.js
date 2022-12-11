const el = document.getElementById('messages')
el.scrollTop = el.scrollHeight

const chatBoxComponent = document.getElementById('chatBox')
const participantsAndQueueComponent = document.getElementById('participantsAndQueue')
const queues = document.getElementById('queues')

const imgInput = document.getElementById('imgInput')
const imgButton = document.getElementById('imgButton')
const chatButton = document.getElementById('chatButton')
const participantsButton = document.getElementById('participantsButton')
const closeChatButton = document.getElementsByClassName('closeChatButton')[0]
const closeParticipantsButton = document.getElementsByClassName('closeParticipantsButton')[0]

imgButton.addEventListener('click', function(){
    imgInput.click()
})

chatButton.addEventListener('click', function(){
    if(participantsAndQueueComponent.style.display == 'flex') {
        participantsAndQueueComponent.style.display = 'none'
        chatBoxComponent.style.display = 'flex'
    } else if(chatBoxComponent.style.display == 'flex'){
        chatBoxComponent.style.display = 'none'
    } else {
        chatBoxComponent.style.display = 'flex'
    }

    if(chatBoxComponent.style.display == 'none' && participantsAndQueueComponent.style.display == 'none') {
        videoGrid.style.width = '100%'
    } else {
        videoGrid.style.width = '75%'
    }
})

participantsButton.addEventListener('click', function(){
    if(chatBoxComponent.style.display !== 'none') {
        chatBoxComponent.style.display = 'none'
        participantsAndQueueComponent.style.display = 'flex'
    } else if(participantsAndQueueComponent.style.display == 'flex'){
        participantsAndQueueComponent.style.display = 'none'
    } else {
        participantsAndQueueComponent.style.display = 'flex'
    }

    if(chatBoxComponent.style.display == 'none' && participantsAndQueueComponent.style.display == 'none') {
        videoGrid.style.width = '100%'
    } else {
        videoGrid.style.width = '75%'
    }
})

closeChatButton.addEventListener('click', function(){
    chatBoxComponent.style.display = 'none'
    
    if(chatBoxComponent.style.display == 'none' && participantsAndQueueComponent.style.display == 'none') {
        videoGrid.style.width = '100%'
    } else {
        videoGrid.style.width = '75%'
    }
})

closeParticipantsButton.addEventListener('click', function(){
    participantsAndQueueComponent.style.display = 'none'

    if(chatBoxComponent.style.display == 'none' && participantsAndQueueComponent.style.display == 'none') {
        videoGrid.style.width = '100%'
    } else {
        videoGrid.style.width = '75%'
    }
})


function searchParticipant() {
     // Declare variables
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById('search');
  filter = input.value.toUpperCase();
//  participantsComponent
  var participantNodes = participantsComponent.getElementsByClassName('participant');

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < participantNodes.length; i++) {
    a = participantNodes[i].getElementsByClassName("participantName")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
        participantNodes[i].style.display = "";
    } else {
        participantNodes[i].style.display = "none";
    }
  }
}


