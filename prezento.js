(function () {
  'use strict';

  var root = window,
      events = 'ready cursor step notes'.split(' '),
      actions = 'init goTo prev next first last toggleMultimedia toggleOverview'.split(' '),
      eventsAndActions = events.concat(actions);

  var utils = {

    parseMsg: function (msgEvt, callback) {

      // Message event data type must be an array with length >= 1
      if (!Array.isArray(msgEvt.data) || msgEvt.data.length < 1) {
        return;
      }

      // Message event data array first item must be an event or an action
      if (eventsAndActions.indexOf(msgEvt.data[0]) === -1) {
        return;
      }

      callback(msgEvt.data[0], msgEvt.data.slice(1));
    },

    ucfirst: function (str) {
      return str[0].toUpperCase() + str.slice(1);
    },

    postMsg: function (target, eventOrAction, args) {

      // Transform function arguments iterable object to array
      var argsArray = Array.prototype.slice.call(args),
          msgData = [eventOrAction].concat(argsArray);

      target.postMessage(msgData, '*');
    },

    getMetas: function () {

      var metasDomList = document.querySelectorAll('meta'),
          metasArray = Array.prototype.slice.call(metasDomList),
          metasObj = {};

      metasArray.forEach(function (meta) {
        metasObj[meta.name] = meta.content;
      });

      return metasObj;
    },

    mergeProps: function (mergedObject, newStuffsObject) {
      for (var prop in newStuffsObject) {
        mergedObject[prop] = newStuffsObject[prop];
      }
    }
  };

  // Expose prezento as global
  root.prezento = {

    createSlideDeckProxy: function (initArg) {

      var iframe,
          target,
          eventListeners = {},
          slideDeckProxy = {};

      // initArg can be a CSS selector for an iframe element
      if (typeof initArg === 'string') {
        initArg = document.querySelector(initArg);
      }

      // initArg can be an iframe element
      if (initArg && initArg.contentWindow != null) {
        iframe = initArg;
        initArg = initArg.contentWindow;
      }

      // initArg can be an object with a postMessage method (window or iframe contentWindow)
      if (initArg && initArg.postMessage != null) {
        target = initArg;
      } else {
        // initArgs is incorrect
        return null;
      }

      // Configure event listeners with config object
      slideDeckProxy.configListeners = function (listenersConfig) {

        utils.mergeProps(eventListeners, listenersConfig);

        // Add load listener on slide deck when shell configures ready listener
        if (listenersConfig.hasOwnProperty('ready')) {
          (iframe || target).addEventListener('load', function () {
            slideDeckProxy.init();
          }, false);
        }

        return slideDeckProxy;
      };

      // Expose all actions as direct methods
      actions.forEach(function (action) {
        slideDeckProxy[action] = function () {
          utils.postMsg(target, action, arguments);
          return slideDeckProxy;
        };
      });

      root.addEventListener('message', function (msgEvt) {

        utils.parseMsg(msgEvt, function (event, args) {
          var listener = eventListeners[event];

          if (listener) {
            listener.apply(null, args);
          }
        });
      }, false);

      return slideDeckProxy;
    },

    createShellProxy: function (slideDeckInfos) {

      var target,
          actionListeners = {},
          eventArgsGetters = {},
          shellProxy = {};

      if (slideDeckInfos &&
          Array.isArray(slideDeckInfos.steps) &&
          Array.isArray(slideDeckInfos.features)) {
      } else {
        // slideDeckInfos is incorrect
        return null;
      }

      // Additionnal automatic informations
      slideDeckInfos.title = document.title;
      slideDeckInfos.metas = utils.getMetas();

      // Configure action listeners with config object
      shellProxy.configListeners = function (listenersConfig) {
        utils.mergeProps(actionListeners, listenersConfig);
        return shellProxy;
      };

      // Configure getters for event arguments with config object
      shellProxy.configGetters = function (gettersConfig) {
        utils.mergeProps(eventArgsGetters, gettersConfig);
        return shellProxy;
      };

      // Expose all events as direct methods "notify[eventName]()"
      events.forEach(function (event) {
        shellProxy['notify' + utils.ucfirst(event)] = function () {
          utils.postMsg(target, event, arguments);
          return shellProxy;
        };
      });

      root.addEventListener('message', function (msgEvt) {

        utils.parseMsg(msgEvt, function (action, args) {

          // Getters for cursor and step must be configured
          if (eventArgsGetters.cursor && eventArgsGetters.step) {
            target = target || msgEvt.source;

            if (action === 'init') {
              shellProxy.notifyReady(slideDeckInfos);
            }

            var listener = actionListeners[action];
            if (listener) {
              listener.apply(null, args);
            }

            shellProxy.notifyCursor(eventArgsGetters.cursor());
            shellProxy.notifyStep(eventArgsGetters.step());

            if (eventArgsGetters.notes) {
              shellProxy.notifyNotes(eventArgsGetters.notes());
            }
          }
        });
      }, false);

      return shellProxy;
    },

    // Expose util functions for unit tests
    _utils: utils,

    // Expose actions and events functions for unit tests
    _events: events,
    _actions: actions
  };

})();
