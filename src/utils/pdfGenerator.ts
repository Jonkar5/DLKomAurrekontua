import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Budget, CompanyConfig } from '../types';

/**
 * Renders HTML-like rich text into the PDF at the specified position.
 */
const renderRichText = (doc: jsPDF, html: string, x: number, y: number, maxWidth: number) => {
    const fontSizeNormal = 7.5;
    const fontSizeLarge = 10;
    const fontSizeSmall = 6.5;

    doc.setFontSize(fontSizeNormal);
    doc.setFont("helvetica", "normal");

    let text = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<div>/gi, '')
        .replace(/&nbsp;/gi, ' ');

    const segments = text.split(/(<[^>]+>)/g);
    let currentX = x;
    let currentY = y;
    const lineHeight = 4;

    segments.forEach(segment => {
        if (segment === '<b>') {
            doc.setFont("helvetica", "bold");
        } else if (segment === '</b>') {
            doc.setFont("helvetica", "normal");
        } else if (segment === '<i>') {
            doc.setFont("helvetica", "italic");
        } else if (segment === '</i>') {
            doc.setFont("helvetica", "normal");
        } else if (segment.includes('<font size="5">')) {
            doc.setFontSize(fontSizeLarge);
        } else if (segment.includes('<font size="2">')) {
            doc.setFontSize(fontSizeSmall);
        } else if (segment.includes('</font>')) {
            doc.setFontSize(fontSizeNormal);
        } else if (segment.startsWith('<')) {
            // Ignore other tags
        } else if (segment) {
            const lines = segment.split('\n');
            lines.forEach((line, i) => {
                if (i > 0) {
                    currentY += lineHeight;
                    currentX = x;
                }

                if (line) {
                    const words = line.split(' ');
                    words.forEach(word => {
                        const wordWidth = doc.getTextWidth(word + ' ');
                        if (currentX + wordWidth > x + maxWidth) {
                            currentY += lineHeight;
                            currentX = x;
                        }
                        doc.text(word + ' ', currentX, currentY);
                        currentX += wordWidth;
                    });
                }
            });
        }
    });

    return currentY + lineHeight;
};

const renderHeader = (doc: jsPDF, budget: Budget, company: CompanyConfig) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const yPos = 12;

    if (company.logoUrl) {
        try {
            doc.addImage(company.logoUrl, 'PNG', 15, yPos, 18, 0);
        } catch (e) { }
    }

    // Harmonious Right Header
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("PROYECTO", pageWidth - 15, yPos + 4, { align: "right" });

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(`${budget.number || '---'}`, pageWidth - 15, yPos + 9, { align: "right" });

    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.1);
    doc.line(15, yPos + 16, pageWidth - 15, yPos + 16);

    return yPos + 22;
};

