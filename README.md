# 🎿 SLALOM KING

> Retro 8-bit slalom & downhill-spel — åk de mest kända världsbanor från Streif till Niseko, sladda på is, jaga global highscore.

![Status](https://img.shields.io/badge/status-spelbar-brightgreen)
![Tech](https://img.shields.io/badge/tech-vanilla%20JS-yellow)
![PWA](https://img.shields.io/badge/PWA-mobil%20app-blue)

```
       /\
      /  \    SLALOM KING
     /    \   ───────────
    / /\   \  v1.0
   / /  \   \
  /_/    \___\
```

## 🕹 Spela direkt

**Online:** Öppna `index.html` i valfri modern webbläsare — inga byggsteg, inga npm-paket, ingen backend.

**På mobil:** Lägg till på hemskärm — det installeras som PWA och fungerar offline.

**GitHub Pages:** Pusha repot, aktivera Pages, och spelet live på `https://<ditt-namn>.github.io/slalom-king/`.

## ✨ Funktioner

- **10 världsbanor** inspirerade av riktiga downhill-klassiker (Streif, Lauberhorn, Saslong, Birds of Prey, Åre, Chamonix, Niseko, Whistler, Aspen, Portillo)
- **Distinkt körkänsla per bana** — varje bana har topografi, isfrekvens, pudermängd, trädtäthet, lutningsprofil och grindfrekvens
- **Sladd på is!** — friktionssimulering med tre ytor (snö, is, puder)
- **Grindar (röd/blå)** med poäng och straff för missade
- **Checkpoints** med mellantider och bonustid
- **Hinder:** träd, sten, puckelpist
- **Krasch-system** med straff och återhämtning
- **Tuck-läge** för extra fart
- **Lokal + global highscore** (botar pre-laddade så listan inte är tom)
- **Spelarprofil** med statistik (totaltid, antal lopp, krascher, bästa gren)
- **PWA** — installerbar som riktig app på iOS/Android, fungerar offline
- **Mobil-kontroller** med tryckknappar + valfri gyrostyrning
- **Retro CRT-look** med scanlines och pixel-art genomgående
- **Inga externa beroenden** — ren HTML/CSS/JS

## 🎮 Kontroller

### Dator
| Tangent | Effekt |
|---------|--------|
| ◀ / A | Sväng vänster |
| ▶ / D | Sväng höger |
| ▼ / S | Tuck (mer fart, sämre kontroll) |
| SPACE / ESC | Paus |

### Mobil
- Tryckknappar nere på skärmen (◀ ▼ ▶)
- Valfri tilt-styrning (luta telefonen vänster/höger)

## 🏔 Banor

| ID | Namn | Land | Längd | Svårighet | Karaktär |
|----|------|------|-------|-----------|----------|
| streif | Streif | 🇦🇹 Österrike | 3,3 km | ★★★★★ | Brutalt isig |
| lauberhorn | Lauberhorn | 🇨🇭 Schweiz | 4,5 km | ★★★★ | Längst i världscupen |
| saslong | Saslong | 🇮🇹 Italien | 3,4 km | ★★★★ | Kamelpucklarna! |
| birdsofprey | Birds of Prey | 🇺🇸 USA | 2,7 km | ★★★★ | Kompakt och tekniskt |
| are | Olympia | 🇸🇪 Sverige | 3,0 km | ★★★ | Slalom-paradis |
| chamonix | Verte des Houches | 🇫🇷 Frankrike | 3,3 km | ★★★★ | Alpklassiker |
| niseko | Goshiki Powder | 🇯🇵 Japan | 2,2 km | ★★★ | Bottenlös puder |
| whistler | Dave Murray | 🇨🇦 Kanada | 3,0 km | ★★★★ | OS-bana från 2010 |
| aspen | America's Downhill | 🇺🇸 USA | 2,8 km | ★★★ | Klassisk amerikan |
| portillo | Roca Jack | 🇨🇱 Chile | 1,9 km | ★★★★★ | Brantast i världen |

## 📁 Projektstruktur

```
slalom-king/
├── index.html              # Spelets HTML-sida
├── style.css               # Retro pixel-art-styling
├── game.js                 # Spelmotor (fysik, render, input)
├── tracks.js               # Bandata + procedurell generering
├── manifest.json           # PWA-manifest
├── service-worker.js       # Offline-cachning
├── icon-192.png            # App-ikon
├── icon-512.png            # App-ikon
├── README.md               # Denna fil
├── LICENSE                 # MIT-licens
└── .github/
    └── workflows/
        └── deploy.yml      # Auto-deploy till GitHub Pages
```

## 🚀 Kör lokalt

Eftersom service worker kräver HTTP (inte `file://`):

```bash
# Med Python (3.x)
python3 -m http.server 8000
# eller med Node
npx serve .
# eller VS Code Live Server-tillägget
```

Öppna sedan `http://localhost:8000/`.

## 🌐 Deploy till GitHub Pages

1. Pusha repot till GitHub.
2. Gå till **Settings → Pages**.
3. Source: **GitHub Actions** (workflow:n i `.github/workflows/deploy.yml` deployar automatiskt).
4. Vänta 1–2 minuter — spelet är live!

## 📱 Som mobilapp

### Installera som PWA
- **iOS Safari:** Tryck dela → "Lägg till på hemskärmen"
- **Android Chrome:** Meny → "Installera appen"

Den körs sedan helskärm utan webbläsarens UI, fungerar offline, och uppdateras automatiskt när du publicerar nya versioner.

### Vidare till native app
Om du vill ha äkta App Store / Google Play-närvaro kan du wrappa PWA:n med:
- [**Capacitor**](https://capacitorjs.com/) (rekommenderas — minst friktion)
- [**PWABuilder**](https://www.pwabuilder.com/) (Microsoft, gratis, genererar paket)
- Tauri 2.0 (för Linux/macOS/Windows)

## 🔧 Utöka spelet

### Lägga till en bana
Lägg till ett objekt i `TRACKS`-arrayen i `tracks.js`:

```js
{
  id: "min-bana",
  name: "MIN BANA",
  where: "PLATS, LAND",
  country: "XX",
  flagColors: ["#ff0000", "#ffffff", "#0000ff"],
  length: 3000,
  drop: 700,
  difficulty: 3,
  surface: "PACKAT",
  desc: "Beskrivning...",
  palette: { sky: "...", snow: "...", shadow: "...", tree: "...", rock: "..." },
  physics: {
    gradient: 0.9,    // lutning (0.7-1.2)
    iceRate: 0.20,    // andel is (0-1)
    powderRate: 0.10,
    treeRate: 0.30,
    rockRate: 0.10,
    mogulRate: 0.15,
    gateRate: 0.50,
    narrowSections: false,
    width: 1.0
  },
  record: 100.0       // banrekord (sekunder)
}
```

### Riktig global highscore
Just nu är "global" simulerad lokalt. För en riktig global highscore kan du koppla till en gratis backend:

- **[Firebase Realtime Database](https://firebase.google.com/)** — generös free-tier, perfekt för highscores
- **[Supabase](https://supabase.com/)** — Postgres + JS-klient
- **[jsonbin.io](https://jsonbin.io/)** / **[Pantry](https://getpantry.cloud/)** — bara JSON-store, nollsetup

I `game.js`, byt ut `loadScores` och `saveScores` mot fetch-anrop till din backend.

### Topografisk data
För att använda riktig topografisk data kan man hämta höjdprofiler från:
- **OpenTopography** (gratis API)
- **USGS Elevation Point Query Service**
- **Mapbox Terrain RGB**

Konvertera höjdprofilen längs en bana till en `gradientPoints`-array. Detta är en intressant utbyggnad.

## 📜 Licens

MIT — gör vad du vill, kreditera om du tycker det är kul.

## 🙏 Inspiration

- **Heavy Shreddin'** (NES, 1990)
- **SkiFree** (Windows, 1991)
- **Ski or Die** (Electronic Arts, 1990)
- Världscupens verkliga downhill-banor

---

*Byggd med pixlar och kaffe. Hejdå Yeti!*
