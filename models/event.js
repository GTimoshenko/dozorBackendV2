const {Schema,model} = require('mongoose')
const {teamSchema} = require('../models/team')

const eventSchema = new Schema({
    host : {
        type : Object
    },
    name: {type: String, unique: true,required: true},
    description: {type: String, required: true},
    members : {type: [teamSchema]}
})

module.exports = model('Event', eventSchema)