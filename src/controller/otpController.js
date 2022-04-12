const { User } = require('../models/user');
const env = require('dotenv');
env.config();

const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendOtp = async (req, res) => {
    const user = await User.findOne({ phoneNumber: req.body.phoneNumber });
    if (user) return res.status(400).json({ message: "User already exists" });
    var { phoneNumber } = req.body;
    const service = await client.verify.services.create({ friendlyName: "Ambicare" })
    const verification = await client.verify.services(service.sid).verifications.create({
        channel: "sms",
        to: "+977" + String(phoneNumber),
    })
    res.status(200).json({
        "status": verification.status,
        "service_sid": service.sid,
    })
}

exports.verifyOtp = async (req, res) => {
    const { phoneNumber, code, sid } = req.body
    const verificationCheck = await client.verify.services(sid).verificationChecks.create({ to: "+977" + String(phoneNumber), code: code })
    if (verificationCheck.valid) {
        res.status(200).json({ message: "Phone number verified" })
    } else {
        res.status(404).json({
            message: "Invalid otp"
        })
    }
}