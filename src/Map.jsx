import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const center = [2.482861, -76.562292];
const statesData = {
  "type": "FeatureCollection",
  "features":[]};

function Mapa() {
  return (
    <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://api.maptiler.com/maps/base-v4/256/{z}/{x}/{y}.png?key=aov23K8CtfGWh6qo7NSQ"
        attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
      />
      {
        statesData.features.map((state) => {
          const coordinates = state.geometry.coordinates[0].map((item) => [item[1], item[0]])
          return(<Polygon
          positions={coordinates} 
          />)
        })
      }
    </MapContainer>
  );
}

export default Mapa;