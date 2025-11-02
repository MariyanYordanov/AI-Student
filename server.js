import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the frontend dist directory
const distPath = join(__dirname, 'frontend', 'dist');

// Check if dist directory exists
if (!existsSync(distPath)) {
  console.error(`[ERROR] Frontend dist directory not found at: ${distPath}`);
  console.error(`Current working directory: ${process.cwd()}`);
  console.error(`Server root directory: ${__dirname}`);
  process.exit(1);
}

console.log(`[OK] Frontend dist directory found at: ${distPath}`);

const indexPath = join(distPath, 'index.html');
if (!existsSync(indexPath)) {
  console.error(`[ERROR] index.html not found at: ${indexPath}`);
  process.exit(1);
}

console.log(`[OK] index.html found at: ${indexPath}`);

// Middleware to handle SPA routing
app.use((req, res, next) => {
  // If it's a request for a file with extension, let express.static handle it
  if (req.path.includes('.')) {
    return next();
  }

  // If it's an API call, let express.static pass it through
  if (req.path.startsWith('/api/')) {
    return next();
  }

  // For all other routes, serve index.html (SPA routing)
  console.log(`[DEBUG] SPA route: ${req.path} - serving index.html`);
  res.sendFile(indexPath);
});

// Serve static files after SPA routing check
app.use(express.static(distPath));

app.listen(PORT, () => {
  console.log(`[OK] Server running on port ${PORT}`);
  console.log(`[OK] Serving from: ${distPath}`);
});
