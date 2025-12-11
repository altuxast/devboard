import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const Card = ({ card, index, onDelete }) => {
  const id = card?._id || card?.id;
  if (!id) {
    console.warn('Skipping Card render: missing id', card);
    return null;
  }

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
            style={{ fontWeight: '600' }}>
            {card.title}
          </div>
          <button
            onClick={() => onDelete(id)}
            style={{
              marginLeft: '8px',
              background: 'transparent',
              border: 'none',
              color: 'c00',
              cursor: 'pointer',
              fontSize: '16px',
            }}>
            ❌
          </button>
        </div>
      )}
    </Draggable>

  );
};

export default Card;