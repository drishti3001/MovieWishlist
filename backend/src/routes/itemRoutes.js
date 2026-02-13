const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createItem, getItems, updateItem, deleteItem } = require('../controllers/itemController');

const router = express.Router();

router.post('/items', authMiddleware, createItem);
router.get('/items', authMiddleware, getItems);
router.put('/items/:id', authMiddleware, updateItem);
router.delete('/items/:id', authMiddleware, deleteItem);

module.exports = router;

