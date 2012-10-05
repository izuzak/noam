var noam = {};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = noam;
} else {
  window.noam = noam;
}

noam.fsm = {};
noam.util = {};

noam.fsm.epsilonSymbol = '$';
noam.fsm.dfaType = 'DFA';
noam.fsm.nfaType = 'NFA';
noam.fsm.enfaType = 'eNFA';

// "deep" compare of two objects
// taken from http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
noam.util.areEquivalent = function(object1, object2) {
  if (typeof object1 === 'undefined' || typeof object2 === 'undefined') {
    return false;
  }

  if (object1 === object2) {
    return true;
  }

  if (!(object1 instanceof Object) || !(object2 instanceof Object) ) {
    return false;
  }

  if (object1.constructor !== object2.constructor) {
    return false;
  }

  for (var p in object1) {
    if (!(object1.hasOwnProperty(p))) {
      continue;
    }

    if (!(object2.hasOwnProperty(p))) {
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
    if (object2.hasOwnProperty(p) && !(object1.hasOwnProperty(p))) {
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
}

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
      getAndAdvance: getAndAdvance,
    };
  };

  return makeCounter;
})();


// Returns a random integer from the interval [from, to].
noam.util.randint = function(from, to) {
  return Math.floor(Math.random()*(to-from+1)) + from;
}


// FSM creation API

// Creates and returns an empty FSM that can then be manipulated through the other 
// functions in the API.
noam.fsm.makeNew = function() {
  return {
    states: [],
    alphabet: [],
    acceptingStates: [],
    initialState: undefined,
    transitions: [],
  };
};

// Common internal implementation for addStata and addSymbol.
noam.fsm._addStateOrSymbol = function(arr, obj, undefErrorMsg, existsErrorMsg) {
  // need to check this because undefined would otherwise be added as a state
  // or symbol which is probably not what you want
  if (obj === undefined) { 
    throw new Error(undefErrorMsg);
  }
  if (noam.util.contains(arr, obj)) {
    throw new Error(existsErrorMsg);
  }

  arr.push(obj);
  return obj;
};

// Adds stateObj as a state to the fsm.
// Throws an Error if no stateObj is passed or if the same state already exists.
// Returns the added state object.
noam.fsm.addState = function(fsm, stateObj) {
  return noam.fsm._addStateOrSymbol(fsm.states, stateObj, 
      "No state object specified", "State already exists");
};

// Adds symObj as an alphabet symbol to the fsm.
// Throws an Error if no symObj is passed or if the same symbol already exists.
// Returns the added symbol object.
noam.fsm.addSymbol = function(fsm, symObj) {
  if (noam.util.areEquivalent(symObj, noam.fsm.epsilonSymbol)) {
    throw new Error("Can't add the epsilon symbol to the alphabet");
  }
  return noam.fsm._addStateOrSymbol(fsm.alphabet, symObj, 
      "No symbol object specified", "Symbol already exists");
};

// Makes stateObj an accepting state of the fsm.
// Throws an Error if stateObj is not a state of the fsm or if it is already
// accepting.
noam.fsm.addAcceptingState = function(fsm, stateObj) {
  if (!noam.util.contains(fsm.states, stateObj)) {
    throw new Error("The specified object is not a state of the FSM");
  }
  noam.fsm._addStateOrSymbol(fsm.acceptingStates, stateObj, "", 
      "The specified state is already accepting");
};

// Sets stateObj as the start state of the fsm.
// Throws an Error if stateObj is not a state of the fsm.
noam.fsm.setInitialState = function(fsm, stateObj) {
  if (!noam.util.contains(fsm.states, stateObj)) {
    throw new Error("The specified object is not a state of the FSM");
  }
  fsm.initialState = stateObj;
};

// Common implementation for addTransition and addEpsilonTransition.
noam.fsm._addTransition = function(fsm, fromState, toStates, transitionSymbol) {
  if (!Array.isArray(toStates)) {
    throw new Error("The toStates argument must be an array");
  }
  if (!noam.util.contains(fsm.states, fromState) || 
      !noam.util.containsAll(fsm.states, toStates)) {
    throw new Error("One of the specified objects is not a state of the FSM");
  }

  var i;
  var added = false;
  for (i=0; i<fsm.transitions.length; i++) {
    if (noam.util.areEquivalent(fromState, fsm.transitions[i].fromState) &&
        noam.util.areEquivalent(transitionSymbol, fsm.transitions[i].transitionSymbol)) {
      fsm.transitions[i].toStates = noam.util.setUnion(fsm.transitions[i].toStates, toStates);
      added = true;
      break;
    }
  }
  if (!added) {
    fsm.transitions.push({fromState: fromState, toStates: toStates, symbol: transitionSymbol});
  }
};

// Adds a transition from fromState to the set of states represented by the array
// toStates, using transitionSymbol.
// If a transition for this pair of (fromState, transitionSymbol) already exists,
// toStates is added to the existing set of destination states.
// Throws an Error if any of the states is not actually in the fsm or if the
// transition symbol is not in the fsm's alphabeth.
// Note that this means that an Error will be thrown if you try to use this to
// specify an epsilon transition. For that, use addEpsilonTransition instead.
noam.fsm.addTransition = function(fsm, fromState, toStates, transitionSymbol) {
  if (!noam.util.contains(fsm.alphabet, transitionSymbol)) {
    throw new Error("The specified object is not an alphabet symbol of the FSM");
  }
  noam.fsm._addTransition(fsm, fromState, toStates, transitionSymbol);
};

// Equivalent to addTransition except that there is no transition symbol, i.e. the
// transition can be executed without consuming an input symbol.
noam.fsm.addEpsilonTransition = function(fsm, fromState, toStates) {
  noam.fsm._addTransition(fsm, fromState, toStates, noam.fsm.epsilonSymbol);
};

// end of FSM creation API

// validates a FSM definition
noam.fsm.validate = function(fsm) {
  if (!(typeof fsm !== 'undefined' &&
      Array.isArray(fsm.states) &&
      Array.isArray(fsm.alphabet) &&
      Array.isArray(fsm.acceptingStates) &&
      typeof fsm.initialState !== 'undefined' && fsm.initialState !== null &&
      Array.isArray(fsm.transitions))) {
    return new Error('FSM must be defined and have states, alphabet, acceptingStates, initialState and transitions array properties!');
  }

  if (fsm.states.length < 1) {
    return new Error('Set of states must not be empty.');
  }

  for (var i=0; i<fsm.states.length; i++) {
    if (noam.util.contains(fsm.states, fsm.states[i], i+1)) {
      return new Error('Equivalent states');
    }
  }

  if (fsm.alphabet.length < 1) {
    return new Error('Alphabet must not be empty.');
  }

  for (var i=0; i<fsm.alphabet.length; i++) {
    if (noam.util.contains(fsm.alphabet, fsm.alphabet[i], i+1)) {
      return new Error('Equivalent alphabet symbols');
    }
  }

  if (noam.util.contains(fsm.alphabet, noam.fsm.epsilonSymbol)) {
    return new Error('FSM alphabet must not contain the epsilon symbol');
  }

  for (var i=0; i<fsm.alphabet.length; i++) {
    if (noam.util.contains(fsm.states, fsm.alphabet[i])) {
      return new Error('States and alphabet symbols must not overlap');
    }
  }

  for (var i=0; i<fsm.acceptingStates.length; i++) {
    if (noam.util.contains(fsm.acceptingStates, fsm.acceptingStates[i], i+1)) {
      return new Error('Equivalent acceptingStates');
    }

    if (!(noam.util.contains(fsm.states, fsm.acceptingStates[i]))) {
      return new Error('Each accepting state must be in states');
    }
  }

  if (!(noam.util.contains(fsm.states, fsm.initialState))) {
    return new Error('Initial state must be in states');
  }

  for (var i=0; i<fsm.transitions.length; i++) {
    var transition = fsm.transitions[i];

    if (typeof transition.fromState === 'undefined' ||
        typeof transition.toStates === 'undefined' ||
        typeof transition.symbol === 'undefined') {
      return new Error('Transitions must have fromState, toState and symbol');
    }

    if (!(noam.util.contains(fsm.states, transition.fromState))) {
      return new Error('Transition fromState must be in states.');
    }

    if (!(noam.util.contains(fsm.alphabet, transition.symbol)) && 
        transition.symbol !== noam.fsm.epsilonSymbol) {
      return new Error('Transition symbol must be in alphabet.');
    }

    for (var k=0; k<transition.toStates.length; k++) {
      if (!(noam.util.contains(fsm.states, transition.toStates[k]))) {
        return new Error('Transition toStates must be in states.');
      }

      if (noam.util.contains(transition.toStates, transition.toStates[k], k+1)) {
        return new Error('Transition toStates must not contain duplicates.');
      }
    }
  }

  for (var i=0; i<fsm.transitions.length; i++) {
    for (var j=i+1; j<fsm.transitions.length; j++) {
      if (fsm.transitions[i].fromState === fsm.transitions[j].fromState &&
          fsm.transitions[i].symbol === fsm.transitions[j].symbol) {
        return new Error('Transitions for the same fromState and symbol must be defined in a single trainsition.');
      }
    }
  }

  return true;
};

// determine if stateObj is an accepting state in fsm
noam.fsm.isAcceptingState = function(fsm, stateObj) {
  return noam.util.contains(fsm.acceptingStates, stateObj);
};

// determine fsm type based on transition function
noam.fsm.determineType = function(fsm) {
  var fsmType = noam.fsm.dfaType;

  for (var i=0; i<fsm.transitions.length; i++) {
    var transition = fsm.transitions[i];

    if (transition.toStates.length === 0 ||
        transition.toStates.length > 1) {
      fsmType = noam.fsm.nfaType;
    } else if (transition.symbol === noam.fsm.epsilonSymbol) {
      fsmType = noam.fsm.enfaType;
      break;
    }
  }

  if (fsmType === noam.fsm.dfaType) {
    if (fsm.transitions.length < fsm.states.length * fsm.alphabet.length) {
      fsmType = noam.fsm.nfaType;
    }
  }

  return fsmType;
};

