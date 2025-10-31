# Setup Instructions

## Стъпки за стартиране на проекта

### 1. Инсталиране на dependencies

```bash
# От root директорията
npm install

# Влез в backend и инсталирай
cd backend
npm install

# Влез във frontend и инсталирай
cd ../frontend
npm install

cd ..
```

### 2. Настройка на Gemini API Key

1. Отиди на [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Създай нов API key
3. Копирай `.env.example` в backend:

```bash
cd backend
cp .env.example .env
```

4. Редактирай `backend/.env` и добави твоя API key:

```
GEMINI_API_KEY=твоят_ключ_тук
```

### 3. Настройка на базата данни

```bash
cd backend

# Генерирай Prisma client
npx prisma generate

# Създай базата данни
npx prisma migrate dev --name init

# (Опционално) Отвори Prisma Studio за да видиш данните
npx prisma studio
```

### 4. Стартиране на приложението

От root директорията:

```bash
# Стартира и backend и frontend едновременно
npm run dev
```

Или отделно в 2 терминала:

```bash
# Терминал 1 - Backend
cd backend
npm run dev

# Терминал 2 - Frontend
cd frontend
npm run dev
```

### 5. Отвори приложението

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Health check: http://localhost:4000/health

## Възможни проблеми

### Problem: "GEMINI_API_KEY not set"
**Решение**: Провери дали си създал `backend/.env` файл и си добавил API ключа

### Problem: "Cannot find module @prisma/client"
**Решение**:
```bash
cd backend
npx prisma generate
```

### Problem: Port 3000 или 4000 са заети
**Решение**: Промени портовете в:
- Backend: `backend/.env` -> `PORT=4001`
- Frontend: `frontend/vite.config.ts` -> `port: 3001`

## Следващи стъпки

След като всичко работи:

1. ✅ Създай AI ученик
2. ✅ Започни сесия за обучение
3. ✅ Опитай да обясниш променливи в JavaScript
4. ✅ Виж как AI ученикът реагира

Успех! 🚀
