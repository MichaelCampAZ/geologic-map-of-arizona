$(function () {
    // Set zoom level at 6 for mobile screens
    var zoomLevel = L.Browser.mobile ? 6 : 7;

    // Map init
    var map = L.map('map', {
        center: [34.16, -111.62],
        maxBounds: L.latLngBounds([[29.96818929679422, -126.13671875], [38.34395908944491, -97.226318359375]]),
        maxZoom: 13,
        minZoom: 6,
        zoom: zoomLevel,
    });

    // USGS_USTopo Basemap
    var USGS_USTopo = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
        attribution: '<a href="https://usgs.gov/">U.S. Geological Survey</a>'
    }).addTo(map);

    // OpenStreetMap Basemap
    var OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    // Basemap layer group
    var basemaps = {
        "USGS Topo": USGS_USTopo,
        "Open Street Map": OpenStreetMap
    }

    // Add uncollapsed layer controller to the map.
    var layerControl = L.control.layers(basemaps, {}).addTo(map);

    // Add scale bar
    L.control.scale().addTo(map);

    // Map Unit Poly vectorGrid layer
    var mups = L.vectorGrid.protobuf("https://vectortileservices1.arcgis.com/Ezk9fcjSUkeadg6u/arcgis/rest/services/MapUnitPolysFixedDMU/VectorTileServer/tile/{z}/{y}/{x}", {
        attribution: '<a href="https://www.azgs.arizona.edu/">AZGS</a>',
        vectorTileLayerStyles: {
            "MapUnitPolys": function (properties, zoom, geometryDimension) {

                // Get the symbol value of the feature
                var symbol = properties._symbol;

                // Get the map unit with that symbol
                var MapUnit = MupsJson[symbol];

                return ({
                    weight: 1,
                    fillColor: MapUnit.rgb,
                    color: '#6E6E6E',
                    fillOpacity: .5,
                    fill: true
                });
            }
        },
        interactive: true
    }).addTo(map);

    layerControl.addOverlay(mups, "Geologic Units");

    mups.on('click', function (e) {
        // Get the symbol from the event
        var symbol = e.sourceTarget.properties._symbol;

        // Get the map unit from the symbol
        var MapUnit = MupsJson[symbol]
        var rgb = MapUnit.rgb;
        var mapunit = MapUnit.mapunit;
        var name = MapUnit.name;
        var description = MapUnit.description;
        var age = "";

        if (MapUnit.name !== 'Water') {
            var age = `${MapUnit.age} (${MapUnit.b_age} - ${MapUnit.t_age} ${MapUnit.age_unit})`;
        }

        // BOOTSTRAP MODAL 
        var body = `<p>${description}</p>`
        $("#Modal .modal-title").text(name);
        $("#Modal .modal-mapunit").text(mapunit);
        $("#Modal .modal-age").text(age);
        $("#Modal .modal-body").html(body);
        $("#Modal .modal-header").css("background-color", rgb);
        $('#Modal').modal('show');
    });

    // Map info box
    var info = L.control();

    // Setup html and update function for the info box
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'mapInfoBox invisible');
        this.update();
        return this._div;
    };

    // Update html function for map info box
    info.update = function (update) {
        $('.mapInfoBox').removeClass("invisible");
        this._div.innerHTML = (update ? `<div>${update}</div>` : '');
    };

    info.addTo(map);

    // Update map info box on MUPS mouseover
    mups.on('mouseover', function (e) {

        var symbol = e.sourceTarget.properties._symbol;

        var MapUnit = MupsJson[symbol]

        info.update(MapUnit.name);
    });

    // Hide the map info box on mouse out of the map
    mups.on('mouseout', function () { $('.mapInfoBox').addClass("invisible") });

    var CFTile = L.tileLayer('https://tiles.arcgis.com/tiles/Ezk9fcjSUkeadg6u/arcgis/rest/services/ContactsAndFaultsFixedDMU/MapServer/tile/{z}/{y}/{x}', {
        attribution: '<a href="https://www.azgs.arizona.edu/">AZGS</a>',
    }).addTo(map);

    layerControl.addOverlay(CFTile, "Faults");

    // AZGS Datasets
    $.getJSON("https://data.azgs.arizona.edu/api/v1/metadata?collection_group=ADGM&format=geojson&latest=true&limit=500", function success(data) {

        function onAzgsClick(e) {
            var features = leafletPip.pointInLayer(e.latlng, azgsMaps);

            if (features.length === 0) {
                return;
            }

            var bodyHtml = "<div>";
            features.forEach((polygon) => {
                if (polygon.feature.properties.links[0]) {
                    bodyHtml += `<div class="mb-2"><h5><a class="text-decoration-none" target="_blank" href="${polygon.feature.properties.links[0].url}">${polygon.feature.properties.title}</a></h5>`;
                    bodyHtml += `<p class="font-weight-light d-none d-sm-block">${polygon.feature.properties.abstract}</p></div>`
                }
            });
            bodyHtml += '</div>';

            var mapPlural = features.length === 1 ? "Map" : "Maps";

            $("#Modal .modal-title").text(`Arizona Geological Survey Digital Geologic ${mapPlural}`);
            $("#Modal .modal-mapunit").text("");
            $("#Modal .modal-age").text("");
            $("#Modal .modal-body").html(bodyHtml);
            $("#Modal .modal-header").css("background-color", "#D3D3D3");
            $('#Modal').modal('show');

        }

        var azgsMaps = L.geoJSON(data, {
            attribution: '<a href="https://www.azgs.arizona.edu/">AZGS</a>',
            filter: function (feature) {
                // Remove the big datasets
                if (feature.properties.identifiers.perm_id === 'ADGM-1552430548157-680') {
                    return false;
                }

                return true;
            },
            style: function (feature) {
                return { color: "#1E5288", fillColor: "#" + ((1 << 24) * Math.random() | 0).toString(16) };
            }
        });

        azgsMaps.on('click', onAzgsClick);

        layerControl.addOverlay(azgsMaps, "Geologic Maps");

        $.each(data.features, function (index, value) {

            if (value.properties.links[0]) {
                var title = value.properties.title;
                var year = value.properties.year;
                var abstract = value.properties.abstract;
                var url = value.properties.links[0].url;

                var authors = "";
                $.each(value.properties.authors, function (index, value) {
                    if (value.person) {
                        authors += value.person + "<br />";
                    }
                });

                $("#azgsMapTableBody").append(`<tr><td></td><td>${year}</td><td><a href="${url}" target="_blank">${title}</a><td>${authors}</td></td><td>${abstract}</td></tr>`);
            }

        });

        $('#azgsMapTable').DataTable({
            autoWidth: false,
            columnDefs: [
                { orderable: false, targets: 0 }
            ],
            order: [[1, 'desc']],
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (row) {
                            return 'Arizona Geological Survey Digital Geologic Map';
                        }
                    }),
                    renderer: $.fn.dataTable.Responsive.renderer.tableAll({
                        tableClass: 'table'
                    })
                }
            }
        });

    });

    // Build the MUP legend
    $.each(MupsJson, function (index, value) {
        var rgb = value.rgb;
        var age = value.age;

        var earlyAge = `${value.b_age} ${value.age_unit}`;
        var lateAge = `${value.t_age} ${value.age_unit}`;
        var earlyAgeSort = value.b_age;
        var lateAgeSort = value.b_age;

        // Sort value
        if (value.age_unit === 'ka') {
            earlyAgeSort = earlyAgeSort * 1000;
            lateAgeSort = lateAgeSort * 1000;
        }
        else if (value.age_unit === 'Ma') {
            earlyAgeSort = earlyAgeSort * 1000000;
            lateAgeSort = lateAgeSort * 1000000;
        } 

        var mapunit = value.mapunit;
        var name = value.name;
        var description = value.description;

        $("#mupsTableBody").append(`<tr><td></td>><td style="font-size:1.05rem;background-color:${rgb};" >${name}</td><td>${mapunit}</td><td>${age}</td><td data-sort="${earlyAgeSort}">${earlyAge}</td><td data-sort="${lateAgeSort}">${lateAge}</td><td>${description}</td></tr>`);
    });

    $('#mupsTable').DataTable({
        autoWidth: false,
        fixedHeader: true,
        responsive: true,
        columnDefs: [
            { orderable: false, targets: 0 }
        ],
        order: [[1, 'asc']],
    });

});