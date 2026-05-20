/* ============================================================
   SLALOM KING — Game engine
   ============================================================ */

(() => {
'use strict';

// ============= STATE =============
const STATE = {
  screen: 'boot',
  player: null,         // { name, runs, crashes, totalTime, bestTrack }
  selectedTrack: null,
  scores: {},           // { trackId: [{ name, time, gates, crashes, ts }] }
  currentRun: null,
  prevScreen: 'menu',   // for help/lb back navigation
};

// ============= CONSTANTS =============
const C_W = 320;
const C_H = 480;
const SKIER_Y = 360;   // skier vertical screen position
const Z_SCALE = 1.0;
const M_PER_UNIT = 3;

// Physics
const GRAV_BASE = 0.05;
const TURN_ACCEL = 0.32;
const FRICTION_SNOW = 0.94;
const FRICTION_ICE = 0.985;
const FRICTION_POWDER = 0.85;
const VY_MAX = 7.2;
const VY_TUCK_BONUS = 1.4;
const VY_POWDER_CAP = 4.5;
const VX_MAX = 3.5;
const CRASH_FRAMES = 50;

// ============= CANVAS =============
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = C_W;
canvas.height = C_H;
ctx.imageSmoothingEnabled = false;

function resizeCanvas() {
  const screenEl = document.getElementById('screen-game');
  if (!screenEl.classList.contains('active')) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // fit canvas to viewport keeping aspect 320:480 (2:3)
  const scale = Math.min(vw / C_W, vh / C_H);
  const dw = Math.floor(C_W * scale);
  const dh = Math.floor(C_H * scale);
  canvas.style.width = dw + 'px';
  canvas.style.height = dh + 'px';
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 200));

// ============= UTIL =============
function $(id) { return document.getElementById(id); }
function fmt(t) {
  if (!isFinite(t) || t < 0) return '--:--';
  const min = Math.floor(t / 60);
  const sec = (t % 60).toFixed(2).padStart(5, '0');
  return `${min}:${sec}`;
}
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = $('screen-' + id);
  if (el) el.classList.add('active');
  STATE.screen = id;
  if (id === 'game') resizeCanvas();
}

// ============= STORAGE =============
const LS_PLAYER = 'sk_player';
const LS_SCORES = 'sk_scores';

function loadPlayer() {
  try {
    const raw = localStorage.getItem(LS_PLAYER);
    if (raw) STATE.player = JSON.parse(raw);
  } catch (e) {}
  if (!STATE.player) {
    STATE.player = {
      name: '', runs: 0, crashes: 0, totalTime: 0, bestTrack: null
    };
  }
}
function savePlayer() {
  try { localStorage.setItem(LS_PLAYER, JSON.stringify(STATE.player)); } catch (e) {}
}
function loadScores() {
  try {
    const raw = localStorage.getItem(LS_SCORES);
    if (raw) STATE.scores = JSON.parse(raw);
  } catch (e) { STATE.scores = {}; }
}
function saveScores() {
  try { localStorage.setItem(LS_SCORES, JSON.stringify(STATE.scores)); } catch (e) {}
}

// Simulated "global" highscores (other players)
// In a real backend this would be fetched. We seed plausible bots so
// the leaderboard isn't empty on first run, and player times slot in.
function seedGlobalScores() {
  const seedBots = {
    streif:       [['JOHANSSON', 106.4], ['KRIECHMAYR', 108.1], ['MAYER', 109.7], ['ODERMATT', 110.5], ['CRAWFORD', 112.2], ['SARRAZIN', 113.8], ['CLAREY', 115.1], ['ALLEGRE', 117.3]],
    lauberhorn:   [['HINTERMANN', 143.9], ['CATER', 145.2], ['FEUZ', 146.4], ['CASSE', 148.0], ['MAYER', 149.7], ['DRESSEN', 151.5]],
    saslong:      [['PARIS', 119.8], ['INNERHOFER', 121.3], ['BENNETT', 122.6], ['FRANZONI', 124.9], ['MARSAGLIA', 126.0]],
    birdsofprey:  [['COCHRAN-SIEGLE', 109.5], ['CRAWFORD', 110.8], ['GANONG', 112.1], ['JANSRUD', 113.4]],
    are:          [['MYHRER', 96.8], ['HIRSCHER', 98.2], ['KRISTOFFERSEN', 99.5], ['NOEL', 100.7], ['BRAATHEN', 102.1]],
    chamonix:     [['PINTURAULT', 117.5], ['NOEL', 119.0], ['SCHWARZ', 120.6], ['ZUBCIC', 122.4]],
    niseko:       [['YAMAMOTO', 89.6], ['SUZUKI', 91.2], ['TANAKA', 92.8], ['NAKAMURA', 94.1]],
    whistler:     [['GUAY', 113.9], ['OSBORNE-PARADIS', 115.4], ['THOMSEN', 117.2]],
    aspen:        [['LIGETY', 103.7], ['MILLER', 105.0], ['GANONG', 106.6], ['BENNETT', 108.5]],
    portillo:     [['VONN', 69.5], ['INNERHOFER', 71.0], ['KILDE', 72.5], ['CLAREY', 74.0]],
  };
  for (const tid in seedBots) {
    if (!STATE.scores[tid]) {
      STATE.scores[tid] = seedBots[tid].map(([n, t]) => ({
        name: n, time: t, gates: -1, crashes: 0, ts: 0, bot: true
      }));
    }
  }
  saveScores();
}

