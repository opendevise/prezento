/*global jasmine:false, describe:false, beforeEach:false, it:false, expect: false, prezento: false */

'use strict';

describe('prezento', function () {

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

  var createFakeMessageEvent = function (data) {
    return {
      data: data,
      source: {
        postMessage: function () {
        }
      }
    };
  };

  var notifyFnName = function (eventName) {
    return 'notify' + prezento._utils.ucfirst(eventName);
  };

  var slideDeckInfos = {
    steps: [],
    features: []
  };

  var fn = function () {
  };

  describe('createShellProxy()', function () {

    var createShellProxy = prezento.createShellProxy;

    var expectValidShellProxy = function (shellProxy) {
      expect(shellProxy).not.toBeUndefined();
      expect(shellProxy.configListeners).toEqual(jasmine.any(Function));
      expect(shellProxy.configGetters).toEqual(jasmine.any(Function));

      prezento._events.forEach(function (eventName) {
        expect(shellProxy[notifyFnName(eventName)]).toEqual(jasmine.any(Function));
      });
    };

    it('should return null if slideDeckInfos not an object', function () {
      expect(createShellProxy(42)).toBeNull();
      expect(createShellProxy('foobar')).toBeNull();
    });

    it('should return null if slideDeckInfos does not have a steps array', function () {
      expect(createShellProxy({ features: [] })).toBeNull();
    });

    it('should return null if slideDeckInfos does not have a features array', function () {
      expect(createShellProxy({ steps: [] })).toBeNull();
    });

    it('should return null if slideDeckInfos is null or undefined', function () {
      expect(createShellProxy(null)).toBeNull();
      expect(createShellProxy()).toBeNull();
    });

    it('should return a valid shell proxy if slideDeckInfos is an object with a steps and features array', function () {
      expectValidShellProxy(createShellProxy(slideDeckInfos));
    });

    it('should add message event listener on window', function () {
      window.addEventListener = jasmine.createSpy('addEventListener');
      createShellProxy(slideDeckInfos);
      expect(window.addEventListener).toHaveBeenCalledWith('message', jasmine.any(Function), false);
    });
  });

  describe('shellProxy instance', function () {

    var shellProxy;

    beforeEach(function () {
      window.addEventListener = createAddEventListenerMock('message');
      shellProxy = prezento.createShellProxy(slideDeckInfos);
    });

    describe('configListeners()', function () {

      it('should be chainable', function () {
        expect(shellProxy.configListeners({ goTo: fn })).toBe(shellProxy);
      });
    });

    describe('configGetters()', function () {

      it('should be chainable', function () {
        expect(shellProxy.configGetters({ cursor: fn })).toBe(shellProxy);
      });
    });

    describe('notifyReady()', function () {

      var fakeInitMessageEvent = createFakeMessageEvent(['init']);

      beforeEach(function () {
        shellProxy.notifyReady = jasmine.createSpy('shellProxy.notifyReady');
      });

      it('should not be called when init action is received and cursor and step getters are not configured', function () {
        window.addEventListener().trigger(fakeInitMessageEvent);
        expect(shellProxy.notifyReady).not.toHaveBeenCalled();
      });

      it('should be called when init action is received and cursor and step getters are configured', function () {

        shellProxy.configGetters({
          cursor: fn,
          step: fn
        });

        window.addEventListener().trigger(fakeInitMessageEvent);
        expect(shellProxy.notifyReady).toHaveBeenCalled();
      });
    });

    describe('when receiving an action', function () {

      var actionListenersConfig,
          cursorGetter = function () {
            return 'cursor';
          },
          stepGetter = function () {
            return 'step';
          };

      beforeEach(function () {

        shellProxy.configGetters({
          cursor: cursorGetter,
          step: stepGetter
        });

        shellProxy.notifyCursor = jasmine.createSpy('shellProxy.notifyCursor');
        shellProxy.notifyStep = jasmine.createSpy('shellProxy.notifyStep');

        actionListenersConfig = {};
        prezento._actions.forEach(function (actionName) {
          actionListenersConfig[actionName] = jasmine.createSpy(actionName + '.listener');
        });
      });

      it('should not fire any listener if not configured but should notify cursor and step', function () {

        prezento._actions.forEach(function (actionName) {
          var fakeMessageEvent = createFakeMessageEvent([actionName, 'arg0']);
          window.addEventListener().trigger(fakeMessageEvent);
          expect(actionListenersConfig[actionName]).not.toHaveBeenCalled();
          expect(shellProxy.notifyCursor).toHaveBeenCalledWith('cursor');
          expect(shellProxy.notifyStep).toHaveBeenCalledWith('step');
        });
      });

      it('should not fire any configured listeners if message is not a prezento event but should notify cursor and step', function () {

        var listenersConfig = {
          unknownEvent: jasmine.createSpy('unknownEvent.listener')
        };

        shellProxy.configListeners(listenersConfig);

        window.addEventListener().trigger(createFakeMessageEvent(['unknown', 'arg0']));
        expect(listenersConfig.unknownEvent).not.toHaveBeenCalled();
        expect(shellProxy.notifyCursor).not.toHaveBeenCalled();
        expect(shellProxy.notifyStep).not.toHaveBeenCalled();
      });

      it('should fire respective configured listeners if message is a prezento action and should notify cursor and step', function () {

        shellProxy.configListeners(actionListenersConfig);

        prezento._actions.forEach(function (actionName) {
          window.addEventListener().trigger(createFakeMessageEvent([actionName, 'arg0']));
          expect(actionListenersConfig[actionName]).toHaveBeenCalledWith('arg0');
          expect(shellProxy.notifyCursor).toHaveBeenCalledWith('cursor');
          expect(shellProxy.notifyStep).toHaveBeenCalledWith('step');
        });
      });

      it('should notify notes if getter is configured', function () {

        shellProxy.configListeners(actionListenersConfig);
        shellProxy.configGetters({
          notes: function () {
            return 'notes';
          }
        });
        shellProxy.notifyNotes = jasmine.createSpy('shellProxy.notifyNotes');

        prezento._actions.forEach(function (actionName) {
          window.addEventListener().trigger(createFakeMessageEvent([actionName, 'arg0']));
          expect(shellProxy.notifyNotes).toHaveBeenCalledWith('notes');
        });
      });
    });
  });
});
