            var map;
            // Array of markers
            var markers = [];

            function initMap() {
                //Create a new map
                map = new google.maps.Map(document.getElementById('map'), {
                    center: {lat: 25.3724513, lng: 49.55347},
                    zoom: 13
                });
/*                var heritage = {lat: 25.3866036, lng: 49.5531266}
                var marker = new google.maps.Marker({
                    position: heritage,
                    map: map,
                    title: 'First Marker!'
                });
                var infowindow = new google.maps.InfoWindow({
                    content: 'Do you ever feel like an infoWindow, Floating through the wind,' + ' ready to start again?'
                });
                marker.addListener('click', function() {
                    infowindow.open(map, marker);
                });
            }*/
            var locations = [
            {title: 'Heritage Village', location: {lat: 25.3866036, lng: 49.5531266}},
            {title: 'Alahsa Hospital', location: {lat: 25.3861626, lng: 49.571076}},
            {title: 'Alahsa Intercontinental', location: {lat: 25.3879307, lng: 49.580973}},
            {title: 'Hofuf Railway Station', location: {lat: 25.3866682, lng: 49.56829}}
            ];

            //var infowindow = new google.maps.InfoWindow();
            var largeInfowindow = new google.maps.InfoWindow();
            //var bounds = new google.maps.LatLngBounds();

            for (var i = 0; i < locations.length; i++){
                // get the position from the array
                var position = locations[i].location;
                var title = locations[i].title;
                //create a marker per location
                var marker = new google.maps.Marker({
                    //map: map,
                    position: position,
                    title: title,
                    animation: google.maps.Animation.DROP,
                    id: i,
                    icon: "images/marker0.png"
                });
                // push the marker to the markers array
                markers.push(marker);
                // extend boundaries for each marker
                //bounds.extend(marker.position);
                // create onclick event
                marker.addListener('click', function() {
                    populateInfoWindow(this, largeInfowindow);
                });

                marker.addListener('mouseover', function() {
                    this.setIcon("images/marker1.png");
                });
                marker.addListener('mouseout', function() {
                this.setIcon("images/marker0.png");
        });
            }
            //map.fitBounds(bounds);

            document.getElementById('show-listings').addEventListener('click', showListings);
            document.getElementById('hide-listings').addEventListener('click', hideListings);
}
            function populateInfoWindow(marker, infowindow) {
                // check if the window is not already open
                if (infowindow.marker != marker) {
                    infowindow.setContent('');
                    infowindow.marker = marker;
                    //infowindow.setContent('<div>' + marker.title + '</div>');
                    //infowindow.open(map, marker);

                    infowindow.addListener('closeclick', function(){
                        //infowindowsetMarker(null);
                        infowindow.marker = null;
                    });
                    var streetViewService = new google.maps.StreetViewService();
                    var radius = 50;

                    function getStreetView(data, status) {
                        if (status == google.maps.StreetViewStatus.OK) {
                            var nearStreetViewLocation = data.location.latLng;
                            var heading = google.map.geometry.spherical.computeHeading(
                                nearStreetViewLocation, marker.position);
                            infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                            var panoramaOptions = {
                                position: nearStreetViewLocation,
                                pov: {
                                    heading: heading,
                                    pitch: 30
                                }
                            };
                            var panorama = new google.maps.StreetViewPanorama(
                                document.getElementById('pano'), panoramaOptions);
                        } else {
                            infowindow.setContent('<div>' + marker.title + '</div>' +
                                '<div> No Street View Found </div>');
                        }
                    }
                    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
                    infowindow.open(map, marker);
                }
            }

            function showListings() {
                var bounds = new google.maps.LatLngBounds();

                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(map);
                    bounds.extend(markers[i].position);
                }
                map.fitBounds(bounds);
            }

            function hideListings() {
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(null);
                }
            }

            viewModel.listMatch.subscribe(function(newValue) {
    //loop through markers && lists to see if they match
    newValue = newValue.toLowerCase();
    var mapBounds = new google.maps.LatLngBounds();
    var placesToDisplay = [];
    for (var i = 0; i < markers.length; i++) {

        var curPlaceInfo = places[i].name.toLowerCase() + places[i].attractions.toLowerCase();

        if (curPlaceInfo.includes(newValue)) {
            placesToDisplay.push(i);
            markers[i].setMap(map);
            markers[i].setAnimation(google.maps.Animation.DROP);
            mapBounds.extend(markers[i].position);
            map.fitBounds(mapBounds);
        } else {
            markers[i].setMap(null);
        }
    }
    viewModel.placesToDisplay(placesToDisplay);

});

            function makeMarkerIcon(markerColor) {
                var markerImage = new google.maps.MarkerImage(
                    'http://chart.googleapis.com/chart?chst=d+map+spin&chld=1.15|0|'+ markerColor +
                    '|40|_|%E2%80%A2',
                    new google.maps.Size(21, 34),
                    new google.maps.Point(0,0),
                    new google.maps.Point(10, 34),
                    new google.maps.Size(21, 34));
                return markerImage;
            }