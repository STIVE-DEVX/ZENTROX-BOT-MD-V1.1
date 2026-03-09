<p align="center">
  <img src="https://i.postimg.cc/tgn2KMCr/IMG-20251203-WA0102.jpg" alt="ZENTROX BOT" width="220"/>
  <h1>ZENTROX-BOT-MD</h1>
  <p><strong>Bot d'Automatisation Intelligent Multi-Device pour WhatsApp</strong></p>
  
  <p>
  <a href="https://github.com/STIVE-DEVX/ZENTROX-BOT-MD-V1.1/stargazers">
    <img src="https://img.shields.io/github/stars/STIVE-DEVX/ZENTROX-BOT-MD-V1.1?style=social" alt="Stars">
  </a>
  <a href="https://github.com/STIVE-DEVX/ZENTROX-BOT-MD-V1.1/forks">
    <img src="https://img.shields.io/github/forks/STIVE-DEVX/ZENTROX-BOT-MD-V1.1?style=social" alt="Forks">
  </a>
  <a href="https://github.com/STIVE-DEVX/ZENTROX-BOT-MD-V1.1">
    <img src="https://img.shields.io/github/repo-size/STIVE-DEVX/ZENTROX-BOT-MD-V1.1?style=flat-square&color=green" alt="Repo size">
  </a>
</p>
</p>

---

### 🌐 À propos de ZENTROX-BOT-MD

**ZENTROX-BOT-MD** est un bot WhatsApp moderne, stable et modulaire construit avec **@whiskeysockets/baileys** (API Multi-Device officielle).

Il est conçu pour :

- Automatiser la gestion de groupes et de communautés
- Offrir une assistance intelligente et personnalisée
- Renforcer la modération et la sécurité
- Respecter les politiques WhatsApp (utilisation légale de l’API officielle)

Parfait pour les créateurs de contenu, administrateurs de communautés, entreprises et développeurs.

> **Légal & conforme** : Ce bot utilise exclusivement l’API officielle WhatsApp via Baileys. Aucun risque de ban si vous respectez les règles (pas de spam, pas d’envoi massif abusif).

---

### 🚀 Fonctionnalités principales

- 🤖 Automatisation intelligente (réponses IA optionnelles)
- 🛡️ Modération puissante : anti-spam, anti-lien, anti-arabe, anti-call, welcome/goodbye, mute/unmute...
- 👥 Gestion avancée des rôles (owner, admin, utilisateur)
- 💬 Réponses automatiques, commandes personnalisables, mode conversation
- 🌍 Support multi-langues (français par défaut + extensible)
- ⚙️ Configuration simple via fichiers JS/JSON
- 📦 Système de commandes modulaire (ajout/suppression facile)
- 🔄 Connexion Multi-Device (plus besoin de garder le téléphone allumé après appairage)

---

### 🔗 Liens officiels

**Dépôt GitHub** → https://github.com/STIVE-DEVX/ZENTROX-BOT-MD  
**Téléchargement ZIP (v1.1)** → https://www.mediafire.com/file/6ofivq4r7am9em5/ZENTROX-BOT-MD-V1.1.zip/file  
**Groupe WhatsApp communauté** → https://chat.whatsapp.com/IfoWwiBZKfZIzAbornqsQu  
**Chaîne d’annonces WhatsApp** → https://whatsapp.com/channel/0029Vb6nKuV8vd1M1iBlWe2l

---

### 🛠️ Installation rapide (3 étapes)

```bash
# 1. Cloner le dépôt
git clone https://github.com/STIVE-DEVX/ZENTROX-BOT-MD.git

# 2. Entrer dans le dossier
cd ZENTROX-BOT-MD

# 3. Installer les dépendances
npm install
```

---

### ⚙️ Configuration (obligatoire)

Ouvre le fichier `settings.js` et modifie au minimum ces lignes :

```javascript
global.owner = ["237XXXXXXXXXX"];          // ← Ton numéro (avec code pays, sans +)
global.ownerName = "Ton Nom / Pseudo";
global.botName = "ZENTROX-BOT";
global.prefix = ".";                        // ou "!" ou "/" ou ce que tu veux
```

Optionnel : configure aussi le nom du bot, le menu, les messages de bienvenue, etc.

---

### ▶️ Lancement

```bash
node index.js
# ou
npm start
```

→ Scanne le QR code (ou utilise le code de pairing si disponible)

---

### ☁️ Déploiement 24/7 (recommandé)

| Plateforme          | Lien d’inscription / dashboard                          | Difficulté |
|---------------------|----------------------------------------------------------|------------|
| Bot-Hosting.net     | https://bot-hosting.net/?aff=1370080417126027337         | ★☆☆☆☆      |
| Katabump            | https://dashboard.katabump.com/auth/login#4191ad         | ★☆☆☆☆      |
| Railway.app         | Importer depuis GitHub                                   | ★★☆☆☆      |
| Render.com          | Importer depuis GitHub                                   | ★★☆☆☆      |
| VPS Linux (PM2)     | Installation manuelle avec pm2                           | ★★★☆☆      |
| Termux              | Possible mais déconseillé pour du 24/7                   | ★★★★☆      |

---

### 📚 Ressources & Tutoriels

- Documentation → dossier `/docs`
- Vidéo : Créer un hébergement rapide → https://youtu.be/f0GUNqHf1Eo
- Vidéo : Déploiement complet ZENTROX → https://youtu.be/Lwlw--RoGXM

---

### 🤝 Contribuer

Les contributions sont les bienvenues !

1. Fork le projet
2. Crée une branche (`git checkout -b feature/nouvelle-commande`)
3. Commit tes changements
4. Push ta branche
5. Ouvre une **Pull Request**

---

### 📜 Licence & Avertissement

Distribué sous licence **MIT** (voir fichier `LICENSE`).

**Responsabilité** : L’utilisation abusive (spam, pub massive, harcèlement…) peut entraîner un bannissement par WhatsApp. Le développeur décline toute responsabilité en cas de mauvais usage.

---

Développé avec ❤️ par **STIVO TECH**  
📧 techstivo@gmail.com  
Telegram : @techdevform 

**Merci de laisser une ⭐ si le projet t’est utile !** ⭐
```

Bonne continuation avec ZENTROX-BOT-MD ! 🚀
