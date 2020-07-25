const express = require('express');
const authController = require('./../controllers/authHandler');
const userController = require('./../controllers/userHandler');
const router = express.Router();

//all routes related to user and authrization
router.route('/signup').post(authController.signUp);
router.route('/login').get(authController.login);
router.route('/sendEmailVerification').post(authController.emailVerificationCode);
router.route('/verifyEmail').post(authController.verifyEmail);
// router.route('/me').get(userController.getUser).post(userController.updateUser).delete(userController.deleteUser);
router.get('/users', userController.getAllUsers);
router.get('/me', authController.protect, userController.getUser);
router.patch('/me', authController.protect, userController.updateUser);
router.delete('/me', authController.protect, userController.deleteUser);


module.exports = router;
