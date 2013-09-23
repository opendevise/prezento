'use strict';

var searchParams = (function () {
  var params = /^\?(.*?=.*?)(?:&(.*?=.*?))*$/.exec(location.search),
    paramsObj = {};

  for (var i = 1; params[i]; i++) {
    var keyValue = params[i].split('=');
    paramsObj[keyValue[0]] = keyValue[1];
  }

  return paramsObj;
})();

var $ = (function () {
  var cache = {};

  return function (selector) {
    if (!cache[selector]) {
      cache[selector] = document.querySelector(selector);
    }

    return cache[selector];
  };
})();

$('iframe').src = searchParams.url;

var steps;

var slideDeck = prezento.createSlideDeckProxy('iframe')

  .on('ready', function (slideDeckInfos) {
    $('.title').innerHTML = slideDeckInfos.title;
    $('.author').innerHTML = slideDeckInfos.author || '';
    $('.description').innerHTML = slideDeckInfos.description || '';

    steps = slideDeckInfos.steps;
    $('.steps-count').innerHTML = steps.length;

    $('.features').innerHTML = slideDeckInfos.features.join(', ') || 'none';

    if (slideDeckInfos.features.indexOf('multimedia') !== -1) {
      $('[data-action="toggleMultimedia"]').disabled = false;
    }

    if (slideDeckInfos.features.indexOf('overview') !== -1) {
      $('[data-action="toggleOverview"]').disabled = false;
    }
  })

  .on('cursor', function (cursor) {
    $('.current-cursor').value = cursor;
  })

  .on('step', function (step) {
    $('.current-step').innerHTML = steps.indexOf(step) + 1;
  })

  .on('notes', function (notes) {
    $('.current-notes').innerHTML = notes;
  });

var addClickListener = function (selector, callback) {
  $(selector).addEventListener('click', function () {
    callback();
  }, false);
};

addClickListener('[data-action="first"]', slideDeck.first);
addClickListener('[data-action="prev"]', slideDeck.prev);
addClickListener('[data-action="next"]', slideDeck.next);
addClickListener('[data-action="last"]', slideDeck.last);
addClickListener('[data-action="toggleMultimedia"]', slideDeck.toggleMultimedia);
addClickListener('[data-action="toggleOverview"]', slideDeck.toggleOverview);

addClickListener('[data-action="goTo"]', function () {
  slideDeck.goTo($('.current-cursor').value);
});

addClickListener('[data-action="goFullscreen"]', function () {
  var requestFullscreen = $('.screen').requestFullscreen || $('.screen').requestFullScreen || $('.screen').mozRequestFullScreen || $('.screen').webkitRequestFullScreen;
  if (requestFullscreen) {
    requestFullscreen.apply($('.screen'));
  }
});

var toggleFullscreen = function (element) {
  if (element != null) {
    $('.screen').classList.add('full');
  } else {
    $('.screen').classList.remove('full');
  }
};

document.addEventListener("mozfullscreenchange", function (e) {
  toggleFullscreen(document.mozFullscreenElement);
}, false);

document.addEventListener("webkitfullscreenchange", function (e) {
  toggleFullscreen(document.webkitFullscreenElement);
}, false);

document.addEventListener("fullscreenchange", function (e) {
  toggleFullscreen(document.fullscreenElement);
}, false);
