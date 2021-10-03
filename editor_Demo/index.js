window.onload = function create_editor(){
  const element = document.getElementById("input_area");
  element.style.width = "100%";
  element.style.height = "100%";
  const editor = ace.edit(element);
  editor.setTheme("ace/theme/twilight");
  editor.session.setMode("ace/mode/python");
  ace.require("ace/ext/language_tools");
  editor.setOptions({
    enableBasicAutocompletion:true,
    enableSnippets:true,
    enableLiveAutocompletion:true,
    highlightActiveLine:true,
    highlightSelectedWord:true,
    enableLinking: true
  })
  ace.require('ace/ext/settings_menu').init(editor);
    return editor;
}
// create_editor()