"use strict";
var ver = "online"
var online_url = "https://lucky-lele.github.io/sgshow/"

if (ver === "online") {
  var predir = new Array("0","1","2","3","4","5");
  var subdir = new Array("0f","1f","2f","3f","4f","5f");
  var tdir = "t";
  var nmax = new Array(91,65,45,27,65,39);
}
else {
  var predir = new Array("avatar","avatar_dyn","border","border_dyn","background","bkg_dyn");
  var subdir = predir;
  var tdir = "title";
  var nmax = new Array(90,60,65,45,60,36);
}

var N = 6;
var cls = new Array("avatar","avatar_dyn","border","border_dyn","backgd","backgd_dyn");
var suf = new Array("","","1","1","","");
var pids = new Array(0,0,0,0,0,0);
var pages = new Array(0,0,0,0,0,0);
var gui = document.getElementById("gui").getContext("2d");

function imgData(pid, txt, num, suite) {
  this.pid = pid;
  this.txt = txt;
  this.num = num;
  this.suite = suite;
}
function titleData(id, txt) {
  this.id = id;
  this.txt = txt;
}
function imgCache() {
  this.pid = 0;
  this.tid = -1;
  this.num = 1;
  this.txt = "";
  this.suite = "";
  this.dim = [0, 0];
}

var max_table = 9;
var loaded = 0;
var data = new Array(N);
var recent = new Array(3);
var imgs = new Array(3);
var frame = new Array(0,0,0);
var title = new Array();
for (var i = 0; i < N; i++) data[i] = [];
for (var i = 0; i < 3; i++) {
  recent[i] = new Array(max_table);
  for (var j = 0; j < max_table; j++) recent[i][j] = new imgCache();
}
var animeRef;
var animeRunning = false;
var last_time = Date.now();
var elapsed = 0;
var fps_delay = 100;

var effect_info = document.getElementById("effect_info");
var winrun_info = document.getElementById("winrun_info");
var avatar_shift = new Array(0,0);
var bkg_shift = new Array(0,0);
var vip = 0;
var viplv = "";
var nick = "";
var sex = "";
var lv = 0;
var pack = new Array("","","","","");
var packown = -1;
var titleid = "";
var bkgc = 0;
var effect_flag = 0;
var winrun_flag = 0;
var winrate = -1;
var runrate = -1;
var offset = 0;
var nicklen = 0;
var songti = "";

var packname = new Array("feng","huo","lin","shan","shen","jie","jiang1","jiang2","jiang3","jiang4","jiang5","yuan6","yuan7");
var packnum = new Array(9,9,9,10,9,10,9,9,9,9,9,9,9);
var packw = new Array(28,25,23,25,32,25,32,32,32,32,32,32,32);
var packh = new Array(31,39,24,24,31,40,31,31,31,31,31,31,31);
var packx = new Array(-3,0,1,-1,-4,0,-4,-4,-4,-4,-4,-4,-4);
var packy = new Array(185,176,188,188,185,175,185,185,185,185,185,185,185);
var thispack = new Array(0,0,0,0,0,0,0,0,0,0,0,0,0);


window.onload = function() {
  if (ver === "online") {       // load show.xml
    if (!(window.XMLHttpRequest)) {
      alert("您的浏览器不支持此应用！");
      return;
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "show.xml", false);
    xmlhttp.send();
    var xml = xmlhttp.responseXML;
  }
  else {
    var parseXml;
    if (typeof window.DOMParser != "undefined") {
      parseXml = function(xmlStr) {
        return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
      };
    }
    else if (typeof window.ActiveXObject != "undefined" &&
        new window.ActiveXObject("Microsoft.XMLDOM")) {
      parseXml = function(xmlStr) {
        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
      };
    }
    else {
      alert("对不起，您的浏览器不支持此应用！");
      return;
    }

    var xml = parseXml(document.getElementById("showdata").innerHTML);
  }

  var info = xml.getElementsByTagName("s");
  var i, attr, tid, pid, num, txt, suite;

  for (i = 0; i < info.length; i++) {
    attr = info[i].attributes;
    tid = parseInt(attr.getNamedItem("t").nodeValue);
    pid = parseInt(attr.getNamedItem("i").nodeValue);
    num = (tid % 2 === 1) ? parseInt(attr.getNamedItem("f").nodeValue) : 1;
    txt = attr.getNamedItem("n").nodeValue;
    suite = attr.getNamedItem("s").nodeValue;
    data[tid].push(new imgData(pid, txt, num, suite));
  }

  if (ver === "online") {       // load title.xml
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "title.xml", false);
    xmlhttp.send();
    xml = xmlhttp.responseXML;
  }
  else {
    xml = parseXml(document.getElementById("titledata").innerHTML);
  }

  info = xml.getElementsByTagName("a");
  for (i = 0; i < info.length; i++) {
    attr = info[i].attributes;
    pid = attr.getNamedItem("i").nodeValue;
    txt = attr.getNamedItem("n").nodeValue;
    title.push(new titleData(pid, txt));
  }

  for (i = 0; i < N; i++) show_list(i, 0);      // display show
  document.getElementById("link").style.display = "none";
  document.getElementById("exgif").style.display = "none";
  document.getElementById("status").style.display = "none";
  effect_info.style.display = "none";
  winrun_info.style.display = "none";

  var os = navigator.platform;
  if (os.indexOf("Win") > -1) {
    songti = "宋体";
  }
  else {
    songti = "SimSun";
  }
};

function show_list(idx, p) {
  var page = p;
  switch (p) {
    case -3:
      if (pages[idx] > 0) page = pages[idx] - 1;
      else return;
      break;
    case -2:
      page = pages[idx] + 1;
      break;
    case -1:
      page = Math.ceil(data[idx].length / nmax[idx]) - 1;
      break;
  }

  var start = page * nmax[idx];
  var j, pid, url, div, img, label, text;
  if (start >= data[idx].length) return;
  pages[idx] = page;
  document.getElementById(cls[idx] + "_page").value = String(page + 1);

  var info = document.getElementById(cls[idx] + "_result");
  info.innerHTML = "";
  info.style.borderWidth = "0px";
  info.style.backgroundColor = "";
  document.getElementById(cls[idx] + "_close").innerHTML = "";
  var pdiv = document.getElementById(cls[idx] + "_div");
  while (pdiv.lastElementChild.getAttribute("class") === cls[idx]) pdiv.removeChild(pdiv.lastElementChild);

  for (var i = 0; i < nmax[idx]; i++) {
    j = start + i;
    if (j === data[idx].length) break;
    pid = String(data[idx][j].pid);
    url = predir[idx] + "/" + pid + suf[idx] + ".png";
    div = document.createElement("div");
    img = document.createElement("img");
    img.setAttribute("src", url);
    img.setAttribute("onclick", "draw(" + String(idx) + "," + pid + ")");
    img.setAttribute("onerror", "this.onclick=''");
    img.setAttribute("id", cls[idx] + "_" + pid);
    img.setAttribute("alt", String(j));
    div.setAttribute("class", cls[idx]);
    pdiv.appendChild(div);
    label = document.createElement("p");
    text = document.createTextNode(data[idx][j].txt);
    label.appendChild(text);
    label.setAttribute("class", "label");
    div.appendChild(img);
    div.appendChild(label);
    if (String(pids[idx]) === pid) img.style.borderColor = "red";
  }
  document.getElementById("ex_" + cls[idx]).innerHTML = "&and;收起";
}

