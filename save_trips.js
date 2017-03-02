// initialize firebase
class CitiBikeViz {
  constructor () {
    this.initFirebase();
    this.tripsRef = this.database.ref('trips');
  }

  initFirebase () {
    this.database = firebase.database();
    this.storage = firebase.storage();
  };

  // iterate through trips, slowly - 10 every 2 seconds
  // save the trip details in firebase:
  // object w trip ID and the following keys/values:
    // start lat/lng
    // end lat/lng
    // duration in seconds
    // start time
    // year of birth
    // gender
    // user type
    // bike id
    // route path from google maps

  saveTrips (trips) {
    trips.forEach((trip, i) => {
      if (i > 10) {return};
      setTimeout(() => {
        this.processTrip(trip);
      }, 100 * i)
    })
  }

  processTrip (trip) {
    const directionsService = new google.maps.DirectionsService();
    let details = {};

    let request = {
      origin: {
        "lat": parseFloat(trip['Start Station Latitude']),
        "lng": parseFloat(trip['Start Station Longitude'])
      },
      destination:  {
        "lat": parseFloat(trip['End Station Latitude']),
        "lng": parseFloat(trip['End Station Longitude'])
      },
      travelMode: 'BICYCLING'
    }

    directionsService.route(request, function(result, status) {
      console.log(status);
      if (status == 'OK') {
        details['path'] = result.routes[0].overview_path;
        details['distance']  = result.routes[0].legs[0].distance.value;
        CitiBikeViz.saveTrip(trip, details);
      }
    });
  }

  saveTrip (trip, routeDetails) {
    let path = this.parsePath(routeDetails['path']);

    let finalizedTrip = {
      "start": {
        "lat": parseFloat(trip['Start Station Latitude']),
        "lng": parseFloat(trip['Start Station Longitude'])
      },
      "end": {
        "lat": parseFloat(trip['End Station Latitude']),
        "lng": parseFloat(trip['End Station Longitude'])
      },
      "duration": parseInt(trip['Trip Duration']),
      "startTime": new Date(trip['Start Time']),
      "bikeId": trip['Bike ID'],
      "userType": trip['User Type'],
      "birthYear": trip['Birth Year'],
      "gender": trip['Gender'],
      "path": path,
      "distance": routeDetails['distance'],
    }

    console.log(finalizedTrip);
    this.tripsRef.push(finalizedTrip);
  }

  parsePath (path) {
    return path.map(segment => {
      return {
        "lat": segment.lat(),
        "lng": segment.lng(),
      }
    });
  }
}

window.onload = function() {
  window.citiBikeViz = new CitiBikeViz();
  citiBikeViz.loadTrips();
//   $.get({
//       url: './2016-12-1-first100.csv'
//     }).then(file => {
//       Papa.parse(file, {
//         header: true,
//         complete: (results) => {
//           CitiBikeViz.saveTrips(results.data)
//         }
//       })
//     })
};
