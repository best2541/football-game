const express = require('express')
const router = express.Router()
//controllers
const init = require('../controllers/init')
const game = require('../controllers/game')

router.post('/getuser', game.auth)
router.post('/getstart', init.init, game.getServerStatus, game.getSetting, game.getstart, init.sendData)
router.post('/save', init.init, game.save, init.sendData)
router.post('/getranking', init.init, game.getRanking, init.sendData)

module.exports = router