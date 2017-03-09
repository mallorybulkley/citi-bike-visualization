class Trip {
  constructor (birthYear, distance, duration, gender, start, path, startTime, map) {
    this.birthYear = birthYear;
    this.distance = distance;
    this.duration = duration;
    this.gender = gender;
    this.start = start;
    this.path = path;
    this.startTime = startTime;
    this.map = map;

    this.tick = 0;
    this.tickInterval = startTime;
    this.currentStep = 0;
    this.circle = null;

    this.color = 'green';
  }

  beginTrip () {
    this.circle = new google.maps.Circle({
      strokeColor: '#FFFFFF',
      strokeOpacity: 0.8,
      strokeWeight: 0.1,
      fillColor: this.color,
      fillOpacity: 0.35,
      map: this.map,
      center: path[0],
      radius: 75
    });
  }
  
  calculateInterval (step) {
    if (step === this.path.length) return 100; // last point in the path

    pointA = new google.maps.LatLng(this.path[step]);
    pointB = new google.maps.LatLng(this.path[step + 1]);

    return google.maps.geometry.spherical.computeDistanceBetween(pointA, pointB) / this.distance * this.duration;
  }

  colorByAttribute (attribute) {
    if (attribute === 'gender') {
      if (gender === 1) {
        this.color = 'blue';
      } else if (gender === 2) {
        this.color = 'magenta';
      } else {
        this.color = 'green'
      }
    }

    if (attribute === 'age') {
      if (birthYear > 1995) {
        // Gen Z
        this.color = 'magenta';
      } else if (birthYear > 1979) {
        // Gen Y
        this.color = 'blue';
      } else if (birthYear > 1964) {
        // Gen X
        this.color = 'red';
      } else if (birthYear > 1940) {
        // Baby Boomer
        this.color = 'yellow';
      } else {
        this.color = 'green';
      }
    }

    this.circle.setOptions({ fillColor: this.color });
  }

  endTrip () {
    this.circle.setMap(null);
  }

  incrementTick () {
    this.tick += 1;

    if (this.tick === this.tickInterval) {
      this.moveCircle();
    }
  }

  moveCircle () {
    // set the center and reset the tick and tickInterval
    this.currentStep += 1;
    this.circle.setCenter(this.path[this.currentStep]);

    this.tick = 0;
    this.tickInterval = calculateInterval(this.currentStep);
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
    trips.forEach(trip => {
      trip.incrementTick();
    });
