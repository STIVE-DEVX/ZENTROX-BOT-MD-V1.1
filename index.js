/**
 * ZENTROX-MD - Un Bot WhatsApp
 * Version : 1.0.0
 * Copyright (c) 2025 STIVO TECH ™
 * 
 * ⚠️ Toute modification, redistribution ou utilisation sans autorisation explicite 
 * de l'auteur est strictement interdite.
 * Pour contact : +237672667958
 *
 * Ce programme est protégé et reste la propriété exclusive de STIVO TECH ™
 */
require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, sleep, reSize } = require('./lib/myfunc')
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
// Utilisation d’un store léger persistant au lieu de makeInMemoryStore (compatibilité entre versions) // STIVO TECH ™
const pino = require("pino")
const readline = require("readline")
const { parsePhoneNumber } = require("libphonenumber-js")
const { PHONENUMBER_MCC } = require('@whiskeysockets/baileys/lib/Utils/generics')
const { rmSync, existsSync } = require('fs')
const { join } = require('path')

// Importation du store léger // STIVO TECH ™
const store = require('./lib/lightweight_store')

// Initialisation du store // STIVO TECH ™
store.readFromFile()
const settings = require('./settings')
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000)

// Optimisation mémoire - Forcer le garbage collection si disponible // STIVO TECH ™
setInterval(() => {
    if (global.gc) {
        global.gc()
        console.log('🧹 Nettoyage mémoire effectué') // STIVO TECH ™
    }
}, 60_000) // toutes les 1 minute

// Surveillance mémoire - Redémarrer si RAM trop élevée // STIVO TECH ™
setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024
    if (used > 400) {
        console.log('⚠️ RAM trop élevée (>400MB), redémarrage du bot...') // STIVO TECH ™
        process.exit(1) // Le panel redémarrera automatiquement // STIVO TECH ™
    }
}, 30_000) // vérifier toutes les 30 secondes

let phoneNumber = "237675048398"
let owner = JSON.parse(fs.readFileSync('./data/owner.json'))

global.botname = "ZENTROX BOT"
global.themeemoji = "•"
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

// Créer l'interface readline uniquement si l'environnement est interactif // STIVO TECH ™
const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null
const question = (text) => {
    if (rl) {
        return new Promise((resolve) => rl.question(text, resolve))
    } else {
        // Dans un environnement non interactif, utiliser ownerNumber depuis settings // STIVO TECH ™
        return Promise.resolve(settings.ownerNumber || phoneNumber)
    }
}


async function startXeonBotInc() {
    try {
        let { version, isLatest } = await fetchLatestBaileysVersion()
        const { state, saveCreds } = await useMultiFileAuthState(`./session`)
        const msgRetryCounterCache = new NodeCache()

        const XeonBotInc = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: !pairingCode,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            getMessage: async (key) => {
                let jid = jidNormalizedUser(key.remoteJid)
                let msg = await store.loadMessage(jid, key.id)
                return msg?.message || ""
            },
            msgRetryCounterCache,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
        })

        // Sauvegarder les identifiants lors de leur mise à jour // STIVO TECH ™
        XeonBotInc.ev.on('creds.update', saveCreds)

    store.bind(XeonBotInc.ev)

    // Gestion des messages // STIVO TECH ™
    XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0]
            if (!mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                await handleStatus(XeonBotInc, chatUpdate);
                return;
            }
            if (!XeonBotInc.public && !mek.key.fromMe && chatUpdate.type === 'notify') {
                const isGroup = mek.key?.remoteJid?.endsWith('@g.us')
                if (!isGroup) return // Bloquer les messages privés en mode privé, autoriser les groupes // STIVO TECH ™
            }
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return

            if (XeonBotInc?.msgRetryCounterCache) {
                XeonBotInc.msgRetryCounterCache.clear() // Nettoyer le cache pour éviter les problèmes mémoire // STIVO TECH ™
            }

            try {
                await handleMessages(XeonBotInc, chatUpdate, true)
            } catch (err) {
                console.error("Erreur dans handleMessages :", err) // STIVO TECH ™
                if (mek.key && mek.key.remoteJid) {
                    await XeonBotInc.sendMessage(mek.key.remoteJid, {
                        text: '❌ Une erreur est survenue lors du traitement de votre message.',  // STIVO TECH ™
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401545196668@newsletter',
                                newsletterName: 'ZENTROX MD',
                                serverMessageId: -1
                            }
                        }
                    }).catch(console.error);
                }
            }
        } catch (err) {
            console.error("Erreur dans messages.upsert :", err) // STIVO TECH ™
        }
    })

