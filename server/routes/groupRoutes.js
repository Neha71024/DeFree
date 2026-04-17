const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const userId = req.headers.authorization ? require('jsonwebtoken').decode(req.headers.authorization.split(" ")[1])?.userId : null;
    
    // Filter: All public groups OR private groups where user is a member
    const query = {
      $or: [
        { type: 'public' },
      ]
    };

    if (userId) {
      query.$or.push({ members: userId });
    }

    const groups = await Group.find(query).populate('members', '_id username email');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const userId = req.headers.authorization ? require('jsonwebtoken').decode(req.headers.authorization.split(" ")[1])?.userId : null;
    const group = await Group.findById(req.params.id).populate('members', '_id username email');
    
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Privacy check
    if (group.type === 'private' && (!userId || !group.members.some(m => m._id.toString() === userId))) {
      return res.status(403).json({ message: 'Access denied to this private conversation' });
    }

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/direct', async (req, res) => {
  const { user1Id, user2Id } = req.body;

  try {
    let group = await Group.findOne({
      type: 'private',
      members: { $all: [user1Id, user2Id], $size: 2 }
    });

    if (group) {
      return res.status(200).json(group);
    }

    const newGroup = new Group({
      name: 'Direct Message', // Could be dynamic based on usernames later
      type: 'private',
      members: [user1Id, user2Id],
      admin: user1Id,
      maxMembers: 2,
      lastActivity: new Date(),
    });

    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get or create direct chat' });
  }
});


router.post('/', async (req, res) => {
  try {
    const { name, description, type, userId, maxMembers } = req.body;

    const newGroup = new Group({
      name,
      description,
      type,
      members: [userId],
      admin: userId,
      maxMembers: maxMembers || 100,
      lastActivity: new Date(),
    });

    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

router.post('/:id/add-member', async (req, res) => {
  const { adminId, userIdToAdd } = req.body;

  try {
    const group = await Group.findById(req.params.id);

    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check if requester is admin
    if (group.admin && group.admin.toString() !== adminId) {
      return res.status(403).json({ message: 'Only the group admin can add members' });
    }

    // Check max members
    if (group.maxMembers && group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group has reached its maximum member limit' });
    }

    if (!group.members.includes(userIdToAdd)) {
      group.members.push(userIdToAdd);
      await group.save();
    }

    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add member to group' });
  }
});


router.post('/:id/request-join', async (req, res) => {
  const { userId } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'Already a member' });
    }
    
    if (!group.pendingMembers) {
      group.pendingMembers = [];
    }

    if (!group.pendingMembers.includes(userId)) {
      group.pendingMembers.push(userId);
      await group.save();
    }
    
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ error: 'Failed to request join' });
  }
});

router.post('/:id/accept-join', async (req, res) => {
  const { adminId, userIdToAccept } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    if (group.admin && group.admin.toString() !== adminId) {
      return res.status(403).json({ message: 'Only admin can accept members' });
    }

    if (group.maxMembers && group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group reached maximum members limit' });
    }
    
    if (group.pendingMembers.includes(userIdToAccept)) {
      group.pendingMembers = group.pendingMembers.filter(id => id.toString() !== userIdToAccept);
      if (!group.members.includes(userIdToAccept)) {
        group.members.push(userIdToAccept);
      }
      await group.save();
    }
    
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept member' });
  }
});

router.post('/:id/reject-join', async (req, res) => {
  const { adminId, userIdToReject } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    if (group.admin && group.admin.toString() !== adminId) {
      return res.status(403).json({ message: 'Only admin can reject members' });
    }
    
    if (group.pendingMembers.includes(userIdToReject)) {
      group.pendingMembers = group.pendingMembers.filter(id => id.toString() !== userIdToReject);
      await group.save();
    }
    
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject member' });
  }
});

router.delete('/:id', async (req, res) => {
  const adminId = req.body.adminId || req.query.adminId;
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    if (group.admin && group.admin.toString() !== adminId) {
      return res.status(403).json({ message: 'Only admin can delete the group' });
    }
    
    const Message = require('../models/Message');
    await Message.deleteMany({ group: req.params.id });

    await Group.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

module.exports = router;
