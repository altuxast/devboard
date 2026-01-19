import React from 'react';

const BoardCard = ({ board, onOpen, onEdit, onDelete }) => {
    return (
        <div
            style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                background: '#fafafa',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
            <div
                onClick={onOpen}
                style={{
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '12px'
                }}
            >
                {board.title}
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <button>✏️ Edit</button>
                <button>🗑 Delete</button>
            </div>
        </div>
    );
};

export default BoardCard;