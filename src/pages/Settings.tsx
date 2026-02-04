
import React, { useState, useRef } from 'react';
import { useCompanyData } from '../hooks/useCompanyData';
import { useToast } from '../context/ToastContext';
import { Save, Upload } from 'lucide-react';
import { formatPhoneNumber, formatTaxID } from '../utils/formatters';
import RichTextEditor from '../components/RichTextEditor';

const Settings: React.FC = () => {
  const { companyData, saveCompanyData, updateLogo, updateSeal } = useCompanyData();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(companyData);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const sealInputRef = useRef<HTMLInputElement>(null);

  // Sync state when data loads
  React.useEffect(() => {
    setFormData(companyData);
  }, [companyData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;

    if (name === 'phone') {
      value = formatPhoneNumber(value);
    } else if (name === 'cif') {
      value = formatTaxID(value);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    saveCompanyData(formData);
    showToast('Configuración guardada correctamente', 'success');
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

      <div className="settings-grid">
        <div className="card company-info">
          <h3>Información General</h3>
          <div className="form-group">
            <label>Nombre de la Empresa</label>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="DLKom Reformas" />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input name="address" value={formData.address} onChange={handleChange} placeholder="C/ Ejemplo 123" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Teléfono</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="600 000 000"
                maxLength={15}
              />
            </div>
            <div className="form-group">
              <label>CIF / NIF</label>
              <input
                name="cif"
                value={formData.cif}
                onChange={handleChange}
                placeholder="B-12345678"
                maxLength={9}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" value={formData.email} onChange={handleChange} placeholder="info@dlkom.com" />
          </div>
        </div>

        <div className="card branding">
          <h3>Branding e Imágenes</h3>

          <div className="image-uploader">
            <label>Logo de la Empresa</label>
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
            <input
              type="file"
              ref={logoInputRef}
              hidden
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'logo')}
            />
          </div>

          <div className="image-uploader">
            <label>Sello de la Empresa (para PDF)</label>
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
            <input
              type="file"
              ref={sealInputRef}
              hidden
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'seal')}
            />
          </div>
        </div>

        <div className="card defaults full-width">
          <h3>Textos por Defecto</h3>
          <div className="form-group">
            <label>Notas del Proyecto (Pie de página)</label>
            <RichTextEditor
              value={formData.defaultNotes}
              onChange={(val) => setFormData(prev => ({ ...prev, defaultNotes: val }))}
              placeholder="Notas generales que aparecerán por defecto..."
            />
          </div>
          <div className="form-group">
            <label>Forma de Pago</label>
            <textarea
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>
      </div>

      <style>{`
        .settings-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .btn-primary {
          background-color: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary:hover {
          background-color: var(--secondary-color);
        }

        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .card {
          background: white;
          padding: 24px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .card h3 {
          margin-bottom: 16px;
          font-size: 1.1rem;
          color: #374151;
          border-bottom: 2px solid #f3f4f6;
          padding-bottom: 8px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          font-size: 0.875rem;
          color: #4b5563;
        }

        .image-uploader {
          margin-bottom: 20px;
        }

        .upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s;
          background-color: #f9fafb;
          overflow: hidden;
        }

        .upload-area:hover {
          border-color: var(--primary-color);
          background-color: #eff6ff;
        }

        .placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #9ca3af;
        }

        .preview-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
