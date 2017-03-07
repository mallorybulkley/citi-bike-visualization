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
    this.colorByAge = false;
  }

  initFirebase () {
    this.database = firebase.database();
    this.storage = firebase.storage();
  };

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
    this.count = 0;
    this.trips.forEach(trip => {
      let i = 0;

      this.timers.push(setTimeout( () => {
        this.drawStep(trip.distance, trip.path, trip.duration, i, trip.gender, trip.birthYear);
      }, (trip.startTime * (5/3))))
    })
  }

  drawStep (distance, path, duration, i, gender, birthYear) {
    if (i === path.length) { return null };
    let color = 'green';

    if (this.colorByGender) {
      if (gender === 1) {
        color = 'blue';
      } else if (gender === 2) {
        color = 'magenta';
      }
    }

    if (this.colorByAge) {
      if (birthYear > 1995) {
        // Gen Z
        color = 'magenta';
      } else if (birthYear > 1979) {
        // Gen Y
        color = 'blue';
      } else if (birthYear > 1964) {
        // Gen X
        color = 'red';
      } else if (birthYear > 1940) {
        // Baby Boomer
        color = 'yellow';
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

    this.circles.push(step);
    this.count += 1;

    let stepSpeed = this.calculateStepSpeed(distance, duration, path[i], path[i + 1]);
    this.timers.push(setTimeout( () => this.clearStep(step), stepSpeed));
    this.timers.push(setTimeout( () => this.drawStep(distance, path, duration, i + 1, gender, birthYear), stepSpeed));
  }

  clearStep (step) {
    step.setMap(null);
    this.count -= 1;
  }

  calculateStepSpeed (distance, duration, pointA, pointB) {
    if (!pointB) return 0;
    let a = new google.maps.LatLng(pointA);
    let b = new google.maps.LatLng(pointB);

    return (google.maps.geometry.spherical.computeDistanceBetween(a, b) / distance) * (duration * (5/3));
  }

  stop () {
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

    for (let i = 0; i < this.timers.length; i++) {
      clearTimeout(this.timers[i]);
    }
    this.timers = [];

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

  const stopButton = document.getElementById('stop');
  stopButton.addEventListener('click', citiBikeViz.stop.bind(citiBikeViz));

  const defaultToggle = document.getElementById('default');
  defaultToggle.addEventListener('click', () => {
    citiBikeViz.colorByGender = false;
    citiBikeViz.colorByAge = false;
    citiBikeViz.restart();
    genderLegend.style.display = 'none';
    legend.style.display = 'none';
  })

  const genderToggle = document.getElementById('gender');
  const genderLegend = document.getElementById('gender-legend');
  genderToggle.addEventListener('click', () => {
    citiBikeViz.colorByGender = !citiBikeViz.colorByGender;
    ageToggle.checked = false;
    citiBikeViz.colorByAge = false;
    citiBikeViz.restart();
    genderLegend.style.display = citiBikeViz.colorByGender ? 'block' : 'none';
    legend.style.display = citiBikeViz.colorByAge ? 'block' : 'none';
  })

  const ageToggle = document.getElementById('age');
  ageToggle.addEventListener('click', () => {
    citiBikeViz.colorByAge = !citiBikeViz.colorByAge;
    genderToggle.checked = false;
    citiBikeViz.colorByGender = false;
    citiBikeViz.restart();
    legend.style.display = citiBikeViz.colorByAge ? 'block' : 'none';
    genderLegend.style.display = citiBikeViz.colorByGender ? 'block' : 'none';
  })

  const restartButton = document.getElementById('restart');
  restartButton.addEventListener('click', citiBikeViz.restart.bind(citiBikeViz))
})
