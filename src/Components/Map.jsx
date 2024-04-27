import React, { useState, useEffect, useContext} from 'react'
import { GoogleMap, useJsApiLoader, Marker, Polygon } from '@react-google-maps/api'
import { stopContext } from '../Contexts/StopContext'
import { statusContext } from '../Contexts/StatusContext'
import MapStyles from '../Styles/MapStyles'
import '../Styles/Map.css'

// map container

const containerStyle = {
  width: 'fit-content(20em)',
  height: 'fit-content(20em)'
};

const center = {
  lat: 51.8,
  lng: 5.2
}

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
  const [stops] = useContext(stopContext)
  const [status, setStatus] = useContext(statusContext)
  
  // variable to store the GPS location
  const [location, setLocation] = useState({})
  const [start, setStart] = useState({})
  const [finish, setFinish] = useState({})
  const [pathsLat, setPathsLat] = useState({})
  const [pathsLng, setPathsLng] = useState({})
  
  // this is grabbing the GPS data from the server, data fetches every ~2.5 seconds after called in useEffect
  const fetchLocation = async () => {   
    const locationData = await fetch(import.meta.env.VITE_REACT_APP_API_HOST + '/location');
    const json = await locationData.json()
    const infoData = await fetch(import.meta.env.VITE_REACT_APP_API_HOST + '/info')
    const infoJson = await infoData.json()
    setStatus(json.data.status)
    setLocation(json.data)
    setStart(infoJson.data.legs[0].origin)
    setFinish(infoJson.data.legs[infoJson.data.legs.length - 1].destination)
  }

  useEffect(() => {
    console.log(location)
    setTimeout(fetchLocation, 2500)
  }, [location])
  
  // coordinates the shape the finish line/Polygon
  const paths = [
    { lat: finish.lat - 0.0024, lng: finish.lng - 0.001 },
    { lat: finish.lat + 0.0008, lng: finish.lng - 0.004 },
    { lat: finish.lat + 0.0024, lng: finish.lng + 0.001 },
    { lat: finish.lat - 0.0007, lng: finish.lng + 0.004 }
  ]

  // sorts lat and lon arr
  useEffect(() => {
    const finishLine = () => {
      let arr = []
      for (let i = 0; i < paths.length; i++) {
        arr.push(paths[i].lat)
      }
      arr.sort((a, b) => { return a - b;})
      setPathsLat(arr)
      arr = []
      for (let i = 0; i < paths.length; i++) {
        arr.push(paths[i].lng)
      }
      setPathsLng(arr)
    }
    finishLine()
  }, [])

  // google map ternary function/load map
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_REACT_APP_GOOGLE_KEY
  })


  return isLoaded ? (
      <GoogleMap
        mapContainerStyle={containerStyle}
        mapContainerClassName='Map-container'
        options={{ styles: MapStyles }}
        center={center}
        zoom={8}
      >
      <Marker 
        position={location.lat && location.lng === undefined ? { lat: null, lng: null} : location}
        icon={{ 
          url: '/trainMarker.png',
          scaledSize: new window.google.maps.Size(50, 50)
        }}
      />
      <Marker 
        key={start.name}
        position = {
          { 
            lat: start.lat,
            lng: start.lng 
          }
        }
        icon = {
          {
            url: '/trainStation.png',
            scaledSize: new window.google.maps.Size(50, 50)
          }
        }
      />
      {
        stops.map((stop) => (
          stop.uicCode === finish.uicCode ? 
            <Marker 
            key = {stop.name}
            position = {
              {
                lat: stop.lat,
                lng: stop.lng 
              }
            }
            icon = {
              {
                url: '/finishLine.png',
                scaledSize: new window.google.maps.Size(70, 70)
              }
            }
            />:
            <Marker
              key = {stop.name}
              position = {
                { 
                  lat: stop.lat,
                  lng: stop.lng 
                }
              }
              icon={
                {
                url: '/trainStop.png',
                scaledSize: new window.google.maps.Size(25, 25)
                }
              }
          />))
        }
        { /*s Polygon is the green "finish line shown at destination on google maps" */ }
        <Polygon 
          paths={paths}
          options={polygonOptions}
        />
          { /* Child components, such as markers, info windows, etc. */ }
          <></>
        </GoogleMap>
      ) : <></>
}

export default React.memo(MyComponent)