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

// --- ROW MANAGEMENT (Kept same, just minimal structure) ---
function addNewRow() {
    rowCount++;
    const container = document.getElementById('rows-container');

    // ... (This part of logic remains identical to previous, just re-pasting for context if needed, 
    // but focusing on the toast/dropdown changes requested) ...
    // Note: Assuming the rest of addNewRow and setupRowEvents is unchanged.
    
    if (rowCount > 1) {
        const prevRowId = rowCount - 1;
        const prevDescInfo = document.getElementById(`desc-info-${prevRowId}`);
        const prevCalcInfo = document.getElementById(`calc-info-${prevRowId}`);
        if (prevDescInfo) prevDescInfo.style.display = 'none';
        if (prevCalcInfo) prevCalcInfo.style.display = 'none';
    }

    const rowHtml = `
        <div class="tyre-row" id="row-${rowCount}">
            <div class="input-group">
                <div class="autocomplete-wrapper">
                    <label>Tyre Description / Variant</label>
                    <input type="text" id="search-${rowCount}" placeholder="Start typing tyre name..." autocomplete="off">
                    <ul class="suggestions-list" id="suggestions-${rowCount}"></ul>
                    
                    <input type="text" id="custom-desc-${rowCount}" placeholder="Enter manual item description..." style="display: none; margin-top: 10px; border: 1px solid #e67e22;">
                    
                    <div class="helper-text" id="desc-info-${rowCount}"></div>
                    <input type="hidden" id="base-price-${rowCount}" value="0">
                    <input type="hidden" id="product-code-${rowCount}" value="">
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
    const fullRefNumber = `BTK/26-27/${rawInput}`;

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
            
            // Check if it's a standard tyre or a manual entry
            const matchedTyre = tyreDatabase.find(t => t.product_description === item.desc);
            
            if (matchedTyre) {
                // It's a standard database item
                document.getElementById(`search-${rowCount}`).value = item.desc;
                document.getElementById(`base-price-${rowCount}`).value = item.basePrice;
                document.getElementById(`product-code-${rowCount}`).value = matchedTyre.product_code;
                
                const descInfo = document.getElementById(`desc-info-${rowCount}`);
                descInfo.style.display = 'block';
                descInfo.innerText = `${matchedTyre.category} | Code: ${matchedTyre.product_code} | NBP: ${matchedTyre.nbp_gst_18 || 'N/A'} | Base CMP: ${matchedTyre.cmp_set}`;
            } else {
                // It's a custom MANUAL ENTRY item
                document.getElementById(`search-${rowCount}`).value = "MANUAL ENTRY";
                document.getElementById(`base-price-${rowCount}`).value = 0;
                
                const customInput = document.getElementById(`custom-desc-${rowCount}`);
                customInput.style.display = 'block';
                customInput.value = item.desc; // Fills the hidden custom box with their previous typed input
            }
            
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
