const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const { handleNotFound, handleServerError } = require('../utils/responseHelpers');

exports.createBoard = async (req, res) => {
    try {
        const created = await Board.create({
            title: req.body.title,
            userId: req.user
        });

        res.status(201).json(created);
    } catch (err) {
        handleServerError(res, 'Failed to create board', err);
    }
};

exports.getBoards = async (req, res) => {
    try {
        const boards = await Board.find({ userId: req.user });
        res.json(boards);
    } catch (err) {
        handleServerError(res, 'Failed to get boards', err);
    }
};

exports.getBoard = async (req, res) => {
    try {
        const board = await Board.findOne({
            _id: req.params.id,
            userId: req.user
        }).populate({
            path: 'listOrder',
            model: 'List',
            match: { userId: req.user },
            populate: {
                path: 'cardOrder',
                model: 'Card',
                match: { userId: req.user }
            }
        });

        if (handleNotFound(board, res, 'Board')) return;

        res.json(board);
    } catch (err) {
        handleServerError(res, 'Failed to get board', err);
    }
};

exports.updateBoard = async (req, res) => {
    try {
        const updated = await Board.findOneAndUpdate(
            { _id: req.params.id, userId: req.user },
            { title: req.body.title },
            { new: true }
        );

        if (handleNotFound(updated, res, 'Board')) return;

        res.json(updated);
    } catch (err) {
        handleServerError(res, 'Failed to update board', err);
    }
};

exports.deleteBoard = async (req, res) => {
    try {
        const deleted = await Board.findOneAndDelete({
            _id: req.params.id,
            userId: req.user
        });

        if (handleNotFound(deleted, res, 'Board')) return;

        const listIds = (await List.find({ board: deleted._id, userId: req.user })).map(list => list._id);

        if (listIds.length > 0) {
            await Card.deleteMany({ list: { $in: listIds }, userId: req.user })
        }

        await List.deleteMany({ board: deleted._id, userId: req.user });

        res.json({ message: 'Board deleted' });
    } catch (err) {
        handleServerError(res, 'Failed to delete board', err);
    }
};