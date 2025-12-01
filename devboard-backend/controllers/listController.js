const List = require('../models/List');
const Board = require('../models/Board');
const Card = require('../models/Card');
const mongoose = require('mongoose');
const { handleNotFound, handleServerError } = require('../utils/responseHelpers');

exports.createList = async (req, res) => {
    try {
        const { boardId, title } = req.body;

        const boardDoc = await Board.findOne({ _id: boardId, userId: req.user });
        if (handleNotFound(boardDoc, res, 'Board')) return;

        const newList = await List.create({
            title,
            boardId,
            userId: req.user,
            cardOrder: []
        });

        boardDoc.listOrder.push(newList._id);
        await boardDoc.save();

        res.json(newList);
    } catch (err) {
        handleServerError(res, 'Failed to create list', err);
    }
};

exports.getLists = async (req, res) => {
    try {
        const { boardId } = req.params;

        const lists = await List.find({
            boardId: boardId,
            userId: req.user
        });

        res.json(lists);
    } catch (err) {
        handleServerError(res, 'Failed to fetch lists', err);
    }
};

exports.updateList = async (req, res) => {
    try {
        const updated = await List.findOneAndUpdate(
            { _id: req.params.id, userId: req.user },
            req.body,
            { new: true }
        );

        if (handleNotFound(updated, res, 'List')) return;

        res.json(updated);
    } catch (err) {
        handleServerError(res, 'Failed to update list', err);
    }
};


exports.deleteList = async (req, res) => {
    try {
        const deleted = await List.findOneAndDelete({ _id: req.params.id, userId: req.user });

        if (handleNotFound(deleted, res, 'List')) return;

        await Card.deleteMany({ list: deleted._id, userId: req.user });

        await Board.updateOne(
            { _id: deleted.boardId, userId: req.user },
            { $pull: { listOrder: deleted._id } }
        );

        res.json({ message: 'List deleted' });
    } catch (err) {
        handleServerError(res, 'Failed to delete list', err);
    }
};

exports.reorderCards = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {listId} = req.params;
        const {cardOrder} = req.body;

        if(!Array.isArray(cardOrder)){
            throw new Error("cardOrder must be an array");
        }

        if(new Set(cardOrder).size !== cardOrder.length){
            throw new Error("Duplicate card IDs detected in cardOrder");
        }

        const list = await List.findOne({_id: listId, userId: req.user}).session(session);
        if (!list) throw new Error("List not found");

        const cards = await Card.find({_id: {$in: cardOrder}, userId: req.user}).session(session);

        if(cards.length !== cardOrder.length){
            throw new Error("Some cards do not belong to this list");
        }

        list.cardOrder = cardOrder;
        await list.save({session});

        await session.commitTransaction();
        res.json({message: "List reordered", list});

    } catch (err) {
        await session.abortTransaction();
        handleServerError(res, "Failed to reorder cards", err);
    } finally {
        session.endSession();
    }
};