const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const env = require("dotenv");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
env.config();

const ambulanceServiceSchema = new mongoose.Schema({
    phoneNumber: {
        type: Number,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        minlength: 8,
        required: true,
        maxlength: 1024,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        min: 3,
        max: 255
    },
    address: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    role: {
        type: String,
        default: 'service'
    }
}, {timestamps: true});

// see
// userSchema.virtual('password')
//     .set(async function(password){
//         this.password = await bcrypt.hash(password, 10);
//     });


ambulanceServiceSchema.methods = {
    isPasswordValid: async function(password){
        return await bcrypt.compare(password, this.password);
    },

    getAuthenticationToken: function () {
        const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {expiresIn: '1hr'});
        return token;
    }
}

module.exports.validate = function (ambulanceService) {
    const schema = Joi.object({
        name: Joi.string().min(3).required().max(255),
        address: Joi.string().required(),
        password: Joi.string().min(8).max(1024).required(),
        phoneNumber: Joi.number().required()
    });

    const result = schema.validate(ambulanceService);
    return result;
  }

module.exports.AmbulanceService = mongoose.model('AmbulanceService', ambulanceServiceSchema);