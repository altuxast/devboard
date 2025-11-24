const React = require('react');
const { useState, useEffect } = require('react');
const { DragDropContext, Droppable, Draggable } = require('react-beautiful-dnd');
const normalizeBoard = require('../utils/normalizeBoard');
const api = require('../api');

const Board = ({ boardId }) => {
    const [board, setBoard] = useState({ id: '', listOrder: [] });
    const [lists, setLists] = useState({});
    const [cards, setCards] = useState({});

    useEffect(() => {
        const fetchBoard = async () => {
            try {
                const res = await api.get(`/boards/${boardId}`);
                const normalized = normalizeBoard(res.data);
                setBoard(normalized.board);
                setLists(normalized.lists);
                setCards(normalized.cards);
            } catch (err) {
                console.error('Failed to fetch board:', err);
            }
        };
        fetchBoard();
    }, [boardId]);

    const updateListLocally = (listId, newCardOrder) => {
        setLists(prev => ({
            ...prev,
            [listId]: {
                ...prev[listId],
                cardOrder: newCardOrder
            }
        }));
    };

    const updateTwoListsLocally = (sourceId, sourceOrder, destId, destOrder) => {
        setLists(prev => ({
            ...prev,
            [sourceId]: { ...prev[sourceId], cardOrder: sourceOrder },
            [destId]: { ...prev[destId], cardOrder: destOrder }
        }));
    };

    const onDragEnd = async (result) => {
        const { source, destination, draggableId, type } = result;
        if (!destination) return;

        // Reorder lists
        if (type === 'LIST') {
            const newOrder = Array.from(board.listOrder);
            newOrder.splice(source.index, 1);
            newOrder.splice(destination.index, 0, draggableId);

            setBoard({ ...board, listOrder: newOrder });
            await api.patch(`/boards/${board.id}/reorder-lists`, { listOrder: newOrder });
            return;
        }

        // Dragging cards
        const sourceList = lists[source.droppableId];
        const destList = lists[destination.droppableId];
        const isSameList = sourceList.id === destList.id;

        if (isSameList) {
            const newOrder = Array.from(sourceList.cardOrder);
            newOrder.splice(source.index, 1);
            newOrder.splice(destination.index, 0, draggableId);

            updateListLocally(sourceList.id, newOrder);
            await api.patch(`/lists/${sourceList.id}/reorder-cards`, { cardOrder: newOrder });
        } else {
            const sourceOrder = Array.from(sourceList.cardOrder);
            const destOrder = Array.from(destList.cardOrder);

            sourceOrder.splice(source.index, 1);
            destOrder.splice(destination.index, 0, draggableId);

            updateTwoListsLocally(sourceList.id, sourceOrder, destList.id, destOrder);

            await api.patch(`/cards/${draggableId}/move`, {
                sourceListId: sourceList.id,
                destListId: destList.id,
                sourceCardOrder: sourceOrder,
                destCardOrder: destOrder
            });
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="board" direction="horizontal" type="LIST">
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: 'flex', gap: '8px' }}>
                        {board.listOrder.map((listId, index) => {
                            const list = lists[listId];
                            return (
                                <Draggable key={list.id} draggableId={list.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            style={{
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                padding: '8px',
                                                minWidth: '200px',
                                                backgroundColor: '#f4f5f7',
                                                ...provided.draggableProps.style
                                            }}
                                        >
                                            <h4 {...provided.dragHandleProps}>{list.title}</h4>
                                            <Droppable droppableId={list.id} type="CARD">
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: '50px' }}>
                                                        {list.cardOrder.map((cardId, idx) => {
                                                            const card = cards[cardId];
                                                            return (
                                                                <Draggable key={card.id} draggableId={card.id} index={idx}>
                                                                    {(provided) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            style={{
                                                                                padding: '8px',
                                                                                margin: '4px 0',
                                                                                backgroundColor: '#fff',
                                                                                border: '1px solid #ccc',
                                                                                borderRadius: '3px',
                                                                                ...provided.draggableProps.style
                                                                            }}
                                                                        >
                                                                            {card.title}
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            );
                                                        })}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </div>
                                    )}
                                </Draggable>
                            );
                        })}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

module.exports = Board;
