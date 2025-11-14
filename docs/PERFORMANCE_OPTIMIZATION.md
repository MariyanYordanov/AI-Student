# Performance Optimization Guide

This document outlines performance optimization strategies and implementations for the Aily application.

## Overview

The application is optimized for:
- Fast initial page load
- Responsive user interactions
- Efficient API communication
- Minimal memory usage
- Smooth animations and transitions

## Frontend Optimizations

### 1. Code Splitting

Implement lazy loading for route components:

```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const TeachingSession = lazy(() => import('./pages/TeachingSession'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/teach/:id" element={<TeachingSession />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. Component Memoization

Memoize expensive components:

```typescript
import { memo } from 'react';

const TopicCard = memo(({ topic, onSelect }) => {
  return (
    <div onClick={() => onSelect(topic)}>
      {topic.title}
    </div>
  );
});

export default TopicCard;
```

### 3. useMemo and useCallback Hooks

Optimize expensive computations:

```typescript
import { useMemo, useCallback } from 'react';

function Dashboard() {
  const topics = useTopicsStore(state => state.topics);

  const sortedTopics = useMemo(
    () => topics.sort((a, b) => a.difficulty.localeCompare(b.difficulty)),
    [topics]
  );

  const handleSelect = useCallback((topicId) => {
    fetchTopic(topicId);
  }, []);

  return <TopicList topics={sortedTopics} onSelect={handleSelect} />;
}
```

### 4. Image Optimization

Use responsive images and lazy loading:

```typescript
<img
  src="image.webp"
  alt="description"
  loading="lazy"
  width="400"
  height="300"
  srcSet="image-small.webp 400w, image-large.webp 800w"
/>
```

### 5. CSS Optimization

- Use Tailwind's production build to remove unused CSS
- Enable CSS minification in build process
- Use CSS variables for dynamic theming

```javascript
vite.config.ts
export default {
  build: {
    minify: 'terser',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'state': ['zustand'],
        }
      }
    }
  }
}
```

### 6. Bundle Size Reduction

Analyze bundle with:

```bash
npm install -D @vitejs/plugin-visualizer
```

In vite.config.ts:

```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
    })
  ]
}
```

### 7. Network Requests Optimization

Implement request debouncing and caching:

```typescript
import { useMemo, useCallback } from 'react';

const requestCache = new Map();

function useApi(url) {
  const cachedData = useMemo(
    () => requestCache.get(url),
    [url]
  );

  const fetchData = useCallback(async () => {
    if (requestCache.has(url)) {
      return requestCache.get(url);
    }

    const response = await fetch(url);
    const data = await response.json();
    requestCache.set(url, data);
    return data;
  }, [url]);

  return { data: cachedData, fetch: fetchData };
}
```

### 8. Debounce Input Handlers

```typescript
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function SearchUsers() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query);

  useEffect(() => {
    if (debouncedQuery) {
      searchUsers(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### 9. Virtual Scrolling

For long lists, use virtual scrolling:

```bash
npm install react-window
```

```typescript
import { FixedSizeList } from 'react-window';

function SessionList({ sessions }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={sessions.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {sessions[index].title}
        </div>
      )}
    </FixedSizeList>
  );
}
```

## Backend Optimizations

### 1. Database Query Optimization

Use Prisma select to fetch only needed fields:

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
    ailyInstance: {
      select: {
        id: true,
        level: true,
        totalXP: true,
      }
    }
  }
});
```

### 2. Pagination

Implement pagination for large datasets:

```typescript
router.get('/sessions', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const sessions = await prisma.session.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.session.count();

  res.json({
    data: sessions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    }
  });
});
```

### 3. Connection Pooling

Configure Prisma for connection pooling:

```env
DATABASE_URL="postgresql://user:password@host:5432/db?schema=public&sslmode=require"
PRISMA_CONNECTION_POOL_MIN=2
PRISMA_CONNECTION_POOL_MAX=10
```

### 4. Caching Layer

Implement Redis caching:

```bash
npm install redis
```

```typescript
import redis from 'redis';

const redisClient = redis.createClient();

async function getTopicWithCache(topicId) {
  const cached = await redisClient.get(`topic:${topicId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId }
  });

  await redisClient.setEx(`topic:${topicId}`, 3600, JSON.stringify(topic));
  return topic;
}
```

### 5. API Rate Limiting

Rate limit to prevent abuse:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
});

app.use('/api/', limiter);
```

### 6. Compression

Enable gzip compression:

```typescript
import compression from 'compression';

app.use(compression());
```

### 7. Response Caching

Cache static responses:

```typescript
app.get('/api/topics', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.json(topics);
});
```

### 8. Async Operations

Use async/await and promise batching:

```typescript
async function startSession(studentId, topicId) {
  const [student, topic, aily] = await Promise.all([
    prisma.user.findUnique({ where: { id: studentId } }),
    prisma.topic.findUnique({ where: { id: topicId } }),
    prisma.ailyInstance.findFirst({
      where: { userId: studentId }
    }),
  ]);

  return createSession(student, topic, aily);
}
```

## Monitoring and Profiling

### 1. Frontend Performance Monitoring

Use Web Vitals:

```bash
npm install web-vitals
```

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 2. Backend Performance Monitoring

Add timing logs:

```typescript
function timingMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });

  next();
}

app.use(timingMiddleware);
```

### 3. Error Tracking

Use Sentry for error tracking:

```bash
npm install @sentry/node
```

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

## Build Optimization

### Frontend Build

```bash
npm run build
```

This runs:
1. TypeScript compilation (`tsc`)
2. Vite build with minification
3. CSS splitting and minification
4. Tree-shaking of unused code

### Backend Build

```bash
npm run build
```

This runs:
1. Prisma generation
2. TypeScript compilation to JavaScript

## Performance Targets

Aim for these metrics:

Frontend (Lighthouse):
- Performance: 90+
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.8s

Backend:
- API response time: < 200ms (50th percentile)
- API response time: < 500ms (95th percentile)
- Database query time: < 100ms
- Uptime: > 99.9%

## Monitoring Commands

Check backend performance:

```bash
cd backend
npm test  # Run with performance baseline
```

Check frontend bundle size:

```bash
cd frontend
npm run build
# Check dist/ folder size
```

## Future Optimizations

1. Implement service workers for offline support
2. Add Progressive Web App (PWA) capabilities
3. Optimize AI response generation with caching
4. Implement request batching for API calls
5. Add database read replicas for scaling
6. Implement WebSocket for real-time features
7. Add CDN for static assets
8. Implement incremental static regeneration (ISR)

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [React Profiler](https://react.dev/reference/react/Profiler)
- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Express Performance](https://expressjs.com/en/advanced/best-practice-performance.html)