// computes epsilon closure of fsm from states array states
noam.fsm.computeEpsilonClosure = function(fsm, states) {
  if (!(noam.util.containsAll(fsm.states, states))) {
    return new Error('FSM must contain all states for which epsilon closure is being computed');
  }

  var unprocessedStates = states
  var targetStates = [];

  while (unprocessedStates.length !== 0) {
    var currentState = unprocessedStates.pop();
    targetStates.push(currentState);

    for (var i=0; i<fsm.transitions.length; i++) {
      var transition = fsm.transitions[i];

      if (transition.symbol === noam.fsm.epsilonSymbol &&
          noam.util.areEquivalent(transition.fromState, currentState)) {
        for (var j=0; j<transition.toStates.length; j++) {
          if (noam.util.contains(targetStates, transition.toStates[j]) ||
              noam.util.contains(unprocessedStates, transition.toStates[j])) {
            continue;
          }

          unprocessedStates.push(transition.toStates[j]);
        }
      }
    }
  }

  return targetStates;
};

// determines the target states from reading symbol at states array states
noam.fsm.makeSimpleTransition = function(fsm, states, symbol) {
  if (!(noam.util.containsAll(fsm.states, states))) {
    return new Error('FSM must contain all states for which the transition is being computed');
  }

  if (!(noam.util.contains(fsm.alphabet, symbol))) {
    return new Error('FSM must contain input symbol for which the transition is being computed');
  }

  var targetStates = [];

  for (var i=0; i<fsm.transitions.length; i++) {
    var transition = fsm.transitions[i];

    if (noam.util.areEquivalent(fsm.transitions[i].symbol, symbol) &&
        noam.util.contains(states, transition.fromState)) {
      for (var j=0; j<transition.toStates.length; j++) {
        if (!(noam.util.contains(targetStates, transition.toStates[j]))) {
          targetStates.push(transition.toStates[j]);
        }
      }
    }
  }

  return targetStates;
};

// makes transition from states array states and for input symbol symbol by:
//   a) computing the epsilon closure of states
//   b) making a simple transition from resulting states of a)
//   c) computing the epsilon closure of resulting states of b)
noam.fsm.makeTransition = function(fsm, states, symbol) {
  if (!(noam.util.containsAll(fsm.states, states))) {
    return new Error('FSM must contain all states for which the transition is being computed');
  }

  if (!(noam.util.contains(fsm.alphabet, symbol))) {
    return new Error('FSM must contain input symbol for which the transition is being computed');
  }

  var targetStates = noam.util.clone(states);

  targetStates = noam.fsm.computeEpsilonClosure(fsm, targetStates);
  targetStates = noam.fsm.makeSimpleTransition(fsm, targetStates, symbol);
  targetStates = noam.fsm.computeEpsilonClosure(fsm, targetStates);

  return targetStates;
};

// read a stream of input symbols and determine target states
noam.fsm.readString = function(fsm, inputSymbolStream) {
  if (!(noam.util.containsAll(fsm.alphabet, inputSymbolStream))) {
    return new Error('FSM must contain all symbols for which the transition is being computed');
  }

  var states = noam.fsm.computeEpsilonClosure(fsm, [fsm.initialState]);

  for (var i=0; i<inputSymbolStream.length; i++) {
    states = noam.fsm.makeTransition(fsm, states, inputSymbolStream[i]);
  }

  return states;
};

// read a stream of input symbols starting from state and make a list of
// states that were on the transition path
noam.fsm.transitionTrail = function(fsm, state, inputSymbolStream) {
  if (!(noam.util.containsAll(fsm.alphabet, inputSymbolStream))) {
    return new Error('FSM must contain all symbols for which the transition is being computed');
  }

  var states = [state];
  var trail = [noam.util.clone(states)];

  for (var i=0; i<inputSymbolStream.length; i++) {
    states = noam.fsm.makeTransition(fsm, states, inputSymbolStream[i]);
    trail.push(noam.util.clone(states));
  }

  return trail;
};

// test if a stream of input symbols leads a fsm to an accepting state
noam.fsm.isStringInLanguage = function(fsm, inputSymbolStream) {
  var states = noam.fsm.readString(fsm, inputSymbolStream);

  return noam.util.containsAny(fsm.acceptingStates, states);
}

// pretty print the fsm transition function and accepting states as a table
noam.fsm.printTable = function(fsm) {
  var Table = require('/home/izuzak/cli-table');
  var colHeads = [""].concat(fsm.alphabet);

  if (noam.fsm.determineType(fsm) === noam.fsm.enfaType) {
    colHeads.push(noam.fsm.epsilonSymbol);
  }

  colHeads.push("");

  var table = new Table({
     head: colHeads,
     chars: {
       'top': '-',
       'top-mid': '+',
       'top-left': '+',
       'top-right': '+',
       'bottom': '-',
       'bottom-mid': '+',
       'bottom-left': '+',
       'bottom-right': '+',
       'left': '|',
       'left-mid': '+',
       'mid': '-',
       'mid-mid': '+',
       'right': '|',
       'right-mid': '+'
     },
     truncate: '…'
  });

  var tableRows = [];
  for (var i=0; i<fsm.states.length; i++) {
    tableRows.push(new Array(colHeads.length));
    for (var j=0; j<colHeads.length; j++) {
      tableRows[i][j] = "";
    }
    tableRows[i][0] = fsm.states[i].toString();
    tableRows[i][colHeads.length-1] =
      noam.util.contains(fsm.acceptingStates, fsm.states[i]) ?
      "1" : "0" ;
    table.push(tableRows[i]);
  }

  for (var i=0; i<fsm.transitions.length; i++) {
    var transition = fsm.transitions[i];

    var colNum = null;
    var rowNum = null;

    for (var j=0; j<fsm.states.length; j++) {
      if (noam.util.areEquivalent(fsm.states[j], transition.fromState)) {
        rowNum = j;
        break;
      }
    }

    if (transition.symbol === noam.fsm.epsilonSymbol) {
      colNum = colHeads.length-2;
    } else {
      for (var j=0; j<fsm.alphabet.length; j++) {
        if (noam.util.areEquivalent(fsm.alphabet[j], transition.symbol)) {
          colNum = j+1;
          break;
        }
      }
    }

    if (typeof tableRows[rowNum][colNum].text === "undefined") {
      tableRows[rowNum][colNum] = { text : [] };
    }

    tableRows[rowNum][colNum].text.push(transition.toStates);
  }

  return table.toString();
};

// print the fsm transition function and accepting states as an HTML table
noam.fsm.printHtmlTable = function(fsm) {
  var headers = [""].concat(fsm.alphabet);
  if (noam.fsm.determineType(fsm) === noam.fsm.enfaType) {
    headers.push(noam.fsm.epsilonSymbol);
  }
  headers.push("");

  var tableRows = [];
  
  for (var i=0; i<fsm.states.length; i++) {
    tableRows.push(new Array(headers.length));
    for (var j=0; j<headers.length; j++) {
      tableRows[i][j] = { text : []};
    }
    tableRows[i][0] = { text : fsm.states[i].toString() };
    tableRows[i][headers.length-1] =
      noam.util.contains(fsm.acceptingStates, fsm.states[i]) ?
      { text : ["1"] } : { text : ["0"] };
  }

  for (var i=0; i<fsm.transitions.length; i++) {
    var transition = fsm.transitions[i];

    var colNum = null;
    var rowNum = null;

    for (var j=0; j<fsm.states.length; j++) {
      if (noam.util.areEquivalent(fsm.states[j], transition.fromState)) {
        rowNum = j;
        break;
      }
    }

    if (transition.symbol === noam.fsm.epsilonSymbol) {
      colNum = headers.length-2;
    } else {
      for (var j=0; j<fsm.alphabet.length; j++) {
        if (noam.util.areEquivalent(fsm.alphabet[j], transition.symbol)) {
          colNum = j+1;
          break;
        }
      }
    }

    if (typeof tableRows[rowNum][colNum].text === "undefined") {
      tableRows[rowNum][colNum] = { text : [] };
    }

    tableRows[rowNum][colNum].text.push(transition.toStates);
  }

  var htmlString = [];

  htmlString.push("<table border='1'>");
  htmlString.push("  <tr>");
  
  for(var i=0; i<headers.length; i++) {
    htmlString.push("    <th>" + headers[i].toString() + "</th>");
  }

  htmlString.push("  </tr>");

  for (var i=0; i<tableRows.length; i++) {
    htmlString.push("  <tr>");
    for (var j=0; j<tableRows[i].length; j++) {
      htmlString.push("    <td>" + tableRows[i][j].text + "</td>");
    }

    htmlString.push("  </tr>");
  }

  htmlString.push("</table>");
  return htmlString.join("\n");
};

// print the fsm in the graphviz dot format
noam.fsm.printDotFormat = function(fsm) {
  var result = ["digraph finite_state_machine {", "  rankdir=LR;"];

  var accStates = ["  node [shape = doublecircle];"];
  
  for (var i=0; i<fsm.acceptingStates.length; i++) {
    accStates.push(fsm.acceptingStates[i].toString());
  }

  accStates.push(";");
  result.push(accStates.join(" "));
  result.push("  node [shape = circle];");
  result.push("  secret_node [style=invis, shape=point];");
  //var initState = ['  {rank = source; "'];
  //initState.push(fsm.initialState.toString());
  //initState.push('" "secret_node"}');
  //result.push(initState.join(""));

  var initStateArrow = ["  secret_node ->"]
  initStateArrow.push(fsm.initialState.toString());
  initStateArrow.push("[style=bold];");
  result.push(initStateArrow.join(" "));

  var newTransitions = [];

  for (var i=0; i<fsm.transitions.length; i++) {
    for (var j=0; j<fsm.transitions[i].toStates.length; j++) {
      var found = null;

      for (var k=0; k<newTransitions.length; k++) {
        if (noam.util.areEquivalent(newTransitions[k].fromState, fsm.transitions[i].fromState) &&
            noam.util.areEquivalent(newTransitions[k].toStates, [fsm.transitions[i].toStates[j]])) {
          found = newTransitions[k];
        }
      }

      if (found === null) {
        var newTransition = noam.util.clone(fsm.transitions[i]);
        newTransition.symbol = [newTransition.symbol];
        newTransitions.push(newTransition);
      } else {
        found.symbol.push(fsm.transitions[i].symbol);
      }
    }
  }

  for (var i=0; i<newTransitions.length; i++) {
    if (noam.util.areEquivalent(newTransitions[i].toStates[0], fsm.initialState)) {
      var trans = [" "];
      trans.push(newTransitions[i].toStates[0].toString());
      trans.push("->");
      trans.push(newTransitions[i].fromState.toString());
      trans.push("[");
      trans.push("label =");
      trans.push('"' + newTransitions[i].symbol.toString() + '"');
      trans.push(" dir = back];");
      result.push(trans.join(" "));
    } else {
      var trans = [" "];
      trans.push(newTransitions[i].fromState.toString());
      trans.push("->");
      trans.push(newTransitions[i].toStates[0].toString());
      trans.push("[");
      trans.push("label =");
      trans.push('"' + newTransitions[i].symbol.toString() + '"');
      trans.push(" ];");
      result.push(trans.join(" "));
    }
  }

  result.push("}");

  return result.join("\n").replace(/\$/g, "ε");
};

