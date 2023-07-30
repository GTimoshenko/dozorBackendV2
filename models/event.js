const {Schema,model} = require('mongoose')

const eventSchema = new Schema({
    name: {type: String, unique: true,required: true}
})

module.exports = model('Event', eventSchema)