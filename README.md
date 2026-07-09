# Soundify

Soundify is a MERN stack music streaming web application inspired by Spotify. It includes user authentication, music browsing, a real audio player, favorites, playlists, listening history, queue management, and an admin dashboard for managing artists, albums, songs, and media uploads.

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT authentication
- Cloudinary for image storage
- Supabase Storage for audio storage

### Frontend

- React
- Vite
- React Router
- Lucide React
- CSS Modules / custom CSS structure

## Main User Features

- Register and login
- Browse songs, albums, and artists
- Search music
- Artist detail page
- Album detail page
- Real audio player
- Play, pause, previous, and next controls
- Shuffle and repeat controls
- Queue / Next Up
- Favorite songs
- User playlists
- Add songs to playlist
- Recently played / listening history
- Global toast notification
- Responsive layout for desktop, tablet, and mobile

## Admin Features

- Admin dashboard
- CRUD Artist
- CRUD Album
- CRUD Song
- Upload artist, album, and song images to Cloudinary
- Upload song audio to Supabase Storage
- Protected admin routes on both frontend and backend

## Folder Structure

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
├── .gitignore
└── README.md