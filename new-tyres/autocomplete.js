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

// --- 2. TYRE ROW SEARCH ---
function setupTyreAutocomplete(id) {
    const searchInput = document.getElementById(`search-${id}`);
    const suggestionsBox = document.getElementById(`suggestions-${id}`);
    const basePriceInput = document.getElementById(`base-price-${id}`);
    const productCodeInput = document.getElementById(`product-code-${id}`);
    const descInfo = document.getElementById(`desc-info-${id}`);

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        suggestionsBox.innerHTML = '';
        
        // Hide markup info when typing
        const markupInfo = document.getElementById(`last-markup-info-${id}`);
        if(markupInfo) markupInfo.style.display = 'none';

        if (query.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }

        const matches = tyreDatabase.filter(item => 
            (item.product_description && item.product_description.toLowerCase().includes(query)) ||
            (item.product_code && item.product_code.toString().includes(query))
        ).slice(0, 10);

        // ALWAYS add MANUAL ENTRY as an option
        matches.push({
            product_description: "MANUAL ENTRY",
            product_code: "CUSTOM",
            cmp_set: 0,
            category: "Custom Item",
            nbp_gst_18: "N/A"
        });

        suggestionsBox.style.display = 'block';
        matches.forEach(item => {
            const li = document.createElement('li');
            
            if(item.product_code === "CUSTOM") {
                li.innerHTML = `<strong>+ ${item.product_description}</strong>`;
                li.style.color = "#e67e22";
            } else {
                li.textContent = `${item.product_description} (Code: ${item.product_code})`;
            }
            
            li.onclick = () => {
                searchInput.value = item.product_description;
                basePriceInput.value = item.cmp_set || 0;
                productCodeInput.value = item.product_code;
                suggestionsBox.style.display = 'none';
                
                const customInput = document.getElementById(`custom-desc-${id}`);
                
                if (item.product_code === "CUSTOM") {
                    descInfo.style.display = 'none';
                    customInput.style.display = 'block';
                    customInput.focus();
                    if(markupInfo) markupInfo.style.display = 'none';
                } else {
                    customInput.style.display = 'none';
                    customInput.value = ''; 
                    descInfo.style.display = 'block';
                    descInfo.innerText = `${item.category} | Code: ${item.product_code} | NBP: ${item.nbp_gst_18 || 'N/A'} | Base CMP: ${item.cmp_set}`;
                    
                    if (typeof fetchLastMarkup === "function") fetchLastMarkup(id, item.product_description);
                }
                if (typeof updatePrice === "function") updatePrice(id);
            };
            suggestionsBox.appendChild(li);
        });
    });

    document.addEventListener('click', function(e) {
        if (e.target !== searchInput && suggestionsBox) {
            suggestionsBox.style.display = 'none';
        }
    });

    // Manual Entry listener
    const customInput = document.getElementById(`custom-desc-${id}`);
    if (customInput) {
        customInput.addEventListener('blur', function() {
            if (this.style.display !== 'none' && this.value.trim() !== '') {
                if (typeof fetchLastMarkup === "function") fetchLastMarkup(id, this.value.trim().toUpperCase());
            }
        });
    }
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
