var map = L.map('map', {
    center: [18.9712, -72.2852], zoom: 8
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; Carto & OpenStreetMap',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

var myStyle = {
    "weight": 2,
    "opacity": 0.65
};

var geojsonLayer;

function onEachFeature(feature, layer) {
    if (feature.properties) {

        const name = feature.properties.NAME_1;
        layer.bindPopup(`<strong>${name}</strong>`);
        layer.on('click', () => {
            geojsonLayer.eachLayer(l => geojsonLayer.resetStyle(l));
            layer.setStyle({...myStyle, color: "red"});
            document.getElementById("location").innerHTML = name;
        });

    }
}


fetch('gadm41_HTI_1.json') //https://gadm.org/download_country.html level 1 of just deparments. Maybe do level 2
  .then(res => res.json())
  .then(geojson => {
    geojsonLayer = L.geoJSON(geojson, {
      style: myStyle,
      onEachFeature: onEachFeature
    }).addTo(map);
  }
)