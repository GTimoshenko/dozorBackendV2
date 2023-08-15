const Event = require('../models/event')
const { validationResult } = require('express-validator')

class eventController {
	async createEvent(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({ message: 'Не удалось зарегистрировать событие.', errors })
			}

			const { name } = req.body

			const eventCandidate = await Event.findOne()
			if (eventCandidate) {
				return res.status(400).json({ message: 'Событие с таким именем уже существует.' })
			}

			const event = new Event({ name })
			await event.save()
			return res.json({ message: 'Событие успешно создано.' })
		} catch (e) {
			console.log(e)
			return res.status(403).json({ message: 'Не удалось создать событие.' })
		}
	}

	async getEvents(req, res) {
		try {
			const events = await Event.find()
			res.json(events)
		} catch (e) {
			console.log(e)
		}
	}
}

module.exports = new eventController();