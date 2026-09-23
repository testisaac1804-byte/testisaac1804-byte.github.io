/* CV: pull selected projects from the live portfolio card data */
var KEYS = ["f1", "vex", "fusion", "laser", "cnc", "robot", "gear", "jig", "drone", "print",
            "lightburn", "3d", "cad", "mechanism", "arm", "dragster", "keychain", "bluetooth", "app"];

function esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function score(p) {
  var hay = (p.t + " " + (p.g || []).join(" ") + " " + p.d).toLowerCase();
  var s = 0;
  KEYS.forEach(function (k) { if (hay.indexOf(k) >= 0) s += 1; });
  if (p.t.length > 60) s -= 1;          // prefer readable titles
  return s;
}

fetch("/cv/cards.json").then(function (r) { return r.json(); }).then(function (D) {
  var all = [];
  Object.keys(D).forEach(function (k) {
    (D[k] || []).forEach(function (p) { all.push(p); });
  });
  var seen = {}, picked = all
    .filter(function (p) { return p.t && p.d; })
    .map(function (p) { return { p: p, s: score(p) }; })
    .filter(function (x) { return x.s >= 2; })
    .sort(function (a, b) { return b.s - a.s; })
    .filter(function (x) {
      // dedupe on the first two words so "Model Block Jig v1/v5/BravoProdigy" collapse
      var k = x.p.t.toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .replace(/\s+/g, " ").trim()
        .split(" ").slice(0, 2).join(" ");
      if (!k || seen[k]) return false; seen[k] = 1; return true;
    })
    .slice(0, 10)
    .map(function (x) { return x.p; });

  document.getElementById("picked").textContent = "auto-picked from " + all.length + " portfolio cards";
  document.getElementById("projects").innerHTML = picked.map(function (p) {
    return '<div class="proj"><div class="pt">' + esc(p.t) + '</div>' +
      '<div class="pd">' + esc(p.d).slice(0, 190) + '</div>' +
      ((p.g || []).length ? '<div class="pg">' + esc((p.g || []).slice(0, 5).join(" · ")) + '</div>' : '') + '</div>';
  }).join("") || '<div class="note">Portfolio data unavailable.</div>';

  var libs = ["3D print libraries (1,900+ Bambu profiles)", "Laser material & art libraries (LightBurn .clb/.lbart)",
              "VEX IQ / V5 parts and mechanisms", "Gear mechanism model sets (3D print)", "5-axis desktop CNC CAD model",
              "F1 in Schools CO₂ dragster manufacturing pack", "IGCSE revision resources & notes"];
  document.getElementById("work").innerHTML = libs.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
}).catch(function () {
  document.getElementById("projects").innerHTML = '<div class="note">Could not load portfolio data.</div>';
});