function draw(idx, pid) {
  var dom, idx2 = (idx % 2 === 0) ? idx + 1 : idx - 1;
  if (pids[idx] !== 0 && (dom = document.getElementById(cls[idx] + "_" + pids[idx])))
    dom.style.borderColor = "white";
  if (pids[idx2] !== 0 && (dom = document.getElementById(cls[idx2] + "_" + pids[idx2]))) {
    dom.style.borderColor = "white";
  }
  pids[idx2] = 0;
  if (pids[idx] === pid) pids[idx] = 0;
  else {
    pids[idx] = pid;
    if ((dom = document.getElementById(cls[idx] + "_" + pid)))
      dom.style.borderColor = "red";
  }
  add_recent(idx, pids[idx], 1);
}

function add_recent(idx, pid, num) {
  stop_anime();
  document.getElementById("mypause").style.display = "none";
  document.getElementById("faq").style.display = "none";
  document.getElementById("effect").style.display = "none";
  document.getElementById("table").style.display = "none";
  document.getElementById("code_info").style.display = "none";
  document.getElementById("link").style.display = "none";
  document.getElementById("exgif").style.display = "none";

  var tmp = new imgCache();
  var idx2 = parseInt(idx / 2);
  var i;
  if (pids[idx] === 0) draw_show();
  else {
    for (i = 0; i < max_table; i++) {   // search current in recent
      if (recent[idx2][i].pid === pid) {
        tmp.pid = pid;
        tmp.tid = recent[idx2][i].tid
        tmp.num = recent[idx2][i].num;
        tmp.txt = recent[idx2][i].txt;
        tmp.suite = recent[idx2][i].suite;
        tmp.dim[0] = recent[idx2][i].dim[0];
        tmp.dim[1] = recent[idx2][i].dim[1];
        break;
      }
    }
    if (tmp.pid !== 0) {                // current found in recent
      for (var j = i; j > 0; j--) {
        recent[idx2][j].pid = recent[idx2][j - 1].pid;
        recent[idx2][j].tid = recent[idx2][j - 1].tid;
        recent[idx2][j].num = recent[idx2][j - 1].num;
        recent[idx2][j].txt = recent[idx2][j - 1].txt;
        recent[idx2][j].suite = recent[idx2][j - 1].suite;
        recent[idx2][j].dim[0] = recent[idx2][j - 1].dim[0];
        recent[idx2][j].dim[1] = recent[idx2][j - 1].dim[1];
      }
      recent[idx2][0].pid = tmp.pid;
      recent[idx2][0].tid = idx;
      recent[idx2][0].num = tmp.num;
      recent[idx2][0].txt = tmp.txt;
      recent[idx2][0].suite = tmp.suite;
      recent[idx2][0].dim[0] = tmp.dim[0];
      recent[idx2][0].dim[1] = tmp.dim[1];
      imgs[idx2] = document.getElementById("hidden_" + cls[idx] + "_" + pid);
      draw_show();
      return;
    }
    tmp.pid = recent[idx2][max_table - 1].pid;
    tmp.tid = recent[idx2][max_table - 1].tid;
    for (i = max_table - 1; i > 0; i--) {
      if (recent[idx2][i - 1].pid !== 0) {
        recent[idx2][i].pid = recent[idx2][i - 1].pid;
        recent[idx2][i].tid = recent[idx2][i - 1].tid;
        recent[idx2][i].num = recent[idx2][i - 1].num;
        recent[idx2][i].txt = recent[idx2][i - 1].txt;
        recent[idx2][i].suite = recent[idx2][i - 1].suite;
        recent[idx2][i].dim[0] = recent[idx2][i - 1].dim[0];
        recent[idx2][i].dim[1] = recent[idx2][i - 1].dim[1];
      }
    }
    recent[idx2][0].pid = pid;
    recent[idx2][0].tid = idx;
    i = find_index(idx, pid);
    if (i < 0) return;
    recent[idx2][0].txt = data[idx][i].txt;
    recent[idx2][0].suite = data[idx][i].suite;
    if (idx % 2 === 1) recent[idx2][0].num = data[idx][i].num;

    var hid, url;
    if (tmp.pid !== 0) {
      hid = document.getElementById(cls[tmp.tid] + "_hidden");
      hid.removeChild(document.getElementById("hidden_" + cls[tmp.tid] + "_" + tmp.pid));
    }
    hid = document.getElementById(cls[idx] + "_hidden");
    if (idx % 2 === 0)
      url = subdir[idx] + "/" + String(pid) + suf[idx] + ".png";
    else
      url = subdir[idx] + "/" + String(pid) + suf[idx] + "_full.png";
    var img = document.createElement("img");
    img.setAttribute("src", url);
    img.setAttribute("id", "hidden_" + cls[idx] + "_" + pid);
    hid.appendChild(img);
    img.onload = function() {
      imgs[idx2] = img;
      if (idx % 2 === 1) {
        recent[idx2][0].dim[0] = parseInt(img.naturalWidth / recent[idx2][0].num);
        recent[idx2][0].dim[1] = img.naturalHeight;
      }
      if (++loaded >= num) draw_show();
    };
    img.onerror = function() {
      alert("无法加载指定资源，请稍后再试！");
    };
  }
}

