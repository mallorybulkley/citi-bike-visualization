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
      const averageSpeed = trip.distance / trip.duration;
      let i = 0;
      setTimeout( () => {
        this.drawStep(trip.distance, trip.path, averageSpeed, i);
      }, trip.time)
    })
  }

  drawStep (distance, path, averageSpeed, i) {
    if (i === path.length - 1) { return null };
    let step = new google.maps.Circle({
      strokeColor: '#FFFFFF',
      strokeOpacity: 0.8,
      strokeWeight: 0.1,
      fillColor: 'blue',
      fillOpacity: 0.35,
      map: this.map,
      center: path[i],
      radius: 75
    });

    let stepSpeed = this.calculateStepSpeed(distance, averageSpeed, path[i], path[i + 1]);
    setTimeout( () => this.clearStep(step), stepSpeed);
    setTimeout( () => this.drawStep(distance, path, averageSpeed, i + 1), stepSpeed);
  }

  clearStep (step) {
    step.setMap(null);
  }

  calculateStepSpeed (distance, averageSpeed, pointA, pointB) {
    let a = new google.maps.LatLng(pointA);
    let b = new google.maps.LatLng(pointB);

    // segment in meters / total distance in meters
    // averageSpeed in meters/sec * 60 = m/min
    return (google.maps.geometry.spherical.computeDistanceBetween(a, b) / distance) * (averageSpeed * 6000);
  }
}

$(() => {
  window.citiBikeViz = new CitiBikeViz();
  citiBikeViz.loadTrips();
})
