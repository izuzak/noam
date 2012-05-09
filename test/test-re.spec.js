describe("regular expressions", function() {
  var noamRe = require('../noam.js').re;

  describe("tree representation API", function() {

    var literal_a = noamRe.tree.makeLit("a");
    var literal_b = noamRe.tree.makeLit("b");

    describe("makeEps", function() {
      it("returns a tree representing the empty string expression", function() {
        expect(noamRe.tree.makeEps().tag).toEqual(noamRe.tree.tags.EPS);
      });
    });

    describe("makeLit", function() {
      it("returns a tree representing a literal", function() {
        expect(noamRe.tree.makeLit("a").tag).toEqual(noamRe.tree.tags.LIT);
      });
    });

    describe("makeKStar", function() {
      it("returns a tree representing the Kleene star operator around an expression", function() {
        expect(noamRe.tree.makeKStar(literal_a).tag).toEqual(noamRe.tree.tags.KSTAR);
      });
    });

    describe("makeSeq", function() {
      it("returns a tree representing the concatenation of the elements of its parameter", function() {
        expect(noamRe.tree.makeSeq([literal_a, literal_b]).tag).toEqual(noamRe.tree.tags.SEQ);
      });
    });

    describe("makeAlt", function() {
      it("returns a tree representing the choice between the elements of its parameter", function() {
        expect(noamRe.tree.makeAlt([literal_a, literal_b]).tag).toEqual(noamRe.tree.tags.ALT);
      });
    });

  });

});
