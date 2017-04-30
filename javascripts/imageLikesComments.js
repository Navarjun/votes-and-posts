var w = d3.select('.plot').node().clientWidth,
  h = d3.select('.plot').node().clientHeight;
var data = {}
d3.json('/imagesDataForUsername/hillaryclinton',dataLoaded);

function dataLoaded(err,response){
  data = response.data
  var timelineByInstagramImageId = response.data
  var xScale = d3.scale.linear().range([0, w]).domain([ new Date(2016, 2, 15), new Date() ])
  var yScale = d3.scale.linear().range([0, w]).domain([0, 25000])
  var axisX = d3.svg.axis()
      .orient('bottom')
      .scale(xScale)
      .ticks(d3.time.year)
  var plots = d3.select('.container').selectAll('.plot').attr('width', w).attr('height', w)
              .append('svg').attr('width', w).attr('height', w)

  for (index in timelineByInstagramImageId) {
    if (timelineByInstagramImageId[index].timeline.length < 2) continue;
    var plottingData = timelineByInstagramImageId[index].timeline.map(function(d) {
      return {
        likes: d.likes,
        comments: d.comments,
        dataAt: new Date(d.dataAt)
      }
    })
    var lineFunc = d3.svg.line()
                    .x(function(d) { return xScale(d.dataAt); })
                    .y(function(d) { return yScale(d.likes); })
                    .interpolate('basis');

    plots.append('g').attr('width', w).attr('height', w)
    .attr('transform','translate('+(-w)+','+0+')')
    .append('path')
    .attr('d', lineFunc(plottingData))
    .attr('stroke', 'rgba(0, 0, 0, '+ 0.2 +')')
    .attr('stroke-width', 2)
    .attr('fill', 'none');
  }
}
