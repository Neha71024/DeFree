const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');

router.post('/request', connectionController.sendRequest);
router.post('/accept/:connectionId', connectionController.acceptRequest);
router.post('/reject/:connectionId', connectionController.rejectRequest);
router.get('/:userId', connectionController.getUserConnections);

module.exports = router;
