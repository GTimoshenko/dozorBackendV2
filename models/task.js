const { Schema, model } = require('mongoose')

const taskSchema = new Schema({
	question: { type: String, required: true },
	clue: { type: String },
	answer: { type: String, required: true },
	winner: { type: String, default: "" },
	photo: { type: String }
})

module.exports = model('Task', taskSchema)