function normalizeBoard(board) {
    const lists = {};
    const cards = {};

    const listOrder = board.listOrder || [];
    const boardLists = Array.isArray(board.lists) ? board.lists : [];

    const resolveList = (listRef) => {
        if (!listRef) return undefined;
        if (typeof listRef === 'string') return boardLists.find(l => l._id === listRef || l.id === listRef);
        return boardLists.find(l => l._id === (listRef._id || listRef.id)) || listRef;
    };

    listOrder.forEach((listRef) => {
        const listObj = resolveList(listRef);
        if (!listObj) {
            if (typeof listRef === 'object' && (listRef._id || listRef.id)) {
                const id = String(listRef._id || listRef.id);
                lists[id] = {
                    id,
                    title: listRef.title || '',
                    // ensure cardOrder is array of string IDs
                    cardOrder: (listRef.cardOrder || []).map(cr => (typeof cr === 'string' ? cr : String(cr._id || cr.id)))
                };
            }
            return;
        }

        const id = String(listObj._id || listObj.id);
        // ensure cardOrder is array of string IDs
        const normalizedCardOrder = (listObj.cardOrder || []).map(cr => (typeof cr === 'string' ? cr : String(cr._id || cr.id)));

        lists[id] = {
            id,
            title: listObj.title || '',
            cardOrder: normalizedCardOrder,
        };

        // sourceCards: prefer listObj.cards (objects) else fallback to boardLists lookup
        const sourceCards = Array.isArray(listObj.cards)
            ? listObj.cards
            : (boardLists.find(l => String(l._id || l.id) === id)?.cards || []);

        // populate cards map (keys are strings)
        (listObj.cardOrder || []).forEach((cardRef) => {
            const cardId = typeof cardRef === 'string' ? cardRef : (cardRef._id || cardRef.id);
            const card = (typeof cardRef === 'object' && (cardRef._id || cardRef.id))
                ? cardRef
                : (sourceCards || []).find(c => (c._id || c.id) === cardId);

            if (!card) return;

            const cid = String(card._id || card.id);
            cards[cid] = {
                id: cid,
                listId: id,
                title: card.title || '',
                description: card.description || '',
            };
        });
    });

    return {
        board: { id: board._id || board.id, listOrder: listOrder.map(l => (typeof l === 'string' ? l : (l._id || l.id))) },
        lists,
        cards,
    };
}

export default normalizeBoard;