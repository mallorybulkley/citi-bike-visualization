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
    center: { lat: 40.765, lng: -73.975 },
    zoom: 13,
    styles: mapStyles
  });

  map.data.setStyle(function(feature) {
    let mag = Math.exp(parseFloat(feature.getProperty('mag'))) * 0.1;
    return /** @type {google.maps.Data.StyleOptions} */({
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: mag,
        fillColor: '#f00',
        fillOpacity: 0.35,
        strokeWeight: 0
      }
    });
  });

  trips = [
    {
      start: { lat: 40.76915505, lng: -73.98191841 },
      end: { lat: 40.7546011026, lng: -73.971878855 },
      duration: 528
    },
    {
      start: { lat: 40.7817212, lng: -73.94594 },
      end: { lat: 40.7849032, lng: -73.950503 },
      duration: 2680
    }
  ];

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

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  trips.forEach(trip => {
    let request = {
      origin: trip.start,
      destination: trip.end,
      travelMode: 'BICYCLING'
    };


    directionsService.route(request, function(result, status) {
      if (status == 'OK') {
        let polyline = result.routes[0].overview_polyline;
        let path = result.routes[0].overview_path;
        let distance = result.routes[0].legs[0].distance.value;
        const speed = distance / trip.duration;
        let i = 0;
        drawStep(distance, path, speed, i)
      };
    });
  });
};
