
const map_info = [
	{color: d3.schemeGreens, name: "Renewables", legendMax: 0.60, legendName: 'Renewables production (%)', percentage: "percent_generation_renewables", twh: 'renewables', selectedCountryColor: "#002311"}, 
	{color: d3.schemeOranges,name: "Solar", legendMax: 0.08, legendName: 'Solar production (%)', percentage: "percent_generation_solar", twh: 'solar_generation', selectedCountryColor: "#522902"}, 
	{color: d3.schemeBlues, name: "Wind", legendMax: 0.40, legendName: 'Wind production (%)', percentage: "percent_generation_wind", twh: 'wind_generation', selectedCountryColor: "#02053b"}, 
	{color: d3.schemeGreys, name: "Biomass", legendMax: 0.15, legendName: 'Biomass production (%)', percentage: "percent_generation_biomass", twh: 'geo_biomass', selectedCountryColor: "#000000"}, 
]
			
var selectedPercentageData = map_info[0].percentage;
var selectedTwhData = map_info[0].twh;
var selectedLegendMax = map_info[0].legendMax;

var selectedIndexData = 0;
var dashStrokeWidth = 0.8;
var selectedCountry;


//Width and height
var map_width = 600;
var map_height = 400;

var map_legend; 


var mapColorScale = d3.scaleThreshold()
	.domain(_.range(selectedLegendMax/8, selectedLegendMax+selectedLegendMax/8, selectedLegendMax/8))
	.range(d3.schemeGreens[9])

//Create SVG
var map_svg = d3.select("#map")
	// .style("background-color", "lightblue")
	.attr("width", map_width)
	.attr("height", map_height);

// variable used to keep the "hovered" iso country
var map_hovered_country; 

// Map tooltip
var map_tooltip = d3.select("body").append("div")	
.attr("class", "tooltip-map")				
.style("opacity", 0);



function drawMap(topology) {

	// Define map projection for Europe
	var projection = d3.geoMercator()
	.center([ 13, 52 ])
	.translate([ map_width/2, map_height/2 ])
	.scale([ map_width/1.5 ]); 

	// Define path generator
	var path = d3.geoPath()
	.projection(projection);


	const title = map_info[selectedIndexData].name
	d3.select('h1.map').html( title + " production in Europe, " + currentYear + "<span class='tooltiptext'>This graph shows the % of the total generated energy that came from renewable energy types. Select a year from the slider or click on play to see the evolution. The color gradient shows the %. Individual types can be selected from the dropdown.</span>")



	// Dashed lines for countries with no data
	var defs = map_svg.append('defs'); 
	var dashWidth = 5; // change this to define the distance between hashes				   
	var g = defs.append("pattern")
			.attr('id', 'hash')
			.attr('patternUnits', 'userSpaceOnUse')
			.attr('width', dashWidth)
			.attr('height', dashWidth)
			.attr("x", 0).attr("y", 0)
			.append("g")
			.style("fill", 'none')
			// .style("stroke", "#e5e5e5")
			.style("stroke", "lightgrey")
			.style("stroke-width", dashStrokeWidth);
	g.append("path").attr("d", "M0,0 l"+dashWidth+","+dashWidth);
	g.append("path").attr("d", "M"+dashWidth+",0 l-"+dashWidth+","+dashWidth);



	map_svg.selectAll("path")
		.data(topology.features)
		.enter()
		.append("path")
		.attr("class", "country")				   
		.attr("d", path)
		.attr("stroke", "lightgrey") // country borders color
		.attr("fill", function(d) { 

			d.data = raw_data.filter(dd => dd.year == currentYear && dd.iso == d.properties.iso_a2)[0]

		return d.data ? mapColorScale(d.data[selectedPercentageData]) : "url(#hash)"; 
		})		
		.on("mouseover", onMouseOver)
		.on("mouseout", onMouseOut)
		.on("click", function (d) {				 
			if(d.data) { 
			selectedCountry = d.data.iso;
				map_svg.selectAll('path')
					.attr("id", "none")
					.attr("stroke", "lightgrey")
					.attr("stroke-width", function(d) {
						d.data ? 1 : dashStrokeWidth;
					})
					.style("opacity", 1);
				
				map_svg.selectAll('path').on("mouseover", onMouseOver);
				map_svg.selectAll('path').on("mouseout", onMouseOut);

				d3.select(this)
					.attr("id", "selected")
					.raise()
					.attr("stroke",map_info[selectedIndexData].selectedCountryColor) // 9 is the most dark color based on the energy color scale
					.attr("stroke-width", 1)
					.style("opacity", 0.8)
					.style("cursor", 'pointer');

				onMouseClick(d);
			}
		});


	function onMouseOver(d) {
		// Only update visual for countries with data
		if(d.data) { 

			if (d.data.iso != selectedCountry) {
				d3.select(this)
				.raise()
				.attr("stroke", map_info[selectedIndexData].selectedCountryColor) // 9 is the most dark color based on the energy color scale
				.attr("stroke-width", 1)
				.style("opacity", 0.8)
				.style("cursor", 'pointer');

				// Used so that the selected country are always on the top layer
				d3.select("#selected").raise()
			}					 
				
				map_hovered_country = d.data.iso;

				
				
				
				// slowly showing the tooltip
				map_tooltip.transition()		
					.duration(200)		
					.style("opacity", .9);	

				const percentage = (+d.data[selectedPercentageData] * 100).toFixed(2) // percentage value
				const twh = (+d.data[selectedTwhData]) // Twh value

				
				map_tooltip.html("<b>" + d.data.name + "</b> </br> </br>" + percentage + "% </br>" + twh + " TWh")	
					.style("left", (d3.event.pageX + 50) + "px")		
					.style("top", (d3.event.pageY - 30) + "px");	
			}
		}
		function onMouseOut(d) {
		map_hovered_country = null;	

		if (d.data && d.data.iso != selectedCountry) {
			d3.select(this)
				.attr("stroke", "lightgrey")
				.attr("stroke-width", 1)
				.style("opacity", 1);
		}

		map_tooltip.transition()		
			.duration(200)		
			.style("opacity", 0);	
	}

	function onMouseClick(d) {
		if(d.data) { 

			// update country selector
			var selectElement = document.getElementById("country");
			selectElement.value = map_hovered_country;

			// update country data
			countryData = raw_data.filter(d => d.iso == map_hovered_country);

			// update the stacked area chart
			updateStackedChart();
		}
	} 
	var dataSelection = d3.select("select#energy")
			
	dataSelection.selectAll("option")
		.data(map_info)
		.enter()
		.append("option")
		.attr("value", function(d, i){
			return i;
		})
		.text(function(d){
				return d.name;
		})
		
	dataSelection.on('change', function(){

		// Find which fruit was selected from the dropdown
		selectedIndexData = d3.select(this).property("value");

		selectedPercentageData = map_info[selectedIndexData].percentage;

		const color = map_info[selectedIndexData].color;
		selectedLegendMax = map_info[selectedIndexData].legendMax;

		mapColorScale = mapColorScale
			.domain(_.range(selectedLegendMax/8, selectedLegendMax+selectedLegendMax/8, selectedLegendMax/8))
			.range(color[9]);
		updateLegend();

		updateMap(currentYear);

	});
}


