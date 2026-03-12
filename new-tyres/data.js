// ==========================================
// data.js - The Local Data Store
// Fetches and holds the Tyre Database and Customer mappings in memory.
// ==========================================

// Global Data Variables
let tyreDatabase = [];
let customerDataMap = {}; 

async function loadDatabase() {
    try {
        const response = await fetch('database.json');
        if (!response.ok) throw new Error("Could not load database.json");
        tyreDatabase = await response.json();
        console.log("Database loaded:", tyreDatabase.length, "items.");
        // We call addNewRow here to ensure DB is ready before first row exists
        if(typeof addNewRow === "function") addNewRow();
    } catch (error) {
        alert("Error loading database.json.");
        console.error(error);
    }
}

async function loadCustomerDatabase() {
    if (typeof CUSTOMER_SHEET_URL === 'undefined' || !CUSTOMER_SHEET_URL) return;

    try {
        // Cache buster ensures you always fetch the freshest data
        const urlWithCacheBust = CUSTOMER_SHEET_URL + "&t=" + new Date().getTime();
        const response = await fetch(urlWithCacheBust);
        const csvText = await response.text();
        
        const rows = csvText.split('\n');
        
        // Loop through all rows, skipping the header (index 0)
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.trim() === "") continue; 

            // The perfect CSV splitter: Handles commas inside quotes AND preserves empty columns
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
            
            const phone = cols[0] ? cols[0].toString().trim() : "";
            
            // If it's a valid phone number, map the exact columns
            if (phone && phone.length >= 10) {
                customerDataMap[phone] = {
                    name: cols[1] || "",
                    gender: cols[2] || "",
                    orgName: cols[3] || "",
                    taluk: cols[4] || "",
                    district: cols[5] || "",
                    state: cols[6] || "",
                    pincode: cols[7] || "",
                    gstin: cols[8] || ""
                };
            }
        }
        console.log("Customers loaded successfully:", Object.keys(customerDataMap).length);
    } catch (error) {
        console.error("Error loading customer sheet:", error);
    }
}
