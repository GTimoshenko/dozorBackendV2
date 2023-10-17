const Router = require('express')
const controller = require('../controllers/teamController')
const router = new Router()
const { check } = require('express-validator')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

router.post('/new/:capId', [
	check('teamName', "Название команды не может быть пустым.").notEmpty(),
	check('password', "Пароль не может быть короче 4 и длиннее 12 символов.").isLength({ min: 4, max: 12 })
], roleMiddleware(['user', 'admin', 'vip']), controller.registerTeam)
router.post('/delete/:teamId', controller.deleteTeam)
router.post('/invite/:memberId', [
	check('teamName', "Название команды не может быть пустым.").notEmpty(),
	check('password', "Пароль не может быть короче 4 и длиннее 12 символов.").isLength({ min: 4, max: 12 })
], controller.addTeamMember)
router.post('/kick/:memberId', controller.kickMember)
router.post('/sendanswer/:eventId', [
	check('answer', "Поле ответ не может быть пустым.").notEmpty()
], controller.sendAnswer)
router.post('/join/:capId', [
	check('eventName', "Поле название события не может быть пустым.").notEmpty()
], controller.joinEvent)
router.post('/leave/:userId', [
	check('teamName', "Поле название команды не может быть пустым.").notEmpty()
], controller.leaveTeam)
router.get('/get-task-winner/:taskId', controller.getQuestionWinner)
router.get('/all', controller.getTeams)
router.get('/team/:teamId', controller.getTeam)
router.get('/teamcap/:teamId', controller.getTeamCaptain)
router.get('/team-members/:teamId', controller.getTeamMembers)
router.get('/is-event-member/:teamId', controller.isEventMember)
module.exports = router;