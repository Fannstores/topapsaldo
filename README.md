# topapsaldo
1. DI GITHUB (Buka website GitHub di Browser)
Buat repository baru, lalu buat file-file berikut di dalamnya:
 * File 1: package.json
   (Ini supaya VPS tahu butuh library apa saja)
   {
  "name": "bot-topup-bo",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "axios": "^1.6.0",
    "dotenv": "^16.3.1",
    "express": "^4.18.2"
  }
}

 * File 2: server.js
   (Ini otak sistemnya)
   const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const { TELE_TOKEN, BO_API_KEY_CLOSED, ADMIN_ID, PORT } = process.env;

app.post('/webhook-tele', async (req, res) => {
    try {
        const { callback_query } = req.body;
        if (!callback_query) return res.sendStatus(200);

        const clickerId = callback_query.from.id.toString();
        if (clickerId !== ADMIN_ID) {
            return axios.post(`https://api.telegram.org/bot${TELE_TOKEN}/answerCallbackQuery`, {
                callback_query_id: callback_query.id,
                text: "❌ Kamu bukan Admin!",
                show_alert: true
            });
        }

        if (callback_query.data.startsWith('acc|')) {
            const [_, userIdBO, amount] = callback_query.data.split('|');
            const boRes = await axios.post('https://api.bukaolshop.com/v1/pusat/tambah_saldo', 
            { id_member: userIdBO, nominal: parseInt(amount) },
            { headers: { 'Authorization': BO_API_KEY_CLOSED } });

            const status = (boRes.data.status === 'success' || boRes.data.success) ? "✅ BERHASIL" : "⚠️ API GAGAL";
            updateMsg(callback_query.message.chat.id, callback_query.message.message_id, callback_query.message.caption, status);
        }
        res.sendStatus(200);
    } catch (e) { res.sendStatus(500); }
});

async function updateMsg(chatId, msgId, oldCap, status) {
    await axios.post(`https://api.telegram.org/bot${TELE_TOKEN}/editMessageCaption`, {
        chat_id: chatId, message_id: msgId,
        caption: `${oldCap}\n\n📌 **STATUS:** ${status}`,
        parse_mode: 'Markdown', reply_markup: { inline_keyboard: [] }
    });
}
app.listen(PORT || 3000, () => console.log('Server Jalan...'));

 * File 3: .gitignore
   (Supaya token kamu gak bocor ke publik)
   .env
node_modules

 * File 4: README.md
   (Instruksi yang kamu minta buat dibaca nanti)
   # BOT TOPUP AUTO-ACC BUKAOLSHOP

## Cara Install di VPS:
1. `git clone https://github.com/USERNAME_KAMU/NAMA_REPO.git`
2. `cd NAMA_REPO`
3. `npm install`
4. `nano .env` (Isi Token Bot, API Key Closed BO, dan ID Admin Tele)
5. `pm2 start server.js`

2. DI VPS (Buka Putty/Terminal)
Ketik perintah ini secara berurutan:
# 1. Download kode dari Github kamu
git clone https://github.com/USERNAME_KAMU/NAMA_REPO.git
cd NAMA_REPO

# 2. Install semua bahan
npm install

# 3. Buat file rahasia (Paste kuncinya di sini)
nano .env

Pas kamu di dalam nano .env, tempel ini dan isi datanya:
TELE_TOKEN=token bot
BO_API_KEY_CLOSED=ISI_API_KEY_CLOSED_BO_MU_DI_SINI
ADMIN_ID=id tele
PORT=3000

(Cara simpan: Tekan CTRL+O, lalu Enter, lalu CTRL+X)
# 4. Jalankan bot selamanya
npm install pm2 -g
pm2 start server.js --name "topup-bot"

3. AKTIVASI (Terakhir!)
Buka Chrome/Browser, lalu jalankan link ini (Ganti Domainnya):
https://api.telegram.org/bot8522124114:AAG9xshpEN_AOMz_8HN3BP5bsGaZnQLKgqc/setWebhook?url=https://DOMAIN_ATAU_IP_KAMU/webhook-tele
Selesai 🗿. Sekarang kalau ada member topup di web, masuk ke Tele kamu, kamu klik "Terima", saldo mereka langsung terisi otomatis lewat API BukaOlshop.
Ingat: VPS-mu WAJIB pakai HTTPS (SSL) supaya Telegram mau kirim data. Kalau cuma HTTP biasa gak bakal jalan.
