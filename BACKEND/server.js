import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 5000;

// Allow CORS for frontend dev
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // use specific origin in production
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  next();
});

app.get('/responses', (req, res) => {
  const filePath = path.resolve('new.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('❌ Error reading new.json:', err.message);
      return res.status(500).json({ error: 'Failed to read responses' });
    }

    try {
      const parsedData = JSON.parse(data);
      res.json(parsedData);
    } catch (parseError) {
      res.status(500).json({ error: 'Error parsing JSON' });
    }
  });
});

app.use('/attachments', express.static(path.resolve('attachments')));

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/responses`);
});
