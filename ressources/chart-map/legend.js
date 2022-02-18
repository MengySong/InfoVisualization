

function drawLegend() {

	var formatNumber = d3.format(".0f");
	var x = d3.scaleLinear()
		.domain([0, selectedLegendMax+selectedLegendMax/8])
		.range([0, 250]);

	var xAxis = d3.axisBottom(x)
		.tickSize(13)
		.tickValues(mapColorScale.domain())
		// .tickFormat(function(d) { return d === 0.65 ? formatPercent(d) : formatNumber(100 * d); });
		.tickFormat(function(d) { return formatNumber(100 * d); });

	map_legend = d3.select("g").call(xAxis);

	map_legend.select(".domain")
		.remove();

	map_legend.selectAll("rect")
		.data(mapColorScale.range().map(function(color) {
			var d = mapColorScale.invertExtent(color);
			if (d[0] == null) d[0] = x.domain()[0];
			if (d[1] == null) d[1] = x.domain()[1];
			return d;
		}))
		.enter().insert("rect", ".tick")
		.attr("height", 8)
		.attr("x", function(d) { return x(d[0]); })
		.attr("width", function(d) { return x(d[1]) - x(d[0]); })
		.attr("fill", function(d) { return mapColorScale(d[0]); });

	map_legend.append("text")
		.attr("id", "legendTitle")
		.attr("fill", "#000")
		.attr("font-weight", "bold")
		.attr("text-anchor", "start")
		.attr("y", -6)
		.text(map_info[selectedIndexData].legendName);

}

function updateLegend() {

	map_legend.selectAll("*").remove();
	drawLegend();

	// Maybe also change color data, or domain, or range
	// map_legend.selectAll("rect")
	// 	.attr("fill", function(d) { return mapColorScale(d[0]); });

	// map_legend.select("#legendTitle").text(map_info[selectedIndexData].legendName)
}


drawLegend();