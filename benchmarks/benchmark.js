var noam = require('./../lib/node/noam.js');
var Benchtable = require('benchtable');

// TEST SUITES

var suite = new Benchtable();

suite.addFunction("simplify_new", function(tree) { return noam.re.tree.simplify(tree); });
suite.addFunction("simplify_new_nofsm", function(tree) { return noam.re.tree.simplify(tree, {useFsmPatterns : false}); });

var regexLengths = [5, 10, 20, 30];

for (var i=0; i<regexLengths.length; i++) {
  var input = noam.re.tree.random(regexLengths[i], "ab", {});
  suite.addInput(regexLengths[i], [input]);
}

suite.on('cycle', function(event) {
  console.log(String(event.target));
});

suite.on('complete', function() {
  console.log(this.table.toString());
});

suite.on('error', function(event) {
  console.log("ERROR"); //JSON.stringify(event));
});

suite.run();
