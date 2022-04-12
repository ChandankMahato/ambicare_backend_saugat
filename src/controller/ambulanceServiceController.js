const { User, validate } = require('../models/user');
const env = require('dotenv');
const bcrypt = require("bcrypt");
const { Ambulance } = require('../models/ambulance');
const {Request} = require('../models/request');
env.config();


exports.profile = async (req, res) => {
    const ambulanceService = await User.findById({ _id: req.auth.id }).select('phoneNumber name email role');
    res.status(200).json(ambulanceService);
}

exports.signUp = async (req, res) => {
    const { error } = validate(req.body);
    console.log('hello');
    if (error) return res.status(400).json({ message: error.details[0].message });

    const ambulanceService = await User.findOne({ phoneNumber: req.body.phoneNumber })
    if (ambulanceService) return res.status(400).json({ message: "Ambulance Service already exists" })
    const { phoneNumber, name, email } = req.body;
    const password = await bcrypt.hash(req.body.password, 10)
    const newAmbulanceService = new User({
        phoneNumber,
        name,
        password,
        email,
        role: 'service',
    });
    await newAmbulanceService.save();
    const token = newAmbulanceService.getAuthenticationToken();
    res.cookie('token', token, { expiresIn: '100hr' });
    res.status(201).json({ token: token, id:  newAmbulanceService._id });
}

exports.signIn = async (req, res) => {
    const ambulanceService = await User.findOne({ phoneNumber: req.body.phoneNumber })
    if (!ambulanceService) return res.status(400).json({ message: "Ambulance Service doesn't exist!" })

    const validPassword = await ambulanceService.isPasswordValid(req.body.password);
    if (!validPassword) return res.status(400).json({ message: "Invalid phone number or password" });
    if (validPassword && ambulanceService.role === 'service') {
        const token = ambulanceService.getAuthenticationToken();
        res.cookie('token', token, { expiresIn: '100hr' });

        res.status(200).json({ token: token, id:  ambulanceService._id });
    }
}

exports.updateName = async (req, res) => {
    const { name } = req.body;
    const updateService = await User.updateOne({ "_id": req.auth.id }, {
        $set: {
            name: name
        }
    });
    const updateAmbulance = await Ambulance.updateMany({ "ownedBy._id": req.auth.id }, {
        $set: {
            "ownedBy.ambulanceService": name
        }
    });
    const updateRequest = await Request.updateMany({ "requestedTo.serviceId": req.auth.id }, {
        $set: {
            "requestedTo.ambulanceService": name
        }
    });
    if (updateService.acknowledged !== true || 
        updateAmbulance.acknowledged !== true ||
        updateRequest.acknowledged !== true)
        return res.status(404).json({ message: 'something went wrong' });
    res.status(200).json('Service name updated!');
}

exports.updateNumber = async (req, res) => {
    const { phoneNumber } = req.body;
    const updateService = await User.updateOne({ "_id": req.auth.id }, {
        $set: {
            phoneNumber: phoneNumber
        }
    });
    const updateAmbulance = await Ambulance.updateMany({ "ownedBy._id": req.auth.id }, {
        $set: {
            "ownedBy.phoneNumber": phoneNumber
        }
    });
    const updateRequest = await Request.updateMany({"requestedTo.serviceId": req.auth.id}, {
        $set: {
            "requestedTo.servicePhoneNumber":phoneNumber
        }
    });
    if (updateService.acknowledged !== true || 
        updateAmbulance.acknowledged !== true ||
        updateRequest.acknowledged !== true)
        return res.status(404).json({ message: 'something went wrong' });
    res.status(200).json('Service phoneNumber updated!');
}

exports.setNewPassword = async (req, res) => {
    const { setNewPassword, phoneNumber } = req.body;
    const hash_new_password = await bcrypt.hash(setNewPassword, 10);
    const updateService = await User.updateOne({ "_id": req.auth.id, "phoneNumber": phoneNumber }, {
        $set: {
            password: hash_new_password,
        }
    })
    if (updateService.acknowledged !== true || updateService.modifiedCount !== 1)
        return res.status(404).json({ message: 'something went wrong' });
    res.status(200).json('Service password Updated!');
}

exports.signOut = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({
        messsage: 'Signout Successful...!'
    });
}

exports.deleteAccount = async (req, res) => {
    const requestData = await Request.deleteMany({ "requestedTo.serviceId": req.auth.id });
    const serviceData = await User.findByIdAndRemove(req.auth.id);
    if(requestData.deletedCount == 0 || !serviceData)
        return res.status(404).json({message: 'something went wrong'});
    res.status(200).json('Service account deleted!');
}