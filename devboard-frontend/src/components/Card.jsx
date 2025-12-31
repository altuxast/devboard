import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import CardFormModal from './CardFormModal/CardFormModal';

const Card = ({ card, index, list, onDelete, onUpdateCard }) => {
  const id = card?._id || card?.id;
  if (!id) {
    console.warn('Skipping Card render: missing id', card);
    return null;
  }

  const [isEditing, setIsEditing] = useState(false);

  return (
    <Draggable draggableId={String(id)} index={Number(index)}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          // {...provided.dragHandleProps} // <- moved here
          style={{
            padding: '8px',
            margin: '4px 0',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '3px',
            ...provided.draggableProps.style
          }}
        >
          <div
            {...provided.dragHandleProps}
            style={{ fontWeight: '600' }}
          >
            {card.title}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            aria-label="Edit card"
            style={{ marginLeft: '8px' }}
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(id)}
            aria-label="Delete card"
            style={{
              marginLeft: '8px',
              background: 'transparent',
              border: 'none',
              color: '#c00',
              cursor: 'pointer',
              fontSize: '16px',
            }}>
            ❌
          </button>
          <CardFormModal
            isOpen={isEditing}
            list={list}
            initialData={card}
            onClose={() => setIsEditing(false)}
            onSubmit={async (data) => {
              try {
                // await onUpdateCard(card._id, data);
                await onUpdateCard(id, data);
                setIsEditing(false);
              } catch (err) {
                console.error(err);
              }
            }}
          />
        </div>
      )}
    </Draggable>

  );
};

export default Card;