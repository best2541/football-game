const express = require('express')
const router = express.Router()
//controllers
const init = require('../controllers/init')
const setting = require('../controllers/setting')
const verifyToken = require('../utilities/verifyToken')

router.post('/save', setting.save)
router.get('/get', verifyToken, init.init, setting.get, init.sendData)

module.exports = router