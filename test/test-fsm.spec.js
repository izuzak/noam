describe("FSM", function() {
  var noamFsm = require('../noam.js').fsm;
  var noamUtil = require('../noam.js').util;

  describe("Constants", function() {
    it("DFA constant is valid", function() {
      expect(noamFsm.dfaType).toEqual('DFA');
    });
    
    it("NFA constant is valid", function() {
      expect(noamFsm.nfaType).toEqual('NFA');
    });
    
    it("eNFA constant is valid", function() {
      expect(noamFsm.enfaType).toEqual('eNFA');
    });
    
    it("Epsilon symbol constant is valid", function() {
      expect(noamFsm.epsilonSymbol).toEqual('$');
    });
  });

  describe("Validate", function() {
    var fsm1 = {
      states : ["s1", "s2", "s3", "s4", "s5"],
      alphabet : ["a", "b", "c"],
      acceptingStates : ["s2", "s3"],
      initialState : "s1",
      transitions : [
        { fromState : "s1", toStates : ["s2"], symbol : "$"},
        { fromState : "s1", toStates : ["s3"], symbol : "b"},
        { fromState : "s2", toStates : ["s3", "s2", "s1"], symbol : "a"},
        { fromState : "s3", toStates : ["s1"], symbol : "c"},
        { fromState : "s4", toStates : ["s4", "s5"], symbol : "c"},
        { fromState : "s5", toStates : ["s1"], symbol : "$"}
      ]
    };

    it("Should be valid", function() {
      expect(noamFsm.validate(fsm1)).toEqual(true);
    });

    it("Should not be valid - must have initial state", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.initialState = null;
      expect(noamFsm.validate(fsm2)).not.toEqual(true);
    });

    it("Should not be valid - must have at least one state", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.states = [];
      expect(noamFsm.validate(fsm2)).not.toEqual(true);
    });

    it("Should not be valid - must have at least one symbol", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.alphabet = null;
      expect(noamFsm.validate(fsm2)).not.toEqual(true);
    });

    it("Should not be valid - symbols and states mut not overlap", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.states.push("a");
      expect(noamFsm.validate(fsm2)).not.toEqual(true);
    });

    it("Should not be valid - no duplicate states", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.states.push("s1");
      expect(noamFsm.validate(fsm2)).not.toEqual(true);
    });

    it("Should not be valid - no duplicate symbols", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.alphabet.push("a");
      expect(noamFsm.validate(fsm2)).not.toEqual(true);
    });

    it("Should not be valid - must have no duplicate states in transition toStates", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.transitions.push({fromState : "s1", symbol : "a", toStates : ["s1", "s1"]});
      expect(noamFsm.validate(fsm2)).not.toEqual(true);
    });

    it("Should not be valid - must have no duplicate transitions", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.transitions.push({fromState : "s1", symbol : "b", toStates : ["s3"]});
      expect(noamFsm.validate(fsm2)).not.toEqual(true);
    });

    it("Should not be valid - must have no overlaping transitions", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.transitions.push({fromState : "s2", symbol : "a", toStates : ["s2"]});
      expect(noamFsm.validate(fsm2)).not.toEqual(true);
    });
  });

  describe("DetermineType", function() {
    var fsm1 = {
      states : ["s1", "s2", "s3",],
      alphabet : ["a", "b"],
      acceptingStates : ["s2", "s3"],
      initialState : "s3",
      transitions : [
        { fromState : "s1", toStates : ["s2"], symbol : "a"},
        { fromState : "s1", toStates : ["s3"], symbol : "b"},
        { fromState : "s2", toStates : ["s3"], symbol : "a"},
        { fromState : "s2", toStates : ["s1"], symbol : "b"},
        { fromState : "s3", toStates : ["s2"], symbol : "a"},
        { fromState : "s3", toStates : ["s1"], symbol : "b"}
      ]
    };

    it("Should detect DFA", function() {
      expect(noamFsm.determineType(fsm1)).toEqual(noamFsm.dfaType);
    });

    it("Should detect NFA for multiple toStates", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.transitions[0].toStates.push("s1");
      expect(noamFsm.determineType(fsm2)).toEqual(noamFsm.nfaType);
    });

    it("Should detect NFA for missing transitions", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.transitions.pop();
      expect(noamFsm.determineType(fsm2)).toEqual(noamFsm.nfaType);
    });

    it("Should detect eNFA for epsilon transitions", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.transitions[0].symbol = noamFsm.epsilonSymbol;
      expect(noamFsm.determineType(fsm2)).toEqual(noamFsm.enfaType);
    });
  });

  describe("computeEpsilonArea", function() {
    var fsm1 = {
      states : ["s1", "s2", "s3", "s4", "s5"],
      alphabet : ["a", "b", "c"],
      acceptingStates : ["s2", "s3"],
      initialState : "s1",
      transitions : [
        { fromState : "s1", toStates : ["s2"], symbol : "$"},
        { fromState : "s1", toStates : ["s3"], symbol : "b"},
        { fromState : "s2", toStates : ["s3", "s2", "s1"], symbol : "a"},
        { fromState : "s3", toStates : ["s1"], symbol : "c"},
        { fromState : "s4", toStates : ["s4", "s5"], symbol : "$"},
        { fromState : "s5", toStates : ["s1", "s4"], symbol : "$"}
      ]
    };

    it("Handles non-epsilon transitions", function() {
      expect(noamFsm.computeEpsilonArea(fsm1, ["s2"])).toEqual(["s2"]);
    });

    it("Handles simple, nonlooping epsilon transitions", function() {
      expect(noamFsm.computeEpsilonArea(fsm1, ["s1"])).toEqual(["s1", "s2"]);
    });

    it("Handles looping epsilon transitions", function() {
      expect(noamFsm.computeEpsilonArea(fsm1, ["s4"])).toEqual(["s4", "s5", "s1", "s2"]);
    });

    it("Handles multiple starting states", function() {
      expect(noamFsm.computeEpsilonArea(fsm1, ["s1", "s3"])).toEqual(["s3", "s1", "s2"]);
    });
  });

  describe("makeSimpleTransition", function() {
    var fsm1 = {
      states : ["s1", "s2", "s3", "s4", "s5"],
      alphabet : ["a", "b", "c"],
      acceptingStates : ["s2", "s3"],
      initialState : "s1",
      transitions : [
        { fromState : "s1", toStates : ["s2"], symbol : "$"},
        { fromState : "s1", toStates : ["s3"], symbol : "b"},
        { fromState : "s2", toStates : ["s3", "s2", "s1"], symbol : "b"},
        { fromState : "s3", toStates : ["s1"], symbol : "c"},
        { fromState : "s4", toStates : ["s4", "s5"], symbol : "$"},
        { fromState : "s5", toStates : ["s1", "s4"], symbol : "$"}
      ]
    };

    it("Handles single states as start", function() {
      expect(noamFsm.makeSimpleTransition(fsm1, ["s1"], "b")).toEqual(["s3"]);
    });

    it("Handles multiple states as start", function() {
      expect(noamFsm.makeSimpleTransition(fsm1, ["s1", "s2"], "b")).toEqual(["s3", "s2", "s1"]);
    });
  });

  describe("makeTransition", function() {
    var fsm1 = {
      states : ["s1", "s2", "s3", "s4", "s5"],
      alphabet : ["a", "b", "c"],
      acceptingStates : ["s2", "s3"],
      initialState : "s1",
      transitions : [
        { fromState : "s1", toStates : ["s2"], symbol : "$"},
        { fromState : "s1", toStates : ["s3"], symbol : "b"},
        { fromState : "s2", toStates : ["s3", "s2", "s1"], symbol : "b"},
        { fromState : "s3", toStates : ["s1"], symbol : "c"},
        { fromState : "s4", toStates : ["s4", "s5"], symbol : "$"},
        { fromState : "s5", toStates : ["s1", "s4"], symbol : "$"}
      ]
    };

    it("Works", function() {
      expect(noamFsm.makeTransition(fsm1, ["s4"], "b")).toEqual(["s1", "s2", "s3"]);
    });
  });

  describe("readString", function() {
    var fsm1 = {
      states : ["s1", "s2", "s3", "s4", "s5"],
      alphabet : ["a", "b", "c"],
      acceptingStates : ["s2", "s3"],
      initialState : "s1",
      transitions : [
        { fromState : "s1", toStates : ["s2"], symbol : "a"},
        { fromState : "s1", toStates : ["s3"], symbol : "b"},
        { fromState : "s2", toStates : ["s3", "s1", "s4"], symbol : "$"},
        { fromState : "s3", toStates : ["s1"], symbol : "c"},
        { fromState : "s4", toStates : ["s4", "s5"], symbol : "$"},
        { fromState : "s5", toStates : ["s1", "s4"], symbol : "$"}
      ]
    };

    it("Work for an empty string", function() {
      expect(noamFsm.readString(fsm1, [])).toEqual(["s1"]);
    });

    it("Works", function() {
      expect(noamFsm.readString(fsm1, ["a", "a", "b"])).toEqual(["s3"]);
    });

    it("Works 2", function() {
      expect(noamFsm.readString(fsm1, ["a", "b", "b", "a"])).toEqual([]);
    });
  });

  describe("isStringInLanguage", function() {
    var fsm1 = {
      states : ["s1", "s2", "s3", "s4", "s5"],
      alphabet : ["a", "b", "c"],
      acceptingStates : ["s2", "s3"],
      initialState : "s1",
      transitions : [
        { fromState : "s1", toStates : ["s2"], symbol : "a"},
        { fromState : "s1", toStates : ["s3"], symbol : "b"},
        { fromState : "s2", toStates : ["s3", "s1", "s4"], symbol : "$"},
        { fromState : "s3", toStates : ["s1"], symbol : "c"},
        { fromState : "s4", toStates : ["s4", "s5"], symbol : "$"},
        { fromState : "s5", toStates : ["s1", "s4"], symbol : "$"}
      ]
    };

    it("Work for an empty string", function() {
      expect(noamFsm.isStringInLanguage(fsm1, [])).toEqual(false);
    });

    it("Works", function() {
      expect(noamFsm.isStringInLanguage(fsm1, ["a", "a", "b"])).toEqual(true);
    });

    it("Works 2", function() {
      expect(noamFsm.isStringInLanguage(fsm1, ["a", "b", "b", "a"])).toEqual(false);
    });

  });

  describe("printTable", function() {
  });
  
  describe("printDotFormat", function() {
  });

  describe("removeUnreachableStates", function() {    
    var fsm1 = {
      states : ["1", "2", "3"],
      alphabet : ["a", "b", "c"],
      acceptingStates : ["2", "3"],
      initialState : "1",
      transitions : [
        { fromState : "1", toStates : ["2"], symbol : "a"},
        { fromState : "1", toStates : ["1"], symbol : "b"},
        { fromState : "1", toStates : ["1"], symbol : "c"},
        { fromState : "2", toStates : ["3"], symbol : "a"},
        { fromState : "2", toStates : ["3"], symbol : "b"},
        { fromState : "2", toStates : ["3"], symbol : "c"},
        { fromState : "3", toStates : ["1"], symbol : "a"},
        { fromState : "3", toStates : ["3"], symbol : "b"},
        { fromState : "3", toStates : ["2"], symbol : "c"}
      ]
    };

    it("No unreachable states", function() {
      expect(noamFsm.removeUnreachableStates(fsm1).states.length).toEqual(fsm1.states.length);
    });

    it("Single unreachable state", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.transitions[3].toStates = ["1"];
      fsm2.transitions[4].toStates = ["1"];
      fsm2.transitions[5].toStates = ["2"];
      expect(noamFsm.removeUnreachableStates(fsm2).states.length).toEqual(fsm1.states.length - 1);
    });

    var fsm3 = {
      states : ["1", "2", "3", "4", "5"],
      alphabet : ["a", "b", "c"],
      acceptingStates : ["2", "3", "4"],
      initialState : "1",
      transitions : [
        { fromState : "1", toStates : ["2"], symbol : "a"},
        { fromState : "1", toStates : ["1"], symbol : "b"},
        { fromState : "1", toStates : ["1"], symbol : "c"},
        { fromState : "2", toStates : ["1"], symbol : "a"},
        { fromState : "2", toStates : ["1"], symbol : "b"},
        { fromState : "2", toStates : ["2"], symbol : "c"},
        { fromState : "3", toStates : ["1"], symbol : "a"},
        { fromState : "3", toStates : ["3"], symbol : "b"},
        { fromState : "3", toStates : ["2"], symbol : "c"},
        { fromState : "4", toStates : ["2"], symbol : "a"},
        { fromState : "4", toStates : ["1"], symbol : "b"},
        { fromState : "4", toStates : ["3"], symbol : "c"},
        { fromState : "5", toStates : ["3"], symbol : "a"},
        { fromState : "5", toStates : ["4"], symbol : "b"},
        { fromState : "5", toStates : ["1"], symbol : "c"}
      ]
    };

    it("Multiple unreachable states", function() {
      expect(noamFsm.removeUnreachableStates(fsm1).states.length).toEqual(3);
    });
  });

  describe("areEquivalentStates", function() {
    var fsm1 = {
      states : ["p1", "p2", "p3", "p4", "p5", "p6", "p7"],
      initialState : "p1",
      acceptingStates : ["p5", "p6", "p7"],
      alphabet : ["c", "d"],
      transitions : [
        { fromState : "p1", symbol : "c", toStates : ["p6"] },
        { fromState : "p1", symbol : "d", toStates : ["p3"] },
        { fromState : "p2", symbol : "c", toStates : ["p7"] },
        { fromState : "p2", symbol : "d", toStates : ["p3"] },
        { fromState : "p3", symbol : "c", toStates : ["p1"] },
        { fromState : "p3", symbol : "d", toStates : ["p5"] },
        { fromState : "p4", symbol : "c", toStates : ["p4"] },
        { fromState : "p4", symbol : "d", toStates : ["p6"] },
        { fromState : "p5", symbol : "c", toStates : ["p7"] },
        { fromState : "p5", symbol : "d", toStates : ["p3"] },
        { fromState : "p6", symbol : "c", toStates : ["p4"] },
        { fromState : "p6", symbol : "d", toStates : ["p1"] },
        { fromState : "p7", symbol : "c", toStates : ["p4"] },
        { fromState : "p7", symbol : "d", toStates : ["p2"] }
      ]
    };

    it("Are equivalent", function() {
      expect(noamFsm.areEquivalentStates(fsm1, "p7", fsm1, "p6")).toEqual(true);
    });

    it("Are not equivalent", function() {
      expect(noamFsm.areEquivalentStates(fsm1, "p1", fsm1, "p6")).toEqual(false);
    });
  });

  describe("areEquivalentFSMs", function() {
    var fsm1 = {
      states : ["p1", "p2", "p3", "p4", "p5", "p6", "p7"],
      initialState : "p1",
      acceptingStates : ["p5", "p6", "p7"],
      alphabet : ["c", "d"],
      transitions : [
        { fromState : "p1", symbol : "c", toStates : ["p6"] },
        { fromState : "p1", symbol : "d", toStates : ["p3"] },
        { fromState : "p2", symbol : "c", toStates : ["p7"] },
        { fromState : "p2", symbol : "d", toStates : ["p3"] },
        { fromState : "p3", symbol : "c", toStates : ["p1"] },
        { fromState : "p3", symbol : "d", toStates : ["p5"] },
        { fromState : "p4", symbol : "c", toStates : ["p4"] },
        { fromState : "p4", symbol : "d", toStates : ["p6"] },
        { fromState : "p5", symbol : "c", toStates : ["p7"] },
        { fromState : "p5", symbol : "d", toStates : ["p3"] },
        { fromState : "p6", symbol : "c", toStates : ["p4"] },
        { fromState : "p6", symbol : "d", toStates : ["p1"] },
        { fromState : "p7", symbol : "c", toStates : ["p4"] },
        { fromState : "p7", symbol : "d", toStates : ["p2"] }
      ]
    };

    it("Are equivalent", function() {
      expect(noamFsm.areEquivalentFSMs(fsm1, fsm1)).toEqual(true);
    });

    it("Are not equivalent", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.acceptingStates.push("p4");
      expect(noamFsm.areEquivalentFSMs(fsm1, fsm2)).toEqual(false);
    });
  });

  describe("removeEquivalentStates", function() {
    var fsm1 = {
      states : ["p1", "p2", "p3", "p4", "p5", "p6", "p7"],
      initialState : "p1",
      acceptingStates : ["p5", "p6", "p7"],
      alphabet : ["c", "d"],
      transitions : [
        { fromState : "p1", symbol : "c", toStates : ["p6"] },
        { fromState : "p1", symbol : "d", toStates : ["p3"] },
        { fromState : "p2", symbol : "c", toStates : ["p7"] },
        { fromState : "p2", symbol : "d", toStates : ["p3"] },
        { fromState : "p3", symbol : "c", toStates : ["p1"] },
        { fromState : "p3", symbol : "d", toStates : ["p5"] },
        { fromState : "p4", symbol : "c", toStates : ["p4"] },
        { fromState : "p4", symbol : "d", toStates : ["p6"] },
        { fromState : "p5", symbol : "c", toStates : ["p7"] },
        { fromState : "p5", symbol : "d", toStates : ["p3"] },
        { fromState : "p6", symbol : "c", toStates : ["p4"] },
        { fromState : "p6", symbol : "d", toStates : ["p1"] },
        { fromState : "p7", symbol : "c", toStates : ["p4"] },
        { fromState : "p7", symbol : "d", toStates : ["p2"] }
      ]
    };

    it("Works", function() {
      expect(noamFsm.removeEquivalentStates(fsm1).states.length).toEqual(5);
    });
  });

  describe("minimize", function() {
    var fsm1 = {
      states : ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"],
      initialState : "p1",
      acceptingStates : ["p5", "p6", "p7"],
      alphabet : ["c", "d"],
      transitions : [
        { fromState : "p1", symbol : "c", toStates : ["p6"] },
        { fromState : "p1", symbol : "d", toStates : ["p3"] },
        { fromState : "p2", symbol : "c", toStates : ["p7"] },
        { fromState : "p2", symbol : "d", toStates : ["p3"] },
        { fromState : "p3", symbol : "c", toStates : ["p1"] },
        { fromState : "p3", symbol : "d", toStates : ["p5"] },
        { fromState : "p4", symbol : "c", toStates : ["p4"] },
        { fromState : "p4", symbol : "d", toStates : ["p6"] },
        { fromState : "p5", symbol : "c", toStates : ["p7"] },
        { fromState : "p5", symbol : "d", toStates : ["p3"] },
        { fromState : "p6", symbol : "c", toStates : ["p4"] },
        { fromState : "p6", symbol : "d", toStates : ["p1"] },
        { fromState : "p7", symbol : "c", toStates : ["p4"] },
        { fromState : "p7", symbol : "d", toStates : ["p2"] },
        { fromState : "p8", symbol : "c", toStates : ["p1"] },
        { fromState : "p8", symbol : "d", toStates : ["p6"] }
      ]
    };
    
    it("Works", function() {
      expect(noamFsm.minimize(fsm1).states.length).toEqual(5);
    });
  });

  describe("transitionTrail", function() {
    var fsm1 = {
      states : ["s1", "s2", "s3", "s4", "s5"],
      alphabet : ["a", "b", "c"],
      acceptingStates : ["s2", "s3"],
      initialState : "s1",
      transitions : [
        { fromState : "s1", toStates : ["s2"], symbol : "a"},
        { fromState : "s1", toStates : ["s3"], symbol : "b"},
        { fromState : "s2", toStates : ["s3", "s1", "s4"], symbol : "$"},
        { fromState : "s3", toStates : ["s1"], symbol : "c"},
        { fromState : "s4", toStates : ["s4", "s5"], symbol : "$"},
        { fromState : "s5", toStates : ["s1", "s4"], symbol : "$"}
      ]
    };

    it("Works", function() {
      expect(noamFsm.transitionTrail(fsm1, "s1", ["a", "b"])).toEqual(
        [ [ 's1' ], [ 's2', 's4', 's5', 's1', 's3' ], [ 's3' ] ]);
    });
  });
});
