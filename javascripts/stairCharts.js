var candidatesArray = ["Donald Trump", "Ted Cruz", "Marco Rubio", "John Kasich", "Ben Carson", "Hillary Clinton", "Bernie Sanders"];
var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function stairCharts(primaryDateWiseData, scaleX, scaleY, Width, Height, margin, USSeqVotes) {
    var svg = USSeqVotes;

    var staircaseG = svg.append("g").classed("staircase", true);

    var axisX = d3.svg.axis()
        .scale(scaleX)
        .orient("bottom")
        .tickValues(primaryDateWiseData[0].votes.map(function(d) { return d.date; }))
        .tickFormat(function(d) {
          return monthNames[d.getMonth()]+" "+d.getDate();
        })
    // console.log("dates", primaryDateWiseData[0].votes.map(function(d) { return d.date; }));
    svg.append("g")
        .attr("class", "x axis")
        .classed("candidatesXAxis", true)
        .attr("transform", "translate(0," + (Height - margin.b*2) + ")")
        .call(axisX);

    var staircase = d3.staircase()
        .scaleX(scaleX)
        .scaleY(scaleY);

    var tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    for (var i = 0; i < primaryDateWiseData.length; i++) {
        staircaseG
            .append('g')
            .classed(primaryDateWiseData[i].candidate.toLowerCase().replace(" ", ""), true)
            .style("opacity", 0)
            .datum(primaryDateWiseData[i].votes)
            .call(staircase);
    }

    var datePosX = primaryDateWiseData[0].votes.map(function(d) {
        return scaleX(d.date)
    });

    staircaseG.selectAll('g').selectAll('g')
        .on('mousemove', function(d) {
            var x = d3.mouse(this)[0] - d3.select("#data-viz").node().scrollLeft;
            var y = d3.mouse(this)[1];
            var date = scaleX.invert(x)
            var votes = parseInt(scaleY.invert(y))

            tooltip.transition().duration(200)
                .style("opacity", .9)
                .style("left", (x) + "px")
                .style("top", (d3.event.pageY - 30) + "px");
            tooltip.html("<span class='tip-candidate'>" + d[0].candidate + "</span><br/><span class='tip-date'>date: " + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + "</span><br/><span class='tip-votes'>votes: " + votes + "</span>")
                .style.textAlign = "left";
        })
        .on('mouseout', function(d) {
            tooltip.transition().duration(200).style("opacity", 0)
        })
  staircaseG
    .selectAll("g")
    .transition()
    .duration(1000)
    .delay(function(_, i) { return 500*i; })
    .style("opacity", 1);
}
