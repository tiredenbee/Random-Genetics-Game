const GENES = {
    B: { dominant: 'B', medium: 'b', recessive: 'bl' },
    D: { dominant: 'D', recessive: 'd' },
    O: { red: 'O', nonRed: 'o' },
    A: { agouti: 'A', nonAgouti: 'a' },
    Mc: { mackerel: 'Mc', classic: 'mc' },
    W: { dominantWhite: 'WD', spotting: 'S', noWhite: 'w' },
    I: { inhibitor: 'I', nonInhibitor: 'i' },
    C: { full: 'C', sepia: 'cb', siamese: 'cs', albino: 'c' },
    Ti: { ticked: 'Ti', nonTicked: 'ti' },
    L: { short: 'L', long: 'l' }
};

let cattery = [];
let selectedCats = [];
let catCounter = 1;

class Cat {
    constructor(genotype, gender, parents = null) {
        this.id = Date.now() + Math.random(); // Unique ID for finding them
        this.genotype = genotype; 
        this.gender = gender;
        this.name = `Cat #${catCounter++}`;
        this.parents = parents;
        this.phenotype = this.determinePhenotype();
    }

    determinePhenotype() {
        const whiteAlleles = [this.genotype.w1, this.genotype.w2];
        const c = [this.genotype.c1, this.genotype.c2];
        const isLonghair = [this.genotype.l1, this.genotype.l2].every(al => al === 'l');
        const hairLabel = isLonghair ? "Longhair" : "Shorthair";

        if (whiteAlleles.includes('WD')) return `White ${hairLabel}`;
        if (c.every(al => al === 'c')) return `Albino ${hairLabel}`;

        const b = [this.genotype.b1, this.genotype.b2];
        let base = b.includes('B') ? "Black" : (b.includes('b') ? "Chocolate" : "Cinnamon");
        const isDilute = !([this.genotype.d1, this.genotype.d2].includes('D'));
        const isInhibitor = [this.genotype.i1, this.genotype.i2].includes('I');
        const isAgouti = [this.genotype.a1, this.genotype.a2].includes('A');
        const isTicked = [this.genotype.ti1, this.genotype.ti2].includes('Ti');

        let isRed = false, isTortie = false;
        if (this.gender === "Male") isRed = this.genotype.o1 === 'O';
        else {
            const o = [this.genotype.o1, this.genotype.o2];
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
        
        let pattern = "";
        if (isAgouti || isRed) {
            if (isTicked) pattern = " Ticked Tabby";
            else pattern = [this.genotype.mc1, this.genotype.mc2].includes('Mc') ? " Mackerel Tabby" : " Classic Tabby";
        }

        let finalName = "";
        const hasWhite = whiteAlleles.includes('S');

        if (isTortie) {
            if (hasWhite) {
                finalName = isAgouti ? `${mainColor}-${redColor} Tabico` : `${mainColor}-${redColor} Calico`;
            } else {
                finalName = isAgouti ? `${mainColor}-${redColor} Torbie` : `${mainColor}-${redColor} Tortie`;
            }
            finalName = `${finalName} ${effect}`.trim();
        } else {
            finalName = `${effect}${isRed ? redColor : mainColor}${pattern}`;
        }

        finalName += pointSuffix;
        if (hasWhite && !isTortie) finalName += " and White";
        
        return `${finalName} ${hairLabel}`;
    }
}

// Navigation Logic
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`${tabId}-area`).classList.add('active');
    
    // Find the button that corresponds to the tabId and make it active
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('active');
        }
    });
}

