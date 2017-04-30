d3.staircase = function() {
  var _scaleX = d3.time.scale.utc().domain([0, 10]).range([0, 10]);
  var _scaleY = d3.scale.linear().domain([0, 10]).range([0, 10]);
  var _valueX = function(d) {
    return d.date;
  };
  var _valueY = function(d) {
    return d.votes;
  };

  function exports(_selection) {
    _selection.each(draw);
  }

  function draw(data) {
    data.sort(function(a, b){
      return _valueX(a)-_valueX(b);
    });

    var commValue = 0; // commulative value
    var chartData = [];
    data.forEach(function(a) {
      if (_valueY(a) == 0) {
        return;
    }
      commValue += _valueY(a);
      chartData.push({ x: _valueX(a), y: commValue});
    });
// console.log("commValue",commValue)
    var lineGenerator = d3.svg.line()
      .x(function(d) { return _scaleX(d.x); })
      .y(function(d) { return _scaleY(d.y); })
      .interpolate("step-before");
    var pathG = d3.select(this).append("g")
      .classed("steps", true)
    //   console.log(chartData);
    pathG.append("path")
      .datum(chartData)
      .attr("d", lineGenerator)
  }

  exports.scaleX = function(newValue) {
    if (!newValue) {
      return _scaleX;
    }
    _scaleX = newValue;
    return exports;
  };

  exports.scaleY = function(newValue) {
    if (!newValue) {
      return _scaleY;
    }
    _scaleY = newValue;
    return exports;
  };

  exports.valueX = function(newValue) {
    if (!newValue) {
      return _valueX;
    }
    _valueX = newValue;
    return exports;
  };

  exports.valueY = function(newValue) {
    if (!newValue) {
      return _valueY;
    }
    _valueY = newValue;
    return exports;
  };

  return exports;
}
