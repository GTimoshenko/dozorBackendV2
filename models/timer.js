const { Schema, model } = require('mongoose')

const timerSchema = new Schema({
	hr: { type: Number, required: true, default: 0 },
	min: { type: Number, required: true, default: 0 },
	sec: { type: Number, required: true, default: 0 },
	day: { type: Number, required: true, default: 0 },
	mnt: { type: Number, required: true, default: 0 },
	yr: { type: Number, required: true, default: 0 }
})

module.exports = model('Timer', timerSchema)