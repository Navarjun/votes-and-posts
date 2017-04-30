//right bar chart
let votesBarChart = function(canvasG,primaryDateWiseData,scaleY,Width,Height, margin) {

        xAxis = "candidate",
        yAxis = "votes",
        // console.log("primaryDateWiseData",primaryDateWiseData);

        xAxisDomain =primaryDateWiseData.map(function(d){return d.candidate});
        // console.log("x",xAxisDomain);

        var accumulateVotes=primaryDateWiseData.map(function(d){
            return {
                candidate: d.candidate,
                totalVotes: d.votes.reduce(function(p,c){return p+c.votes}, 0)
            }
        })//0 is the starting value
        // console.log("accumu value",accumulateVotes);
    var histoData=d3.layout.histogram()
            (accumulateVotes)

    var scaleX = d3.scale.ordinal()
        .domain(xAxisDomain)
        .rangePoints([margin.l*2, Width-margin.r*2]);
    var axisX = d3.svg.axis()
        .scale(scaleX)
        .orient("bottom")

    var canvasG1=canvasG
        .append('g')
        .attr("transform", "translate("+Width*2+",0)")

    canvasG1.append("g")
        .classed("candidatesXAxis", true)

    var bar=canvasG1
        .selectAll(".bar")
        .data(accumulateVotes)
        .enter().append("g")
        .attr("class","bar")
    bar
        .append('g')
        .append('rect')
        .attr("class", function(d){ return d.candidate.toLowerCase().replace(" ", ""); })
        .attr("x", function(d) { return scaleX(d.candidate); })
        .attr("width", 10)
        .attr("y", function(d) { return scaleY(d.totalVotes); })
        .attr("height", function(d) { return Height -margin.b*2 - scaleY(d.totalVotes);})

    bar
        .append('g')
        .append("text")
        .attr("transform", "translate("+(-margin.b*2)+",0)")
        .attr("x", function(d) { return scaleX(d.candidate); })
        .attr("y", function(d) { return scaleY(d.totalVotes)-10;})
        .style("text-anchor", "left")
        .style("font-size","0.7em")
        .text(function(d){return d.candidate});

};
