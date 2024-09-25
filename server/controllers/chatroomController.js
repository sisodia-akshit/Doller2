const chatRoom = require('../models/chatRoomModel')
const makeValidation = require('@withvoid/make-validation');




exports.getAllRooms = async (req, res) => {
    try {
        const user = req.user;
        const rooms = await chatRoom.getAllRooms();



        return res.status(200).json({
            status: "success",
            receiver: { _id: user._id, userName: user.userName },
            rooms
        })
    } catch (e) {
        return res.status(400).json({ status: 'failed', message: e })
    }
}


exports.createRoom = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) return res.status(400).json({ status: 'failed', message: "Provide a name for the room" })

        const chatInitiator = req.user;

        const chatRoomCreated = await chatRoom.createRoom(name, chatInitiator)
        return res.status(201).json({
            status: 'success',
            message: 'Room created successfully',
        })
    } catch (e) {
        return res.status(400).json({ status: 'failed', message: e })
    }
}

exports.postMessage = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await chatRoom.findOne({ _id: roomId })
        if (!room) return res.status(400).json({ status: 'failed', message: "This room does not Exist" })

        const user = req.user;

        const validation = makeValidation(types => ({
            payload: req.body,
            checks: {
                messageText: { type: types.string },
            }
        }));
        if (!validation.success) return res.status(400).json({ ...validation });
        const messagePayload = {
            user: {
                _id: user._id,
                userName: user.userName
            },
            messageText: req.body.messageText,
        };
        //   console.log(messagePayload)
        const message = await chatRoom.postMessage(room, messagePayload);
        if (!message) return res.status(400).json({ status: 'failed', message: "something went wrong.please try again later..." })

        // global.io.sockets.emit('new message', message);

        // global.io.sockets.in(roomId).emit('new message', { message });
        // console.log('working')
        global.io.sockets.emit('new message', { userName:user.userName, message:req.body.messageText });


        return res.status(200).json({ status: 'success' })

    } catch (e) {
        return res.status(500).json({ status: 'failed', message: e })
    }

}

// exports.getMessage = async (req, res) => {
//     try {
//         const { roomId } = req.params;
//         const room = await chatRoom.findOne({ _id: roomId })
//         if (!room) return res.status(400).json({ status: 'failed', message: "This room does not Exist" });

//         const user = req.user;

//         const updatedRoom = await chatRoom.getMessage(room, user)

//         return res.status(200).json({ status: 'success', message: updatedRoom.message, whoEntered: updatedRoom.whoEntered })

//     } catch (e) {
//         return res.status(500).json({ status: 'failed', message: e })
//     }
// }

exports.enterRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await chatRoom.findOne({ _id: roomId })
        if (!room) return res.status(400).json({ status: 'failed', message: "This room does not Exist" });

        const user = req.user;

        // const updatedRoom = await chatRoom.enterRoom(room, user)
        // global.io.sockets.emit('join room', { newEntry: user.userName, msg: `${user.userName} joined the room` });
        


        return res.status(200).json({
            status: 'success',
            userName: user.userName,
            message: `${user.userName} joined the room`

        })

        // const updatedRoom = await chatRoom.enterRoom(room, user)

    } catch (e) {
        return res.status(500).json({ status: 'failed', message: e })
    }
}