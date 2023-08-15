const express = require('express')
const mongoose = require('mongoose')
const authRouter = require('./routers/authRouter')
const eventRouter = require('./routers/eventRouter')
const teamRouter = require('./routers/teamRouter')
const PORT = 5000

const app = express()
const dbUrl = `mongodb+srv://glebushnik:dozorAdmin@cluster0.0rfdegy.mongodb.net/?retryWrites=true&w=majority`

app.use(express.json())
app.use("/auth", authRouter)
app.use("/events", eventRouter)
app.use("/teams", teamRouter)

const start = async () => {
	try {
		await mongoose.connect(dbUrl);
		app.listen(PORT, () => console.log('Server is running on port: ', PORT));
	} catch (e) {
		console.log(e);
	}
}

start()