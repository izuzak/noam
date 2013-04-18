var noam = require('./lib/node/noam.js');

var input = '#states\n\
s1\n\
s2\n\
s3\n\
#initial\n\
s1\n\
#accepting\n\
s2\n\
#alphabet\n\
a1\n\
a2\n\
#transitions\n\
s1: a1 > s2,s3\n\
s1: a2 > s2';

function parseFsm(fsm_string) {
  var lines = fsm_string.split(/\r?\n/);

  var states = [];
  var initial;
  var accepting = [];
  var alphabet = [];
  var transitions = [];

  var parseState = null;

  var parseCounts = {
    states : 0,
    initial : 0,
    accepting : 0,
    alphabet : 0,
    transitions : 0
  };

  for (var i=0; i<lines.length; i++) {
    var line = lines[i].replace(/\s/g, "");

    if (line.length === 0) {
      continue;
    } else if (line[0] === '#') {
      parseState = line.substr(1);

      if (typeof parseCounts[parseState] === 'undefined') {
        throw new Error('Line ' + (i+1).toString() + ': invalid section name ' +
                         parseState + '. Must be one of: states, initial, \
                         accepting, alphabet, transitions.');
      } else {
        parseCounts[parseState] += 1;

        if (parseCounts[parseState] > 1) {
          throw new Error('Line ' + (i+1).toString() +
                          ': duplicate section name ' + parseState + '.');
        }
      }
    } else {
      if (parseState == null) {
        throw new Error('Line ' + (i+1).toString() + ': no #section declared.' /
                        ' Add one section: states, initial, accepting, \
                        alphabet, transitions.');
      } else if (parseState === 'states') {
        var st = line.split(";");
        states = states.concat(st);
      } else if (parseState == 'initial') {
        initial = line;
      } else if (parseState == 'accepting') {
        var ac = line.split(";");
        accepting = accepting.concat(ac);
      } else if (parseState == 'alphabet') {
        var al = line.split(";");
        alphabet = alphabet.concat(al);
      } else if (parseState == 'transitions') {
        var state_rest = line.split(':');

        var state = state_rest[0].split(',');
        var parts = state_rest[1].split(';');

        for (var j=0; j<parts.length; j++) {
          var left_right = parts[j].split('>');
          var al_t = left_right[0].split(',');
          var st_t = left_right[1].split(',');
        }

        transitions.push([state, al_t, st_t]);
      }
    }
  }

  for (var k in parseCounts) {
    if (parseCounts[k] !== 1) {
      throw new Error('Specification missing #' + parseCounts[k] +
        ' section.');
    }
  }

  var fsm = noam.fsm.makeNew();

  for (var i = states.length - 1; i >= 0; i--) {
    noam.fsm.addState(fsm, states[i]);
  }

  for (var i = alphabet.length - 1; i >= 0; i--) {
    noam.fsm.addSymbol(fsm, alphabet[i]);
  }

  for (var i = 0; i < accepting.length; i++) {
    noam.fsm.addAcceptingState(fsm, accepting[i]);
  }

  noam.fsm.setInitialState(fsm, initial);

  for (var i = 0; i < transitions.length; i++) {
    var transition = transitions[i];

    for (var j = 0; j < transition[0].length; j++) {
      for (var k = 0; k < transition[1].length; k++) {
        if (transition[1][k] === noam.fsm.epsilonSymbol) {
          noam.fsm.addEpsilonTransition(fsm, transition[0][j], transition[2]);
        } else {
          noam.fsm.addTransition(fsm, transition[0][j], transition[2], transition[1][k]);
        }
      }
    }
  }

  noam.fsm.validate(fsm);

  return fsm;
}

function serializeFsm(fsm) {
  var lines = [];

  lines.push("#states");

  for (var i = 0; i < fsm.states.length; i++) {
    lines.push(fsm.states[i].toString());
  }

  lines.push("#initial");

  lines.push(fsm.initialState.toString());

  lines.push("#accepting");

  for (var i = 0; i < fsm.acceptingStates.length; i++) {
    lines.push(fsm.acceptingStates[i].toString());
  }

  lines.push("#alphabet");

  for (var i = 0; i < fsm.alphabet.length; i++) {
    lines.push(fsm.alphabet[i].toString());
  }

  lines.push("#transitions");

  for (var i = 0; i < fsm.transitions.length; i++) {
    lines.push(fsm.transitions[i].fromState.toString() + ":" +
               fsm.transitions[i].symbol.toString() + ">" +
               fsm.transitions[i].toStates.join(","));
  }

  return lines.join("\n");
}

var f1 = parseFsm(input);
var f2 = serializeFsm(f1);

console.log(f2);
