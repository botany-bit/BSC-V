/* B.Sc. Counselling Portal 2026-27 — client-side behaviour (no dependencies) */
(function () {
  "use strict";

  /* ---- mobile navigation toggle ---- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---- flash messages: close button + auto-dismiss ---- */
  document.querySelectorAll(".flash").forEach(function (box) {
    var btn = box.querySelector(".flash-close");
    if (btn) { btn.addEventListener("click", function () { box.remove(); }); }
    setTimeout(function () {
      box.style.transition = "opacity .5s ease";
      box.style.opacity = "0";
      setTimeout(function () { box.remove(); }, 500);
    }, 9000);
  });

  /* ---- registration form: switch academic / admission fieldsets ---- */
  var kindRadios = document.querySelectorAll('input[name="kind"]');
  var fsAcademic = document.getElementById("fs-academic");
  var fsAdmission = document.getElementById("fs-admission");
  function syncKindFields() {
    var kind = document.querySelector('input[name="kind"]:checked');
    kind = kind ? kind.value : "academic";
    if (fsAcademic) {
      fsAcademic.classList.toggle("hidden", kind !== "academic");
      fsAcademic.querySelectorAll("input, select, textarea")
        .forEach(function (el) { el.disabled = kind !== "academic"; });
    }
    if (fsAdmission) {
      fsAdmission.classList.toggle("hidden", kind !== "admission");
      fsAdmission.querySelectorAll("input, select, textarea")
        .forEach(function (el) { el.disabled = kind !== "admission"; });
    }
  }
  if (kindRadios.length) {
    kindRadios.forEach(function (r) { r.addEventListener("change", syncKindFields); });
    syncKindFields();
  }

  /* ---- appointment form: guard against past dates ---- */
  var dateInput = document.getElementById("date");
  if (dateInput && !dateInput.min) {
    dateInput.min = new Date().toISOString().slice(0, 10);
  }

  /* ---- tiny toast helper (data-entry module) ---- */
  function toast(msg, ok) {
    var t = document.createElement("div");
    t.className = "oec-toast " + (ok ? "ok" : "err");
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add("show"); }, 10);
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { t.remove(); }, 300);
    }, 2600);
  }

  /* =========================================================
     Counselling data-entry module (dark "Botany" interface)
     ========================================================= */
  var addForm = document.getElementById("addForm");

  if (addForm) {

    /* ---- New Record / New Student / Clear ---- */
    document.querySelectorAll("[data-new-record]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        addForm.reset();
        var e = document.getElementById("f_enrol");
        if (e) { e.focus(); }
      });
    });

    /* ---- course code <-> course name sync, filtered by course type ---- */
    var fCtype = document.getElementById("f_ctype");
    var fCode = document.getElementById("f_code");
    var fName = document.getElementById("f_cname");
    var SLOT_OF = { "VAC V": "vac_v", "VOC V": "voc_v",
                    "MO V": "mo_v", "NO V": "no_v", "XO V": "xo_v",
                    "MO VI": "mo_vi", "NO VI": "no_vi", "XO VI": "xo_vi",
                    "VAC VI": "vac_vi", "VOC VI": "voc_vi" };

    function syncCoursePickers() {
      var slot = SLOT_OF[fCtype.value] || "";
      [fCode, fName].forEach(function (sel) {
        sel.querySelectorAll("option[data-slot]").forEach(function (opt) {
          var show = !slot || opt.dataset.slot === slot;
          opt.hidden = !show;
          opt.disabled = !show;
          if (!show && sel.value === opt.value) { sel.value = ""; }
        });
      });
    }
    if (fCtype && fCode && fName) {
      fCtype.addEventListener("change", syncCoursePickers);
      fCode.addEventListener("change", function () {
        var opt = fCode.options[fCode.selectedIndex];
        fName.value = (opt && opt.dataset.slot) ? opt.value : "";
        maybeAutoSave();
      });
      fName.addEventListener("change", function () {
        var opt = fName.options[fName.selectedIndex];
        fCode.value = (opt && opt.dataset.slot) ? opt.value : "";
        maybeAutoSave();
      });
      syncCoursePickers();
      /* quick-add prefill from a per-code sheet card (ctype/code in URL) */
      if (fCode.value) {
        fCode.dispatchEvent(new Event("change"));
        var fi = document.getElementById("f_enrol");
        if (fi) { fi.focus(); }
      }
    }

    /* ---- Auto Save toggle: saves when a course is picked ---- */
    var autoBtn = document.getElementById("autoSaveBtn");
    var autoOn = localStorage.getItem("oec_autosave") !== "off";
    function paintAuto() {
      autoBtn.classList.toggle("obtn-green", autoOn);
      autoBtn.classList.toggle("obtn-dim", !autoOn);
      autoBtn.setAttribute("aria-pressed", autoOn ? "true" : "false");
      autoBtn.textContent = autoOn ? "⟳ Auto Save" : "⏸ Auto Save Off";
    }
    if (autoBtn) {
      paintAuto();
      autoBtn.addEventListener("click", function () {
        autoOn = !autoOn;
        localStorage.setItem("oec_autosave", autoOn ? "on" : "off");
        paintAuto();
        toast("Auto Save " + (autoOn ? "enabled" : "disabled"), autoOn);
      });
    }
    var submitted = false;
    addForm.addEventListener("submit", function () { submitted = true; });
    function maybeAutoSave() {
      var name = document.getElementById("f_name");
      if (autoOn && !submitted && name && name.value.trim() &&
          fCode && fCode.value) {
        submitted = true;
        toast("Auto-saving new student…", true);
        addForm.submit();
      }
    }

    /* ---- live search ---- */
    var search = document.getElementById("rowSearch");
    if (search) {
      search.addEventListener("input", function () {
        var q = search.value.trim().toLowerCase();
        document.querySelectorAll("#mainTable tbody tr[data-id]")
          .forEach(function (row) {
            var hit = !q || row.dataset.search.indexOf(q) !== -1;
            row.classList.toggle("hidden", !hit);
            var edit = document.getElementById("edit-" + row.dataset.id);
            if (edit && !hit) { edit.classList.add("hidden"); }
          });
      });
    }

    /* ---- API helper ---- */
    function post(url, params) {
      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "same-origin",
        body: new URLSearchParams(params).toString()
      }).then(function (r) {
        return r.json().catch(function () { return { ok: false, error: "Request failed" }; });
      });
    }

    /* ---- undo / redo history of inline edits ---- */
    var hist = [], future = [], applying = false;
    var undoBtn = document.getElementById("undoBtn");
    var redoBtn = document.getElementById("redoBtn");
    function paintHistory() {
      if (undoBtn) { undoBtn.disabled = !hist.length; }
      if (redoBtn) { redoBtn.disabled = !future.length; }
    }
    function urlFor(kind, id) { return "/oec/api/student/" + id + "/" + kind; }
    function paramsFor(kind, key, value) {
      return kind === "slot" ? { slot: key, code: value }
                             : { field: key, value: value };
    }
    function saveChange(el, kind, key, newVal, done) {
      var oldVal = (el.dataset.orig != null) ? el.dataset.orig : "";
      var id = el.dataset.id;
      post(urlFor(kind, id), paramsFor(kind, key, newVal)).then(function (res) {
        if (res.ok) {
          var canonical = (res.value != null) ? res.value : newVal;
          el.value = canonical;
          el.dataset.orig = canonical;
          if (!applying) {
            hist.push({ el: el, kind: kind, key: key,
                        oldVal: oldVal, newVal: canonical });
            future = [];
          }
          paintHistory();
        }
        if (done) { done(res.ok ? null : res, res); }
      });
    }
    function applyHistory(stackFrom, stackTo, useOld) {
      var e = stackFrom.pop();
      if (!e) { paintHistory(); return; }
      applying = true;
      var value = useOld ? e.oldVal : e.newVal;
      e.el.value = value;
      post(urlFor(e.kind, e.el.dataset.id), paramsFor(e.kind, e.key, value))
        .then(function (res) {
          applying = false;
          if (res.ok) {
            e.el.dataset.orig = value;
            stackTo.push(e);
            toast(useOld ? "Undone" : "Redone", true);
          } else {
            e.el.value = useOld ? e.newVal : e.oldVal;
            toast(res.error || "Failed", false);
          }
          paintHistory();
        });
    }
    if (undoBtn) { undoBtn.addEventListener("click", function () { applyHistory(hist, future, true); }); }
    if (redoBtn) { redoBtn.addEventListener("click", function () { applyHistory(future, hist, false); }); }
    // Ctrl+Z / Ctrl+Y keyboard shortcuts
    document.addEventListener("keydown", function (ev) {
      if (!ev.ctrlKey && !ev.metaKey) { return; }
      var tag = (ev.target.tagName || "").toLowerCase();
      if (tag === "textarea") { return; }
      if (ev.key === "z" && !ev.shiftKey) { ev.preventDefault(); applyHistory(hist, future, true); }
      if (ev.key === "y" || (ev.key === "z" && ev.shiftKey)) { ev.preventDefault(); applyHistory(future, hist, false); }
    });

    // snapshot original value when user focuses an editable control
    document.querySelectorAll("input[data-slot], input.oec-date, select[data-status], [data-field]")
      .forEach(function (el) {
        ["focusin", "mousedown"].forEach(function (evName) {
          el.addEventListener(evName, function () {
            if (el.dataset.orig === undefined) { el.dataset.orig = el.value; }
          });
        });
      });

    /* ---- inline course-code cells (per-slot searchable inputs) ---- */
    document.querySelectorAll("input[data-slot]").forEach(function (inp) {
      inp.addEventListener("change", function () {
        if (inp.value === inp.dataset.orig) { return; }
        inp.classList.remove("slot-ok", "slot-error");
        saveChange(inp, "slot", inp.dataset.slot, inp.value,
          function (err, res) {
            if (!err) {
              inp.classList.add("slot-ok");
              toast("Saved " + (res.value || "(slot cleared)"), true);
            } else {
              inp.classList.add("slot-error");
              toast((err && err.error) || "Save failed", false);
            }
          });
      });
    });

    /* ---- counselling date cells ---- */
    document.querySelectorAll("input.oec-date").forEach(function (inp) {
      inp.addEventListener("change", function () {
        if (inp.value === inp.dataset.orig) { return; }
        saveChange(inp, "field", "counselling_date", inp.value,
          function (err, res) {
            inp.classList.toggle("slot-ok", !err);
            inp.classList.toggle("slot-error", !!err);
            toast(err ? ((err && err.error) || "Save failed")
                      : "Date saved", !err);
          });
      });
    });

    /* ---- status selects ---- */
    document.querySelectorAll("select[data-status]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        saveChange(sel, "field", "status", sel.value, function (err) {
          toast(err ? "Save failed" : "Status → " + sel.value, !err);
        });
      });
    });

    /* ---- expandable edit row fields (save on change/blur) ---- */
    document.querySelectorAll("[data-field]").forEach(function (inp) {
      inp.addEventListener("change", function () {
        saveChange(inp, "field", inp.dataset.field, inp.value,
          function (err, res) {
            inp.classList.toggle("slot-error", !!err);
            if (err) {
              toast((err && err.error) || "Save failed", false);
            } else if (["enrolment_no", "student_name", "faculty_no",
                        "mobile"].indexOf(inp.dataset.field) !== -1) {
              toast("Saved — visible after refresh", true);
            } else {
              toast("Saved", true);
            }
          });
      });
    });

    /* ---- edit row toggle ---- */
    document.querySelectorAll("[data-edit-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        var row = document.getElementById(btn.getAttribute("data-edit-toggle"));
        if (row) { row.classList.toggle("hidden"); }
      });
    });

    /* ---- per-row delete ---- */
    document.querySelectorAll("[data-row-delete]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-row-delete");
        if (!confirm("Delete record E" + id + "?")) { return; }
        post("/oec/api/student/" + id + "/delete", {}).then(function () {
          location.reload();
        });
      });
    });

    /* ---- select-all + bulk delete ---- */
    var checkAll = document.getElementById("checkAll");
    if (checkAll) {
      checkAll.addEventListener("change", function () {
        document.querySelectorAll(".row-check").forEach(function (c) {
          if (!c.closest("tr").classList.contains("hidden")) {
            c.checked = checkAll.checked;
          }
        });
      });
    }
    var bulkBtn = document.getElementById("bulkDeleteBtn");
    if (bulkBtn) {
      bulkBtn.addEventListener("click", function () {
        var ids = [];
        document.querySelectorAll(".row-check:checked").forEach(function (c) {
          ids.push(c.value);
        });
        if (!ids.length) { toast("Tick records to delete first", false); return; }
        if (!confirm("Delete " + ids.length + " selected record(s)?")) { return; }
        post("/oec/api/bulk-delete", { ids: ids.join(",") })
          .then(function () { location.reload(); });
      });
    }
  }
})();