// Décodage des JID // STIVO TECH ™
XeonBotInc.decodeJid = (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {}
        return decode.user && decode.server && decode.user + '@' + decode.server || jid
    } else return jid
}

XeonBotInc.ev.on('contacts.update', update => {
    for (let contact of update) {
        let id = XeonBotInc.decodeJid(contact.id)
        if (store && store.contacts) store.contacts[id] = { id, name: contact.notify } // STIVO TECH ™
    }
})

// Décodage et récupération du nom (corrigé, async, optimisé) // STIVO TECH ™
XeonBotInc.getName = async (jid, withoutContact = false) => {
    const id = XeonBotInc.decodeJid(jid)
    withoutContact = XeonBotInc.withoutContact || withoutContact

    try {
        // Si groupe
        if (id.endsWith("@g.us")) {
            let v = store.contacts[id] || {}

            if (!(v.name || v.subject)) {
                try {
                    const metadata = await XeonBotInc.groupMetadata(id).catch(() => ({}))
                    v = metadata || v
                } catch {}
            }

            const name = v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international')
            return withoutContact ? '' : name
        }

        // Si contact normal
        let v = id === '0@s.whatsapp.net'
            ? { id, name: 'WhatsApp' }
            : (id === XeonBotInc.decodeJid(XeonBotInc.user?.id)
                ? XeonBotInc.user
                : (store.contacts[id] || {}))

        const name = (withoutContact ? '' : v.name)
            || v.subject
            || v.verifiedName
            || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international')

        return name

    } catch (e) {
        return withoutContact ? '' : (store.contacts[id]?.name || id)
    }
}

XeonBotInc.public = true

XeonBotInc.serializeM = (m) => smsg(XeonBotInc, m, store)

