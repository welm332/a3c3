import sys
import requests
import lxml.html
import re
import os
class pydorago:
    write = ""
    code = ""

    def install_pack(self, pack):
        self.code = f"conda install {pack}"
        try:
            if pack:
                url = requests.get(f"https://anaconda.org/conda-forge/{pack}")
                html = lxml.html.fromstring(url.text)
                mist = html.cssselect("code")
                self.code = mist[0].text
        except:
            pass

    def main(self):
        if re.search("[^pdiax]",sys.argv[1]):
            cli = [sys.argv[1]]
            arg = "x"
        else:
            arg = "x" if len(sys.argv) == 1 else sys.argv[1]
            cli = sys.argv[2:]
        option = {
            "p": "p\n",
            "d": "conda deactivate\n",
            "i": "installするパッケージ",
            "a": "conda activate ",
        }
        qtext = {"a": "環境名は？"}
        for i,a in enumerate(list(arg)):
            com = ""
            if len(cli) > i:
                com = cli[i]
            # print(a, end="\t")
            if a in qtext:
                self.write += option[a] + input(qtext[a])+"\n" if com == "" else option[a] + com+"\n"
            elif a == "i":
                if com == "":
                    self.install_pack(input(option[a]))
                else:
                    self.install_pack(com)
                # print(write)
                self.write += self.code.strip()+"\n"
            else:
                self.write += option[a]+"\n"
        # except:
        #     pass
        dir_path:str = __file__[0:__file__.rfind('\\')]
        for command in self.write.split("\n"):
            os.system(command)
            # os.system("dir")
        # with open(f"{dir_path}/dorago.txt", "w") as f:
        #     f.write(self.write)
        # print(self.write)


a = pydorago()
a.main()
