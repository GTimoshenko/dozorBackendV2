const { Schema, model } = require('mongoose')
const { teamSchema } = require('../models/team')
const { taskSchema } = require('../models/task')
const { timerSchema } = require('../models/timer')


const eventSchema = new Schema({
	host: {
		type: Object
	},
	name: { type: String, unique: true, required: true },
	description: { type: String, required: true },
	members: { type: [teamSchema] },
	questions: { type: [taskSchema] },
	timer: { type: Schema.Types.ObjectId, ref: 'Timer' },
	photos: { type: [String] },

})

module.exports = model('Event', eventSchema)