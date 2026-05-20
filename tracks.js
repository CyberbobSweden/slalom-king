/* ============================================================
   TRACKS.JS — Real-world ski runs as game banor
   
   Each track is inspired by a famous downhill / slalom course.
   Topography is modeled via segments with different:
   - gradient (controls vy gain)
   - surface (snow/ice/powder/groomed)
   - obstacles (trees/rocks/moguls density)
   - width (how narrow the trail is)
   - gates (slalom gates pattern)
   ============================================================ */

const TRACKS = [
  {
    id: "streif",
    name: "STREIF",
    where: "KITZBÜHEL, ÖSTERRIKE",
    country: "AT",
    flagColors: ["#ed2939", "#ffffff", "#ed2939"], // austria
    length: 3312,       // meters (real)
    drop: 860,
    difficulty: 5,      // 1-5
    surface: "IS / HÅRT",
    desc: "Den brutalaste banan i världscupen. Mausefalle, Steilhang, Hausbergkante — du måste taga riskerna här annars är du chanslös. Iskall och stenhård.",
    palette: {
      sky: "#1a2a4d", snow: "#f0f4ff", shadow: "#a8b8d8",
      tree: "#1a4424", rock: "#5c5c5c"
    },
    physics: {
      gradient: 1.0,    // base downhill acceleration multiplier
      iceRate: 0.40,    // probability of ice patches
      powderRate: 0.02,
      treeRate: 0.25,
      rockRate: 0.18,
      mogulRate: 0.10,
      gateRate: 0.55,
      narrowSections: true,
      width: 0.85       // track width factor (0.5-1.2)
    },
    record: 105.12      // seconds
  },
  {
    id: "lauberhorn",
    name: "LAUBERHORN",
    where: "WENGEN, SCHWEIZ",
    country: "CH",
    flagColors: ["#ff0000", "#ffffff", "#ff0000"],
    length: 4480,
    drop: 1028,
    difficulty: 4,
    surface: "PACKAT",
    desc: "Världscupens längsta utförsåkning. Hundschopf och Wasserstation kräver mod. Kalla vinden viner — sikten kan vara dålig.",
    palette: {
      sky: "#2a3a6d", snow: "#e8eeff", shadow: "#b0c0e0",
      tree: "#2d6b3a", rock: "#6c6c6c"
    },
    physics: {
      gradient: 0.85,
      iceRate: 0.20,
      powderRate: 0.08,
      treeRate: 0.35,
      rockRate: 0.10,
      mogulRate: 0.15,
      gateRate: 0.40,
      narrowSections: true,
      width: 0.95
    },
    record: 142.80
  },
  {
    id: "saslong",
    name: "SASLONG",
    where: "VAL GARDENA, ITALIEN",
    country: "IT",
    flagColors: ["#009246", "#ffffff", "#ce2b37"],
    length: 3446,
    drop: 839,
    difficulty: 4,
    surface: "TEKNISK",
    desc: "Kamelpucklarna är ökända — tre snabba doser luft i rad där du måste landa rätt. Annars... krasch.",
    palette: {
      sky: "#3a4a7d", snow: "#f4f8ff", shadow: "#b8c8d8",
      tree: "#2d6b3a", rock: "#8a7a5a"
    },
    physics: {
      gradient: 0.90,
      iceRate: 0.18,
      powderRate: 0.05,
      treeRate: 0.30,
      rockRate: 0.15,
      mogulRate: 0.45, // kamelpucklarna!
      gateRate: 0.35,
      narrowSections: false,
      width: 1.0
    },
    record: 118.45
  },
  {
    id: "birdsofprey",
    name: "BIRDS OF PREY",
    where: "BEAVER CREEK, USA",
    country: "US",
    flagColors: ["#b22234", "#ffffff", "#3c3b6e"],
    length: 2683,
    drop: 776,
    difficulty: 4,
    surface: "VARIERAT",
    desc: "Brink, Talons, The Abyss. Färre meter men kompromisslös design. Hopp och svängar i samma andetag.",
    palette: {
      sky: "#1a3a5d", snow: "#f0f4ff", shadow: "#a0b0d0",
      tree: "#2d6b3a", rock: "#6c5c4c"
    },
    physics: {
      gradient: 0.95,
      iceRate: 0.25,
      powderRate: 0.08,
      treeRate: 0.40,
      rockRate: 0.20,
      mogulRate: 0.15,
      gateRate: 0.50,
      narrowSections: false,
      width: 0.95
    },
    record: 108.30
  },
  {
    id: "are",
    name: "OLYMPIA-BACKEN",
    where: "ÅRE, SVERIGE",
    country: "SE",
    flagColors: ["#006aa7", "#fecc00", "#006aa7"],
    length: 3000,
    drop: 700,
    difficulty: 3,
    surface: "SNÖ / IS",
    desc: "Hemmaplan! Världscupklassiker — slalom-paradiset. Kall vind från fjället, hård is på morgonen.",
    palette: {
      sky: "#2a3a8d", snow: "#f8fcff", shadow: "#c0d0e8",
      tree: "#1a5a2a", rock: "#7a7a7a"
    },
    physics: {
      gradient: 0.80,
      iceRate: 0.30,
      powderRate: 0.10,
      treeRate: 0.35,
      rockRate: 0.05,
      mogulRate: 0.10,
      gateRate: 0.70, // slalom-fest
      narrowSections: false,
      width: 1.05
    },
    record: 95.50
  },
  {
    id: "chamonix",
    name: "VERTE DES HOUCHES",
    where: "CHAMONIX, FRANKRIKE",
    country: "FR",
    flagColors: ["#0055a4", "#ffffff", "#ef4135"],
    length: 3343,
    drop: 870,
    difficulty: 4,
    surface: "TEKNISK",
    desc: "Mont Blancs skugga ovanför. Klassisk fransk teknisk linje — branta partier blandat med isiga passager.",
    palette: {
      sky: "#1a4a8d", snow: "#eaf2ff", shadow: "#a0b8d8",
      tree: "#2d6b3a", rock: "#8a8a8a"
    },
    physics: {
      gradient: 0.90,
      iceRate: 0.28,
      powderRate: 0.08,
      treeRate: 0.32,
      rockRate: 0.18,
      mogulRate: 0.18,
      gateRate: 0.45,
      narrowSections: true,
      width: 0.90
    },
    record: 116.20
  },
  {
    id: "niseko",
    name: "GOSHIKI POWDER",
    where: "NISEKO, JAPAN",
    country: "JP",
    flagColors: ["#ffffff", "#bc002d", "#ffffff"],
    length: 2200,
    drop: 540,
    difficulty: 3,
    surface: "PUDER",
    desc: "Den djupaste pudern i världen — \"japow\". Du flyter snarare än åker. Träd överallt, så hugg en linje.",
    palette: {
      sky: "#5a6a9d", snow: "#ffffff", shadow: "#d0d8e8",
      tree: "#0a3a1a", rock: "#9a9a9a"
    },
    physics: {
      gradient: 0.70,
      iceRate: 0.03,
      powderRate: 0.60, // pudrigt!
      treeRate: 0.55,
      rockRate: 0.05,
      mogulRate: 0.05,
      gateRate: 0.15,
      narrowSections: false,
      width: 1.10
    },
    record: 88.40
  },
  {
    id: "whistler",
    name: "DAVE MURRAY",
    where: "WHISTLER, KANADA",
    country: "CA",
    flagColors: ["#ff0000", "#ffffff", "#ff0000"],
    length: 3047,
    drop: 880,
    difficulty: 4,
    surface: "VARIERAT",
    desc: "OS-bana från 2010. Toughbreed Trail tar din mod. Skogspartier kommer kvickt — och sen den höga finishen.",
    palette: {
      sky: "#2a3a6d", snow: "#f0f4ff", shadow: "#a8b8c8",
      tree: "#1a5a2a", rock: "#5c4c3c"
    },
    physics: {
      gradient: 0.88,
      iceRate: 0.15,
      powderRate: 0.20,
      treeRate: 0.50,
      rockRate: 0.08,
      mogulRate: 0.20,
      gateRate: 0.40,
      narrowSections: true,
      width: 0.95
    },
    record: 112.70
  },
  {
    id: "aspen",
    name: "AMERICA'S DOWNHILL",
    where: "ASPEN, USA",
    country: "US",
    flagColors: ["#b22234", "#ffffff", "#3c3b6e"],
    length: 2820,
    drop: 754,
    difficulty: 3,
    surface: "PACKAT",
    desc: "Snabb och rolig. Mindre teknisk än Streif men du måste ha mod — det går fort på de öppna partierna.",
    palette: {
      sky: "#3a4a8d", snow: "#f4f8ff", shadow: "#b0c0d8",
      tree: "#2d6b3a", rock: "#7a6a5a"
    },
    physics: {
      gradient: 0.95,
      iceRate: 0.12,
      powderRate: 0.10,
      treeRate: 0.30,
      rockRate: 0.10,
      mogulRate: 0.15,
      gateRate: 0.45,
      narrowSections: false,
      width: 1.05
    },
    record: 102.30
  },
  {
    id: "portillo",
    name: "ROCA JACK",
    where: "PORTILLO, CHILE",
    country: "CL",
    flagColors: ["#0033a0", "#ffffff", "#d52b1e"],
    length: 1850,
    drop: 480,
    difficulty: 5,
    surface: "VERTIKAL",
    desc: "Andernas bratte vägg. Korta, brutala. Träffa fel linje och du är borta innan du hunnit blinka.",
    palette: {
      sky: "#1a2a5d", snow: "#e8eeff", shadow: "#9aa8c8",
      tree: "#3a4a3a", rock: "#5a4a3a"
    },
    physics: {
      gradient: 1.15, // brantast!
      iceRate: 0.35,
      powderRate: 0.05,
      treeRate: 0.05,
      rockRate: 0.30,
      mogulRate: 0.05,
      gateRate: 0.35,
      narrowSections: true,
      width: 0.75
    },
    record: 68.20
  }
];

