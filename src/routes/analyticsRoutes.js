const express = require('express')
const router = express.Router()
const analyticsController = require('../controllers/analyticsController');

router.get('/productanalytics', analyticsController.productAnalytics)
router.get('/customeranalytics', analyticsController.customerAnalytics)
router.get('/expencesanalytics', analyticsController.expencesAnalytics)

module.exports = router