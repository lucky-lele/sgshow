var imgs = new Array(3);
var loaded = 0;

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
  var idx = new Array(-1,-1,-1);
  var pid = new Array(0,0,0);
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
  for (c = 0; c < 3; c++) {
    if (idx[c] === 1 || idx[c] === 3 || idx[c] === 5) {
      document.write("<h1>线上版暂不支持动态部件</h1>");
      return;
    }
    else if (idx[c] === 4) {
      idx[c] = 1;
      continue;
    }
  }

  var hid = document.getElementById("hidden");
  var url, img;
  var total = 0;
  loaded = 0;
  for (c = 0; c < 3; c++) if (pid[c] !== 0) total++;
  for (c = 0; c < 3; c++) {
    if (pid[c] === 0) continue;
    idx2 = idx[c];
    url = String(idx2) + "f/" + String(pid[c]) + ".png";
    img = document.createElement("img");
    img.setAttribute("src", url);
    img.setAttribute("id", String(idx2) + String(pid[c]));
    hid.appendChild(img);
    imgs[idx2] = img;
    img.onload = function() {
      if (++loaded >= total) draw(idx, pid);
    };
    img.onerror = function() {
      document.write("<h1>资源加载失败</h1>");
    };
  }
}

function draw(idx, pid) {
  var can = document.getElementById("gui");
  var gui = can.getContext("2d");
  gui.clearRect(0, 0, 148, 208);
  if (pid[1] !== 0) gui.drawImage(imgs[1], 29, 22);
  if (pid[0] !== 0) gui.drawImage(imgs[0], 29, 22);
  if (pid[2] !== 0) gui.drawImage(imgs[2], 0, 0);

  var fname = "download";
  if (pid[0] != 0) fname = pid[0];
  else if (pid[2] != 0) fname = pid[2];
  else if (pid[4] != 0) fname = pid[4];
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