function draw_show() {
  if (pids[1] === 0 && pids[3] === 0 && pids[5] === 0) {
    if (pids[0] !== 0 || pids[2] !== 0 || pids[4] !== 0 || titleid !== "")
      draw_pic();
    else gui.clearRect(0, 0, 148, 208);
  }
  else {
    for (i = 0; i < thispack.length; i++) thispack[i] = 0;
    frame[0] = frame[1] = frame[2] = 0;
    var pausebtn = document.getElementById("mypause");
    pausebtn.innerHTML = "暂停";
    pausebtn.style.display = "inline";
    animeRunning = true;
    if (typeof performance === "object")
      last_time = performance.now();
    else
      last_time = Date.now();
    document.getElementById("link").style.display = "none";
    document.getElementById("exgif").style.display = "block";
    animeRef = requestAnimationFrame(draw_frame);
  }
}

function draw_pic() {
  gui.clearRect(0, 0, 148, 208);
  if (effect_flag === 1 && bkgc == 1) {
    gui.fillStyle = "black";
    gui.fillRect(0, 0, 148, 208);
  }

  if (pids[4] !== 0)
    gui.drawImage(imgs[2], 29 + bkg_shift[0], 22 + bkg_shift[1]);
  if (pids[0] !== 0)
    gui.drawImage(imgs[0], 29 + avatar_shift[0], 22 + avatar_shift[1]);
  if (pids[2] !== 0)
    gui.drawImage(imgs[1], 0, 0);
  draw_effects(gui);
  draw_pack(gui, 0, thispack);

  if (pids[0] !== 0 || pids[2] !== 0 || pids[4] !== 0 || effect_flag !== 0 || winrun_flag !== 0) {
    var fname = "download";
    if (pids[0] != 0) fname = pids[0];
    else if (pids[2] != 0) fname = pids[2];
    else if (pids[4] != 0) fname = pids[4];
    export_pic(fname);
  }
  else {
    document.getElementById("link").style.display = "none";
    document.getElementById("exgif").style.display = "none";
  }
}

function draw_frame(now) {
  animeRef = requestAnimationFrame(draw_frame);
  elapsed = now - last_time;
  if (elapsed >= fps_delay) {
    last_time = now - (elapsed % fps_delay);

    gui.clearRect(0, 0, 148, 208);
    if (effect_flag === 1 && bkgc == 1) {
      gui.fillStyle = "black";
      gui.fillRect(0, 0, 148, 208);
    }

    if (pids[4] !== 0)          // background
      gui.drawImage(imgs[2], 29 + bkg_shift[0], 22 + bkg_shift[1]);
    else if (pids[5] !== 0) {
      gui.drawImage(imgs[2], frame[2] * recent[2][0].dim[0], 0,
          recent[2][0].dim[0], recent[2][0].dim[1], 29 + bkg_shift[0],
          22 + bkg_shift[1], recent[2][0].dim[0], recent[2][0].dim[1]);
      if (++(frame[2]) >= recent[2][0].num) frame[2] = 0;
    }

    if (pids[0] !== 0)          // avatar
      gui.drawImage(imgs[0], 29 + avatar_shift[0], 22 + avatar_shift[1]);
    else if (pids[1] !== 0) {
      gui.drawImage(imgs[0], frame[0] * recent[0][0].dim[0], 0,
          recent[0][0].dim[0], recent[0][0].dim[1], 29 + avatar_shift[0],
          22 + avatar_shift[1], recent[0][0].dim[0], recent[0][0].dim[1]);
      if (++(frame[0]) >= recent[0][0].num) frame[0] = 0;
    }

    if (pids[2] !== 0) gui.drawImage(imgs[1], 0, 0);    // border
    else if (pids[3] !== 0) {
      gui.drawImage(imgs[1], frame[1] * recent[1][0].dim[0], 0,
          recent[1][0].dim[0], recent[1][0].dim[1], 0, 0,
          recent[1][0].dim[0], recent[1][0].dim[1]);
      if (++(frame[1]) >= recent[1][0].num) frame[1] = 0;
    }

    draw_effects(gui);
    draw_pack(gui, 1, thispack);
  }
}

function stop_anime() {
  document.getElementById("exgif").style.display = "none";
  cancelAnimationFrame(animeRef);
  animeRunning = false;
}

function export_pic(fname) {
  if (fname == null) return;
  var lnk = document.getElementById("link");
  try {
    var can = document.getElementById("gui");
    var png = can.toDataURL("image/png");
    if (typeof window.navigator.msSaveOrOpenBlob === "function") {
      var binary = atob(png.split(',')[1]);
      var arr = [];
      for (var i = 0; i < binary.length; i++) arr.push(binary.charCodeAt(i));
      var blob = new Blob([new Uint8Array(arr)], {type: 'image/png'});
      lnk.onclick = function() {
        window.navigator.msSaveOrOpenBlob(blob, fname + ".png");
      };
    }
    else {
      lnk.setAttribute("download", fname + ".png");
      lnk.href = png;
    }
    lnk.style.display = "block";
    lnk.innerHTML = "点击此处下载";
  }
  catch (err) {
    lnk.setAttribute("href", "#");
    lnk.removeAttribute("download");
    lnk.innerHTML = "请在预览图上使用右键下载";
    lnk.style.display = "block";
  }
}

function find_index(idx, pid) {
  var dom, i, l, u;
  if ((dom = document.getElementById(cls[idx] + "_" + String(pid))))
    return parseInt(dom.getAttribute("alt"));
  l = 0;
  u = data[idx].length - 1;
  while (l <= u) {
    i = parseInt((l + u) / 2);
    if (data[idx][i].pid < pid) l = i + 1;
    else if(data[idx][i].pid > pid) u = i - 1;
    else return i;
  }
  alert("错误：找不到指定的资源！");
  return -1;
}

function expand(idx) {
  var div = document.getElementsByClassName(cls[idx]);
  if (div[0].style.display != "none") {
    for (var i = 0; i < div.length; i++) {
      div[i].style.display = "none";
    }
    document.getElementById("ex_" + cls[idx]).innerHTML = "&or;展开";
  } else {
    for (var i = 0; i < div.length; i++) {
      div[i].style.display = "block";
    }
    document.getElementById("ex_" + cls[idx]).innerHTML = "&and;收起";
  }
}

function faq() {
  document.getElementById("faq").style.display = "block";
  document.getElementById("effect").style.display = "none";
  document.getElementById("table").style.display = "none";
}

function close_faq() {
  document.getElementById("faq").style.display = "none";
}

function effect() {
  document.getElementById("faq").style.display = "none";
  document.getElementById("effect").style.display = "block";
  document.getElementById("table").style.display = "none";
}

function close_effect() {
  document.getElementById("effect").style.display = "none";
}

function table(action) {
  document.getElementById("table").style.display = "none";
  document.getElementById("faq").style.display = "none";
  document.getElementById("effect").style.display = "none";
  if (action === 0) show_recent();
  else if (action === 1) show_official();
}

