const mongoose = require('mongoose');


const optionSchema = new mongoose.Schema({
    option: String,
    votes: {
        type: Number,
        default: 0,
    },
});


const survaySchema = new mongoose.Schema({

    question: {
        type: String,
        required: [true, 'A Survay Must Have Question'],

    },
    totalVotes: {
        type: Number,
        default: 0
    },
    options: [optionSchema],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },

    votedBy: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    hidden: {
        type: Boolean,
        default: false
    },
    questionBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },

});

const Survay = mongoose.model('Survay', survaySchema);
module.exports = Survay;