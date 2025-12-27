// components/travel/RouteOptimization/RouteOptimization.jsx
import React, { useState } from 'react';
import './RouteOptimization.css';

const RouteOptimization = () => {
  const [stops, setStops] = useState(['']);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const addStop = () => {
    setStops([...stops, '']);
  };

  const updateStop = (index, value) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };

  const removeStop = (index) => {
    if (stops.length > 1) {
      const newStops = stops.filter((_, i) => i !== index);
      setStops(newStops);
    }
  };

  const optimizeRoute = () => {
    const filteredStops = stops.filter(stop => stop.trim() !== '');
    if (filteredStops.length < 2) {
      alert('Agrega al menos 2 destinos para optimizar la ruta');
      return;
    }

    setIsLoading(true);
    
    // Simular proceso de optimización
    setTimeout(() => {
      const optimized = [...filteredStops].sort();
      setOptimizedRoute({
        original: [...filteredStops],
        optimized: optimized,
        distance: (Math.random() * 500 + 100).toFixed(1),
        time: (Math.random() * 6 + 1).toFixed(1),
        savings: (Math.random() * 30 + 10).toFixed(1)
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="route-optimization">
      <h2>🗺️ Optimización de Rutas</h2>
      
      <div className="stops-container">
        <h3>Destinos a visitar:</h3>
        {stops.map((stop, index) => (
          <div key={index} className="stop-input">
            <input
              type="text"
              value={stop}
              onChange={(e) => updateStop(index, e.target.value)}
              placeholder={`Destino ${index + 1} (ej: Calle6N, #18-20.)`}
            />
            {stops.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeStop(index)}
                className="remove-stop"
                title="Eliminar destino"
              >
                ×
              </button>
            )}
            {index === stops.length - 1 && (
              <button type="button" onClick={addStop} className="add-stop" title="Agregar destino">
                +
              </button>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={optimizeRoute} 
        className="optimize-btn"
        disabled={isLoading}
      >
        {isLoading ? '🔄 Optimizando...' : '🚀 Optimizar Ruta'}
      </button>

      {optimizedRoute && (
        <div className="optimization-result">
          <h3>✅ Ruta Optimizada Encontrada</h3>
          <div className="route-comparison">
            <div className="route-original">
              <h4>Ruta Original</h4>
              <p>{optimizedRoute.original.join(' → ')}</p>
            </div>
            <div className="route-optimized">
              <h4>Ruta Optimizada</h4>
              <p>{optimizedRoute.optimized.join(' → ')}</p>
            </div>
          </div>
          <div className="route-stats">
            <p>📏 Distancia total: {optimizedRoute.distance} km</p>
            <p>⏱️ Tiempo estimado: {optimizedRoute.time} horas</p>
            <p>💰 Ahorro estimado: {optimizedRoute.savings}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteOptimization;