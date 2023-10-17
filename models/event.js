const { Schema, model } = require('mongoose')
const { teamSchema } = require('../models/team')
const { taskSchema } = require('../models/task')


const eventSchema = new Schema({
	host: {
		type: Object
	},
	name: { type: String, unique: true, required: true },
	description: { type: String, required: true },
	members: { type: [teamSchema] },
	questions: { type: [taskSchema] },
	start: { type: String, required: true },
	end: { type: String, required: true },
	photos: { type: [String] },

})

module.exports = model('Event', eventSchema)