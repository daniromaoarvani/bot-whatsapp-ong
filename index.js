const express = require('express');
const qrcode = require('qrcode-terminal');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys');

const app = express();

app.get('/', (req, res) => res.send('Bot ON'));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');

    const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
});

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {

    if (qr) {
        console.log("📱 Escaneie o QR:");
        qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
        console.log("✅ Bot conectado ao WhatsApp!");
    }

    if (connection === "close") {
        console.log("❌ conexão fechada");

        setTimeout(() => {
            startBot();
        }, 3000);
    }

});

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (msg.key.fromMe) return;

        if (!msg.message) return;

        const texto =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        if (!texto) return;

        const textoLower = texto.toLowerCase();

        console.log('Recebi:', textoLower);

        const jid = msg.key.remoteJid;

        // MENU
        if (
            textoLower.includes('oi') ||
            textoLower.includes('olá') ||
            textoLower.includes('ajudar') ||
            textoLower === 'menu'
        ) {
            await sock.sendMessage(jid, {
                text:
`Olá! 😊

Sou o assistente da ONG.

Como você quer ajudar?

1 - Doação via PIX
2 - Doar alimentos/roupas
3 - Ser voluntário

Digite 'menu' a qualquer momento para voltar aqui.`
            });
            return;
        }

        if (textoLower === '1') {
            await sock.sendMessage(jid, {
                text:
`Perfeito! 🙌

💳 Chave PIX:
sua-chave@pix.com

Muito obrigado ❤️`
            });
            return;
        }

        if (textoLower === '2') {
            await sock.sendMessage(jid, {
                text:
`Você pode doar:

🥫 Alimentos
👕 Roupas

📍 Endereço:
(coloque aqui)`
            });
            return;
        }

        if (textoLower === '3') {
            await sock.sendMessage(jid, {
                text:
`Ótimo! 🤝

Deixe seu nome e telefone que entraremos em contato.`
            });
            return;
        }

        await sock.sendMessage(jid, {
            text: "Não entendi 😅\nDigite 'menu' para ver as opções."
        });
    });
}

startBot();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor rodando na porta ' + PORT));