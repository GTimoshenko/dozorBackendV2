const mongoose = require("mongoose");
const moment = require("moment-timezone");

const messageSchema = new mongoose.Schema({
	chatId: String,
	senderId: String,
	text: String,
	createdAt: Date,
});

messageSchema.pre("save", function (next) {
	this.createdAt = moment().tz("Europe/Moscow").toDate();
	next();
});

messageSchema.set("toJSON", {
	transform: function (doc, ret, options) {
		ret.createdAt = moment(ret.createdAt).tz("Europe/Moscow").format();
		return ret;
	},
});

const messageModel = mongoose.model("Message", messageSchema);

module.exports = messageModel;