const Group = require('./models/Group.js');
const Message = require('./models/Message.js');
const Notification = require('./models/Notification');
const notificationService = require('./services/notificationService');

module.exports = (io) => {
  const activeUsersByGroup = {};
  const userSocketMap = {};

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join Group
    socket.on('joinGroup', async ({ groupId, user }) => {
      if (!user || !user._id || !user.username ||!user.email || !groupId) {
        console.error('Invalid joinGroup data:', { groupId, user });
        return;
      }

      try {
        const group = await Group.findById(groupId);
        if (!group) {
          console.error('Group not found during join:', groupId);
          return;
        }

        // Privacy Check: Only members can join private groups
        if (group.type === 'private' && !group.members.some(id => id.toString() === user._id)) {
          console.warn(`User ${user.username} tried to join private group ${groupId} without permission`);
          socket.emit('error', { message: 'You do not have permission to access this private conversation' });
          return;
        }

        socket.join(groupId);

        // Send past messages from Message collection
        const messages = await Message.find({ groupId }).sort({ timestamp: 1 });
        socket.emit('groupMessages', messages);

        // Track active users in the group
        if (!activeUsersByGroup[groupId]) {
          activeUsersByGroup[groupId] = [];
        }

        const alreadyActive = activeUsersByGroup[groupId].some(
          (u) => u.userId === user._id
        );

        if (!alreadyActive) {
          activeUsersByGroup[groupId].push({
            socketId: socket.id,
            userId: user._id,
            username: user.username,
            email: user.email,
          });
        }

        // Broadcast updated active user list to the group
        io.to(groupId).emit(
          'activeUsers',
          activeUsersByGroup[groupId].map(({ userId, username , email}) => ({
            _id: userId,
            username,
            email
          }))
        );
      } catch (err) {
        console.error('Error in joinGroup:', err);
      }
    });

    // Send Message
    socket.on('sendMessage', async ({ groupId, sender, text }) => {
      if (!groupId || !sender || !sender._id || !sender.username || !text?.trim()) {
        console.error('Invalid sendMessage data:', { groupId, sender, text });
        return;
      }

      try {
        const group = await Group.findById(groupId);
        if (!group) {
          console.warn(`Group not found: ${groupId}`);
          return;
        }

        // Permission check for sending messages
        if (group.type === 'private' && !group.members.some(id => id.toString() === sender._id)) {
          console.warn(`Unauthorized message attempt by ${sender.username} in ${groupId}`);
          return;
        }

        // Create and store the message in the Message collection
        const message = await Message.create({
          groupId,
          sender: {
            _id: sender._id,
            username: sender.username,
          },
          text: text.trim(),
        });

        // Update group's last activity
        group.lastActivity = new Date();
        await group.save();

        // Emit the new message to all group members
        io.to(groupId).emit('newMessage', { groupId, message });

        // Notify all group members except sender
        const memberIds = group.members?.map(m => m.toString()) || [];
        await Promise.all(memberIds.filter(id => id !== sender._id).map(userId =>
          notificationService.createAndSendNotification({
            userId,
            type: 'message',
            title: `New message in group ${group.name}`,
            message: `${sender.username}: ${text.substring(0, 50)}`,
            sourceId: groupId,
            actionUrl: `/community/${groupId}`
          })
        ));
      } catch (err) {
        console.error('Error sending message:', err);
      }
    });

    // Track userId <-> socket.id mapping for notifications
    socket.on('registerUser', (userId) => {
      if (userId) {
        userSocketMap[userId] = socket.id;
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      for (const groupId in activeUsersByGroup) {
        const beforeCount = activeUsersByGroup[groupId].length;
        activeUsersByGroup[groupId] = activeUsersByGroup[groupId].filter(
          (u) => u.socketId !== socket.id
        );
        const afterCount = activeUsersByGroup[groupId].length;

        if (beforeCount !== afterCount) {
          io.to(groupId).emit(
            'activeUsers',
            activeUsersByGroup[groupId].map(({ userId, username }) => ({
              _id: userId,
              username,
            }))
          );
        }
      }
      // Remove from userSocketMap
      for (const userId in userSocketMap) {
        if (userSocketMap[userId] === socket.id) {
          delete userSocketMap[userId];
        }
      }
    });
  });

  // Helper to emit notification to a user
  io.sendNotificationToUser = (userId, notification) => {
    const socketId = userSocketMap[userId];
    if (socketId) {
      io.to(socketId).emit('notification', notification);
    }
  };
};
