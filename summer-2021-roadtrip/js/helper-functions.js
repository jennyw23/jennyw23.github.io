/**
 * tripStopPointToLayer
 * Attribution: 
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
  
  /**
   * tripStopPointToLayer
   */
  
  function tripStopPointToLayer( feature = {}, latlng ) {
    const { properties = {} } = feature;
    const { placename, todo = [], image, date } = properties;
  
    const list = todo.map(what => `<li>${ what }</li>`);
    let listString = '';
    let imageString = '';
  
    if ( Array.isArray(list) && list.length > 0 ) {
      listString = list.join('');
      listString = `
        <p>Things we will or have done...</p>
        <ul>${listString}</ul>
      `
    }
  
    if ( image ) {
      imageString = `
        <span class="trip-stop-image" style="background-image: url(${image})">${placename}</span>
      `;
    }
  
    const text = `
      <div class="trip-stop">
        ${ imageString }
        <div class="trip-stop-content">
          <h2>${placename}</h2>
          <p class="trip-stop-date">${date}</p>
          ${ listString }
        </div>
      </div>
    `;
  
    const popup = L.popup({
      maxWidth: 400
    }).setContent(text);
  
    const layer = L.marker( latlng, {
      // icon: L.divIcon({
      //   className: 'icon',
      //   html: `<span class="icon-trip-stop"></span>`,
      //   iconSize: 20
      // }),
      icon: L.icon({
      iconUrl: 'lyft-car.png',
      iconSize: [50,40]
    }),
  
      riseOnHover: true
    }).bindPopup(popup);
  
    return layer;
  }