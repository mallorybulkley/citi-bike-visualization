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

  saveTrips (trips) {
    trips.forEach((trip, i) => {
      setTimeout(() => {
        this.processTrip(trip);
      }, 1500 * i)
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
        citiBikeViz.saveTrip(trip, details);
      } else {
        console.log("Error: ", trip);
      }
    });
  }

  saveTrip (trip, routeDetails) {
    let path = this.parsePath(routeDetails['path']);
    let startTime = new Date(trip['Start Time']);

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
      "startTime": this.parseTime(startTime),
      "bikeId": parseInt(trip['Bike ID']),
      "userType": trip['User Type'],
      "birthYear": trip['Birth Year'] ? parseInt(trip['Birth Year']) : 0,
      "gender": parseInt(trip['Gender']),
      "path": path,
      "distance": routeDetails['distance'],
    }

    this.tripsRef.push(finalizedTrip);
  }

  parseTime (time) {
    let midnight = new Date(2016, 11, 1);
    return (time - midnight) / 1000;
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
  $.get({
      url: './csv/2016-12-1-p2.csv'
    }).then(file => {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          citiBikeViz.saveTrips(results.data)
        }
      })
    })
};
