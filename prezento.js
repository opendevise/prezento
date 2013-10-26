(function () {
  'use strict';

  var root = this,
    events = 'ready cursor step notes'.split(' '),
    actions = 'init goTo prev next first last toggleMultimedia toggleOverview'.split(' ');

  var utils = {

    parseMsg: function (msgEvent) {
      var message = {};

      if (!Array.isArray(msgEvent.data) || msgEvent.data.length < 1) {
        console.error('Invalid prezento data format. Must be an array with action or event name and optionnal arguments : ["name", "arg0", "arg1", ...]', msgEvent.data);
        return null;
      }

      if (actions.indexOf(msgEvent.data[0]) !== -1 || events.indexOf(msgEvent.data[0]) !== -1) {
        message.actionOrEvent = msgEvent.data[0];
      } else {
        console.error('Invalid prezento action or event', msgEvent.data[0]);
        return null;
      }

      message.args = msgEvent.data.slice(1);

      return message;
    },

    ucfirst: function (str) {
      return str[0].toUpperCase() + str.slice(1);
    },

    postMsg: function (target, actionOrEvent, args) {
      var argsArray = Array.prototype.slice.call(args),
        msgData = [actionOrEvent].concat(argsArray);

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
    }
  };

  // Expose prezento as global
  root.prezento = {

    createSlideDeckProxy: function (initArg) {

      var iframe,
        contentWindow,
        target,
        slideDeckProxy = {},
        eventCallbacks = {};

      // CSS selector initialization
      if (typeof initArg === 'string') {
        iframe = document.querySelector(initArg);
      } else {
        iframe = initArg;
      }

      // iframe element initialization
      if (iframe && iframe.contentWindow != null) {
        contentWindow = iframe.contentWindow;
      } else {
        contentWindow = iframe;
      }

      // contentWindow object initialization
      if (contentWindow && contentWindow.postMessage != null) {
        target = contentWindow;
      } else {
        console.error('Invalid prezento reference for frame. You must pass a CSS selector, a contentWindow or an iframe element', initArg);
        return;
      }

      actions.forEach(function (action) {
        slideDeckProxy[action] = function () {
          utils.postMsg(target, action, arguments);
          return slideDeckProxy;
        };
      });

      events.forEach(function (event) {
        eventCallbacks[event] = [];
      });

      slideDeckProxy.on = function (event, callback) {
        if (event === 'ready') {
          iframe.addEventListener('load', function () {
            slideDeckProxy.init();
          });
        }

        eventCallbacks[event].push(callback);
        return slideDeckProxy;
      };

      root.addEventListener('message', function (msgEvent) {
        var message = utils.parseMsg(msgEvent);

        if (message) {
          eventCallbacks[message.actionOrEvent].forEach(function (callback) {
            callback.apply(null, message.args);
          });
        }
      }, false);

      return slideDeckProxy;
    },

    createShellProxy: function (slideDeckInfos) {

      var target,
        shellProxy = {},
        actionCallbacks = {},
        getters = {},
        metas = utils.getMetas();

      // slideDeckInfos object should have the proper informations
      if (slideDeckInfos &&
        Array.isArray(slideDeckInfos.steps) &&
        Array.isArray(slideDeckInfos.features)) {
      } else {
        console.error('Invalid prezento slide deck info object', slideDeckInfos);
        return;
      }

      // Additionnal automatic informations
      slideDeckInfos.title = document.title;
      slideDeckInfos.author = metas.author;
      slideDeckInfos.description = metas.description;

      events.forEach(function (event) {
        shellProxy['notify' + utils.ucfirst(event)] = function () {
          utils.postMsg(target, event, arguments);
          return shellProxy;
        };
      });

      actions.forEach(function (action) {
        actionCallbacks[action] = [];
      });

      shellProxy.on = function (action, callback) {
        actionCallbacks[action].push(callback);
        return shellProxy;
      };

      shellProxy.setGetterFor = function (property, callback) {
        getters[property] = callback;
        return shellProxy;
      };

      root.addEventListener('message', function (msgEvent) {
        var message = utils.parseMsg(msgEvent);

        // getters for cursor and step must be added
        if (message && getters.cursor && getters.step) {
          target = target || msgEvent.source;

          actionCallbacks[message.actionOrEvent].forEach(function (callback) {
            callback.apply(null, message.args);
          });

          shellProxy.notifyCursor(getters.cursor());
          shellProxy.notifyStep(getters.step());
          if (getters.notes) {
            shellProxy.notifyNotes(getters.notes());
          }
        }
      }, false);

      shellProxy.on('init', function () {
        shellProxy.notifyReady(slideDeckInfos);
      });

      return shellProxy;
    },

    // Expose util functions for unit tests
    _utils: utils
  };

}).call(this);
