/* Workshop calculators — plain JS, no dependencies. */

var TOOLS = [];

/* ---------- 1. Laser settings (diode, 455 nm) ---------- */
TOOLS.push({
  id: "laser", icon: "🔥", name: "Laser Settings",
  hint: "Starting points for a diode laser (DAJA A6 Pro 20W, 455 nm). Always run a test cut.",
  fields: [
    { k: "mat", label: "Material", type: "select", opts: ["Plywood", "MDF", "Basswood", "Acrylic (black)", "Cardboard", "Leather", "Anodised alu (engrave)"], def: "Plywood" },
    { k: "t", label: "Thickness (mm)", type: "number", def: 3, step: 0.5 },
    { k: "p", label: "Laser power (W)", type: "number", def: 20, step: 1 },
    { k: "mode", label: "Job", type: "select", opts: ["Cut through", "Engrave (fill)"], def: "Cut through" }
  ],
  calc: function (v) {
    var D = {
      "Plywood":            { s: 600, pw: 100, pass: 1, es: 3000, ep: 40 },
      "MDF":                { s: 450, pw: 100, pass: 2, es: 2600, ep: 45 },
      "Basswood":           { s: 700, pw: 100, pass: 1, es: 3200, ep: 40 },
      "Acrylic (black)":    { s: 400, pw: 100, pass: 1, es: 2800, ep: 35 },
      "Cardboard":          { s: 1200, pw: 70,  pass: 1, es: 4000, ep: 30 },
      "Leather":            { s: 900, pw: 60,  pass: 1, es: 3500, ep: 25 },
      "Anodised alu (engrave)": { s: 1500, pw: 100, pass: 1, es: 1500, ep: 100 }
    };
    var d = D[v.mat], pRatio = (v.p || 20) / 20, tRatio = 3 / Math.max(v.t || 3, 0.5);
    var speed, power, passes, note;
    if (v.mode === "Engrave (fill)") {
      speed = Math.round(d.es * pRatio);
      power = Math.min(100, Math.round(d.ep));
      passes = 1;
      note = "Engraving: lower power + high speed gives more contrast. Try 1 pass first.";
    } else {
      speed = Math.round(d.s * pRatio * tRatio);
      power = Math.min(100, Math.round(d.pw * (v.t > 3 ? 1 : 0.9)));
      passes = Math.max(1, Math.round(d.pass * Math.max(1, (v.t || 3) / 3)));
      note = "Cutting: if it doesn't go through, slow down 20% before adding passes.";
    }
    return {
      big: speed + " mm/min", lbl: "Recommended speed",
      rows: [["Power", power + " %"], ["Passes", passes], ["Air assist", "On (cuts) / Off (engrave)"], ["Focus", "Material surface"]],
      note: note + " Wood thickness scales the speed; test on scrap first."
    };
  }
});

/* ---------- 2. Gear ratio ---------- */
TOOLS.push({
  id: "gear", icon: "⚙️", name: "Gear Ratio",
  hint: "Ratio, output speed and torque from tooth counts (or pulley diameters).",
  fields: [
    { k: "a", label: "Driver teeth (in)", type: "number", def: 12 },
    { k: "b", label: "Driven teeth (out)", type: "number", def: 36 },
    { k: "rpm", label: "Input speed (RPM)", type: "number", def: 300 },
    { k: "tq", label: "Input torque (N·m)", type: "number", def: 0.5, step: 0.1 }
  ],
  calc: function (v) {
    var a = v.a || 1, b = v.b || 1, r = b / a;
    return {
      big: "1 : " + (Math.round(r * 1000) / 1000), lbl: "Reduction (driver : driven)",
      rows: [
        ["Output speed", Math.round((v.rpm || 0) / r) + " RPM"],
        ["Speed change", (r > 1 ? "↓ " : "↑ ") + (Math.round((1 / r) * 100) / 100) + "×"],
        ["Torque multiplier", (Math.round(r * 100) / 100) + "×"],
        ["Output torque", (Math.round((v.tq || 0) * r * 100) / 100) + " N·m"]
      ],
      note: "Ignoring friction. Odd/even tooth counts wear more evenly; avoid < 12 teeth on small plastic gears."
    };
  }
});

