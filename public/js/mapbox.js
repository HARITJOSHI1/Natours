const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiaGFycnktYXJjIiwiYSI6ImNrcm5rbGE3dDIxcWoydm81dnQ3N2theWwifQ.eiZamoj0HYumU5GFG8Ae0Q';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/harry-arc/ckrnl3voq3ait17pdknymvdk3',
  scrollZoom: false
});

const bounds = new mapboxgl.LngLatBounds();
locations.forEach((loc) => {
  const el = document.createElement('div');
  el.className = 'marker';
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p> Day ${loc.day} : ${loc.description} </p>`).addTo(map);
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
