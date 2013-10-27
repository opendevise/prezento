/*global prezento: false */

(function () {
  'use strict';

  // Helpers

  var getSearchParams = function () {
    var params = /^\?(.*?=.*?)(?:&(.*?=.*?))*$/.exec(location.search),
        paramsObj = {};

    for (var i = 1; params[i]; i++) {
      var keyValue = params[i].split('=');
      paramsObj[keyValue[0]] = keyValue[1];
    }

    return paramsObj;
  };

  var $ = (function () {
    var cache = {};

    return function (selector) {
      if (!cache[selector]) {
        cache[selector] = document.querySelector(selector);
      }

      return cache[selector];
    };
  })();

  var addClickListener = function (selector, callback) {
    $(selector).addEventListener('click', function () {
      callback();
    }, false);
  };

  // Setup the slide deck iframe
  $('iframe').src = getSearchParams().url;

  // Setup the slide deck proxy

  var steps;

  var slideDeck = prezento.createSlideDeckProxy('iframe')

      .configListeners({

        ready: function (slideDeckInfos) {

          $('.vendor').innerHTML = slideDeckInfos.metas['prezento-vendor'] || '';
          $('.title').innerHTML = slideDeckInfos.title;
          $('.author').innerHTML = slideDeckInfos.metas.author || '';
          $('.description').innerHTML = slideDeckInfos.metas.description || '';

          steps = slideDeckInfos.steps;
          $('.steps-count').innerHTML = steps.length;

          $('.features').innerHTML = slideDeckInfos.features.join(', ') || 'none';

          if (slideDeckInfos.features.indexOf('multimedia') !== -1) {
            $('[data-action="toggleMultimedia"]').disabled = false;
          }

          if (slideDeckInfos.features.indexOf('overview') !== -1) {
            $('[data-action="toggleOverview"]').disabled = false;
          }
        },

        cursor: function (cursor) {
          $('.current-cursor').value = cursor;
        },

        step: function (step) {
          $('.current-step').innerHTML = steps.indexOf(step) + 1;
        },

        notes: function (notes) {
          $('.current-notes').innerHTML = notes;
        }
      });

  // Setup action calls

  addClickListener('[data-action="goTo"]', function () {
    slideDeck.goTo($('.current-cursor').value);
  });

  addClickListener('[data-action="first"]', slideDeck.first);
  addClickListener('[data-action="prev"]', slideDeck.prev);
  addClickListener('[data-action="next"]', slideDeck.next);
  addClickListener('[data-action="last"]', slideDeck.last);
  addClickListener('[data-action="toggleMultimedia"]', slideDeck.toggleMultimedia);
  addClickListener('[data-action="toggleOverview"]', slideDeck.toggleOverview);

  addClickListener('[data-action="goFullscreen"]', function () {
    var requestFullscreen = $('.screen').requestFullscreen || $('.screen').requestFullScreen || $('.screen').mozRequestFullScreen || $('.screen').webkitRequestFullScreen;
    if (requestFullscreen) {
      requestFullscreen.apply($('.screen'));
    }
  });

  // Fullscreen stuffs

  var toggleFullscreen = function (element) {
    if (element != null) {
      $('.screen').classList.add('full');
    } else {
      $('.screen').classList.remove('full');
    }
  };

  document.addEventListener('mozfullscreenchange', function () {
    toggleFullscreen(document.mozFullscreenElement);
  }, false);

  document.addEventListener('webkitfullscreenchange', function () {
    toggleFullscreen(document.webkitFullscreenElement);
  }, false);

  document.addEventListener('fullscreenchange', function () {
    toggleFullscreen(document.fullscreenElement);
  }, false);

})();
