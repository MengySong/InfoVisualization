
// set the dimensions and margins of the graph
var stacked_margin = {top: 50, right: 80, bottom: 40, left: 80},
    stacked_width = 600 - stacked_margin.left - stacked_margin.right,
    stacked_height = 400 - stacked_margin.top - stacked_margin.bottom;


var countrySelection;


// append the svg object to the body of the page
var stacked_svg = d3.select("#stacked_area")
  .append("svg")
    .attr("width", stacked_width + stacked_margin.left + stacked_margin.right)
    .attr("height", stacked_height + stacked_margin.top + stacked_margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + stacked_margin.left + "," +  stacked_margin.top + ")");


// data columns names
const energy_keys = ['solar_generation', 'wind_generation', 'geo_biomass'];


var lightScheme1 = d3.schemeOranges[9][4];
var lightScheme2 = d3.schemeBlues[9][4];
var lightScheme3 = d3.schemeGreys[9][4];

var darkScheme1 = d3.schemeOranges[9][6];
var darkScheme2 = d3.schemeBlues[9][6];
var darkScheme3 = d3.schemeGreys[9][6];


// colors for stacked areas
var stacked_color = d3.scaleOrdinal()
  .domain(energy_keys)
  .range([
    lightScheme1,
    lightScheme2,
    lightScheme3
  ])


  // X axis
var x = d3.scaleTime()
  .range([ 0, stacked_width ]);
  
var y = d3.scaleLinear()
  .range([ stacked_height, 0 ]);


  // ----- Tooltip -----

var stacked_tooltip = d3.select("body").append("div")	
.attr("class", "tooltip-stacked")				
// .style("visibility", "hidden");



// UTILITIES FUNCTIONS

function drawStackedChart() {

  createDropdown();
  createLegend();

  var elem = document.getElementById("country");
  var currentCountry = elem.options[elem.selectedIndex].text;
  d3.select('h1.stacked').html("Type of renewable generation - " + currentCountry + "<span class='tooltiptext'>This graph shows the stacked generated energy per renewable type per country. Select a country from the dropdown on the map or click on a country on the map to update the data for a specific country.</span>")


  // Max value of the three columns
  var maxValue = d3.max(countryData, function(d){
    return +d.solar_generation + +d.wind_generation + +d.geo_biomass;
  })

  // X axis 
  x.domain(d3.extent(countryData, function(d) { return d.date; }))
  var xAxis = d3.axisBottom(x)

  // Y axis
  y.domain([0, maxValue])
  var yAxis = d3.axisLeft(y).ticks(10).tickSize(-stacked_width);

  
  // Stack the data
  var stackedData = d3.stack()
    .keys(energy_keys)(countryData)

  // Show the stacked areas (stacked areas before axis so horizontal lines are above stacked areas)
  stacked_svg.selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
      .style("fill", function(d) { return stacked_color(d.key); })
      .style("stroke", function(d) { return stacked_color(d.key); })
      .attr("d", d3.area()
        .x(function(d, i) { return x(d.data.date); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })
    )


  // X axis drawing
  stacked_svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + stacked_height + ")")
    .call(xAxis)
    .call(g => {
      g.selectAll("text")
        .attr('fill', '#A9A9A9')

      g.selectAll("line")
        .attr('stroke', '#A9A9A9')

      g.select(".domain")
        .attr('stroke', '#A9A9A9')
    })
    

  // Y Axis drawing
  var axisPad = 6;

  stacked_svg.append("g")
    .attr("class", "y-axis")
    .attr('stroke-width', 0) // 
    .call(yAxis)
    .call(g => {
      g.selectAll("text")
      .style("text-anchor", "middle")
      .attr("x", -axisPad*2)
      .attr('fill', '#A9A9A9')

      g.selectAll("line")
        .attr('stroke', '#A9A9A9')
        .attr('stroke-width', 0.7) // make horizontal tick thinner and lighter so that line paths can stand out
        .attr('opacity', 0.3)
    })
    .append('text')
      .attr('x', 50)
      .attr("y", -10)
      .attr("fill", "#A9A9A9")
      .text("Terawatt-hour (TWh)")


  // Creating focus behavior once chart draw is done 
  createFocuses();
}


// Update function called when the country is changed
function updateStackedChart() {

  var elem = document.getElementById("country");
  var currentCountry = elem.options[elem.selectedIndex].text;
  d3.select('h1.stacked').html("Type of renewable generation - " + currentCountry + "<span class='tooltiptext'>This graph shows the stacked generated energy per renewable type per country. Select a country from the dropdown on the map or click on a country on the map to update the data for a specific country.</span>")


  var axisPad = 6;  

  var maxValue = d3.max(countryData, function(d){
    return +d.solar_generation + +d.wind_generation + +d.geo_biomass;
  })

  y.domain([0, maxValue])

  // Update Y axis
  stacked_svg.selectAll("g.y-axis")
    .transition().duration(750)
    .call(d3.axisLeft(y).ticks(10).tickSize(-stacked_width))
    .call(g => {
      g.selectAll("text")
      .style("text-anchor", "middle")
      .attr("x", -axisPad*2)
      .attr('fill', '#A9A9A9')

      g.selectAll("line")
        .attr('stroke', '#A9A9A9')
        .attr('stroke-width', 0.7) // make horizontal tick thinner and lighter so that line paths can stand out
        .attr('opacity', 0.3)

      g.select(".domain").remove()
    })


  // Update stacked areas
  stackedData = d3.stack()
    .keys(energy_keys)(countryData)

    stacked_svg.selectAll("path")
    .data(stackedData)
    .transition().duration(750)
    .attr("d", d3.area()
      .x(function(d, i) { return x(d.data.date); })
      .y0(function(d) { return y(d[0]); })
      .y1(function(d) { return y(d[1]); })
  )

}

