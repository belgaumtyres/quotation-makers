// ==========================================
// data.js - The Local Data Store (Retreading)
// Fetches and holds the Retread Database and Customer mappings in memory.
// ==========================================

const retreadDatabase = [
    // --- TRUCK ---
    { size: "12.00 X 20", pattern: "RIB", rate: 7075 },
    { size: "11.00 X 20", pattern: "RIB", rate: 6525 },
    { size: "10.00 X 20", pattern: "RIB", rate: 6375 },
    { size: "9.00 X 20", pattern: "RIB", rate: 6175 },
    { size: "8.25 X 20", pattern: "RIB", rate: 4925 },
    { size: "7.50 X 20", pattern: "RIB", rate: 4475 },
    { size: "10.00 X 20", pattern: "BST RIB", rate: 6225 },
    { size: "9.00 X 20", pattern: "BST RIB", rate: 6175 },
    { size: "12.00 X 20", pattern: "MILLER RIB", rate: 6675 },
    { size: "11.00 X 20", pattern: "MILLER RIB", rate: 6575 },
    { size: "10.00 X 20", pattern: "MILLER RIB", rate: 6375 },
    { size: "8.25 X 20", pattern: "MILLER RIB", rate: 5275 },
    { size: "12.00 X 20", pattern: "SM RIB", rate: 6625 },
    { size: "11.00 X 20", pattern: "SM RIB", rate: 6575 },
    { size: "12.00 X 20", pattern: "SUPER RIB", rate: 6675 },
    { size: "11.00 X 20", pattern: "SUPER RIB", rate: 6575 },
    { size: "10.00 X 20", pattern: "SUPER RIB", rate: 6375 },
    { size: "8.25 X 20", pattern: "SUPER RIB", rate: 5275 },
    { size: "12.00 X 20", pattern: "SL SL125", rate: 6825 },
    { size: "11.00 X 20", pattern: "SL SL125", rate: 6675 },
    { size: "10.00 X 20", pattern: "SL SL125", rate: 6375 },
    { size: "9.00 X 20", pattern: "SL SL125", rate: 6225 },
    { size: "8.25 X 20", pattern: "SL SL125", rate: 4925 },
    { size: "7.50 X 20", pattern: "SL SL125", rate: 4275 },
    { size: "12.00 X 20", pattern: "SEMI LUG SLR", rate: 7025 },
    { size: "11.00 X 20", pattern: "SEMI LUG SLR", rate: 6675 },
    { size: "12.00 X 20", pattern: "RL", rate: 6475 },
    { size: "11.00 X 20", pattern: "RL", rate: 6225 },
    { size: "8.25 X 20", pattern: "RL", rate: 4325 },
    { size: "12.00 X 20", pattern: "EXPRESS RL", rate: 6675 },
    { size: "11.00 X 20", pattern: "EXPRESS RL", rate: 6425 },
    { size: "12.00 X 20", pattern: "EL", rate: 6925 },
    { size: "11.00 X 20", pattern: "EL", rate: 6675 },
    { size: "12.00 X 20", pattern: "LUG HL", rate: 6925 },
    { size: "11.00 X 20", pattern: "LUG HL", rate: 6675 },
    { size: "12.00 X 20", pattern: "LOGGING LC", rate: 6925 },
    { size: "11.00 X 20", pattern: "LOGGING LC", rate: 6875 },
    { size: "12.00 X 20", pattern: "MINNING MG", rate: 7275 },
    { size: "11.00 X 20", pattern: "MINNING MG", rate: 7400 },
    { size: "10.00 X 20", pattern: "MINNING MG", rate: 6775 },
    { size: "9.00 X 20", pattern: "MINNING MG", rate: 6725 },
    { size: "12.00 X 20", pattern: "RR", rate: 7250 },
    { size: "11.00 X 20", pattern: "RR", rate: 6575 },
    { size: "10.00 X 20", pattern: "RR", rate: 6375 },
    { size: "9.00 X 20", pattern: "RR", rate: 7025 },
    { size: "12.00 X 20", pattern: "RST RIB", rate: 6675 },
    { size: "11.00 X 20", pattern: "RST RIB", rate: 6475 },
    { size: "10.00 X 20", pattern: "RST RIB", rate: 4925 },
    { size: "12.00 X 20", pattern: "RRX", rate: 6625 },
    { size: "11.00 X 20", pattern: "RRX", rate: 5175 },
    { size: "10.00 X 20", pattern: "RRX", rate: 6925 },
    { size: "12.00 X 20", pattern: "RHW", rate: 7025 },
    { size: "11.00 X 20", pattern: "RHW", rate: 6625 },
    { size: "10.00 X 20", pattern: "RHW", rate: 6625 },
    { size: "12.00 X 20", pattern: "RTB", rate: 7125 },
    { size: "11.00 X 20", pattern: "RTB", rate: 7225 },
    { size: "10.00 X 20", pattern: "RTB", rate: 6725 },
    { size: "9.00 X 20", pattern: "RTB", rate: 6575 },
    { size: "8.25 X 20", pattern: "RTB", rate: 7125 },
    { size: "12.00 X 20", pattern: "RADIAL RBR", rate: 7225 },
    { size: "11.00 X 20", pattern: "RADIAL RBR", rate: 6875 },
    { size: "10.00 X 20", pattern: "RADIAL RBR", rate: 7225 },
    { size: "12.00 X 20", pattern: "RADIAL RHB", rate: 7225 },
    { size: "11.00 X 20", pattern: "RADIAL RHB", rate: 6875 },
    { size: "10.00 X 20", pattern: "RADIAL RHB", rate: 7225 },
    { size: "12.00 X 20", pattern: "HOT SL", rate: 5425 },
    { size: "11.00 X 20", pattern: "HOT SL", rate: 5125 },
    { size: "10.00 X 20", pattern: "HOT SL", rate: 4425 },

    // --- LCV ---
    { size: "8.25 X 16", pattern: "RIB BIAS RIB", rate: 3625 },
    { size: "7.50 X 16", pattern: "RIB BIAS RIB", rate: 3425 },
    { size: "7.00 X 16", pattern: "RIB BIAS RIB", rate: 3375 },
    { size: "7.00 X 15", pattern: "RIB BIAS RIB", rate: 3275 },
    { size: "6.70 X 15", pattern: "RIB BIAS RIB", rate: 2680 },
    { size: "8.25 X 16", pattern: "MILER RIB", rate: 3875 },
    { size: "7.50 X 16", pattern: "MILER RIB", rate: 3475 },
    { size: "8.25 X 16", pattern: "RL", rate: 3525 },
    { size: "7.50 X 16", pattern: "RL", rate: 3475 },
    { size: "8.25 X 16", pattern: "RIB LUG MILER RL", rate: 3925 },
    { size: "7.50 X 16", pattern: "RIB LUG MILER RL", rate: 3525 },
    { size: "8.25 X 16", pattern: "EXPRESS RL", rate: 3925 },
    { size: "7.50 X 16", pattern: "EXPRESS RL", rate: 3575 },
    { size: "8.25 X 16", pattern: "SEMI LUG SL", rate: 3675 },
    { size: "7.50 X 16", pattern: "SEMI LUG SL", rate: 3475 },
    { size: "7.00 X 16", pattern: "SEMI LUG SL", rate: 3425 },
    { size: "7.00 X 15", pattern: "SEMI LUG SL", rate: 3275 },
    { size: "235/75R17.5", pattern: "RR", rate: 4975 },
    { size: "225R17.5", pattern: "RR", rate: 4975 },
    { size: "215R17.5", pattern: "RR", rate: 4975 },
    { size: "8.25 X 16", pattern: "RADIAL RST RIB", rate: 3825 },
    { size: "7.50 X 16", pattern: "RADIAL RST RIB", rate: 3325 },
    { size: "235/75R17.5", pattern: "RADIAL RST RIB", rate: 5075 },
    { size: "225R17.5", pattern: "RADIAL RST RIB", rate: 5075 },
    { size: "215R17.5", pattern: "RADIAL RST RIB", rate: 5075 },
    { size: "235/75R17.5", pattern: "BLOCK RRX", rate: 5125 },
    { size: "225R17.5", pattern: "BLOCK RRX", rate: 5125 },
    { size: "215R17.5", pattern: "BLOCK RRX", rate: 5125 },

    // --- JEEP ---
    { size: "6.00 X 16", pattern: "RIB", rate: 2580 },
    { size: "6.50 X 16", pattern: "RIB", rate: 2510 },
    { size: "185 R 16", pattern: "RIB", rate: 2580 },
    { size: "195 D 15", pattern: "RIB", rate: 2550 },
    { size: "F78 X 15", pattern: "RIB", rate: 2880 },
    { size: "215 D 14", pattern: "RIB", rate: 2880 },
    { size: "185 D 14", pattern: "RIB", rate: 2230 },
    { size: "6.00 X 16", pattern: "SEMI LUG RV", rate: 2580 },
    { size: "6.00 X 16", pattern: "SEMI LUG JP", rate: 2580 },
    { size: "6.00 X 16", pattern: "CONVENTIONAL ROVER", rate: 2180 },

    // --- CAR ---
    { size: "6.40 X 15", pattern: "TUD-C/PC LEGEND", rate: 2150 },
    { size: "5.90 X 15", pattern: "TUD-C/PC LEGEND", rate: 2130 },
    { size: "5.20 X 14", pattern: "TUD-C/PC LEGEND", rate: 1980 },
    { size: "6.40 X 13", pattern: "TUD-C/PC LEGEND", rate: 1950 },
    { size: "5.60 X 13", pattern: "TUD-C/PC LEGEND", rate: 2105 },
    { size: "5.65 X 12", pattern: "TUD-C/PC LEGEND", rate: 2005 },
    { size: "4.50 X 12", pattern: "TUD-C/PC LEGEND", rate: 1845 },

    // --- RADIAL 15"/16" ---
    { size: "205 R 16", pattern: "TUD-R/RCP", rate: 2530 },
    { size: "235 R 15", pattern: "TUD-R/RCP", rate: 2730 },
    { size: "215 R 15", pattern: "TUD-R/RCP", rate: 2600 },
    { size: "205 R 15", pattern: "TUD-R/RCP", rate: 2530 },
    { size: "195 R 15", pattern: "TUD-R/RCP", rate: 2500 },
    { size: "165 R 15", pattern: "TUD-R/RCP", rate: 2130 },
    { size: "235 R 16", pattern: "TUD-R/RCP", rate: 2730 },

    // --- RADIAL 14" ---
    { size: "215 R 14", pattern: "TUD-R/RCP", rate: 2500 },
    { size: "195 R 14", pattern: "TUD-R/RCP", rate: 2500 },
    { size: "185 R 14", pattern: "TUD-R/RCP", rate: 2500 },
    { size: "175 R 14", pattern: "TUD-R/RCP", rate: 2230 },
    { size: "165 R 14", pattern: "TUD-R/RCP", rate: 2080 },
    { size: "155 R 14", pattern: "TUD-R/RCP", rate: 1980 },
    { size: "215 R 16", pattern: "TUD-R/RCP", rate: 2630 },

    // --- RADIAL 12"/13" ---
    { size: "175 R 13", pattern: "TUD-R/RCP", rate: 1980 },
    { size: "165 R 13", pattern: "TUD-R/RCP", rate: 1830 },
    { size: "155 R 13", pattern: "TUD-R/RCP", rate: 1800 },
    { size: "145 R 13", pattern: "TUD-R/RCP", rate: 1930 },
    { size: "145 R 12", pattern: "TUD-R/RCP", rate: 1930 },
    { size: "155 R 12", pattern: "TUD-R/RCP", rate: 2000 },
    { size: "165 R 12", pattern: "TUD-R/RCP", rate: 1700 },

    // --- AUTO ---
    { size: "5.00 X 10", pattern: "TUD-C/PC", rate: 1480 },
    { size: "4.50 X 10", pattern: "TUD-C/PC", rate: 1430 },
    { size: "5.00 X 12", pattern: "TUD-C/PC", rate: 1530 },

    // --- SCV ---
    { size: "195 D 15", pattern: "RIB SVR/PC/TUD-C", rate: 2100 },
    { size: "185 D 14", pattern: "RIB SVR/PC/TUD-C", rate: 2000 },
    { size: "175 D 14", pattern: "RIB SVR/PC/TUD-C", rate: 2000 },
    { size: "165 D 14", pattern: "RIB SVR/PC/TUD-C", rate: 1800 },
    { size: "165 D 13", pattern: "RIB SVR/PC/TUD-C", rate: 1700 },
    { size: "165 D 12", pattern: "RIB SVR/PC/TUD-C", rate: 1650 },
    { size: "155 D 12", pattern: "RIB SVR/PC/TUD-C", rate: 1600 },
    { size: "185 R 14", pattern: "RADIAL RCP/TUD-R", rate: 2050 },
    { size: "175 R 14", pattern: "RADIAL RCP/TUD-R", rate: 1950 },
    { size: "165 R 14", pattern: "RADIAL RCP/TUD-R", rate: 1800 },
    { size: "165 R 13", pattern: "RADIAL RCP/TUD-R", rate: 1700 },
    { size: "155 R 13", pattern: "RADIAL RCP/TUD-R", rate: 1650 },

    // --- TRACTOR TRAILER FRONT ---
    { size: "9.00 X 16", pattern: "RIB TF", rate: 4700 },
    { size: "6.50 X 16", pattern: "RIB TF", rate: 2600 },
    { size: "6.00 X 16", pattern: "RIB TF", rate: 2400 },
    { size: "5.50 X 16", pattern: "RIB TF", rate: 2500 },
    { size: "6.50 X 20", pattern: "RIB TF", rate: 3250 },
    { size: "7.50 X 16", pattern: "RIB TF", rate: 3250 },
    { size: "9.00 X 16", pattern: "SEMILUG SL", rate: 4700 },
    { size: "9.00 X 16", pattern: "CONVENTIONAL SHK", rate: 5000 },
    { size: "6.00 X 16", pattern: "CONVENTIONAL SHK", rate: 2250 },

    // --- TRACTOR TRAILER REAR ---
    { size: "16.9 X 28", pattern: "SHK PLUS", rate: 16225 },
    { size: "13.6 X 28", pattern: "SHK PLUS", rate: 12799 },
    { size: "12.4 X 28", pattern: "SHK PLUS", rate: 12225 },
    { size: "14.9 X 28", pattern: "SHK PLUS", rate: 14225 },
    { size: "17.5 X 25", pattern: "SHK PLUS", rate: 27975 },
    { size: "23.5 X 25", pattern: "SHK PLUS", rate: 54955 },
    { size: "23.1 X 26", pattern: "SHK PLUS", rate: 32325 },
    { size: "16.9 X 30", pattern: "SHK PLUS", rate: 22522 },

    // --- OTR ---
    { size: "14.00 X 25", pattern: "SHK PLUS", rate: 19625 },
    { size: "13.00 X 24", pattern: "SHK PLUS", rate: 14225 },
    { size: "14.00 X 24", pattern: "SHK PLUS", rate: 19625 }
];

let customerDataMap = {};

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
