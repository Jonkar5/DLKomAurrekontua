
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBudget } from '../hooks/useBudget';
import { Plus, Trash2, Edit2, Save, FileDown, Upload as UploadIcon, Download, FileText, ArrowLeft, EyeOff, Tags, Calculator, Ban } from 'lucide-react';
import ItemModal from '../components/ItemModal';
import SignaturePad from '../components/SignaturePad';
import RichTextEditor from '../components/RichTextEditor';
import FloatingToolbar from '../components/FloatingToolbar';
import { DEFAULT_IVA_RATES } from '../constants';
import type { BudgetItem, Budget } from '../types';
import { generatePDF, generatePDFFromElement } from '../utils/pdfGenerator';
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
    const [isVisualMode, setIsVisualMode] = useState(true);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const a4SheetRef = useRef<HTMLDivElement>(null);

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

    // Builds the full HTML layout from current budget + company data
    const buildInitialHtml = () => {
        const logoHtml = companyData.logoUrl
            ? `<img src="${companyData.logoUrl}" alt="Logo" style="width:100px;height:100px;object-fit:contain;border-radius:8px;" />`
            : `<div style="width:100px;height:100px;background:#e2e8f0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#64748b;font-size:1rem;">LOGO</div>`;

        const itemsHtml = budget.items.map(item => `
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td colspan="3" style="background:#f1f5f9;padding:6px 14px;font-weight:800;font-size:0.8rem;color:#2563eb;text-transform:uppercase;border:none;">${item.category}</td>
            </tr>
            <tr>
                <td style="padding:6px 14px 10px;font-size:0.9rem;color:#1e293b;line-height:1.5;border:none;">${item.description}</td>
                <td style="padding:6px 14px 10px;text-align:center;font-weight:600;font-size:0.85rem;border:none;">${item.quantity}</td>
                <td style="padding:6px 14px 10px;text-align:right;font-weight:700;color:#0f172a;border:none;">${(item.quantity * item.price).toFixed(2)} €</td>
            </tr>`).join('');

        const sealHtml = companyData.sealUrl
            ? `<img src="${companyData.sealUrl}" alt="Sello" style="max-height:70px;opacity:0.85;display:block;margin:8px auto 0;" />`
            : '';

        return `
<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
  <tr>
    <td style="width:110px;vertical-align:top;border:none;">${logoHtml}</td>
    <td style="text-align:right;vertical-align:top;border:none;">
      <div style="font-size:1.2rem;font-weight:800;color:#0f172a;margin-bottom:2px;">${companyData.name || 'NOMBRE EMPRESA'}</div>
      <div style="font-size:0.8rem;color:#64748b;line-height:1.3;">${companyData.address || ''}</div>
      <div style="font-size:0.8rem;color:#64748b;">${companyData.phone} | ${companyData.email}</div>
      <div style="font-size:0.8rem;color:#64748b;">CIF/NIF: ${companyData.cif}</div>
    </td>
  </tr>
</table>
<hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0;" />
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
  <tr>
    <td style="vertical-align:top;border:none;">
      <div style="font-size:1rem;font-weight:800;color:#2563eb;">PRESUPUESTO: ${budget.number}</div>
      <div style="font-size:0.85rem;color:#64748b;">FECHA: ${new Date(budget.date).toLocaleDateString()}</div>
    </td>
    <td style="background:#f8fafc;padding:12px 16px;border-radius:8px;border-left:3px solid #2563eb;vertical-align:top;border-top:none;border-bottom:none;border-right:none;">
      <div style="font-size:0.7rem;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:4px;">CLIENTE</div>
      <div style="font-size:1.1rem;font-weight:800;color:#0f172a;margin-bottom:4px;">${budget.clientData.name || 'NOMBRE DEL CLIENTE'}</div>
      <div style="font-size:0.85rem;color:#475569;">${budget.clientData.address || ''}</div>
      <div style="font-size:0.85rem;color:#475569;">NIF: ${budget.clientData.nif || '—'}</div>
    </td>
  </tr>
</table>
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
  <thead>
    <tr style="background:#1e293b;color:white;">
      <th style="padding:10px 14px;font-size:0.75rem;text-align:left;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;border:none;">CONCEPTO</th>
      <th style="padding:10px 14px;font-size:0.75rem;text-align:center;font-weight:700;text-transform:uppercase;width:70px;border:none;">CANT.</th>
      <th style="padding:10px 14px;font-size:0.75rem;text-align:right;font-weight:700;text-transform:uppercase;width:110px;border:none;">IMPORTE</th>
    </tr>
  </thead>
  <tbody>${itemsHtml}</tbody>
</table>
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
  <tr>
    <td style="background:#fffbeb;border:1px solid #fef3c7;padding:12px;border-radius:8px;vertical-align:top;">
      <div style="font-size:0.7rem;font-weight:800;color:#92400e;margin-bottom:6px;">NOTAS Y CONDICIONES:</div>
      <div style="font-size:0.8rem;color:#78350f;line-height:1.4;">${budget.notes || companyData.defaultNotes || 'Escribe aquí las condiciones del presupuesto...'}</div>
    </td>
    <td style="width:230px;vertical-align:top;padding-left:20px;border:none;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="font-size:0.85rem;padding:4px 0;border:none;">Base Imponible:</td><td style="text-align:right;font-size:0.85rem;padding:4px 0;border:none;">${budget.subtotal.toFixed(2)} €</td></tr>
        <tr><td style="font-size:0.85rem;padding:4px 0;border:none;">IVA (${(budget.ivaRate * 100).toFixed(0)}%):</td><td style="text-align:right;font-size:0.85rem;padding:4px 0;border:none;">${budget.ivaAmount.toFixed(2)} €</td></tr>
        <tr style="border-top:2px solid #e2e8f0;"><td style="font-size:1.1rem;font-weight:900;color:#2563eb;padding:8px 0 4px;border:none;">TOTAL:</td><td style="text-align:right;font-size:1.1rem;font-weight:900;color:#2563eb;padding:8px 0 4px;border:none;">${budget.total.toFixed(2)} €</td></tr>
      </table>
    </td>
  </tr>
</table>
<table style="width:100%;border-collapse:collapse;margin-top:40px;">
  <tr>
    <td style="width:50%;text-align:center;vertical-align:bottom;border:none;">
      <hr style="border:none;border-top:1px solid #cbd5e1;margin-bottom:6px;" />
      <div style="font-size:0.7rem;font-weight:600;color:#64748b;text-transform:uppercase;">Firma Cliente</div>
    </td>
    <td style="width:50%;text-align:center;vertical-align:bottom;border:none;">
      <div style="font-size:0.7rem;font-weight:600;color:#64748b;text-transform:uppercase;margin-bottom:6px;">${companyData.name || 'DLKOM'}</div>
      ${sealHtml}
    </td>
  </tr>
</table>`;
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
        XLSX.writeFile(wb, `Proyecto_${budget.number || 'borrador'}.xlsx`);
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

    const budgetStats = (() => {
        let totalCost = 0;
        let totalSale = 0;
        budget.items.forEach(item => {
            totalCost += (item.costPrice || 0) * (item.quantity || 0);
            totalSale += (item.price || 0) * (item.quantity || 0);
        });
        const profit = totalSale - totalCost;
        const margin = totalCost > 0 ? (profit / totalCost) * 100 : 0;
        return { totalCost, totalSale, profit, margin };
    })();

    return (
        <div className="budget-editor">
            {/* Real-time Profit Analyzer Bar */}
            <div className={`budget-profit-tracker ${budgetStats.profit >= 0 ? 'pos' : 'neg'}`}>
                <div className="tracker-item">
                    <span className="label">Venta:</span>
                    <span className="val">{budgetStats.totalSale.toFixed(2)}€</span>
                </div>
                <div className="tracker-divider"></div>
                <div className="tracker-item">
                    <span className="label">Coste:</span>
                    <span className="val">{budgetStats.totalCost.toFixed(2)}€</span>
                </div>
                <div className="tracker-divider"></div>
                <div className="tracker-item highlight">
                    <span className="label">Beneficio:</span>
                    <span className={`val ${budgetStats.profit >= 0 ? 'text-green' : 'text-red'}`}>{budgetStats.profit.toFixed(2)}€ ({budgetStats.margin.toFixed(1)}%)</span>
                </div>
            </div>

            <div className="editor-header">
                <button
                    className="btn-back"
                    onClick={() => navigate('/budgets')}
                    title="Volver al listado"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="header-actions">
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImportJSON}
                    />

                    <div className="action-bar">
                        <button
                            className="btn-secondary btn-import"
                            onClick={() => fileInputRef.current?.click()}
                            title="Importar JSON"
                        >
                            <UploadIcon size={18} className="icon-blue" /> <span className="btn-text">Importar</span>
                        </button>

                        <button
                            className="btn-secondary btn-json"
                            onClick={handleExportJSON}
                            title="Guardar JSON"
                        >
                            <Download size={18} className="icon-purple" /> <span className="btn-text">Archivo</span>
                        </button>

                        <button
                            className="btn-secondary btn-excel"
                            onClick={handleExportExcel}
                            title="Excel"
                        >
                            <FileText size={18} className="icon-green" /> <span className="btn-text">Excel</span>
                        </button>

                        <button
                            className={`btn-secondary ${!showPrices ? 'active-toggle' : ''}`}
                            onClick={() => setShowPrices(!showPrices)}
                            title={showPrices ? "Ocultar precios individuales en PDF" : "Mostrar precios individuales en PDF"}
                        >
                            {showPrices ? <Tags size={18} /> : <EyeOff size={18} />}
                            <span className="btn-text">Precios</span>
                        </button>

                        <button
                            className={`btn-secondary ${!showTotals ? 'active-toggle' : ''}`}
                            onClick={() => setShowTotals(!showTotals)}
                            title={showTotals ? "Ocultar totales finales en PDF" : "Mostrar totales finales en PDF"}
                        >
                            {showTotals ? <Calculator size={18} /> : <Ban size={18} />}
                            <span className="btn-text">Totales</span>
                        </button>

                        <button
                            className={`btn-secondary btn-pdf ${isExportingPDF ? 'loading' : ''}`}
                            onClick={async () => {
                                if (isVisualMode && a4SheetRef.current) {
                                    setIsExportingPDF(true);
                                    const filename = `Presupuesto_${budget.number}_${budget.clientData.name.replace(/\s+/g, '_') || 'cliente'}.pdf`;
                                    try {
                                        await generatePDFFromElement(a4SheetRef.current, filename);
                                    } finally {
                                        setIsExportingPDF(false);
                                    }
                                } else {
                                    generatePDF(budget, companyData, showPrices, showTotals);
                                }
                            }}
                            title="Descargar PDF"
                            disabled={isExportingPDF}
                        >
                            <FileDown size={18} className="icon-red" />
                            <span className="btn-text">{isExportingPDF ? 'Generando...' : 'PDF'}</span>
                        </button>

                        <div className="mode-toggle">
                            <button
                                className={`mode-btn ${!isVisualMode ? 'active' : ''}`}
                                onClick={() => setIsVisualMode(false)}
                            >
                                Formulario
                            </button>
                            <button
                                className={`mode-btn ${isVisualMode ? 'active' : ''}`}
                                onClick={() => setIsVisualMode(true)}
                            >
                                Visual (PDF)
                            </button>
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

            <div className={`budget-main-content ${isVisualMode ? 'visual' : 'form'}`}>
                {isVisualMode ? (
                    <div className="a4-sheet-container">
                        <FloatingToolbar containerRef={a4SheetRef as React.RefObject<HTMLElement>} />

                        {/* WYSIWYG Info bar */}
                        <div className="wysiwyg-hint">
                            <span>✏️ Haz clic en cualquier parte para editar — arrastra para seleccionar — la toolbar aparece al seleccionar texto</span>
                            <button
                                className="btn-regenerate"
                                onClick={() => {
                                    if (window.confirm('¿Regenerar el layout desde los datos del formulario? Perderás los cambios de formato visual.')) {
                                        const html = buildInitialHtml();
                                        updateBudgetField('visualHtml', html);
                                        if (a4SheetRef.current) a4SheetRef.current.innerHTML = html;
                                    }
                                }}
                                title="Reconstruir desde datos del formulario"
                            >
                                ↺ Regenerar
                            </button>
                        </div>

                        <div
                            className="a4-sheet"
                            ref={a4SheetRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={e => {
                                updateBudgetField('visualHtml', (e.currentTarget as HTMLDivElement).innerHTML);
                            }}
                            dangerouslySetInnerHTML={{ __html: budget.visualHtml || buildInitialHtml() }}
                        />
                    </div>
                ) : (
                    <>
                        <div className="client-section card compact">
                            <h3 className="section-title-clear">DATOS DEL CLIENTE</h3>
                            <div className="form-grid-compact">
                                <div className="form-group span-1 project-field">
                                    <label>Referencia Proyecto</label>
                                    <input
                                        value={budget.number}
                                        onChange={e => updateBudgetField('number', e.target.value)}
                                        placeholder="Ej: 2026-001"
                                        className="project-ref-input"
                                    />
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
                                                        <button onClick={() => openEditItemModal(item)} className="action-btn edit"><Edit2 size={16} /></button>
                                                        <button onClick={() => removeItem(item.id)} className="action-btn delete"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="totals-section card">
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

                        <div className="notes-section card">
                            <h3>Notas del Proyecto</h3>
                            <RichTextEditor
                                value={budget.notes || companyData.defaultNotes || ''}
                                onChange={(val) => updateBudgetField('notes', val)}
                                placeholder="Escribe aquí las aclaraciones o condiciones del proyecto..."
                            />
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
                    </>
                )}
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

        .editor-header {
          margin-bottom: 24px;
          background: white;
          padding: 12px 20px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          position: sticky;
          top: 10px;
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

        /* visual layout */
        .budget-main-content.visual {
          background: #eef2f7;
          padding: 28px;
          border-radius: 16px;
          min-height: 100vh;
        }

        .a4-sheet-container {
          display: flex;
          justify-content: center;
          position: relative;
        }

        .a4-sheet {
          width: 210mm;
          min-height: 297mm;
          background: white;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
          padding: 14mm 15mm;
          margin: 0 auto;
          position: relative;
          color: #1e293b;
          font-family: 'Inter', sans-serif;
          line-height: 1.4;
          border-radius: 2px;
        }

        /* ── WYSIWYG Editable Zones ── */
        .ce-zone {
          outline: none;
          border-radius: 4px;
          transition: background 0.18s, box-shadow 0.18s;
          cursor: text;
          position: relative;
        }
        .ce-zone:hover {
          background: rgba(59, 130, 246, 0.04);
          box-shadow: 0 0 0 1.5px rgba(59, 130, 246, 0.25);
        }
        .ce-zone:focus {
          background: rgba(59, 130, 246, 0.06);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.45);
        }
        .ce-zone:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
        }
        .ce-number {
          text-align: center;
          font-weight: 600;
          min-width: 32px;
          display: inline-block;
        }
        .ce-desc { min-height: 1.4em; }
        .ce-company-name {
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 2px;
        }
        .ce-company-small {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.3;
        }
        .ce-client-small {
          font-size: 0.85rem;
          color: #475569;
          line-height: 1.4;
        }

        /* Logo edit badge */
        .company-logo-area {
          width: 100px; height: 100px;
          border-radius: 8px; overflow: visible;
          position: relative; cursor: pointer;
        }
        .company-logo-area img { width: 100%; height: 100%; object-fit: contain; border-radius: 8px; }
        .logo-edit-badge {
          position: absolute; bottom: -4px; right: -4px;
          background: #2563eb; color: white;
          width: 20px; height: 20px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .company-logo-area:hover .logo-edit-badge { opacity: 1; }

        /* Sheet Header */
        .sheet-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          align-items: flex-start;
        }

        .company-logo-area {
          width: 100px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
        }
        .company-logo-area img { width: 100%; height: 100%; object-fit: contain; }
        
        .company-info-area { text-align: right; flex: 1; }
        .company-info-area h1 { font-size: 1.2rem; font-weight: 800; margin-bottom: 2px; color: #0f172a; }
        .company-info-area p { font-size: 0.8rem; color: #64748b; margin: 0; line-height: 1.3; }

        .horizontal-divider { height: 1px; background: #e2e8f0; margin: 15px 0; }

        /* New Info Row */
        .sheet-info-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
        
        .budget-info-side { flex: 1; }
        .budget-label-main { font-size: 1rem; font-weight: 800; color: var(--primary-color); margin-bottom: 4px; }
        .budget-date-main { font-size: 0.85rem; color: #64748b; }

        .client-info-side { 
          flex: 1; 
          background: #f8fafc; 
          padding: 12px 16px; 
          border-radius: 8px; 
          border-left: 3px solid var(--primary-color);
          position: relative;
        }
        .client-header { font-size: 0.7rem; font-weight: 800; color: #94a3b8; margin-bottom: 4px; text-transform: uppercase; }
        .client-name-big { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
        .client-sub-details p { font-size: 0.85rem; color: #475569; margin: 0; line-height: 1.4; }

        /* Table */
        .sheet-table { margin-bottom: 20px; }
        .table-head { 
          display: flex; background: #1e293b; color: white; 
          padding: 10px 14px; font-weight: 700; font-size: 0.75rem;
          border-radius: 4px 4px 0 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .table-head .col-desc { flex: 1; }
        .table-head .col-qty { width: 60px; text-align: center; }
        .table-head .col-total { width: 100px; text-align: right; }

        .item-row-visual { border-bottom: 1px solid #f1f5f9; }
        .category-row-sheet { 
          background: #f1f5f9; padding: 6px 14px; font-weight: 800; 
          font-size: 0.8rem; color: var(--primary-color); text-transform: uppercase;
        }
        .category-row-sheet .ce-zone { font-weight: 800; font-size: 0.8rem; color: var(--primary-color); text-transform: uppercase; display: inline-block; width: 100%; }
        .data-row-sheet { display: flex; padding: 8px 14px; align-items: flex-start; }
        .data-row-sheet .col-desc { flex: 1; font-size: 0.9rem; line-height: 1.5; }
        .data-row-sheet .col-qty { width: 60px; text-align: center; font-weight: 600; font-size: 0.85rem; }
        .data-row-sheet .col-total { width: 100px; text-align: right; font-weight: 700; color: #0f172a; font-size: 0.9rem; }
        
        .add-item-sheet {
          padding: 8px; text-align: center; border: 1px dashed #cbd5e1; 
          margin-top: 10px; border-radius: 6px; color: #94a3b8; font-weight: 600;
          cursor: pointer; font-size: 0.8rem;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        /* Footer */
        .sheet-footer-area { display: flex; gap: 30px; margin-top: 20px; align-items: flex-start; }
        .sheet-notes { flex: 1; background: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 8px; position: relative; }
        .sheet-notes .label { font-size: 0.7rem; font-weight: 800; color: #92400e; margin-bottom: 6px; }
        .notes-val { font-size: 0.8rem; color: #78350f; line-height: 1.4; min-height: 1.4em; }
        .notes-val { font-size: 0.8rem; color: #78350f; line-height: 1.4; }

        .sheet-totals { width: 220px; }
        .sheet-totals .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 0.85rem; }
        .sheet-totals .grand-total { 
          margin-top: 8px; padding-top: 10px; border-top: 2px solid #e2e8f0;
          font-size: 1.1rem; font-weight: 900; color: var(--primary-color);
        }

        .sheet-signatures { margin-top: 40px; display: flex; justify-content: space-between; }
        .sig-block { width: 180px; text-align: center; position: relative; }
        .sig-line { height: 1px; background: #cbd5e1; margin-bottom: 6px; }
        .sig-label { font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
        .sig-img { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); max-height: 60px; }
        .seal-img { max-height: 80px; opacity: 0.8; }

        /* Form Mode Restored Styles */
        .budget-main-content.form {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

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
        }
        .action-btn.edit:hover { color: #2563eb; border-color: #2563eb; background: #eff6ff; }
        .action-btn.delete:hover { color: #ef4444; border-color: #ef4444; background: #fef2f2; }

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
