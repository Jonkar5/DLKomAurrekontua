# Documentacin Completa de DLKom Aurrekontua

A continuacin se muestra la estructura completa de la aplicacin, su cdigo fuente y la finalidad de cada uno de sus archivos principales.


## Archivo: $(src\components\AppLayout.tsx)

**Propsito:** Componente reutilizable de la interfaz de usuario.

`$ext

import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, Settings, RefreshCw } from 'lucide-react';
import { useCompanyData } from '../hooks/useCompanyData';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { companyData } = useCompanyData();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="layout">
      <header className="top-navbar">
        <div className="logo-container">
          {companyData.logoUrl && (
            <img src={companyData.logoUrl} alt="Logo" className="nav-logo-img" />
          )}
          <div className="logo-content">
            <div className="logo-text">DLKom</div>
            <div className="logo-subtext">Proyectos</div>
          </div>
        </div>

        <nav className="nav-menu">
          <Link to="/budgets" className={`nav-item ${isActive('/budgets') ? 'active' : ''}`}>
            <FileText size={20} />
            <span>Proyectos</span>
          </Link>
          <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Configuración</span>
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="refresh-btn"
            title="Refrescar aplicación"
          >
            <RefreshCw size={20} />
          </button>
        </nav>
      </header>

      <main className="content">
        <div className="page-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        .layout {
          display: flex;
          flex-direction: column;
          width: 100%;
          min-height: 100vh;
          background-color: #f9fafb;
        }

        .top-navbar {
          background-color: white;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center; /* Centering for desktop */
          padding: 0 40px;
          height: 70px;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          gap: 60px; /* Space between logo and menu */
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-logo-img {
          height: 45px;
          width: auto;
          object-fit: contain;
        }

        .logo-content {
          display: flex;
          flex-direction: column;
        }

        .logo-text {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--primary-color);
          line-height: 1;
        }

        .logo-subtext {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 600;
        }

        .nav-menu {
          display: flex;
          gap: 24px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          border-radius: 10px;
          color: #64748b;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          background-color: #f1f5f9;
          color: var(--primary-color);
          transform: translateY(-1px);
        }

        .nav-item.active {
          background-color: #eff6ff;
          color: var(--primary-color);
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
        }

        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .page-content {
          padding: 32px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        @media (max-width: 768px) {
          .top-navbar {
            padding: 16px;
            height: auto;
            flex-direction: column;
            gap: 16px;
            justify-content: center;
          }
          
          .nav-menu {
            width: 100%;
            gap: 8px;
          }

          .nav-item {
            flex: 1;
            justify-content: center;
            padding: 12px 8px;
            font-size: 0.85rem;
          }

          .page-content {
            padding: 16px;
          }
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 10px;
          border: none;
          background: #f1f5f9;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-left: 8px;
        }

        .refresh-btn:hover {
          background: #e2e8f0;
          color: var(--primary-color);
          transform: rotate(30deg);
        }

        .refresh-btn:active {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
};

export default AppLayout;

``n
---


## Archivo: $(src\components\FloatingToolbar.tsx)

**Propsito:** Componente reutilizable de la interfaz de usuario.

`$ext

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
    Palette, Type
} from 'lucide-react';

interface FloatingToolbarProps {
    containerRef: React.RefObject<HTMLElement>;
}

const COLORS = [
    { label: 'Negro', value: '#0f172a' },
    { label: 'Azul', value: '#2563eb' },
    { label: 'Gris', value: '#64748b' },
    { label: 'Verde', value: '#16a34a' },
    { label: 'Rojo', value: '#dc2626' },
    { label: 'Naranja', value: '#d97706' },
];

