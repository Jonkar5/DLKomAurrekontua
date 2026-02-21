
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
