# BTK Quotation Portal

A unified, serverless web application designed to automate the creation, management, and tracking of service quotations for new tyre sales and tyre retreading operations. 

## 🎯 Problem Statement & Purpose
Generating professional quotations traditionally requires redundant manual data entry, disconnected pricing matrices, and inefficient document formatting. This portal solves these bottlenecks by providing a lightning-fast, mobile-responsive interface that ensures data is never entered twice. It automatically fetches cached customer records, calculates dynamic tax/markup math, and renders pixel-perfect PDFs on the fly while seamlessly syncing all transactional data to a centralized cloud ledger.

## ⚙️ Technical Architecture
The application features a strictly decoupled frontend and backend, allowing for high operational efficiency, instant modular scalability, and zero hosting costs.

### **Frontend (Client-Side)**
* **Tech Stack:** Vanilla HTML5, CSS3, and JavaScript. Hosted statically via GitHub Pages.
* **Document Rendering:** Utilizes `jsPDF` and `jsPDF-AutoTable` for client-side PDF generation. Document elements (like the GSTIN fields and tables) use dynamic Y-coordinate math to prevent overlapping text and ensure perfect layout flows.
* **State & Data Management:** Implements an aggressive client-side caching strategy. Instead of querying the database per keystroke, the app fetches the entire customer database via a formatted Google Sheets CSV endpoint on load, enabling instant, zero-latency autocomplete for the search UI.
* **Modularity:** Codebase is strictly separated by concern (`api.js` for fetches, `pdf.js` for rendering, `ui.js` for DOM manipulation, and `btkProfile.js` for isolated firm credentials). 

### **Backend (Server-Side / Database)**
* **Tech Stack:** Google Apps Script (GAS) and Google Sheets.
* **API Layer:** A centralized GAS Web App acts as the REST API endpoint (`doPost`), handling cross-origin HTTP POST requests containing stringified JSON payloads.
* **Database Ledger:** A single master Google Sheet operates as a NoSQL-like document store. It relies on a custom routing variable (`prefix: "BTK" | "BTT"`) sent from the frontend to intelligently classify, parse, and store complex JSON item arrays (New Tyres vs. Retreads) into the correct chronological records without requiring database schema changes.

## 🚀 Deployment & Cloning
Because the frontend is entirely decoupled from the database, spinning up a new firm instance requires zero backend rewrites. Simply duplicate the Google Sheet, deploy a new Apps Script Web App URL, and update the single `config.js` endpoint variables in the frontend codebase.
