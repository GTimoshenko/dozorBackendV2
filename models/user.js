const {Schema, model} = require('mongoose')

const userSchema = new Schema({
    name: {type: String, unique: true,required: true},
    password: {type: String, required: true},
    avatarUrl: {type:String, required: true, default: "defaultAvatar"},
    roles: [{type:String, ref: 'Role'}]
})

module.exports = model ('User', userSchema)