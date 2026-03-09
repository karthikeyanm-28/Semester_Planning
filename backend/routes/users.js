import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

// Get or create user by Firebase UID
router.post('/sync', async (req, res) => {
  try {
    const { firebaseUid, name, email, institution } = req.body;
    
    if (!firebaseUid || !email) {
      return res.status(400).json({ error: 'firebaseUid and email are required' });
    }

    let user = await User.findOne({ firebaseUid });
    
    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.email = email || user.email;
      if (institution !== undefined) user.institution = institution;
      await user.save();
    } else {
      // Create new user
      user = await User.create({ firebaseUid, name, email, institution: institution || '' });
    }

    res.json({
      id: user.firebaseUid,
      name: user.name,
      email: user.email,
      institution: user.institution,
    });
  } catch (error) {
    console.error('User sync error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Update user profile
router.put('/:firebaseUid', async (req, res) => {
  try {
    const { name, email, institution } = req.body;
    const user = await User.findOneAndUpdate(
      { firebaseUid: req.params.firebaseUid },
      { name, email, institution },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.firebaseUid,
      name: user.name,
      email: user.email,
      institution: user.institution,
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
