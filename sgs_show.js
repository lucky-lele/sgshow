var N = 3;
var cls = new Array("avatar","backgd","border");
var pids = new Array(0,0,0);
var pages = new Array(0,0,0);

function imgData(pid, txt) {
  this.pid = pid;
  this.txt = txt;
}
function imgCache() {
  this.pid = 0;
  this.txt = "";
}

var max_table = 9;
var loaded = 0;
var data = new Array(N);
var recent = new Array(3);
var imgs = new Array(3);
for (var i = 0; i < N; i++) data[i] = [];
for (var i = 0; i < 3; i++) {
  recent[i] = new Array(max_table);
  for (var j = 0; j < max_table; j++) recent[i][j] = new imgCache();
}


window.onload = function() {
  if (!(window.XMLHttpRequest)) return;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", "show.xml", false);
  xmlhttp.send();
  var xml = xmlhttp.responseXML;
  var info = xml.getElementsByTagName("s");
  var i, attr, tid, pid, txt;

  for (i = 0; i < info.length; i++) {
    attr = info[i].attributes;
    tid = parseInt(attr.getNamedItem("t").nodeValue);
    pid = parseInt(attr.getNamedItem("i").nodeValue);
    txt = attr.getNamedItem("n").nodeValue;
    data[tid].push(new imgData(pid, txt));
  }

  for (i = 0; i < N; i++) show_list(i, 0);
  document.getElementById("link").style.display = "none";
  document.getElementById("status").style.display = "none";
};

function show_list(idx, p) {
  var nmax = new Array(91,65,45);
  var page = p;
  switch (p) {
    case -3:
      if (pages[idx] > 0) page = pages[idx] - 1;
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
    url = String(idx) + "/" + pid + ".png";
    div = document.createElement("div");
    img = document.createElement("img");
    img.setAttribute("src", url);
    img.setAttribute("onclick", "draw(" + String(idx) + "," + pid + ")");
    img.setAttribute("onerror", "this.onclick=''");
    img.setAttribute("id", cls[idx] + "_" + pid);
    div.setAttribute("class", cls[idx]);
    pdiv.appendChild(div);
    label = document.createElement("p");
    text = document.createTextNode(data[idx][j].txt);
    label.appendChild(text);
    label.setAttribute("class", "label");
    div.appendChild(img);
    div.appendChild(label);
  }
  document.getElementById("ex_" + cls[idx]).innerHTML = "&and;收起";
}

function draw(idx, pid) {
  var dom;
  if (pids[idx] !== 0 && (dom = document.getElementById(cls[idx] + "_" + pids[idx])))
    dom.style.borderColor = "white";
  if (pids[idx] === pid) pids[idx] = 0;
  else {
    pids[idx] = pid;
    if ((dom = document.getElementById(cls[idx] + "_" + pid)))
      dom.style.borderColor = "red";
  }

  loaded = 0;
  document.getElementById("faq").style.display = "none";
  document.getElementById("table").style.display = "none";
  document.getElementById("code_info").style.display = "none";
  add_recent(idx, pid, 1);
}

function add_recent(idx, pid, num) {
  var tmp = new imgCache();
  var i;
  if (pids[idx] === 0) draw_pic();
  else {
    for (i = 0; i < max_table; i++) {
      if (recent[idx][i].pid === pid) {
        tmp.pid = pid;
        tmp.txt = recent[idx][i].txt;
        break;
      }
    }
    if (tmp.pid !== 0) {
      for (var j = i; j > 0; j--) {
        recent[idx][j].pid = recent[idx][j - 1].pid;
        recent[idx][j].txt = recent[idx][j - 1].txt;
      }
      recent[idx][0].pid = tmp.pid;
      recent[idx][0].txt = tmp.txt;
      imgs[idx] = document.getElementById("hidden_" + cls[idx] + "_" + pid);
      draw_pic();
      return;
    }
    tmp.pid = recent[idx][max_table - 1].pid;
    for (i = max_table - 1; i > 0; i--) {
      recent[idx][i].pid = recent[idx][i - 1].pid;
      recent[idx][i].txt = recent[idx][i - 1].txt;
    }
    recent[idx][0].pid = pid;
    recent[idx][0].txt = find_label(idx, pid);

    var hid = document.getElementById(cls[idx] + "_hidden");
    if (tmp.pid !== 0) hid.removeChild(document.getElementById("hidden_" + cls[idx] + "_" + tmp.pid));
    var url = String(idx) + "f/" + String(pid) + ".png";
    var img = document.createElement("img");
    img.setAttribute("src", url);
    img.setAttribute("id", "hidden_" + cls[idx] + "_" + pid);
    hid.appendChild(img);
    img.onload = function() {
      imgs[idx] = img;
      if (++loaded >= num) draw_pic();
    };
    img.onerror = function() {
      alert("无法加载指定资源，请稍后再试！");
    };
  }
}

