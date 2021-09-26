document.querySelector("#remotesend").onclick = get_remote_cmd;
window.onkeypress=
    function (event) {
      if (event.key === "Enter") {
          get_remote_cmd();
      }}
function get_remote_cmd(){
    const value = document.querySelector("#input").value;
    console.log(value);
    window.api.send_remote_command(value)
}