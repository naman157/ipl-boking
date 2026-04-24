const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const { protect } = require('../middleware/auth');

// IPL 2025 Teams data
const IPL_TEAMS = {
  CSK: { name: 'Chennai Super Kings', shortName: 'CSK', color: '#F5A800' },
  MI: { name: 'Mumbai Indians', shortName: 'MI', color: '#004BA0' },
  RCB: { name: 'Royal Challengers Bengaluru', shortName: 'RCB', color: '#EC1C24' },
  KKR: { name: 'Kolkata Knight Riders', shortName: 'KKR', color: '#3A225D' },
  DC: { name: 'Delhi Capitals', shortName: 'DC', color: '#0078BC' },
  PBKS: { name: 'Punjab Kings', shortName: 'PBKS', color: '#ED1B24' },
  RR: { name: 'Rajasthan Royals', shortName: 'RR', color: '#EA1A85' },
  SRH: { name: 'Sunrisers Hyderabad', shortName: 'SRH', color: '#FF6200' },
  GT: { name: 'Gujarat Titans', shortName: 'GT', color: '#1C1C5E' },
  LSG: { name: 'Lucknow Super Giants', shortName: 'LSG', color: '#A72B2A' }
};

// @GET /api/matches - Get all matches
// @GET /api/matches - Get all matches
router.get('/', async (req, res) => {
  try {
    const { status, city, team } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (city) filter['venue.city'] = new RegExp(city, 'i');
    if (team) {
      filter.$or = [
        { 'team1.shortName': team.toUpperCase() },
        { 'team2.shortName': team.toUpperCase() }
      ];
    }

    const matches = await Match.find(filter).sort({ date: 1 });

    // Auto-update status based on current date
    const now = new Date();
    const updatePromises = matches.map(match => {
      if (match.status === 'cancelled') return null;

      const matchStart = new Date(match.date);
      const matchEnd = new Date(match.date);
      matchEnd.setHours(matchEnd.getHours() + 4);

      let newStatus;
      if (now < matchStart) newStatus = 'upcoming';
      else if (now >= matchStart && now <= matchEnd) newStatus = 'live';
      else newStatus = 'completed';

      if (newStatus !== match.status) {
        match.status = newStatus;
        return match.save();
      }
      return null;
    });

    await Promise.all(updatePromises.filter(Boolean));
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @GET /api/matches/:id
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @POST /api/matches/seed - Seed sample matches (dev only)
router.post('/seed', async (req, res) => {
  try {
    await Match.deleteMany({});

    const matches = [
      {
        matchNumber: 1,
        team1: IPL_TEAMS.CSK, team2: IPL_TEAMS.RCB,
        venue: { name: 'MA Chidambaram Stadium', city: 'Chennai', capacity: 50000 },
        date: new Date('2025-03-22'), time: '7:30 PM IST',
        ticketCategories: [
          { name: 'Platinum Pavilion', price: 5000, totalSeats: 2000, availableSeats: 1800, color: '#E5C100' },
          { name: 'Gold Stand', price: 2500, totalSeats: 8000, availableSeats: 7200, color: '#FFD700' },
          { name: 'Silver Stand', price: 1500, totalSeats: 15000, availableSeats: 12000, color: '#C0C0C0' },
          { name: 'General', price: 600, totalSeats: 25000, availableSeats: 20000, color: '#CD7F32' }
        ]
      },
      {
        matchNumber: 2,
        team1: IPL_TEAMS.MI, team2: IPL_TEAMS.KKR,
        venue: { name: 'Wankhede Stadium', city: 'Mumbai', capacity: 33108 },
        date: new Date('2025-03-23'), time: '3:30 PM IST',
        ticketCategories: [
          { name: 'Platinum Pavilion', price: 6000, totalSeats: 1500, availableSeats: 1200, color: '#E5C100' },
          { name: 'Gold Stand', price: 3000, totalSeats: 6000, availableSeats: 5500, color: '#FFD700' },
          { name: 'Silver Stand', price: 1800, totalSeats: 12000, availableSeats: 10000, color: '#C0C0C0' },
          { name: 'General', price: 800, totalSeats: 13608, availableSeats: 11000, color: '#CD7F32' }
        ]
      },
      {
        matchNumber: 3,
        team1: IPL_TEAMS.SRH, team2: IPL_TEAMS.DC,
        venue: { name: 'Rajiv Gandhi Intl Cricket Stadium', city: 'Hyderabad', capacity: 55000 },
        date: new Date('2025-03-24'), time: '7:30 PM IST',
        ticketCategories: [
          { name: 'Platinum Pavilion', price: 4500, totalSeats: 2500, availableSeats: 2200, color: '#E5C100' },
          { name: 'Gold Stand', price: 2000, totalSeats: 10000, availableSeats: 9000, color: '#FFD700' },
          { name: 'Silver Stand', price: 1200, totalSeats: 18000, availableSeats: 15000, color: '#C0C0C0' },
          { name: 'General', price: 500, totalSeats: 24500, availableSeats: 20000, color: '#CD7F32' }
        ]
      },
      {
        matchNumber: 4,
        team1: IPL_TEAMS.GT, team2: IPL_TEAMS.RR,
        venue: { name: 'Narendra Modi Stadium', city: 'Ahmedabad', capacity: 132000 },
        date: new Date('2025-03-25'), time: '7:30 PM IST',
        ticketCategories: [
          { name: 'Platinum Pavilion', price: 7000, totalSeats: 5000, availableSeats: 4500, color: '#E5C100' },
          { name: 'Gold Stand', price: 3500, totalSeats: 20000, availableSeats: 18000, color: '#FFD700' },
          { name: 'Silver Stand', price: 2000, totalSeats: 50000, availableSeats: 45000, color: '#C0C0C0' },
          { name: 'General', price: 700, totalSeats: 57000, availableSeats: 50000, color: '#CD7F32' }
        ]
      },
      {
        matchNumber: 5,
        team1: IPL_TEAMS.PBKS, team2: IPL_TEAMS.LSG,
        venue: { name: 'PCA Stadium', city: 'Mohali', capacity: 26000 },
        date: new Date('2025-03-26'), time: '7:30 PM IST',
        ticketCategories: [
          { name: 'Platinum Pavilion', price: 3500, totalSeats: 1000, availableSeats: 800, color: '#E5C100' },
          { name: 'Gold Stand', price: 1800, totalSeats: 5000, availableSeats: 4200, color: '#FFD700' },
          { name: 'Silver Stand', price: 1000, totalSeats: 10000, availableSeats: 8000, color: '#C0C0C0' },
          { name: 'General', price: 400, totalSeats: 10000, availableSeats: 9000, color: '#CD7F32' }
        ]
      },
      {
        matchNumber: 70,
        team1: IPL_TEAMS.MI, team2: IPL_TEAMS.CSK,
        venue: { name: 'Wankhede Stadium', city: 'Mumbai', capacity: 33108 },

        date: new Date('2026-06-01'),
        matchType: 'final',
        ticketCategories: [
          { name: 'Platinum Pavilion', price: 15000, totalSeats: 1500, availableSeats: 1000, color: '#E5C100' },
          { name: 'Gold Stand', price: 8000, totalSeats: 6000, availableSeats: 4500, color: '#FFD700' },
          { name: 'Silver Stand', price: 4000, totalSeats: 12000, availableSeats: 9000, color: '#C0C0C0' },
          { name: 'General', price: 2000, totalSeats: 13608, availableSeats: 10000, color: '#CD7F32' }
        ]
      }
    ];

    const created = await Match.insertMany(matches);
    res.status(201).json({ message: `${created.length} matches seeded`, matches: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