export const generatePDF = (budget: Budget, company: CompanyConfig, showPrices: boolean = true) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    let yPos = renderHeader(doc, budget, company);

    // --- INFO ---
    const iCol1 = 15;
    const iCol2 = pageWidth / 2 + 5;
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(200, 200, 200);
    doc.text("EMISOR", iCol1, yPos);
    doc.text("CLIENTE", iCol2, yPos);

    yPos += 4;
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);

    let cY = yPos;
    doc.setFont("helvetica", "bold");
    doc.text(company.name, iCol1, cY);
    doc.setFont("helvetica", "normal");
    cY += 3.5;
    doc.text(company.address, iCol1, cY);
    cY += 3.5;
    doc.text(`CIF: ${company.cif} | Tel: ${company.phone}`, iCol1, cY);
    cY += 3.5;
    doc.text(company.email, iCol1, cY);

    let lY = yPos;
    doc.setFont("helvetica", "bold");
    doc.text(budget.clientData.name || '---', iCol2, lY);
    doc.setFont("helvetica", "normal");
    lY += 3.5;
    const clAddr = budget.clientData.address || '';
    const clCity = `${budget.clientData.postalCode || ''} ${budget.clientData.city || ''}`.trim();
    doc.text(`${clAddr}${clCity ? `, ${clCity}` : ''}`, iCol2, lY);
    lY += 3.5;
    doc.text(`NIF: ${budget.clientData.nif || '---'} | Tel: ${budget.clientData.phone || '---'}`, iCol2, lY);
    lY += 3.5;
    doc.text(budget.clientData.email || '---', iCol2, lY);

    yPos = Math.max(cY, lY) + 15;

    // --- DATE ABOVE TABLE ---
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 180, 180);
    doc.text("FECHA:", 15, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const dateStr = new Date(budget.date).toLocaleDateString();
    doc.text(dateStr, 25, yPos);
    yPos += 5;

    // --- UNIFIED TABLE ---
    const allTableBody: any[] = [];
    const categoriesFound = Array.from(new Set(budget.items.map(i => i.category || 'Varios')));

    categoriesFound.forEach((cat, cIdx) => {
        const catItems = budget.items.filter(item => (item.category || 'Varios') === cat);
        if (catItems.length === 0) return;

        // Category Row (Small & Delicate)
        allTableBody.push([
            { content: cat.toUpperCase(), colSpan: 3, styles: { fontStyle: 'bold', textColor: [37, 99, 235], cellPadding: { top: cIdx === 0 ? 2 : 3, bottom: 0.5 }, fontSize: 6.5 } }
        ]);

        catItems.forEach(item => {
            allTableBody.push([
                { content: item.description, styles: { cellPadding: { top: 1, bottom: 1 } } },
                { content: item.quantity.toString(), styles: { halign: 'center', cellPadding: { top: 1, bottom: 1 } } },
                { content: showPrices ? `${(item.quantity * item.price).toFixed(2)} €` : '', styles: { halign: 'right', cellPadding: { top: 1, bottom: 1 } } }
            ]);
        });
    });

    autoTable(doc, {
        startY: yPos,
        head: [[
            { content: 'CONCEPTO', styles: { halign: 'center' } },
            { content: 'CANTIDAD', styles: { halign: 'center' } },
            { content: 'IMPORTE', styles: { halign: 'right' } }
        ]],
        body: allTableBody,
        theme: 'plain',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [37, 99, 235],
            fontSize: 8,
            fontStyle: 'bold',
            cellPadding: 2,
            lineWidth: { bottom: 0.1 },
            lineColor: [37, 99, 235]
        },
        styles: {
            fontSize: 7,
            textColor: [80, 80, 80],
            overflow: 'linebreak'
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 20 },
            2: { cellWidth: 25 }
        },
        margin: { left: 15, right: 15 },
        didDrawPage: (data) => {
            if (data.pageNumber > 1) {
                renderHeader(doc, budget, company);
            }
        }
    });

    yPos = (doc as any).lastAutoTable.finalY + 45; // INCREASED SPACING BEFORE TOTALS

    // --- CLOSURE ---
    const closureH = 70;
    if (yPos + closureH > 275) {
        doc.addPage();
        renderHeader(doc, budget, company);
        yPos = 35;
    }

    const tX1 = pageWidth - 80;
    const tX2 = pageWidth - 15;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Base Imponible:", tX1, yPos);
    doc.text(`${budget.subtotal.toFixed(2)} €`, tX2, yPos, { align: "right" });
    yPos += 4.5;
    doc.text(`IVA (${(budget.ivaRate * 100).toFixed(0)}%):`, tX1, yPos);
    doc.text(`${budget.ivaAmount.toFixed(2)} €`, tX2, yPos, { align: "right" });
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("TOTAL PROYECTO:", tX1, yPos);
    doc.text(`${budget.total.toFixed(2)} €`, tX2, yPos, { align: "right" });

    yPos += 12;

    if (company.paymentTerms) {
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(120, 120, 120);
        doc.text("FORMA DE PAGO", 15, yPos);
        yPos += 4.5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);

        const amountColX = 75; // ULTRA CLOSE

        const pLines = company.paymentTerms.split('\n');
        pLines.forEach(line => {
            if (!line.trim()) return;
            const pctMatch = line.match(/(\d+(?:[.,]\d+)?)\s*%/);
            if (pctMatch) {
                const pct = parseFloat(pctMatch[1].replace(',', '.'));
                const amount = (budget.total * pct) / 100;
                doc.text(line, 15, yPos);
                doc.setFont("helvetica", "bold");
                doc.text(`${amount.toFixed(2)} €`, amountColX, yPos, { align: "right" });
                doc.setFont("helvetica", "normal");
            } else {
                doc.text(line, 15, yPos);
            }
            yPos += 3.5;
        });
        yPos += 8;
    }

    const sY = yPos + 5;
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 220, 220);
    doc.text("CONFORME EMPRESA", 45, sY, { align: "center" });
    doc.text("CONFORME CLIENTE", pageWidth - 45, sY, { align: "center" });

    if (company.sealUrl) {
        try { doc.addImage(company.sealUrl, 'PNG', 25, sY + 2, 35, 0); } catch (e) { }
    }
    const cSig = budget.clientSignature;
    if (cSig && cSig.startsWith('data:image')) {
        try { doc.addImage(cSig, 'PNG', pageWidth - 65, sY + 2, 45, 0); } catch (e) { }
    }

    doc.setDrawColor(245, 245, 245);
    doc.line(20, sY + 30, 70, sY + 30);
    doc.line(pageWidth - 70, sY + 30, pageWidth - 20, sY + 30);

    // --- NOTES (LAST PAGE) ---
    if (budget.notes || company.defaultNotes) {
        doc.addPage();
        renderHeader(doc, budget, company);
        yPos = 55; // REDUCED TOP MARGIN AS REQUESTED
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(150, 150, 150);
        doc.text("NOTAS Y CONDICIONES", 15, yPos);
        yPos += 12;
        const nText = budget.notes || company.defaultNotes;
        renderRichText(doc, nText, 15, yPos, pageWidth - 30);
    }

    doc.save(`Proyecto_${budget.number || 'borrador'}.pdf`);
};
