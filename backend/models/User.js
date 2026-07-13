const mongoose = require('mongoose');

const userschema = new mongoose.Schema(
    {
        name: String,
        email:{type:String, unique:true},
        password: String
    });

module.exports = mongoose.model('user-su', userschema);
