"use strict";
var idx = new Array(-1,-1,-1);
var pid = new Array(3);
var imgs = new Array(3);
var loaded = 0;
var suffix = new Array("","","1","1","","");
var dim = [[0,0],[0,0],[0,0]];
var frms = [0, 0, 0]
var nfrm = [1, 1, 1]
var last, elapsed, animeRef;
var fps_delay = 100;

window.onload = function() {
  var can = document.getElementById("gui");
  if (!(can.getContext && can.getContext('2d'))) {
    document.write("<h1>不受支持的浏览器</h1>");
    return;
  }

  var url = window.location.href.split("?");
  if (url.length !== 2) {
    document.write("<h1>非法链接</h1>");
    return;
  }
  var code = url[1];
  if (!/^[a-z][0-9a-z]+$/.test(code)) {
    document.write("<h1>特征码包含非法字符</h1>");
    return;
  }
  var c = code.charCodeAt(0) - 96;
  var num = ("000000000000" + parseInt(code.slice(1), 36)).slice(-13);
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

  var flag = [0, 0, 0];
  for (c = 0; c < 3; c++) {
    if (idx[c] % 2 === 1) flag[c] = 1;
  }
  if (flag[0] === 1 || flag[1] === 1 || flag[2] === 1) {
    if (!(window.XMLHttpRequest)) {
      document.write("<h1>不受支持的浏览器</h1>");
      return;
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "show.xml", false);
    xmlhttp.send();
    var xml = xmlhttp.responseXML;
    var info = xml.getElementsByTagName("s");
    var attr, tid, id, ii;
    for (c = 0; c < info.length; c++) {
      attr = info[c].attributes;
      tid = parseInt(attr.getNamedItem("t").nodeValue);
      if (tid % 2 === 0) continue;
      ii = parseInt(tid / 2);
      if (flag[ii] === 1) {
        id = parseInt(attr.getNamedItem("i").nodeValue);
        if (pid[ii] === id) {
          nfrm[ii] = parseInt(attr.getNamedItem("f").nodeValue);
          flag[ii] = 0;
        }
      }
    }
    if (flag[0] === 1 || flag[1] === 1 || flag[2] === 1) {
      document.write("<h1>找不到指定的资源</h1>");
      return;
    }
  }

  var url;
  var total = 0;
  loaded = 0;
  for (c = 0; c < 3; c++) if (pid[c] !== 0) total++;
  for (c = 0; c < 3; c++) {
    if (pid[c] === 0) continue;
    idx2 = idx[c];
    if (idx2 % 2 === 0)
      url = String(idx2) + "f/" + String(pid[c]) + suffix[idx2] + ".png";
    else
      url = String(idx2) + "f/" + String(pid[c]) + suffix[idx2] + "_full.png";
    load_image(idx2, url, total);
  }
};

function load_image(id, url, total) {
  var img = document.createElement("img");
  var hid = document.getElementById("hidden");
  var i = parseInt(id / 2);
  img.setAttribute("src", url);
  img.setAttribute("id", String(id) + String(pid[i]));
  hid.appendChild(img);
  img.onload = function() {
    imgs[i] = img;
    if (id % 2 === 1) {
      dim[i][0] = parseInt(img.naturalWidth / nfrm[i]);
      dim[i][1] = img.naturalHeight;
    }
    if (++loaded >= total) draw();
  };
  img.onerror = function() {
    document.write("<h1>资源加载失败</h1>");
  };
}

function draw() {
  if (idx[0] !== 1 && idx[1] !== 3 && idx[2] !== 5) draw_pic();
  else {
    document.getElementById("canvas").style.display = "block";
    last = performance.now();
    animeRef = requestAnimationFrame(draw_frame);
  }
}

function draw_pic() {
  var can = document.getElementById("gui");
  var gui = can.getContext("2d");
  gui.clearRect(0, 0, 148, 208);
  if (pid[2] !== 0) gui.drawImage(imgs[2], 29, 22);
  if (pid[0] !== 0) gui.drawImage(imgs[0], 29, 22);
  if (pid[1] !== 0) gui.drawImage(imgs[1], 0, 0);

  var fname = "download";
  if (pid[0] != 0) fname = pid[0];
  else if (pid[1] != 0) fname = pid[1];
  else if (pid[2] != 0) fname = pid[2];
  document.getElementById("canvas").style.display = "block";

  var lnk = document.getElementById("link");
  try {
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
    lnk.innerHTML = "点击此处下载";
  }
  catch (err) {
    lnk.setAttribute("href", "#");
    link.removeAttribute("download");
    lnk.innerHTML = "请在预览图上使用右键下载";
  }
}

function draw_frame(now) {
  animeRef = requestAnimationFrame(draw_frame);
  elapsed = now - last;
  if (elapsed >= fps_delay) {
    var gui = document.getElementById("gui").getContext("2d");
    last = now - (elapsed % fps_delay);
    gui.clearRect(0, 0, 148, 208);
    if (idx[2] === 4 && pid[2] !== 0) gui.drawImage(imgs[2], 29, 22);
    else if (idx[2] === 5 && pid[2] !== 0) {
      gui.drawImage(imgs[2], frms[2] * dim[2][0], 0, dim[2][0], dim[2][1],
          29, 22, dim[2][0], dim[2][1]);
      if (++(frms[2]) >= nfrm[2]) frms[2] = 0;
    }

    if (idx[0] === 0 && pid[0] !== 0) gui.drawImage(imgs[0], 29, 22);
    else if (idx[0] === 1 && pid[0] !== 0) {
      gui.drawImage(imgs[0], frms[0] * dim[0][0], 0, dim[0][0], dim[0][1],
          29, 22, dim[0][0], dim[0][1]);
      if (++(frms[0]) >= nfrm[0]) frms[0] = 0;
    }

    if (idx[1] === 2 && pid[1] !== 0) gui.drawImage(imgs[1], 0, 0);
    else if (idx[1] === 3 && pid[1] !== 0) {
      gui.drawImage(imgs[1], frms[1] * dim[1][0], 0, dim[1][0], dim[1][1],
          0, 0, dim[1][0], dim[1][1]);
      if (++(frms[1]) >= nfrm[1]) frms[1] = 0;
    }
  }
}
