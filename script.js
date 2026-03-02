const GENES = {
    B: ['B', 'b', 'bl'], D: ['D', 'd'], O: ['O', 'o'], A: ['A', 'a'],
    Mc: ['Mc', 'mc'], W: ['WD', 'S', 'w'], I: ['I', 'i'],
    C: ['C', 'cb', 'cs', 'c'], Ti: ['Ti', 'ti'], L: ['L', 'l']
};

let cattery = [];
let selectedCats = [];
let currentView = 'focus';

class Cat {
    constructor(genotype, gender, parents = null) {
        this.genotype = genotype;
        this.gender = gender;
        this.name = "Unnamed Cat";
        this.parents = parents; // { mother: Cat, father: Cat }
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

        const hasWhite = whiteAlleles.includes('S');
        let finalName = isTortie ? (hasWhite ? (isAgouti ? "Tabico" : "Calico") : (isAgouti ? "Torbie" : "Tortie")) : `${isRed ? redColor : mainColor}${pattern}`;
        
        if (isTortie) finalName = `${mainColor}-${redColor} ${finalName} ${effect}`.trim();
        else finalName = `${effect}${finalName}`;

        if (hasWhite && !isTortie) finalName += " and White";
        return `${finalName} ${hairLabel}`;
    }
}

function switchTab(tab) {
    currentView = tab;
    document.querySelectorAll('.view-section').forEach(s => s.style.display = 'none');
    document.getElementById(`${tab === 'focus' ? 'focus' : tab}-area`).style.display = 'block';
    renderCattery();
}

function generateRandomCat() {
    const gender = Math.random() > 0.5 ? "Male" : "Female";
    const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const cat = new Cat({
        b1: r(GENES.B), b2: r(GENES.B), d1: r(GENES.D), d2: r(GENES.D),
        o1: r(GENES.O), o2: gender === "Female" ? r(GENES.O) : null,
        a1: r(GENES.A), a2: r(GENES.A), mc1: r(GENES.Mc), mc2: r(GENES.Mc),
        w1: r(GENES.W), w2: r(GENES.W), i1: r(GENES.I), i2: r(GENES.I),
        c1: r(GENES.C), c2: r(GENES.C), ti1: r(GENES.Ti), ti2: r(GENES.Ti),
        l1: r(GENES.L), l2: r(GENES.L)
    }, gender);
    cattery.push(cat);
    showFocus(cat);
}

function breedSelected() {
    if (selectedCats.length !== 2) return alert("Select one Male and one Female!");
    const p1 = cattery[selectedCats[0]], p2 = cattery[selectedCats[1]];
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
    }, gender, { mother, father });

    cattery.push(kitten);
    selectedCats = [];
    showFocus(kitten);
}

function showFocus(cat) {
    const container = document.getElementById('active-cat-display');
    const colorMap = { 'black': '#2a2e3d', 'blue': '#5d667a', 'chocolate': '#4a3737', 'lilac': '#7a6e7a', 'cinnamon': '#6e4e37', 'fawn': '#968375', 'red': '#a34e2e', 'cream': '#c29d70', 'white': '#ffffff', 'albino': '#ffffff' };
    
    const p = cat.phenotype.toLowerCase();
    let bg = p.includes('-') ? `linear-gradient(45deg, ${colorMap[p.split(' ')[0].split('-')[0]]} 50%, ${colorMap[p.split(' ')[0].split('-')[1]]} 50%)` : (Object.keys(colorMap).find(c => p.includes(c)) || '#2a2e3d');

    container.innerHTML = `
        <div class="focus-card ${getClasses(p, cat)}" style="background: ${bg}">
            <input type="text" value="${cat.name}" onchange="updateName(event, ${cattery.indexOf(cat)})" class="name-input">
            <h2>${cat.phenotype}</h2>
            <p class="genotype-large">${Object.values(cat.genotype).join(' ')}</p>
        </div>
        <div class="pedigree-box">
            <h3>Pedigree</h3>
            <div class="pedigree-tree">${renderPedigree(cat, 3)}</div>
        </div>
    `;
    switchTab('focus');
}

function renderPedigree(cat, depth) {
    if (!cat || depth === 0) return `<div class="ped-node empty">Unknown</div>`;
    return `
        <div class="ped-node">
            <strong>${cat.name}</strong><br><small>${cat.phenotype}</small>
            <div class="ped-parents">
                ${renderPedigree(cat.parents?.father, depth - 1)}
                ${renderPedigree(cat.parents?.mother, depth - 1)}
            </div>
        </div>
    `;
}

function getClasses(p, cat) {
    let cls = [];
    if (p.includes('tabby') || p.includes('torbie') || p.includes('tabico')) {
        const ti = [cat.genotype.ti1, cat.genotype.ti2].filter(g => g === 'Ti').length;
        cls.push(p.includes('ticked') ? (ti === 2 ? 'pattern-ticked-homo' : 'pattern-ticked-hetero') : (p.includes('mackerel') ? 'pattern-mackerel' : 'pattern-classic'));
    }
    if (p.includes('white') || p.includes('calico') || p.includes('tabico')) cls.push('white-spotting');
    if (p.includes('smoke')) cls.push('inhibitor-smoke');
    if (p.includes('silver')) cls.push('inhibitor-silver');
    if (p.includes('point')) cls.push('colorpoint-logic');
    if (p.includes('longhair')) cls.push('longhair-style');
    return cls.join(' ');
}

function updateName(e, index) { cattery[index].name = e.target.value; renderCattery(); }

function renderCattery() {
    const grids = { males: document.getElementById('males-grid'), females: document.getElementById('females-grid') };
    grids.males.innerHTML = ''; grids.females.innerHTML = '';
    const colorMap = { 'black': '#2a2e3d', 'blue': '#5d667a', 'chocolate': '#4a3737', 'lilac': '#7a6e7a', 'cinnamon': '#6e4e37', 'fawn': '#968375', 'red': '#a34e2e', 'cream': '#c29d70', 'white': '#ffffff', 'albino': '#ffffff' };

    cattery.forEach((cat, index) => {
        const targetGrid = cat.gender === 'Male' ? grids.males : grids.females;
        const div = document.createElement('div');
        const p = cat.phenotype.toLowerCase();
        let bg = p.includes('-') ? `linear-gradient(45deg, ${colorMap[p.split(' ')[0].split('-')[0]]} 50%, ${colorMap[p.split(' ')[0].split('-')[1]]} 50%)` : (Object.keys(colorMap).find(c => p.includes(c)) || '#2a2e3d');
        
        div.className = `cat-card ${selectedCats.includes(index) ? 'selected' : ''} ${getClasses(p, cat)}`;
        div.style.background = bg;
        div.onclick = () => {
            if (selectedCats.includes(index)) selectedCats = selectedCats.filter(i => i !== index);
            else if (selectedCats.length < 2) selectedCats.push(index);
            renderCattery();
        };
        div.oncontextmenu = (e) => { e.preventDefault(); showFocus(cat); };
        div.innerHTML = `<strong>${cat.name}</strong><small>${cat.phenotype}</small>`;
        targetGrid.appendChild(div);
    });
}