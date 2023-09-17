const Router = require('express')
const controller = require('../controllers/eventController')
const router = new Router()
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const { check } = require("express-validator");

router.post('/new/:hostId', [
	check('name', "Название события не может быть пустым.").notEmpty(),
	check('description', "Описание не может быть пустым.").notEmpty()
], roleMiddleware(['vip', 'admin']), controller.createEvent)
router.post('/delete/:eventId', roleMiddleware(['vip', 'admin']), controller.deleteEvent)
router.post('/addteam/:eventId', roleMiddleware(['vip', 'admin']), controller.addTeam)
router.post('/kickteam/:eventId', roleMiddleware(['vip', 'admin']), controller.kickTeam)
router.post('/newtask/:eventId', controller.sendTask)
router.get('/all', controller.getEvents)
router.get('/eventmembers/:eventId', controller.getEventMembers)
router.get('/event/:eventId', controller.getEvent)
router.get('/eventhost/:eventId', controller.getEventHost)
module.exports = router;