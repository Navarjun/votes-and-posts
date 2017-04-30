"use strict";

function dataLoadedRace(canvasG2,rows,Width,Height,margin) {
    // console.log("rows1",rows);
    var chartWidth = Width - margin.l - margin.r;
    var chartHeight = Height - margin.t - margin.b;

    var candidatesSet = new Set(rows.map(function(d) {
        return d.candidate
    }));
    var statesSet = new Set(rows.map(function(d) {
        return d.state;
    }));
    var scaleX = d3.scale.ordinal()
        .domain(Array.from(statesSet))
        .rangeBands([0, chartWidth]);

    var filter = crossfilter(rows);
    var candidateDimension = filter.dimension(function(d) {
        return d.candidate;
    });
    var stateDimension = filter.dimension(function(d) {
        return d.state
    });
    var candidateCommulativeVotesData = [];
    candidatesSet.forEach(function(candidate) {
        var commulativeVotes = 0
        statesSet.forEach(function(state) {
            candidateDimension.filter(candidate);
            stateDimension.filter(state);
            var votes = stateDimension.top(Infinity).reduce(function(p, d) {
                return p + parseInt(d.votes)
            }, 0);
            commulativeVotes += votes;
        });
        var dataObject = {
            candidate: candidate,
            votes: commulativeVotes
        };
        candidateCommulativeVotesData.push(dataObject);
    });
    var yDomain = d3.max(candidateCommulativeVotesData.map(function(d) {
        return d.votes;
    }));

    var scaleY = d3.scale.linear()
        .domain([0, yDomain])
        .range([chartHeight, 0]);

    candidatesSet.forEach(function(x) {
        drawSteppedLine(rows, x, statesSet, scaleX, scaleY, margin, canvasG2,chartWidth,chartHeight);
    });
    return scaleY;
};


function drawSteppedLine(rows, candidate, statesSet, scaleX, scaleY, chartMargin,canvas,chartWidth,chartHeight) {
    var filter = crossfilter(rows);
    var candidateDimension = filter.dimension(function(d) {
        return d.candidate;
    });
    var stateDimension = filter.dimension(function(d) {
        return d.state
    });
    candidateDimension.filter(candidate);

    var candidateData = candidateDimension.top(Infinity);
    var candidateStateData = [];

    var commulativeVotes = 0;
    statesSet.forEach(function(state) {
        stateDimension.filter(state);
        var votes = stateDimension.top(Infinity).reduce(function(p, d) {
            return p + parseInt(d.votes);
        }, 0);
        commulativeVotes += votes;
        var dataObject = {
            candidate: candidate,
            votes: commulativeVotes,
            state: state
        };
        candidateStateData.push(dataObject);
    });

    var stateAbbrevationDict = rows.reduce(function(p, d) { p[d["state"]] = d["state_abbreviation"]; return p; }, {});
    var axisX = d3.svg.axis()
         .scale(scaleX)
         .orient("bottom")
         .tickFormat(function(d) { return stateAbbrevationDict[d]; });
     canvas.append("g")
         .attr("class", "x axis")
         .attr("stroke", "#888")
         .attr("fill", "#888")
         .classed("candidatesXAxis", true)
         .attr("transform", "translate("+margin.l+","+(Height+margin.t)+")")
         .call(axisX);

     var axisY = d3.svg.axis()
         .scale(scaleY)
         .orient("left")
         .tickFormat(function(d) { return d/1000000+"M"; })
     canvas.append("g")
         .attr("class", "y axis")
         .classed("candidatesYAxis", true)
         .attr("stroke", "#888")
         .attr("fill", "#888")
         .attr("transform", "translate("+margin.l+","+(margin.t)+")")
         .call(axisY);

    var path = "";
    var prevX = 0;
    // console.log(candidateStateData);
    for (var i in candidateStateData) {
        var x = scaleX(candidateStateData[i].state);
        var y = scaleY(candidateStateData[i].votes);
        // console.log("x: " + candidateStateData[i].state, x);
        if (i == 0) {
            path += "M " + prevX + " " + y;
        } else {
            path += "L " + prevX + " " + y;
        }
        path += "L " + x + " " + y + " ";
        prevX = x;
    }
// console.log("here",candidateStateData)
    canvas.append("g")
        .classed("accumulatedVotes", true)
        .attr("transform", "translate(" + chartMargin.l + "," + chartMargin.t + ")")
        .append("path")
        .attr("d", path)
        .classed(candidateStateData[0].candidate.toLowerCase().replace(" ", ""),true)
        // console.log('candid data',candidateStateData)[0];

}
