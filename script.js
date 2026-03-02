const GENES = {
    B: { dominant: 'B', medium: 'b', recessive: 'bl' },
    D: { dominant: 'D', recessive: 'd' },
    O: { red: 'O', nonRed: 'o' },
    A: { agouti: 'A', nonAgouti: 'a' }, // The "Switch"
    Mc: { mackerel: 'Mc', classic: 'mc' } // The "Pattern"
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
        // 1. Base Color
        let base = "Black";
        const b = [this.genotype.b1, this.genotype.b2];
        if (b.includes('B')) base = "Black";
        else if (b.includes('b')) base = "Chocolate";
        else base = "Cinnamon";

        // 2. Dilution
        const isDilute = !([this.genotype.d1, this.genotype.d2].includes('D'));
        
        // 3. Red/Orange Logic (Sex-Linked)
        let color = base;
        let isTortie = false;
        if (this.gender === "Male") {
            if (this.genotype.o1 === 'O') color = "Red";
        } else {
            const o = [this.genotype.o1, this.genotype.o2];
            if (o.every(al => al === 'O')) color = "Red";
            else if (o.includes('O') && o.includes('o')) isTortie = true;
        }

        // 4. Agouti/Tabby Logic
        const isAgouti = [this.genotype.a1, this.genotype.a2].includes('A');
        const isMackerel = [this.genotype.mc1, this.genotype.mc2].includes('Mc');
        const patternName = isMackerel ? "Mackerel Tabby" : "Classic Tabby";

        // Phenotype String Construction
        let finalName = color;
        
        // Red cats always show some tabby, but we only label them "Tabby" if genetically Agouti
        // Solid (non-agouti) cats only show pattern if they are NOT solid black/blue/etc.
        if (isTortie) {
            finalName = isAgouti ? `${color} Torbie` : `${color} Tortie`;
        } else if (isAgouti || color === "Red") {
            finalName = `${color} ${patternName}`;
        }

        // Dilution Mapping
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

        return finalName;
    }
}

function breed(p1, p2) {
    if (p1.gender === p2.gender) return null;
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
        mc2: pick(father.genotype.mc1, father.genotype.mc2)
    };
    return new Cat(g, gender, "Kitten");
}

function generateRandomCat() {
    const gender = Math.random() > 0.5 ? "Male" : "Female";
    const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    const g = {
        b1: r(['B', 'b', 'bl']), b2: r(['B', 'b', 'bl']),
        d1: r(['D', 'd']), d2: r(['D', 'd']),
        o1: r(['O', 'o']), o2: gender === "Female" ? r(['O', 'o']) : null,
        a1: r(['A', 'a']), a2: r(['A', 'a']),
        mc1: r(['Mc', 'mc']), mc2: r(['Mc', 'mc'])
    };
    
    cattery.push(new Cat(g, gender, "Rescue"));
    renderCattery();
}

function renderCattery() {
    const container = document.getElementById('cattery');
    container.innerHTML = '';
    
    cattery.forEach((cat, index) => {
        const div = document.createElement('div');
        // Simplify class name for CSS (remove 'tabby' specific words for base color)
        const baseColorClass = cat.phenotype.split(' ')[0].toLowerCase();
        const patternClass = cat.phenotype.toLowerCase().includes('tabby') || cat.phenotype.toLowerCase().includes('torbie') ? 'pattern-tabby' : '';
        const isSelected = selectedCats.includes(index) ? 'selected' : '';
        
        div.className = `cat-card color-${baseColorClass} ${patternClass} ${isSelected}`;
        div.onclick = () => selectCat(index);
        
        const dna = `${cat.genotype.b1}${cat.genotype.b2} ${cat.genotype.d1}${cat.genotype.d2} ${cat.genotype.a1}${cat.genotype.a2}`;
        
        div.innerHTML = `
            <div class="gender-tag">${cat.gender === "Male" ? '♂' : '♀'}</div>
            <strong>${cat.phenotype}</strong>
            <span class="genotype">${dna}</span>
        `;
        container.appendChild(div);
    });
}

// selectCat and breedSelected remain the same as previous version.