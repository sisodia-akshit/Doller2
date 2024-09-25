const UserModel = require('../models/userModel');
const makeValidation = require('@withvoid/make-validation');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })
}
const createSendResponce = (user, status, res) => {
    const token = signToken(user._id);
    const options = {
        maxAge: process.env.LOGIN_EXPIRES,
        httpOnly: true
    }

    res.cookie('jwt', token, options);

    user.password = undefined;


    res.status(status).json({
        status: 'success',
        token,
        user
    })
}

exports.createUser = async (req, res) => {
    try {
        const validation = makeValidation(types => ({
            payload: req.body,
            checks: {
                name: { type: types.string, required: true, min: 1, max: 20 },
                email: { type: types.string, required: true, check: 'email' },
                userName: { type: types.string, options: { unique: true, empty: false }, min: 1, max: 30 },
                password: { type: types.string, required: true, min: 8, max: 20 }
            }
        }));

        if (!validation.success) return res.status(400).json(...validation);

        const { name, email, userName, password } = req.body;

        const userNameExist = await UserModel.findOne({ userName });
        if (userNameExist) return res.status(400).json({ status: 'failed', message: 'Username already exist' });

        const user = await UserModel.createUser(name, email, userName, password);

        // return res.status(200).json({ success: true, user });
        createSendResponce(user, 201, res)

    } catch (e) {
        return res.status(400).json(e)
    }

};

exports.loginUser = async (req, res) => {
    try {
        const { userName, password } = req.body;

        const user = await UserModel.findOne({ userName }).select("+password");
        if (!user) return res.status(400).json({ status: 'failed', message: 'Invalid username or password!' });

        const isValidPassword = await UserModel.comparePassword(password, user.password);
        if (!isValidPassword) return res.status(400).json({ status: 'failed', message: 'Invalid username or password!' });

        // return res.status(200).json({ success: true, user });
        createSendResponce(user, 200, res)

    } catch (e) {
        return res.status(400).json(e)
    }

};