// Gestion du code de jumelage // STIVO TECH ™
if (pairingCode && !XeonBotInc.authState.creds.registered) {
    if (useMobile) throw new Error('Impossible d’utiliser le code de jumelage avec l’API mobile') // STIVO TECH ™

        let phoneNumber
        if (!!global.phoneNumber) {
            phoneNumber = global.phoneNumber
        } else {
            phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Veuillez saisir votre numéro WhatsApp 😍\nFormat: 237651966528 (sans + ou espaces) : `))) // STIVO TECH ™
        }

        phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

        const pn = require('awesome-phonenumber');
        if (!pn('+' + phoneNumber).isValid()) {
            console.log(chalk.red('Numéro invalide. Veuillez entrer votre numéro complet international sans + ou espaces.')); // STIVO TECH ™
            process.exit(1);
        }

        setTimeout(async () => {
            try {
                let code = await XeonBotInc.requestPairingCode(phoneNumber)
                code = code?.match(/.{1,4}/g)?.join("-") || code
                console.log(chalk.black(chalk.bgGreen(`Votre code de jumelage : `)), chalk.black(chalk.white(code))) // STIVO TECH ™
                console.log(chalk.yellow(`\nVeuillez entrer ce code dans votre application WhatsApp :\n1. Ouvrez WhatsApp\n2. Allez dans Paramètres > Appareils liés\n3. Appuyez sur "Lier un appareil"\n4. Entrez le code affiché ci-dessus`)) // STIVO TECH ™
            } catch (error) {
                console.error('Erreur lors de la demande du code de jumelage :', error) // STIVO TECH ™
                console.log(chalk.red('Impossible d’obtenir le code de jumelage. Vérifiez votre numéro et réessayez.')) // STIVO TECH ™
            }
        }, 3000)
    }

    // Gestion des connexions // STIVO TECH ™
    XeonBotInc.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect, qr } = s
        
        if (qr) {
            console.log(chalk.yellow('📱 QR Code généré. Veuillez scanner avec WhatsApp.')) // STIVO TECH ™
        }
        
        if (connection === 'connecting') {
            console.log(chalk.yellow('🔄 Connexion à WhatsApp...')) // STIVO TECH ™
        }
        
        if (connection == "open") {
            console.log(chalk.magenta(` `))
            console.log(chalk.yellow(`🌿Connecté à => ` + JSON.stringify(XeonBotInc.user, null, 2)))

            try {
                const botNumber = XeonBotInc.user.id.split(':')[0] + '@s.whatsapp.net';
                await XeonBotInc.sendMessage(botNumber, {
    text: `🚀 Le bot est opérationnel !\n\n🕒 Heure actuelle : ${new Date().toLocaleString()}\n✅ Statut : En ligne et fonctionnel !\n\n🔔 N'oubliez pas de rejoindre notre canal ci-dessous !`, // STIVO TECH ™
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401545196668@newsletter',
                            newsletterName: 'ZENTROX MD',
                            serverMessageId: -1
                        }
                    }
                });
            } catch (error) {
                console.error('Erreur lors de l’envoi du message de connexion :', error.message) // STIVO TECH ™
            }

            await delay(1999)
            console.log(chalk.yellow(`\n\n                  ${chalk.bold.blue(`[ ${global.botname || 'ZENTROX BOT'} ]`)}\n\n`))
            console.log(chalk.cyan(`
< ================================================== >

   ████████╗████████╗██╗   ██╗██╗   ██╗ ██████╗ 
   ╚══██╔══╝╚══██╔══╝██║   ██║██║   ██║██╔═══██╗
      ██║      ██║   ██║   ██║██║   ██║██║   ██║
      ██║      ██║   ██║   ██║██║   ██║██║   ██║
      ██║      ██║   ╚██████╔╝╚██████╔╝╚██████╔╝
      ╚═╝      ╚═╝    ╚═════╝  ╚═════╝  ╚═════╝ 
                                                
< ================================================== >
`))
            console.log(chalk.magenta(`\n${global.themeemoji || '•'} YOUTUBE CHANNEL: stivotech2`))
            console.log(chalk.magenta(`${global.themeemoji || '•'} GITHUB: STIVO-DEVX`))
            let ownerData = JSON.parse(fs.readFileSync('./data/owner.json')) // STIVO TECH ™
let ownerNumber = Array.isArray(ownerData) ? (ownerData[0]?.number || ownerData[0]) : (ownerData.number || ownerData)
if (typeof ownerNumber === 'object') ownerNumber = String(ownerNumber)
const ownerJid = (ownerNumber || phoneNumber) + '@s.whatsapp.net' // STIVO TECH ™

