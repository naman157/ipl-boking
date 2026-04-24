const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchNumber: { type: Number, required: true, unique: true },
  team1: {
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    logo: { type: String },
    color: { type: String }
  },
  team2: {
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    logo: { type: String },
    color: { type: String }
  },
  venue: {
    name: { type: String, required: true },
    city: { type: String, required: true },
    capacity: { type: Number, default: 50000 }
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  matchType: { type: String, enum: ['league', 'qualifier', 'eliminator', 'final'], default: 'league' },
  status: { type: String, enum: ['upcoming', 'live', 'completed', 'cancelled'], default: 'upcoming' },
  ticketCategories: [
    {
      name: { type: String, required: true }, // e.g., "Premium Stand", "General Stand"
      price: { type: Number, required: true },
      totalSeats: { type: Number, required: true },
      availableSeats: { type: Number, required: true },
      color: { type: String } // for UI display
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', matchSchema);
