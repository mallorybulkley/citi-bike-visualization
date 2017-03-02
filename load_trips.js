class CitiBikeViz {
  constructor () {
    this.initFirebase();
    this.tripsRef = this.database.ref('trips');

    this.map = window.map;
  }

  initFirebase () {
    this.database = firebase.database();
    this.storage = firebase.storage();
  };

  loadTrips () {
    this.trips = [];
    this.tripsRef.once('value').then(dataSnapshot => {
      dataSnapshot.forEach(childSnapshot => {
        let childData = childSnapshot.val();
        this.trips.push(childData);
      })
      this.drawTrips();
    })
  }

  drawTrips () {
    this.trips.forEach(trip => {
      const speed = trip.distance / trip.duration;
      let i = 0;
      this.drawStep(trip.distance, trip.path, speed, i);
    })
  }

  drawStep (distance, path, speed, i) {
    if (i === path.length - 1) { return null };
    let step = new google.maps.Circle({
      strokeColor: '#FFFFFF',
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: 'blue',
      fillOpacity: 0.35,
      map: this.map,
      center: path[i],
      radius: 75
    });

    let stepSpeed = this.calculateStepSpeed(distance, speed, path[i], path[i + 1]);
    setTimeout( () => this.clearStep(step), stepSpeed);
    setTimeout( () => this.drawStep(distance, path, speed, i + 1), stepSpeed);
  }

  clearStep (step) {
    step.setMap(null);
  }

  calculateStepSpeed (distance, speed, pointA, pointB) {
    let a = new google.maps.LatLng(pointA);
    let b = new google.maps.LatLng(pointB);

    return (google.maps.geometry.spherical.computeDistanceBetween(a, b) / distance) / speed * 20000;
  }

  parseTime (time) {
    midnight = new Date(2016, 11, 1);
    return (time - midnight) / 1000;
  }

}

$(() => {
  window.citiBikeViz = new CitiBikeViz();
  citiBikeViz.loadTrips();
})
