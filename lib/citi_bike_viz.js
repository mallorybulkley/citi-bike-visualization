class CitiBikeViz {
  constructor () {
    this.initFirebase();
    this.tripsRef = this.database.ref('trips');
    this.map = window.map;
    // this.bounds = this.map.getBounds();
    this.clock = moment([2016, 11, 1]);
    this.speed = 10;
    this.trips = [];
    this.startTime = moment([2016, 11, 1]);
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
    }, 10);

    $(pause).prop('disabled', false);
  }

  loadTrips () {
    this.tripData = [];
    $(loading).toggle();
    this.tripsRef.once('value').then(dataSnapshot => {
      dataSnapshot.forEach(childSnapshot => {
        let childData = childSnapshot.val();
          this.tripData.push(childData);
      });

      $(restart).prop('disabled', false);
      $(loading).toggle();
      this.restart();
    });
  }

  buildTrips () {
    window.tripCount = 0;
    this.trips = []
    const midnight = moment([2016, 11, 1]);
    const initialTick = this.clock.diff(midnight, 's');
    this.tripData.forEach(trip => {
      if (trip.startTime >= initialTick) {
        this.trips.push(new Trip(this.map, trip, initialTick, this.colorAttribute));
      }
    });
  }

  setColor (e) {
    this.colorAttribute = e.target.value;
    this.trips.forEach(trip => {
      trip.colorByAttribute(this.colorAttribute);
    })
    $('.legend').hide();
    $("#" + this.colorAttribute).show();
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
    $(restart).text('Restart');
  }

  resetClock () {
    this.clock = new moment(this.startTime);
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

    $(resume).prop('disabled', true);
  }

  // updateClockSpeed () {
  //   clearInterval(this.clockInterval);
  //
  //   this.clockInterval = setInterval( () => {
  //     this.clock.add(1, "second")
  //     clock.innerHTML = this.clock.format("h:mm a");
  //     this.trips.forEach(trip => {
  //       trip.incrementTick();
  //     });
  //     count.innerHTML = window.tripCount + " bikes";
  //   }, this.speed);
  // }

  updateStartTime (e) {
    const time = e.target.value.split(":");
    this.startTime.set('hour', time[0]);
    this.startTime.set('minute', time[1]);
  }
}

$(() => {
  window.citiBikeViz = new CitiBikeViz();
  citiBikeViz.loadTrips();


  $('form').on('change', citiBikeViz.setColor.bind(citiBikeViz));
  $(resume).on('click', citiBikeViz.resume.bind(citiBikeViz));
  $(pause).on('click', citiBikeViz.pause.bind(citiBikeViz));
  $(restart).on('click', citiBikeViz.restart.bind(citiBikeViz));
  $(time).on('change', citiBikeViz.updateStartTime.bind(citiBikeViz));

  $(about).on('click', () => {
    $(modal).toggle();
  });

  $(modal).on('click', () => {
    $(modal).toggle();
  });
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
