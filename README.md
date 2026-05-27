# 📚 MangaVerse

A full-stack manga reading web application built with React, Express.js, MongoDB, and web scraping.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Scraper | Cheerio + Axios |
| Auth | JWT + bcrypt |
| Styling | CSS Modules + CSS Variables |

## 📁 Project Structure

```
mangaverse/
├── client/          # React frontend
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route-level pages
│       ├── hooks/        # Custom React hooks
│       ├── context/      # Auth & app context
│       └── utils/        # Helpers & API calls
├── server/          # Express backend
│   ├── routes/      # API route definitions
│   ├── controllers/ # Route handlers
│   ├── models/      # Mongoose schemas
│   ├── middleware/  # Auth, error handling
│   ├── services/    # Business logic
│   └── scrapers/    # Web scraping engine
└── shared/          # Shared constants & types
```

## 👥 Contributors

| Contributor | GitHub | Assigned Features |
|-------------|--------|-------------------|
| Daniel Omole | [@daniel7050](https://github.com/daniel7050) | Scaffold, DB schemas, Scraper, API, Homepage UI, Reader, Progress tracker |
| Hamzat Olajuwon | [@juwonabdullahi007-arc](https://github.com/juwonabdullahi007-arc) | Auth, Manga detail page, Search & filter, Bookmarks, Dark/light mode |

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### Installation

```bash
git clone https://github.com/daniel7050/mangaverse.git
cd mangaverse
cd server && npm install
cd ../client && npm install
```

### Environment Setup

```bash
# server/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mangaverse
JWT_SECRET=your_super_secret_key

# client/.env
REACT_APP_API_URL=http://localhost:5000/api
```

### Running

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm start
```

## 📋 Feature Checklist

### Daniel's Features
- [x] Project scaffold & folder structure
- [x] MongoDB schemas (Manga, Chapter, User)
- [x] Web scraper service
- [x] REST API endpoints
- [x] Homepage UI (trending/latest grid)
- [x] Chapter reader UI
- [x] Reading progress tracker

### Hamzat's Features
- [ ] User auth (register/login with JWT)
- [ ] Manga detail page
- [ ] Search bar + genre filter
- [ ] Bookmarks / reading list
- [ ] Dark/light mode toggle

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/manga` | List all manga (paginated) |
| GET | `/api/manga/trending` | Trending manga |
| GET | `/api/manga/:id` | Single manga detail |
| GET | `/api/manga/:id/chapters` | Chapter list |
| GET | `/api/chapters/:id` | Chapter pages |
| GET | `/api/manga/search?q=` | Search manga |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/user/bookmarks` | Get bookmarks |
| POST | `/api/user/bookmarks` | Add bookmark |
| GET | `/api/user/progress` | Reading progress |
| POST | `/api/user/progress` | Update progress |

## 📄 License
MIT
