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
    throw new Error('Objects must be defined.');
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

// make a deep clone of an object
noam.util.clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

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

// computes epsilon area of fsm from states array states
noam.fsm.computeEpsilonArea = function(fsm, states) {
  if (!(noam.util.containsAll(fsm.states, states))) {
    return new Error('FSM must contain all states for which epsilon area is being computed');
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

    if (fsm.transitions[i].symbol === symbol &&
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
//   a) computing the epsilon area of states
//   b) making a simple transition from resulting states of a)
//   c) computing the epsilon area of resulting states of b)
noam.fsm.makeTransition = function(fsm, states, symbol) {
  if (!(noam.util.containsAll(fsm.states, states))) {
    return new Error('FSM must contain all states for which the transition is being computed');
  }

  if (!(noam.util.contains(fsm.alphabet, symbol))) {
    return new Error('FSM must contain input symbol for which the transition is being computed');
  }

  states = noam.fsm.computeEpsilonArea(fsm, states);
  states = noam.fsm.makeSimpleTransition(fsm, states, symbol);
  states = noam.fsm.computeEpsilonArea(fsm, states);

  return states;
};

// read a stream of input symbols and determine target states
noam.fsm.readString = function(fsm, inputSymbolStream) {
  if (!(noam.util.containsAll(fsm.alphabet, inputSymbolStream))) {
    return new Error('FSM must contain all symbols for which the transition is being computed');
  }

  var states = [fsm.initialState];

  for (var i=0; i<inputSymbolStream.length; i++) {
    states = noam.fsm.makeTransition(fsm, states, inputSymbolStream[i]);
  }

  return states;
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
    tableRows[i][0] = fsm.states[i];
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

    tableRows[rowNum][colNum] = { text : transition.toStates };
  }

  return table.toString();
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
  var initState = ['  {rank = source; "secret_node" "'];
  initState.push(fsm.initialState.toString());
  initState.push('"}');
  result.push(initState.join(""));

  var initStateArrow = ["  secret_node ->"]
  initStateArrow.push(fsm.initialState.toString());
  initStateArrow.push("[style=bold];");
  result.push(initStateArrow.join(" "));

  for (var i=0; i<fsm.transitions.length; i++) {
    for (var j=0; j<fsm.transitions[i].toStates.length; j++) {
      var trans = [" "];
      trans.push(fsm.transitions[i].fromState.toString());
      trans.push("->");
      trans.push(fsm.transitions[i].toStates[j].toString());
      trans.push("[");
      trans.push("label =");
      trans.push('"' + fsm.transitions[i].symbol.toString() + '"');
      trans.push("];");
      result.push(trans.join(" "));
    }
  }
  
  result.push("}");

  return result.join("\n").replace(/\$/g, "ε");
};

// determine and remove unreachable states
noam.fsm.removeUnreachableStates = function (fsm) {
  var unprocessedStates = [fsm.initialState];
  var reachableStates = [];

  while (unprocessedStates.length !== 0) {
    var currentState = unprocessedStates.pop();
    reachableStates.push(currentState);

    for (var i=0; i<fsm.transitions.length; i++) {
      var transition = fsm.transitions[i];

      if (noam.util.contains(reachableStates, transition.fromState)) {
        for (var j=0; j<transition.toStates.length; j++) {
          if (noam.util.contains(reachableStates, transition.toStates[j]) ||
              noam.util.contains(unprocessedStates, transition.toStates[j])) {
            continue;
          }

          unprocessedStates.push(transition.toStates[j]);
        }
      }
    }
  }

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
  if (noam.fsm.determineType(fsm) !== noam.fsm.dfaType) {
    return new Error('FSM must be DFA');
  }

  var fsmWithoutUnreachableStates = noam.fsm.removeUnreachableStates(fsm);
  var minimalFsm = noam.fsm.removeEquivalentStates(fsmWithoutUnreachableStates);
  return minimalFsm;
};
