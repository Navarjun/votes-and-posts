"use strict";

// var parse = function(row) {return row;};

var margin = {l: 25,    r: 25,    t: 25,    b: 25};

var chartMargin = {    l: 50,    r: 50,    t: 50,    b: 50};

d3.select(".canvas").attr("style", "height: " + (window.innerHeight) + "px;");
var width = d3.select(".canvas").node().offsetWidth - margin.l - margin.r;
var height = d3.select(".canvas").node().offsetHeight - margin.t - margin.b;
var frame = {
    x: margin.l,
    y: margin.t,
    width: width - margin.l - margin.r,
    height: height - margin.t - margin.b
};
var chartFrame = {
    x: chartMargin.l,
    y: chartMargin.t,
    width: width - chartMargin.l - chartMargin.r,
    height: height - chartMargin.t - chartMargin.b
};

var candidatesArray = ["Donald Trump", "Ted Cruz", "Marco Rubio", "John Kasich", "Ben Carson", "Hillary Clinton", "Bernie Sanders"];

var svg = d3.select(".canvas")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("style", "background: #EEE; position: relative; top: " + margin.t + "px; left: " + margin.l + "px;");

d3_queue.queue()
    .defer(d3.csv, "/data/primary_results.csv")
    .defer(d3.csv, "/data/date.csv", parseDates)
    .await(dataLoaded);

function parseDates(d) {
    d.date = new Date(d.Date);
    return d;
}

function dataLoaded(err, primaryResults, primaryDates) {
    var staircaseG = svg.append("g").classed("staircase", true);

    var datesFilter = crossfilter(primaryDates);
    var dateDimension = datesFilter.dimension(function(d) {
            return d.date;
        })
        .filter(function(d) {
            return d < new Date();
        });
    var doneDates = new Set(dateDimension.top(Infinity).map(function(d) {
        return d.date.getTime();
    }));

    var resultsFilter = crossfilter(primaryResults);
    var candidatesDimension = resultsFilter.dimension(function(d) {
            return d.candidate;
        })
        .filter(function(d) {
            return candidatesArray.indexOf(d) != -1;
        });
    var statesFilter = resultsFilter.dimension(function(d) {
        return d.state;
    });

    var primaryDateWiseData = [];
    candidatesArray.forEach(function(candidate, i) {
        candidatesDimension.filter(function(c) {
            return c == candidate;
        })
        var dataObject = {
            candidate: candidate,
            votes: []
        }
        doneDates.forEach(function(d) {
            var date = new Date(d);
            //find states having election that date
            var statesArray = dateDimension.filter(d).top(Infinity).map(function(d) {
                return d.State;
            });
            //find result of the elections
            var statesData = statesFilter.filter(function(d) {
                return statesArray.indexOf(d) != -1;
            }).top(Infinity);
            //add to the
            dataObject.votes.push({
                states: statesArray,
                votes: statesData.reduce(function(p, d) {
                    return p + parseInt(d.votes);}, 0),
                date: date,
                candidate: candidate
            });
        });
        primaryDateWiseData.push(dataObject);
    })

    console.log("candidatesArray",candidatesArray);
    console.log("doneDates",doneDates);
    console.log("primaryDateWiseData",primaryDateWiseData);

    var maxVotes = d3.max(
        primaryDateWiseData.map(function(d) {
            return d.votes.reduce(function(prev, curr) {
                return prev + curr.votes;
            }, 0);
        })
    );
    // console.log(maxVotes);

    var scaleX = d3.time.scale.utc()
        .domain([new Date(d3.min(Array.from(doneDates))), new Date(d3.max(Array.from(doneDates)))])
        .range([chartFrame.x, chartFrame.width + chartFrame.x]);
    var axisX = d3.svg.axis()
        .scale(scaleX)
        .orient("bottom");

    svg.append("g")
        .attr("class", "x axis")
        .attr("stroke", "#888")
        .attr("fill", "#888")
        .attr("transform", "translate(" + 0 + "," + (chartFrame.height + chartFrame.y) + ")")
        .call(axisX);

    var scaleY = d3.scale.linear()
        .domain([0, maxVotes])
        .range([chartFrame.height + chartFrame.y, chartFrame.y]);
    var axisY = d3.svg.axis()
        .scale(scaleY)
        .orient("left")
        .tickFormat(function(d) {
            return d / 1000000 + "M";
        })
    svg.append("g")
        .attr("class", "y axis")
        .attr("stroke", "#888")
        .attr("fill", "#888")
        .attr("transform", "translate(" + chartFrame.x + "," + 0 + ")")
        .call(axisY);

    var staircase = d3.staircase()
        .scaleX(scaleX)
        .scaleY(scaleY);

    for (var i = 0; i < primaryDateWiseData.length; i++) {
    // for (var i in primaryDateWiseData) {
        staircaseG
            .datum(primaryDateWiseData[i].votes)
            .call(staircase);
    }

}
