// Muat variabel dari berkas .env ke process.env (kalau variabelnya belum
// di-set dari luar, misal lewat env container/Kubernetes)
require('dotenv').config()

// Import Express, framework HTTP server-nya
const express = require("express");
// Bikin instance aplikasi Express
const app = express();

// Import body-parser, buat parsing body request
const bp = require("body-parser");
// Pasang middleware supaya body request JSON otomatis di-parse ke req.body
app.use(bp.json());

// Import amqplib, client buat komunikasi ke RabbitMQ lewat protokol AMQP
const amqp = require("amqplib");
// Ambil URL RabbitMQ dari environment variable AMQP_URL
const amqpServer = process.env.AMQP_URL;
// Variabel buat nyimpen koneksi & channel AMQP, dipakai di beberapa fungsi
var channel, connection;

// Langsung konek ke RabbitMQ pas service ini start
connectToQueue();

// Fungsi buat konek ke RabbitMQ dan siapin queue "order", dengan retry kalau
// RabbitMQ belum siap nerima koneksi pas pod ini baru start
async function connectToQueue() {
    // Batas maksimal percobaan sebelum nyerah
    const MAX_RETRIES = 10;
    // Jeda antar percobaan (ms)
    const RETRY_DELAY = 3000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Bikin koneksi AMQP ke RabbitMQ server
            connection = await amqp.connect(amqpServer);
            // Bikin channel di atas koneksi itu, tempat publish/consume pesan
            channel = await connection.createChannel();
            // Nama queue yang dipakai buat kirim data order
            const queue = "order";
            // Pastikan queue "order" ada; kalau belum ada, RabbitMQ bakal bikinin
            await channel.assertQueue(queue);
            // Log kalau koneksi & setup queue berhasil
            console.log("Connected to the queue!")
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

// Endpoint POST /order buat nerima data order dari client (misal Postman)
app.post("/order", (req, res) => {
    // Ambil field "order" dari body request JSON
    const { order } = req.body;
    // Kirim data order itu ke RabbitMQ (async, gak nunggu selesai di sini)
    createOrder(order);
    // Balikin data order yang diterima sebagai response ke client
    res.send(order);
});

// Endpoint buat livenessProbe: asal proses Node-nya masih hidup dan bisa
// jawab HTTP, service dianggap "alive" (gak peduli status koneksi RabbitMQ)
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Endpoint buat readinessProbe: baru dibilang "ready" kalau channel & koneksi
// AMQP-nya udah kebentuk, biar Kubernetes gak ngirim trafik sebelum siap
app.get("/ready", (req, res) => {
    if (channel && connection) {
        res.status(200).json({ status: "ready" });
    } else {
        res.status(503).json({ status: "not ready" });
    }
});

// Fungsi buat publish data order ke queue RabbitMQ
const createOrder = async order => {
    // Nama queue tujuan, sama dengan yang di-assert di connectToQueue()
    const queue = "order";
    // Kirim data order (di-serialize jadi JSON string lalu Buffer) ke queue
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(order)));
    // Log kalau order berhasil dikirim ke queue
    console.log("Order succesfully created!")
    // Daftarin handler buat sinyal SIGINT (misal Ctrl+C atau pod dihentikan)
    process.once('SIGINT', async () => {
        // Log proses shutdown
        console.log('got sigint, closing connection');
        // Tutup channel AMQP dengan rapi
        await channel.close();
        // Tutup koneksi AMQP dengan rapi
        await connection.close();
        // Keluar dari proses Node dengan status sukses
        process.exit(0);
    });
};

// Jalankan HTTP server di port sesuai environment variable PORT
app.listen(process.env.PORT, () => {
    // Log kalau server udah jalan dan siap nerima request
    console.log(`Server running at ${process.env.PORT}`);
});
