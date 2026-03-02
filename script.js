const GENES = {
    B: ['B', 'b', 'bl'], D: ['D', 'd'], O: ['O', 'o'], A: ['A', 'a'],
    Mc: ['Mc', 'mc'], W: ['WD', 'S', 'w'], I: ['I', 'i'],
    C: ['C', 'cb', 'cs', 'c'], Ti: ['Ti', 'ti'], L: ['L', 'l']
};

let cattery = [];
let selectedCats = [];

// Natural Feline Color Palette
const colorMap = { 
    'black': '#1a1a1a', 
    'blue': '#5b626e',      // Muted slate grey
    'chocolate': '#3d2b1f', 
    'lilac': '#827a85', 
    'cinnamon': '#633924',  // Earthy warm brown
    'fawn': '#9c8473', 
    'red': '#b86221',       // Deep rust red
    'cream': '#d6b081', 
    'white': '#f5f5f5', 
    'albino': '#ffffff' 
};

class Cat {
    constructor(genotype, gender, parents = null) {
        this.genotype = genotype;
        this.gender = gender;
        this.name = "Unnamed Cat";
        this.parents = parents;
        this.phenotype = this.determinePhenotype();
    }

    determinePhenotype() {
        const g = this.genotype;
        const whiteAlleles = [g.w1, g.w2];
        const c = [g.c1, g.c2];
        const isLonghair = [g.l1, g.l2].every(al => al === 'l');
        
        if (whiteAlleles.includes('WD')) return `White ${isLonghair ? 'Longhair' : 'Shorthair'}`;
        if (c.every(al => al === 'c')) return `Albino ${isLonghair ? 'Longhair' : 'Shorthair'}`;

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
        
        return `${finalName} ${isLonghair ? 'Longhair' : 'Shorthair'}`;
    }
}

function generateRandomCat() {
    const gender = Math.random() > 0.5 ? "Male" : "Female";
    const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
    // Make WD much rarer
    const weightedW = ['WD', 'S', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w'];
    
    const cat = new Cat({
        b1: r(GENES.B), b2: r(GENES.B), d1: r(GENES.D), d2: r(GENES.D),
        o1: r(GENES.O), o2: gender === "Female" ? r(GENES.O) : null,
        a1: r(GENES.A), a2: r(GENES.A), mc1: r(GENES.Mc), mc2: r(GENES.Mc),
        w1: r(weightedW), w2: r(weightedW), i1: r(GENES.I), i2: r(GENES.I),
        c1: r(GENES.C), c2: r(GENES.C), ti1: r(GENES.Ti), ti2: r(GENES.Ti),
        l1: r(GENES.L), l2: r(GENES.L)
    }, gender);
    cattery.push(cat);
    showFocus(cat);
    renderCattery();
}

function breedSelected() {
    if (selectedCats.length !== 2) return alert("Select 1 Male and 1 Female from the Sidebar or Tabs!");
    const p1 = cattery[selectedCats[0]], p2 = cattery[selectedCats[1]];
    if (p1.gender === p2.gender) return alert("Must be opposite genders!");

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
    const bg = getCatBackground(cat.phenotype);
    const catIndex = cattery.indexOf(cat);
    
    // Condensed Allele Formatting (e.g., Bb Dd)
    const g = cat.genotype;
    const genotypeString = `${g.b1}${g.b2} ${g.d1}${g.d2} ${g.o1}${g.o2||'Y'} ${g.a1}${g.a2} ${g.mc1}${g.mc2} ${g.w1}${g.w2} ${g.i1}${g.i2} ${g.c1}${g.c2} ${g.ti1}${g.ti2} ${g.l1}${g.l2}`;

    container.innerHTML = `
        <div class="focus-card ${getClasses(cat.phenotype, cat)}" style="background: ${bg}">
            <div class="gender-tag">${cat.gender === "Male" ? '♂' : '♀'}</div>
            <input type="text" value="${cat.name}" onchange="updateName(event, ${catIndex})" class="name-input">
            <h2 class="phenotype-label">${cat.phenotype}</h2>
            <p class="genotype-label">${genotypeString}</p>
        </div>
        <div class="pedigree-section">
            <h3 class="pedigree-header">Pedigree</h3>
            <div class="pedigree-tree-mini">${renderPedigree(cat, 3)}</div>
        </div>
    `;
    switchTab('focus');
}

function getCatBackground(phenotype) {
    const p = phenotype.toLowerCase();
    const colorKey = Object.keys(colorMap).find(c => p.includes(c));
    let base = colorMap[colorKey] || '#222';
    if (p.includes('-')) { // Tortie logic
        const p2 = p.split('-')[1];
        const colorKey2 = Object.keys(colorMap).find(c => p2.includes(c));
        return `linear-gradient(45deg, ${base} 50%, ${colorMap[colorKey2]} 50%)`;
    }
    return base;
}

function renderPedigree(cat, depth) {
    if (!cat || depth === 0) return `<div class="ped-node empty">Unknown</div>`;
    return `
        <div class="ped-node">
            <strong>${cat.name}</strong>
            <div class="ped-parents">
                ${renderPedigree(cat.parents?.father, depth - 1)}
                ${renderPedigree(cat.parents?.mother, depth - 1)}
            </div>
        </div>
    `;
}

function renderCattery() {
    const grids = { 
        m: document.getElementById('males-grid'), 
        f: document.getElementById('females-grid'),
        sideM: document.getElementById('side-m-grid'),
        sideF: document.getElementById('side-f-grid')
    };
    Object.values(grids).forEach(g => { if(g) g.innerHTML = ''; });

    cattery.forEach((cat, index) => {
        const isMale = cat.gender === 'Male';
        const card = document.createElement('div');
        card.className = `cat-item ${selectedCats.includes(index) ? 'selected' : ''} ${getClasses(cat.phenotype, cat)}`;
        card.style.background = getCatBackground(cat.phenotype);
        card.onclick = () => toggleSelection(index);
        card.oncontextmenu = (e) => { e.preventDefault(); showFocus(cat); };
        card.innerHTML = `<div class="gender-tag mini">${isMale ? '♂' : '♀'}</div><strong>${cat.name}</strong>`;
        
        if (isMale) { grids.m.appendChild(card); grids.sideM.appendChild(card.cloneNode(true)).onclick = card.onclick; }
        else { grids.f.appendChild(card); grids.sideF.appendChild(card.cloneNode(true)).onclick = card.onclick; }
    });
}

function toggleSelection(index) {
    if (selectedCats.includes(index)) selectedCats = selectedCats.filter(i => i !== index);
    else if (selectedCats.length < 2) selectedCats.push(index);
    renderCattery();
}

function switchTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id + '-area').classList.add('active');
    renderCattery();
}

function updateName(e, i) { cattery[i].name = e.target.value; renderCattery(); }

function getClasses(p, cat) {
    let cls = [];
    const lowP = p.toLowerCase();
    if (lowP.includes('tabby')) cls.push('pattern-mackerel');
    if (lowP.includes('white')) cls.push('white-spotting');
    if (lowP.includes('smoke')) cls.push('inhibitor-smoke');
    if (lowP.includes('silver')) cls.push('inhibitor-silver');
    return cls.join(' ');
}