// determine reachable states
noam.fsm.getReachableStates = function(fsm, state, shouldIncludeInitialState) {
  var unprocessedStates = [state];
  var reachableStates = shouldIncludeInitialState ? [state] : [];

  while (unprocessedStates.length !== 0) {
    var currentState = unprocessedStates.pop();

    for (var i=0; i<fsm.transitions.length; i++) {
      var transition = fsm.transitions[i];

      if (noam.util.areEquivalent(currentState, transition.fromState)) {
        for (var j=0; j<transition.toStates.length; j++) {
          if (!(noam.util.contains(reachableStates, transition.toStates[j]))) {
            reachableStates.push(transition.toStates[j]);
            
            if (!(noam.util.contains(unprocessedStates, transition.toStates[j]))) {
              unprocessedStates.push(transition.toStates[j]);
            }
          }
        }
      }
    }
  }

 return reachableStates;
};

// determine and remove unreachable states
noam.fsm.removeUnreachableStates = function (fsm) {
  var reachableStates = noam.fsm.getReachableStates(fsm, fsm.initialState, true);
  var newFsm = noam.util.clone(fsm);
  newFsm.states = [];
  newFsm.acceptingStates = [];
  newFsm.transitions = [];

  for (var i=0; i<fsm.states.length; i++) {
    if(noam.util.contains(reachableStates, fsm.states[i])) {
      newFsm.states.push(noam.util.clone(fsm.states[i]));
    }
  }

  for (var i=0; i<fsm.acceptingStates.length; i++) {
    if (noam.util.contains(reachableStates, fsm.acceptingStates[i])) {
      newFsm.acceptingStates.push(noam.util.clone(fsm.acceptingStates[i]));
    }
  }

  for (var i=0; i<fsm.transitions.length; i++) {
    if (noam.util.contains(reachableStates, fsm.transitions[i].fromState)) {
      newFsm.transitions.push(noam.util.clone(fsm.transitions[i]));
    }
  }

  return newFsm;
};

// determines if two states from potentially different fsms are equivalent
noam.fsm.areEquivalentStates = function(fsmA, stateA, fsmB, stateB) {
  if (noam.fsm.determineType(fsmA) !== noam.fsm.dfaType ||
      noam.fsm.determineType(fsmB) !== noam.fsm.dfaType) {
    return new Error('FSMs must be DFAs');
  }

  if (fsmA.alphabet.length !== fsmB.alphabet.length ||
      !(noam.util.containsAll(fsmA.alphabet, fsmB.alphabet))) {
    return new Error('FSM alphabets must be the same');
  }

  if (!(noam.util.contains(fsmA.states, stateA)) ||
      !(noam.util.contains(fsmB.states, stateB))) {
    return new Error('FSMs must contain states');
  }

  function doBothStatesHaveSameAcceptance(fsmX, stateX, fsmY, stateY) {
    var stateXAccepting = noam.util.contains(fsmX.acceptingStates, stateX);
    var stateYAccepting = noam.util.contains(fsmY.acceptingStates, stateY);

    return (stateXAccepting && stateYAccepting) ||
           (!(stateXAccepting) && !(stateYAccepting));
  }

  var unprocessedPairs = [[stateA, stateB]];
  var processedPairs = [];

  while (unprocessedPairs.length !== 0) {
    var currentPair = unprocessedPairs.pop();

    for (var i=0; i<fsmA.alphabet.length; i++) {
      if (!(doBothStatesHaveSameAcceptance(fsmA, currentPair[0], fsmB, currentPair[1]))) {
        return false;
      }

      processedPairs.push(currentPair);

      for (var j=0; j<fsmA.alphabet.length; j++) {
        var pair = [noam.fsm.makeTransition(fsmA, [currentPair[0]], fsmA.alphabet[j])[0],
                    noam.fsm.makeTransition(fsmB, [currentPair[1]], fsmA.alphabet[j])[0]];

        if (!(noam.util.contains(processedPairs, pair)) &&
            !(noam.util.contains(unprocessedPairs, pair))) {
          unprocessedPairs.push(pair);
        }
      }
    }
  }

  return true;
};

// determines if two fsms are equivalent by testing equivalence of starting states
noam.fsm.areEquivalentFSMs = function(fsmA, fsmB) {
  return noam.fsm.areEquivalentStates(fsmA, fsmA.initialState, fsmB, fsmB.initialState);
};

// finds and removes equivalent states
noam.fsm.removeEquivalentStates = function(fsm) {
  if (noam.fsm.determineType(fsm) !== noam.fsm.dfaType) {
    return new Error('FSM must be DFA');
  }

  var equivalentPairs = [];

  for (var i=0; i<fsm.states.length; i++) {
    for (var j=i+1; j<fsm.states.length; j++) {
      if (noam.fsm.areEquivalentStates(fsm, fsm.states[i], fsm, fsm.states[j])) {
        var pair = [fsm.states[i], fsm.states[j]];

        for (var k=0; k<equivalentPairs.length; k++) {
          if (noam.util.areEquivalent(equivalentPairs[k][1], pair[0])) {
            pair[0] = equivalentPairs[k][1];
            break;
          }
        }

        if (!(noam.util.contains(equivalentPairs, pair))) {
          equivalentPairs.push(pair);
        }
      }
    }
  }

  var newFsm = {
    states : [],
    alphabet : noam.util.clone(fsm.alphabet),
    initialState : [],
    acceptingStates : [],
    transitions : []
  };

  function isOneOfEquivalentStates(s) {
    for (var i=0; i<equivalentPairs.length; i++) {
      if (noam.util.areEquivalent(equivalentPairs[i][1], s)) {
        return true;
      }
    }

    return false;
  }

  function getEquivalentState(s) {
    for (var i=0; i<equivalentPairs.length; i++) {
      if (noam.util.areEquivalent(equivalentPairs[i][1], s)) {
        return equivalentPairs[i][0];
      }
    }

    return s;
  }

  for (var i=0; i<fsm.states.length; i++) {
    if (!(isOneOfEquivalentStates(fsm.states[i]))) {
      newFsm.states.push(noam.util.clone(fsm.states[i]));
    }
  }

  for (var i=0; i<fsm.acceptingStates.length; i++) {
    if (!(isOneOfEquivalentStates(fsm.acceptingStates[i]))) {
      newFsm.acceptingStates.push(noam.util.clone(fsm.acceptingStates[i]));
    }
  }

  newFsm.initialState = noam.util.clone(getEquivalentState(fsm.initialState));

  for (var i=0; i<fsm.transitions.length; i++) {
    var transition = noam.util.clone(fsm.transitions[i]);

    if (isOneOfEquivalentStates(transition.fromState)) {
      continue;
    }

    for (var j=0; j<transition.toStates.length; j++) {
      transition.toStates[j] = getEquivalentState(transition.toStates[j]);
    }

    newFsm.transitions.push(transition);
  }

  return newFsm;
};

// minimizes the fsm by removing unreachable and equivalent states
noam.fsm.minimize = function(fsm) {
  var fsmType = noam.fsm.determineType(fsm);
  var newFsm = fsm;

  if (fsmType === noam.fsm.nfaType) {
    newFsm = noam.fsm.convertNfaToDfa(fsm);
  } else if (fsmType === noam.fsm.enfaType) {
    newFsm = noam.fsm.convertEnfaToNfa(fsm);
    newFsm = noam.fsm.convertNfaToDfa(newFsm);
  }

  var fsmWithoutUnreachableStates = noam.fsm.removeUnreachableStates(newFsm);
  var minimalFsm = noam.fsm.removeEquivalentStates(fsmWithoutUnreachableStates);
  return minimalFsm;
};

// generate random fsm
noam.fsm.createRandomFsm = function(fsmType, numStates, numAlphabet, maxNumToStates) {
  var newFsm = {};

  function prefix(ch, num, str) {
    var retStr = str;

    for (var i=0; i<str.length - num; i++) {
      retStr = ch + str;
    }

    return retStr;
  }

  newFsm.states = [];
  for (var i=0, len=numStates.toString().length; i<numStates; i++) {
    newFsm.states.push("s" + prefix("0", len, i.toString()));
  }

  newFsm.alphabet = [];
  for (var i=0, len=numAlphabet.toString().length; i<numAlphabet; i++) {
    newFsm.alphabet.push("a" + prefix("0", len, i.toString()));
  }

  newFsm.initialState = newFsm.states[0];

  newFsm.acceptingStates = [];
  for (var i=0; i<numStates; i++) {
    if(Math.round(Math.random())) {
      newFsm.acceptingStates.push(newFsm.states[i]);
    }
  }

  if (fsmType === noam.fsm.enfaType) {
    newFsm.alphabet.push(noam.fsm.epsilonSymbol);
  }

  newFsm.transitions = [];
  for (var i=0; i<numStates; i++) {
    for (var j=0; j<newFsm.alphabet.length; j++) {
      var numToStates = 1;

      if (fsmType !== noam.fsm.dfaType) {
        numToStates = Math.floor(Math.random()*maxNumToStates);
      }

      if (numToStates > 0) {
        var toStates = [];
        for (var k=0; k<newFsm.states.length && toStates.length < numToStates; k++) {
          var diff = (newFsm.states.length-k)-(numToStates-toStates.length) + 1;

          if (diff <= 0) {
            diff = 1;
          } else {
            diff = 1/diff;
          }

          if (Math.random() <= diff) {
            toStates.push(newFsm.states[k]);
          }
        }

        newFsm.transitions.push({fromState : newFsm.states[i], symbol : newFsm.alphabet[j], toStates : toStates});
      }
    }
  }

  if (fsmType === noam.fsm.enfaType) {
    newFsm.alphabet.pop();
  }

  return newFsm;
};

