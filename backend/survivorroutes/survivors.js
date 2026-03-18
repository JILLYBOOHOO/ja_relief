const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // create "uploads" folder in backend
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post('/register', upload.single('idScan'), (req, res) => {
  const {
    fullName, contact, idType, idNumber, provisional,
    parish, address, dob, damageLevel, password
  } = req.body;

  // If a file was uploaded
  const idScanPath = req.file ? req.file.filename : null;




  const sql = `
    INSERT INTO survivors
    (fullName, contact, idType, idNumber, provisional, parish, address, dob, damageLevel, password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [fullName, contact, idType, idNumber, provisional, parish, address, dob, damageLevel, password],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database insert failed' });
      }
      res.json({ message: 'Survivor registered successfully', survivorId: result.insertId });
    }
  );
});

module.exports = router;
