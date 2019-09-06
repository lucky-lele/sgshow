#!/bin/bash
# 【三国锦绣】离线更新程序
# 作者: Luckylele <club.sanguosha.com>

function show_info {
  echo "=====>  $1  <====="
}
function my_exit {
  read -n 1 -s -r -p "按任意键退出"
  exit
}
function check_file {
  if [ ! -f "$1" ]; then
    show_info "资源下载失败，请稍后重试"
    my_exit
  fi
}

dir=${0%/*}
if [ "$dir" = "" ]; then
  dir="."
fi
cd $dir

flag=0
type wget &> /dev/null && flag=2
type curl &> /dev/null && flag=1

if [ "$flag" = 1 ]; then
  function my_download {
    if [ ! -f "$2" ]; then
      echo "Downloading $2"
      curl -sfk "$1" -o "$2"
    fi
  }
elif [ "$flag" = 2 ]; then
  function my_download {
    if [ ! -f "$2" ]; then
      echo "Downloading $2"
      wget -q "$url" -O "$output" || rm "$output"
    fi
  }
else
  echo "Error: 请安装 wget 或 curl 以从网络下载资源!"
  my_exit
fi

subdirs=("../avatar/" "../avatar_dyn/" "../border/" "../border_dyn/" "../background/" "../bkg_dyn/" "../title/" "../src/")
GITROOT="https://raw.githubusercontent.com/lucky-lele/sgshow/master/"
GITHUB="https://raw.githubusercontent.com/lucky-lele/sgshow/master/offline/"
AVATAR="http://web.sanguosha.com/220/assets/AvatarShow/avatar/"
BORDER="http://web.sanguosha.com/220/assets/simplified/AvatarShow/border/"
BACKGD="http://web.sanguosha.com/220/assets/AvatarShow/background/"
TITLE="http://web.sanguosha.com/220/assets/simplified/AvatarShow/title/"

for i in ${subdirs[@]}; do
  if [ ! -d "$i" ]; then
    mkdir "$i"
  fi
done

show_info "检查可用更新"
if [ -f NEW ]; then
  rm NEW
fi
my_download ${GITROOT}VERSION NEW
if [ ! -f NEW ]; then
  show_info "检查更新出错，请稍后再试"
  my_exit
fi

if [ -f "VERSION" ]; then
  ver=`head -n 1 VERSION | head -c 8`
  new=`head -n 1 NEW | head -c 8`
  if [ "$ver" == "$new" ]; then
    show_info "无可用更新"
    my_exit
  fi
fi

show_info "更新主程序"

if [ -f index.html ]; then
  rm index.html
fi
if [ -f style.css ]; then
  rm style.css
fi
if [ -f sgs_show.js ]; then
  rm sgs_show.js
fi
my_download ${GITHUB}index.html index.html
my_download ${GITHUB}style.css style.css
my_download ${GITHUB}sgs_show.js sgs_show.js
my_download ${GITROOT}gif.js gif.js
my_download ${GITROOT}gif.worker.js gif.worker.js

if [ -f index.html ]; then
  mv index.html ../
else
  show_info "主程序包下载失败，请稍后重试"
  my_exit
fi
if [ -f style.css ]; then
  mv style.css ../
else
  show_info "主程序包下载失败，请稍后重试"
  my_exit
fi
if [ -f sgs_show.js ]; then
  mv sgs_show.js ../
else
  show_info "主程序包下载失败，请稍后重试"
  my_exit
fi
if [ -f gif.js ]; then
  mv gif.js ../
else
  show_info "主程序包下载失败，请稍后重试"
  my_exit
fi
if [ -f gif.worker.js ]; then
  mv gif.worker.js ../
else
  show_info "主程序包下载失败，请稍后重试"
  my_exit
fi

if [ ! -f ../icon.png ]; then
  my_download ${GITROOT}icon.png ../icon.png
fi

show_info "更新资源包"
if [ -f list.txt ]; then
  rm list.txt
fi
my_download ${GITHUB}list.txt list.txt

if [ ! -f list.txt ]; then
  show_info "资源包更新失败，请稍后重试"
  my_exit
fi

while read id fname; do
  fname=${fname%%[[:cntrl:]]}
  odir=${subdirs[$id]}
  dst=${odir}${fname}
  case "$id" in
  0 ) if [ "$fname" = "1989.png" ]; then
        src=${GITHUB}avatar/${fname}
      else
        src=${AVATAR}${fname}
      fi ;;
  1 ) src=${GITHUB}avatar_dyn/${fname} ;;
  2 ) src=${BORDER}${fname} ;;
  3 ) src=${GITHUB}border_dyn/${fname} ;;
  4 ) src=${BACKGD}${fname} ;;
  5 ) src=${GITHUB}bkg_dyn/${fname} ;;
  6 ) src=${TITLE}${fname} ;;
  7 ) src=${GITROOT}src/${fname} ;;
  * ) show_info "资源目录错误，请稍后再试"
      my_exit ;;
  esac
  my_download "$src" "$dst"
  check_file "$dst"
done < list.txt

rm list.txt

mv NEW VERSION

show_info "更新成功"
my_exit

