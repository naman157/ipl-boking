const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  seatNumber: { type: String, required: true },
  row: { type: String, required: true },
  section: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['available', 'held', 'booked'], default: 'available' },
  heldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  heldUntil: { type: Date },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
});

// Compound index for efficient querying
seatSchema.index({ match: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ match: 1, status: 1 });

module.exports = mongoose.model('Seat', seatSchema);
