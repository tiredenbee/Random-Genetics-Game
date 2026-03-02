const GENES = {
    B: ['B', 'b', 'bl'], D: ['D', 'd'], O: ['O', 'o'], A: ['A', 'a'],
    Mc: ['Mc', 'mc'], W: ['WD', 'S', 'w'], I: ['I', 'i'],
    C: ['C', 'cb', 'cs', 'c'], Ti: ['Ti', 'ti'], L: ['L', 'l']
};

let cattery = [];
let selectedCats = [];
let catCounter = 1;

class Cat {
    constructor(genotype, gender, parents = null, name = null, id = null) {
        this.id = id || Date.now() + Math.random();
        this.genotype = genotype; 
        this.gender = gender;
        this.name = name || `Cat #${catCounter++}`;
        this.parents = parents; // Stores IDs of parents for saving
        this.phenotype = this.determinePhenotype();
    }

    determinePhenotype() {
        const g = this.genotype;
        const whiteAlleles = [g.w1, g.w2];
        const c = [g.c1, g.c2];
        const isLonghair = [g.l1, g.l2].every(al => al === 'l');
        const hairLabel = isLonghair ? "Longhair" : "Shorthair";

        if (whiteAlleles.includes('WD')) return `White ${hairLabel}`;
        if (c.every(al => al === 'c')) return `Albino ${hairLabel}`;

        let base = [g.b1, g.b2].includes('B') ? "Black" : ([g.b1, g.b2].includes('b') ? "Chocolate" : "Cinnamon");
        const isDilute = !([g.d1, g.d2].includes('D'));
        const isInhibitor = [g.i1, g.i2].includes('I');
        const isAgouti = [g.a1, g.a2].includes('A');
        const isTicked = [g.ti1, g.ti2].includes('Ti');

        let isRed = false, isTortie = false;
        if (this.gender === "Male") isRed = g.o1 === 'O';
        else {
            const o = [g.o1, g.o2];
            isRed = o.every(al => al === 'O');
            isTortie = o.includes('O') && o.includes('o');
        }

        const diluteMap = { "Black": "Blue", "Chocolate": "Lilac", "Cinnamon": "Fawn", "Red": "Cream" };
        let mainColor = isDilute ? diluteMap[base] : base;
        let redColor = isDilute ? "Cream" : "Red";

        let pointSuffix = "";
        if (!c.includes('C')) {
            if (c.includes('cb') && c.includes('cs')) pointSuffix = " Mink Point";
            else if (c.includes('cb')) pointSuffix = " Sepia Point";
            else if (c.includes('cs')) pointSuffix = " Siamese Point";
        }

        let effect = isInhibitor ? (isAgouti || (isRed && !isTortie) ? "Silver " : "Smoke ") : "";
        let pattern = (isAgouti || isRed) ? (isTicked ? " Ticked Tabby" : ([g.mc1, g.mc2].includes('Mc') ? " Mackerel Tabby" : " Classic Tabby")) : "";

        let finalName = isTortie ? 
            (whiteAlleles.includes('S') ? (isAgouti ? `${mainColor}-${redColor} Tabico` : `${mainColor}-${redColor} Calico`) : 
            (isAgouti ? `${mainColor}-${redColor} Torbie` : `${mainColor}-${redColor} Tortie`)) : 
            `${effect}${isRed ? redColor : mainColor}${pattern}`;

        finalName += pointSuffix;
        if (whiteAlleles.includes('S') && !isTortie) finalName += " and White";
        
        return `${finalName} ${hairLabel}`;
    }
}

// --- CORE ENGINE ---

function generateRandomCat() {
    const gender = Math.random() > 0.5 ? "Male" : "Female";
    const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const cat = new Cat({
        b1: r(['B', 'b', 'bl']), b2: r(['B', 'b', 'bl']),
        d1: r(['D', 'd']), d2: r(['D', 'd']),
        o1: r(['O', 'o']), o2: gender === "Female" ? r(['O', 'o']) : null,
        a1: r(['A', 'a']), a2: r(['A', 'a']),
        mc1: r(['Mc', 'mc']), mc2: r(['Mc', 'mc']),
        w1: r(['WD', 'S', 'w', 'w', 'w']), w2: r(['WD', 'S', 'w', 'w', 'w']),
        i1: r(['I', 'i', 'i']), i2: r(['I', 'i', 'i']),
        c1: r(['C', 'C', 'cb', 'cs', 'c']), c2: r(['C', 'C', 'cb', 'cs', 'c']),
        ti1: r(['Ti', 'ti', 'ti']), ti2: r(['Ti', 'ti', 'ti']),
        l1: r(['L', 'l']), l2: r(['L', 'l'])
    }, gender);
    cattery.push(cat);
    showFocus(cat);
    renderCattery();
}

function breedSelected() {
    if (selectedCats.length !== 2) return alert("Select one Male and one Female!");
    const p1 = cattery[selectedCats[0]], p2 = cattery[selectedCats[1]];
    if (p1.gender === p2.gender) return alert("Select one Male and one Female!");

    const mother = p1.gender === "Female" ? p1 : p2;
    const father = p1.gender === "Male" ? p1 : p2;
    const pick = (a, b) => Math.random() > 0.5 ? a : b;
    const gender = Math.random() > 0.5 ? "Male" : "Female";

    const kitten = new Cat({
        b1: pick(mother.genotype.b1, mother.genotype.b2), b2: pick(father.genotype.b1, father.genotype.b2),
        d1: pick(mother.genotype.d1, mother.genotype.d2), d2: pick(father.genotype.d1, father.genotype.d2),
        o1: pick(mother.genotype.o1, mother.genotype.o2), o2: gender === "Female" ? father.genotype.o1 : null,
        a1: pick(mother.genotype.a1, mother.genotype.a2), a2: pick(father.genotype.a1, father.genotype.a2),
        mc1: pick(mother.genotype.mc1, mother.genotype.mc2), mc2: pick(father.genotype.mc1, father.genotype.mc2),
        w1: pick(mother.genotype.w1, mother.genotype.w2), w2: pick(father.genotype.w1, father.genotype.w2),
        i1: pick(mother.genotype.i1, mother.genotype.i2), i2: pick(father.genotype.i1, father.genotype.i2),
        c1: pick(mother.genotype.c1, mother.genotype.c2), c2: pick(father.genotype.c1, father.genotype.c2),
        ti1: pick(mother.genotype.ti1, mother.genotype.ti2), ti2: pick(father.genotype.ti1, father.genotype.ti2),
        l1: pick(mother.genotype.l1, mother.genotype.l2), l2: pick(father.genotype.l1, father.genotype.l2)
    }, gender, { father: father.id, mother: mother.id });

    cattery.push(kitten);
    selectedCats = [];
    showFocus(kitten);
    renderCattery();
}

