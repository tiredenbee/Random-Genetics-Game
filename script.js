const GENES = {
    B: ['B', 'b', 'bl'], D: ['D', 'd'], O: ['O', 'o'], A: ['A', 'a'],
    Mc: ['Mc', 'mc'], W: ['WD', 'S', 'w'], I: ['I', 'i'],
    C: ['C', 'cb', 'cs', 'c'], Ti: ['Ti', 'ti'], L: ['L', 'l']
};

let cattery = [];
let selectedMaleIdx = null;
let selectedFemaleIdx = null;

const colorMap = { 
    'black': '#121212', 'blue': '#4a5159', 'chocolate': '#33241b', 
    'lilac': '#706873', 'cinnamon': '#542e1a', 'fawn': '#8c7668', 
    'red': '#a64d14', 'cream': '#c79e6d', 'white': '#eeeeee', 'albino': '#fff5f5' 
};

class Cat {
    constructor(genotype, gender, parents = null, name = null) {
        this.genotype = genotype;
        this.gender = gender;
        this.name = name || `Cat #${cattery.length + 1}`;
        this.parents = parents; // Stores references to parent objects
        this.generation = parents ? Math.max(parents.mother.generation, parents.father.generation) + 1 : 0;
        this.phenotype = this.determinePhenotype();
    }

    determinePhenotype() {
        const g = this.genotype;
        const whiteAlleles = [g.w1, g.w2];
        const isLonghair = [g.l1, g.l2].every(al => al === 'l');
        const hair = isLonghair ? "Longhair" : "Shorthair";
        if ([g.c1, g.c2].every(al => al === 'c')) return `Albino ${hair}`;
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
        
        const c = [g.c1, g.c2];
        let pointSuffix = "";
        if (c.includes('cs') && c.includes('cb')) pointSuffix = " Mink Point";
        else if (c.filter(x => x === 'cs').length >= 1 && !c.includes('C')) pointSuffix = " Siamese Point";
        else if (c.filter(x => x === 'cb').length >= 1 && !c.includes('C')) pointSuffix = " Sepia Point";
        
        if (isInhibitor) finalName = (isAgouti || isRed) ? `Silver ${finalName}` : `Smoke ${finalName}`;
        
        if (isAgouti || isRed) {
            let pattern = [g.ti1, g.ti2].includes('Ti') ? "Ticked" : ([g.mc1, g.mc2].includes('Mc') ? "Mackerel" : "Classic");
            if (isTortie && isAgouti) finalName = finalName.replace("Tortie", `${pattern} Torbie`);
            else finalName += ` ${pattern} Tabby`;
        }

        finalName += pointSuffix;
        if (whiteAlleles.includes('S')) finalName += " and White";
        return `${finalName} ${hair}`;
    }
}

// --- SAVING LOGIC ---
function saveCattery() {
    // We store parents as indices rather than objects to avoid circular JSON errors
    const dataToSave = cattery.map(cat => ({
        genotype: cat.genotype,
        gender: cat.gender,
        name: cat.name,
        generation: cat.generation,
        parentIndices: cat.parents ? {
            mother: cattery.indexOf(cat.parents.mother),
            father: cattery.indexOf(cat.parents.father)
        } : null
    }));
    localStorage.setItem('catLab_cattery', JSON.stringify(dataToSave));
}

function loadCattery() {
    const saved = localStorage.getItem('catLab_cattery');
    if (!saved) return;

    const rawData = JSON.parse(saved);
    cattery = [];

    // First pass: Reconstruct Cat objects without parent links
    rawData.forEach(d => {
        const cat = new Cat(d.genotype, d.gender, null, d.name);
        cat.generation = d.generation;
        cattery.push(cat);
    });

    // Second pass: Restore parent object references
    rawData.forEach((d, i) => {
        if (d.parentIndices) {
            cattery[i].parents = {
                mother: cattery[d.parentIndices.mother],
                father: cattery[d.parentIndices.father]
            };
        }
    });
    renderCattery();
}

