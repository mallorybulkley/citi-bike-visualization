class CitiBikeViz {
  constructor () {
    this.initFirebase();
    this.tripsRef = this.database.ref('trips');
    this.clock = moment([2016, 11, 1]);
    this.speed = 10;
    this.trips = [];
    this.startTime = moment([2016, 11, 1]);
  }

  initFirebase () {
    this.database = firebase.database();
  }

  startClock () {
    this.clockInterval = setInterval( () => {
      this.clock.add(1, 'second');
      const clock = document.getElementById('clock');
      clock.innerHTML = this.clock.format('h:mm a');
      this.trips.forEach(trip => {
        trip.incrementTick();
      });
      const count = document.getElementById('count');
      count.innerHTML = window.tripCount + ' bikes';
    }, this.speed);

    document.getElementById('pause').disabled = false;
    document.getElementById('resume').disabled = true;
  }

  resume() {
    this.startClock();
  }

  loadTrips () {
    this.tripData = [];
    const loadingIcon = document.getElementById('loading');
    loadingIcon.style.display = 'block';
    this.tripsRef.once('value').then(dataSnapshot => {
      dataSnapshot.forEach(childSnapshot => {
        let childData = childSnapshot.val();
          this.tripData.push(childData);
      });

      document.getElementById('restart').disabled = false;
      loadingIcon.style.display = 'none';
      this.restart();
    });
  }

  buildTrips () {
    window.tripCount = 0;
    this.trips = [];
    const midnight = moment([2016, 11, 1]);
    const initialTick = this.clock.diff(midnight, 's');
    this.tripData.forEach(trip => {
      if (trip.startTime >= initialTick) {
        this.trips.push(new Trip(window.map, trip, initialTick, this.colorAttribute));
      }
    });
  }

  setColor (e) {
    this.colorAttribute = e.target.value;
    this.trips.forEach(trip => {
      trip.colorByAttribute(this.colorAttribute);
    });
    const legends = document.getElementsByClassName('legend');
    for (let i = 0; i < legends.length; i++) {
      legends[i].style.display = 'none';
    }
    const currentLegend = document.getElementById(this.colorAttribute);
    if (currentLegend) { currentLegend.style.display = 'block'; }
  }

  pause () {
    clearInterval(this.clockInterval);
    this.clockInterval = null;
    document.getElementById('pause').disabled = true;
    document.getElementById('resume').disabled = false;
  }

  restart () {
    this.resetClock();
    this.trips.forEach(trip => trip.endTrip());
    this.startClock();
    this.buildTrips();
    document.getElementById('resume').disabled = true;
    document.getElementById('restart').innerText = 'Restart';
  }

  resetClock () {
    this.clock = new moment(this.startTime);
    clearInterval(this.clockInterval);
    this.clockInterval = null;
  }

  updateStartTime (e) {
    const time = e.target.value.split(':');
    this.startTime.set('hour', time[0]);
    this.startTime.set('minute', time[1]);
  }

  updateClockSpeed(e) {
    this.pause();
    this.speed = e.target.value;
    this.resume();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.citiBikeViz = new CitiBikeViz();
  const citiBikeViz = new CitiBikeViz();
  citiBikeViz.loadTrips();

  document.querySelector('form').onchange = citiBikeViz.setColor.bind(citiBikeViz);
  document.getElementById('resume').onclick = citiBikeViz.resume.bind(citiBikeViz);
  document.getElementById('pause').onclick = citiBikeViz.pause.bind(citiBikeViz);
  document.getElementById('restart').onclick = citiBikeViz.restart.bind(citiBikeViz);
  document.getElementById('time').onchange = citiBikeViz.updateStartTime.bind(citiBikeViz);
  document.getElementById('speed').onchange = citiBikeViz.updateClockSpeed.bind(citiBikeViz);

  document.getElementById('about').onclick = () => {
    document.getElementById('modal').style.display = 'block';
  };

  document.getElementById('modal').onclick = () => {
    document.getElementById('modal').style.display = 'none';
  };
});
