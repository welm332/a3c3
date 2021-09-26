//要素=htmlの要素
let inputArea = null;
let footerArea = null;
// プログラム内の書き込み、autoimportなどの書き込みでonchangeを発生させないようにフラグを立てる
var insert_flag = false
let tab_widths = {};//入れ替えのための位置登録
var text_list = {};//後日修正予定だが今のところ一つの書き込むスペースに複数のタブの値をsetvalueして使ってる,ctrl+zとかで戻すときに不具合がある
let last_saves = {};//最後にセーブした値を覚えることで書き換えているかの判定
var tab_opend_path = "";//開いてるタブのフルパス
let editor = null;//エディターの要素がaceが読み込まれた後に入る
var langTools = null;//上と同じタイミングでaceのlangtoolが入る
var fs;//mainと通信できたタイミングでfsが入る
var py_imports;//上と同じタイミングでimport条件を記述したjsonが入る
var py_typers;//上と同じタイミングでautotyping条件を記述したjsonが入る
let input_int = false;//typingを追記しないように後日使用予定
let select_tab = "";//開いてるタブの要素
window.addEventListener('DOMContentLoaded', onLoad);
function Onchange(event) {
  if(input_int) return;//現状意味無い
  if(txt_editor.session.getValue() !== last_saves[tab_opend_path]){//追記していたらタブ内に表示されセーブできるようになる
    console.log("a")
    for (const tab of document.querySelectorAll('.tab')){
      if(tab.dataset.fullpath === tab_opend_path){
        if(tab.innerHTML.indexOf("border-radius") === -1){
          tab.querySelector("button").innerHTML = "<div class='border-radius'></div>";
        }
        break;
      }
    }
  }else{
    for (const tab of document.querySelectorAll(".tab")){
      if(tab.dataset.fullpath === tab_opend_path){
        tab.querySelector("button").innerHTML  = "X";
        // const button = tab.querySelector("button");
        // button.textContent = "X";
        // button.className = "";
        break;
      }
    }
  }
  console.log(tab_opend_path)
  console.log(text_list[tab_opend_path])
  text_list[tab_opend_path] = txt_editor.session.getValue();
  console.log(text_list[tab_opend_path])
  if (insert_flag){
    console.info("insert中")
    return;}
  var data= txt_editor.getValue();
  let text = data.substring(0, indexToPosition(data, txt_editor.getCursorPosition())+1).split("\n").slice(-1)[0].split("\t").slice(-1)[0].split(" ").slice(-1)[0]
  if ((index = Object.keys(py_imports).indexOf(text)) != -1){
    import_insert(py_imports[Object.keys(py_imports)[index]], data)
  }
};
//formio経由でaceを読み込む 
function create_editor(){
  const addAce = Formio.Components.components.component.prototype.addAce;

  Formio.Components.components.component.prototype.addAce = function(element, settings, onChange) {
    return addAce.call(this, element, settings, onChange).then(function(editor) {
      
      if ('ace/mode/python' == settings.mode) {//adjust as required
        //settings.mode = "javascript";
        settings.enableBasicAutocompletion = true;
        settings.enableSnippets = true;
        settings.enableLiveAutocompletion = true;
        settings.highlightActiveLine = true;
        settings.highlightSelectedWord = true;
        settings.theme = 'ace/theme/twilight';
  
        var autoCompleteList = [
          {key:"key1", label:"Label 1", meta:"meta"},
          {key:"key2", label:"Label 2", meta:"meta"}
        ];
        var staticWordCompleter = {
          getCompletions: function(editor, session, pos, prefix, callback) {
            callback(null, autoCompleteList.map(function(word) {
              return {
                caption: word.label,
                value: word.key,
                meta: word.meta
              };
            }));
          }
        };
        langTools = ace.require("ace/ext/language_tools");
        langTools.addCompleter(staticWordCompleter);
        editor.setOptions(settings);
      }
      editor.on('change', Onchange)
      txt_editor = editor;
      // create_tab();
      return editor;
    });
  };
  Formio.createForm(document.getElementById('input_txt'), 
  { 
      "components": [
          {
              "label": "Text Area",
              "editor": "ace",            
              "autoExpand": false,
              "tableView": true,
              "key": "textArea",
              "as": "python",
              "type": "textarea",
              "input": true,
  
          }
      ],
      
  },{
  "editors": {
    "ace":{
                  src :[
                  {type:"script", src:"https://cdn.form.io/ace/1.4.10/ace.js"},
                  {type:"script", src:"https://cdn.form.io/ace/1.4.10/ext-language_tools.js"}
                  // {type:"link", src:"https://cdn.form.io/ace/1.4.10/ext-language_tools.js"}
                  ]
                  }
              },
  }
  
  ).then(function(form) {
    console.log(form)
    // Defaults are provided as follows.
    
  });}
