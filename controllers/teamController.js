const User = require('../models/user')
const Role = require('../models/role')
const Team = require('../models/team')
const Task = require('../models/task')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const { secret } = require('../config')
const mongoose = require('mongoose')
const Event = require('../models/event')

class teamController {
	async registerTeam(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({ message: "Ошибка при создании команды.", errors })
			}
			const { capId } = req.params;
			const { teamName, password } = req.body

			const teamCandidate = await Team.findOne({ teamName })
			const capObj = await User.findById(capId);
			if (capObj.teamName == "") {
				capObj.teamName = teamName;
				capObj.isTeamMember = 1
				await capObj.save()
				if (teamCandidate) {
					return res.status(400).json({ message: "Команда с таким именем уже существует." })
				}

				const team = new Team({ teamName, password })
				team.captain = capObj;
				await team.save()
				res.json({ message: "Команда зарегистрирована.", team })
			} else {
				return res.status(200).json({ message: "Вы уже находитесь в команде." })
			}
		} catch (e) {
			console.log(e)
			res.status(400).json({ message: "Не удалось зарегистрировать команду." })
		}
	}

	async addTeamMember(req, res) {
		try {
			const { memberId } = req.params
			const { teamName, password } = req.body

			const team = await Team.findOne({ teamName: teamName })
			const user = await User.findById(memberId);

			if (!team) {
				res.json({ message: "Такой команды нет." })
			}

			if (team.password === password) {
				if (user.isTeamMember == 0) {
					user.isTeamMember = 1
					team.members.push(user)
					await team.save()
					user.teamName = team.teamName;
					await user.save()
					return res.json({ message: "Пользователь успешно добавлен в команду", team });
				} else {
					return res.status(400).json({ message: `Этот пользователь уже находится в команде ${user.teamName}` })
				}
			} else {
				return res.status(200).json({ message: "Неверный пароль.", password });
			}
		} catch (e) {
			console.log(e);
			res.status(400).json({ message: "Не удалось присоединиться к команде." })
		}
	}

	async deleteTeam(req, res) {
		try {
			const { teamId } = req.params
			const { capId } = req.body

			const team = await Team.findById(teamId)
			const capCandidate = await User.findById(capId);

			if (!team) {
				return res.json({ message: "Такой команды нет." })
			}
			if (capCandidate.name === team.captain.name) {
				capCandidate.teamName = ""
				await capCandidate.save()

				await Team.deleteOne(team)
				res.status(200).json({ message: "Команда удалена." })
			}
			else {
				res.status(400).json({ message: "Вы должны быть капитаном, чтобы удалить команду." })
			}
		} catch (e) {
			console.log(e);
			res.status(400).json({ message: "Не удалось удалить команду." })
		}
	}

	async kickMember(req, res) {
		try {
			const { memberId } = req.params
			const { capId, teamId } = req.body

			const memberCandidate = await User.findById(memberId)
			const capCandidate = await User.findById(capId)
			const team = await Team.findById(teamId)

			if (team.captain.name === capCandidate.name) {
				if (memberCandidate.name != capCandidate.name) {
					const memberIndex = team.members.findIndex((memberCandidate) => memberCandidate._id.toString() === memberId)
					team.members.splice(memberIndex, 1)
					await team.save()

					memberCandidate.teamName = ""
					await memberCandidate.save()
					return res.status(200).json({ message: "Пользователь выгнан." })
				}
			}
			res.status(400).json({ message: "Вы должны быть капитаном, чтобы выгнать игрока." })

		} catch (e) {
			console.log(e)
			res.status(400).json({ message: "Не удалось выгнать игрока." })
		}
	}

	async getTeams(req, res) {
		try {
			const teams = await Team.find()
			return res.json(teams)
		} catch (e) {
			console.log(e)
			return res.json({ message: "Не удалось получить список комманд." })
		}
	}

	async getTeam(req, res) {
		try {
			const { teamId } = req.params

			const candidate = await Team.findById(teamId)

			if (!candidate) {
				return res.status(400).json({ message: "Команды с таким ID не существует" })
			}

			res.status(200).json(candidate)
		} catch (e) {
			console.log(e)
			return res.json({ message: "Не удалось получить данные об этой команде." })
		}
	}

	async getTeamCaptain(req, res) {
		try {
			const { teamId } = req.params

			const candidate = await Team.findById(teamId)

			if (!candidate) {
				return res.json({ message: "Комманды с таким ID не существует" })
			}

			res.status(200).json(candidate.captain)
		} catch (e) {
			console.log(e)
			res.status(400).json({ message: "Не удалось получить капитана команды." })
		}
	}

	async getTeamMembers(req, res) {
		try {
			const { teamId } = req.params

			const candidate = await Team.findById(teamId)

			if (!candidate) {
				res.status(400).json({ message: "Команды с таким ID не существует." })
			}

			res.status(200).json(candidate.members)
		} catch (e) {
			console.log(e)
			res.status(400).json({ message: "Не удалось получить участников команды." })
		}
	}

	async isEventMember(req, res) {
		try {
			const { teamId } = req.params;

			const candidate = await Team.findById(teamId)

			if (!candidate) {
				res.status(400).json({ message: "Команды с этим ID не существует." })
			}
			console.log(candidate.eventName)
			if (candidate.eventName != "") {
				const eventCandidate = await Event.findOne({ name: candidate.eventName })

				if (eventCandidate) {
					res.status(200).json(eventCandidate._id)
				} else {
					res.status(400).json({ message: "События с таким ID не существует" })
				}
			} else {
				res.status(200).json({ message: "Эта команда пока не участвует ни в каких событиях." })
			}

		} catch (e) {
			res.status(400).json({ message: "Ошибка при получении данных о событии", e })
		}
	}

	async sendAnswer(req, res) {
		try {
			const { eventId } = req.params
			const { answer, taskId, teamId } = req.body

			const candidate = await Event.findById(eventId)
			const team = await Team.findById(teamId)
			const task = await Task.findById(taskId)
			if (!candidate) {
				res.status(400).json({ message: "События с этим ID не существует." })
			}
			if (task.answer == answer) {
				task.winner = team.teamName
				await task.save()
				await candidate.save()
				team.score++
				res.status(200).json({ message: "Правильный ответ." })
			} else {
				res.status(200).json({ message: "Неправильный ответ." })
			}
		} catch (e) {
			res.status(400).json(e.message)
		}
	}

	async getQuestionWinner(req, res) {
		try {
			const { taskId } = req.params
			const task = await Task.findById(taskId)
			if (!task) {
				res.status(400).json({ message: "Вопроса с таким ID не существует" })
			}

			res.status(200).json({ message: `Победитель в вопросе - команда ${task.winner}` })
		} catch (e) {
			res.status(400).json({ message: "Ошибка при получении данных о победителе в вопросе.", e })
		}
	}

}
module.exports = new teamController();