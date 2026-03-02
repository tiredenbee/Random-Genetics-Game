const GENES = {
    B: { dominant: 'B', medium: 'b', recessive: 'bl' },
    D: { dominant: 'D', recessive: 'd' },
    O: { red: 'O', nonRed: 'o' } // Sex-linked on X chromosome
};

let cattery = [];
let selectedCats = [];

class Cat {
    constructor(genotype, gender, name) {
        this.genotype = genotype; // { b1, b2, d1, d2, o1, o2 } 
        this.gender = gender;     // "Male" or "Female"
        this.name = name;
        this.phenotype = this.determinePhenotype();
    }

    determinePhenotype() {
        // 1. Determine Base Color (B-Locus)
        let base = "Black";
        const b = [this.genotype.b1, this.genotype.b2];
        if (b.includes('B')) base = "Black";
        else if (b.includes('b')) base = "Chocolate";
        else base = "Cinnamon";

        // 2. Determine Dilution (D-Locus)
        const isDilute = !([this.genotype.d1, this.genotype.d2].includes('D'));
        
        const diluteMap = {
            "Black": "Blue", "Chocolate": "Lilac", "Cinnamon": "Fawn",
            "Red": "Cream", "Tortie": "Blue-Cream"
        };

        // 3. Determine Red/Orange (O-Locus - Sex Linked)
        // Males only use o1 (their single X). Females use o1 and o2.
        let finalColor = base;
        
        if (this.gender === "Male") {
            if (this.genotype.o1 === 'O') finalColor = "Red";
        } else {
            const o = [this.genotype.o1, this.genotype.o2];
            if (o.every(al => al === 'O')) finalColor = "Red";
            else if (o.includes('O') && o.includes('o')) finalColor = "Tortie";
        }

        return isDilute ? (diluteMap[finalColor] || finalColor) : finalColor;
    }
}

function breed(p1, p2) {
    if (p1.gender === p2.gender) return null;
    
    const mother = p1.gender === "Female" ? p1 : p2;
    const father = p1.gender === "Male" ? p1 : p2;
    const pick = (a, b) => Math.random() > 0.5 ? a : b;
    
    // Determine Gender
    const gender = Math.random() > 0.5 ? "Male" : "Female";
    
    const g = {
        b1: pick(mother.genotype.b1, mother.genotype.b2),
        b2: pick(father.genotype.b1, father.genotype.b2),
        d1: pick(mother.genotype.d1, mother.genotype.d2),
        d2: pick(father.genotype.d1, father.genotype.d2),
        // Sex Linked Logic
        o1: pick(mother.genotype.o1, mother.genotype.o2), // Kitten always gets one X from Mom
        o2: gender === "Female" ? father.genotype.o1 : null // Girls get Dad's only X, Boys get nothing (Y)
    };
    
    return new Cat(g, gender, "Kitten");
}

function generateRandomCat() {
    const gender = Math.random() > 0.5 ? "Male" : "Female";
    const allelesB = ['B', 'b', 'bl'];
    const allelesD = ['D', 'd'];
    const allelesO = ['O', 'o'];
    
    const g = {
        b1: allelesB[Math.floor(Math.random() * 3)],
        b2: allelesB[Math.floor(Math.random() * 3)],
        d1: allelesD[Math.floor(Math.random() * 2)],
        d2: allelesD[Math.floor(Math.random() * 2)],
        o1: allelesO[Math.floor(Math.random() * 2)],
        o2: gender === "Female" ? allelesO[Math.floor(Math.random() * 2)] : null
    };
    
    cattery.push(new Cat(g, gender, "Rescue"));
    renderCattery();
}

function selectCat(index) {
    if (selectedCats.includes(index)) {
        selectedCats = selectedCats.filter(i => i !== index);
    } else if (selectedCats.length < 2) {
        // Prevent selecting two of the same gender
        if (selectedCats.length === 1 && cattery[selectedCats[0]].gender === cattery[index].gender) {
            alert("You need a Male and a Female to breed!");
            return;
        }
        selectedCats.push(index);
    }
    renderCattery();
}

function breedSelected() {
    if (selectedCats.length === 2) {
        const kitten = breed(cattery[selectedCats[0]], cattery[selectedCats[1]]);
        if (kitten) {
            cattery.push(kitten);
            selectedCats = [];
            renderCattery();
        }
    } else {
        alert("Select a Male and a Female!");
    }
}

function renderCattery() {
    const container = document.getElementById('cattery');
    container.innerHTML = '';
    
    cattery.forEach((cat, index) => {
        const div = document.createElement('div');
        const colorClass = `color-${cat.phenotype.toLowerCase().replace(' ', '-')}`;
        const isSelected = selectedCats.includes(index) ? 'selected' : '';
        
        div.className = `cat-card ${colorClass} ${isSelected}`;
        div.onclick = () => selectCat(index);
        
        // Display DNA (showing '-' for the missing Y chromosome allele in males)
        const oGenotype = cat.gender === "Male" ? `${cat.genotype.o1}Y` : `${cat.genotype.o1}${cat.genotype.o2}`;
        
        div.innerHTML = `
            <div class="gender-tag">${cat.gender === "Male" ? '♂' : '♀'}</div>
            <strong>${cat.phenotype}</strong>
            <span class="genotype">${cat.genotype.b1}${cat.genotype.b2} ${cat.genotype.d1}${cat.genotype.d2} ${oGenotype}</span>
        `;
        container.appendChild(div);
    });
}