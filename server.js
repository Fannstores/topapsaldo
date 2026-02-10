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
