
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import type { Budget, CompanyConfig } from '../types';

/**
 * Generates a pixel-perfect PDF by capturing the visible A4 DOM element (WYSIWYG mode).
 * The resulting PDF matches exactly what the user sees on screen.
 */
export const generatePDFFromElement = async (
    element: HTMLElement,
    filename: string
): Promise<void> => {
    // Scale x2 for high-DPI / retina quality
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.97);
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();   // 210 mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm

    // Fit image to full A4 page
    doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    doc.save(filename);
};

const renderHeader = (doc: jsPDF, company: CompanyConfig) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 15;

    // Logo (if exists) - FIXED: Proportional scaling to avoid any deformation
    if (company.logoUrl) {
        try {
            const props = doc.getImageProperties(company.logoUrl);
            const ratio = props.width / props.height;
            const targetWidth = 25;
            const targetHeight = targetWidth / ratio;
            doc.addImage(company.logoUrl, 'PNG', 15, yPos, targetWidth, targetHeight);
        } catch (e) {
            // Fallback to 25x25 if property check fails
            doc.addImage(company.logoUrl, 'PNG', 15, yPos, 25, 25);
        }
    }

    // Company Info (Top Right)
    doc.setFontSize(company.pdfHeaderFontSize || 14);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(company.name.toUpperCase(), pageWidth - 15, yPos + 5, { align: 'right' });

    doc.setFontSize(company.pdfAddressFontSize || 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(company.address, pageWidth - 15, yPos + 10, { align: 'right' });
    doc.text(`T: ${company.phone} | CIF: ${company.cif}`, pageWidth - 15, yPos + 14, { align: 'right' });
    doc.text(company.email, pageWidth - 15, yPos + 18, { align: 'right' });

    // Header Line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(15, yPos + 23, pageWidth - 15, yPos + 23);

    return yPos + 28;
};

