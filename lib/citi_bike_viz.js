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
    let attribute = e.target.value;
    this.trips.forEach(trip => {
      trip.colorByAttribute(attribute);
    })
    $('.legend').hide();
    $("#" + attribute).show();
  }

  pause () {
    clearInterval(this.clockInterval);
    this.clockInterval = null;
    $(resume).prop('disabled', false);
  }

  restart () {
    this.resetClock();
    this.trips.forEach(trip => trip.endTrip());
    this.startClock();
    this.buildTrips();
    $(resume).prop('disabled', true);
  }

  resetClock () {
    this.clock = moment([2016, 11, 1]);
    clearInterval(this.clockInterval);
    this.clockInterval = null;
  }

  resume () {
    this.clockInterval = setInterval( () => {
      this.clock.add(1, "second")
      clock.innerHTML = this.clock.format("h:mm a");
      this.trips.forEach(trip => {
        trip.incrementTick();
      });
      count.innerHTML = window.tripCount + " bikes";
    }, this.speed);
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


  $('form').on('change', citiBikeViz.setColor.bind(citiBikeViz));
  $(resume).on('click', citiBikeViz.resume.bind(citiBikeViz));
  $(pause).on('click', citiBikeViz.pause.bind(citiBikeViz));
  $(restart).on('click', citiBikeViz.restart.bind(citiBikeViz))

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
