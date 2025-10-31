# 🚀 Quick Start Guide

## Стъпка 1: Gemini API Key

1. Отиди на: https://makersuite.google.com/app/apikey
2. Натисни "Create API Key"
3. Копирай ключа

## Стъпка 2: Настройка

```bash
# Редактирай backend/.env файла
nano backend/.env

# Промени тази линия:
GEMINI_API_KEY=your_gemini_api_key_here

# На:
GEMINI_API_KEY=твоят_реален_ключ_тук
```

## Стъпка 3: Инсталация (ако не си го направил)

```bash
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install
npm run seed  # Създава тестов потребител

# Frontend dependencies
cd ../frontend
npm install

cd ..
```

## Стъпка 4: Стартиране

**Вариант 1: Стартирай всичко наведнъж**
```bash
npm run dev
```

**Вариант 2: Стартирай отделно (2 терминала)**

Терминал 1 (Backend):
```bash
cd backend
npm run dev
```

Терминал 2 (Frontend):
```bash
cd frontend
npm run dev
```

## Стъпка 5: Отвори в браузър

Frontend: **http://localhost:3000**

## ✅ Проверка

1. Backend работи ли? → http://localhost:4000/health
2. Frontend зареди ли се? → http://localhost:3000
3. Можеш ли да създадеш AI ученик?

## ❌ Troubleshooting

### Грешка: "Грешка при стартиране на сесия"

**Причина 1: Липсва Gemini API Key**
```bash
# Провери backend/.env
cat backend/.env | grep GEMINI

# Трябва да видиш валиден ключ, НЕ "your_gemini_api_key_here"
```

**Причина 2: Backend не работи**
```bash
# Провери дали backend работи
curl http://localhost:4000/health

# Трябва да видиш: {"status":"ok",...}
```

**Причина 3: Няма потребител в базата**
```bash
cd backend
npm run seed
```

### Грешка: "Port 4000 already in use"

```bash
# Намери и убий процеса
lsof -ti:4000 | xargs kill -9

# После стартирай отново
npm run dev
```

### Грешка: "Cannot find module @prisma/client"

```bash
cd backend
npx prisma generate
```

## 🎉 Готово!

Сега можеш да:
1. Създадеш AI ученик с име (напр. "Георги")
2. Избереш тема (напр. "променливи в JavaScript")
3. Започнеш да го обучаваш!

**Пример за обучение:**
- Ти: "Здравей! Днес ще те науча какво е променлива. Променливата е като кутия, в която пазим стойност."
- AI: "Ааа! Значи променливата е като кутия за неща? 😃"
- Ти: "Точно така! В JavaScript ползваме `let` за да създадем променлива."
- AI: "let е ключова дума, нали? Как я пиша?"

Успех! 🚀
