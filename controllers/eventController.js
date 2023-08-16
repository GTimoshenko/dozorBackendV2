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

			const { name, description } = req.body
			const {hostId} = req.params

			const eventCandidate = await Event.findOne()
			const host = await User.findById(hostId)
			if (eventCandidate) {
				return res.status(400).json({ message: 'Событие с таким именем уже существует.' })
			}

			const event = new Event({ name, description })
			event.host = host
			await event.save()
			res.json({message: "Событие создано.", event})
		} catch (e) {
			console.log(e)
			return res.status(403).json({ message: 'Не удалось создать событие.' })
		}
	}

	async deleteEvent(req,res){
		try{
			const {hostId, eventId} = req.params

			const host = await User.findById(hostId)
			const event = await Event.findById(eventId)

			if(host.name === event.host.name){
				await Event.deleteOne(event)
				res.json({message:"Событие удалено."})
			}
		} catch(e) {
			console.log(e)
			res.status(400).json({message:"Не удалось удалить событие."})
		}
	}

	async addTeam(req,res) {
		try {
			const{hostId, eventId, teamId} = req.params

			const host = await User.findById(hostId)
			const event = await Event.findById(eventId)
			const team = await Team.findById(teamId)

			if(host.name === event.host.name){
				event.members.push(team)
				await event.save()
				team.isInEvent = 1
				await team.save()
				res.json({message:"Команда успешно добавлена.", event})
			}
		} catch(e) {
			console.log(e)
			res.status(400).json({message:"Не удалось добавить команду."})
		}
	}

	async kickTeam(req,res) {
		try{
			const {hostId, eventId, teamId} = req.params

			const host = await User.findById(hostId)
			const event = await Event.findById(eventId)
			const team = await Team.findById(teamId)

			if(host.name === event.host.name) {
				const teamIndex = event.members.findIndex((team) => team._id.toString() === teamId)
					event.members.splice(teamIndex, 1)

					await event.save()
				team.isinEvent = 0
				await team.save()
				res.json({message: "Команда удалена.", team})
			}
		} catch(e) {
			console.log(e)
			res.status(400).json({message:"Не удалось удалить команду."})
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