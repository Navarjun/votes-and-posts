"use strict";

var parse = function (row) {
    return row;
};
var margin = {l: 25, r: 25, t: 10, b: 30};
var chartMargin = {l: 50, r: 50, t: 50, b: 50};

d3.select(".canvas0").attr("style", "height: "+window.innerHeight+"px;");

var width = d3.select(".canvas0").node().offsetWidth - margin.l - margin.r;
var height = d3.select(".canvas0").node().offsetHeight - margin.l - margin.r;

var chartWidth = width - chartMargin.l - chartMargin.r;
var chartHeight = height - chartMargin.t - chartMargin.b;

var svg = d3.select('.canvas0')
  .append('svg')
  .attr("style", "top: " + margin.t + "px;")
  .attr("width", width)
  .attr('height', height)
  .attr('class', ".canvas0SVG");

var parseDateCSV = function(d) {
  function parseDate(s) {
    var months = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,
                  jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
    var p = s.split(' ');
    return new Date(p[2], months[p[1].toLowerCase()], p[0]);
  }
  var data = {
      Date: parseDate(d.Date),
      State: d.State,
      Delegates: d.Delegates
    };
  return data;
}

d3_queue.queue()
  .defer(d3.csv, "/data/date.csv", parseDateCSV)
  .defer(d3.json, "http://localhost:3000/instagramPostsData/hillaryclinton")
  .defer(d3.json, "http://localhost:3000/instagramPostsData/berniesanders")
  .defer(d3.json, "http://localhost:3000/instagramPostsData/realdonaldtrump")
  .defer(d3.json, "http://localhost:3000/instagramPostsData/cruzforpresident")
  .defer(d3.json, "http://localhost:3000/instagramPostsData/johnkasich")
  .defer(d3.json, "http://localhost:3000/instagramPostsData/marcorubiofla")
  .defer(d3.json, "http://localhost:3000/instagramPostsData/realbencarson")
  .await(dataLoaded);

function dataLoaded(error, dates, hillaryPosts, berniePosts, trumpPosts, cruzPosts, kasichPosts, rubioPosts, carsonPosts) {
  var xDomain = new Set(dates.map(function(d) { return d.Date.getTime(); }));

  xDomain = Array.from(xDomain).map(function(d) { return new Date(d); }).filter(function(d) { return d < new Date(); });

  var candidatesTimeline = [];
  hillaryPosts = hillaryPosts.data;
  berniePosts = berniePosts.data;
  trumpPosts = trumpPosts.data;
  cruzPosts = cruzPosts.data;
  kasichPosts = kasichPosts.data;
  rubioPosts = rubioPosts.data;
  carsonPosts = carsonPosts.data;

  var dateFormingFunction = function(dateString) {
    var date = new Date(dateString);
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return date;
  };
  var nestFunction = d3.nest().key(function(d) { return dateFormingFunction(d.createdAt) }).sortKeys(d3.ascending);
  var date = new Date(2016, 1, 9);
  var filterFunction = function(d) {
    return dateFormingFunction(d.createdAt) > date;
  };

  // filering posts after 1 Feb 2016
  hillaryPosts.timeline = hillaryPosts.timeline.filter(filterFunction);
  berniePosts.timeline = berniePosts.timeline.filter(filterFunction);
  trumpPosts.timeline = trumpPosts.timeline.filter(filterFunction);
  cruzPosts.timeline = cruzPosts.timeline.filter(filterFunction);
  kasichPosts.timeline = kasichPosts.timeline.filter(filterFunction);
  rubioPosts.timeline = rubioPosts.timeline.filter(filterFunction);
  carsonPosts.timeline = carsonPosts.timeline.filter(filterFunction);

  // nesting the posts within their respective date
  candidatesTimeline.push({candidate: hillaryPosts.user, timeline: nestFunction.entries(hillaryPosts.timeline)});
  candidatesTimeline.push({candidate: berniePosts.user, timeline: nestFunction.entries(berniePosts.timeline)});
  candidatesTimeline.push({candidate: trumpPosts.user, timeline: nestFunction.entries(trumpPosts.timeline)});
  candidatesTimeline.push({candidate: cruzPosts.user, timeline: nestFunction.entries(cruzPosts.timeline)});
  candidatesTimeline.push({candidate: kasichPosts.user, timeline: nestFunction.entries(kasichPosts.timeline)});
  candidatesTimeline.push({candidate: rubioPosts.user, timeline: nestFunction.entries(rubioPosts.timeline)});
  candidatesTimeline.push({candidate: carsonPosts.user, timeline: nestFunction.entries(carsonPosts.timeline)});
  var candidates = ["Hillary Clinton", "Bernie Sanders", "Donald Trump", "Ted Cruz", "John Kasich", "Marco Rubio", "Ben Carson"];

  var scaleX = d3.time.scale()
    .domain([d3.min(xDomain), d3.max(xDomain)])
    .range([0, chartWidth]);
  var scaleY = d3.scale.ordinal()
    .domain(candidates)
    .rangePoints([0, chartHeight], 2);

  var axisX = d3.svg.axis()
    .scale(scaleX)
    .orient("top");
  svg.append("g")
    .attr("class", "x axis")
    .attr("stroke", "#888")
    .attr("fill", "#888")
    .classed("candidatesXAxis", true)
    .attr("transform", "translate("+chartMargin.l+","+(chartMargin.t)+")")
    .call(axisX);

  var axisY = d3.svg.axis()
    .scale(scaleY)
    .orient("left");
  svg.append("g")
    .attr("class", "y axis")
    .attr("stroke", "#888")
    .attr("fill", "#888")
    .classed("candidatesYAxis", true)
    .attr("transform", "translate("+chartMargin.l+","+chartMargin.t+")")
    .call(axisY)
    .selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", "-1em")
    .attr("dx", "-3em")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "start");

  var timelineCharts = svg.append("g")
    .classed("timelineCharts", true)
    .attr("transform", "translate("+chartMargin.l+","+chartMargin.t+")");
  var timeline = d3.timeline()
    .scaleX(scaleX)
    .valueX(function(d) {
      return new Date(d.key);
    })
    .valueY(function(d) {
      return d.values;
    })
    .dotSize(function(d) {
      return +d.likes/10000;
    });
  for (var i = 0; i < candidatesTimeline.length; i++) {
    timelineCharts.append("g")
      .classed(candidates[i].toLowerCase().replace(" ", ""), true)
      .attr("transform", "translate(0, "+scaleY(candidates[i])+")")
      .datum(candidatesTimeline[i].timeline)
      .call(timeline)
      .selectAll("circle")
      .on("click", function(d) {
        console.log("d", d);
      })
  }
}
