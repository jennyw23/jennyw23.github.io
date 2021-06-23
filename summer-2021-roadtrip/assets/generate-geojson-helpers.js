const { locations } = require('./locations');

const tripPoints = createTripPointsGeoJson({ locations });
console.log("Trip Points", tripPoints)

const tripLines = createTripLinesGeoJson({ locations });
console.log("Trip Points", tripPoints)

/**
 * createTripPointsGeoJson
 */

function createTripPointsGeoJson({ locations } = {}) {
    return {
      "type": "FeatureCollection",
      "features": locations.map(({ placename, location = {}, image, date, todo = [] } = {}) => {
        const { lat, lng } = location;
        return {
          "type": "Feature",
          "properties": {
            placename,
            todo,
            date,
            image
          },
          "geometry": {
            "type": "Point",
            "coordinates": [ lng, lat ]
          }
        }
      })
    }
  }
  
  /**
   * createTripLinesGeoJson
   */
  
function createTripLinesGeoJson({ locations } = {}) {
    return {
      "type": "FeatureCollection",
      "features": locations.map((stop = {}, index) => {
        const prevStop = locations[index - 1];
  
        if ( !prevStop ) return [];
  
        const { placename, location = {}, date, todo = [] } = stop;
        const { lat, lng } = location;
        const properties = {
          placename,
          todo,
          date
        };
  
        const { location: prevLocation = {} } = prevStop;
        const { lat: prevLat, lng: prevLng } = prevLocation;
  
        return {
          type: 'Feature',
          properties,
          geometry: {
            type: 'LineString',
            coordinates: [
              [ prevLng, prevLat ],
              [ lng, lat ]
            ]
          }
        }
      })
    }
  }