const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const util = require('util');

exports.protect = async (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            status: 'failed',
            message: 'You are not logged in!'
        })
    }

    if (token && token.startsWith('Bearer')) token = token.split(' ')[1]
    try {
        const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR);

        // if(!decodedToken)return res.status(401).json({ status: "failed", message: "Invalid token!!" })
        const user = await UserModel.findOne({ _id: decodedToken.id })

        if (!user) return res.status(401).json({ status: "failed", message: "User not exist" })

        req.user = user;
        next();


    } catch (e) {
        return res.status(400).json(e)
    }

}