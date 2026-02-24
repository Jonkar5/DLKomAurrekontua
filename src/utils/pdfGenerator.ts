
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Budget, CompanyConfig } from '../types';

const drawIcon = (doc: jsPDF, type: 'address' | 'id' | 'phone' | 'email' | 'location' | 'cp', x: number, y: number) => {
    // Professional Palette
    const colors: Record<string, [number, number, number]> = {
        address: [37, 99, 235],  // Blue
        id: [100, 116, 139],       // Slate 500
        phone: [22, 163, 74],    // Green
        email: [37, 99, 235],    // Blue
        location: [239, 68, 68], // Red (Pin standard)
        cp: [37, 99, 235]        // Blue
    };

    const color = colors[type] || [100, 116, 139];
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.2);

    const s = 2.4; // Slightly smaller/sharper
    const midX = x + s / 2;
    const midY = y + s / 2;

    switch (type) {
        case 'address':
            doc.line(x, y + s, x + s, y + s);
            doc.line(x, y + s, x, y + s / 2);
            doc.line(x + s, y + s, x + s, y + s / 2);
            doc.line(x, y + s / 2, midX, y);
            doc.line(x + s, y + s / 2, midX, y);
            break;
        case 'id':
            doc.rect(x, y, s, s * 0.75);
            doc.rect(x + 0.3, y + 0.3, 0.8, 0.8, 'F'); // Photo
            doc.line(x + 1.4, y + 0.5, x + 2.1, y + 0.5);
            doc.line(x + 1.4, y + 1.1, x + 2.1, y + 1.1);
            break;
        case 'phone':
            doc.roundedRect(x + 0.6, y, s - 1.2, s, 0.3, 0.3, 'D');
            doc.circle(midX, y + s - 0.5, 0.15, 'F');
            break;
        case 'email':
            doc.rect(x, y + 0.5, s, s * 0.7);
            doc.line(x, y + 0.5, midX, midY);
            doc.line(x + s, y + 0.5, midX, midY);
            break;
        case 'cp':
        case 'location':
            doc.circle(midX, y + s / 3, 0.85, 'D');
            doc.line(midX - 0.8, y + s / 3, midX, y + s);
            doc.line(midX + 0.8, y + s / 3, midX, y + s);
            doc.circle(midX, y + s / 3, 0.35, 'F');
            break;
    }
};

const renderHeader = (doc: jsPDF, company: CompanyConfig, budget?: Budget) => {
    const topYPos = 10;
    const companyX = 65;
    const clientX = 145; // Third column starting point
    const clientTextX = clientX + 5;

    // 1. Logo (Left)
    let logoHeight = 40;
    if (company.logoUrl) {
        try {
            const props = doc.getImageProperties(company.logoUrl);
            const ratio = props.width / props.height;
            const targetWidth = 45;
            logoHeight = targetWidth / ratio;
            doc.addImage(company.logoUrl, 'PNG', 15, topYPos, targetWidth, logoHeight);
        } catch {
            doc.addImage(company.logoUrl, 'PNG', 15, topYPos, 40, 40);
        }
    }

    let infoYStart = topYPos + (logoHeight / 2) - 8;
    if (infoYStart < topYPos + 3) infoYStart = topYPos + 3;
    let infoY = infoYStart;

    // 2. Names Row
    doc.setFontSize(company.pdfHeaderFontSize || 10);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(company.name.toUpperCase(), companyX, infoY);

    if (budget) {
        doc.text(budget.clientData.name.toUpperCase(), clientX, infoY, { align: 'left' });
    }

    infoY += 5;

    // 3. Row 2: Address
    doc.setFontSize(company.pdfAddressFontSize || 8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(company.address, companyX, infoY);

    if (budget) {
        drawIcon(doc, 'address', clientX, infoY - 2.5);
        doc.text((budget.clientData.address || '').toUpperCase(), clientTextX, infoY, { align: 'left' });
    }

    infoY += 4;

    // 4. Row 3: CIF
    doc.text(`CIF: ${company.cif}`, companyX, infoY);

    if (budget) {
        drawIcon(doc, 'id', clientX, infoY - 2.5);
        doc.text((budget.clientData.nif || '').toUpperCase(), clientTextX, infoY, { align: 'left' });
    }

    infoY += 4;

    // 5. Row 4: Phone / CP
    doc.text(`T: ${company.phone}`, companyX, infoY);

    if (budget) {
        drawIcon(doc, 'cp', clientX, infoY - 2.5);
        doc.text(budget.clientData.postalCode || '', clientTextX, infoY, { align: 'left' });
    }

    infoY += 4;

    // 6. Row 5: Email / Localidad
    doc.text(company.email, companyX, infoY);

    if (budget) {
        drawIcon(doc, 'location', clientX, infoY - 2.5);
        doc.text((budget.clientData.city || '').toUpperCase(), clientTextX, infoY, { align: 'left' });
    }

    // 7. Extra Client Rows (Phone and Email)
    if (budget) {
        infoY += 4;
        drawIcon(doc, 'phone', clientX, infoY - 2.5);
        doc.text(budget.clientData.phone || '', clientTextX, infoY, { align: 'left' });
        infoY += 4;
        drawIcon(doc, 'email', clientX, infoY - 2.5);
        doc.text(budget.clientData.email || '', clientTextX, infoY, { align: 'left' });
    }

    return Math.max(topYPos + logoHeight, infoY) + 5;
};

export const generatePDF = async (budget: Budget, company: CompanyConfig, action: 'preview' | 'download' | 'print' | 'share' | 'blob' = 'preview', showPrices: boolean = true, showTotals: boolean = true, customFileName?: string) => {
    const doc = new jsPDF();
    const lineSpacing = company.pdfLineSpacing || 1.15;
    doc.setLineHeightFactor(lineSpacing);
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = renderHeader(doc, company, budget);

    // Info Ribbon: Project | Date | ID
    if (budget) {
        const ribbonH = 8;
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.rect(15, yPos, pageWidth - 30, ribbonH, 'F');
        doc.line(15, yPos, pageWidth - 15, yPos);
        doc.line(15, yPos + ribbonH, pageWidth - 15, yPos + ribbonH);

        const ribbonTextY = yPos + 5.5;
        doc.setFontSize(company.pdfTitleFontSize || 8.5);

        // Project (Left)
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text(`PROYECTO: ${(budget.projectName || '').toUpperCase()}`, 17, ribbonTextY);

        // Date (Center) - Requested in the middle
        const date = new Date(budget.date).toLocaleDateString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`FECHA: ${date}`, pageWidth / 2, ribbonTextY, { align: 'center' });

        // Presupuesto Nº (Right)
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text(`PRESUPUESTO Nº: ${budget.number}`, pageWidth - 17, ribbonTextY, { align: 'right' });

        yPos += ribbonH + 6;
    }

    const allTableBody: import('jspdf-autotable').RowInput[] = [];

    budget.items.forEach((item) => {
        allTableBody.push([
            {
                content: stripHtmlAndStyle(item.category).toUpperCase(),
                colSpan: 3,
                styles: {
                    fontStyle: 'normal',
                    textColor: [37, 99, 235],
                    fontSize: company.pdfCategoryFontSize || 9,
                    cellPadding: { top: 4, bottom: 0.5, left: 1, right: 1 }
                }
            }
        ]);

        allTableBody.push([
            {
                content: stripHtmlAndStyle(item.description),
                styles: { halign: 'left', cellPadding: { top: 3.5, bottom: 2, left: 1, right: 1 } }
            },
            {
                content: item.quantity.toString(),
                styles: { halign: 'center', cellPadding: { top: 3.5, bottom: 2 } }
            },
            {
                content: showPrices ? `${(typeof item.amount === 'number' ? item.amount : (item.quantity * item.price)).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €` : '',
                styles: { halign: 'right', cellPadding: { top: 3.5, bottom: 2, left: 1, right: 1 } }
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
        margin: { left: 15, right: 15, top: 60 },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [15, 23, 42],
            fontSize: company.pdfTableHeadFontSize || 9,
            fontStyle: 'bold',
            cellPadding: { top: 2, bottom: 0.5, left: 2, right: 2 },
            lineWidth: { bottom: 0.5 },
            lineColor: [200, 200, 200]
        },
        styles: {
            fontSize: company.pdfFontSize || 9,
            textColor: [80, 80, 80],
            overflow: 'linebreak',
            cellPadding: { top: 2, bottom: 2, left: 1, right: 1 } as import('jspdf-autotable').MarginPaddingInput
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 20 },
            2: { cellWidth: 30 }
        },
        didDrawPage: (data) => {
            if (data.pageNumber > 1) {
                renderHeader(doc, company, budget);
            }
        },
        didParseCell: (data) => {
            if (data.row.index % 2 === 0) {
                (data.cell.styles as { pageBreak?: string }).pageBreak = 'avoid';
            }
        }
    });

    yPos = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? yPos;
    yPos += 15;

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
            yPos = renderHeader(doc, company, budget) + 15;
        }

        yPos = drawTotalLine('SUMA IMPORTES', `${(budget.subtotal || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, yPos);
        yPos = drawTotalLine(`I.V.A. (${(budget.ivaRate * 100).toFixed(0)}%)`, `${(budget.ivaAmount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, yPos);
        yPos += 2;
        doc.setDrawColor(200, 200, 200);
        doc.line(totalsX, yPos - 1, pageWidth - 15, yPos - 1);
        drawTotalLine('TOTAL PRESUPUESTO', `${(budget.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, yPos + 4, true, true);
    }

    // --- SIGNATURES ---
    const closureH = 65;
    if (yPos + closureH > 280) {
        doc.addPage();
        yPos = renderHeader(doc, company, budget) + 15;
    } else {
        yPos += 20;
    }

    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');

    if (company.paymentTerms && company.paymentTerms.trim().length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('FORMA DE PAGO:', 15, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');

        company.paymentTerms.split('\n').forEach(line => {
            if (!line.trim()) return;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 41, 59);
            doc.text(line, 20, yPos);

            const percMatch = line.match(/(\d+(?:[.,]\d+)?)\s*%/);
            if (percMatch) {
                const perc = parseFloat(percMatch[1].replace(',', '.'));
                if (!isNaN(perc)) {
                    const amount = (budget.total * (perc / 100)).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(37, 99, 235);
                    doc.text(`${amount} €`, 95, yPos);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(30, 41, 59);
                }
            }
            yPos += 5;
        });
        yPos += 3;
    }

    doc.text('ACEPTACIÓN DEL PRESUPUESTO', 15, yPos + 10);

    const companyX = pageWidth - 65;
    const companyName = company.name ? company.name.toUpperCase() : 'DLKOM';
    doc.text(`FIRMADO: ${companyName}`, companyX, yPos + 10);

    if (company.sealUrl) {
        try {
            const props = doc.getImageProperties(company.sealUrl);
            const ratio = props.width / props.height;
            const targetWidth = 40;
            const targetHeight = targetWidth / ratio;
            doc.addImage(company.sealUrl, 'PNG', companyX, yPos + 15, targetWidth, targetHeight, undefined, 'SLOW');
        } catch {
            doc.addImage(company.sealUrl, 'PNG', companyX, yPos + 15, 40, 24);
        }
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos + 35, 75, yPos + 35);
    doc.setFont('helvetica', 'normal');
    doc.text('Firma Cliente', 15, yPos + 39);

    const notesToPrint = budget.notes || company.defaultNotes || '';
    if (notesToPrint && stripHtmlAndStyle(notesToPrint).trim().length > 0) {
        doc.addPage();
        let notesY = renderHeader(doc, company, budget) + 15;
        const notesTitleSize = (company.pdfNotesFontSize || 8) * 2;
        doc.setFontSize(notesTitleSize);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text('NOTAS Y CONDICIONES:', 15, notesY);
        notesY += notesTitleSize * 0.45;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const notesSize = company.pdfNotesFontSize ? company.pdfNotesFontSize + 2 : 10;
        doc.setFontSize(notesSize);
        renderRichText(doc, notesToPrint, 15, notesY, pageWidth - 30);
    }

    const defaultName = budget.projectName ? `${budget.projectName}_${budget.number}` : `Presupuesto_${budget.number || 'borrador'}`;
    const baseFileName = (customFileName && customFileName.trim() !== '') ? customFileName.trim() : defaultName;
    const filename = baseFileName.toLowerCase().endsWith('.pdf') ? baseFileName : `${baseFileName}.pdf`;

    if (action === 'blob') {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        return { blob, url, filename };
    } else if (action === 'preview') {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    } else if (action === 'download') {
        doc.save(filename);
    } else if (action === 'print') {
        doc.autoPrint();
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);

        // Android/iOS ignore hidden iframe printing, fallback to opening it so the user can use native functions
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            window.open(url, '_blank');
        } else {
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.onload = () => {
                setTimeout(() => {
                    iframe.contentWindow?.print();
                    setTimeout(() => document.body.removeChild(iframe), 2000);
                }, 500);
            };
        }
    } else if (action === 'share') {
        const blob = doc.output('blob');
        const file = new File([blob], filename, { type: 'application/pdf' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({ files: [file] });
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error("Error sharing PDF:", err);
                    doc.save(filename);
                }
            }
        } else {
            doc.save(filename);
        }
    }
};

export const downloadPDF = (budget: Budget, company: CompanyConfig, showPrices: boolean = true, showTotals: boolean = true) => {
    generatePDF(budget, company, 'download', showPrices, showTotals);
};

const stripHtmlAndStyle = (html: string) => {
    if (!html) return '';
    let text = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li>/gi, '• ')
        .replace(/<\/div>/gi, '\n');
    text = text.replace(/<[^>]*>?/gm, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
    text = text.replace(/\n{3,}/g, '\n\n');
    return text;
};

const renderRichText = (doc: jsPDF, html: string, startX: number, startY: number, maxWidth: number) => {
    let currentY = startY;
    const fontSize = doc.getFontSize();
    const tightLineHeight = (fontSize * 0.353) + 1.5;
    const processHtml = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li>/gi, '• ')
        .replace(/<\/div>/gi, '\n')
        .replace(/&nbsp;/g, ' ')
        .replace(/\n{2,}/g, '\n')
        .trim();
    const paragraphs = processHtml.split('\n');
    paragraphs.forEach(para => {
        if (!para.trim()) return;
        const runs: { text: string; bold: boolean }[] = [];
        let isBold = false;
        const parts = para.split(/(<\/?strong>|<\/?b>)/gi);
        parts.forEach(part => {
            const lower = part.toLowerCase();
            if (lower === '<strong>' || lower === '<b>') { isBold = true; return; }
            if (lower === '</strong>' || lower === '</b>') { isBold = false; return; }
            const clean = part.replace(/<[^>]*>?/gm, '');
            if (clean) runs.push({ text: clean, bold: isBold });
        });
        let currentX = startX;
        runs.forEach(run => {
            const words = run.text.split(' ');
            doc.setFont('helvetica', run.bold ? 'bold' : 'normal');
            words.forEach((word, index) => {
                if (!word) return;
                const wordWithSpace = index < words.length - 1 ? word + ' ' : word;
                const wordWidth = doc.getTextWidth(wordWithSpace);
                if (currentX > startX && currentX + wordWidth > startX + maxWidth) {
                    currentX = startX;
                    currentY += tightLineHeight;
                }
                doc.text(wordWithSpace, currentX, currentY);
                currentX += wordWidth;
            });
        });
        currentY += tightLineHeight;
    });
};
