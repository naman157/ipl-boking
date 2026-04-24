const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Match = require('../models/Match');
const Seat = require('../models/Seat');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @GET /api/bookings/my - Get user's bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('match', 'team1 team2 date time venue matchNumber matchType')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @GET /api/bookings/:id - Get single booking
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      $or: [{ _id: req.params.id }, { bookingId: req.params.id }],
      user: req.user._id
    }).populate('match');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @POST /api/bookings/create - Create a booking (pending payment)
// Supports two modes:
//   1. Category-based (new): { matchId, categoryName, quantity, attendees }
//   2. Seat-based (legacy):  { matchId, seatIds, attendees }
router.post('/create', protect, async (req, res) => {
  try {
    const { matchId, seatIds, categoryName, quantity, attendees } = req.body;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: 'Match not found' });
    if (match.status === 'cancelled') return res.status(400).json({ error: 'Match is cancelled' });

    let seatsData = [];

    // ── MODE 1: category-based booking ──────────────────────────────────────
    if (categoryName && quantity) {
      const qty = parseInt(quantity);
      if (!qty || qty < 1 || qty > 6)
        return res.status(400).json({ error: 'Quantity must be between 1 and 6' });

      const category = match.ticketCategories.find(c => c.name === categoryName);
      if (!category) return res.status(404).json({ error: 'Category not found' });
      if (category.availableSeats < qty)
        return res.status(409).json({ error: `Only ${category.availableSeats} seats left in ${categoryName}` });

      // Assign sequential seat numbers automatically
      seatsData = Array.from({ length: qty }, (_, i) => ({
        seatNumber: `AUTO-${categoryName.substring(0, 3).toUpperCase()}-${Date.now()}-${i + 1}`,
        row: 'AUTO',
        category: categoryName,
        price: category.price,
      }));
    }

    // ── MODE 2: seat-ID-based booking (legacy) ───────────────────────────────
    else if (seatIds && seatIds.length > 0) {
      const seats = await Seat.find({
        _id: { $in: seatIds },
        match: matchId,
        status: 'held',
        heldBy: req.user._id,
      });

      if (seats.length !== seatIds.length)
        return res.status(409).json({ error: 'Seats are no longer held. Please re-select.' });

      seatsData = seats.map(s => ({
        seatNumber: s.seatNumber,
        row: s.row,
        category: s.category,
        price: s.price,
      }));
    }

    else {
      return res.status(400).json({ error: 'Provide either categoryName + quantity or seatIds' });
    }

    const totalAmount = seatsData.reduce((sum, s) => sum + s.price, 0);
    const convenienceFee = Math.round(totalAmount * 0.02);
    const grandTotal = totalAmount + convenienceFee;

    const booking = await Booking.create({
      user: req.user._id,
      match: matchId,
      seats: seatsData,
      totalAmount,
      convenienceFee,
      grandTotal,
      attendees: attendees || [{ name: req.user.name }],
      status: 'pending',
      paymentStatus: 'pending',
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @POST /api/bookings/:id/confirm - Confirm booking after payment
router.post('/:id/confirm', protect, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Deduct available seats in match for each category
    const categoryQuantities = {};
    for (const seat of booking.seats) {
      categoryQuantities[seat.category] = (categoryQuantities[seat.category] || 0) + 1;
    }
    for (const [catName, qty] of Object.entries(categoryQuantities)) {
      await Match.updateOne(
        { _id: booking.match, 'ticketCategories.name': catName },
        { $inc: { 'ticketCategories.$.availableSeats': -qty } }
      );
    }

    // If seat-based, mark those seats as booked
    const seatNumbers = booking.seats.filter(s => s.row !== 'AUTO').map(s => s.seatNumber);
    if (seatNumbers.length > 0) {
      await Seat.updateMany(
        { match: booking.match, seatNumber: { $in: seatNumbers } },
        { $set: { status: 'booked', booking: booking._id, heldBy: null, heldUntil: null } }
      );
    }

    await User.findByIdAndUpdate(req.user._id, { $push: { bookings: booking._id } });

    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.paymentIntentId = paymentIntentId;
    booking.qrCode = `IPL-QR-${booking.bookingId}-${Date.now()}`;
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @POST /api/bookings/:id/cancel - Cancel booking
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'cancelled') return res.status(400).json({ error: 'Already cancelled' });

    // Restore available seat count
    const categoryQuantities = {};
    for (const seat of booking.seats) {
      categoryQuantities[seat.category] = (categoryQuantities[seat.category] || 0) + 1;
    }
    for (const [catName, qty] of Object.entries(categoryQuantities)) {
      await Match.updateOne(
        { _id: booking.match, 'ticketCategories.name': catName },
        { $inc: { 'ticketCategories.$.availableSeats': qty } }
      );
    }

    // Release any physical seats if seat-based
    const seatNumbers = booking.seats.filter(s => s.row !== 'AUTO').map(s => s.seatNumber);
    if (seatNumbers.length > 0) {
      await Seat.updateMany(
        { match: booking.match, seatNumber: { $in: seatNumbers } },
        { $set: { status: 'available', booking: null } }
      );
    }

    booking.status = 'cancelled';
    booking.paymentStatus = booking.paymentStatus === 'paid' ? 'refunded' : booking.paymentStatus;
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;