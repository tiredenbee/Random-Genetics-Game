let cattery = [];
let selectedCats = [];

class Cat {
    constructor(genotype) {
        this.genotype = genotype;
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

function breed(p1, p2) {
    const pick = (a, b) => Math.random() > 0.5 ? a : b;
    return new Cat({
        b1: pick(p1.genotype.b1, p1.genotype.b2),
        b2: pick(p2.genotype.b1, p2.genotype.b2),
        d1: pick(p1.genotype.d1, p1.genotype.d2),
        d2: pick(p2.genotype.d1, p2.genotype.d2)
    });
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
    cattery.push(new Cat(randomG));
    renderCattery();
}

function selectCat(index) {
    if (selectedCats.includes(index)) {
        selectedCats = selectedCats.filter(i => i !== index);
    } else if (selectedCats.length < 2) {
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
    cattery.forEach((cat, index) => {
        const div = document.createElement('div');
        div.className = `cat-card ${selectedCats.includes(index) ? 'selected' : ''}`;
        div.onclick = () => selectCat(index);
        div.innerHTML = `
            <span class="cat-icon">🐈</span>
            <strong>${cat.phenotype}</strong><br>
            <span class="genotype">${cat.genotype.b1}${cat.genotype.b2} ${cat.genotype.d1}${cat.genotype.d2}</span>
        `;
        container.appendChild(div);
    });
}

// THEME TOGGLE LOGIC
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    document.getElementById('theme-icon').innerText = isDark ? "☀️" : "🌙";
    localStorage.setItem('catTheme', isDark ? 'dark' : 'light');
}

// Initial Load
window.onload = () => {
    if (localStorage.getItem('catTheme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-icon').innerText = "☀️";
    }
    renderCattery();
};