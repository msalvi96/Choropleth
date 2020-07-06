//width and height

var chart_width = 800;
var chart_height = 600;

var color = d3.scaleQuantize().range(
    ['rgb(247,252,245)','rgb(229,245,224)','rgb(199,233,192)',
    'rgb(161,217,155)','rgb(116,196,118)','rgb(65,171,93)',
    'rgb(35,139,69)','rgb(0,109,44)','rgb(0,68,27)'])

//Projection - converts coordinates into d3 understandable formats
var projection = d3.geoAlbersUsa()
                    .scale([chart_width * 3])
                    .translate([chart_width/2, chart_height/2]);

var path = d3.geoPath()
            .projection(projection)

var svg = d3.select("#chart")
            .append("svg")
            .attr("width", chart_width)
            .attr("height", chart_height);

var drag_map = d3.drag().on('drag', function() {
    // console.log(d3.event);
    var offset = projection.translate();
    offset[0] += d3.event.dx;
    offset[1] += d3.event.dy;

    projection.translate(offset);
    svg.selectAll('path')
        .transition()
        .attr('d', path);
    
    svg.selectAll('circle')
        .transition()
        .attr('cx', function(d){
            return projection([d.lon, d.lat])[0];
        })
        .attr("cy", function(d){
            return projection([d.lon, d.lat])[1];
        });
});

var map = svg.append('g')
            .attr("id", "map")
            .call(drag_map);

//Data
d3.json('zombie-attacks.json').then((zombie_data) => {
    color.domain([
        d3.min(zombie_data, (d) => { return d.num; }),
        d3.max(zombie_data, (d) => { return d.num; })
    ]);

    d3.json('us.json').then((us_data) => {
        us_data.features.forEach((us_e, us_i) => {
            zombie_data.forEach((z_e, z_i) => {
                if (us_e.properties.name !== z_e.state) {
                    return null;
                }
                us_data.features[us_i].properties.num = parseFloat(z_e.num);
            });
        });
        console.log(us_data);
        map.selectAll('path')
            .data(us_data.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr("fill", (d) => {
                var num = d.properties.num;
                return num ? color(num) : '#ddd';
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);

        draw_cities();
    })
});

var draw_cities = () => {
    d3.json('us-cities.json').then((city_data) => {
        map.selectAll("circle")
            .data(city_data)
            .enter()
            .append("circle")
            .style("fill", "#9D497A")
            .style("opacity", 0.8)
            .attr("cx", (d) => {
                return projection([d.lon, d.lat])[0];
            })
            .attr("cy", (d) => {
                return projection([d.lon, d.lat])[1];
            })
            .attr("r", (d) => {
                return Math.sqrt(parseInt(d.population)*0.00005);
            })
            .append("title")
            .text((d) => {
                return d.city;
            })
    })
}


d3.selectAll('#buttons button').on('click', function(){
    var offset = projection.translate();
    var distance = 100;
    var direction = d3.select(this).attr('class');

    if(direction == "up"){
        offset[1] += distance; //increase y offset
    }else if(direction == "down"){
        offset[1] -= distance; //decrease y offset
    }else if(direction == "left"){
        offset[0] += distance; //increase x offset
    }else if(direction == "right"){
        offset[0] -= distance; //decrease x offset
    }

    projection.translate(offset);

    svg.selectAll('path')
        .transition()
        .attr('d', path);

    svg.selectAll('circle')
        .transition()
        .attr('cx', function(d){
            return projection([d.lon, d.lat])[0];
        })
        .attr("cy", function(d){
            return projection([d.lon, d.lat])[1];
        })
})