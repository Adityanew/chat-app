const socket = io() 

// socket.on('countUpdated', (count) => {
//     console.log('count updated! '+ count)

// })
const chatForm = document.querySelector('#message-form')
const chatFormInput = chatForm.querySelector('input')
const chatFormButton = chatForm.querySelector('button')
const $messages = document.querySelector('#messages')
//const message = document.querySelector('input')


//templates 
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const autoscroll = () => {
    const $newMessage = $messages.lastElementChild  
    //height of the new message
    const  newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of message container
    const containerHeight = $messages.scrollHeight
    //how far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
//Options
const {username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})
socket.on('message', (data) => {
    console.log(data)
    const html = Mustache.render(messageTemplate, {
        username: data.username,
        data: data.text,
        createdAt: moment(data.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html) 
    autoscroll()
}) 

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        location: location.location,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


chatForm.addEventListener('submit', (e) => {
    e.preventDefault()
    chatFormButton.setAttribute('disabled','disabled')

    const m = e.target.elements.message.value
    socket.emit('sendMessage', m, (error) => {
        chatFormButton.removeAttribute('disabled')
        chatFormInput.value = ''
        chatFormInput.focus()
        if(error) {
            return console.log(error)
        }
        console.log('Message delivered')
    })
})
 

const $sendLocation = document.querySelector('#send-location')

$sendLocation.addEventListener('click', () => {
    $sendLocation.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation) {
        return alert('Geolocation not supported')
    }
    navigator.geolocation.getCurrentPosition( (position) => {
       // console.log('pos '+position.coords.latitude)
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log(' location shared')
            $sendLocation.removeAttribute('disabled')
        })
    })
})

// document.querySelector('#increment').addEventListener('click', () => {
//         console.log('clicked')
//         socket.emit('increment')
// })

socket.emit('join', {username, room}, (error) => {

    if (error) {
        alert(error)
        location.href = '/'
    }

})