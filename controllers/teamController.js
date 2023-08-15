const User = require('../models/user')
const Role = require('../models/role')
const Team = require('../models/team')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const { secret } = require('../config')
const mongoose = require('mongoose')

class teamController {
	async registerTeam(req, res) {
		try {
			const { capId } = req.params;
			const { teamName, password } = req.body

			const teamCandidate = await Team.findOne({ teamName })
			const capObj = await User.findById(capId);

			capObj.isTeamMember = 1;
			await capObj.save()
			if (teamCandidate) {
				return res.status(400).json({ message: "Команда с таким именем уже существует." })
			}

			const team = new Team({ teamName, password })
			team.captain = capObj;
			await team.save()
			res.json({ message: "Команда зарегистрирована.", team })
		} catch (e) {
			console.log(e)
			res.status(400).json({ message: "Не удалось зарегистрировать команду." })
		}
	}

	async addTeamMember(req, res) {
		try {
			const { memberId } = req.params
			const { teamName } = req.body

			const team = await Team.findOne({ teamName: teamName })
			const user = await User.findById(memberId);
			user.isTeamMember = 1;
			await user.save()

			if (!team) {
				res.json({ message: "Такой команды нет." })
			}

			team.member.push(user)
			await team.save()

			return res.json({ message: "Пользователь успешно добавлен в команду", team });
		} catch (e) {
			console.log(e);
			res.status(400).json({ message: "Не удалось присоединиться к команде." })
		}
	}

	async deleteTeam(req, res) {
		try {
			const { capId, teamId } = req.params


			const team = await Team.findById(teamId)
			const capCandidate = await User.findById(capId);

			if (!team) {
				return res.json({ message: "Такой команды нет." })
			}
			if (capCandidate.name === team.captain.name) {
				capCandidate.isTeamMember = 0
				await capCandidate.save()

				await Team.deleteOne(team)
				res.status(200).json({ message: "Команда удалена." })
			}
			else {
				res.json([capCandidate.name, team.captain.name])
			}
		} catch (e) {
			console.log(e);
			res.status(400).json({ message: "Не удалось удалить команду." })
		}
	}

	async kickMember(req, res) {
		try {
			const { capId, teamId, memberId } = req.params

			const memberCandidate = await User.findById(memberId)
			const capCandidate = await User.findById(capId)
			const team = await Team.findById(teamId)

			if (team.captain.name === capCandidate.name) {
				if (memberCandidate.name != capCandidate.name) {
					const memberIndex = team.member.findIndex((memberCandidate) => memberCandidate._id.toString() === memberId)
					team.member.splice(memberIndex, 1)
					await team.save()

					memberCandidate.isTeamMember = 0
					await memberCandidate.save()
					return res.status(200).json({ message: "Пользователь выгнан." })
				}
			}
			res.json({ message: "Не удалось выгнать игрока." })

		} catch (e) {
			console.log(e)
			res.status(400).json({ message: "Не удалось выгнать игрока." })
		}
	}
}
module.exports = new teamController();