// ============= TRACK LIST RENDERING =============
function renderTrackList() {
  const list = $('track-list');
  list.innerHTML = '';
  TRACKS.forEach(t => {
    const card = document.createElement('button');
    card.className = 'track-card';

    // Flag
    const flag = document.createElement('div');
    flag.className = 'track-flag';
    const colors = t.flagColors;
    if (colors.length === 3 && colors[0] === colors[2]) {
      flag.style.background = `linear-gradient(180deg, ${colors[0]} 33%, ${colors[1]} 33% 66%, ${colors[2]} 66%)`;
    } else if (colors.length === 3) {
      flag.style.background = `linear-gradient(90deg, ${colors[0]} 33%, ${colors[1]} 33% 66%, ${colors[2]} 66%)`;
    } else {
      flag.style.background = colors[0];
    }

    const info = document.createElement('div');
    info.className = 'track-info';
    info.innerHTML = `
      <div class="track-name">${t.name}</div>
      <div class="track-where">${t.where}</div>
      <div class="track-meta">${(t.length/1000).toFixed(1)}KM • FALL ${t.drop}M</div>
    `;

    const stars = document.createElement('div');
    stars.className = 'track-stars';
    stars.textContent = '★'.repeat(t.difficulty) + '☆'.repeat(5 - t.difficulty);

    card.appendChild(flag);
    card.appendChild(info);
    card.appendChild(stars);
    card.onclick = () => openBriefing(t);
    list.appendChild(card);
  });
}

function openBriefing(track) {
  STATE.selectedTrack = track;
  $('brief-name').textContent = track.name;
  $('brief-where').textContent = track.where;
  $('brief-length').textContent = (track.length/1000).toFixed(1) + ' KM';
  $('brief-drop').textContent = track.drop + ' M';
  $('brief-diff').textContent = '★'.repeat(track.difficulty);
  $('brief-surface').textContent = track.surface;
  $('brief-desc').textContent = track.desc;

  const flag = $('brief-flag');
  const colors = track.flagColors;
  if (colors.length === 3 && colors[0] === colors[2]) {
    flag.style.background = `linear-gradient(180deg, ${colors[0]} 33%, ${colors[1]} 33% 66%, ${colors[2]} 66%)`;
  } else {
    flag.style.background = `linear-gradient(90deg, ${colors[0]} 33%, ${colors[1]} 33% 66%, ${colors[2]} 66%)`;
  }

  // Best time on this track
  const scores = STATE.scores[track.id] || [];
  const best = scores.filter(s => !s.bot).sort((a,b) => a.time - b.time)[0];
  if (best) {
    $('brief-record').textContent = `${fmt(best.time)} (${best.name})`;
  } else {
    $('brief-record').textContent = `${fmt(track.record)} (CPU)`;
  }
  showScreen('briefing');
}

// ============= LEADERBOARD =============
let lbCurrentTrack = null;

function renderLeaderboard() {
  const tabs = $('lb-tabs');
  tabs.innerHTML = '';
  TRACKS.forEach(t => {
    const tab = document.createElement('button');
    tab.className = 'lb-tab' + (lbCurrentTrack === t.id ? ' active' : '');
    tab.textContent = t.name;
    tab.onclick = () => { lbCurrentTrack = t.id; renderLeaderboard(); };
    tabs.appendChild(tab);
  });
  if (!lbCurrentTrack) {
    lbCurrentTrack = TRACKS[0].id;
    return renderLeaderboard();
  }
  const list = $('lb-list');
  list.innerHTML = '';
  const scores = (STATE.scores[lbCurrentTrack] || [])
    .slice()
    .sort((a,b) => a.time - b.time)
    .slice(0, 20);
  if (scores.length === 0) {
    list.innerHTML = '<div class="lb-row"><span></span><span class="lb-name">INGA TIDER ÄN</span><span></span></div>';
    return;
  }
  scores.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'lb-row';
    if (!s.bot && s.name === STATE.player.name) row.classList.add('me');
    const rank = document.createElement('span');
    rank.className = 'lb-rank' + (i === 0 ? ' gold' : i === 1 ? ' silver' : i === 2 ? ' bronze' : '');
    rank.textContent = '#' + (i+1);
    const name = document.createElement('span');
    name.className = 'lb-name';
    name.textContent = s.name + (s.bot ? '' : ' ◆');
    const time = document.createElement('span');
    time.className = 'lb-time';
    time.textContent = fmt(s.time);
    row.appendChild(rank);
    row.appendChild(name);
    row.appendChild(time);
    list.appendChild(row);
  });
}

