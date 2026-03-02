const GENES = {
    B: ['B', 'b', 'bl'], D: ['D', 'd'], O: ['O', 'o'], A: ['A', 'a'],
    Mc: ['Mc', 'mc'], W: ['WD', 'S', 'w'], I: ['I', 'i'],
    C: ['C', 'cb', 'cs', 'c'], Ti: ['Ti', 'ti'], L: ['L', 'l']
};

let cattery = [];
let selectedCats = [];

const colorMap = { 
    'black': '#121212', 'blue': '#4a5159', 'chocolate': '#33241b', 
    'lilac': '#706873', 'cinnamon': '#542e1a', 'fawn': '#8c7668', 
    'red': '#a64d14', 'cream': '#c79e6d', 'white': '#eeeeee', 'albino': '#ffffff' 
};

class Cat {
    constructor(genotype, gender, parents = null) {
        this.genotype = genotype;
        this.gender = gender;
        this.name = `Cat #${cattery.length + 1}`;
        this.parents = parents;
        this.phenotype = this.determinePhenotype();
    }

    determinePhenotype() {
        const g = this.genotype;
        const whiteAlleles = [g.w1, g.w2];
        const isLonghair = [g.l1, g.l2].every(al => al === 'l');
        const hair = isLonghair ? "Longhair" : "Shorthair";

        if (whiteAlleles.includes('WD')) return `White ${hair}`;
        
        let base = [g.b1, g.b2].includes('B') ? "Black" : ([g.b1, g.b2].includes('b') ? "Chocolate" : "Cinnamon");
        const isDilute = !([g.d1, g.d2].includes('D'));
        const isInhibitor = [g.i1, g.i2].includes('I');
        const isAgouti = [g.a1, g.a2].includes('A');

        const diluteMap = { "Black": "Blue", "Chocolate": "Lilac", "Cinnamon": "Fawn", "Red": "Cream" };
        let mainColor = isDilute ? diluteMap[base] : base;
        
        let isRed = (this.gender === "Male") ? g.o1 === 'O' : ([g.o1, g.o2].every(al => al === 'O'));
        let isTortie = (this.gender === "Female" && [g.o1, g.o2].includes('O') && [g.o1, g.o2].includes('o'));

        let finalName = isTortie ? `${mainColor}-${isDilute ? 'Cream' : 'Red'} Tortie` : (isRed ? (isDilute ? 'Cream' : 'Red') : mainColor);
        if (isInhibitor) finalName = (isAgouti || isRed) ? `Silver ${finalName}` : `Smoke ${finalName}`;
        if (isAgouti || isRed) finalName += [g.mc1, g.mc2].includes('Mc') ? " Mackerel Tabby" : " Classic Tabby";
        if (whiteAlleles.includes('S')) finalName += " and White";
        
        return `${finalName} ${hair}`;
    }
}

// Logic to ensure Dominant allele (uppercase) is always on the left
function formatLocus(a, b) {
    if (!b) return a + 'Y'; // For Male O locus
    const isADom = a === a.toUpperCase() && a !== a.toLowerCase();
    const isBDom = b === b.toUpperCase() && b !== b.toLowerCase();
    if (!isADom && isBDom) return b + a;
    return a + b;
}

