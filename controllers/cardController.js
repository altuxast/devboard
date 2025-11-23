const Card = require('../models/Card');
const List = require('../models/List');
const { handleNotFound, handleServerError } = require('../utils/responseHelpers');

exports.createCard = async (req, res) => {
    try {
        const { listId, boardId, title, description } = req.body;

        const listDoc = await List.findOne({_id: listId, userId: req.user});
        if(handleNotFound(listDoc, res, 'List')) return;

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
        const {listId} = req.params;

        const cards = await Card.find({listId: listId, userId: req.user});

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