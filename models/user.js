const { Schema, model } = require('mongoose')

const userSchema = new Schema({
	name: { type: String, unique: true, required: true },
	eMail: { type: String, unique: true, required: false },
	password: { type: String, required: true },
	avatarUrl: { type: String, required: true, default: "defaultAvatar" },
	roles: [{ type: String, ref: 'Role' }],
	teamName: { type: String, default: "" },
	verificationCode: { type: String, required: false, default: "" }
})

module.exports = model('User', userSchema)