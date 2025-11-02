import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static('dist'));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile('dist/index.html', { root: __dirname });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
