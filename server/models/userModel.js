const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have name'],
        minlength: [3, 'User name must have 3 word'],
        maxlength: [12, 'User name not have more than 12 word']
    },
    email: {
        type: String,
        validate: [validator.isEmail, 'User must have provide valid email'],
        lowercase: true,
        unique: true,
        required: [true, 'Please provide your email'],
    },
    phone: {
        type: Number,
        minlength: [10, 'Phone number have at least 10 digit'],
        required: [true, 'User must have Phone number'],
        unique: true

    },
    password: {
        type: String,
        required: [true, 'User must have valid Password'],
        minlength: [5, 'User password must have 5 word'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'User must confirm Password'],
        validate: {
            validator: function (el) {
                return el == this.password;
            },
            message: 'Password must have same password '
        }

    },
    emailVarify: {
        type: Boolean,
        default: false,

    },
    phoneVarify: {
        type: Boolean,
        default: false
    },
    Surveys: [{ type: mongoose.Schema.ObjectId, ref: 'Survay' }],
    passwordChangeAt: Date,
    phoneCode: Number,
    emailCode: Number,
    active: {
        default: false,
        type: Boolean
    }
});


userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    this.passwordChangeAt = Date.now();
    next();

});

userSchema.pre(/^find/, async function (next) {
    this.find({
        active: {
            $ne: false
        }
    });
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangeAt) {
        const changeTimeStamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
        return JWTTimeStamp < changeTimeStamp;
    }
    return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;