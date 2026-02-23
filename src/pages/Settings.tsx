
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
