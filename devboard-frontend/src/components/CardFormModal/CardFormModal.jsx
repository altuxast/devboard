import React, { useState, useEffect } from 'react';
import './CardFormModal.css';

const CardFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    list,
    initialData = null,
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
        } else {
            setTitle('');
            setDescription('');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            title,
            description,
        });
    };

    return (
        <div className='modal-backdrop'>
            <div className='modal'>
                <h3>
                    {initialData ? 'Edit Card' : 'Create Card'}
                </h3>

                <form onSubmit={handleSubmit}>
                    <label>
                        List
                        <input value={list.title} disabled />
                    </label>
                    <label>
                        Title
                        <input value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            autoFocus
                        />
                    </label>

                    <label>
                        Description
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </label>

                    <div className='actions'>
                        <button type="submit">
                            {initialData ? 'Save' : 'Create'}
                        </button>
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CardFormModal;