const {Schema, model} = require('mongoose')

const teamSchema = new Schema({
    teamName: {type: String, unique: true,required: true},
    password: {type: String, required: true}
})

module.exports = model ('Team', teamSchema)