const mongoose = require('mongoose')
const { v4 } = require("uuid");

const chatRoomSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: () => v4().replace(/\-/g, "")
        },
        name: String,
        users: Array,
        chatInitiator: String,
        message: Array,
        whoEntered: String
    },
    {
        timestamps: true,
        collection: "chatrooms",
    }
);

chatRoomSchema.statics.getAllRooms = async function () {
    const rooms = await this.find();
    return rooms;
}
chatRoomSchema.statics.createRoom = async function (name, chatInitiator) {
    const room = await this.create({ name, users: [{ _id: chatInitiator._id, userName: chatInitiator.userName }], chatInitiator: chatInitiator._id })
    return room;
}

chatRoomSchema.statics.postMessage = async function (room, messagePayload) {
    const updateRoom = await this.findByIdAndUpdate(room._id, { $push: { message: messagePayload } });
    return updateRoom.message;
}
chatRoomSchema.statics.getMessage = async function (room, user) {
    const oldUser = await room.users.find(curr => curr._id === user._id)
    if (oldUser) {
        const updateRoom = await this.findByIdAndUpdate(room._id,{whoEntered:user.userName})
        return updateRoom;
    }
    const updateRoom = await this.findByIdAndUpdate(room._id, { $push: { users: { _id: user._id, userName: user.userName } },whoEntered:user.userName})
    return updateRoom;
}



module.exports= mongoose.model("chatroom", chatRoomSchema);