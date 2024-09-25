const mongoose = require('mongoose');
const {v4} = require('uuid');
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema(
    {
        _id: {
            type: String,
            default: () => v4().replace(/\-/g, "")
        },
        name: String,
        email: String,
        userName: {
            type: String,
        },
        password: String,
        type: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        }
    },
    {
        timestamps: true,
        collection: "users",
    }
)

userSchema.statics.createUser = async function (name, email, userName, password) {
    const user = await this.create({ name, email, userName, password });
    return user;
}
userSchema.pre('save', async function (next) {
this.password = await bcrypt.hash(this.password, 8);
next();
})

userSchema.statics.comparePassword = async function (getPassword, password) {
return await bcrypt.compare(getPassword, password);
}

module.exports = mongoose.model('users', userSchema)