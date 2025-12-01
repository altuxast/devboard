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
        const cardIdStr = req.params.id;
        const { sourceListId, destListId, destIndex } = req.body;

        if (!cardIdStr || !destListId || typeof destIndex !== 'number') {
            await session.abortTransaction(); session.endSession();
            return res.status(400).json({ error: 'Missing required fields: cardId, destListId, destIndex' });
        }

        const cardId = new mongoose.Types.ObjectId(cardIdStr);
        const destListObjId = new mongoose.Types.ObjectId(destListId);
        const sourceListObjId = sourceListId ? new mongoose.Types.ObjectId(sourceListId) : null;

        // Ensure card exists
        const card = await Card.findOne({ _id: cardId, userId: req.user }).session(session);
        if (!card) {
            await session.abortTransaction(); session.endSession();
            return res.status(404).json({ error: 'Card not found' });
        }

        // Resolve source list if not provided
        let srcId = sourceListObjId;
        if (!srcId) {
            const src = await List.findOne({ cardOrder: card._id, userId: req.user }).select('_id').session(session);
            if (!src) {
                await session.abortTransaction(); session.endSession();
                return res.status(409).json({ error: 'Card not found in any list' });
            }
            srcId = src._id;
        }

        // 1) Remove from source list atomically
        await List.updateOne(
            { _id: srcId, userId: req.user },
            { $pull: { cardOrder: card._id } },
            { session }
        );

        // 2) Insert into dest list at index atomically (clamp index)
        // We need current dest length to clamp. Read minimal fields.
        const destList = await List.findOne({ _id: destListObjId, userId: req.user })
            .select('_id cardOrder')
            .lean()
            .session(session);
        if (!destList) {
            await session.abortTransaction(); session.endSession();
            return res.status(404).json({ error: 'Destination list not found' });
        }

        const currentLen = Array.isArray(destList.cardOrder) ? destList.cardOrder.length : 0;
        const insertIndex = Math.max(0, Math.min(destIndex, currentLen));

        // Ensure card not present already (defensive double-pull)
        await List.updateOne(
            { _id: destListObjId, userId: req.user },
            { $pull: { cardOrder: card._id } },
            { session }
        );

        // Push with position
        await List.updateOne(
            { _id: destListObjId, userId: req.user },
            { $push: { cardOrder: { $each: [card._id], $position: insertIndex } } },
            { session }
        );

        // 3) Update card.listId atomically
        await Card.updateOne(
            { _id: cardId, userId: req.user },
            { $set: { listId: destListObjId } },
            { session }
        );

        // Optional: read back canonical arrays to return to client
        const [sourceListOut, destListOut] = await Promise.all([
            List.findOne({ _id: srcId, userId: req.user }).select('_id cardOrder').lean().session(session),
            List.findOne({ _id: destListObjId, userId: req.user }).select('_id cardOrder').lean().session(session),
        ]);

        await session.commitTransaction(); session.endSession();

        return res.json({
            message: 'Card moved successfully',
            card: { id: cardIdStr, listId: String(destListObjId) },
            sourceList: { id: String(sourceListOut._id), cardOrder: (sourceListOut.cardOrder || []).map(String) },
            destList: { id: String(destListOut._id), cardOrder: (destListOut.cardOrder || []).map(String) },
        });
    } catch (err) {
        await session.abortTransaction(); session.endSession();
        console.error('moveCard error', err);
        return handleServerError(res, 'Failed to move card', err);
    }
};