// Generate a deterministic seed from track ID for procedural details
function trackSeed(id) {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Build the actual track segments procedurally from track config
function buildTrackSegments(track) {
  // Map track length (meters) to game world units
  // 1 game unit = ~3 meters of real distance
  const worldLen = Math.floor(track.length / 3);
  const seed = trackSeed(track.id);
  const rng = mulberry32(seed);
  const segments = [];

  // Number of checkpoints based on length
  const cpCount = Math.max(2, Math.floor(track.length / 800));
  const checkpoints = [];
  for (let i = 1; i <= cpCount; i++) {
    checkpoints.push(Math.floor((worldLen / (cpCount + 1)) * i));
  }

  // Generate gates (slalom gates) - alternating red/blue
  const gates = [];
  let z = 80; // start a bit down
  const baseGateSpacing = 28 / Math.max(0.1, track.physics.gateRate);
  let gateCount = 0;
  while (z < worldLen - 60) {
    const spacing = baseGateSpacing * (0.85 + rng() * 0.3);
    const offset = (rng() - 0.5) * 140 * track.physics.width;
    gates.push({
      z: Math.floor(z),
      x: offset,
      color: gateCount % 2 === 0 ? "red" : "blue",
      passed: false,
      missed: false
    });
    z += spacing;
    gateCount++;
  }

  // Generate obstacles
  const obstacles = [];
  for (let z = 40; z < worldLen - 20; z++) {
    const r = rng();
    let type = null;
    if (r < track.physics.treeRate * 0.06)            type = "tree";
    else if (r < (track.physics.treeRate * 0.06) + (track.physics.rockRate * 0.04))  type = "rock";
    else if (r < (track.physics.treeRate * 0.06) + (track.physics.rockRate * 0.04) + (track.physics.mogulRate * 0.06)) type = "mogul";

    if (type) {
      // Trees and rocks tend to be on the sides; moguls in middle
      let x;
      if (type === "mogul") {
        x = (rng() - 0.5) * 180 * track.physics.width;
      } else {
        // bias towards edges, but keep within visible track + edges
        const side = rng() < 0.5 ? -1 : 1;
        x = side * (40 + rng() * 90) * track.physics.width;
      }
      obstacles.push({ z, x, type });
    }
  }

  // Generate surface patches (ice and powder zones)
  const patches = [];
  for (let z = 20; z < worldLen - 20; z++) {
    const r = rng();
    if (r < track.physics.iceRate * 0.012) {
      const len = 8 + Math.floor(rng() * 18);
      const w = 40 + rng() * 60;
      patches.push({
        z, length: len,
        x: (rng() - 0.5) * 60,
        width: w,
        type: "ice"
      });
    } else if (r < track.physics.iceRate * 0.012 + track.physics.powderRate * 0.015) {
      const len = 10 + Math.floor(rng() * 20);
      const w = 50 + rng() * 80;
      patches.push({
        z, length: len,
        x: (rng() - 0.5) * 80,
        width: w,
        type: "powder"
      });
    }
  }

  // Build elevation profile (gradient) - has steep/flat sections
  const gradientPoints = [];
  let curG = track.physics.gradient;
  for (let z = 0; z < worldLen; z += 30) {
    gradientPoints.push({ z, g: curG });
    // vary gradient occasionally
    if (rng() < 0.3) {
      curG = track.physics.gradient * (0.7 + rng() * 0.6);
    }
  }

  return {
    worldLen,
    checkpoints,
    gates,
    obstacles,
    patches,
    gradientPoints
  };
}

function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
