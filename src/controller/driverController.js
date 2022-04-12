const { Driver, validate } = require('../models/driver');
const { Request } = require('../models/request');
const env = require('dotenv');
const bcrypt = require("bcrypt");
const { Ambulance } = require('../models/ambulance');
const { User } = require('../models/user');
env.config();

exports.profile = async (req, res) => {
    const driver = await Driver.findById({ _id: req.auth.id }).select('phoneNumber name email role');
    res.status(200).json(driver);
}

exports.signIn = async (req, res) => {
    const driver = await Driver.findOne({ phoneNumber: req.body.phoneNumber })
    if (!driver) return res.status(400).json({ message: "Driver doesn't exist!" })

    const validPassword = await driver.isPasswordValid(req.body.password);
    if (!validPassword) return res.status(400).json({ message: "Invalid phone number or password" });
    if (validPassword && driver.role === 'driver') {
        const token = driver.getAuthenticationToken();
        res.cookie('token', token, { expiresIn: '500hr' });

        res.status(200).json(token);
    }
}

exports.updateAmbulance = async (req, res) => {
    console.log('hello');
    const { regNo } = req.body;
    const ambulance = await Ambulance.findOne({ registrationNumber: regNo });
    if (!ambulance) return res.status(404).json('The ambulance was not found.');
    console.log(regNo);
    const driver = await Driver.updateOne({ "_id": req.auth._id }, {
        $set: {
            ambulance: regNo
        }
    });
    console.log(req.auth._id);
    if (!driver.acknowledged) return res.status(404).json('The driver was not found.');
    res.status(200).json("Driver's ambulance updated");
}
//from driver app this below method will be called just after
// updateAmbulance() method is called. so that ambulance
//get updated with drivers details.
exports.updateAmbulanceDriver = async (req, res) => {
    const driverId = req.auth._id;

    const driver = await Driver.findOne({ _id: driverId });
    if (!driver) return res.status(404).json('The driver needs to signedIn');

    const driverObj = {
        _id: req.auth._id,
        name: driver.name,
        phoneNumber: driver.phoneNumber
    }
    const ambulance = await Ambulance.updateOne({ "registrationNumber": driver.ambulance }, {
        $set: {
            driver: driverObj
        }
    });
    if (!ambulance.acknowledged) return res.status(404).json('The Ambulance was not found');
    res.status(200).json("Ambulance's driver field updated");
}

exports.addDriver = async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { phoneNumber, password, name } = req.body;
    const worksFor = req.auth.id;

    const ambulanceService = await User.findById(worksFor)
    if (!ambulanceService) return res.status(400).json({ message: "Invalid ambulance service" })

    const hashedPassword = await bcrypt.hash(password, 10);

    const ambulance = new Driver({
        phoneNumber,
        password: hashedPassword,
        name,
        worksFor: {
            _id: ambulanceService._id,
            ambulanceService: ambulanceService.name,
            phoneNumber: ambulanceService.phoneNumber,
        }

    });
    await ambulance.save();
    res.status(200).json(ambulance);
}

exports.updateName = async (req, res) => {
    const { name } = req.body;
    const updateDriver = await Driver.updateOne({ "_id": req.auth.id }, {
        $set: {
            name: name
        }
    });
    const updateRequest = await Request.updateMany({ "requestedTo.driverId": req.auth.id }, {
        $set: {
            "requestedTo.driverName": name
        }
    });

    const updateAmbulance = await Ambulance.updateMany({ "driver._id": req.auth.id }, {
        $set: {
            "driver.name": name
        }
    });

    if (updateDriver.acknowledged !== true ||
        updateRequest.acknowledged !== true ||
        updateAmbulance.acknowledged != true)
        return res.status(404).json({ message: 'something went wrong' });
    res.status(200).json('Driver name updated!');
}

exports.updateNumber = async (req, res) => {
    const { phoneNumber } = req.body;
    const updateDriver = await Driver.updateOne({ "_id": req.auth.id }, {
        $set: {
            phoneNumber: phoneNumber
        }
    });
    const updateRequest = await Request.updateMany({ "requestedTo.driverId": req.auth.id }, {
        $set: {
            "requestedTo.driverPhoneNumber": phoneNumber
        }
    });
    if (updateDriver.acknowledged !== true ||
        updateRequest.acknowledged !== true)
        return res.status(404).json({ message: 'something went wrong' });
    res.status(200).json('Driver phoneNumber updated!');
}

exports.setNewPassword = async (req, res) => {
    const { setNewPassword, phoneNumber } = req.body;
    const hash_new_password = await bcrypt.hash(setNewPassword, 10);
    const updateDriver = await Driver.updateOne({ "_id": req.auth.id, "phoneNumber": phoneNumber }, {
        $set: {
            password: hash_new_password,
        }
    })
    if (updateDriver.acknowledged !== true || updateDriver.modifiedCount !== 1)
        return res.status(404).json({ message: 'something went wrong' });
    res.status(200).json('Driver password Updated!');
}

exports.signOut = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({
        messsage: 'Signout Successful...!'
    });
}

exports.deleteAccount = async (req, res) => {
    const requestData = await Request.deleteMany({ "requestedTo.driverId": req.auth.id });
    const driverData = await Driver.findByIdAndRemove(req.auth.id);
    if (requestData.deletedCount == 0 || !driverData)
        return res.status(404).json({ message: 'something went wrong' });
    res.status(200).json('Driver account deleted!');
}