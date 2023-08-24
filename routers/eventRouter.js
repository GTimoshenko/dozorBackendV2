const Router = require('express')
const controller = require('../controllers/eventController')
const router = new Router()
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const { check } = require("express-validator");

router.post('/:hostId', [
	check('name', "Название события не может быть пустым.").notEmpty()
], roleMiddleware(['vip', 'admin']), controller.createEvent)
router.post('/:hostId/delete/:eventId', controller.deleteEvent)
router.post('/:hostId/:eventId/add/:teamId', controller.addTeam)
router.post('/:hostId/:eventId/kickteam/:teamId', controller.kickTeam)
router.get('/all', roleMiddleware(['user', 'admin', 'vip']), controller.getEvents)
router.get('/eventmembers/:eventId', controller.getEventMembers)
router.get('/event/:eventId', controller.getEvent)
module.exports = router;