import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

import BoardCard from './BoardCard';
import BoardFormModal from './BoardFormModal/BoardFormModal';

const BoardList = () => {
    const [boards, setBoards] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingBoard, setEditingBoard] = useState(null);

    const navigate = useNavigate();

    // Fetch all boards
    useEffect(() => {
        api.get('/boards')
            .then(res => setBoards(res.data))
                .catch(err => console.error('Failed to fetch boards', err));
    }, []);

    // Create board (optimistic)
    const handleCreateBoard = async (title) => {
        const prev = boards;
        const tempId = 'temp-' + Date.now();

        const tempBoard = { _id: tempId, id: tempId, title };

        setBoards([...boards, tempBoard]);

        try {
            const res = await api.post('/boards', { title });
            setBoards(prev =>
                prev.map(b => (b.id === tempId ? res.data : b))
            );
        } catch (err) {
            console.error('Create board failed', err);
            setBoards(prev);
        }
    };

    // Edit board (optimistic)
    const handleEditBoard = async (id, title) => {
        const prev = boards;

        setBoards(prev =>
            prev.map(b => (b._id === id ? { ...b, title } : b))
        );

        try {
            const res = await api.put(`/boards/${id}`, { title });
            setBoards(prev =>
                prev.map(b => (b.id === tempId ? res.data : b))
            );
        } catch (err) {
            console.error('Edit board failed', err);
            setBoards(prev);
        }
    };

    // DELETE BOARD (optimistic)
    const handleDeleteBoard = async (id) => {
        const prev = boards;

        setBoards(prev => prev.filter(b => b._id !== id));

        try {
            await api.delete(`/boards/${id}`);
        } catch (err) {
            console.error('Delete board failed', err);
            setBoards(prev);
        }
    };

    return (
        <div style={{padding: '20px'}}>
            <h2>Your Boards</h2>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '16px',
                    marginTop: '20px'
                }}
            >
                {boards.map(board => (
                    <BoardCard
                        key={board._id}
                        board={board}
                        onOpen={() => navigate(`/board/${board._id}`)}
                        onEdit={() => setEditingBoard(board)}
                        onDelete={() => handleDeleteBoard(board._id)}
                    />
                ))}

                {/* Create Board Card*/}
                <div
                    onClick={() => boards.length < 2 && setIsCreating(true)}
                    style={{
                        border: '2px dashed #aaa',
                        borderRadius: '8px',
                        padding: '20px',
                        textAlign: 'center',
                        cursor: boards.length < 2 ? 'pointer' : 'not-allowed',
                        opacity: boards.length < 2 ? 1 : 0.4
                    }}
                >
                    + Create Board
                </div>
            </div>

            {/* Create Modal */}
            {isCreating && (
                <BoardFormModal 
                    mode="create"
                    initialTitle=""
                    onSubmit={(title) => {
                        handleCreateBoard(title);
                        setIsCreating(false);
                    }}
                    onCancel={() => setIsCreating(false)}
                />
            )}

            {/* Edit Modal */}
            {editingBoard && (
                <BoardFormModal 
                    mode="edit"
                    initialTitle={editingBoard.title}
                    onSubmit={(title) => {
                        handleEditBoard(editingBoard._id, title);
                        setEditingBoard(null);
                    }}
                    onCancel={() => setEditingBoard(null)}
                />
            )}
        </div>
    );
};

export default BoardList;