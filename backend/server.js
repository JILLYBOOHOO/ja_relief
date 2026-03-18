const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const survivorRoutes = require('./survivorroutes/survivors');
app.use('/api/survivors', survivorRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('JA Relief API running');
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`JA Relief API running on port ${PORT}`);
});