function close_table() {
  document.getElementById("table").style.display = "none";
}

function avatar_left() {
  if (avatar_shift[0] === -9) return;
  avatar_shift[0] -= 1;
  if (avatar_shift[0] > 0) {
    document.getElementById("avatar_left").value = "\u2190 (-" + avatar_shift[0] + ")";
    document.getElementById("avatar_right").value = "\u2192 (" + avatar_shift[0] + ")";
  }
  else if (avatar_shift[0] < 0) {
    document.getElementById("avatar_left").value = "\u2190 (" + (-avatar_shift[0]) + ")";
    document.getElementById("avatar_right").value = "\u2192 (" + avatar_shift[0] + ")";
  }
  else {
    document.getElementById("avatar_left").value = "\u2190";
    document.getElementById("avatar_right").value = "\u2192";
  }

  if (animeRunning === false) draw_pic();
}

function avatar_right() {
  if (avatar_shift[0] === 9) return;
  avatar_shift[0] += 1;
  if (avatar_shift[0] > 0) {
    document.getElementById("avatar_left").value = "\u2190 (-" + avatar_shift[0] + ")";
    document.getElementById("avatar_right").value = "\u2192 (" + avatar_shift[0] + ")";
  }
  else if (avatar_shift[0] < 0) {
    document.getElementById("avatar_left").value = "\u2190 (" + (-avatar_shift[0]) + ")";
    document.getElementById("avatar_right").value = "\u2192 (" + avatar_shift[0] + ")";
  }
  else {
    document.getElementById("avatar_left").value = "\u2190";
    document.getElementById("avatar_right").value = "\u2192";
  }

  if (animeRunning === false) draw_pic();
}

function avatar_up() {
  if (avatar_shift[1] === -9) return;
  avatar_shift[1] -= 1;
  if (avatar_shift[1] > 0) {
    document.getElementById("avatar_up").value = "\u2191 (-" + avatar_shift[1] + ")";
    document.getElementById("avatar_down").value = "\u2193 (" + avatar_shift[1] + ")";
  }
  else if (avatar_shift[1] < 0) {
    document.getElementById("avatar_up").value = "\u2191 (" + (-avatar_shift[1]) + ")";
    document.getElementById("avatar_down").value = "\u2193 (" + avatar_shift[1] + ")";
  }
  else {
    document.getElementById("avatar_down").value = "\u2193";
    document.getElementById("avatar_up").value = "\u2191";
  }

  if (animeRunning === false) draw_pic();
}

function avatar_down() {
  if (avatar_shift[1] === 9) return;
  avatar_shift[1] += 1;
  if (avatar_shift[1] > 0) {
    document.getElementById("avatar_up").value = "\u2191 (-" + avatar_shift[1] + ")";
    document.getElementById("avatar_down").value = "\u2193 (" + avatar_shift[1] + ")";
  }
  else if (avatar_shift[1] < 0) {
    document.getElementById("avatar_up").value = "\u2191 (" + (-avatar_shift[1]) + ")";
    document.getElementById("avatar_down").value = "\u2193 (" + avatar_shift[1] + ")";
  }
  else {
    document.getElementById("avatar_down").value = "\u2193";
    document.getElementById("avatar_up").value = "\u2191";
  }

  if (animeRunning === false) draw_pic();
}

function bkg_left() {
  if (bkg_shift[0] === -9) return;
  bkg_shift[0] -= 1;
  if (bkg_shift[0] > 0) {
    document.getElementById("bkg_left").value = "\u2190 (-" + bkg_shift[0] + ")";
    document.getElementById("bkg_right").value = "\u2192 (" + bkg_shift[0] + ")";
  }
  else if (bkg_shift[0] < 0) {
    document.getElementById("bkg_left").value = "\u2190 (" + (-bkg_shift[0]) + ")";
    document.getElementById("bkg_right").value = "\u2192 (" + bkg_shift[0] + ")";
  }
  else {
    document.getElementById("bkg_left").value = "\u2190";
    document.getElementById("bkg_right").value = "\u2192";
  }

  if (animeRunning === false) draw_pic();
}

function bkg_right() {
  if (bkg_shift[0] === 9) return;
  bkg_shift[0] += 1;
  if (bkg_shift[0] > 0) {
    document.getElementById("bkg_left").value = "\u2190 (-" + bkg_shift[0] + ")";
    document.getElementById("bkg_right").value = "\u2192 (" + bkg_shift[0] + ")";
  }
  else if (bkg_shift[0] < 0) {
    document.getElementById("bkg_left").value = "\u2190 (" + (-bkg_shift[0]) + ")";
    document.getElementById("bkg_right").value = "\u2192 (" + bkg_shift[0] + ")";
  }
  else {
    document.getElementById("bkg_left").value = "\u2190";
    document.getElementById("bkg_right").value = "\u2192";
  }

  if (animeRunning === false) draw_pic();
}

function bkg_up() {
  if (bkg_shift[1] === -9) return;
  bkg_shift[1] -= 1;
  if (bkg_shift[1] > 0) {
    document.getElementById("bkg_up").value = "\u2191 (-" + bkg_shift[1] + ")";
    document.getElementById("bkg_down").value = "\u2193 (" + bkg_shift[1] + ")";
  }
  else if (bkg_shift[1] < 0) {
    document.getElementById("bkg_up").value = "\u2191 (" + (-bkg_shift[1]) + ")";
    document.getElementById("bkg_down").value = "\u2193 (" + bkg_shift[1] + ")";
  }
  else {
    document.getElementById("bkg_down").value = "\u2193";
    document.getElementById("bkg_up").value = "\u2191";
  }

  if (animeRunning === false) draw_pic();
}

function bkg_down() {
  if (bkg_shift[1] === 9) return;
  bkg_shift[1] += 1;
  if (bkg_shift[1] > 0) {
    document.getElementById("bkg_down").value = "\u2193 (-" + bkg_shift[1] + ")";
    document.getElementById("bkg_up").value = "\u2191 (" + bkg_shift[1] + ")";
  }
  else if (bkg_shift[1] < 0) {
    document.getElementById("bkg_down").value = "\u2193 (" + (-bkg_shift[1]) + ")";
    document.getElementById("bkg_up").value = "\u2191 (" + bkg_shift[1] + ")";
  }
  else {
    document.getElementById("bkg_down").value = "\u2193";
    document.getElementById("bkg_up").value = "\u2191";
  }

  if (animeRunning === false) draw_pic();
}

