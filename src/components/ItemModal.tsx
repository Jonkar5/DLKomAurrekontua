import React, { useState, useEffect } from 'react';
import { X, Calculator, Trash2, Plus, ArrowRight } from 'lucide-react';
import type { BudgetItem } from '../types';
import { useMasterData } from '../hooks/useMasterData';
import SurfaceCalculator from './SurfaceCalculator';

interface ItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Omit<BudgetItem, 'id' | 'amount'>) => void;
    initialItem?: BudgetItem;
}

const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, onSave, initialItem }) => {
    const { masterData, addGroup, deleteGroup, addCategory, deleteCategory } = useMasterData();
    const [newGroupName, setNewGroupName] = useState('');
    const [newCatName, setNewCatName] = useState('');

    // ISOLATED STATES
    const [m_group, setMGroup] = useState('');
    const [m_category, setMCategory] = useState('');
    const [m_description, setMDescription] = useState('');
    const [m_quantity, setMQuantity] = useState('1');
    const [m_price, setMPrice] = useState('0');
    const [m_costPrice, setMCostPrice] = useState('0');

    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Initial load
    useEffect(() => {
        if (isOpen) {
            if (initialItem) {
                setMGroup(initialItem.group || '');
                setMCategory(initialItem.category || '');
                setMDescription(initialItem.description || '');
                setMQuantity(initialItem.quantity?.toString() || '1');
                setMPrice(initialItem.price?.toString() || '0');
                setMCostPrice(initialItem.costPrice?.toString() || '0');
            } else {
                const firstGroup = masterData?.groups?.[0]?.name || '';
                setMGroup(firstGroup);
                setMCategory('');
                setMDescription('');
                setMQuantity('1');
                setMPrice('0');
                setMCostPrice('0');
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const n = (v: string): number => {
        if (!v) return 0;
        const clean = v.toString().replace(/,/g, '.').replace(/[^\d.]/g, '');
        const parsed = parseFloat(clean);
        return isNaN(parsed) ? 0 : parsed;
    };

    const profit = (() => {
        const c = n(m_costPrice);
        const p = n(m_price);
        return c > 0 ? ((p - c) / c) * 100 : 0;
    })();

    const total = n(m_quantity) * n(m_price);

    const handleAddGroup = () => {
        if (newGroupName.trim()) {
            addGroup(newGroupName.trim().toUpperCase());
            setMGroup(newGroupName.trim().toUpperCase());
            setNewGroupName('');
        }
    };

    const handleAddCategory = () => {
        if (newCatName.trim() && m_group) {
            addCategory(m_group, newCatName.trim());
            setMCategory(newCatName.trim());
            setNewCatName('');
        }
    };

    return (
        <div className="modal-overlay" translate="no">
            <div className="modal-content" translate="no">
                <div className="modal-header">
                    <h3>{initialItem ? 'Editar Partida' : 'Nueva Partida'}</h3>
                    <button type="button" onClick={onClose} className="close-btn"><X size={24} /></button>
                </div>

                <form onSubmit={e => {
                    e.preventDefault();
                    if (!m_group) { alert('Selecciona un grupo'); return; }
                    onSave({
                        group: m_group,
                        category: m_category,
                        description: m_description,
                        quantity: n(m_quantity),
                        price: n(m_price),
                        costPrice: n(m_costPrice)
                    });
                    onClose();
                }}>
                    {/* GROUP SECTION */}
                    <div className={`form-section ${focusedField === 'group' ? 'active' : ''}`} onFocus={() => setFocusedField('group')}>
                        <label>Grupo de Trabajo</label>
                        <div className="management-row">
                            <select value={m_group} onChange={e => setMGroup(e.target.value)} className="main-select">
                                <option value="">Seleccionar Grupo...</option>
                                {masterData?.groups?.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                            </select>
                            {m_group && (
                                <button type="button" className="action-btn delete" onClick={() => { if (confirm('¿Eliminar grupo?')) deleteGroup(m_group); setMGroup(''); }}>
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                        <div className="inline-add-row">
                            <input
                                type="text"
                                placeholder="Añadir nuevo grupo..."
                                value={newGroupName}
                                onChange={e => setNewGroupName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddGroup())}
                            />
                            <button type="button" className="inline-plus" onClick={handleAddGroup}>
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* CATEGORY SECTION */}
                    <div className={`form-section ${focusedField === 'category' ? 'active' : ''}`} onFocus={() => setFocusedField('category')}>
                        <label>Categoría</label>
                        <div className="management-row">
                            <select value={m_category} onChange={e => setMCategory(e.target.value)} className="main-select" disabled={!m_group}>
                                <option value="">Seleccionar Categoría...</option>
                                {(masterData?.groups?.find(g => g.name === m_group)?.categories || []).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            {m_category && (
                                <button type="button" className="action-btn delete" onClick={() => deleteCategory(m_group, m_category)}>
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                        <div className={`inline-add-row ${!m_group ? 'disabled' : ''}`}>
                            <input
                                type="text"
                                placeholder="Nueva categoría..."
                                value={newCatName}
                                onChange={e => setNewCatName(e.target.value)}
                                disabled={!m_group}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                            />
                            <button type="button" className="inline-plus" onClick={handleAddCategory} disabled={!m_group}>
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={`form-section ${focusedField === 'description' ? 'active' : ''}`} onFocus={() => setFocusedField('description')}>
                        <label>Descripción del Trabajo</label>
                        <textarea value={m_description} onChange={e => setMDescription(e.target.value)} rows={3} placeholder="Escribe aquí los detalles del trabajo..." />
                    </div>

                    <div className="form-row">
                        <div className={`form-section ${focusedField === 'quantity' ? 'active' : ''}`} onFocus={() => setFocusedField('quantity')}>
                            <label>Cantidad / Medida</label>
                            <div className="quantity-row">
                                <input type="text" value={m_quantity} onChange={e => setMQuantity(e.target.value)} />
                                <button type="button" onClick={() => setIsCalculatorOpen(true)} className="btn-calculator-new">
                                    <Calculator size={16} /> CALCULADORA
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="price-card-new">
                        <div className="form-row">
                            <div className="form-group-new">
                                <label>Coste (€)</label>
                                <input type="text" value={m_costPrice} onChange={e => setMCostPrice(e.target.value)} className="input-cost-new" />
                            </div>
                            <div className="form-group-new">
                                <label>Venta (€)</label>
                                <input type="text" value={m_price} onChange={e => setMPrice(e.target.value)} className="input-price-new" />
                            </div>
                        </div>

                        <div className="profit-bar">
                            <div className="bar-item">
                                <span>Margen</span>
                                <strong className={profit >= 0 ? 'text-green' : 'text-red'}>{profit.toFixed(1)}%</strong>
                            </div>
                            <div className="bar-divider"></div>
                            <div className="bar-item">
                                <span>Total</span>
                                <strong className="text-blue">{total.toFixed(2)} €</strong>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer-new">
                        <button type="button" onClick={onClose} className="btn-cancel">Cerrar</button>
                        <button type="submit" className="btn-save">
                            {initialItem ? 'Actualizar' : 'Añadir a Presupuesto'} <ArrowRight size={18} />
                        </button>
                    </div>
                </form>

                <SurfaceCalculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} onApply={v => setMQuantity(v.toString())} />
            </div>

            <style>{`
                .modal-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: flex-start; justify-content: center; z-index: 1000; padding: 10px; overflow-y: auto; }
                .modal-content { background: white; padding: 20px 24px; border-radius: 16px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; margin-top: 10px; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .modal-header h3 { font-size: 1.25rem; color: #1e293b; font-weight: 700; margin: 0; }
                
                .form-section { margin-bottom: 10px; padding-left: 10px; border-left: 3px solid transparent; transition: all 0.2s; }
                .form-section.active { border-left-color: #3b82f6; background: #eff6ff; border-radius: 0 6px 6px 0; padding-top: 4px; padding-bottom: 4px; }
                .form-section label { display: block; font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.025em; }
                
                .management-row { display: flex; gap: 6px; margin-bottom: 4px; }
                .main-select { flex: 1; padding: 6px 10px; border: 1.2px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; background: #f8fafc; font-weight: 500; }
                .main-select:focus { outline: none; border-color: #3b82f6; }
                
                .action-btn { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; cursor: pointer; border: none; transition: all 0.2s; }
                .action-btn.delete { background: #fee2e2; color: #ef4444; }
                .action-btn.delete:hover { background: #fca5a5; color: white; }
                
                .inline-add-row { display: flex; gap: 4px; align-items: center; }
                .inline-add-row input { flex: 1; padding: 4px 10px; border: 1px dashed #cbd5e1; border-radius: 6px; font-size: 0.8rem; background: transparent; }
                .inline-add-row input:focus { outline: none; border-color: #3b82f6; border-style: solid; background: white; }
                .inline-add-row.disabled { opacity: 0.5; pointer-events: none; }
                
                .inline-plus { background: #22c55e; color: white; border: none; width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s; }
                .inline-plus:hover { transform: scale(1.1); background: #16a34a; }
                
                textarea { width: 100%; border: 1.2px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; font-size: 0.85rem; resize: none; background: #f8fafc; }
                textarea:focus { outline: none; border-color: #3b82f6; background: white; }
                
                .quantity-row { display: flex; gap: 8px; align-items: center; }
                .quantity-row input { flex: 1.5; padding: 8px 12px; border: 1.5px solid #3b82f6; border-radius: 8px; font-weight: 800; font-size: 1.3rem; text-align: center; color: #1e3a8a; background: #f0f7ff; }
                .btn-calculator-new { flex: 1; height: 42px; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; }
                
                .price-card-new { background: #f8fafc; border-radius: 12px; padding: 12px; margin-top: 8px; border: 1px solid #e2e8f0; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .form-group-new { display: flex; flex-direction: column; gap: 2px; }
                .form-group-new label { font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
                .form-group-new input { padding: 6px 10px; border: 1.2px solid #e2e8f0; border-radius: 8px; font-weight: 700; font-size: 1rem; }
                .input-cost-new { border-left: 3px solid #f59e0b !important; }
                .input-price-new { border-left: 3px solid #10b981 !important; }
                
                .profit-bar { display: flex; align-items: center; justify-content: space-around; margin-top: 10px; background: white; padding: 8px; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .bar-item { display: flex; flex-direction: column; align-items: center; }
                .bar-item span { font-size: 0.6rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
                .bar-item strong { font-size: 1.1rem; }
                .bar-divider { width: 1px; height: 24px; background: #e2e8f0; }
                
                .text-green { color: #16a34a; } .text-red { color: #ef4444; } .text-blue { color: #2563eb; }
                
                .modal-footer-new { display: flex; gap: 10px; margin-top: 16px; }
                .btn-cancel { flex: 1; padding: 10px; border-radius: 10px; border: 1.2px solid #e2e8f0; background: white; color: #64748b; font-weight: 700; font-size: 0.85rem; cursor: pointer; }
                .btn-save { flex: 2; padding: 10px; border-radius: 10px; border: none; background: #2563eb; color: white; font-weight: 700; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
                .btn-save:hover { background: #1d4ed8; }
                
                .close-btn { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #64748b; cursor: pointer; }
            `}</style>
        </div>
    );
};

export default ItemModal;