console.log(chalk.magenta(`• OWNER NUMBER: ${ownerNumber}`)) // STIVO TECH ™
            console.log(chalk.magenta(`${global.themeemoji || '•'} CREDIT: STIVO TECH THE REBIRTH`))
            console.log(chalk.green(`${global.themeemoji || '•'} 🤖 Bot connecté avec succès ! ✅`))
            console.log(chalk.blue(`Version du bot: ${settings.version}`)) // STIVO TECH ™
        }
      if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
            const statusCode = lastDisconnect?.error?.output?.statusCode
            
            console.log(chalk.red(`Connexion fermée à cause de ${lastDisconnect?.error}, reconnexion ${shouldReconnect}`)) // STIVO TECH ™
            
            if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                try {
                    rmSync('./session', { recursive: true, force: true })
                    console.log(chalk.yellow('Dossier de session supprimé. Veuillez vous réauthentifier.')) // STIVO TECH ™
                } catch (error) {
                    console.error('Erreur lors de la suppression de la session :', error) // STIVO TECH ™
                }
                console.log(chalk.red('Session déconnectée. Veuillez vous réauthentifier.')) // STIVO TECH ™
            }
            
            if (shouldReconnect) {
                console.log(chalk.yellow('Reconnexion...')) // STIVO TECH ™
                await delay(5000)
                startXeonBotInc()
            }
        }
    })

    // Suivi des appels récents pour éviter le spam // STIVO TECH ™
    const antiCallNotified = new Set();

    // Gestion anti-call : bloquer les appelants si activé // STIVO TECH ™
    XeonBotInc.ev.on('call', async (calls) => {
        try {
            const { readState: readAnticallState } = require('./commands/anticall');
            const state = readAnticallState();
            if (!state.enabled) return;
            for (const call of calls) {
                const callerJid = call.from || call.peerJid || call.chatId;
                if (!callerJid) continue;
                try {
                    // Première étape : tenter de rejeter l’appel si possible // STIVO TECH ™
                    try {
                        if (typeof XeonBotInc.rejectCall === 'function' && call.id) {
                            await XeonBotInc.rejectCall(call.id, callerJid);
                        } else if (typeof XeonBotInc.sendCallOfferAck === 'function' && call.id) {
                            await XeonBotInc.sendCallOfferAck(call.id, callerJid, 'reject');
                        }
                    } catch {}

                    // Notifier l’appelant une seule fois dans une courte période // STIVO TECH ™
                    if (!antiCallNotified.has(callerJid)) {
                        antiCallNotified.add(callerJid);
                        setTimeout(() => antiCallNotified.delete(callerJid), 60000);
                        await XeonBotInc.sendMessage(callerJid, { text: '📵 Anti-call activé. Votre appel a été rejeté et vous serez bloqué.' });  // STIVO TECH ™
                    }
                } catch {}
                // Puis : bloquer après un court délai pour s’assurer que le rejet et le message sont traités // STIVO TECH ™
                setTimeout(async () => {
                    try { await XeonBotInc.updateBlockStatus(callerJid, 'block'); } catch {}
                }, 800);
            }
        } catch (e) {
            // ignorer // STIVO TECH ™
        }
    });

    XeonBotInc.ev.on('group-participants.update', async (update) => {
        await handleGroupParticipantUpdate(XeonBotInc, update); // STIVO TECH ™
    });

    XeonBotInc.ev.on('messages.upsert', async (m) => {
        if (m.messages[0].key && m.messages[0].key.remoteJid === 'status@broadcast') {
            await handleStatus(XeonBotInc, m); // STIVO TECH ™
        }
    });

    XeonBotInc.ev.on('status.update', async (status) => {
        await handleStatus(XeonBotInc, status); // STIVO TECH ™
    });

    XeonBotInc.ev.on('messages.reaction', async (status) => {
        await handleStatus(XeonBotInc, status); // STIVO TECH ™
    });

    return XeonBotInc
    } catch (error) {
        console.error('Erreur dans startXeonBotInc :', error) // STIVO TECH ™
        await delay(5000)
        startXeonBotInc()
    }
}


// Démarrage du bot avec gestion des erreurs // STIVO TECH ™
startXeonBotInc().catch(error => {
    console.error('Erreur fatale :', error)// STIVO TECH ™
    process.exit(1)
})
process.on('uncaughtException', (err) => {
    console.error('Exception non interceptée :', err) // STIVO TECH ™
})

process.on('unhandledRejection', (err) => {
    console.error('Rejet non géré :', err) // STIVO TECH ™
})

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Mise à jour de ${__filename}`)) // STIVO TECH ™
    delete require.cache[file]
    require(file)
})