function avatar_reset() {
  avatar_shift[0] = 0;
  avatar_shift[1] = 0;
  document.getElementById("avatar_left").value = "\u2190";
  document.getElementById("avatar_up").value = "\u2191";
  document.getElementById("avatar_right").value = "\u2192";
  document.getElementById("avatar_down").value = "\u2193";
  if (animeRunning === false) draw_pic();
}

function bkg_reset() {
  bkg_shift[0] = 0;
  bkg_shift[1] = 0;
  document.getElementById("bkg_left").value = "\u2190";
  document.getElementById("bkg_up").value = "\u2191";
  document.getElementById("bkg_right").value = "\u2192";
  document.getElementById("bkg_down").value = "\u2193";
  if (animeRunning === false) draw_pic();
}

function apply_effect() {
  var i, j, c;
  var dom = document.getElementById("vip_status");
  vip = dom.options[dom.selectedIndex].value;
  dom = document.getElementById("vip_level");
  viplv = dom.options[dom.selectedIndex].value;

  nick = document.getElementById("nick").value;
  if (nick == "") {
    effect_flag = 0;
    effect_info.innerHTML = "昵称不能为空!";
    effect_info.style.display = "block";
    return;
  }
  nicklen = 0;
  for (i = 0; i < nick.length; i++) {
    c = nick.charCodeAt(i);
    if ((c >= 32 && c <= 127) || (c >= 65377 && c <= 65439)) {
      nicklen++;
    }
    else nicklen += 2;
  }
  if (nicklen > 12) {
    effect_flag = 0;
    effect_info.innerHTML = "昵称长度不能大于12!（中文字符长度为2）";
    effect_info.style.display = "block";
    return;
  }

  dom = document.getElementById("sex");
  sex = dom.options[dom.selectedIndex].value;
  lv = document.getElementById("level").value;
  if ((!/^\d+$/.test(lv)) || lv <= 0 || lv > 200) {
    effect_flag = 0;
    effect_info.innerHTML = "等级设置不正确!";
    effect_info.style.display = "block";
    return;
  }
  lv = lv.replace(/^0+/, '').toString();

  dom = document.getElementById("pack1");
  pack[0] = dom.options[dom.selectedIndex].value;
  dom = document.getElementById("pack2");
  pack[1] = dom.options[dom.selectedIndex].value;
  dom = document.getElementById("pack3");
  pack[2] = dom.options[dom.selectedIndex].value;
  dom = document.getElementById("pack4");
  pack[3] = dom.options[dom.selectedIndex].value;
  dom = document.getElementById("pack5");
  pack[4] = dom.options[dom.selectedIndex].value;
  for (i = 0; i < 4; i++) {
    for (j = i + 1; j < 5; j++) {
      if (pack[i] == pack[j]) {
        effect_flag = 0;
        effect_info.innerHTML = "武将灯不能有重复!";
        effect_info.style.display = "block";
        return;
      }
    }
  }
  dom = document.getElementById("packnum");
  packown = dom.options[dom.selectedIndex].value;

  dom = document.getElementById("bkg_color");
  bkgc = dom.options[dom.selectedIndex].value;

  var new_tid = "";
  var my_title = document.getElementById("zhangong").value;
  if (my_title.length === 1) {
    effect_flag = 0;
    effect_info.innerHTML = "请至少输入2个\"战功称号\"字符!";
    effect_info.style.display = "block";
    return;
  }
  var my_tts = new Array();
  var my_tids = new Array();
  new_tid = "";
  var tt, opt, txt;
  if (my_title.length !== 0) {
    for (i = 0; i < title.length; i++) {
      if (my_title === title[i].txt) {
        new_tid = title[i].id;
        break;
      }
      else if (title[i].txt.indexOf(my_title) >= 0) {
        my_tts.push(title[i].txt);
        my_tids.push(title[i].id);
      }
    }
  }
  if (my_title.length === 0) {          // no input
    if (titleid !== "") {
      dom = document.getElementById("title_hidden");
      dom.removeChild(document.getElementById("hidden_title_" + titleid));
    }
    titleid = "";
    effect_flag = 1;
    effect_info.style.display = "none";
    offset = 0;
    if (animeRunning === false) draw_pic();
  }
  else if (new_tid === "") {            // has input, title not found
    effect_flag = 0;
    var sel = document.getElementById("title_select");
    for (i = 0; i < my_tids.length; i++) {
      opt = document.createElement("option");
      opt.setAttribute("value", my_tids[i] + "." + my_tts[i]);
      txt = document.createTextNode(my_tts[i]);
      opt.appendChild(txt);
      sel.appendChild(opt);
    }
    document.getElementById("zhangong").style.display = "none";
    sel.style.display = "inline";
    sel.selectedIndex = 0;
    sel.value = "-2";
    effect_info.innerHTML = "请选择查询到的战功称号";
    effect_info.style.display = "block";
  }
  else {                                // new title found
    effect_flag = 1;
    effect_info.style.display = "none";
    offset = 0;
    if (titleid !== new_tid) {
      if (animeRunning === true) stop_anime();
      dom = document.getElementById("title_hidden");
      if (titleid !== "")
        dom.removeChild(document.getElementById("hidden_title_" + titleid));
      titleid = new_tid;
      var url = tdir + "/" + titleid + ".png";
      var img = document.createElement("img");
      img.setAttribute("src", url);
      img.setAttribute("id", "hidden_title_" + titleid);
      dom.appendChild(img);
      img.onload = draw_show;
      img.onerror = function() {
        alert("无法加载指定资源，请稍后再试！");
      };
    }
    else if (animeRunning === false) draw_pic();
  }
}

function clear_effect() {
  effect_flag = 0;
  effect_info.style.display = "none";
  if (pids[1] === 0 && pids[3] === 0 && pids[5] === 0) draw_pic();
}

function retry() {
  var sel = document.getElementById("title_select");
  var childs = sel.childNodes;
  var len = childs.length;
  for (var i = 0; i < len; i++) {
    if (childs[i].nodeType == 1) {
      if (childs[i].value != "-1" && childs[i].value != "-2") {
        sel.removeChild(childs[i]);
        i--;
        len--;
      }
    }
  }

  sel.style.display = "none";
  document.getElementById("zhangong").style.display = "inline";
}

function set_tid(tid_and_title) {
  retry();

  if (tid_and_title != "-1" && tid_and_title != "-2") {
    document.getElementById("zhangong").value = tid_and_title.split(".")[1];
    apply_effect();
  }
}

