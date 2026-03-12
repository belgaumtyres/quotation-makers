// ==========================================
// autocomplete.js - The Search Engine
// Handles all dropdown suggestion logic for Tyres, Customers, and Locations.
// ==========================================

// --- 1. CUSTOMER SEARCH ---
function setupCustomerSearch() {
    const searchInput = document.getElementById('customer-search');
    const suggestionsBox = document.getElementById('customer-suggestions');
    const hiddenPhoneInput = document.getElementById('customer-phone');

    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        suggestionsBox.innerHTML = '';
        hiddenPhoneInput.value = ''; // Clear hidden phone
        
        if (query.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }

        const customers = Object.entries(customerDataMap).map(([phone, data]) => ({ phone, ...data }));
        const matches = customers.filter(c => 
            (c.orgName && c.orgName.toLowerCase().includes(query)) || 
            (c.name && c.name.toLowerCase().includes(query))
        ).slice(0, 10);

        if (matches.length > 0) {
            suggestionsBox.style.display = 'block';
            matches.forEach(c => {
                const li = document.createElement('li');
                const displayText = (c.orgName && c.orgName !== c.name) ? `${c.orgName} (${c.name})` : c.name;
                li.textContent = displayText;
                
                li.onclick = () => {
                    searchInput.value = displayText;
                    hiddenPhoneInput.value = c.phone; 
                    suggestionsBox.style.display = 'none';
                };
                suggestionsBox.appendChild(li);
            });
        } else {
            suggestionsBox.style.display = 'none';
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target !== searchInput && suggestionsBox) {
            suggestionsBox.style.display = 'none';
        }
    });
}

// --- 2. TYRE ROW SEARCH (RETREADING) ---
function setupTyreAutocomplete(id) {
    const sizeInput = document.getElementById(`size-${id}`);
    const sizeSuggestions = document.getElementById(`size-suggestions-${id}`);
    
    const patternInput = document.getElementById(`pattern-${id}`);
    const patternSuggestions = document.getElementById(`pattern-suggestions-${id}`);
    
    const basePriceInput = document.getElementById(`base-price-${id}`);
    const descInfo = document.getElementById(`desc-info-${id}`);

    // Get unique sizes for the first dropdown
    const uniqueSizes = [...new Set(retreadDatabase.map(item => item.size))];

    // --- SIZE INPUT LISTENER ---
    sizeInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        sizeSuggestions.innerHTML = '';
        patternInput.value = ''; // Reset pattern if size changes
        basePriceInput.value = 0;
        descInfo.style.display = 'none';
        
        const markupInfo = document.getElementById(`last-markup-info-${id}`);
        if(markupInfo) markupInfo.style.display = 'none';

        if (!query) { sizeSuggestions.style.display = 'none'; return; }

        const matches = uniqueSizes.filter(size => size.toLowerCase().includes(query)).slice(0, 10);
        
        if (matches.length > 0) {
            sizeSuggestions.style.display = 'block';
            matches.forEach(size => {
                const li = document.createElement('li');
                li.textContent = size;
                li.onclick = () => {
                    sizeInput.value = size;
                    sizeSuggestions.style.display = 'none';
                    patternInput.focus(); // Auto-move to pattern
                };
                sizeSuggestions.appendChild(li);
            });
        } else {
            sizeSuggestions.style.display = 'none';
        }
    });

    // --- PATTERN INPUT LISTENER ---
    patternInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const currentSize = sizeInput.value.trim();
        patternSuggestions.innerHTML = '';
        
        if (!query || !currentSize) { patternSuggestions.style.display = 'none'; return; }

        // Find patterns only for the selected size
        const availablePatterns = retreadDatabase.filter(item => item.size === currentSize && item.pattern.toLowerCase().includes(query));

        if (availablePatterns.length > 0) {
            patternSuggestions.style.display = 'block';
            availablePatterns.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.pattern} (Rate: ${item.rate})`;
                li.onclick = () => {
                    patternInput.value = item.pattern;
                    basePriceInput.value = item.rate;
                    patternSuggestions.style.display = 'none';
                    
                    descInfo.style.display = 'block';
                    descInfo.innerText = `Base Rate: ${item.rate}`;
                    
                    const fullDesc = `${item.size} - ${item.pattern}`;
                    if (typeof fetchLastMarkup === "function") fetchLastMarkup(id, fullDesc);
                    if (typeof updatePrice === "function") updatePrice(id);
                };
                patternSuggestions.appendChild(li);
            });
        } else {
            patternSuggestions.style.display = 'none';
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target !== sizeInput && sizeSuggestions) sizeSuggestions.style.display = 'none';
        if (e.target !== patternInput && patternSuggestions) patternSuggestions.style.display = 'none';
    });
    
    // Manual fallback: if they type a pattern not in DB
    patternInput.addEventListener('blur', function() {
        if (this.value.trim() !== '') {
            const fullDesc = `${sizeInput.value.trim().toUpperCase()} - ${this.value.trim().toUpperCase()}`;
            if (typeof fetchLastMarkup === "function") fetchLastMarkup(id, fullDesc);
            if (typeof updatePrice === "function") updatePrice(id);
        }
    });
}

// --- 3. LOCATION SEARCH (State/District/Taluk) ---
function setupLocationAutocomplete() {
    const stateInput = document.getElementById('new-state');
    const distInput = document.getElementById('new-dist');
    const talukInput = document.getElementById('new-taluk');

    // 1. State Listener
    stateInput.oninput = function() {
        const query = this.value.toLowerCase();
        const list = document.getElementById('state-suggestions');
        list.innerHTML = '';
        
        if (!query) return;

        Object.keys(locationData).forEach(state => {
            if (state.toLowerCase().includes(query)) {
                addSuggestionItem(list, state, () => {
                    stateInput.value = state;
                    list.innerHTML = ''; // Hide list
                    distInput.value = ''; // Reset child fields
                    talukInput.value = '';
                });
            }
        });
        list.style.display = list.innerHTML ? 'block' : 'none';
    };

    // 2. District Listener
    distInput.oninput = function() {
        const query = this.value.toLowerCase();
        const stateName = stateInput.value;
        const list = document.getElementById('dist-suggestions');
        list.innerHTML = '';

        if (!query || !stateName || !locationData[stateName]) return;

        Object.keys(locationData[stateName]).forEach(dist => {
            if (dist.toLowerCase().includes(query)) {
                addSuggestionItem(list, dist, () => {
                    distInput.value = dist;
                    list.innerHTML = '';
                    talukInput.value = '';
                });
            }
        });
        list.style.display = list.innerHTML ? 'block' : 'none';
    };

    // 3. Taluk Listener
    talukInput.oninput = function() {
        const query = this.value.toLowerCase();
        const stateName = stateInput.value;
        const distName = distInput.value;
        const list = document.getElementById('taluk-suggestions');
        list.innerHTML = '';

        if (!query || !stateName || !distName || !locationData[stateName][distName]) return;

        locationData[stateName][distName].forEach(taluk => {
            if (taluk.toLowerCase().includes(query)) {
                addSuggestionItem(list, taluk, () => {
                    talukInput.value = taluk;
                    list.innerHTML = '';
                });
            }
        });
        list.style.display = list.innerHTML ? 'block' : 'none';
    };

    // Close lists when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.autocomplete-wrapper')) {
            document.querySelectorAll('.modal .suggestions-list').forEach(ul => ul.style.display = 'none');
        }
    });
}

function addSuggestionItem(listElement, text, onClick) {
    const li = document.createElement('li');
    li.textContent = text;
    li.onclick = onClick;
    listElement.appendChild(li);
}

// Initialize global search boxes on load
window.addEventListener('DOMContentLoaded', () => {
    setupCustomerSearch();
});
