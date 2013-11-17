/*global jasmine:false, runs:false, waitsFor:false */

'use strict';

var slideDeck = (function () {

  var iframe,
      loaded,
      sendEventSpies = {
        ready: jasmine.createSpy('send ready'),
        cursor: jasmine.createSpy('send cursor'),
        step: jasmine.createSpy('send step'),
        notes: jasmine.createSpy('send notes')
      };

  window.addEventListener('message', function (msgEvent) {
    var eventName = msgEvent.data[0],
        eventArgs = msgEvent.data.slice(1);

    // noinspection JSValidateTypes
    sendEventSpies[eventName].apply(null, eventArgs);
  });

  function resetSpies() {
    sendEventSpies.ready.reset();
    sendEventSpies.cursor.reset();
    sendEventSpies.step.reset();
    sendEventSpies.notes.reset();
  }

  return {

    // used by matcher
    sendEventSpies: sendEventSpies,

    // create iframe and load url
    load: function (url) {

      runs(function () {

        // destroy previous slideDeck if necessary
        if (iframe && iframe.src !== url) {
          iframe.parentElement.removeChild(iframe);
          iframe = null;
        }

        // build slideDeck slideDeck and load url
        if (!iframe) {
          iframe = document.createElement('iframe');
          iframe.src = url;
          loaded = false;
          iframe.onload = function () {
            loaded = true;
          };
          document.body.appendChild(iframe);
        }
      });

      waitsFor(function () {
        return loaded;
      }, 'loading slideDeck ' + url, 10000);

      runs(function () {
        resetSpies();
        // noinspection JSValidateTypes
        iframe.contentWindow.postMessage(['init'], '*');
      });

      waitsFor(function () {
        return sendEventSpies.ready.callCount > 0;
      }, 'remote sendEvent', 1000);

      runs(function () {
        slideDeck.infos = sendEventSpies.ready.calls[0].args[0];
      });
    },

    // send action using postMessage and prezento format
    sendAction: function (action, actionArg) {

      runs(function () {
        resetSpies();
        // noinspection JSValidateTypes
        iframe.contentWindow.postMessage([action, actionArg], '*');
      });

      waitsFor(function () {
        return sendEventSpies.ready.callCount + sendEventSpies.cursor.callCount + sendEventSpies.step.callCount + sendEventSpies.notes.callCount > 0;
      }, 'remote sendEvent', 1000);
    },

    // verify using
    hasFeature: function (feature) {
      return slideDeck.infos.features.indexOf(feature) !== -1;
    }

  };
})();
