const {Schema, model} = require('mongoose')

const role = new Schema({
    value: {type: String, required: true, default: "user"},
})

module.exports = model ('Role', role)