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
    if (CUSTOMER_SHEET_URL.includes("YOUR_GOOGLE_SHEET")) return;

    try {
        const urlWithCacheBust = CUSTOMER_SHEET_URL + "&t=" + new Date().getTime();
        const response = await fetch(urlWithCacheBust);
        const csvText = await response.text();
        
        const rows = csvText.split('\n').map(row => {
            // Ensure commas inside quotes don't break the CSV split
            const regex = /(?:\"([^\"]*)\")|([^,]+)/g;
            let result = [];
            let match;
            while (match = regex.exec(row)) {
                result.push(match[1] || match[2] || "");
            }
            return result;
        });
        
        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i];
            if (cols.length < 8) continue; // Skip empty rows

            const phone = cols[0] ? cols[0].toString().trim() : "";
            
            if (phone && phone.length > 5) {
                customerDataMap[phone] = {
                    name: cols[1] ? cols[1].trim() : "",
                    gender: cols[2] ? cols[2].trim() : "",
                    orgName: cols[3] ? cols[3].trim() : "",
                    taluk: cols[4] ? cols[4].trim() : "",
                    district: cols[5] ? cols[5].trim() : "",
                    state: cols[6] ? cols[6].trim() : "",
                    pincode: cols[7] ? cols[7].trim() : "",
                    gstin: cols[8] ? cols[8].trim() : ""
                };
            }
        }
        console.log("Customers loaded:", Object.keys(customerDataMap).length);
    } catch (error) {
        console.error("Error loading customer sheet:", error);
    }
}
