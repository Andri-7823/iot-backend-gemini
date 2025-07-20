// Impor library
const express = require('express');
const admin = require('firebase-admin');

// Cek apakah aplikasi sudah diinisialisasi
if (!admin.apps.length) {
  // Ambil kredensial dari Environment Variable
  const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Membuat koneksi ke layanan Firestore
const db = admin.firestore();

// Membuat aplikasi express
const app = express();

// =================================================================
// ENDPOINT YANG DIPANGGIL OLEH APLIKASI ANDROID
// =================================================================
app.get('/api/data/terbaru', async (req, res) => {
  try {
    const snapshot = await db.collection('sensor-data')
                              .orderBy('timestamp', 'desc')
                              .limit(1)
                              .get();

    if (snapshot.empty) {
      return res.status(404).send('Tidak ada data ditemukan');
    }

    const dataTerbaru = snapshot.docs[0].data();
    res.status(200).json(dataTerbaru);

  } catch (error) {
    console.error('Error saat mengambil data terbaru:', error);
    res.status(500).send('Terjadi error di server');
  }
});


// Endpoint untuk simulasi data
app.get('/simulate', async (req, res) => {
  try {
    const suhu = Math.random() * (35 - 25) + 25;
    const kelembapan = Math.random() * (80 - 60) + 60;

    const dataSimulasi = {
      suhu: parseFloat(suhu.toFixed(2)),
      kelembapan: parseFloat(kelembapan.toFixed(2)),
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    const simpanData = await db.collection('sensor-data').add(dataSimulasi);
    res.status(200).send(`Data simulasi berhasil disimpan dengan ID: ${simpanData.id}`);

  } catch (error) {
    console.error('Error saat menyimpan data:', error);
    res.status(500).send('Terjadi error di server');
  }
});


// Endpoint utama
app.get('/', (req, res) => {
  res.send('Halo! Server IoT Gemini berjalan dengan baik di Vercel.');
});


// PENTING: Export aplikasi Anda agar Vercel bisa menjalankannya
module.exports = app;
// Update paksa untuk Vercel