// ============= GAME ENGINE =============
let game = null;

function startGame(track) {
  const segs = buildTrackSegments(track);
  game = {
    track,
    segs,
    // skier state
    px: 0,       // world x (positive = right)
    pz: 0,       // world z (positive = down/forward)
    vx: 0,
    vy: 1.5,     // initial gentle push
    angle: 0,    // visual lean
    tuck: false,
    crashed: 0,  // frames remaining in crash
    onIce: false,
    inPowder: false,
    // run state
    startTime: performance.now(),
    elapsed: 0,
    finished: false,
    gateIndex: 0,
    gatesPassed: 0,
    gatesMissed: 0,
    checkpointIndex: 0,
    checkpoints: [],   // array of times when reached
    crashes: 0,
    topSpeed: 0,
    styleBonus: 0,
    // visuals
    particles: [],
    flashMsg: '',
    flashUntil: 0,
    flashType: '',
    // input
    keys: { left: false, right: false, down: false },
    paused: false,
  };
  // Reset gates
  game.segs.gates.forEach(g => { g.passed = false; g.missed = false; });

  $('hud-track').textContent = track.name;
  $('hud-gates').textContent = '0/' + game.segs.gates.length;

  showScreen('game');
  resizeCanvas();
  if (!loopRunning) startLoop();
}

// ============= INPUT =============
function setKey(k, v) {
  if (!game) return;
  if (k in game.keys) game.keys[k] = v;
}

window.addEventListener('keydown', e => {
  if (STATE.screen !== 'game' && STATE.screen !== 'pause') return;
  if (e.key === 'ArrowLeft' || e.key === 'a') { setKey('left', true); e.preventDefault(); }
  else if (e.key === 'ArrowRight' || e.key === 'd') { setKey('right', true); e.preventDefault(); }
  else if (e.key === 'ArrowDown' || e.key === 's') { setKey('down', true); e.preventDefault(); }
  else if (e.key === ' ' || e.key === 'Escape') { togglePause(); e.preventDefault(); }
});
window.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a') setKey('left', false);
  else if (e.key === 'ArrowRight' || e.key === 'd') setKey('right', false);
  else if (e.key === 'ArrowDown' || e.key === 's') setKey('down', false);
});

// Touch controls
document.querySelectorAll('.tc-btn').forEach(btn => {
  const k = btn.dataset.key;
  const onDown = e => { e.preventDefault(); setKey(k, true); };
  const onUp = e => { e.preventDefault(); setKey(k, false); };
  btn.addEventListener('touchstart', onDown, { passive: false });
  btn.addEventListener('touchend', onUp, { passive: false });
  btn.addEventListener('touchcancel', onUp, { passive: false });
  btn.addEventListener('mousedown', onDown);
  btn.addEventListener('mouseup', onUp);
  btn.addEventListener('mouseleave', onUp);
});

// Device orientation steering (optional, mobile)
let useOrientation = false;
function enableOrientationSteering() {
  if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
    window.addEventListener('deviceorientation', e => {
      if (!game || !useOrientation) return;
      const tilt = e.gamma || 0; // -90..90 (left-right tilt)
      if (Math.abs(tilt) < 4) {
        game.keys.left = false; game.keys.right = false;
      } else if (tilt < 0) {
        game.keys.left = true; game.keys.right = false;
      } else {
        game.keys.right = true; game.keys.left = false;
      }
    });
  }
}

// ============= GAME LOOP =============
let loopRunning = false;
let lastTime = 0;
function startLoop() {
  loopRunning = true;
  lastTime = performance.now();
  requestAnimationFrame(loop);
}
function loop(now) {
  if (!loopRunning) return;
  const dt = Math.min(50, now - lastTime);
  lastTime = now;
  if (game && !game.paused && !game.finished) {
    update(dt / 16.67);
  }
  if (game) render();
  requestAnimationFrame(loop);
}

