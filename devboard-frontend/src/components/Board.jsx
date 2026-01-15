import React from 'react';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import normalizeBoard from '../utils/normalizeBoard.js';
import api from '../api';

import List from './List.jsx';

/**
 * @typedef {Object} Board
 * @property {string} id
 * @property {string} title
 * @property {string[]} listOrder
 */

/**
 * @typedef {Object} List
 * @property {string} id
 * @property {string} title
 * @property {string[]} cardOrder
 */

/**
 * @typedef {Object} Card
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} listId
 */

const Board = ({ boardId }) => {
    const [board, setBoard] = useState({ id: '', listOrder: [] });
    const [lists, setLists] = useState({});
    const [cards, setCards] = useState({});
    const [renderKey] = useState(0);
    const [addingList, setAddingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');

    const fetchBoard = async () => {
        try {
            const res = await api.get(`/boards/${boardId}`);
            console.log("API Response Data:", res.data); // Log the response to check structure
            const normalized = normalizeBoard(res.data);
            console.log("Normalized Board:", normalized); // Log the normalized data
            setBoard(normalized.board);
            setLists(normalized.lists);
            setCards(normalized.cards);

            console.log("Board State:", normalized.board);
            console.log("Lists State:", normalized.lists);
            console.log("Cards State:", normalized.cards);
        } catch (err) {
            console.error('Failed to fetch board:', err);
        }
    };

    // Handle Lists
    const handleCreateList = async (title) => {
        try {
            await api.post('/lists', {
                title,
                boardId: board.id,
            });

            await fetchBoard();

        } catch (err) {
            console.error('Create list failed', err);
        }
    };

    const handleUpdateList = async (listId, data) => {
        const prev = lists;

        setLists(prev => ({
            ...prev,
            [listId]: {
                ...prev[listId],
                ...data
            }
        }));

        try {
            const res = await api.put(`/lists/${listId}`, data);

            setLists(prev => ({
                ...prev,
                [listId]: res.data
            }));
        } catch (err) {
            console.error("Update list failed, rolling back", err);
            setLists(prev);
        }
    };

    const handleDeleteList = async (listId) => {
        try {
            await api.delete(`/lists/${listId}`);
            await fetchBoard();   // ← canonical truth
        } catch (err) {
            console.error('Delete list failed', err);
        }
    };

    const handleAddList = async () => {
        if (!newListTitle.trim()) return;
        const newList = await handleCreateList(newListTitle);
        if (newList) {
            setNewListTitle('');
            setAddingList(false);
        }
    };

    // Handle Cards
    const handleCreateCard = async (listId, data) => {
        try {
            await api.post('/cards', {
                listId,
                boardId: board.id,
                ...data,
            });

            await fetchBoard();

        } catch (err) {
            console.error('Create card failed', err);
        }
    };

    const handleUpdateCard = async (cardId, data) => {
        try {
            // const res = await api.patch(`/cards/${cardId}`, data);
            const res = await api.put(`/cards/${cardId}`, data);
            const updated = res.data;

            setCards(prev => ({
                ...prev,
                [updated._id]: updated,
            }));
        } catch (err) {
            console.error('Update card failed', err);
        }
    };

    const handleDeleteCard = async (cardId) => {
        try {
            await api.delete(`/cards/${cardId}`);
            await fetchBoard();
        } catch (err) {
            console.error("Delete card failed", err);
        }
    };

    useEffect(() => {
        fetchBoard();
    }, [boardId]);

    const onDragEnd = async (result) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) return;

        // LIST MOVE
        if (type === "LIST") {
            // Optimistic local update
            const newOrder = Array.from(board.listOrder);
            newOrder.splice(source.index, 1);
            newOrder.splice(destination.index, 0, draggableId);

            setBoard(prev => ({ ...prev, listOrder: newOrder }));

            try {
                await api.patch(`/boards/${board.id}/move-list`, {
                    from: source.index,
                    to: destination.index,
                });
                await fetchBoard();
            } catch (err) {
                console.error("List move failed", err);
                await fetchBoard(); // rollback
            }
            return;
        }

        // CARD MOVE
        const sourceList = lists[source.droppableId];
        const destList = lists[destination.droppableId];

        // Optimistic local update
        const newSourceOrder = Array.from(sourceList.cardOrder);
        newSourceOrder.splice(source.index, 1);

        const newDestOrder = Array.from(destList.cardOrder);
        newDestOrder.splice(destination.index, 0, draggableId);

        setLists(prev => ({
            ...prev,
            [source.droppableId]: { ...prev[source.droppableId], cardOrder: newSourceOrder },
            [destination.droppableId]: { ...prev[destination.droppableId], cardOrder: newDestOrder },
        }));

        try {
            await api.patch(`/cards/${draggableId}/move`, {
                sourceListId: source.droppableId,
                destListId: destination.droppableId,
                destIndex: destination.index,
            });

            await fetchBoard();

        } catch (err) {
            console.error("Card move failed", err);
            await fetchBoard();
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div key={renderKey}>
                <Droppable droppableId='board' direction="horizontal" type="LIST">
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{ display: 'flex', gap: '8px' }}
                        >

                            {board.listOrder.map((listId, index) => {
                                const listObj = lists[listId];
                                if (!listObj) return null;

                                return (
                                    <Draggable
                                        key={String(listId)}
                                        draggableId={String(listId)}
                                        index={index}
                                    >
                                        {(dragProvided) => (
                                            <div
                                                ref={dragProvided.innerRef}
                                                {...dragProvided.draggableProps}
                                                {...dragProvided.dragHandleProps}
                                                style={{
                                                    ...dragProvided.draggableProps.style,
                                                    display: 'flex'
                                                }}
                                            >
                                                <List
                                                    list={listObj}
                                                    listId={String(listId)}
                                                    cardsById={cards}
                                                    index={index}
                                                    onCreateCard={handleCreateCard}
                                                    onUpdateCard={handleUpdateCard}
                                                    onDeleteCard={handleDeleteCard}
                                                    onDeleteList={handleDeleteList}
                                                    onUpdateList={handleUpdateList}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                );
                            })}

                            <div style={{ minWidth: '200px' }}>
                                <button
                                    onClick={() => setAddingList(true)}
                                    style={{
                                        padding: '8px 12px',
                                        border: '1px dashed #aaa',
                                        borderRadius: '4px',
                                        background: 'transparent',
                                        cursor: 'pointer'
                                    }}
                                >
                                    + Add List
                                </button>

                                {addingList && (
                                    <div style={{ margin: '8px' }}>
                                        <input
                                            type='text'
                                            value={newListTitle}
                                            onChange={(e) => setNewListTitle(e.target.value)}
                                            placeholder='List title...'
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddList();
                                            }}
                                        />
                                        <button onClick={handleAddList}>Add</button>
                                        <button onClick={() => setAddingList(false)}>Cancel</button>
                                    </div>
                                )}
                            </div>

                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>
        </DragDropContext>
    );
};

export default Board;
