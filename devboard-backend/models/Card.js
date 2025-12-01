const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required: true,
        },
        description:{
            type: String,
            default: "",
        },
        boardId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Board',
            required: true,
        },
        listId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'List',
            required: true,
        },
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    }, 
    {timestamps: true}
);

module.exports = mongoose.model('Card', CardSchema);