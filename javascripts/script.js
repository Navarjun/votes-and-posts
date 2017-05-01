"use strict";
var margin = {
  l: 100,
  r: 100,
  t: 40,
  b: 10
}
// var baseURL = "https://na-instagram-data.appspot-preview.com/"
var baseURL = "https://www.navarjun.com/pres-election"

var width = d3.select(".canvas0").node().offsetWidth;
var height = d3.select(".canvas0").node().offsetHeight - margin.t - margin.b;

var Width = d3.select(".canvas").node().offsetWidth - margin.l - margin.r;
var Height = 700 - margin.t - margin.b;

var Width1 = Width;
var Width2 = Width / 3;

var dropoutsData = [
  {date: new Date("4 Mar 2016"), candidate: "Ben Carson", reason: "Lost previous primaries"},
  {date: new Date("15 Mar 2016"), candidate: "Marco Rubio", reason: "Lost Florida Primary"},
  {date: new Date("4 May 2016"), candidate: "John Kasich", reason: ""},
  {date: new Date("4 May 2016"), candidate: "Ted Cruz", reason: ""},
  {date: new Date("24 Jun 2016"), candidate: "Bernie Sanders", reason: ""},
  {date: new Date("8 Nov 2016"), "event": "Election Day", reason: ""}
];

var ElectionAxisY = d3.select('#ElectionMaps')
  .append('div')
  .style('z-index', 99)
  .style('width', ((Width+margin.l+margin.r)/12)+"px")
  .style('float', 'left')
  .append('svg')
  .attr('width', (Width+margin.l+margin.r)/12)
  .attr('height', (Height * 3))
var ElectionMaps = d3.select('#ElectionMaps')
  .append('div')
  .attr("id", "data-viz")
  .style('width', ((Width+margin.l+margin.r)*(10/12))+"px")
  .style('overflow', 'scroll')
  .style('float', 'left')
  .append('svg')
  .attr('width', ((Width+margin.l+margin.r)*(10/12)))
  .attr('height', (Height * 3)) // SVG's height is more than doubled(6/3 = 2) in order to include 2 charts

var linesG = ElectionMaps.append("g")
  .classed("linesG", true);

var USSeqVotes = ElectionMaps
  .append('g')
  .attr('class', 'USSeqVotes')
  .attr('width', Width1)
  .attr('height', Height)
  .attr("transform", 'translate(' + 0 + ',' + 0 + ')')

var eventsTimeline = ElectionMaps.append("g")
  .classed("eventsTimeline", true)
  .attr("transform", 'translate(' + 0 + ',' + (Height) + ')');;

var instagramPostsG = ElectionMaps
  .append("g")
  .classed("instagramPostsG", true)
  .attr("transform", 'translate(' + 0 + ',' + (Height * 1.5) + ')');

var USLegend = ElectionAxisY
  .append('g')
  .attr('class', 'USlengedY')
  .attr('width', Width)
  .attr('height', Height);

var USCandids = d3.select('#USCandids')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('class', '.USCandids')
  .attr("transform", 'translate(' + margin.l + ',' + margin.t + ')');

/*Scale for the size of the circles*/
var scaleR = d3.scale.sqrt().domain([0, 1364261]).range([1, 50]);

Date.daysBetween = function( date1, date2 ) {
  //Get 1 day in milliseconds
  var one_day=1000*60*60*24;

  // Convert both dates to milliseconds
  var date1_ms = date1.getTime();
  var date2_ms = date2.getTime();

  // Calculate the difference in milliseconds
  var difference_ms = date2_ms - date1_ms;

  // Convert back to days and return
  return Math.round(difference_ms/one_day);
}

/*generate the path generator*/
d3_queue.queue()
  .defer(d3.json, baseURL+"/recentFollowersData")
  .defer(d3.csv, "https://navarjun.github.io/votes-and-posts/data/primary_results.csv")
  .defer(d3.csv, "https://navarjun.github.io/votes-and-posts/data/date.csv", parseDates)
  .await(dataLoaded);

function parseDates(d) {
  d.date = new Date(d.Date);
  return d;
}

