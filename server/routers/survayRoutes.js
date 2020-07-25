const express = require('express');
const handler = require('./../controllers/survayHandler');
const AuthHandler = require('./../controllers/authHandler');
const router = express.Router();


//all router realted survey

router.get('/', handler.allPolls);
router.post('/', AuthHandler.protect, handler.createPolls);
router.get('/:pollsId', handler.getPoll);
router.get('/mypolls', AuthHandler.protect, handler.getUserPolls);
router.delete('/:id', AuthHandler.protect, handler.deletePoll);
router.post('/:id', AuthHandler.protect, handler.vote);

module.exports = router;
