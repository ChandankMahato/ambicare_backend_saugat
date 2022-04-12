const { User, validate } = require('../models/user');
const env = require('dotenv');
const bcrypt = require("bcrypt");
const { Request } = require('../models/request');
env.config();

exports.profile = async (req, res) => {
    const user = await User.findById({ _id: req.auth.id }).select('phoneNumber name email role');
    res.status(200).json(user);
}

exports.signUp = async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const user = await User.findOne({ phoneNumber: req.body.phoneNumber });
    if (user) return res.status(400).json({ message: "User already exists" });
    const { phoneNumber, name, email } = req.body;
    const password = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
        phoneNumber,
        name,
        password,
        email,
        role: 'user'
    });
    await newUser.save();
    const token = newUser.getAuthenticationToken();
    res.status(201).json(token);
}

exports.signIn = async (req, res) => {
    const user = await User.findOne({ phoneNumber: req.body.phoneNumber });
    if (!user) return res.status(400).json({ message: "User doesn't exist!" });

    const validPassword = await user.isPasswordValid(req.body.password);
    if (!validPassword) return res.status(400).json({ message: "Invalid phone number or password" });
    if (validPassword && user.role === 'user') {
        const token = user.getAuthenticationToken();
        res.cookie('token', token, { expiresIn: '500hr' });

        res.status(200).json(token);
    }
}

exports.updateName = async (req, res) => {
    const { name } = req.body;
    const updateUser = await User.updateOne({ "_id": req.auth.id }, {
        $set: {
            name: name
        }
    });
    const updateRequest = await Request.updateMany({ "requestedBy.userId": req.auth.id }, {
        $set: {
            "requestedBy.name": name
        }
    });
    if (updateUser.acknowledged !== true ||
        updateRequest.acknowledged !== true)
        return res.status(404).json({ message: 'something went wrong' });
    res.status(200).json('User name updated!');
}


// phone number hamro pk ho. Shouldn't change
exports.updateNumber = async (req, res) => {
    const { phoneNumber } = req.body;
    const updateUser = await User.updateOne({ "_id": req.auth.id }, {
        $set: {
            phoneNumber: phoneNumber
        }
    });
    const updateRequest = await Request.updateMany({ "requestedBy.userId": req.auth.id }, {
        $set: {
            "requestedBy.phoneNumber": phoneNumber
        }
    });
    if (updateUser.acknowledged !== true ||
        updateRequest.acknowledged !== true)
        return res.status(404).json({ message: 'something went wrong' });
    res.status(200).json('User phoneNumber updated!');
}

exports.setNewPassword = async (req, res) => {
    const { setNewPassword, phoneNumber } = req.body;
    const hash_new_password = await bcrypt.hash(setNewPassword, 10);
    const updateUser = await User.updateOne({ "_id": req.auth.id, "phoneNumber": phoneNumber }, {
        $set: {
            password: hash_new_password,
        }
    })
    if (updateUser.acknowledged !== true || updateUser.modifiedCount !== 1)
        return res.status(404).json({ message: 'something went wrong' });
    res.status(200).json('User password Updated!');
}

exports.signOut = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({
        messsage: 'Signout Successful...!'
    });
}

//sus
exports.deleteAccount = async (req, res) => {
    const requestData = await Request.deleteMany({ "requestedBy.userId": req.auth.id });
    const userData = await User.findByIdAndRemove(req.auth.id);
    if(requestData.deletedCount == 0 || !userData)
        return res.status(404).json({message: 'something went wrong'});
    res.status(200).json('User account deleted!');
}