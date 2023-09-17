const { Schema, model } = require('mongoose')

const taskSchema = new Schema({
	question: { type: String, required: true },
	clue: { type: String },
	answer: { type: String, required: true },
	winner: { type: String, default: "" }
})

module.exports = model('Task', taskSchema)