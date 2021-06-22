import React, { useRef, useEffect } from "react";
import { Helmet } from "react-helmet";
import L from "leaflet";
import { Marker, useMap } from "react-leaflet";

import { promiseToFlyTo, getCurrentLocation } from "lib/map";

import Layout from "components/Layout";
import Container from "components/Container";
import Map from "components/Map";
import Snippet from "components/Snippet";
import { locations } from "data/locations";

import gatsby_astronaut from "assets/images/gatsby-astronaut.jpg";

const LOCATION = {
  lat: 38.9072,
  lng: -77.0369,
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;
const ZOOM = 10;

const timeToZoom = 2000;
const timeToOpenPopupAfterZoom = 4000;
const timeToUpdatePopupAfterZoom = timeToOpenPopupAfterZoom + 3000;

const popupContentHello = `<p>Hello 👋</p>`;
const popupContentGatsby = `
  <div class="popup-gatsby">
    <div class="popup-gatsby-image">
      <img class="gatsby-astronaut" src=${gatsby_astronaut} />
    </div>
    <div class="popup-gatsby-content">
      <h1>Gatsby Leaflet Starter</h1>
      <p>Welcome to your new Gatsby site. Now go build something great!</p>
    </div>
  </div>
`;

const MapEffect = ({ markerRef }) => {
  const map = useMap();

  useEffect(() => {
    if (!markerRef.current || !map) return;

    (async function run() {
      const popup = L.popup({
        maxWidth: 800,
      });

      const location = await getCurrentLocation().catch(() => LOCATION);

      const { current: marker } = markerRef || {};

      marker.setLatLng(location);
      popup.setLatLng(location);
      popup.setContent(popupContentHello);

      setTimeout(async () => {
        await promiseToFlyTo(map, {
          zoom: ZOOM,
          center: location,
        });

        marker.bindPopup(popup);

        setTimeout(() => marker.openPopup(), timeToOpenPopupAfterZoom);
        setTimeout(
          () => marker.setPopupContent(popupContentGatsby),
          timeToUpdatePopupAfterZoom
        );
      }, timeToZoom);
    })();
  }, [map, markerRef]);

  return null;
};

const IndexPage = () => {
  const markerRef = useRef();

  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement } = {}) {
    if (!leafletElement) return;

    leafletElement.eachLayer((layer) => leafletElement.removeLayer(layer));

    const tripPoints = createTripPointsGeoJson({ locations });
    console.log("Trip Points", tripPoints);
    const tripLines = createTripLinesGeoJson({ locations });

    const tripPointsGeoJsonLayers = new L.geoJson(tripPoints, {
      pointToLayer: tripStopPointToLayer,
    });

    const tripLinesGeoJsonLayers = new L.geoJson(tripLines);

    tripPointsGeoJsonLayers.addTo(leafletElement);
    tripLinesGeoJsonLayers.addTo(leafletElement);

    const bounds = tripPointsGeoJsonLayers.getBounds();

    leafletElement.fitBounds(bounds);
  }

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: "OpenStreetMap",
    zoom: DEFAULT_ZOOM,
    mapEffect,
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <Map {...mapSettings}>
        <MapEffect markerRef={markerRef} />
        <Marker ref={markerRef} position={CENTER} />
      </Map>

      <Container type="content" className="text-center home-start">
        <h2>Still Getting Started?</h2>
        <p>Run the following in your terminal!</p>
        <pre>
          <code>
            gatsby new [directory]
            https://github.com/colbyfayock/gatsby-starter-leaflet
          </code>
        </pre>
        <p className="note">
          Note: Gatsby CLI required globally for the above command
        </p>
      </Container>
    </Layout>
  );
};

export default IndexPage;

/**
 * tripStopPointToLayer
 */

function createTripPointsGeoJson({ locations } = {}) {
  return {
    type: "FeatureCollection",
    features: locations.map(
      ({ placename, location = {}, image, date, todo = [] } = {}) => {
        const { lat, lng } = location;
        return {
          type: "Feature",
          properties: {
            placename,
            todo,
            date,
            image,
          },
          geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
        };
      }
    ),
  };
}

/**
 * tripStopPointToLayer
 */

function createTripLinesGeoJson({ locations } = {}) {
  return {
    type: "FeatureCollection",
    features: locations.map((stop = {}, index) => {
      const prevStop = locations[index - 1];

      if (!prevStop) return [];

      const { placename, location = {}, date, todo = [] } = stop;
      const { lat, lng } = location;
      const properties = {
        placename,
        todo,
        date,
      };

      const { location: prevLocation = {} } = prevStop;
      const { lat: prevLat, lng: prevLng } = prevLocation;

      return {
        type: "Feature",
        properties,
        geometry: {
          type: "LineString",
          coordinates: [
            [prevLng, prevLat],
            [lng, lat],
          ],
        },
      };
    }),
  };
}

/**
 * tripStopPointToLayer
 */

function tripStopPointToLayer(feature = {}, latlng) {
  const { properties = {} } = feature;
  const { placename, todo = [], image, date } = properties;

  const list = todo.map((what) => `<li>${what}</li>`);
  let listString = "";
  let imageString = "";

  if (Array.isArray(list) && list.length > 0) {
    listString = list.join("");
    listString = `
      <p>Things we will or have done...</p>
      <ul>${listString}</ul>
    `;
  }

  if (image) {
    imageString = `
      <span class="trip-stop-image" style="background-image: url(${image})">${placename}</span>
    `;
  }

  const text = `
    <div class="trip-stop">
      ${imageString}
      <div class="trip-stop-content">
        <h2>${placename}</h2>
        <p class="trip-stop-date">${date}</p>
        ${listString}
      </div>
    </div>
  `;

  const popup = L.popup({
    maxWidth: 400,
  }).setContent(text);

  const layer = L.marker(latlng, {
    icon: L.divIcon({
      className: "icon",
      html: `<span class="icon-trip-stop"></span>`,
      iconSize: 20,
    }),
    riseOnHover: true,
  }).bindPopup(popup);

  return layer;
}
