/* Pawpartout 3D Pet-Interior Studio V1.5 — discreet test, 2026-11-27 */
import * as THREE from './vendor/three.module.min.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const SPACES = {
  living:  { name: 'Living Room', ceiling: 2.8, sizes: { S:{w:4.2,d:3.6}, M:{w:5.6,d:4.6}, L:{w:7.2,d:5.6} } },
  studio:  { name: 'Studio', ceiling: 2.7, sizes: { S:{w:4.0,d:3.4}, M:{w:5.0,d:4.2}, L:{w:6.2,d:5.0} } },
  bedroom: { name: 'Bedroom', ceiling: 2.7, sizes: { S:{w:3.6,d:3.2}, M:{w:4.6,d:4.0}, L:{w:5.8,d:4.8} } },
  garden:  { name: 'Garden / Terrace', enclosure: 1.9, sizes: { S:{w:5.0,d:4.0}, M:{w:7.0,d:5.5}, L:{w:9.5,d:7.0} } },
};

const NOTES = {
  interior: {
    catwall: 'Walnut and brass floating shelves, a sisal-wrapped post, and a suspended oak bridge — magnetized to the wall.',
    cattree: 'A leafless sculptural oak tree: a curved solid-oak trunk, forked branches, and round oak pods lined in cream wool felt.',
    alcove: 'A fluted console with an arched dog niche lined in heavy cotton-wool velvet and brushed-brass trim.',
    dining: 'A flush marble-and-wood plinth with twin ceramic bowls in brass rings.',
    litter: 'A warm solid-teak cabinet with a tempered-glass lid, a white glazed ceramic basin, and a teak-framed cat portal with brass hinge pins.',
    sofa: 'A sculptural sofa in heavy cotton-wool velvet, set on a wool flat-weave rug.',
    panelling: 'Protective lower wood wainscoting with a textured linen-and-hemp wallcovering above.',
  },
  garden: {
    catwall: 'A covered cedar catio perch with climbing steps against the fence.',
    cattree: 'A leafless sculptural oak tree for the terrace: curved solid-oak limbs and wool-felt oak pods.',
    alcove: 'A covered timber and stone pavilion for a dog to rest in shade.',
    dining: 'A carved limestone outdoor hydration station with twin bowls.',
    litter: 'A solid-teak cabinet with a tempered-glass lid and a white glazed ceramic basin, set on the terrace.',
    sofa: 'An outdoor timber daybed and a woven hemp terrace rug.',
    panelling: 'A pet-safe cedar slatted privacy screen and a honed stone border.',
  },
};

const EL_NAMES = {
  catwall: 'Architectural Cat Wall',
  cattree: 'Sculptural Oak Cat Tree',
  alcove: 'Built-In Dog Alcove Console',
  dining: 'Recessed Dining & Water Station',
  litter: 'Teak & Glass Litter Cabinet',
  sofa: 'Cotton-Wool Velvet Sofa & Wool Flat-Weave Rug',
  panelling: 'Wood Wainscoting & Linen-Hemp Wallcovering',
};
const GARDEN_NAMES = {
  catwall: 'Covered Cedar Catio & Climbing Steps',
  cattree: 'Sculptural Oak Cat Tree',
  alcove: 'Timber & Stone Dog Pavilion',
  dining: 'Limestone Outdoor Hydration Station',
  litter: 'Teak & Glass Litter Cabinet',
  sofa: 'Outdoor Timber Daybed & Terrace Rug',
  panelling: 'Cedar Privacy Screen & Stone Border',
};
const MAGNET = {
  catwall: 'wall',
  cattree: 'floor',
  alcove: 'floor',
  dining: 'floor',
  litter: 'floor',
  sofa: 'floor',
};
const LAYER_ORDER = ['cattree','litter','catwall','alcove','dining','sofa','panelling'];


const THEME = {
  neobaroque: {
    id: 'neobaroque', name: 'Modern Neo-Baroque',
    floor: 'walnut', wall: [58,68,102], plaster: [64,74,108],
    dado: 'walnut', trim: 'brass', metal: 'brass',
    velvet: [36,40,82], linen: [40,44,86],
    stone: 'darkMarble', rugA: [78,28,38], rugB: [32,34,64],
    grass: null, paver: 'darkMarble', cedar: 'walnut',
    cushion: [228,208,160], pillowIvory: [244,234,214], ceramic: [236,228,214],
  },
  organic: {
    id: 'organic', name: 'Organic Modern',
    floor: 'whiteOak', wall: [234,226,210], plaster: [240,234,218],
    dado: 'whiteOak', trim: 'brass', metal: 'brass', satin: true,
    velvet: [216,200,176], linen: [216,200,176],
    stone: 'travertine', rugA: [196,178,150], rugB: [232,222,204],
    paver: 'travertine', cedar: 'cedar',
    cushion: [228,208,160], pillowIvory: [244,234,214], ceramic: [244,238,226],
  },
  transitional: {
    id: 'transitional', name: 'American Transitional',
    floor: 'oak', wall: [242,230,210], plaster: [248,238,222],
    dado: 'oak', trim: 'bronze', metal: 'bronze',
    velvet: [168,132,104], linen: [232,218,196],
    stone: 'travertine', rugA: [140,92,64], rugB: [220,204,180],
    paver: 'travertine', cedar: 'cedar',
    cushion: [228,208,160], pillowIvory: [244,234,214], ceramic: [244,236,220],
  },
};

const state = {
  space: 'living', size: 'M', units: 'm', theme: 'neobaroque', view: 'perspective',
  elements: {
    catwall:    { on:true, place:'left',  variant:'grand', visible:true, locked:false, pose:null },
    cattree:    { on:true, place:'center',variant:'grand', visible:true, locked:false, pose:null },
    alcove:     { on:true, place:'back',  variant:'grand', visible:true, locked:false, pose:null },
    dining:     { on:true, place:'left',  variant:'compact', visible:true, locked:false, pose:null },
    litter:     { on:true, place:'back',  variant:'grand', visible:true, locked:false, pose:null },
    sofa:       { on:true, place:'center',variant:'grand', visible:true, locked:false, pose:null },
    panelling:  { on:true, place:'walls', variant:'classic', visible:true, locked:true },
  },
  selected: null,
};

const M2FT = 3.280839895;
const M2SQFT = 10.7639104167;
const L2GAL = 0.264172052;

let renderer, scene, persp, ortho, camera, controls, world, lights = {};
let mats = {};
let furnRoot = null;
let selRing = null;
let selectedObj = null;
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let dragging = null;
const texCache = new Map();
const stage = () => document.getElementById('studio-stage');

function dim() {
  const sp = SPACES[state.space];
  const sz = sp.sizes[state.size];
  return {
    w: sz.w, d: sz.d,
    h: sp.ceiling || sp.enclosure,
    ceiling: sp.ceiling || 0,
    enclosure: sp.enclosure || 0,
    isGarden: state.space === 'garden',
    name: sp.name,
  };
}
function fmtLen(m, digits=2) {
  if (state.units === 'ft') {
    const ft = m * M2FT;
    const whole = Math.floor(ft + 1e-9);
    const inch = Math.round((ft - whole) * 12);
    const i = inch === 12 ? 0 : inch;
    const w = inch === 12 ? whole + 1 : whole;
    return `${w}′${i}″`;
  }
  return `${m.toFixed(digits)} m`;
}
function fmtArea(m2, digits=1) {
  return state.units === 'ft' ? `${(m2*M2SQFT).toFixed(digits)} sq ft` : `${m2.toFixed(digits)} m²`;
}

/* ---------- procedural textures ---------- */
function hash(ix, iy) {
  const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}
function noise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return (
    (hash(ix, iy) * (1 - ux) + hash(ix + 1, iy) * ux) * (1 - uy) +
    (hash(ix, iy + 1) * (1 - ux) + hash(ix + 1, iy + 1) * ux) * uy
  );
}
function fbm(x, y, oct=5) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += a * noise(x * f, y * f); f *= 2; a *= 0.5; }
  return v;
}
function mix(a, b, t) { return a + (b - a) * t; }
function rgb(r,g,b){ return `rgb(${r|0},${g|0},${b|0})`; }

function makeCanvas(size, paint) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  paint(ctx, size);
  return c;
}
function toTex(canvas, { color = true, rx = 1, ry = 1 } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}
function cached(key, fn) {
  if (!texCache.has(key)) texCache.set(key, fn());
  return texCache.get(key);
}

