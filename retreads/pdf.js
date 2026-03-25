// ==========================================
// pdf.js - The Printer
// Handles data collection, math calculations, and jsPDF document generation.
// ==========================================

async function generateQuotation() {
    // 1. Gather all data and sync to database
    const data = await gatherQuotationData();
    if (!data) return; // Stop if validation failed

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 2. Draw sections sequentially
    drawHeader(doc, data);
    const finalY = drawTable(doc, data);
    drawFooter(doc, data, finalY);

    // --- NEW LOGIC: Add Catalog Page ---
    if (typeof CATALOG_BASE64 !== 'undefined' && CATALOG_BASE64.length > 100) {
        doc.addPage();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Add a clean title at the top of the second page
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Retread Patterns Catalogue", pageWidth / 2, 15, { align: "center" });

        // Draw the image (leaves a 10mm margin, stretches cleanly to A4 proportions)
        doc.addImage(CATALOG_BASE64, 'JPEG', 10, 25, pageWidth - 20, pageHeight - 35);
    }

    // 3. Output PDF
    window.open(doc.output('bloburl'), '_blank');
}

async function gatherQuotationData() {
    const custPhone = document.getElementById('customer-phone').value.trim();
    if(!custPhone) {
        if(typeof showToast === "function") showToast("Please search and select a Customer / Organization");
        else alert("Please search and select a Customer");
        return null;
    }
    
    const customer = customerDataMap[custPhone];
    if(!customer) {
        if(typeof showToast === "function") showToast(`Customer Phone "${custPhone}" not found!`);
        else alert("Customer not found!");
        return null;
    }

    let itemsData = [];
    let tableItems = []; // Pre-builds the table so we don't have to read the DOM twice
    let grandTotal = 0;

    for (let i = 1; i <= rowCount; i++) {
        const sizeInput = document.getElementById(`size-${i}`);
        const patternInput = document.getElementById(`pattern-${i}`);
        if (!sizeInput || !patternInput) continue;
        
        let sizeVal = sizeInput.value.trim().toUpperCase();
        let patternVal = patternInput.value.trim().toUpperCase();
        
        // Combine them for the table description
        let desc = (sizeVal && patternVal) ? `${sizeVal} - ${patternVal}` : (sizeVal || patternVal || "CUSTOM ITEM");
        
        const basePrice = parseFloat(document.getElementById(`base-price-${i}`).value) || 0;
        const markup = parseFloat(document.getElementById(`markup-${i}`).value) || 0;
        const qty = parseFloat(document.getElementById(`qty-${i}`).value) || 1;
        
        if (desc && (basePrice > 0 || markup > 0)) {
            itemsData.push({ id: i, desc, basePrice, markup, qty });
            
            // Calculate math for the PDF table
            const finalCMP = basePrice + markup; 
            const basicRate = finalCMP / 1.18; 
            const amount = basicRate * qty;
            const gst = amount * 0.18;
            const total = amount + gst; 
            grandTotal += total;

            tableItems.push([desc, basicRate.toFixed(2), qty, amount.toFixed(2), gst.toFixed(2), total.toFixed(2)]);
        }
    }

    if(itemsData.length === 0) {
        if(typeof showToast === "function") showToast("Please add at least one valid item.");
        return null;
    }

    let refNumber = "BTT/25-26/XXXX";
    const paymentMethod = document.getElementById('payment-method') ? document.getElementById('payment-method').value : "";
    const transportMode = document.getElementById('transport-mode') ? document.getElementById('transport-mode').value : "";

    try {
        if(typeof showToast === "function") showToast("Syncing quotation to database...", "success");
        const result = await apiSaveQuotation(custPhone, itemsData, paymentMethod, transportMode, "BTT");
        if(result.result === 'success') {
            refNumber = result.refNumber;
        }
    } catch (error) {
        console.error("DB Save Error:", error);
        if(typeof showToast === "function") showToast("Offline Mode: Reference number won't sync.", "error");
    }

    return {
        customer,
        custPhone,
        itemsData,
        tableItems,
        grandTotal,
        refNumber,
        paymentMethod,
        transportMode,
        dateStr: new Date().toLocaleDateString('en-GB')
    };
}

