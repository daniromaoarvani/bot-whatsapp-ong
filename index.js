const express = require('express');

const qrcode = require('qrcode-terminal');

const {
    default: makeWASocket,
    useMultiFileAuthState
} = require('@whiskeysockets/baileys');

const app = express();

app.get('/', (req, res) => res.send('Bot ON'));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', ({ connection, qr }) => {

        if (qr) {
            console.log('📱 Escaneie o QR abaixo:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            console.log('✅ Conectado ao WhatsApp!');
        }

        if (connection === 'close') {
            console.log('❌ Conexão fechada. Reiniciando...');

            setTimeout(() => {
                startBot();
            }, 3000);
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];

        if (!msg.message) return;
        if (msg.key.fromMe) return;

        const texto =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        if (!texto) return;

        const textoLower = texto.toLowerCase();
        const jid = msg.key.remoteJid;

        console.log('Recebi:', textoLower);

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
3 - Ser voluntário`
            });
            return;
        }

        if (textoLower === '1') {
            await sock.sendMessage(jid, {
                text:
`💳 PIX:
sua-chave@pix.com`
            });
            return;
        }

        if (textoLower === '2') {
            await sock.sendMessage(jid, {
                text:
`🥫 Alimentos
👕 Roupas

📍 Endereço: (coloque aqui)`
            });
            return;
        }

        if (textoLower === '3') {
            await sock.sendMessage(jid, {
                text:
`🤝 Envie seu nome e telefone para contato.`
            });
            return;
        }

        await sock.sendMessage(jid, {
            text: "Digite 'menu' para ver as opções."
        });
    });
}

startBot();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor rodando na porta ' + PORT));