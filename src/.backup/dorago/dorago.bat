@echo off
python %~dp0\py_dorago.py %*

for /f "delims=" %%a in (%~dp0\dorago.txt) do (
  %%a 
)
type nul >  %~dp0\dorago.txt