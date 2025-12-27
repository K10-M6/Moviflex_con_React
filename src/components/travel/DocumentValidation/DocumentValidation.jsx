import React, { useState } from 'react';
import './DocumentValidation.css';

const DocumentValidation = () => {
  const [documents, setDocuments] = useState([

    {
      id: 1,
      type: 'licencia',
      name: 'Licencia de Conducir',
      status: 'validado',
      expiryDate: '2026-08-20',
      uploadedDate: '2024-02-01'
    },
    {
      id: 3,
      type: 'seguro',
      name: 'Seguro de Viaje',
      status: 'rechazado',
      expiryDate: '2024-11-15',
      uploadedDate: '2024-01-20',
      rejectionReason: 'Documento ilegible'
    }
  ]);

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      // Simular proceso de upload
      setTimeout(() => {
        const newDoc = {
          id: Date.now(),
          type: 'other',
          name: file.name,
          status: 'pendiente',
          uploadedDate: new Date().toISOString().split('T')[0],
          expiryDate: '2024-12-31'
        };
        setDocuments([newDoc, ...documents]);
        setUploading(false);
        alert('Documento subido correctamente. En validación.');
      }, 2000);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'validado': return '✅';
      case 'pendiente': return '⏳';
      case 'rechazado': return '❌';
      default: return '📄';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'validado': return '#28a745';
      case 'pendiente': return '#ffc107';
      case 'rechazado': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="document-validation">
      <div className="validation-header">
        <h2>📋 Validación de Documentación</h2>
        <div className="upload-section">
          <label htmlFor="file-upload" className="upload-btn">
            {uploading ? 'Subiendo...' : 'Subir Documento'}
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div className="documents-stats">
        <div className="stat-card validated">
          <h3>✅ Validados</h3>
          <p>{documents.filter(doc => doc.status === 'validado').length}</p>
        </div>
        <div className="stat-card pending">
          <h3>⏳ Pendientes</h3>
          <p>{documents.filter(doc => doc.status === 'pendiente').length}</p>
        </div>
        <div className="stat-card rejected">
          <h3>❌ Rechazados</h3>
          <p>{documents.filter(doc => doc.status === 'rechazado').length}</p>
        </div>
      </div>

      <div className="documents-list">
        <h3>Mis Documentos</h3>
        {documents.map(doc => (
          <div key={doc.id} className="document-card">
            <div className="doc-icon">
              {getStatusIcon(doc.status)}
            </div>
            <div className="doc-info">
              <h4>{doc.name}</h4>
              <div className="doc-details">
                <p>Subido: {doc.uploadedDate}</p>
                <p>Vencimiento: {doc.expiryDate}</p>
                {doc.rejectionReason && (
                  <p className="rejection-reason">Motivo: {doc.rejectionReason}</p>
                )}
              </div>
            </div>
            <div className="doc-status">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(doc.status) }}
              >
                {doc.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="validation-requirements">
        <h3>📌 Documentos Requeridos para Viajar</h3>
        <ul>
          <li>✅ Pasaporte o DNI vigente</li>
          <li>✅ Licencia de conducir internacional (si aplica)</li>
          <li>✅ Seguro de viaje</li>
          <li>✅ Visa (para países que lo requieran)</li>
          <li>✅ Certificado de vacunación</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentValidation;