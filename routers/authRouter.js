const Router = require('express')
const controller = require('../controllers/authController')
const router = new Router()
const { check } = require('express-validator')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

router.post('/register', [
	check('name', "Имя пользователя не может быть пустым.").notEmpty(),
	check('password', "Пароль не может быть короче 4 и длиннее 12 символов.").isLength({ min: 4, max: 12 })
], controller.userRegistration)
router.post('/login', controller.userLogin)
router.get('/users', roleMiddleware(['admin']), controller.getUsers)

module.exports = router;
