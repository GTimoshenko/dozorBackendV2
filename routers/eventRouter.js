const Router = require('express')
const controller = require('../controllers/eventController')
const router = new Router()
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const { check } = require("express-validator");

router.post('/new', [
	check('name', "Название события не может быть пустым.").notEmpty()
], roleMiddleware(['vip', 'admin']), controller.createEvent)
router.get('/', roleMiddleware(['user', 'admin', 'vip']), controller.getEvents)

module.exports = router;