const FONT_SIZES = [
    { label: 'S', value: '1', title: 'Pequeño' },
    { label: 'M', value: '3', title: 'Normal' },
    { label: 'L', value: '5', title: 'Grande' },
    { label: 'XL', value: '7', title: 'Muy grande' },
];

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ containerRef }) => {
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const [showColors, setShowColors] = useState(false);
    const [activeStyles, setActiveStyles] = useState({
        bold: false, italic: false, underline: false,
    });

    const updateStyles = useCallback(() => {
        setActiveStyles({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
        });
    }, []);

    const updatePosition = useCallback(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
            setVisible(false);
            return;
        }
        // Only show if selection is inside our container
        const container = containerRef.current;
        if (!container) return;
        const node = selection.anchorNode;
        if (!node || !container.contains(node)) {
            setVisible(false);
            return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const toolbarEl = toolbarRef.current;
        const toolbarH = toolbarEl ? toolbarEl.offsetHeight : 44;

        setPos({
            top: rect.top + window.scrollY - toolbarH - 8,
            left: Math.max(8, rect.left + window.scrollX + rect.width / 2),
        });
        setVisible(true);
        updateStyles();
    }, [containerRef, updateStyles]);

    useEffect(() => {
        const handleMouseUp = () => setTimeout(updatePosition, 10);
        const handleKeyUp = () => setTimeout(updatePosition, 10);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [updatePosition]);

    const exec = (cmd: string, val?: string) => {
        document.execCommand(cmd, false, val);
        updateStyles();
    };

    if (!visible) return null;

    return (
        <div
            ref={toolbarRef}
            className="floating-toolbar"
            style={{ top: pos.top, left: pos.left }}
            onMouseDown={e => e.preventDefault()} // Prevent selection loss
        >
            {/* Format buttons */}
            <button
                className={`ftb-btn ${activeStyles.bold ? 'active' : ''}`}
                onClick={() => exec('bold')} title="Negrita"
            >
                <Bold size={14} />
            </button>
            <button
                className={`ftb-btn ${activeStyles.italic ? 'active' : ''}`}
                onClick={() => exec('italic')} title="Cursiva"
            >
                <Italic size={14} />
            </button>
            <button
                className={`ftb-btn ${activeStyles.underline ? 'active' : ''}`}
                onClick={() => exec('underline')} title="Subrayado"
            >
                <Underline size={14} />
            </button>

            <div className="ftb-sep" />

            {/* Font size */}
            {FONT_SIZES.map(s => (
                <button
                    key={s.value}
                    className="ftb-btn ftb-size"
                    onClick={() => exec('fontSize', s.value)}
                    title={s.title}
                >
                    <Type size={s.value === '1' ? 10 : s.value === '3' ? 12 : s.value === '5' ? 14 : 16} />
                    <span>{s.label}</span>
                </button>
            ))}

            <div className="ftb-sep" />

            {/* Align */}
            <button className="ftb-btn" onClick={() => exec('justifyLeft')} title="Izquierda"><AlignLeft size={14} /></button>
            <button className="ftb-btn" onClick={() => exec('justifyCenter')} title="Centrar"><AlignCenter size={14} /></button>
            <button className="ftb-btn" onClick={() => exec('justifyRight')} title="Derecha"><AlignRight size={14} /></button>

            <div className="ftb-sep" />

            {/* Color picker */}
            <div className="ftb-color-wrap">
                <button
                    className="ftb-btn"
                    onClick={() => setShowColors(v => !v)}
                    title="Color de texto"
                >
                    <Palette size={14} />
                </button>
                {showColors && (
                    <div className="ftb-color-panel">
                        {COLORS.map(c => (
                            <button
                                key={c.value}
                                className="ftb-color-dot"
                                style={{ background: c.value }}
                                onClick={() => { exec('foreColor', c.value); setShowColors(false); }}
                                title={c.label}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .floating-toolbar {
                    position: absolute;
                    z-index: 9999;
                    transform: translateX(-50%);
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    padding: 5px 8px;
                    background: #1e293b;
                    border-radius: 10px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);
                    animation: ftbIn 0.15s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: all;
                    white-space: nowrap;
                }
                .floating-toolbar::after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 50%;
                    transform: translateX(-50%);
                    border: 6px solid transparent;
                    border-top-color: #1e293b;
                    border-bottom: none;
                    border-left-width: 5px;
                    border-right-width: 5px;
                }
                @keyframes ftbIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.96); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
                }
                .ftb-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2px;
                    padding: 5px 7px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: #cbd5e1;
                    cursor: pointer;
                    transition: all 0.15s;
                    font-size: 11px;
                    font-weight: 600;
                    min-width: 28px;
                    height: 28px;
                }
                .ftb-btn:hover {
                    background: rgba(255,255,255,0.12);
                    color: white;
                }
                .ftb-btn.active {
                    background: rgba(59, 130, 246, 0.35);
                    color: #93c5fd;
                }
                .ftb-size {
                    flex-direction: column;
                    gap: 0;
                    font-size: 9px;
                    padding: 3px 5px;
                    min-width: 24px;
                }
                .ftb-sep {
                    width: 1px;
                    height: 20px;
                    background: rgba(255,255,255,0.12);
                    margin: 0 3px;
                }
                .ftb-color-wrap {
                    position: relative;
                }
                .ftb-color-panel {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1e293b;
                    border-radius: 8px;
                    padding: 8px;
                    display: flex;
                    gap: 6px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.08);
                }
                .ftb-color-dot {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.15);
                    cursor: pointer;
                    transition: transform 0.15s, border-color 0.15s;
                    padding: 0;
                }
                .ftb-color-dot:hover {
                    transform: scale(1.2);
                    border-color: rgba(255,255,255,0.5);
                }
            `}</style>
        </div>
    );
};

export default FloatingToolbar;

``n
---


## Archivo: $(src\components\ItemModal.tsx)

**Propsito:** Componente reutilizable de la interfaz de usuario.

`$ext
import React, { useState, useEffect } from 'react';
import { X, Calculator, Trash2, Plus, ArrowRight } from 'lucide-react';
import type { BudgetItem } from '../types';
import { useMasterData } from '../hooks/useMasterData';
import SurfaceCalculator from './SurfaceCalculator';
import RichTextEditor from './RichTextEditor';

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
        if (c === 0 && p > 0) return 100;
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
                    <div className={`form-section ${m_group ? 'active' : (focusedField === 'group' ? 'active' : '')}`} onFocus={() => setFocusedField('group')}>
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
                                    <option key={c} value={c}>{c.replace(/<[^>]*>?/gm, '')}</option>
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
                                placeholder="Añadir nueva categoría..."
                                value={newCatName}
                                onChange={e => setNewCatName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                                disabled={!m_group}
                            />
                            <button type="button" className="inline-plus" onClick={handleAddCategory} disabled={!m_group || !newCatName}>
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={`form-section ${focusedField === 'description' ? 'active' : ''}`} onFocus={() => setFocusedField('description')}>
                        <label>Descripción del Trabajo (Permite Negrita y Tamaño)</label>
                        <RichTextEditor
                            value={m_description}
                            onChange={setMDescription}
                            placeholder="Escribe aquí los detalles del trabajo..."
                        />
                    </div>

                    <div className="form-row">
                        <div className={`form-section ${focusedField === 'quantity' ? 'active' : ''}`} onFocus={() => setFocusedField('quantity')}>
                            <label>Cantidad / Medida</label>
                            <div className="quantity-row">
                                <input type="text" inputMode="decimal" value={m_quantity} onChange={e => setMQuantity(e.target.value)} />
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
                                <input type="text" inputMode="decimal" value={m_costPrice} onChange={e => setMCostPrice(e.target.value)} className="input-cost-new" />
                            </div>
                            <div className="form-group-new">
                                <label>Venta (€)</label>
                                <input type="text" inputMode="decimal" value={m_price} onChange={e => setMPrice(e.target.value)} className="input-price-new" />
                            </div>
                        </div>

                        <div className={`profit-bar ${profit >= 0 ? 'bg-green-light' : 'bg-red-light'}`}>
                            <div className="bar-item">
                                <span>Margen</span>
                                <strong className={profit >= 0 ? 'text-green' : 'text-red'}>{profit.toFixed(1)}%</strong>
                            </div>
                            <div className="bar-divider"></div>
                            <div className="bar-item">
                                <span>Beneficio</span>
                                <strong className={profit >= 0 ? 'text-green' : 'text-red'}>{(n(m_price) - n(m_costPrice)).toFixed(2)} €</strong>
                            </div>
                            <div className="bar-divider"></div>
                            <div className="bar-item">
                                <span>Total Venta</span>
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
                
                .inline-plus { 
                    background: #2563eb; 
                    color: white; 
                    border: none; 
                    width: 32px; 
                    height: 32px; 
                    border-radius: 8px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    cursor: pointer; 
                    transition: all 0.2s; 
                }
                .inline-plus:hover { background: #1d4ed8; transform: translateY(-1px); }
                .inline-plus:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; transform: none; }
                
                .category-editor-container { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
                .category-editor-container.disabled { opacity: 0.5; pointer-events: none; }
                .sub-label { font-size: 0.6rem !important; margin-bottom: 2px !important; }
                
                .editor-with-button { display: flex; flex-direction: column; gap: 8px; }
                
                .inline-plus-big { background: #22c55e; color: white; border: none; padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s; font-weight: 600; font-size: 0.85rem; }
                .inline-plus-big:hover { background: #16a34a; transform: translateY(-1px); }
                .inline-plus-big:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; transform: none; }
                
                textarea { width: 100%; border: 1.2px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; font-size: 0.85rem; resize: none; background: #f8fafc; }
                textarea:focus { outline: none; border-color: #3b82f6; background: white; }
                
                .quantity-row { display: flex; gap: 8px; align-items: center; }
                .quantity-row input { flex: 2; padding: 8px 12px; border: 1.5px solid #3b82f6; border-radius: 8px; font-weight: 500; font-size: 0.9rem; text-align: center; color: #1e3a8a; background: #f0f7ff; min-width: 100px; }
                .btn-calculator-new { flex: 1.2; height: 42px; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; }
                
                .price-card-new { background: #f8fafc; border-radius: 12px; padding: 12px; margin-top: 8px; border: 1px solid #e2e8f0; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .form-group-new { display: flex; flex-direction: column; gap: 2px; }
                .form-group-new label { font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
                .form-group-new input { padding: 6px 10px; border: 1.2px solid #e2e8f0; border-radius: 8px; font-weight: 700; font-size: 0.9rem; }
                .input-cost-new { border-left: 3px solid #f59e0b !important; }
                .input-price-new { border-left: 3px solid #10b981 !important; }
                
                .profit-bar { display: flex; align-items: center; justify-content: space-around; margin-top: 10px; background: white; padding: 8px; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .bar-item { display: flex; flex-direction: column; align-items: center; }
                .bar-item span { font-size: 0.6rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
                .bar-item strong { font-size: 0.95rem; }
                .bar-divider { width: 1px; height: 24px; background: #e2e8f0; }
                
                .text-green { color: #16a34a; } .text-red { color: #ef4444; } .text-blue { color: #2563eb; }
                .bg-green-light { background-color: #f0fdf4 !important; border-color: #bbf7d0 !important; }
                .bg-red-light { background-color: #fef2f2 !important; border-color: #fecaca !important; }
                
                .modal-footer-new { display: flex; gap: 10px; margin-top: 16px; }
                .btn-cancel { flex: 1; padding: 10px; border-radius: 10px; border: 1.2px solid #e2e8f0; background: white; color: #64748b; font-weight: 700; font-size: 0.85rem; cursor: pointer; }
                .btn-save { flex: 2; padding: 10px; border-radius: 10px; border: none; background: #2563eb; color: white; font-weight: 700; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
                .btn-save:hover { background: #1d4ed8; }
                
                .close-btn { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #1e293b; cursor: pointer; font-weight: bold; }
            `}</style>
        </div>
    );
};

export default ItemModal;

``n
---


## Archivo: $(src\components\PdfPreviewModal.tsx)

**Propsito:** Componente reutilizable de la interfaz de usuario.

`$ext
import React, { useState, useRef, useEffect } from 'react';
import { X, MoreVertical, Printer, Download, Share2, FileText } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import type { Budget, CompanyConfig } from '../types';

interface PdfPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    budget: Budget;
    companyData: CompanyConfig;
    showPrices: boolean;
    showTotals: boolean;
}

const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
    isOpen,
    onClose,
    budget,
    companyData,
    showPrices,
    showTotals
}) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const initialFileName = budget.projectName ? `${budget.projectName}_${budget.number}` : (budget.number ? `Presupuesto_${budget.number}` : 'Presupuesto_borrador');
    const [fileNameInput, setFileNameInput] = useState<string>(initialFileName);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    useEffect(() => {
        if (isOpen) {
            // Generate the PDF blob for previewing inside the iframe
            generatePDF(budget, companyData, 'blob', showPrices, showTotals)
                .then((result) => {
                    if (result && result.url) {
                        setPdfUrl(result.url);
                        if (result.blob) setPdfBlob(result.blob);
                    }
                })
                .catch(err => console.error("Error generating PDF preview", err));
        } else {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
                setPdfUrl(null);
                setPdfBlob(null);
            }
            setShowMenu(false);
        }
    }, [isOpen, budget, companyData, showPrices, showTotals]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const handleAction = (action: 'print' | 'share' | 'download') => {
        const customName = fileNameInput.trim() || 'Presupuesto';

        if (action === 'share' && pdfBlob) {
            const finalName = customName.toLowerCase().endsWith('.pdf') ? customName : `${customName}.pdf`;
            const file = new File([pdfBlob], finalName, { type: 'application/pdf' });
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({ files: [file] }).catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error("Error sharing PDF:", err);
                        generatePDF(budget, companyData, 'download', showPrices, showTotals, customName);
                    }
                });
            } else {
                generatePDF(budget, companyData, 'download', showPrices, showTotals, customName);
            }
        } else {
            generatePDF(budget, companyData, action, showPrices, showTotals, customName);
        }
        setShowMenu(false);
    };

    return (
        <div className="pdf-preview-overlay">
            <div className="pdf-preview-container">
                <div className="pdf-preview-header">
                    <button className="close-btn" onClick={onClose} title="Cerrar Vista Previa">
                        <X size={24} />
                    </button>
                    <input
                        type="text"
                        className="pdf-rename-input"
                        value={fileNameInput}
                        onChange={(e) => setFileNameInput(e.target.value)}
                        title="Nombre del archivo a exportar"
                    />
                    <div className="pdf-preview-actions" ref={menuRef}>
                        <button
                            className="more-btn"
                            onClick={() => setShowMenu(!showMenu)}
                            title="Opciones"
                        >
                            <MoreVertical size={24} />
                        </button>

                        {showMenu && (
                            <div className="pdf-dropdown-menu">
                                <button onClick={() => handleAction('print')}>
                                    <Printer size={18} /> Imprimir
                                </button>
                                <button onClick={() => handleAction('download')}>
                                    <Download size={18} /> Guardar
                                </button>
                                {typeof navigator.share === 'function' && (
                                    <button onClick={() => handleAction('share')}>
                                        <Share2 size={18} /> Compartir
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="pdf-preview-body">
                    {pdfUrl ? (
                        <>
                            {isMobile ? (
                                <div className="mobile-pdf-launcher">
                                    <FileText size={48} color="#94a3b8" />
                                    <h3>Vista Previa Lista</h3>
                                    <p>Toca el botón para ver el documento en tu visor de PDF.</p>
                                    <button onClick={() => window.open(pdfUrl, '_blank')} className="btn-primary" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
                                        Ver Documento
                                    </button>
                                </div>
                            ) : (
                                <iframe
                                    src={`${pdfUrl}#toolbar=0`}
                                    className="pdf-iframe"
                                    title="PDF Preview"
                                />
                            )}
                        </>
                    ) : (
                        <div className="pdf-loading">Generando documento...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PdfPreviewModal;

``n
---


## Archivo: $(src\components\RichTextEditor.tsx)

**Propsito:** Componente reutilizable de la interfaz de usuario.

`$ext

import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, Type, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, IndentIncrease, IndentDecrease, Palette, Eraser, Heading1, Heading2, Heading3 } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, minHeight = '150px' }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [activeStyles, setActiveStyles] = useState({
        bold: false,
        italic: false,
        underline: false,
        fontSize: '3',
        justifyLeft: false,
        justifyCenter: false,
        justifyRight: false,
        insertUnorderedList: false,
        insertOrderedList: false
    });

    // Function to check which styles are active at the cursor position
    const updateActiveStyles = () => {
        if (typeof document !== 'undefined') {
            setActiveStyles({
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                fontSize: document.queryCommandValue('fontSize') || '3',
                justifyLeft: document.queryCommandState('justifyLeft'),
                justifyCenter: document.queryCommandState('justifyCenter'),
                justifyRight: document.queryCommandState('justifyRight'),
                insertUnorderedList: document.queryCommandState('insertUnorderedList'),
                insertOrderedList: document.queryCommandState('insertOrderedList')
            });
        }
    };

    // Sync from props
    useEffect(() => {
        if (editorRef.current) {
            // Only update if the content is truly different to avoid cursor jumps
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || '';
            }
        }
    }, [value]);

    const execCommand = (command: string, val?: string) => {
        document.execCommand(command, false, val);
        updateActiveStyles(); // Check state immediately after command
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            updateActiveStyles();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Backspace') {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const node = range.startContainer;

                // If cursor is at the very beginning of its container
                if (range.startOffset === 0) {
                    // Check if we are inside a list or a block that can be outdented
                    const parentElement = node.nodeType === 3 ? node.parentElement : node as HTMLElement;
                    const listElement = parentElement?.closest('li, blockquote');

                    // Also check if we have a text indent
                    const hasIndent = document.queryCommandState('indent');

                    if (listElement || hasIndent) {
                        e.preventDefault();
                        execCommand('outdent');
                    }
                }
            }
        }
    };

    return (
        <div className="rich-editor-container">
            <div className="rich-editor-toolbar">
                <button
                    type="button"
                    onClick={() => execCommand('bold')}
                    title="Negrita"
                    className={activeStyles.bold ? 'active-btn' : ''}
                >
                    <Bold size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('italic')}
                    title="Cursiva"
                    className={activeStyles.italic ? 'active-btn' : ''}
                >
                    <Italic size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('underline')}
                    title="Subrayado"
                    className={activeStyles.underline ? 'active-btn' : ''}
                >
                    <Underline size={16} />
                </button>

                <div className="toolbar-divider" />

                <button
                    type="button"
                    onClick={() => execCommand('fontSize', '3')}
                    title="Normal"
                    className={activeStyles.fontSize === '3' ? 'active-btn' : ''}
                >
                    <Type size={14} />
                    <span className="font-size-label">N</span>
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('fontSize', '5')}
                    title="Grande"
                    className={activeStyles.fontSize === '5' ? 'active-btn' : ''}
                >
                    <Type size={18} />
                    <span className="font-size-label">G</span>
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('fontSize', '2')}
                    title="Pequeño"
                    className={activeStyles.fontSize === '2' ? 'active-btn' : ''}
                >
                    <Type size={12} />
                    <span className="font-size-label">P</span>
                </button>

                <div className="toolbar-divider" />

                <div className="toolbar-group">
                    <button type="button" onClick={() => execCommand('formatBlock', '<h1>')} title="Título 1" className={document.queryCommandValue('formatBlock') === 'h1' ? 'active-btn' : ''}>
                        <Heading1 size={16} />
                    </button>
                    <button type="button" onClick={() => execCommand('formatBlock', '<h2>')} title="Título 2" className={document.queryCommandValue('formatBlock') === 'h2' ? 'active-btn' : ''}>
                        <Heading2 size={16} />
                    </button>
                    <button type="button" onClick={() => execCommand('formatBlock', '<h3>')} title="Título 3" className={document.queryCommandValue('formatBlock') === 'h3' ? 'active-btn' : ''}>
                        <Heading3 size={16} />
                    </button>
                </div>

                <div className="toolbar-divider" />

                <div className="toolbar-group">
                    <button
                        type="button"
                        onClick={() => execCommand('justifyLeft')}
                        title="Alinear Izquierda"
                        className={activeStyles.justifyLeft ? 'active-btn' : ''}
                    >
                        <AlignLeft size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCommand('justifyCenter')}
                        title="Centrar"
                        className={activeStyles.justifyCenter ? 'active-btn' : ''}
                    >
                        <AlignCenter size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCommand('justifyRight')}
                        title="Alinear Derecha"
                        className={activeStyles.justifyRight ? 'active-btn' : ''}
                    >
                        <AlignRight size={16} />
                    </button>
                </div>

                <div className="toolbar-divider" />

                <div className="toolbar-group">
                    <button type="button" onClick={() => execCommand('outdent')} title="Reducir Sangría">
                        <IndentDecrease size={16} />
                    </button>
                    <button type="button" onClick={() => execCommand('indent')} title="Aumentar Sangría">
                        <IndentIncrease size={16} />
                    </button>
                </div>

                <div className="toolbar-divider" />

                <div className="toolbar-group">
                    <button
                        type="button"
                        onClick={() => execCommand('insertUnorderedList')}
                        title="Lista"
                        className={activeStyles.insertUnorderedList ? 'active-btn' : ''}
                    >
                        <List size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCommand('insertOrderedList')}
                        title="Lista Numerada"
                        className={activeStyles.insertOrderedList ? 'active-btn' : ''}
                    >
                        <ListOrdered size={16} />
                    </button>
                </div>

                <div className="toolbar-divider" />

                <div className="toolbar-group color-picker-group">
                    <button type="button" title="Color de Texto" className="color-btn-main">
                        <Palette size={16} />
                    </button>
                    <div className="color-dropdown">
                        {[
                            '#000000', '#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed',
                            '#1e3a8a', '#064e3b', '#7f1d1d', '#4b5563', '#94a3b8', '#be185d', '#0f766e'
                        ].map(color => (
                            <div
                                key={color}
                                className="color-swatch"
                                style={{ backgroundColor: color }}
                                onClick={() => execCommand('foreColor', color)}
                                title={color}
                            />
                        ))}
                    </div>
                </div>

                <div className="toolbar-divider" />

                <button type="button" onClick={() => execCommand('removeFormat')} title="Borrar Formato">
                    <Eraser size={16} />
                </button>
            </div>
            <div
                ref={editorRef}
                className="rich-editor-content"
                contentEditable
                onInput={handleInput}
                onBlur={handleInput}
                onKeyDown={handleKeyDown}
                onKeyUp={updateActiveStyles}
                onMouseUp={updateActiveStyles}
                data-placeholder={placeholder}
                style={{ minHeight: minHeight }}
            />

            <style>{`
                .rich-editor-container {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    overflow: hidden;
                    background: white;
                }
                .rich-editor-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                    flex-wrap: wrap;
                }
                .rich-editor-toolbar button {
                    padding: 8px;
                    border-radius: 6px;
                    background: transparent;
                    color: #64748b;
                    border: 1px solid transparent;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    position: relative;
                }
                .rich-editor-toolbar button:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                }
                .rich-editor-toolbar button.active-btn {
                    background: #eff6ff;
                    color: #2563eb;
                    border-color: #bfdbfe;
                    box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
                }
                .font-size-label {
                    font-size: 8px;
                    font-weight: bold;
                    margin-top: 2px;
                }
                .toolbar-divider {
                    width: 1px;
                    height: 24px;
                    background: #e2e8f0;
                    margin: 0 4px;
                }
                .toolbar-group {
                    display: flex;
                    gap: 2px;
                }
                .color-picker-group {
                    position: relative;
                }
                .color-dropdown {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 8px;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 4px;
                    z-index: 10;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }
                .color-picker-group:hover .color-dropdown {
                    display: grid;
                }
                .color-swatch {
                    width: 20px;
                    height: 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    border: 1px solid #e2e8f0;
                }
                .color-swatch:hover {
                    transform: scale(1.1);
                }
                .rich-editor-content {
                    padding: 16px;
                    outline: none;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    color: #1e293b;
                    background: white;
                }
                .rich-editor-content h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: #1e293b; }
                .rich-editor-content h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #1e293b; }
                .rich-editor-content h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: #1e293b; }
                .rich-editor-content ul { list-style-type: disc; margin-left: 1.5rem; }
                .rich-editor-content ol { list-style-type: decimal; margin-left: 1.5rem; }
                .rich-editor-content[contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #94a3b8;
                    cursor: text;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;

``n
---


## Archivo: $(src\components\SectionEditorPopOver.tsx)

**Propsito:** Componente reutilizable de la interfaz de usuario.

`$ext
import React from 'react';
import { X, Check } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

interface SectionEditorPopOverProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (value: string) => void;
    title: string;
    initialValue: string;
    type?: 'text' | 'rich' | 'number';
    placeholder?: string;
}

const SectionEditorPopOver: React.FC<SectionEditorPopOverProps> = ({
    isOpen,
    onClose,
    onSave,
    title,
    initialValue,
    type = 'text',
    placeholder = ''
}) => {
    const [value, setValue] = React.useState(initialValue);

    React.useEffect(() => {
        setValue(initialValue);
    }, [initialValue, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(value);
        onClose();
    };

    return (
        <div className="popover-overlay" onClick={onClose}>
            <div className="popover-content" onClick={e => e.stopPropagation()}>
                <div className="popover-header">
                    <h4>{title}</h4>
                    <button className="close-btn" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="popover-body">
                    {type === 'rich' ? (
                        <RichTextEditor
                            value={value}
                            onChange={setValue}
                            placeholder={placeholder}
                            minHeight="150px"
                        />
                    ) : type === 'number' ? (
                        <input
                            type="number"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            className="popover-input"
                            placeholder={placeholder}
                        />
                    ) : (
                        <textarea
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            className="popover-textarea"
                            placeholder={placeholder}
                            rows={4}
                        />
                    )}
                </div>
                <div className="popover-footer">
                    <button className="btn-save-pop" onClick={handleSave}>
                        <Check size={16} /> Aplicar cambios
                    </button>
                </div>
            </div>

            <style>{`
                .popover-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(2px);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .popover-content {
                    background: white;
                    width: 100%;
                    max-width: 500px;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    animation: popoverIn 0.2s ease-out;
                }
                .popover-header {
                    padding: 12px 16px;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8fafc;
                }
                .popover-header h4 {
                    margin: 0;
                    font-size: 0.9rem;
                    color: #1e293b;
                    font-weight: 600;
                }
                .popover-body {
                    padding: 16px;
                }
                .popover-input, .popover-textarea {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-family: inherit;
                }
                .popover-input:focus, .popover-textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
                }
                .popover-footer {
                    padding: 12px 16px;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: flex-end;
                    background: #f8fafc;
                }
                .btn-save-pop {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-save-pop:hover {
                    background: #1d4ed8;
                }
                .close-btn {
                    background: transparent;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 4px;
                }
                .close-btn:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                }
                @keyframes popoverIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default SectionEditorPopOver;

``n
---


## Archivo: $(src\components\SignaturePad.tsx)

**Propsito:** Componente reutilizable de la interfaz de usuario.

`$ext

import React, { useRef, useState } from 'react';
import ReactSignatureCanvas from 'react-signature-canvas';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  label?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, label = 'Firma' }) => {
  const sigPad = useRef<any>(null); // Type 'any' used to bypass missing react-signature-canvas complex type in some envs
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigPad.current?.clear();
    setIsEmpty(true);
    onSave(''); // Notify parent that signature is cleared
  };

  const handleEnd = () => {
    if (sigPad.current) {
      if (sigPad.current.isEmpty()) {
        setIsEmpty(true);
        onSave('');
      } else {
        setIsEmpty(false);
        const dataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
        onSave(dataUrl);
      }
    }
  };

  return (
    <div className="signature-pad-container">
      <label className="sig-label">{label}</label>
      <div className="sig-canvas-wrapper">
        <ReactSignatureCanvas
          ref={(ref) => { sigPad.current = ref; }}
          penColor="black"
          canvasProps={{
            className: 'sig-canvas'
          }}
          onEnd={handleEnd}
        />
      </div>
      <div className="sig-controls">
        <button onClick={clear} className="btn-text" disabled={isEmpty}>
          <Eraser size={14} /> Borrar
        </button>
      </div>

      <style>{`
        .signature-pad-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          border: 1px solid #e5e7eb;
          padding: 12px;
          border-radius: 8px;
          background: #f9fafb;
        }
        .sig-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }
        .sig-canvas-wrapper {
          border: 1px dashed #d1d5db;
          border-radius: 4px;
          background: #fff;
          height: 150px;
          overflow: hidden;
        }
        .sig-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
        .sig-controls {
          display: flex;
          justify-content: flex-end;
        }
        .btn-text {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #6b7280;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .btn-text:hover:not(:disabled) {
          background-color: #fee2e2;
          color: #ef4444;
        }
        .btn-text:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default SignaturePad;

``n
---


## Archivo: $(src\components\SurfaceCalculator.tsx)

**Propsito:** Componente reutilizable de la interfaz de usuario.

`$ext
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
                                <div><label>Lado 1 (m)</label><input type="text" inputMode="decimal" value={val1} onChange={e => setVal1(e.target.value)} /></div>
                                <div><label>Lado 2 (m)</label><input type="text" inputMode="decimal" value={val2} onChange={e => setVal2(e.target.value)} /></div>
                                <div><label>Ancho 1 (m)</label><input type="text" inputMode="decimal" value={val3} onChange={e => setVal3(e.target.value)} /></div>
                                <div><label>Ancho 2 (m)</label><input type="text" inputMode="decimal" value={val4} onChange={e => setVal4(e.target.value)} /></div>
                                <div style={{ gridColumn: '1 / -1' }}><label>Altura (m) *Requerido</label><input type="text" inputMode="decimal" value={valH} onChange={e => setValH(e.target.value)} /></div>
                            </>
                        ) : (
                            <>
                                <div><label>Largo (m)</label><input type="text" inputMode="decimal" value={val1} onChange={e => setVal1(e.target.value)} /></div>
                                <div><label>Ancho (m)</label><input type="text" inputMode="decimal" value={val2} onChange={e => setVal2(e.target.value)} /></div>
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

``n
---


## Archivo: $(src\constants\index.ts)

**Propsito:** Componente o mdulo de utilidad.

`$ext

export const BUDGET_GROUPS = [
    "OBRA CIVIL",
    "DECORACION",
    "VARIOS"
] as const;

export const DEFAULT_IVA_RATES = [
    { label: "21%", value: 0.21 },
    { label: "10%", value: 0.10 },
    { label: "4%", value: 0.04 },
    { label: "0%", value: 0.00 }
];

``n
---


## Archivo: $(src\context\ToastContext.tsx)

**Propsito:** Proveedores de Contexto global para la aplicacin.

`$ext

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string; // unique
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3s
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        <div className="toast-icon">
                            {toast.type === 'success' && <CheckCircle size={20} />}
                            {toast.type === 'error' && <AlertCircle size={20} />}
                            {toast.type === 'info' && <Info size={20} />}
                        </div>
                        <span className="toast-message">{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className="toast-close">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                .toast-container {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .toast {
                    display: flex;
                    align-items: center;
                    background: white;
                    padding: 12px 16px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    min-width: 300px;
                    animation: slideIn 0.3s ease-out;
                    border-left: 4px solid transparent;
                }
                .toast-success { border-left-color: #10b981; }
                .toast-error { border-left-color: #ef4444; }
                .toast-info { border-left-color: #3b82f6; }
                
                .toast-icon { margin-right: 12px; }
                .toast-success .toast-icon { color: #10b981; }
                .toast-error .toast-icon { color: #ef4444; }
                .toast-info .toast-icon { color: #3b82f6; }

                .toast-message {
                    flex: 1;
                    font-size: 0.875rem;
                    color: #1f2937;
                    font-weight: 500;
                }
                .toast-close {
                    background: none;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 4px;
                    margin-left: 8px;
                }
                .toast-close:hover { color: #4b5563; }

                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                @media (max-width: 640px) {
                    .toast-container {
                        bottom: 16px;
                        right: 16px;
                        left: 16px;
                    }
                    .toast {
                        min-width: unset;
                        width: 100%;
                    }
                }
            `}</style>
        </ToastContext.Provider>
    );
};

``n
---


## Archivo: $(src\hooks\useBudget.ts)

**Propsito:** Custom Hooks de React para lgica de estado e IO.

`$ext

import { useState, useEffect } from 'react';
import type { Budget, BudgetItem, Client } from '../types';
import { v4 as uuidv4 } from 'uuid';

const EMPTY_CLIENT: Client = {
    id: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    nif: ''
};

const EMPTY_BUDGET: Budget = {
    id: '',
    number: '',
    projectName: '',
    clientId: '',
    clientData: EMPTY_CLIENT,
    date: Date.now(),
    items: [],
    subtotal: 0,
    ivaRate: 0.21,
    ivaAmount: 0,
    total: 0,
    notes: '',
    status: 'draft'
};

export const useBudget = (initialBudget?: Budget) => {
    const [budget, setBudget] = useState<Budget>(() => {
        // Try to load from localstorage first if no initialBudget is provided
        if (!initialBudget) {
            const saved = localStorage.getItem('current_budget_draft');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse saved draft", e);
                }
            }
        }
        return initialBudget || { ...EMPTY_BUDGET, id: uuidv4() };
    });

    // Save to localstorage whenever budget changes
    useEffect(() => {
        if (budget) {
            localStorage.setItem('current_budget_draft', JSON.stringify(budget));
        }
    }, [budget]);

    // Recalculate totals whenever items or IVA rate changes
    useEffect(() => {
        const subtotal = budget.items.reduce((acc, item) => acc + item.amount, 0);
        const ivaAmount = subtotal * budget.ivaRate;
        const total = subtotal + ivaAmount;

        setBudget(prev => {
            // Avoid infinite loop if totals are already correct
            if (Math.abs(prev.total - total) < 0.01 && Math.abs(prev.subtotal - subtotal) < 0.01) {
                return prev;
            }
            return {
                ...prev,
                subtotal,
                ivaAmount,
                total
            };
        });
    }, [budget.items, budget.ivaRate]);

    const updateClientData = (field: keyof Client, value: string) => {
        setBudget(prev => ({
            ...prev,
            clientData: {
                ...prev.clientData,
                [field]: value
            }
        }));
    };

    const addItem = (item: Omit<BudgetItem, 'id' | 'amount'>) => {
        const newItem: BudgetItem = {
            ...item,
            id: uuidv4(),
            amount: item.quantity * item.price
        };

        setBudget(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
    };

    const updateItem = (id: string, field: keyof BudgetItem, value: any) => {
        setBudget(prev => {
            const newItems = prev.items.map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };
                    // Recalculate amount if quantity or price changes
                    if (field === 'quantity' || field === 'price') {
                        updatedItem.amount = updatedItem.quantity * updatedItem.price;
                    }
                    return updatedItem;
                }
                return item;
            });
            return { ...prev, items: newItems };
        });
    };

    const saveItem = (id: string, itemData: BudgetItem) => {
        setBudget(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...itemData, amount: itemData.quantity * itemData.price } : item)
        }));
    };

    const removeItem = (id: string) => {
        setBudget(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    const updateBudgetField = (field: keyof Budget, value: any) => {
        setBudget(prev => ({ ...prev, [field]: value }));
    };

    return {
        budget,
        setBudget,
        updateClientData,
        addItem,
        updateItem,
        saveItem,
        removeItem,
        updateBudgetField
    };
};

``n
---


## Archivo: $(src\hooks\useCompanyData.ts)

**Propsito:** Custom Hooks de React para lgica de estado e IO.

`$ext

import { useState, useEffect } from 'react';
import type { CompanyConfig } from '../types';
import { budgetService } from '../services/budgetService';

const STORAGE_KEY = 'dlkom_company_config';

const INITIAL_CONFIG: CompanyConfig = {
    name: '',
    address: '',
    phone: '',
    email: '',
    cif: '',
    logoUrl: '',
    sealUrl: '',
    defaultNotes: 'El presupuesto tiene una validez de 30 días.\nForma de pago: 50% al aceptar, 50% al finalizar.',
    paymentTerms: '50% A la aceptación del presupuesto\n50% A la finalización de los trabajos',
    pdfFontSize: 9,
    pdfCategoryFontSize: 9,
    pdfHeaderFontSize: 14,
    pdfAddressFontSize: 7,
    pdfClientFontSize: 9,
    pdfTitleFontSize: 9,
    pdfTableHeadFontSize: 10,
    pdfNotesFontSize: 7,
    pdfLineSpacing: 1.15
};

export const useCompanyData = () => {
    const [companyData, setCompanyData] = useState<CompanyConfig>(INITIAL_CONFIG);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadConfig = async () => {
            // 1. Load Local first for speed
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    setCompanyData(JSON.parse(saved));
                } catch (e) {
                    console.error('Failed to parse local company data', e);
                }
            }

            // 2. Try to sync with Firebase
            const remoteConfig = await budgetService.getCompanyConfig();
            if (remoteConfig) {
                setCompanyData(remoteConfig);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteConfig));
            }
            setLoading(false);
        };

        loadConfig();
    }, []);

    const saveCompanyData = async (data: CompanyConfig) => {
        try {
            setCompanyData(data);
            // Save local
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            // Save remote
            await budgetService.saveCompanyConfig(data);
            return true;
        } catch (e: any) {
            console.error('Error saving company data', e);
            alert("Error al guardar en la nube: " + (e.message || "Permiso denegado o archivo muy pesado"));
            return false;
        }
    };

    const updateLogo = (file: File) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const result = e.target?.result as string;
            await saveCompanyData({ ...companyData, logoUrl: result });
        };
        reader.readAsDataURL(file);
    };

    const updateSeal = (file: File) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const result = e.target?.result as string;
            await saveCompanyData({ ...companyData, sealUrl: result });
        };
        reader.readAsDataURL(file);
    };

    return {
        companyData,
        loading,
        saveCompanyData,
        updateLogo,
        updateSeal
    };
};

``n
---


## Archivo: $(src\hooks\useMasterData.ts)

**Propsito:** Custom Hooks de React para lgica de estado e IO.

`$ext

import { useState, useEffect } from 'react';
import type { MasterData, GroupCategory } from '../types';

const STORAGE_KEY = 'dlkom_master_data';

const DEFAULT_GROUPS: GroupCategory[] = [
    {
        name: "OBRA CIVIL",
        categories: ["Albañilería", "Demoliciones", "Fontanería", "Electricidad", "Carpintería Metálica", "Carpintería Madera"]
    },
    {
        name: "DECORACION",
        categories: ["Mobiliario Cocina", "Mobiliario Baño", "Iluminación", "Textil", "Pintura Decorativa"]
    },
    {
        name: "VARIOS",
        categories: ["Limpieza", "Transporte", "Tasas", "Otros"]
    }
];

export const useMasterData = () => {
    const [masterData, setMasterData] = useState<MasterData>({ groups: DEFAULT_GROUPS });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setMasterData(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse master data', e);
            }
        }
        setLoading(false);
    }, []);

    const saveMasterData = (data: MasterData) => {
        setMasterData(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    const addGroup = (groupName: string) => {
        if (masterData.groups.some(g => g.name === groupName)) return;
        saveMasterData({
            groups: [...masterData.groups, { name: groupName, categories: [] }]
        });
    };

    const deleteGroup = (groupName: string) => {
        saveMasterData({
            groups: masterData.groups.filter(g => g.name !== groupName)
        });
    };

    const addCategory = (groupName: string, categoryName: string) => {
        const newGroups = masterData.groups.map(g => {
            if (g.name === groupName) {
                if (g.categories.includes(categoryName)) return g;
                return { ...g, categories: [...g.categories, categoryName] };
            }
            return g;
        });
        saveMasterData({ groups: newGroups });
    };

    const deleteCategory = (groupName: string, categoryName: string) => {
        const newGroups = masterData.groups.map(g => {
            if (g.name === groupName) {
                return { ...g, categories: g.categories.filter(c => c !== categoryName) };
            }
            return g;
        });
        saveMasterData({ groups: newGroups });
    };

    return {
        masterData,
        loading,
        addGroup,
        deleteGroup,
        addCategory,
        deleteCategory,
        saveMasterData
    };
};

``n
---


## Archivo: $(src\pages\BudgetEditor.tsx)

**Propsito:** Pgina o vista principal de la aplicacin.

`$ext

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
import PdfPreviewModal from '../components/PdfPreviewModal';

const BudgetEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { budget, updateClientData, addItem, saveItem, removeItem, updateBudgetField, setBudget } = useBudget();
    const { companyData } = useCompanyData();
    const { masterData } = useMasterData();
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
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
                                <button onClick={() => setIsPdfModalOpen(true)}>
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

            <PdfPreviewModal
                isOpen={isPdfModalOpen}
                onClose={() => setIsPdfModalOpen(false)}
                budget={budget}
                companyData={companyData}
                showPrices={showPrices}
                showTotals={showTotals}
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

``n
---


## Archivo: $(src\pages\BudgetList.tsx)

**Propsito:** Pgina o vista principal de la aplicacin.

`$ext

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText, Trash2, Copy } from 'lucide-react';
import { budgetService } from '../services/budgetService';
import type { Budget } from '../types';
import { v4 as uuidv4 } from 'uuid';

const BudgetList: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    const data = await budgetService.getAll();
    setBudgets(data);
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      await budgetService.delete(id);
      loadBudgets();
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, budget: Budget) => {
    e.preventDefault();
    e.stopPropagation();

    const newBudget: Budget = {
      ...budget,
      id: uuidv4(),
      number: budget.number ? `${budget.number} (Copia)` : 'Borrador (Copia)',
      date: Date.now(),
      status: 'draft'
    };

    await budgetService.save(newBudget);
    loadBudgets();
  };

  const filteredBudgets = budgets.filter(b =>
    (b.clientData?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="budget-list-container">
      <div className="list-header">
        <div className="search-bar">
          <input
            placeholder="Buscar por cliente o número..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search className="search-icon" size={20} />
        </div>
        <Link to="/budgets/new" className="btn-primary">
          <Plus size={20} /> Nuevo
        </Link>
      </div>

      {loading ? (
        <div className="loading">Cargando proyectos...</div>
      ) : filteredBudgets.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} color="#9ca3af" />
          <p>No hay proyectos guardados</p>
          <Link to="/budgets/new" className="btn-secondary">Crear el primero</Link>
        </div>
      ) : (
        <div className="budgets-grid">
          {filteredBudgets.map(budget => (
            <Link to={`/budgets/${budget.id}`} key={budget.id} className="budget-card">
              <div className="card-header" style={{ justifyContent: 'flex-end' }}>
                <span className={`status-badge ${budget.status}`}>
                  {budget.status === 'draft' ? 'Borrador' :
                    budget.status === 'pending' ? 'Pendiente' :
                      budget.status === 'accepted' ? 'Aceptado' : 'Rechazado'}
                </span>
              </div>
              <div className="card-body">
                <div className="project-client-info">
                  <span className="budget-number">{budget.number || 'Borrador'}</span>
                  <h3>{budget.clientData?.name || 'Sin Cliente'}</h3>
                </div>
                <p>{new Date(budget.date).toLocaleDateString()}</p>
                <div className="total-badge">
                  {budget.total.toFixed(2)} €
                </div>
              </div>
              <div className="card-actions">
                <button
                  className="icon-btn duplicate-btn"
                  onClick={(e) => handleDuplicate(e, budget)}
                  title="Duplicar (Variación)"
                >
                  <Copy size={18} />
                </button>
                <button
                  className="icon-btn delete-btn"
                  onClick={(e) => handleDelete(e, budget.id)}
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .budget-list-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          gap: 16px;
        }

        .search-bar {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-bar input {
          padding-left: 12px;
          padding-right: 40px;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          width: 100%;
          padding-top: 8px;
          padding-bottom: 8px;
        }

        .btn-primary {
          background-color: var(--primary-color);
          color: white;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        
        .btn-secondary {
            display: inline-block;
            margin-top: 10px;
            padding: 8px 16px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background: white;
            color: #374151;
            text-decoration: none;
        }

        .budgets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .budget-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s, box-shadow 0.2s;
          min-height: 200px;
        }

        .budget-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-color: var(--primary-color);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .project-client-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 8px;
        }

        .project-client-info .budget-number {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .card-body h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .card-body p {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 12px;
        }

        .total-badge {
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--primary-color);
        }

        .card-actions {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
          display: flex;
          justify-content: flex-end;
        }

        .icon-btn.delete-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            color: #9ca3af;
            padding: 8px;
            border-radius: 4px;
        }

        .icon-btn.duplicate-btn:hover {
          color: var(--primary-color);
          background: #eff6ff;
        }

        .icon-btn.delete-btn:hover {
          color: #ef4444;
          background: #fef2f2; 
        }

        .empty-state {
          text-align: center;
          padding: 60px;
          color: #6b7280;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        @media (max-width: 600px) {
          .list-header {
            flex-direction: column;
            align-items: stretch;
          }
           .search-bar input {
             width: 100%;
           }
        }
      `}</style>
    </div>
  );
};

export default BudgetList;

``n
---


## Archivo: $(src\pages\Settings.tsx)

**Propsito:** Pgina o vista principal de la aplicacin.

`$ext

import React, { useState, useRef } from 'react';
import { useCompanyData } from '../hooks/useCompanyData';
import { useToast } from '../context/ToastContext';
import { Save, Upload, TrendingUp, X, Layout, MessageSquare } from 'lucide-react';
import { formatPhoneNumber, formatTaxID } from '../utils/formatters';
import RichTextEditor from '../components/RichTextEditor';
import { budgetService } from '../services/budgetService';
import type { Budget } from '../types';

const Settings: React.FC = () => {
  const { companyData, saveCompanyData, updateLogo, updateSeal } = useCompanyData();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(companyData);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const sealInputRef = useRef<HTMLInputElement>(null);

  // Profit Analyzer States
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');

  // Modal State
  const [activeModal, setActiveModal] = useState<'pdf' | 'profit' | 'notes' | null>(null);

  // Load budgets for analysis
  React.useEffect(() => {
    const fetchBudgets = async () => {
      const data = await budgetService.getAll();
      setBudgets(data);
    };
    fetchBudgets();
  }, []);

  const selectedBudget = budgets.find(b => b.id === selectedBudgetId);

  const calculateProfit = (budget: Budget) => {
    let totalCost = 0;
    let totalSale = 0;

    budget.items.forEach(item => {
      const quantity = item.quantity || 0;
      const price = item.price || 0;
      const cost = item.costPrice || 0;

      totalSale += price * quantity;
      totalCost += cost * quantity;
    });

    const profitAmount = totalSale - totalCost;
    const profitPercent = totalCost > 0 ? (profitAmount / totalCost) * 100 : 0;

    return { profitAmount, profitPercent, totalSale, totalCost };
  };

  const profitStats = selectedBudget ? calculateProfit(selectedBudget) : null;

  // Sync state when data loads
  React.useEffect(() => {
    setFormData(companyData);
  }, [companyData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    if (name === 'phone') {
      value = formatPhoneNumber(value);
    } else if (name === 'cif') {
      value = formatTaxID(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: (name.includes('FontSize') ? parseInt(value) : value)
    }));
  };

  const handleSave = async () => {
    const success = await saveCompanyData(formData);
    if (success) {
      showToast('Configuración guardada correctamente', 'success');
    }
  };

  const handleLogoClick = () => logoInputRef.current?.click();
  const handleSealClick = () => sealInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'seal') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'logo') updateLogo(file);
    else updateSeal(file);
  };

  if (!formData) return <div>Cargando...</div>;

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Datos de la Empresa</h2>
        <button className="btn-primary" onClick={handleSave}>
          <Save size={18} />
          Guardar Cambios
        </button>
      </div>

      <div className="settings-dashboard-grid">
        <div className="card core-info">
          <h3>Información Básica</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre de Empresa</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>CIF / NIF</label>
              <input type="text" name="cif" value={formData.cif} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Dirección Física</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Teléfono</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email de Contacto</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="card logo-seal">
          <h3>Identidad Visual</h3>
          <div className="uploader-row">
            <div className="image-uploader">
              <label>Logo Principal</label>
              <div className="upload-container">
                <div className="upload-area" onClick={handleLogoClick}>
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="preview-img" />
                  ) : (
                    <div className="placeholder">
                      <Upload size={24} />
                      <span>Subir Logo</span>
                    </div>
                  )}
                </div>
              </div>
              <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
            </div>
            <div className="image-uploader">
              <label>Sello (PDF)</label>
              <div className="upload-container">
                <div className="upload-area" onClick={handleSealClick}>
                  {formData.sealUrl ? (
                    <img src={formData.sealUrl} alt="Sello" className="preview-img" />
                  ) : (
                    <div className="placeholder">
                      <Upload size={24} />
                      <span>Subir Sello</span>
                    </div>
                  )}
                </div>
              </div>
              <input type="file" ref={sealInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'seal')} />
            </div>
          </div>
        </div>

        <div className="card action-cards-container full-width">
          <h3>Configuraciones Avanzadas</h3>
          <div className="action-grid">
            <div className="action-card pdf-card" onClick={() => setActiveModal('pdf')}>
              <div className="action-icon"><Layout size={32} /></div>
              <div className="action-info">
                <h4>Tipografías y Estilos</h4>
                <p>Ajusta el tamaño de letra de cada sección y el interlineado del PDF.</p>
              </div>
            </div>

            <div className="action-card notes-card" onClick={() => setActiveModal('notes')}>
              <div className="action-icon"><MessageSquare size={32} /></div>
              <div className="action-info">
                <h4>Notas por Defecto</h4>
                <p>Edita las condiciones, garantías y formas de pago predeterminadas.</p>
              </div>
            </div>

            <div className="action-card stats-card" onClick={() => setActiveModal('profit')}>
              <div className="action-icon"><TrendingUp size={32} /></div>
              <div className="action-info">
                <h4>Analizador de Beneficios</h4>
                <p>Revisa la rentabilidad y márgenes de tus proyectos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="settings-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{activeModal === 'pdf' ? 'Estilos de Impresión' : activeModal === 'profit' ? 'Análisis de Beneficios' : 'Textos Predeterminados'}</h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}><X size={24} /></button>
            </div>

            <div className="modal-body scrollable">
              {activeModal === 'pdf' && (
                <div className="pdf-modal-view">
                  <div className="font-settings-grid">
                    <div className="font-setting-group">
                      <h4>Empresa y Cliente</h4>
                      <div className="form-group-inline">
                        <label>Nombre Empresa</label>
                        <select name="pdfHeaderFontSize" value={formData.pdfHeaderFontSize} onChange={handleChange}>
                          {[8, 9, 10, 11, 12, 14, 16, 18].map(s => <option key={s} value={s}>{s}pt</option>)}
                        </select>
                      </div>
                      <div className="form-group-inline">
                        <label>Dirección/Contacto</label>
                        <select name="pdfAddressFontSize" value={formData.pdfAddressFontSize} onChange={handleChange}>
                          {[6, 7, 8, 9, 10, 11].map(s => <option key={s} value={s}>{s}pt</option>)}
                        </select>
                      </div>
                      <div className="form-group-inline">
                        <label>Datos Cliente</label>
                        <select name="pdfClientFontSize" value={formData.pdfClientFontSize} onChange={handleChange}>
                          {[7, 8, 9, 10, 11, 12].map(s => <option key={s} value={s}>{s}pt</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="font-setting-group">
                      <h4>Título y Tabla</h4>
                      <div className="form-group-inline">
                        <label>Título Presupuesto</label>
                        <select name="pdfTitleFontSize" value={formData.pdfTitleFontSize} onChange={handleChange}>
                          {[8, 9, 10, 11, 12, 14].map(s => <option key={s} value={s}>{s}pt</option>)}
                        </select>
                      </div>
                      <div className="form-group-inline">
                        <label>Cabecera Tabla</label>
                        <select name="pdfTableHeadFontSize" value={formData.pdfTableHeadFontSize} onChange={handleChange}>
                          {[8, 9, 10, 11, 12].map(s => <option key={s} value={s}>{s}pt</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="font-setting-group">
                      <h4>Partidas y Notas</h4>
                      <div className="form-group-inline">
                        <label>Categorías</label>
                        <select name="pdfCategoryFontSize" value={formData.pdfCategoryFontSize} onChange={handleChange}>
                          {[7, 8, 9, 10, 11, 12, 14].map(s => <option key={s} value={s}>{s}pt</option>)}
                        </select>
                      </div>
                      <div className="form-group-inline">
                        <label>Descripciones</label>
                        <select name="pdfFontSize" value={formData.pdfFontSize} onChange={handleChange}>
                          {[7, 8, 9, 10, 11, 12, 14].map(s => <option key={s} value={s}>{s}pt</option>)}
                        </select>
                      </div>
                      <div className="form-group-inline">
                        <label>Notas Finales</label>
                        <select name="pdfNotesFontSize" value={formData.pdfNotesFontSize} onChange={handleChange}>
                          {[6, 7, 8, 9, 10, 11].map(s => <option key={s} value={s}>{s}pt</option>)}
                        </select>
                      </div>
                      <div className="form-group-inline">
                        <label>Interlineado (Separación)</label>
                        <select name="pdfLineSpacing" value={formData.pdfLineSpacing} onChange={handleChange}>
                          {[0.8, 0.9, 1.0, 1.15, 1.3, 1.5].map(s => <option key={s} value={s}>{s}x</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'notes' && (
                <div className="notes-modal-view">
                  <div className="form-group">
                    <label>Notas Predeterminadas</label>
                    <RichTextEditor
                      value={formData.defaultNotes}
                      onChange={(val) => setFormData(prev => ({ ...prev, defaultNotes: val }))}
                      placeholder="Notas que aparecerán en todos los presupuestos..."
                      minHeight="250px"
                    />
                  </div>
                  <div className="form-group">
                    <label>Forma de Pago</label>
                    <textarea name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} rows={4} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </div>
                </div>
              )}

              {activeModal === 'profit' && (
                <div className="profit-modal-view">
                  <div className="analyzer-controls">
                    <div className="form-group">
                      <label>Seleccionar Proyecto</label>
                      <select value={selectedBudgetId} onChange={(e) => setSelectedBudgetId(e.target.value)} className="analyzer-select" style={{ width: '100%' }}>
                        <option value="">-- Elige un presupuesto --</option>
                        {budgets.map(b => <option key={b.id} value={b.id}>{b.number} - {b.clientData.name}</option>)}
                      </select>
                    </div>
                  </div>
                  {profitStats ? (
                    <div className="profit-display-grid">
                      <div className="profit-card">
                        <span className="profit-label">Venta (Sin IVA)</span>
                        <span className="profit-value text-blue">{profitStats.totalSale.toLocaleString()} €</span>
                      </div>
                      <div className="profit-card">
                        <span className="profit-label">Coste</span>
                        <span className="profit-value text-orange">{profitStats.totalCost.toLocaleString()} €</span>
                      </div>
                      <div className={`profit-card highlight ${profitStats.profitAmount >= 0 ? 'bg-green-light' : 'bg-red-light'}`}>
                        <span className="profit-label">Beneficio</span>
                        <span className={`profit-value ${profitStats.profitAmount >= 0 ? 'text-green' : 'text-red'}`}>{profitStats.profitAmount.toLocaleString()} €</span>
                      </div>
                      <div className={`profit-card highlight ${profitStats.profitPercent >= 0 ? 'bg-green-light' : 'bg-red-light'}`}>
                        <span className="profit-label">% Margen</span>
                        <span className={`profit-value ${profitStats.profitPercent >= 0 ? 'text-green' : 'text-red'}`}>{profitStats.profitPercent.toFixed(2)}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="analyzer-empty">
                      <TrendingUp size={48} />
                      <p>Selecciona un proyecto para ver los beneficios.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .settings-container {
        max-width: 1200px;
        margin: 0 auto;
        padding-bottom: 40px;
      }
      .settings-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .settings-dashboard-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      .card {
        background: white;
        padding: 24px;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .full-width { grid-column: 1 / -1; }
      
      .uploader-row {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .action-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-top: 10px;
      }
      
      .action-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 16px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .action-card:hover {
        transform: translateY(-4px);
        background: white;
        border-color: #3b82f6;
        box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.1);
      }
      
      .action-icon {
        background: white;
        width: 64px;
        height: 64px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #3b82f6;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      }
      
      .pdf-card .action-icon { color: #2563eb; }
      .notes-card .action-icon { color: #7c3aed; }
      .stats-card .action-icon { color: #10b981; }

      .action-info h4 { margin-bottom: 4px; font-size: 1rem; color: #1e293b; }
      .action-info p { font-size: 0.85rem; color: #64748b; line-height: 1.4; }

      /* Modals */
      .settings-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(4px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .settings-modal-content {
        background: white;
        width: 100%;
        max-width: 800px;
        max-height: 90vh;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        animation: modalFadeIn 0.3s ease-out;
      }
      
      .modal-header {
        padding: 20px 24px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .scrollable { overflow-y: auto; padding: 24px; }
      
      .font-settings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
      }
      
      .font-setting-group { background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
      .font-setting-group h4 { font-size: 0.85rem; text-transform: uppercase; color: #64748b; margin-bottom: 12px; letter-spacing: 0.5px; }
      
      .form-group-inline { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
      .form-group-inline label { font-size: 0.875rem; color: #4b5563; }
      .form-group-inline select { padding: 4px 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.875rem; }

      .profit-display-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 20px; }
      .profit-card { padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 4px; }
      .profit-label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
      .profit-value { font-size: 1.25rem; font-weight: 700; }
      
      .image-uploader { flex: 1; }
      .upload-area {
        border: 2px dashed #e2e8f0;
        border-radius: 12px;
        height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background: #f8fafc;
        overflow: hidden;
      }
      .preview-img { max-height: 100px; max-width: 90%; object-fit: contain; }

      .text-green { color: #16a34a; }
      .text-red { color: #ef4444; }
      .text-blue { color: #2563eb; }
      .text-orange { color: #f59e0b; }
      .bg-green-light { background-color: #f0fdf4 !important; border-color: #bbf7d0 !important; }
      .bg-red-light { background-color: #fef2f2 !important; border-color: #fecaca !important; }
      .profit-card.highlight { border-width: 2px; }

      @keyframes modalFadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 900px) {
        .action-grid { grid-template-columns: 1fr; }
        .settings-dashboard-grid { grid-template-columns: 1fr; }
        .uploader-row { grid-template-columns: 1fr; }
      }
    `}</style>
    </div>
  );
};

