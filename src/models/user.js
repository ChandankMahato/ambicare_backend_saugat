const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const env = require("dotenv");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
env.config();

const userSchema = new mongoose.Schema({
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
        min: 2,
        max: 255
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    role: {
        type: String,
        default: 'user'
    }
}, {timestamps: true});

userSchema.methods = {
    isPasswordValid: async function(password){
        return await bcrypt.compare(password, this.password);
    },

    getAuthenticationToken: function () {
        const token = jwt.sign({ id: this._id, role: this.role}, process.env.JWT_SECRET, {expiresIn: '100hr'});
        return token;
    }
}

module.exports.validate = function (user) {
    const schema = Joi.object({
        name: Joi.string().min(2).required().max(255),
        email: Joi.string().email(),
        password: Joi.string().min(8).max(1024).required(),
        phoneNumber: Joi.number().required()
    });

    const result = schema.validate(user);
    return result;
  }

module.exports.User = mongoose.model('User', userSchema);