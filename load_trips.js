class CitiBikeViz {
  constructor () {
    this.initFirebase();
    this.tripsRef = this.database.ref('trips');

    this.trips = [];
    this.map = window.map;
    this.timers = [];
    this.circles = [];
    this.count = 0;
    this.clock = moment([2016, 11, 1]);

    this.colorByGender = false;
  }

  initFirebase () {
    this.database = firebase.database();
    this.storage = firebase.storage();
  };

  // filter (childData) {
  //   if (this.filters.length === 0) return true;
  //   if (this.filters.some((filter) => (childData[filter.key] !== filter.value))) {
  //     return false;
  //   }
  // }

  startClock () {
    let clock = document.getElementById('clock');
    let count = document.getElementById('count');

    this.clockInterval = setInterval( () => {
      this.clock.add(1, "minutes")
      clock.innerHTML = this.clock.format("h:mm a");
      count.innerHTML = this.count + " bikes";
    }, 100);

  }

  loadTrips () {
    this.trips = [];
    this.tripsRef.once('value').then(dataSnapshot => {
      dataSnapshot.forEach(childSnapshot => {
        let childData = childSnapshot.val();
          this.trips.push(childData);
      })
      this.startClock();
      this.drawTrips();
    })
  }

  drawTrips () {
    this.trips.forEach(trip => {
      const averageSpeed = trip.distance / trip.duration;
      let i = 0;

      setTimeout( () => {
        this.drawStep(trip.distance, trip.path, averageSpeed, i, trip.gender);
      }, trip.time)
    })
  }

  drawStep (distance, path, averageSpeed, i, gender) {
    if (i === path.length) { return null };


    let color = 'green';
    if (this.colorByGender) {
      if (gender === 1) {
        color = 'blue';
      } else if (gender === 2) {
        color = 'magenta';
      }
    }

    let step = new google.maps.Circle({
      strokeColor: '#FFFFFF',
      strokeOpacity: 0.8,
      strokeWeight: 0.1,
      fillColor: color,
      fillOpacity: 0.35,
      map: this.map,
      center: path[i],
      radius: 75
    });

    let stepSpeed = this.calculateStepSpeed(distance, averageSpeed, path[i], path[i + 1]);
    this.circles.push(step);
    this.count += 1;
    this.timers.push(setTimeout( () => this.clearStep(step), stepSpeed));
    this.timers.push(setTimeout( () => this.drawStep(distance, path, averageSpeed, i + 1, gender), stepSpeed));
  }

  clearStep (step) {
    step.setMap(null);
    this.count -= 1;
  }

  calculateStepSpeed (distance, averageSpeed, pointA, pointB) {
    if (!pointB) { return averageSpeed }
    let a = new google.maps.LatLng(pointA);
    let b = new google.maps.LatLng(pointB);

    // averageSpeed in meters/sec * 60 = meters/min * 100 (10 min === 1 sec)
    return (google.maps.geometry.spherical.computeDistanceBetween(a, b) / distance) * (averageSpeed * 6000);
  }

  pause () {
    for (let i = 0; i < this.timers.length; i++) {
      clearTimeout(this.timers[i]);
    }
    this.timers = [];
    this.resetClock();
  }

  restart () {
    for (let i = 0; i < this.circles.length; i++) {
      this.circles[i].setMap(null);
    }
    this.circles = [];
    this.count = 0;
    this.resetClock();
    this.startClock();
    this.drawTrips();
  }

  resetClock () {
    this.clock = moment([2016, 11, 1]);
    clearInterval(this.clockInterval);
    this.clockInterval = null;
  }
}

$(() => {
  window.citiBikeViz = new CitiBikeViz();
  citiBikeViz.loadTrips();

  const pauseButton = document.getElementById('pause');
  pauseButton.addEventListener('click', citiBikeViz.pause.bind(citiBikeViz))

  const genderToggle = document.getElementById('gender');
  genderToggle.addEventListener('click', () => {
    citiBikeViz.colorByGender = !citiBikeViz.colorByGender;
    citiBikeViz.restart();
  })

  const restartButton = document.getElementById('restart');
  restartButton.addEventListener('click', citiBikeViz.restart.bind(citiBikeViz))
})
