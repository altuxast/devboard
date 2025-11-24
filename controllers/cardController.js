const Card = require('../models/Card');
const List = require('../models/List');
const mongoose = require('mongoose');
const { handleNotFound, handleServerError } = require('../utils/responseHelpers');

exports.createCard = async (req, res) => {
    try {
        const { listId, boardId, title, description } = req.body;

        const listDoc = await List.findOne({ _id: listId, userId: req.user });
        if (handleNotFound(listDoc, res, 'List')) return;

        const newCard = await Card.create({
            title,
            description,
            boardId,
            listId,
            userId: req.user,
        });

        listDoc.cardOrder.push(newCard._id);
        await listDoc.save();

        res.json(newCard);
    } catch (err) {
        handleServerError(res, 'Failed to create card', err);
    }
};

exports.getCards = async (req, res) => {
    try {
        const { listId } = req.params;

        const cards = await Card.find({ listId: listId, userId: req.user });

        res.json(cards);
    } catch (err) {
        handleServerError(res, 'Failed to fetch cards', err);
    }
};

exports.updateCard = async (req, res) => {
    try {
        const updated = await Card.findOneAndUpdate(
            { _id: req.params.id, userId: req.user },
            req.body,
            { new: true }
        );

        if (handleNotFound(updated, res, 'Card')) return;

        res.json(updated);
    } catch (err) {
        handleServerError(res, 'Failed to update card', err);
    }
};

exports.deleteCard = async (req, res) => {
    try {
        const deleted = await Card.findOneAndDelete({ _id: req.params.id, userId: req.user });

        if (handleNotFound(deleted, res, 'Card')) return;

        await List.updateOne(
            { _id: deleted.listId, userId: req.user },
            { $pull: { cardOrder: deleted._id } }
        );

        res.json({ message: 'Card deleted' });
    } catch (err) {
        handleServerError(res, 'Failed to delete card', err);
    }
};

exports.moveCard = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { sourceListId, destListId, sourceCardOrder, destCardOrder } = req.body;
        const cardId = req.params.id;

        const sourceList = await List.findOne({ _id: sourceListId, userId: req.user }).session(session);
        const destList = await List.findOne({ _id: destListId, userId: req.user }).session(session);

        if (!sourceList || !destList) throw new Error('Source or Destination list not found');

        const card = await Card.findOne({
            _id: cardId,
            listId: sourceListId,
            userId: req.user
        }).session(session);

        if (!card) throw new Error('Card not found in source list');

        const originalSourceLength = sourceList.cardOrder.length;
        const originalDestLength   = destList.cardOrder.length;

        // Remove card from source
        sourceList.cardOrder = sourceList.cardOrder.filter(id => id.toString() !== cardId);

        // Insert card into destination
        destList.cardOrder = [...destList.cardOrder, cardId];

        // Apply server-side reordering only if full arrays are sent
        if (Array.isArray(sourceCardOrder) && sourceCardOrder.length === originalSourceLength) {
            sourceList.cardOrder = sourceCardOrder;
        }

        if (Array.isArray(destCardOrder) && destCardOrder.length === originalDestLength + 1) {
            destList.cardOrder = destCardOrder;
        }

        await sourceList.save({ session });
        await destList.save({ session });

        await session.commitTransaction();

        res.json({
            message: 'Card moved successfully',
            sourceList,
            destList
        });

    } catch (err) {
        await session.abortTransaction();
        handleServerError(res, 'Failed to move card', err);
    } finally {
        session.endSession();
    }
};