noam.fsm.convertNfaToDfa = function(fsm) {
  var fsmType = noam.fsm.determineType(fsm);
  if (fsmType === noam.fsm.enfaType) {
    throw new Error('FSM must be an NFA');
  }

  if (fsmType === noam.fsm.dfaType) {
    return fsm; // no need to convert it
  }

  var newFsm = {};

  newFsm.alphabet = noam.util.clone(fsm.alphabet);
  newFsm.states = [];
  newFsm.acceptingStates = [];
  newFsm.initialState = [noam.util.clone(fsm.initialState)];
  newFsm.transitions = [];

  for (var i=0; i<fsm.states.length; i++) {
    newFsm.states.push([noam.util.clone(fsm.states[i])]);
  }

  for (var i=0; i<fsm.acceptingStates.length; i++) {
    newFsm.acceptingStates.push([noam.util.clone(fsm.acceptingStates[i])]);
  }

  var newStates = [];
  var multiStates = [];

  for (var i=0; i<fsm.transitions.length; i++) {
    var transition = noam.util.clone(fsm.transitions[i]);
    transition.fromState = [transition.fromState];

    transition.toStates = [transition.toStates];

    if (transition.toStates[0].length > 1) {
      if (!(noam.util.containsSet(newStates, transition.toStates[0]))) {
        newStates.push(transition.toStates[0]);
      }
    }

    newFsm.transitions.push(transition);
  }

  while (newStates.length !== 0) {
    var state = newStates.pop();

    newFsm.states.push(state);

    if (noam.util.containsAny(fsm.acceptingStates, state)) {
      newFsm.acceptingStates.push(state);
    }

    for (var i=0; i<newFsm.alphabet.length; i++) {
      var ts = noam.fsm.makeTransition(fsm, state, newFsm.alphabet[i]).sort();

      for (var j=0; j<newFsm.states.length; j++) {
        if (noam.util.areEqualSets(ts, newFsm.states[j])) {
          ts = newFsm.states[j];
          break;
        }
      }
      
      for (var j=0; j<newStates.length; j++) {
        if (noam.util.areEqualSets(ts, newStates[j])) {
          ts = newStates[j];
          break;
        }
      }

      if (ts.length > 0) {
        newFsm.transitions.push({fromState : state, symbol : newFsm.alphabet[i], toStates : [ts]});
      }

      if (!(noam.util.containsSet(newFsm.states, ts)) && !(noam.util.containsSet(newStates, ts)) && ts.length > 1) {
        newStates.push(ts);
      }
    }
  }

  var errorAdded = false;
  var errorState = "ERROR";

  for (var i=0; i<newFsm.states.length; i++) {
    for (var j=0; j<newFsm.alphabet.length; j++) {
      var found = false;
      for (var k=0; k<newFsm.transitions.length; k++) {
        var transition = newFsm.transitions[k];

        if (noam.util.areEquivalent(transition.symbol, newFsm.alphabet[j]) &&
            noam.util.areEquivalent(transition.fromState, newFsm.states[i])) {
          found = true;
          break;
        }
      }

      if (found === false) {
        if (errorAdded === false) {
          newFsm.states.push([errorState]);
          errorAdded = true;
        }

        newFsm.transitions.push({fromState : newFsm.states[i], symbol : newFsm.alphabet[j], toStates : [[errorState]]});
      }
    }
  }

  return newFsm;
};

noam.fsm.convertEnfaToNfa = function(fsm) {
  if (noam.fsm.determineType(fsm) !== noam.fsm.enfaType) {
    return fsm; // this is already an NFA (or a DFA which is also an NFA)
  }

  var newFsm = noam.util.clone(fsm);

  var initialEpsilon = noam.fsm.computeEpsilonClosure(fsm, [fsm.initialState]);

  if (noam.util.containsAny(newFsm.acceptingStates, initialEpsilon) &&
      !(noam.util.contains(newFsm.acceptingStates, newFsm.initialState))) {
    newFsm.acceptingStates.push(newFsm.initialState);
  }

  var newTransitions = [];

  for (var i=0; i<newFsm.states.length; i++) {
    for (var j=0; j<newFsm.alphabet.length; j++) {
      var toStates = noam.fsm.makeTransition(newFsm, [newFsm.states[i]], newFsm.alphabet[j]).sort();

      if (toStates.length > 0) {
        newTransitions.push({
          fromState : newFsm.states[i],
          toStates : toStates,
          symbol : newFsm.alphabet[j]
        });
      }
    }
  }

  newFsm.transitions = newTransitions;

  var multiStateTransitions = [];

  for (var i=0; i<newFsm.transitions.length; i++) {
    var transition = newFsm.transitions[i];

    if (transition.toStates.length > 1) {
      var existing = false;

      for (var j=0; j<multiStateTransitions.length; j++) {
        if (noam.util.areEqualSets(transition.toStates, multiStateTransitions[j])) {
          transition.toStates = multiStateTransitions[j];
          existing = true;
          break;
        }
      }

      if (existing === false) {
        multiStateTransitions.push(transition.toStates);
      }
    }
  }

  return newFsm;
};

// test whether if the language accepted by the fsm contains at least one string
noam.fsm.isLanguageNonEmpty = function(fsm) {
  var fsmType = noam.fsm.determineType(fsm);
  var newFsm = fsm;

  if (fsmType === noam.fsm.nfaType) {
    newFsm = noam.fsm.convertNfaToDfa(fsm);
  } else if (fsmType === noam.fsm.enfaType) {
    newFsm = noam.fsm.convertEnfaToNfa(fsm);
    newFsm = noam.fsm.convertNfaToDfa(newFsm);
  }

  newFsm = noam.fsm.minimize(newFsm);

  return newFsm.acceptingStates.length > 0;
};

noam.fsm.isLanguageInfinite = function(fsm) {
  var fsmType = noam.fsm.determineType(fsm);
  var newFsm = fsm;

  if (fsmType === noam.fsm.nfaType) {
    newFsm = noam.fsm.convertNfaToDfa(fsm);
  } else if (fsmType === noam.fsm.enfaType) {
    newFsm = noam.fsm.convertEnfaToNfa(fsm);
    newFsm = noam.fsm.convertNfaToDfa(newFsm);
  }

  newFsm = noam.fsm.minimize(newFsm);

  var deadState = null;

  for (var i=0; i<newFsm.states.length; i++) {
    if (noam.util.contains(newFsm.acceptingStates, newFsm.states[i])) {
      continue;
    }

    var reachable = noam.fsm.getReachableStates(newFsm, newFsm.states[i], true);

    if (noam.util.containsAny(newFsm.acceptingStates, reachable)) {
      continue;
    }

    deadState = newFsm.states[i];
    break;
  }

  if (deadState === null) {
    return true;
  }

  for (var i=0; i<newFsm.states.length; i++) {
    if (noam.util.areEquivalent(deadState, newFsm.states[i])) {
      continue;
    }

    var reachable = noam.fsm.getReachableStates(newFsm, newFsm.states[i], false);

    if (noam.util.contains(reachable, newFsm.states[i])) {
      return true;
    }
  }

  return false;
};

// generate a random string which the fsm accepts
noam.fsm.randomStringInLanguage = function(fsm) {
  var fsmType = noam.fsm.determineType(fsm);
  var newFsm = fsm;

  if (fsmType === noam.fsm.nfaType) {
    newFsm = noam.fsm.convertNfaToDfa(fsm);
  } else if (fsmType === noam.fsm.enfaType) {
    newFsm = noam.fsm.convertEnfaToNfa(fsm);
    newFsm = noam.fsm.convertNfaToDfa(newFsm);
  }

  newFsm = noam.fsm.minimize(newFsm);

  if (newFsm.acceptingStates.length === 0) {
    return null;
  }

  var currentState = newFsm.acceptingStates[Math.floor(Math.random()*newFsm.acceptingStates.length)];
  var trail = [];

  while (true) {
    if (noam.util.areEquivalent(currentState, newFsm.initialState) === true) {
      if (Math.round(Math.random())) {
        break;
      }
    }

    var transitions = [];

    for (var i=0; i<newFsm.transitions.length; i++) {
      if (noam.util.areEquivalent(newFsm.transitions[i].toStates[0], currentState)) {
        transitions.push(newFsm.transitions[i]);
      }
    }

    if (transitions.length === 0) {
      break;
    }

    var transition = transitions[Math.floor(Math.random()*transitions.length)];

    trail.push(transition.symbol);
    currentState = transition.fromState;
  }

  trail.reverse();

  return trail;
};

// generate a random string which the fsm doest accept
noam.fsm.randomStringNotInLanguage = function(fsm) {
  var fsmType = noam.fsm.determineType(fsm);
  var newFsm = fsm;

  if (fsmType === noam.fsm.nfaType) {
    newFsm = noam.fsm.convertNfaToDfa(fsm);
  } else if (fsmType === noam.fsm.enfaType) {
    newFsm = noam.fsm.convertEnfaToNfa(fsm);
    newFsm = noam.fsm.convertNfaToDfa(newFsm);
  }

  newFsm = noam.fsm.minimize(newFsm);

  var nonAcceptingStates = [];

  for (var i=0; i<newFsm.states.length; i++) {
    if (!(noam.util.contains(newFsm.acceptingStates, newFsm.states[i]))) {
      nonAcceptingStates.push(newFsm.states[i]);
    }
  }

  if (nonAcceptingStates.length === 0) {
    return null;
  }

  var currentState = nonAcceptingStates[Math.floor(Math.random()*nonAcceptingStates.length)];
  var trail = [];

  while (true) {
    if (noam.util.areEquivalent(currentState, newFsm.initialState) === true) {
      if (Math.round(Math.random())) {
        break;
      }
    }

    var transitions = [];

    for (var i=0; i<newFsm.transitions.length; i++) {
      if (noam.util.areEquivalent(newFsm.transitions[i].toStates[0], currentState)) {
        transitions.push(newFsm.transitions[i]);
      }
    }

    if (transitions.length === 0) {
      break;
    }

    var transition = transitions[Math.floor(Math.random()*transitions.length)];

    trail.push(transition.symbol);
    currentState = transition.fromState;
  }

  trail.reverse();

  return trail;
};