export default Settings;

``n
---


## Archivo: $(src\services\budgetService.ts)

**Propsito:** Servicios para la comunicacin con bases de datos (Firebase/Supabase).

`$ext

import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import type { Budget } from '../types';

const COLLECTION = 'budgets';
const LOCAL_STORAGE_KEY = 'dlkom_budgets_backup';

// Helper to get local budgets
const getLocalBudgets = (): Budget[] => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

// Helper to save local budgets
const saveLocalBudgets = (budgets: Budget[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(budgets));
};

export const budgetService = {
    getAll: async (): Promise<Budget[]> => {
        try {
            // Try Firebase
            const q = query(collection(db, COLLECTION), orderBy('date', 'desc'));
            const snapshot = await getDocs(q);
            const budgets = snapshot.docs.map(doc => doc.data() as Budget);

            // Update local backup
            // saveLocalBudgets(budgets); 
            // return budgets;

            // FALLBACK FOR DEV WITHOUT KEYS:
            // If firebase fails (likely due to missing config), return local
            if (budgets.length === 0) return getLocalBudgets();
            return budgets;
        } catch (e) {
            console.warn("Firebase fetch failed, using local storage", e);
            return getLocalBudgets();
        }
    },

    getById: async (id: string): Promise<Budget | null> => {
        try {
            const docRef = doc(db, COLLECTION, id);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                return snapshot.data() as Budget;
            }
        } catch (e) {
            console.warn("Firebase get failed", e);
        }
        // Fallback
        const local = getLocalBudgets();
        return local.find(b => b.id === id) || null;
    },

    save: async (budget: Budget): Promise<void> => {
        try {
            await setDoc(doc(db, COLLECTION, budget.id), budget);
        } catch (e) {
            console.warn("Firebase save failed", e);
        }
        // Always save local
        const local = getLocalBudgets();
        const index = local.findIndex(b => b.id === budget.id);
        if (index >= 0) {
            local[index] = budget;
        } else {
            local.push(budget);
        }
        saveLocalBudgets(local);
    },

    delete: async (id: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, COLLECTION, id));
        } catch (e) {
            console.warn("Firebase delete failed", e);
        }
        // Delete local
        const local = getLocalBudgets().filter(b => b.id !== id);
        saveLocalBudgets(local);
    },

    // Company Config Persistence
    getCompanyConfig: async (): Promise<any | null> => {
        try {
            const docRef = doc(db, 'config', 'company');
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                return snapshot.data();
            }
        } catch (e) {
            console.warn("Firebase config fetch failed", e);
        }
        return null;
    },

    saveCompanyConfig: async (config: any): Promise<void> => {
        try {
            console.log("Intentando guardar configuración en Firebase...", config);
            await setDoc(doc(db, 'config', 'company'), config);
            console.log("Configuración guardada en Firebase correctamente.");
        } catch (e) {
            console.error("Error crítico al guardar en Firebase:", e);
            throw e; // Lanzamos el error para que el UI pueda mostrarlo
        }
    }
};

``n
---


## Archivo: $(src\services\firebase.ts)

**Propsito:** Servicios para la comunicacin con bases de datos (Firebase/Supabase).

`$ext

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAL9qa10A-NYSeoKTqivVGaxB9UUOhrsaM",
  authDomain: "dlkomaurrekontua.firebaseapp.com",
  projectId: "dlkomaurrekontua",
  storageBucket: "dlkomaurrekontua.firebasestorage.app",
  messagingSenderId: "180428365229",
  appId: "1:180428365229:web:9f726da5fa67a030df1524",
  measurementId: "G-SDMKZP716L"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

