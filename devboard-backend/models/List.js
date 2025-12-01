const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        boardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Board',
            required: true,
        },
        cardOrder: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Card',
            }
        ],
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('List', ListSchema);