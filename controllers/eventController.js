const { createCheckSchema } = require('express-validator/src/middlewares/schema')
const Event = require('../models/event')
const User = require('../models/user')
const Team = require('../models/team')
const { validationResult } = require('express-validator')

class eventController {
	async createEvent(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({ message: 'Не удалось зарегистрировать событие.', errors })
			}

			const { name, description, questions } = req.body
			const { hostId } = req.params

			const eventCandidate = await Event.findOne()
			const host = await User.findById(hostId)
			if (eventCandidate) {
				return res.status(400).json({ message: 'У вас уже есть активное событие.' })
			}

			const event = new Event({ name, description, questions })
			event.host = host
			await event.save()
			res.json({ message: "Событие создано.", event })
		} catch (e) {
			console.log(e)
			return res.status(403).json({ message: 'Не удалось создать событие.' })
		}
	}

	async deleteEvent(req, res) {
		try {
			const { eventId } = req.params
			const { hostId } = req.body

			const host = await User.findById(hostId)
			const event = await Event.findById(eventId)

			if (host.name === event.host.name) {
				await Event.deleteOne(event)
				res.json({ message: "Событие удалено." })
			}
		} catch (e) {
			console.log(e)
			res.status(400).json({ message: "Не удалось удалить событие." })
		}
	}

	async addTeam(req, res) {
		try {
			const { eventId } = req.params
			const { hostId, teamId } = req.body

			const host = await User.findById(hostId)
			const event = await Event.findById(eventId)
			const team = await Team.findById(teamId)

			if (host.name === event.host.name) {
				event.members.push(team)
				await event.save()
				team.eventName = event.name
				await team.save()
				res.json({ message: "Команда успешно добавлена.", event })
			}
		} catch (e) {
			res.status(400).json({ message: "Не удалось добавить команду.", e })
		}
	}

	async kickTeam(req, res) {
		try {
			const { eventId } = req.params
			const { hostId, teamId } = req.body

			const host = await User.findById(hostId)
			const event = await Event.findById(eventId)
			const team = await Team.findById(teamId)

			if (host.name === event.host.name) {
				const teamIndex = event.members.findIndex((team) => team._id.toString() === teamId)
				event.members.splice(teamIndex, 1)

				await event.save()
				team.eventName = ""
				await team.save()
				res.json({ message: "Команда удалена.", team })
			}
		} catch (e) {
			console.log(e)
			res.status(400).json({ message: "Не удалось удалить команду." })
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

	async getEventMembers(req, res) {
		try {
			const { eventId } = req.params

			const candidate = await Event.findById(eventId)

			if (!candidate) {
				res.status(400).json({ message: "Не удалось получить данные о коммандах" })
			}

			res.status(200).json(candidate.members)
		} catch (e) {
			console.log(e)
			res.status(400).json({ message: "Не удалось получить информацию о мероприятии" })
		}
	}

	async getEvent(req, res) {
		try {
			const { eventId } = req.params

			const candidate = await Event.findById(eventId)

			if (!candidate) {
				res.status(400).json({ message: "Не сущесвует события с таким ID" })
			}

			res.status(200).json(candidate)
		} catch (e) {
			console.log(e)
			res.status(400).json({ message: "Не удалось получить данные о событии" })
		}
	}

	async getEventHost(req, res) {
		try {
			const { eventId } = req.params
			const candidate = await Event.findById(eventId)

			if (!candidate) {
				res.status(400).json({ message: "Не сущесвует события с таким ID" })
			}
			res.status(200).json(candidate.host)
		} catch (e) {
			console.log(e)
			res.status(400).json({ message: "Не удалось получить данные об организаторе." })
		}
	}

}

module.exports = new eventController();