// Function used to create mouse observers (one for each little circle)
function createFocuses() {

  var focus = stacked_svg.append("g")
    .attr("class", "focus")
    .style("display", "none");

  // vertical line when mouse hover (added only to one of the focus)
  focus.append("line")
    .attr("class", "hover-line")

  focus.append("circle")
    .attr("r", 3)
    .style("fill", darkScheme1)
      
  var focus2 = stacked_svg.append("g")
    .attr("class", "focus")
    .style("display", "none");

  focus2.append("circle")
    .attr("r",3)
    .style("fill", darkScheme2);

  var focus3 = stacked_svg.append("g")
    .attr("class", "focus")
    .style("display", "none");

  focus3.append("circle")
    .attr("r", 3)
    .style("fill", darkScheme3);


  // Create frame to detect mouse events
  stacked_svg.append("rect")
    .attr("class", "overlay")
    .attr("width", stacked_width)
    .attr("height", stacked_height)
    stacked_svg.on("mouseover", function() {

      focus.style("display", null);
      focus2.style("display", null);
      focus3.style("display", null);

      stacked_tooltip.style("display", "block");
    })
    .on("mouseout", function() {

      focus.style("display", "none");
      focus2.style("display", "none");
      focus3.style("display", "none");

      stacked_tooltip.style("display", "none");
    })
    .on("mousemove", mousemove);

    // Function called each time a mouse mouvement is detected
  function mousemove() {

    const bisectDate = d3.bisector(function(d) { return d.date }).left;
  
    var x0 = x.invert(d3.mouse(this)[0]);
    var i = bisectDate(countryData, x0, 1);
    var d0 = countryData[i - 1];
    var d1 = countryData[i];
    var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    
    
    var depl=parseFloat(d['solar_generation']);
    var depl2=parseFloat(d['solar_generation'])+parseFloat(d['wind_generation']);
    var depl3=parseFloat(d['solar_generation'])+parseFloat(d['wind_generation'])+parseFloat(d['geo_biomass']);
    
    // Update focus position
    focus.attr("transform", "translate(" + x(d.date) + "," + y(depl) + ")"); 
    focus2.attr("transform", "translate(" + x(d.date) + "," + y(depl2) + ")");   
    focus3.attr("transform", "translate(" + x(d.date) + "," + y(depl3) + ")");   
    
    
    
    // Update vertical line position
    focus.select(".hover-line").attr("y1", - y(d.solar_generation));
    focus.select(".hover-line").attr("y2", stacked_height - y(d.solar_generation));
  
    
    // Update tooltip  
    updateTooltip(d);
  
  }
}

// Tooltip update function
function updateTooltip(d) {

  // Update position
  stacked_tooltip
    // .style("top", (height/3)+"px")
    // .style("left",(event.pageX-100)+"px");

    .style("top",(d3.event.pageY-100)+"px")
    .style("left",(d3.event.pageX+20)+"px");


  // Update information

  var year = "<font size='2'>" + "<b>" + d.year + "</b>" + "</font> </br>"
  var solar = "Solar: " + (+d.solar_generation).toFixed(2) + " TWh </br>";
  var wind = "Wind: " + (+d.wind_generation).toFixed(2) + " TWh </br>";
  var biomass = "Biomass: " + (+d.geo_biomass).toFixed(2) + " TWh </br>";

  // No need for total when showing the relative chart 
  var total = "<b> Total: </b> " + (+d.solar_generation + +d.wind_generation + +d.geo_biomass).toFixed(2) + " TWh";

  stacked_tooltip.html(year + solar + wind + biomass + total)
}


// Creating country selection
function createDropdown() {
    
  countrySelection = d3.select("select#country")

  countrySelection.selectAll("option")
    .data(data_per_country)
    .enter()
    .append("option")
    .attr("value", function(d, i){
        return d.iso;
    })
    .text(function(d){
        return d.name;
    })
    
  countrySelection.on('change', function(){
    const selectedIso = d3.select(this).property("value")
    countryData = raw_data.filter(d => d.iso == selectedIso);

    updateStackedChart();
	updateSelectedCountry(selectedIso);
  });

  countrySelection.property('value', 'EU');
}


// Legend creation function
function createLegend() {

  var R = 6 // circle radius

  var category = ["Solar energy", "Wind energy", "Biomass energy"]

  var svgLegend = stacked_svg.append('g')
    .attr('class', 'gLegend')
    .attr("transform", "translate(" + (stacked_width -180) + ",-" + 43 + ")")

  var legend = svgLegend.selectAll('.legend')
    .data(category)
    .enter().append('g')
      .attr("class", "legend")
      .attr("transform", function (d, i) {return "translate(0," + i * 20 + ")"})

  legend.append("circle")
    .attr("class", "legend-node")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", R)
    .style("fill", d=>stacked_color(d))

  legend.append("text")
    .attr("class", "legend-text")
    .attr("x", R*2)
    .attr("y", R/2)
    .style("fill", "#A9A9A9")
    .style("font-size", 12)
    .text(d => {
        return d;
    })
}


