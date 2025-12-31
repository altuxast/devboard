import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import Card from './Card.jsx';
import CardFormModal from './CardFormModal/CardFormModal.jsx';

const List = ({ list, index, cardsById = {}, onCreateCard, onUpdateCard, onDeleteCard }) => {
    if (!list || !Array.isArray(list.cardOrder)) {
        console.error('Invalid data: list or cardOrder is not passed correctly. List:', list);
        return null;
    }

    const listId = list._id || list.id;
    if (!listId) {
        console.error('Missing list id for list:', list);
        return null;
    }

    const [isCreating, setIsCreating] = useState(false);

    // const handleCreateCard = async (data) => {
    //     try {
    //         const newCard = await createCard({ listId, boardId: list.boardId, ...data });

    //         // Append to frontend state
    //         setListCards((prevCards) => ({
    //             ...prevCards,
    //             [newCard._id]: newCard,
    //             cardOrder: [...(list.cardOrder || []), newCard._id],
    //         }));

    //         setIsCreating(false);
    //     } catch (err) {
    //         console.error(err);
    //     }
    // };

    // const handleCreateCard = async (data) => {
    //     try {
    //         const newCard = await createCard({
    //             listId,
    //             boardId: list.boardId,
    //             ...data,
    //         });

    //         // 1️⃣ Update cards map
    //         setListCards((prev) => ({
    //             ...prev,
    //             [newCard._id]: newCard,
    //         }));

    //         // 2️⃣ Update list.cardOrder (THIS IS SEPARATE STATE)
    //         setLists((prevLists) =>
    //             prevLists.map((l) =>
    //                 l._id === listId
    //                     ? { ...l, cardOrder: [...l.cardOrder, newCard._id] }
    //                     : l
    //             )
    //         );

    //         setIsCreating(false);
    //     } catch (err) {
    //         console.error(err);
    //     }
    // };

    const handleCreateCard = async (data) => {
        await onCreateCard(listId, data);
        setIsCreating(false);
    };

    return (
        <Draggable draggableId={String(listId)} index={index}>
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

                    <Droppable droppableId={String(listId)} type="CARD">
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: '50px' }}>
                                {list.cardOrder.length === 0 ? (
                                    <p>No cards in this list.</p>
                                ) : (
                                    list.cardOrder.map((cardRef, idx) => {
                                        const cardId = typeof cardRef === 'string' ? cardRef : (cardRef._id || cardRef.id);
                                        const card = (typeof cardRef === 'object' && (cardRef._id || cardRef.id))
                                            ? cardRef
                                            : cardsById[String(cardId)];


                                        if (!card) {
                                            console.warn('Missing card for id', cardId, 'in list', list.id);
                                            return <div key={`placeholder-${cardId}`} className="card-placeholder">Loading…</div>;
                                        }

                                        return <Card
                                            key={String(card._id || card.id)}
                                            card={card}
                                            index={idx}
                                            list={list}
                                            onUpdateCard={onUpdateCard}
                                            onDelete={onDeleteCard}
                                        />;
                                    })
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    <button onClick={() => setIsCreating(true)}>
                        ➕
                    </button>

                    <CardFormModal
                        isOpen={isCreating}
                        list={list}
                        onClose={() => setIsCreating(false)}
                        onSubmit={handleCreateCard}
                    />
                </div>
            )}
        </Draggable>
    );
};

export default List;