var fs = require('fs');
var _ = require('lodash')
var parser = require('xml2json');

var ballparks = readBallparks();
var majors = filterMajors(ballparks);
var tripleA = filterTripleA(ballparks);
var courses = readGolfCourses();

console.log("===========")
console.log("Total Majors: " + majors.length);
console.log("Total TripleA: " + tripleA.length);
console.log("Total courses: " + courses.length);

tripleA = _.map(tripleA, function(park) {
  var updated = Object.assign(park);
  _.set(park, 'properties.marker-color', '#9F0000')
  return updated
})

writeResult(majors, tripleA, courses)

console.log('done!')

function readBallparks() {
  return JSON.parse(fs.readFileSync('./ballparks.geojson', 'utf8')).features
}

function filterMajors(ballparks) {
  return _.filter(ballparks, function(ballpark) {
    return ballpark.properties.League === 'Major League Baseball'
  })
}

function filterTripleA(ballparks) {
  return _.filter(ballparks, function(ballpark) {
    return ballpark.properties.Class === 'Triple-A'
  })
}

function readGolfCourses() {
  var xml = fs.readFileSync('./Top100.kml', 'utf8')
  var courses = JSON.parse(parser.toJson(xml)).kml.Document.Folder.Placemark;

  return _.map(courses, courseToGEOJson);
}

function courseToGEOJson (course) {
  var coords = _.map(course.Point.coordinates.split(","), parseFloat)
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: _.take(coords, 2),
    },
    properties: {
      Class: "Golf",
      Rank: course.name.split('.')[0],
      Name: course.name,
      descripton: course.description,
      Lat: coords[1],
      Long: coords[0],
      "marker-color": "#007f00"
    }
  }
}

function writeResult(ballparks, tripleA, courses) {
  var all = ballparks.concat(courses).concat(tripleA);

  var result = {
    name: "mashup",
    type: "FeatureCollection",
    features: all,
  }

  fs.writeFileSync('mashup.geojson', JSON.stringify(result, null, 2), 'utf8')
}

