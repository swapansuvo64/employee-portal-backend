// router/client.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client');
const authMiddleware = require('../middleware/authMiddleware');
router.get('/',authMiddleware.authenticate, clientController.getAllClients);

router.post('/',authMiddleware.authenticate, clientController.createClient);
router.put('/:id',authMiddleware.authenticate, clientController.updateClient);
router.delete('/:id',authMiddleware.authenticate, clientController.deleteClient);

module.exports = router;