function editor_write(commandLists){
  insert_flag = true;
  if(typeof(commandLists) == "function"){
    commandLists = [commandLists]
  }
  for(let command of commandLists){
    command();
  }
  insert_flag = false;
}
function import_insert(com_dict,text){
    insert_flag = true
    code = null;
    insert_text = text;
    console.log(text);
    console.log(com_dict["sule"]);
    let dot_change_flag = false;
    // console.log([...Array(com_dict["sule"].length).keys()].filter((d) => text.search(com_dict["sule"][d])  != -1))
    if("alias" == Object.keys(com_dict)[0]){
        names = com_dict["name"]
        com_dict = py_imports[com_dict["alias"]]
        code = `${com_dict["code"].substring(0,com_dict["code"].length-1)} as ${names}\n`
    }else{
        code = com_dict["code"]

    }
    if(com_dict["sule"] != null && [...Array(com_dict["sule"].length).keys()].filter((d) => text.search(com_dict["sule"][d])  != -1).length != 0){
    //     print(com_dict["sule"])
          if(com_dict["name"].indexOf(".")+1 != com_dict["name"].length){
            text = txt_editor.session.getValue().replace(com_dict["name"], com_dict["name"].substring(com_dict["name"].indexOf(".")+1))
            txt_editor.session.setValue(text);
            txt_editor.clearSelection();
            txt_editor.moveCursorToPosition(postionToIdnex(text,text.length));
          }
          insert_flag = false
          console.log("ih")
          //     print([rule for rule in com_dict["sule"]])
    //     print(insert_text)
    //     print("kafj;eofj")
    //     self.inputer.SetInsertionPoint(len(insert_text))
    //     self.inputer.Bind(stc.EVT_STC_MODIFIED, self.inputer_text)
        return
    }
    else if( com_dict["update"]["if"] != null && insert_text.indexOf(com_dict["update"]["if"]) != -1){
        console.log("akksks");
        replaced_index = insert_text.indexOf(com_dict["update"]["if"]);
        // console.info(postionToIdnex(text,index))
        line = insert_text.substring(replaced_index).split("\n")[0]+","+com_dict["update"]["add"]+"\n";//+insert_text.substring(index).split("\n").slice(1).join("\n")
        let lastLine = insert_text.substring(replaced_index).split("\n")[0];
        let replaced_pos = postionToIdnex(text, replaced_index);
        // insert_text = insert_text.substring(0, index) + line
        txt_editor.session.remove({"start": replaced_pos, "end":{"row": replaced_pos.row,"column":replaced_pos.column+lastLine.length}});
        line = line.replace("\n","");
        console.log(line);
        column = 0;
        console.log(line);
        let first_column = replaced_pos.column;
        // return
        for (let i of line.split(",")){
          if (replaced_pos.column != first_column){
            i = ","+i;
          }
          txt_editor.session.insert({row:replaced_pos.row, column:replaced_pos.column}, i);
          replaced_pos.column += i.length+1;
        }
        let command_index = indexToPosition(text, txt_editor.getCursorPosition())+1;
        text = txt_editor.session.getValue().replace(com_dict["name"], com_dict["name"].substring(com_dict["name"].indexOf(".")+1))
        console.log(text)
        txt_editor.setValue(text);
        txt_editor.clearSelection();
        txt_editor.moveCursorToPosition(postionToIdnex(text,text.length));
        


        insert_flag = false;
        return
        
    }
    else{
      console.log(dot_change_flag)
      if(com_dict["name"].indexOf(".") !== -1 && com_dict["name"].split(".")[1].length != 0 && ! dot_change_flag) {
        console.error("yatta")
        let command_index  = indexToPosition(text, txt_editor.getCursorPosition());
        let lastLine = text.substring(0, command_index+1).split("\n").slice(-1);
        console.log(lastLine)
        command_index -= (lastLine.indexOf(com_dict["name"])+com_dict["name"].length-1);
        console.log(command_index)
        console.log(text[command_index])
        console.log(text.substring(0, command_index))
        console.log(text.substring(command_index+com_dict["name"].split(".")[0].length+1))
        text = text.replace(com_dict["name"], com_dict["name"].substring(com_dict["name"].indexOf(".")+1))
        console.log(text)
      }


        insert_text = code+text
        insert_text = insert_text.replace(com_dict["replace"],"")
    }
    // console.log(code)
    let e = inputArea.oninput;
    inputArea.oninput = "";
    let cursor_pos = txt_editor.getCursorPosition();
    var count = ( insert_text.match( /\n/g ) || [] ).length  -( text.match( /\n/g ) || [] ).length ;
    console.log(count)
    cursor_pos.row += count;
    cursor_pos.column++;
    if( insert_text.indexOf("%curpos%") !== -1){
      insert_text = text + code;
      insert_text = insert_text.replace(com_dict["replace"],"");
      cursor_pos = postionToIdnex(insert_text, insert_text.indexOf("%curpos%")-1);
      insert_text = insert_text.replace("%curpos%", com_dict["curpos_replace"]["txt"]);
      if(com_dict["curpos_replace"]["focused"]){
          txt_editor.session.setValue(insert_text);
          txt_editor.clearSelection();
          const range = new ace.Range(
            cursor_pos.row,
            cursor_pos.column,
            cursor_pos.row,
            cursor_pos.column+com_dict["curpos_replace"]["txt"].length
                  
          )
          console.log(cursor_pos.column-1)
          console.info(cursor_pos.column)
          txt_editor.session.selection.setRange(
            range,
            true
          )


      }
    }
    else{
      txt_editor.session.setValue(insert_text);
      txt_editor.clearSelection();
    }
    txt_editor.moveCursorToPosition(cursor_pos);
    inputArea.oninput = e;
    insert_flag = false;
  }/**
 * Webページ読み込み時の処理
 */
function postionToIdnex(txt, index){
  let lines = txt.substring(0, index).split("\n");
  let pos = {row:lines.length-1, column:lines[lines.length-1].length}
  return pos;
}
function indexToPosition(txt, pos){
  let lines = txt.split("\n");
  let sum = 0;
  for(let line of lines.slice(0, pos.row)){
    sum += line.length;
    sum++;
  }
  return sum+pos.column;
}
function getLine(text, index){
  return text.split("\n")[index]
}
function get_tab_count(line){
  let tab_counter = 0;
  console.log(line)
  for(let char of line){
    if(char === " "){
      tab_counter++;
    }
    else{
      break;
    }
  }
  return tab_counter/2;
}
function get_path(pather){
  window.requires.exe.exec(
    "python exthange.py "+pather,
    (e,r,w)=>{
      console.log(r);
      if(r !== "False"){
        return r;
      }
      return false;
    }
    )
}
function gettabwidth(element){
  const tabs = document.querySelectorAll(".tab");
  let sum = 0;
  for(let i=0,len=tabs.length;i<len;i++){
    if(tabs[i] === element){
      return sum +tabs[i].getBoundingClientRect().width /2;
      // break;
    }
    sum +=tabs[i].getBoundingClientRect().width

  }

}

function get_before_typing(txt, line, row, values){
  let tab_counter = get_tab_count(line);
  const start_row = row;
  console.log(`tab_counter=${tab_counter}`);
  if(tab_counter !== 0){    
    let before_line = txt.session.getLine(--row);
    while(get_tab_count(before_line) !== 0 && before_line.indexOf("def ") === -1){

      before_line = txt.session.getLine(--row);
    }
    console.log("beforeline"+before_line);
    if(before_line.indexOf("def ") !== -1){
      lines = txt.session.getLines(row, start_row);
      for(const line of lines){
        console.log(line);
        for (const val of values){
          if(line.indexOf(`${val.trim()}:`) !== -1){
            console.log(line);
            footerArea.textContent = "OverWrite?(y/n)"
            input_int = true;
            window.onkeydown = (event)=> {
              console.log(event.key);
            }
            
          }
        }
      }
    }

  }

}
function create_tab(){
  const new_tab = document.createElement('div');
  let i = 1;
  while(true){
    if (Object.keys(text_list).indexOf(`unnamed${i}`) === -1) break;
    i++;
  }
  new_tab.dataset.fullpath = `unnamed${i}`;
  text_list[`unnamed${i}`] = "";
  last_saves[`unnamed${i}`] = "";
  tab_opend_path = `unnamed${i}`;
  new_tab.innerHTML = `unnamed${i}<button class='delete'>X</button>`;
  new_tab.className = "tab";
  txt_editor.session.setValue("");
  new_tab.onclick = function(){
    get_focus(this.dataset.fullpath);
  };
  new_tab.onmouseover = function(){
    footerArea.textContent = new_tab.dataset.fullpath
  }
  new_tab.onmouseoit = function(){
    footerArea.textContent = "";
  }
  document.querySelector("#tabplus").before(new_tab);
  tab_widths[`unnamed${i}`] = gettabwidth(new_tab);
  new_tab.querySelector("button").onclick = function(event){
    console.log("消そうとしたのね？？");
    console.log(this);
    let parent = this.parentElement;
    console.log(parent.textContent);
    parent.remove();
    remove_tab_info(parent.textContent);
    event.stopPropagation();
  }
  return new_tab;
}
function remove_tab_info(name){
  Object.keys(text_list).indexOf(name) === -1 || delete text_list[name];
  Object.keys(last_saves).indexOf(name) === -1 ||  delete last_saves[name];
  Object.keys(tab_widths).indexOf(name) === -1 ||  delete tab_widths[name];
}
function AutoTyping() {
  let now_line = txt_editor.session.getLine(txt_editor.getCursorPosition().row);
  let var_names = now_line.split("=")[0].split(",");
  let values = now_line.split("=")[1].trim();
  console.log(get_iterable(values))
  // return;
  let lists = [];
  // 配列があったら「,」区切りじゃなくまとめて一つにする
  values = txt_editor.getValue().substring(indexToPosition(txt_editor.session.getValue(),{row:txt_editor.getCursorPosition().row,column:0})).split("=")[1].trim();
  while(true) {
    console.log(values);
    const index = get_iterable(values);
    console.log(index);
    if(index === false){
      // return
      break;
    }

    const item = values.substring(index.start, index.end+1);
    values = values.substring(0,index.start) + `%list${lists.length}` + values.substring(index.end+1)
    lists.push(item);
    console.log(values);
    console.log(item);
    console.log(lists);
    // return;
  }
  values = values.split(",");
  console.log(values);
  for(let i=0,length=lists.length;i<length;i++){
    values[values.indexOf(`%list${i}`)]= lists[i];
  }
  console.log(values);
  let type_and_names = [];
  let imports = [];
  for(let i=0,length=var_names.length;i<length;i++){
    // console.log(var_names[i]);
    // console.log(values[i]);
    let index = get_iterable(values[i]);
    let type = get_type(values[i].trim());
    if (index !== false){
      type = analyze_iterator(values[i].substring(index.start, index.end+1));
    }
    console.log(type)
    if(Object.prototype.toString.call(type) === "[object String]"){
      type_and_names.push({"var_name":var_names[i].trim(), "type":type});
    }else{
      sub_types = Array.from(new Set(type.children_type)).join(",");
      console.log(sub_types);
      if(Array.from(new Set(type.children_type)).length === 1){
        sub_types =`${type.type}[${sub_types}]`;
      }else{
        sub_types =`${type.type}[Union[${sub_types}]]`;
      }
      type_and_names.push({"var_name":var_names[i].trim(), "type":sub_types});
      if(type.imports.length > 0){
        for(let imp of type.imports){
          imports.push(imp);
        }
      }
    }
    console.log(type);
  //     for(let key of Object.keys(py_typers)){
  //       // if(py_typers[key] == "%float"){
  //       //   py_typers[key] = "^-?[0-9]+\.[0-9]+$";
  //       // }
  //       let re = new RegExp(py_typers[key]);
  //       const match = values[i].trim().match(re);
  //       console.log(re)
  //       if(match != null && match.input == match[0]){
  //         type = key;
  //         if(key == "list"){
  //           sub_types = []
  //           for(let sub_value of values[i].split("[")[1].split(",")){
  //             if (sub_value[sub_value.length-1] == "]"){
  //               sub_value = sub_value.substring(0, sub_value.length-1)
  //             }
  //           for(let sub_key of Object.keys(py_typers)){
  //               let sub_re = new RegExp(py_typers[sub_key]);
  //               const sub_match = sub_value.trim().match(sub_re);
  //               if(sub_match != null && sub_match.input == sub_match[0]){ 
  //                 sub_types.push(sub_key);
  //               }
  //           }
  //         }
  //           console.log(sub_types.filter(function(x){return x===sub_types[0]}).length)
  //           console.log(sub_types)
  //           if(sub_types.filter(function(x){return x===sub_types[0]}).length != sub_types.length){
  //             type = `list[typing.Union[${sub_types.join(",")}]]`; 
  //             imports.push("typing.Union");

  //           }else{
  //             type = `list[${sub_types[0]}]`;
  //           }
  //         }
  //         type_and_names.push({"var_name":var_names[i].trim(), "type":type})
  //         console.log(key);
  //         break;
  //     }
  // }
}
const row = txt_editor.getCursorPosition().row
for(let item of type_and_names) {
  txt_editor.session.insert({row:row,column:0},`${item.var_name}:${item.type}\n`)
}
if(imports.length != 0){
  for(const imp of imports){
    import_insert(py_imports[imp], txt_editor.session.getValue());
  }
}
}

function AutoLeaning(data){
  // import leaning
  let imports = [];
  const lines = data.split("\n");
  if(lines[0] == "#no autolearn") return;
  for(const line of lines){
    if(line.indexOf("no check") !== -1) continue;
    if(line.indexOf("#alias") !== -1){
      const alias = line.split("#alias");
      const command = alias[0];
      const settings = JSON.parse(alias[1].substring(1));
      py_imports[settings.name] = {
        "name": settings.name,
        "code": command,
        "replace": settings.name,
        "sule": [
          null,
          null
        ],
        "update": {
          "if": null
        },
        "curpos_replace": {
          "txt": settings.currep,
          "focused": true
        }
      };

    }
    if(line.indexOf("import") === 0){
      if(line.indexOf(" as ") !== -1){
        // 例 import numpy as np
        const aser =  line.split("as")[1].trim();
        const method = line.split("import")[1].split("as")[0].trim();
        imports.push(
          {
            "as":aser,
            "method":method
          }
        )
        continue;

      }
      const method = line.split("import")[1].trim();
      console.log(method);
      imports.push(
        {
          "method":method
        }
      )
    }else if(line.indexOf("from") === 0){
      const fromer = line.split("from")[1].split("import")[0].trim();
      const method = line.split("import")[1].trim();
      console.log(method);
      console.log(fromer);
      imports.push(
        {
          "from":method,
          "method":fromer
        }
      );
    }
  }
  console.log(imports);
  for(const imp of imports){
    if(Object.keys(imp).indexOf("as") !== -1){
      if(Object.keys(py_imports).indexOf(imp["as"]) === -1){
        py_imports[imp["as"]+"."] = {
          "alias":`${imp["method"]}.`,
          "name":imp["as"]
          };
      }
      console.log(`
        "${imp["as"]}.":{
          "alias":"${imp["method"]}.",
          "name":"${imp["as"]}"
          }
      `);
      
  }
    if(Object.keys(imp).indexOf("from") !== -1){
      if(Object.keys(py_imports).indexOf(`${imp["method"]}.${imp["from"]}`) === -1){
        py_imports[`${imp["method"]}.${imp["from"]}`] = {
          "name":`${imp["method"]}.${imp["from"]}`,
          "code":`from ${imp["method"]} import ${imp["from"]}\n`,
          "replace":`import ${imp["method"]}\n`,
          "sule":[`from ${imp["method"]} import [^(\\r\\n)]*${imp["from"]}`],
          "update":{"if":`from ${imp["method"]} import`,"add":`${imp["from"]}`}};
      
      }
      console.log(`
        "${imp["from"]}.${imp["method"]}":{
          "name":"${imp["from"]}.${imp["method"]}",
          "code":"from ${imp["from"]} import ${imp["method"]}\n",
          "replace":"import ${imp["from"]}\n",
          "sule":["from ${imp["from"]} import [^(\\r\\n)]*${imp["method"]}"],
          "update":{"if":"from ${imp["from"]} import","add":"${imp["method"]}"}}
      `);
      
  }
    if(Object.keys(imp).indexOf("method") !== -1){
      if(Object.keys(py_imports).indexOf(`${imp["method"]}.`) === -1){
        py_imports[`${imp["method"]}.`] = {
          "name":`${imp["method"]}.`,
          "code":`import ${imp["method"]}\n`,
          "replace":"",
          "sule":[`from ${imp["method"]}`, `import ${imp["method"]}`],
          "update":{"if":null}
        };
      }
      console.log(`"${imp["method"]}.":{
        "name":"${imp["method"]}.",
        "code":"import ${imp["method"]}\n",
        "replace":"",
        "sule":["from ${imp["method"]}", "import ${imp["method"]}"],
        "update":{"if":null}}`);
    }
  }
  fs.writeFile(window.requires.dirname+"/user_custom/py.json", JSON.stringify(py_imports, null, "\t"), (error) => {
    if (error != null) {
      alert('error : ' + error);
    }
  });

}
window.api.on("open_new_file", function(event,path){
  open_file();
})
function open_file(){
  let em = create_tab();
  const path = em.dataset.fullpath;
  get_focus(path);
  window.api.openLoadFile();
  // get_focus();
  // tab_opend_path = path;
  // footerArea.innerHTML = path;
  // txt_editor.setValue(text, -1);
}
function analyze_iterator(text) {
  let char_dict = ["'",'"'];
  let children = [];
  let children_types = [];
  let left_dict = ["[","{","("];
  let right_dict = ["]","}",")"];
  let type_list = ["list","dict","tuple"];
  let type = type_list[left_dict.indexOf(text[0])];
  text = text.replaceAll("\n","").replaceAll(" ","");//リストか確認するときは改行とかも見たいが、中身に入らない
  console.info(text[0]);
  console.info(type)
  text = text.substring(1,text.length-1);
  console.log(text);
  let imports = [];
  console.log(text);
  for(let i = 0,len=text.length;i<len;i++){
    const list_chaild = text[i];
    console.log(i);
    // if(left_dict.indexOf(list_chaild) !== -1) {
    if((index = char_dict.indexOf(list_chaild)) !== -1){
      const chars = char_dict[index];
      // console.log(chars);
      // console.log(text.substring(i+1));
      children.push('"'+text.substring(i+1,i+1+text.substring(i+1).indexOf(chars))+'"');
      i += (text.substring(i+1).indexOf(chars)+2);
      children_types.push("str");
    }
    else if(left_dict.indexOf(list_chaild) !== -1) {
      // 再帰で入れ子の型を調べてる
      const index = get_iterable(text.substring(i));
      console.log(text.substring(i));
      console.error(index);
      const ite = analyze_iterator(text.substring(i).substring(index.start, index.end+1));

      children.push(ite);
      i += text.indexOf(right_dict[left_dict.indexOf(list_chaild)]);
      i++;
      sub_types = Array.from(new Set(ite.children_type)).join(",");
      let sub_ite_type;
      if(Array.from(new Set(ite.children_type)).length === 1){
        sub_ite_type = `${ite.type}[${sub_types}]`;
      }else{
        sub_ite_type = `${ite.type}[Union[${sub_types}]]`;
      }
      children_types.push(sub_ite_type);
      if(ite.imports.length > 0){
        for(const imp of ite.imports){
          imports.push(imp);
        }
      }
    }
    else if(list_chaild !== ","){ 
      console.log(list_chaild)
      let ch = text.substring(i,i+text.substring(i).indexOf(","));
      console.log(ch);
      // 1,2,34
      // i = 2
      if(text.substring(i).indexOf(",") < 0)
      {
        ch = text.substring(i);
        i += ch.length;
      }
      else{
        i += text.indexOf(",");
      }
        children.push(ch);
        console.log(ch)
        console.log(i);
        children_types.push(get_type(ch));
        console.log(text.indexOf(","));
        // 1,2
        console.log(text.substring(i+1));
        // i++;
      }
  }
  sub_types = Array.from(new Set(children_types)).join(",");
  if(children_types.length !== 1){
    imports.push("typing.Union");
  }
  console.log(children_types);

  return {
    "type": type,
    "children":children,
    "children_type":children_types,
    "imports": imports,
    };

}
function get_iterable(iterator){
  let left_dict = ["[","{","("];
  let right_dict = ["]","}",")"];
  let right_spliter = "";
  let left_spliter = "";
  let counterbule = {"right":0,"left":0};
  let iterable_index = {start:0,end:0};
  let count = 0;
  for(const char of iterator){
    // console.log(char);
    // console.log(counterbule);
    if(right_spliter === "" && left_spliter === "" && (index = left_dict.indexOf(char)) !== -1){
      iterable_index["start"] = count;
      left_spliter = left_dict[index];
      right_spliter = right_dict[index];
      console.log(left_spliter, right_spliter);
      // type = type_list[index];
      counterbule["left"]++;
    }else if(right_spliter === char){
      counterbule["right"]++;
    }else if(left_spliter === char){
      counterbule["left"]++;
    }
    if(counterbule["left"] !== 0 && counterbule["left"] === counterbule["right"]){
      iterable_index["end"] = count;
      return iterable_index;

    }else if(char === "\n" && counterbule["left"] === 0){
      return false;
    }
    count++;
  }
  // console.log(iterator.trim());
  return false;
}
function get_type(val){
  console.log(val);
  val = val.trim();
  console.log(val);
  for(let key of Object.keys(py_typers)){
    // if(py_typers[key] == "%float"){
    //   py_typers[key] = "^-?[0-9]+\.[0-9]+$";
    // }
    let re = new RegExp(py_typers[key]);
    const match = val.trim().match(re);
    if(match != null && match.input == match[0]){
      return key;
}}
return false;
}
function get_focus(textContent){
  console.log(textContent);
  console.log(text_list);
  tab_opend_path = textContent;
  txt_editor.session.setValue(text_list[textContent]);
  for (const tab of document.querySelectorAll(".tab")){
    console.log(tab.textContent);
    const textContent = tab.dataset.fullpath;
    let color = "purple";
    if(textContent === tab_opend_path){
      color ="blue";
    }
    tab.style.border= ` 3px outset ${color}`;
  }
}
function move_tab(vector){
  let lis = document.querySelectorAll(".tab");
  for(let i=0,len=lis.length;i<len;i++){
    if(tab_opend_path === lis[i].dataset.fullpath){
      // console.log(lis[i-1].dataset.fullpath);
      // console.log(lis[i+1].dataset.fullpath);
      if(i-1 >= 0 && vector === "left"){
        get_focus(lis[i-1].dataset.fullpath)
        break;
      }else if(i+1 < len &&vector === "right"){
        get_focus(lis[i+1].dataset.fullpath)
        break;
      }
    }
  }
}
function isUnamed(name){
  return name.indexOf("/") === -1 && name.indexOf("\\") === -1 && name.indexOf("unnamed") !== -1;
}
function saveFile(saveValue) {
  if(saveValue === last_saves[tab_opend_path]){
    return;
  } 
  last_saves[tab_opend_path] = saveValue;
  window.api.saveFile(saveValue,tab_opend_path).then((path) => {
    console.log(path);
    for (const tab of document.querySelectorAll(".tab")){
      const textContent = tab.dataset.fullpath;
      if(textContent === tab_opend_path){
        tab.innerHTML = path.split("/").slice(-1)+"<button class='delete'>X</button>";
        tab.querySelector("button").onclick = function(event){
          let parent = this.parentElement;
          parent.remove();
          remove_tab_info(parent.textContent);
          event.stopPropagation();
        }
        tab.dataset.fullpath  = path;
        break;
      };
    };
    const temp = text_list[tab_opend_path];
    text_list[path] = temp;
    tab_widths[path] = tab_widths[tab_opend_path];
    last_saves[path] = temp;
    if(tab_opend_path !== path){
      remove_tab_info(tab_opend_path);
    }
    get_focus(path);
    AutoLeaning(txt_editor.session.getValue());
  });
}
function onLoad() {
  document.getElementById("tabplus").onclick = function(){
    create_tab();

  }
  document.querySelector("#tabs").onmousedown = function(event){
    select_tab = event.target;
  }
  document.querySelector("#tabs").onmouseup =  function(event){
    var x = event.pageX ;	
    let lis = [];
    for(let wid of Object.keys(tab_widths)){
      select_fullpath = select_tab.dataset.fullpath;
      if(x < tab_widths[select_fullpath]){
        if(x < tab_widths[wid] && tab_widths[wid] < tab_widths[select_fullpath]){
          lis.push({
            "name":wid,
            "width":tab_widths[wid]
          });

      }
      


      }
    }
    lis.sort(function(a,b){
      if( a.width > b.width ) return -1;
      if( a.width < b.width ) return 1;
      return 0;
    });
    for(const em of lis){
      document.getElementById("tabs").insertBefore(select_tab,document.querySelector("div[data-fullpath=\""+ em["name"] +"\"]"));
    }
    for(const em of document.querySelectorAll(".tab")){
      tab_widths[em.dataset.fullpath] = gettabwidth(em);
    }
}

  const openfile = document.getElementById("OpenFiles").textContent;
  if (openfile != "") {
    readFile(openfile);

  }
  (async ()=>{
    fs = window.requires.fs;
    py_imports = JSON.parse(fs.readFileSync(window.requires.dirname+'/user_custom/py.json', 'utf8'));
    py_typers = JSON.parse(fs.readFileSync(window.requires.dirname+'/user_custom/py_type.json', 'utf8'));
    window.api.get_args().then((args) => {
      if(args[0] !== undefined){
        const custom_list = {
          "import":window.requires.dirname+"/user_custom/py.json",
          "type":window.requires.dirname+'/user_custom/py_type.json',
          "shortcut":window.requires.dirname+'/user_custom/shortcut.jsonc',
          "settings":window.requires.dirname+"/user_custom/settings.json"
          };
        const input =  args[0];
        for(const falias_key of Object.keys(custom_list)){
          if(falias_key.indexOf(input) === 0){
            args[1].push(custom_list[falias_key]);
            break;
          }
        }
      }
      console.log(args);
      if(args[1].length !== 0){
        for(let fpath of args[1]){
          let em = create_tab().dataset.fullpath;

          window.requires.exe.exec(
        
          `python ${window.requires.dirname}/script/exthange.py ${fpath}`,
          (e,r,w)=>{
            r = r.replaceAll("\r\n","");
            console.log(r);
            if(r !== "False"){
              readFile(r,em);
            }
            else{
              fpath = fpath.replaceAll("\\", "/");
              readFile(fpath,em);
            }
          }
          );
        }
      }else{
        create_tab();
      }
    });
    let shortcut = JSON.parse(fs.readFileSync(window.requires.dirname+'/user_custom/shortcut.jsonc', 'utf8'));
    for(const key of Object.keys(shortcut)){
      window.api.on(key,()=> eval(shortcut[key]));

    }
    window.api.on("read_file", function(event,path){
      input_int = true;
      readFile(path[0]);
      get_focus(path[0]);
      input_int = false;
    })
  })();


  // 入力関連領域
  inputArea = document.getElementById('input_area');
  // フッター領域
  footerArea = document.getElementById('footer_fixed');
  create_editor();
  document.addEventListener('dragover', (event) => {
    event.preventDefault();
  });
  document.addEventListener('drop', (event) => {
    event.preventDefault();
  });
  
  inputArea.addEventListener('dragover', (event) => {
    event.preventDefault();
  });
  inputArea.addEventListener('dragleave', (event) => {
    event.preventDefault();
  });
  inputArea.addEventListener('dragend', (event) => {
    event.preventDefault();
  });
  inputArea.addEventListener('drop', (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    readFile(file.path);
  });

  // 「読み込む」ボタンの制御
  document.querySelector('#btnLoad').addEventListener('click', () => {
    window.api.openLoadFile();
  });
  // 「保存する」ボタンの制御
  document.querySelector('#btnSave').addEventListener('click', () => {
    saveFile(txt_editor.session.getValue());
  });
};

/**
 * ファイルを開きます。
 */
function openLoadFile() {
  const win = BrowserWindow.getFocusedWindow();


}

/**
 * テキストを読み込み、テキストを入力エリアに設定します。
 */
function readFile(path, replacement = tab_opend_path) {
  if(!fs.existsSync(path)) return;
  tab_widths[path] = tab_widths[replacement];
  remove_tab_info(replacement);
  const text = fs.readFileSync(path, 'utf8');
  const delimiter =  path.indexOf("/") !== -1 ? "/" : "\\";
  for (const tab of document.querySelectorAll(".tab")){
    if(tab.dataset.fullpath === replacement){
      tab.dataset.fullpath = path;
      tab.innerHTML = path.split(delimiter).slice(-1)+"<button class='delete'>X</button>";
      tab.querySelector("button").onclick = function(event){
        let parent = this.parentElement;
        parent.remove();
        remove_tab_info(parent.textContent);
        event.stopPropagation();
      }
      break;
    }
  }
  // フッター部分に読み込み先のパスを設定する
  // テキスト入力エリアに設定する
  
  last_saves[path] = text;
  text_list[path] = text;
  if(replacement === "unnamed1"){
    tab_opend_path = path;
    footerArea.innerHTML = path;
    txt_editor.setValue(text, -1);
  }
}




