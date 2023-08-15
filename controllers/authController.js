const User = require('../models/user')
const Role = require('../models/role')
const Team = require('../models/team')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const { secret } = require('../config')

const generateAccessToken = (id, roles) => {
	const payload = {
		id,
		roles
	}

	return jwt.sign(payload, secret, { expiresIn: "1h" })
}
class authController {

	async userRegistration(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({ message: "Ошибка при регистрации", errors })
			}
			const { name, password, avatarUrl } = req.body

			const candidate = await User.findOne({ name })
			if (candidate) {
				return res.status(400).json({ message: "Пользователь с таким именем уже существует." })
			}

			const hashPassword = bcrypt.hashSync(password, 6)
			const userRole = await Role.findOne({ value: "user" })
			const user = new User({ name, password: hashPassword, avatarUrl: avatarUrl, roles: [userRole.value] })
			await user.save()

			return res.json({
				message: "Пользователь зарегистрирован.",
				password,
				avatarUrl,
				name,
				roles: [userRole.value]
			})
		} catch (e) {
			console.log(e)
			res.status(400).json({ message: "Не удалось зарегистрировать пользователя." })
		}
	}

	async userLogin(req, res) {
		try {
			const { name, password } = req.body

			const candidate = await User.findOne({ name })
			if (!candidate) {
				return res.status(400).json({ message: `Пользователь с именем ${name} не найден.` })
			}

			const validPassword = bcrypt.compareSync(password, candidate.password)
			if (!validPassword) {
				return res.status(400).json({ message: 'Введен неверный пароль' })
			}

			const token = generateAccessToken(candidate._id, candidate.roles)

			const { avatarUrl } = candidate.avatarUrl

			return res.json({
				name,
				avatarUrl,
				id: candidate._id,
				token
			});
		} catch (e) {
			console.log(e)
			res.status(400).json({ message: "Не удалось войти в аккаунт." })
		}
	}

	async getUsers(req, res) {
		try {
			const users = await User.find()
			res.json(users)
		} catch (e) {
			console.log(e)
		}
	}
}

module.exports = new authController();