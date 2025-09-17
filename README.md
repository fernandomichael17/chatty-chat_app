# Chatty - Chat Forum App

Chatty adalah aplikasi chat forum berbasis web yang memungkinkan pengguna untuk berkomunikasi secara real-time dalam berbagai ruang (room). Aplikasi ini dilengkapi dengan fitur filter kata kasar (profanity filter) berbasis machine learning yang terintegrasi dengan API Python (Flask). Filter ini secara otomatis memeriksa setiap pesan yang dikirimkan dan memblokir pesan yang mengandung kata-kata tidak pantas, serta memberikan notifikasi kepada admin jika ada pesan yang diblokir.

## Fitur Utama

- **Real-time Chat:** Komunikasi antar pengguna secara langsung menggunakan Socket.io.
- **Multi-Room:** Pengguna dapat bergabung ke berbagai ruang chat yang tersedia.
- **Profanity Filter:** Setiap pesan yang dikirim akan diperiksa oleh API Python yang menggunakan model machine learning untuk mendeteksi kata kasar.
- **Notifikasi Admin:** Pesan yang diblokir akan diinformasikan kepada admin room.
- **User Management:** Sistem manajemen user untuk setiap room.

## Teknologi yang Digunakan

- **Backend:** Node.js (Express) & Python (Flask)
- **Real-time Communication:** Socket.io
- **Profanity Detection:** TensorFlow, NLTK, Sastrawi (Python)
- **Frontend:** HTML, CSS, JavaScript (pada folder `public`)
- **Lainnya:** CORS, Sastrawi Stemmer, NLTK Stopwords

## Cara Menjalankan

1. **Jalankan API Profanity Filter (Python):**

   - Pastikan model dan tokenizer sudah tersedia di folder `models/`.
   - Jalankan:
     ```
     python app.py
     ```

2. **Jalankan Server Chat (Node.js):**

   - Install dependencies:
     ```
     npm install
     ```
   - Jalankan server:
     ```
     node server.js
     ```

3. **Akses aplikasi melalui browser:**
   ```
   http://localhost:3000
   ```

## Struktur Folder

- `server.js` : Server utama Node.js untuk chat.
- `app.py` : API Python untuk filter kata kasar.
- `public/` : Frontend aplikasi chat.
- `utils/` : Utility functions (user management, message formatting, dll).
- `models/` : Model dan tokenizer untuk filter kata kasar.

## Catatan

- Pastikan Python dan Node.js sudah terinstall di komputer Anda.
- File `.gitignore` sudah mengabaikan `node_modules` dan file model besar.
- Untuk pengembangan lebih lanjut, silakan sesuaikan model filter sesuai kebutuhan.

---

Aplikasi ini dibuat untuk keperluan skripsi dan dapat dikembangkan lebih lanjut sesuai kebutuhan.
