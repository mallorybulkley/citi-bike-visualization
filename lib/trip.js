class Trip {
  constructor (map, trip, initialTick) {
    window.trip = this;
    this.map = map;
    this.distance = trip.distance;
    this.duration = trip.duration;
    this.start = trip.start;
    this.path = trip.path;
    this.end = trip.path.length - 1;
    this.startTime = trip.startTime;

    this.gender = trip.gender;
    this.birthYear = trip.birthYear;
    this.color = 'green';

    this.tick = initialTick || 0;
    this.tickInterval = trip.startTime;
    this.currentStep = null;
    this.circle = null;
  }

  beginTrip () {
    this.circle = new google.maps.Circle({
      strokeColor: '#FFFFFF',
      strokeOpacity: 0.8,
      strokeWeight: 0.1,
      fillColor: this.color,
      fillOpacity: 0.35,
      map: this.map,
      center: this.path[0],
      radius: 75
    });

    this.currentStep = 0;
    window.tripCount += 1;
  }

  calculateInterval (step) {
    if (step === this.end) return 0; // last point in the path

    let pointA = new google.maps.LatLng(this.path[step]);
    let pointB = new google.maps.LatLng(this.path[step + 1]);

    // seconds IRL
    return google.maps.geometry.spherical.computeDistanceBetween(pointA, pointB) / this.distance * this.duration;
  }

  colorByAttribute (attribute) {
    if (attribute === 'gender') {
      if (this.gender === 1) {
        this.color = 'blue';
      } else if (this.gender === 2) {
        this.color = 'magenta';
      } else {
        this.color = 'green'
      }
    } else if (attribute === 'age') {
      if (this.birthYear > 1995) {
        // Gen Z
        this.color = 'magenta';
      } else if (this.birthYear > 1979) {
        // Gen Y
        this.color = 'blue';
      } else if (this.birthYear > 1964) {
        // Gen X
        this.color = 'red';
      } else if (this.birthYear > 1940) {
        // Baby Boomer
        this.color = 'yellow';
      } else {
        this.color = 'green';
      }
    } else if (attribute === 'default') {
      this.color = 'green';
    }

    if (this.circle) {
      this.circle.setOptions({ fillColor: this.color });
    }
  }

  endTrip () {
    if (this.circle) {
      this.circle.setMap(null);
      window.tripCount -= 1;
    }
    this.currentStep = null;
  }

  incrementTick () {
    this.tick += 1;

    if (this.tick >= this.tickInterval) {
      this.moveCircle();
    }
  }

  moveCircle () {
    if (this.currentStep === this.end) {
      this.endTrip();
    } else if (this.currentStep !== null) {
      // set the center and reset the tick and tickInterval
      this.currentStep += 1;
      this.circle.setCenter(this.path[this.currentStep]);
    } else {
      // start the trip
      this.beginTrip();
    }

    this.tick = 0;
    this.tickInterval = this.calculateInterval(this.currentStep);
  }
}

// trip knows its start time and path and demographic info (for coloring the circle)
// trip draws the circle at its start time
// knows the current time/tick from main CitiBikeViz
  // increments its steps based on that tick

// at each step:
    // set center of circle to new lat/lng
    // set tick counter depending on speed during this segment
// last step:
    // set map to null

// CitiBikeViz controls the master time and holds an array of all trips
  // sends a tick out to every trip
    // trips.forEach(trip => {
    //   trip.incrementTick();
    // });
