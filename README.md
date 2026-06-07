# 📚 MangaVerse

A full-stack manga reading web application built with React, Express.js, MongoDB and web scraping.

## 🌐 Live Demo

| | URL |
|---|---|
| 🖥️ **Frontend** | [mangaverse-beta-lemon.vercel.app](https://mangaverse-beta-lemon.vercel.app) |
| ⚙️ **Backend API** | [mangaverse-production-e461.up.railway.app/api/health](https://mangaverse-production-e461.up.railway.app/api/health) |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Scraper | MangaDex API + Cheerio |
| Auth | JWT + bcrypt |
| Hosting | Vercel (frontend) + Railway (backend) |

## 👥 Contributors

| Contributor | GitHub | Features |
|-------------|--------|----------|
| Daniel Omole | [@daniel7050](https://github.com/daniel7050) | Scaffold, DB schemas, Scraper, API, Homepage, Reader, Progress tracker, Search dropdown, Chapter scraping, Deployment |
| Hamzat Olajuwon | [@juwonabdullahi007-arch](https://github.com/juwonabdullahi007-arch) | Auth, Detail page, Search & filter, Bookmarks, Dark/light mode, Related manga, Avatar upload |

## ✨ Features

- 📖 Browse thousands of manga titles with cover art
- 🔍 Live search dropdown with debounced suggestions
- 🗂️ Genre, status and sort filters
- 📚 Full chapter reader with keyboard navigation
- 🔐 User auth (register, login, forgot/reset password)
- 🔖 Bookmarks and reading progress tracking
- 👤 User profile with avatar upload
- 🌙 Dark/light mode toggle
- 🔗 Related manga recommendations

## 🚀 Local Development

```bash
# Clone
git clone https://github.com/daniel7050/mangaverse.git
cd mangaverse

# Server
cd server && npm install
cp .env.example .env  # fill in your values
npm run dev

# Client
cd ../client && npm install
npm start
```

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/manga` | List manga (paginated, filterable) |
| GET | `/api/manga/trending` | Trending manga |
| GET | `/api/manga/:id` | Manga detail |
| GET | `/api/manga/:id/chapters` | Chapter list |
| POST | `/api/manga/scrape` | Trigger manga scrape |
| POST | `/api/manga/:id/scrape-chapters` | Scrape chapters for manga |
| GET | `/api/chapters/by-manga/:id/:num` | Get chapter pages |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request reset code |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/change-password` | Change password |
| GET | `/api/user/bookmarks` | Get bookmarks |
| POST | `/api/user/bookmarks` | Add bookmark |
| GET | `/api/user/progress` | Reading progress |
| POST | `/api/user/progress` | Update progress |

## 📄 License
MIT
