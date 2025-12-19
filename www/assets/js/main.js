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

  function fetchJson(url, options) {
    return fetch(url, options || {}).then(function (response) {
      return response
        .json()
        .catch(function () {
          return null;
        })
        .then(function (data) {
          if (!response.ok || !data || !data.ok) {
            var message = data && data.error ? data.error : "Erreur serveur.";
            throw new Error(message);
          }
          return data;
        });
    });
  }

  function formatBytes(bytes) {
    if (!bytes) {
      return "0 B";
    }
    var units = ["B", "KB", "MB", "GB"];
    var index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    var value = bytes / Math.pow(1024, index);
    var rounded = value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1);
    return rounded + " " + units[index];
  }

  function initPdfUploader() {
    var input = document.getElementById("pdf-input");
    var dropzone = document.querySelector("[data-dropzone]");
    var list = document.querySelector("[data-file-list]");
    var uploadButton = document.querySelector('[data-action="upload-all"]');
    if (!input || !dropzone || !list) {
      return;
    }

    var files = [];
    var isUploading = false;

    function updateUploadButton() {
      if (!uploadButton) {
        return;
      }
      var hasPending = files.some(function (item) {
        return item.status !== "done";
      });
      uploadButton.disabled = !files.length || isUploading || !hasPending;
    }

    function renderList() {
      list.innerHTML = "";
      if (!files.length) {
        var empty = document.createElement("p");
        empty.className = "file-empty";
        empty.textContent = "Aucun fichier sélectionné.";
        list.appendChild(empty);
        updateUploadButton();
        return;
      }

      var ul = document.createElement("ul");
      ul.className = "file-items";

      files.forEach(function (item, index) {
        var statusLabel = "En attente";
        if (item.status === "uploading") {
          statusLabel = "Envoi en cours";
        } else if (item.status === "done") {
          statusLabel = "Envoyé";
        } else if (item.status === "error") {
          statusLabel = item.error ? "Erreur: " + item.error : "Erreur";
        }

        var li = document.createElement("li");
        li.className = "file-item";

        var info = document.createElement("div");
        info.className = "file-info";

        var name = document.createElement("span");
        name.className = "file-name";
        name.textContent = item.file.name;

        var meta = document.createElement("span");
        meta.className = "file-meta";
        meta.textContent = formatBytes(item.file.size);

        var status = document.createElement("span");
        status.className = "file-status";
        status.setAttribute("data-state", item.status || "pending");
        status.textContent = statusLabel;

        var actions = document.createElement("div");
        actions.className = "file-actions";

        var open = document.createElement("a");
        open.className = "file-link";
        open.href = item.url;
        open.target = "_blank";
        open.rel = "noopener";
        open.textContent = "Ouvrir";

        var remove = document.createElement("button");
        remove.type = "button";
        remove.className = "file-remove";
        remove.textContent = "Retirer";
        remove.addEventListener("click", function () {
          var removed = files.splice(index, 1)[0];
          if (removed) {
            URL.revokeObjectURL(removed.url);
          }
          renderList();
        });

        info.appendChild(name);
        info.appendChild(meta);
        info.appendChild(status);
        actions.appendChild(open);
        if (item.serverUrl) {
          var server = document.createElement("a");
          server.className = "file-link";
          server.href = item.serverUrl;
          server.target = "_blank";
          server.rel = "noopener";
          server.textContent = "Serveur";
          actions.appendChild(server);
        }
        actions.appendChild(remove);
        li.appendChild(info);
        li.appendChild(actions);
        ul.appendChild(li);
      });

      list.appendChild(ul);
      updateUploadButton();
    }

    function addFiles(fileList) {
      var added = 0;
      Array.prototype.forEach.call(fileList, function (file) {
        var name = file.name ? file.name.toLowerCase() : "";
        var isPdf = file.type === "application/pdf" || name.slice(-4) === ".pdf";
        if (!isPdf) {
          return;
        }
        files.push({
          file: file,
          url: URL.createObjectURL(file),
          status: "pending",
          serverUrl: "",
          error: "",
        });
        added += 1;
      });

      if (added) {
        renderList();
      }
    }

    function resetInput() {
      input.value = "";
    }

    function uploadFile(item) {
      var payload = new FormData();
      payload.append("pdf", item.file, item.file.name);

      var uploadUrl = window.location.origin + "/upload";

      return fetch(uploadUrl, {
        method: "POST",
        body: payload,
      }).then(function (response) {
        return response
          .json()
          .catch(function () {
            return null;
          })
          .then(function (data) {
            if (!response.ok || !data || !data.ok) {
              var message = data && data.error ? data.error : "Erreur lors de l'upload.";
              throw new Error(message);
            }
            return data;
          });
      });
    }

    function uploadAll() {
      if (isUploading) {
        return;
      }
      var queue = files.filter(function (item) {
        return item.status !== "done";
      });
      if (!queue.length) {
        updateUploadButton();
        return;
      }

      isUploading = true;
      updateUploadButton();

      function next() {
        var item = queue.shift();
        if (!item) {
          isUploading = false;
          renderList();
          return;
        }

        item.status = "uploading";
        item.error = "";
        renderList();

        uploadFile(item)
          .then(function (data) {
            item.status = "done";
            var listUrl = data.list_url || "/upload/";
            item.serverUrl = new URL(listUrl, window.location.origin).toString();
          })
          .catch(function (error) {
            item.status = "error";
            item.error = error && error.message ? error.message : "Erreur";
          })
          .then(function () {
            renderList();
            next();
          });
      }

      next();
    }

    input.addEventListener("change", function () {
      if (input.files && input.files.length) {
        addFiles(input.files);
      }
      resetInput();
    });

    dropzone.addEventListener("dragover", function (event) {
      event.preventDefault();
      dropzone.classList.add("is-drag");
    });

    dropzone.addEventListener("dragleave", function () {
      dropzone.classList.remove("is-drag");
    });

    dropzone.addEventListener("dragend", function () {
      dropzone.classList.remove("is-drag");
    });

    dropzone.addEventListener("drop", function (event) {
      event.preventDefault();
      dropzone.classList.remove("is-drag");
      if (event.dataTransfer && event.dataTransfer.files) {
        addFiles(event.dataTransfer.files);
      }
    });

    if (uploadButton) {
      uploadButton.addEventListener("click", function () {
        uploadAll();
      });
    }

    renderList();
  }

  function initServerDocuments() {
    var list = document.querySelector("[data-server-list]");
    var button = document.querySelector('[data-action="fetch-docs"]');
    var status = document.querySelector("[data-server-status]");
    if (!list || !button) {
      return;
    }

    var isLoading = false;
    var defaultLabel = button.textContent;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function setLoading(active) {
      isLoading = active;
      button.disabled = active;
      button.textContent = active ? "Chargement..." : defaultLabel;
    }

    function renderEmpty(message) {
      list.innerHTML = "";
      var empty = document.createElement("p");
      empty.className = "file-empty";
      empty.textContent = message;
      list.appendChild(empty);
    }

    function renderList(items) {
      list.innerHTML = "";
      if (!items.length) {
        renderEmpty("Aucun document sur le serveur.");
        return;
      }

      var ul = document.createElement("ul");
      ul.className = "file-items";

      items.forEach(function (item) {
        var li = document.createElement("li");
        li.className = "file-item";

        var info = document.createElement("div");
        info.className = "file-info";

        var name = document.createElement("span");
        name.className = "file-name";
        name.textContent = item.name;

        var meta = document.createElement("span");
        meta.className = "file-meta";

        var dateText = "";
        if (item.mtime) {
          var date = new Date(item.mtime * 1000);
          dateText = date.toLocaleString("fr-FR");
        }
        meta.textContent = dateText
          ? formatBytes(item.size) + " • " + dateText
          : formatBytes(item.size);

        var actions = document.createElement("div");
        actions.className = "file-actions";

        var open = document.createElement("a");
        open.className = "file-link";
        open.href = new URL(item.url, window.location.origin).toString();
        open.target = "_blank";
        open.rel = "noopener";
        open.textContent = "Ouvrir";

        var remove = document.createElement("button");
        remove.type = "button";
        remove.className = "file-remove";
        remove.textContent = "Supprimer";
        remove.addEventListener("click", function () {
          if (!confirm("Supprimer " + item.name + " ?")) {
            return;
          }
          deleteDocument(item.name);
        });

        info.appendChild(name);
        info.appendChild(meta);
        actions.appendChild(open);
        actions.appendChild(remove);
        li.appendChild(info);
        li.appendChild(actions);
        ul.appendChild(li);
      });

      list.appendChild(ul);
    }

    function fetchDocuments() {
      if (isLoading) {
        return;
      }
      setLoading(true);
      setStatus("Chargement en cours...");
      var listUrl = window.location.origin + "/upload_list";
      fetchJson(listUrl, { cache: "no-store" })
        .then(function (data) {
          renderList(data.items || []);
          setStatus("Liste chargee.");
        })
        .catch(function (error) {
          renderEmpty("Erreur lors du chargement.");
          setStatus(error && error.message ? error.message : "Erreur lors du chargement.");
        })
        .finally(function () {
          setLoading(false);
        });
    }

    function deleteDocument(name) {
      if (isLoading) {
        return;
      }
      setLoading(true);
      setStatus("Suppression en cours...");
      var deleteUrl = window.location.origin + "/upload_delete";
      fetchJson(deleteUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name }),
      })
        .then(function () {
          fetchDocuments();
        })
        .catch(function (error) {
          setStatus(error && error.message ? error.message : "Suppression impossible.");
          setLoading(false);
        });
    }

    button.addEventListener("click", function () {
      fetchDocuments();
    });
  }

  function onReady() {
    var statusLink = document.querySelector('[data-action="status"]');
    var modal = document.getElementById("status-modal");
    initPdfUploader();
    initServerDocuments();
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
