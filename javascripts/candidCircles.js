function candidCircles(RankfollowersData,USCandids,width,height,margin){
  console.log("candidates data:",RankfollowersData);
    var CandidsGroup = USCandids.selectAll('.CandidsGroup')
        .data(RankfollowersData)

    var CandidsGroupEnter = CandidsGroup.enter()
      .append('g')
      .attr('class', 'CandidsGroup')
      .attr('transform', 'translate(' + margin.l + ',' +0 +')')
      .style('opacity', 1)

    //circle
    var circles=CandidsGroupEnter
      .append('g')
      .attr('class','circles')
      .attr("transform","translate("+0+","+(height*0.7)+")");
    circles
      .append('circle')
      .attr("class", function(d){ return d.fullname.toLowerCase().replace(" ", ""); })
      .attr('r', function(d) {return scaleR(d.followers);})
      .style('opacity', '.9');

    var def = CandidsGroupEnter
      .append("g")
      .attr("class","imageProfiles")
      .attr("transform","translate("+0+","+(height*0.25)+")");

    def.append("rect")
      .attr("id", "rect")
      .attr("x", -70)
      .attr("y", -70)
      .attr("width", "140")
      .attr("height", "140")
      .attr("rx", "140")
      .style('opacity',0);

    def.append("clipPath")
      .attr("id", "clip")
      .append("use")
      .attr("xlink:href","#rect");

    def.append("use")
      .attr("xlink:href", "#rect");

    //images
    def
        .append('image')
        .attr('xlink:href',function(d){return d.profilePicURL})
        .attr("clip-path", "url(#clip)")
        .attr("x", -70)
        .attr("y", -70)
        .attr("width", 140)
        .attr("height", 140)
        .style('opacity', '1');


    //text
    def
        .append('text')
        .attr('transform', 'translate(0,100)')
        .attr('class', 'CandidName')
        .style('text-anchor', 'middle')
        .style('fill', 'rgb(50,50,50)')
        .text(function(d) {
            return d.fullname})
        .style('opacity', 0)
        .transition().duration(1000)
        .style('opacity', 1);


    circles
        .append('text')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'CandidFollower')
        .style('text-anchor', 'middle')
        .style('fill', 'rgb(150,150,150)')
        .text(function(d) {
            return d.followers
        })
        .style('opacity', 0)
        .transition().duration(3000)
        .style('opacity', 1)


    var CandidsGroupExit = CandidsGroup.exit().transition().duration(800)
    CandidsGroupExit.remove()

    var CandidsGroupUpdate = CandidsGroupEnter
        .transition().duration(1600)
        //.style('opacity',1)
        .attr('transform', function(d, i) {
            //console.log(i*(width/7))
            return 'translate(' + (0 + i * (width / 7)) + ',' + 0 + ')';
        })

}