// ============= UPDATE =============
function update(dt) {
  // Time
  if (game.crashed > 0) {
    game.crashed--;
  }
  game.elapsed = (performance.now() - game.startTime) / 1000;

  // Determine surface under skier
  game.onIce = false;
  game.inPowder = false;
  for (const p of game.segs.patches) {
    if (game.pz >= p.z && game.pz < p.z + p.length) {
      const dx = Math.abs(game.px - p.x);
      if (dx < p.width / 2) {
        if (p.type === 'ice') game.onIce = true;
        else if (p.type === 'powder') game.inPowder = true;
      }
    }
  }

  // Determine current gradient
  const gp = game.segs.gradientPoints;
  let curG = game.track.physics.gradient;
  for (let i = 0; i < gp.length; i++) {
    if (gp[i].z > game.pz) { curG = (gp[i-1] || gp[0]).g; break; }
  }

  // Apply gravity (always pulls forward)
  if (game.crashed > 0) {
    game.vy *= 0.86;
    game.vx *= 0.80;
  } else {
    let maxVy = VY_MAX * curG;
    if (game.tuck) maxVy *= VY_TUCK_BONUS / 1.4 + 0.4;  // ~110%
    if (game.keys.down) maxVy += VY_TUCK_BONUS * 0.4;
    if (game.inPowder) maxVy = Math.min(maxVy, VY_POWDER_CAP);

    game.vy += GRAV_BASE * curG * dt;
    if (game.vy > maxVy) game.vy -= 0.25 * dt;

    // Input - sideways
    if (game.keys.left)  game.vx -= TURN_ACCEL * dt;
    if (game.keys.right) game.vx += TURN_ACCEL * dt;
    // Edge friction (less effective on ice)
    let fric;
    if (game.onIce) fric = FRICTION_ICE;
    else if (game.inPowder) fric = FRICTION_POWDER;
    else fric = FRICTION_SNOW;
    // Apply friction more gently on ice = more slip
    if (!game.keys.left && !game.keys.right) {
      game.vx *= fric;
    } else {
      // input applied; still some lateral friction
      game.vx *= (fric * 0.7 + 0.3);
    }

    // Top speed
    if (Math.abs(game.vx) > VX_MAX) {
      game.vx = Math.sign(game.vx) * VX_MAX;
    }
  }

  // Update position
  game.px += game.vx * dt;
  game.pz += game.vy * dt;

  // Visual lean
  const targetAngle = (game.keys.right ? 1 : 0) - (game.keys.left ? 1 : 0);
  game.angle += (targetAngle - game.angle) * 0.12 * dt;

  // Top speed tracking
  const kmh = game.vy * 13;
  if (kmh > game.topSpeed) game.topSpeed = kmh;

  // Clamp inside track
  const trackHalf = 130 * game.track.physics.width;
  if (Math.abs(game.px) > trackHalf) {
    // Slow down sharply if off-piste
    game.vy *= 0.93;
    game.px = Math.sign(game.px) * trackHalf;
    game.vx *= -0.3;
  }

  // Check obstacles
  if (game.crashed === 0) {
    for (const o of game.segs.obstacles) {
      const dz = o.z - game.pz;
      if (dz > -8 && dz < 4) {
        const dx = Math.abs(game.px - o.x);
        const radius = (o.type === 'tree') ? 14 : (o.type === 'rock') ? 12 : 16;
        if (dx < radius && o.type !== 'mogul') {
          // CRASH
          crashPlayer();
          break;
        } else if (dx < radius && o.type === 'mogul') {
          // Mogul: small jolt
          game.vy *= 0.96;
          game.vx += (game.px - o.x) * 0.04;
          spawnParticles(game.px, game.pz, 4, '#fff');
        }
      }
    }
  }

  // Check gates
  for (let i = game.gateIndex; i < game.segs.gates.length; i++) {
    const g = game.segs.gates[i];
    if (g.passed || g.missed) continue;
    if (game.pz > g.z + 5) {
      // Gate is now behind us
      const dx = game.px - g.x;
      // Gate is a pair of flags ~28px apart - "passing" means going between them
      if (Math.abs(dx) < 30) {
        g.passed = true;
        game.gatesPassed++;
        game.styleBonus += 0.05;
        flash('GRIND!', 'good');
      } else {
        g.missed = true;
        game.gatesMissed++;
        flash('MISSAD GRIND', 'bad');
      }
      game.gateIndex = i + 1;
    }
  }
  $('hud-gates').textContent = game.gatesPassed + '/' + game.segs.gates.length;

  // Check checkpoints
  for (let i = game.checkpointIndex; i < game.segs.checkpoints.length; i++) {
    if (game.pz > game.segs.checkpoints[i]) {
      game.checkpoints.push(game.elapsed);
      game.checkpointIndex = i + 1;
      flash('CHECKPOINT ' + (i+1), 'good');
      game.styleBonus += 0.5;
    }
  }

  // Finish line
  if (game.pz >= game.segs.worldLen) {
    finishRun();
  }

  // Particles
  spawnSkiTrail();
  for (let i = game.particles.length - 1; i >= 0; i--) {
    const p = game.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) game.particles.splice(i, 1);
  }

  // Update HUD
  game.tuck = game.keys.down;
  $('hud-time').textContent = fmt(game.elapsed);
  $('hud-dist').textContent = Math.floor(game.pz * M_PER_UNIT) + '/' + Math.floor(game.segs.worldLen * M_PER_UNIT);
  $('hud-speed').textContent = Math.floor(kmh);

  // Flash message
  if (game.flashUntil > performance.now()) {
    const el = $('hud-flash');
    el.textContent = game.flashMsg;
    el.className = 'hud-flash show ' + game.flashType;
  } else {
    $('hud-flash').className = 'hud-flash';
  }
}

function crashPlayer() {
  game.crashed = CRASH_FRAMES;
  game.crashes++;
  game.vy = Math.max(0.5, game.vy * 0.25);
  game.vx = (Math.random() - 0.5) * 4;
  spawnParticles(game.px, game.pz, 18, '#fff');
  flash('KRASCH!', 'bad');
}

function flash(msg, type) {
  game.flashMsg = msg;
  game.flashType = type || 'good';
  game.flashUntil = performance.now() + 1200;
}

function spawnParticles(x, z, n, color) {
  for (let i = 0; i < n; i++) {
    game.particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: z + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 2,
      life: 20 + Math.random() * 30,
      color
    });
  }
}

let lastTrail = 0;
function spawnSkiTrail() {
  if (game.vy < 0.6) return;
  lastTrail++;
  if (lastTrail < 2) return;
  lastTrail = 0;
  if (Math.abs(game.vx) > 1.2 || game.onIce) {
    // spray
    game.particles.push({
      x: game.px + (Math.random() - 0.5) * 8,
      y: game.pz - 4,
      vx: -game.vx * 0.3 + (Math.random() - 0.5) * 1.5,
      vy: 0.5,
      life: 12,
      color: '#fff'
    });
  }
}

// ============= RENDER =============
function render() {
  const t = game.track;
  const pal = t.palette;
  const cameraZ = game.pz - SKIER_Y + 80;

  // Background snow
  ctx.fillStyle = pal.snow;
  ctx.fillRect(0, 0, C_W, C_H);

  // Track shadow / out of bounds (sides)
  const halfTrack = 130 * t.physics.width;
  const leftEdgeX = C_W / 2 - halfTrack;
  const rightEdgeX = C_W / 2 + halfTrack;
  ctx.fillStyle = pal.shadow;
  if (leftEdgeX > 0) ctx.fillRect(0, 0, leftEdgeX, C_H);
  if (rightEdgeX < C_W) ctx.fillRect(rightEdgeX, 0, C_W - rightEdgeX, C_H);

  // Edge texture - vertical dashes
  ctx.fillStyle = '#000';
  for (let z = -((cameraZ) % 16); z < C_H; z += 16) {
    if (leftEdgeX > 0) ctx.fillRect(leftEdgeX - 2, z, 2, 8);
    if (rightEdgeX < C_W) ctx.fillRect(rightEdgeX, z, 2, 8);
  }

  // Draw distance markers (every 100 game units = ~300m)
  ctx.fillStyle = pal.shadow;
  const startZ = Math.floor(cameraZ / 100) * 100;
  for (let zz = startZ; zz < cameraZ + C_H + 100; zz += 100) {
    const screenY = zz - cameraZ;
    ctx.fillRect(C_W / 2 - 100, screenY, 200, 1);
  }

  // Patches (ice, powder)
  for (const p of game.segs.patches) {
    const screenY = p.z - cameraZ;
    if (screenY < -30 || screenY > C_H + 30) continue;
    if (p.type === 'ice') {
      ctx.fillStyle = '#9fd0f5';
      ctx.fillRect(
        C_W / 2 + p.x - p.width / 2,
        screenY,
        p.width,
        p.length
      );
      // ice shine
      ctx.fillStyle = '#d0ecff';
      for (let i = 0; i < 3; i++) {
        const sx = C_W / 2 + p.x - p.width / 2 + Math.sin(p.z * 0.1 + i) * p.width / 3;
        ctx.fillRect(sx, screenY + i * 6, 8, 2);
      }
    } else if (p.type === 'powder') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(
        C_W / 2 + p.x - p.width / 2,
        screenY,
        p.width,
        p.length
      );
      // powder texture dots
      ctx.fillStyle = '#e8ecf5';
      for (let i = 0; i < 6; i++) {
        const px = C_W / 2 + p.x - p.width / 2 + ((p.z * 7 + i * 13) % p.width);
        const py = screenY + ((p.z * 3 + i * 7) % p.length);
        ctx.fillRect(px, py, 2, 2);
      }
    }
  }

  // Checkpoint lines
  for (let i = 0; i < game.segs.checkpoints.length; i++) {
    const cz = game.segs.checkpoints[i];
    const screenY = cz - cameraZ;
    if (screenY < -10 || screenY > C_H + 10) continue;
    const reached = i < game.checkpointIndex;
    ctx.fillStyle = reached ? '#3a7bd5' : '#ffd23f';
    // dashed line across track
    for (let x = leftEdgeX; x < rightEdgeX; x += 12) {
      ctx.fillRect(x, screenY, 8, 4);
    }
    // CP label
    ctx.fillStyle = '#000';
    ctx.font = '10px monospace';
    ctx.fillText('CP' + (i+1), C_W - 28, screenY + 14);
  }

  // Finish line
  const finishY = game.segs.worldLen - cameraZ;
  if (finishY > -20 && finishY < C_H + 20) {
    // Checkered pattern
    for (let x = leftEdgeX; x < rightEdgeX; x += 8) {
      for (let dy = 0; dy < 12; dy += 4) {
        const k = (Math.floor((x - leftEdgeX) / 8) + Math.floor(dy / 4)) % 2;
        ctx.fillStyle = k ? '#000' : '#fff';
        ctx.fillRect(x, finishY + dy, 8, 4);
      }
    }
  }

  // Obstacles - drawn from far to near for proper layering
  const visObs = game.segs.obstacles
    .filter(o => o.z > cameraZ - 30 && o.z < cameraZ + C_H + 10)
    .sort((a, b) => a.z - b.z);

  for (const o of visObs) {
    const sy = o.z - cameraZ;
    const sx = C_W / 2 + o.x;
    drawObstacle(sx, sy, o.type, t.palette);
  }

  // Gates
  for (const g of game.segs.gates) {
    const sy = g.z - cameraZ;
    if (sy < -20 || sy > C_H + 20) continue;
    const sx = C_W / 2 + g.x;
    drawGate(sx, sy, g);
  }

  // Particles
  for (const p of game.particles) {
    const sy = p.y - cameraZ + p.vy * 4;
    const sx = C_W / 2 + p.x;
    ctx.fillStyle = p.color;
    const sz = Math.max(1, Math.floor(p.life / 8));
    ctx.fillRect(sx, sy, sz, sz);
  }

  // Skier - drawn at actual world x position
  drawSkier(C_W / 2 + game.px, SKIER_Y, game.angle, game.tuck, game.crashed > 0);

  // Crash overlay
  if (game.crashed > 0) {
    const alpha = (game.crashed / CRASH_FRAMES) * 0.3;
    ctx.fillStyle = `rgba(230,57,70,${alpha})`;
    ctx.fillRect(0, 0, C_W, C_H);
  }

  // Tuck visual indicator (lines whipping past)
  if (game.tuck && game.vy > 4) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < 6; i++) {
      const lx = (Math.random() * C_W) | 0;
      const ly = ((Math.random() * C_H) | 0);
      ctx.fillRect(lx, ly, 1, 6);
    }
  }
}

// Pixel drawing
function drawSkier(x, y, angle, tuck, crashed) {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));
  const lean = angle * 4;
  if (crashed) {
    // Crash splat
    ctx.fillStyle = '#e63946';
    ctx.fillRect(-8, -4, 16, 8);
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(-4, -8, 8, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-12, -2, 4, 2);
    ctx.fillRect(8, -2, 4, 2);
  } else if (tuck) {
    // Body crouched
    ctx.fillStyle = '#e63946'; // jacket
    ctx.fillRect(-4, -10, 8, 8);
    ctx.fillStyle = '#243763'; // pants
    ctx.fillRect(-4, -2, 8, 4);
    // helmet
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(-3, -14, 6, 4);
    // skis
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-6 + lean, 2, 3, 10);
    ctx.fillRect(3 + lean, 2, 3, 10);
    // poles tucked
    ctx.fillStyle = '#888';
    ctx.fillRect(-7, -8, 1, 6);
    ctx.fillRect(6, -8, 1, 6);
  } else {
    // standing
    // skis
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-6 + lean, 2, 3, 12);
    ctx.fillRect(3 + lean, 2, 3, 12);
    // body
    ctx.fillStyle = '#e63946'; // jacket
    ctx.fillRect(-4, -8, 8, 10);
    // pants
    ctx.fillStyle = '#243763';
    ctx.fillRect(-4, 2, 8, 2);
    // helmet
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(-3, -13, 6, 5);
    // visor
    ctx.fillStyle = '#000';
    ctx.fillRect(-3, -10, 6, 1);
    // arms
    ctx.fillStyle = '#e63946';
    ctx.fillRect(-6, -6, 2, 6);
    ctx.fillRect(4, -6, 2, 6);
    // poles
    ctx.fillStyle = '#888';
    ctx.fillRect(-7, -4, 1, 10);
    ctx.fillRect(6, -4, 1, 10);
  }
  ctx.restore();
}

function drawObstacle(x, y, type, pal) {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));
  if (type === 'tree') {
    // Triangle pixel tree
    ctx.fillStyle = pal.tree || '#2d6b3a';
    // shadow
    ctx.fillStyle = '#00000044';
    ctx.fillRect(-8, 0, 16, 4);
    // trunk
    ctx.fillStyle = '#4a2c1a';
    ctx.fillRect(-2, -4, 4, 6);
    // foliage (pixel triangle stacked)
    ctx.fillStyle = pal.tree || '#2d6b3a';
    ctx.fillRect(-3, -10, 6, 6);
    ctx.fillRect(-5, -8, 10, 4);
    ctx.fillRect(-7, -6, 14, 2);
    // highlight
    ctx.fillStyle = '#4a8b5a';
    ctx.fillRect(-2, -10, 2, 2);
    ctx.fillRect(-4, -8, 2, 2);
  } else if (type === 'rock') {
    ctx.fillStyle = '#00000044';
    ctx.fillRect(-7, 0, 14, 3);
    ctx.fillStyle = pal.rock || '#5c5c5c';
    ctx.fillRect(-6, -6, 12, 8);
    ctx.fillRect(-4, -8, 8, 2);
    ctx.fillStyle = '#7a7a7a';
    ctx.fillRect(-4, -6, 4, 2);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(-6, 0, 12, 2);
  } else if (type === 'mogul') {
    ctx.fillStyle = '#d0d8e8';
    ctx.fillRect(-6, -2, 12, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-4, -4, 8, 4);
    ctx.fillStyle = '#a0a8c0';
    ctx.fillRect(-6, 2, 12, 2);
  }
  ctx.restore();
}

function drawGate(x, y, gate) {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));
  const c = gate.color === 'red' ? '#e63946' : '#3a7bd5';
  const drawn = gate.passed ? 0.4 : 1.0;
  // Two flags 24 apart
  for (const side of [-16, 16]) {
    // pole
    ctx.fillStyle = '#000';
    ctx.fillRect(side, -10, 1, 14);
    // flag
    if (gate.missed && side === 16) {
      ctx.fillStyle = '#888';
    } else {
      ctx.fillStyle = c;
    }
    ctx.globalAlpha = drawn;
    if (side < 0) {
      ctx.fillRect(side + 1, -10, 8, 4);
    } else {
      ctx.fillRect(side - 8, -10, 8, 4);
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// ============= FINISH =============
function finishRun() {
  game.finished = true;
  const t = game.track;
  const raw = game.elapsed;
  const penalty = game.gatesMissed * 3 + game.crashes * 3;
  const bonus = game.styleBonus;
  const finalTime = raw + penalty - bonus;

  // Update player stats
  STATE.player.runs++;
  STATE.player.crashes += game.crashes;
  STATE.player.totalTime += finalTime;
  if (!STATE.player.bestTrack || finalTime < STATE.player.bestTrack.time) {
    STATE.player.bestTrack = { name: t.name, time: finalTime };
  }
  savePlayer();

  // Save score
  if (!STATE.scores[t.id]) STATE.scores[t.id] = [];
  const myScore = {
    name: STATE.player.name || 'YOU',
    time: finalTime,
    gates: game.gatesPassed,
    crashes: game.crashes,
    ts: Date.now(),
    bot: false
  };
  STATE.scores[t.id].push(myScore);
  saveScores();

  // Compute global rank
  const ranked = STATE.scores[t.id].slice().sort((a,b) => a.time - b.time);
  const rank = ranked.indexOf(myScore) + 1;

  // Fill result UI
  $('result-title').textContent = game.crashes > 5 ? 'EJ KLAR' : 'MÅL!';
  $('result-time').textContent = fmt(finalTime);
  $('result-track').textContent = t.name;
  $('result-raw').textContent = fmt(raw);
  $('result-gates').textContent = game.gatesPassed + '/' + game.segs.gates.length;
  $('result-penalty').textContent = '+' + penalty.toFixed(2) + 's';
  $('result-bonus').textContent = '-' + bonus.toFixed(2) + 's';
  $('result-crashes').textContent = game.crashes;
  $('result-topspeed').textContent = Math.floor(game.topSpeed) + ' km/h';
  $('result-rank').textContent = 'GLOBAL PLACERING: #' + (rank || '?') + ' / ' + ranked.length;

  setTimeout(() => showScreen('result'), 800);
}

// ============= PAUSE =============
function togglePause() {
  if (!game || game.finished) return;
  if (game.paused) {
    game.paused = false;
    // adjust start time so elapsed continues from where it was
    game.startTime = performance.now() - game.elapsed * 1000;
    showScreen('game');
  } else {
    game.paused = true;
    showScreen('pause');
  }
}

// ============= UI EVENTS =============
$('screen-boot').addEventListener('click', () => {
  // First time? go to profile. Otherwise to menu.
  if (!STATE.player || !STATE.player.name) {
    refreshProfile();
    showScreen('profile');
  } else {
    refreshMenu();
    showScreen('menu');
  }
});

function refreshProfile() {
  $('profile-name').textContent = STATE.player.name || '—';
  $('name-input').value = STATE.player.name || '';
  $('stat-total').textContent = fmt(STATE.player.totalTime || 0);
  $('stat-runs').textContent = STATE.player.runs || 0;
  $('stat-crashes').textContent = STATE.player.crashes || 0;
  $('stat-best').textContent = STATE.player.bestTrack
    ? STATE.player.bestTrack.name + ' ' + fmt(STATE.player.bestTrack.time)
    : '—';
}

function refreshMenu() {
  $('menu-name').textContent = STATE.player.name || 'ÅKARE';
}

$('btn-save-name').addEventListener('click', () => {
  const n = $('name-input').value.trim().toUpperCase().slice(0, 10) || 'ÅKARE';
  STATE.player.name = n;
  savePlayer();
  refreshProfile();
  refreshMenu();
  flashHint('SPARAT!');
});

$('btn-to-menu').addEventListener('click', () => {
  if (!STATE.player.name) {
    STATE.player.name = $('name-input').value.trim().toUpperCase().slice(0, 10) || 'ÅKARE';
    savePlayer();
  }
  refreshMenu();
  showScreen('menu');
});

$('btn-profile').addEventListener('click', () => { refreshProfile(); showScreen('profile'); });

$('btn-leaderboard').addEventListener('click', () => {
  STATE.prevScreen = 'menu';
  renderLeaderboard();
  showScreen('leaderboard');
});
$('btn-lb-back').addEventListener('click', () => showScreen(STATE.prevScreen || 'menu'));

$('btn-help').addEventListener('click', () => { STATE.prevScreen = 'menu'; showScreen('help'); });
$('btn-help-back').addEventListener('click', () => showScreen(STATE.prevScreen || 'menu'));

$('btn-brief-back').addEventListener('click', () => showScreen('menu'));
$('btn-brief-start').addEventListener('click', () => { startGame(STATE.selectedTrack); });

$('btn-pause').addEventListener('click', togglePause);
$('btn-resume').addEventListener('click', togglePause);
$('btn-restart').addEventListener('click', () => {
  game.paused = false;
  startGame(STATE.selectedTrack);
});
$('btn-quit').addEventListener('click', () => {
  game.paused = false;
  game = null;
  showScreen('menu');
});

$('btn-result-menu').addEventListener('click', () => showScreen('menu'));
$('btn-result-replay').addEventListener('click', () => startGame(STATE.selectedTrack));

function flashHint(text) {
  // small toast
  const t = document.createElement('div');
  t.textContent = text;
  t.style.cssText = 'position:fixed;top:30%;left:50%;transform:translateX(-50%);background:#16213e;color:#ffd23f;border:3px solid #000;padding:14px 22px;z-index:9999;font-size:11px;letter-spacing:2px;box-shadow:4px 4px 0 #000;';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 800);
}

// ============= PWA SW =============
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}

// ============= INIT =============
loadPlayer();
loadScores();
seedGlobalScores();
renderTrackList();
enableOrientationSteering();
showScreen('boot');

// Expose for debugging
window.__GAME = { STATE, get game(){return game;}, TRACKS };

})();
