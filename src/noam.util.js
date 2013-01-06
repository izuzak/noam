  var noam = {};

  noam.util = {};

  // "deep" compare of two objects
  // taken from http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
  noam.util.areEquivalent = function(object1, object2) {
    if (object1 === object2) {
      return true;
    }

    if (object1 instanceof Date && object2 instanceof Date) {
      return object1.getTime() === object2.getTime();
    }

    if (object1 instanceof RegExp && object2 instanceof RegExp) {
      return object1.source === object2.source &&
             object1.global === object2.global &&
             object1.multiline === object2.multiline &&
             object1.lastIndex === object2.lastIndex &&
             object1.ignoreCase === object2.ignoreCase;
    }

    if (!(object1 instanceof Object) || !(object2 instanceof Object) ) {
      return false;
    }

    if (typeof object1 === 'undefined' || typeof object2 === 'undefined') {
      return false;
    }

    if (object1.constructor !== object2.constructor) {
      return false;
    }

    for (var p in object1) {
      if (!(p in object2)) {
        return false;
      }

      if (object1[p] === object2[p]) {
        continue;
      }

      if (typeof(object1[p]) !== "object") {
        return false;
      }

      if (!(noam.util.areEquivalent(object1[p], object2[p]))) {
        return false;
      }
    }

    for (p in object2) {
      if (!(p in object1)) {
        return false;
      }
    }

    return true;
  };

  // check if array arr contains obj starting from index startIndex
  noam.util.contains = function(arr, obj, startIndex) {
    startIndex = startIndex ? startIndex : 0;

    for (var i=startIndex; i<arr.length; i++) {
      if (noam.util.areEquivalent(arr[i], obj)) {
        return true;
      }
    }

    return false;
  };

  // returns the index of the leftmost obj instance in arr starting from startIndex or -1
  // if no instance of obj is found
  noam.util.index = function(arr, obj, startIndex) {
    var i = startIndex || 0;
    while (i < arr.length) {
      if (noam.util.areEquivalent(arr[i], obj)) {
        return i;
      }
      i++;
    }
    return -1;
  };

  // check if array arr1 contains all elements from array arr2
  noam.util.containsAll = function(arr1, arr2) {
    for (var i=0; i<arr2.length; i++) {
      if (!(noam.util.contains(arr1, arr2[i]))) {
        return false;
      }
    }

    return true;
  };

  // check if array arr1 contains any element from array arr2
  noam.util.containsAny = function(arr1, arr2) {
    for (var i=0; i<arr2.length; i++) {
      if (noam.util.contains(arr1, arr2[i])) {
        return true;
      }
    }

    return false;
  };

  // check if arrays arr1 and arr2 contain the same elements
  noam.util.areEqualSets = function(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }

    for (var i=0; i<arr1.length; i++) {
      if (!(noam.util.contains(arr2, arr1[i]))) {
        return false;
      }
    }

    return true;
  };

  // check if array arr1 contains the set obj
  noam.util.containsSet = function(arr1, obj) {
    for (var i=0; i<arr1.length; i++) {
      if (noam.util.areEqualSets(arr1[i], obj)) {
        return true;
      }
    }

    return false;
  };

  // returns an unsorted array representation of the union of the two arrays arr1 and arr2
  // with each element included exactly once, regardless of the count in arr1 and arr2
  noam.util.setUnion = function(arr1, arr2) {
    var res = [];
    var i;
    for (i=0; i<arr1.length; i++) {
      // this will not include duplicates from arr1
      if (!noam.util.contains(res, arr1[i])) {
        res.push(arr1[i]);
      }
    }
    for (i=0; i<arr2.length; i++) {
      if (!noam.util.contains(res, arr2[i])) {
        res.push(arr2[i]);
      }
    }
    return res;
  };

  // returns an unsorted array representation of the intersection of the two
  // arrays arr1 and arr2 with each element included exactly once, regardless
  // of the count in arr1 and arr2
  noam.util.setIntersection = function(arr1, arr2) {
    var res = [];
    var i;
    for (i=0; i<arr1.length; i++) {
      if (noam.util.contains(arr2, arr1[i])) {
        res.push(arr1[i]);
      }
    }

    return res;
  };

  // make a deep clone of an object
  noam.util.clone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };


  // Returns an object that is basically an integer reference useful for counting
  // across multiple function calls. The current value can be accessed through the
  // value property.
  // See the noam.re.tree.toAutomaton function for a usage example.
  noam.util.makeCounter = (function() {
    function getAndAdvance() {
      return this.value++;
    }

    function makeCounter(init) {
      return {
        value: init,
        getAndAdvance: getAndAdvance
      };
    }

    return makeCounter;
  })();


  // Returns a random integer from the interval [from, to].
  noam.util.randint = function(from, to) {
    return Math.floor(Math.random()*(to-from+1)) + from;
  };
