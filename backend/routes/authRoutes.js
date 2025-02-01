const express = require('express');
const { register, login, createUser, logout, getUsers, updateUser, deleteUser } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/create-user', authMiddleware, createUser);
router.post('/logout', authMiddleware, logout);


module.exports = router;
