import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the frontend dist directory
const distPath = join(__dirname, 'frontend', 'dist');
app.use(express.static(distPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: distPath });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}, serving from ${distPath}`);
});
