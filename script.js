// Genetic Constants
const GENES = {
    B: { dominant: 'B', medium: 'b', recessive: 'bl' },
    D: { dominant: 'D', recessive: 'd' }
};

let cattery = [];
let selectedCats = [];

class Cat {
    constructor(genotype, name) {
        this.genotype = genotype;
        this.name = name;
        this.phenotype = this.determinePhenotype();
    }

    determinePhenotype() {
        let color = "Black";
        const bAlleles = [this.genotype.b1, this.genotype.b2];
        
        if (bAlleles.includes('B')) color = "Black";
        else if (bAlleles.includes('b')) color = "Chocolate";
        else color = "Cinnamon";

        const dAlleles = [this.genotype.d1, this.genotype.d2];
        const isDilute = !dAlleles.includes('D');

        const diluteMap = {
            "Black": "Blue",
            "Chocolate": "Lilac",
            "Cinnamon": "Fawn"
        };

        return isDilute ? diluteMap[color] : color;
    }
}

// Core Gameplay Logic
function breed(parent1, parent2) {
    const pick = (a, b) => Math.random() > 0.5 ? a : b;
    
    const childGenotype = {
        b1: pick(parent1.genotype.b1, parent1.genotype.b2),
        b2: pick(parent2.genotype.b1, parent2.genotype.b2),
        d1: pick(parent1.genotype.d1, parent1.genotype.d2),
        d2: pick(parent2.genotype.d1, parent2.genotype.d2)
    };
    
    return new Cat(childGenotype, "Kitten");
}

function generateRandomCat() {
    const allelesB = ['B', 'b', 'bl'];
    const allelesD = ['D', 'd'];
    const randomG = {
        b1: allelesB[Math.floor(Math.random() * 3)],
        b2: allelesB[Math.floor(Math.random() * 3)],
        d1: allelesD[Math.floor(Math.random() * 2)],
        d2: allelesD[Math.floor(Math.random() * 2)]
    };
    cattery.push(new Cat(randomG, "Rescue"));
    renderCattery();
}

function breedSelected() {
    if (selectedCats.length === 2) {
        const kitten = breed(cattery[selectedCats[0]], cattery[selectedCats[1]]);
        cattery.push(kitten);
        selectedCats = [];
        renderCattery();
    } else {
        alert("Select two cats to breed!");
    }
}

// UI Rendering
function selectCat(index) {
    if (selectedCats.includes(index)) {
        selectedCats = selectedCats.filter(i => i !== index);
    } else if (selectedCats.length < 2) {
        selectedCats.push(index);
    }
    renderCattery();
}

function renderCattery() {
    const container = document.getElementById('cattery');
    container.innerHTML = '';
    cattery.forEach((cat, index) => {
        const div = document.createElement('div');
        div.className = `cat-card ${selectedCats.includes(index) ? 'selected' : ''}`;
        div.onclick = () => selectCat(index);
        div.innerHTML = `
            <span class="cat-icon">🐈</span>
            <strong>${cat.phenotype}</strong>
            <span class="genotype">${cat.genotype.b1}${cat.genotype.b2} ${cat.genotype.d1}${cat.genotype.d2}</span>
        `;
        container.appendChild(div);
    });
}

// Theme Management
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-toggle');
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        btn.innerText = "☀️";
        localStorage.setItem('theme', 'dark');
    } else {
        btn.innerText = "🌙";
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme on startup
window.onload = () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').innerText = "☀️";
    }
};