export async function createCard({ listId, boardId, title, description }) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/cards', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listId, boardId, title, description }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create card: ${errorText}`);
    }

    return res.json(); // returns the new card
}
