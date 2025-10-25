// main.js — compilado manual desde main.ts
class TreeNode {
  constructor(id, label) {
    this.id = id;
    this.label = label;
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}
class BinaryTree {
  constructor(levels) {
    this.root = null;
    this.levels = levels;
  }
  buildComplete() {
    const total = Math.pow(2, this.levels) - 1;
    const nodes = [];
    const labelFor = (i) => {
      let s = '';
      i += 1;
      while (i > 0) {
        const r = (i - 1) % 26;
        s = String.fromCharCode(65 + r) + s;
        i = Math.floor((i - 1) / 26);
      }
      return s;
    };
    for (let i = 0; i < total; i++) nodes.push(new TreeNode(i, labelFor(i)));
    for (let i = 0; i < total; i++) {
      const leftIdx = 2 * i + 1;
      const rightIdx = 2 * i + 2;
      if (leftIdx < total) {
        nodes[i].left = nodes[leftIdx];
        nodes[leftIdx].parent = nodes[i];
      }
      if (rightIdx < total) {
        nodes[i].right = nodes[rightIdx];
        nodes[rightIdx].parent = nodes[i];
      }
    }
    this.root = nodes[0];
    return this.root;
  }
  traversalOrder(type) {
    const out = [];
    const visitPre = (n) => {
      if (!n) return;
      out.push(n);
      visitPre(n.left);
      visitPre(n.right);
    };
    const visitIn = (n) => {
      if (!n) return;
      visitIn(n.left);
      out.push(n);
      visitIn(n.right);
    };
    const visitPost = (n) => {
      if (!n) return;
      visitPost(n.left);
      visitPost(n.right);
      out.push(n);
    };
    if (type === 'pre') visitPre(this.root);
    else if (type === 'in') visitIn(this.root);
    else visitPost(this.root);
    return out;
  }
  layout(width, height) {
    if (!this.root) throw new Error('Arbol vacío');
    const levels = this.levels;
    const rows = [];
    const q = [{ node: this.root, depth: 0 }];
    while (q.length) {
      const { node, depth } = q.shift();
      if (!rows[depth]) rows[depth] = [];
      rows[depth].push(node);
      if (node.left) q.push({ node: node.left, depth: depth + 1 });
      if (node.right) q.push({ node: node.right, depth: depth + 1 });
    }
    const paddingX = 60;
    const paddingY = 60;
    const usableW = width - paddingX * 2;
    const usableH = height - paddingY * 2;
    const rowH = usableH / (levels - 1 || 1);
    const coords = [];
    for (let d = 0; d < rows.length; d++) {
      const nodes = rows[d];
      const gaps = nodes.length + 1;
      const dx = usableW / gaps;
      for (let i = 0; i < nodes.length; i++) {
        const x = paddingX + dx * (i + 1);
        const y = paddingY + d * rowH;
        coords.push({ node: nodes[i], x, y });
      }
    }
    return coords;
  }
}
const svg = document.getElementById('treeSvg');
const orderList = document.getElementById('orderList');
const currentStep = document.getElementById('currentStep');
const traversalSelect = document.getElementById('traversalType');
const levelsInput = document.getElementById('levels');
const buildBtn = document.getElementById('buildBtn');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const resetBtn = document.getElementById('resetBtn');
let tree;
let order = [];
let layout = new Map();
let step = -1;
let timer = null;
function clearSVG() { while (svg.firstChild) svg.removeChild(svg.firstChild); }
function drawTree() {
  clearSVG();
  if (!tree.root) return;
  const w = svg.viewBox.baseVal.width || svg.clientWidth || 1000;
  const h = svg.viewBox.baseVal.height || svg.clientHeight || 480;
  const coords = tree.layout(w, h);
  layout = new Map(coords.map(c => [c.node.id, { x: c.x, y: c.y }]));
  const drawEdge = (from, to) => {
    const a = layout.get(from.id); const b = layout.get(to.id);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(a.x));
    line.setAttribute('y1', String(a.y));
    line.setAttribute('x2', String(b.x));
    line.setAttribute('y2', String(b.y));
    line.classList.add('edge');
    line.id = `edge-${from.id}-${to.id}`;
    svg.appendChild(line);
  };
  const visit = (n) => {
    if (!n) return;
    if (n.left) { drawEdge(n, n.left); visit(n.left); }
    if (n.right) { drawEdge(n, n.right); visit(n.right); }
  };
  visit(tree.root);
  const r = 18;
  const drawNode = (n) => {
    const { x, y } = layout.get(n.id);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.classList.add('node');
    g.setAttribute('transform', `translate(${x},${y})`);
    g.id = `node-${n.id}`;
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('r', String(r));
    c.setAttribute('cx', '0'); c.setAttribute('cy', '0');
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('dominant-baseline', 'central');
    t.textContent = n.label;
    g.appendChild(c); g.appendChild(t);
    svg.appendChild(g);
  };
  const q = [];
  const buildQ = (n) => {
    if (!n) return;
    q.push(n); buildQ(n.left); buildQ(n.right);
  };
  buildQ(tree.root);
  q.forEach(drawNode);
}
function fillOrderList() {
  orderList.innerHTML = '';
  order.forEach((n, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}. ${n.label}`;
    li.id = `li-${i}`;
    orderList.appendChild(li);
  });
}
function setActiveStep(i) {
  for (let k = 0; k < order.length; k++) {
    const li = document.getElementById(`li-${k}`);
    if (!li) continue;
    li.classList.toggle('active', k === i);
    li.classList.toggle('done', k < i);
  }
  currentStep.textContent = i >= 0 && i < order.length ? order[i].label : '—';
  document.querySelectorAll('.node').forEach(n => n.classList.remove('visited'));
  if (i >= 0 && i < order.length) {
    const node = order[i];
    const g = document.getElementById(`node-${node.id}`);
    if (g) g.classList.add('visited');
  }
  document.querySelectorAll('.edge').forEach(e => e.classList.remove('active'));
  if (i >= 0 && i < order.length) {
    const node = order[i];
    const p = node.parent;
    if (p) {
      const edge = document.getElementById(`edge-${p.id}-${node.id}`);
      if (edge) edge.classList.add('active');
    }
  }
}
function build() {
  const levels = Math.max(1, Math.min(5, Number(levelsInput.value) || 1));
  levelsInput.value = String(levels);
  tree = new BinaryTree(levels);
  tree.buildComplete();
  drawTree();
  order = tree.traversalOrder(traversalSelect.value);
  fillOrderList();
  step = -1;
  setActiveStep(step);
}
function next() {
  if (!order.length) return;
  step = Math.min(order.length - 1, step + 1);
  setActiveStep(step);
}
function prev() {
  if (!order.length) return;
  step = Math.max(-1, step - 1);
  setActiveStep(step);
}
function reset() {
  step = -1;
  setActiveStep(step);
}
function play() {
  if (timer !== null) return;
  timer = window.setInterval(() => {
    if (step >= order.length - 1) { pause(); return; }
    next();
  }, 900);
}
function pause() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}
buildBtn.addEventListener('click', build);
nextBtn.addEventListener('click', next);
prevBtn.addEventListener('click', prev);
resetBtn.addEventListener('click', reset);
playBtn.addEventListener('click', play);
pauseBtn.addEventListener('click', pause);
build();
