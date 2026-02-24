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
