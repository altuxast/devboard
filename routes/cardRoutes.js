const express = require('express');
const router = express.Router();
const {
    createCard,
    getCards,
    updateCard,
    deleteCard
} = require('../controllers/cardController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);
router.post('/', createCard);
router.get('/:listId', getCards);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

module.exports = router;