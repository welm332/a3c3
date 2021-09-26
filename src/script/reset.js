const fs = require("fs")
const json = {
    	"os.": {
		"name": "os.",
		"code": "import os\n",
		"replace": "",
		"sule": [
			"from os",
			"import os"
		],
		"update": {
			"if": null
		}
	}
}
const import = JSON.parse(fs.readFileSync(__dirname+'/../user_custom/shortcut.jsonc', 'utf8'));