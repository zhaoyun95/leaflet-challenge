// // base url to get GeoJSON data from usgs.gov
// var baseUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson";

// // parameters for the query
// var starttime = "&starttime=2020-05-01"
// var endtime = "&endtime=2020-5-31"
// var minmagnitude = "&minmagnitude=4"

// // complete query url
// var url = baseUrl + starttime + endtime + minmagnitude;

// check Day 1 Activity-10 for GeioData example


// -------------- sample map with marker -------------------
// // var map = L.map('map').setView([51.505, -0.09], 13);
// var map = L.map('map').setView([51.505, -0.09], 5);;

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

// L.marker([51.5, -0.09]).addTo(map)
//     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
//     .openPopup();

// earthquake data for the last 7 days
// var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// past day
// var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

// earthquake data for last hour;
// fast loading for debug
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"

console.log("url");

// Perform a GET request to the url
// GeoJSON example https://leafletjs.com/examples/geojson/
d3.json(url).then(function(data){
    console.log(data);
    createFeatures(data.features);
});


function getColor(d) {
    return d > 5  ? 'rgb(250,   0, 0)' :
           d > 4  ? 'rgb(250,  75, 0)' :
           d > 3  ? 'rgb(250, 125, 0)' :
           d > 2  ? 'rgb(250, 185, 0)' :
           d > 1  ? 'rgb(250, 250, 0)' :
                    'rgb(  0, 250, 0)';
}

function createFeatures(earthquakeData) {

    

    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p><p>magnitude: " +
        feature.properties.mag + "</p>");
    }

    function createMarkerOptions(feature) {
        var magnitude = feature.properties.mag;

        var geojsonMarkerOptions = {
            radius: magnitude * 5,
            fillColor: getColor(magnitude),
            color: "#0000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }

        return geojsonMarkerOptions;
    }

    // see Day 1 Activity 7 for circle marker with different color
    function createCircleMarker(feature, latLng) {
        return L.circleMarker(latLng, createMarkerOptions(feature));
    }

    // Create a GeoJSON layer containing the features array
    // Run the onEachFeature function once for each feature
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });

    createMap(earthquakes);
}



function createMap(earthquakes) {
    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });




    // Define a baseMaps object to hold our base layers
    // this is submenu with two choices
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    // this is another menu choice
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        // stretmap: L.tileLayer layer
        // earthquakes: L.GeoJSON layer
        // these are the active layers
        layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    // This is the control menu on the upper right corner
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // see Day 2 Activity 4 for legend
    // also see legend example https://leafletjs.com/examples/choropleth/
    // Set up legend
    var legend = L.control({position: "bottomright"});
  
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"),
            magnitudes = [0,1,2,3,4,5],
            labels = [];
    
        // loop through manitudes and generate a label with a colored square for each internal
        // need css in style.css to show the colored squares
        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' +
                magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
        }

        return div;
    };
    
      // Adding legend to the map
    legend.addTo(myMap);


      // tectonicplates (bonus)
      // add the Fault Lines layer
      // see Day 2 Activity 1 last example (logic4.js)

    // var platesFile = "static/data/PB2002_plates.json";
    // d3.json(platesFile).then(function(platesData){
    //     console.log("plates");
    //     console.log(platesData);

    //     L.geoJSON(platesData, {

    //         style: function(feature) {
    //             return {
    //                 color: "yellow",
    //                 fillColor: "purple",
    //                 fillOpacity: 0.1,
    //                 weight: 3
    //             };
    //         },

    //         // Called on each feature
    //         onEachFeature: function(feature, layer) {
    //             layer.on({
    //                 mouseover: function(event) {
    //                     layer = event.target;
    //                     layer.setStyle({
    //                         fillOpacity: 0.2
    //                     });
    //                 },

    //                 mouseout: function(event) {
    //                     layer = event.target;
    //                     layer.setStyle({
    //                         fillOpacity: 0.1
    //                     })
    //                 },

    //                 click: function(event) {
    //                     myMap.fitBounds(event.target.getBounds());
    //                 }
    //             })
    //         }

    //     }).addTo(myMap);
    // });

    var stepsFile = "static/data/PB2002_steps.json";
    d3.json(stepsFile).then(function(stepsData){
        console.log("steps");
        console.log(stepsData);
    });

    var boundariesFile = "static/data/PB2002_plates.json";
    d3.json(boundariesFile).then(function(boundariesData){
        console.log("boundaries");
        console.log(boundariesData);
        L.geoJSON(boundariesData, {

            style: function(feature) {
                return {
                    color: "yellow",
                    fillColor: "purple",
                    fillOpacity: 0.1,

                    weight: 3
                };
            },

            // Called on each feature
            onEachFeature: function(feature, layer) {
                layer.on({
                    mouseover: function(event) {
                        layer = event.target;
                        layer.setStyle({
                            fillOpacity: 0.2
                        });
                    },

                    mouseout: function(event) {
                        layer = event.target;
                        layer.setStyle({
                            fillOpacity: 0.1
                        })
                    },

                    click: function(event) {
                        myMap.fitBounds(event.target.getBounds());
                    }
                })
            }

        }).addTo(myMap);
        
    });

    var orogensFile = "static/data/PB2002_plates.json";
    d3.json(orogensFile).then(function(orogensData){
        console.log("orogens");
        console.log(orogensData);
    });
   
}



