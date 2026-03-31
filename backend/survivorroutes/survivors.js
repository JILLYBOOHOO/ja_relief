const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // ensure "uploads" folder exists in backend
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
  }
});

// Middleware to handle validation results
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Register survivor
router.post('/register', 
  upload.single('idScan'),
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('contact').notEmpty().withMessage('Contact is required'),
    body('idNumber').notEmpty().withMessage('ID Number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  validateResults,
  async (req, res, next) => {
    try {
      const {
        fullName, contact, idType, idNumber, provisional,
        parish, address, dob, damageLevel, password
      } = req.body;

      const idScanPath = req.file ? req.file.filename : null;

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const sql = `
        INSERT INTO survivors
        (fullName, contact, idType, idNumber, provisional, parish, address, dob, damageLevel, password, idScanPath)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        fullName, contact, idType, idNumber, provisional, 
        parish, address, dob, damageLevel, hashedPassword, idScanPath
      ]);

      res.status(201).json({ message: 'Survivor registered successfully', survivorId: result.insertId });
    } catch (err) {
      next(err); // pass to global error handler
    }
  }
);

// Login survivor
router.post('/login', [
  body('idNumber').notEmpty().withMessage('ID Number is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validateResults, async (req, res, next) => {
  try {
    const { idNumber, password } = req.body;

    const [rows] = await db.query('SELECT * FROM survivors WHERE idNumber = ?', [idNumber]);
    if (rows.length === 0) {
      return res.status(401).json({ error: `Account with ID Number '${idNumber}' not found. Please verify your ID or register for a new account.` });
    }

    const survivor = rows[0];
    const isMatch = await bcrypt.compare(password, survivor.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign(
      { id: survivor.id, idNumber: survivor.idNumber, role: 'survivor' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: survivor.id,
        name: survivor.fullName,
        idNumber: survivor.idNumber,
        role: 'survivor'
      }
    });


  } catch (err) {
    next(err);
  }
});

module.exports = router;

