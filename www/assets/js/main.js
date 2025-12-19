(function () {
  "use strict";

  function onReady() {
    var statusLink = document.querySelector('[data-action="status"]');
    if (!statusLink) {
      return;
    }

    statusLink.addEventListener("click", function (event) {
      event.preventDefault();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
