const express = require('express')
const path = require('path')
const http = require('http')
const app = express()
const socketio = require('socket.io')
const Filter =  require('bad-words')
const {generateMessage, generateLocation} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const port = process.env.PORT || 3000

/*
does this anyway behind the scenes.. doing this explicitly to use socket.io as when we have both socket.io and express we 
need to give ncessary configuration.
*/
const server = http.createServer(app)   
const io = socketio(server) // needs raw http server. thats why we needed to configure express

const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))
//let count = 0
io.on('connection', (socket) => {
    console.log(' new web socket connection')

    // socket.emit('countUpdated', count) // we use socket.emit here and not io.emit because we send the latest count to the recently
    //                                    //joined connection. if we used io.emit all connections would get the count unnecassarily.

    // socket.on('increment', () => {
    //     count++
    //    // socket.emit('countUpdated', count) // this gives updated info to single connection
    //     io.emit('countUpdated', count)  // this gives the updated count or emit event to every connection
    // })


    socket.on('join', ({username, room}, callback) => {
      const {error , user} =   addUser({
            id: socket.id,
            username,
            room
        })
        if(error) {
           return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Sys','Welcome!'))

    socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))
    io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
    })
    callback()

    })
    

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        if(!user) {
            return callback(' user not present in this room')
        }
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage( user.username, message) )
        callback()
        //console.log(message)
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        if(!user) {
            return callback('user not present in the room')
        }
        console.log(location)
        io.to(user.room).emit('locationMessage', generateLocation(user.username,'https://google.com/maps?q='+location.latitude+','+location.longitude))
        callback()
    }
    )

    socket.on('disconnect', ()=> {
        const user = removeUser(socket.id)
        if(user) {
        io.to(user.room).emit('message', generateMessage('Sys',`${user.username} has left!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        }

    })
})

server.listen(port, () => {
    console.log( 'the server is up on '+ port)
})  


