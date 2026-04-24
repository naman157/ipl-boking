const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// @POST /api/payments/create-intent - Create Stripe payment intent
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id })
      .populate('match', 'team1 team2 date venue matchNumber');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.paymentStatus === 'paid') return res.status(400).json({ error: 'Already paid' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.grandTotal * 100, // paise
      currency: 'inr',
      metadata: {
        bookingId: booking._id.toString(),
        bookingRef: booking.bookingId,
        userId: req.user._id.toString(),
        matchNumber: booking.match.matchNumber.toString()
      },
      description: `IPL 2025 - Match #${booking.match.matchNumber}: ${booking.match.team1.shortName} vs ${booking.match.team2.shortName}`,
      receipt_email: req.user.email
    });

    // Save payment intent ID to booking
    booking.paymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: booking.grandTotal,
      bookingId: booking._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @POST /api/payments/verify - Verify payment and confirm booking
router.post('/verify', protect, async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: `Payment not successful. Status: ${paymentIntent.status}` });
    }

    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.qrCode = `IPL-QR-${booking.bookingId}-${Date.now()}`;
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @POST /api/payments/webhook - Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata.bookingId;

    try {
      await Booking.findByIdAndUpdate(bookingId, {
        status: 'confirmed',
        paymentStatus: 'paid'
      });
    } catch (err) {
      console.error('Webhook booking update error:', err);
    }
  }

  res.json({ received: true });
});

module.exports = router;
