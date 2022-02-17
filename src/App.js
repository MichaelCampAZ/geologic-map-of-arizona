import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import './App.css';

function App() {
  return (
    <div className="App">
      <MapContainer center={[34.1618, -111.6211]} maxBounds={[[29.96818929679422,-126.13671875],[38.34395908944491,-97.226318359375]]} zoom={7} minZoom={5} >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />



      </MapContainer>
    </div>
  );
}

export default App;
