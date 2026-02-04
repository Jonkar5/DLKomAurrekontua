import React, { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';
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
    const { masterData } = useMasterData();
    const [isConfigMode, setIsConfigMode] = useState(false);

    // ISOLATED STATES (M_ prefix to avoid conflicts)
    const [m_group, setMGroup] = useState('');
    const [m_category, setMCategory] = useState('');
    const [m_description, setMDescription] = useState('');
    const [m_quantity, setMQuantity] = useState('1');
    const [m_price, setMPrice] = useState('0');
    const [m_costPrice, setMCostPrice] = useState('0');

    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

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

    return (
        <div className="modal-overlay" translate="no">
            <div className="modal-content" translate="no">
                <div className="modal-header">
                    <h3>{initialItem ? 'Editar Partida' : 'Nueva Partida'}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" onClick={onClose} className="close-btn"><X size={24} /></button>
                    </div>
                </div>

                {isConfigMode ? (
                    <div className="config-panel">
                        <p>Configuración de grupos deshabilitada en esta vista.</p>
                        <button type="button" onClick={() => setIsConfigMode(false)} className="btn-primary">Volver</button>
                    </div>
                ) : (
                    <form onSubmit={e => {
                        e.preventDefault();
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
                        <div className="form-group">
                            <label>Grupo</label>
                            <select value={m_group} onChange={e => setMGroup(e.target.value)}>
                                <option value="">Seleccionar...</option>
                                {masterData?.groups?.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Categoría</label>
                            <select value={m_category} onChange={e => setMCategory(e.target.value)}>
                                <option value="">Seleccionar...</option>
                                {(masterData?.groups?.find(g => g.name === m_group)?.categories || []).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Descripción</label>
                            <textarea value={m_description} onChange={e => setMDescription(e.target.value)} rows={3} />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Cantidad</label>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <input type="text" value={m_quantity} onChange={e => setMQuantity(e.target.value)} />
                                    <button type="button" onClick={() => setIsCalculatorOpen(true)} className="btn-calculator">
                                        <Calculator size={20} /> CALCULAR
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="price-card">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Precio Coste (€)</label>
                                    <input type="text" value={m_costPrice} onChange={e => setMCostPrice(e.target.value)} className="input-cost" />
                                </div>
                                <div className="form-group">
                                    <label>Precio Venta (€)</label>
                                    <input type="text" value={m_price} onChange={e => setMPrice(e.target.value)} className="input-price" />
                                </div>
                            </div>

                            <div className="profit-display">
                                <div className="profit-item">
                                    <span className="label">Beneficio:</span>
                                    <span className={`value ${profit >= 0 ? 'text-green' : 'text-red'}`}>
                                        {profit.toFixed(2)}%
                                    </span>
                                </div>
                                <div className="profit-item total">
                                    <span className="label">TOTAL PARTIDA:</span>
                                    <span className="value text-blue">
                                        {total.toFixed(2)} €
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                            <button type="submit" className="btn-primary">Guardar</button>
                        </div>
                    </form>
                )}

                <SurfaceCalculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} onApply={v => setMQuantity(v.toString())} />
            </div>

            <style>{`
                .modal-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-content { background: white; padding: 24px; border-radius: 12px; width: 95%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; }
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; font-weight: 500; margin-bottom: 5px; font-size: 0.875rem; }
                .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .price-card { background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #eee; }
                .profit-display { display: flex; justify-content: space-between; margin-top: 10px; font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px; }
                .profit-item { display: flex; flex-direction: column; }
                .profit-item .label { font-size: 0.75rem; color: #666; }
                .profit-item .value { font-size: 1.1rem; }
                .btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }
                .btn-secondary { background: white; border: 1px solid #ddd; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
                .btn-calculator { background: #6366f1; color: white; border: none; padding: 0 15px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: bold; }
                .text-green { color: #10b981; } .text-red { color: #ef4444; } .text-blue { color: #3b82f6; }
                .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
                .close-btn { background: none; border: none; cursor: pointer; color: #666; }
                .input-cost { border-left: 3px solid #f59e0b !important; }
                .input-price { border-left: 3px solid #10b981 !important; }
            `}</style>
        </div>
    );
};

export default ItemModal;
