# Soundify Media Storage Setup

- Cloudinary untuk image: artist image, album cover, dan song cover image.
- Supabase Storage untuk audio: file lagu yang menghasilkan `audioUrl` public.

## 1. Cloudinary setup

1. Buat akun atau login ke Cloudinary.
2. Buka Dashboard.
3. Ambil nilai berikut dari dashboard:
   - Cloud name
   - API key
   - API secret
4. Simpan di `backend/.env`.

Contoh `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=isi_cloud_name
CLOUDINARY_API_KEY=isi_api_key
CLOUDINARY_API_SECRET=isi_api_secret
CLOUDINARY_FOLDER=soundify