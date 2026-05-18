console.log("INICIOU O ARQUIVO");

const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    console.log('Escaneie o QR:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot conectado!');
});

client.on('message', (msg) => {
    const texto = msg.body.toLowerCase();

    console.log('Recebi:', texto);

    // menu principal
    if (
        texto.includes('oi') ||
        texto.includes('olá') ||
        texto.includes('ajudar') ||
        texto === 'menu'
    ) {
        return msg.reply(
"Olá! 😊\n\nSou o assistente da ONG.\n\nComo você quer ajudar?\n\n1 - Doação via PIX\n2 - Doar alimentos/roupas\n3 - Ser voluntário\n\nDigite 'menu' a qualquer momento para voltar aqui."
        );
    }

    if (texto === '1') {
        return msg.reply(
"Perfeito! 🙌\n\n💳 Chave PIX:\nsua-chave@pix.com\n\nMuito obrigado ❤️\n\nDigite 'menu' para voltar."
        );
    }

    if (texto === '2') {
        return msg.reply(
"Você pode doar:\n\n🥫 Alimentos\n👕 Roupas\n\n📍 Endereço:\n(coloque aqui)\n\nDigite 'menu' para voltar."
        );
    }

    if (texto === '3') {
        return msg.reply(
"Ótimo! 🤝\n\nDeixe seu nome e telefone que entraremos em contato.\n\nDigite 'menu' para voltar."
        );
    }

    return msg.reply(
"Não entendi 😅\n\nDigite 'menu' para ver as opções."
    );
});

app.get('/', (req, res) => {
    res.send('OK');
});

app.listen(3000, () => {
    console.log('Servidor rodando!');
});

client.initialize();