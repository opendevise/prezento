/*global jasmine:false, describe:false, beforeEach:false, it:false, expect: false, prezento: false */

'use strict';

describe('prezento._utils', function () {

  describe('parseMsg()', function () {

    var parseMsg = prezento._utils.parseMsg;

    it('should return null if msgEvt.data is not an array', function () {
      expect(parseMsg({ data: 'foobar' })).toBe(null);
    });

    it('should return null if msgEvt.data array length is not at least 1', function () {
      expect(parseMsg({ data: [] })).toBe(null);
    });

    it('should return null if msgEvt.data array first element is not an event or an action', function () {
      expect(parseMsg({ data: ['foobar'] })).toBe(null);
    });

    it('should identify event or action', function () {
      expect(parseMsg({ data: ['ready'] }).eventOrAction).toBe('ready');
    });

    it('should identify and accept empty args', function () {
      expect(parseMsg({ data: ['ready'] }).args).toEqual([]);
    });

    it('should identify and accept one arg', function () {
      expect(parseMsg({ data: ['goTo', '4.2'] }).args).toEqual(['4.2']);
    });

    it('should identify and accept more than one arg', function () {
      expect(parseMsg({ data: ['goTo', '4.2', 'fakeArg1', 'fakeArg2'] }).args).toEqual(['4.2', 'fakeArg1', 'fakeArg2']);
    });
  });

  describe('ucfirst()', function () {

    var ucfirst = prezento._utils.ucfirst;

    it('should uppercase first letter of lowercase strings', function () {
      expect(ucfirst('foobar')).toBe('Foobar');
    });

    it('should let first letter already uppercased as is', function () {
      expect(ucfirst('Foobar')).toBe('Foobar');
    });

    it('should not modify case of other letters', function () {
      expect(ucfirst('fooBar')).toBe('FooBar');
    });
  });

  describe('postMsg()', function () {

    var postMsg = prezento._utils.postMsg,
        createArguments = function () {
          return arguments;
        },
        target;

    beforeEach(function () {
      target = {
        postMessage: jasmine.createSpy('postMessage')
      };
    });

    it('should call postMessage on target', function () {
      postMsg(target, 'goTo', createArguments('4.2'));
      expect(target.postMessage).toHaveBeenCalled();
    });

    it('should transform event or action name with no args to an array', function () {
      postMsg(target, 'goTo', createArguments());
      expect(target.postMessage).toHaveBeenCalledWith(['goTo'], '*');
    });

    it('should transform event or action name with one arg to an array', function () {
      postMsg(target, 'goTo', createArguments('4.2'));
      expect(target.postMessage).toHaveBeenCalledWith(['goTo', '4.2'], '*');
    });

    it('should transform event or action name with more than one arg to an array', function () {
      postMsg(target, 'goTo', createArguments('4.2', 'foo', 'bar'));
      expect(target.postMessage).toHaveBeenCalledWith(['goTo', '4.2', 'foo', 'bar'], '*');
    });
  });

  describe('getMetas()', function () {

    var getMetas = prezento._utils.getMetas;

    it('should get meta names and contents from DOM', function () {
      document.body.innerHTML += '<meta name="aaa" content="aaa content"><meta name="bbb" content="bbb content">';
      var metas = getMetas();
      expect(metas.aaa).toBe('aaa content');
      expect(metas.bbb).toBe('bbb content');
    });
  });
});
