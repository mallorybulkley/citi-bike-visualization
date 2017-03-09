class CitiBikeViz {
  constructor () {
    this.initFirebase();
    this.tripsRef = this.database.ref('trips');
    this.map = window.map;
    // this.bounds = this.map.getBounds();
    this.clock = moment([2016, 11, 1]);
    this.speed = 10;
    this.trips = [];
  }

  initFirebase () {
    this.database = firebase.database();
    this.storage = firebase.storage();
  };

  startClock () {
    let clock = document.getElementById('clock');
    let count = document.getElementById('count');

    this.clockInterval = setInterval( () => {
      this.clock.add(1, "second")
      clock.innerHTML = this.clock.format("h:mm a");
      this.trips.forEach(trip => {
        trip.incrementTick();
      });
      count.innerHTML = window.tripCount + " bikes";
    }, this.speed);
  }

  loadTrips () {
    this.tripData = [];
    this.tripsRef.once('value').then(dataSnapshot => {
      dataSnapshot.forEach(childSnapshot => {
        let childData = childSnapshot.val();
          this.tripData.push(childData);
      });
    });
  }

  buildTrips () {
    window.tripCount = 0;
    this.trips = []
    this.tripData.forEach(trip => {
      this.trips.push(new Trip(this.map, trip));
    });
  }

  setColor (e) {
    this.trips.forEach(trip => {
      trip.colorByAttribute(e.target.value);
    })
  }

  stop () {
    clearInterval(this.clockInterval);
    this.clockInterval = null;
  }

  restart () {
    this.resetClock();
    this.trips.forEach(trip => trip.endTrip());
    this.startClock();
    this.buildTrips();
  }

  resetClock () {
    this.clock = moment([2016, 11, 1]);
    clearInterval(this.clockInterval);
    this.clockInterval = null;
  }

  updateClockSpeed () {
    clearInterval(this.clockInterval);

    this.clockInterval = this.clockInterval ? setInterval( () => {
      this.clock.add(1, "minutes")
      clock.innerHTML = this.clock.format("h:mm a");
      count.innerHTML = this.count + " bikes";
    }, this.speed) : null;
  }
}

$(() => {
  window.citiBikeViz = new CitiBikeViz();
  citiBikeViz.loadTrips();

  const stopButton = document.getElementById('stop');
  stopButton.addEventListener('click', citiBikeViz.stop.bind(citiBikeViz));

  $('form').on('change', citiBikeViz.setColor.bind(citiBikeViz));

  const restartButton = document.getElementById('restart');
  restartButton.addEventListener('click', citiBikeViz.restart.bind(citiBikeViz))

  // const speedRange = document.getElementById('speed');
  // speedRange.addEventListener('change', (e) => {
  //   citiBikeViz.speed = -(e.target.value);
  //   citiBikeViz.updateClockSpeed();
  //   }
  // )

  // citiBikeViz.map.addListener('idle', () => {
  //   citiBikeViz.bounds = citiBikeViz.map.getBounds();
  // });
})