/* ---------- 3. Resistor colour code ---------- */
TOOLS.push({
  id: "res", icon: "🎨", name: "Resistor Code",
  hint: "4-band resistor colour code → resistance value.",
  fields: [
    { k: "b1", label: "Band 1", type: "select", opts: ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "grey", "white"], def: "brown" },
    { k: "b2", label: "Band 2", type: "select", opts: ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "grey", "white"], def: "black" },
    { k: "b3", label: "Multiplier", type: "select", opts: ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "grey", "white"], def: "red" },
    { k: "b4", label: "Tolerance", type: "select", opts: ["brown (±1%)", "red (±2%)", "green (±0.5%)", "blue (±0.25%)", "gold (±5%)", "silver (±10%)"], def: "gold (±5%)" }
  ],
  calc: function (v) {
    var N = { black: 0, brown: 1, red: 2, orange: 3, yellow: 4, green: 5, blue: 6, violet: 7, grey: 8, white: 9 };
    var val = (N[v.b1] * 10 + N[v.b2]) * Math.pow(10, N[v.b3]);
    var fmt;
    if (val >= 1e6) fmt = (val / 1e6) + " MΩ";
    else if (val >= 1e3) fmt = (val / 1e3) + " kΩ";
    else fmt = val + " Ω";
    return {
      big: fmt, lbl: "Resistance",
      rows: [["Tolerance", v.b4.replace(/.*\(|\)/g, "")], ["Min", (val * 0.95).toFixed(1) + " Ω"], ["Max", (val * 1.05).toFixed(1) + " Ω"], ["Bands", v.b1 + " · " + v.b2 + " · " + v.b3 + " · " + v.b4.split(" ")[0]]],
      note: "Read from the end with the tolerance band (gold/silver) last."
    };
  }
});

/* ---------- 4. Beam deflection ---------- */
TOOLS.push({
  id: "beam", icon: "📏", name: "Beam Deflection",
  hint: "Simply supported beam, central point load: δ = FL³ / (48EI).",
  fields: [
    { k: "F", label: "Load (N)", type: "number", def: 100 },
    { k: "L", label: "Span (mm)", type: "number", def: 400 },
    { k: "b", label: "Section width (mm)", type: "number", def: 20 },
    { k: "h", label: "Section height (mm)", type: "number", def: 10 },
    { k: "mat", label: "Material", type: "select", opts: ["PLA", "PETG", "ABS", "Plywood", "Acrylic", "Aluminium", "Steel"], def: "PLA" }
  ],
  calc: function (v) {
    var E = { PLA: 3.5, PETG: 2.0, ABS: 2.3, Plywood: 10, Acrylic: 3.2, Aluminium: 69, Steel: 200 }[v.mat] * 1000; // MPa
    var I = (v.b * Math.pow(v.h, 3)) / 12;            // mm^4
    var d = (v.F * Math.pow(v.L, 3)) / (48 * E * I);  // mm
    var Z = (v.b * v.h * v.h) / 6;                    // mm^3
    var sig = (v.F * v.L) / (4 * Z);                  // MPa
    var yld = { PLA: 50, PETG: 50, ABS: 40, Plywood: 40, Acrylic: 70, Aluminium: 240, Steel: 250 }[v.mat];
    return {
      big: (Math.round(d * 100) / 100) + " mm", lbl: "Max deflection (centre)",
      rows: [
        ["Deflection / span", (Math.round((d / v.L) * 10000) / 100) + " %"],
        ["Bending stress", (Math.round(sig * 10) / 10) + " MPa"],
        ["Material yield", yld + " MPa"],
        ["Safety factor", (Math.round((yld / Math.max(sig, 0.01)) * 10) / 10) + "×"]
      ],
      note: "d/L under 0.5 % feels stiff; over 2 % looks saggy. Safety factor under 2 is risky."
    };
  }
});

/* ---------- 5. Filament cost ---------- */
TOOLS.push({
  id: "fil", icon: "🧵", name: "Print Cost",
  hint: "Filament + electricity cost for a print (HK$).",
  fields: [
    { k: "g", label: "Filament used (g)", type: "number", def: 50 },
    { k: "price", label: "Spool price (HK$/kg)", type: "number", def: 150 },
    { k: "hrs", label: "Print time (hours)", type: "number", def: 4, step: 0.5 },
    { k: "w", label: "Printer power (W)", type: "number", def: 120 },
    { k: "kwh", label: "Electricity (HK$/kWh)", type: "number", def: 1.3, step: 0.1 },
    { k: "fail", label: "Failure allowance (%)", type: "number", def: 10 }
  ],
  calc: function (v) {
    var mat = (v.g / 1000) * v.price;
    var elec = ((v.w / 1000) * v.hrs) * v.kwh;
    var sub = mat + elec, tot = sub * (1 + (v.fail || 0) / 100);
    var R = function (x) { return "HK$ " + (Math.round(x * 100) / 100); };
    return {
      big: R(tot), lbl: "Estimated cost",
      rows: [["Filament", R(mat)], ["Electricity", R(elec)], ["Subtotal", R(sub)], ["With " + (v.fail || 0) + "% failures", R(tot)], ["Per gram", R(tot / Math.max(v.g, 1))]],
      note: "Add machine wear (~HK$0.5/h) and your time if you're quoting a job."
    };
  }
});

