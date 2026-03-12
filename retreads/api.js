// ==========================================
// api.js - The Communicator
// Handles ALL database requests to Google Apps Script
// ==========================================

async function apiSaveCustomer(payload) {
    const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    });
    return await response.json();
}

async function apiSaveQuotation(phone, itemsData, paymentTerms, transportation, prefix) {
    const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
            action: 'saveQuotation',
            phone: phone,
            itemsJSON: JSON.stringify(itemsData),
            paymentTerms: paymentTerms,
            transportation: transportation,
            prefix: prefix // Sends BTK or BTT to the database
        })
    });
    return await response.json();
}

async function apiLoadQuotation(fullRefNumber) {
    const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ 
            action: 'loadQuotation', 
            refNumber: fullRefNumber 
        })
    });
    return await response.json();
}

async function apiGetLastMarkup(phone, desc) {
    const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
            action: 'getLastMarkup',
            phone: phone,
            desc: desc
        })
    });
    return await response.json();
}
