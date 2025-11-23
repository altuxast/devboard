const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const{
    createBoard,
    getBoards,
    getBoard,
    updateBoard,
    deleteBoard
} = require('../controllers/boardController');

router.use(authMiddleware);
router.post('/', createBoard);
router.get('/', getBoards);
router.get('/:id', getBoard);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

module.exports = router;