import React from 'react';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import normalizeBoard from '../utils/normalizeBoard.js';
import api from '../api';

import List from './List.jsx';

const Board = ({ boardId }) => {
    const [board, setBoard] = useState({ id: '', listOrder: [] });
    const [lists, setLists] = useState({});
    const [cards, setCards] = useState({});
    const [renderKey, setRenderKey] = useState(0);

    useEffect(() => {
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

    // Replace your onDragEnd with this
    const onDragEnd = async (result) => {
        const { source, destination, draggableId, type } = result;
        if (!destination) return;

        // LIST reordering unchanged
        if (type === 'LIST') {
            const newOrder = Array.from(board.listOrder);
            newOrder.splice(source.index, 1);
            newOrder.splice(destination.index, 0, String(draggableId));
            setBoard(prev => ({ ...prev, listOrder: newOrder }));
            try {
                await api.patch(`/boards/${board.id}/reorder-lists`, { listOrder: newOrder });
            } catch (err) {
                console.error('Failed to reorder lists', err);
                // optionally re-fetch board or rollback
            }
            return;
        }

        // CARD dragging
        const srcId = source.droppableId;
        const dstId = destination.droppableId;
        const cardId = String(draggableId);

        const sourceList = lists[srcId];
        const destList = lists[dstId];

        // Defensive checks
        if (!sourceList || !destList) {
            console.warn('Missing source or dest list for drag', { srcId, dstId });
            return;
        }

        // Snapshot for rollback
        const snapshot = {
            lists: JSON.parse(JSON.stringify(lists)),
            cards: JSON.parse(JSON.stringify(cards))
        };

        // Optimistic local update (atomic)
        const newSourceOrder = Array.from(sourceList.cardOrder || []);
        let newDestOrder = Array.from(destList.cardOrder || []);

        // remove from source
        newSourceOrder.splice(source.index, 1);

        // ensure card isn't already in dest
        newDestOrder = newDestOrder.filter(id => id !== cardId);

        // detect "drop on card" case and randomly choose before/after
        let insertIndex = destination.index;
        if (insertIndex < newDestOrder.length) {
            const randomChoice = Math.random() < 0.5 ? 'before' : 'after';
            if (randomChoice === 'after') {
                insertIndex = Math.min(insertIndex + 1, newDestOrder.length);
            }
        }

        // insert into dest at chosen index
        newDestOrder.splice(insertIndex, 0, cardId);

        // apply locally
        setLists(prev => ({
            ...prev,
            [srcId]: { ...prev[srcId], cardOrder: newSourceOrder },
            [dstId]: { ...prev[dstId], cardOrder: newDestOrder }
        }));

        // update cards state: set card.listId to dest
        setCards(prev => {
            if (!prev[cardId]) {
                console.warn('Card not found in cards state during optimistic update', cardId);
                return prev;
            }
            return {
                ...prev,
                [cardId]: { ...prev[cardId], listId: dstId }
            };
        });

        // Prepare payload for server (post-move arrays and destIndex)
        const payload = {
            sourceListId: srcId,
            destListId: dstId,
            destIndex: destination.index,
            sourceCardOrder: newSourceOrder,
            destCardOrder: newDestOrder
        };

        try {
            const res = await api.patch(`/cards/${cardId}/move`, payload);
            // Reconcile with server canonical response if provided
            const data = res.data || {};
            if (data.sourceList && data.destList) {
                setLists(prev => ({
                    ...prev,
                    [String(data.sourceList.id || data.sourceList._id)]: {
                        ...(prev[String(data.sourceList.id || data.sourceList._id)] || {}),
                        cardOrder: (data.sourceList.cardOrder || []).map(String)
                    },
                    [String(data.destList.id || data.destList._id)]: {
                        ...(prev[String(data.destList.id || data.destList._id)] || {}),
                        cardOrder: (data.destList.cardOrder || []).map(String)
                    }
                }));
            }
            if (data.card) {
                const cid = String(data.card.id || data.card._id);
                setCards(prev => ({ ...prev, [cid]: { ...(prev[cid] || {}), ...data.card, id: cid, listId: String(data.card.listId) } }));
            }
        } catch (err) {
            console.error('Move API failed, rolling back', err);

            // allow react-beautiful-dnd to finish internal cleanup
            setTimeout(() => {
                // shallow-merge snapshot to avoid replacing component identities
                setLists(prev => {
                    const next = { ...prev };
                    Object.keys(snapshot.lists).forEach(id => {
                        next[id] = { ...(next[id] || {}), cardOrder: snapshot.lists[id].cardOrder };
                    });
                    return next;
                });

                // cards can be replaced safely; if you prefer minimal replace, merge instead
                setCards(prev => {
                    const next = { ...prev };
                    Object.keys(snapshot.cards).forEach(cid => {
                        next[cid] = snapshot.cards[cid];
                    });
                    return next;
                });

                setRenderKey(k => k + 1);
            }, 0);
        }

    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div key={renderKey}>
                <Droppable droppableId="board" direction="horizontal" type="LIST">
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{ display: 'flex', gap: '8px' }}
                        >

                            {board.listOrder.map((listId, index) => {
                                const listObj = lists[listId];
                                if (!listObj) {
                                    // skip rendering until lists are populated
                                    return null;
                                }
                                return (
                                    <List
                                        key={listId}
                                        list={listObj}
                                        cardsById={cards}   // ensure List reads this prop name
                                        index={index}
                                    />
                                );
                            })}

                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>
        </DragDropContext>
    );
};

export default Board;
