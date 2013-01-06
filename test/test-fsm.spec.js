// TODO: consider defining a custom exception matcher that would enable 
// error differentiation but not at the cost of committing to a specific error message
// something like http://stackoverflow.com/questions/4144686/how-to-write-a-test-which-expects-an-error-to-be-thrown

describe("FSM", function() {
  var noamFsm = require('../lib/node/noam.js').fsm;
  var noamUtil = require('../lib/node/noam.js').util;
  var noamRe = require('../lib/node/noam.js').re;

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

  describe("manipulation API", function() {
    var automaton;

    beforeEach(function() {
      automaton = noamFsm.makeNew();
    });

    it("can be used to create a valid automaton like this", function() {
      var i;
      for (i=0; i<3; i++) {
        noamFsm.addState(automaton, i);
      }
      noamFsm.setInitialState(automaton, 0);
      noamFsm.addAcceptingState(automaton, 2);
      noamFsm.addSymbol(automaton, "a");
      noamFsm.addSymbol(automaton, "b");
      noamFsm.addTransition(automaton, 0, [1], "a");
      noamFsm.addTransition(automaton, 1, [2], "b");
      noamFsm.addEpsilonTransition(automaton, 1, [2]);
      expect(noamFsm.validate(automaton)).toBeTruthy();
      expect(noamFsm.isStringInLanguage(automaton, [])).toBeFalsy();
      expect(noamFsm.isStringInLanguage(automaton, ["a"])).toBeTruthy();
      expect(noamFsm.isStringInLanguage(automaton, ["a", "b"])).toBeTruthy();
    });

    describe("addState", function() {
      var stateObj;
      beforeEach(function() {
        stateObj = "test";
      });

      it("given an object, makes it a state of the automaton and returns the object", function() {
        expect(noamFsm.addState(automaton, stateObj)).toBe(stateObj);
        stateObj = {};
        expect(noamFsm.addState(automaton, stateObj)).toBe(stateObj);
      });

      it("throws an Error if the passed object is already a state of the automaton", function() {
        noamFsm.addState(automaton, stateObj);
        expect(function() { noamFsm.addState(automaton, stateObj); }).toThrow(new Error("State already exists"));
      });

      it("throws an Error if no state object is specified", function() {
        expect(function() { noamFsm.addState(automaton); }).toThrow(new Error("No state object specified"));
      });
    });

    describe("addSymbol", function() {
      var symObj;
      beforeEach(function() {
        symObj = "test";
      });

      it("given an object, makes it an alphabet symbol of the automaton and returns the object", function() {
        expect(noamFsm.addSymbol(automaton, symObj)).toBe(symObj);
        symObj = {};
        expect(noamFsm.addSymbol(automaton, symObj)).toBe(symObj);
      });

      it("throws an Error if the passed object is already a symbol of the automaton", function() {
        noamFsm.addSymbol(automaton, symObj);
        expect(function() { noamFsm.addSymbol(automaton, symObj); }).
            toThrow(new Error("Symbol already exists"));
      });

      it("throws an Error if no symbol object is specified", function() {
        expect(function() { noamFsm.addSymbol(automaton); }).
            toThrow(new Error("No symbol object specified"));
      });

      it("throws an Error if you try to add the epsilon symbol to the alphabet", function() {
        expect(function() { noamFsm.addSymbol(automaton, noamFsm.epsilonSymbol); }).
            toThrow(new Error("Can't add the epsilon symbol to the alphabet"));
      });
    });

    describe("addAcceptingState", function() {
      var stateObj;
      beforeEach(function() {
        stateObj = "test";
      });

      it("makes the given state acceptable", function() {
        noamFsm.addState(automaton, stateObj);
        expect(noamFsm.isAcceptingState(automaton, stateObj)).toBeFalsy();
        noamFsm.addAcceptingState(automaton, stateObj);
        expect(noamFsm.isAcceptingState(automaton, stateObj)).toBeTruthy();
      });

      it("throws an Error if the given state is not a state of the FSM", function() {
        expect(function() { noamFsm.addAcceptingState(automaton, stateObj); }).
            toThrow(new Error("The specified object is not a state of the FSM"));
      });

      it("throws an Error if the given state is already accepting", function() {
        noamFsm.addState(automaton, stateObj);
        noamFsm.addAcceptingState(automaton, stateObj);
        expect(function() { noamFsm.addAcceptingState(automaton, stateObj); }).
            toThrow(new Error("The specified state is already accepting"));
      });
    });

    describe("setInitialState", function() {
      var stateObj;
      beforeEach(function() {
        stateObj = "test";
      });

      it("sets the initial state of the FSM", function() {
        noamFsm.addState(automaton, stateObj);
        noamFsm.setInitialState(automaton, stateObj);
        expect(automaton.initialState).toBe(stateObj);
      });

      it("throws an Error if the given state is not a state of the FSM", function() {
        expect(function() { noamFsm.setInitialState(automaton, stateObj); }).
            toThrow(new Error("The specified object is not a state of the FSM"));
      });
    });

    describe("addTransition", function() {
      var state1, state2, symbolObj;
      beforeEach(function() {
        symbolObj = "test";
        state1 = "foo";
        state2 = "bar";
        noamFsm.addState(automaton, state1);
        noamFsm.addState(automaton, state2);
        noamFsm.addSymbol(automaton, symbolObj);
      });

      it("adds a transition for the given transition symbol from a source state to an array of states", function() {
        var targetStates = noamFsm.makeSimpleTransition(automaton, [state1], symbolObj);
        expect(targetStates.length).toBe(0);

        noamFsm.addTransition(automaton, state1, [state2], symbolObj);
        targetStates = noamFsm.makeSimpleTransition(automaton, [state1], symbolObj);
        expect(targetStates.length).toBe(1);
        expect(targetStates[0]).toBe(state2);
      });

      it("unites target state arrays with previous calls", function() {
        noamFsm.addTransition(automaton, state1, [state2], symbolObj);
        var state3 = "zaz";
        noamFsm.addState(automaton, state3);
        noamFsm.addTransition(automaton, state1, [state3], symbolObj);
        var targetStates = noamFsm.makeSimpleTransition(automaton, [state1], symbolObj);
        expect(targetStates.length).toBe(2);
        expect(noamUtil.contains(targetStates, state2)).toBeTruthy();
        expect(noamUtil.contains(targetStates, state3)).toBeTruthy();
      });

      it("throws an Error if any of the states is not a state of the FSM", function() {
        expect(function() { noamFsm.addTransition(automaton, "zaz", [state2], symbolObj); }).
            toThrow(new Error("One of the specified objects is not a state of the FSM"));
        expect(function() { noamFsm.addTransition(automaton, state1, ["zaz"], symbolObj); }).
            toThrow(new Error("One of the specified objects is not a state of the FSM"));
        expect(function() { noamFsm.addTransition(automaton, state1, [state2, "zaz"], symbolObj); }).
            toThrow(new Error("One of the specified objects is not a state of the FSM"));
      });

      it("throws an Error if the specified symbol object is not an alphabet symbol of the FSM", function() {
        expect(function() { noamFsm.addTransition(automaton, state1, [state2], "zaz"); }).
            toThrow(new Error("The specified object is not an alphabet symbol of the FSM"));
        expect(function() { noamFsm.addTransition(automaton, state1, [state2], noamFsm.epsilonSymbol); }).
            toThrow(new Error("The specified object is not an alphabet symbol of the FSM"));
      });

      it("throws an Error if the toStates argument is not an array", function() {
        expect(function() { noamFsm.addTransition(automaton, state1, state2, symbolObj); }).
            toThrow(new Error("The toStates argument must be an array"));
      });
    });

    describe("addEpsilonTransition", function() {
      var state1, state2;
      beforeEach(function() {
        state1 = "foo";
        state2 = "bar";
        noamFsm.addState(automaton, state1);
        noamFsm.addState(automaton, state2);
      });

      it("adds an epsilon transition from a source state to an array of states", function() {
        var targetStates = noamFsm.computeEpsilonClosure(automaton, [state1]);
        expect(targetStates.length).toBe(1);

        noamFsm.addEpsilonTransition(automaton, state1, [state2]);
        targetStates = noamFsm.computeEpsilonClosure(automaton, [state1]);
        expect(targetStates.length).toBe(2);
        expect(noamUtil.contains(targetStates, state1)).toBeTruthy();
        expect(noamUtil.contains(targetStates, state2)).toBeTruthy();
      });

      it("unites target state arrays with previous calls", function() {
        noamFsm.addEpsilonTransition(automaton, state1, [state2]);
        var state3 = "zaz";
        noamFsm.addState(automaton, state3);
        noamFsm.addEpsilonTransition(automaton, state1, [state3]);
        var targetStates = noamFsm.computeEpsilonClosure(automaton, [state1]);
        expect(targetStates.length).toBe(3);
        expect(noamUtil.contains(targetStates, state1)).toBeTruthy();
        expect(noamUtil.contains(targetStates, state2)).toBeTruthy();
        expect(noamUtil.contains(targetStates, state3)).toBeTruthy();
      });

      it("throws an Error if any of the states is not a state of the FSM", function() {
        expect(function() { noamFsm.addEpsilonTransition(automaton, "zaz", [state2]); }).
            toThrow(new Error("One of the specified objects is not a state of the FSM"));
        expect(function() { noamFsm.addEpsilonTransition(automaton, state1, ["zaz"]); }).
            toThrow(new Error("One of the specified objects is not a state of the FSM"));
        expect(function() { noamFsm.addEpsilonTransition(automaton, state1, [state2, "zaz"]); }).
            toThrow(new Error("One of the specified objects is not a state of the FSM"));
      });

      it("throws an Error if the toStates argument is not an array", function() {
        expect(function() { noamFsm.addEpsilonTransition(automaton, state1, state2); }).
            toThrow(new Error("The toStates argument must be an array"));
      });
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
      expect(function() { noamFsm.validate(fsm2); }).toThrow();
    });

    it("Should not be valid - must have at least one state", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.states = [];
      expect(function(){ noamFsm.validate(fsm2); }).toThrow();
    });

    it("Should not be valid - must have at least one symbol", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.alphabet = null;
      expect(function(){ noamFsm.validate(fsm2); }).toThrow();
    });

    it("Should not be valid - symbols and states mut not overlap", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.states.push("a");
      expect(function(){ noamFsm.validate(fsm2); }).toThrow();
    });

    it("Should not be valid - no duplicate states", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.states.push("s1");
      expect(function(){ noamFsm.validate(fsm2); }).toThrow();
    });

    it("Should not be valid - no duplicate symbols", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.alphabet.push("a");
      expect(function(){ noamFsm.validate(fsm2); }).toThrow();
    });

    it("Should not be valid - must have no duplicate states in transition toStates", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.transitions.push({fromState : "s1", symbol : "a", toStates : ["s1", "s1"]});
      expect(function(){ noamFsm.validate(fsm2); }).toThrow();
    });

    it("Should not be valid - must have no duplicate transitions", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.transitions.push({fromState : "s1", symbol : "b", toStates : ["s3"]});
      expect(function(){ noamFsm.validate(fsm2); }).toThrow();
    });

    it("Should not be valid - must have no overlaping transitions", function() {
      var fsm2 = noamUtil.clone(fsm1);
      fsm2.transitions.push({fromState : "s2", symbol : "a", toStates : ["s2"]});
      expect(function(){ noamFsm.validate(fsm2); }).toThrow();
    });
  });

  describe("DetermineType", function() {
    var fsm1 = {
      states : ["s1", "s2", "s3"],
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

  describe("computeEpsilonClosure", function() {
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
      expect(noamFsm.computeEpsilonClosure(fsm1, ["s2"])).toEqual(["s2"]);
    });

    it("Handles simple, nonlooping epsilon transitions", function() {
      expect(noamFsm.computeEpsilonClosure(fsm1, ["s1"])).toEqual(["s1", "s2"]);
    });

    it("Handles looping epsilon transitions", function() {
      expect(noamFsm.computeEpsilonClosure(fsm1, ["s4"])).toEqual(["s4", "s5", "s1", "s2"]);
    });

    it("Handles multiple starting states", function() {
      expect(noamFsm.computeEpsilonClosure(fsm1, ["s1", "s3"])).toEqual(["s3", "s1", "s2"]);
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

    it("Handles object transition symbols", function() {
      var fsm2 = noamUtil.clone(fsm1);
      noamFsm.addSymbol(fsm2, {});
      noamFsm.addTransition(fsm2, "s1", ["s2"], {});
      expect(noamFsm.makeSimpleTransition(fsm2, ["s1"], {})).toEqual(["s2"]);
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

    it("expands the epsilon closure of the start state", function() {
      var fsm2 = noamUtil.clone(fsm1);
      noamFsm.addEpsilonTransition(fsm2, "s1", ["s2"]);
      expect(noamUtil.contains(noamFsm.readString(fsm2, []), "s2")).toBeTruthy();
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
  
  describe("dfatore", function() {
    var fsm1 = {
      states : ["1", "2"],
      alphabet : ["a"],
      initialState : "1",
      acceptingStates : ["2"],
      transitions : [
        { fromState : "1", symbol : "a", toStates : ["2"] },
        { fromState : "2", symbol : "a", toStates : ["2"] }
      ]
    };
    
    it("Works", function() {
      expect(noamFsm.areEquivalentFSMs(fsm1, noamFsm.minimize(noamRe.tree.toAutomaton(noamFsm.toRegex(fsm1))))).toEqual(true);
    });
  });

  describe("convertNfaToDfa", function() {
    it("throws an Error if the passed automaton is an eNFA", function() {
      var automaton = noamFsm.makeNew();
      noamFsm.addState(automaton, "1");
      noamFsm.addState(automaton, "2");
      noamFsm.setInitialState(automaton, "1");
      noamFsm.addAcceptingState(automaton, "2");
      noamFsm.addEpsilonTransition(automaton, "1", ["2"]);
      expect(function() { noamFsm.convertNfaToDfa(automaton); }).toThrow();
    });
  });
});
