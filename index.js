var fs = require('fs');
var _ = require('lodash')
var parser = require('xml2json');

var majors = readBallparks()
var courses = readGolfCourses()

console.log("===========")
console.log("Total Majors: " + majors.length);
console.log("Total courses: " + courses.length);

writeResult(majors, courses)

console.log('done!')

function readBallparks () {
  var ballparks = JSON.parse(fs.readFileSync('./ballparks.geojson', 'utf8')).features
  return _.filter(ballparks, function(ballpark) {
    return ballpark.properties.League === 'Major League Baseball'
  })
}

function readGolfCourses() {
  var xml = fs.readFileSync('./Top100.kml', 'utf8')
  var courses = JSON.parse(parser.toJson(xml)).kml.Document.Folder.Placemark;

  return _.map(courses, courseToGEOJson);
}

function courseToGEOJson (course) {
  var coords = course.Point.coordinates.split(",")
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
      Lat: coords[1],
      Long: coords[0]
    }
  }
}

function writeResult(ballparks, courses) {
  var all = ballparks.concat(courses);

  var result = {
    name: "mashup",
    type: "FeatureCollection",
    feature: all,
  }

  fs.writeFileSync('mashup.geojson', JSON.stringify(result, null, 2), 'utf8')
}

