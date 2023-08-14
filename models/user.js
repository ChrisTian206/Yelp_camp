const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: [true, 'This email address has been used.']
    }
})

//UserSchema didn't include username. 
//Because passportLocalMongoose automatically included it along with hash and salt
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema)