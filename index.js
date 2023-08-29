const express = require('express')
const mongoose = require('mongoose')
const cors=require("cors")
const authRouter = require('./routers/authRouter')
const eventRouter = require('./routers/eventRouter')
const teamRouter = require('./routers/teamRouter')
const chatRouter = require('./routers/chatRouter')
const messageRouter = require('./routers/messageRouter')

const PORT=process.env.PORT||5000

const app = express()
const dbUrl = `mongodb+srv://glebushnik:dozorAdmin@cluster0.0rfdegy.mongodb.net/?retryWrites=true&w=majority`

app.use(express.json())
app.use(cors())
app.use("/auth", authRouter)
app.use("/events", eventRouter)
app.use("/teams", teamRouter)
app.use("/chat", chatRouter)
app.use("/message", messageRouter)

const start = async () => {
	try {
		await mongoose.connect(dbUrl);
		app.listen(PORT, () => console.log('Server is running on port: ', PORT));
	} catch (e) {
		console.log(e);
	}
}

start()