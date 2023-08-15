const Router = require('express')
const controller = require('../controllers/teamController')
const router = new Router()
const { check } = require('express-validator')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

router.post('/:capId', [
	check('teamName', "Название команды не может быть пустым.").notEmpty(),
	check('password', "Пароль не может быть короче 4 и длиннее 12 символов.").isLength({ min: 4, max: 12 })
], roleMiddleware(['user', 'admin', 'vip']), controller.registerTeam)
router.post('/invite/:memberId', controller.addTeamMember)
router.post('/:teamId/delete/:capId', controller.deleteTeam)
router.post('/:capId/:teamId/kickmember/:memberId', controller.kickMember)
module.exports = router;