import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const Card = ({ card, index }) => {
  const id = card?._id || card?.id;
  if (!id) {
    console.warn('Skipping Card render: missing id', card);
    return null;
  }

  return (
    <Draggable draggableId={String(id)} index={Number(index)}>
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
};

export default Card;