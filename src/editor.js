//要素=htmlの要素
let inputArea = null;
let footerArea = null;
// プログラム内の書き込み、autoimportなどの書き込みでonchangeを発生させないようにフラグを立てる
var insert_flag = false;
let tab_widths = {};//入れ替えのための位置登録
let tab_open_log = [];//消したとき開くのを探すため
var text_list = {};//後日修正予定だが今のところ一つの書き込むスペースに複数のタブの値をsetvalueして使ってる,ctrl+zとかで戻すときに不具合がある
let last_saves = {};//最後にセーブした値を覚えることで書き換えているかの判定
let editor_dict = {};
var tab_opend_path = "";//開いてるタブのフルパス
let txt_editor = null;//エディターの要素がaceが読み込まれた後に入る
var langTools = null;//上と同じタイミングでaceのlangtoolが入る
var fs;//mainと通信できたタイミングでfsが入る
var py_imports;//上と同じタイミングでimport条件を記述したjsonが入る
var py_typers;//上と同じタイミングでautotyping条件を記述したjsonが入る
let input_int = false;//typingを追記しないように後日使用予定
let select_tab = "";//開いてるタブの要素
let debugMode = false;
let onctrl = false;
var chileds;
// function create_watcher(path){
    
//      //require
//     var chokidar = window.requires.chokidar;
//     console.log(chokidar);
    
//     //chokidarの初期化
//     var watcher = chokidar.watch(path,{
//       ignored:/[\/\\]\./,
//       persistent:true
//     });
//     console.log(watcher);
//     console.log(path)
//     watcher._events["ready"] = function(){
//       watcher._events["change"] =  (path)=>{console.log(path)}
//     }
//     return watcher
    
//     //イベント定義
//     // watcher.on('ready',function(){
//     //     watcher.on('change',function(path){
//     //         file_changed(path);
//     //     });
//     //     watcher.on('unlink',function(path){
//     //         file_deleted(path);
//     //     });
//     // });
    
// }
  
// create_watcher(`${window.requires.dirname}/../dist`);

function file_deleted(path){
    console.log(path + " deleted.");
}

function file_changed(path){
    console.log(path + " changed.");
    
}
function play_tab(){
    window.requires.exe.exec(`python ${tab_opend_path}`,{'shell':'powershell.exe'},(errs,stdout,stderr)=>{
                  info_in_footer(stdout.replaceAll("\\\\","/"),5000);
          
                  });
}
    
