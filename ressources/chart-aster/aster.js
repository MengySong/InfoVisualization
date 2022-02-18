var  aster_margin = { top: 75, right: 100, bottom: 75, left: 100 };

var pie_width = 250,
    pie_height = 250,

    // Total size of the chart (take into account the margin so the countries can correctly be displayed)
    total_width = pie_width + aster_margin.right + aster_margin.left,
    total_height = pie_height + aster_margin.top + aster_margin.bottom,

    radius = Math.min(pie_width, pie_height) / 2,
    innerRadius = 0.25 * radius;

// var currentYear = 1986;
data_column = "percentage_total_potential_vs_total"

var year_middle;

var pie = d3.pie()
    .sort(null)
    // .value(function(d) { return d.width; });
    .value(_ => 1); // Same width for each

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([0, 0])
  .html(function(d) {
    return d.data.name + ": <span style='color:orangered'>" + (d.data[data_column] * 100).toFixed(0) + "%</span>";
  });


  // arc function used to display countries 
var textArc = d3.arc()
    .outerRadius(radius);


// arc function used to display colored bars
var arc = d3.arc()
  .innerRadius(innerRadius)
  .outerRadius(function (d) { 
    return (radius - innerRadius) * (d.data[data_column]) + innerRadius; 
  });

// arc function used to display outer radius of the pie
var outlineArc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius);

var aster_svg = d3.select("#aster")
    .attr("id", "pie_container")
    .attr("width", total_width)
    .attr("height", total_height)
    // .style("background-color", "rgb(245, 245, 245)")
    .append("g")
    .attr("transform", "translate(" + total_width / 2 + "," + total_height / 2 + ")");


aster_svg.call(tip);



function drawAster() {

  // var colorScale = d3.schemeCategory20c()
  var colorScale = d3.scaleOrdinal()
  .range(d3.schemeCategory20c)

  aster_svg.selectAll(".solidArc")
    .data(pie(aster_data))
    .enter()
    .append("path")
    // .attr("fill", function(d) { return d.data.color; })
    .attr("fill", d3.schemePurples[9][8])
    .attr("class", "solidArc")
    .attr("stroke", "gray")
    .attr("d", arc)
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)

  var outerPath = aster_svg.selectAll(".outlineArc")
    .data(pie(aster_data))
    .enter()

  outerPath.append("path")
    .attr("fill", "none")
    .attr("stroke", "gray")
    .attr("class", "outlineArc")
    .attr("d", outlineArc)

  outerPath.append("svg:text")
    .attr("transform", function(d) {
      d.outerRadius = radius + 75;
      d.innerRadius = radius + 70;
      return "translate(" + textArc.centroid(d) + ")";
    })
    .attr("text-anchor", "middle") //center the text on it's origin
    .style("fill", "black")
    .style("font", "bold 12px Arial")
    .text(function(d, i) { return d.data.name; })


  // Year in the middle
  year_middle = aster_svg.append("svg:text")
    .attr("class", "aster-score")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle") // text-align: right
    // .text(Math.round(score));
    .text(currentYear);

}

function updateAster(value) {
  currentYear = currentYear = Math.round(value);;

  aster_data = raw_data.filter(d => d.year == currentYear && d.iso != "EU"); // We don't take Europe data

  aster_svg.selectAll(".solidArc")
  .data(pie(aster_data))
  .transition()
  .duration(0)
  .attrTween("d", arcTween);

  // function used to avoid errors due to the transition
  function arcTween(d) {
    var i = d3.interpolate(this._current, d);
    this._current = i(0);
    return function(t) {
      return arc(i(t));
    };
  }

  year_middle.text(currentYear);

  tip.html(function(d) {
    return d.data.name + ": <span style='color:orangered'>" + (d.data[data_column] * 100).toFixed(0) + "%</span>";
  })


}
