
import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Type } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    // Sync from props
    useEffect(() => {
        if (editorRef.current) {
            // Only update if the content is truly different to avoid cursor jumps
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || '';
            }
        }
    }, [value]);

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div className="rich-editor-container">
            <div className="rich-editor-toolbar">
                <button type="button" onClick={() => execCommand('bold')} title="Negrita"><Bold size={16} /></button>
                <button type="button" onClick={() => execCommand('italic')} title="Cursiva"><Italic size={16} /></button>
                <button type="button" onClick={() => execCommand('underline')} title="Subrayado"><Underline size={16} /></button>
                <div className="toolbar-divider" />
                <button type="button" onClick={() => execCommand('fontSize', '3')} title="Normal"><Type size={14} /></button>
                <button type="button" onClick={() => execCommand('fontSize', '5')} title="Grande" className="btn-large-text"><Type size={18} /></button>
                <button type="button" onClick={() => execCommand('fontSize', '2')} title="Pequeño" className="btn-small-text"><Type size={12} /></button>
            </div>
            <div
                ref={editorRef}
                className="rich-editor-content"
                contentEditable
                onInput={handleInput}
                onBlur={handleInput}
                data-placeholder={placeholder}
                style={{ minHeight: '150px' }}
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
                    gap: 8px;
                    padding: 8px;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }
                .rich-editor-toolbar button {
                    padding: 6px;
                    border-radius: 4px;
                    background: transparent;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .rich-editor-toolbar button:hover {
                    background: #e2e8f0;
                    color: #1e293b;
                }
                .toolbar-divider {
                    width: 1px;
                    height: 20px;
                    background: #e2e8f0;
                    margin: 0 4px;
                }
                .rich-editor-content {
                    padding: 12px;
                    outline: none;
                    font-size: 0.95rem;
                    line-height: 1.5;
                    color: #1e293b;
                }
                .rich-editor-content[contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #94a3b8;
                    cursor: text;
                }
                .btn-large-text { font-weight: bold; }
                .btn-small-text { font-size: 0.8rem; }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
