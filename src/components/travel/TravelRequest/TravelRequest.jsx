import React, { useState } from 'react';
import './TravelRequest.css';

const TravelRequest = () => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    purpose: '',
    budget: '',
    passengers: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Solicitud de viaje enviada:', formData);
    alert('Solicitud de viaje enviada para aprobación');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="travel-request">
      <h2>✈️ Solicitud de Viaje</h2>
      <form onSubmit={handleSubmit} className="travel-form">
        <div className="form-row">
          <div className="form-group">
            <label>Origen:</label>
            <input
              type="text"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              required
              placeholder="Ciudad de origen"
            />
          </div>
          
          <div className="form-group">
            <label>Destino:</label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              required
              placeholder="Ciudad de destino"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Fecha de salida:</label>
            <input
              type="date"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Fecha de regreso:</label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Propósito del viaje:</label>
          <select
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar propósito</option>
            <option value="business">Negocios</option>
            <option value="vacation">Vacaciones</option>
            <option value="training">Capacitación</option>
            <option value="conference">Conferencia</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Presupuesto estimado:</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="COP"
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label>Número de pasajeros:</label>
            <input
              type="number"
              name="passengers"
              value={formData.passengers}
              onChange={handleChange}
              min="1"
              max="10"
            />
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Enviar Solicitud de Viaje
        </button>
      </form>
    </div>
  );
};

export default TravelRequest;