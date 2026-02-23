
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBudget } from '../hooks/useBudget';
import { Plus, Trash2, Edit2, Save, FileDown, Share2, Download, FileText, EyeOff, Tags, Calculator, Ban, ChevronLeft } from 'lucide-react';
import ItemModal from '../components/ItemModal';
import SignaturePad from '../components/SignaturePad';
import RichTextEditor from '../components/RichTextEditor';
import { DEFAULT_IVA_RATES } from '../constants';
import type { BudgetItem, Budget } from '../types';
import { generatePDF } from '../utils/pdfGenerator';
import { useCompanyData } from '../hooks/useCompanyData';
import { budgetService } from '../services/budgetService';
import * as XLSX from 'xlsx';
import { useMasterData } from '../hooks/useMasterData';
import { formatPhoneNumber, formatTaxID } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

const BudgetEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { budget, updateClientData, addItem, saveItem, removeItem, updateBudgetField, setBudget } = useBudget();
    const { companyData } = useCompanyData();
    const { masterData } = useMasterData();
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<BudgetItem | undefined>(undefined);
    const [showPrices, setShowPrices] = useState(true);
    const [showTotals, setShowTotals] = useState(true);
    const isNew = !id; // Determine if it's a new budget

    // Auto-generate budget number if empty and it's a new budget
    useEffect(() => {
        if (isNew && !budget.number) {
            const year = new Date().getFullYear();
            const random = Math.floor(1000 + Math.random() * 9000);
            updateBudgetField('number', `${year}-${random}`);
        }
    }, [isNew, budget.number, updateBudgetField]);

    const handleBack = () => {
        navigate('/budgets');
    };

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (id) {
            loadBudget(id);
        }
    }, [id]);

    const loadBudget = async (budgetId: string) => {
        const loaded = await budgetService.getById(budgetId);
        if (loaded) {
            setBudget(loaded);
        }
    };

    // Auto-fetch city based on Postal Code (ES only)
    useEffect(() => {
        const pc = budget.clientData.postalCode;
        if (pc && pc.length === 5 && /^\d+$/.test(pc)) {
            const fetchCity = async () => {
                try {
                    const response = await fetch(`https://api.zippopotam.us/es/${pc}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.places && data.places.length > 0) {
                            const place = data.places[0];
                            const cityName = place['place name'];
                            // Update city if it's currently empty or just to provide helpful default
                            updateClientData('city', cityName);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching city from postal code", error);
                }
            };
            fetchCity();
        }
    }, [budget.clientData.postalCode]);

    const handleSaveBudget = async () => {
        await budgetService.save(budget);
        showToast('Proyecto guardado correctamente', 'success');
        navigate('/budgets');
    };



    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new();

        // Format data for Excel
        const data = [
            ['LOGO', companyData.name, '', '', 'PRESUPUESTO'],
            ['', companyData.address, '', '', `Nº: ${budget.number}`],
            ['', `Tel: ${companyData.phone}`, '', '', `Fecha: ${new Date(budget.date).toLocaleDateString()}`],
            ['', companyData.email, '', '', ''],
            [],
            ['DATOS DEL CLIENTE'],
            ['Nombre:', budget.clientData.name, '', 'NIF:', budget.clientData.nif],
            ['Dirección:', budget.clientData.address],
            ['Teléfono:', budget.clientData.phone, '', 'Email:', budget.clientData.email],
            [],
            ['PARTIDAS PRESUPUESTARIAS'],
            ['Grupo', 'Categoría', 'Descripción', 'Cantidad', 'Precio', 'Importe'],
        ];

        budget.items.forEach(item => {
            data.push([
                item.group,
                item.category,
                item.description,
                item.quantity.toString(),
                item.price.toFixed(2),
                (item.quantity * item.price).toFixed(2)
            ]);
        });

        data.push([]);
        data.push(['', '', '', '', 'Base Imponible:', budget.subtotal.toFixed(2)]);
        data.push(['', '', '', '', `IVA (${(budget.ivaRate * 100).toFixed(0)}%):`, budget.ivaAmount.toFixed(2)]);
        data.push(['', '', '', '', 'TOTAL:', budget.total.toFixed(2)]);

        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Proyecto");
        const exportName = budget.projectName ? `${budget.projectName}_${budget.number}` : `Proyecto_${budget.number || 'borrador'}`;
        XLSX.writeFile(wb, `${exportName}.xlsx`);
    };

    const handleExportWord = async () => {
        const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, WidthType, BorderStyle, ImageRun } = await import('docx');

        const noBorder = {
            top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        };

        const itemRows = budget.items.map(item => new TableRow({
            children: [
                new TableCell({
                    borders: noBorder,
                    children: [
                        new Paragraph({ children: [new TextRun({ text: item.category.toUpperCase(), bold: true, color: '1e40af', size: 18 })] }),
                        new Paragraph({ children: [new TextRun({ text: item.description.replace(/<[^>]*>/g, ''), size: 18 })] }),
                    ],
                    width: { size: 60, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                    borders: noBorder,
                    children: [new Paragraph({ text: item.quantity.toString(), alignment: AlignmentType.CENTER })],
                    width: { size: 10, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                    borders: noBorder,
                    children: [new Paragraph({ text: `${item.price.toFixed(2)} €`, alignment: AlignmentType.RIGHT })],
                    width: { size: 15, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                    borders: noBorder,
                    children: [new Paragraph({ text: `${(item.quantity * item.price).toFixed(2)} €`, alignment: AlignmentType.RIGHT })],
                    width: { size: 15, type: WidthType.PERCENTAGE },
                }),
            ],
        }));

        const headerRow = new TableRow({
            tableHeader: true,
            children: ['DESCRIPCIÓN', 'CANT.', 'PRECIO', 'IMPORTE'].map(h => new TableCell({
                borders: noBorder,
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18 })] })],
                shading: { fill: 'EFF6FF' },
            })),
        });

        const headerChildren: any[] = [];

        if (companyData.logoUrl) {
            try {
                const response = await fetch(companyData.logoUrl);
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
                headerChildren.push(new ImageRun({
                    data: arrayBuffer,
                    transformation: { width: 150, height: 75 },
                    type: 'png'
                }));
            } catch (e) {
                console.warn('Could not load logo for Word export', e);
            }
        }

        headerChildren.push(new TextRun({ text: `  ${companyData.name || 'Mi Empresa'}`, size: 28, bold: true, color: '1e40af' }));
        const exportNotes = budget.notes || companyData.defaultNotes || '';

        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ children: headerChildren }),
                    new Paragraph({ text: '' }),
                    new Paragraph({ children: [new TextRun({ text: `Presupuesto Nº: ${budget.number}   |   Fecha: ${new Date(budget.date).toLocaleDateString('es-ES')}`, size: 20 })] }),
                    new Paragraph({ children: [new TextRun({ text: `Cliente: ${budget.clientData.name} — ${budget.clientData.address}`, size: 20 })] }),
                    new Paragraph({ text: '' }),
                    new Table({ rows: [headerRow, ...itemRows], width: { size: 100, type: WidthType.PERCENTAGE } }),
                    new Paragraph({ text: '' }),
                    new Paragraph({ children: [new TextRun({ text: `Base Imponible: ${budget.subtotal.toFixed(2)} €`, size: 20 })], alignment: AlignmentType.RIGHT }),
                    new Paragraph({ children: [new TextRun({ text: `IVA (${(budget.ivaRate * 100).toFixed(0)}%): ${budget.ivaAmount.toFixed(2)} €`, size: 20 })], alignment: AlignmentType.RIGHT }),
                    new Paragraph({ children: [new TextRun({ text: `TOTAL: ${budget.total.toFixed(2)} €`, bold: true, size: 24, color: '1e40af' })], alignment: AlignmentType.RIGHT }),
                    ...(exportNotes.trim().length > 0 ? [
                        new Paragraph({ text: '' }),
                        new Paragraph({ children: [new TextRun({ text: 'NOTAS Y CONDICIONES:', bold: true, color: '1e40af' })] }),
                        new Paragraph({ children: [new TextRun({ text: exportNotes.replace(/<[^>]*>/g, ''), size: 18 })] }),
                    ] : []),
                ],
            }],
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const exportName = budget.projectName ? `${budget.projectName}_${budget.number}` : `Proyecto_${budget.number || 'borrador'}`;
        a.download = `${exportName}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(budget));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `presupuesto_${budget.number || 'indef'}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                // Basic validation
                if (json.items && json.clientData) {
                    setBudget(json as Budget); // Load the budget
                }
            } catch (err) {
                console.error(err);
                showToast("Error al importar el archivo JSON", 'error');
            }
        };
        reader.readAsText(file);
    };




    const openNewItemModal = () => {
        setEditingItem(undefined);
        setIsModalOpen(true);
    };

    const openEditItemModal = (item: BudgetItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    // Merge master groups with any existing groups in the budget (in case of legacy/deleted groups)
    const allGroups = Array.from(new Set([
        ...masterData.groups.map(g => g.name),
        ...budget.items.map(i => i.group)
    ]));

    const groupedItems = allGroups.reduce((acc, group) => {
        acc[group] = budget.items.filter(item => item.group === group);
        return acc;
    }, {} as Record<string, BudgetItem[]>);



    return (
        <div className="budget-editor">
            <div className="editor-header">
                <div className="header-left">
                    <button className="back-button" onClick={handleBack}>
                        <ChevronLeft size={20} />
                    </button>
                    <h1>{budget.projectName || 'Nuevo Proyecto'}</h1>
                    {budget.number && <span className="budget-number-badge">{budget.number}</span>}
                </div>
                <div className="header-actions">
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImportJSON}
                    />

                    <div className="action-bar">
                        <div className="dropdown-group">
                            <button className="btn-secondary" title="Opciones de Archivo">
                                <FileText size={18} className="icon-blue" /> <span className="btn-text">Archivo ▼</span>
                            </button>
                            <div className="dropdown-menu">
                                <button onClick={() => fileInputRef.current?.click()}>
                                    <Share2 size={16} /> Importar JSON
                                </button>
                                <button onClick={handleExportJSON}>
                                    <Download size={16} /> Exportar JSON
                                </button>
                                <button onClick={handleExportExcel}>
                                    <FileText size={16} /> Exportar Excel
                                </button>
                                <button onClick={handleExportWord}>
                                    <FileText size={16} /> Exportar Word
                                </button>
                            </div>
                        </div>

                        <div className="dropdown-group">
                            <button className="btn-secondary btn-pdf" title="Exportar PDF">
                                <FileDown size={18} className="icon-red" /> <span className="btn-text">PDF ▼</span>
                            </button>
                            <div className="dropdown-menu">
                                <button onClick={() => generatePDF(budget, companyData, 'preview', showPrices, showTotals)}>
                                    <FileDown size={16} /> Ver Vista Previa
                                </button>
                                <button onClick={() => generatePDF(budget, companyData, 'download', showPrices, showTotals)}>
                                    <Download size={16} /> Descargar PDF
                                </button>
                                <button onClick={() => generatePDF(budget, companyData, 'print', showPrices, showTotals)}>
                                    <FileText size={16} /> Imprimir PDF
                                </button>
                                {navigator.share && typeof navigator.share === 'function' && (
                                    <button onClick={() => generatePDF(budget, companyData, 'share', showPrices, showTotals)}>
                                        <Share2 size={16} /> Compartir PDF
                                    </button>
                                )}
                                <button onClick={() => setShowPrices(!showPrices)}>
                                    {showPrices ? <Tags size={16} /> : <EyeOff size={16} />}
                                    {showPrices ? 'Ocultar precios' : 'Mostrar precios'}
                                </button>
                                <button onClick={() => setShowTotals(!showTotals)}>
                                    {showTotals ? <Calculator size={16} /> : <Ban size={16} />}
                                    {showTotals ? 'Ocultar totales' : 'Mostrar totales'}
                                </button>
                            </div>
                        </div>

                        <button
                            className="btn-secondary btn-clear"
                            onClick={() => {
                                if (window.confirm('¿Borrar todo y empezar nuevo presupuesto?')) {
                                    localStorage.removeItem('current_budget_draft');
                                    window.location.reload();
                                }
                            }}
                        >
                            <Trash2 size={18} className="icon-red" /> <span className="btn-text">Borrar</span>
                        </button>

                        <button
                            className="btn-primary btn-save"
                            onClick={handleSaveBudget}
                        >
                            <Save size={18} /> <span className="btn-text">Guardar</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="budget-main-content form">
                <div className="form-main-column">
                    <div className="client-section card compact">
                        <h3 className="section-title-clear">DATOS DEL CLIENTE</h3>
                        <div className="form-grid-compact">
                            <div className="form-group span-2">
                                <label>Nombre del Proyecto</label>
                                <input
                                    value={budget.projectName || ''}
                                    onChange={e => updateBudgetField('projectName', e.target.value)}
                                    placeholder="Ej: Reforma de Salón"
                                    className="project-name-input"
                                />
                            </div>
                            <div className="form-group span-2 project-field">
                                <label>PRESUPUESTO Nº (ID)</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        value={budget.number}
                                        onChange={e => updateBudgetField('number', e.target.value)}
                                        placeholder="Ej: 2026-001"
                                        className="project-ref-input"
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const year = new Date().getFullYear();
                                            const random = Math.floor(1000 + Math.random() * 9000);
                                            updateBudgetField('number', `${year}-${random}`);
                                        }}
                                        className="secondary-button"
                                        style={{ padding: '8px', fontSize: '10px' }}
                                        title="Generar número aleatorio"
                                    >
                                        Aleatorio
                                    </button>
                                </div>
                            </div>
                            <div className="form-group span-1">
                                <label>Fecha</label>
                                <input
                                    type="date"
                                    value={new Date(budget.date).toISOString().split('T')[0]}
                                    onChange={e => updateBudgetField('date', new Date(e.target.value).getTime())}
                                />
                            </div>
                            <div className="form-group span-2">
                                <label>Nombre / Razón Social</label>
                                <input
                                    value={budget.clientData.name}
                                    onChange={e => updateClientData('name', e.target.value)}
                                />
                            </div>
                            <div className="form-group span-2">
                                <label>Dirección</label>
                                <input
                                    value={budget.clientData.address}
                                    onChange={e => updateClientData('address', e.target.value)}
                                />
                            </div>
                            <div className="form-group span-1">
                                <label>C.P.</label>
                                <input
                                    inputMode="numeric"
                                    value={budget.clientData.postalCode || ''}
                                    onChange={e => updateClientData('postalCode', e.target.value)}
                                    placeholder="00000"
                                />
                            </div>
                            <div className="form-group span-1">
                                <label>Localidad</label>
                                <input
                                    value={budget.clientData.city || ''}
                                    onChange={e => updateClientData('city', e.target.value)}
                                    placeholder="Ciudad"
                                />
                            </div>
                            <div className="form-group span-1">
                                <label>Teléfono</label>
                                <input
                                    inputMode="tel"
                                    value={budget.clientData.phone}
                                    onChange={e => updateClientData('phone', formatPhoneNumber(e.target.value))}
                                    maxLength={15}
                                    placeholder="600 000 000"
                                />
                            </div>
                            <div className="form-group span-1">
                                <label>NIF / CIF</label>
                                <input
                                    value={budget.clientData.nif}
                                    onChange={e => updateClientData('nif', formatTaxID(e.target.value))}
                                    maxLength={9}
                                    placeholder="12345678X"
                                />
                            </div>
                            <div className="form-group span-2">
                                <label>Email</label>
                                <input
                                    value={budget.clientData.email}
                                    onChange={e => updateClientData('email', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="items-section card">
                        <div className="section-header">
                            <h3>Partidas del Proyecto</h3>
                            <button className="btn-add-partida" onClick={openNewItemModal}>
                                <Plus size={18} /> Añadir Partida
                            </button>
                        </div>

                        {allGroups.map(group => {
                            const items = groupedItems[group];
                            if (!items || items.length === 0) return null;

                            return (
                                <div key={group} className="group-container">
                                    <h4 className="group-title">{group}</h4>
                                    <div className="items-table-form">
                                        <div className="table-header-form">
                                            <div className="col-desc">Descripción</div>
                                            <div className="col-qty">Cant.</div>
                                            <div className="col-price">Precio</div>
                                            <div className="col-total">Importe</div>
                                            <div className="col-actions"></div>
                                        </div>
                                        {items.map((item: BudgetItem) => (
                                            <div key={item.id} className="table-row-form">
                                                <div className="col-desc">
                                                    <div className="item-cat" dangerouslySetInnerHTML={{ __html: item.category }} />
                                                    <div className="item-text" dangerouslySetInnerHTML={{ __html: item.description }} />
                                                </div>
                                                <div className="col-qty">{item.quantity}</div>
                                                <div className="col-price">{item.price.toFixed(2)} €</div>
                                                <div className="col-total">{(item.quantity * item.price).toFixed(2)} €</div>
                                                <div className="col-actions">
                                                    <button
                                                        onClick={() => openEditItemModal(item)}
                                                        className="action-btn edit"
                                                        style={{ color: '#2563eb' }}
                                                    >
                                                        <Edit2 size={16} strokeWidth={2} color="#2563eb" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="action-btn delete"
                                                        style={{ color: '#ef4444' }}
                                                    >
                                                        <Trash2 size={16} strokeWidth={2} color="#ef4444" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="notes-section card">
                        <h3>Notas y Condiciones</h3>
                        <RichTextEditor
                            value={budget.notes || companyData.defaultNotes || ''}
                            onChange={(val) => updateBudgetField('notes', val)}
                            placeholder="Escribe aquí las aclaraciones o condiciones del proyecto..."
                        />
                    </div>

                    <div className="payment-section card">
                        <h3>Plazos y Forma de Pago</h3>
                        <div className="form-group span-4" style={{ marginTop: '10px' }}>
                            <div className="payment-terms-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#1e293b', lineHeight: '1.6' }}>
                                {(companyData.paymentTerms || '').split('\n').map((line, idx) => {
                                    if (!line.trim()) return null;
                                    // Try to find a percentage at the start of the line or anywhere
                                    const percMatch = line.match(/(\d+(?:[.,]\d+)?)\s*%/);
                                    let amountCalc = '';
                                    if (percMatch) {
                                        const perc = parseFloat(percMatch[1].replace(',', '.'));
                                        if (!isNaN(perc)) {
                                            const amount = (budget.total * (perc / 100)).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                            amountCalc = `  -->  ${amount} €`;
                                        }
                                    }
                                    return (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: idx < (companyData.paymentTerms.split('\n').length - 1) ? '1px dashed #cbd5e1' : 'none', paddingBottom: '4px', marginBottom: '4px' }}>
                                            <span>{line}</span>
                                            <strong style={{ color: '#2563eb' }}>{amountCalc}</strong>
                                        </div>
                                    );
                                })}
                                {!companyData.paymentTerms?.trim() && (
                                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No hay condiciones de pago configuradas en Ajustes.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="signatures-section card">
                        <h3>Firmas</h3>
                        <div className="signature-grid">
                            <div className="sig-block">
                                <SignaturePad
                                    label="Firma Cliente (Pantalla)"
                                    onSave={(data) => updateBudgetField('clientSignature', data)}
                                />
                                {budget.clientSignature && <img src={budget.clientSignature} alt="Firma preview" className="sig-preview" />}
                            </div>
                            <div className="sig-status">
                                <p>Sello de empresa: {companyData.sealUrl ? <span className="text-green">Configurado</span> : <span className="text-red">No configurado</span>}</p>
                                {companyData.sealUrl && <img src={companyData.sealUrl} alt="Sello preview" className="seal-preview" />}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-sidebar-column">
                    <div className="totals-section card blue-totals">
                        <div className="total-row">
                            <span>Base Imponible</span>
                            <span>{budget.subtotal.toFixed(2)} €</span>
                        </div>
                        <div className="total-row">
                            <div className="iva-selector">
                                <span>IVA</span>
                                <select
                                    value={budget.ivaRate}
                                    onChange={e => updateBudgetField('ivaRate', parseFloat(e.target.value))}
                                >
                                    {DEFAULT_IVA_RATES.map(rate => (
                                        <option key={rate.value} value={rate.value}>{rate.label}</option>
                                    ))}
                                </select>
                            </div>
                            <span>{budget.ivaAmount.toFixed(2)} €</span>
                        </div>
                        <div className="total-row grand-total">
                            <span>TOTAL PROYECTO</span>
                            <span>{budget.total.toFixed(2)} €</span>
                        </div>
                    </div>
                </div>

            </div >

            <ItemModal
                isOpen={isModalOpen}
                initialItem={editingItem}
                onClose={() => setIsModalOpen(false)}
                onSave={(item) => {
                    if (editingItem) {
                        saveItem(editingItem.id, { ...editingItem, ...item });
                    } else {
                        addItem(item);
                    }
                    setIsModalOpen(false);
                }}
            />

            <style>{`
        .budget-editor {
          max-width: 1200px;
          margin: 0 auto;
          padding-bottom: 80px;
        }

        .header-left { display: flex; align-items: center; gap: 15px; }
        .header-left h1 { 
          font-size: 1.1rem; 
          color: #2563eb; 
          font-weight: 800; 
          margin: 0;
        }
        .header-actions { display: flex; align-items: center; gap: 10px; }

        .editor-header {
          margin-bottom: 24px;
          background: white;
          padding: 10px 20px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .btn-back {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: white;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-bar {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        /* Button Interactivity */
        .btn-secondary, .btn-primary {
          transition: transform 0.1s ease, background 0.2s ease, border-color 0.2s ease;
        }
        .btn-secondary:active, .btn-primary:active {
          transform: scale(0.95) !important;
        }

        .icon-blue { color: #64748b; }
        .icon-red { color: #64748b; }
        
        .btn-secondary:hover .icon-blue { color: #2563eb !important; }
        .btn-secondary:hover .icon-red { color: #ef4444 !important; }

        .dropdown-group {
          position: relative;
        }
        .dropdown-group:hover .dropdown-menu {
          display: flex;
          opacity: 1;
          pointer-events: all;
          transform: translateY(0);
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          padding: 8px;
          min-width: 160px;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-10px);
          transition: all 0.2s ease;
          z-index: 200;
        }
        .dropdown-menu button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          color: #475569;
          font-size: 0.85rem;
          transition: background 0.2s;
        }
        .dropdown-menu button:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        /* Mode Toggle */
        .mode-toggle {
          display: flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 10px;
          margin: 0 10px;
        }

        .mode-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: transparent;
          color: #64748b;
        }

        .mode-btn.active {
          background: white;
          color: var(--primary-color);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        /* Form Mode Restored Styles */
        .budget-main-content.form {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }

        .form-main-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-sidebar-column {
          position: sticky;
          top: 90px;
        }

        .card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        /* Blue Totals Box */
        .blue-totals {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          border: none;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 24px;
        }
        .blue-totals .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #e0e7ff;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 0;
          font-weight: 500;
          font-size: 1.1rem;
        }
        .blue-totals .total-row:last-child { border-bottom: none; }
        .blue-totals .grand-total {
          color: white;
          font-size: 1.1rem;
          font-weight: 900;
          margin-top: 4px;
          padding-top: 10px;
          white-space: nowrap;
        }
        .blue-totals select {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          padding: 4px 8px;
          outline: none;
        }
        .blue-totals select option { color: black; }
        .iva-selector { display: flex; align-items: center; gap: 8px; }

        .section-title-clear {
          font-size: 0.85rem;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #f1f5f9;
        }

        .form-grid-compact {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 0.75rem; font-weight: 700; color: #475569; }
        .form-group input { 
          padding: 10px 12px; 
          border-radius: 8px; 
          border: 1px solid #cbd5e1; 
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }
        .form-group input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
        .span-1 { grid-column: span 1; }
        .span-2 { grid-column: span 2; }
        .span-4 { grid-column: span 4; }

        /* Items Section in Form */
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .section-header h3 { font-size: 1.1rem; font-weight: 800; color: #1e293b; }
        .btn-add-partida {
          display: flex; align-items: center; gap: 8px; padding: 10px 16px;
          background: var(--primary-color); color: white; border: none; border-radius: 10px;
          font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .btn-add-partida:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

        .items-table-form { border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; margin-top: 10px; }
        .table-header-form { 
          display: flex; background: #f8fafc; padding: 12px 16px; 
          border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 0.75rem; 
          color: #64748b; text-transform: uppercase;
        }
        .table-row-form { 
          display: flex; padding: 16px; border-bottom: 1px solid #f1f5f9; align-items: center; 
          background: white; transition: background 0.2s;
        }
        .table-row-form:hover { background: #f8fafc; }
        
        .col-desc { flex: 1; }
        .col-qty { width: 80px; text-align: center; }
        .col-price { width: 100px; text-align: right; }
        .col-total { width: 120px; text-align: right; font-weight: 700; }
        .col-actions { width: 100px; display: flex; justify-content: flex-end; gap: 8px; }

        .item-cat { font-size: 0.75rem; font-weight: 800; color: var(--primary-color); text-transform: uppercase; margin-bottom: 4px; }
        .item-text { font-size: 0.9rem; color: #1e293b; }

        .action-btn { 
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          border-radius: 8px; border: 1px solid #e2e8f0; background: white; cursor: pointer; transition: all 0.2s;
          color: #64748b;
        }
        .action-btn svg {
          width: 16px !important; height: 16px !important;
          stroke: currentColor !important;
          fill: none !important;
          stroke-width: 2 !important;
        }
        .action-btn.edit:hover { border-color: #2563eb; background: #eff6ff; color: #2563eb; }
        .action-btn.edit:hover svg { stroke: #2563eb; }
        .action-btn.delete:hover { border-color: #ef4444; background: #fef2f2; color: #ef4444; }
        .action-btn.delete:hover svg { stroke: #ef4444; }

        /* General UI */
        .editable { position: relative; border: 1px solid transparent; border-radius: 4px; padding: 2px; cursor: pointer; transition: all 0.2s; }
        .editable:hover { background: #f0f9ff; border-color: #bae6fd; }
        .edit-hint { opacity: 0; margin-left: 6px; color: var(--primary-color); font-size: 0.8rem; transition: 0.2s; }
        .editable:hover .edit-hint { opacity: 0.6; }
        .edit-hint-abs { position: absolute; top: 8px; right: 8px; opacity: 0; color: var(--primary-color); transition: 0.2s; }
        .editable:hover .edit-hint-abs { opacity: 0.8; }
        .edit-hint-float { position: absolute; top: -10px; right: -10px; background: var(--primary-color); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0; transform: scale(0.5); transition: 0.2s; z-index: 10; }
        .editable:hover .edit-hint-float { opacity: 1; transform: scale(1); }

        /* PDF export loading state */
        .btn-secondary.loading { opacity: 0.7; cursor: wait; }

        /* Budget Profit Tracker Bar */
        .budget-profit-tracker {
          display: flex; justify-content: center; gap: 24px; padding: 8px 12px; border-radius: 12px; margin-bottom: 16px;
          font-family: 'Inter', sans-serif; font-weight: 600; font-size: 0.85rem; border: 1px solid transparent; transition: all 0.3s ease;
        }
        .budget-profit-tracker.pos { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
        .budget-profit-tracker.neg { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
        .tracker-item { display: flex; align-items: center; gap: 6px; }
        .tracker-item .label { color: #64748b; font-weight: 500; text-transform: uppercase; font-size: 0.7rem; }
        .tracker-item.highlight { background: white; padding: 4px 10px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .tracker-divider { width: 1px; height: 16px; background: #cbd5e1; align-self: center; }

        @media (max-width: 900px) {
           .a4-sheet { width: 95%; padding: 10mm 8mm; }
           .sheet-info-row { flex-direction: column; gap: 15px; }
           .sheet-footer-area { flex-direction: column; }
           .sheet-totals { width: 100%; border-top: 1px solid #eee; margin-top: 20px; }
           .form-grid-compact { grid-template-columns: repeat(2, 1fr); }
        }

      `}</style>
        </div >
    );
};

export default BudgetEditor;