function updateMap(value) {

	currentYear = Math.round(value);

	// Title update
	const newTitle = map_info[selectedIndexData].name;
	d3.select('h1.map').html(newTitle + " production in Europe, " + currentYear + "<span class='tooltiptext'>This graph shows the % of the total generated energy that came from renewable energy types. Select a year from the slider or click on play to see the evolution. The color gradient shows the %. Individual types can be selected from the dropdown.</span>")

	// Map update
	map_svg.selectAll("path")
		.attr("fill", function(d) { 
			d.data = raw_data.filter(dd => dd.year == currentYear && dd.iso == d.properties.iso_a2)[0]
			return d.data ? mapColorScale(d.data[selectedPercentageData]) : "url(#hash)"; 
		})

	// Tooltip update
	if (map_hovered_country) {
		d = raw_data.filter(dd => dd.year == currentYear && dd.iso == map_hovered_country)[0];
		const percentage = (+d[selectedPercentageData] * 100).toFixed(2);
		const twh = (+d[selectedTwhData]);
		
		map_tooltip.html( "<b>" + d.name + "</b> </br> </br>" + percentage + "% </br>" + twh + " TWh")	
	}
}

function updateSelectedCountry(selectedIso) {

	selectedCountry= selectedIso;
	// update all countries to remove previous selected country
	map_svg.selectAll('path')
			.attr("id", "none")
			.attr("stroke", "lightgrey")
			.attr("stroke-width", function(d) {
				d.data ? 1 : dashStrokeWidth;
			})
			.style("opacity", 1);

	// find country path according to selected iso
	map_svg.selectAll("path").filter(function(d) {
		return d.data && d.data.iso == selectedIso;
	}).attr("id", "selected")
		.raise()
		.attr("stroke", map_info[selectedIndexData].selectedCountryColor) // 9 is the most dark color based on the energy color scale
		.attr("stroke-width", 1)
		.style("opacity", 0.8)
		.style("cursor", 'pointer');


}






