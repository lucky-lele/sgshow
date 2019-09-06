@echo off
REM 【三国锦绣】离线更新程序
REM Author: Luckylele <club.sanguosha.com>

setlocal EnableDelayedExpansion

set subdirs[0]=..\avatar\
set subdirs[1]=..\avatar_dyn\
set subdirs[2]=..\border\
set subdirs[3]=..\border_dyn\
set subdirs[4]=..\background\
set subdirs[5]=..\bkg_dyn\
set subdirs[6]=..\title\
set subdirs[7]=..\src\
set GITROOT=https://raw.githubusercontent.com/lucky-lele/sgshow/master/
set GITHUB=https://raw.githubusercontent.com/lucky-lele/sgshow/master/offline/
set AVATAR=http://web.sanguosha.com/220/assets/AvatarShow/avatar/
set BORDER=http://web.sanguosha.com/220/assets/simplified/AvatarShow/border/
set BACKGD=http://web.sanguosha.com/220/assets/AvatarShow/background/
set TITLE=http://web.sanguosha.com/220/assets/simplified/AvatarShow/title/


REM Get windows VERSION

for /f "delims=" %%i in ('ver') do @set a=%%i

:get_bracket
  set a=!a:~1!
  if "%a%" == "" goto :ver_error
  if not "%a:~0,1%" == "[" goto :get_bracket

for /f "tokens=2-3 delims=. " %%i in ('echo %a%') do set version=%%i.%%j

REM Finished getting windows VERSION

for /l %%i in (0,1,7) do (
  set a=!subdirs[%%i]!
  if not exist !a! call mkdir !a!
)

call :show_info 检查可用更新
if exist NEW del NEW
call :my_download %GITROOT%VERSION NEW
call :check_file NEW

if exist VERSION (
  set /p vero=<VERSION
  set /p vern=<NEW
  if "!vero!" == "!vern!" (
    call :show_info latest
    pause
    exit
  )
)

call :show_info 更新主程序

if exist index.html del index.html
if exist style.css del style.css
if exist sgs_show.js del sgs_show.js
if exist gif.js del gif.js
if exist gif.worker.js del gif.worker.js

call :my_download %GITHUB%index.html index.html
call :my_download %GITHUB%style.css style.css
call :my_download %GITHUB%sgs_show.js sgs_show.js
call :my_download %GITROOT%gif.js gif.js
call :my_download %GITROOT%gif.worker.js gif.worker.js

call :check_file index.html
call :check_file style.css
call :check_file sgs_show.js
call :check_file gif.js
call :check_file gif.worker.js

move index.html ..\index.html
move style.css ..\style.css
move sgs_show.js ..\sgs_show.js
move gif.js ..\gif.js
move gif.worker.js ..\gif.worker.js

if not exist ..\icon.png call :my_download %GITROOT%icon.png ..\icon.png

call :show_info 更新资源包

if exist list.txt del list.txt

call :my_download %GITHUB%list.txt list.txt
call :check_file list.txt

for /f "tokens=*" %%i in (list.txt) do (
  set line=%%i
  set id=!line:~0,1!
  set fname=!line:~2!
  set odir=!!subdirs[!id!]!!
  if "!id!" == "0" (
    set dst=%%subdirs[0]%%!fname!
    set src=%AVATAR%!fname!
    if "!fname!" == "1989.png" set src=%GITHUB%avatar/!fname!
  )
  if "!id!" == "1" (
    set dst=%%subdirs[1]%%!fname!
    set src=%GITHUB%avatar_dyn/!fname!
  )
  if "!id!" == "2" (
    set dst=%%subdirs[2]%%!fname!
    set src=%BORDER%!fname!
  )
  if "!id!" == "3" (
    set dst=%%subdirs[3]%%!fname!
    set src=%GITHUB%border_dyn/!fname!
  )
  if "!id!" == "4" (
    set dst=%%subdirs[4]%%!fname!
    set src=%BACKGD%!fname!
  )
  if "!id!" == "5" (
    set dst=%%subdirs[5]%%!fname!
    set src=%GITHUB%bkg_dyn/!fname!
  )
  if "!id!" == "6" (
    set dst=%%subdirs[6]%%!fname!
    set src=%TITLE%!fname!
  )
  if "!id!" == "7" (
    set dst=%%subdirs[7]%%!fname!
    set src=%GITROOT%src/!fname!
  )
  call :my_download !src! !dst!
  call :check_file !dst!
)

del list.txt

move NEW VERSION

call :show_info 更新成功

pause

:my_download
  if %version% LEQ 6.1 (
  REM Windows 7 or lower version
  call :down_win7 %1 %2
  )
  if %version% GTR 6.1 (
  REM Windows 8 or higher version
  call :down_win8 %1 %2
  )
  exit /b

:show_info
  echo =====  %1  =====
  exit /b

:check_file
  if not exist %1 (
    call echo 资源下载失败，请稍后重试
    goto :err
  )
  exit /b

:down_win7
  set url=%1
  set out=%2
  if exist %out% goto :eof
  echo Downloading %out%
  set out=%cd%\%out%
  call winhttpjs.bat %url% -saveTo "%out%"
  exit /b

:down_win8
  set url=%1
  set out=%2
  if exist %out% goto :eof
  set command="(New-Object Net.WebClient).DownloadFile('%url%', '%out%')"
  echo Downloading %out%
  powershell -Command %command%
  exit /b

:ver_error
  echo 无法获取 Windows 版本
  goto :err

:err
  pause
  exit

:eof

