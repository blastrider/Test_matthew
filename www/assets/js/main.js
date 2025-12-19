(function () {
  "use strict";

  function fetchText(url) {
    return fetch(url, { cache: "no-store" }).then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.text();
    });
  }

  function onReady() {
    var statusLink = document.querySelector('[data-action="status"]');
    var modal = document.getElementById("status-modal");
    if (!statusLink || !modal) {
      return;
    }

    var statusPre = modal.querySelector('[data-status="text"]');
    var logsPre = modal.querySelector('[data-status="logs"]');
    var closeButtons = modal.querySelectorAll('[data-action="status-close"]');
    var isOpen = false;

    function setOpen(open) {
      if (open) {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        isOpen = true;
      } else {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        isOpen = false;
      }
    }

    function loadStatus() {
      if (!statusPre || !logsPre) {
        return;
      }

      statusPre.textContent = "Chargement...";
      logsPre.textContent = "Chargement...";

      var cacheBuster = Date.now();

      function loadLogs() {
        fetchText("/nginx_status_logs?ts=" + cacheBuster)
          .then(function (text) {
            var trimmed = text.replace(/\s+$/, "");
            if (!trimmed) {
              logsPre.textContent = "Aucun log pour /nginx_status.";
              return;
            }
            var lines = trimmed.split(/\r?\n/);
            var lastLines = lines.slice(-20);
            logsPre.textContent = lastLines.join("\n");
          })
          .catch(function () {
            logsPre.textContent = "Impossible de charger les logs.";
          });
      }

      fetchText("/nginx_status?ts=" + cacheBuster)
        .then(function (text) {
          var value = text.trim();
          statusPre.textContent = value ? value : "Aucun statut.";
          loadLogs();
        })
        .catch(function () {
          statusPre.textContent = "Impossible de charger le statut.";
          loadLogs();
        });
    }

    statusLink.addEventListener("click", function (event) {
      event.preventDefault();
      setOpen(true);
      loadStatus();
    });

    closeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen) {
        setOpen(false);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
