const express = require('express');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot ON'));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false // Desligado para usar o código de pareamento
    });

    // --- LÓGICA PARA TELEFONE FIXO E PAREAMENTO POR CÓDIGO ---
    if (!sock.authState.creds.registered) {
        // DIGITE SEU NÚMERO FIXO ABAIXO: Ex: 55 + DDD + NUMERO
        const meuNumero = "551133445566"; 

        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(meuNumero);
                console.log(`\n\n=========================================`);
                console.log(`✅ SEU CÓDIGO DE ACESSO É: ${code}`);
                console.log(`=========================================\n\n`);
            } catch (error) {
                console.log("Erro ao pedir código:", error);
            }
        }, 5000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on("connection.update", async ({ connection }) => {
        if (connection === "open") {
            console.log("✅ Bot conectado ao WhatsApp!");
        }

        if (connection === "close") {
            console.log("❌ Conexão fechada, tentando reconectar...");
            setTimeout(() => startBot(), 3000);
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (msg.key.fromMe || !msg.message) return;

        const texto = (
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text || 
            ""
        ).toLowerCase();

        const jid = msg.key.remoteJid;

        console.log('Mensagem recebida:', texto);

        // --- MENU E RESPOSTAS DA ONG ---
        if (
            texto.includes('oi') ||
            texto.includes('olá') ||
            texto.includes('ajudar') ||
            texto === 'menu'
        ) {
            await sock.sendMessage(jid, {
                text: `Olá! 😊\n\nSou o assistente da ONG.\n\nComo você quer ajudar?\n\n1 - Doação via PIX\n2 - Doar alimentos/roupas\n3 - Ser voluntário\n\nDigite 'menu' a qualquer momento para voltar aqui.`
            });
            return;
        }

        if (texto === '1') {
            await sock.sendMessage(jid, {
                text: `Perfeito! 🙌\n\n💳 Chave PIX:\nsua-chave@pix.com\n\nMuito obrigado ❤️`
            });
            return;
        }

        if (texto === '2') {
            await sock.sendMessage(jid, {
                text: `Você pode doar:\n\n🥫 Alimentos\n👕 Roupas\n\n📍 Endereço:\n(coloque aqui seu endereço real)`
            });
            return;
        }

        if (texto === '3') {
            await sock.sendMessage(jid, {
                text: `Ótimo! 🤝\n\nDeixe seu nome e telefone que entraremos em contato em breve.`
            });
            return;
        }

        // Resposta padrão caso não entenda
        await sock.sendMessage(jid, {
            text: "Não entendi 😅\nDigite 'menu' para ver as opções disponíveis."
        });
    });
}

startBot();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});