``n
---


## Archivo: $(src\types\index.ts)

**Propsito:** Definiciones de tipos e interfaces de TypeScript.

`$ext

export interface CompanyConfig {
    id?: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    cif: string;
    logoUrl?: string;
    sealUrl?: string; // The "sello" for the pdf
    defaultNotes: string;
    paymentTerms: string; // "Porcentajes de la forma de pago"
    pdfFontSize: number;        // Descriptions
    pdfCategoryFontSize: number; // Categories
    pdfHeaderFontSize: number;   // Company Name
    pdfAddressFontSize: number;  // Address/Contact
    pdfClientFontSize: number;   // Client Info
    pdfTitleFontSize: number;    // Budget Info/Title
    pdfTableHeadFontSize: number; // Table Headers
    pdfNotesFontSize: number;    // Footer Notes
    pdfLineSpacing: number;      // Line height multiplier
}

export interface Client {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    nif: string;
    postalCode?: string;
    city?: string;
}

export interface Budget {
    id: string;
    number: string; // e.g. 2026-001
    projectName?: string; // User-defined name
    clientId: string;
    clientData: Client; // Snapshot of client data at time of budget
    date: number;
    items: BudgetItem[];
    subtotal: number;
    ivaRate: number; // e.g. 0.21
    ivaAmount: number;
    total: number;
    notes: string;
    status: 'draft' | 'pending' | 'accepted' | 'rejected';
    clientSignature?: string; // DataURL
    visualHtml?: string; // Free-form HTML layout for the WYSIWYG visual editor
    paymentMethod?: string;
    paymentTerms?: string; // Per-budget override of company payment terms
}

export interface BudgetItem {
    id: string;
    group: string; // "OBRA CIVIL", "DECORACION", "VARIOS"
    category: string;
    description: string;
    quantity: number;
    price: number;
    amount: number;
    costPrice?: number; // Precio de coste
}

export interface GroupCategory {
    name: string;
    categories: string[];
}

export interface MasterData {
    groups: GroupCategory[];
}

``n
---


## Archivo: $(src\utils\formatters.ts)

**Propsito:** Funciones de utilidad auxiliar y herramientas.

`$ext