function breed(p1, p2) {
    const mother = p1.gender === "Female" ? p1 : p2;
    const father = p1.gender === "Male" ? p1 : p2;
    const pick = (a, b) => Math.random() > 0.5 ? a : b;
    const gender = Math.random() > 0.5 ? "Male" : "Female";
    
    return new Cat({
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
}

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
    if (selectedCats.length !== 2) { alert("Select exactly 2 cats to breed!"); return; }
    const cat1 = cattery[selectedCats[0]];
    const cat2 = cattery[selectedCats[1]];
    if (cat1.gender === cat2.gender) { alert("You must select one Male and one Female."); return; }
    
    const kitten = breed(cat1, cat2);
    cattery.push(kitten);
    selectedCats = [];
    showFocus(kitten);
    renderCattery();
}

// Visual Helpers
function getBgStyle(phenotype) {
    const p = phenotype.toLowerCase();
    const colorMap = { 'black': '#2a2e3d', 'blue': '#5d667a', 'chocolate': '#4a3737', 'lilac': '#7a6e7a', 'cinnamon': '#6e4e37', 'fawn': '#968375', 'red': '#a34e2e', 'cream': '#c29d70', 'white': '#ffffff', 'albino': '#ffffff' };
    
    if (p.includes('-')) {
        const parts = p.split(' ')[0].split('-');
        return `linear-gradient(45deg, ${colorMap[parts[0]]} 50%, ${colorMap[parts[1]]} 50%)`;
    } else {
        const base = Object.keys(colorMap).find(c => p.includes(c)) || 'black';
        return colorMap[base];
    }
}

function getClasses(phenotype, cat) {
    let cls = [];
    const p = phenotype.toLowerCase();
    const tiCount = [cat.genotype.ti1, cat.genotype.ti2].filter(g => g === 'Ti').length;
    
    if (p.includes('tabby') || p.includes('torbie') || p.includes('tabico')) {
        if (p.includes('ticked')) cls.push(tiCount === 2 ? 'pattern-ticked-homo' : 'pattern-ticked-hetero');
        else if (p.includes('mackerel')) cls.push('pattern-mackerel');
        else cls.push('pattern-classic');
    }

    if (p.includes('and white') || p.includes('calico') || p.includes('tabico')) cls.push('white-spotting');
    if (p.includes('smoke')) cls.push('inhibitor-smoke');
    if (p.includes('silver')) cls.push('inhibitor-silver');
    if (p.includes('point')) cls.push('colorpoint-logic');
    if (p.includes('longhair')) cls.push('longhair-style');

    return cls.join(' ');
}

// UI Renders
function showFocus(cat) {
    const container = document.getElementById('active-cat-display');
    const bg = getBgStyle(cat.phenotype);
    const classes = getClasses(cat.phenotype, cat);
    
    const oG = cat.gender === "Male" ? `${cat.genotype.o1}Y` : `${cat.genotype.o1}${cat.genotype.o2}`;
    const dna = `${cat.genotype.b1}${cat.genotype.b2} ${cat.genotype.d1}${cat.genotype.d2} ${oG} ${cat.genotype.a1}${cat.genotype.a2} ${cat.genotype.ti1}${cat.genotype.ti2} ${cat.genotype.mc1}${cat.genotype.mc2} ${cat.genotype.w1}${cat.genotype.w2} ${cat.genotype.i1}${cat.genotype.i2} ${cat.genotype.c1}${cat.genotype.c2} ${cat.genotype.l1}${cat.genotype.l2}`;

    container.innerHTML = `
        <div class="focus-cat-visual ${classes}" style="background: ${bg}">
            <div class="gender-tag">${cat.gender === "Male" ? '♂' : '♀'}</div>
        </div>
        <input type="text" id="focus-name-input" value="${cat.name}" oninput="updateName('${cat.id}', this.value)" class="name-input">
        <div class="focus-phenotype">${cat.phenotype}</div>
        <div class="genotype-large">${dna}</div>

        <div class="pedigree-box">
            <h3 style="color: var(--accent-color); text-align: center; margin-top: 0;">Family Tree</h3>
            <div class="pedigree-tree">${renderPedigree(cat, 3)}</div>
        </div>
    `;
    switchTab('focus');
}

function updateName(catId, newName) {
    const cat = cattery.find(c => c.id.toString() === catId.toString());
    if (cat) {
        cat.name = newName;
        renderCattery(); // Updates the name in the background tabs without interrupting typing
    }
}

function renderPedigree(cat, depth) {
    if (!cat || depth === 0) return `<div class="ped-node empty">Unknown</div>`;
    return `
        <div class="ped-node">
            <strong style="color:var(--accent-color)">${cat.name}</strong><br><span style="font-size:0.7rem; color:#ccc;">${cat.phenotype}</span>
            <div class="ped-parents">
                ${renderPedigree(cat.parents?.father, depth - 1)}
                ${renderPedigree(cat.parents?.mother, depth - 1)}
            </div>
        </div>
    `;
}

function renderCattery() {
    const grids = { "Male": document.getElementById('males-grid'), "Female": document.getElementById('females-grid') };
    grids["Male"].innerHTML = ''; grids["Female"].innerHTML = '';

    cattery.forEach((cat, index) => {
        const div = document.createElement('div');
        const bg = getBgStyle(cat.phenotype);
        const classes = getClasses(cat.phenotype, cat);
        
        div.className = `cat-card ${selectedCats.includes(index) ? 'selected' : ''} ${classes}`;
        div.style.background = bg;
        
        div.onclick = () => {
            if (selectedCats.includes(index)) {
                selectedCats = selectedCats.filter(i => i !== index);
            } else if (selectedCats.length < 2) {
                // Enforce one male, one female rule
                if (selectedCats.length === 1 && cattery[selectedCats[0]].gender === cat.gender) {
                    alert("You must select one Male and one Female to breed.");
                    return;
                }
                selectedCats.push(index);
            }
            renderCattery();
        };

        // Right click to view in focus
        div.oncontextmenu = (e) => { e.preventDefault(); showFocus(cat); };

        div.innerHTML = `
            <div class="gender-tag">${cat.gender === "Male" ? '♂' : '♀'}</div>
            <strong>${cat.name}</strong>
            <small>${cat.phenotype}</small>
        `;
        grids[cat.gender].appendChild(div);
    });
}