function clearData() {
    if(confirm("Are you sure you want to delete all cats? This cannot be undone.")) {
        localStorage.removeItem('catLab_cattery');
        location.reload();
    }
}
// --- END SAVING LOGIC ---

function getAncestors(cat, depth = 0) {
    if (!cat || depth > 2) return new Set();
    let ancestors = new Set([cat]);
    if (cat.parents) {
        let paternal = getAncestors(cat.parents.father, depth + 1);
        let maternal = getAncestors(cat.parents.mother, depth + 1);
        paternal.forEach(a => ancestors.add(a));
        maternal.forEach(a => ancestors.add(a));
    }
    return ancestors;
}

function areRelated(catA, catB) {
    if (!catA || !catB) return false;
    const ancestorsA = getAncestors(catA);
    const ancestorsB = getAncestors(catB);
    for (let anc of ancestorsA) {
        if (ancestorsB.has(anc)) return true;
    }
    return false;
}

function getClasses(p, cat) {
    if (p.includes("Albino")) return "pheno-albino";
    let cls = [];
    const g = cat.genotype;
    const lowP = p.toLowerCase();
    const sCount = [g.w1, g.w2].filter(a => a === 'S').length;
    if (sCount === 1) cls.push('white-low');
    else if (sCount === 2) cls.push('white-high');
    if (lowP.includes('tabby') || lowP.includes('torbie')) {
        const ti = [g.ti1, g.ti2].filter(a => a === 'Ti').length;
        if (ti === 2) cls.push('pattern-ticked-homo');
        else if (ti === 1) cls.push('pattern-ticked-hetero');
        else if ([g.mc1, g.mc2].includes('Mc')) cls.push('pattern-mackerel');
        else cls.push('pattern-classic');
    }
    if ([g.i1, g.i2].includes('I')) {
        cls.push(([g.a1, g.a2].includes('A') || lowP.includes('red') || lowP.includes('cream')) ? 'inhibitor-silver' : 'inhibitor-smoke');
    }
    const c = [g.c1, g.c2];
    if (c.includes('cs') && c.includes('cb')) cls.push('point-mink');
    else if (c.filter(x => x === 'cs').length >= 1 && !c.includes('C')) cls.push('point-siamese');
    else if (c.filter(x => x === 'cb').length >= 1 && !c.includes('C')) cls.push('point-sepia');
    return cls.join(' ');
}

function getCatBg(p) {
    const lowP = p.toLowerCase();
    if (lowP.includes('albino')) return '#fff5f5';
    if (lowP.includes('tortie') || lowP.includes('torbie')) {
        const parts = lowP.split(' ')[0].split('-');
        return `linear-gradient(45deg, ${colorMap[parts[0]] || '#121212'} 50%, ${colorMap[parts[1]] || '#a64d14'} 50%)`;
    }
    const colorKey = Object.keys(colorMap).find(c => lowP.includes(c));
    return colorMap[colorKey] || '#1a1a1a';
}

function createMiniCard(cat, label = "") {
    if (!cat) return `<div class="mini-ped-card unknown"><span class="label-tag visible">${label}</span>Unknown</div>`;
    return `
        <div class="mini-ped-card ${getClasses(cat.phenotype, cat)}" 
             style="background: ${getCatBg(cat.phenotype)}" 
             onclick="showFocus(cattery[${cattery.indexOf(cat)}])">
            <span class="label-tag visible">${label}</span>
            <span class="text-plate high-z">${cat.name}</span>
        </div>`;
}

