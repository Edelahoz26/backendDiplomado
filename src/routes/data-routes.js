const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth-middleware');
const dataController = require('../controllers/data-controller');

// Rutas básicas CRUD - Nota: Todas empiezan con /api/items
router.post('/items', authenticate, dataController.createItem);
router.get('/items', authenticate, dataController.getAllItems);
router.get('/items/:id', authenticate, dataController.getItem);
router.put('/items/:id', authenticate, dataController.updateItem);
router.delete('/items/:id', authenticate, dataController.deleteItem);
router.get('/items/search', authenticate, dataController.searchItems);

module.exports = router;