// --- UI & TABS ---

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${tabId}-area`).classList.add('active');
    event.currentTarget.classList.add('active');
}

function showFocus(cat) {
    const container = document.getElementById('active-cat-display');
    const bg = getBgStyle(cat.phenotype);
    const classes = getClasses(cat.phenotype, cat);
    
    container.innerHTML = `
        <div class="focus-cat-visual ${classes}" style="background: ${bg}">
            <div class="gender-tag">${cat.gender === "Male" ? '♂' : '♀'}</div>
        </div>
        <input type="text" value="${cat.name}" oninput="updateName('${cat.id}', this.value)" class="name-input">
        <div class="focus-phenotype">${cat.phenotype}</div>
        <div class="pedigree-box">
            <h3 style="color: var(--accent-color); text-align: center; margin-top: 0;">Family Tree</h3>
            <div class="pedigree-tree">${renderPedigree(cat, 3)}</div>
        </div>
    `;
    switchTab('focus');
}

function updateName(id, val) {
    const cat = cattery.find(c => c.id.toString() === id.toString());
    if (cat) cat.name = val;
    renderCattery();
}

function renderPedigree(cat, depth) {
    if (!cat || depth === 0) return `<div class="ped-node empty">Unknown</div>`;
    // Find parent objects by stored ID
    const father = cattery.find(c => c.id === cat.parents?.father);
    const mother = cattery.find(c => c.id === cat.parents?.mother);
    
    return `
        <div class="ped-node">
            <strong style="color:var(--accent-color)">${cat.name}</strong><br>
            <span style="font-size:0.7rem;">${cat.phenotype}</span>
            <div class="ped-parents">
                ${renderPedigree(father, depth - 1)}
                ${renderPedigree(mother, depth - 1)}
            </div>
        </div>
    `;
}

function renderCattery() {
    const mGrid = document.getElementById('males-grid');
    const fGrid = document.getElementById('females-grid');
    mGrid.innerHTML = ''; fGrid.innerHTML = '';

    cattery.forEach((cat, index) => {
        const div = document.createElement('div');
        div.className = `cat-card ${selectedCats.includes(index) ? 'selected' : ''} ${getClasses(cat.phenotype, cat)}`;
        div.style.background = getBgStyle(cat.phenotype);
        div.onclick = () => {
            if (selectedCats.includes(index)) selectedCats = selectedCats.filter(i => i !== index);
            else if (selectedCats.length < 2) selectedCats.push(index);
            renderCattery();
        };
        div.oncontextmenu = (e) => { e.preventDefault(); showFocus(cat); };
        div.innerHTML = `<div class="gender-tag">${cat.gender === "Male" ? '♂' : '♀'}</div><strong>${cat.name}</strong><small>${cat.phenotype}</small>`;
        (cat.gender === 'Male' ? mGrid : fGrid).appendChild(div);
    });
}

// --- SAVE SYSTEM ---

function saveGame() {
    const saveData = {
        cattery: cattery,
        catCounter: catCounter
    };
    localStorage.setItem('catGeneticsSave', JSON.stringify(saveData));
    notify("Game Saved!");
}

function loadGame() {
    const saved = localStorage.getItem('catGeneticsSave');
    if (saved) {
        const data = JSON.parse(saved);
        catCounter = data.catCounter;
        cattery = data.cattery.map(c => new Cat(c.genotype, c.gender, c.parents, c.name, c.id));
        renderCattery();
    }
}

function resetGame() {
    if (confirm("Reset everything? Your cats will be lost!")) {
        localStorage.removeItem('catGeneticsSave');
        location.reload();
    }
}

function notify(msg) {
    const n = document.createElement('div');
    n.className = 'glass-card';
    n.style = "padding: 10px 20px; color: var(--accent-color); border-color: var(--accent-color); margin-top: 10px; animation: fade 2s forwards;";
    n.innerText = msg;
    document.getElementById('notification-container').appendChild(n);
    setTimeout(() => n.remove(), 2000);
}

// Helpers for CSS
function getBgStyle(p) {
    const cm = { 'black': '#2a2e3d', 'blue': '#5d667a', 'chocolate': '#4a3737', 'lilac': '#7a6e7a', 'cinnamon': '#6e4e37', 'fawn': '#968375', 'red': '#a34e2e', 'cream': '#c29d70', 'white': '#ffffff' };
    const lowP = p.toLowerCase();
    if (lowP.includes('-')) {
        const pts = lowP.split(' ')[0].split('-');
        return `linear-gradient(45deg, ${cm[pts[0]]} 50%, ${cm[pts[1]]} 50%)`;
    }
    const base = Object.keys(cm).find(c => lowP.includes(c)) || 'black';
    return cm[base];
}

function getClasses(p, cat) {
    let cls = []; const lowP = p.toLowerCase();
    if (lowP.includes('tabby') || lowP.includes('torbie') || lowP.includes('tabico')) {
        const ti = [cat.genotype.ti1, cat.genotype.ti2].filter(g => g === 'Ti').length;
        cls.push(lowP.includes('ticked') ? (ti === 2 ? 'pattern-ticked-homo' : 'pattern-ticked-hetero') : (lowP.includes('mackerel') ? 'pattern-mackerel' : 'pattern-classic'));
    }
    if (lowP.includes('white') || lowP.includes('calico')) cls.push('white-spotting');
    if (lowP.includes('smoke')) cls.push('inhibitor-smoke');
    if (lowP.includes('silver')) cls.push('inhibitor-silver');
    if (lowP.includes('point')) cls.push('colorpoint-logic');
    if (lowP.includes('longhair')) cls.push('longhair-style');
    return cls.join(' ');
}

// Initialize
window.onload = loadGame;
setInterval(saveGame, 30000);