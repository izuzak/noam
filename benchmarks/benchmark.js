var noam = require('./../src/noam.js');
var Benchtable = require('benchtable');

// TEST SUITES

var suite = new Benchtable();

suite.addFunction("noam.fsm.grammar1", noam.fsm.grammar);
suite.addFunction("noam.fsm.grammar2", noam.fsm.grammar);
suite.addFunction("noam.fsm.grammar3", noam.fsm.grammar);

for (var i=1; i<6; i++) {
  suite.addInput(i*2, [noam.fsm.createRandomFsm(noam.fsm.dfaType, i*2, 4, 2)]);
}

suite.on('cycle', function(event) {
  console.log(String(event.target));
});

suite.on('complete', function() {
  console.log(this.table.toString());
});

suite.run();