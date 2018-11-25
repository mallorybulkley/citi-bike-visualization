document.addEventListener("DOMContentLoaded", () => {
	var width = 750;
	var height = 500;
	var padding = 50;

  svg = d3.select("svg")
              .attr("id", "svg")
        			.attr("width", width)
        			.attr("height", height + padding / 2);

	var allData = [];

  xAttr = "Gender";
  yAttr = "Count";
  yDescription = "Number of Trips";
  xDescription = "Gender";

  d3.csv("https://mallorybulkley.com/citi-bike-visualization/csv/2016-12-1.csv", function(error, data) {
    if (error) {
      console.log(error);
    } else {
      allData = data;
      window.sample = allData[0];
      updateChart(xAttr, yAttr);
    }
  });

  document.getElementById('go').addEventListener('click',function () {
    xAttr = document.getElementById('x-axis').value;
    yAttr = document.getElementById('y-axis').value;

    switch(yAttr) {
      case "Birth Year":
        yDescription = "Average Age";
        break;
      case "Trip Duration":
        yDescription = "Average Trip Duration (minutes)";
				break;
			case "Count":
				yDescription = "Number of Trips";
				break;
    }

    switch(xAttr) {
      case "Birth Year":
        xDescription = "Age Group";
        break;
      case "Start Station Name":
        xDescription = "Top 5 Start Stations";
        break;
      case "End Station Name":
        xDescription = "Top 5 End Stations";
        break;
      default:
        xDescription = xAttr;
    }

    updateChart(xAttr, yAttr);
  });

  function tripToKey(trip) {
    switch (xAttr) {
      case "Birth Year":
        return (trip[xAttr] === "" || trip[xAttr] < 1920) ? "Unknown" : Math.ceil((2017 - trip[xAttr]) / 5) * 5;
      case "User Type":
        return trip[xAttr] || "Customer"; // can assume unknown trips are not annual subscribers
      default:
        return trip[xAttr];
    }
  }

  function updateChart (xAttr, yAttr) {
    svg.selectAll('*').remove();

    if (yAttr === "Count") {
      dataset = d3.nest()
        .key(tripToKey)
        .rollup(function(trips) { return trips.length; })
        .entries(allData);
    } else if (yAttr === "Birth Year") {
      dataset = d3.nest()
        .key(tripToKey)
        .rollup(function(trip) { return d3.mean(trip, function(t) {
          if (t[yAttr] === "") {
            return;
          } else {
            return 2017 - t[yAttr];
        }});
      }).entries(allData);
    } else {
      dataset = d3.nest()
        .key(tripToKey)
        .rollup(function(trip) { return d3.mean(trip, function(t) { return Number(t[yAttr]) / 60; });
      }).entries(allData);
    }
    dataset = dataset.filter(function (d) { return d.key !== "Unknown"; });
    if (xAttr === 'Start Station Name' || xAttr === 'End Station Name') {
      dataset = dataset.sort(function (a, b) {
        return d3.descending(Number(a.values), Number(b.values));
      }).slice(0, 5);
    }

    window.dataset = dataset;

    var xScale = d3.scale.ordinal()
            .domain(d3.range(dataset.length))
            .rangeRoundBands([padding * 2, width - padding], 0.05);

    var yMax = d3.max(dataset.map(function (d) { return d.values; }));
    var yScale = d3.scale.linear()
            .domain([0, yMax])
            .range([height - 2 * padding, 0]);

		var xAxis = d3.svg.axis()
						  .scale(xScale)
						  .orient("bottom")
              .tickFormat("");

		var yAxis = d3.svg.axis()
						  .scale(yScale)
						  .orient("left")
						  .ticks(10);


    svg.selectAll('rect')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('x', function(d, i) { return xScale(i); })
      .attr('y', function(d) { return yScale(d.values) + padding; })
      .attr('width', xScale.rangeBand())
      .attr('height', function(d) { return height - yScale(d.values) - 2 * padding; })
      .style('fill', function(d) {
        if (xAttr === 'Birth Year') {
          if (d.key < 21) { return 'magenta'; }
          if (d.key < 36) { return 'blue'; }
          if (d.key < 51) { return 'red'; }
          if (d.key < 76) { return 'yellow'; }
          return 'green';
        } else if (xAttr === 'Gender') {
          if (d.key === '0') { return 'green'; }
          if (d.key === '1') { return 'blue'; }
          if (d.key === '2') { return 'magenta'; }
        }
        return 'steelblue';
      });

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height - padding) + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + 2 * padding + "," + padding + ")")
      .call(yAxis);

    svg.append("g")
      .selectAll("text")
      .data(dataset)
      .enter()
      .append("text")
      .text(function (d) {
        let key;
        switch(d.key) {
          case "0":
            return "Unknown";
          case "1":
            return "Male";
          case "2":
            return "Female";
          default:
            if (typeof d.key === 'number') {
              return (d.key - 4) + "-" + d.key;
            }
            return d.key.slice(0, 14) || 'Unknown';
        }
      })
      .attr("text-anchor", "middle")
      .attr("x", function(d, i) {
      	return xScale(i) + xScale.rangeBand() / 2;
      })
      .attr("y", height - padding / 2);

    svg.append("text")
      .attr("class", "y-label")
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("x", (height / -2))
      .attr("y", padding / 2)
      .attr("dy", "1em")
      .text(yDescription);

    svg.append("text")
      .attr("class", "x-label")
      .attr("x", (width - padding) / 2)
      .attr("y", height + padding / 4)
      .text(xDescription);
  }
});
