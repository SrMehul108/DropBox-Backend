const express = require('express');
const { getUsers, updateUser, deleteUser } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/users', authMiddleware, getUsers);
router.put('/users/:id', authMiddleware, updateUser);
router.delete('/users/:id', authMiddleware, deleteUser);


module.exports = router;

