describe("regular expressions", function() {
  var noamRe = require('../noam.js').re;
  var noamFsm = require('../noam.js').fsm;

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


    describe("toAutomaton", function() {
      it("creates and returns an automaton accepting the language of the regular expression", function() {
        var eps = noamRe.tree.makeEps();
        var automaton = noamRe.tree.toAutomaton(eps);
        expect(noamFsm.isStringInLanguage(automaton, [])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a"])).toBeFalsy();
      });

      it("handles alteration in the regular expression", function() {
        var a_or_b = noamRe.tree.makeAlt([literal_a, literal_b]);
        var automaton = noamRe.tree.toAutomaton(a_or_b);
        expect(noamFsm.isStringInLanguage(automaton, [])).toBeFalsy();
        expect(noamFsm.isStringInLanguage(automaton, ["a"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["b"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "b"])).toBeFalsy();
      });

      it("handles sequencing in the regular expression", function() {
        var a_before_b = noamRe.tree.makeSeq([literal_a, literal_b]);
        var automaton = noamRe.tree.toAutomaton(a_before_b);
        expect(noamFsm.isStringInLanguage(automaton, [])).toBeFalsy();
        expect(noamFsm.isStringInLanguage(automaton, ["a"])).toBeFalsy();
        expect(noamFsm.isStringInLanguage(automaton, ["b"])).toBeFalsy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "b"])).toBeTruthy();
      });

      it("handles the Kleene star operator in the regular expression", function() {
        var aStar = noamRe.tree.makeKStar(literal_a);
        var automaton = noamRe.tree.toAutomaton(aStar);
        expect(noamFsm.isStringInLanguage(automaton, [])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "a"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "a", "a"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "a", "b"])).toBeFalsy();
      });

      it("handles any combination of the above", function() {
        var a_or_b = noamRe.tree.makeAlt([literal_a, literal_b]);
        var a_or_b_star = noamRe.tree.makeKStar(a_or_b);
        var a_before_a_or_b_star = noamRe.tree.makeSeq([literal_a, a_or_b_star]);
        var automaton = noamRe.tree.toAutomaton(a_before_a_or_b_star);
        expect(noamFsm.isStringInLanguage(automaton, ["a"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "b"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "a"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "a", "b", "a"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["b", "a", "b", "a"])).toBeFalsy();
      });
    });

  });

});
