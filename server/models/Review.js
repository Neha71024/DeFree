const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: false },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
