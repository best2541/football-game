const express = require('express')
const router = express.Router()
const dashboard = require('../controllers/dashboard')
const verifyToken = require('../utilities/verifyToken')
const init = require('../controllers/init')

router.post('/login', dashboard.auth)
router.get('/logintest', verifyToken, dashboard.test)
router.get('/profile', verifyToken, init.init, dashboard.getProfile, init.sendData)
router.get('/getDashboard', init.init, dashboard.getDashboard, init.sendData)
router.get('/getDashboardTable', init.init, dashboard.getTable, init.sendData)
router.get('/ranking', init.init, dashboard.getReport, init.sendData)
router.get('/ranking/:id', init.init, dashboard.getReportByID, init.sendData)
module.exports = router