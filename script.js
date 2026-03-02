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

class Cat {
    constructor(genotype, gender) {
        this.genotype = genotype; 
        this.gender = gender;
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
    }, gender);
}

function generateRandomCat() {
    const gender = Math.random() > 0.5 ? "Male" : "Female";
    const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
    cattery.push(new Cat({
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
    }, gender));
    renderCattery();
}

function selectCat(index) {
    if (selectedCats.includes(index)) {
        selectedCats = selectedCats.filter(i => i !== index);
    } else if (selectedCats.length < 2) {
        if (selectedCats.length === 1 && cattery[selectedCats[0]].gender === cattery[index].gender) {
            alert("Pick one Male and one Female!"); return;
        }
        selectedCats.push(index);
    }
    renderCattery();
}

function breedSelected() {
    if (selectedCats.length === 2) {
        cattery.push(breed(cattery[selectedCats[0]], cattery[selectedCats[1]]));
        selectedCats = [];
        renderCattery();
    }
}

function renderCattery() {
    const container = document.getElementById('cattery');
    container.innerHTML = '';
    const colorMap = {
        'black': '#2a2e3d', 'blue': '#5d667a', 'chocolate': '#4a3737', 
        'lilac': '#7a6e7a', 'cinnamon': '#6e4e37', 'fawn': '#968375',
        'red': '#a34e2e', 'cream': '#c29d70', 'white': '#ffffff', 'albino': '#ffffff'
    };

    cattery.forEach((cat, index) => {
        const div = document.createElement('div');
        const p = cat.phenotype.toLowerCase();
        const tiCount = [cat.genotype.ti1, cat.genotype.ti2].filter(g => g === 'Ti').length;
        
        let bgStyle = "";
        if (p.includes('-')) {
            const parts = p.split(' ')[0].split('-');
            bgStyle = `linear-gradient(45deg, ${colorMap[parts[0]]} 50%, ${colorMap[parts[1]]} 50%)`;
        } else {
            const base = Object.keys(colorMap).find(c => p.includes(c)) || 'black';
            bgStyle = colorMap[base];
        }

        div.className = `cat-card ${selectedCats.includes(index) ? 'selected' : ''}`;
        
        if (p.includes('tabby') || p.includes('torbie') || p.includes('tabico')) {
            if (p.includes('ticked')) {
                div.classList.add(tiCount === 2 ? 'pattern-ticked-homo' : 'pattern-ticked-hetero');
            } else if (p.includes('mackerel')) {
                div.classList.add('pattern-mackerel');
            } else {
                div.classList.add('pattern-classic');
            }
        }

        if (p.includes('and white') || p.includes('calico') || p.includes('tabico')) div.classList.add('white-spotting');
        if (p.includes('smoke')) div.classList.add('inhibitor-smoke');
        if (p.includes('silver')) div.classList.add('inhibitor-silver');
        if (p.includes('point')) div.classList.add('colorpoint-logic');
        if (p.includes('longhair')) div.classList.add('longhair-style');

        div.style.background = bgStyle;
        div.onclick = () => selectCat(index);
        
        const oG = cat.gender === "Male" ? `${cat.genotype.o1}Y` : `${cat.genotype.o1}${cat.genotype.o2}`;
        const dna = `
            ${cat.genotype.b1}${cat.genotype.b2} ${cat.genotype.d1}${cat.genotype.d2} ${oG} 
            ${cat.genotype.a1}${cat.genotype.a2} ${cat.genotype.ti1}${cat.genotype.ti2} ${cat.genotype.mc1}${cat.genotype.mc2} 
            ${cat.genotype.w1}${cat.genotype.w2} ${cat.genotype.i1}${cat.genotype.i2} 
            ${cat.genotype.c1}${cat.genotype.c2} ${cat.genotype.l1}${cat.genotype.l2}
        `;

        div.innerHTML = `
            <div class="gender-tag">${cat.gender === "Male" ? '♂' : '♀'}</div>
            <strong>${cat.phenotype}</strong>
            <span class="genotype">${dna}</span>
        `;
        container.appendChild(div);
    });
}