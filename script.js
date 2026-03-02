// Genetic Constants and Cat Class remain the same as previous version...

function renderCattery() {
    const container = document.getElementById('cattery');
    container.innerHTML = '';
    
    cattery.forEach((cat, index) => {
        const div = document.createElement('div');
        
        // Convert phenotype (e.g., "Black") to class (e.g., "color-black")
        const colorClass = `color-${cat.phenotype.toLowerCase()}`;
        const isSelected = selectedCats.includes(index) ? 'selected' : '';
        
        div.className = `cat-card ${colorClass} ${isSelected}`;
        div.onclick = () => selectCat(index);
        
        div.innerHTML = `
            <strong>${cat.phenotype}</strong>
            <span class="genotype">${cat.genotype.b1}${cat.genotype.b2} ${cat.genotype.d1}${cat.genotype.d2}</span>
        `;
        container.appendChild(div);
    });
}

// Rest of the helper functions (generateRandomCat, selectCat, breed) remain the same...