var current_fsm = $("#fsm").val()

function drawGraph(automaton) {
  var dotString = noam.fsm.printDotFormat(automaton);
  var gvizXml = Viz(dotString, { format: "svg", totalMemory: 100 * 1024 * 1024 });
  $("#automatonGraph").html(gvizXml);
	$("#automatonGraph svg").width($("#automatonGraph").width());
}

function drawDfa(automaton) {
	var dotString = noam.fsm.printDotFormat(automaton);
	var gvizXml = Viz(dotString, { format: "svg", totalMemory: 100 * 1024 * 1024 });
	$("#dfaGraph").html(gvizXml);
	$("#dfaGraph svg").width($("#drawGraph").width());
}

function modifyState(state, index) {
	if (state.length > 1) {
		let del_el = [];
		for(let i = 1; i < state.length; i++) {
			state[0] = state[0] + "" + state[i];
			del_el.push(i);
		}
		for (let i = 0; i < del_el.length; i++) {
			state.splice(del_el[i] - i, 1);
		}
	}
}

function generateAutomaton(fsmType) {
  var automaton = noam.fsm.createRandomFsm(fsmType, 4, 3, 3);
  $("#fsm").val(noam.fsm.serializeFsmToString(automaton));
  $("#fsm").scrollTop(0);
  $("#fsm").focus();
  onAutomatonChangeDebounced();
}

$("#generateNFA").click(function() {
  generateAutomaton(noam.fsm.nfaType);
});

$("#generateENFA").click(function() {
  generateAutomaton(noam.fsm.enfaType);
});

function onAutomatonChange() {
  if (current_fsm === $("#fsm").val()) {
    return;
  }

  current_fsm = $("#fsm").val();

  $("#automatonGraph").html("");
  var automaton = validateFsm();

	if (automaton !== null) {
    drawGraph(automaton);
 		if (noam.fsm.determineType(automaton) === 'eNFA') {
			automaton = noam.fsm.convertEnfaToNfa(automaton);
		}
		automaton = noam.fsm.convertNfaToDfa(automaton);
		automaton.states.forEach(modifyState);
		automaton = noam.fsm.removeUnreachableStates(automaton);
		drawDfa(automaton);
 }
}

function validateFsm() {
  var fsm = $("#fsm").val();

  if (fsm.length === 0) {
    $("#fsm").parent().removeClass("success error");
    $("#fsmError").hide();
  } else {
    try {
      fsm = noam.fsm.parseFsmFromString(fsm);
      $("#fsm").parent().removeClass("error");
      $("#fsm").parent().addClass("success");
      $("#fsmError").hide();
      return fsm;
    } catch (e) {
      $("#fsm").parent().removeClass("success");
      $("#fsm").parent().addClass("error");
      $("#fsmError").show();
      $("#fsmError").text("Error: " + e.message);
      return null;
    }
  }
}

var onAutomatonChangeDebounced = _.debounce(onAutomatonChange, 500)

$("#fsm").change(onAutomatonChangeDebounced);
$("#fsm").keyup(onAutomatonChangeDebounced);
