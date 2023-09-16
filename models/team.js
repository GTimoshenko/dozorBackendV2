const { Schema, model } = require('mongoose');
const user = require('./user');
const { userSchema } = require('./user')

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
});

module.exports = model('Team', teamSchema)