function dataLoaded(err, followersData, primaryResults, primaryDates) {
  //candidates data prepare
  var CrossfollowersData = crossfilter(followersData.data);
  var RankfollowersData = CrossfollowersData.dimension(function(d) {
      return d.username;
    }).top(Infinity);
  RankfollowersData.forEach(function changeNameImg(d) {
      if (d.username === "realdonaldtrump") {
        d["fullname"] = "Donald Trump";
        d.profilePicURL="https://navarjun.github.io/votes-and-posts/img/donald-trump.jpg";
      } else if (d.username === "realbencarson") {
        d["fullname"] = "Ben Carson";
        d.profilePicURL="https://navarjun.github.io/votes-and-posts/img/ben-carson.jpg";
      } else if (d.username === "marcorubiofla") {
        d["fullname"] = "Marco Rubio";
      } else if (d.username === "johnkasich") {
        d.profilePicURL="https://navarjun.github.io/votes-and-posts/img/john-kasich.jpg";
      } else if (d.username === "hillaryclinton") {
        d.profilePicURL="https://navarjun.github.io/votes-and-posts/img/hillary-clinton.jpg";
      }else if (d.username === "berniesanders") {
        d.profilePicURL="https://navarjun.github.io/votes-and-posts/img/bernie-sanders.jpg";
      }
    })
  //draw the circles of candiates
  candidCircles(RankfollowersData, USCandids, width, height,margin);

  //primaryDateWiseData
  var data = primaryDateWiseData(primaryResults, primaryDates, Width1, Height, margin).data;
  // console.log("data",data);
  var maxVotes = d3.max(
    data.map(function(d) {
      return d.votes.reduce(function(prev, curr) {
        return prev + curr.votes;
      }, 0);
    })
  );
  var doneDates = data[0].votes.map(function(d) {
    return d.date
  });
  doneDates.push(new Date(2016, 10, 8));

  Width1 = Date.daysBetween(d3.min(Array.from(doneDates)), new Date()) * 20;
  ElectionMaps.attr('width', Width1);
  var temp = new Date(2017, 1, 1);
  var scaleX = d3.time.scale.utc()
    .domain([new Date(d3.min(Array.from(doneDates))), temp])
    .range([margin.l, Width1 - margin.r + 15]);

  var scaleY = d3.scale.linear()
    .domain([0, maxVotes * 1.1])
    .range([Height - margin.b * 2, margin.b * 2]);

  //dashline
  linesG.selectAll("line")
    .data(doneDates)
    .enter()
    .append("line")
    .attr('x1',function(d) { return scaleX(d); })
    .attr('x2',function(d) { return scaleX(d); })
    .attr('y1',Height * 10-margin.b)
    .attr('y2',margin.b*2);

  var scaleTimelineY = d3.scale.ordinal()
    .rangePoints([0, Height*1.5], 1);
  timelineChart(primaryDates, scaleX, scaleTimelineY, instagramPostsG);

  //draw left graph
  stairCharts(data, scaleX, scaleY, Width, Height, margin, USSeqVotes);
  //draw middle legend
  var axisY = d3.svg.axis()
    .scale(scaleY)
    .orient("right")
    .tickFormat(function(d) {
      return d / 1000000 + "M";
    });

  // drawing the timeline
  eventsTimeline.append("rect")
    .attr("fill", "rgba(0,0,0,0.05)")
    .attr("width", Width1)
    .attr("height", Height/2);
  eventsTimeline.append("g").selectAll("circle")
    .data(dropoutsData)
    .enter()
    .append("circle")
    .attr("class", function(d) {
      return d.candidate ? d.candidate.toLowerCase().replace(" ", "") : "";
    })
    .attr("r", 5)
    .attr("cx", function(d) { return scaleX(d.date); })
    .attr("cy", Height/4);
  eventsTimeline.append("g").selectAll("text")
    .data(dropoutsData)
    .enter()
    .append("text")
    .html(function(d) {
        if (d.candidate) {
            return d.candidate+" dropped"
        } else {
            return d.event;
        }
    })
    .attr("class", function(d) {
        return d.candidate ? "eventsTimelineDetail "+d.candidate.toLowerCase().replace(" ", "") : "";
    })
    .attr("x", function(d) { return scaleX(d.date)-d3.select(this).node().getBBox().width/2; })
    .attr("y", function(d, i) {
      var factor = d3.select(this).node().getBBox().height;
      return i%2 ? Height/4 + factor : Height/4 - factor/2;
     });

  USLegend.append("g")
    .attr("class", "y axis")
    // .attr("transform", "translate(" + (scaleX.range()[1]+10) + "," + 0 + ")")
    .attr("fill", "#888")
    .call(axisY);

// console.log(new Date(2016, 5, 8));
//   var waitingG = ElectionMaps.append('g').classed('note', true).attr('transform', 'translate(50,'+scaleY(new Date(2016, 5, 8))+')');
//   waitingG.append('text')
//     .text("Let's wait for the real election results!")
}
