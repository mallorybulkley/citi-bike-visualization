let map;

const mapStyles = [
  {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [
          { "saturation": 36 },
          { "color": "#000000" },
          { "lightness": 40 }
      ]
  },{
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [
          { "visibility": "on" },
          { "color": "#000000" },
          { "lightness": 16 }
      ]
  },{
      "featureType": "all",
      "elementType": "labels.icon",
      "stylers": [
          { "visibility": "off" }
      ]
  },{
      "featureType": "road",
      "elementType": "labels",
      "stylers": [
          { "visibility": "off" }
      ]
  },{
      "featureType": "administrative",
      "elementType": "geometry.fill",
      "stylers": [
          { "color": "#000000" },
          { "lightness": 20 }
      ]
  },{
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [
          { "color": "#000000" },
          { "lightness": 17 },
          { "weight": 1.2 }
      ]
  },{
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [
          { "color": "#000000" },
          { "lightness": 20 }
      ]
  },{
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
          { "color": "#000000" },
          { "lightness": 21 }
      ]
  },{
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [
          { "color": "#000000" },
          { "lightness": 17 }
      ]
  },{
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
          { "color": "#000000" },
          { "lightness": 29 },
          { "weight": 0.2 }
      ]
  },{
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
          { "color": "#000000" },
          { "lightness": 18 }
      ]
  },{
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [
          { "color": "#000000" },
          { "lightness": 16 }
      ]
  },{
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [
          { "color": "#000000" },
          { "lightness": 19 }
      ]
  },{
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
          { "color": "#000000" },
          { "lightness": 17 }
      ]
  }
];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 40.745, lng: -73.975 },
    zoom: 12,
    styles: mapStyles
  });

  map.data.setStyle({
    fillColor: 'green',
    strokeWeight: 1
  });

  let trips = [];

  $.get({
    url: './2016-12-1-first100.csv'
  }).then((file) => {
    Papa.parse(file, {
      header: true,
      complete: function(results) {
      	console.log("Parsing complete:");
        results.data.forEach(row => {
          trips.push({
            "start": {
              "lat": parseFloat(row['Start Station Latitude']),
              "lng": parseFloat(row['Start Station Longitude'])
            },
            "end": {
              "lat": parseFloat(row['End Station Latitude']),
              "lng": parseFloat(row['End Station Longitude'])
            },
            "duration": parseInt(row['Trip Duration']),
            "startTime": new Date(row['Start Time'])
          })
        });

        drawTrips(trips, map);
      }
    });
  });
}

const drawTrips = (trips, map) => {
  const drawStep = (distance, path, speed, i) => {
    if (i === path.length - 1) { return null };
    let step = new google.maps.Circle({
      strokeColor: '#FFFFFF',
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: 'blue',
      fillOpacity: 0.35,
      map: map,
      center: path[i],
      radius: 75
    });

    let stepSpeed = calculateStepSpeed(distance, speed, path[i], path[i + 1]);
    setTimeout( () => clearStep(step), stepSpeed);
    setTimeout( () => drawStep(distance, path, speed, i + 1), stepSpeed);
  };

  const clearStep = (step) => {
    step.setMap(null);
  }

  const calculateStepSpeed = (distance, speed, pointA, pointB) => {
    return (google.maps.geometry.spherical.computeDistanceBetween(pointA, pointB) / distance) / speed * 20000;
  }

  const midnight = new Date(2016, 11, 1);

  const parseTime = (time) => {
    // console.log("ms since midnight: " + ((time - midnight)));
    // console.log("seconds since midnight: " + ((time - midnight) / 1000));
    // console.log("10 second increments since midnight: " + ((time - midnight) / 1000 / 6));
    return (time - midnight) / 20;
  };

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  trips.forEach(trip => {
    // console.log("timeout: " + parseTime(trip.startTime));
    setTimeout( () => {
      let request = {
        origin: trip.start,
        destination: trip.end,
        travelMode: 'BICYCLING'
      };

      directionsService.route(request, function(result, status) {
        console.log(status);
        if (status == 'OK') {
          let polyline = result.routes[0].overview_polyline;
          let path = result.routes[0].overview_path;
          let distance = result.routes[0].legs[0].distance.value;
          const speed = distance / trip.duration;
          let i = 0;
          drawStep(distance, path, speed, i)
        };
      });
    }, parseTime(trip.startTime))
  });
};
