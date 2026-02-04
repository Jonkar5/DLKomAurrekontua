
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBudget } from '../hooks/useBudget';
import { Plus, Trash2, Edit2, Save, FileDown, Upload as UploadIcon, Download, FileText } from 'lucide-react';
import ItemModal from '../components/ItemModal';
import SignaturePad from '../components/SignaturePad';
import RichTextEditor from '../components/RichTextEditor';
import { DEFAULT_IVA_RATES } from '../constants';
import type { BudgetItem, Budget } from '../types'; // Fix type import
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
    const { budget, updateClientData, addItem, updateItem, removeItem, updateBudgetField, setBudget } = useBudget();
    const { companyData } = useCompanyData();
    const { masterData } = useMasterData();
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<BudgetItem | undefined>(undefined);
    const [showPrices, setShowPrices] = useState(true);
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


    const handleAddItem = (item: Omit<BudgetItem, 'id' | 'amount'>) => {
        if (editingItem) {
            updateItem(editingItem.id, 'description', item.description); // Update fields individually or bulk if hook allowed
            // For simplicity in hook, I exposed updateItem for single field. I should probably improve hook for full update.
            // Re-implementing simplified update logic here for now:
            updateItem(editingItem.id, 'group', item.group);
            updateItem(editingItem.id, 'category', item.category);
            updateItem(editingItem.id, 'description', item.description);
            updateItem(editingItem.id, 'quantity', item.quantity);
            updateItem(editingItem.id, 'price', item.price);
        } else {
            addItem(item);
        }
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
                <div className="header-actions">
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImportJSON}
                    />

                    {/* All Actions in one line */}
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
                            {showPrices ? "👁️" : "🙈"} <span className="btn-text">Precios</span>
                        </button>

                        <button
                            className="btn-secondary btn-pdf"
                            onClick={() => generatePDF(budget, companyData, showPrices)}
                            title="Descargar PDF"
                        >
                            <FileDown size={18} className="icon-red" /> <span className="btn-text">PDF</span>
                        </button>

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

            <div className="items-section">
                <div className="section-header">
                    <h3>Partidas del Proyecto</h3>
                    <button className="btn-primary" onClick={openNewItemModal}>
                        <Plus size={18} /> Añadir Partida
                    </button>
                </div>

                {allGroups.map(group => {
                    const items = groupedItems[group];
                    // Only show group if it has items OR if it is in masterData (to show empty sections? No, better hide empty unless it's a drag target)
                    // Current behavior: show if active items. Actually, user might want to see structure.
                    // But standard behavior is hide empty.
                    if (!items || items.length === 0) return null;

                    return (
                        <div key={group} className="group-container">
                            <h4 className="group-title">{group}</h4>
                            <div className="items-table">
                                <div className="table-header">
                                    <div className="col-desc">Descripción</div>
                                    <div className="col-qty">Cant.</div>
                                    <div className="col-price">Precio</div>
                                    <div className="col-total">Importe</div>
                                    <div className="col-actions"></div>
                                </div>
                                {items.map((item: BudgetItem) => (
                                    <div key={item.id} className="table-row">
                                        <div className="col-desc">
                                            <div className="item-cat">{item.category}</div>
                                            <div className="item-text">{item.description}</div>
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
                    </div>
                    {/* Company seal is configured in settings, just show preview or status here */}
                    <div className="sig-status">
                        <p>Sello de empresa: {companyData.sealUrl ? <span className="text-green">Configurado</span> : <span className="text-red">No configurado</span>}</p>
                    </div>
                </div>
            </div>

            <ItemModal
                key={editingItem?.id || 'new'}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddItem}
                initialItem={editingItem}
            />

            <style>{`
        .budget-editor {
          max-width: 1000px;
          margin: 0 auto;
          padding-bottom: 80px;
        }

        .editor-header {
          margin-bottom: 24px;
          background: white;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          display: flex;
          justify-content: center; /* Centering actions */
        }

        .action-bar {
          display: flex;
          gap: 12px;
          flex-wrap: nowrap; /* Force one line */
          align-items: center;
        }

        .project-ref-input {
          font-weight: 700;
          color: var(--primary-color) !important;
          background: #f0f7ff !important;
          border: 1px solid #bfdbfe !important;
        }

        .section-title-clear {
          font-size: 1.25rem !important;
          font-weight: 800 !important;
          color: #1e293b !important;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #3b82f6;
          display: inline-block;
          padding-bottom: 4px;
          margin-bottom: 20px !important;
        }
 
        .form-grid-compact {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .form-group.span-1 { grid-column: span 1; }
        .form-group.span-2 { grid-column: span 2; }
        .form-group.span-3 { grid-column: span 3; }
        .form-group.span-4 { grid-column: span 4; }

        .client-section.compact {
          padding: 24px;
        }

        .client-section.compact h3 {
          margin-bottom: 12px;
          font-size: 1rem;
        }

        .client-section.compact label {
          font-size: 0.75rem;
          margin-bottom: 4px;
          font-weight: 600;
          color: #64748b;
        }

        .client-section.compact input {
          padding: 8px 12px;
          font-size: 0.9rem;
          border-color: #e2e8f0;
        }

        .client-section.compact input:focus {
          border-color: #3b82f6;
          ring: 2px solid #3b82f6;
        }
 
        .project-ref-input {
          font-weight: 700;
          color: #2563eb !important;
          background: #eff6ff !important;
          border: 1px solid #bfdbfe !important;
        }
 
        @media (max-width: 900px) {
          .form-grid-compact {
            grid-template-columns: repeat(2, 1fr);
          }
          .form-group.span-3, .form-group.span-4 { grid-column: span 2; }
          .form-group.span-1, .form-group.span-2 { grid-column: span 1; }
        }
 
        @media (max-width: 768px) {
          .editor-header {
            padding: 8px;
            overflow-x: auto;
            justify-content: flex-start;
          }
          
          .action-bar {
             gap: 8px;
          }
 
          .btn-secondary, .btn-primary {
            padding: 10px 12px;
            font-size: 0.8rem;
            min-width: fit-content;
          }

          .btn-text {
            display: none;
          }

          .form-grid-compact {
            grid-template-columns: 1fr;
          }
          .form-group { grid-column: span 1 !important; }
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .group-container {
          margin-bottom: 24px;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .group-title {
          background: #f9fafb;
          padding: 12px 16px;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }

        .items-table {
          width: 100%;
        }

        .table-header {
          display: flex;
          padding: 8px 16px;
          background: #f3f4f6;
          font-size: 0.75rem;
          font-weight: 600;
          color: #4b5563;
        }

        .table-row {
          display: flex;
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          align-items: flex-start;
        }

        .col-desc { flex: 1; }
        .col-qty { width: 80px; text-align: center; }
        .col-price { width: 100px; text-align: right; }
        .col-total { width: 100px; text-align: right; font-weight: 600; }
        .col-actions { width: 80px; display: flex; justify-content: flex-end; gap: 8px; }

        .item-cat { font-size: 0.75rem; color: var(--primary-color); font-weight: 600; }
        .item-text { 
           font-size: 0.875rem; 
           white-space: pre-wrap; 
           overflow-wrap: break-word; 
           word-break: break-word; 
        }

        .action-btn {
          padding: 4px;
          background: transparent;
          color: #9ca3af;
        }

        .action-btn:hover { color: #111827; }
        .action-btn.delete:hover { color: #ef4444; }

        .totals-section {
          margin-top: 32px;
          margin-left: auto;
          width: 300px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 0.875rem;
        }

        .grand-total {
          border-top: 2px solid #e5e7eb;
          margin-top: 8px;
          padding-top: 16px;
          font-weight: 700;
          font-size: 1.125rem;
          color: var(--primary-color);
        }

        .iva-selector {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .iva-selector select {
          padding: 2px 4px;
          width: auto;
        }


        /* Colorful Icons */
        .icon-blue { color: #3b82f6; }
        .icon-purple { color: #a855f7; }
        .icon-green { color: #10b981; }
        .icon-red { color: #ef4444; }

        /* Modern Button Styles */
        .btn-secondary {
            background: white;
            border: 1px solid #e5e7eb;
            color: #374151;
            font-weight: 500;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .btn-secondary:hover {
            background: #f9fafb;
            border-color: #d1d5db;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .btn-import:hover .icon-blue { stroke-width: 2.5px; }
        .btn-json:hover .icon-purple { stroke-width: 2.5px; }
        .btn-excel:hover .icon-green { stroke-width: 2.5px; }
        .btn-pdf:hover .icon-red { stroke-width: 2.5px; }

          @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
          /* ... existing media queries ... */
          .table-header { display: none; }
          .table-row { flex-wrap: wrap; position: relative; }
          .col-desc { width: 100%; margin-bottom: 8px; }
          .col-qty, .col-price, .col-total { font-size: 0.875rem; text-align: left; width: auto; margin-right: 12px; }
          .col-actions { position: absolute; top: 8px; right: 8px; }
          
          /* Hide button labels on small screens, show only icons? Or stack them */
          .header-right { flex-wrap: wrap; }
          .btn-secondary, .btn-primary { flex: 1; justify-content: center; font-size: 0.8rem; padding: 8px; }
        }
      `}</style>
        </div>
    );
};

export default BudgetEditor;
