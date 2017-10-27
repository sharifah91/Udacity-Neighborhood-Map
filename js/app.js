var map;
// Array of markers
var markers = [];

var locations = [{
    "title": "Heritage Village",
    "location": {
      lat: 25.3886804,
      lng: 49.547084
    },
    isVisible: ko.observable(true)
  },
  {
    "title": "Alahsa Hospital",
    "location": {
      lat: 25.3860343,
      lng: 49.5720715
    },
    isVisible: ko.observable(true)
  },
  {
    "title": "Alahsa Intercontinental",
    "location": {
      lat: 25.3877499,
      lng: 49.5805043
    },
    isVisible: ko.observable(true)
  },
  {
    "title": "Qaisariah Souq",
    "location": {
      lat: 25.3811587,
      lng: 49.581073
    },
    isVisible: ko.observable(true)
  },
  {
    "title": "Othaim Mall",
    "location": {
      lat: 25.4045366,
      lng: 49.5732624
    },
    isVisible: ko.observable(true)
  },
  {
    "title": "Hofuf Railway Station",
    "location": {
      lat: 25.3873041,
      lng: 49.5684773
    },
    isVisible: ko.observable(true)
  }
];

function initMap() {
  //Create a new map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 25.3724513,
      lng: 49.55347
    },
    zoom: 13
  });
  /*              var heritage = {lat: 25.3866036, lng: 49.5531266}
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


  //var infowindow = new google.maps.InfoWindow();
  var largeInfowindow = new google.maps.InfoWindow();
  //var bounds = new google.maps.LatLngBounds();

  for (var i = 0; i < locations.length; i++) {
    // get the position from the array
    var position = locations[i].location;
    var title = locations[i].title;
    //create a marker per location
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i,
      icon: "images/marker0.png"
    });

    viewModel.cityLocations()[i].marker = marker;
    // push the marker to the markers array
    markers.push(marker);
    // extend boundaries for each marker
    //bounds.extend(marker.position);
    // create onclick event
    marker.addListener('click', function() {
      viewModel.getWikiData(this, largeInfowindow)
      //populateInfoWindow(this, largeInfowindow);
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

var viewModel = {
  cityLocations: ko.observableArray(locations),
  locDisplay: ko.observable([0, 1, 2, 3, 4, 5]),
  locList: function(id) {
    if (viewModel.locDisplay().indexOf(id) > -1) {
      return true;
    } else {
      return false;
    }
  },
  listMatch: ko.observable(""),
  applyFilter: function() {
    filterLoc();
  },
  resetFilter: function() {
    resetMap();
  }

};

// http://knockoutjs.com/documentation/click-binding.html#note-1-passing-a-current-item-as-a-parameter-to-your-handler-function
viewModel.clickLoc = function(clickedLoc) {
  //console.log('click')
  console.log(clickedLoc) // use clickedLoc. marker to animate the marker and to open an info window
        google.maps.event.trigger(clickedLoc.marker, 'click');
};


function populateInfoWindow(marker, infowindow) {

  // check if the window is not already open
  if (infowindow.marker != marker) {
    infowindow.setContent('');
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);

    infowindow.addListener('closeclick', function() {
      infowindow.setMarker(null);
    });
  }
}

function clickLoc(id) {
  populateInfoWindow(markers[id].infowindow);
  markers[id].setAnimation(google.maps.Animation.DROP);
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

viewModel.getWikiData = function(marker, infoWindow) {
  var query = marker.title,
     dt = 'jsonp',
     wikiBase = 'https://en.wikipedia.org/w/api.php',
     wikiUrl = wikiBase + '?action=opensearch&search=' + query + '&format=json&callback=wikiCallback';

    $.ajax({
      url: wikiUrl,
      dataType: dt,
      success: function(response) {

        console.log(response)

        // set the info window content here
        var infowindow = new google.maps.InfoWindow({
            content: response
          });
        // open the info window here
        marker.addListener('click', function() {
        infowindow.open(marker, infoWindow);
  });
      }
    });
}

viewModel.listMatch.subscribe(function(newValue) {
  //loop through markers && lists to see if they match
  newValue = newValue.toLowerCase();
  var mapBounds = new google.maps.LatLngBounds();
  var locDisplay = [];

  for (var i = 0; i < markers.length; i++) {

    var currLocInfo = locations[i].title.toLowerCase();

    if (currLocInfo.includes(newValue)) {
      locDisplay.push(i);
      markers[i].setMap(map);
      markers[i].setAnimation(google.maps.Animation.DROP);
      mapBounds.extend(markers[i].position);
      map.fitBounds(mapBounds);
    } else {
      markers[i].setMap(null);
    }
  }
  viewModel.locDisplay(locDisplay);

});

ko.applyBindings(viewModel);