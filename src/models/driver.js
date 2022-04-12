const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const env = require("dotenv");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
env.config();

const driverSchema = new mongoose.Schema({
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
    ambulance: {
        type: String,
        default: null
    },
    role: {
        type: String,
        default: 'driver'
    },
    worksFor: {
        type: mongoose.Schema({
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            ambulanceService: {
                type: String,
                required: true,
                trim: true,
            },
            phoneNumber: {
                type: Number,
                required: true
            }
        }),
    }
}, {timestamps: true});

// see
// userSchema.virtual('password')
//     .set(async function(password){
//         this.password = await bcrypt.hash(password, 10);
//     });


driverSchema.methods = {
    isPasswordValid: async function(password){
        return await bcrypt.compare(password, this.password);
    },

    getAuthenticationToken: function () {
        const token = jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET, {expiresIn: '500hr'});
        return token;
    }
}

module.exports.validate = function (driver) {
    const schema = Joi.object({
        name: Joi.string().min(3).required().max(255),
        password: Joi.string().min(8).max(1024).required(),
        phoneNumber: Joi.number().required(),
        ambulance: Joi.string(),
    });

    const result = schema.validate(driver);
    return result;
  }

module.exports.Driver = mongoose.model('Driver', driverSchema);