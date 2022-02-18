



function drawSlider() {

	var moving = false;
	var currentValue = 0;
	var targetValue = 450; // Width of the slider -> To change later to update dynamically on size of slider

	var x = d3.scaleLinear()
		.domain([1986, 2015])
		.range([0, targetValue]) 
		.clamp(true);


	//slider
	var slider = d3.select("#slider-container")
		.append("g")
		.attr("transform", "translate(" + 25 + "," + 50 / 2 + ")");
		
	slider.append("line")
		.attr("class", "track")
		.attr("x1", x.range()[0])
		.attr("x2", x.range()[1])
		.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "track-inset")
		.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "track-overlay")
		.call(d3.drag()
			.on("start.interrupt", function() { slider.interrupt(); })
			.on("start drag", function() { 

				const newValue = Math.round(x.invert(d3.event.x))

				// slider is updated every little drag
				const v = x.invert(d3.event.x);
				handleCircle.attr("cx", x(v));
					
				// but the map is updated only if the year changes
				if (currentYear != newValue) { 
					
					updateMap(x.invert(d3.event.x)); // decimal value 

					updateAster(x.invert(d3.event.x));
				}

				// Change currentValue so the play button starts where it is pointed
				if (d3.event.x < 0) currentValue = 0
				else if (d3.event.x > targetValue) currentValue = targetValue
				else currentValue = d3.event.x
			}));


	// Slider circle
	var handleCircle = slider.insert("circle", ".track-overlay")
		.attr("class", "handle-circle")
		.attr("r", 9);
		

	// Play Button
	var playButton = d3.select("#play-button")
		.on("click", function() {
			var button = d3.select(this);
			if (button.text() == "Pause") {
				moving = false;
				clearInterval(timer);
				timer = 0;
				button.text("Play");
			}
			else {
				moving = true;
				timer = setInterval(step, 25);
				button.text("Pause");
			}
		})


		// function called on every tick of the slider 
	function step() {
		currentValue = currentValue + (targetValue/300);  
			
		newYear = Math.round(x.invert(currentValue))

		handleCircle.attr("cx", currentValue);

		if (currentYear != newYear) {
			
			// Update map 
			updateMap(newYear); // decimal value 

			// Update aster plot
			updateAster(newYear);
		}

		if (currentValue > targetValue) {
			moving = false;
			currentValue = 0;
			clearInterval(timer);
			// timer = 0;
			playButton.text("Play");
		}
	}
}


drawSlider();