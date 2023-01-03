(function() {
  'use strict';
  var document = window.document
    , s = document.currentScript
    {{#if local}}
    , serverUrl = 'http://localhost:14000/api/events'
    {{else}}
    , serverUrl = 'https://fuul.xyz/api/events'
    {{/if}}
    , projectId = s.getAttribute('project-id')

  const sessionIdKey = 'fuul.sessionId';

  function sendEvent(evt, props = {}) {
    const req = new XMLHttpRequest();
    req.open('POST', serverUrl);
    req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    var reqBody = {};
    reqBody.name = evt;
    reqBody.project_id = projectId;
    var sessionId = localStorage.getItem(sessionIdKey);
    if (sessionId) {
      reqBody.session_id = sessionId;
    }
    reqBody.event_args = props;
    req.send(JSON.stringify(reqBody));
  }
  window.fuul = sendEvent;

  function onLoad() {
    sessionId = 'random';
    localStorage.setItem(sessionIdKey, sessionId);
    fuul('session_start');
  }
  window.onload = onLoad;
})();