
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