export const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Limit to 9 digits (standard Spanish phone)
    const truncated = numbers.slice(0, 9);

    // Format as XXX XX XX XX
    if (truncated.length > 3) {
        if (truncated.length > 5) {
            if (truncated.length > 7) {
                return `${truncated.slice(0, 3)} ${truncated.slice(3, 5)} ${truncated.slice(5, 7)} ${truncated.slice(7)}`;
            }
            return `${truncated.slice(0, 3)} ${truncated.slice(3, 5)} ${truncated.slice(5)}`;
        }
        return `${truncated.slice(0, 3)} ${truncated.slice(3)}`;
    }

    return truncated;
};

export const formatTaxID = (value: string): string => {
    // Uppercase and remove spaces/hyphens
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Standard NIF/CIF length is 9
    return clean.slice(0, 9);
};

export const isValidTaxID = (value: string): boolean => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    // Basic regex: Letter+8digits OR 8digits+Letter (simplified)
    const nifRegex = /^[0-9]{8}[A-Z]$/;
    const cifRegex = /^[A-Z][0-9]{7}[A-Z0-9]$/;
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;

    return nifRegex.test(clean) || cifRegex.test(clean) || nieRegex.test(clean);
};

export const isValidPhone = (value: string): boolean => {
    const numbers = value.replace(/\D/g, '');
    return numbers.length === 9;
};

``n
---


## Archivo: $(src\utils\numberUtils.ts)

**Propsito:** Funciones de utilidad auxiliar y herramientas.

`$ext

export const parseNumber = (value: string | number | undefined): number => {
    if (value === undefined || value === null || value === '') return 0;
    if (typeof value === 'number') return value;

    // Handle strings
    // 1. Replace all commas with dots
    // 2. Remove any other non-numeric characters except dot and minus (for negative)
    // Note: This assumes no thousands separators like "1.000,00". 
    // Ideally we should strip thousands separators if we knew the locale.
    // For now, simple replacement of comma to dot is usually enough for "10,5"

    const cleanStr = value.toString().replace(/,/g, '.');
    // Check if it has multiple dots? explicit handling might be better

    const floatVal = parseFloat(cleanStr);
    return isNaN(floatVal) ? 0 : floatVal;
};

export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(value);
};

export const formatDecimal = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

``n
---


## Archivo: $(src\utils\pdfGenerator.ts)

**Propsito:** Funciones de utilidad auxiliar y herramientas.

`$ext

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

``n
---


## Archivo: $(src\App.css)

**Propsito:** Componente o mdulo de utilidad.

`$ext
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}

``n
---


## Archivo: $(src\App.tsx)

**Propsito:** Componente o mdulo de utilidad.

`$ext

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import BudgetList from './pages/BudgetList';
import BudgetEditor from './pages/BudgetEditor';
import Settings from './pages/Settings';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/budgets" replace />} />
            <Route path="budgets" element={<BudgetList />} />
            <Route path="budgets/new" element={<BudgetEditor />} />
            <Route path="budgets/:id" element={<BudgetEditor />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;

``n
---


## Archivo: $(src\index.css)

**Propsito:** Componente o mdulo de utilidad.

`$ext
:root {
  --primary-color: #2563eb;
  --secondary-color: #1e40af;
  --background-color: #f3f4f6;
  --text-color: #1f2937;
  --sidebar-width: 250px;
  --header-height: 64px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  min-height: 100vh;
}

#root {
  display: flex;
  min-height: 100vh;
}

button {
  cursor: pointer;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  transition: background-color 0.2s;
}

input,
select,
textarea {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 8px;
  width: 100%;
  font-family: inherit;
}

input:focus,
select:focus,
textarea:focus {
  outline: 2px solid var(--primary-color);
  border-color: transparent;
}

/* Global Lucide SVG Fix to prevent hidden icons */
.lucide {
  stroke: currentColor !important;
  stroke-width: 2 !important;
  flex-shrink: 0 !important;
  min-width: 16px;
  min-height: 16px;
}

/* PDF Preview Modal */
.pdf-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pdf-preview-container {
  width: 95vw;
  height: 95vh;
  max-width: 1000px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.pdf-preview-header {
  background: #f8fafc;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
  z-index: 100;
}

.pdf-rename-input {
  margin: 0 12px;
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 600;
  flex: 1;
  text-align: center;
  border: 1px dashed transparent;
  background: transparent;
  padding: 4px;
  border-radius: 4px;
  transition: border 0.2s;
  outline: none;
}

.pdf-rename-input:hover,
.pdf-rename-input:focus {
  border-color: #cbd5e1;
  background: #fff;
}

.pdf-preview-header button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pdf-preview-header button:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.pdf-preview-actions {
  position: relative;
}

.pdf-dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-width: 220px;
  z-index: 1000;
  padding: 8px;
}

.pdf-dropdown-menu button {
  justify-content: flex-start;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  font-size: 0.9rem;
  font-weight: 500;
}

.pdf-preview-body {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  background: #cbd5e1;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
  flex: 1;
}

.pdf-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #475569;
  font-weight: 500;
}

.pdf-mobile-fallback {
  display: none;
  text-align: center;
  padding: 20px;
  background: #f1f5f9;
  border-top: 1px solid #e2e8f0;
}

.pdf-mobile-fallback p {
  margin: 0 0 10px 0;
  color: #475569;
  font-size: 0.9rem;
}

.mobile-pdf-launcher {
  display: none;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  flex: 1;
  background: #f1f5f9;
  text-align: center;
  padding: 40px 20px;
  gap: 16px;
}

.mobile-pdf-launcher h3 {
  color: #1e293b;
  font-size: 1.25rem;
  margin: 0;
}

.mobile-pdf-launcher p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0 0 8px 0;
  max-width: 300px;
}

@media (max-width: 768px) {
  .pdf-preview-container {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }

  .pdf-iframe {
    display: none;
  }

  .mobile-pdf-launcher {
    display: flex;
  }
}
``n
---


## Archivo: $(src\main.tsx)

**Propsito:** Componente o mdulo de utilidad.

`$ext
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('No root element found');

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (error) {
  console.error('Critical initialization error:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; color: #ef4444; font-family: sans-serif;">
      <h2>Error de carga</h2>
      <p>Lo sentimos, ha ocurrido un error al iniciar la aplicación.</p>
      <button onclick="localStorage.clear(); sessionStorage.clear(); location.reload();" 
              style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px;">
        Limpiar datos y reintentar
      </button>
    </div>
  `;
}


``n
---


