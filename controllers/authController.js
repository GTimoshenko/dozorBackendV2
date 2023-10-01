const User = require('../models/user')
const Role = require('../models/role')
const Team = require('../models/team')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const { secret } = require('../config')
const nodemailer = require('nodemailer')
const google = require('googleapis')
const config = require('./mailerConfig')
const otpGenerator = require('otp-generator')



const OAuth2 = google.Auth.OAuth2Client
const OAuth2_client = new OAuth2(config.clientId, config.clientSecret)
OAuth2_client.setCredentials({ refresh_token: config.refreshToken })

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
			const { name, password, avatarUrl, eMail } = req.body

			const candidate = await User.findOne({ name })
			if (candidate) {
				return res.status(400).json({ message: "Пользователь с таким именем уже существует." })
			}

			const hashPassword = bcrypt.hashSync(password, 6)
			const userRole = await Role.findOne({ value: "user" })
			const user = new User({ name, password: hashPassword, avatarUrl: avatarUrl, eMail, roles: [userRole.value] })
			await user.save()

			const token = generateAccessToken(user._id, user.roles)
			return res.json({
				message: "Пользователь зарегистрирован.",
				password,
				avatarUrl,
				name,
				eMail,
				id: user._id,
				token,
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

	async getUser(req, res) {
		try {
			const { userId } = req.params

			const candidate = await User.findById(userId)

			if (!candidate) {
				return res.json({ message: "Пользователя с таким id не существует" })
			}

			res.json(candidate)
		} catch (e) {
			console.log(e)
			res.status(400).json({ message: "Ошибка получения данных о пользователе" })
		}
	}

	async resetPassword(req, res) {
		try {

			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({ message: "Ошибка при восстановлении пароля.", errors })
			}

			const { eMail } = req.body
			const { userId } = req.params

			const user = await User.findById(userId)

			if (!user) {
				res.status(404).json({ message: `Пользователя с ID ${userId} не существует` });
			}

			const accessToken = OAuth2_client.getAccessToken()

			const transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					type: 'OAuth2',
					user: config.user,
					clientId: config.clientId,
					clientSecret: config.clientSecret,
					refreshToken: config.refreshToken,
					accessToken: accessToken
				}
			})

			const otp = otpGenerator.generate(6, {
				upperCaseAlphabets: false,
				specialChars: false,
			});
			const mailOptions = {
				from: `Поддержка DOZOR PROJECT <${config.user}>`,
				to: eMail,
				subject: 'Восстановление пароля',
				html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Код для восстановления пароля</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        h1 {
            color: #333;
        }
        p {
            color: #777;
        }
        .code {
            font-size: 24px;
            margin: 20px 0;
            padding: 10px;
            background-color: #eee;
            text-align: center;
        }
        footer {
            text-align: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Код для восстановления пароля</h1>
        <p>Вы запросили восстановление пароля для приложения "Ночной дозор". Ваш код подтверждения:</p>
        <div class="code">${otp}</div>
        <p>Этот код работает только один раз.</p>
        <footer>
            <p>&copy; 2023 DOZOR PROJECT</p>
        </footer>
    </div>
</body>
</html>
`
			}

			user.verificationCode = otp
			await user.save()

			transporter.sendMail(mailOptions, function (e, res) {
				if (e) {
					console.log(e)
				} else {
					console.log(res)
				}
				transporter.close()
			})

			res.status(200).json({ message: "Письмо отправлено", eMail, otp });
		} catch (e) {
			console.log(e);
			res.status(400).json({ message: "Не получилось восстановить пароль." })
		}
	}

	async createNewPassword(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({ message: "Ошибка при создании нового пароля", errors })
			}
			const { userId } = req.params
			const { verificationCode, password1, password2 } = req.body

			if (password1 != password2) {
				res.status(400).json({ message: 'Пароли не совпадают.' })
			}

			const user = await User.findById(userId)

			if (!user) {
				res.status(404).json({ message: `Пользователя с ID ${userId} не существует` });
			}

			if (verificationCode != user.verificationCode) {
				res.status(402).json({ message: 'Неправильный код подтверждения.' })
			}
			else {
				const hashPassword = bcrypt.hashSync(password1, 6)
				user.password = hashPassword
				user.verificationCode = ""
				await user.save()
				res.status(200).json({ message: 'Вы успешно установили новый пароль.' })
			}
		} catch (e) {
			res.status(400).json({ message: 'Ошибка создания нового пароля.', e })
		}
	}

	async isTeamMember(req, res) {
		try {
			const { userId } = req.params;

			const candidate = await User.findById(userId)

			if (!candidate) {
				res.status(400).json({ message: "Пользователя с этим ID не существует." })
			}
			if (candidate.teamName != "") {
				const teamCandidate = await Team.findOne({ teamName: candidate.teamName })
				if (teamCandidate) {
					res.status(200).json(teamCandidate._id)
				} else {
					res.status(400).json({ message: "Такой команды не существует." })
				}
			} else {
				res.status(200).json({ message: "Пользователь не состоит в комманде." })
			}
		} catch (e) {
			res.status(400).json({ message: "Ошибка при получении сведений о команде", e })
		}
	}
	async giveRole(req, res) {
		try {
			const { userId } = req.params
			const { role } = req.body

			const candidate = await User.findById(userId)
			if (!candidate) {
				res.status(400).json({ message: "Пользователя с таким ID не существует." })
			}

			candidate.roles = role;
			await candidate.save()
			res.status(200).json({ message: `Роль ${role} выдана` })
		} catch (e) {
			res.status(400).json({ message: "Не удалось выдать привилегию", e })
		}
	}

	async getTeamById(req,res) {
		try {
			const {userId} = req.params;
			const user = await User.findById(userId)

			if(!user) {
				res.status(400).json({message : "Пользователя с таким ID не существует."})
			}

			if(user.teamName!=""){
			const team = await Team.findOne({teamName : user.teamName})

			if(!team) {
				res.status(400).json({message : "Команды с таким названием не существует."})
			}

			res.status(200).json(team);
		}
			else
			res.status(200).json({message : "Этот пользователь пока не находится ни в какой команде.z"}) 
		} catch(e) {
			res.status(400).json({message : "Ошибка при получении данных о команде игрока."})
		}
	}
}

module.exports = new authController();
