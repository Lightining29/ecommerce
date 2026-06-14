import express from 'express';
import Contact from '../models/Contact.js';

const router = express.Router();

// Public: Submit a contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }
    const contact = await Contact.create({ name, email, subject, message, ip: req.ip });
    res.status(201).json({ message: 'Message received', id: contact._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
