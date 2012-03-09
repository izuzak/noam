describe("UTIL", function() {
  var noamUtil = require("../noam.js").util;

  describe("areEquivalent", function() {
    it("undefined test", function() {
      x = "3";

      expect(function(){ noamUtil.areEquivalent(x); }).toThrow();
    });
    
    it("simple object test", function() {
      var x = { a : 1, b : "2", c : null};
      var y = { b : "2", c : null, a : 1};
      var z = { b : "3", c : null, a : 1};
      var w = { c : null, a : 1 };
      
      expect(noamUtil.areEquivalent(x, y)).toEqual(true);
      expect(noamUtil.areEquivalent(y, x)).toEqual(true);
      expect(noamUtil.areEquivalent(x, z)).toEqual(false);
      expect(noamUtil.areEquivalent(z, x)).toEqual(false);
      expect(noamUtil.areEquivalent(x, w)).toEqual(false);
      expect(noamUtil.areEquivalent(w, x)).toEqual(false);
    });

    it("nested object test", function() {
      var x = { a : 1, b : { d : { e : 2 }, f : "3" }, c : null };
      var y = { a : 1, b : { d : { e : 2 }, f : "3" }, c : null };
      var w = { a : 1, b : { d : { e : 3 }, f : "3" }, c : null };
      
      expect(noamUtil.areEquivalent(x, y)).toEqual(true);
      expect(noamUtil.areEquivalent(x, w)).toEqual(false);
    });

    it("arrays and ordering in arrays", function() {
      var x = [1, 2, null, { a : [4, 5, 6] }];
      var y = [1, 2, null, { a : [4, 5, 6] }];
      var z = [2, 1, null, { a : [4, 5, 6] }];
      var w = [1, 2];
      
      expect(noamUtil.areEquivalent(x, y)).toEqual(true);
      expect(noamUtil.areEquivalent(x, z)).toEqual(false);
      expect(noamUtil.areEquivalent(x, w)).toEqual(false);
    });
  });

  describe("contains", function() {
    it("nested objects and null", function() {
      var x = [1, 2, null, { a : [4, 5, 6] }];
      var y = 2;
      var z = null;
      var w = { a : [4, 5, 6] };
      var q = 3;

      expect(noamUtil.contains(x, y)).toEqual(true);
      expect(noamUtil.contains(x, z)).toEqual(true);
      expect(noamUtil.contains(x, w)).toEqual(true);
      expect(noamUtil.contains(x, q)).toEqual(false);
    });
  });

  describe("containsAll", function() {
    it("nested objects and null", function() {
      var x = [1, 2, null, { a : [4, 5, 6] }];
      var y = [2, null, { a : [4, 5, 6] }, 1];
      var z = [4, 1, 2, null, { a : [4, 5, 6] }];
      var w = [1, 2, { a : [4, 5, 6] }];

      expect(noamUtil.containsAll(x, y)).toEqual(true);
      expect(noamUtil.containsAll(x, w)).toEqual(true);
      expect(noamUtil.containsAll(x, z)).toEqual(false);
    })
  });

  describe("containsAny", function() {
    it("nested objects and null", function() {
      var x = [1, 2, null, { a : [4, 5, 6] }];
      var y = [2, null, { a : [4, 5, 6] }, 1];
      var z = [4];
      var w = [1, 2, { a : [4, 5, 6] }];

      expect(noamUtil.containsAny(x, y)).toEqual(true);
      expect(noamUtil.containsAny(x, w)).toEqual(true);
      expect(noamUtil.containsAny(x, z)).toEqual(false);
    });
  });

  describe("clone", function() {
    it("nested objects and null", function() {
      var x = [1, 2, null, { a : [4, 5, 6] }];
      var y = noamUtil.clone(x);
      expect(x).toEqual(y);
    });
  });
});

