/*global jQuery, window, document, console, google, MarkerClusterer */

var Codeweek = window.Codeweek || {};

(function ($, Codeweek) {

    'use strict';

    var i,
        map,
        markers = {},
        place,
        placeinfowindow = null;

    function createMap(events, lat, lng, zoomVal) {
        var markerData = JSON.parse(events),
            markerData_len = markerData.length,
            markerClusterOptions = {gridSize: 30, maxZoom: 10},
            map = new google.maps.Map(document.getElementById('events-map'), {
                scrollwheel: false,
                zoom: zoomVal,
                center: new google.maps.LatLng(lat, lng),
                mapTypeControl: false,
                panControl: false,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE,
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
                scaleControl: true,
                streetViewControl: false,
                streetViewControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                }
            });
        placeinfowindow = new google.maps.InfoWindow({
            content: "loading..."
        });

        for (i = 0; i <= markerData_len; i = i + 1) {
            var markdata = markerData[i];
            if (markdata && typeof markdata === 'object') {

                var markTitle = markerData[i].fields.title,
                    map_position = markerData[i].fields.geoposition.split(","),
                    markLat = map_position[0],
                    markLng = map_position[1],
                    map_event_id = markerData[i].pk,
                    map_event_slug = markerData[i].fields.slug,
                    markUrl = "/view/" + map_event_id + "/" + map_event_slug;

                markers[map_event_id] = createMarker(markTitle, markLat, markLng, markUrl);
            }
        }

        return new MarkerClusterer(map, markers, markerClusterOptions);
    }

    function createMarker(markTitle, markLat, markLng, markUrl) {
        var myLatLng = new google.maps.LatLng(parseFloat(markLat), parseFloat(markLng));
        var marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            title: markTitle,
            html: '<a href="' + markUrl + '"><h4>' + markTitle + '</h4></a>'
        });
        google.maps.event.addListener(marker, 'click', function() {
                placeinfowindow.setContent(this.html);
                placeinfowindow.open(this.map, this);
         });

        return marker;
    }

    function setAutocomplete() {
        var input = /** @type {HTMLInputElement} */(
            document.getElementById('search-event'));
        var event_list_container = /** @type {HTMLInputElement} */(
            document.getElementById('events-list'));
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);
        var infowindow = new google.maps.InfoWindow();
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            infowindow.close();
            place = autocomplete.getPlace();
            if (!place.geometry) {
                return;
            }
            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                map.map.fitBounds(place.geometry.viewport);
            } else {
                map.map.setCenter(place.geometry.location);
                map.map.setZoom(17);  // Why 17? Because it looks good.
            }

            var country_code = 'CZ',
                country_name = '';
            if (place.address_components) {
                var address = place.address_components;
                for (var j = 0; j <= address.length; j++) {
                    if (address[j] && address[j].types[0] === 'country') {
                        country_code = address[j].short_name;
                        country_name = address[j].long_name;
                    }
                }

            }
            infowindow.open(map.map);
            infowindow.close();

            if ($.support.pjax) {
                $.pjax({url: '/' + country_code, container: event_list_container});
                $(document).on('pjax:success', function () {
                    $('#country').html(country_name);
                });

            }
        });
    }
    function zoomCountry(current_country) {
        var zoomgeocoder = new google.maps.Geocoder();
        zoomgeocoder.geocode({'address': current_country}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var ne = results[0].geometry.viewport.getNorthEast();
                var sw = results[0].geometry.viewport.getSouthWest();
                map.map.fitBounds(results[0].geometry.viewport);
                map.map.setCenter(results[0].geometry.location);
				$("#country").html("in " + current_country);
            }
        });
    }

    function initialize(events, lon, lan) {
        map = createMap(events, lon, lan, 4);
        setAutocomplete();
		if (location.hash !== '') {
			var country = $('#' + location.hash.replace('#', '').replace('!', ''));
			if (country.length) {
				zoomCountry(country[0].innerText)
			}
		} else if (location.pathname !== "/") {
			var current_country = document.getElementById('country').innerHTML;
			zoomCountry(current_country);
		}
	}

    var search_events_handler = function () {
        var serch_query_input = $('#search-event'),
            search_event_btn = $('search-btn');

        search_event_btn.on('click', function (e) {
            e.preventDefault();
        });

    };

    var init = function (events, lon, lan) {

        $(function () {
            // Initialize map on front page
            google.maps.event.addDomListener(window, 'load', function () {
                initialize(events, lon, lan);
            });
            
            search_events_handler();

        });
    };

    Codeweek.Index = {};
    Codeweek.Index.init = init;

	$(".countryflag").click(function(sender){
		zoomCountry(sender.currentTarget.innerText);
		document.location.href = "#!" + sender.currentTarget.id;
	});

}(jQuery, Codeweek));

