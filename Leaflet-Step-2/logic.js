// Streetmap Layer
let outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: API_KEY
});
// Darkmap Layer
let darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.dark",
  accessToken: API_KEY
});

//satellite
let satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

//2020-01-01 to 2020-01-07 info
let url = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2020-01-01&endtime=" +
  "2020-01-07&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

function colorPicker(magnitude){
  let result = 'greenyellow';

  if (magnitude >5) {
    result = 'red';
  } 
  else if (magnitude >4) {
    result = 'darkorange'
  }
  else if (magnitude >3) {
    result = 'orange'
  }
  else if (magnitude >2) {
    result = 'gold'
  }
  else if (magnitude >1) {
    result = 'yellowgreen'
  }
      
  return result;
};

d3.json(url, function(response) {
  let earthquake = response.features;
  let markers = [];
  
  earthquake.forEach(report => {
    const magnitude = report.properties.mag;
    const location = report.geometry;
    if (magnitude){
      markers.push(
        L.circle([location.coordinates[1], location.coordinates[0]],{
          fillOpacity: 0.75,
          color: "white",
          weight:1,
          fillColor: colorPicker(magnitude),
          radius: magnitude*100000
      }).bindPopup(`<h2>${report.properties.place}</h2><hr /><h3>Time: ${report.properties.time}<br />Magnitude: ${magnitude}</h3>`)
      );
    }; 
  });

  const path = "boundary.json";
  d3.json(path, function(response){
    // console.log(response); 
    let lineCord = [];
    let plate = response.features;
    let lines = [];
  
    plate.forEach(report => {
      const boundaryCor = report.geometry.coordinates;
      if (boundaryCor){
        boundaryCor.forEach(coordi => {
          lineCord.push([coordi[1],coordi[0]]);
        })
      let line = L.polyline(lineCord,{
          color: "orange",
          weight:2
        });
      lines.push(line);
      lineCord = [];
      }; 
    });

    let earthquakes = L.layerGroup(markers);
    let boundary = L.layerGroup(lines);

    let baseMaps = {
      "Satellite":satellitemap,
      "Outdoors": outdoormap,
      "Grayscale": darkmap
    };

    let overlayMaps = {
      "Fault Lines": boundary,
      "Earthquakes": earthquakes
    };

    const myMap = L.map("map", {
      center: [34.0522, -118.2437],
      zoom: 1.5,
      layers: [satellitemap, earthquakes,boundary]
    });


    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    let legend = L.control({position: "bottomright"});
    legend.onAdd = function(){
      let div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1, 2, 3, 4, 5];
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colorPicker(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
    return div;
  };
  legend.addTo(myMap);
  });
});



 