function apply_winrun() {
  if (document.getElementById("winrun").checked == true) {
    if (document.getElementById("winrunrate").checked == true) {
      winrate = document.getElementById("winrate").value;
      runrate = document.getElementById("runrate").value;
      if ((!/^[0-9]+\.?[0-9]*$/.test(winrate))
          || winrate < 0 || winrate > 100) {
        winrun_flag = 0;
        winrun_info.innerHTML = "胜率设置不正确!";
        winrun_info.style.display = "block";
        return;
      }
      if ((!/^[0-9]+\.?[0-9]*$/.test(runrate))
          || runrate < 0 || runrate > 100) {
        winrun_flag = 0;
        winrun_info.innerHTML = "逃跑率设置不正确!";
        winrun_info.style.display = "block";
        return;
      }

      winrun_info.style.display = "none";
      winrun_flag = 2;
    }
    else {
      winrun_info.style.display = "none";
      winrun_flag = 1;
    }
  }
  else {
    winrun_info.style.display = "none";
    winrun_flag = 0;
  }

  if (pids[1] === 0 && pids[3] === 0 && pids[5] === 0) draw_pic();
}

function clear_winrun() {
  winrun_flag = 0;
  winrun_info.style.display = "none";
  if (pids[1] === 0 && pids[3] === 0 && pids[5] === 0) draw_pic();
}

function draw_effects(gui) {
  if (effect_flag === 1) {
    var nickwidth = nicklen * 6;
    if (offset === 0) {
      offset = parseInt((110 - nickwidth - lv.length * 7) / 2 + 21);
    }
    // nickname
    gui.font = "12px " + songti;
    gui.lineWidth = 1;
    gui.textBaseline="top";
    gui.fillStyle = "rgba(0,0,0,0.5)";
    gui.fillText(nick, offset - 1, 3);
    gui.fillText(nick, offset - 1, 5);
    gui.fillText(nick, offset + 1, 3);
    gui.fillText(nick, offset + 1, 5);
    gui.fillStyle = "black";
    gui.fillText(nick, offset, 3);
    gui.fillText(nick, offset, 5);
    gui.fillText(nick, offset - 1, 4);
    gui.fillText(nick, offset + 1, 4);
    gui.fillStyle = "#00DD2C";
    gui.fillText(nick, offset, 4);
    // sex icon
    var sexicon = document.getElementById("img_" + sex);
    gui.drawImage(sexicon, offset + nickwidth - 1, 3);
    // level
    gui.drawImage(document.getElementById("img_LV"), offset + nickwidth + 11, 6);
    var lvnum = document.getElementById("img_LVNumber");
    var thischar, pos;
    for (var i = 0; i < lv.length; i++) {
      thischar = lv.charAt(i);
      if (thischar == 0) pos = 9;
      else pos = +thischar - 1;
      gui.drawImage(lvnum, pos * 7, 0, 7, 10, offset + nickwidth + i * 7 + 22, 6, 7, 10);
    }
    // vip
    var vipic;
    if (vip == 1) {             // color
      vipic = document.getElementById("img_" + viplv);
      if (viplv == "v10") {
        gui.drawImage(vipic, 30, 15);
        gui.drawImage(document.getElementById("img_sha_v10"), -4, -3);
      }
      else {
        gui.drawImage(vipic, 23, 15);
        gui.drawImage(document.getElementById("img_sha"), 0, -3);
      }
    }
    else if (vip == 2) {        // gray
      vipic = document.getElementById("img_" + viplv + "_bw");
      if (viplv == "v10") {
        gui.drawImage(vipic, 30, 15);
        gui.drawImage(document.getElementById("img_sha_v10_bw"), -4, -3);
      }
      else {
        gui.drawImage(vipic, 23, 15);
        gui.drawImage(document.getElementById("img_sha_bw"), 0, -3);
      }
    }
    // title
    if (titleid != "")
      gui.drawImage(document.getElementById("hidden_title_" + titleid), 13, 32, 18, 108);
  } // if (effect_flag === 1)

  if (winrun_flag > 0) {
    gui.drawImage(document.getElementById("img_winRateAndRunRate"), 2, 147);
    if (winrun_flag == 2) {
      var wintxt = Number(winrate).toFixed(1) + "%";
      var runtxt = Number(runrate).toFixed(1) + "%";
      gui.font = "12px " + songti;
      gui.fillStyle = "black";
      gui.textBaseline="top";
      gui.fillText(wintxt, 57, 153);
      if (runrate >= 2) gui.fillStyle = "red";
      gui.fillText(runtxt, 57, 173);
    }
  } // if (winrun_flag > 0)
}

function draw_pack(gui, flag, thispack) {
  if (effect_flag !== 1) return;
  var i, j, packimg;
  if (flag == 0) {
    var k = parseInt(Math.random()*8);
    for (i = 0; i < packown; i++) {
      j = pack[i];
      packimg = document.getElementById("img_" + packname[j]);
      gui.drawImage(packimg, k * packw[j], 0, packw[j], packh[j],
          i * 24 + packx[j], packy[j], packw[j], packh[j]);
    }
  }
  else {
    for (i = 0; i < packown; i++) {
      j = pack[i];
      packimg = document.getElementById("img_" + packname[j]);
      gui.drawImage(packimg, thispack[j] * packw[j], 0, packw[j], packh[j],
          i * 24 + packx[j], packy[j], packw[j], packh[j]);
      if ((++thispack[j]) >= packnum[j] - 1) thispack[j] = 0;
    }
  }

  for (i = packown; i < 5; i++) {
    j = pack[i];
    packimg = document.getElementById("img_" + packname[j]);
    gui.drawImage(packimg, (packnum[j] - 1) * packw[j], 0, packw[j], packh[j],
        i * 24 + packx[j], packy[j], packw[j], packh[j]);
  }
  gui.drawImage(document.getElementById("img_arrow"), 119, 187);
}

function mypause() {
  var btn = document.getElementById("mypause");
  if (btn.innerHTML === "暂停") {
    stop_anime();
    export_pic("download_frame");
    btn.innerHTML = "继续";
  }
  else {
    document.getElementById("link").style.display = "none";
    document.getElementById("exgif").style.display = "block";
    animeRunning = true;
    last_time = performance.now()
    animeRef = requestAnimationFrame(draw_frame);
    btn.innerHTML = "暂停";
  }
}

function show_recent() {
  var tab = document.getElementById("item_table");
  var idx, pid, src;
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < max_table; j++) {
      pid = recent[i][j].pid;
      if (pid === 0) {
        tab.rows[i * 2].cells[j + 1].innerHTML = "";
        tab.rows[i * 2 + 1].cells[j].innerHTML = "";
      }
      else {
        idx = recent[i][j].tid;
        src = predir[idx] + "/" + String(pid) + suf[idx] + ".png";
        tab.rows[i * 2].cells[j + 1].innerHTML = "<img src=\"" + src + "\" onclick=draw(" + String(idx) + "," + String(pid) + ")></img>";
        if (idx % 2 === 0)
          tab.rows[i * 2 + 1].cells[j].innerHTML = recent[i][j].txt;
        else
          tab.rows[i * 2 + 1].cells[j].innerHTML = "<span>" + recent[i][j].txt + "</span>";
      }
    }
  }
  document.getElementById("table").style.display = "block";
}

function encode() {
  var info = document.getElementById("code_info");
  if (pids[0] === 0 && pids[1] === 0 && pids[2] === 0 && pids[3] === 0 && pids[4] === 0 && pids[5] === 0) {
    info.innerHTML = "当前没有任何搭配";
    info.style.display = "block";
    return;
  }
  info.style.display = "none";
  var c = 0, code = "";
  var idx = new Array(0,0,0);
  if (pids[0] !== 0) {
    c += 9;
    code = ("0000" + pids[0]).slice(-5);
  }
  else if (pids[1] !== 0) {
    c += 18;
    code = ("0000" + pids[1]).slice(-5);
  }
  else code = "00000";
  if (pids[2] !== 0) {
    c += 3;
    code = code + ("000" + pids[2]).slice(-4);
  }
  else if (pids[3] !== 0) {
    c += 6;
    code = code + ("000" + pids[3]).slice(-4);
  }
  else code = code + "0000";
  if (pids[4] !== 0) {
    c += 1;
    code = code + ("000" + pids[4]).slice(-4);
  }
  else if (pids[5] !== 0) {
    c += 2;
    code = code + ("000" + pids[5]).slice(-4);
  }
  else code = code + "0000";
  code = String.fromCharCode(96 + c) + parseInt(code).toString(36);
  document.getElementById("get_code").value = code;
  info.innerHTML = '<a id="code_link" href="' + online_url + 'preview.html?' + code + '" target="_blank">线上预览链接</a>';
  info.style.display = "block";
}

function decode() {
  var info = document.getElementById("code_info");
  var code = document.getElementById("get_code").value;
  if (!/^[a-z][0-9a-z]+$/.test(code)) {
    info.innerHTML = "特征码包含非法字符";
    info.style.display = "block";
    return;
  }
  var c = code.charCodeAt(0) - 96;
  var num = ("000000000000" + parseInt(code.slice(1), 36)).slice(-13);
  var idx = new Array(-1,-1,-1);
  var pid = new Array(0,0,0);
  pid[2] = parseInt(num.slice(-4));
  var idx2 = c % 3;
  if (idx2 !== 0) idx[2] = 3 + idx2;
  c = (c - idx2) / 3;
  pid[1] = parseInt(num.slice(5,9));
  idx2 = c % 3;
  if (idx2 !== 0) idx[1] = 1 + idx2;
  c = (c - idx2) / 3;
  pid[0] = parseInt(num.slice(0,5));
  idx2 = c % 3;
  if (idx2 !== 0) idx[0] = idx2 - 1;
  for (c = 0; c < 3; c++) {
    if (pid[c] !== 0 && find_index(idx[c], pid[c]) < 0) {
      info.innerHTML = "找不到指定的资源";
      info.style.display = "block";
      return;
    }
  }

  info.style.display = "none";
  var dom;
  loaded = 0;
  var total = 0;

  for (c = 0; c < 3; c++) {
    if (pid[c] !== 0) total++;
    if ((dom = document.getElementById("hidden_" + cls[idx[c]] + "_" + pid[c]))) total--;
  }
  for (c = 0; c < N; c++) {
    if (pids[c] !== 0 && (dom = document.getElementById(cls[c] + "_" + pids[c]))) dom.style.borderColor = "white";
    pids[c] = 0;
  }
  for (c = 0; c < 3; c++) {
    idx2 = idx[c];
    pids[idx2] = pid[c];
    if (pid[c] === 0) continue;
    if ((dom = document.getElementById(cls[idx2] + "_" + pid[c]))) dom.style.borderColor = "red";
    add_recent(idx2, pid[c], total);
  }
}

function pageKey(idx, evt) {
  var e = evt || window.event;
  if (e.keyCode === 13) {
    var num = document.getElementById(cls[idx] + "_page").value;
    if ((!/^\d+$/.test(num)) || num <= 0 || num > 99) document.getElementById(cls[idx] + "_page").value = "";
    else show_list(idx, num - 1);
  }
}

function search(idx, evt) {
  var e = evt || window.event;
  var input = document.getElementById(cls[idx] + "_search");
  input.style.color = "black";
  if (input.value === "至少2个字符" || input.value === "搜索结果为空") input.value = "";
  if (e.keyCode === 13) {
    var str = input.value;
    if (str.length <= 1) {
      input.value = "至少2个字符";
      input.style.color = "red";
      return;
    }
    var i;
    var res = [];
    for (i = 0; i < data[idx].length; i++)
      if (data[idx][i].txt.indexOf(str) >= 0) res.push(i);
    if (res.length === 0) {
      input.value = "搜索结果为空";
      input.style.color = "red";
      return;
    }
    input.value = "";
    var info = document.getElementById(cls[idx] + "_result");
    info.innerHTML = str;
    info.style.borderWidth = "1px";
    info.style.backgroundColor = "rgba(255,255,255,0.5)";
    document.getElementById(cls[idx] + "_close").innerHTML = "&times;";

    var pdiv = document.getElementById(cls[idx] + "_div");
    var pid, url, div, img, label, text;
    while (pdiv.lastElementChild.getAttribute("class") === cls[idx]) pdiv.removeChild(pdiv.lastElementChild);
    for (i = 0; i < res.length; i++) {
      pid = String(data[idx][res[i]].pid);
      url = predir[idx] + "/" + pid + suf[idx] + ".png";
      div = document.createElement("div");
      img = document.createElement("img");
      img.setAttribute("src", url);
      img.setAttribute("onclick", "draw(" + String(idx) + "," + pid + ")");
      img.setAttribute("onerror", "this.onclick=''");
      img.setAttribute("id", cls[idx] + "_" + pid);
      img.setAttribute("alt", String(res[i]));
      div.setAttribute("class", cls[idx]);
      pdiv.appendChild(div);
      label = document.createElement("p");
      text = document.createTextNode(data[idx][res[i]].txt);
      label.appendChild(text);
      label.setAttribute("class", "label");
      div.appendChild(img);
      div.appendChild(label);
      if (String(pids[idx]) === pid) img.style.borderColor = "red";
    }
    document.getElementById("ex_" + cls[idx]).innerHTML = "&and;收起";
  }
}

