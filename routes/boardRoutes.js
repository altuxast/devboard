const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const{
    createBoard,
    getBoards,
    getBoard,
    updateBoard,
    deleteBoard,
    reorderLists
} = require('../controllers/boardController');

router.use(authMiddleware);
router.post('/', createBoard);
router.get('/', getBoards);
router.get('/:id', getBoard);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

// PATCH /boards/:id/reorder-lists
router.patch('/:id/reorder-lists', reorderLists);

module.exports = router;