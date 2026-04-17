const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: String,
  description: String,
  type: { type: String, enum: ['public', 'private'], default: 'public' },
  members: [ 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pendingMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  maxMembers: {
    type: Number,
    default: 100
  },
  lastActivity: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', GroupSchema);
