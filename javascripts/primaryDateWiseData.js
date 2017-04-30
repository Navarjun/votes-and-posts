
var candidatesArray = ["Donald Trump", "Ted Cruz", "Marco Rubio", "John Kasich", "Ben Carson", "Hillary Clinton", "Bernie Sanders"];

function primaryDateWiseData(primaryResults, primaryDates,Width,Height, margin){

//data processing
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
            return d.State; });
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
// console.log("candidatesArray",candidatesArray);
// console.log("doneDates",doneDates);
 // console.log("primaryDateWiseData",primaryDateWiseData);
return { "data":primaryDateWiseData };
}


function parseTimelineData(hillaryPosts, berniePosts, trumpPosts, cruzPosts, kasichPosts, rubioPosts, carsonPosts) {
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
  candidatesTimeline.push({candidate: hillaryPosts.user, fullname: "Hillary Clinton", timeline: nestFunction.entries(hillaryPosts.timeline)});
  candidatesTimeline.push({candidate: berniePosts.user, fullname: "Bernie Sanders", timeline: nestFunction.entries(berniePosts.timeline)});
  candidatesTimeline.push({candidate: trumpPosts.user, fullname: "Donald Trump", timeline: nestFunction.entries(trumpPosts.timeline)});
  candidatesTimeline.push({candidate: cruzPosts.user, fullname: "Ted Cruz", timeline: nestFunction.entries(cruzPosts.timeline)});
  candidatesTimeline.push({candidate: kasichPosts.user, fullname: "John Kasich", timeline: nestFunction.entries(kasichPosts.timeline)});
  candidatesTimeline.push({candidate: rubioPosts.user, fullname: "Marco Rubio", timeline: nestFunction.entries(rubioPosts.timeline)});
  candidatesTimeline.push({candidate: carsonPosts.user, fullname: "Ben Carson", timeline: nestFunction.entries(carsonPosts.timeline)});

  return candidatesTimeline;
}
