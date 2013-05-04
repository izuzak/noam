function drawGraph(automaton) {
  var dotString = noam.fsm.printDotFormat(automaton);
  var gvizXml = Viz(dotString, "svg");
  $("#automatonGraph").html(gvizXml);
  $("#automatonGraph svg").width($("#automatonGraph").width());
}


$("#generateRegex").click(function() {
  var regex = noam.re.string.random(5, "abcd", {});
  regex = noam.re.string.simplify(regex);
  $("#regex").val(regex);
  $("#regex").focus();
  onRegexChangeDebounced();
});

function generateAutomaton(fsmType) {
  var automaton = noam.fsm.createRandomFsm(noam.fsm.dfaType, 3, 2, 2);
  $("#fsm").val(noam.fsm.serializeFsmToString(automaton));
  $("#fsm").scrollTop(0);
  $("#fsm").focus();
  onAutomatonChangeDebounced();
}

$("#generateDFA").click(function() {
  generateAutomaton(noam.fsm.dfaType);
});

$("#generateNFA").click(function() {
  generateAutomaton(noam.fsm.nfaType);
});

$("#generateENFA").click(function() {
  generateAutomaton(noam.fsm.enfaType);
});

function onRegexChange() {
  $("#automatonGraph").html("");
  $("#fsm").val("");
  var regex = validateRegex();
  if (regex !== null) {
    var automaton = noam.re.tree.toAutomaton(regex);
    drawGraph(automaton);
    $("#fsm").val(noam.fsm.serializeFsmToString(automaton));
  }
}

function onAutomatonChange() {
  $("#automatonGraph").html("");
  $("#regex").val("");
  var automaton = validateFsm();
  if (automaton !== null) {
    drawGraph(automaton);
    automaton = noam.fsm.minimize(automaton);
    var r = noam.fsm.toRegex(automaton);
    r = noam.re.tree.simplify(r);
    var s = noam.re.tree.toString(r);
    $("#regex").val(s);
  }
}

function validateFsm() {
  var fsm = $("#fsm").val();

  if (fsm.length === 0) {
    $("#fsm").parent().removeClass("success error");
  } else {
    try {
      fsm = noam.fsm.parseFsmFromString(fsm);
      $("#fsm").parent().removeClass("error");
      $("#fsm").parent().addClass("success");
      return fsm;
    } catch (e) {
      $("#fsm").parent().removeClass("success");
      $("#fsm").parent().addClass("error");
      return null;
    }
  }
}

function validateRegex() {
  var regex = $("#regex").val();

  if (regex.length === 0) {
    $("#regex").parent().removeClass("success error");
  } else {
    try {
      regex = noam.re.string.toTree(regex);
      $("#regex").parent().removeClass("error");
      $("#regex").parent().addClass("success");
      return regex;
    } catch (e) {
      $("#regex").parent().removeClass("success");
      $("#regex").parent().addClass("error");
      return null;
    }
  }
}

var onRegexChangeDebounced = $.debounce(500, onRegexChange);
var onAutomatonChangeDebounced = $.debounce(500, onAutomatonChange)

$("#regex").change(onRegexChangeDebounced);
$("#regex").keyup(onRegexChangeDebounced);
$("#fsm").change(onAutomatonChangeDebounced);
$("#fsm").keyup(onAutomatonChangeDebounced);
