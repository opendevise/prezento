/*global jasmine:false, describe:false, beforeEach:false, it:false, expect: false, prezento: false */

'use strict';

describe('prezento', function () {

  // Special trick to add mock addEvenListener function
  // and trigger its callback afterwards
  var createAddEventListenerMock = function (type) {
    var triggerMock;

    return function (eventType, callback) {
      if (eventType === type) {
        triggerMock = triggerMock || {
          trigger: callback
        };
      }

      return triggerMock;
    };
  };

  var fakeIframe;

  var fn = function () {
  };

  beforeEach(function () {

    fakeIframe = {
      addEventListener: jasmine.createSpy('iframe.addEventListener'),

      contentWindow: {
        postMessage: jasmine.createSpy('contentWindow.postMessage'),
        addEventListener: jasmine.createSpy('iframe.addEventListener')
      }
    };
  });

  describe('createSlideDeckProxy()', function () {

    var createSlideDeckProxy = prezento.createSlideDeckProxy,
        iframeSelector = '#iframe';

    var expectValidSlideDeckProxy = function (slideDeckProxy) {
      expect(slideDeckProxy).not.toBeUndefined();
      expect(slideDeckProxy.configListeners).toEqual(jasmine.any(Function));

      prezento._actions.forEach(function (action) {
        expect(slideDeckProxy[action]).toEqual(jasmine.any(Function));
      });
    };

    beforeEach(function () {

      document.querySelector = jasmine.createSpy('querySelector').andCallFake(function (selector) {
        if (selector === iframeSelector) {
          return fakeIframe;
        } else {
          return null;
        }
      });
    });

    it('should return null if initArg selector does not select an element', function () {
      expect(createSlideDeckProxy('#badSelector')).toBeNull();
    });

    it('should return null if initArg element is not an iframe', function () {
      expect(createSlideDeckProxy({ contentWindow: null })).toBeNull();
    });

    it('should return null if initArg object does not have a postMessage method', function () {
      expect(createSlideDeckProxy({ postMessage: null })).toBeNull();
    });

    it('should return null if initArg is null or undefined', function () {
      expect(createSlideDeckProxy(null)).toBeNull();
      expect(createSlideDeckProxy()).toBeNull();
    });

    it('should return a valid slide deck proxy if selector selects an iframe element', function () {
      expectValidSlideDeckProxy(createSlideDeckProxy(iframeSelector));
    });

    it('should return a valid slide deck proxy if element is a valid iframe', function () {
      expectValidSlideDeckProxy(createSlideDeckProxy(fakeIframe));
    });

    it('should return a valid slide deck proxy if object has a postMessage method', function () {
      var objectWithPostMessageMethod = fakeIframe.contentWindow;
      expectValidSlideDeckProxy(createSlideDeckProxy(objectWithPostMessageMethod));
    });

    it('should add message event listener on window', function () {
      window.addEventListener = jasmine.createSpy('addEventListener');
      createSlideDeckProxy(fakeIframe);
      expect(window.addEventListener).toHaveBeenCalledWith('message', jasmine.any(Function), false);
    });
  });

  describe('slideDeckProxy instance', function () {

    var slideDeckProxy;

    beforeEach(function () {
      window.addEventListener = createAddEventListenerMock('message');
      slideDeckProxy = prezento.createSlideDeckProxy(fakeIframe);
    });

    describe('configListeners()', function () {

      it('should be chainable', function () {
        expect(slideDeckProxy.configListeners({ cursor: fn })).toBe(slideDeckProxy);
      });

      it('should add load event listener on iframe when "ready" listener is in config', function () {
        slideDeckProxy.configListeners({ ready: fn });
        expect(fakeIframe.addEventListener).toHaveBeenCalled();
      });

      it('should add load event listener on target when "ready" listener is in config', function () {
        // Need to init the slide deck proxy directly with a window object like when you use window.open()
        slideDeckProxy = prezento.createSlideDeckProxy(fakeIframe.contentWindow);

        slideDeckProxy.configListeners({ ready: fn });
        expect(fakeIframe.contentWindow.addEventListener).toHaveBeenCalled();
      });
    });

    describe('init()', function () {

      it('should be called once iframe is loaded if "ready" event listener is configured', function () {

        slideDeckProxy.init = jasmine.createSpy('slideDeckProxy.init');

        // Mock addEventListener to trigger event
        fakeIframe.addEventListener = createAddEventListenerMock('load');

        slideDeckProxy.configListeners({ ready: fn });
        fakeIframe.addEventListener().trigger({});
        expect(slideDeckProxy.init).toHaveBeenCalledWith();
      });

      it('should be called once target is loaded if "ready" event listener is configured', function () {

        // Need to init the slide deck proxy directly with a window object like when you use window.open()
        slideDeckProxy = prezento.createSlideDeckProxy(fakeIframe.contentWindow);
        slideDeckProxy.init = jasmine.createSpy('slideDeckProxy.init');

        // Mock addEventListener to trigger event
        fakeIframe.contentWindow.addEventListener = createAddEventListenerMock('load');

        slideDeckProxy.configListeners({ ready: fn });
        fakeIframe.contentWindow.addEventListener().trigger({});
        expect(slideDeckProxy.init).toHaveBeenCalledWith();
      });
    });

    describe('action calls', function () {

      it('should be chainable', function () {
        prezento._actions.forEach(function (actionName) {
          expect(slideDeckProxy[actionName]()).toBe(slideDeckProxy);
        });
      });

      it('should use postMessage to target', function () {
        var target = fakeIframe.contentWindow;
        prezento._actions.forEach(function (actionName) {
          slideDeckProxy[actionName]('arg0', 'arg1');
          expect(target.postMessage).toHaveBeenCalledWith([actionName, 'arg0', 'arg1'], '*');
        });
      });
    });

    describe('when receiving an event', function () {

      var eventListenersConfig;

      beforeEach(function () {
        eventListenersConfig = {};
        prezento._events.forEach(function (eventName) {
          eventListenersConfig[eventName] = jasmine.createSpy(eventName + '.listener');
        });
      });

      it('should not fire any listener if not configured', function () {

        prezento._events.forEach(function (eventName) {
          window.addEventListener().trigger({ data: [eventName, 'arg0'] });
          expect(eventListenersConfig[eventName]).not.toHaveBeenCalledWith('arg0');
        });
      });

      it('should not fire any configured listeners if message is not a prezento event', function () {

        var listenersConfig = {
          unknownEvent: jasmine.createSpy('unknownEvent.listener')
        };

        slideDeckProxy.configListeners(listenersConfig);

        window.addEventListener().trigger({ data: ['unknown', 'arg0'] });
        expect(listenersConfig.unknownEvent).not.toHaveBeenCalled();
      });

      it('should fire respective configured listeners if message is a prezento event', function () {

        slideDeckProxy.configListeners(eventListenersConfig);

        prezento._events.forEach(function (eventName) {
          window.addEventListener().trigger({ data: [eventName, 'arg0'] });
          expect(eventListenersConfig[eventName]).toHaveBeenCalledWith('arg0');
        });
      });
    });
  });
});
