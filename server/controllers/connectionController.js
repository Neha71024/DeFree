const Connection = require('../models/Connection');
const User = require('../models/User');

exports.sendRequest = async (req, res) => {
    try {
        const { requesterId, recipientId } = req.body;

        if (requesterId === recipientId) {
            return res.status(400).json({ error: 'Cannot connect with yourself' });
        }

        const existing = await Connection.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId }
            ]
        });

        if (existing) {
            return res.status(400).json({ error: 'Connection already exists or is pending' });
        }

        const connection = new Connection({
            requester: requesterId,
            recipient: recipientId,
            status: 'pending'
        });

        await connection.save();
        res.status(201).json(connection);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.acceptRequest = async (req, res) => {
    try {
        const { connectionId } = req.params;

        const connection = await Connection.findById(connectionId);
        if (!connection) {
            return res.status(404).json({ error: 'Connection not found' });
        }

        connection.status = 'accepted';
        await connection.save();

        res.json(connection);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.rejectRequest = async (req, res) => {
    try {
        const { connectionId } = req.params;

        await Connection.findByIdAndDelete(connectionId);

        res.json({ message: 'Connection rejected/removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserConnections = async (req, res) => {
    try {
        const { userId } = req.params;

        const connections = await Connection.find({
            $or: [{ requester: userId }, { recipient: userId }]
        }).populate('requester recipient', '_id username email role freelancerProfile clientProfile');

        res.json(connections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