function generateRandomCat() {
    const gender = Math.random() > 0.5 ? "Male" : "Female";
    const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const rareW = ['WD', 'S', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w'];
    
    const cat = new Cat({
        b1: r(GENES.B), b2: r(GENES.B), d1: r(GENES.D), d2: r(GENES.D),
        o1: r(GENES.O), o2: gender === "Female" ? r(GENES.O) : null,
        a1: r(GENES.A), a2: r(GENES.A), mc1: r(GENES.Mc), mc2: r(GENES.Mc),
        w1: r(rareW), w2: r(rareW), i1: r(GENES.I), i2: r(GENES.I),
        c1: r(GENES.C), c2: r(GENES.C), ti1: r(GENES.Ti), ti2: r(GENES.Ti),
        l1: r(GENES.L), l2: r(GENES.L)
    }, gender);
    cattery.push(cat);
    showFocus(cat);
    renderCattery();
}

function breedSelected() {
    if (selectedCats.length !== 2) return alert("Select 1 Male and 1 Female from the sidebar!");
    const p1 = cattery[selectedCats[0]], p2 = cattery[selectedCats[1]];
    if (p1.gender === p2.gender) return alert("Select opposite genders!");

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
    renderCattery();
}

function showFocus(cat) {
    const container = document.getElementById('active-cat-display');
    const g = cat.genotype;
    
    // Normalizing Dominance: Dominant allele on the left
    const geno = [
        formatLocus(g.b1, g.b2), formatLocus(g.d1, g.d2), formatLocus(g.o1, g.o2),
        formatLocus(g.a1, g.a2), formatLocus(g.mc1, g.mc2), formatLocus(g.w1, g.w2),
        formatLocus(g.i1, g.i2), formatLocus(g.c1, g.c2), formatLocus(g.l1, g.l2)
    ].join(' ');

    container.innerHTML = `
        <div class="focus-cat-card ${getClasses(cat.phenotype, cat)}" style="background: ${getCatBg(cat.phenotype)}">
            <div class="gender-tag large">${cat.gender === "Male" ? '♂' : '♀'}</div>
            <input type="text" class="name-edit" value="${cat.name}" onchange="updateName(event, ${cattery.indexOf(cat)})">
            <h2 class="phenotype-title">${cat.phenotype}</h2>
            <div class="genotype-tag">${geno}</div>
        </div>
        <div class="mini-pedigree">
            <h3 class="pedigree-label">Pedigree</h3>
            <div class="tree-mini">${renderTree(cat, 3)}</div>
        </div>
    `;
}

function renderTree(cat, depth) {
    if (!cat || depth === 0) return `<div class="node-empty">Unknown</div>`;
    return `
        <div class="tree-node">
            <div class="node-info"><strong>${cat.name}</strong><br><small>${cat.phenotype}</small></div>
            <div class="node-parents">
                ${renderTree(cat.parents?.father, depth - 1)}
                ${renderTree(cat.parents?.mother, depth - 1)}
            </div>
        </div>
    `;
}

function renderCattery() {
    const grids = { 
        m: document.getElementById('males-grid'), f: document.getElementById('females-grid'),
        sm: document.getElementById('side-males-grid'), sf: document.getElementById('side-females-grid')
    };
    Object.values(grids).forEach(g => g.innerHTML = '');

    cattery.forEach((cat, i) => {
        const isM = cat.gender === 'Male';
        const card = document.createElement('div');
        card.className = `cat-card ${selectedCats.includes(i) ? 'selected' : ''}`;
        card.style.background = getCatBg(cat.phenotype);
        card.onclick = () => {
            if (selectedCats.includes(i)) selectedCats = selectedCats.filter(id => id !== i);
            else if (selectedCats.length < 2) selectedCats.push(i);
            renderCattery();
        };
        card.oncontextmenu = (e) => { e.preventDefault(); showFocus(cat); };
        card.innerHTML = `<div class="gender-tag">${isM ? '♂' : '♀'}</div><strong>${cat.name}</strong>`;

        if (isM) { grids.m.appendChild(card); grids.sm.appendChild(card.cloneNode(true)).onclick = card.onclick; }
        else { grids.f.appendChild(card); grids.sf.appendChild(card.cloneNode(true)).onclick = card.onclick; }
    });
    
    // Update Full Pedigree Tab
    const fullTree = document.getElementById('global-tree-display');
    fullTree.innerHTML = cattery.filter(c => !c.parents).map(c => renderTree(c, 10)).join('');
}

function getCatBg(p) {
    const lowP = p.toLowerCase();
    const colorKey = Object.keys(colorMap).find(c => lowP.includes(c));
    let base = colorMap[colorKey] || '#1a1a1a';
    if (lowP.includes('-')) {
        const p2 = lowP.split('-')[1];
        const colorKey2 = Object.keys(colorMap).find(c => p2.includes(c));
        return `linear-gradient(45deg, ${base} 50%, ${colorMap[colorKey2]} 50%)`;
    }
    return base;
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content, .tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tab + '-tab').classList.add('active');
    event.target.classList.add('active');
}

function updateName(e, i) { cattery[i].name = e.target.value; renderCattery(); }

function getClasses(p, cat) {
    let cls = [];
    if (p.toLowerCase().includes('tabby')) cls.push('pattern-mackerel');
    if (p.toLowerCase().includes('white')) cls.push('white-spotting');
    return cls.join(' ');
}