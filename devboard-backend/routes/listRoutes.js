const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
    createList,
    getLists,
    updateList,
    deleteList,
    reorderCards
} = require('../controllers/listController');

router.use(authMiddleware);
router.post('/', createList);
router.get('/:boardId', getLists);
router.put('/:id', updateList);
router.delete('/:id', deleteList);

router.patch("/:listId/reorder-cards", reorderCards);

module.exports = router;