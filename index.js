// Impor library
const express = require('express');
const admin = require('firebase-admin');

// Impor kunci rahasia kita
const serviceAccount = require('./serviceAccountKey.json');

// Inisialisasi koneksi ke Firebase dengan kunci rahasia
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Membuat koneksi ke layanan Firestore
const db = admin.firestore();

// Membuat aplikasi express
const app = express();
const port = 3000;

// =================================================================
// BAGIAN BARU DIMULAI DI SINI
// =================================================================

// Endpoint untuk simulasi data
app.get('/simulate', async (req, res) => {
  try {
    // 1. Membuat data sensor palsu/simulasi
    const suhu = Math.random() * (35 - 25) + 25; // Angka acak antara 25 dan 35
    const kelembapan = Math.random() * (80 - 60) + 60; // Angka acak antara 60 dan 80

    const dataSimulasi = {
      suhu: parseFloat(suhu.toFixed(2)), // Membulatkan jadi 2 desimal
      kelembapan: parseFloat(kelembapan.toFixed(2)),
      timestamp: admin.firestore.FieldValue.serverTimestamp() // Menambahkan waktu saat ini
    };

    // 2. Menyimpan data ke Firestore
    // Kita menargetkan koleksi bernama 'sensor-data'
    const simpanData = await db.collection('sensor-data').add(dataSimulasi);
    console.log('Data berhasil disimpan dengan ID:', simpanData.id);
    
    // 3. Memberikan respons bahwa proses berhasil
    res.status(200).send(`Data simulasi berhasil disimpan ke Firestore dengan ID: ${simpanData.id}`);

  } catch (error) {
    console.error('Error saat menyimpan data:', error);
    res.status(500).send('Terjadi error di server');
  }
});

// =================================================================
// BAGIAN BARU BERAKHIR DI SINI
// =================================================================


// Endpoint utama (masih ada untuk pengetesan)
app.get('/', (req, res) => {
  res.send('Halo! Server sudah terhubung dengan Firestore.');
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berhasil dijalankan di http://localhost:${port}`);
});