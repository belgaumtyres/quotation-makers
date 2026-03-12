// ==========================================
// ui.js - The Interface / Decorator
// Manages button clicks, adding/deleting HTML rows, and reading form inputs.
// ==========================================

let rowCount = 0;

// --- MODAL FUNCTIONS ---
function openModal() {
    document.getElementById('customerModal').style.display = 'block';
    setupLocationAutocomplete(); // Initialize listeners
}

function closeModal() {
    document.getElementById('customerModal').style.display = 'none';
    
    // Clear text fields (Removed 'new-gender' from this list)
    ['new-name', 'new-phone', 'new-org', 'new-gstin', 'new-state', 'new-dist', 'new-taluk', 'new-pin'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = '';
    });

    // Reset Gender specifically to 'M'
    document.getElementById('new-gender').value = 'M';

    // Clear suggestions
    document.querySelectorAll('.modal .suggestions-list').forEach(ul => ul.innerHTML = '');
}

// --- SAVE CUSTOMER ---
async function saveNewCustomer() {
    const btn = document.querySelector('.btn-save');
    const originalText = btn.innerText;
    btn.innerText = "Saving...";
    btn.disabled = true;

    const phone = document.getElementById('new-phone').value.toString().trim();
    
    if(phone.length !== 10) {
        showToast("Please enter a valid 10-digit phone number.");
        btn.innerText = originalText;
        btn.disabled = false;
        return;
    }

    // Capture individual name and org name, and convert to UPPERCASE
    const individualName = document.getElementById('new-name').value.trim().toUpperCase();
    let orgName = document.getElementById('new-org').value.trim().toUpperCase();
    
    // IF org name is left blank, automatically fill it with the individual name
    if (orgName === "") {
        orgName = individualName;
    }

    const payload = {
        phone: phone,
        name: individualName,
        gender: document.getElementById('new-gender').value.toUpperCase(),
        org: orgName, 
        gstin: document.getElementById('new-gstin').value.trim().toUpperCase(),
        state: document.getElementById('new-state').value.trim().toUpperCase(),
        district: document.getElementById('new-dist').value.trim().toUpperCase(),
        taluk: document.getElementById('new-taluk').value.trim().toUpperCase(),
        pincode: document.getElementById('new-pin').value.trim() // Numbers don't need uppercase
    };
    
    if(!payload.name || !payload.state || !payload.district || !payload.taluk || !payload.pincode) {
        showToast("Please fill in all required fields.");
        btn.innerText = originalText;
        btn.disabled = false;
        return;
    }

    try {
        const result = await apiSaveCustomer(payload);
        
       if(result.result === 'success') {
            const savedPhone = result.phone;
            customerDataMap[savedPhone] = {
                name: payload.name,
                gender: payload.gender,
                orgName: payload.org,
                gstin: payload.gstin,
                taluk: payload.taluk,
                district: payload.district,
                state: payload.state,
                pincode: payload.pincode
            };

            // Update both the visible search bar and the hidden phone input
            const displayText = (payload.org && payload.org !== payload.name) ? `${payload.org} (${payload.name})` : payload.name;
            document.getElementById('customer-search').value = displayText;
            document.getElementById('customer-phone').value = savedPhone;
            
            closeModal();
            showToast(`Success! Customer ${savedPhone} registered.`, 'success');
        } else if (result.result === 'error') {
            showToast(result.message);
            closeModal();
            document.getElementById('customer-phone').value = phone;
        }

    } catch (error) {
        console.error(error);
        showToast("Failed to connect. Check internet.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// --- ROW MANAGEMENT ---
function addNewRow() {
    rowCount++;
    const container = document.getElementById('rows-container');
    
    // Hide helper text of previous row to keep UI clean
    if (rowCount > 1) {
        const prevRowId = rowCount - 1;
        const prevDescInfo = document.getElementById(`desc-info-${prevRowId}`);
        const prevCalcInfo = document.getElementById(`calc-info-${prevRowId}`);
        if (prevDescInfo) prevDescInfo.style.display = 'none';
        if (prevCalcInfo) prevCalcInfo.style.display = 'none';
    }

    const rowHtml = `
        <div class="tyre-row" id="row-${rowCount}">
            <div class="input-group" style="grid-template-columns: 1fr 1fr 1fr 0.8fr 0.2fr;">
                <div class="autocomplete-wrapper">
                    <label>Tyre Size</label>
                    <input type="text" id="size-${rowCount}" placeholder="e.g. 10.00 X 20" autocomplete="off">
                    <ul class="suggestions-list" id="size-suggestions-${rowCount}"></ul>
                </div>
                <div class="autocomplete-wrapper">
                    <label>Pattern</label>
                    <input type="text" id="pattern-${rowCount}" placeholder="e.g. RIB" autocomplete="off">
                    <ul class="suggestions-list" id="pattern-suggestions-${rowCount}"></ul>
                    
                    <div class="helper-text" id="desc-info-${rowCount}"></div>
                    <input type="hidden" id="base-price-${rowCount}" value="0">
                </div>
                <div>
                    <label>Markup (+/-)</label>
                    <input type="number" id="markup-${rowCount}" placeholder="0" value="0">
                    <div id="last-markup-info-${rowCount}" style="font-size: 0.8em; color: #2980b9; margin-top: 4px; display: none; font-weight: bold;"></div>
                    <div class="helper-text" id="calc-info-${rowCount}"></div>
                </div>
                <div>
                    <label>Quantity</label>
                    <input type="number" id="qty-${rowCount}" value="1" min="1">
                </div>
                <div>
                    <label>&nbsp;</label>
                    <button class="btn-delete" title="Delete Tyre" onclick="deleteRow(${rowCount})">X</button>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', rowHtml);
    setupRowEvents(rowCount);
}

function deleteRow(id) {
    const row = document.getElementById(`row-${id}`);
    if (row) {
        row.remove();
    }
}

function setupRowEvents(id) {
    const markupInput = document.getElementById(`markup-${id}`);
    const qtyInput = document.getElementById(`qty-${id}`);

    // Hook up the math listeners for live calculation updates
    if (markupInput) markupInput.addEventListener('input', () => updatePrice(id));
    if (qtyInput) qtyInput.addEventListener('input', () => updatePrice(id));

    // Offload the complex search box logic to autocomplete.js
    if (typeof setupTyreAutocomplete === "function") {
        setupTyreAutocomplete(id);
    }
}

function updatePrice(id) {
    const basePrice = parseFloat(document.getElementById(`base-price-${id}`).value) || 0;
    const markup = parseFloat(document.getElementById(`markup-${id}`).value) || 0;
    const calcInfo = document.getElementById(`calc-info-${id}`);

    if (basePrice > 0) {
        const finalPrice = basePrice + markup;
        calcInfo.style.display = 'block';
        calcInfo.innerText = `Final: ${finalPrice.toFixed(2)}`;
    }
}

// --- FETCH LAST MARKUP ---
async function fetchLastMarkup(rowId, desc) {
    const phone = document.getElementById('customer-phone').value.trim();
    const infoDiv = document.getElementById(`last-markup-info-${rowId}`);
    
    if (!phone) {
        infoDiv.style.display = 'block';
        infoDiv.innerText = "Last Markup: N/A (Select Customer First)";
        return;
    }

    infoDiv.style.display = 'block';
    infoDiv.innerText = "Fetching last markup...";

    try {
        const result = await apiGetLastMarkup(phone, desc);
        
        if (result.result === 'success') {
            infoDiv.innerText = `Last Markup: ${result.markup}`;
        } else {
            infoDiv.innerText = "Last Markup: N/A";
        }
    } catch (error) {
        infoDiv.innerText = "Last Markup: N/A";
    }
}

// --- LOAD EXISTING QUOTATION ---
async function loadQuotation() {
    const rawInput = document.getElementById('load-ref').value.trim();
    if (!rawInput) {
        showToast("Enter 4-digit Reference Number.", "error");
        return;
    }

    // Automatically build the full reference number
    const fullRefNumber = `BTT/25-26/${rawInput}`;

    try {
        showToast(`Fetching quotation ${fullRefNumber}...`, "success");
        
        const result = await apiLoadQuotation(fullRefNumber);
        
        if (result.result === 'error') {
            showToast(result.message, "error");
            return;
        }

        // 1. Load Customer Data
        const phone = result.phone;
        document.getElementById('customer-phone').value = phone;
        const customer = customerDataMap[phone];
        if (customer) {
            const displayText = (customer.orgName && customer.orgName !== customer.name) ? `${customer.orgName} (${customer.name})` : customer.name;
            document.getElementById('customer-search').value = displayText;
        }

        // 2. Load Settings (Payment & Transportation)
        if (result.paymentTerms) document.getElementById('payment-method').value = result.paymentTerms;
        if (result.transportation) document.getElementById('transport-mode').value = result.transportation;

        // 3. Clear Screen & Load Items
        document.getElementById('rows-container').innerHTML = ''; // Clear all existing rows
        rowCount = 0; // Reset counter
        
        const items = JSON.parse(result.itemsJSON);
        
        items.forEach(item => {
            addNewRow(); // Generates a fresh row (auto-increments rowCount)
            
            // Split the saved description back into Size and Pattern
            const parts = item.desc.split(" - ");
            const loadedSize = parts[0] || "";
            const loadedPattern = parts[1] || "";
            
            document.getElementById(`size-${rowCount}`).value = loadedSize;
            document.getElementById(`pattern-${rowCount}`).value = loadedPattern;
            document.getElementById(`base-price-${rowCount}`).value = item.basePrice;
            
            const descInfo = document.getElementById(`desc-info-${rowCount}`);
            descInfo.style.display = 'block';
            descInfo.innerText = `Base Rate: ${item.basePrice}`;
            
            // Fill the numbers
            document.getElementById(`markup-${rowCount}`).value = item.markup;
            document.getElementById(`qty-${rowCount}`).value = item.qty;
            
            updatePrice(rowCount); // Refresh the display text
        });

        showToast("Quotation loaded successfully!", "success");

    } catch (error) {
        console.error(error);
        showToast("Failed to load. Check internet connection.", "error");
    }
}
