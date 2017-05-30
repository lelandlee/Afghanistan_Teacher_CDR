const width = window.innerWidth - 20;
const height = window.innerHeight - 20;

d3.select('#map')
	.style('width', width + 'px')
	.style('height', height + 'px')

var map = L.map('map').setView([34.447900, 70.435496], 13);
const mapStyle = 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGVsYW5kbGVlIiwiYSI6IlF6YXRwcUUifQ.lOwg0AiYU4PwgX4bFgZvAw';
const mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer(
    mapStyle, {
	    attribution: '&copy; ' + mapLink + ' Contributors',
	    maxZoom: 18,
	    minZoom: 9,
    }
).addTo(map);
		
/* Initialize the SVG layer */
map._initPathRoot(); 
var svg = d3.select("#map").select("svg")

const heightMod = 2;
const baseWidth = 8;

const drawTower = (selection) => {
	// Label for the tower
	selection.append('text')
		.classed('text', true)
		.attr('text-anchor', 'middle')
		.text((d) => `${d.workingHours}/${d.total}`);
		
	// Base amount of calls
	selection.append('rect')
		.classed('total', true)
		.style("stroke", "black")  
		.style("opacity", 0.6)
		.style("fill", "orange")
		.attr("height", (d) => d.total * heightMod)  
		.attr("width", baseWidth);

	// Portion of calls made during work hours
	selection.append('rect')
		.classed('work_hours', true)
		.style("fill", "maroon")
		.attr("height", (d) => d.workingHours * heightMod)  
		.attr("width", baseWidth * 3/5);

	// Appending the circle base + clipPath doesn't seem to work for now...
	// selection.append('clipPath')
	// 		.attr('id', (d, i) => 'baseClip_' + i)
	// 	.append('rect')
	// 		.classed('baseClipLoc', true)
	// 		.attr('height', baseWidth / 2)
	// 		.attr('width', baseWidth);

	// selection.append('circle')
	// 	.classed('base', true)
	// 	.style("fill", "black")
	// 	.attr("r", baseWidth / 2)
	// 	.attr('clip-path', (d, i) => `url(#baseClip_${i})`);
}


d3.csv("coordinate_data.csv", (collection) => {
	
	/* Add a LatLng object to each item in the dataset */
	collection.forEach((d) => {
		d.latitude = parseFloat(d.latitude);
		d.longitude = parseFloat(d.longitude);
		d.total = parseFloat(d.total);
		d.workingHours = parseFloat(d.workingHours);

		d.LatLng = new L.LatLng(d.latitude, d.longitude);
	});
	
	var feature = svg.selectAll("g")
			.data(collection)
		.enter()
			.append("g");

	feature.call(drawTower)


	// Try to impliment later
	// var voronoi = d3.voronoi()
	//   .x((d) => d.longitude)
	//   .y((d) => d.latitude);
	// // voronoi(collection).polygons() //.forEach((v) => v.point.cell = v);
	// // var buildPathFromPoint = (d) => {
	// // 	console.log(d)
	// // 	d = d.map((d => d.filter((d) => d != null)))
	// // 	return "M" + d.join("L") + "Z"
	// // };
	// // svg.append("path")
	// // 	.attr("d", buildPathFromPoint);
	// // console.log(voronoi(collection).polygons())

	// // Need to convert lat and longitude to x and y on the screen
	// // Along with allow it to move with the screen
	// svg.append("path")
	// 	.datum(voronoi.polygons(collection))
	// 	.attr("class", "voronoi")
	// 	.attr("d", (d) => {
	// 		d = d.map((d => d.filter((d) => d != null)))
	// 		return "M" + d
	// 			.map((d) => d.join("L"))
	// 			.join("ZM") + "Z";
	// 	});
	
	map.on("viewreset", update);
	update();

	function update() {
		const x = (d) => map.latLngToLayerPoint(d.LatLng).x;
		const y = (d) => map.latLngToLayerPoint(d.LatLng).y;

		feature.selectAll('.text').attr("transform", (d) => `translate(${x(d)}, ${(y(d) - d.total * heightMod - 5)})`);
		// feature.selectAll('.base').attr("transform", (d) => `translate(${x(d)}, ${y(d)})`);
		// feature.selectAll('.baseClipLoc').attr("transform", (d) => `translate(${x(d) - baseWidth / 2}, ${y(d)})`);

		feature.selectAll('.total').attr("transform", (d) => `translate(${x(d) - baseWidth / 2}, ${(y(d) - d.total * heightMod)})`);
		feature.selectAll('.work_hours').attr("transform", (d) => `translate(${x(d) - baseWidth / 2}, ${(y(d) - d.workingHours * heightMod)})`);
	}
});	 