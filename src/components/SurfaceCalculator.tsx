import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

interface SurfaceCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (area: number) => void;
}

const SurfaceCalculator: React.FC<SurfaceCalculatorProps> = ({ isOpen, onClose, onApply }) => {
    const [tab, setTab] = useState<'walls' | 'floor'>('walls');
    const [val1, setVal1] = useState('');
    const [val2, setVal2] = useState('');
    const [val3, setVal3] = useState('');
    const [val4, setVal4] = useState('');
    const [valH, setValH] = useState('');

    useEffect(() => {
        if (isOpen) {
            setVal1(''); setVal2(''); setVal3(''); setVal4(''); setValH('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const n = (v: string): number => {
        const clean = v.toString().replace(/,/g, '.').replace(/[^\d.]/g, '');
        const p = parseFloat(clean);
        return isNaN(p) ? 0 : p;
    };

    const wallRes = (n(val1) + n(val2) + n(val3) + n(val4)) * n(valH);
    const floorRes = n(val1) * n(val2);
    const result = tab === 'walls' ? wallRes : floorRes;

    return (
        <div className="calc-overlay" translate="no">
            <div className="calc-content" translate="no">
                <div className="calc-header">
                    <h3>Calculadora de Superficies</h3>
                    <button type="button" onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>

                <div className="calc-tabs">
                    <button type="button" onClick={() => setTab('walls')} className={tab === 'walls' ? 'active' : ''}>Paredes</button>
                    <button type="button" onClick={() => setTab('floor')} className={tab === 'floor' ? 'active' : ''}>Suelo / Techo</button>
                </div>

                <div className="calc-body">
                    <div className="calc-grid">
                        {tab === 'walls' ? (
                            <>
                                <div><label>Lado 1 (m)</label><input type="text" value={val1} onChange={e => setVal1(e.target.value)} /></div>
                                <div><label>Lado 2 (m)</label><input type="text" value={val2} onChange={e => setVal2(e.target.value)} /></div>
                                <div><label>Ancho 1 (m)</label><input type="text" value={val3} onChange={e => setVal3(e.target.value)} /></div>
                                <div><label>Ancho 2 (m)</label><input type="text" value={val4} onChange={e => setVal4(e.target.value)} /></div>
                                <div style={{ gridColumn: '1 / -1' }}><label>Altura (m) *Requerido</label><input type="text" value={valH} onChange={e => setValH(e.target.value)} /></div>
                            </>
                        ) : (
                            <>
                                <div><label>Largo (m)</label><input type="text" value={val1} onChange={e => setVal1(e.target.value)} /></div>
                                <div><label>Ancho (m)</label><input type="text" value={val2} onChange={e => setVal2(e.target.value)} /></div>
                            </>
                        )}
                    </div>
                    <div className="result-preview">
                        Total: {result.toFixed(2)} m²
                    </div>
                </div>

                <div className="calc-footer">
                    <button type="button" onClick={() => { setVal1(''); setVal2(''); setVal3(''); setVal4(''); setValH(''); }} className="btn-clear-calc"><Trash2 size={20} /></button>
                    <button type="button" onClick={() => { onApply(Number(result.toFixed(2))); onClose(); }} className="btn-apply">Aplicar</button>
                </div>
            </div>

            <style>{`
                .calc-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1100; }
                .calc-content { background: white; padding: 24px; border-radius: 12px; width: 90%; max-width: 400px; }
                .calc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .calc-tabs { display: flex; border-bottom: 2px solid #e5e7eb; margin-bottom: 20px; }
                .calc-tabs button { flex: 1; padding: 10px; border: none; background: none; cursor: pointer; color: #6b7280; font-weight: 500; }
                .calc-tabs button.active { color: #2563eb; border-bottom: 2px solid #2563eb; margin-bottom: -2px; }
                .calc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .calc-grid label { display: block; font-size: 0.875rem; color: #374151; margin-bottom: 5px; }
                .calc-grid input { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; }
                .result-preview { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; text-align: center; font-weight: bold; font-size: 1.1rem; color: #2563eb; }
                .calc-footer { display: flex; justify-content: space-between; margin-top: 24px; }
                .btn-apply { background: #2563eb; color: white; border: none; padding: 10px 25px; border-radius: 6px; cursor: pointer; font-weight: bold; }
                .btn-clear-calc { background: #fee2e2; color: #ef4444; border: none; padding: 8px; border-radius: 6px; cursor: pointer; }
                .close-btn { background: none; border: none; cursor: pointer; color: #666; }
            `}</style>
        </div>
    );
};

export default SurfaceCalculator;
