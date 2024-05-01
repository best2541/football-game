const express = require('express')
const router = express.Router()
//controllers
const init = require('../controllers/init')
const game = require('../controllers/game')

router.post('/getuser', game.auth)
router.get('/getstart', init.init, game.getServerStatus, game.getstart, init.sendData)
router.post('/save', init.init, game.save, init.sendData)
router.get('/getranking', init.init, game.getRanking, init.sendData)

module.exports = router