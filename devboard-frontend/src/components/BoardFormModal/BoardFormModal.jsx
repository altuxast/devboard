import React, { useState, useEffect } from 'react';

const modalSyle = {
    positin: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

const boxStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '320px'
};

const BoardFormModal = ({ mode, initialTitle, onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');

    useEffect(() => {
        setTitle(initialTitle || '');
    }, [initialTitle]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSubmit(title.trim());
    };

    return (
        <div style={modalSyle}>
            <div style={boxStyle}>
                <h3>
                    {mode === 'create' ? 'Create Board' : 'Edit Board'}
                </h3>

                <form onSubmit={handleSubmit}>
                    <label>
                        Title
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            autoFocus
                            style={{ width: '100%', marginTop: '8px' }}
                        />
                    </label>
                    <div style={{
                        marginTop: '20px',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}>
                        <button type="submit">
                            {mode === 'create' ? 'Create' : 'Save'}
                        </button>
                        <button type="button" onClick={onCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BoardFormModal;