function showFocus(cat) {
    const container = document.getElementById('active-cat-display');
    const pedTree = document.getElementById('mini-pedigree-tree');
    
    container.innerHTML = `
        <div class="focus-cat-card ${getClasses(cat.phenotype, cat)}" style="background: ${getCatBg(cat.phenotype)}">
            <div class="gender-tag large">${cat.gender === "Male" ? '♂' : '♀'}</div>
            <input type="text" class="name-edit" value="${cat.name}" onchange="updateName(event, ${cattery.indexOf(cat)})">
            <div class="phenotype-plate"><h2 class="phenotype-title">${cat.phenotype}</h2></div>
            <div class="genotype-tag">${getGenoString(cat.genotype)}</div>
        </div>
        <button class="action-btn breed-btn" onclick="openBreedingWith(${cattery.indexOf(cat)})" style="width:100%">STAGE FOR BREEDING</button>
    `;

    const m = cat.parents ? cat.parents.mother : null;
    const f = cat.parents ? cat.parents.father : null;
    const kits = cattery.filter(c => c.parents && (c.parents.mother === cat || c.parents.father === cat));
    let kitsHtml = kits.length > 0 ? kits.map(k => createMiniCard(k, "Kit")).join('') : `<div class="mini-ped-card unknown">No Offspring</div>`;

    pedTree.innerHTML = `
        <div class="vertical-pedigree">
            <div class="ped-section">
                <h4 class="ped-header">Grandparents</h4>
                <div class="ped-split-row">
                    <div class="ped-side-col">
                        ${createMiniCard(f?.parents?.father, "Paternal Sire")}
                        ${createMiniCard(f?.parents?.mother, "Paternal Dam")}
                    </div>
                    <div class="ped-side-col">
                        ${createMiniCard(m?.parents?.father, "Maternal Sire")}
                        ${createMiniCard(m?.parents?.mother, "Maternal Dam")}
                    </div>
                </div>
            </div>
            <div class="ped-section">
                <h4 class="ped-header">Parents</h4>
                <div class="ped-row">
                    ${createMiniCard(f, "Sire")}
                    ${createMiniCard(m, "Dam")}
                </div>
            </div>
            <div class="ped-section">
                <h4 class="ped-header">Kits (Offspring)</h4>
                <div class="ped-kits-grid">${kitsHtml}</div>
            </div>
        </div>
    `;
    switchTab('focus');
}

function renderCattery() {
    const fullM = document.getElementById('males-grid');
    const fullF = document.getElementById('females-grid');
    if (fullM) fullM.innerHTML = ''; if (fullF) fullF.innerHTML = '';

    cattery.forEach((cat, i) => {
        const card = document.createElement('div');
        card.className = `cat-card ${getClasses(cat.phenotype, cat)}`;
        card.style.background = getCatBg(cat.phenotype);
        card.onclick = () => showFocus(cat);
        card.innerHTML = `<div class="gender-tag">${cat.gender === 'Male' ? '♂' : '♀'}</div><span class="text-plate large high-z"><strong>${cat.name}</strong></span>`;
        if (cat.gender === 'Male') fullM.appendChild(card); else fullF.appendChild(card);
    });
    renderGlobalTree();
    updateBreedingWorkspace();
}

function renderGlobalTree() {
    const display = document.getElementById('global-tree-display');
    if(!display) return;
    display.innerHTML = '';
    const generations = {};
    cattery.forEach(cat => {
        if (!generations[cat.generation]) generations[cat.generation] = [];
        generations[cat.generation].push(cat);
    });
    Object.keys(generations).sort((a,b) => a-b).forEach(gen => {
        const genCol = document.createElement('div');
        genCol.className = 'pedigree-column';
        genCol.innerHTML = `<h3 class="gen-label">Gen ${gen}</h3>`;
        generations[gen].forEach(cat => {
            const card = document.createElement('div');
            card.className = `cat-card mini-ped ${getClasses(cat.phenotype, cat)}`;
            card.style.background = getCatBg(cat.phenotype);
            card.innerHTML = `<span class="text-plate high-z" style="font-size:0.7rem">${cat.name}</span>`;
            card.onclick = () => showFocus(cat);
            genCol.appendChild(card);
        });
        display.appendChild(genCol);
    });
}