// get a new fsm which accepts the language L=L1+L2 (set union) where
// L1 is the language accepted by fsma and
// L2 is the language accepted by fsmB
noam.fsm.union = function(fsmA, fsmB) {
  if (!(noam.util.areEquivalent(fsmA.alphabet, fsmB.alphabet))) {
    throw new Error("Alphabets must be the same");
  }

  var newFsm = {
    alphabet : noam.util.clone(fsmA.alphabet),
    states : [],
    initialState : [noam.util.clone(fsmA.initialState), noam.util.clone(fsmB.initialState)],
    acceptingStates : [],
    transitions : []
  };

  for (var i=0; i<fsmA.states.length; i++) {
    for (var j=0; j<fsmB.states.length; j++) {
      var newState = [noam.util.clone(fsmA.states[i]), noam.util.clone(fsmB.states[j])];
      newFsm.states.push(newState);

      if (noam.util.contains(fsmA.acceptingStates, fsmA.states[i]) ||
          noam.util.contains(fsmB.acceptingStates, fsmB.states[j])) {
        newFsm.acceptingStates.push(newState);
      }

      for (var k=0; k<newFsm.alphabet.length; k++) {
        newFsm.transitions.push({
          fromState : newState,
          symbol : newFsm.alphabet[k],
          toStates : [[noam.fsm.makeTransition(fsmA, [fsmA.states[i]], newFsm.alphabet[k])[0],
                      noam.fsm.makeTransition(fsmB, [fsmB.states[j]], newFsm.alphabet[k])[0]]]
        });
      }
    }
  }

  return newFsm;
};

// get a new fsm which accepts the language L=L1/L2 (set intersection) where
// L1 is the language accepted by fsma and
// L2 is the language accepted by fsmB
noam.fsm.intersection = function(fsmA, fsmB) {
  if (!(noam.util.areEquivalent(fsmA.alphabet, fsmB.alphabet))) {
    throw new Error("Alphabets must be the same");
  }

  var newFsm = {
    alphabet : noam.util.clone(fsmA.alphabet),
    states : [],
    initialState : [noam.util.clone(fsmA.initialState), noam.util.clone(fsmB.initialState)],
    acceptingStates : [],
    transitions : []
  };

  for (var i=0; i<fsmA.states.length; i++) {
    for (var j=0; j<fsmB.states.length; j++) {
      var newState = [noam.util.clone(fsmA.states[i]), noam.util.clone(fsmB.states[j])];
      newFsm.states.push(newState);

      if (noam.util.contains(fsmA.acceptingStates, fsmA.states[i]) &&
          noam.util.contains(fsmB.acceptingStates, fsmB.states[j])) {
        newFsm.acceptingStates.push(newState);
      }

      for (var k=0; k<newFsm.alphabet.length; k++) {
        newFsm.transitions.push({
          fromState : newState,
          symbol : newFsm.alphabet[k],
          toStates : [[noam.fsm.makeTransition(fsmA, [fsmA.states[i]], newFsm.alphabet[k])[0],
                      noam.fsm.makeTransition(fsmB, [fsmB.states[j]], newFsm.alphabet[k])[0]]]
        });
      }
    }
  }

  return newFsm;
};

// get a new fsm which accepts the language L=L1-L2 (set difference) where
// L1 is the language accepted by fsma and
// L2 is the language accepted by fsmB
noam.fsm.difference = function(fsmA, fsmB) {
  if (!(noam.util.areEquivalent(fsmA.alphabet, fsmB.alphabet))) {
    throw new Error("Alphabets must be the same");
  }

  var newFsm = {
    alphabet : noam.util.clone(fsmA.alphabet),
    states : [],
    initialState : [noam.util.clone(fsmA.initialState), noam.util.clone(fsmB.initialState)],
    acceptingStates : [],
    transitions : []
  };

  for (var i=0; i<fsmA.states.length; i++) {
    for (var j=0; j<fsmB.states.length; j++) {
      var newState = [noam.util.clone(fsmA.states[i]), noam.util.clone(fsmB.states[j])];
      newFsm.states.push(newState);

      if (noam.util.contains(fsmA.acceptingStates, fsmA.states[i]) &&
          !(noam.util.contains(fsmB.acceptingStates, fsmB.states[j]))) {
        newFsm.acceptingStates.push(newState);
      }

      for (var k=0; k<newFsm.alphabet.length; k++) {
        newFsm.transitions.push({
          fromState : newState,
          symbol : newFsm.alphabet[k],
          toStates : [[noam.fsm.makeTransition(fsmA, [fsmA.states[i]], newFsm.alphabet[k])[0],
                      noam.fsm.makeTransition(fsmB, [fsmB.states[j]], newFsm.alphabet[k])[0]]]
        });
      }
    }
  }

  return newFsm;
};

// get a new fsm which accepts the complement language of the 
// langauge accepted by the input fsm
noam.fsm.complement = function(fsm) {
  var newFsm = noam.util.clone(fsm);

  var newAccepting = [];

  for (var i=0; i<newFsm.states.length; i++) {
    if (!(noam.util.contains(newFsm.acceptingStates, newFsm.states[i]))) {
      newAccepting.push(newFsm.states[i]);
    }
  }

  newFsm.acceptingStates = newAccepting;

  return newFsm;
};

// get a new fsm which accepts the language L1L2 where
// L1 is the language accepted by fsmA and L2 is the
// langauge accepted by fsmB
noam.fsm.concatenation = function(fsmA, fsmB) {
  if (!(noam.util.areEquivalent(fsmA.alphabet, fsmB.alphabet))) {
    throw new Error("Alphabets must be the same");
  }

  if (noam.util.containsAny(fsmA.states, fsmB.states)) {
    throw new Error("States must not overlap");
  }

  var newFsm = {
    alphabet : noam.util.clone(fsmA.alphabet),
    states : noam.util.clone(fsmA.states).concat(noam.util.clone(fsmB.states)),
    initialState : noam.util.clone(fsmA.initialState),
    acceptingStates : noam.util.clone(fsmB.acceptingStates),
    transitions : noam.util.clone(fsmA.transitions).concat(noam.util.clone(fsmB.transitions))
  };

  for (var i=0; i<fsmA.acceptingStates.length; i++) {
    newFsm.transitions.push({
      fromState : noam.util.clone(fsmA.acceptingStates[i]),
      toStates : [noam.util.clone(fsmB.initialState)],
      symbol : noam.fsm.epsilonSymbol
    });
  }

  return newFsm;
};

// get a new fsm which accepts the language L*, where L is
// accepted by the input fsm and * is the kleene operator
noam.fsm.kleene = function(fsm) {
  var newFsm = noam.util.clone(fsm);

  var newInitial = "NEW_INITIAL";

  newFsm.states.push(newInitial);
  newFsm.transitions.push({
    fromState : newInitial,
    toStates : [newFsm.initialState],
    symbol : noam.fsm.epsilonSymbol
  });
  newFsm.initialState = newInitial;

  for (var i=0; i<newFsm.acceptingStates.length; i++) {
    newFsm.transitions.push({
      fromState : newFsm.acceptingStates[i],
      toStates : [newInitial],
      symbol : noam.fsm.epsilonSymbol
    });
  }

  return newFsm;
};

// get a new fsm which accepts the reverse language of the input fsm
noam.fsm.reverse = function(fsm) {
  var newFsm = noam.util.clone(fsm);

  var newTransitions = [];

  for (var i=0; i<newFsm.transitions.length; i++) {
    for (var j=0; j<newFsm.transitions[i].toStates.length; j++) {
      newTransitions.push({
        fromState : newFsm.transitions[i].toStates[j],
        toStates : [newFsm.transitions[i].fromState],
        symbol : newFsm.transitions[i].symbol
      });
    }
  }

  newFsm.transitions = newTransitions;

  var oldAcceptingStates = newFsm.acceptingStates;

  newFsm.acceptingStates = [newFsm.initialState];

  var newInitialState = "NEW_INITIAL";
  newFsm.states.push(newInitialState);
  newFsm.initialState = newInitialState;

  newFsm.transitions.push({
    fromState : newInitialState,
    toStates : oldAcceptingStates,
    symbol : noam.fsm.epsilonSymbol
  });

  return newFsm;
};

// check whether the language accepted by fsmB is a subset of 
// the language accepted by fsmA
noam.fsm.isSubset = function(fsmA, fsmB) {
  var fsmIntersection = noam.fsm.intersection(fsmA, fsmB);

  return noam.fsm.areEquivalentFSMs(fsmB, fsmIntersection);
};

// convert the fsm into a regular grammar
noam.fsm.grammar = function(fsm) {
  var grammar = {
    nonterminals : noam.util.clone(fsm.states),
    terminals : noam.util.clone(fsm.alphabet),
    initialNonterminal : noam.util.clone(fsm.initialState),
    productions : []
  };

  for (var i=0; i<fsm.transitions.length; i++) {
    if (fsm.transitions[i].symbol === noam.fsm.epsilonSymbol) {
      grammar.productions.push({
        left : [noam.util.clone(fsm.transitions[i].fromState)],
        right : noam.util.clone(fsm.transitions[i].toStates)
      });
    } else {
      grammar.productions.push({
        left : [noam.util.clone(fsm.transitions[i].fromState)],
        right : [noam.util.clone(fsm.transitions[i].symbol)].concat(
          noam.util.clone(fsm.transitions[i].toStates))
      });
    }
  }

  for (var i=0; i<fsm.acceptingStates.length; i++) {
    grammar.productions.push({
      left : [noam.util.clone(fsm.acceptingStates[i])],
      right : [noam.grammar.epsilonSymbol]
    });
  }

  return grammar;
};

noam.fsm.symbolsForTransitions = function(fsm, stateA, stateB) {
  var res = [];
  
  for (var i=0; i<fsm.transitions.length; i++) {
    var transition = fsm.transitions[i];
    
    if (noam.util.areEquivalent(transition.fromState, stateA) &&
        noam.util.contains(transition.toStates, stateB)) {
      res.push(transition.symbol)
    }
  }
  
  return res;
};