function paintWood(ctx, size, pal, herringbone) {
  const [br,bg,bb] = pal.base, [dr,dg,db] = pal.dark, [hr,hg,hb] = pal.hi;
  ctx.fillStyle = rgb(br,bg,bb);
  ctx.fillRect(0,0,size,size);
  if (herringbone) {
    const n = 10, s = size / n;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const flip = (i + j) % 2 === 0;
        const v = 0.82 + hash(i, j) * 0.28;
        ctx.save();
        ctx.beginPath();
        ctx.rect(i*s - 1, j*s - 1, s + 2, s + 2);
        ctx.clip();
        ctx.translate(i*s + s/2, j*s + s/2);
        ctx.rotate(flip ? Math.PI/4 : -Math.PI/4);
        const img = ctx.createLinearGradient(-s, 0, s, 0);
        img.addColorStop(0, rgb(dr*v, dg*v, db*v));
        img.addColorStop(0.45, rgb(mix(br,hr,v-0.82)*v, mix(bg,hg,v-0.82)*v, mix(bb,hb,v-0.82)*v));
        img.addColorStop(1, rgb(dr*v*0.9, dg*v*0.9, db*v*0.9));
        ctx.fillStyle = img;
        ctx.fillRect(-s, -s*0.28, s*2, s*0.56);
        ctx.strokeStyle = 'rgba(20,12,6,0.35)';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-s, -s*0.28, s*2, s*0.56);
        ctx.strokeStyle = 'rgba(80,50,20,0.18)';
        for (let g = -s; g < s; g += 3) {
          ctx.globalAlpha = 0.15 + noise(g*0.08, i+j) * 0.25;
          ctx.beginPath();
          ctx.moveTo(g, -s*0.28);
          ctx.bezierCurveTo(g+2, 0, g-2, 0, g+1, s*0.28);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  } else {
    const boards = 8, bw = size / boards;
    for (let i = 0; i < boards; i++) {
      const v = 0.88 + hash(i, 3) * 0.22;
      ctx.fillStyle = rgb(br*v, bg*v, bb*v);
      ctx.fillRect(i*bw, 0, bw-1.5, size);
      ctx.strokeStyle = 'rgba(20,12,6,0.28)';
      ctx.beginPath(); ctx.moveTo((i+1)*bw-1,0); ctx.lineTo((i+1)*bw-1,size); ctx.stroke();
      ctx.strokeStyle = 'rgba(90,55,22,0.2)';
      for (let y = 0; y < size; y += 2) {
        ctx.globalAlpha = 0.12 + noise(i, y*0.05) * 0.3;
        ctx.beginPath();
        const x = i*bw + 2 + noise(i*2, y*0.02)* (bw-4);
        ctx.moveTo(x, y);
        ctx.lineTo(x + (noise(i,y)-0.5)*2, y+2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }
}
function woodMaps(kind, herringbone, rx, ry) {
  const palettes = {
    walnut: { base:[92,58,32], dark:[52,30,16], hi:[140,96,58] },
    oak:    { base:[166,118,64], dark:[120,78,40], hi:[210,168,110] },
    whiteOak:{ base:[198,170,126], dark:[148,118,80], hi:[232,210,172] },
    cedar:  { base:[150,92,52], dark:[98,54,28], hi:[196,132,78] },
    teak:   { base:[158,98,40], dark:[98,54,16], hi:[204,142,70] },
    mineralWood: { base:[168,160,148], dark:[110,104,96], hi:[210,204,194] },
  };
  const pal = palettes[kind] || palettes.walnut;
  const key = `wood:${kind}:${herringbone}:${rx}:${ry}`;
  return cached(key, () => {
    const map = toTex(makeCanvas(1024, (ctx,s)=>paintWood(ctx,s,pal,herringbone)), {rx, ry});
    const bump = toTex(makeCanvas(512, (ctx,s)=>{
      ctx.fillStyle='#888'; ctx.fillRect(0,0,s,s);
      paintWood(ctx,s,{base:[140,140,140],dark:[90,90,90],hi:[200,200,200]},herringbone);
    }), {color:false, rx, ry});
    const rough = toTex(makeCanvas(512, (ctx,s)=>{
      ctx.fillStyle='#c8c8c8'; ctx.fillRect(0,0,s,s);
      for (let i=0;i<s;i+=2) for (let j=0;j<s;j+=2) {
        const n = fbm(i*0.04,j*0.08,3);
        const v = 150 + n*80;
        ctx.fillStyle = `rgb(${v|0},${v|0},${v|0})`;
        ctx.fillRect(i,j,2,2);
      }
    }), {color:false, rx, ry});
    return { map, bump, rough };
  });
}

function stoneMaps(kind, rx, ry) {
  const specs = {
    darkMarble: { base:[28,28,32], vein:[210,210,214], vein2:[160,150,130], pit:false },
    travertine: { base:[214,200,176], vein:[190,176,152], vein2:[232,220,198], pit:true },
    limestone:  { base:[212,208,198], vein:[186,182,172], vein2:[232,228,220], pit:true },
  };
  const pal = specs[kind] || specs.darkMarble;
  const key = `stone:${kind}:${rx}:${ry}`;
  return cached(key, () => {
    const map = toTex(makeCanvas(1024, (ctx,s)=>{
      const [r,g,b] = pal.base;
      ctx.fillStyle = rgb(r,g,b); ctx.fillRect(0,0,s,s);
      for (let y=0;y<s;y++) {
        for (let x=0;x<s;x+=2) {
          const n = fbm(x*0.006, y*0.006, 4);
          const v = (n-0.5)*18;
          ctx.fillStyle = rgb(r+v,g+v,b+v);
          ctx.fillRect(x,y,2,1);
        }
      }
      const veins = 14;
      for (let i=0;i<veins;i++) {
        const col = i%2 ? pal.vein : pal.vein2;
        ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${kind==='darkMarble'?0.55:0.28})`;
        ctx.lineWidth = kind==='darkMarble' ? 1+hash(i,1)*2.5 : 2+hash(i,2)*4;
        ctx.beginPath();
        let x = hash(i,4)*s, y = hash(i,5)*s;
        ctx.moveTo(x,y);
        for (let k=0;k<18;k++) {
          x += (fbm(i,k*0.3)-0.5)*80;
          y += 20 + (fbm(k,i)-0.45)*30;
          ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      if (pal.pit) {
        for (let i=0;i<400;i++) {
          const x=hash(i,8)*s, y=hash(i,9)*s, rad=0.6+hash(i,10)*2.2;
          ctx.fillStyle=`rgba(90,80,60,${0.12+hash(i,11)*0.25})`;
          ctx.beginPath(); ctx.ellipse(x,y,rad*1.6,rad,0,0,6.28); ctx.fill();
        }
      }
    }), {rx,ry});
    const bump = toTex(makeCanvas(512,(ctx,s)=>{
      ctx.fillStyle='#9a9a9a'; ctx.fillRect(0,0,s,s);
      for (let i=0;i<s;i+=2) for (let j=0;j<s;j+=2) {
        const n=fbm(i*0.03,j*0.03,4); const v=130+n*80;
        ctx.fillStyle=`rgb(${v|0},${v|0},${v|0})`; ctx.fillRect(i,j,2,2);
      }
    }), {color:false,rx,ry});
    const rough = toTex(makeCanvas(256,(ctx,s)=>{
      ctx.fillStyle = kind==='darkMarble' ? '#4a4a4a' : '#c0c0c0';
      ctx.fillRect(0,0,s,s);
      for (let i=0;i<s;i+=2) for (let j=0;j<s;j+=2) {
        const n=fbm(i*0.08,j*0.08,2); const v=(kind==='darkMarble'?70:170)+n*60;
        ctx.fillStyle=`rgb(${v|0},${v|0},${v|0})`; ctx.fillRect(i,j,2,2);
      }
    }), {color:false,rx,ry});
    return {map, bump, rough};
  });
}

function metalMaps(kind) {
  const key = `metal:${kind}`;
  return cached(key, () => {
    const map = toTex(makeCanvas(512,(ctx,s)=>{
      const grad = ctx.createLinearGradient(0,0,s,s*0.2);
      if (kind==='black') {
        grad.addColorStop(0,'#2a2a2c'); grad.addColorStop(0.5,'#5a5a5e'); grad.addColorStop(1,'#1a1a1c');
      } else if (kind==='bronze') {
        grad.addColorStop(0,'#3a2414'); grad.addColorStop(0.35,'#c4a06a'); grad.addColorStop(0.62,'#8a5a32'); grad.addColorStop(1,'#4a3018');
      } else {
        grad.addColorStop(0,'#8a6a32'); grad.addColorStop(0.35,'#e8d09a'); grad.addColorStop(0.6,'#C9A96E'); grad.addColorStop(1,'#6a4e22');
      }
      ctx.fillStyle=grad; ctx.fillRect(0,0,s,s);
      for (let y=0;y<s;y++) {
        ctx.globalAlpha = 0.08 + noise(0,y*0.4)*0.18;
        ctx.fillStyle = kind==='black' ? '#ddd' : '#fff6d8';
        ctx.fillRect(0,y,s,1);
      }
      ctx.globalAlpha=1;
    }), {rx:2, ry:1});
    const rough = toTex(makeCanvas(256,(ctx,s)=>{
      ctx.fillStyle='#4a4a4a'; ctx.fillRect(0,0,s,s);
      for (let y=0;y<s;y++) {
        const v = 60 + noise(1,y*0.3)*50;
        ctx.fillStyle=`rgb(${v|0},${v|0},${v|0})`;
        ctx.fillRect(0,y,s,1);
      }
    }), {color:false, rx:2, ry:1});
    return {map, rough};
  });
}

function fabricMaps(rgbCol, kind, rx, ry) {
  const key = `fab:${kind}:${rgbCol.join(',')}:${rx}:${ry}`;
  return cached(key, () => {
    const map = toTex(makeCanvas(512,(ctx,s)=>{
      const [r,g,b]=rgbCol;
      ctx.fillStyle=rgb(r,g,b); ctx.fillRect(0,0,s,s);
      if (kind==='velvet') {
        for (let x=0;x<s;x++) {
          const n=fbm(x*0.08, 2, 3);
          ctx.fillStyle=`rgba(0,0,0,${0.04+n*0.1})`;
          ctx.fillRect(x,0,1,s);
        }
        for (let i=0;i<1200;i++) {
          ctx.fillStyle=`rgba(255,255,255,${0.02+hash(i,1)*0.04})`;
          ctx.fillRect(hash(i,2)*s, hash(i,3)*s, 1, 2+hash(i,4)*3);
        }
      } else if (kind==='rug') {
        const step=4;
        for (let y=0;y<s;y+=step) for (let x=0;x<s;x+=step) {
          const on=(x/step+y/step)%2===0;
          const v=on?0.88:1.08;
          ctx.fillStyle=rgb(r*v,g*v,b*v);
          ctx.fillRect(x,y,step-0.5,step-0.5);
        }
      } else {
        // linen / grasscloth
        for (let y=0;y<s;y+=2) {
          ctx.fillStyle=`rgba(0,0,0,${0.03+noise(y,1)*0.06})`;
          ctx.fillRect(0,y,s,1);
        }
        for (let x=0;x<s;x+=3) {
          ctx.fillStyle=`rgba(255,255,255,${0.03+noise(x,2)*0.05})`;
          ctx.fillRect(x,0,1,s);
        }
      }
    }), {rx,ry});
    const bump = toTex(makeCanvas(256,(ctx,s)=>{
      ctx.fillStyle='#999'; ctx.fillRect(0,0,s,s);
      for (let i=0;i<s;i++) {
        const v=120+noise(i,4)*80;
        ctx.fillStyle=`rgb(${v|0},${v|0},${v|0})`;
        ctx.fillRect(i,0,1,s);
      }
    }), {color:false,rx,ry});
    const rough = toTex(makeCanvas(128,(ctx,s)=>{
      ctx.fillStyle = kind==='velvet' ? '#d8d8d8' : '#e8e8e8';
      ctx.fillRect(0,0,s,s);
    }), {color:false,rx,ry});
    return {map, bump, rough};
  });
}

function sisalMap() {
  return cached('sisal', () => toTex(makeCanvas(512,(ctx,s)=>{
    ctx.fillStyle='#c4a06a'; ctx.fillRect(0,0,s,s);
    for (let x=0;x<s;x+=2) {
      const v=0.75+noise(x*0.2,1)*0.4;
      ctx.strokeStyle=`rgba(${140*v|0},${100*v|0},${50*v|0},0.85)`;
      ctx.beginPath();
      ctx.moveTo(x,0);
      for (let y=0;y<=s;y+=8) ctx.lineTo(x+(noise(x,y)-0.5)*2,y);
      ctx.stroke();
    }
    for (let y=0;y<s;y+=18) {
      ctx.strokeStyle='rgba(80,50,20,0.25)';
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(s,y+2); ctx.stroke();
    }
  }), {rx:1, ry:3}));
}
function grassMaps() {
  return cached('grass', () => {
    const map = toTex(makeCanvas(1024,(ctx,s)=>{
      ctx.fillStyle='#3a6a32'; ctx.fillRect(0,0,s,s);
      for (let i=0;i<s;i+=2) for (let j=0;j<s;j+=2) {
        const n=fbm(i*0.02,j*0.02,4);
        const r=40+n*30, g=90+n*70, b=30+n*20;
        ctx.fillStyle=rgb(r,g,b); ctx.fillRect(i,j,2,2);
      }
      ctx.strokeStyle='rgba(20,40,10,0.25)';
      for (let i=0;i<5000;i++) {
        const x=hash(i,1)*s, y=hash(i,2)*s;
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+(hash(i,3)-0.5)*3, y-2-hash(i,4)*4); ctx.stroke();
      }
    }), {rx:4, ry:4});
    const bump = toTex(makeCanvas(512,(ctx,s)=>{
      ctx.fillStyle='#888'; ctx.fillRect(0,0,s,s);
      for (let i=0;i<8000;i++) {
        const v=100+hash(i,5)*120;
        ctx.fillStyle=`rgb(${v|0},${v|0},${v|0})`;
        ctx.fillRect(hash(i,6)*s, hash(i,7)*s, 1, 3);
      }
    }), {color:false, rx:4, ry:4});
    return {map, bump};
  });
}
function paverMaps(kind, rx, ry) {
  const stone = stoneMaps(kind, 1, 1);
  return cached(`paver:${kind}:${rx}:${ry}`, () => {
    const map = toTex(makeCanvas(1024,(ctx,s)=>{
      ctx.fillStyle='#6a655c'; ctx.fillRect(0,0,s,s);
      const n=4, pad=6, tile=(s-(n+1)*pad)/n;
      const src = document.createElement('canvas');
      // draw from stone by resampling color field
      for (let i=0;i<n;i++) for (let j=0;j<n;j++) {
        const v=0.92+hash(i,j)*0.14;
        const img=ctx.createLinearGradient(0,0,tile,tile);
        if (kind==='darkMarble') {
          img.addColorStop(0, rgb(30*v,30*v,34*v));
          img.addColorStop(1, rgb(50*v,50*v,56*v));
        } else {
          img.addColorStop(0, rgb(210*v,196*v,172*v));
          img.addColorStop(1, rgb(230*v,216*v,192*v));
        }
        const x=pad+i*(tile+pad), y=pad+j*(tile+pad);
        ctx.fillStyle=img; ctx.fillRect(x,y,tile,tile);
        // faint vein
        ctx.strokeStyle='rgba(255,255,255,0.12)';
        ctx.beginPath(); ctx.moveTo(x+10,y+hash(i,j)*tile); ctx.lineTo(x+tile-8,y+hash(j,i)*tile); ctx.stroke();
      }
    }), {rx, ry});
    return { map, bump: stone.bump, rough: stone.rough };
  });
}
function wallpaperMaps(wallRGB) {
  const key=`wp:${wallRGB.join(',')}`;
  return cached(key, () => {
    const map = toTex(makeCanvas(512,(ctx,s)=>{
      const [r,g,b]=wallRGB;
      ctx.fillStyle=rgb(r,g,b); ctx.fillRect(0,0,s,s);
      for (let x=0;x<s;x+=3) {
        const n=fbm(x*0.15, 1, 2);
        ctx.fillStyle=`rgba(0,0,0,${0.04+n*0.06})`;
        ctx.fillRect(x,0,1.2,s);
        ctx.fillStyle=`rgba(255,255,255,${0.03+n*0.04})`;
        ctx.fillRect(x+1,0,0.7,s);
      }
      for (let y=0;y<s;y+=7) {
        ctx.fillStyle=`rgba(0,0,0,${0.03+noise(y,2)*0.04})`;
        ctx.fillRect(0,y,s,1);
      }
    }), {rx:3, ry:2});
    const bump = toTex(makeCanvas(256,(ctx,s)=>{
      ctx.fillStyle='#888'; ctx.fillRect(0,0,s,s);
      for (let x=0;x<s;x+=3) {
        ctx.fillStyle='#bbb'; ctx.fillRect(x,0,1,s);
        ctx.fillStyle='#666'; ctx.fillRect(x+1,0,1,s);
      }
    }), {color:false, rx:3, ry:2});
    return {map, bump};
  });
}

function daylightGlassMap() {
  return cached('daylight-glass', () => toTex(makeCanvas(256, (ctx,s)=>{
    const g = ctx.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, '#fffaf0');
    g.addColorStop(0.28, '#ffe9b8');
    g.addColorStop(0.62, '#f3f0e6');
    g.addColorStop(1, '#dce8f8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    // soft mullion-adjacent bloom
    const radial = ctx.createRadialGradient(s*0.5, s*0.3, 10, s*0.5, s*0.45, s*0.8);
    radial.addColorStop(0, 'rgba(255,248,230,0.35)');
    radial.addColorStop(1, 'rgba(255,248,230,0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, s, s);
  }), { rx:1, ry:1 }));
}

function buildMaterials() {
  const T = THEME[state.theme];
  const floorKind = T.floor;
  const floor = floorKind==='travertine' || floorKind==='limestone'
    ? stoneMaps(floorKind==='travertine'?'travertine':'limestone', 2, 2)
    : woodMaps(floorKind, true, 3, 2);
  const dado = woodMaps(T.dado==='oak'?'oak': T.dado==='whiteOak'?'whiteOak':'walnut', false, 2, 1);
  const wall = wallpaperMaps(T.wall);
  const plaster = wallpaperMaps(T.plaster);
  const metal = metalMaps(T.metal);
  const velvet = fabricMaps(T.velvet, 'velvet', 2, 2);
  const linen = fabricMaps(T.linen, 'linen', 2, 2);
  const rug = fabricMaps(T.rugA, 'rug', 4, 3);
  const stone = stoneMaps(T.stone, 1, 1);
  const grass = grassMaps();
  const paver = paverMaps(T.paver, 2, 2);
  const cedar = woodMaps(T.cedar, false, 1, 2);
  const teak = woodMaps('teak', false, 1, 1);
  const oak = woodMaps('oak', false, 1, 2);
  const sisal = sisalMap();
  const feltMaps = fabricMaps([236, 226, 208], 'linen', 1, 1);

  const phys = (opts) => new THREE.MeshPhysicalMaterial(opts);
  const std = (opts) => new THREE.MeshStandardMaterial(opts);

  mats = {
    floor: std({ map: floor.map, bumpMap: floor.bump, bumpScale: 0.04, roughnessMap: floor.rough, roughness: 0.48, metalness: 0.02 }),
    dado: std({ map: dado.map, bumpMap: dado.bump, bumpScale: 0.03, roughness: 0.5, metalness: 0.04 }),
    wall: std({ map: wall.map, bumpMap: wall.bump, bumpScale: 0.012, roughness: 0.78, metalness: 0 }),
    plaster: std({ map: plaster.map, bumpMap: plaster.bump, bumpScale: 0.008, roughness: 0.82, metalness: 0 }),
    metal: std({ map: metal.map, roughnessMap: metal.rough, metalness: T.metal==='black'?0.7: T.metal==='bronze'?0.78: T.satin?0.82:0.85, roughness: T.metal==='black'?0.42: T.metal==='bronze'?0.4: T.satin?0.36:0.28, envMapIntensity: 1.1 }),
    velvet: phys({ map: velvet.map, bumpMap: velvet.bump, bumpScale: 0.02, roughness: 0.82, metalness: 0, sheen: 1, sheenRoughness: 0.45, sheenColor: new THREE.Color(...T.velvet.map(v=>v/255)) }),
    linen: std({ map: linen.map, bumpMap: linen.bump, bumpScale: 0.02, roughness: 0.86, metalness: 0 }),
    rug: std({ map: rug.map, bumpMap: rug.bump, bumpScale: 0.03, roughness: 0.9, metalness: 0 }),
    stone: std({ map: stone.map, bumpMap: stone.bump, bumpScale: 0.03, roughnessMap: stone.rough, roughness: 0.42, metalness: 0.04 }),
    grass: std({ map: grass.map, bumpMap: grass.bump, bumpScale: 0.05, roughness: 0.92, metalness: 0 }),
    paver: std({ map: paver.map, bumpMap: paver.bump, bumpScale: 0.035, roughnessMap: paver.rough, roughness: 0.5, metalness: 0.03 }),
    cedar: std({ map: cedar.map, bumpMap: cedar.bump, bumpScale: 0.03, roughness: 0.62, metalness: 0.02 }),
    teak: std({ map: teak.map, bumpMap: teak.bump, bumpScale: 0.045, roughness: 0.46, metalness: 0.04 }),
    oak: std({ map: oak.map, bumpMap: oak.bump, bumpScale: 0.04, roughness: 0.5, metalness: 0.03 }),
    felt: std({ map: feltMaps.map, bumpMap: feltMaps.bump, bumpScale: 0.025, roughness: 0.9, metalness: 0 }),
    glassLid: phys({ color: 0xcfe4f7, roughness: 0.04, metalness: 0.0, transmission: 0.92, thickness: 0.016, ior: 1.5, transparent: true, opacity: 0.32, envMapIntensity: 1.25 }),
    ceramicGlaze: std({ color: 0xf6f3ec, roughness: 0.16, metalness: 0.08 }),

    sisal: std({ map: sisal, bumpScale: 0.04, roughness: 0.88, metalness: 0 }),
    ceramic: std({ color: new THREE.Color(...T.ceramic.map(v=>v/255)), roughness: 0.22, metalness: 0.05 }),
    cushion: phys({ color: new THREE.Color(...T.cushion.map(v=>v/255)), map: fabricMaps(T.cushion, 'velvet', 2, 2).map, roughness: 0.72, metalness: 0, sheen: 1, sheenRoughness: 0.4, sheenColor: new THREE.Color(0.95,0.86,0.62) }),
    pillowIvory: phys({ color: new THREE.Color(...(T.pillowIvory||[244,234,214]).map(v=>v/255)), map: fabricMaps(T.pillowIvory||[244,234,214], 'velvet', 2, 2).map, roughness: 0.74, metalness: 0, sheen: 1, sheenRoughness: 0.42, sheenColor: new THREE.Color(0.98,0.94,0.86) }),
    glass: phys({ map: daylightGlassMap(), color: 0xfff6e8, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.48, emissive: 0xffe7b0, emissiveMap: daylightGlassMap(), emissiveIntensity: 1.25 }),
    mullion: std({ map: metal.map, metalness: T.metal==='black'?0.7:0.85, roughness: 0.3 }),
    foliage: std({ color: 0x3d6a38, roughness: 0.86, metalness: 0 }),
    soil: std({ color: 0x3a2a1c, roughness: 0.95, metalness: 0 }),
    gravel: std({ color: 0x8a8376, roughness: 0.9, metalness: 0 }),
    ground: new THREE.ShadowMaterial({ opacity: 0.28 }),
    edge: std({ color: 0x1a120c, roughness: 0.7, metalness: 0 }),
  };
}

/* ---------- mesh helpers ---------- */
function addBox(parent, mat, w,h,d, x,y,z, opt={}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  m.position.set(x,y,z);
  if (opt.rotY) m.rotation.y = opt.rotY;
  if (opt.rotX) m.rotation.x = opt.rotX;
  if (opt.rotZ) m.rotation.z = opt.rotZ;
  m.castShadow = opt.cast !== false;
  m.receiveShadow = opt.receive !== false;
  if (opt.ignoreBounds) m.userData.ignoreBounds = true;
  parent.add(m);
  return m;
}

/* Invisible volume for thin floor-hugging meshes (rug, mats, beds, pads).
   A 2–3 cm slab is easy for a click or touch ray to miss, especially from a
   glancing orbit or on a short mobile canvas. Proxies are ignoreBounds so
   clamp / snap / default placement stay unchanged. Floor and walls are not
   furniture, so they never receive a proxy and stay out of pickFurniture. */
const PICK_PROXY_THICK = 0.06;
const PICK_THIN_H = 0.12;
const PICK_MIN_FOOT = 0.2;

function addPickProxyForMesh(mesh) {
  const parent = mesh.parent;
  if (!parent || mesh.userData.pickProxy) return null;
  mesh.geometry.computeBoundingBox();
  const size = mesh.geometry.boundingBox.getSize(new THREE.Vector3()).multiply(mesh.scale);
  const mat = new THREE.MeshBasicMaterial({
    visible: false,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const proxy = new THREE.Mesh(new THREE.BoxGeometry(size.x, PICK_PROXY_THICK, size.z), mat);
  proxy.position.copy(mesh.position);
  proxy.position.y = Math.max(mesh.position.y, PICK_PROXY_THICK / 2);
  proxy.rotation.copy(mesh.rotation);
  proxy.castShadow = false;
  proxy.receiveShadow = false;
  proxy.userData.pickProxy = true;
  proxy.userData.ignoreBounds = true;
  parent.add(proxy);
  return proxy;
}

function ensurePickProxies(root) {
  const thin = [];
  root.traverse((o) => {
    if (!o.isMesh || o.userData.pickProxy || !o.geometry) return;
    o.geometry.computeBoundingBox();
    const size = o.geometry.boundingBox.getSize(new THREE.Vector3()).multiply(o.scale);
    const world = new THREE.Box3().setFromObject(o);
    const h = Math.min(size.y, world.max.y - world.min.y);
    const foot = Math.max(world.max.x - world.min.x, world.max.z - world.min.z);
    if (h <= PICK_THIN_H && foot >= PICK_MIN_FOOT) thin.push(o);
  });
  thin.forEach(addPickProxyForMesh);
}
function addCyl(parent, mat, rTop, rBot, h, x,y,z, opt={}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, opt.seg || 24), mat);
  m.position.set(x,y,z);
  if (opt.rotX) m.rotation.x = opt.rotX;
  if (opt.rotZ) m.rotation.z = opt.rotZ;
  m.castShadow = opt.cast !== false;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function addPillow(parent, mat, w, h, d, x, y, z, rotY=0) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.5, 28, 20), mat);
  m.scale.set(w, h, d);
  m.position.set(x, y, z);
  m.rotation.y = rotY;
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function addBolster(parent, mat, length, radius, x, y, z, rotY=0) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(radius, Math.max(0.02, length - radius * 2), 8, 20), mat);
  m.position.set(x, y, z);
  m.rotation.z = Math.PI / 2;
  m.rotation.y = rotY;
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function addSlab(parent, mat, w, d, thick, y, bevel=0.02) {
  const sh = new THREE.Shape();
  const hw=w/2, hd=d/2;
  sh.moveTo(-hw, -hd); sh.lineTo(hw, -hd); sh.lineTo(hw, hd); sh.lineTo(-hw, hd); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: thick, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2 });
  geo.rotateX(-Math.PI/2);
  const m = new THREE.Mesh(geo, mat);
  m.position.y = y;
  m.castShadow = true; m.receiveShadow = true;
  parent.add(m);
  return m;
}

function clearWorld() {
  if (!world) return;
  world.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
  });
  while (world.children.length) world.remove(world.children[0]);
}

let _wallPlan = null;
function sofaAlongWidth() {
  const { w } = dim();
  const grand = state.elements.sofa.variant === 'grand';
  return grand ? Math.min(2.45, w * 0.48) : Math.min(1.85, w * 0.4);
}
function wallPieceWidth(key, garden) {
  const grand = state.elements[key].variant === 'grand';
  const widths = {
    catwall: garden ? 1.30 : (grand ? 1.64 : 1.36),
    alcove:  garden ? (grand ? 2.00 : 1.55) : (grand ? 1.98 : 1.52),
    dining:  grand ? 1.28 : 1.00,
    litter:  garden ? (grand ? 1.70 : 1.35) : (grand ? 1.68 : 1.32),
  };
  return widths[key];
}
function planWall(wall) {
  const { w, d, isGarden } = dim();
  const marginEnd = isGarden ? 0.72 : 0.50;
  let marginStart = isGarden ? 0.72 : 0.50;
  if (wall === 'left' && state.elements.sofa.on && state.elements.sofa.place === 'left') {
    marginStart = Math.max(marginStart, sofaAlongWidth() + 0.42);
  }
  const axisLen = wall === 'left' ? d : w;
  const usable = Math.max(0.85, axisLen - marginStart - marginEnd);
  const keys = ['catwall','alcove','dining'].filter((k) => state.elements[k].on && state.elements[k].place === wall);
  const gap0 = 0.20;
  const pieces = keys.map((k) => ({ k, width: wallPieceWidth(k, isGarden) }));
  const raw = pieces.reduce((s, p) => s + p.width, 0) + Math.max(0, pieces.length - 1) * gap0;
  const scale = raw > usable ? usable / raw : 1;
  let cursor = marginStart;
  const slots = {};
  for (const p of pieces) {
    const width = p.width * scale;
    const center = cursor + width / 2;
    cursor += width + gap0 * scale;
    slots[p.k] = { center, scale, width };
  }
  return { slots, marginStart, marginEnd, scale };
}
function getWallPlan() {
  if (!_wallPlan) _wallPlan = { left: planWall('left'), back: planWall('back') };
  return _wallPlan;
}
function wallSlot(wall, key, inset) {
  const { w, d } = dim();
  const plan = getWallPlan()[wall];
  const sl = plan.slots[key];
  const center = sl ? sl.center : (wall === 'left' ? d : w) * 0.5;
  const scale = sl ? sl.scale : 1;
  if (wall === 'left') {
    return { x: -w/2 + inset, z: d/2 - center, rotY: Math.PI/2, scale };
  }
  return { x: -w/2 + center, z: -d/2 + inset, rotY: 0, scale };
}

/* ---------- architecture ---------- */
function buildInteriorShell() {
  const { w, d, h } = dim();
  const T = THEME[state.theme];
  const g = new THREE.Group();
  world.add(g);

  addSlab(g, mats.floor, w + 0.12, d + 0.12, 0.1, -0.1, 0.022);

  const dadoH = state.elements.panelling.on ? (state.elements.panelling.variant === 'tall' ? 1.18 : 0.92) : 0;
  const thick = 0.07;
  const winW = Math.min(2.15, w * 0.4);
  const winH = Math.min(1.65, h * 0.58);
  const sill = 0.88;
  const wallMat = state.elements.panelling.on ? mats.wall : mats.plaster;

  // Left wall (solid)
  addBox(g, wallMat, thick, h, d, -w/2 - thick/2, h/2, 0, {cast:false});
  // Back wall with window opening — five panels
  const zBack = -d/2 - thick/2;
  const side = (w - winW) / 2;
  addBox(g, wallMat, side, h, thick, -w/2 + side/2, h/2, zBack, {cast:false});
  addBox(g, wallMat, side, h, thick,  w/2 - side/2, h/2, zBack, {cast:false});
  addBox(g, wallMat, winW, sill, thick, 0, sill/2, zBack, {cast:false});
  const head = h - (sill + winH);
  addBox(g, wallMat, winW, head, thick, 0, sill + winH + head/2, zBack, {cast:false});

  // Window: glass + mullions + jambs
  const glass = addBox(g, mats.glass, winW - 0.06, winH - 0.06, 0.03, 0, sill + winH/2, -d/2 + 0.01, {cast:false});
  glass.receiveShadow = false;
  const dayMat = new THREE.MeshBasicMaterial({ map: daylightGlassMap(), color: 0xfff3d2, toneMapped: true });
  addBox(g, dayMat, winW - 0.02, winH - 0.02, 0.02, 0, sill + winH/2, -d/2 - 0.08, {cast:false, receive:false});
  // frame
  const fw = 0.05;
  addBox(g, mats.mullion, winW + 0.04, fw, 0.07, 0, sill, -d/2 + 0.02);
  addBox(g, mats.mullion, winW + 0.04, fw, 0.07, 0, sill + winH, -d/2 + 0.02);
  addBox(g, mats.mullion, fw, winH + 0.04, 0.07, -winW/2, sill + winH/2, -d/2 + 0.02);
  addBox(g, mats.mullion, fw, winH + 0.04, 0.07,  winW/2, sill + winH/2, -d/2 + 0.02);
  addBox(g, mats.mullion, fw*0.7, winH, 0.05, 0, sill + winH/2, -d/2 + 0.025);
  addBox(g, mats.mullion, winW, fw*0.7, 0.05, 0, sill + winH/2, -d/2 + 0.025);
  addBox(g, mats.mullion, winW, fw*0.7, 0.05, 0, sill + winH*0.25, -d/2 + 0.025);
  addBox(g, mats.mullion, winW, fw*0.7, 0.05, 0, sill + winH*0.75, -d/2 + 0.025);

  // Baseboards, chair rail, cornice on the two walls
  const trim = mats.metal;
  const wood = mats.dado;
  // left
  addBox(g, wood, 0.04, 0.12, d, -w/2 + 0.02, 0.06, 0, {cast:false});
  addBox(g, trim, 0.03, 0.02, d, -w/2 + 0.025, 0.13, 0, {cast:false});
  addBox(g, wood, 0.05, 0.08, d, -w/2 + 0.02, h - 0.05, 0, {cast:false});
  // back (split around window at sill height only for baseboard)
  addBox(g, wood, w, 0.12, 0.04, 0, 0.06, -d/2 + 0.02, {cast:false});
  addBox(g, trim, w, 0.02, 0.03, 0, 0.13, -d/2 + 0.025, {cast:false});
  addBox(g, wood, w, 0.08, 0.05, 0, h - 0.05, -d/2 + 0.02, {cast:false});

  if (state.elements.panelling.on) {
    // Dado panels on left and back (skip window)
    addBox(g, mats.dado, 0.03, dadoH - 0.14, d - 0.1, -w/2 + 0.03, (dadoH - 0.14)/2 + 0.12, 0, {cast:false});
    // fluted suggestion: bump is on material; add a chair rail
    addBox(g, mats.metal, 0.035, 0.03, d, -w/2 + 0.04, dadoH, 0, {cast:false});
    addBox(g, mats.dado, w - 0.1, dadoH - 0.14, 0.03, 0, (dadoH - 0.14)/2 + 0.12, -d/2 + 0.03, {cast:false});
    addBox(g, mats.metal, w, 0.03, 0.035, 0, dadoH, -d/2 + 0.04, {cast:false});
    // a few applied panel frames on the left dado
    const frames = 3;
    for (let i = 0; i < frames; i++) {
      const z = mix(-d/2 + 0.55, d/2 - 0.55, (i+0.5)/frames);
      const fh = dadoH - 0.32, fw2 = d * 0.18;
      // simple recessed frame (four sticks)
      addBox(g, mats.metal, 0.02, fh, 0.02, -w/2 + 0.045, 0.2 + fh/2, z - fw2/2, {cast:false});
      addBox(g, mats.metal, 0.02, fh, 0.02, -w/2 + 0.045, 0.2 + fh/2, z + fw2/2, {cast:false});
      addBox(g, mats.metal, 0.02, 0.02, fw2, -w/2 + 0.045, 0.2 + fh, z, {cast:false});
      addBox(g, mats.metal, 0.02, 0.02, fw2, -w/2 + 0.045, 0.2, z, {cast:false});
    }
  }

  // Sconce fixtures
  addCyl(g, mats.metal, 0.04, 0.05, 0.08, -w/2 + 0.08, 1.58, d*0.18, {seg:12});
  addCyl(g, mats.metal, 0.015, 0.015, 0.1, -w/2 + 0.08, 1.5, d*0.18, {seg:8});
  addCyl(g, mats.metal, 0.04, 0.05, 0.08, -w/2 + 0.08, 1.58, -d*0.12, {seg:12});
  addCyl(g, mats.metal, 0.04, 0.05, 0.08, w*0.28, 1.58, -d/2 + 0.08, {seg:12});

  // Exterior hint beyond the window: a thin dark plane
  addBox(g, mats.edge, 10, 6, 0.05, 0, 2.0, -d/2 - 4.5, {cast:false, receive:false});

  return { winW, winH, sill };
}

function buildGardenShell() {
  const { w, d, h } = dim();
  const g = new THREE.Group();
  world.add(g);
  // Beveled ground slab under everything
  addSlab(g, mats.edge, w + 0.2, d + 0.2, 0.1, -0.11, 0.02);
  const terraceD = d * 0.48;
  // terrace at the back (house side)
  addBox(g, mats.paver, w, 0.06, terraceD, 0, 0.03, -d/2 + terraceD/2);
  addBox(g, mats.grass, w, 0.05, d - terraceD, 0, 0.025, -d/2 + terraceD + (d-terraceD)/2);
  // stone border if panelling on
  if (state.elements.panelling.on) {
    addBox(g, mats.stone, w, 0.08, 0.22, 0, 0.06, -d/2 + terraceD, {cast:false});
    addBox(g, mats.stone, 0.22, 0.08, d, -w/2 + 0.11, 0.06, 0, {cast:false});
  }
  // Cedar fence: back + left, plus short returns
  const slatW = 0.09, gap = 0.03, fenceH = h;
  const buildFence = (length, cx, cz, rotY) => {
    const fg = new THREE.Group();
    fg.position.set(cx, 0, cz);
    fg.rotation.y = rotY;
    const n = Math.max(4, Math.round(length / (slatW + gap)));
    const start = -length/2 + slatW/2;
    addBox(fg, mats.cedar, length + 0.1, 0.1, 0.08, 0, 0.12, 0);
    addBox(fg, mats.cedar, length + 0.1, 0.08, 0.08, 0, fenceH - 0.08, 0);
    addBox(fg, mats.cedar, 0.08, fenceH, 0.08, -length/2, fenceH/2, 0);
    addBox(fg, mats.cedar, 0.08, fenceH, 0.08,  length/2, fenceH/2, 0);
    for (let i = 0; i < n; i++) {
      addBox(fg, mats.cedar, slatW, fenceH - 0.16, 0.025, start + i*(slatW+gap), fenceH/2, 0);
    }
    g.add(fg);
  };
  buildFence(w, 0, -d/2, 0);
  buildFence(d, -w/2, 0, Math.PI/2);
  // short returns so the enclosure reads
  buildFence(Math.min(1.4, w*0.22), w/2, -d/2 + Math.min(0.7, d*0.12), Math.PI/2);
  buildFence(Math.min(1.2, d*0.2), -w/2 + Math.min(0.6, w*0.1), d/2, 0);

  // Planters
  const plant = (x,z) => {
    addBox(g, mats.stone, 0.55, 0.38, 0.55, x, 0.22, z);
    addBox(g, mats.soil, 0.44, 0.06, 0.44, x, 0.42, z, {cast:false});
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), mats.foliage);
    bush.position.set(x, 0.62, z);
    bush.castShadow = true; bush.receiveShadow = true;
    g.add(bush);
  };
  plant(-w/2 + 0.7, -d/2 + 0.7);
  plant( w/2 - 0.7, -d/2 + 0.7);
  plant(-w/2 + 0.7,  d/2 - 0.7);
  return { terraceD };
}

/* ---------- furniture families ---------- */
function tagFurn(g, id) {
  g.userData.role = 'furniture';
  g.userData.id = id;
  g.userData.magnet = MAGNET[id] || 'floor';
  return g;
}
function furnById(id) {
  if (!world) return null;
  let found = null;
  world.traverse((o) => { if (o.userData && o.userData.role === 'furniture' && o.userData.id === id) found = o; });
  return found;
}
function allFurn() {
  const list = [];
  if (!world) return list;
  world.traverse((o) => { if (o.userData && o.userData.role === 'furniture') list.push(o); });
  return list;
}
function addCatWall(parent, garden) {
  const grand = state.elements.catwall.variant === 'grand';
  const wall = state.elements.catwall.place;
  const inset = garden ? 0.42 : 0.32;
  const p = wallSlot(wall, 'catwall', inset);
  const sc = p.scale || 1;
  const g = tagFurn(new THREE.Group(), 'catwall');
  g.position.set(p.x, 0, p.z);
  g.rotation.y = p.rotY;
  parent.add(g);
  if (garden) {
    const h = grand ? 1.25 : 1.05;
    // covered catio
    addBox(g, mats.cedar, 1.15*sc, 0.08, 0.7, 0, h, 0);
    addBox(g, mats.cedar, 0.07, h, 0.07, -0.5*sc, h/2, -0.28);
    addBox(g, mats.cedar, 0.07, h, 0.07,  0.5*sc, h/2, -0.28);
    addBox(g, mats.cedar, 0.07, h, 0.07, -0.5*sc, h/2,  0.28);
    addBox(g, mats.cedar, 0.07, h, 0.07,  0.5*sc, h/2,  0.28);
    // slatted roof
    for (let i=0;i<7;i++) addBox(g, mats.cedar, 1.15*sc, 0.025, 0.07, 0, h+0.04, -0.28 + i*0.1, {cast:false});
    // steps / shelves
    const steps = grand ? 5 : 3;
    for (let i=0;i<steps;i++) {
      addBox(g, mats.cedar, 0.55*sc, 0.05, 0.36, (i%2===0?-0.2:0.2)*sc, 0.32+i*(h-0.5)/steps, 0);
    }
    addBox(g, mats.linen, 0.5, 0.05, 0.4, 0, h-0.06, 0);
  } else {
    const postH = grand ? 1.55 : 1.25;
    addCyl(g, mats.sisal, 0.07, 0.07, postH, 0.15, postH/2, 0, {seg:20});
    addCyl(g, mats.metal, 0.075, 0.075, 0.04, 0.15, 0.02, 0, {seg:16});
    addCyl(g, mats.metal, 0.075, 0.075, 0.04, 0.15, postH, 0, {seg:16});
    const shelves = grand ? 4 : 3;
    for (let i=0;i<shelves;i++) {
      const y = 0.55 + i * ((postH-0.5)/shelves);
      const x = (i%2===0 ? -0.15 : 0.28);
      addBox(g, mats.dado, (grand?1.15:0.9)*sc, 0.045, 0.32, x*sc, y, 0);
      addBox(g, mats.metal, 0.02, 0.08, 0.18, (x - 0.3)*sc, y-0.05, -0.02);
      addBox(g, mats.metal, 0.02, 0.08, 0.18, (x + 0.3)*sc, y-0.05, -0.02);
      addBox(g, mats.velvet, (grand?0.4:0.32), 0.03, 0.22, x, y+0.035, 0, {cast:false});
    }
    if (grand) {
      // suspended bridge
      addBox(g, mats.dado, 0.9*sc, 0.03, 0.16, 0.05*sc, postH*0.72, 0.18);
      addCyl(g, mats.metal, 0.008, 0.008, 0.35, -0.3*sc, postH*0.72+0.18, 0.18, {seg:8});
      addCyl(g, mats.metal, 0.008, 0.008, 0.35,  0.4*sc, postH*0.72+0.18, 0.18, {seg:8});
    }
  }
  g.userData.pieceH = garden ? (grand ? 1.35 : 1.15) : (grand ? 1.65 : 1.35);
  g.userData.along = garden ? 1.30 : (grand ? 1.64 : 1.36);
  g.userData.depth = garden ? 0.70 : 0.40;
}

function addAlcove(parent, garden) {
  const grand = state.elements.alcove.variant === 'grand';
  const wall = state.elements.alcove.place;
  const p = wallSlot(wall, 'alcove', garden ? 0.50 : 0.28);
  const sc = p.scale || 1;
  const g = tagFurn(new THREE.Group(), 'alcove');
  g.position.set(p.x, 0, p.z);
  g.rotation.y = p.rotY;
  parent.add(g);
  const W = (grand ? 1.85 : 1.4) * sc;
  const H = grand ? 0.92 : 0.82;
  const D = garden ? 0.85 : 0.46;
  if (garden) {
    addBox(g, mats.stone, W, 0.12, D, 0, 0.06, 0);
    addBox(g, mats.cedar, W, 0.08, D, 0, H, 0);
    addBox(g, mats.cedar, 0.07, H, 0.07, -W/2+0.04, H/2, -D/2+0.04);
    addBox(g, mats.cedar, 0.07, H, 0.07,  W/2-0.04, H/2, -D/2+0.04);
    addBox(g, mats.cedar, 0.07, H, 0.07, -W/2+0.04, H/2,  D/2-0.04);
    addBox(g, mats.cedar, 0.07, H, 0.07,  W/2-0.04, H/2,  D/2-0.04);
    // arched niche suggestion: back + sides + velvet bed
    addBox(g, mats.cedar, W-0.2, H-0.2, 0.04, 0, (H-0.2)/2+0.1, -D/2+0.12);
    addBox(g, mats.velvet, W-0.4, 0.08, D-0.3, 0, 0.16, 0.04);
    addBolster(g, mats.pillowIvory, Math.min(W-0.5, 0.8), 0.08, 0, 0.24, 0.04);
    addCyl(g, mats.cedar, (W-0.3)/2, (W-0.3)/2, 0.05, 0, H-0.18, -D/2+0.14, {rotX:Math.PI/2, seg:16, cast:false});
  } else {
    // fluted console body
    addBox(g, mats.dado, W, H, D, 0, H/2, 0);
    // flute strips on face
    const flutes = grand ? 11 : 9;
    for (let i=0;i<flutes;i++) {
      const x = mix(-W/2+0.08, W/2-0.08, (i+0.5)/flutes);
      addBox(g, mats.dado, 0.03, H-0.12, 0.02, x, H/2, D/2+0.008, {cast:false});
    }
    addBox(g, mats.metal, W+0.02, 0.025, D+0.02, 0, H, 0);
    addBox(g, mats.metal, W+0.02, 0.02, D+0.02, 0, 0.02, 0);
    // arched niche cut visually: dark recess + velvet + brass arch
    const nw = grand ? 0.78 : 0.62, nh = grand ? 0.55 : 0.46;
    const nicheMat = mats.velvet.clone();
    nicheMat.emissive = new THREE.Color(0xffc888);
    nicheMat.emissiveIntensity = 0.28;
    addBox(g, nicheMat, nw, nh, 0.08, 0, 0.14+nh/2, D/2-0.06, {cast:false});
    addBolster(g, mats.pillowIvory, Math.min(nw-0.16, 0.62), 0.075, 0, 0.20, D/2-0.02);
    const glow = new THREE.PointLight(0xffc48a, 1.85, 2.8, 2);
    glow.position.set(0, 0.42, D/2 + 0.18);
    g.add(glow);
    // brass arch as a thin torus-like half: use boxes + cylinder
    addBox(g, mats.metal, 0.025, nh, 0.025, -nw/2, 0.14+nh/2, D/2+0.01);
    addBox(g, mats.metal, 0.025, nh, 0.025,  nw/2, 0.14+nh/2, D/2+0.01);
    addBox(g, mats.metal, nw+0.02, 0.025, 0.025, 0, 0.14+nh, D/2+0.01);
  }
}

function addDining(parent, garden) {
  const grand = state.elements.dining.variant === 'grand';
  const wall = state.elements.dining.place;
  const p = wallSlot(wall, 'dining', garden ? 0.34 : 0.32);
  const sc = p.scale || 1;
  const g = tagFurn(new THREE.Group(), 'dining');
  g.position.set(p.x, 0, p.z);
  g.rotation.y = p.rotY;
  parent.add(g);
  const W = (grand ? 1.15 : 0.88) * sc, D = grand ? 0.5 : 0.42;
  if (garden) {
    addBox(g, mats.stone, W, 0.18, D, 0, 0.09, 0);
    addBox(g, mats.stone, W+0.04, 0.04, D+0.04, 0, 0.2, 0);
  } else {
    addBox(g, mats.dado, W, 0.12, D, 0, 0.06, 0);
    addBox(g, mats.stone, W+0.04, 0.035, D+0.04, 0, 0.135, 0);
  }
  const bowl = (x) => {
    addCyl(g, mats.ceramic, 0.09, 0.07, 0.05, x, 0.18, 0, {seg:20});
    addCyl(g, mats.metal, 0.095, 0.095, 0.012, x, 0.205, 0, {seg:20});
    const inner = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 10, 0, Math.PI*2, 0, Math.PI/2), mats.ceramic);
    inner.rotation.x = Math.PI;
    inner.position.set(x, 0.205, 0);
    g.add(inner);
  };
  bowl(-0.16*sc); bowl(0.16*sc);
}

function addLitter(parent, garden) {
  const grand = state.elements.litter.variant === 'grand';
  const g = tagFurn(new THREE.Group(), 'litter');
  parent.add(g);
  const W = grand ? 1.12 : 0.94;
  const D = grand ? 0.62 : 0.54;
  const H = 0.46;
  const footH = 0.05;
  const bodyH = H - footH - 0.02;
  const teak = mats.teak, brass = mats.metal, glass = mats.glassLid, basin = mats.ceramicGlaze;
  // brass feet
  const fx = W/2 - 0.07, fz = D/2 - 0.07;
  [[-fx,-fz],[fx,-fz],[-fx,fz],[fx,fz]].forEach(([x,z]) => {
    addCyl(g, brass, 0.018, 0.022, footH, x, footH/2, z, {seg:12});
  });
  // teak carcase: floor + four sides, open well so the glass lid and ceramic basin read clearly
  addBox(g, teak, W, 0.04, D, 0, footH + 0.02, 0);
  const wallT = 0.045;
  addBox(g, teak, wallT, bodyH, D, -W/2 + wallT/2, footH + bodyH/2, 0);
  addBox(g, teak, wallT, bodyH, D,  W/2 - wallT/2, footH + bodyH/2, 0);
  addBox(g, teak, W, bodyH, wallT, 0, footH + bodyH/2, -D/2 + wallT/2);
  addBox(g, teak, W, bodyH, wallT, 0, footH + bodyH/2,  D/2 - wallT/2);
  // white glazed ceramic litter basin, visible through the tempered glass lid
  addCyl(g, basin, 0.20, 0.24, 0.10, 0, footH + 0.11, 0.02, {seg:24});
  addCyl(g, basin, 0.18, 0.18, 0.016, 0, footH + 0.165, 0.02, {seg:24, cast:false});
  // teak frame around the tempered glass lid
  const fw = 0.045, lidY = footH + bodyH + 0.01;
  addBox(g, teak, W, fw, fw, 0, lidY, -D/2 + fw/2);
  addBox(g, teak, W, fw, fw, 0, lidY,  D/2 - fw/2);
  addBox(g, teak, fw, fw, D, -W/2 + fw/2, lidY, 0);
  addBox(g, teak, fw, fw, D,  W/2 - fw/2, lidY, 0);
  const lid = addBox(g, glass, W - fw*2 - 0.01, 0.012, D - fw*2 - 0.01, 0, lidY + 0.004, 0, {cast:false});
  lid.receiveShadow = false;
  // brass pulls
  addCyl(g, brass, 0.007, 0.007, 0.11, -0.16, footH + bodyH*0.55, D/2 + 0.012, {rotX:Math.PI/2, seg:10});
  addCyl(g, brass, 0.007, 0.007, 0.11,  0.16, footH + bodyH*0.55, D/2 + 0.012, {rotX:Math.PI/2, seg:10});
  // solid teak framed cat-flap portal on the left side, with brass hinge pins
  const pw = 0.22, ph = 0.26;
  addBox(g, teak, 0.02, ph + 0.06, pw + 0.06, -W/2 - 0.005, footH + 0.08 + (ph+0.06)/2, 0);
  addBox(g, mats.edge || teak, 0.012, ph, 0.03, -W/2 - 0.012, footH + 0.11 + ph/2, -pw/2 + 0.02, {cast:false});
  // flap leaf (teak)
  addBox(g, teak, 0.014, ph - 0.02, pw - 0.04, -W/2 - 0.022, footH + 0.12 + (ph-0.02)/2, 0.01);
  addCyl(g, brass, 0.006, 0.006, 0.03, -W/2 - 0.022, footH + 0.12 + ph - 0.02, -pw/2 + 0.04, {rotX:Math.PI/2, seg:8});
  addCyl(g, brass, 0.006, 0.006, 0.03, -W/2 - 0.022, footH + 0.12 + ph - 0.02,  pw/2 - 0.04, {rotX:Math.PI/2, seg:8});
  g.userData.along = W;
  g.userData.depth = D;
  g.userData.pieceH = H + 0.04;
  placeDefault(g);
}

function addTube(parent, mat, pts, radius, tubular=28, radial=10) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, tubular, radius, radial, false), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addCatTree(parent, garden) {
  const grand = state.elements.cattree.variant === 'grand';
  const g = tagFurn(new THREE.Group(), 'cattree');
  parent.add(g);
  const oak = mats.oak;
  const felt = mats.felt;
  const H = grand ? 1.92 : 1.55;
  const s = H / 1.92;
  // circular oak plinth so the trunk never sinks below the floor
  addCyl(g, oak, 0.22*s, 0.24*s, 0.07, 0, 0.035, 0, {seg:20});
  addCyl(g, oak, 0.07, 0.055, 0.08, 0.01, 0.1, 0.01, {seg:14});
  // curved solid-oak trunk — no foliage
  addTube(g, oak, [
    [0.00, 0.10, 0.00],
    [0.05, 0.48*s, 0.04],
    [-0.06, 0.95*s, -0.03],
    [0.04, 1.38*s, 0.05],
    [0.00, 1.78*s, 0.02],
    [-0.02, H, 0.00],
  ], 0.052 * s, 36, 12);
  // organic forked branches
  addTube(g, oak, [
    [-0.02, 1.12*s, 0.00],
    [-0.20, 1.28*s, -0.08],
    [-0.36, 1.42*s, -0.06],
    [-0.46, 1.52*s, 0.03],
  ], 0.028 * s, 24, 10);
  addTube(g, oak, [
    [0.02, 1.22*s, 0.02],
    [0.22, 1.36*s, 0.10],
    [0.38, 1.52*s, 0.14],
    [0.46, 1.68*s, 0.08],
  ], 0.026 * s, 24, 10);
  addTube(g, oak, [
    [0.00, 1.48*s, 0.00],
    [-0.10, 1.64*s, -0.22],
    [-0.08, 1.78*s, -0.40],
    [0.04, 1.82*s, -0.52],
  ], 0.022 * s, 20, 10);
  addTube(g, oak, [
    [0.01, 1.55*s, 0.02],
    [0.18, 1.70*s, -0.16],
    [0.22, 1.82*s, -0.28],
  ], 0.018 * s, 16, 8);
  // 4 round solid-oak pods / nacelles lined with cream wool felt
  const pods = grand
    ? [[-0.44, 1.50*s, 0.05, 0.14], [0.42, 1.62*s, 0.08, 0.13], [-0.05, 1.78*s, -0.40, 0.12], [0.16, 1.80*s, -0.22, 0.11]]
    : [[-0.38, 1.22, 0.04, 0.12], [0.36, 1.32, 0.07, 0.12], [-0.04, 1.42, -0.32, 0.11]];
  pods.forEach(([x,y,z,r]) => {
    const shell = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), oak);
    shell.scale.set(1, 0.52, 1);
    shell.position.set(x, y, z);
    shell.castShadow = true; shell.receiveShadow = true;
    g.add(shell);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.78, r * 0.78, 0.03, 20), felt);
    pad.position.set(x, y + r * 0.52 * 0.85, z);
    pad.castShadow = false; pad.receiveShadow = true;
    g.add(pad);
  });
  g.userData.along = 1.4 * s;
  g.userData.depth = 1.1 * s;
  g.userData.pieceH = H + 0.08;
  placeDefault(g);
}

function addSofa(parent, garden) {
  const { w, d } = dim();
  const grand = state.elements.sofa.variant === 'grand';
  const g = tagFurn(new THREE.Group(), 'sofa');
  const SW = grand ? Math.min(2.45, w*0.48) : Math.min(1.85, w*0.4);
  const SD = grand ? 0.92 : 0.8;
  const rugW = SW + 0.7, rugD = SD + 1.05;
  if (state.elements.sofa.place === 'left') {
    g.position.set(-w/2 + 1.30, 0, d/2 - (SW/2 + 0.28));
    g.rotation.y = Math.PI/2;
  } else if (garden) {
    const terraceD = d * 0.48;
    g.position.set(0.1, 0, -d/2 + terraceD * 0.84);
  } else {
    g.position.set(0.1, 0, Math.max(d * 0.16, d/2 - 1.15));
  }
  parent.add(g);
  addBox(g, mats.rug, rugW, 0.025, rugD, 0, 0.02, 0.1, {cast:false, ignoreBounds:true});
  if (garden) {
    addBox(g, mats.cedar, SW, 0.12, SD, 0, 0.14, 0);
    addBox(g, mats.linen, SW-0.1, 0.08, SD-0.1, 0, 0.22, 0);
    addBox(g, mats.cedar, SW, 0.45, 0.08, 0, 0.4, -SD/2+0.04);
    addPillow(g, mats.cushion, 0.38, 0.16, 0.32, -SW*0.26, 0.36, 0.06, 0.25);
    addPillow(g, mats.pillowIvory, 0.36, 0.15, 0.3,  SW*0.26, 0.35, 0.07, -0.2);
  } else {
    addBox(g, mats.velvet, SW, 0.38, SD, 0, 0.28, 0);
    addBox(g, mats.velvet, SW-0.12, 0.12, SD-0.16, 0, 0.5, 0.04);
    addBox(g, mats.velvet, SW, 0.48, 0.16, 0, 0.62, -SD/2+0.08);
    addBox(g, mats.velvet, 0.16, 0.46, SD, -SW/2+0.08, 0.48, 0);
    addBox(g, mats.velvet, 0.16, 0.46, SD,  SW/2-0.08, 0.48, 0);
    addPillow(g, mats.cushion, 0.42, 0.2, 0.34, -SW*0.2, 0.62, 0.12, 0.35);
    addPillow(g, mats.pillowIvory, 0.4, 0.18, 0.32,  SW*0.18, 0.61, 0.14, -0.28);
    // floor lamp
    addCyl(g, mats.metal, 0.12, 0.14, 0.03, SW/2+0.28, 0.03, -0.1, {seg:16});
    addCyl(g, mats.metal, 0.015, 0.015, 1.42, SW/2+0.28, 0.74, -0.1, {seg:10});
    const shadeMat = mats.linen.clone();
    shadeMat.emissive = new THREE.Color(0xffe0b0);
    shadeMat.emissiveIntensity = 0.45;
    addCyl(g, shadeMat, 0.16, 0.22, 0.22, SW/2+0.28, 1.5, -0.1, {seg:16});
  }
}

/* ---------- lights ---------- */
function placeLights() {
  const { w, d, h, isGarden } = dim();
  lights.hemi.intensity = isGarden ? 1.15 : 1.18;
  lights.sun.intensity = isGarden ? 2.85 : 2.9;
  lights.sun.position.set(w * 0.2, h * 1.4, isGarden ? d * 0.6 : -d/2 - 3.2);
  lights.sun.target.position.set(0, 0.2, isGarden ? 0 : -d * 0.1);
  lights.sun.target.updateMatrixWorld();
  if (lights.fill) {
    lights.fill.position.set(w * 0.85, h * 1.15, d * 0.95);
    lights.fill.intensity = isGarden ? 0.55 : 1.05;
  }
  const shadowSpan = Math.max(w, d) * 0.7;
  const cam = lights.sun.shadow.camera;
  cam.left = cam.bottom = -shadowSpan;
  cam.right = cam.top = shadowSpan;
  cam.near = 0.5; cam.far = Math.max(w,d,h)*4 + 6;
  cam.updateProjectionMatrix();
  lights.sconceL.position.set(-w/2 + 0.18, 1.55, d*0.18);
  lights.sconceL2.position.set(-w/2 + 0.18, 1.55, -d*0.12);
  lights.sconceB.position.set(w*0.28, 1.55, -d/2 + 0.18);
  lights.lamp.position.set(w*0.28, isGarden ? 1.2 : 1.48, d*0.05);
  const interior = !isGarden;
  lights.sconceL.intensity = interior ? 1.45 : 0.35;
  lights.sconceL2.intensity = interior ? 1.2 : 0.25;
  lights.sconceB.intensity = interior ? 1.3 : 0.2;
  lights.lamp.intensity = interior ? 1.65 : 0.4;
  lights.sconceL.visible = lights.sconceL2.visible = lights.sconceB.visible = lights.lamp.visible = true;
}

function rebuild() {
  _wallPlan = null;
  buildMaterials();
  clearWorld();
  const { isGarden } = dim();
  // large shadow-catching ground
  const { w, d } = dim();
  addBox(world, mats.ground, Math.max(14, w*3), 0.02, Math.max(14, d*3), 0, -0.13, 0, {cast:false});
  if (isGarden) buildGardenShell();
  else buildInteriorShell();
  furnRoot = new THREE.Group();
  world.add(furnRoot);
  if (state.elements.catwall.on) addCatWall(furnRoot, isGarden);
  if (state.elements.cattree && state.elements.cattree.on) addCatTree(furnRoot, isGarden);
  if (state.elements.alcove.on) addAlcove(furnRoot, isGarden);
  if (state.elements.dining.on) addDining(furnRoot, isGarden);
  if (state.elements.litter.on) addLitter(furnRoot, isGarden);
  if (state.elements.sofa.on) addSofa(furnRoot, isGarden);
  allFurn().forEach((g) => { ensurePickProxies(g); applyPose(g, false); });
  placeLights();
  applyView(state.view === 'reset' ? 'perspective' : state.view);
  updateReadouts();
  syncLabels();
  renderLayers();
  updateSelectionVisual();
  updatePlanOverlay();
}

/* ---------- camera ---------- */
function sizeCameras() {
  const el = stage();
  const aspect = Math.max(0.5, el.clientWidth / Math.max(1, el.clientHeight));
  persp.aspect = aspect;
  persp.updateProjectionMatrix();
  const { w, d } = dim();
  const span = Math.max(w, d) * 0.78;
  ortho.left = -span * aspect;
  ortho.right = span * aspect;
  ortho.top = span;
  ortho.bottom = -span;
  ortho.near = 0.1;
  ortho.far = 80;
  ortho.updateProjectionMatrix();
}

function applyView(kind) {
  const { w, d, h } = dim();
  if (kind === 'reset') kind = 'perspective';
  state.view = kind;
  sizeCameras();
  const stageEl = stage();
  if (kind === 'plan') {
    camera = ortho;
    ortho.position.set(0, Math.max(h * 4, 12), 0.0001);
    ortho.up.set(0, 0, -1);
    ortho.lookAt(0, 0, 0);
    controls.object = camera;
    controls.enableRotate = false;
    controls.enablePan = true;
    controls.target.set(0, 0, 0);
    stageEl.classList.add('is-plan');
  } else {
    camera = persp;
    controls.object = camera;
    persp.up.set(0, 1, 0);
    stageEl.classList.remove('is-plan');
    if (kind === 'elevation') {
      persp.position.set(0, h * 0.58, d / 2 + Math.max(d, w) * 0.65);
      controls.target.set(0, h * 0.42, 0);
      controls.enableRotate = false;
    } else {
      persp.position.set(w * 0.58, h * 0.98, d * 0.78);
      controls.target.set(0, h * 0.36, -d * 0.06);
      controls.enableRotate = true;
    }
    persp.lookAt(controls.target);
  }
  controls.minPolarAngle = 0.06;
  controls.maxPolarAngle = Math.PI / 2 - 0.09;
  controls.minDistance = Math.max(2.0, Math.min(w, d) * 0.4);
  controls.maxDistance = Math.max(w, d, h) * 2.6;
  controls.update();
  document.querySelectorAll('[data-view]').forEach((btn) => {
    const v = btn.getAttribute('data-view');
    btn.setAttribute('aria-pressed', String(v === state.view));
  });
  updatePlanOverlay();
  updateSelectionVisual();
}

/* ---------- quantities & brief ---------- */
function quantities() {
  const { w, d, h, isGarden, ceiling, enclosure } = dim();
  const floor = w * d;
  const winW = isGarden ? 0 : Math.min(2.15, w * 0.4);
  const winH = isGarden ? 0 : Math.min(1.65, h * 0.58);
  const windowA = winW * winH;
  const wallH = isGarden ? enclosure : ceiling;
  const netWall = Math.max(0, 2 * (w + d) * wallH - windowA);
  const dado = (!isGarden && state.elements.panelling.on) ? (state.elements.panelling.variant === 'tall' ? 1.18 : 0.92) : 0;
  const paperArea = isGarden ? 0 : Math.max(0, 2 * (w + d) * (wallH - dado) - windowA);
  const terrace = isGarden ? w * d * 0.48 : 0;
  const flooring = (isGarden ? terrace : floor) * 1.10;
  const liters = netWall * 2 / 10;
  const gallons = liters * L2GAL;
  const rolls = paperArea > 0 ? Math.ceil(paperArea * 1.10 / 5.3) : 0;
  return { w, d, h, floor, netWall, flooring, liters, gallons, rolls, paperArea, windowA, terrace, isGarden, wallH };
}

function schedule() {
  const rows = [];
  const garden = dim().isGarden;
  for (const [key, el] of Object.entries(state.elements)) {
    if (!el.on) continue;
    const name = garden ? GARDEN_NAMES[key] : EL_NAMES[key];
    const magnet = MAGNET[key];
    const place = key === 'panelling' ? (garden ? 'Both enclosure sides' : 'Both walls') :
                  magnet === 'wall' ? (el.pose && el.pose.wall ? wallPlaceName(el.pose.wall, garden) :
                    (el.place === 'left' ? (garden ? 'Left fence' : 'West wall') : (garden ? 'Back fence' : 'North wall'))) :
                  el.place === 'left' ? (garden ? 'Toward the left fence' : 'Toward the left wall') :
                  el.place === 'back' ? (garden ? 'Toward the back fence' : 'Toward the back wall') :
                  (garden ? 'On the terrace' : 'On the floor');
    const variant = el.variant.charAt(0).toUpperCase() + el.variant.slice(1);
    const meas = elementMeasure(key, el.variant, garden);
    rows.push({ key, name, place, variant, meas });
  }
  return rows;
}

function elementMeasure(key, variant, garden) {
  const grand = variant === 'grand' || variant === 'tall';
  const table = {
    catwall: garden ? (grand ? '1.15 × 0.70 m · 1.25 m high, wall-mounted' : '1.15 × 0.70 m · 1.05 m high, wall-mounted') : (grand ? 'Shelves 1.15 m · 1.55 m high, wall-mounted' : 'Shelves 0.90 m · 1.25 m high, wall-mounted'),
    alcove: garden ? (grand ? '1.85 × 0.85 × 0.92 m' : '1.40 × 0.85 × 0.82 m') : (grand ? '1.85 × 0.46 × 0.92 m' : '1.40 × 0.46 × 0.82 m'),
    dining: garden ? (grand ? '1.15 × 0.50 × 0.22 m' : '0.88 × 0.42 × 0.22 m') : (grand ? '1.15 × 0.50 × 0.17 m' : '0.88 × 0.42 × 0.17 m'),
    litter: garden ? (grand ? '1.12 × 0.62 × 0.46 m · teak, glass, ceramic' : '0.94 × 0.54 × 0.46 m · teak, glass, ceramic') : (grand ? '1.12 × 0.62 × 0.46 m · teak, tempered glass, ceramic basin' : '0.94 × 0.54 × 0.46 m · teak, tempered glass, ceramic basin'),
    cattree: grand ? 'Sculptural oak tree 1.92 m · four wool-felt oak pods' : 'Sculptural oak tree 1.55 m · three wool-felt oak pods',
    sofa: garden ? (grand ? 'Daybed up to 2.45 m · rug +0.70 m' : 'Daybed up to 1.85 m · rug +0.70 m') : (grand ? 'Sofa up to 2.45 m · rug +0.70 m' : 'Sofa up to 1.85 m · rug +0.70 m'),
    panelling: garden ? 'Cedar screen to enclosure height · stone border 0.22 m' : (grand ? 'Tall dado 1.18 m + linen-hemp wallcovering above' : 'Classic dado 0.92 m + linen-hemp wallcovering above'),
  };
  return table[key];
}

function qtyRows(q) {
  const rows = [
    ['Floor area', fmtArea(q.floor)],
    [q.isGarden ? 'Enclosure wall area (net)' : 'Net wall area', fmtArea(q.netWall)],
  ];
  if (q.isGarden) {
    rows.push(['Terrace pavers, +10% cutting margin', fmtArea(q.flooring)]);
    rows.push(['Lawn (remainder of the plot)', fmtArea(q.floor - q.terrace)]);
  } else {
    rows.push(['Flooring, +10% cutting margin', fmtArea(q.flooring)]);
  }
  rows.push(['Paint, 2 coats (10 m²/L per coat)', `${q.liters.toFixed(1)} L · ${q.gallons.toFixed(1)} US gal`]);
  if (!q.isGarden) rows.push(['Linen-hemp wallcovering rolls (5.3 m² + 10% match)', `${q.rolls} roll${q.rolls===1?'':'s'}`]);
  else if (state.elements.panelling.on) rows.push(['Cedar privacy screen', `Enclosure ${fmtLen(q.wallH)} on two principal sides`]);
  return rows;
}

function fillDl(el, rows) {
  el.innerHTML = rows.map(([dt,dd]) => `<dt>${dt}</dt><dd>${dd}</dd>`).join('');
}

function updateReadouts() {
  const q = quantities();
  const { name } = dim();
  const ceilLabel = q.isGarden ? `enclosure ${fmtLen(q.wallH)}` : `ceiling ${fmtLen(q.h)}`;
  document.getElementById('st-dim-readout').textContent =
    `${name} · ${state.size} · ${fmtLen(q.w)} × ${fmtLen(q.d)} · ${ceilLabel} · ${fmtArea(q.floor)}`;
  fillDl(document.getElementById('st-calc-dl'), qtyRows(q));
  document.getElementById('st-schedule').innerHTML = schedule().map((r) =>
    `<li><strong>${r.name}</strong> — ${r.variant}, ${r.place}. ${r.meas}</li>`
  ).join('') || '<li>No pet-architecture elements are currently active.</li>';
}

function syncLabels() {
  const garden = dim().isGarden;
  const pack = garden ? NOTES.garden : NOTES.interior;
  document.querySelectorAll('[data-el-note]').forEach((p) => {
    p.textContent = pack[p.getAttribute('data-el-note')] || '';
  });
  const press = (sel, val) => {
    document.querySelectorAll(sel).forEach((btn) => {
      const key = Object.keys(btn.dataset)[0];
      const v = btn.getAttribute(`data-${Object.keys(btn.dataset)[0]}`);
      // handled per group below
    });
  };
  document.querySelectorAll('[data-space]').forEach((b)=>b.setAttribute('aria-pressed', String(b.dataset.space===state.space)));
  document.querySelectorAll('[data-size]').forEach((b)=>b.setAttribute('aria-pressed', String(b.dataset.size===state.size)));
  document.querySelectorAll('[data-units]').forEach((b)=>b.setAttribute('aria-pressed', String(b.dataset.units===state.units)));
  document.querySelectorAll('[data-theme]').forEach((b)=>b.setAttribute('aria-pressed', String(b.dataset.theme===state.theme)));
  document.querySelectorAll('[data-toggle]').forEach((b)=>{
    const on = state.elements[b.dataset.toggle].on;
    b.setAttribute('aria-pressed', String(on));
    b.textContent = on ? 'On' : 'Off';
    b.closest('.st-el')?.classList.toggle('is-off', !on);
  });
}

function planSvg() {
  const q = quantities();
  const { w, d, isGarden } = q;
  const W = 420, H = 260, pad = 28;
  const sx = (W - pad*2) / w, sy = (H - pad*2) / d;
  const s = Math.min(sx, sy);
  const ox = (W - w*s)/2, oy = (H - d*s)/2;
  const X = (x) => ox + (x + w/2) * s;
  const Y = (z) => oy + (z + d/2) * s;
  const gold = '#C9A96E';
  let fur = '';
  schedule().forEach((row, i) => {
    // schematic footprints, not exact — a small annotated tick per element
  });
  // furniture footprints (schematic)
  const boxes = [];
  if (state.elements.sofa.on) boxes.push({x:0.15,z: isGarden ? -d/2+d*0.28 : d*0.12, w:2.2, d:1.4, label:'Sofa / Daybed'});
  let svg = `<svg viewBox="0 0 ${W} ${H+70}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Plan and elevation schematic">
    <rect x="${X(-w/2)}" y="${Y(-d/2)}" width="${w*s}" height="${d*s}" fill="#0b1325" stroke="${gold}" stroke-width="1.5"/>
    ${isGarden?'':`<rect x="${X(-Math.min(2.15,w*0.4)/2)}" y="${Y(-d/2)-3}" width="${Math.min(2.15,w*0.4)*s}" height="6" fill="${gold}" />`}
    <text x="${W/2}" y="${oy-8}" text-anchor="middle" fill="${gold}" font-size="11" font-family="Inter, system-ui" letter-spacing="1.5">PLAN · ${fmtLen(w)} × ${fmtLen(d)}</text>`;
  boxes.forEach((b)=>{
    svg += `<rect x="${X(b.x-b.w/2)}" y="${Y(b.z-b.d/2)}" width="${b.w*s}" height="${b.d*s}" fill="rgba(201,169,110,0.18)" stroke="${gold}" stroke-width="0.8"/>`;
  });
  // elevation
  const eY = H + 8, eH = 56, eh = (eH-8);
  const scaleH = eh / Math.max(q.wallH, 0.1);
  svg += `<text x="${W/2}" y="${eY+8}" text-anchor="middle" fill="${gold}" font-size="11" font-family="Inter, system-ui" letter-spacing="1.5">ELEVATION · ${q.isGarden?'enclosure':'ceiling'} ${fmtLen(q.wallH)}</text>
    <rect x="${X(-w/2)}" y="${eY+14 + eh - q.wallH*scaleH}" width="${w*s}" height="${q.wallH*scaleH}" fill="#101A30" stroke="${gold}" stroke-width="1"/>`;
  if (!isGarden) {
    const winW=Math.min(2.15,w*0.4), winH=Math.min(1.65,q.h*0.58), sill=0.88;
    svg += `<rect x="${X(-winW/2)}" y="${eY+14 + eh - (sill+winH)*scaleH}" width="${winW*s}" height="${winH*scaleH}" fill="rgba(207,228,255,0.35)" stroke="${gold}" stroke-width="0.7"/>`;
  }
  svg += `</svg>`;
  return svg;
}

function openBrief() {
  const q = quantities();
  const { name } = dim();
  document.getElementById('st-brief-room').textContent =
    `${name}, size ${state.size}. ${fmtLen(q.w)} × ${fmtLen(q.d)}, ${q.isGarden ? 'enclosure' : 'ceiling'} ${fmtLen(q.wallH)}. Floor area ${fmtArea(q.floor)}. Theme: ${THEME[state.theme].name}.`;
  document.getElementById('st-brief-plan').innerHTML = planSvg();
  fillDl(document.getElementById('st-brief-qty'), qtyRows(q));
  document.getElementById('st-brief-sched').innerHTML = schedule().map((r) =>
    `<li><strong>${r.name}</strong> — ${r.variant}, ${r.place}. ${r.meas}</li>`
  ).join('') || '<li>No pet-architecture elements are currently active.</li>';
  renderer.render(scene, camera);
  const snap = document.getElementById('st-brief-snap');
  snap.src = renderer.domElement.toDataURL('image/jpeg', 0.86);
  const modal = document.getElementById('st-brief');
  modal.hidden = false;
  document.getElementById('st-close-brief').focus();
}
function closeBrief() {
  document.getElementById('st-brief').hidden = true;
}

/* ---------- init ---------- */

function aabbOf(obj, opts) {
  const forPick = !!(opts && opts.forPick);
  obj.updateWorldMatrix(true, true);
  const box = new THREE.Box3();
  let found = false;
  obj.traverse((child) => {
    if (!child.isMesh) return;
    if (child.userData.pickProxy) return;
    if (child.userData.ignoreBounds && !forPick) return;
    const b = new THREE.Box3().setFromObject(child);
    if (!found) { box.copy(b); found = true; }
    else box.union(b);
  });
  if (!found) box.setFromObject(obj);
  return box;
}
function boxOverlap(a, b, pad=0.03) {
  return (a.min.x < b.max.x - pad && a.max.x > b.min.x + pad &&
          a.min.y < b.max.y - pad && a.max.y > b.min.y + pad &&
          a.min.z < b.max.z - pad && a.max.z > b.min.z + pad);
}
function auditCalc() {
  const q = quantities();
  const issues = [];
  const floor = q.w * q.d;
  if (Math.abs(floor - q.floor) > 1e-9) issues.push(`floor area ${q.floor} != ${q.w}*${q.d}`);
  const sq = floor * M2SQFT;
  const prev = state.units;
  state.units = 'm';
  const mLabel = fmtArea(q.floor, 1);
  state.units = 'ft';
  const ftLabel = fmtArea(q.floor, 1);
  state.units = prev;
  const expectedFt = (q.floor * M2SQFT).toFixed(1) + ' sq ft';
  if (ftLabel !== expectedFt) issues.push(`sq ft label ${ftLabel} != ${expectedFt}`);
  const expectedM = q.floor.toFixed(1) + ' m²';
  if (mLabel !== expectedM) issues.push(`m² label ${mLabel} != ${expectedM}`);
  const base = q.isGarden ? q.terrace : q.floor;
  if (Math.abs(base * 1.10 - q.flooring) > 1e-9) issues.push(`flooring +10% ${q.flooring} != ${base}*1.10`);
  const liters = q.netWall * 2 / 10;
  if (Math.abs(liters - q.liters) > 1e-9) issues.push(`paint liters ${q.liters} != ${liters}`);
  const gal = liters * L2GAL;
  if (Math.abs(gal - q.gallons) > 1e-9) issues.push(`paint gallons ${q.gallons} != ${gal}`);
  const rolls = q.paperArea > 0 ? Math.ceil(q.paperArea * 1.10 / 5.3) : 0;
  if (rolls !== q.rolls) issues.push(`wallpaper rolls ${q.rolls} != ${rolls}`);
  return { ok: issues.length === 0, issues, q: { w:q.w, d:q.d, floor:q.floor, flooring:q.flooring, liters:q.liters, gallons:q.gallons, rolls:q.rolls, netWall:q.netWall, paperArea:q.paperArea, terrace:q.terrace } };
}
function auditGeometry() {
  const { w, d, h, isGarden } = dim();
  const issues = [];
  const furnishings = [];
  world.traverse((o) => {
    if (o.userData && o.userData.role === 'furniture') furnishings.push(o);
  });
  const boxes = furnishings.map((o) => {
    const b = aabbOf(o);
    return { id: o.userData.id, min:{x:b.min.x,y:b.min.y,z:b.min.z}, max:{x:b.max.x,y:b.max.y,z:b.max.z}, box:b };
  });
  const floorTop = 0.0;
  const slabPad = isGarden ? 0.25 : 0.12; // slight overhang of pavers/fence posts OK
  for (const it of boxes) {
    if (it.min.y < -0.06) issues.push(`${it.id} sinks below the floor (ymin=${it.min.y.toFixed(3)})`);
    // floor-standing pieces should meet the floor
    if (['alcove','dining','litter','sofa','cattree'].includes(it.id) && it.min.y > 0.12) {
      issues.push(`${it.id} floats above the floor (ymin=${it.min.y.toFixed(3)})`);
    }
    if (it.min.x < -w/2 - slabPad) issues.push(`${it.id} passes through the left wall (xmin=${it.min.x.toFixed(3)}, bound=${(-w/2).toFixed(3)})`);
    if (it.min.z < -d/2 - slabPad) issues.push(`${it.id} passes through the back wall (zmin=${it.min.z.toFixed(3)}, bound=${(-d/2).toFixed(3)})`);
    if (it.max.x > w/2 + slabPad + 0.2) issues.push(`${it.id} overruns the open right edge (xmax=${it.max.x.toFixed(3)})`);
    if (it.max.z > d/2 + slabPad + 0.25) issues.push(`${it.id} overruns the open front edge (zmax=${it.max.z.toFixed(3)})`);
  }
  for (let i=0;i<boxes.length;i++) {
    for (let j=i+1;j<boxes.length;j++) {
      const A=boxes[i], B=boxes[j];
      // sofa sits on its own rug; ignore sofa overlaps with nothing else of the same group
      if (boxOverlap(A.box, B.box, 0.04)) {
        issues.push(`${A.id} overlaps ${B.id}`);
      }
    }
  }
  return {
    ok: issues.length === 0,
    issues,
    count: boxes.length,
    boxes: boxes.map(({id,min,max})=>({id,min,max})),
  };
}


/* ---------- V1.5 interaction: poses, snap, layers, 2D plan, pointers ---------- */
function wallPlaceName(wall, garden) {
  const g = {
    west: garden ? 'Left fence' : 'West wall',
    east: garden ? 'Right fence' : 'East wall',
    north: garden ? 'Back fence' : 'North wall',
    south: garden ? 'Front edge' : 'South edge',
  };
  return g[wall] || wall;
}
function innerBounds() {
  const { w, d } = dim();
  const pad = 0.05;
  return { x0: -w/2 + pad, x1: w/2 - pad, z0: -d/2 + pad, z1: d/2 - pad, w, d, pad };
}
function pieceTitle(id) {
  return (dim().isGarden ? GARDEN_NAMES : EL_NAMES)[id] || id;
}
function savePose(obj) {
  const el = state.elements[obj.userData.id];
  if (!el) return;
  el.pose = {
    x: obj.position.x, y: obj.position.y, z: obj.position.z,
    rotY: obj.rotation.y, wall: obj.userData.wall || null,
  };
}
function defaultPosition(id) {
  const { w, d, isGarden } = dim();
  const el = state.elements[id];
  const magnet = MAGNET[id] || 'floor';
  if (id === 'cattree') {
    if (el.place === 'left') return { x: -w/2 + 1.05, y: 0, z: isGarden ? d * 0.22 : -d * 0.02, rotY: 0 };
    if (isGarden) {
      const terraceD = d * 0.48;
      return { x: w * 0.22, y: 0, z: -d/2 + terraceD + 0.95, rotY: 0 };
    }
    return { x: -0.05, y: 0, z: -d * 0.10, rotY: 0 };
  }
  if (id === 'litter') {
    if (el.place === 'left') return { x: -w/2 + 0.85, y: 0, z: isGarden ? 0.2 : d * 0.05, rotY: 0 };
    return { x: w/2 - 0.70, y: 0, z: -d/2 + 0.70, rotY: 0 };
  }
  return null; // other pieces keep the position set by their builders
}
function placeDefault(g) {
  const pos = defaultPosition(g.userData.id);
  if (pos) {
    g.position.set(pos.x, pos.y, pos.z);
    g.rotation.y = pos.rotY;
  }
}
function clampFloorItem(obj, magnetSnap=true) {
  obj.position.y = 0;
  obj.updateWorldMatrix(true, true);
  const b = aabbOf(obj);
  const bnd = innerBounds();
  let dx = 0, dz = 0;
  if (b.min.x < bnd.x0) dx += bnd.x0 - b.min.x;
  if (b.max.x > bnd.x1) dx += bnd.x1 - b.max.x;
  if (b.min.z < bnd.z0) dz += bnd.z0 - b.min.z;
  if (b.max.z > bnd.z1) dz += bnd.z1 - b.max.z;
  obj.position.x += dx;
  obj.position.z += dz;
  if (magnetSnap) {
    obj.updateWorldMatrix(true, true);
    const b2 = aabbOf(obj);
    const gaps = {
      west: b2.min.x - bnd.x0,
      east: bnd.x1 - b2.max.x,
      north: b2.min.z - bnd.z0,
      south: bnd.z1 - b2.max.z,
    };
    let best = null, bestG = 0.22;
    for (const [side, gap] of Object.entries(gaps)) {
      if (gap >= -0.001 && gap <= bestG) { best = side; bestG = gap; }
    }
    if (best && bestG > 0.002) {
      if (best === 'west') obj.position.x -= bestG;
      if (best === 'east') obj.position.x += bestG;
      if (best === 'north') obj.position.z -= bestG;
      if (best === 'south') obj.position.z += bestG;
    }
  }
  obj.position.y = 0;
}
function wallInset(obj, wall) {
  const { w, d } = dim();
  obj.updateWorldMatrix(true, true);
  const b = aabbOf(obj);
  // depth from group origin to the outward face after current rotation is messy;
  // use half the AABB span along the wall-normal, plus a hair.
  if (wall === 'west' || wall === 'east') return (b.max.x - b.min.x) / 2 + 0.02;
  return (b.max.z - b.min.z) / 2 + 0.02;
}
function wallYClamp(obj, y) {
  const { h } = dim();
  const pieceH = obj.userData.pieceH || Math.max(0.4, (aabbOf(obj).max.y - aabbOf(obj).min.y));
  const yMin = 0.35;
  const yMax = Math.max(yMin, h - pieceH - 0.15);
  return Math.min(yMax, Math.max(yMin, y));
}
function snapWallItem(obj, x, z, y) {
  const { w, d } = dim();
  const wall = nearestWall(x, z);
  obj.userData.wall = wall;
  const rot = { west: Math.PI/2, east: -Math.PI/2, north: 0, south: Math.PI }[wall];
  obj.rotation.y = rot;
  // measure along-wall half-span and depth after rotation
  obj.position.set(0, 0, 0);
  obj.updateWorldMatrix(true, true);
  const local = aabbOf(obj);
  const along = (wall === 'west' || wall === 'east') ? (local.max.z - local.min.z) / 2 : (local.max.x - local.min.x) / 2;
  const depth = (wall === 'west' || wall === 'east') ? (local.max.x - local.min.x) / 2 : (local.max.z - local.min.z) / 2;
  const inset = depth + 0.03;
  const margin = along + 0.08;
  let nx = x, nz = z;
  if (wall === 'west') { nx = -w/2 + inset; nz = clampNum(z, -d/2 + margin, d/2 - margin); }
  if (wall === 'east') { nx =  w/2 - inset; nz = clampNum(z, -d/2 + margin, d/2 - margin); }
  if (wall === 'north'){ nz = -d/2 + inset; nx = clampNum(x, -w/2 + margin, w/2 - margin); }
  if (wall === 'south'){ nz =  d/2 - inset; nx = clampNum(x, -w/2 + margin, w/2 - margin); }
  obj.position.set(nx, wallYClamp(obj, y == null ? (obj.position.y || 0.35) : y), nz);
  obj.rotation.y = rot;
}
function nearestWall(x, z) {
  const { w, d } = dim();
  const dists = {
    west:  Math.abs(x - (-w/2)),
    east:  Math.abs(x - ( w/2)),
    north: Math.abs(z - (-d/2)),
    south: Math.abs(z - ( d/2)),
  };
  return Object.entries(dists).sort((a,b) => a[1] - b[1])[0][0];
}
function clampNum(v, a, b) { return Math.min(b, Math.max(a, v)); }

function applyPose(obj, write=false) {
  const id = obj.userData.id;
  const el = state.elements[id];
  if (!el) return;
  obj.visible = el.visible !== false;
  const magnet = MAGNET[id] || 'floor';
  obj.userData.magnet = magnet;
  if (el.pose) {
    obj.position.set(el.pose.x, el.pose.y, el.pose.z);
    obj.rotation.y = el.pose.rotY;
    if (el.pose.wall) obj.userData.wall = el.pose.wall;
  } else if (magnet === 'wall') {
    obj.position.y = 0.35;
    obj.userData.wall = (el.place === 'left') ? 'west' : 'north';
  }
  if (magnet === 'floor') clampFloorItem(obj, !el.pose);
  else snapWallItem(obj, obj.position.x, obj.position.z, el.pose ? el.pose.y : 0.35);
  if (write) savePose(obj);
}

function clientToFloor(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect();
  ndc.x = ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
  ndc.y = -((clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hit = new THREE.Vector3();
  if (!raycaster.ray.intersectPlane(floorPlane, hit)) {
    // ortho looking straight down already intersects; fallback
    const p = new THREE.Vector3(ndc.x, ndc.y, 0).unproject(camera);
    hit.set(p.x, 0, p.z);
  }
  hit.y = 0;
  return hit;
}
function worldToClient(x, y, z) {
  const v = new THREE.Vector3(x, y, z).project(camera);
  const r = renderer.domElement.getBoundingClientRect();
  return { x: r.left + (v.x * 0.5 + 0.5) * r.width, y: r.top + (-v.y * 0.5 + 0.5) * r.height };
}
function pickFurniture(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect();
  ndc.x = ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
  ndc.y = -((clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const meshes = [];
  allFurn().forEach((g) => {
    if (!g.visible) return;
    g.traverse((o) => { if (o.isMesh) meshes.push(o); });
  });
  const hits = raycaster.intersectObjects(meshes, false);
  if (!hits.length) return null;
  const nearest = hits[0].distance;
  const preferred = hits.find((h) => h.object.userData.pickProxy && h.distance <= nearest + 0.02) || hits[0];
  let obj = preferred.object;
  while (obj && obj.userData.role !== 'furniture') obj = obj.parent;
  return obj || null;
}

function selectPiece(id) {
  if (id && (!state.elements[id] || !state.elements[id].on || MAGNET[id] == null && id === 'panelling')) {
    if (id === 'panelling') { state.selected = 'panelling'; selectedObj = null; renderLayers(); refreshLayerTools(); updateSelectionVisual(); return; }
  }
  state.selected = id;
  selectedObj = id ? furnById(id) : null;
  renderLayers();
  refreshLayerTools();
  updateSelectionVisual();
}
function setVisible(id, v) {
  const el = state.elements[id];
  if (!el) return;
  el.visible = v;
  const obj = furnById(id);
  if (obj) obj.visible = v;
  if (id === 'panelling' && world) rebuild();
  else { renderLayers(); updateSelectionVisual(); updatePlanOverlay(); }
}
function setLocked(id, v) {
  const el = state.elements[id];
  if (!el) return;
  el.locked = v;
  renderLayers();
}
function rotateSelected(deg) {
  const obj = selectedObj || furnById(state.selected);
  if (!obj || !state.elements[obj.userData.id] || state.elements[obj.userData.id].locked) return;
  if ((MAGNET[obj.userData.id] || 'floor') === 'wall') return;
  obj.rotation.y += (deg * Math.PI) / 180;
  clampFloorItem(obj, true);
  savePose(obj);
  updateSelectionVisual();
  updatePlanOverlay();
  refreshLayerTools();
}
function setWallHeight(yMeters) {
  const obj = selectedObj || furnById(state.selected);
  if (!obj || (MAGNET[obj.userData.id] || 'floor') !== 'wall') return;
  if (state.elements[obj.userData.id].locked) return;
  snapWallItem(obj, obj.position.x, obj.position.z, yMeters);
  savePose(obj);
  updateSelectionVisual();
  updatePlanOverlay();
  refreshLayerTools();
}
function resetPosition(id) {
  const key = id || state.selected;
  if (!key || !state.elements[key]) return;
  state.elements[key].pose = null;
  rebuild();
  selectPiece(key);
}
function movePiece(id, x, z, y) {
  const obj = furnById(id);
  if (!obj) return null;
  const magnet = MAGNET[id] || 'floor';
  if (magnet === 'floor') {
    obj.position.set(x, 0, z);
    clampFloorItem(obj, true);
  } else {
    snapWallItem(obj, x, z, y != null ? y : obj.position.y);
  }
  savePose(obj);
  updateSelectionVisual();
  updatePlanOverlay();
  return { x: obj.position.x, y: obj.position.y, z: obj.position.z, rotY: obj.rotation.y, wall: obj.userData.wall || null };
}

function updateSelectionVisual() {
  if (selRing && selRing.parent) selRing.parent.remove(selRing);
  selRing = null;
  const obj = selectedObj && selectedObj.visible ? selectedObj : null;
  if (!obj || !scene) return;
  obj.updateWorldMatrix(true, true);
  const b = aabbOf(obj, { forPick: true });
  const cx = (b.min.x + b.max.x) / 2;
  const cz = (b.min.z + b.max.z) / 2;
  const rx = (b.max.x - b.min.x) / 2 + 0.07;
  const rz = (b.max.z - b.min.z) / 2 + 0.07;
  const grp = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.9, 1, 64),
    new THREE.MeshBasicMaterial({ color: 0xD4B373, side: THREE.DoubleSide, transparent: true, opacity: 0.95, depthTest: false })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(cx, 0.03, cz);
  ring.scale.set(rx, 1, rz);
  ring.renderOrder = 10;
  grp.add(ring);
  const pts = [];
  for (let i = 0; i <= 64; i++) {
    const t = (i / 64) * Math.PI * 2;
    pts.push(new THREE.Vector3(cx + rx * Math.cos(t), 0.035, cz + rz * Math.sin(t)));
  }
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xE8D09A, depthTest: false }));
  line.renderOrder = 11;
  grp.add(line);
  grp.userData.role = 'selection';
  scene.add(grp);
  selRing = grp;
}

const EYE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
const LOCK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';

function renderLayers() {
  const ul = document.getElementById('st-layer-list');
  if (!ul) return;
  ul.innerHTML = '';
  for (const id of LAYER_ORDER) {
    const el = state.elements[id];
    if (!el || !el.on) continue;
    const magnet = MAGNET[id] || (id === 'panelling' ? 'wall' : 'floor');
    const li = document.createElement('li');
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'st-layer' + (state.selected === id ? ' is-selected' : '');
    row.dataset.layer = id;
    row.setAttribute('aria-pressed', String(state.selected === id));
    row.innerHTML = `<span class="st-layer-name">${pieceTitle(id)}</span><span class="st-layer-badge">${magnet.toUpperCase()}</span>`;
    const eye = document.createElement('button');
    eye.type = 'button';
    eye.className = 'st-ico';
    eye.dataset.eye = id;
    eye.setAttribute('aria-label', 'Toggle visibility');
    eye.setAttribute('aria-pressed', String(el.visible !== false));
    eye.innerHTML = EYE_SVG;
    const lock = document.createElement('button');
    lock.type = 'button';
    lock.className = 'st-ico';
    lock.dataset.lock = id;
    lock.setAttribute('aria-label', 'Lock layer');
    lock.setAttribute('aria-pressed', String(!!el.locked));
    lock.innerHTML = LOCK_SVG;
    row.appendChild(eye);
    row.appendChild(lock);
    row.addEventListener('click', (e) => {
      if (e.target.closest('[data-eye]') || e.target.closest('[data-lock]')) return;
      selectPiece(id);
    });
    eye.addEventListener('click', (e) => {
      e.stopPropagation();
      setVisible(id, !(state.elements[id].visible !== false));
    });
    lock.addEventListener('click', (e) => {
      e.stopPropagation();
      setLocked(id, !state.elements[id].locked);
    });
    li.appendChild(row);
    ul.appendChild(li);
  }
  refreshLayerTools();
}
function refreshLayerTools() {
  const tools = document.getElementById('st-layer-tools');
  if (!tools) return;
  const id = state.selected;
  const el = id && state.elements[id];
  const magnet = id && MAGNET[id];
  if (!id || !el || !el.on || id === 'panelling') {
    tools.hidden = true;
    return;
  }
  tools.hidden = false;
  const angleWrap = document.getElementById('st-angle-wrap');
  const heightWrap = document.getElementById('st-height-wrap');
  angleWrap.classList.toggle('is-wall', magnet === 'wall');
  heightWrap.classList.toggle('is-floor', magnet === 'floor');
  const obj = furnById(id);
  const angle = obj ? Math.round((obj.rotation.y * 180) / Math.PI) : 0;
  const aNorm = ((angle + 180) % 360 + 360) % 360 - 180;
  const angleInput = document.getElementById('st-angle');
  const angleVal = document.getElementById('st-angle-val');
  if (angleInput !== document.activeElement) angleInput.value = String(aNorm);
  angleVal.textContent = `${aNorm}°`;
  const hInput = document.getElementById('st-height');
  const hVal = document.getElementById('st-height-val');
  const y = obj ? obj.position.y : 0.35;
  const { h } = dim();
  const pieceH = obj && obj.userData.pieceH ? obj.userData.pieceH : 1.8;
  const yMax = Math.max(0.35, h - pieceH - 0.15);
  hInput.min = '35';
  hInput.max = String(Math.round(yMax * 100));
  if (hInput !== document.activeElement) hInput.value = String(Math.round(y * 100));
  hVal.textContent = fmtLen(y);
  const locked = !!el.locked;
  tools.querySelectorAll('button, input').forEach((n) => { if (n.id !== 'st-reset-pos') n.disabled = locked; });
}
function bindLayerTools() {
  document.getElementById('st-rot-ccw').addEventListener('click', () => rotateSelected(-90));
  document.getElementById('st-rot-cw').addEventListener('click', () => rotateSelected(90));
  document.getElementById('st-angle').addEventListener('input', (e) => {
    const obj = selectedObj || furnById(state.selected);
    if (!obj || (MAGNET[obj.userData.id] || 'floor') === 'wall') return;
    if (state.elements[obj.userData.id].locked) return;
    obj.rotation.y = (Number(e.target.value) * Math.PI) / 180;
    clampFloorItem(obj, true);
    savePose(obj);
    document.getElementById('st-angle-val').textContent = `${Math.round(Number(e.target.value))}°`;
    updateSelectionVisual();
    updatePlanOverlay();
  });
  document.getElementById('st-height').addEventListener('input', (e) => {
    setWallHeight(Number(e.target.value) / 100);
  });
  document.getElementById('st-reset-pos').addEventListener('click', () => resetPosition());
}

function worldToOverlay(x, z) {
  const el = stage();
  const v = new THREE.Vector3(x, 0, z).project(camera);
  return { x: (v.x * 0.5 + 0.5) * el.clientWidth, y: (-v.y * 0.5 + 0.5) * el.clientHeight };
}
function updatePlanOverlay() {
  const svg = document.getElementById('st-plan-overlay');
  if (!svg) return;
  if (state.view !== 'plan') { svg.innerHTML = ''; return; }
  const el = stage();
  const wpx = Math.max(1, el.clientWidth), hpx = Math.max(1, el.clientHeight);
  svg.setAttribute('viewBox', `0 0 ${wpx} ${hpx}`);
  svg.setAttribute('width', String(wpx));
  svg.setAttribute('height', String(hpx));
  const { w, d, isGarden } = dim();
  const tl = worldToOverlay(-w/2, -d/2);
  const tr = worldToOverlay( w/2, -d/2);
  const br = worldToOverlay( w/2,  d/2);
  const bl = worldToOverlay(-w/2,  d/2);
  const poly = `${tl.x},${tl.y} ${tr.x},${tr.y} ${br.x},${br.y} ${bl.x},${bl.y}`;
  const gold = '#D4B373';
  // window opening on the back (north) wall for interiors
  const winW = isGarden ? 0 : Math.min(2.15, w * 0.4);
  const w0 = worldToOverlay(-winW/2, -d/2);
  const w1 = worldToOverlay( winW/2, -d/2);
  let marks = '';
  if (!isGarden) {
    marks += `<line x1="${w0.x}" y1="${w0.y}" x2="${w1.x}" y2="${w1.y}" stroke="#cfe4ff" stroke-width="5" stroke-linecap="butt"/>`;
    marks += `<text x="${(w0.x+w1.x)/2}" y="${w0.y - 8}" text-anchor="middle" fill="#cfe4ff" font-size="10" font-family="IBM Plex Mono, ui-monospace, monospace">WINDOW ${fmtLen(winW)}</text>`;
  }
  // open south as a door / opening
  const doorW = Math.min(1.0, w * 0.22);
  const d0 = worldToOverlay(-doorW/2, d/2);
  const d1 = worldToOverlay( doorW/2, d/2);
  marks += `<line x1="${d0.x}" y1="${d0.y}" x2="${d1.x}" y2="${d1.y}" stroke="#070D1A" stroke-width="6"/>`;
  marks += `<text x="${(d0.x+d1.x)/2}" y="${d0.y + 14}" text-anchor="middle" fill="${gold}" font-size="10" font-family="IBM Plex Mono, ui-monospace, monospace">OPENING</text>`;
  // dimension strings
  const midTop = worldToOverlay(0, -d/2);
  const midLeft = worldToOverlay(-w/2, 0);
  marks += `<text x="${(tl.x+tr.x)/2}" y="${midTop.y - 16}" text-anchor="middle" fill="${gold}" font-size="12" font-family="IBM Plex Mono, ui-monospace, monospace" letter-spacing="1">${fmtLen(w)}</text>`;
  marks += `<text x="${midLeft.x - 10}" y="${(tl.y+bl.y)/2}" text-anchor="end" fill="${gold}" font-size="12" font-family="IBM Plex Mono, ui-monospace, monospace" dominant-baseline="middle">${fmtLen(d)}</text>`;
  let footprints = '';
  allFurn().forEach((obj) => {
    if (!obj.visible) return;
    obj.updateWorldMatrix(true, true);
    const b = aabbOf(obj, { forPick: true });
    const p1 = worldToOverlay(b.min.x, b.min.z);
    const p2 = worldToOverlay(b.max.x, b.min.z);
    const p3 = worldToOverlay(b.max.x, b.max.z);
    const p4 = worldToOverlay(b.min.x, b.max.z);
    const sel = state.selected === obj.userData.id;
    footprints += `<polygon data-piece="${obj.userData.id}" points="${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}" fill="${sel ? 'rgba(212,179,115,0.32)' : 'rgba(212,179,115,0.14)'}" stroke="${gold}" stroke-width="${sel ? 1.8 : 1}"/>`;
    const c = worldToOverlay((b.min.x+b.max.x)/2, (b.min.z+b.max.z)/2);
    const short = {catwall:'Cat Wall',cattree:'Oak Cat Tree',alcove:'Dog Alcove',dining:'Dining',litter:'Teak & Glass',sofa:'Sofa'}[obj.userData.id] || pieceTitle(obj.userData.id);
    footprints += `<text x="${c.x}" y="${c.y - 8}" text-anchor="middle" fill="#F4E7C8" font-size="10" font-family="IBM Plex Mono, ui-monospace, monospace">${short}</text>`;
  });
  const roomName = `${dim().name} · ${fmtLen(w)} × ${fmtLen(d)}`;
  svg.innerHTML = `
    <rect x="0" y="0" width="${wpx}" height="${hpx}" fill="rgba(7,13,26,0.18)"/>
    <polygon points="${poly}" fill="rgba(12,20,38,0.35)" stroke="${gold}" stroke-width="2"/>
    ${marks}
    ${footprints}
    <text x="${wpx/2}" y="18" text-anchor="middle" fill="${gold}" font-size="11" font-family="IBM Plex Mono, ui-monospace, monospace" letter-spacing="1.4">FLOOR PLAN 2D · ${roomName}</text>
  `;
}

function bindNarrowBanner() {
  const el = document.getElementById('st-narrow-banner');
  const close = document.getElementById('st-narrow-banner-close');
  if (!el || !close) return;
  const key = 'pp-studio-narrow-banner-dismissed';
  const show = () => {
    if (window.innerWidth >= 640) { el.hidden = true; return; }
    if (sessionStorage.getItem(key) === '1') { el.hidden = true; el.classList.add('is-dismissed'); return; }
    el.hidden = false;
    el.classList.remove('is-dismissed');
  };
  close.addEventListener('click', () => {
    try { sessionStorage.setItem(key, '1'); } catch (err) {}
    el.hidden = true;
    el.classList.add('is-dismissed');
  });
  show();
  window.addEventListener('resize', show);
}

function bindPointer() {
  const el = renderer.domElement;
  el.style.touchAction = 'none';
  const onDown = (ev) => {
    if (ev.button !== undefined && ev.button !== 0) return;
    const obj = pickFurniture(ev.clientX, ev.clientY);
    if (!obj) {
      selectPiece(null);
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();
    try { el.setPointerCapture(ev.pointerId); } catch (err) {}
    selectPiece(obj.userData.id);
    const locked = !!(state.elements[obj.userData.id] && state.elements[obj.userData.id].locked);
    if (locked) return;
    const hit = clientToFloor(ev.clientX, ev.clientY);
    dragging = {
      id: obj.userData.id,
      obj,
      dx: obj.position.x - hit.x,
      dz: obj.position.z - hit.z,
    };
    controls.enabled = false;
  };
  const onMove = (ev) => {
    if (!dragging) return;
    ev.preventDefault();
    const hit = clientToFloor(ev.clientX, ev.clientY);
    const obj = dragging.obj;
    const x = hit.x + dragging.dx;
    const z = hit.z + dragging.dz;
    if ((MAGNET[obj.userData.id] || 'floor') === 'floor') {
      obj.position.set(x, 0, z);
      clampFloorItem(obj, true);
    } else {
      snapWallItem(obj, x, z, obj.position.y);
    }
    updateSelectionVisual();
    updatePlanOverlay();
  };
  const onUp = (ev) => {
    if (!dragging) return;
    ev.preventDefault();
    savePose(dragging.obj);
    dragging = null;
    controls.enabled = true;
    if (state.view === 'plan' || state.view === 'elevation') controls.enableRotate = false;
    refreshLayerTools();
    try { el.releasePointerCapture(ev.pointerId); } catch (err) {}
  };
  el.addEventListener('pointerdown', onDown, { capture: true });
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);
}

function auditSnap() {
  const { w, d, h } = dim();
  const issues = [];
  const bnd = innerBounds();
  allFurn().forEach((obj) => {
    const id = obj.userData.id;
    const magnet = MAGNET[id] || 'floor';
    obj.updateWorldMatrix(true, true);
    const b = aabbOf(obj);
    if (magnet === 'floor') {
      if (Math.abs(obj.position.y) > 1e-5) issues.push(`${id} floor y is ${obj.position.y}, expected 0`);
      if (b.min.y < -0.06) issues.push(`${id} sinks (ymin=${b.min.y})`);
      if (b.min.x < bnd.x0 - 0.01) issues.push(`${id} clips west wall`);
      if (b.max.x > bnd.x1 + 0.01) issues.push(`${id} clips east wall`);
      if (b.min.z < bnd.z0 - 0.01) issues.push(`${id} clips north wall`);
      if (b.max.z > bnd.z1 + 0.01) issues.push(`${id} clips south wall`);
    } else {
      const wall = obj.userData.wall || nearestWall(obj.position.x, obj.position.z);
      const flush = 0.12;
      if (wall === 'west' && Math.abs(b.min.x - (-w/2)) > flush) issues.push(`${id} not flush to west (xmin=${b.min.x})`);
      if (wall === 'east' && Math.abs(b.max.x - (w/2)) > flush) issues.push(`${id} not flush to east`);
      if (wall === 'north' && Math.abs(b.min.z - (-d/2)) > flush) issues.push(`${id} not flush to north`);
      if (wall === 'south' && Math.abs(b.max.z - (d/2)) > flush) issues.push(`${id} not flush to south`);
      if (obj.position.y < 0.35 - 0.02) issues.push(`${id} wall y ${obj.position.y} below 0.35`);
      const pieceH = obj.userData.pieceH || (b.max.y - b.min.y);
      if (obj.position.y > h - pieceH - 0.15 + 0.02) issues.push(`${id} wall y above ceiling clamp`);
    }
  });
  return { ok: issues.length === 0, issues };
}

function bindUI() {
  document.querySelectorAll('[data-space]').forEach((b)=>b.addEventListener('click',()=>{ state.space=b.dataset.space; rebuild(); }));
  document.querySelectorAll('[data-size]').forEach((b)=>b.addEventListener('click',()=>{ state.size=b.dataset.size; rebuild(); }));
  document.querySelectorAll('[data-units]').forEach((b)=>b.addEventListener('click',()=>{ state.units=b.dataset.units; updateReadouts(); syncLabels(); updatePlanOverlay(); refreshLayerTools(); }));
  document.querySelectorAll('[data-theme]').forEach((b)=>b.addEventListener('click',()=>{ state.theme=b.dataset.theme; rebuild(); }));
  document.querySelectorAll('[data-view]').forEach((b)=>b.addEventListener('click',()=>{ applyView(b.dataset.view); }));
  document.querySelectorAll('[data-toggle]').forEach((b)=>b.addEventListener('click',()=>{
    const k=b.dataset.toggle; state.elements[k].on = !state.elements[k].on; rebuild();
  }));
  document.querySelectorAll('[data-place]').forEach((s)=>s.addEventListener('change',()=>{
    const k=s.dataset.place; state.elements[k].place = s.value; state.elements[k].pose = null; rebuild();
  }));
  document.querySelectorAll('[data-variant]').forEach((s)=>s.addEventListener('change',()=>{
    const k=s.dataset.variant; state.elements[k].variant = s.value; state.elements[k].pose = null; rebuild();
  }));
  bindLayerTools();
  bindPointer();
  bindNarrowBanner();
  document.getElementById('st-open-brief').addEventListener('click', openBrief);
  document.getElementById('st-close-brief').addEventListener('click', closeBrief);
  document.getElementById('st-close-brief-2').addEventListener('click', closeBrief);
  document.getElementById('st-print-brief').addEventListener('click', () => window.print());
  document.getElementById('st-brief').addEventListener('click', (e) => { if (e.target.id==='st-brief') closeBrief(); });
  window.addEventListener('keydown', (e) => { if (e.key==='Escape') closeBrief(); });
}

function init() {
  const el = stage();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070D1A);
  scene.fog = new THREE.Fog(0x070D1A, 12, 32);

  persp = new THREE.PerspectiveCamera(42, 1, 0.08, 80);
  ortho = new THREE.OrthographicCamera(-5,5,5,-5,0.1,80);
  camera = persp;

  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(el.clientWidth, el.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.38;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  el.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.style.display = 'block';

  lights.hemi = new THREE.HemisphereLight(0xe8f0fa, 0x5a4430, 1.18);
  scene.add(lights.hemi);
  lights.sun = new THREE.DirectionalLight(0xffebb8, 2.9);
  lights.sun.castShadow = true;
  lights.sun.shadow.mapSize.set(2048, 2048);
  lights.sun.shadow.bias = -0.00035;
  lights.sun.shadow.normalBias = 0.02;
  scene.add(lights.sun);
  scene.add(lights.sun.target);
  lights.fill = new THREE.DirectionalLight(0xc5d4ee, 0.7);
  lights.fill.castShadow = false;
  lights.fill.position.set(4, 3.2, 5);
  scene.add(lights.fill);
  const mkPt = (color, intensity, distance) => {
    const p = new THREE.PointLight(color, intensity, distance, 2);
    scene.add(p);
    return p;
  };
  lights.sconceL = mkPt(0xffcc88, 1.15, 4.5);
  lights.sconceL2 = mkPt(0xffcc88, 0.95, 4.2);
  lights.sconceB = mkPt(0xffd6a0, 1.05, 4.5);
  lights.lamp = mkPt(0xffc07a, 1.35, 5.0);

  world = new THREE.Group();
  scene.add(world);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = true;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2 - 0.09;
  controls.minPolarAngle = 0.06;

  bindUI();
  rebuild();

  const ro = new ResizeObserver(() => {
    const e = stage();
    renderer.setSize(e.clientWidth, e.clientHeight, false);
    sizeCameras();
    controls.update();
    updatePlanOverlay();
    updateSelectionVisual();
  });
  ro.observe(el);

  const tick = () => {
    requestAnimationFrame(tick);
    controls.update();
    renderer.render(scene, camera);
  };
  tick();

  window.__studio = {
    state, renderer, scene, get camera(){ return camera; },
    setSpace(v){ state.space=v; rebuild(); },
    setSize(v){ state.size=v; rebuild(); },
    setTheme(v){ state.theme=v; rebuild(); },
    setView(v){ applyView(v); },
    setUnits(v){ state.units=v; updateReadouts(); syncLabels(); updatePlanOverlay(); refreshLayerTools(); },
    setElement(k, patch){ Object.assign(state.elements[k], patch); rebuild(); },
    openBrief, closeBrief, rebuild, quantities, auditGeometry, auditCalc, dim, auditSnap,
    select: selectPiece, getSelection: () => state.selected,
    setVisible, setLocked, rotateSelected, setWallHeight, resetPosition,
    getPose: (id) => {
      const o = furnById(id); if (!o) return null;
      const b = aabbOf(o);
      return { x:o.position.x, y:o.position.y, z:o.position.z, rotY:o.rotation.y, magnet:o.userData.magnet, wall:o.userData.wall||null, visible:o.visible, ymin:b.min.y, xmax:b.max.x, xmin:b.min.x, zmin:b.min.z, zmax:b.max.z };
    },
    movePiece, worldToClient, clientToFloor,
    furnById, updatePlanOverlay, renderLayers,
  };
}

init();
