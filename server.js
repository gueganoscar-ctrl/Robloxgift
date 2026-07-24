const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Route principale pour afficher la page HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Acheter des Robux (09_05_2026 16：56：42) - Copie.html"));
});

app.get("/roblox-avatar", async (req, res) => {
  try {
    const username = String(req.query.username || "").trim();
    if (!username) {
      return res.status(400).json({ error: "Pseudo manquant" });
    }

    // 1. Trouver l'ID du joueur
    const userResponse = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
    });
    const userData = await userResponse.json();
    const user = userData.data?.[0];

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    // 2. Trouver sa photo de profil
    const thumbUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png&isCircular=false`;
    const thumbResponse = await fetch(thumbUrl);
    const thumbData = await thumbResponse.json();
    const imageUrl = thumbData.data?.[0]?.imageUrl;

    // 3. Trouver sa date de création
    const detailResponse = await fetch(`https://users.roblox.com/v1/users/${user.id}`);
    const detailData = await detailResponse.json();
    
    const createdDate = new Date(detailData.created);
    const formattedDate = createdDate.toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' });

    // On renvoie l'image ET la date
    res.json({ imageUrl: imageUrl, creationDate: formattedDate });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
