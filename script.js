const GENES = {
    B: { dominant: 'B', medium: 'b', recessive: 'bl' },
    D: { dominant: 'D', recessive: 'd' },
    O: { red: 'O', nonRed: 'o' },
    A: { agouti: 'A', nonAgouti: 'a' },
    Mc: { mackerel: 'Mc', classic: 'mc' },
    W: { dominantWhite: 'WD', spotting: 'S', noWhite: 'w' }
};

let cattery = [];
let selectedCats = [];

class Cat {
    constructor(genotype, gender, name) {
        this.genotype = genotype; 
        this.gender = gender;
        this.name = name;
        this.phenotype = this.determinePhenotype();
    }

    determinePhenotype() {
        const whiteAlleles = [this.genotype.w1, this.genotype.w2];
        if (whiteAlleles.includes('WD')) return "White";

        let base = "Black";
        const b = [this.genotype.b1, this.genotype.b2];
        if (b.includes('B')) base = "Black";
        else if (b.includes('b')) base = "Chocolate";
        else base = "Cinnamon";

        const isDilute = !([this.genotype.d1, this.genotype.d2].includes('D'));
        
        let color = base;
        let isTortie = false;
        if (this.gender === "Male") {
            if (this.genotype.o1 === 'O') color = "Red";
        } else {
            const o = [this.genotype.o1, this.genotype.o2];
            if (o.every(al => al === 'O')) color = "Red";
            else if (o.includes('O') && o.includes('o')) isTortie = true;
        }

        const isAgouti = [this.genotype.a1, this.genotype.a2].includes('A');
        const isMackerel = [this.genotype.mc1, this.genotype.mc2].includes('Mc');
        const patternName = isMackerel ? "Mackerel Tabby" : "Classic Tabby";

        let finalName = color;
        if (isTortie) {
            finalName = isAgouti ? `${color} Torbie` : `${color} Tortie`;
        } else if (isAgouti || color === "Red") {
            finalName = `${color} ${patternName}`;
        }

        const diluteMap = {
            "Black": "Blue", "Chocolate": "Lilac", "Cinnamon": "Fawn",
            "Red": "Cream", "Tortie": "Blue-Cream", "Torbie": "Blue-Patched Tabby"
        };

        if (isDilute) {
            for (let [deep, light] of Object.entries(diluteMap)) {
                if (finalName.includes(deep)) {
                    finalName = finalName.replace(deep, light);
                    break;
                }
            }
        }

        if (whiteAlleles.includes('S')) {
            finalName += " and White";
        }

        return finalName;
    }
}

function breed(p1, p2) {
    const mother = p1.gender === "Female" ? p1 : p2;
    const father = p1.gender === "Male" ? p1 : p2;
    const pick = (a, b) => Math.random() > 0.5 ? a : b;
    const gender = Math.random() > 0.5 ? "Male" : "Female";
    
    const g = {
        b1: pick(mother.genotype.b1, mother.genotype.b2),
        b2: pick(father.genotype.b1, father.genotype.b2),
        d1: pick(mother.genotype.d1, mother.genotype.d2),
        d2: pick(father.genotype.d1, father.genotype.d2),
        o1: pick(mother.genotype.o1, mother.genotype.o2),
        o2: gender === "Female" ? father.genotype.o1 : null,
        a1: pick(mother.genotype.a1, mother.genotype.a2),
        a2: pick(father.genotype.a1, father.genotype.a2),
        mc1: pick(mother.genotype.mc1, mother.genotype.mc2),
        mc2: pick(father.genotype.mc1, father.genotype.mc2),
        w1: pick(mother.genotype.w1, mother.genotype.w2),
        w2: pick(father.genotype.w1, father.genotype.w2)
    };
    return new Cat(g, gender, "Kitten");
}

function generateRandomCat() {
    const gender = Math.random() > 0.5 ? "Male" : "Female";
    const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const wAl = ['WD', 'S', 'w', 'w', 'w', 'w']; 
    
    const g = {
        b1: r(['B', 'b', 'bl']), b2: r(['B', 'b', 'bl']),
        d1: r(['D', 'd']), d2: r(['D', 'd']),
        o1: r(['O', 'o']), o2: gender === "Female" ? r(['O', 'o']) : null,
        a1: r(['A', 'a']), a2: r(['A', 'a']),
        mc1: r(['Mc', 'mc']), mc2: r(['Mc', 'mc']),
        w1: r(wAl), w2: r(wAl)
    };
    
    cattery.push(new Cat(g, gender, "Rescue"));
    renderCattery();
}

function selectCat(index) {
    if (selectedCats.includes(index)) {
        selectedCats = selectedCats.filter(i => i !== index);
    } else {
        if (selectedCats.length === 1) {
            if (cattery[selectedCats[0]].gender === cattery[index].gender) {
                alert("You need one Male and one Female!");
                return;
            }
        }
        if (selectedCats.length < 2) selectedCats.push(index);
    }
    renderCattery();
}

function breedSelected() {
    if (selectedCats.length === 2) {
        const cat1 = cattery[selectedCats[0]];
        const cat2 = cattery[selectedCats[1]];
        const kitten = breed(cat1, cat2);
        cattery.push(kitten);
        selectedCats = [];
        renderCattery();
    } else {
        alert("Select a Male and a Female first!");
    }
}

function renderCattery() {
    const container = document.getElementById('cattery');
    container.innerHTML = '';
    
    cattery.forEach((cat, index) => {
        const div = document.createElement('div');
        const colorClass = `color-${cat.phenotype.split(' ')[0].toLowerCase()}`;
        const patternClass = (cat.phenotype.includes('Tabby') || cat.phenotype.includes('Torbie')) ? 'pattern-tabby' : '';
        const spottingClass = cat.phenotype.includes('and White') ? 'white-spotting' : '';
        const isSelected = selectedCats.includes(index) ? 'selected' : '';
        
        div.className = `cat-card ${colorClass} ${patternClass} ${spottingClass} ${isSelected}`;
        div.onclick = () => selectCat(index);
        
        const oG = cat.gender === "Male" ? `${cat.genotype.o1}Y` : `${cat.genotype.o1}${cat.genotype.o2}`;
        const dna = `
            ${cat.genotype.b1}${cat.genotype.b2} 
            ${cat.genotype.d1}${cat.genotype.d2} 
            ${oG} 
            ${cat.genotype.a1}${cat.genotype.a2} 
            ${cat.genotype.mc1}${cat.genotype.mc2} 
            ${cat.genotype.w1}${cat.genotype.w2}
        `;
        
        div.innerHTML = `
            <div class="gender-tag">${cat.gender === "Male" ? '♂' : '♀'}</div>
            <strong>${cat.phenotype}</strong>
            <span class="genotype">${dna}</span>
        `;
        container.appendChild(div);
    });
}