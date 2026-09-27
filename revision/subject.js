/* IGCSE revision subject pages — checkbox progress in localStorage */
(function () {
  var slug = document.body.getAttribute("data-slug");
  var KEY = "rchap-" + slug;
  var boxes = [].slice.call(document.querySelectorAll("input[data-i]"));
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  function write(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  var done = read();
  function paint() {
    var n = 0;
    boxes.forEach(function (b) {
      var on = done.indexOf(b.getAttribute("data-i")) > -1;
      b.checked = on;
      var card = b.closest(".item");
      if (card) card.className = card.className.replace(/ ?done/, "") + (on ? " done" : "");
      if (on) n++;
    });
    document.getElementById("pi").style.width = (boxes.length ? (n / boxes.length * 100) : 0) + "%";
    document.getElementById("pn").textContent = n + " / " + boxes.length;
  }
  boxes.forEach(function (b) {
    b.addEventListener("change", function () {
      var k = b.getAttribute("data-i"), i = done.indexOf(k);
      if (b.checked) { if (i < 0) done.push(k); } else if (i > -1) done.splice(i, 1);
      write(done);
      paint();
    });
  });
  // bulk-mark a whole section by clicking its heading number? keep it simple: section toggles
  document.querySelectorAll("section h2").forEach(function (h) {
    if (!h.querySelector || h.id) return;
  });
  var hideBtn = document.getElementById("hide-done");
  hideBtn.addEventListener("click", function () {
    var on = hideBtn.className.indexOf("on") > -1;
    hideBtn.className = "ghost" + (on ? "" : " on");
    hideBtn.textContent = on ? "Hide revised" : "Showing unrevisioned";
    document.querySelectorAll(".item.done").forEach(function (c) {
      c.style.display = on ? "" : "none";
    });
  });
  document.getElementById("reset").addEventListener("click", function () {
    if (!confirm("Clear every tick on this page?")) return;
    done = []; write(done); paint();
  });
  paint();
})();
