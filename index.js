!function() {
  "use strict";
  var location = window.location
    , d = window.document
    , s = d.currentScript
    , serverUrl = s.getAttribute("data-api") || new URL(s.src).origin + "/api/event"
    , projectId = s.getAttribute("project-id")

  function t(eventName, props = {}) {
    const req = new XMLHttpRequest();
    req.open("POST", serverUrl);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    props.name = eventName;
    props.project_id = projectId;
    req.send(JSON.stringify(props));
  }

  window.fuul = t;
}();