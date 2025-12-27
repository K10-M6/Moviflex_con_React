import React, { useState } from 'react';
import './SharedTravel.css';

const SharedTravel = () => {
  const [sharedTrips, setSharedTrips] = useState([
    {
      id: 1,
      driver: 'Jose Martínez',
      origin: 'Popayán',
      destination: 'Cali',
      date: '2024-02-15',
      time: '08:00',
      availableSeats: 4,
      price: 5000,
      vehicle: 'Toyota Corolla'
    },
    {
      id: 2,
      driver: 'Carlos López',
      origin: 'Bogota',
      destination: 'Pasto',
      date: '2024-02-16',
      time: '09:30',
      availableSeats: 2,
      price: 15000,
      vehicle: 'chevrolet spark'
    }
  ]);

  const [newTrip, setNewTrip] = useState({
    origin: '',
    destination: '',
    date: '',
    time: '',
    seats: 1,
    price: 0,
    vehicle: ''
  });

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTrip = (e) => {
    e.preventDefault();
    const trip = {
      id: Date.now(),
      driver: 'Tú',
      ...newTrip,
      availableSeats: newTrip.seats
    };
    setSharedTrips([trip, ...sharedTrips]);
    setNewTrip({ origin: '', destination: '', date: '', time: '', seats: 1, price: 0, vehicle: '' });
    setIsCreating(false);
  };

  const joinTrip = (tripId) => {
    setSharedTrips(sharedTrips.map(trip => 
      trip.id === tripId 
        ? { ...trip, availableSeats: trip.availableSeats - 1 }
        : trip
    ));
    alert('¡Te has unido al viaje!');
  };

  return (
    <div className="shared-travel">
      <div className="shared-header">
        <h2>🚗 Viaje Compartido</h2>
        <button 
          className="create-trip-btn"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? 'Cancelar' : 'Ofrecer Viaje'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateTrip} className="trip-form">
          <h3>Crear Viaje Compartido</h3>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Origen"
              value={newTrip.origin}
              onChange={(e) => setNewTrip({...newTrip, origin: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Destino"
              value={newTrip.destination}
              onChange={(e) => setNewTrip({...newTrip, destination: e.target.value})}
              required
            />
            <input
              type="date"
              value={newTrip.date}
              onChange={(e) => setNewTrip({...newTrip, date: e.target.value})}
              required
            />
            <input
              type="time"
              value={newTrip.time}
              onChange={(e) => setNewTrip({...newTrip, time: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Asientos disponibles"
              value={newTrip.seats}
              onChange={(e) => setNewTrip({...newTrip, seats: parseInt(e.target.value)})}
              min="1"
              max="8"
              required
            />
            <input
              type="number"
              placeholder="Precio por persona ($)"
              value={newTrip.price}
              onChange={(e) => setNewTrip({...newTrip, price: parseInt(e.target.value)})}
              min="0"
              required
            />
            <input
              type="text"
              placeholder="Vehículo"
              value={newTrip.vehicle}
              onChange={(e) => setNewTrip({...newTrip, vehicle: e.target.value})}
              required
            />
          </div>
          <button type="submit">Publicar Viaje</button>
        </form>
      )}

      <div className="trips-list">
        <h3>Viajes Disponibles</h3>
        {sharedTrips.map(trip => (
          <div key={trip.id} className="trip-card">
            <div className="trip-info">
              <div className="route">
                <span className="origin">{trip.origin}</span>
                <span className="arrow">→</span>
                <span className="destination">{trip.destination}</span>
              </div>
              <div className="trip-details">
                <p>📅 {trip.date} ⏰ {trip.time}</p>
                <p>👤 Conductor: {trip.driver}</p>
                <p>🚗 {trip.vehicle}</p>
                <p>💺 Asientos: {trip.availableSeats}</p>
                <p className="price">💰 {trip.price}$ por persona</p>
              </div>
            </div>
            <button 
              className="join-btn"
              onClick={() => joinTrip(trip.id)}
              disabled={trip.availableSeats === 0}
            >
              {trip.availableSeats > 0 ? 'Unirse al Viaje' : 'Completo'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedTravel;