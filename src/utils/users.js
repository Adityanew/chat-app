const users = []

//addUser , removeUser,  getUser, getUsersInRoom, 

const addUser =    ({id, username, room}) => {
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    if(!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    //check for existing user
    const existinguser = users.find( (user) => {
        return user.room === room && user.username === username
    })
    //vaildate username
    if(existinguser) {
        return {
            error: "Username is already being used"
        }
    }

    const user = { id, username, room}
    users.push(user)
    return { user }

    
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if(index !== -1) {
        return users.splice(index,1)[0]
    }
}


const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id
    })

    return user
}

const getUsersInRoom = (room) => {
    const usersInRoom = users.filter( (user) => {
        return user.room === room.toLowerCase()
    })

    return usersInRoom
}



addUser({
    id: 22,
    username: 'Aditya',
    room: 'Kolkata'
})

// addUser({
//     id: 21,
//     username: 'AdityaK',
//     room: 'Kolkata'
// })



// addUser({
//     id: 23,
//     username: 'AdityaT',
//     room: 'Kolkata'
// })


// addUser({
//     id: 24,
//     username: 'Aditya',
//     room: 'Calcutta'
// })


// console.log(users)

// console.log(getUser(25))

// console.log(getUsersInRoom('Kolkata'))

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}