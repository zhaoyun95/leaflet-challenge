// earthquake data for last day;
// var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

// earthquake data for last hour;
//var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

// earthquake data for the last 7 days
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
console.log(url);

// plate boundaries
var boundariesFile = "static/data/PB2002_plates.json";
console.log(boundariesFile);

// d3 Promises
var promises = [];
promises.push(d3.json(url));
promises.push(d3.json(boundariesFile));

// d3 Promises, reject if one of the promises failed
Promise.all(promises).then(function (values){
    console.log(values);
    var earthquakeData = values[0];
    var boundariesData = values[1];
    createFeatures(earthquakeData, boundariesData);
}).catch(function(error) {
    console.log(error);
});


// return a color for the Legend
function getColor(d) {
    return d > 5  ? 'rgb(250,   0, 0)' :
           d > 4  ? 'rgb(250,  75, 0)' :
           d > 3  ? 'rgb(250, 125, 0)' :
           d > 2  ? 'rgb(250, 185, 0)' :
           d > 1  ? 'rgb(250, 250, 0)' :
                    'rgb(  0, 250, 0)';
}

// create earthquake circles and fault line.
function createFeatures(earthquakeData, boundariesData) {

    function createPopups(feature, layer) {
        layer.bindPopup("<div>Magnitude: " + feature.properties.mag +
         "</div><hr><div>" + new Date(feature.properties.time) + "</div><div>" +
         feature.properties.place + "</div>");
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
        onEachFeature: createPopups,
        pointToLayer: createCircleMarker
    });

    // tectonicplates (bonus)
    // add the Fault Lines layer
    // see Day 2 Activity 1 last example (logic4.js)
    // see explaination of each json file 
    // https://github.com/fraxen/tectonicplates/tree/master/original
    var faultLines = L.geoJSON(boundariesData, {

        style: function(feature) {
            return {
                color: "cyan",
                fillColor: "blue",
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

    });

    createMap(earthquakes, faultLines);
}


// create the map with base map layers, and earthquake circles, fault lines, overlay menu, and legend
function createMap(earthquakes, faultLines) {
    // Define 5 tileLayers with different styles
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "streets-v11",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        // id: "light-v10",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "satellite-streets-v11",
        accessToken: API_KEY
    });

    var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "outdoors-v11",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    // this is submenu with two choices
    var baseMaps = {
        "Satellite": satellite,
        "Grayscale": grayscale,
        "Outdoors": outdoors,
        "Light": streetmap,
        "Dark": darkmap
    };

    // Create overlay object to hold our overlay layer
    // this is another menu choice
    var overlayMaps = {
        "FaultLines": faultLines,
        "Earthquakes": earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        // satellite: L.tileLayer layer
        // faultLines, earthquakes: L.GeoJSON layer
        // these are the active layers
        layers: [satellite, faultLines, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    // This is the control menu on the upper right corner
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
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
        for (var i = magnitudes.length -1; i >= 0; i--) {
            div.innerHTML +=
                '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> <span>' +
                magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '</span><br>' : '+</span><br>');
        }

        return div;
    };

    // Adding legend to the map
    legend.addTo(myMap);
}



