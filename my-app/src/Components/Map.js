import React, { useState, useEffect, useContext} from 'react'
import { GoogleMap, useJsApiLoader, Marker, Polygon } from '@react-google-maps/api';
import { stopContext } from '../Contexts/StopContext'
import { dateContext } from '../Contexts/DateContext'
import { statusContext } from '../Contexts/StatusContext'
import MapStyles from '../Styles/MapStyles';
import '../Styles/Map.css'

// map container
const containerStyle = {
  width: 1000,
  height: 600
};

// center of map after load
const center = {
  lat: 51.8,
  lng: 5.2
};

// origin of trip
const eindhoven = {
  lat: 51.4433326721191,
  lng: 5.48138904571533
};

// destination
const utrecht = {
  lat: 52.0888900756836,
  lng: 5.11027765274048
};

// coordinates the shape the finish line/Polygon
const paths = [
  { lat: utrecht.lat - 0.0012, lng: utrecht.lng - 0.0005 },
  { lat: utrecht.lat + 0.0004, lng: utrecht.lng - 0.002 },
  { lat: utrecht.lat + 0.0012, lng: utrecht.lng + 0.0005 },
  { lat: utrecht.lat - 0.00035, lng: utrecht.lng + 0.002 }
]

// options for polygon
const polygonOptions = {
  fillColor: "lightgreen",
  fillOpacity: 0.3,
  strokeColor: "green",
  strokeOpacity: 1,
  strokeWeight: 1,
  clickable: false,
  draggable: false,
  editable: false,
  geodesic: false,
  zIndex: 1
}


function MyComponent() {
  const [stops, setStops] = useContext(stopContext)
  const [start, setStart] = useContext(dateContext)
  const [status, setStatus] = useContext(statusContext)
  
  // variable to store the GPS location
  const [location, setLocation] = useState({})
  const [pathsLat, setPathsLat] = useState({})
  const [pathsLng, setPathsLng] = useState({})
  
  // this hook is grabbing the GPS data from the server, data fetches every ~2.5 seconds
  
  useEffect(() => {
    const fetchLocation = async () => {   
      const response = await fetch('http://localhost:8080/location');
      const json = await response.json()
      setStatus(json.data.status)
      setLocation(json.data)
    }

    console.log(location)
    console.log(status)
    
    setTimeout(fetchLocation, 2500)
    
  }, [location])

  
  
  
  // sorts lat and lon arr
  useEffect(() => {
    const finishLine = () => {
      let arr = [];
      for (let i = 0; i < paths.length; i++) {
        arr.push(paths[i].lat)
      }
      arr.sort((a, b) => { return a - b;})
      setPathsLat(arr);
      arr = [];
      for (let i = 0; i < paths.length; i++) {
        arr.push(paths[i].lng)
      }
      setPathsLng(arr);
    }

    finishLine();

    console.log(process.env.REACT_APP_GOOGLE_KEY)

  }, [])

  // google map ternary function/load map
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY
  })


  return isLoaded ? (
    <div className="Map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        options={{ styles: MapStyles }}
        defaultCenter={center}
        center={center}
        zoom={9}
      >
        <Marker 
          position={location}
          icon={{ 
            url: '/trainMarker.png',
            scaledSize: new window.google.maps.Size(50, 50)
          }}
          />
        {stops.map((stop) => (
          stop.uicCode === "8400206" ? 
          <Marker 
            key={stop.name}
            position={{ lat: stop.lat, lng: stop.lng }}
            icon = {{
              url: '/trainStation.png',
              scaledSize: new window.google.maps.Size(50, 50)
            }}/>:
              stop.uicCode === "8400621" ? 
                <Marker 
                key={stop.name}
                position={{ lat: stop.lat, lng: stop.lng }}
                icon = {{
                  url: '/finishLine.png',
                  scaledSize: new window.google.maps.Size(70, 70)
                }}/>:
                  <Marker
                    key={stop.name}
                    position={{ lat: stop.lat, lng: stop.lng }}
                    icon={{
                      url: '/trainStop.png',
                      scaledSize: new window.google.maps.Size(25, 25)
                    }}/>))}
        <Polygon 
          paths={paths}
          options={polygonOptions}
        />
          { /* Child components, such as markers, info windows, etc. */ }
          <></>
        </GoogleMap>
      </div>
      ) : <></>
}

export default React.memo(MyComponent)