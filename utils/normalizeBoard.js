/**
 * Converts a nested board object (with lists and cards) 
 * into a normalized structure suitable for frontend drag-and-drop state.
 *
 * @param {Object} board - The nested board object from backend
 * @returns {Object} - Normalized board, lists, and cards
 */

function normalizeBoard(board) {
    const lists = {};
    const cards = {};

    if (!board.lists) {
        return {
            board: { id: board._id, listOrder: board.listOrder || [] },
            lists,
            cards,
        };
    }

    board.lists.forEach((list) => {
        lists[list._id] = {
            id: list._id,
            title: list.title,
            cardOrder: list.cardOrder || [],
        };

        if(list.cards){
            list.cards.forEach((card) => {
                cards[card._id] = {
                    id: card._id,
                    listId: list._id,
                    title: card.title,
                    description: card.description,
                };
            });
        }
    });

    return {
        board: { id: board._id, listOrder: board.listOrder || [] },
        lists,
        cards,
    };
}

module.exports = normalizeBoard;