// @author         cloudkucooland
// @name           Wasabee: Mark Portals Not Captured
// @category       Misc
// @version        0.1.0
// @description    Automark Portals to Capture for Pioneer Badge

// the pioneer function is the "worker" of this plugin, called when the toolbox link is clicked
function pioneer() {
  // raw is a simple array of portals that match the requirements specified below
  const raw = [];

  // loop through all the loaded portals
  // look for (1) fully loaded portals (hasOwnProperty("history"))
  //          (2) those with history.visite == false
  // if both requirements are met, build a minimal object to stuff into raw[]

  for (const k of Object.keys(window.portals)) {
    const d = window.portals[k].options; // use d to save on typing below

    if (d.data.hasOwnProperty("history") && d.data.history.visited == false) {
      // e is an object type defined by Wasabee, a "raw" portal
      var e = {
        id: d.guid,
        lat: (d.data.latE6 / 1e6).toFixed(6),
        lng: (d.data.lngE6 / 1e6).toFixed(6),
        name: d.data.title,
        comment: "",
        hardness: "",
      };
      // add e to our list of portals
      raw.push(e);
    }
  }

  // convert all the raw portals into full wasabee-portal objects, using a method available in the selected operation
  const portals = window.plugin.wasabee._selectedOp.convertPortalsToObjs(raw);

  // for each of the full wasabee-portals, add a "CapturePortalMarker"
  for (const p of portals) {
    // ignore portals that already have a "CapturePortalMarker" market set
    if (
      window.plugin.wasabee._selectedOp.markers.find(
        (marker) =>
          marker.portalId === p.id && marker.type === "CapturePortalMarker"
      )
    ) {
      continue;
    }
    // console.log(p);
    // this adds the portal to the operation, so we can mark it
    window.plugin.wasabee._selectedOp.addPortal(p);
    // add the marker to the portal
    window.plugin.wasabee._selectedOp.addMarker("CapturePortalMarker", p);
  }
}

// setup is called by IITC when the plugin loads
function setup() {
  // this adds the "Wasabee: Pioneer" link to the IITC toolbox using JQuery syntax
  // the .click(pioneer) instructs IITC to call the pioneer function (above) when the link is clicked
  $("<a>")
    .html("Wasabee: Pioneer")
    .attr("title", "Mark Portals Not Captured")
    .click(pioneer)
    .appendTo("#toolbox");
}
