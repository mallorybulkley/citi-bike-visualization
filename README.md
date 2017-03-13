# A Day in the Life of Citi Bike
Who uses Citi Bike? Where do they go? [*A Day in the Life of Citi Bike*](http://mallorybulkley.com/citi-bike-visualization) is a visual exploration of these questions.

[Live](http://mallorybulkley.com/citi-bike-visualization)


## About
This visualization uses Citi Bike data along with Google Maps to show Citi Bike riders on December 1, 2016. Each circle on the map represents a single rider. I assume that each rider follows the route recommended by Google Maps bicycling directions. To avoid hitting the query limit on Google's Directions Services API, the data is all stored in a Firebase database. Additionally, by limiting the number of asynchronous requests that need to be made, this enables quicker rendering of points on the map.

![citi_bikes](./images/citi_bikes.gif)

## Implementation
Everything is displayed on a single Google Maps `Map` object. Citi Bike's data provides the starting and ending latitude/longitude coordinates for each trip. I send these points to the Google Maps `Directions Services` API and retrieve the bicycling directions for each trip. The directions returned by Google Maps' API include a `Path` object with latitudes and longitudes for each inflection point along the route.

Using the average speed and overall duration of the trip (calculated from the Citi Bike data) along with the distance between each point, I am able to calculate the estimated time between each inflection point along the route. The bikes are then drawn directly on the `Map` (as Google Map `Circle` objects) to approximate the actual speed of the riders along their route.


The bikes can also be colored by age group or gender of the riders. This information is supplied by Citi Bike and stored in the Firebase database. When these color selections are turned on or off, the color of the Circle instances is set by these variables for each cyclist.
