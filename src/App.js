import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import ContactsAndFaults from './data/ContactsAndFaults.json'
import MapUnitPolys from './data/MapUnitPolys.json'

import './App.css';
import './geolines.css';

function App() {
 
  const cfStyle = (geoJsonFeature) => {
    return { color: '#008080', weight: 1 }
    // switch (geoJsonFeature.properties.symbol) {
    //   case 1:
    //   case 306:
    //     return { className: 'contactsandfaults' }
    //   default:
    //     // console.log(geoJsonFeature.properties.symbol);
    //     return { color: '#ffff00' }
    // }
  }

  const mupStyle = (geoJsonFeature) => {
    return { color: 'black', weight: 1, fillColor: "#" + ((1<<24)*Math.random() | 0).toString(16) };
  }

  return (
    <div className="App">
      <MapContainer center={[34.1618, -111.6211]} maxBounds={[[29.96818929679422, -126.13671875], [38.34395908944491, -97.226318359375]]} zoom={7} minZoom={5} >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* <GeoJSON data={MapUnitPolys} style={mupStyle} /> */}

        <GeoJSON data={ContactsAndFaults} style={cfStyle} />

      </MapContainer>
    </div>
  );
}

export default App;