function close_saving(){
    const file_saving_dict  = {};
    for(const tab of document.querySelectorAll(".tab")){
        const fileName = tab.dataset.fullpath;
        const lastsave = last_saves[fileName];
        const writeend = editor_dict[fileName].session.getValue();
        file_saving_dict[fileName] = {
            "lastsave":lastsave,
            "writeend":writeend
        }
    }
    fs.writeFile(window.requires.dirname+"/.backup/save.json", JSON.stringify(file_saving_dict, null, "\t"), (error) => {
    if (error != null) {
      alert('error : ' + error);
    }
  });

    
}
function info_in_footer(text,time=2000){
    const before_text = footerArea.textContent;
    footerArea.textContent = text;
    setTimeout(()=>{footerArea.textContent = before_text;},time);
    
}
function parseElement(emstr){
    if(emstr[0] !== "<" || emstr[emstr.length-1] !== ">"){
        return false
    }
    emstr = emstr.substr(1)
    // while(emstr.indexOf(" =") !== -1 || emstr.indexOf("= ") !== -1 )
    emstr  = emstr.replaceAll(" =","=").replaceAll("= ","=");
    const settings = emstr.split(" ");
    const em = document.createElement(settings[0]);
    for(let i=1,len=settings.length;i<len;i++){
        if(settings[i] === ">" || settings[i] ===`</${settings[0]}>`){
            break;
        }
        [a,b] = settings[i].split("=");
        if(b.indexOf("\"") !== -1){
            b = b.replaceAll("\"", "");
        }
        em.setAttribute(a,b);
    }
}
window.addEventListener('DOMContentLoaded', onLoad);
function Onchange(event) {
  if(input_int) return;//現状意味無い
  let tab = document.querySelector(`.tab[data-fullpath="${tab_opend_path}"]`);
  if(txt_editor.session.getValue() !== last_saves[tab_opend_path]){//追記していたらタブ内に表示されセーブできるようになる
        if(tab.innerHTML.indexOf("border-radius") === -1){
          tab.querySelector("button").innerHTML = "<div class='border-radius'></div>";      
      }
  }else{
        tab.querySelector("button").innerHTML  = "X";
  }
  text_list[tab_opend_path] = txt_editor.session.getValue();
  if (insert_flag){
    return;
  }
  var data= txt_editor.getValue();
  let text = data.substring(0, indexToPosition(data, txt_editor.getCursorPosition())+1).split("\n").slice(-1)[0].split("\t").slice(-1)[0].split(" ").slice(-1)[0]
  if (text != "" && (index = Object.keys(py_imports).indexOf(text)) != -1){
    import_insert(py_imports[Object.keys(py_imports)[index]], data)
  }
};
//formio経由でaceを読み込む 
function create_editor(element){
  const editor = ace.edit(element);
  editor.setTheme("ace/theme/twilight");
  ace.require("ace/ext/language_tools");
  editor.session.setMode("ace/mode/python");
  editor.setOptions({
    enableBasicAutocompletion:true,
    enableSnippets:true,
    enableLiveAutocompletion:true,
    highlightActiveLine:true,
    highlightSelectedWord:true,
    enableLinking: true
  })
  ace.require('ace/ext/settings_menu').init(txt_editor);
    return editor;
}
function delete_tab(event){
    let target_tab = "";
    let parent = event.target.parentElement;
    while(true){
        if(parent.className === "tab"){
            target_tab = parent;
            break;
        }else{
            parent = parent.parentElement;
        }
    }
    if(target_tab.dataset.fullpath === tab_opend_path){
      if((index = tab_open_log.indexOf(target_tab.dataset.fullpath)) !== -1){
      tab_open_log.splice(index, 1);
      }
      if(tab_open_log.length > 0){
        get_focus(tab_open_log[0]);
        }
      }
    const target_editor = document.querySelector(`.editor[data-fullpath="${target_tab.dataset.fullpath}"]`);
    ace.edit(target_editor).destroy();
    target_editor.remove(); //すげ替え。
    target_tab.remove();
    remove_tab_info(target_tab.textContent);
    event.stopPropagation();
        }
function loadhtml(element, path){
    ace.edit(element).destroy();
    const read = window.requires.fs.readFileSync(window.requires.dirname+path, 'utf8');
    const domparser = new DOMParser();
    const html = domparser.parseFromString(read, "text/html");

    
    const clone = element.cloneNode( false ); //ガワだけ複製して…
    element.parentNode.replaceChild( clone , element ); //すげ替え。
    // clone.appendChild(html.body);
    // return
    chileds = html.body.children;
    for(let i=0,len=chileds.length;i<len;i++){
        clone.appendChild(chileds[i]);
    }
}
function open_setting_page(){
    const em = create_tab();
    const editorpath = `.editor[data-fullpath="${em.dataset.fullpath}"]`;
    const editor = document.querySelector(editorpath);
    loadhtml(editor, "/setting.html");
    const settings = Array.from(document.querySelector(editorpath).querySelectorAll("input")).map((v,i)=>[v.name,v.value])
    const button = document.createElement(`button`)
    button.onclick = ()=>{
        const settings = Array.from(document.querySelector(editorpath).querySelectorAll("input")).map((v,i)=>[v.name,v.value]);
    }
    button.type = "button";
    button.textContent = "決定";
    document.querySelector(editorpath+"> form").appendChild(button);

    
    return ;
}
function create_input_dialog(){
    const dialog = document.createElement('dialog');
    const form = document.createElement('form');
    form.method = "dialog";
    const input = document.createElement('input');
    input.id = "dialog_input";
    const button1 = document.createElement('button');
    button1.value = "cancel";
    button1.textContent = "cancel";
    
    const button2 = document.createElement('button');
    button2.value = "ok";
    button2.textContent = "ok";
    form.appendChild(input);
    form.appendChild(button1);
    form.appendChild(button2);
    dialog.appendChild(form);
    document.getElementById("dialogspace").appendChild(dialog);
    dialog.showModal();
    dialog.addEventListener('close', function onClose() {
        dialog.remove();
    });
}
function create_search_window(){//検索窓の作成
  let div = document.createElement('div');
  div.style.left = "50%";
  div.style.position = 'absolute';
  div.style.top = "5%";
  div.style.zIndex = 2147483647;
  div.style.marginRight = "-50%";
  div.style.transform = "translate(-50%, -50%)";
  
  const palette_commands = JSON.parse(fs.readFileSync(window.requires.dirname+'/user_custom/palette_commands.json', 'utf8'));
  const datalist = document.createElement("datalist");
  datalist.id = "commandLists";
  for(const key of Object.keys(palette_commands)){
      
      
    const option = document.createElement("option");
    option.value = key;
    
    datalist.appendChild(option);
  }
  
    document.getElementById("datalist").appendChild(datalist);
  
  let txt_em = document.createElement('input');
  txt_em.type = "text";
  
  txt_em.setAttribute("list", "commandLists");
  txt_em.onkeypress=
    function (event) {
      if (event.key === "Enter") {
          const key = event.target.value;
          const palette_commands = JSON.parse(fs.readFileSync(window.requires.dirname+'/user_custom/palette_commands.json', 'utf8'));
          if(palette_commands[key] !== undefined){
              eval(palette_commands[key]);
              delete_tab(event);
          }
    }  
  }

  let button_em = document.createElement('button');
  button_em.innerHTML = "X";
  button_em.onclick = delete_tab;
  div.appendChild(txt_em);
  div.appendChild(button_em);

  document.body.appendChild(div);
};
function editor_write(commandLists){
  cust_onchange_off();
  if(typeof(commandLists) == "function"){
    commandLists = [commandLists]
  }
  for(let command of commandLists){
    command();
  }
  cust_onchange_on();
}
function cust_onchange_off(){
  if(txt_editor !== null){

    txt_editor._eventRegistry.change = [txt_editor._eventRegistry.change[0]];
  }
}
function cust_onchange_on(){
  if(txt_editor !== null){
  debugMode || txt_editor.on('change', Onchange);
  }
}
function txt_size_up(){
  txt_editor.setFontSize((txt_editor.getFontSize()+1))
}
function txt_size_down(){
  txt_editor.setFontSize((txt_editor.getFontSize()-1))
}
function connect_remote(){
    const tab = document.querySelector(`.tab[data-fullpath="${tab_opend_path}"]`);
    const status = tab.dataset.status;
    if(status !== undefined && status.indexOf("remote:") !== -1){
        const command_key = status.substring(7);
        const remote_commands = JSON.parse(fs.readFileSync(window.requires.dirname+'/user_custom/remote.json', 'utf8'));
        const command_dict = remote_commands[command_key];
        
        if(command_dict !== undefined){
            let fullpath = tab.dataset.fullpath;
            let file = window.requires.path.basename(tab.dataset.fullpath);
            
            if(command_dict["replace"] !== undefined){
                fullpath = fullpath.replaceAll(command_dict["replace"]["before"], command_dict["replace"]["after"]);
                file = file.replaceAll(command_dict["replace"]["before"], command_dict["replace"]["after"]);
            }
            let command = command_dict["command"] ;
            command = command.replaceAll("%fullpath%",fullpath);
            command = command.replaceAll("%file%",file);
            
            if(command_dict["sudo"]){
                window.requires.sudo_exe.exec(command,{'shell':'powershell.exe'},(errs,stdout,stderr)=>{})
            }else{
                window.requires.exe.exec(command,{'shell':'powershell.exe'},(errs,stdout,stderr)=>{})
            }
    
        }
        
        
    }
    else{
        window.api.create_input_window();
        window.api.on("set_remote_command", function(event, command){
            document.querySelector(`.tab[data-fullpath="${tab_opend_path}"]`).dataset.status = `remote:${command}`;
            
        });
        
        
    }
}
function import_insert(com_dict,text){
    cust_onchange_off();
    code = null;
    insert_text = text;
    let dot_change_flag = false;
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
          cust_onchange_on();
          //     print([rule for rule in com_dict["sule"]])
    //     print(insert_text)
    //     print("kafj;eofj")
    //     self.inputer.SetInsertionPoint(len(insert_text))
    //     self.inputer.Bind(stc.EVT_STC_MODIFIED, self.inputer_text)
        return
    }
    else if( com_dict["update"]["if"] != null && insert_text.indexOf(com_dict["update"]["if"]) != -1){
        replaced_index = insert_text.indexOf(com_dict["update"]["if"]);
        // console.info(postionToIdnex(text,index))
        line = insert_text.substring(replaced_index).split("\n")[0]+","+com_dict["update"]["add"]+"\n";//+insert_text.substring(index).split("\n").slice(1).join("\n")
        let lastLine = insert_text.substring(replaced_index).split("\n")[0];
        let replaced_pos = postionToIdnex(text, replaced_index);
        // insert_text = insert_text.substring(0, index) + line
        txt_editor.session.remove({"start": replaced_pos, "end":{"row": replaced_pos.row,"column":replaced_pos.column+lastLine.length}});
        line = line.replace("\n","");
        column = 0;
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
        txt_editor.setValue(text);
        txt_editor.clearSelection();
        txt_editor.moveCursorToPosition(postionToIdnex(text,text.length));
        


        cust_onchange_on();
        return
        
    }
    else{
      if(com_dict["name"].indexOf(".") !== -1 && com_dict["name"].split(".")[1].length != 0 && ! dot_change_flag) {
        console.error("yatta")
        let command_index  = indexToPosition(text, txt_editor.getCursorPosition());
        let lastLine = text.substring(0, command_index+1).split("\n").slice(-1);
        command_index -= (lastLine.indexOf(com_dict["name"])+com_dict["name"].length-1);
        text = text.replace(com_dict["name"], com_dict["name"].substring(com_dict["name"].indexOf(".")+1))
      }


        insert_text = code+text
        insert_text = insert_text.replace(com_dict["replace"],"")
    }
    let e = inputArea.oninput;
    inputArea.oninput = "";
    let cursor_pos = txt_editor.getCursorPosition();
    var count = ( insert_text.match( /\n/g ) || [] ).length  -( text.match( /\n/g ) || [] ).length ;
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
    cust_onchange_on();
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
    return window.requires.path.resolve(pather);
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
  if(tab_counter !== 0){    
    let before_line = txt.session.getLine(--row);
    while(get_tab_count(before_line) !== 0 && before_line.indexOf("def ") === -1){

      before_line = txt.session.getLine(--row);
    }
    if(before_line.indexOf("def ") !== -1){
      lines = txt.session.getLines(row, start_row);
      for(const line of lines){
        for (const val of values){
          if(line.indexOf(`${val.trim()}:`) !== -1){
            footerArea.textContent = "OverWrite?(y/n)"
            input_int = true;
            window.onkeydown = (event)=> {
            }
            
          }
        }
      }
    }

  }

}
function create_tab(){
  // cust_onchange_off();
  const new_tab = document.createElement('div');
  const new_editor = document.createElement('div');
  let i = 1;
  while(true){
    if (Object.keys(text_list).indexOf(`unnamed${i}`) === -1) break;
    i++;
  }
  new_tab.dataset.fullpath = `unnamed${i}`;
  new_tab.title = `unnamed${i}`;
  new_editor.dataset.fullpath = `unnamed${i}`;
  text_list[`unnamed${i}`] = "";
  last_saves[`unnamed${i}`] = "";
  // tab_opend_path = `unnamed${i}`;
  new_tab.innerHTML = `unnamed${i}<button class='delete'>X</button>`;
  new_tab.className = "tab";
  new_editor.className = "editor";
  // txt_editor.session.setValue("");
  new_tab.onclick = function(){
    if((index = tab_open_log.indexOf(this.dataset.fullpath)) !== -1){
        tab_open_log.splice(index, 1);
        
    }
        tab_open_log.unshift(this.dataset.fullpath);
    get_focus(this.dataset.fullpath);
  };
  new_tab.onmouseover = function(){
    footerArea.textContent = new_tab.dataset.fullpath
  }
  new_tab.onmouseoit = function(){
    footerArea.textContent = "";
  }
  document.querySelector("#input_area").appendChild(new_editor);
  document.querySelector("#tabplus").before(new_tab);
  new_editor.addEventListener("click", (event) =>{
    if(event.altKey === true) {

      const pos = txt_editor.getCursorPosition()
      const value = txt_editor.session.getValue();
      let index = indexToPosition(value, pos);
      let left = index-1;
      let right = index+1;
      const lang_info = JSON.parse(fs.readFileSync(window.requires.dirname+'/info/lang.json', 'utf8'));
      const lang = txt_editor.session.getMode().$id.split("/")[2];
      let str_left = lang_info["All_lang"]["strLeft"];
      if(lang_info[lang] !== undefined && lang_info[lang]["strLeft"] !== undefined){
          str_left = str_left.concat(lang_info[lang]["strLeft"])
         
      };
      let str_right = lang_info["All_lang"]["strRight"];
      if(lang_info[lang] !== undefined && lang_info[lang]["strRight"] !== undefined){
          str_right = str_right.concat(lang_info[lang]["strRight"])
         
      };
      while(true){
        if(left === 0){
            return false;
        }
        if(["\"","'"].indexOf(value[left]) !== -1){
          if(left-1 === 0 || str_left.indexOf(value[left-1]) !== -1){
            break;
          }
          left -= 1;
          }
          left -= 1;
        }
      while(true){
        if(["\"","'"].indexOf(value[right]) !== -1){
          if(right+1 === value.length-1 || str_right.indexOf(value[right+1]) !== -1){
            break;
          }
          right += 1;
          }else if(right === value.length-1){
            return false;
        }
          right += 1;
        }
        const select_word = value.substring(left+1,right);
        let pathtty = select_word;
        if(pathtty.indexOf("://") === -1  && pathtty.indexOf(":\\\\") === -1){
            let tab = document.querySelector(`.tab[data-fullpath="${tab_opend_path}"]`);
            const path =  window.requires.path;
            const dirname = path.dirname(tab.dataset.fullpath);
            pathtty = path.join(dirname, pathtty);
            
        }

        if(fs.existsSync(pathtty)){
            const replacement = create_tab().dataset.fullpath;
            readFile(pathtty, replacement);
        }else if(select_word.substring(0,4) === "http"){
            window.api.search(select_word);
        }
            
        
      }
        
      }
    );
    let editor = create_editor(new_editor);
    editor_dict[`unnamed${i}`] = editor;
    // txt_editor = editor;
  cust_onchange_on();
  // txt_editor.session.setValue("auofhewaofhewfhejpfiewpfewpfiewfewpfeijfepifjepj");
  tab_widths[`unnamed${i}`] = gettabwidth(new_tab);
  new_tab.querySelector("button").onclick = delete_tab;
  // cust_onchange_on();
  return new_tab;
}
function remove_tab_info(name){
  Object.keys(text_list).indexOf(name) === -1 || delete text_list[name];
  Object.keys(last_saves).indexOf(name) === -1 ||  delete last_saves[name];
  Object.keys(tab_widths).indexOf(name) === -1 ||  delete tab_widths[name];
  Object.keys(editor_dict).indexOf(name) === -1 ||  delete editor_dict[name];
}
function AutoTyping() {
  if(debugMode) return false
  let now_line = txt_editor.session.getLine(txt_editor.getCursorPosition().row);
  let var_names = now_line.split("=")[0].split(",");
  let values = txt_editor.getValue().substring(indexToPosition(txt_editor.session.getValue(),{row:txt_editor.getCursorPosition().row,column:0})).split("=")[1];
  values = analyze_valable(values);
  let type_and_names = [];
  let imports = [];
  for(let i=0,length=var_names.length;i<length;i++){
    let type = get_type(values[i].trim());
    if(type == "list" || type === "tuple"){
      type = analyze_iterator(values[i].trim());
    }
    if(Object.prototype.toString.call(type) === "[object String]"){
      type_and_names.push({"var_name":var_names[i].trim(), "type":type});
    }else{
      sub_types = Array.from(new Set(type.children_type)).join(",");
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

function AutoLearning(data){
    if(txt_editor.session.getMode().$id.split("/")[2] !== "python"){
        return false;
    }
  // import leaning
  let imports = [];
  const lines = data.split("\n");
  if(lines[0] == "#no autolearn") return;
  for(const line of lines){
    if(line.indexOf("no check") !== -1) continue;
    if(line.match(".+?:.+?( |)=( |).+?(|\n)$")){// || line.match(".+?:.+?(|\n)$")){
        const type_line = line;
        const mean_type = type_line.split(":").filter((value,count)=>(count+1)%2 === 0)[0].split("=");
        const type = type_line.substring(type_line.indexOf(":")+1).split("=")[0].trim();
        if(type.length !== 0){
            
            const value = mean_type[1].trim(); 
            if(Object.keys(py_typers).indexOf(type) === -1){
                py_typers[type] = (value.substring(0,value.indexOf("(")+1)).replaceAll("(","\\(")+".*?\\)";
                fs.writeFileSync(window.requires.dirname+"/user_custom/py_type.json", JSON.stringify(py_typers, null, "\t"));
            }
        }
        
    }
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
      const method = line.split("import")[1].split("#")[0].trim();
      imports.push(
        {
          "method":method
        }
      )
      if(line.indexOf("extends learn") !== -1){
        let data_cp = data;
          while(true){
              if((index=data_cp.indexOf(`${method}.`)) !== -1){
                  const subm = data_cp.substring(index+`${method}.`.length).split("(")[0];
                  data_cp = data_cp.substring(index+`${method}.`.length+1+subm.length);
              }else{
                break;
              }
              
          }
      }
    }else if(line.indexOf("from") === 0){
      const fromer = line.split("from")[1].split("import")[0].trim();
      const method = line.split("import")[1].trim();
      imports.push(
        {
          "from":method,
          "method":fromer
        }
      );
    }
  }
  for(const imp of imports){
    if(Object.keys(imp).indexOf("as") !== -1){
      if(Object.keys(py_imports).indexOf(imp["as"]) === -1){
        py_imports[imp["as"]+"."] = {
          "alias":`${imp["method"]}.`,
          "name":imp["as"]
          };
      }
      
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
    }
  }
  fs.writeFile(window.requires.dirname+"/user_custom/py.json", JSON.stringify(py_imports, null, "\t"), (error) => {
    if (error != null) {
      alert('error : ' + error);
    }
  });

}

window.api.on("file_change", (event,path)=>{
    console.log("change"+path);
    readFile(path.replaceAll("\\", "/"), path.replaceAll("\\", "/"));
});

window.api.on("file_delete", (event,path)=>{
    console.log("delete"+path);
    document.querySelector(`.tab[data-fullpath="${path.replaceAll('\\','/').toLocaleLowerCase()}"]`).textContent = window.requires.path.basename(path)+"(削除済み)";
    let button_em = document.createElement('button');
    button_em.innerHTML = "X";
    button_em.onclick = delete_tab;
    document.querySelector(`.tab[data-fullpath="${path.replaceAll('\\','/').toLocaleLowerCase()}"]`).appendChild(button_em);
});

window.api.on("open_new_file", function(event,path){
  open_file();
});
function open_file(){
  window.api.openLoadFile();
  let em = create_tab();
  em.dataset.status = "if can't fileRead then delete";
  const path = em.dataset.fullpath;
  get_focus(path);
  // get_focus();
  // tab_opend_path = path;
  // footerArea.innerHTML = path;
  // txt_editor.setValue(text, -1);
}

function analyze_valable(text) {
  let values = [];
  let value = "";
  let left_dict = ["[","{","("];
  let right_dict = ["]","}",")"];
  let iterable_counts = {"[":0,"{":0,"(":0};
  let type_list = ["list","dict","tuple"];
  for(let i = 0,len=text.length;i<len;i++){
    
    const char = text[i];
    if(left_dict.indexOf(char) !== -1) {
        iterable_counts[char]++;
        value += char;
    }
    else if(char === ","){
        if(Object.values(iterable_counts).reduce((sum,elm)=>{return sum+elm},0) %2 === 0){
            values.push(value);
            value = "";
        }else{
            value += char;
        }
      }else if(right_dict.indexOf(char) !== -1) {
        iterable_counts[left_dict[right_dict.indexOf(char)]]--;
        value += char;
      }else if(char === "\n"){
          if(Object.values(iterable_counts).reduce((sum,elm)=>{return sum+elm},0) %2 === 0){
              values.push(value);
              return values;
          }
      }else if(["\r"," ","\t"].indexOf(char) === -1){
            value += char;
      }
  }
  return values.concat([value]);
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
  text = text.substring(1,text.length-1);
  let imports = [];
  for(let i = 0,len=text.length;i<len;i++){
    const list_chaild = text[i];
    // if(left_dict.indexOf(list_chaild) !== -1) {
    if((index = char_dict.indexOf(list_chaild)) !== -1){
      const chars = char_dict[index];
      children.push('"'+text.substring(i+1,i+1+text.substring(i+1).indexOf(chars))+'"');
      i += (text.substring(i+1).indexOf(chars)+2);
      children_types.push("str");
    }
    else if(left_dict.indexOf(list_chaild) !== -1) {
      // 再帰で入れ子の型を調べてる
      const index = get_iterable(text.substring(i));
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
      let ch = text.substring(i,i+text.substring(i).indexOf(","));
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
        children_types.push(get_type(ch));
      }
  }
  sub_types = Array.from(new Set(children_types)).join(",");
  if(children_types.length !== 1){
    imports.push("typing.Union");
  }

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
    if(right_spliter === "" && left_spliter === "" && (index = left_dict.indexOf(char)) !== -1){
      iterable_index["start"] = count;
      left_spliter = left_dict[index];
      right_spliter = right_dict[index];
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
  return false;
}
function get_type(val){
  val = val.trim();
  for(let key of Object.keys(py_typers)){
    // if(py_typers[key] == "%float"){
    //   py_typers[key] = "^-?[0-9]+\.[0-9]+$";
    // }
    // let re = new RegExp();
    const match = val.trim().match(py_typers[key]);
    if(match != null && match.input === match[0]){
      return key;
}}
return false;
}
function get_focus(textContent){
  textContent = textContent.toLowerCase();
  textContent = textContent.replaceAll("\\", "/");
  tab_opend_path = textContent;
  txt_editor = editor_dict[tab_opend_path];
  const ftype_dict = JSON.parse(fs.readFileSync(window.requires.dirname+'/info/file_type.json', 'utf8'));
  file_type = ftype_dict[window.requires.path.extname(textContent).substring(1)];
  // 拡張子でハイライトなどに使う言語情報の変更
  if(file_type !== undefined){
      txt_editor.session.setMode(`ace/mode/${file_type}`);
  }


  // タブの切り替えをエディターエレメントの表示、非表示で表現
  for(const editor of document.querySelectorAll(`.editor`)){
    if(editor.dataset.fullpath !== tab_opend_path){
      editor.style.display="none";
    }else{
      editor.style.display="";
    }
  };
  // フォーカスが当たってるときのタブを紫に変更
  for (const tab of document.querySelectorAll(".tab")){
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
    for (const tab of document.querySelectorAll(".tab")){
      const textContent = tab.dataset.fullpath;
      if(textContent === tab_opend_path){
        tab.innerHTML = window.requires.path.basename(path.replaceAll("\\", "/"))+"<button class='delete'>X</button>";
        tab.querySelector("button").onclick = delete_tab;
        path = path.replaceAll("\\", "/");
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
    AutoLearning(txt_editor.session.getValue());
  });
}
function getSettings(key) {
  return  JSON.parse(fs.readFileSync(window.requires.dirname+'/user_custom/settings.json', 'utf8'))[key];

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
      document.getElementById("tabs").insertBefore(select_tab,document.querySelector(".tab[data-fullpath=\""+ em["name"] +"\"]"));
    }
    for(const em of document.querySelectorAll(".tab")){
      tab_widths[em.dataset.fullpath] = gettabwidth(em);
    }
}
    fs = window.requires.fs;
    py_imports = JSON.parse(fs.readFileSync(window.requires.dirname+'/user_custom/py.json', 'utf8'));
    py_typers = JSON.parse(fs.readFileSync(window.requires.dirname+'/user_custom/py_type.json', 'utf8'));
    window.api.get_args().then((args) => {
      const custom_list = {
        "import":window.requires.dirname+"/user_custom/py.json",
        "type":window.requires.dirname+'/user_custom/py_type.json',
        "shortcut":window.requires.dirname+'/user_custom/shortcut.jsonc',
        "settings":window.requires.dirname+"/user_custom/settings.json"
        };
      debugMode = args["Debugflag"];
      if(debugMode){
        const open_files = getSettings("debug_open_files");
        if(open_files == undefined){
          open_files = [
            ...Object.values(custom_list),
            window.requires.dirname+"/index.html",
            window.requires.dirname+"/main.js",
            window.requires.dirname+"/editor.js"
          ];
        }
        args["Others"].push(...open_files)
        }
      if(args["UserCustom"] !== undefined){
        const input =  args["UserCustom"];
        for(const falias_key of Object.keys(custom_list)){
          if(falias_key.indexOf(input) === 0){
            args["Others"].push(custom_list[falias_key]);
            break;
          }
        }
      }
      backup_file = window.requires.dirname+"/.backup/save.json";
      if(fs.existsSync(backup_file)){
          args["Others"] = args["Others"].concat(Object.keys(JSON.parse(fs.readFileSync(backup_file, "utf8"))));
      }
      if(args["Others"].length !== 0){
        let first_flag = true;
        let first_file = "";
        for(let fpath of args["Others"]){
          fpath = fpath.replaceAll("\\", "/");
          const exsits_flag = fs.existsSync(fpath);
          if(exsits_flag === false){//ディレクトリの対応する
            fs.writeFileSync(fpath, '');
          }
          let em = create_tab().dataset.fullpath;
          const fullpath = get_path(fpath);
          readFile(fullpath, em);
          if(first_flag){
            first_flag = false;
            first_file = fullpath;
          }
        }
        
        get_focus(first_file);
      }else{
        create_tab();
        get_focus("unnamed1");
      }
      if(fs.existsSync(backup_file)){
          cust_onchange_off();
          const dict = JSON.parse(fs.readFileSync(backup_file, "utf8"));
          for(const key of Object.keys(dict)){
               editor_dict[key].session.setValue(dict[key]["writeend"]);
                }
              cust_onchange_on();
          }
          
       cust_onchange_on();   
      
    });
    // shorthcut 作成 デバッグモードでは使用しないよう
    if(debugMode === false){
      let shortcut = JSON.parse(fs.readFileSync(window.requires.dirname+'/user_custom/shortcut.jsonc', 'utf8'));
      for(const key of Object.keys(shortcut)){
        window.api.on(key,()=>{
            // try{
                eval(shortcut[key]);
            // }catch{
            //     info_in_footer(`ショートカット：${key}が失敗しました。`,5000);
            // }
            
            }   
        );
        
      }
    }
    window.api.on("read_file", function(event,path){
      // input_int = true;
      readFile(path);
      get_focus(path);
      // input_int = false;
    });


  // 入力関連領域
  inputArea = document.getElementById('input_area');
  // フッター領域
  footerArea = document.getElementById('footer_fixed');
  // create_tab("unnamed1");
  // txt_editor = create_editor("input_txt");
  // get_focus("unnamed1");
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
}
function readFile(path, replacement = tab_opend_path) {
  path = path.toLowerCase() ;
  replacement = replacement.toLocaleLowerCase();
  const editor = document.querySelector(`.editor[data-fullpath="${replacement}"]`);
  path = path.replaceAll("\\", "/");
  editor.dataset.fullpath = path;
  if(!fs.existsSync(path)) return;
  tab_widths[path] = tab_widths[replacement];
  editor_dict[path] = editor_dict[replacement];
  if(path !== replacement){
    window.api.chokidar_path_add(path);
    remove_tab_info(replacement);
  }
  const text = fs.readFileSync(path, 'utf8');
  const tab = document.querySelector(`.tab[data-fullpath="${replacement}"]`);
  if( document.querySelector(`.tab[data-fullpath="${path}"]`) !== null){
      if(tab.dataset.status === "if can't fileRead then delete"){
          tab.querySelector("button").click();
      }
  }
  else{
      
    tab.dataset.fullpath = path;
    tab.title = path;
    tab.innerHTML = window.requires.path.basename(path.replaceAll("\\", "/"))+"<button class='delete'>X</button>";
    tab.querySelector("button").onclick = delete_tab;
    }

  // フッター部分に読み込み先のパスを設定する
  // テキスト入力エリアに設定する
  
  last_saves[path] = text;
  text_list[path] = text;
  cust_onchange_off();
  editor_dict[path].session.setValue(text);
  cust_onchange_on();
  if(document.querySelectorAll(".tab").length === 1){
    get_focus(path.replaceAll("\\", "/"))
    // tab_opend_path = path.replaceAll("\\", "/");
    footerArea.innerHTML = path;
    // txt_editor.session.setValue(text, -1);
  }
};