noam.fsm.toRegex = function(fsm) {
  var r = [];
  var n = fsm.states.length;
  
  for (var k=0; k<n+1; k++) {
    r[k] = []
    for (var i=0; i<n; i++) {
      r[k][i] = []
    }
  }
  
  for (var i=0; i<n; i++) {
    for (var j=0; j<n; j++) {
      var symbols = noam.fsm.symbolsForTransitions(fsm, fsm.states[i], fsm.states[j]);
      
      for (var z=0; z<symbols.length; z++) {
        symbols[z] = noam.re.tree.makeLit(symbols[z]);
      }
      
      if (i === j) {
        symbols.push(noam.re.tree.makeEps());
      }
      
      r[0][i][j] = noam.re.tree.makeAlt(symbols);
    }
  }
  
  for (var k=1; k<n+1; k++) {
    for (var i=0; i<n; i++) {
      for (var j=0; j<n; j++) {
        r[k][i][j] = noam.re.tree.makeAlt([r[k-1][i][j], noam.re.tree.makeSeq([r[k-1][i][k-1], noam.re.tree.makeKStar(r[k-1][k-1][k-1]), r[k-1][k-1][j]])])
      }
    }
  }
  
  var startStateIndex = -1;
  var acceptableStatesIndexes = []
  
  for (var i=0; i<fsm.states.length; i++) {
    if (noam.util.areEquivalent(fsm.states[i], fsm.initialState)) {
      startStateIndex = i;
    }
    
    if (noam.util.contains(fsm.acceptingStates, fsm.states[i])) {
      acceptableStatesIndexes.push(i);
    }
  }
  
  var elements = []
  
  for (var i=0; i<acceptableStatesIndexes.length; i++) {
    elements.push(r[n][startStateIndex][acceptableStatesIndexes[i]])
  }

  return noam.re.tree.makeAlt(elements);
};

noam.grammar = {};

noam.grammar.epsilonSymbol = '$';
noam.grammar.regType = 'regular';
noam.grammar.cfgType = 'context-free';
noam.grammar.csgType = 'context-sensitive';
noam.grammar.unrestrictedType = 'unrestricted';

// validate the grammar
noam.grammar.validate = function(grammar) {
  if (!(typeof grammar !== 'undefined' &&
      Array.isArray(grammar.nonterminals) &&
      Array.isArray(grammar.terminals) &&
      typeof grammar.initialNonterminal !== 'undefined' && grammar.initialNonterminal !== null &&
      Array.isArray(grammar.productions))) {
    return new Error('Grammar must be defined and have nonterminals, terminals, initialNonterminal and productions array properties!');
  }

  if (grammar.nonterminals.length < 1) {
    return new Error('Set of nonterminals must not be empty.');
  }

  if (grammar.terminals.length < 1) {
    return new Error('Set of terminals must not be empty.');
  }

  for (var i=0; i<grammar.nonterminals.length; i++) {
    if (noam.util.contains(grammar.nonterminals, grammar.nonterminals[i], i+1)) {
      return new Error('Equivalent nonterminals');
    }
  }

  for (var i=0; i<grammar.terminals.length; i++) {
    if (noam.util.contains(grammar.terminals, grammar.terminals[i], i+1)) {
      return new Error('Equivalent terminals');
    }
  }

  for (var i=0; i<grammar.terminals.length; i++) {
    if (noam.util.contains(grammar.nonterminals, grammar.terminals[i])) {
      return new Error('Terminals and nonterminals must not overlap');
    }
  }

  if (!(noam.util.contains(grammar.nonterminals, grammar.initialNonterminal))) {
    return new Error('InitialNonterminal must be in nonterminals');
  }

  for (var i=0; i<grammar.productions.length; i++) {
    var production = grammar.productions[i];

    if (!(Array.isArray(production.left))) {
      return new Error('Left side of production must be an array');
    }

    if (production.left.length === 0) {
      return new Error('Left side of production must have at least one terminal or nonterminal');
    }

    for (var j=0; j<production.left.length; j++) {
      if (!(noam.util.contains(grammar.nonterminals, production.left[j])) &&
          !(noam.util.contains(grammar.terminals, production.left[j]))) {
        return new Error('Left side of production must be in nonterminals or terminals');
      }
    }

    if (!(Array.isArray(production.right))) {
      return new Error('Right side of production must be an array');
    }

    if (production.right.length === 1 && production.right[0] === noam.grammar.epsilonSymbol) {
      ;
    } else {
      if (production.right.length === 0) {
        return new Error('Right side of production must have at least one terminal or nonterminal or epsilon symbol');
      }

      for (var j=0; j<production.right.length; j++) {
        if (!(noam.util.contains(grammar.nonterminals, production.right[j])) &&
            !(noam.util.contains(grammar.terminals, production.right[j]))) {
          return new Error('Right side of production must be in nonterminals or terminals');
        }
      }
    }

    if (noam.util.contains(grammar.productions, production, i+1)) {
      return new Error('Grammar must not have duplicate productions');
    }
  }

  return true;
};

// determine whether the grammar is regular, context-free, 
// context-sensitive or unrestricted
noam.grammar.determineType = function(grammar) {
  var type = noam.grammar.regType;
  var isRightRegular = null;

  for (var i=0; i<grammar.productions.length; i++) {
    var production = grammar.productions[i];

    // handle both left-regular and right-regular
    if (type === noam.grammar.regType) {
      if (production.left.length !== 1 || !(noam.util.contains(grammar.nonterminals, production.left[0]))) {
        type = noam.grammar.cfgType;
      } else {
        if (production.right.length === 1) {
          continue;
        } else {
          var rightNonTerminalCount = 0;
          var indexOfNonterminal = -1;

          for (var j=0; j<production.right.length; j++) {
            if (noam.util.contains(grammar.nonterminals, production.right[j])) {
              rightNonTerminalCount += 1;
              indexOfNonterminal = j;
            }
          }

          if (rightNonTerminalCount > 1) {
            type = noam.grammar.cfgType;
          } else if (rightNonTerminalCount === 0) {
            continue;
          } else {
            if (indexOfNonterminal === 0) {
              if (isRightRegular === null) {
                isRightRegular = false;
                continue;
              } else if (isRightRegular === false) {
                continue;
              } else if (isRightRegular === true) {
                type = noam.grammar.cfgType;
              }
            } else if (indexOfNonterminal === production.right.length - 1) {
              if (isRightRegular === null) {
                isRightRegular = true;
                continue;
              } else if (isRightRegular === true) {
                continue;
              } else if (isRightRegular === false) {
                type = noam.grammar.cfgType;
              }
            } else {
              type = noam.grammar.cfgType;
            }
          }
        }
      }
    }

    if (type === noam.grammar.cfgType) {
      if (production.left.length !== 1 || !(noam.util.contains(grammar.nonterminals, production.left[0]))) {
        type = noam.grammar.csgType;
      }
    }

    if (type === noam.grammar.csgType) {
      var leftNonTerminalCount = 0;
      var indexOfNonterminal = -1;

      for (var j=0; j<production.left.length; j++) {
        if (noam.util.contains(grammar.nonterminals, production.left[j])) {
          leftNonTerminalCount += 1;
          indexOfNonterminal = j;
        }
      }

      if (leftNonTerminalCount > 1) {
        return noam.grammar.unrestrictedType;
      }

      var prefix = production.left.slice(0, indexOfNonterminal-1);
      var sufix = production.left.slice(indexOfNonterminal);

      for (var j=0; j<prefix.length; j++) {
        if (!(noam.util.areEquivalent(prefix[j], production.right[j]))) {
          return noam.grammar.unrestrictedType;
        }
      }

      for (var j=0; j<sufix.length; j++) {
        if (!(noam.util.areEquivalent(sufix[sufix.length-j-1], production.right[production.right.length-j-1]))) {
          return noam.grammar.unrestrictedType;
        }
      }

      if (production.right.length <= prefix.length + sufix.length) {
        return noam.grammar.unrestrictedType;
      }
    }
  }

  return type;
};

// print the grammar in a human-readable condensed ascii format
noam.grammar.printAscii = function(grammar) {
  var str = [];

  str.push("Initial nonterminal: " + "<" + grammar.initialNonterminal + ">");

  var slimProds = [];

  for (var i=0; i<grammar.productions.length; i++) {
    var foundSlim = -1;

    for (var j=0; j<slimProds.length; j++) {
      if (noam.util.areEquivalent(slimProds[j][0], grammar.productions[i].left)) {
        foundSlim = j;
        break;
      }
    }

    if (foundSlim === -1) {
      slimProds[slimProds.length] = [grammar.productions[i].left, [grammar.productions[i].right]];
    } else {
      slimProds[foundSlim][1].push(grammar.productions[i].right);
    }
  }

  for (var i=0; i<slimProds.length; i++) {
    var prod = [];

    for (var j=0; j<slimProds[i][0].length; j++) {
      if (noam.util.contains(grammar.nonterminals, slimProds[i][0][j])) {
        prod.push("<" + slimProds[i][0][j].toString() + ">");
      } else {
        if (slimProds[i][0][j] === noam.grammar.epsilonSymbol) {
          prod.push(slimProds[i][0][j].toString());
        } else {
          prod.push('"' + slimProds[i][0][j].toString() + '"');
        }
      }
    }

    prod.push("->");

    for (var j=0; j<slimProds[i][1].length; j++) {
      for (var k=0; k<slimProds[i][1][j].length; k++) {
        if (noam.util.contains(grammar.nonterminals, slimProds[i][1][j][k])) {
          prod.push("<" + slimProds[i][1][j][k].toString() + ">");
        } else {
          if (slimProds[i][1][j][k] === noam.grammar.epsilonSymbol) {
            prod.push(slimProds[i][1][j][k].toString());
          } else {
            prod.push('"' + slimProds[i][1][j][k].toString() + '"');
          }
        }
      }

      if (j < slimProds[i][1].length - 1) {
        prod.push("|");
      }
    }

    str.push(prod.join(" "));
  }

  return str.join("\n");
};

/* 
 * Regular expressions module.
 *
 * Parsed regular expressions are represented by a syntax tree. Tools for working with that 
 * representation are accessible through noam.re.tree.
 *
 * Two linear representations are also available and provide a convenient way to specify
 * some languages, but are not composable like the tree representation. The array representation
 * is available through noam.re.array and supports arbitrarily complex literals. If all the
 * literals are characters, the string representation should be more convenient. It is 
 * available through noam.re.string. These linear representations are only useful for specifying
 * languages and should usually be converted to a tree representation or to an automaton immediately.
 */
