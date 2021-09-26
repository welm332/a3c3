# import time
# start = time.time()
# print(time.time() -start)
import sys
import win32com.client
def get_fullpath(lnk_path = sys.argv[1]):
    wshell = win32com.client.Dispatch("WScript.Shell") # <COMObject WScript.Shell>
    shortcut = wshell.CreateShortcut(lnk_path)
    print(shortcut.TargetPath) # C:\WINDOWS\system32\notepad.exe
if __name__ == "__main__":
    get_fullpath()