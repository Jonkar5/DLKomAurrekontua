
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
