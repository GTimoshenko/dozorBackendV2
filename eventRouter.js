const Router = require('express')
const controller = require('./eventController')
const router = new Router()
const authMiddleware = require('./middleware/authMiddleware')
const roleMiddleware = require('./middleware/roleMiddleware')
const {check} = require("express-validator");

router.post('/new', [
    check('name', "Навзние события не может быть пустым.").notEmpty()
],roleMiddleware(['vip']),controller.createEvent)

module.exports = router;