function drawHeader(doc, data) {
    const { customer, custPhone, refNumber, dateStr } = data;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Background & Watermark
    doc.setFillColor(255, 245, 245);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    if (typeof WATERMARK_BASE64 !== 'undefined' && WATERMARK_BASE64.length > 100) {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({opacity: 0.10})); 
        const wmWidth = 200; 
        const wmHeight = 200;
        const wmX = (pageWidth - wmWidth) / 2;
        const wmY = (pageHeight - wmHeight) / 2;
        doc.addImage(WATERMARK_BASE64, 'PNG', wmX, wmY, wmWidth, wmHeight);
        doc.restoreGraphicsState();
    }

   // Header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(FIRM_DETAILS.name, 14, 20);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    if (FIRM_DETAILS.addressLine1) doc.text(FIRM_DETAILS.addressLine1, 14, 25);
    if (FIRM_DETAILS.addressLine2) doc.text(FIRM_DETAILS.addressLine2, 14, 30);
    if (FIRM_DETAILS.addressLine3) doc.text(FIRM_DETAILS.addressLine3, 14, 35);
    if (FIRM_DETAILS.gstin) doc.text(FIRM_DETAILS.gstin, 14, 40);

    // Logo
    const logoX = pageWidth - 14 - 26; 
    if (typeof LOGO_BASE64 !== 'undefined' && LOGO_BASE64.length > 100) {
        doc.addImage(LOGO_BASE64, 'PNG', logoX, 15, 70, 25);
    } else {
        doc.setFontSize(12);
        doc.setTextColor(200, 0, 0);
        doc.text("[LOGO]", logoX, 25);
        doc.setTextColor(0, 0, 0);
    }

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("QUOTATION", 105, 55, null, null, "center");

    // TO Section
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("To,", 14, 65);
    
    const toName = customer.orgName ? customer.orgName : customer.name;
    doc.text(toName, 14, 70); 
    doc.text(`${customer.taluk}, ${customer.district}, ${customer.state} - ${customer.pincode}`, 14, 75);
    
    let currentY = 75;

    // Check for GSTIN and print if available
    if (customer.gstin && customer.gstin.trim() !== "") {
        currentY += 5;
        doc.text(`GSTIN: ${customer.gstin}`, 14, currentY);
    }
    
    let prefix = "";
    const g = customer.gender ? customer.gender.toLowerCase() : "";
    if (g.startsWith("m") && !g.startsWith("ms")) prefix = "Mr.";
    else if (g.startsWith("f") || g.startsWith("ms")) prefix = "Ms.";
    
    const formattedPhone = "+91 " + custPhone.substring(0, 5) + " " + custPhone.substring(5);
    
    doc.setFont("helvetica", "normal");
    currentY += 7; // Drop down 7mm dynamically for Kind Attention
    const textPart1 = "Kind Attention: ";
    doc.text(textPart1, 14, currentY);
    const width1 = doc.getTextWidth(textPart1);

    doc.setFont("helvetica", "bold");
    const textPart2 = `${prefix} ${customer.name} (${formattedPhone})`;
    doc.text(textPart2, 14 + width1, currentY);
    
    // Date & Ref Section
    doc.setFont("helvetica", "bold");
    const dateText = `Date: ${dateStr}`;
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, pageWidth - 14 - dateWidth, 65); 

    const refPrefix = "Ref. # ";
    const refLabelWidth = doc.getTextWidth(refPrefix);
    
    doc.setFont("helvetica", "normal");
    const refValWidth = doc.getTextWidth(refNumber);
    
    const totalRefWidth = refLabelWidth + refValWidth;
    
    doc.setFont("helvetica", "bold");
    doc.text(refPrefix, pageWidth - 14 - totalRefWidth, 70); 
    
    doc.setFont("helvetica", "normal");
    doc.text(refNumber, pageWidth - 14 - totalRefWidth + refLabelWidth, 70);

    // Intro
    doc.setFont("helvetica", "normal");
    currentY += 8; // Dynamically drop down 8mm from the Kind Attention line
    doc.text("We are pleased to provide our quotation for tyre retreading services.", 14, currentY);
    currentY += 5; // Drop down 5mm for the second line
    doc.text("Kindly refer to the table below.", 14, currentY);
}

function drawTable(doc, data) {
    // Shift table down dynamically by 5mm if a GSTIN exists
    const tableStartY = (data.customer.gstin && data.customer.gstin.trim() !== "") ? 105 : 100;

    doc.autoTable({
        startY: tableStartY, 
        head: [['ITEM', 'BASIC', 'QTY', 'AMOUNT', 'GST', 'TOTAL']],
        body: data.tableItems,
        theme: 'grid',
        headStyles: { 
            fillColor: [255, 250, 250], 
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            fontStyle: 'bold'
        },
        bodyStyles: {
            fillColor: [255, 250, 250], 
            lineColor: [0, 0, 0],
            lineWidth: 0.1
        },
        styles: { fontSize: 9, halign: 'center' },
        columnStyles: { 0: { halign: 'left', cellWidth: 70 } }, 
        foot: [['', '', '', '', 'Grand Total:', Math.round(data.grandTotal).toFixed(2)]],
        footStyles: {
            fillColor: [255, 209, 209], 
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center'
        }
    });
    return doc.lastAutoTable.finalY; // Returns the bottom Y coordinate for the footer
}

function drawFooter(doc, data, finalY) {
    let currentY = finalY + 10;
    const transportTerm = data.transportMode === 'exw' ? "Transportation costs extra." : "Free transportation of material to and from your site.";
    const paymentTerm = data.paymentMethod === 'advance' ? "Advance NEFT; before delivery." : "Credit; Within seven (7) days of material delivery.";
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Note:", 14, currentY);
    currentY += 5;
    doc.text("1. The above products are perfectly suited to your utility, based on our understanding of your need.", 14, currentY);
    currentY += 5;
    doc.text("2. All the above products are under standard warranty.", 14, currentY);
    currentY += 5;
    doc.text("3. Kindly refer to the pattern catalogue attached for visual references.", 14, currentY);
    currentY += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions", 14, currentY);
    doc.setFont("helvetica", "normal");
    currentY += 5;
    
    const terms = [
        "1. The above rates are indicative of all tax breakup.",
        "2. Quotation valid for 7 days from the date of receipt.",
        `3. Payment Terms: ${paymentTerm}`,
        `4. ${transportTerm}`
    ];

    terms.forEach(term => {
        doc.text(term, 14, currentY);
        currentY += 5;
    });

    currentY += 5;
    
    doc.setFont("helvetica", "bold");
    doc.text("Our account details for your reference:", 14, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.text(`Account Name: ${FIRM_DETAILS.bankAccountName}`, 14, currentY);
    currentY += 5;
    doc.text(`Bank: ${FIRM_DETAILS.bankNameBranch}`, 14, currentY);
    currentY += 5;
    doc.text(`A/c No.: ${FIRM_DETAILS.bankAccountNumber}`, 14, currentY);
    currentY += 5;
    doc.text(`IFSC: ${FIRM_DETAILS.bankIFSC}`, 14, currentY);

    doc.setFont("helvetica", "bold"); 
    currentY += 10;
    doc.text("Regards,", 14, currentY);
    currentY += 5;
    doc.text(FIRM_DETAILS.regardsName, 14, currentY);
    currentY += 5;
    doc.text(FIRM_DETAILS.phoneNumber, 14, currentY);
}
