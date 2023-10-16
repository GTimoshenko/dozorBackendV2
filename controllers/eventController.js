const { createCheckSchema } = require('express-validator/src/middlewares/schema')
const Event = require('../models/event')
const User = require('../models/user')
const Team = require('../models/team')
const Task = require('../models/task')
const Timer = require('../models/timer')
const { validationResult } = require('express-validator')

class eventController {
	async createEvent(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({ message: 'Не удалось зарегистрировать событие.', errors })
			}

			const { name, description } = req.body
			const { hostId } = req.params

			const eventCandidate = await Event.findOne({ name })
			const host = await User.findById(hostId)
			if (eventCandidate) {
				return res.status(400).json({ message: 'У вас уже есть активное событие.' })
			}

			const event = new Event({ name, description, })
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
			res.status(400).json({ message: "Ошибка при отправке вопроса", e })
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

	async setTimer(req, res) {
		try {
			const { hr, min, sec, day, yr, mnt } = req.body
			const { eventId } = req.params
			const timer = new Timer({ hr, min, sec, day, yr, mnt })
			await timer.save()
			const event = await Event.findById(eventId)

			if (!event) {
				res.status(400).json({ message: "Не существует события с таким ID" })
			}

			event.timer = timer
			await event.save()
			res.status(200).json(event.timer)

		} catch (e) {
			res.status(400).json(e.message)
		}
	}

	async getTimer(req, res) {
		try {
			const { eventId } = req.params

			const event = await Event.findById(eventId)

			if (!event) {
				res.status(400).json({ message: "Не существует события с таким ID" })
			}

			const timer = await Timer.findById(event.timer)
			if (!timer) {
				res.status(400).json({ message: "У события не установлен таймер" })
			}

			res.status(200).json(timer)
		} catch (e) {
			res.status(400).json({ message: "Не получилось получить данные о событии" })
		}
	}

	async pushPhoto(req, res) {
		try {
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

	async getTeamRanked(req,res) {
		try {
			const {eventId} = req.params

			const event = await Event.findById(eventId)
			if(!event) {
				res.json({message : "Не удалось найти"})
			}

			let a = []
			a = event.members

			let arr = []
			arr = a.map((x)=> x._id);

			let tempArr = []
			for(let i = 0 ; i < arr.length; i++) {
				let temp = await Team.findById(arr[i])
				tempArr.push(temp)
			}
			tempArr.sort((a,b)=>a.score < b.score ? 1 : -1)

			let resArr = []

			for(let i = 0 ; i < tempArr.length; i++) {
				resArr.push({'teamName': tempArr[i].teamName, 'score': tempArr[i].score})
			}
			res.json(resArr)
		} catch(e) {
			res.status(400).json(e.message)
		}
	}
}

module.exports = new eventController();