function draw_pic() {
  var gui = document.getElementById("gui").getContext("2d");
  gui.clearRect(0, 0, 148, 208);
  if (pids[1] !== 0) gui.drawImage(imgs[1], 29, 22);
  if (pids[0] !== 0) gui.drawImage(imgs[0], 29, 22);
  if (pids[2] !== 0) gui.drawImage(imgs[2], 0, 0);

  if (pids[0] !== 0 || pids[1] !== 0 || pids[2] !== 0) {
    var fname = "download";
    if (pids[0] != 0) fname = pids[0];
    else if (pids[2] != 0) fname = pids[2];
    else if (pids[4] != 0) fname = pids[4];
    export_pic(fname);
  }
  else document.getElementById("link").style.display = "none";
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
    link.removeAttribute("download");
    lnk.innerHTML = "请在预览图上使用右键下载";
    lnk.style.display = "block";
  }
}

function find_label(idx, pid) {
  var i, l, u;
  if ((i = document.getElementById(cls[idx] + "_" + String(pid))))
    return i.parentNode.lastElementChild.innerHTML;
  l = 0;
  u = data[idx].length - 1;
  while (l <= u) {
    i = parseInt((l + u) / 2);
    if (data[idx][i].pid < pid) l = i + 1;
    else if(data[idx][i].pid > pid) u = i - 1;
    else return data[idx][i].txt;
  }
  return "";
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
  document.getElementById("table").style.display = "none";
}

function close_faq() {
  document.getElementById("faq").style.display = "none";
}

function table(action) {
  document.getElementById("faq").style.display = "none";
  if (action === 0) show_recent();
  document.getElementById("table").style.display = "block";
}

function close_table() {
  document.getElementById("table").style.display = "none";
}

function show_recent() {
  var tab = document.getElementById("item_table");
  var pid, src;
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < max_table; j++) {
      pid = recent[i][j].pid;
      if (pid === 0) {
        tab.rows[i * 2].cells[j + 1].innerHTML = "";
        tab.rows[i * 2 + 1].cells[j].innerHTML = "";
      }
      else {
        src = String(i) + "/" + String(pid) + ".png";
        tab.rows[i * 2].cells[j + 1].innerHTML = "<img src=\"" + src + "\" onclick=draw(" + String(i) + "," + String(pid) + ")></img>";
        tab.rows[i * 2 + 1].cells[j].innerHTML = recent[i][j].txt;
      }
    }
  }
}

function encode() {
  var info = document.getElementById("code_info");
  if (pids[0] === 0 && pids[1] === 0 && pids[2] === 0) {
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
  else code = "00000";
  if (pids[2] !== 0) {
    c += 3;
    code = code + ("000" + pids[2]).slice(-4);
  }
  else code = code + "0000";
  if (pids[1] !== 0) {
    c += 1;
    code = code + ("000" + pids[1]).slice(-4);
  }
  else code = code + "0000";
  code = String.fromCharCode(96 + c) + parseInt(code).toString(36);
  document.getElementById("get_code").value = code;
  info.innerHTML = '<a href="preview.html?' + code + '" target="_blank">线上预览链接</a>';
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
    if (idx[c] === 1 || idx[c] === 3 || idx[c] === 5) {
      info.innerHTML = "线上版暂不支持动态部件";
      info.style.display = "block";
      return;
    }
    else if (idx[c] === 4) {
      idx[c] = 1;
      continue;
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
      url = String(idx) + "/" + pid + ".png";
      div = document.createElement("div");
      img = document.createElement("img");
      img.setAttribute("src", url);
      img.setAttribute("onclick", "draw(" + String(idx) + "," + pid + ")");
      img.setAttribute("onerror", "this.onclick=''");
      img.setAttribute("id", cls[idx] + "_" + pid);
      div.setAttribute("class", cls[idx]);
      pdiv.appendChild(div);
      label = document.createElement("p");
      text = document.createTextNode(data[idx][res[i]].txt);
      label.appendChild(text);
      label.setAttribute("class", "label");
      div.appendChild(img);
      div.appendChild(label);
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

