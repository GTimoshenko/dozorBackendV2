const { Schema, model } = require('mongoose');
const { userSchema } = require('./user')
const { taskSchema } = require('./task')

const teamSchema = new Schema({
	captain: {
		type: Object,
	},
	teamName: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	members: {
		type: [userSchema],
	},
	eventName: { type: String, default: "" },
	tasks: { type: [taskSchema] },
	isEventMember : {type: Boolean, default: 0}
});

module.exports = model('Team', teamSchema)