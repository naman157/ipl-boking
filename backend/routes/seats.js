const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const Match = require('../models/Match');
const { protect } = require('../middleware/auth');

// @GET /api/seats/:matchId - Get all seats for a match
router.get('/:matchId', async (req, res) => {
  try {
    // Release expired holds first
    await Seat.updateMany(
      { match: req.params.matchId, status: 'held', heldUntil: { $lt: new Date() } },
      { $set: { status: 'available', heldBy: null, heldUntil: null } }
    );

    const seats = await Seat.find({ match: req.params.matchId }).select('-booking');
    res.json(seats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @POST /api/seats/:matchId/generate - Generate seats for a match (admin/dev)
router.post('/:matchId/generate', async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    await Seat.deleteMany({ match: match._id });

    const sections = {
      'Platinum Pavilion': { rows: ['A', 'B', 'C', 'D'], seatsPerRow: 20, section: 'P' },
      'Gold Stand': { rows: ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'], seatsPerRow: 25, section: 'G' },
      'Silver Stand': { rows: ['M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'], seatsPerRow: 30, section: 'S' },
      'General': { rows: ['U', 'V', 'W', 'X', 'Y', 'Z'], seatsPerRow: 40, section: 'N' }
    };

    const seatsToCreate = [];

    for (const category of match.ticketCategories) {
      const config = sections[category.name];
      if (!config) continue;

      for (const row of config.rows) {
        for (let i = 1; i <= config.seatsPerRow; i++) {
          seatsToCreate.push({
            match: match._id,
            seatNumber: `${config.section}${row}${i}`,
            row,
            section: config.section,
            category: category.name,
            price: category.price,
            status: 'available'
          });
        }
      }
    }

    const created = await Seat.insertMany(seatsToCreate);
    res.status(201).json({ message: `${created.length} seats generated`, count: created.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @POST /api/seats/:matchId/hold - Hold seats temporarily (10 min)
router.post('/:matchId/hold', protect, async (req, res) => {
  try {
    const { seatIds } = req.body;
    if (!seatIds || seatIds.length === 0)
      return res.status(400).json({ error: 'No seats provided' });
    if (seatIds.length > 6)
      return res.status(400).json({ error: 'Maximum 6 seats per booking' });

    // Release this user's old holds for this match
    await Seat.updateMany(
      { match: req.params.matchId, heldBy: req.user._id },
      { $set: { status: 'available', heldBy: null, heldUntil: null } }
    );

    // Release expired holds
    await Seat.updateMany(
      { match: req.params.matchId, status: 'held', heldUntil: { $lt: new Date() } },
      { $set: { status: 'available', heldBy: null, heldUntil: null } }
    );

    const heldUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const seats = await Seat.find({
      _id: { $in: seatIds },
      match: req.params.matchId,
      status: 'available'
    });

    if (seats.length !== seatIds.length)
      return res.status(409).json({ error: 'Some seats are no longer available' });

    await Seat.updateMany(
      { _id: { $in: seatIds } },
      { $set: { status: 'held', heldBy: req.user._id, heldUntil } }
    );

    res.json({ message: 'Seats held for 10 minutes', heldUntil, seats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @POST /api/seats/:matchId/release - Release held seats
router.post('/:matchId/release', protect, async (req, res) => {
  try {
    await Seat.updateMany(
      { match: req.params.matchId, heldBy: req.user._id },
      { $set: { status: 'available', heldBy: null, heldUntil: null } }
    );
    res.json({ message: 'Seats released' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
