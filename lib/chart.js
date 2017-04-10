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
  yAttr = "Trip Duration";
  yDescription = "Trip Duration (seconds)";
  xDescription = "Gender";

  d3.csv("../csv/2016-12-1.csv", function(error, data) {
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
      case "Count":
        yDescription = "Number of Trips";
        break;
      default:
        yDescription = "Average Trip Duration (seconds)";
    }

    switch(xAttr) {
      case "Birth Year":
        xDescription = "Age Group";
        break;
      default:
        xDescription = xAttr;
    }

    updateChart(xAttr, yAttr);
  });

  function updateChart (xAttr, yAttr) {
    svg.selectAll('*').remove();

    if (yAttr === "Count") {
      dataset = d3.nest()
        .key(function(trip) {
          switch(xAttr) {
            case "Birth Year":
              return (trip[xAttr] === "" || trip[xAttr] < 1920) ? "Unknown" : Math.ceil((2017 - trip[xAttr]) / 5) * 5;
            default:
              return trip[xAttr];
          }})
        .rollup(function(trips) { return trips.length; })
        .entries(allData);
    } else if (yAttr === "Birth Year") {
      dataset = d3.nest()
        .key(function(trip) {
          switch(xAttr) {
            case "Birth Year":
              return (trip[xAttr] === "" || trip[xAttr] < 1920) ? "Unknown" : Math.ceil((2017 - trip[xAttr]) / 5) * 5;
            default:
              return trip[xAttr];
          }})
        .rollup(function(trip) { return d3.mean(trip, function(t) {
          if (t[yAttr] === "") {
            return;
          } else {
            return 2017 - t[yAttr];
        }})
      }).entries(allData);
    } else {
      dataset = d3.nest()
        .key(function(trip) {
          switch(xAttr) {
            case "Birth Year":
              return (trip[xAttr] === "" || trip[xAttr] < 1920) ? "Unknown" : Math.ceil((2017 - trip[xAttr]) / 5) * 5;
            default:
              return trip[xAttr];
          }})
        .rollup(function(trip) { return d3.mean(trip, function(t) { return +t[yAttr]; })
      }).entries(allData);
    }
    dataset = dataset.filter(function (d) { return d.key !== "Unknown"; });

    window.dataset = dataset;

    var xScale = d3.scale.ordinal()
            .domain(d3.range(dataset.length))
            .rangeRoundBands([padding * 2, width - padding], 0.05);

    var yMax = d3.max(dataset.map(function (d) { return d.values }));
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
      .style('fill', 'steelblue');

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height - padding) + ")")
      .call(xAxis)

    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + 2 * padding + "," + padding + ")")
      .call(yAxis)

    svg.append("g")
      .selectAll("text")
      .data(dataset)
      .enter()
      .append("text")
      .text(function (d) {
        let key;
        switch(d.key) {
          case "0":
            key = "Unknown";
            break;
          case "1":
            key = "Male";
            break;
          case "2":
            key = "Female";
            break;
          default:
            key = (d.key - 4) + "-" + d.key;
            break;
        };
        return key;
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
      .text(yDescription)

    svg.append("text")
      .attr("class", "x-label")
      .attr("x", (width - padding) / 2)
      .attr("y", height + padding / 4)
      .text(xDescription)
  }
});
