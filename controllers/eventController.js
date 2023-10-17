const { createCheckSchema } = require('express-validator/src/middlewares/schema')
const Event = require('../models/event')
const User = require('../models/user')
const Team = require('../models/team')
const Task = require('../models/task')
const { validationResult } = require('express-validator')

class eventController {
	async createEvent(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({ message: 'Не удалось зарегистрировать событие.', errors })
			}

			const { name, description, start, end } = req.body
			const { hostId } = req.params

			const eventCandidate = await Event.findOne({ name })
			const host = await User.findById(hostId)
			if (eventCandidate) {
				return res.status(400).json({ message: 'У вас уже есть активное событие.' })
			}

			const event = new Event({ name, description, start, end })
			event.host = host
			await event.save()
			res.json({ message: "Событие создано.", event })
		} catch (e) {
			console.log(e)
			return res.status(403).json({ message: 'Не удалось создать событие.', e })
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
				if (team.isEventMember == 0) {
					team.isEventMember = 1
					event.members.push(team)
					await event.save()
					team.eventName = event.name
					await team.save()
					res.json({ message: "Команда успешно добавлена.", event })
				} else {
					res.status(400).json({ message: `Эта команда уже находится в событии ${event.name}` })
				}
			} else {
				res.status(200).json({ message: "Данный пользователь не является организатором этого мероприятия." })
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
				team.isEventMember = 0
				await team.save()
				res.json({ message: "Команда удалена.", team })
			}
			else {
				res.json({ message: "Данный пользователь не является организатором этого мероприятия." })
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

	async sendTask(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({ message: 'Не удалось зарегистрировать событие.', errors })
			}
			const { eventId } = req.params
			const { question, clue, answer } = req.body
			const candidate = await Event.findById(eventId)

			const task = new Task({ question, clue, answer })
			await task.save()
			if (!candidate) {
				res.status(400).json({ message: "Не сущесвует события с таким ID" })
			}
			candidate.questions.push(task)
			await candidate.save()
			res.status(200).json({ message: "Задание успешно выдано", task })
		} catch (e) {
			res.status(400).json({ message: "Ошибка при отправке вопроса" })
		}
	}

	async getEventById(req, res) {
		try {
			const { teamId } = req.params
			const team = await Team.findById(teamId)

			if (!team) {
				res.status(400).json({ message: "Комманды с таким ID не существует" })
			}

			if (team.eventName != "")
				res.status(200).json(team.eventName)
			else
				res.status(200).json({ message: "Эта команда пока не участвует в событиях." })
		} catch (e) {
			res.status(400).json({ message: "Не удалось получить данные об этой команде." })
		}
	}


	async getTimer(req, res) {
		try {
			const { eventId } = req.params

			const event = await Event.findById(eventId)

			if (!event) {
				res.status(400).json({ message: "Не существует события с таким ID" })
			}

			res.status(200).json({ "Начало события": event.start, "Конец события": event.end })
		} catch (e) {
			res.status(400).json({ message: "Не получилось получить данные о событии" })
		}
	}

	async pushPhoto(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({ message: 'Не удалось зарегистрировать событие.', errors })
			}
			const { photo } = req.body
			const { eventId } = req.params

			const event = await Event.findById(eventId)
			if (!event) {
				res.status(400).json({ message: "Не существует события с таким ID" })
			}

			event.photos.push(photo)
			await event.save()
			res.status(200).json({ message: `Фото ${photo} успешно добавлено в событие.` })
		} catch (e) {
			res.status(400).json({ message: "Не удалось добавить фото" })
		}
	}

	async getTeamRanked(req, res) {
		try {
			const { eventId } = req.params

			const event = await Event.findById(eventId)
			if (!event) {
				res.status(400).json({ message: "Не существует события с таким ID" })
			}

			let teams = []
			teams = event.members

			let teamIds = []
			teamIds = teams.map((x) => x._id);

			let allTeams = []
			for (let i = 0; i < teamIds.length; i++) {
				let temp = await Team.findById(teamIds[i])
				allTeams.push(temp)
			}
			allTeams.sort((a, b) => a.score < b.score ? 1 : -1)

			let sortedTeams = []

			for (let i = 0; i < allTeams.length; i++) {
				sortedTeams.push({ 'teamName': allTeams[i].teamName, 'score': allTeams[i].score })
			}
			res.status(200).json(sortedTeams)
		} catch (e) {
			res.status(400).json(e.message)
		}
	}
}

module.exports = new eventController();