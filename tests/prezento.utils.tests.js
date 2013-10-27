/*global jasmine:false, describe:false, beforeEach:false, it:false, expect: false, prezento: false */

'use strict';

describe('prezento._utils', function () {

  describe('parseMsg()', function () {

    var parseMsg = prezento._utils.parseMsg,
        callback;

    beforeEach(function () {
      callback = jasmine.createSpy('callback')
    });

    it('should not execute callback if msgEvt.data is not an array', function () {
      parseMsg({ data: 'foobar' }, callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should not execute callback if msgEvt.data array length is not at least 1', function () {
      parseMsg({ data: [] }, callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should not execute callback if msgEvt.data array first element is not an event or an action', function () {
      parseMsg({ data: ['foobar'] }, callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should execute callback with event or action and accept empty args', function () {
      parseMsg({ data: ['next'] }, callback);
      expect(callback).toHaveBeenCalledWith('next', []);
    });

    it('should execute callback with event or action and accept one arg', function () {
      parseMsg({ data: ['goTo', '4.2'] }, callback);
      expect(callback).toHaveBeenCalledWith('goTo', ['4.2']);
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

    beforeEach(function () {
      var metas = Array.prototype.slice.call(document.head.querySelectorAll('meta'));
      metas.forEach(function (meta) {
        meta.parentNode.removeChild(meta);
      });
    });

    it('should get meta names and contents from DOM', function () {
      document.head.innerHTML += '<meta name="aaa" content="aaa content"><meta name="bbb" content="bbb content">';
      var metas = getMetas();
      expect(metas.aaa).toBe('aaa content');
      expect(metas.bbb).toBe('bbb content');
    });

    it('should ignore metas that do not have a name and a content attribute', function () {
      document.head.innerHTML += '<meta charset="utf-8"><meta name="aaa"><meta content="bbb content">';
      var metas = getMetas();
      expect(metas).toEqual({});
    });
  });

  describe('mergeProps()', function () {

    var mergeProps = prezento._utils.mergeProps;

    it('should overide or set mergedObject property values defined on newStuffsObject and let other', function () {

      var mergedObject = {
            aaa: 'aaa',
            bbb: 'bbb',
            ccc: 'ccc'
          },
          newStuffsObject = {
            bbb: 'BBB',
            ddd: 'DDD'
          };

      mergeProps(mergedObject, newStuffsObject);

      expect(mergedObject.aaa).toBe('aaa');
      expect(mergedObject.bbb).toBe('BBB');
      expect(mergedObject.ccc).toBe('ccc');
      expect(mergedObject.ddd).toBe('DDD');
    });
  });
});
