const User = require('./models/user')
const Role = require('./models/role')
const Team = require('./models/team')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {validationResult} = require('express-validator')
const {secret} = require('./config')

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }

    return jwt.sign(payload, secret, {expiresIn: "1h"})
}
class authController {
    async userRegistration(req,res) {
        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({message: "Ошибка при регистрации", errors})
            }
            const {name, password} = req.body

            const candidate = await User.findOne({name})
            if(candidate) {
                return res.status(400).json({message: "Пользователь с таким именем уже существует."})
            }

            const hashPassword = bcrypt.hashSync(password, 6)
            const userRole = await Role.findOne({value: "user"})
            const user = new User ({name, password: hashPassword, roles: [userRole.value]})
            await user.save()

            return res.json({message: "Пользователь зарегистрирован."})
        } catch(e) {
            console.log(e)
            res.status(400).json({message: "Не удалось зарегистрировать пользователя."})
        }
    }

    async userLogin(req,res) {
        try {
            const {name, password} = req.body

            const candidate = await User.findOne({name})
            if(!candidate) {
                return res.status(400).json({message: `Пользователь с именем ${name} не найден`})
            }

            const validPassword = bcrypt.compareSync(password, candidate.password)
            if(!validPassword) {
                return res.status(400).json({message: 'Введен неверный пароль'})
            }

            const token = generateAccessToken(candidate._id, candidate.roles)
            return res.json({token})

        } catch(e) {
            console.log(e)
            res.status(400).json({message: "Не удалось войти в аккаунт."})
        }
    }

    async registerTeam(req,res) {
        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({message : "Не удалось зарегистрировать команду"}, errors)
            }

            const {teamName, password} = req.body
            const teamCandidate = await Team.findOne({teamName})
            if(teamCandidate){
                return res.status(400).json({message : "Команда с таким именем уже существует."})
            }

            const userRole = await Role.findOne({value: "captain"})
            const user = User({roles:[userRole.value]})
            await user.save()
            const team = new Team({teamName,password})

            await team.save()
            return res.json({message: "Команда зарегистрирована."})
        } catch(e) {
            console.log(e)
            res.status(400).json({message: "Не удалось зарегистрировать команду."})
        }
    }

    async getUsers(req,res) {
        try {
            const users = await User.find()
            res.json(users)
        } catch(e) {
            console.log(e)
        }
    }
}

module.exports = new authController();