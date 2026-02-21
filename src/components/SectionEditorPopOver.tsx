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
