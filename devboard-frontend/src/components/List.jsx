import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Card from './Card.jsx';
import CardFormModal from './CardFormModal/CardFormModal.jsx';
import ListFormModal from './ListFormModal/ListFormModal.jsx';

const List = ({ list, index, cardsById = {}, onCreateCard, onUpdateCard, onUpdateList, onDeleteCard, onDeleteList, dragHandleProps }) => {
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
    const [isEditing, setIsEditing] = useState(false);

    const handleCreateCard = async (data) => {
        await onCreateCard(listId, data);
        setIsCreating(false);
    };

    return (
        <div
            style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px',
                minWidth: '200px',
                backgroundColor: '#f4f5f7'
            }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 {...dragHandleProps}>{list.title}</h4>
                <button
                    onClick={() => setIsEditing(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '6px' }}
                >
                    ✏️
                </button>
                <button
                    onClick={() => onDeleteList(list.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    🗑
                </button>
            </header>

            <Droppable droppableId={String(listId)} type="CARD">
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: '50px' }}>
                        {list.cardOrder.length === 0 ? (
                            <p>No cards in this list.</p>
                        ) : (
                            list.cardOrder.map((cardRef, idx) => {
                                const cardId = typeof cardRef === 'string'
                                    ? cardRef
                                    : (cardRef._id || cardRef.id);

                                const card = typeof cardRef === 'object'
                                    ? cardRef
                                    : cardsById[String(cardId)];

                                if (!card) {
                                    console.warn('Missing card for id', cardId, 'in list', list.id);
                                    return <div key={`placeholder-${cardId}`}>Loading…</div>;
                                }

                                return (
                                    <Card
                                        key={String(card._id || card.id)}
                                        card={card}
                                        index={idx}
                                        list={list}
                                        onUpdateCard={onUpdateCard}
                                        onDelete={onDeleteCard}
                                    />
                                );
                            })
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>

            <button onClick={() => setIsCreating(true)}>➕</button>

            <CardFormModal
                isOpen={isCreating}
                list={list}
                onClose={() => setIsCreating(false)}
                onSubmit={handleCreateCard}
            />

            <ListFormModal 
                isOpen={isEditing}
                list={list}
                onClose={() => setIsEditing(false)}
                onSubmit={async (data) => {
                    await onUpdateList(listId, data);
                    setIsEditing(false);
                }}
            />
        </div>
    );
};

export default List;