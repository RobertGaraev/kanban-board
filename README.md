📝 Kanban App

Простой Kanban для управления задачами с ролями пользователя, колонками, карточками и drag&drop.

🚀 Стек технологий
Frontend: React + TypeScript + Tailwind CSS
Backend: Node.js + Express + Prisma + PostgreSQL
Синхронизация: WebSocket (пока локальная)
Docker: для контейнеризации фронта, бэка и БД

🛠 Инструкции по запуску Kanban
Запуск через Docker (рекомендуется)
Клонируем репозиторий:
git clone https://github.com/RobertGaraev/kanban-board
cd kanban-board

Создаём .env файл (если не создан. смоттреть в backend) с настройками БД и бекенда:

# .env

DATABASE_URL=postgresql://postgres:password@postgres:5432/kanban
JWT_SECRET=your_secret

Запускаем все сервисы через Docker Compose:
docker-compose up --build

⚠️ Фронтенд запускается на http://localhost:3001
Backend на http://localhost:3000
База данных PostgreSQL внутри контейнера на порту 5432 (локально к ней подключаться не нужно, только через backend)

Проверяем, что контейнеры работают:
docker ps
kanban-frontend → фронт
kanban-backend → бек
kanban-db → база

3️⃣ Локальный запуск без Docker
Если хочешь работать локально:

В одной вкладке терминала запускаем PostgreSQL (можно через Docker или локально)
В корне проекта создаём .env:
DATABASE_URL=postgresql://postgres:password@localhost:5432/kanban
JWT_SECRET=your_secret

Запускаем backend:
cd .\backend\
npm install
npx prisma migrate deploy # применяем миграции
npm run start:dev

Запускаем frontend:
cd .\frontend\
npm install
npm run dev

Фронт доступен на http://localhost:3001
Backend на http://localhost:3000

⚡ Функционал
Регистрация и вход (email + пароль)
Создание/удаление досок
Роли: owner, editor, viewer
Колонки: создание/редактирование/удаление
Карточки: создание/редактирование/удаление (заголовок, описание, исполнитель, метки, дедлайн)
Drag&drop между колонками
Синхронизация между пользователями (WebSocket) - планируется в будущем
Хранение данных в PostgreSQL
Минимальные unit/integration тесты (frontend/backend)

🧪 Тесты
Backend: npm run test в папке kanban-backend
Frontend: npm run test в папке kanban-frontend

📄 Примечания
Для сброса данных в Docker:
docker-compose down -v
docker-compose up --build

⚠️ Это удалит все данные PostgreSQL!
