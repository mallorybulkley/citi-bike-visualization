# Citi Bike Visualization
## MVP
Visualization of Citi Bike trips in NYC/Brooklyn over the course of a day, with options to view by age or gender filters

- [ ] Watch an animation of Citi Bike trips over the course of 24 hours
- [ ] Start, pause and move the time progress
- [ ] Filter by age or gender of riders
- [ ] Production README

## Technologies & APIs
* JavaScript
* Citi Bike API
* Google Maps API

Citi Bike’s API & historical data will provide the start and endpoints for each trip, as well as the duration. Google Maps Directions will provide routes between the start and end points. The speed can be determined by the trip duration.


Data provided by Citi Bike (to be stored in the database):
* Trip Duration (seconds)
* Start Time and Date
* Stop Time and Date
* Start Station Name
* End Station Name
* Station ID
* Station Lat/Long
* Bike ID
* User Type (Customer = 24-hour pass or 7-day pass user; Subscriber = Annual Member)
* Gender (Zero=unknown; 1=male; 2=female)
* Year of Birth

## Implementation Timeline
**Day 1: Visualization of a single trip**

Figure out how to navigate the Citi Bike and Google Maps APIs to animate a single trip

**Day 2: Visualization of multiple trips over the course of a day**

Animate multiple trips, make sure overlapping routes are shown properly (heat map style visualization of density)

**Day 3: Filters**

Add buttons to toggle filters by age group and gender (these details are provided by Citi Bike for each trip)

**Bonus Features**

* Add more days/information to filter by day of week, month, weather, etc.
* Use the Citi Bike GBFS feed API to show real-time info
