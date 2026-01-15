import React, { useState, useEffect } from 'react';

const ListFormModal = ({ isOpen, list, onClose, onSubmit }) => {
    const [title, setTitle] = useState("");

    useEffect(() => {
        if (list) {
            setTitle(list.title);
        }
    }, [list]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ title });
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgb(0, 0, 0, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <form
                onSubmit={handleSubmit}
                style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    minWidth: '300px'
                }}
            >
                <h3>Edit List</h3>

                <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{width: '100%', marginBottom: '10px'}}
                />

                <button type="submit">Save</button>
                <button type="button" onClick={onClose} style={{marginLeft: '10px'}}>
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default ListFormModal;