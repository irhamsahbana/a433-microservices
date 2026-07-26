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

// Fungsi buat konek ke RabbitMQ dan mulai konsumsi pesan dari queue "order"
async function connectToQueue() {
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
    } catch (ex) {
        // Log error kalau gagal konek/consume dari queue
        console.error(ex);
    }
}

// Jalankan HTTP server di port sesuai environment variable PORT
// (service ini gak punya endpoint apa pun, tapi tetap listen biar container
// hidup dan bisa di-probe kesehatannya)
app.listen(process.env.PORT, () => {
    // Log kalau server udah jalan dan siap
    console.log(`Server running at ${process.env.PORT}`);
});
