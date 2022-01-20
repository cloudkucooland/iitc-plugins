// @author         cloudkucooland
// @name           Wasabee: Find Farms
// @category       Misc
// @version        0.1.0
// @description    Automark Farms

// setup is called by IITC when the plugin loads
function setup() {
  if (!window.plugin.wasabee && !window.plugin.farmFind) {
    alert("Wasabee: Find Farms requires both wasabee and farms-find plugins");
    return;
  }

  $("<a>")
    .html("Wasabee: Mark Farms")
    .attr("title", "Mark Farms")
    .click(markfarms)
    .appendTo("#toolbox");
}

// mostly just copied from IITC's plugins/farms-find.js
function markfarms() {
  possibleFarmPortals = [];
  window.plugin.farmFind.levelLayerGroup.clearLayers();
  $.each(window.portals, function (i, portal) {
    if (
      window.plugin.farmFind.getNearbyPortalCount(portal) >
      window.plugin.farmFind.minNearby
    ) {
      possibleFarmPortals.push(portal);
    }
  });

  const farms = [];
  for (i = 0; i < possibleFarmPortals.length; i++) {
    const thisPortal = possibleFarmPortals[i];
    const alreadyInFarm = false;
    for (x = 0; x < farms.length; x++) {
      if (thisPortal in farms[x]) alreadyInFarm = true;
    }

    let alreadyInAnotherFarm = false;
    if (!alreadyInFarm) {
      const portalsInFarm = [];
      const circle = new google.maps.Circle();
      const center = new google.maps.LatLng(
        thisPortal.getLatLng().lat,
        thisPortal.getLatLng().lng
      );
      circle.setCenter(center);
      circle.setRadius(window.plugin.farmFind.Radius);
      portalsInFarm.push(thisPortal);
      for (p = 0; p < possibleFarmPortals.length; p++) {
		alreadyInAnotherFarm = false;
        const portalLoc = new google.maps.LatLng(
          possibleFarmPortals[p].getLatLng().lat,
          possibleFarmPortals[p].getLatLng().lng
        );

        let farmIndex = 0;
        if (
          circle.getBounds().contains(portalLoc) &&
          possibleFarmPortals[p] != thisPortal
        ) {
          for (x = 0; x < farms.length; x++) {
            for (o = 0; o < farms[x].length; o++) {
              if (possibleFarmPortals[p] == farms[x][o]) {
                alreadyInAnotherFarm = true;
                farmIndex = x;
              }
            }
          }

          if (!alreadyInAnotherFarm) {
            portalsInFarm.push(possibleFarmPortals[p]);
          } else {
            for (prt = 0; prt < portalsInFarm.length; prt++) {
              farms[farmIndex].push(portalsInFarm[prt]);
            }
            p = 6000;
          }
        }
      }

      if (!alreadyInAnotherFarm) {
        farms.push(portalsInFarm);
      }
    }
  }

  for (i = 0; i < farms.length; i++) {
    farms[i] = findUnique(farms[i]);
  }

  for (farm = 0; farm < farms.length; farm++) {
   mark(farms[farm]);
  }
};

function findUnique(farm) {
  const unique = [];
  for (p = 0; p < farm.length; p++) {
    let found = false;
    for (u = 0; u < unique.length; u++) {
      if (farm[p].options.guid == unique[u].options.guid) found = true;
    }
    if (!found) unique.push(farm[p]);
  }
  return unique;
};

function mark(found) {
  const raw = [];
  for (const p of found) {
    if (p.options.data.hasOwnProperty("title")) {
      // e is an object type defined by Wasabee, a "raw" portal
      var e = {
        id: p.options.guid,
        lat: (p.options.data.latE6 / 1e6).toFixed(6),
        lng: (p.options.data.lngE6 / 1e6).toFixed(6),
        name: p.options.data.title,
        comment: "",
        hardness: "",
      };
      raw.push(e);
    }
  }

  const portals = window.plugin.wasabee._selectedOp.convertPortalsToObjs(raw);

  for (const p of portals) {
    if (
      window.plugin.wasabee._selectedOp.markers.find(
        (marker) =>
          marker.portalId === p.id && marker.type === "FarmPortalMarker"
      )
    ) {
      continue;
    }
    window.plugin.wasabee._selectedOp.addPortal(p);
    window.plugin.wasabee._selectedOp.addMarker("FarmPortalMarker", p);
  }
}
