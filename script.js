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
        
        let bgStyle = "";
        if (p.includes('-')) {
            const parts = p.split(' ')[0].split('-');
            bgStyle = `linear-gradient(45deg, ${colorMap[parts[0]]} 50%, ${colorMap[parts[1]]} 50%)`;
        } else {
            const base = Object.keys(colorMap).find(c => p.includes(c)) || 'black';
            bgStyle = colorMap[base];
        }

        div.className = `cat-card ${selectedCats.includes(index) ? 'selected' : ''}`;
        
        // --- Tabby Pattern Logic Update ---
        const isAgoutiOrRed = p.includes('tabby') || p.includes('torbie') || p.includes('tabico');
        if (isAgoutiOrRed) {
            const ti = [cat.genotype.ti1, cat.genotype.ti2];
            const mc = [cat.genotype.mc1, cat.genotype.mc2];

            if (ti.every(al => al === 'Ti')) {
                div.classList.add('pattern-ticked-homo');
            } else if (ti.includes('Ti')) {
                div.classList.add('pattern-ticked-hetero');
            } else if (mc.every(al => al === 'mc')) {
                div.classList.add('pattern-classic');
            } else {
                div.classList.add('pattern-mackerel'); // Default Mackerel
            }
        }

        if (p.includes('and white') || p.includes('calico') || p.includes('tabico')) div.classList.add('white-spotting');
        if (p.includes('smoke') || p.includes('silver')) div.classList.add('inhibitor-glow');
        if (p.includes('point')) div.classList.add('colorpoint-style');
        if (p.includes('longhair')) div.classList.add('longhair-style');

        div.style.background = bgStyle;
        div.onclick = () => selectCat(index);
        
        const oG = cat.gender === "Male" ? `${cat.genotype.o1}Y` : `${cat.genotype.o1}${cat.genotype.o2}`;
        const dna = `${cat.genotype.b1}${cat.genotype.b2} ${cat.genotype.d1}${cat.genotype.d2} ${oG} ${cat.genotype.a1}${cat.genotype.a2} ${cat.genotype.ti1}${cat.genotype.ti2} ${cat.genotype.mc1}${cat.genotype.mc2} ${cat.genotype.w1}${cat.genotype.w2} ${cat.genotype.i1}${cat.genotype.i2} ${cat.genotype.c1}${cat.genotype.c2} ${cat.genotype.l1}${cat.genotype.l2}`;

        div.innerHTML = `
            <div class="gender-tag">${cat.gender === "Male" ? '♂' : '♀'}</div>
            <strong>${cat.phenotype}</strong>
            <span class="genotype">${dna}</span>
        `;
        container.appendChild(div);
    });
}