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
router.post('/create', protect, async (req, res) => {
  try {
    const { matchId, seatIds, attendees } = req.body;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: 'Match not found' });
    if (match.status === 'cancelled') return res.status(400).json({ error: 'Match is cancelled' });

    // Get held seats
    const seats = await Seat.find({
      _id: { $in: seatIds },
      match: matchId,
      status: 'held',
      heldBy: req.user._id
    });

    if (seats.length !== seatIds.length)
      return res.status(409).json({ error: 'Seats are no longer held. Please re-select.' });

    const seatsData = seats.map(s => ({
      seatNumber: s.seatNumber,
      row: s.row,
      category: s.category,
      price: s.price
    }));

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
      paymentStatus: 'pending'
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

    // Update seats to booked
    const seatNumbers = booking.seats.map(s => s.seatNumber);
    await Seat.updateMany(
      { match: booking.match, seatNumber: { $in: seatNumbers } },
      { $set: { status: 'booked', booking: booking._id, heldBy: null, heldUntil: null } }
    );

    // Update match available seats
    for (const seat of booking.seats) {
      await Match.updateOne(
        { _id: booking.match, 'ticketCategories.name': seat.category },
        { $inc: { 'ticketCategories.$.availableSeats': -1 } }
      );
    }

    // Update user's bookings
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

    // Release seats
    const seatNumbers = booking.seats.map(s => s.seatNumber);
    await Seat.updateMany(
      { match: booking.match, seatNumber: { $in: seatNumbers } },
      { $set: { status: 'available', booking: null } }
    );

    // Restore available seats in match
    for (const seat of booking.seats) {
      await Match.updateOne(
        { _id: booking.match, 'ticketCategories.name': seat.category },
        { $inc: { 'ticketCategories.$.availableSeats': 1 } }
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
