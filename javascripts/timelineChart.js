"use strict";
var parseDateCSV = function(d) {
  function parseDate(s) {
    var months = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11
    };
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

var timelineData = {};

function timelineChart(dates, scaleX, scaleY, instagramPostsG) {
  timelineData.dates = dates.map(parseDateCSV);
  timelineData.chartG = instagramPostsG;
  timelineData.scaleX = scaleX;
  timelineData.scaleY = scaleY;

  d3_queue.queue()
    .defer(d3.json, baseURL+"/instagramPostsData/hillaryclinton")
    .defer(d3.json, baseURL+"/instagramPostsData/berniesanders")
    .defer(d3.json, baseURL+"/instagramPostsData/realdonaldtrump")
    .defer(d3.json, baseURL+"/instagramPostsData/cruzforpresident")
    .defer(d3.json, baseURL+"/instagramPostsData/johnkasich")
    .defer(d3.json, baseURL+"/instagramPostsData/marcorubiofla")
    .defer(d3.json, baseURL+"/instagramPostsData/realbencarson")
    .await(postsDataLoaded);
}

function postsDataLoaded(error, hillaryPosts, berniePosts, trumpPosts, cruzPosts, kasichPosts, rubioPosts, carsonPosts) {
  var xDomain = new Set(timelineData.dates.map(function(d) {
    return d.Date.getTime();
  }));

  xDomain = Array.from(xDomain).map(function(d) {
    return new Date(d);
  }).filter(function(d) {
    return d < new Date();
  });

  var candidatesTimeline = parseTimelineData(hillaryPosts, berniePosts, trumpPosts, cruzPosts, kasichPosts, rubioPosts, carsonPosts)
  var candidates = candidatesTimeline.map(function(d) {
    return d.fullname;
  });

  var scaleX = timelineData.scaleX;
  var scaleY = timelineData.scaleY.domain(candidates);
  var axisY = d3.svg.axis()
    .scale(scaleY)
    .orient("right");
  ElectionAxisY.append("g")
    .attr("class", "y axis")
    .attr("stroke", "#888")
    .attr("fill", "#888")
    .classed("candidatesYAxis", true)
    .attr("transform", "translate(0," + (Height * 1.5) + ")")
    .call(axisY)
    .selectAll("text")
    .style("text-anchor", "start");

  var timelineCharts = timelineData.chartG.append("g")
    .classed("timelineCharts", true);
  var timeline = d3.timeline()
    .scaleX(scaleX)
    .valueX(function(d) {
      return new Date(d.key);
    })
    .valueY(function(d) {
      return d.values;
    })
    .dotSize(function(d) {
      return +d.likes / 7000;
    })
    .ySpacing(10);

  var tooltip = d3.select(".timeline-tootip");
  // for (var i = 0; i < candidatesTimeline.length; i++) {
    // var y = scaleY(candidates[i]);
    // console.log("candidates", candidatesTimeline);
    var gS = timelineCharts
      .selectAll("g")
      .data(candidatesTimeline)
      .enter()
      .append("g")
      .style("opacity", 0);
    gS.attr("class", function(d) { return d.fullname.toLowerCase().replace(" ", ""); })
      .attr("candidateName", function(d) { return d.fullname; })
      .attr("transform", function(d) { return "translate(0, " + scaleY(d.fullname) + ")";})
      .datum(function(d) { return d.timeline; })
      .call(timeline)
      .selectAll("circle")
      .on("click", function(d) {
        // console.log(d);
        timelineCharts.selectAll("circle")
          .classed("highlightCircle", false);
        var win = window.open("http://instagram.com/p/"+d.imageCode+"/", '_blank');
        win.focus();
        // if (tooltip.attr("instagramImageId") == d.instagramImageId) {
        //   tooltip.html("")
        //     .attr("instagramImageId", null)
        //     .style("display", "none");
        //     return;
        // }
        // d3.select(this)
        //   .classed("highlightCircle", true)
        //   .attr();
        // var x = d3.select(this.parentNode).attr("transform");
        // x = +x.substring(x.indexOf("(")+1, x.indexOf(",")) + 20;
        //   var candidateName = d3.select(this.parentElement.parentElement.parentElement).attr("candidateName");
        //   tooltip.html("<iframe src='http://instagram.com/p/"+d.imageCode+"/'></iframe>")
        //     .attr("instagramImageId", d.instagramImageId)
        //     .style("top", scaleY(candidateName)+"px")
        //     .style("left", x+"px")
        //     .style("display", "block")
        //     .style("opacity", 1);
        // });
      })
  // }
  gS.transition()
  .duration(1000)
  .delay(function(_, i) { return 500*i; })
  .style("opacity", 1);
}
