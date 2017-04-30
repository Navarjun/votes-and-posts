d3.timeline = function() {
  var _scaleX = d3.time.scale.utc().domain([0, 10]).range([0, 10]);
  var _valueX = function(d) {
    return d;
  };
  var _valueY = function(d) {
    return d;
  };
  var _ySpacing = 10;
  var _dotSize = function(d) {
    return d;
  };

  function exports(_selection) {
    _selection.each(draw);
  }

  function draw(data) {
    var currSelection = d3.select(this);

    currSelection.append("line")
      .attr("x1", _scaleX.range()[0])
      .attr("y1", 0)
      .attr("x2", _scaleX.range()[1])
      .attr("y2", 0);

    currSelection.append("g")
      .classed("circlesTimeline", true)
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .classed("circlesGroup", true)
      .attr("transform", function(d) {
        return "translate("+_scaleX(_valueX(d))+", 0)";
       })
      .selectAll("circle")
      .data(function(d) { return _valueY(d); })
      .enter()
      .append("circle")
      .attr("cx", 0)
      .attr("cy", function(_, i) { return -i*_ySpacing; })
      .attr("r", function(d){ return _dotSize(d); })
  }

  exports.scaleX = function(newValue) {
    if (!newValue) {
      return _scaleX;
    }
    _scaleX = newValue;
    return exports;
  };

  exports.ySpacing = function(newValue) {
    if (!newValue) {
      return _ySpacing;
    }
    _ySpacing = newValue;
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

  exports.dotSize = function(newValue) {
    if (!newValue) {
      return _dotSize;
    }
    _dotSize = newValue;
    return exports;
  }

  return exports;
}