function close_search(idx) {
  show_list(idx, pages[idx]);
}

function codeKey(evt) {
  var e = evt || window.event;
  if (e.keyCode === 13) {
    var num = document.getElementById("get_code").value;
    if (num.length === 0) return;
    else decode();
  }
}

function show_official() {
  var suite = new Array("","","");
  if (pids[0] === 0 && pids[1] === 0 && pids[2] === 0 && pids[3] === 0 && pids[4] === 0 && pids[5] === 0) {
    alert("当前没有任何搭配");
    return;
  }

  var tab = document.getElementById("item_table");
  var idx, pid, src, res, num, i, j, ids, ii;
  if (pids[0] !== 0 || pids[1] !== 0) suite[0] = recent[0][0].suite;
  if (pids[2] !== 0 || pids[3] !== 0) suite[1] = recent[1][0].suite;
  if (pids[4] !== 0 || pids[5] !== 0) suite[2] = recent[2][0].suite;
  if (suite[0] === "" && suite[1] === "" && suite[2] === "") {
    alert("当前搭配不存在官方套装");
    return;
  }

  for (i = 0; i < 3; i++) {
    if (suite[i] !== "") {
      res = suite[i].split(";");
      num = res.length;
      for (j = 0; j < max_table; j++) {
        if (j >= num) {
          tab.rows[i * 2].cells[j + 1].innerHTML = "";
          tab.rows[i * 2 + 1].cells[j].innerHTML = "";
        }
        else {
          ids = res[j].split(",");
          if (ids.length !== 2) {
            alert("官方套装配置有误");
            return;
          }
          idx = ids[0];
          pid = ids[1];
          src = predir[idx] + "/" + String(pid) + suf[idx] + ".png";
          tab.rows[i * 2].cells[j + 1].innerHTML = "<img src=\"" + src + "\" onclick=draw(" + String(idx) + "," + String(pid) + ")></img>";
          ii = find_index(idx, pid);
          if (ii < 0) {
            alert("官方套装配置有误");
            return;
          }
          if (idx % 2 === 0)
            tab.rows[i * 2 + 1].cells[j].innerHTML = data[idx][ii].txt;
          else
            tab.rows[i * 2 + 1].cells[j].innerHTML = "<span>" + data[idx][ii].txt + "</span>";
        }
      }
    }
    else {
      for (j = 0; j < max_table; j++) {
        tab.rows[i * 2].cells[j + 1].innerHTML = "";
        tab.rows[i * 2 + 1].cells[j].innerHTML = "";
      }
    }
  }
  document.getElementById("table").style.display = "block";
}

function export_gif() {
  var fname = "download";
  if (pids[1] != 0) fname = pids[1];
  else if (pids[2] != 0) fname = pids[2];
  else if (pids[3] != 0) fname = pids[3];
  else if (pids[4] != 0) fname = pids[4];
  else if (pids[5] != 0) fname = pids[5];

  var gif = new GIF({
    workers: 2,
    quality: 10,
    width: 148,
    height: 208,
    background: "rgba(255,255,255,0)"
  });

  var ctx = document.getElementById("hgui").getContext("2d");
  var frm = new Array(0,0,0);
  var tspack = new Array(thispack.length);
  for (i = 0; i < thispack.length; i++) tspack[i] = 0;

  var i, n;
  var nfrm = 10;
  for (i = 0; i < 3; i++)
    if (nfrm < recent[i][0].num) nfrm = recent[i][0].num;

  for (n = 0; n < nfrm; n++) {
    ctx.clearRect(0, 0, 148, 208);
    if (effect_flag === 1 && bkgc == 1) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 148, 208);
    }

    if (pids[4] !== 0)          // background
      ctx.drawImage(imgs[2], 29 + bkg_shift[0], 22 + bkg_shift[1]);
    else if (pids[5] !== 0) {
      ctx.drawImage(imgs[2], frm[2] * recent[2][0].dim[0], 0,
          recent[2][0].dim[0], recent[2][0].dim[1], 29 + bkg_shift[0],
          22 + bkg_shift[1], recent[2][0].dim[0], recent[2][0].dim[1]);
      if (++(frm[2]) >= recent[2][0].num) frm[2] = 0;
    }

    if (pids[0] !== 0)          // avatar
      ctx.drawImage(imgs[0], 29 + avatar_shift[0], 22 + avatar_shift[1]);
    else if (pids[1] !== 0) {
      ctx.drawImage(imgs[0], frm[0] * recent[0][0].dim[0], 0,
          recent[0][0].dim[0], recent[0][0].dim[1], 29 + avatar_shift[0],
          22 + avatar_shift[1], recent[0][0].dim[0], recent[0][0].dim[1]);
      if (++(frm[0]) >= recent[0][0].num) frm[0] = 0;
    }

    if (pids[2] !== 0) ctx.drawImage(imgs[1], 0, 0);    // border
    else if (pids[3] !== 0) {
      ctx.drawImage(imgs[1], frm[1] * recent[1][0].dim[0], 0,
          recent[1][0].dim[0], recent[1][0].dim[1], 0, 0,
          recent[1][0].dim[0], recent[1][0].dim[1]);
      if (++(frm[1]) >= recent[1][0].num) frm[1] = 0;
    }

    draw_effects(ctx);
    draw_pack(ctx, 1, tspack);

    try {
      gif.addFrame(ctx, {copy: true, delay: 100});
    }
    catch (err) {
      alert("您的浏览器不支持导出动图");
      break;
    }
  }

  gif.on('finished', function(blob) {
    var lnk = document.getElementById("link");
    try {
      if (typeof window.navigator.msSaveOrOpenBlob === "function") {
        lnk.onclick = function() {
          window.navigator.msSaveOrOpenBlob(blob, fname + ".gif");
        };
      }
      else {
        lnk.setAttribute("download", fname + ".gif");
        lnk.href = URL.createObjectURL(blob);
      }
      document.getElementById("exgif").style.display = "none";
      lnk.style.display = "block";
      lnk.innerHTML = "点击此处下载";
    }
    catch (err) {
      alert("您的浏览器不支持导出动图");
    }

//    window.open(URL.createObjectURL(blob));
  });

  try {
    gif.render();
  }
  catch (err) {
    alert("您的浏览器不支持导出动图");
  }
}

