const express = require('express')
const router = express.Router()
//controllers
const init = require('../controllers/init')
const setting = require('../controllers/setting')

router.get('/save', setting.save)

module.exports = router