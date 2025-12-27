/* eslint-disable react-hooks/purity */
import React, { useState } from 'react';
import './AutomaticReports.css';

const AutomaticReports = () => {
  const [reports, setReports] = useState([
    {
      id: 1,
      title: 'Reporte Mensual de Viajes',
      type: 'mensual',
      lastGenerated: '2024-01-31',
      status: 'activo',
      schedule: 'último día del mes',
      recipients: ['gerencia@viajes.com', 'contabilidad@viajes.com']
    },
    {
      id: 2,
      title: 'Análisis de Rutas Populares',
      type: 'semanal',
      lastGenerated: '2024-02-04',
      status: 'activo',
      schedule: 'domingos a las 23:00',
      recipients: ['operaciones@viajes.com']
    },
    {
      id: 3,
      title: 'Reporte de Satisfacción',
      type: 'trimestral',
      lastGenerated: '2024-01-15',
      status: 'inactivo',
      schedule: '15 de cada trimestre',
      recipients: ['calidad@viajes.com']
    }
  ]);

  const [newReport, setNewReport] = useState({
    title: '',
    type: 'mensual',
    schedule: '',
    recipients: '',
    status: 'activo'
  });

  const [showForm, setShowForm] = useState(false);

  const generateReportNow = (reportId) => {
    alert(`Generando reporte #${reportId}... Esto puede tomar unos minutos.`);
    // Simular generación de reporte
    setTimeout(() => {
      alert('Reporte generado y enviado exitosamente.');
    }, 2000);
  };

  const handleCreateReport = (e) => {
    e.preventDefault();
    const report = {
      id: reports.length + 1,
      ...newReport,
      lastGenerated: new Date().toISOString().split('T')[0],
      recipients: newReport.recipients.split(',').map(email => email.trim())
    };
    setReports([...reports, report]);
    setNewReport({ title: '', type: 'mensual', schedule: '', recipients: '', status: 'activo' });
    setShowForm(false);
    alert('Reporte automático configurado exitosamente.');
  };

  const toggleReportStatus = (reportId) => {
    setReports(reports.map(report =>
      report.id === reportId
        ? { ...report, status: report.status === 'activo' ? 'inactivo' : 'activo' }
        : report
    ));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'mensual': return '📅';
      case 'semanal': return '📊';
      case 'diario': return '📈';
      case 'trimestral': return '📋';
      default: return '📄';
    }
  };

  return (
    <div className="automatic-reports">
      <div className="reports-header">
        <h2>📊 Reportes Automáticos</h2>
        <button 
          className="create-report-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : '+ Nuevo Reporte'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateReport} className="report-form">
          <h3>Configurar Nuevo Reporte Automático</h3>
          
          <div className="form-group">
            <label>Título del Reporte *</label>
            <input
              type="text"
              value={newReport.title}
              onChange={(e) => setNewReport({...newReport, title: e.target.value})}
              placeholder="Ej: Reporte de Ventas Mensual"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Frecuencia *</label>
              <select
                value={newReport.type}
                onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                required
              >
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
                <option value="trimestral">Trimestral</option>
              </select>
            </div>

            <div className="form-group">
              <label>Programación *</label>
              <input
                type="text"
                value={newReport.schedule}
                onChange={(e) => setNewReport({...newReport, schedule: e.target.value})}
                placeholder="Ej: lunes 09:00, último día del mes"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Destinatarios *</label>
            <input
              type="text"
              value={newReport.recipients}
              onChange={(e) => setNewReport({...newReport, recipients: e.target.value})}
              placeholder="emails separados por coma"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Crear Reporte Automático
            </button>
          </div>
        </form>
      )}

      <div className="reports-dashboard">
        <div className="stats-overview">
          <div className="stat">
            <span className="number">{reports.length}</span>
            <span className="label">Total Reportes</span>
          </div>
          <div className="stat">
            <span className="number">{reports.filter(r => r.status === 'activo').length}</span>
            <span className="label">Activos</span>
          </div>
          <div className="stat">
            <span className="number">
              // eslint-disable-next-line react-hooks/purity, react-hooks/purity
              {reports.filter(r => new Date(r.lastGenerated) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </span>
            <span className="label">Generados esta semana</span>
          </div>
        </div>

        <div className="reports-list">
          <h3>Reportes Configurados</h3>
          {reports.map(report => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <div className="report-title">
                  <span className="type-icon">{getTypeIcon(report.type)}</span>
                  <h4>{report.title}</h4>
                  <span className={`status ${report.status}`}>
                    {report.status}
                  </span>
                </div>
                <div className="report-actions">
                  <button 
                    className="generate-btn"
                    onClick={() => generateReportNow(report.id)}
                  >
                    Generar Ahora
                  </button>
                  <button 
                    className={`toggle-btn ${report.status}`}
                    onClick={() => toggleReportStatus(report.id)}
                  >
                    {report.status === 'activo' ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>

              <div className="report-details">
                <div className="detail">
                  <strong>Frecuencia:</strong>
                  <span>{report.type}</span>
                </div>
                <div className="detail">
                  <strong>Programación:</strong>
                  <span>{report.schedule}</span>
                </div>
                <div className="detail">
                  <strong>Última generación:</strong>
                  <span>{report.lastGenerated}</span>
                </div>
                <div className="detail">
                  <strong>Destinatarios:</strong>
                  <span>{report.recipients.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutomaticReports;