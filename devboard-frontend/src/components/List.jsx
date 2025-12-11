import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import Card from './Card.jsx';

const List = ({ list, index, cardsById = {}, onDeleteCard }) => {
    if (!list || !Array.isArray(list.cardOrder)) {
        console.error('Invalid data: list or cardOrder is not passed correctly. List:', list);
        return null;
    }

    const listId = list._id || list.id;
    if (!listId) {
        console.error('Missing list id for list:', list);
        return null;
    }

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
                                            onDelete={onDeleteCard}
                                        />;
                                    })
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            )}
        </Draggable>
    );
};

export default List;