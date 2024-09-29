/*
Authors: Marc Ty and Braeden
*/

import React, { useState, useEffect, useRef } from 'react';

import 'ol/ol.css';
import MapOL from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

import MousePosition from 'ol/control/MousePosition';

import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import { Control, ScaleLine, defaults as defaultControls } from 'ol/control';
import { fromLonLat } from 'ol/proj';
import { createStringXY } from 'ol/coordinate';

// Map server settings
import './Map.css';

import { UseSettingsGlobalState } from '../../context/SettingsContext.jsx';
import { DEFAULT_TELEMETRY_FETCH_INTERVAL } from '../../context/SettingsContext.jsx'

// Initial position of the map
const INITIAL_POSITION = [-114.1347, 51.0784]; // Longitude, Latitude
// Topic to subscribe to
const TOPIC = "gnssublox"; 

function Map() {
  const { state } = UseSettingsGlobalState();
  const [intervalId, setIntervalId] = useState(null);
  const [ubloxmeta, setUbloxMeta] = useState(null);

  const dotFeature = useRef(null);
  const vectorSourceRef = useRef(null);
  const olmap = useRef(null); // Ref to store MapOL instance
  const position = useRef(null); // Ref to store current position

  const updateMapPosition = () => {
    if (olmap.current) {
      if (position.current != null) {
        console.log(`Going to last coordinate ${position.current}`) 
        olmap.current.getView().animate({
          center: fromLonLat(position.current),
          duration: 1000,
        });
      }
      else {
        console.log("Not going to last coordinate because it is null") 
        olmap.current.getView().animate({
          center: fromLonLat(INITIAL_POSITION),
          duration: 1000,
        });
      }
    }
  };

  // Function to create and update the dot feature
  const updateDotPosition = (lon, lat) => {
    if (!dotFeature.current) {
      dotFeature.current = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
      });

      const dotStyle = new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: 'red' }), // Change color if needed
        }),
      });

      dotFeature.current.setStyle(dotStyle);
      vectorSourceRef.current.addFeatures([dotFeature.current]);
    } else {
      dotFeature.current.getGeometry().setCoordinates(fromLonLat([lon, lat]));
    }
  };

  // Fetch message from telemetry server on topic gnssublox
  const fetchMessage = async () => {
    try {
      const response = await fetch(`${state.telemetry_url}/sub?topic=${TOPIC}&iqos=${state.telemetry_qos}`);
      const data = await response.json();

      updateDotPosition(parseFloat(data.longitude), parseFloat(data.latitude)); // Set dot position
      position.current = [parseFloat(data.longitude), parseFloat(data.latitude)]; // Set the current position

    } catch (error) {
      console.error("Bad response from telemetry server: ", error);
    }
  };

  // For use with fetch message interval
  useEffect(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    const id = setInterval(fetchMessage, state.telemetry_interval || DEFAULT_TELEMETRY_FETCH_INTERVAL); // Default to 5000ms if state.interval is not defined
    setIntervalId(id);

    return () => clearInterval(id);
  }, [state.telemetry_qos, state.telemetry_url, state.telemetry_interval]);

  // Initialize the map and set up the refs
  useEffect(() => {
    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    const style = new Style({
      stroke: new Stroke({
        color: 'orange',
        width: 5,
      }),
    });

    const mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(6),
      projection: 'EPSG:4326',
      className: 'coordinate-label',
      target: document.getElementById('mouse-position'),
    });

    const tileLayer = new TileLayer({
      source: new OSM({
        url: state.tile_url,
        crossOrigin: 'anonymous',
      }),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: style,
    });

    const vectorLayerDots = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: 'black' }),
        }),
      }),
    });

    olmap.current = new MapOL({
      controls: defaultControls().extend([
        new ScaleLine({
          units: 'degrees',
        }),
        mousePositionControl,
        new SetLastPositionControl()
      ]),
      target: 'map',
      layers: [
        tileLayer,
        vectorLayer,
        vectorLayerDots,
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: fromLonLat(INITIAL_POSITION),
        zoom: 18,
      }),
    });

    // Cleanup event listener on unmount
    return () => {
      if (olmap.current) {
        olmap.current.setTarget(null); // Cleanup map target
      }
    };
  }, [state.tile_url]);

  class SetLastPositionControl extends Control {
    /**
     * @param {Object} [opt_options] Control options.
     */
    constructor(opt_options) {
      const options = opt_options || {};
  
      const button = document.createElement('button');
      button.innerHTML = 'O';
  
      const element = document.createElement('div');
      element.className = 'set-last ol-control';
      element.appendChild(button);
  
      super({
        element: element,
        target: options.target,
      });
  
      button.addEventListener('click', updateMapPosition.bind(this), false);
    }
  }

  return (
    <div className="container-fluid">
      <div id="map"/>
    </div>
  );
}

export default Map;
