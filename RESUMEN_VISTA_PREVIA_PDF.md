# Resumen: Implementación de Vista Previa PDF, Renombrado Inteligente y Compatibilidad Móvil

A lo largo de nuestras interacciones, hemos mejorado drásticamente la capacidad de la aplicación para gestionar la creación, visualización, distribución e impresión de los Presupuestos generados en PDF, asegurándonos de que funcione a la perfección en múltiples dispositivos (PC, iOS y Android).

Aquí tienes el resumen paso a paso de la arquitectura final y los módulos de código involucrados en el flujo del PDF.

## 1. Integración de `PdfPreviewModal` en `BudgetEditor`
La acción original "Ver Vista Previa" (`window.open(url, '_blank')`) estaba causando problemas porque algunos navegadores (especialmente en móvil) lo bloqueaban o no lo mostraban dentro de la aplicación. 

La solución fue anular esa acción y crear un modal dedicado que tomara el control sobre toda la pantalla sin salir del ecosistema de la app de React.

**Componente Principal Actializado (`BudgetEditor.tsx`):**
```tsx
// 1. Estado para controlar el Modal
const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

// 2. Botón que dispara la ventana Modal
<button onClick={() => setIsPdfModalOpen(true)}>
    <FileDown size={16} /> Ver Vista Previa
</button>

// 3. Inyección del nuevo Componente
<PdfPreviewModal
    isOpen={isPdfModalOpen}
    onClose={() => setIsPdfModalOpen(false)}
    budget={budget}
    companyData={companyData}
    showPrices={showPrices}
    showTotals={showTotals}
/>
```

## 2. Flexibilidad del Motor de Generación (`pdfGenerator.ts`)
Originalmente, `generatePDF` actuaba bajo su propio criterio llamando directamente a las APIs del navegador (`doc.save`, `navigator.share`). Tuvimos que añadirle la acción especial `blob` para que, en lugar de descargar o compartir, silenciase todo y devolviese la matriz de bytes crudos (`Blob`) del documento generado. También añadimos el parámetro `customFileName` para soportar el renombrado.

**Estructura del Motor (`pdfGenerator.ts`):**
```typescript
export const generatePDF = async (budget: Budget, company: CompanyConfig, action: 'preview' | 'download' | 'print' | 'share' | 'blob' = 'preview', showPrices: boolean = true, showTotals: boolean = true, customFileName?: string) => {
    // ... Creación de diseño en jsPDF (Texto, Imágenes, Tabla) ...
    
    // Nombres de archivos dinámicos
    const defaultName = budget.projectName ? `${budget.projectName}_${budget.number}` : `Presupuesto_${budget.number || 'borrador'}`;
    const baseFileName = (customFileName && customFileName.trim() !== '') ? customFileName.trim() : defaultName;
    const filename = baseFileName.toLowerCase().endsWith('.pdf') ? baseFileName : `${baseFileName}.pdf`;

    if (action === 'blob') {
        // Genera la vista para insertarla en nuestro propio modal
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        return { blob, url, filename };
    } 
    // ... Acciones Nativas
    else if (action === 'print') {
        doc.autoPrint();
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        
        // Evadir bloqueos de "iframes ocultos" en Android/iOS y forzar diálogo de imprimir en dispositivos móviles
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            window.open(url, '_blank');
        } else {
            // Imprimir silenciosamente en PC
            const iframe = document.createElement('iframe');
            /* ... */ 
            iframe.contentWindow?.print();
        }
    } 
    // ...
```

## 3. El Modal Híbrido PC/Móvil (`PdfPreviewModal.tsx`)
El `PdfPreviewModal` es el cerebro del proceso que se creó desde cero. 
- Mantiene el código de pre-generación de `pdfBlob` de forma asíncrona pero garantiza que los clics del usuario actúen sobre variables que ya estén en la memoria (`Blob`), evitando bloqueos.
- Contiene un `input` nativo en la barra superior para customizar el título.
- Detecta mediante el `UserAgent` el dispositivo del visitante y altera la interfaz (Dilema del Iframe).

**Manejo Híbrido (`PdfPreviewModal.tsx`):**
```tsx
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Acción "Compartir" Asíncrona pero lista
const handleAction = (action: 'print' | 'share' | 'download') => {
    const customName = fileNameInput.trim() || 'Presupuesto';
    if (action === 'share' && pdfBlob) {
        const finalName = customName.toLowerCase().endsWith('.pdf') ? customName : `${customName}.pdf`;
        const file = new File([pdfBlob], finalName, { type: 'application/pdf' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file] }) // ...
        }
    } else {
        generatePDF(budget, companyData, action, showPrices, showTotals, customName);
    }
    // ...
};

// ... Renderizado visual inteligente
<div className="pdf-preview-body">
    {pdfUrl ? (
        <>
            {isMobile ? (
                /* Layout nativo para dispositivos móviles (Evitando el gris Chrome) */
                <div className="mobile-pdf-launcher">
                    <FileText size={48} color="#94a3b8" />
                    <h3>Vista Previa Lista</h3>
                    <p>Toca el botón para ver el documento en tu visor de PDF.</p>
                    <button onClick={() => window.open(pdfUrl, '_blank')} className="btn-primary" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
                        Ver Documento
                    </button>
                </div>
            ) : (
                /* Usar iFrame si es un portátil/desktop tradicional */
                <iframe src={`${pdfUrl}#toolbar=0`} className="pdf-iframe" title="PDF Preview" />
            )}
        </>
    ) : (
        <div className="pdf-loading">Generando documento...</div>
    )}
</div>
```

## 4. Adaptabilidad y Modificaciones Visuales (`index.css`)
Las últimas líneas del archivo de estilo central asisten a `.pdf-preview-container` asegurando que en portátiles su tamaño sea acortado (`95vw`, `max-width: 1000px`) en una preciosa ventana con borde redondeado `radius-12px`, pero para tabletas, iPads y dispositivos móviles (pantallas muy pequeñas `<768px`) ocupe directamente toda la pantalla (`100vw / 100vh`) sin márgenes y sin redondear, simulando una interfaz nativa que no interrumpa el área de visibilidad de lectura del documento.
