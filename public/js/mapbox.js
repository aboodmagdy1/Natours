
export const displayMap =(locations)=>{

  mapboxgl.accessToken='pk.eyJ1IjoiYWJvb2RtYWdkeTAiLCJhIjoiY2xrbGNhMWs5MGh4MjNqbDkwMmJiaHF5ZyJ9.Q4L3gQQZ6xvoxzUpCb88jg'

var map = new mapboxgl.Map({
  container:'map',
  style:'mapbox://styles/mapbox/streets-v11',
  scrollZoom:false
  
})

const bounds = new mapboxgl.LngLatBounds();
locations.forEach(loc=>{
  //create a marker
  const el = document.createElement('div')
  el.className = 'marker'

  // add marker
  new mapboxgl.Marker({
    element:el,
    anchor:'bottom'

    //set lng lat from the  coordinates array
  }).setLngLat(loc.coordinates).addTo(map)

  //Add popup 
  new mapboxgl.Popup({
    offset:30
  }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}:${loc.description}</p>`).addTo(map)

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates)
})

map.fitBounds(bounds,{
  padding:{
    top:200,
    bottom:150,
    left:100,
    right:100
  }
})
}