noam.re = (function() {

  /*
   * Tools for creating and manipulating parsed regular expressions.
   *
   * The make* functions are a minimal API that can be used to create arbitrarily complex
   * regular expressions programatically.
   */
  var tree = (function() {
    var tags = {
      ALT: 'alt',
      SEQ: 'sequence',
      KSTAR: 'kleene_star',
      LIT: 'literal',
      EPS: 'epsilon',
    };

    // The choices parameter must be an array of expression trees.
    // Returns the root of a new tree that represents the expression that is the union of
    // all the choices.
    function makeAlt(choices) {
      return {
        tag: tags.ALT,
        choices: choices,
      };
    }

    // The elements parameter must be an array of expression trees.
    // Returns the root of a new tree that represents the expression that is the sequence
    // of all the elements.
    function makeSeq(elements) {
      return {
        tag: tags.SEQ,
        elements: elements,
      };
    }

    // Wraps the given expressin tree unde a Kleene star operator.
    // Returns the root of the new tree.
    function makeKStar(expr) {
      return {
        tag: tags.KSTAR,
        expr: expr,
      };
    }

    // Creates a node that represents the literal obj.
    function makeLit(obj) {
      return {
        tag: tags.LIT,
        obj: obj,
      };
    }

    var epsNode = {
      tag: tags.EPS,
    };
    // Returns a node representing the empty string regular expression.
    function makeEps() {
      return epsNode;
    }

    function _altToAutomaton(regex, automaton, stateCounter) {
      var l = noam.fsm.addState(automaton, stateCounter.getAndAdvance());
      var r = noam.fsm.addState(automaton, stateCounter.getAndAdvance());
      for (var i=0; i<regex.choices.length; i++) {
        var statePair = _dispatchToAutomaton(regex.choices[i], automaton, stateCounter);
        noam.fsm.addEpsilonTransition(automaton, l, [statePair[0]]);
        noam.fsm.addEpsilonTransition(automaton, statePair[1], [r]);
      }
      return [l, r];
    }

    function _seqToAutomaton(regex, automaton, stateCounter) {
      // Create the parts for the sequence elements and connect them via epsilon transitions.
      var l, r, statePair;
      for (var i=0; i<regex.elements.length; i++) {
        statePair = _dispatchToAutomaton(regex.elements[i], automaton, stateCounter);
        if (i === 0) { // this is the first element
          l = statePair[0];
        } else { // this is a later element that needs to be connected to the previous elements
          noam.fsm.addEpsilonTransition(automaton, r, [statePair[0]]);
        }
        r = statePair[1];
      }

      if (l === undefined) { // empty language
        l = noam.fsm.addState(automaton, stateCounter.getAndAdvance());
        r = noam.fsm.addState(automaton, stateCounter.getAndAdvance());
      }

      return [l, r];
    }

    function _KStarToAutomaton(regex, automaton, stateCounter) {
      // The $ sign in the following drawing represents an epsilon transition.
      //
      //    ----------------$>----------------
      //   /                                  \
      // |l|-$>-|ll|...(regex.expr)...|rr|-$>-|r|
      //          \_________<$_________/
      //
      var l = noam.fsm.addState(automaton, stateCounter.getAndAdvance());
      var r = noam.fsm.addState(automaton, stateCounter.getAndAdvance());
      var inner = _dispatchToAutomaton(regex.expr, automaton, stateCounter);
      var ll = inner[0];
      var rr = inner[1];
      noam.fsm.addEpsilonTransition(automaton, l, [r]); // zero times
      noam.fsm.addEpsilonTransition(automaton, l, [ll]); // once or more times
      noam.fsm.addEpsilonTransition(automaton, rr, [ll]); // repeat
      noam.fsm.addEpsilonTransition(automaton, rr, [r]); // continue after one or more repetitions

      return [l, r];
    }

    function _litToAutomaton(regex, automaton, stateCounter) {
      // Generate the "left" and "right" states and connect them with the appropriate
      // transition symbol.
      var l = noam.fsm.addState(automaton, stateCounter.getAndAdvance());
      var r = noam.fsm.addState(automaton, stateCounter.getAndAdvance());
      try {
        noam.fsm.addSymbol(automaton, regex.obj);
      } catch (err) {
        ; // addSymbol can throw if the symbol already exists - that's ok but
          // would like to be able to avoid catching other exceptions
          // TODO: use a custom exception class instead of Error
      }
      noam.fsm.addTransition(automaton, l, [r], regex.obj);
      return [l, r];
    }

    function _epsToAutomaton(regex, automaton, stateCounter) {
      // Generate the "left" and "right" states and connect them with an epsilon transition.
      var l = noam.fsm.addState(automaton, stateCounter.getAndAdvance());
      var r = noam.fsm.addState(automaton, stateCounter.getAndAdvance());
      noam.fsm.addEpsilonTransition(automaton, l, [r]);
      return [l, r];
    }

    var _toAutomatonFuns = {};
    _toAutomatonFuns[tags.ALT] = _altToAutomaton;
    _toAutomatonFuns[tags.SEQ] = _seqToAutomaton;
    _toAutomatonFuns[tags.KSTAR] = _KStarToAutomaton;
    _toAutomatonFuns[tags.LIT] = _litToAutomaton;
    _toAutomatonFuns[tags.EPS] = _epsToAutomaton;

    // Calls the appropriate *ToAutomaton function to handle the various kinds of regular expressions.
    // @a stateCounter holds the number of the next state to be added to the automaton.
    // Every *ToAutomaton function modifies @a automaton and returns a pair of states (as a two element array).
    // The first state is the start state and the second state is the accepting state of the part of the
    // automaton that accepts the language defined by @a regex.
    function _dispatchToAutomaton(regex, automaton, stateCounter) {
      return _toAutomatonFuns[regex.tag](regex, automaton, stateCounter);
    }

    // Returns the equivalent FSM for the specified regular expression in the tree representation.
    function toAutomaton(regex) {
      var automaton = noam.fsm.makeNew();
      var statePair = _dispatchToAutomaton(regex, automaton, noam.util.makeCounter(0));
      noam.fsm.setInitialState(automaton, statePair[0]);
      noam.fsm.addAcceptingState(automaton, statePair[1]);
      return automaton;
    }


    // "Operator" precedence lookup. This is used when determining if we need to 
    // insert parentheses to preserve the meaning of the regex when converting from
    // the tree representation to the array representation.
    var _prec = {};
    _prec[tags.ALT] = 0;
    _prec[tags.SEQ] = 1;
    _prec[tags.KSTAR] = 2;
    // these two are not operators, but it's convenient to assign them a precedence
    // for uniformity... since they are just atoms (i.e. can't be "regrouped"), their
    // precedence is higher than all the operators
    _prec[tags.LIT] = 3;
    _prec[tags.EPS] = 3;

    // Returns true if parantheses are needed around the child expression 
    // when it is embedded into the parent expression, false otherwise.
    function _needParens(par, child) {
      return _prec[par.tag] >= _prec[child.tag];
    }

    // Add child to the array representation, and surround it with parentheses
    // if necessary.
    function _optParenToArray(par, child, arr) {
      var parens = _needParens(par, child);
      if (parens) {
          arr.push(noam.re.array.specials.LEFT_PAREN);
      }
      _dispatchToArray(child, arr);
      if (parens) {
          arr.push(noam.re.array.specials.RIGHT_PAREN);
      }
    }

    // Common implementation for _altToArray and _seqToArray.
    function _binOpToArray(regex, arr, parts, operand) {
      for (var i=0; i<parts.length; i++) {
        if (operand!==undefined && i>0) {
          arr.push(operand);
        }
        _optParenToArray(regex, parts[i], arr);
      }
    }

    function _altToArray(regex, arr) {
      _binOpToArray(regex, arr, regex.choices, noam.re.array.specials.ALT);
    }

    function _seqToArray(regex, arr) {
      _binOpToArray(regex, arr, regex.elements);
    }

    function _KStarToArray(regex, arr) {
      _optParenToArray(regex, regex.expr, arr);
      arr.push(noam.re.array.specials.KSTAR);
    }

    function _litToArray(regex, arr) {
      arr.push(regex.obj);
    }

    function _epsToArray(regex, arr) {
      arr.push(noam.re.array.specials.EPS);
    }

    var _toArrayFuns = {};
    _toArrayFuns[tags.ALT] = _altToArray;
    _toArrayFuns[tags.SEQ] = _seqToArray;
    _toArrayFuns[tags.KSTAR] = _KStarToArray;
    _toArrayFuns[tags.LIT] = _litToArray;
    _toArrayFuns[tags.EPS] = _epsToArray;

    // Calls the appropriate *ToArray function to handle the various kinds of regular expressions.
    // @a arr acts as an accumulator for all *ToArray functions.
    function _dispatchToArray(regex, arr) {
      return _toArrayFuns[regex.tag](regex, arr);
    }

    // Returns the array representation (i.e. noam.re.array) of @a regex which must
    // be in the tree (i.e. noam.re.tree) representation.
    // Parentheses are inserted into the array to preserve the meaning of the
    // regex. However, this does not really lead to minimal parenthesization because
    // it doesn't consider any rewriting rules. More specifically, if there were 
    // parentheses that modify associativity of alteration or sequencing in the 
    // original regex that was parsed into this tree, they will be preserved 
    // even though they are not necessary.
    function toArray(regex) {
      var arr = [];
      _dispatchToArray(regex, arr);
      return arr;
    }

    // Returns the string representation of @a regex which must be in the tree
    // (i.e. noam.re.tree) representation. This is not always possible, so 
    // this function throws when the regex contains some symbols which are not
    // single-character strings.
    //
    // Semantically equivalent to first calling toArray and then calling
    // noam.re.array.toString on the result.
    function toString(regex) {
      return noam.re.array.toString(toArray(regex));
    }

    // Returns a random regex containing at most @a numSymbols symbols from the
    // specified array of possible symbols @a alphabet. The probability distribution
    // of symbol selection is uniform and can be skewed by repeating elements in 
    // alphabet. The parameter @a cfg is optional and can contain the following
    // fields:
    //   ALT_PROB    - the probability that alteration is used between two subexpressions
    //                 instead of sequencing (default 0.5)
    //   KLEENE_PROB - the probability that any subexpression is put under the Kleene
    //                 star operator (default 0.1)
    //   EPS_PROB    - the probability that epsilon is added as an alteration choice 
    //                 (default 0.1)
    function random(numSymbols, alphabet, cfg) {
      var altp = 0.5;
      var kleenep = 0.1;
      var epsp = 0.1;
      if (cfg) {
        if (cfg.ALT_PROB) {
          altp = cfg.ALT_PROB;
        }
        if (cfg.KLEENE_PROB) { 
          kleenep = cfg.KLEENE_PROB;
        }
        if (cfg.EPS_PROB) {
          epsp = cfg.EPS_PROB;
        }
      }

      return _randomKleene(numSymbols, alphabet, altp, kleenep, epsp);
    }

    function _randomKleene(numSymbols, alphabet, altp, kleenep, epsp) {
      var expr = _randomExpr(numSymbols, alphabet, altp, kleenep, epsp);
      if (Math.random() <= kleenep) {
        expr = makeKStar(expr);
      }
      return expr;
    }

    function _randomExpr(numSymbols, alphabet, altp, kleenep, epsp) {
      if (numSymbols == 0) {
        return makeEps();
      } else if (numSymbols == 1) {
        return makeLit(alphabet[noam.util.randint(0, alphabet.length-1)]);
      } else if (Math.random() <= epsp) {
        return makeAlt([makeEps(),
            _randomKleene(numSymbols, alphabet, altp, kleenep, epsp)]);
      } else {
        var left_sz = noam.util.randint(1, numSymbols-1);
        var left = _randomKleene(left_sz, alphabet, altp, kleenep, epsp);
        var right = _randomKleene(numSymbols - left_sz, alphabet, altp, kleenep, epsp);
        if (Math.random() <= altp) {
          return makeAlt([left, right]);
        } else {
          return makeSeq([left, right]);
        }
      }
    }

    return {
      tags: tags,

      makeAlt: makeAlt,
      makeSeq: makeSeq,
      makeKStar: makeKStar,
      makeLit: makeLit,
      makeEps: makeEps,

      toAutomaton: toAutomaton,
      toArray: toArray,
      toString: toString,

      random: random,
    };
  })();

  /*
   * A linear representation of regular expressions.
   * Every symbol can be an arbitrary object.
   *
   * Regular expression operators, parentheses and epsilon must be represented using 
   * the array.specials constants.
   *
   * Concatenation is implicit when there are no operators between two subexpressions.
   * The default operator precedence is Kleene star > concatenation > alteration, and
   * can be modified using parentheses.
   */
  var array = (function() {
    // This is based on object identity, i.e. each of these constants will be different 
    // from any other object that can be inserted into the regex array.
    var specials = {
      ALT: {},
      KSTAR: {},
      LEFT_PAREN: {},
      RIGHT_PAREN: {},
      EPS: {},
    };

    // The next three functions are used to make a convenient array wrapper
    // used in the parsing code.
    //
    // This peek method relies on the fact that accessing "out of bounds"
    // will return undefined.
    function _peek() {
      return this.arr[this.idx];
    }
    function _advance() {
      ++this.idx;
    }
    function _makeInputSeq(arr) {
      return {
        arr: arr,
        idx: 0,
        peek: _peek,
        advance: _advance,
      };
    }

    // Returns the tree representation of the regex given by @a arr.
    function toTree(arr) {
      var input = _makeInputSeq(arr);
      var result = _parseExpr(input);
      
      // should be at end of input
      if (input.peek() !== undefined) {
        throw new Error("Malformed regex array: successfully parsed up to position " + input.idx);
      }
      return result;
    }

    // Returns the replacement string for objects in noam.re.array.specials or
    // undefined if @a obj doesn't match any of them.
    function _replacementStr(obj) {
      // This can't be done with a dict because objects are not hashable...
      if (obj === specials.ALT) {
        return "+";
      } else if (obj === specials.KSTAR) {
        return "*";
      } else if (obj === specials.LEFT_PAREN) {
        return "(";
      } else if (obj === specials.RIGHT_PAREN) {
        return ")";
      } else if (obj === specials.EPS) {
        return "$";
      } else {
        return undefined;
      }
    }

    // If @a chr is one of the escapable characters
    // in the string representation (i.e. element of noam.re.string.escapable),
    // returns it prefixed by a backslash (i.e. escaped).
    // Otherwise returns chr unchanged.
    function _escape(chr) {
      var escapable = noam.re.string.escapable;
      for (var i=0; i<escapable.length; i++) {
        if (chr === escapable[i]) {
          return "\\" + chr;
        }
      }
      return chr;
    }

    // Returns the string representation of the regex given by @a arr.
    // 
    // Throws if the regex contains any symbols which are not one-character strings
    // and special symbols from noam.re.array.specials.
    function toString(arr) {
      var res = [];
      var elem;
      var failed = false;
      for (var i=0; i<arr.length; i++) {
        elem = arr[i];
        if (typeof(elem) === "string") {
          if (elem.length !== 1) {
            failed = true;
          } else {
            elem = _escape(elem);
          }
        } else {
          elem = _replacementStr(elem);
          if (elem === undefined) {
            failed = true;
          }
        }
        if (failed) {
          throw new Error("Array regex not convertible to string representation:" +
              " failed at position " + i);
        }
        res.push(elem);
      }
      return res.join("");
    }

    // Returns the automaton accepting the language represented by the regex @a arr.
    //
    // Semantically equivalent to first calling toTree on @a arr and then converting
    // the result to an automaton via noam.re.tree.toAutomaton.
    function toAutomaton(arr) {
      var tree = noam.re.array.toTree(arr);
      return noam.re.tree.toAutomaton(tree);
    }

    // <expr> ::= <concat> ("|" <concat>)*
    function _parseExpr(input) {
      var concats = [];
      while (true) {
        concats.push(_parseConcat(input));
        if (input.peek() === specials.ALT) {
          input.advance();
        } else {
          break;
        }
      }

      return noam.re.tree.makeAlt(concats);
    }

    // <concat> ::= <katom>+
    function _parseConcat(input) {
      var katoms = [];
      var katom;
      while (true) {
        katom = _parseKatom(input);
        if (katom === undefined) {
          break;
        }
        katoms.push(katom);
      }
      
      return noam.re.tree.makeSeq(katoms);
    }

    // <katom> ::= <atom> ("*" | eps)
    function _parseKatom(input) {
      var atom = _parseAtom(input);
      if (input.peek() === specials.KSTAR) {
        input.advance();
        atom = noam.re.tree.makeKStar(atom);
      }
      return atom;
    }

    // <atom> ::= "(" <expr> ")" | eps | symbol
    function _parseAtom(input) {
      if (input.peek() === specials.LEFT_PAREN) {
        input.advance(); // skip the left parenthesis
        var expr = _parseExpr(input);
        if (input.peek() !== specials.RIGHT_PAREN) {
          throw new Error("Malformed regex array: missing matching right parenthesis at index " + input.idx);
        }
        input.advance(); // skip the right parenthesis
        return expr;
      } else if (input.peek() === specials.EPS) {
        input.advance();
        return noam.re.tree.makeEps();
      } else if (input.peek()===undefined || input.peek()===specials.ALT || 
            input.peek()===specials.RIGHT_PAREN) {
        return undefined; // this will stop the parsing of <concat>
      } else {
        var sym = noam.re.tree.makeLit(input.peek());
        input.advance();
        return sym;
      }
    }

    // Returns a random regex in the array representation.
    // See noam.re.tree.random for further information.
    function random(numSymbols, alphabet, cfg) {
      return noam.re.tree.toArray(noam.re.tree.random(numSymbols, alphabet, cfg));
    }

    return {
      specials: specials,

      toTree: toTree,
      toString: toString,
      toAutomaton: toAutomaton,

      random: random,
    };
  })();


  /*
   * A string representation of regular expressions.
   *
   * The alphabet is limited to string characters, i.e. every character in the string is an input
   * symbol in the language except:
   *    - the dollar symbol ($) which is used as epsilon, i.e. the empty string
   *    - the plus character (+) which is used as the alteration operator
   *    - the star character (*) which is used as the Kleene star
   *    - parentheses which are used for grouping
   *    - the backslash character (\) which is used for escaping the special meaning of all
   *      the listed characters, including backslash itself; for example, the regex
   *      "(a+b)*\\+" represents the language of all strings of as and bs ending in one 
   *      plus character (notice that due to the fact that backslash also escapes in
   *      JavaScript strings, we need two backslashes to get the two-character
   *      sequence \+ that we want)
   */
  var string = (function() {

    var escapable = "$+*()\\";

    // Returns the array representation of the regex represented by @a str.
    //
    // Throws an Error if @a str contains illegal escape sequences.
    function toArray(str) {
      var arr = [];
      var escaped = false;
      var specials = noam.re.array.specials;
      var chr;
      for (var i=0; i<str.length; ++i) {
        if (escaped) {
          if (escapable.indexOf(str[i]) === -1) {
            throw new Error("Malformed string regex: illegal escape sequence \\" + str[i]);
          }
          arr.push(str[i]); // the result of the escape sequence is the escaped character itself
          escaped = false;
        } else if (str[i] === '\\') {
          escaped = true;
        } else {
          chr = str[i];
          switch (chr) {
            case "$": chr = specials.EPS; break;
            case "+": chr = specials.ALT; break;
            case "*": chr = specials.KSTAR; break;
            case "(": chr = specials.LEFT_PAREN; break;
            case ")": chr = specials.RIGHT_PAREN; break;
          }
          arr.push(chr);
        }
      }
      if (escaped) {
        throw new Error("Malformed string regex: unfinished escape sequence at end of string");
      }

      return arr;
    }

    // Returns the tree representation of the regex represented by @a str.
    // 
    // Semantically equivalent to first converting the @a str to the array
    // representation via noam.re.string.toArray and then converting the
    // result to a tree via noam.re.array.toTree.
    function toTree(str) {
      var arr = noam.re.string.toArray(str);
      return noam.re.array.toTree(arr);
    }

    // Returns an FSM accepting the language of the regex represented by @a str.
    // 
    // Semantically equivalent to first converting the @a str to the array
    // representation via noam.re.string.toArray, then converting the
    // result to a tree via noam.re.array.toTree and finally converting the result
    // of that to an automaton via noam.re.tree.toAutomaton.
    function toAutomaton(str) {
      var tree = noam.re.string.toTree(str);
      return noam.re.tree.toAutomaton(tree);
    }

    // Returns a random regex string. @a alphabet must be a string. The other
    // parameters have exactly the same role as in noam.re.tree.random.
    function random(numSymbols, alphabet, cfg) {
      var arr = [];
      for (var i=0; i<alphabet.length; i++) {
        arr.push(alphabet.charAt(i));
      }
      return noam.re.tree.toString(noam.re.tree.random(numSymbols, arr, cfg));
    }

    return {
      escapable: escapable, 

      toArray: toArray,
      toTree: toTree,
      toAutomaton: toAutomaton,

      random: random,
    };

  })();

  return {
    tree: tree,
    array: array,
    string: string,
  };
})();
