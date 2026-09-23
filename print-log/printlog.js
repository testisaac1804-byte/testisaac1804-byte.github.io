/* Print Log frontend */
var API = "https://print-log.isaac1804.workers.dev";
var PRINTS = [];

function esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function pass() {
  try { return localStorage.getItem("printlog-pass") || ""; } catch (e) { return ""; }
}
function setMsg(t, cls) {
  var m = document.getElementById("msg");
  m.textContent = t; m.className = "msg " + (cls || "");
}
function fmtDate(ms) {
  var d = new Date(ms);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) + " " +
         d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function load() {
  fetch(API + "/api/prints").then(function (r) { return r.json(); }).then(function (d) {
    PRINTS = (d && d.prints) || [];
    render();
  }).catch(function () {
    document.getElementById("list").innerHTML = '<div class="empty">Could not reach the print log service.</div>';
  });
}

function render() {
  var n = PRINTS.length;
  var ok = PRINTS.filter(function (p) { return p.result === "ok"; }).length;
  var g = PRINTS.reduce(function (a, p) { return a + (p.grams || 0); }, 0);
  var h = PRINTS.reduce(function (a, p) { return a + (p.hours || 0); }, 0);
  var rate = n ? Math.round((ok / n) * 100) : 0;
  document.getElementById("stats").innerHTML =
    '<div class="stat"><div class="n">' + n + '</div><div class="l">Prints logged</div></div>' +
    '<div class="stat"><div class="n">' + rate + '%</div><div class="l">Clean first time</div></div>' +
    '<div class="stat"><div class="n">' + (Math.round(g * 10) / 10) + ' g</div><div class="l">Filament used</div></div>' +
    '<div class="stat"><div class="n">' + (Math.round(h * 10) / 10) + ' h</div><div class="l">Print time</div></div>';
  document.getElementById("cnt").textContent = n ? "(" + n + ")" : "";

  if (!n) {
    document.getElementById("list").innerHTML = '<div class="empty">No prints logged yet — add your first above.</div>';
    return;
  }
  var rows = PRINTS.map(function (p) {
    var b = p.result === "ok" ? "b-ok" : p.result === "warn" ? "b-warn" : "b-fail";
    var bl = p.result === "ok" ? "✅ clean" : p.result === "warn" ? "⚠️ issues" : "❌ failed";
    var settings = [
      p.nozzle != null ? p.nozzle + "°" : null,
      p.bed != null ? "bed " + p.bed + "°" : null,
      p.layer != null ? p.layer + "mm" : null,
      p.speed != null ? p.speed + "mm/s" : null,
      p.infill != null ? p.infill + "%" : null
    ].filter(Boolean).join(" · ");
    return '<tr><td><strong>' + esc(p.name) + '</strong>' + (p.notes ? '<div style="color:var(--t3);font-size:12px;margin-top:3px">' + esc(p.notes) + '</div>' : '') + '</td>' +
      '<td>' + esc(p.material) + '</td><td style="color:var(--t2)">' + settings + '</td>' +
      '<td>' + (p.grams != null ? p.grams + " g" : "—") + (p.hours != null ? '<div style="color:var(--t3);font-size:12px">' + p.hours + " h</div>" : "") + '</td>' +
      '<td><span class="badge ' + b + '">' + bl + '</span></td>' +
      '<td style="color:var(--t3);font-size:12px;white-space:nowrap">' + fmtDate(p.at) + '</td>' +
      '<td><button class="del" onclick="delPrint(\'' + p.id + '\')">delete</button></td></tr>';
  }).join("");
  document.getElementById("list").innerHTML =
    '<table><thead><tr><th>Part</th><th>Material</th><th>Settings</th><th>Used</th><th>Result</th><th>When</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function addPrint(e) {
  e.preventDefault();
  var f = document.getElementById("f"), d = {};
  ["name", "material", "nozzle", "bed", "layer", "speed", "infill", "grams", "hours", "result", "notes", "pass"].forEach(function (k) {
    d[k] = f.elements[k] ? f.elements[k].value : "";
  });
  if (!d.pass) { setMsg("Enter the passcode to save.", "err"); return false; }
  setMsg("Saving…");
  fetch(API + "/api/prints", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d)
  }).then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); })
    .then(function (res) {
      if (res.s === 401) { setMsg("Wrong passcode.", "err"); return; }
      if (!res.j || !res.j.ok) { setMsg("Save failed.", "err"); return; }
      try { localStorage.setItem("printlog-pass", d.pass); } catch (er) {}
      setMsg("Saved ✓", "ok");
      f.elements.name.value = ""; f.elements.notes.value = ""; f.elements.grams.value = ""; f.elements.hours.value = "";
      load();
    }).catch(function () { setMsg("Network error.", "err"); });
  return false;
}

function delPrint(id) {
  var p = prompt("Passcode to delete?");
  if (!p) return;
  fetch(API + "/api/prints/" + id + "?pass=" + encodeURIComponent(p), { method: "DELETE" })
    .then(function (r) { return r.json(); })
    .then(function (j) { if (j && j.ok) load(); else alert("Wrong passcode."); });
}

function useLast() {
  if (!PRINTS.length) { setMsg("No previous print to copy.", "err"); return; }
  var p = PRINTS[0], f = document.getElementById("f");
  ["material", "nozzle", "bed", "layer", "speed", "infill"].forEach(function (k) {
    if (p[k] != null && f.elements[k]) f.elements[k].value = p[k];
  });
  setMsg("Copied settings from “" + p.name + "”.", "ok");
}

(function () {
  var f = document.getElementById("f");
  if (f && f.elements.pass && pass()) f.elements.pass.value = pass();
  load();
})();
