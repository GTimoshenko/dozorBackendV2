const Router = require('express')
const controller = require('../controllers/authController')
const router = new Router()
const { check } = require('express-validator')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

router.post('/register', [
	check('name', "Имя пользователя не может быть пустым.").notEmpty(),
	check('name', 'Имя пользователя может состоять только из латинских букв и цифр.').isAlphanumeric(),
	check('password', "Пароль не может быть короче 4 и длиннее 12 символов.").isLength({ min: 4, max: 12 }),
	check('password', "Пароль может состоять только из латинских букв и цифр.").matches('[0-9a-zA-Z$!@#]')
], controller.userRegistration)
router.post('/login', controller.userLogin)
router.get('/users', roleMiddleware(['admin']), controller.getUsers)
router.get('/user/:userId', controller.getUser)
router.post('/user/resetpassword', [
	check('eMail', "Введите корректный eMail.").isEmail(),
	check('eMail', "Поле eMail не может быть пустым.").notEmpty(),
	check('name', 'Имя пользователя не может быть пустым.').notEmpty()
],
	controller.resetPassword)
router.post('/user/newpassword', [
	check('password1', "Пароль не может быть короче 4 и длиннее 12 символов.").isLength({ min: 4, max: 12 }),
	check('password2', "Пароль не может быть короче 4 и длиннее 12 символов.").isLength({ min: 4, max: 12 }),
	check('verificationCode', "Код подтверждения пользователя не может быть пустым.").notEmpty(),
	check('name', 'Имя пользователя не может быть пустым.').notEmpty()
],
	controller.createNewPassword)
router.get('/is-team-member/:userId', controller.isTeamMember)
router.put('/giverole/:userId', roleMiddleware(['admin']), controller.giveRole)
router.get('/get-team-by-id/:userId', controller.getTeamById)

module.exports = router;
