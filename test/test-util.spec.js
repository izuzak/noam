describe("UTIL", function() {
  var noamUtil = require("../lib/node/noam.js").util;

  describe("areEquivalent", function() {
    it("undefined test", function() {
      x = "3";

      expect(noamUtil.areEquivalent(x)).toEqual(false);
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
    });
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

  describe("setUnion", function() {
    it("returns an unordered array representing the union of the two argument arrays", function() {
      var a = [1, 2, [3, 4]];
      var b = [2, 3, 4];
      var union = noamUtil.setUnion(a, b);
      expect(union.length).toBe(5);
      var i;
      for (i=0; i<a.length; i++) {
        expect(noamUtil.contains(union, a[i])).toBeTruthy();
      }
      for (i=0; i<b.length; i++) {
        expect(noamUtil.contains(union, b[i])).toBeTruthy();
      }
    });

    it("does not include duplicates from either argument", function() {
      var a = [1, 2, 2];
      var b = [3, 1, 1];
      var union = noamUtil.setUnion(a, b);
      expect(union.length).toBe(3);
      var i;
      for (i=1; i<4; i++) {
        expect(noamUtil.contains(union, i)).toBeTruthy();
      }
    });
  });

  describe("clone", function() {
    it("nested objects and null", function() {
      var x = [1, 2, null, { a : [4, 5, 6] }];
      var y = noamUtil.clone(x);
      expect(x).toEqual(y);
    });
  });

  describe("makeCounter", function() {
    it("counts up from the specified start value", function() {
      var counter = noamUtil.makeCounter(0);
      expect(counter.getAndAdvance()).toBe(0);
      expect(counter.getAndAdvance()).toBe(1);
      expect(counter.value).toBe(2);

      counter = noamUtil.makeCounter(5);
      expect(counter.getAndAdvance()).toBe(5);
    });
  });

  describe("HashTable", function() {
    var H;

    beforeEach(function() {
      H = new noamUtil.HashTable();
      constH = new noamUtil.HashTable({
        hash: function(obj) { return 0; }
      });
    });

    it("implements the put-get-remove API", function() {
      H.put("a", 1);
      expect(H.get("a")).toBe(1);
      H.remove("a");
      expect(H.get("a")).toBe(undefined);
    });

    describe("put", function() {
      it("adds the provided key-value pair to the table", function() {
        H.put(1, "a");
        expect(H.get(1)).toEqual("a");
      });

      it("accepts any type of object for key and value", function() {
        H.put({}, "xyz");
        expect(H.get({})).toEqual("xyz");

        H.put({a: 1}, [1, 2, 3]);
        expect(noamUtil.areEquivalent(H.get({a: 1}), [1, 2, 3])).toBeTruthy();

        H.put({x: "abc", y: 10}, 321);
        expect(H.get({y: 10, x: "abc"})).toBe(321);
      });

      it("replaces the old value with the new one if the given key is already in the table",
          function() {
        H.put({}, "a");
        expect(H.get({})).toEqual("a");
        H.put({}, "b");
        expect(H.get({})).toEqual("b");

        H.put(123, "a");
        expect(H.get(123)).toEqual("a");
        H.put(123, "b");
        expect(H.get(123)).toEqual("b");
      });

      it("throws if the key or value equal undefined", function() {
        expect(function() { H.put(undefined, 1); }).toThrow();
        expect(function() { H.put(1, undefined); }).toThrow();
      });

      it("works for a constant hash function", function() {
        var i;
        for (i=0; i<10; i++) {
          constH.put(i, i + 10);
        }
        for (i=0; i<10; i++) {
          expect(constH.get(i)).toEqual(i + 10);
        }
      });
    });

    describe("get", function() {
      it("returns the value associated with the given key", function() {
        H.put(123, 321);
        expect(H.get(123)).toBe(321);
      });

      it("returns undefined if there is no key-value pair with the given key", function() {
        expect(H.get(123)).toBe(undefined);
        expect(H.get("123")).toBe(undefined);
        expect(H.get([123])).toBe(undefined);
      });

      it("throws if the passed key equals undefined", function() {
        expect(function() { H.get(undefined); }).toThrow();
      });
    });

    describe("remove", function() {
      it("removes the key-value pair with the given key from the table", function() {
        H.put(123, 321);
        expect(H.get(123)).toBe(321);
        H.remove(123);
        expect(H.get(123)).toBe(undefined);
      });

      it("does nothing if there is no key-value pair with the given key", function() {
        expect(function() { H.remove(123); }).not.toThrow();
      });

      it("throws if the passed key equals undefined", function() {
        expect(function() { H.remove(undefined); }).toThrow();
      });

      it("works for a constant hash function", function() {
        for (var i=0; i<3; i++) {
          constH.put(i, i + 10);
        }
        constH.remove(1);
        expect(constH.get(0)).toEqual(10);
        expect(constH.get(1)).toBe(undefined);
        expect(constH.get(2)).toEqual(12);
      });
    });
  });
});
