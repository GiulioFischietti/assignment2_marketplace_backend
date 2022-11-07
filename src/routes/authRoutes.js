const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController');


router.post('/signupasamanager', authController.signUpAsManager)
router.post('/loginasmanager', authController.logInAsManager)

router.post('/signup', authController.signUp)
router.post('/login', authController.logIn)

router.post('/updateuser', authController.updateCustomer)

module.exports = router