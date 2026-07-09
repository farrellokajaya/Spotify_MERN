import "dotenv/config";
import mongoose from "mongoose";

import connectDatabase from "../config/db.js";
import Album from "../models/album.model.js";
import Artist from "../models/artist.model.js";
import Song from "../models/song.model.js";
import { generateSlug, normalizeText } from "../utils/slug.js";

const demoAudioUrls = [
  process.env.DEMO_AUDIO_URL_1,
  process.env.DEMO_AUDIO_URL_2,
  process.env.DEMO_AUDIO_URL_3,
  process.env.DEMO_AUDIO_URL_4,
  process.env.DEMO_AUDIO_URL_5,
  process.env.DEMO_AUDIO_URL_6,
];

const ensureDemoAudioUrls = () => {
  const missingIndexes = demoAudioUrls
    .map((url, index) => ({ url, index: index + 1 }))
    .filter(({ url }) => !url || url.includes("example.com"))
    .map(({ index }) => `DEMO_AUDIO_URL_${index}`);

  if (missingIndexes.length > 0) {
    throw new Error(
      `Isi audio URL demo yang valid terlebih dahulu: ${missingIndexes.join(", ")}`,
    );
  }
};

const artistSeeds = [
  {
    name: "Neon Harbor",
    bio: "Electronic pop artist with clean synth textures and late-night city energy.",
    genres: ["Electronic", "Pop"],
    imageUrl: "",
  },
  {
    name: "Mila Verse",
    bio: "Warm indie vocalist focused on intimate melodies and soft acoustic arrangements.",
    genres: ["Indie", "Acoustic"],
    imageUrl: "",
  },
  {
    name: "Northline Echo",
    bio: "Alternative band blending atmospheric guitars, steady drums, and cinematic hooks.",
    genres: ["Alternative", "Rock"],
    imageUrl: "",
  },
];

const albumSeeds = [
  {
    title: "Midnight Signals",
    artistName: "Neon Harbor",
    description: "A compact electronic release built for focused listening sessions.",
    releaseDate: "2026-01-16",
    type: "ep",
    genres: ["Electronic", "Pop"],
    coverImageUrl: "",
  },
  {
    title: "Soft Windows",
    artistName: "Mila Verse",
    description: "Calm indie tracks with simple vocals and gentle acoustic production.",
    releaseDate: "2026-02-21",
    type: "album",
    genres: ["Indie", "Acoustic"],
    coverImageUrl: "",
  },
  {
    title: "Northern Lights",
    artistName: "Northline Echo",
    description: "Alternative rock songs with atmospheric arrangements and bright choruses.",
    releaseDate: "2026-03-08",
    type: "album",
    genres: ["Alternative", "Rock"],
    coverImageUrl: "",
  },
];

const songSeeds = [
  {
    title: "City Glow",
    artistName: "Neon Harbor",
    albumTitle: "Midnight Signals",
    durationSeconds: 198,
    trackNumber: 1,
    genres: ["Electronic", "Pop"],
    audioUrlIndex: 0,
  },
  {
    title: "Late Train",
    artistName: "Neon Harbor",
    albumTitle: "Midnight Signals",
    durationSeconds: 214,
    trackNumber: 2,
    genres: ["Electronic", "Synth Pop"],
    audioUrlIndex: 1,
  },
  {
    title: "Open Window",
    artistName: "Mila Verse",
    albumTitle: "Soft Windows",
    durationSeconds: 187,
    trackNumber: 1,
    genres: ["Indie", "Acoustic"],
    audioUrlIndex: 2,
  },
  {
    title: "Quiet Room",
    artistName: "Mila Verse",
    albumTitle: "Soft Windows",
    durationSeconds: 205,
    trackNumber: 2,
    genres: ["Indie", "Folk"],
    audioUrlIndex: 3,
  },
  {
    title: "Cold Horizon",
    artistName: "Northline Echo",
    albumTitle: "Northern Lights",
    durationSeconds: 231,
    trackNumber: 1,
    genres: ["Alternative", "Rock"],
    audioUrlIndex: 4,
  },
  {
    title: "Aurora Drive",
    artistName: "Northline Echo",
    albumTitle: "Northern Lights",
    durationSeconds: 246,
    trackNumber: 2,
    genres: ["Alternative", "Indie Rock"],
    audioUrlIndex: 5,
  },
];

const upsertArtist = async (artistSeed) => {
  const slug = generateSlug(artistSeed.name, "artist");

  return Artist.findOneAndUpdate(
    { slug },
    {
      $set: {
        ...artistSeed,
        normalizedName: normalizeText(artistSeed.name),
        slug,
        isActive: true,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
};

const upsertAlbum = async (albumSeed, artistMap) => {
  const artist = artistMap.get(albumSeed.artistName);

  if (!artist) {
    throw new Error(`Artist tidak ditemukan untuk album: ${albumSeed.title}`);
  }

  const slug = generateSlug(albumSeed.title, "album");

  return Album.findOneAndUpdate(
    {
      artist: artist._id,
      slug,
    },
    {
      $set: {
        title: albumSeed.title,
        normalizedTitle: normalizeText(albumSeed.title),
        slug,
        artist: artist._id,
        description: albumSeed.description,
        coverImageUrl: albumSeed.coverImageUrl,
        releaseDate: albumSeed.releaseDate ? new Date(albumSeed.releaseDate) : null,
        type: albumSeed.type,
        genres: albumSeed.genres,
        isPublished: true,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
};

const upsertSong = async (songSeed, artistMap, albumMap) => {
  const artist = artistMap.get(songSeed.artistName);
  const album = albumMap.get(`${songSeed.artistName}:${songSeed.albumTitle}`);

  if (!artist) {
    throw new Error(`Artist tidak ditemukan untuk lagu: ${songSeed.title}`);
  }

  if (!album) {
    throw new Error(`Album tidak ditemukan untuk lagu: ${songSeed.title}`);
  }

  const slug = generateSlug(songSeed.title, "song");
  const audioUrl = demoAudioUrls[songSeed.audioUrlIndex];

  return Song.findOneAndUpdate(
    {
      artist: artist._id,
      slug,
    },
    {
      $set: {
        title: songSeed.title,
        normalizedTitle: normalizeText(songSeed.title),
        slug,
        artist: artist._id,
        album: album._id,
        durationSeconds: songSeed.durationSeconds,
        trackNumber: songSeed.trackNumber,
        audioUrl,
        coverImageUrl: album.coverImageUrl || artist.imageUrl || "",
        lyrics: "",
        genres: songSeed.genres,
        isPublished: true,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
};

const seedDemoData = async () => {
  ensureDemoAudioUrls();
  await connectDatabase();

  const artistMap = new Map();
  const albumMap = new Map();

  for (const artistSeed of artistSeeds) {
    const artist = await upsertArtist(artistSeed);
    artistMap.set(artistSeed.name, artist);
  }

  for (const albumSeed of albumSeeds) {
    const album = await upsertAlbum(albumSeed, artistMap);
    albumMap.set(`${albumSeed.artistName}:${albumSeed.title}`, album);
  }

  for (const songSeed of songSeeds) {
    await upsertSong(songSeed, artistMap, albumMap);
  }

  console.log("Demo data berhasil dibuat atau diperbarui.");
  console.log("Total demo: 3 artists, 3 albums, 6 songs.");
};

seedDemoData()
  .catch((error) => {
    console.error(`Seed demo data gagal: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });