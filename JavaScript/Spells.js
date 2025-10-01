// Definerer tilgjengelige spells med navn og ikon
const SPELLS = [
  { key: 'fire', label: '🔥 Fire' },
  { key: 'lightning', label: '⚡ Lightning' },
  { key: 'shadow', label: '🌑 Shadow' }
];

// Alle mulige kombinasjoner (enkelt, dobbelt, trippel)
const COMBOS = {
  'fire': { name: 'Fire Slash', desc: 'En ild-slash skjærer gjennom alt!', effect: fireEffect },
  'lightning': { name: 'Thunder Strike', desc: 'Lyn slår ned med voldsom kraft!', effect: lightningEffect },
  'shadow': { name: 'Shadow Orb', desc: 'En pulserende skygge-energi!', effect: shadowEffect },
  'fire+lightning': { name: 'Plasma Dragon', desc: 'En plasma-drage eksploderer ut!', effect: plasmaDragon },
  'fire+shadow': { name: 'Hellflame', desc: 'Mørk ild sprer seg som en forbannelse!', effect: hellflame },
  'lightning+shadow': { name: 'Dark Voltage', desc: 'Mørkt lyn river gjennom dimensjonen!', effect: darkVoltage },
  'fire+lightning+shadow': { name: 'Bankai: Apocalypse', desc: 'Alle krefter slippes løs i et kaos!', effect: bankaiApocalypse }
};

// Lager nøkkel for valgt kombinasjon (sortert)
function getComboKey(selected) {
  return selected.sort().join('+');
}

// Oppdaterer listen over oppdagede kombinasjoner
function updateFoundCombos(found) {
  const ul = document.getElementById('found_combos');
  ul.innerHTML = found.map(key => {
    const combo = COMBOS[key];
    if (combo) return `<li><b>${combo.name}</b>: ${combo.desc}</li>`;
    return '';
  }).join('');
}

// Håndterer trykk på "Kombiner!"-knappen
document.getElementById('cast_combo_btn').onclick = function() {
  const checked = Array.from(document.querySelectorAll('input[name="spell"]:checked')).map(cb => cb.value);
  if (checked.length < 1) {
    document.getElementById('spell_msg').textContent = "Velg minst én magi!";
    return;
  }
  if (checked.length > 3) {
    document.getElementById('spell_msg').textContent = "Du kan maks kombinere tre magier!";
    return;
  }
  castSpellCombo(checked);
};

// Utfører valgt spell-kombinasjon og viser animasjon
function castSpellCombo(types) {
  const anim = document.getElementById('spell_anim');
  const msg = document.getElementById('spell_msg');
  let comboKey = getComboKey(types);
  let combo = COMBOS[comboKey];
  let found = JSON.parse(localStorage.getItem('found_combos') || '[]');
  if (combo) {
    msg.innerHTML = `Kombinasjon: <b>${combo.name}</b><br>${combo.desc}`;
    anim.innerHTML = ""; // Fjerner forrige animasjon
    combo.effect(anim); // Kaller effekt-funksjonen, sender anim-container
    if (!found.includes(comboKey)) {
      found.push(comboKey);
      localStorage.setItem('found_combos', JSON.stringify(found));
      updateFoundCombos(found);
    }
  } else {
    msg.innerHTML = "Denne kombinasjonen har ingen effekt!";
    anim.innerHTML = "";
  }
}

// Varighet for animasjoner (frames)
const DURATION = 180; // 3 sekunder

// Effekt: ild-slash med glød og gnister
function fireEffect(container) {
  const canvas = document.createElement('canvas');
  canvas.width = 220; canvas.height = 220;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let t = 0, embers = [];
  function draw() {
    ctx.clearRect(0,0,220,220);
    // Ild-slash (roterer og blinker)
    ctx.save();
    ctx.translate(110,110);
    ctx.rotate(Math.sin(t/12)*0.2 + Math.sin(t/6)*0.1);
    ctx.beginPath();
    ctx.moveTo(-80,0);
    ctx.quadraticCurveTo(0,-80,80,0);
    ctx.quadraticCurveTo(0,80,-80,0);
    ctx.closePath();
    ctx.globalAlpha = 0.8 + 0.2*Math.sin(t/8);
    ctx.fillStyle = `rgba(255,${80+Math.sin(t/8)*120},${Math.floor(80+Math.sin(t/6)*80)},0.9)`;
    ctx.shadowColor = "#ff0055";
    ctx.shadowBlur = 60 + Math.sin(t/8)*20;
    ctx.fill();
    ctx.restore();
    // Shockwave (animerer radius)
    ctx.save();
    ctx.globalAlpha = 0.2+0.2*Math.sin(t/8);
    ctx.beginPath();
    ctx.arc(110,110,80+Math.sin(t/10)*20+t*0.3,0,Math.PI*2);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 14;
    ctx.shadowColor = "#ff0055";
    ctx.shadowBlur = 40;
    ctx.stroke();
    ctx.restore();
    // Gnister (animerer bevegelse)
    if (t % 2 === 0) {
      for(let i=0;i<16;i++) {
        embers.push({
          x: 110, y: 110,
          vx: Math.cos(Math.random()*Math.PI*2)*6,
          vy: Math.sin(Math.random()*Math.PI*2)*6,
          life: 40+Math.random()*30,
          color: "#fff700"
        });
      }
    }
    for(let i=embers.length-1;i>=0;i--) {
      let p = embers[i];
      ctx.save();
      ctx.globalAlpha = p.life/60;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2+Math.random()*3, 0, Math.PI*2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = "#ff0055";
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.restore();
      p.x += p.vx + Math.sin(t/10)*2;
      p.y += p.vy + Math.cos(t/10)*2;
      p.life--;
      if (p.life < 0) embers.splice(i,1);
    }
    t++;
    if (t < DURATION) requestAnimationFrame(draw);
    else container.innerHTML = "";
  }
  draw();
}

// Effekt: lyn med elektriske buer og pulserende kjerne
function lightningEffect(container) {
  const canvas = document.createElement('canvas');
  canvas.width = 220; canvas.height = 220;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let t = 0;
  function draw() {
    ctx.clearRect(0,0,220,220);
    // Elektriske buer (animerer bevegelse)
    for(let i=0;i<18;i++) {
      let x = 110 + Math.sin(t/6+i)*90 + Math.sin(t/10)*10;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, 40);
      for(let j=0;j<10;j++) {
        let dx = Math.sin(t/4+i+j)*16 + Math.cos(t/8+j)*6;
        let dy = 10+j*14;
        ctx.lineTo(x+dx, 40+dy);
      }
      ctx.strokeStyle = `hsl(${50+t*2+i*36},100%,60%)`;
      ctx.lineWidth = 5+Math.sin(t/8+i)*3;
      ctx.shadowColor = "#00ff99";
      ctx.shadowBlur = 24 + Math.sin(t/8)*10;
      ctx.stroke();
      ctx.restore();
    }
    // Elektrisk kjerne (pulserer)
    ctx.save();
    ctx.globalAlpha = 0.8 + 0.1*Math.sin(t/8);
    ctx.beginPath();
    ctx.arc(110,110,50+Math.sin(t/10)*30,0,Math.PI*2);
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#00ff99";
    ctx.shadowBlur = 60 + Math.sin(t/8)*20;
    ctx.fill();
    ctx.restore();
    // Skjermblink (animerer)
    if (t % 24 === 0 && t < DURATION-20) {
      ctx.save();
      ctx.globalAlpha = 0.25 + 0.1*Math.sin(t/8);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0,0,220,220);
      ctx.restore();
    }
    t++;
    if (t < DURATION) requestAnimationFrame(draw);
    else container.innerHTML = "";
  }
  draw();
}

// Effekt: skygge-energi med pulserende kule og virvlende tåke
function shadowEffect(container) {
  const canvas = document.createElement('canvas');
  canvas.width = 220; canvas.height = 220;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let t = 0;
  function draw() {
    ctx.clearRect(0,0,220,220);
    // Pulsende skyggekule
    ctx.save();
    ctx.globalAlpha = 0.85 + 0.15*Math.sin(t/12);
    ctx.beginPath();
    ctx.arc(110,110,90+Math.sin(t/8)*18,0,Math.PI*2);
    ctx.fillStyle = "#222";
    ctx.shadowColor = "#00ff99";
    ctx.shadowBlur = 70+Math.sin(t/8)*30;
    ctx.fill();
    ctx.restore();
    // Virvlende tåke
    for(let i=0;i<32;i++) {
      let angle = (i/32)*Math.PI*2 + t/16;
      let r = 70 + Math.sin(t/8+i)*32;
      let x = 110 + Math.cos(angle)*r;
      let y = 110 + Math.sin(angle)*r;
      ctx.save();
      ctx.globalAlpha = 0.5+0.5*Math.sin(t/8+i);
      ctx.beginPath();
      ctx.arc(x, y, 18+Math.sin(t/8+i)*10, 0, Math.PI*2);
      ctx.fillStyle = "#444";
      ctx.shadowColor = "#00ff99";
      ctx.shadowBlur = 32;
      ctx.fill();
      ctx.restore();
    }
    // Aura-puls
    ctx.save();
    ctx.globalAlpha = 0.25+0.25*Math.sin(t/8);
    ctx.beginPath();
    ctx.arc(110,110,110+Math.sin(t/6)*22,0,Math.PI*2);
    ctx.strokeStyle = "#00ff99";
    ctx.lineWidth = 18;
    ctx.shadowColor = "#00ff99";
    ctx.shadowBlur = 40;
    ctx.stroke();
    ctx.restore();
    t++;
    if (t < DURATION) requestAnimationFrame(draw);
    else container.innerHTML = "";
  }
  draw();
}

// Effekt: plasma-drage med glødende øyne, gnister og lynpust
function plasmaDragon(container) {
  const canvas = document.createElement('canvas');
  canvas.width = 220; canvas.height = 220;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let t = 0, sparks = [];
  function draw() {
    ctx.clearRect(0,0,220,220);
    // Dragehode
    ctx.save();
    ctx.translate(110,110);
    ctx.rotate(Math.sin(t/20)*0.1);
    ctx.beginPath();
    ctx.moveTo(-80,0);
    ctx.bezierCurveTo(-60,-80,60,-80,80,0);
    ctx.bezierCurveTo(60,80,-60,80,-80,0);
    ctx.closePath();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(255,255,0,0.85)";
    ctx.shadowColor = "#ff8000";
    ctx.shadowBlur = 70;
    ctx.fill();
    ctx.restore();
    // Øyne
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(80,100,14+Math.sin(t/8)*4,0,Math.PI*2);
    ctx.arc(140,100,14+Math.cos(t/8)*4,0,Math.PI*2);
    ctx.fillStyle = "#ff0055";
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.restore();
    // Lynpust
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(110,110);
    for(let i=0;i<8;i++) {
      let x = 110 + Math.cos(Math.PI/4*i+t/8)*90;
      let y = 110 + Math.sin(Math.PI/4*i+t/8)*90;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#fff700";
    ctx.lineWidth = 8;
    ctx.shadowColor = "#fff700";
    ctx.shadowBlur = 30;
    ctx.stroke();
    ctx.restore();
    // Gnister
    if (t % 2 === 0) {
      for(let i=0;i<28;i++) {
        sparks.push({
          x: 110, y: 110,
          vx: Math.cos(Math.random()*Math.PI*2)*8,
          vy: Math.sin(Math.random()*Math.PI*2)*8,
          life: 30+Math.random()*30,
          color: "#fff700"
        });
      }
    }
    for(let i=sparks.length-1;i>=0;i--) {
      let p = sparks[i];
      ctx.save();
      ctx.globalAlpha = p.life/40;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2+Math.random()*3, 0, Math.PI*2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = "#ff8000";
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.restore();
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life < 0) sparks.splice(i,1);
    }
    // Lyn-aura
    ctx.save();
    ctx.globalAlpha = 0.5+0.2*Math.sin(t/8);
    ctx.beginPath();
    ctx.arc(110,110,120+Math.sin(t/6)*30,0,Math.PI*2);
    ctx.strokeStyle = "#fff700";
    ctx.lineWidth = 16;
    ctx.shadowColor = "#fff700";
    ctx.shadowBlur = 50;
    ctx.stroke();
    ctx.restore();
    t++;
    if (t < DURATION) requestAnimationFrame(draw);
    else container.innerHTML = "";
  }
  draw();
}

// Effekt: Hellflame (ild + skygge) med Hollow-mask og aura
function hellflame(container) {
  const canvas = document.createElement('canvas');
  canvas.width = 240; canvas.height = 240;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let t = 0;
  function draw() {
    ctx.clearRect(0,0,240,240);

    // Virvlende ild-aura
    for(let i=0;i<24;i++) {
      ctx.save();
      ctx.globalAlpha = 0.18 + 0.14*Math.sin(t/8+i);
      ctx.beginPath();
      ctx.arc(120,120,90+i*3+Math.sin(t/8+i)*12,0,Math.PI*2);
      ctx.strokeStyle = `hsl(${20+i*18+t*3},100%,55%)`;
      ctx.lineWidth = 10-i*0.3;
      ctx.shadowColor = "#ff3300";
      ctx.shadowBlur = 32;
      ctx.stroke();
      ctx.restore();
    }

    // Hollow-mask base (hvit ansikt)
    ctx.save();
    ctx.translate(120,120);
    ctx.rotate(Math.sin(t/40)*0.05);
    ctx.beginPath();
    ctx.ellipse(0, 0, 62, 84, 0, 0, Math.PI*2);
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#ff3300";
    ctx.shadowBlur = 22;
    ctx.globalAlpha = 0.98;
    ctx.fill();
    ctx.restore();

    // Kjeve-striper (røde, skarpe)
    for(let i=0;i<6;i++) {
      ctx.save();
      ctx.translate(120,120);
      ctx.rotate(Math.sin(t/40)*0.05);
      ctx.beginPath();
      ctx.moveTo(-32+i*13, 44);
      ctx.lineTo(-44+i*18, 80);
      ctx.lineWidth = 7;
      ctx.strokeStyle = "#ff3300";
      ctx.globalAlpha = 0.8 + 0.15*Math.sin(t/12+i);
      ctx.shadowColor = "#ff3300";
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.restore();
    }

    // Panne-striper (vertikale, animerte)
    for(let i=0;i<3;i++) {
      ctx.save();
      ctx.translate(120,120);
      ctx.rotate(Math.sin(t/40)*0.05);
      ctx.beginPath();
      ctx.moveTo(-18+i*18, -60);
      ctx.lineTo(-18+i*18, -20+Math.sin(t/12+i)*6);
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#ff3300";
      ctx.globalAlpha = 0.7 + 0.2*Math.sin(t/10+i);
      ctx.shadowColor = "#ff3300";
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();
    }

    // Øyehull (svarte, dype)
    ctx.save();
    ctx.translate(120,120);
    ctx.rotate(Math.sin(t/40)*0.05);
    ctx.beginPath();
    ctx.ellipse(-24, -22, 16+Math.sin(t/8)*2, 12, 0.18, 0, Math.PI*2);
    ctx.ellipse(24, -22, 16+Math.cos(t/8)*2, 12, -0.18, 0, Math.PI*2);
    ctx.fillStyle = "#222";
    ctx.globalAlpha = 0.93;
    ctx.shadowColor = "#ff3300";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();

    // Glødende øyne (rød/oransje, intense)
    ctx.save();
    ctx.translate(120,120);
    ctx.rotate(Math.sin(t/40)*0.05);
    ctx.beginPath();
    ctx.arc(-24, -22, 8+Math.sin(t/6)*3, 0, Math.PI*2);
    ctx.arc(24, -22, 8+Math.cos(t/6)*3, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,${60+Math.sin(t/8)*180},0,0.95)`;
    ctx.shadowColor = "#ff3300";
    ctx.shadowBlur = 24+Math.sin(t/8)*10;
    ctx.globalAlpha = 0.9 + 0.1*Math.sin(t/10);
    ctx.fill();
    ctx.restore();

    // Munn (sort strek, animert)
    ctx.save();
    ctx.translate(120,120);
    ctx.rotate(Math.sin(t/40)*0.05);
    ctx.beginPath();
    ctx.moveTo(-20, 44);
    ctx.quadraticCurveTo(0, 60+Math.sin(t/12)*10, 20, 44);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#222";
    ctx.globalAlpha = 0.8;
    ctx.shadowColor = "#ff3300";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();

    // Flammende kanter
    for(let i=0;i<28;i++) {
      let angle = (i/28)*Math.PI*2 + t/12;
      let r = 84 + Math.sin(t/8+i)*16;
      let x = 120 + Math.cos(angle)*r;
      let y = 120 + Math.sin(angle)*r;
      ctx.save();
      ctx.globalAlpha = 0.5+0.5*Math.sin(t/8+i);
      ctx.beginPath();
      ctx.arc(x, y, 12+Math.sin(t/8+i)*8, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,${80+Math.sin(t/8+i)*120},0,1)`;
      ctx.shadowColor = "#ff3300";
      ctx.shadowBlur = 22;
      ctx.fill();
      ctx.restore();
    }

    t++;
    if (t < DURATION) requestAnimationFrame(draw);
    else container.innerHTML = "";
  }
  draw();
}

// Effekt: Dark Voltage (lyn + skygge) med svart lyn og lilla blink
function darkVoltage(container) {
  const canvas = document.createElement('canvas');
  canvas.width = 220; canvas.height = 220;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let t = 0;
  function draw() {
    ctx.clearRect(0,0,220,220);
    // Svart lyn
    for(let i=0;i<18;i++) {
      let x = 110 + Math.sin(t/6+i)*90;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, 40);
      for(let j=0;j<10;j++) {
        let dx = Math.sin(t/4+i+j)*16;
        let dy = 10+j*14;
        ctx.lineTo(x+dx, 40+dy);
      }
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 5+Math.sin(t/8+i)*3;
      ctx.shadowColor = "#ff00cc";
      ctx.shadowBlur = 24;
      ctx.stroke();
      ctx.restore();
    }
    // Skyggekjerne
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(110,110,50+Math.sin(t/10)*30,0,Math.PI*2);
    ctx.fillStyle = "#222";
    ctx.shadowColor = "#ff00cc";
    ctx.shadowBlur = 60;
    ctx.fill();
    ctx.restore();
    // Lilla blink
    if (t % 24 === 0 && t < DURATION-20) {
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = "#ff00cc";
      ctx.fillRect(0,0,220,220);
      ctx.restore();
    }
    t++;
    if (t < DURATION) requestAnimationFrame(draw);
    else container.innerHTML = "";
  }
  draw();
}

// Effekt: Bankai Apocalypse (trippel) med kaotisk anime-apokalypse
function bankaiApocalypse(container) {
  const canvas = document.createElement('canvas');
  canvas.width = 220; canvas.height = 220;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let t = 0, slashes = [];
  function draw() {
    ctx.clearRect(0,0,220,220);
    // Kaotiske fargeringer
    for(let i=0;i<40;i++) {
      ctx.save();
      ctx.globalAlpha = 0.7-i*0.015;
      ctx.beginPath();
      ctx.arc(110,110,50+i*4+Math.sin(t/8+i)*16,0,Math.PI*2);
      ctx.strokeStyle = `hsl(${i*12+t*6},100%,50%)`;
      ctx.lineWidth = 5-i*0.09;
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 24;
      ctx.stroke();
      ctx.restore();
    }
    // Lyn, ild og skygge-pulser
    for(let i=0;i<18;i++) {
      let angle = (i/18)*Math.PI*2 + t/8;
      let r = 120 + Math.sin(t/8+i)*40;
      let x = 110 + Math.cos(angle)*r;
      let y = 110 + Math.sin(angle)*r;
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(x, y, 18+Math.sin(t/8+i)*10, 0, Math.PI*2);
      ctx.fillStyle = i%3===0 ? "#ff0055" : (i%3===1 ? "#fff700" : "#222");
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 24;
      ctx.fill();
      ctx.restore();
    }
    // Slashes
    if (t % 4 === 0) {
      for(let i=0;i<4;i++) {
        slashes.push({
          x: 110, y: 110,
          angle: Math.random()*Math.PI*2,
          life: 30+Math.random()*20,
          color: ["#ff0055","#fff700","#222","#00ff99"][i%4]
        });
      }
    }
    for(let i=slashes.length-1;i>=0;i--) {
      let s = slashes[i];
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.globalAlpha = s.life/50;
      ctx.beginPath();
      ctx.moveTo(-90,0);
      ctx.quadraticCurveTo(0,-70,90,0);
      ctx.quadraticCurveTo(0,70,-90,0);
      ctx.closePath();
      ctx.fillStyle = s.color;
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 40;
      ctx.fill();
      ctx.restore();
      s.life--;
      if (s.life < 0) slashes.splice(i,1);
    }
    // Sentral puls
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(110,110,80+Math.sin(t/10)*40,0,Math.PI*2);
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#ff0055";
    ctx.shadowBlur = 60;
    ctx.fill();
    ctx.restore();
    t++;
    if (t < DURATION) requestAnimationFrame(draw);
    else container.innerHTML = "";
  }
  draw();
}

// Ved lasting av siden: vis oppdagede kombinasjoner
updateFoundCombos(JSON.parse(localStorage.getItem('found_combos') || '[]'));