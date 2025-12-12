const axios = require('axios');
const settings = require('../settings'); // Pour contextInfo
const { sleep } = require('../lib/myfunc');

// Carte  (sans newsletter)
const baseContext = {
    contextInfo: settings.adReply
};

async function pairCommand(sock, chatId, message, q) {
    try {
        if (!q) {
            return await sock.sendMessage(chatId, { 
                text: "❌ Veuillez fournir un numéro WhatsApp valide.\nExemple: .pair 23762395XXXX",
                ...baseContext
            });
        }

        const numbers = q.split(',')
            .map(v => v.replace(/[^0-9]/g, ''))
            .filter(v => v.length > 5 && v.length < 20);

        if (numbers.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: "❌ Numéro invalide ! Veuillez utiliser le format correct.",
                ...baseContext
            });
        }

        for (const number of numbers) {
            const whatsappID = number + '@s.whatsapp.net';
            const result = await sock.onWhatsApp(whatsappID);

            if (!result[0]?.exists) {
                return await sock.sendMessage(chatId, { 
                    text: `❌ Ce numéro n'est pas enregistré sur WhatsApp.`,
                    ...baseContext
                });
            }

            await sock.sendMessage(chatId, { 
                text: "⌛ Patientez un instant pour générer le code...",
                ...baseContext
            });

            try {
                const response = await axios.get(`https://knight-bot-paircode.onrender.com/code?number=${number}`);

                if (response.data && response.data.code) {
                    const code = response.data.code;
                    if (code === "Service Unavailable") {
                        throw new Error('Service Unavailable');
                    }

                    await sleep(5000);

                    await sock.sendMessage(chatId, { 
                        text: `✅ Votre code de jumelage : ${code}`,
                        ...baseContext
                    });
                } else {
                    throw new Error('Réponse invalide du serveur');
                }
            } catch (apiError) {
                console.error('Erreur API:', apiError);
                const errorMessage = apiError.message === 'Service Unavailable'
                    ? "⚠️ Le service est temporairement indisponible. Réessayez plus tard."
                    : "❌ Échec de génération du code. Réessayez plus tard.";

                await sock.sendMessage(chatId, { text: errorMessage, ...baseContext });
            }
        }
    } catch (error) {
        console.error(error);
        await sock.sendMessage(chatId, { 
            text: "❌ Une erreur est survenue. Réessayez plus tard.",
            ...baseContext
        });
    }
}

module.exports = pairCommand;