function updateBreedingWorkspace() {
    const maleStage = document.getElementById('male-selection-ui');
    const femaleStage = document.getElementById('female-selection-ui');
    const actionBtn = document.getElementById('breed-action-container');
    
    const render = (currIdx, gender, otherCat) => {
        let h = `<select class="partner-select" onchange="setPartner(this.value, '${gender}')"><option value="">-- Select --</option>`;
        cattery.forEach((c, i) => { 
            if (c.gender === gender) {
                const inbred = otherCat ? areRelated(c, otherCat) : false;
                if (!inbred) h += `<option value="${i}" ${i == currIdx ? 'selected' : ''}>${c.name}</option>`;
            } 
        });
        h += `</select>`;
        const cat = cattery[currIdx];
        if (cat) h += `<div class="staged-cat-card ${getClasses(cat.phenotype, cat)}" style="background:${getCatBg(cat.phenotype)}"><span class="text-plate large high-z">${cat.name}</span></div>`;
        return h;
    };

    const mCat = cattery[selectedMaleIdx];
    const fCat = cattery[selectedFemaleIdx];

    if(maleStage) maleStage.innerHTML = render(selectedMaleIdx, "Male", fCat);
    if(femaleStage) femaleStage.innerHTML = render(selectedFemaleIdx, "Female", mCat);
    if(actionBtn) actionBtn.style.display = (selectedMaleIdx !== null && selectedFemaleIdx !== null) ? 'block' : 'none';
}

function setPartner(idx, g) {
    if (g === "Male") selectedMaleIdx = idx === "" ? null : parseInt(idx);
    else selectedFemaleIdx = idx === "" ? null : parseInt(idx);
    updateBreedingWorkspace();
}

function generateRandomCat() {
    const gender = Math.random() > 0.5 ? "Male" : "Female";
    const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const wPool = ['WD', 'S', 'S', 'S', 'S', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w'];
    const tiPool = ['Ti', 'ti', 'ti', 'ti', 'ti', 'ti', 'ti', 'ti', 'ti', 'ti'];

    const cat = new Cat({
        b1: r(GENES.B), b2: r(GENES.B), d1: r(GENES.D), d2: r(GENES.D),
        o1: r(GENES.O), o2: gender === "Female" ? r(GENES.O) : null,
        a1: r(GENES.A), a2: r(GENES.A), mc1: r(GENES.Mc), mc2: r(GENES.Mc),
        w1: r(wPool), w2: r(wPool),
        i1: r(['i','i','i','I']), i2: r(['i','i','i','I']),
        c1: r(['C','C','C','cb','cs','c']), c2: r(['C','C','C','cb','cs','c']),
        ti1: r(tiPool), ti2: r(tiPool),
        l1: r(GENES.L), l2: r(GENES.L)
    }, gender);
    cattery.push(cat);
    saveCattery(); // Auto-save
    renderCattery();
    showFocus(cat);
}

function breedSelected() {
    if (selectedMaleIdx === null || selectedFemaleIdx === null) return;
    const father = cattery[selectedMaleIdx];
    const mother = cattery[selectedFemaleIdx];
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
    selectedMaleIdx = null;
    selectedFemaleIdx = null;
    saveCattery(); // Auto-save
    renderCattery();
    showFocus(kitten);
}

function switchTab(t) {
    document.querySelectorAll('.tab-content, .tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(t + '-area').classList.add('active');
    const btn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.textContent.toLowerCase().includes(t.substring(0,3)));
    if (btn) btn.classList.add('active');
}

function updateName(e, i) { 
    cattery[i].name = e.target.value; 
    saveCattery(); // Save name changes
    renderCattery(); 
}

function getGenoString(g) { const f = (a, b) => b === null ? a + 'Y' : (a !== a.toUpperCase() && b === b.toUpperCase() ? b + a : a + b); return [f(g.b1, g.b2), f(g.d1, g.d2), f(g.o1, g.o2), f(g.a1, g.a2), f(g.mc1, g.mc2), f(g.ti1, g.ti2), f(g.w1, g.w2), f(g.i1, g.i2), f(g.c1, g.c2), f(g.l1, g.l2)].join(' '); }
function openBreedingWith(idx) { const c = cattery[idx]; if (c.gender === "Male") selectedMaleIdx = idx; else selectedFemaleIdx = idx; switchTab('breeding'); updateBreedingWorkspace(); }

// Initialize
loadCattery();