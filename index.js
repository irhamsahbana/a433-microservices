// Muat variabel dari berkas .env ke process.env (kalau variabelnya belum
// di-set dari luar, misal lewat env container/Kubernetes)
require('dotenv').config()

// Import Express, framework HTTP server-nya
const express = require("express");
// Bikin instance aplikasi Express
const app = express();

// Import body-parser (disiapkan meski service ini gak punya endpoint POST)
const bp = require("body-parser");

// Import amqplib, client buat komunikasi ke RabbitMQ lewat protokol AMQP
const amqp = require("amqplib");
// Ambil URL RabbitMQ dari environment variable AMQP_URL
const amqpServer = process.env.AMQP_URL;
// Variabel buat nyimpen koneksi & channel AMQP, dipakai di fungsi consumer
var channel, connection;

// Langsung konek ke RabbitMQ pas service ini start
connectToQueue();

// Fungsi buat konek ke RabbitMQ dan mulai konsumsi pesan dari queue "order",
// dengan retry kalau RabbitMQ belum siap nerima koneksi pas pod ini baru start
async function connectToQueue() {
    // Batas maksimal percobaan sebelum nyerah
    const MAX_RETRIES = 10;
    // Jeda antar percobaan (ms)
    const RETRY_DELAY = 3000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Bikin koneksi AMQP ke RabbitMQ server
            connection = await amqp.connect(amqpServer);
            // Bikin channel di atas koneksi itu, tempat consume pesan
            channel = await connection.createChannel();
            // Pastikan queue "order" ada (harus sama persis dengan punya order-service)
            await channel.assertQueue("order");
            // Mulai dengerin pesan baru yang masuk ke queue "order"
            channel.consume("order", data => {
                // Cetak isi pesan (data order) yang diterima ke console
                console.log(`Order received: ${Buffer.from(data.content)}`);
                // Cetak pesan konfirmasi kalau order bakal segera dikirim
                console.log("** Will be shipped soon! **\n")
                // Kasih tahu RabbitMQ kalau pesan ini udah selesai diproses,
                // supaya dihapus dari queue dan gak dikirim ulang
                channel.ack(data);
            });
            // Log kalau koneksi & setup queue berhasil
            console.log("Connected to the queue!");
            // Berhasil, keluar dari loop retry
            return;
        } catch (ex) {
            // Log percobaan yang gagal beserta nomor attempt-nya
            console.error(`Attempt ${attempt}/${MAX_RETRIES} failed:`, ex.message);
            if (attempt === MAX_RETRIES) {
                // Udah habis jatah retry, keluar dari proses biar Kubernetes
                // restart pod ini dan mulai retry dari awal lagi
                console.error("Max retries reached, exiting...");
                process.exit(1);
            }
            // Tunggu sebentar sebelum coba lagi
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
}

// Endpoint buat livenessProbe: asal proses Node-nya masih hidup dan bisa
// jawab HTTP, service dianggap "alive" (gak peduli status koneksi RabbitMQ)
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Endpoint buat readinessProbe: baru dibilang "ready" kalau channel & koneksi
// AMQP-nya udah kebentuk, biar Kubernetes gak nganggep pod ini siap sebelum
// benar-benar bisa konsumsi pesan dari queue
app.get("/ready", (req, res) => {
    if (channel && connection) {
        res.status(200).json({ status: "ready" });
    } else {
        res.status(503).json({ status: "not ready" });
    }
});

// Jalankan HTTP server di port sesuai environment variable PORT
app.listen(process.env.PORT, () => {
    // Log kalau server udah jalan dan siap
    console.log(`Server running at ${process.env.PORT}`);
});
