const settings = require('../settings');

async function resetlinkCommand(sock, chatId, senderId) {
    try {
        // Vérifier si l'expéditeur est admin
        const groupMetadata = await sock.groupMetadata(chatId);
        const isAdmin = groupMetadata.participants
            .filter(p => p.admin)
            .map(p => p.id)
            .includes(senderId);

        // Vérifier si le bot est admin
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = groupMetadata.participants
            .filter(p => p.admin)
            .map(p => p.id)
            .includes(botId);

        if (!isAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ Seuls les administrateurs peuvent utiliser cette commande !',
                contextInfo: { externalAdReply: settings.adReply }
            });
            return;
        }

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ Le bot doit être administrateur pour réinitialiser le lien du groupe !',
                contextInfo: { externalAdReply: settings.adReply }
            });
            return;
        }

        // Réinitialiser le lien du groupe
        const newCode = await sock.groupRevokeInvite(chatId);
        
        // Envoyer le nouveau lien
        await sock.sendMessage(chatId, { 
            text: `✅ Le lien du groupe a été réinitialisé avec succès.\n\n📌 Nouveau lien :\nhttps://chat.whatsapp.com/${newCode}`,
            contextInfo: { externalAdReply: settings.adReply }
        });

    } catch (error) {
        console.error('Erreur dans la commande resetlink :', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Impossible de réinitialiser le lien du groupe !',
            contextInfo: { externalAdReply: settings.adReply }
        });
    }
}

module.exports = resetlinkCommand;