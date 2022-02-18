import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import ContactsAndFaults from './data/ContactsAndFaults.json'
import './App.css';

function App() {

  function cfStyle(geoJsonFeature) {

    switch (geoJsonFeature.properties.type) {
      case 'Contact':
        return {color:'#0000FF'}
        case 'Quaternary Contact':
          return {color:'#5EC37F'}
        case 'Fault':
          return {color:'#FF1493'}
      default:
        return {color:'#7CFC00'}
    }
  }

  return (
    <div className="App">
      <MapContainer center={[34.1618, -111.6211]} maxBounds={[[29.96818929679422, -126.13671875], [38.34395908944491, -97.226318359375]]} zoom={7} minZoom={5} >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GeoJSON data={ContactsAndFaults} style={cfStyle} />

      </MapContainer>
    </div>
  );
}

export default App;