/* ---------- 6. CNC feeds & speeds ---------- */
TOOLS.push({
  id: "cnc", icon: "🛠️", name: "CNC Feeds",
  hint: "Feed rate from spindle speed, flutes and chip load.",
  fields: [
    { k: "rpm", label: "Spindle speed (RPM)", type: "number", def: 12000 },
    { k: "fl", label: "Flutes", type: "number", def: 2 },
    { k: "cl", label: "Chip load (mm/tooth)", type: "number", def: 0.05, step: 0.005 },
    { k: "dia", label: "Tool diameter (mm)", type: "number", def: 3 },
    { k: "mat", label: "Material", type: "select", opts: ["Softwood", "Hardwood", "MDF", "Acrylic", "Aluminium"], def: "Softwood" }
  ],
  calc: function (v) {
    var feed = v.rpm * v.fl * v.cl;                 // mm/min
    var vc = (Math.PI * v.dia * v.rpm) / 1000;      // surface speed m/min
    var rec = { Softwood: [18000, 0.05], Hardwood: [16000, 0.04], MDF: [18000, 0.05], Acrylic: [12000, 0.03], Aluminium: [9000, 0.02] }[v.mat];
    var plunge = feed / 3;
    return {
      big: Math.round(feed) + " mm/min", lbl: "Feed rate",
      rows: [
        ["Plunge rate (≈ feed/3)", Math.round(plunge) + " mm/min"],
        ["Surface speed", (Math.round(vc * 10) / 10) + " m/min"],
        ["Suggested RPM for " + v.mat, rec[0] + " RPM"],
        ["Suggested chip load", rec[1] + " mm/tooth"],
        ["Chip load check", v.cl > 0.12 ? "⚠ high — may snap the tool" : "OK"]
      ],
      note: "Depth of cut ≈ 1× tool diameter for roughing, 0.5× for finishing. Small tools need slower feed."
    };
  }
});

/* ---------- render ---------- */
(function () {
  var tabs = document.getElementById("tabs"), panels = document.getElementById("panels");
  TOOLS.forEach(function (t, i) {
    var b = document.createElement("button");
    b.className = "tab" + (i === 0 ? " on" : "");
    b.textContent = t.icon + " " + t.name;
    b.onclick = function () { show(i); };
    tabs.appendChild(b);

    var p = document.createElement("div");
    p.className = "panel" + (i === 0 ? " on" : "");
    var h = '<h2>' + t.icon + " " + t.name + '</h2><div class="hint">' + t.hint + '</div><div class="grid">';
    t.fields.forEach(function (f) {
      h += '<div><label>' + f.label + '</label>';
      if (f.type === "select") {
        h += '<select data-k="' + f.k + '">' + f.opts.map(function (o) { return '<option' + (o === f.def ? " selected" : "") + '>' + o + '</option>'; }).join("") + '</select>';
      } else {
        h += '<input type="number" data-k="' + f.k + '" value="' + f.def + '" step="' + (f.step || 1) + '">';
      }
      h += '</div>';
    });
    h += '</div><div class="out" id="out-' + t.id + '"></div>';
    p.innerHTML = h;
    panels.appendChild(p);

    function run() {
      var v = {};
      p.querySelectorAll("[data-k]").forEach(function (el) {
        v[el.getAttribute("data-k")] = el.tagName === "SELECT" ? el.value : parseFloat(el.value);
      });
      var r;
      try { r = t.calc(v); } catch (e) { r = { big: "—", lbl: "Check your inputs", rows: [], note: "" }; }
      var o = '<div class="lbl">' + r.lbl + '</div><div class="big">' + r.big + '</div>';
      (r.rows || []).forEach(function (row) { o += '<div class="row"><span>' + row[0] + '</span><span>' + row[1] + '</span></div>'; });
      if (r.note) o += '<div class="note">' + r.note + '</div>';
      p.querySelector("#out-" + t.id).innerHTML = o;
    }
    p.querySelectorAll("[data-k]").forEach(function (el) { el.oninput = run; el.onchange = run; });
    p._run = run;
    run();
  });
  function show(i) {
    document.querySelectorAll(".tab").forEach(function (b, j) { b.className = "tab" + (i === j ? " on" : ""); });
    document.querySelectorAll(".panel").forEach(function (p, j) { p.className = "panel" + (i === j ? " on" : ""); });
    window.scrollTo(0, 0);
  }
})();

