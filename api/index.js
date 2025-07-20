const express = require('express');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const app = express();

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

app.get('/api/simulate', async (req, res) => {
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
// Memaksa deploy ulang
module.exports = app;