# Soundify

A full-stack music streaming web application built with the MERN stack. Soundify provides music discovery, audio playback, personal libraries, playlists, listening history, queue management, and an administrative content-management dashboard.

[![Live Demo](https://img.shields.io/badge/Live_Demo-1DB954?style=for-the-badge&logo=spotify&logoColor=white)](https://soundify-frontend.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20232A?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)

## Overview

Soundify demonstrates the development of a complete music-streaming platform with a React frontend and an Express REST API.

The application supports public music discovery, authenticated user libraries, persistent listening activity, media playback, and protected administration workflows.

## Key Features

### Music Discovery

- Browse featured songs, albums, and artists
- Search published music
- View artist profiles and discographies
- View album details and track listings
- Public access to music discovery pages

### Audio Player

- Play and pause audio
- Previous and next controls
- Seekable playback progress
- Shuffle and repeat controls
- Persistent global player
- Queue and “Next Up” management

### User Library

- User registration and login
- Favorite songs
- Recently played tracks
- Listening history
- Create, edit, and delete playlists
- Add and remove songs from playlists
- Protected personal-library routes

### Administration

- Protected admin dashboard
- Artist management
- Album management
- Song management
- Image upload through Cloudinary
- Audio upload through Supabase Storage
- Published-content controls
- Protected frontend and backend admin routes

### User Experience

- Responsive desktop, tablet, and mobile layouts
- Reusable React components
- Global toast notifications
- Loading, error, and empty states
- Guest-friendly public browsing
- Consistent navigation and media controls

## Architecture

```text
React + Vite frontend
        │
        │ HTTP / REST API
        ▼
Node.js + Express backend
        │
        ├── MongoDB Atlas — application data
        ├── Cloudinary — artist, album, and song images
        └── Supabase Storage — audio files
```

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Lucide React
- JavaScript
- Custom responsive CSS

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JSON Web Token
- bcryptjs
- Express Validator
- Multer

### Media and Deployment

- Cloudinary
- Supabase Storage
- Vercel
- Back4App
- Git and GitHub

## Project Structure

```text
Spotify_MERN/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB Atlas database
- Cloudinary account
- Supabase project and Storage bucket

### 1. Clone the Repository

```bash
git clone https://github.com/farrellokajaya/Spotify_MERN.git
cd Spotify_MERN
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env`, then configure:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=replace_with_a_secure_random_secret
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_FOLDER=soundify

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_AUDIO_BUCKET=soundify-audio

FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

### 3. Configure the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env`, then configure:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Available Scripts

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server |
| `npm run lint` | Runs ESLint |
| `npm run build` | Creates a production build |
| `npm run preview` | Previews the production build |

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Starts the API with Nodemon |
| `npm start` | Starts the API in production mode |
| `npm run seed:demo` | Creates configured demonstration data |

## API Groups

```text
/api/health
/api/auth
/api/music
/api/library
/api/playlists
/api/history
/api/admin
```

## Security Considerations

- Passwords are hashed before storage
- Authentication uses signed JSON Web Tokens
- Admin routes require administrative authorization
- Upload routes validate supported media
- Request bodies use size restrictions
- API responses do not expose credentials
- CORS access is restricted through configured frontend origins
- Environment files and service-role credentials must never be committed

## Deployment

- **Frontend:** Vercel
- **Backend:** Back4App
- **Database:** MongoDB Atlas
- **Images:** Cloudinary
- **Audio:** Supabase Storage

Live application:

[https://soundify-frontend.vercel.app/](https://soundify-frontend.vercel.app/)

Because the backend uses free hosting, the first request may take longer while the service starts.

## Project Status

Soundify is feature-complete as a portfolio project. Future improvements may include automated testing, improved accessibility, stronger media analytics, and deployment monitoring.

## Author

**Farrel Lokajaya**

- [Portofolio](https://farrel-portofolio-liard.vercel.app/)
- [LinkedIn](https://www.linkedin.com/in/farrel-lokajaya-a25944203/)
- [GitHub](https://github.com/farrellokajaya)
