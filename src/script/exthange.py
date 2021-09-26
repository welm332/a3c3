# pather_txt = txt
# print(pather_txt[0:2])
def returnAbsolutePath(pather_txt: str = ".", rootpath: str = "") -> str:
    import glob
    import os
    import re
    import subprocess
    from subprocess import PIPE

    # もととなるdirが指定されているならそれを、ないならcdでカレントディレクトリをpwdに入れる
    pwd = (
        os.getcwd()
        if rootpath == ""
        else rootpath
    )
    # print(f"{pwd=}")
    # # :が入っているのは絶対ﾊﾟｽ,
    # print(glob.glob(fr"{pwd}\*"))
    splited = "/" if "/" in pather_txt else "\\"
    if ":" in pather_txt or  pather_txt.split(splited)[0] not in [a.split(splited)[-1] for a in glob.glob(fr"{pwd}\*")] + ["",".",".."]:
    # if ":" in pather_txt:
        # print(pather_txt.split(splited)[0])
        return False
    # print()
    # ﾊﾟｽの中のﾌｧｲﾙの部分を探している
    if splited in pather_txt and [] != (
        z := [a for a in pather_txt.split(splited) if re.search(r"(?!\.).*\..*", a)]
    ):
        z = z[0]
        fileIndex = pather_txt.index(z) + len(z)
        # そのあとに続くのは,ない or 戻る,自分なので
        # print(pather_txt[fileIndex + 1 : fileIndex + 3])
        if pather_txt[fileIndex + 1 : fileIndex + 3] not in ["", ".\\","./", ".."]:
            return pather_txt

    if splited == pather_txt[0]:
        pwd = pwd.split(splited)[0]
        # print(f"{pwd=}")
        # if ".." not in pather_txt  :
    # print(pwd)
    # if pather_txt.split("\\")[0] == ".":
    #     pather_txt = pather_txt[2:]
    # if ".." in  pather_txt:
    txt = pwd
    for a in pather_txt.split(splited):
        # print(a)
        if a == "..":
            # print(a)
            txt = txt[0 : txt.rfind(splited)]
            # print(txt)
        elif a != ".":
            txt += splited + a
    pather_txt = txt
    if glob.glob(pather_txt) == []:
        # print("正しくないpathです")
        return False
    # else:
        # print("正しいﾊﾟｽです")
    return pather_txt.replace("\\","/")


if __name__ == "__main__":
    import sys

    txt = sys.argv[1] if len(sys.argv) > 1 else "."
    print(returnAbsolutePath(txt))