export const generatePDF = (budget: Budget, company: CompanyConfig, showPrices: boolean = true, showTotals: boolean = true) => {
    const doc = new jsPDF();
    const lineSpacing = company.pdfLineSpacing || 1.15;
    doc.setLineHeightFactor(lineSpacing);
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = renderHeader(doc, company);

    // Document Info (Budget Number & Date)
    doc.setFontSize(company.pdfTitleFontSize || 9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(`PRESUPUESTO: ${budget.number}`, 15, yPos + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    const date = new Date(budget.date).toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
    doc.text(`FECHA: ${date}`, 15, yPos + 10);

    // Client Info (Aligned Right)
    doc.setFontSize(company.pdfClientFontSize || 9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('CLIENTE:', pageWidth - 15, yPos + 5, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.text(budget.clientData.name.toUpperCase(), pageWidth - 15, yPos + 10, { align: 'right' });
    doc.setFontSize(company.pdfAddressFontSize || 7);
    doc.text(budget.clientData.address, pageWidth - 15, yPos + 14, { align: 'right' });
    doc.text(`NIF: ${budget.clientData.nif}`, pageWidth - 15, yPos + 18, { align: 'right' });

    yPos += 28;

    const allTableBody: any[] = [];

    budget.items.forEach((item, index) => {
        // Row 1: Category (Header)
        // Add a larger top padding for categories that are not the first one to create "job separation"
        const categoryTopPadding = index === 0 ? 2 : 10;

        allTableBody.push([
            {
                content: stripHtmlAndStyle(item.category).toUpperCase(),
                colSpan: 3,
                styles: {
                    fontStyle: 'normal',
                    textColor: [37, 99, 235],
                    fontSize: company.pdfCategoryFontSize || 9,
                    cellPadding: { top: categoryTopPadding, bottom: 0, left: 2, right: 2 }
                }
            }
        ]);

        // Row 2: Description, Quantity, Price
        allTableBody.push([
            {
                content: stripHtmlAndStyle(item.description),
                styles: { halign: 'left', cellPadding: { top: 0, bottom: 2, left: 2, right: 2 } }
            },
            {
                content: item.quantity.toString(),
                styles: { halign: 'center', cellPadding: { top: 0, bottom: 2 } }
            },
            {
                content: showPrices ? `${item.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €` : '',
                styles: { halign: 'right', cellPadding: { top: 0, bottom: 2, left: 2, right: 2 } }
            }
        ]);
    });

    autoTable(doc, {
        startY: yPos,
        head: [[
            { content: 'CONCEPTO', styles: { halign: 'left' } },
            { content: 'CANT.', styles: { halign: 'center' } },
            { content: 'IMPORTE', styles: { halign: 'right' } }
        ]],
        body: allTableBody,
        theme: 'plain',
        margin: { left: 15, right: 15, top: 46 },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [37, 99, 235],
            fontSize: company.pdfTableHeadFontSize || 10,
            fontStyle: 'bold',
            cellPadding: { top: 3, bottom: 2, left: 2, right: 2 },
            lineWidth: { bottom: 0.1 },
            lineColor: [37, 99, 235]
        },
        styles: {
            fontSize: company.pdfFontSize || 9,
            textColor: [80, 80, 80],
            overflow: 'linebreak',
            cellPadding: { top: 0.2, bottom: 0.5, left: 2, right: 2 }
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 20 },
            2: { cellWidth: 30 }
        },
        didDrawPage: (data) => {
            if (data.pageNumber > 1) {
                renderHeader(doc, company);
            }
        },
        didParseCell: (data) => {
            if (data.row.index % 2 === 0) {
                (data.cell.styles as any).pageBreak = 'avoid';
            }
        }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // --- TOTALS SECTION ---
    if (showTotals) {
        const totalsW = 60;
        const totalsX = pageWidth - 15 - totalsW;

        const drawTotalLine = (label: string, value: string, currentY: number, isBold = false, isHighlighted = false) => {
            if (isBold) {
                doc.setFont('helvetica', 'bold');
                if (isHighlighted) {
                    doc.setTextColor(37, 99, 235); // BLUE
                } else {
                    doc.setTextColor(30, 41, 59);
                }
            } else {
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 116, 139);
            }
            doc.text(label, totalsX, currentY);
            doc.text(value, pageWidth - 15, currentY, { align: 'right' });
            return currentY + 6;
        };

        if (yPos + 55 > 280) {
            doc.addPage();
            yPos = renderHeader(doc, company) + 10;
        }

        yPos = drawTotalLine('SUMA IMPORTES', `${budget.subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, yPos);
        yPos = drawTotalLine(`I.V.A. (${(budget.ivaRate * 100).toFixed(0)}%)`, `${budget.ivaAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, yPos);
        yPos += 2;
        doc.setDrawColor(200, 200, 200);
        doc.line(totalsX, yPos - 1, pageWidth - 15, yPos - 1);
        drawTotalLine('TOTAL PRESUPUESTO', `${budget.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, yPos + 4, true, true);
    }

    // --- CLOSURE & NOTES ---
    yPos += 20;
    if (yPos + 50 > 280) {
        doc.addPage();
        yPos = renderHeader(doc, company) + 10;
    }

    if (budget.notes) {
        doc.setFontSize(company.pdfNotesFontSize || 8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text('NOTAS Y CONDICIONES:', 15, yPos);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        const splitNotes = stripHtmlAndStyle(budget.notes);
        const splitLines = doc.splitTextToSize(splitNotes, pageWidth - 30);
        doc.setFontSize(company.pdfNotesFontSize || 7);
        doc.text(splitLines, 15, yPos + 5);
        yPos += (splitLines.length * 4) + 10;
    }

    // --- SIGNATURES ---
    const closureH = 65;
    if (yPos + closureH > 280) {
        doc.addPage();
        yPos = renderHeader(doc, company) + 10;
    }

    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');

    doc.text('ACEPTACIÓN DEL PRESUPUESTO', 15, yPos + 10);

    const companyX = pageWidth - 65;
    const companyName = company.name ? company.name.toUpperCase() : 'DLKOM';
    doc.text(`FIRMADO: ${companyName}`, companyX, yPos + 10);

    // SEAL - FIXED: Proportional scaling and smaller size
    if (company.sealUrl) {
        try {
            const props = doc.getImageProperties(company.sealUrl);
            const ratio = props.width / props.height;
            const targetWidth = 40; // Slightly larger seal (40mm wide)
            const targetHeight = targetWidth / ratio;
            doc.addImage(company.sealUrl, 'PNG', companyX, yPos + 15, targetWidth, targetHeight, undefined, 'SLOW');
        } catch (e) {
            // Fallback to previous safe dimensions
            doc.addImage(company.sealUrl, 'PNG', companyX, yPos + 15, 40, 24);
        }
    }

    // Client Signature Line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos + 35, 75, yPos + 35);
    doc.setFont('helvetica', 'normal');
    doc.text('Firma Cliente', 15, yPos + 39);

    const filename = `Presupuesto_${budget.number}_${budget.clientData.name.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
};

const stripHtmlAndStyle = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ');
};
