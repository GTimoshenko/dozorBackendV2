const Router = require('express')
const controller = require('../controllers/eventController')
const router = new Router()
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const { check } = require("express-validator");

router.post('/new/:hostId', [
	check('name', "Название события не может быть пустым.").notEmpty(),
	check('description', "Описание не может быть пустым.").notEmpty(),
	check('start', "Поле начало события не может быть пустым.").notEmpty(),
	check('end', "Поле конец события не может быть пустым.").notEmpty()
], roleMiddleware(['vip', 'admin']), controller.createEvent)
router.post('/delete/:eventId', roleMiddleware(['vip', 'admin']), controller.deleteEvent)
router.post('/addteam/:eventId', check('teamName', 'Название команды не может быть пустым').notEmpty(), roleMiddleware(['vip', 'admin']), controller.addTeam)
router.post('/kickteam/:eventId', check('teamName', 'Название команды не может быть пустым').notEmpty(), roleMiddleware(['vip', 'admin']), controller.kickTeam)
router.post('/newtask/:eventId', [
	check('question', "Поле вопрос не может быть пустым").notEmpty(),
	check('answer', "Поле ответ не может быть пустым").notEmpty(),
	check('clue', "Поле подсказка не может быть пустым").notEmpty()
],
	controller.sendTask)
router.post('/pushphoto/:eventId', [
	check('photo', "Поле фото не может быть пустым").notEmpty()
], controller.pushPhoto)
router.get('/getranked/:eventId', controller.getTeamRanked)
router.get('/all', controller.getEvents)
router.get('/eventmembers/:eventId', controller.getEventMembers)
router.get('/event/:eventId', controller.getEvent)
router.get('/eventhost/:eventId', controller.getEventHost)
router.get('/get-event-by-id/:teamId', controller.getEventById)
router.get('/gettimer/:eventId', controller.getTimer)
module.exports = router;