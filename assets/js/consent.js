/* Cookie banner + Google Consent Mode v2 for Tickets & Tails.
 * Defaults are set inline in <head> (denied) before AdSense loads.
 * This file updates consent on choice and draws the banner.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "tt-cookie-consent";
  var KEYS = ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"];

  function deniedState() {
    return {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied"
    };
  }

  function grantedState() {
    return {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted"
    };
  }

  function loadStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !data.choice) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function persist(choice, state) {
    var data = {
      version: 1,
      choice: choice,
      ad_storage: state.ad_storage,
      ad_user_data: state.ad_user_data,
      ad_personalization: state.ad_personalization,
      analytics_storage: state.analytics_storage,
      updated: new Date().toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* private mode */ }
    return data;
  }

  function applyConsent(state) {
    var update = {};
    KEYS.forEach(function (k) {
      update[k] = state[k] === "granted" ? "granted" : "denied";
    });
    if (typeof gtag === "function") {
      gtag("consent", "update", update);
    }
    window.adsbygoogle = window.adsbygoogle || [];
    var personalised = update.ad_personalization === "granted" && update.ad_storage === "granted";
    window.adsbygoogle.requestNonPersonalizedAds = personalised ? 0 : 1;
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === "className") node.className = attrs[key];
        else if (key === "text") node.textContent = attrs[key];
        else if (key.indexOf("on") === 0 && typeof attrs[key] === "function") {
          node.addEventListener(key.slice(2).toLowerCase(), attrs[key]);
        } else if (attrs[key] !== null && attrs[key] !== undefined && attrs[key] !== false) {
          node.setAttribute(key, attrs[key] === true ? "" : String(attrs[key]));
        }
      });
    }
    (children || []).forEach(function (child) {
      if (child) node.appendChild(child);
    });
    return node;
  }

  var bannerRoot = null;
  var lastFocus = null;
  var settingsOpen = false;

  var padObserver = null;

  function bannerHeight() {
    if (!bannerRoot || bannerRoot.hidden) return 0;
    return Math.ceil(bannerRoot.getBoundingClientRect().height);
  }

  function syncPad() {
    if (!bannerRoot || bannerRoot.hidden) {
      document.body.style.paddingBottom = "";
      return;
    }
    document.body.style.paddingBottom = bannerHeight() + "px";
  }

  function watchPad() {
    syncPad();
    if (padObserver || typeof ResizeObserver === "undefined" || !bannerRoot) return;
    padObserver = new ResizeObserver(syncPad);
    padObserver.observe(bannerRoot);
  }

  function hideBanner() {
    if (bannerRoot) {
      bannerRoot.hidden = true;
      bannerRoot.setAttribute("hidden", "");
    }
    document.body.classList.remove("cookie-banner-open");
    syncPad();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function showBanner(openSettings) {
    if (!bannerRoot) return;
    bannerRoot.hidden = false;
    bannerRoot.removeAttribute("hidden");
    document.body.classList.add("cookie-banner-open");
    if (openSettings) openSettingsPanel(true);
    var focusable = bannerRoot.querySelector(openSettings ? "#cookie-save" : "#cookie-accept");
    if (focusable) focusable.focus();
    watchPad();
  }

  function openSettingsPanel(visible) {
    settingsOpen = visible;
    var panel = bannerRoot.querySelector(".cookie-settings");
    var btn = bannerRoot.querySelector("#cookie-settings-btn");
    if (panel) {
      panel.hidden = !visible;
      if (visible) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    }
    if (btn) btn.setAttribute("aria-expanded", visible ? "true" : "false");
    watchPad();
  }

  function currentSettingsFromForm() {
    var ads = bannerRoot.querySelector("#cookie-ads");
    var analytics = bannerRoot.querySelector("#cookie-analytics");
    var adsOn = ads && ads.checked;
    var anOn = analytics && analytics.checked;
    return {
      ad_storage: adsOn ? "granted" : "denied",
      ad_user_data: adsOn ? "granted" : "denied",
      ad_personalization: adsOn ? "granted" : "denied",
      analytics_storage: anOn ? "granted" : "denied"
    };
  }

  function syncForm(state) {
    var ads = bannerRoot.querySelector("#cookie-ads");
    var analytics = bannerRoot.querySelector("#cookie-analytics");
    if (ads) ads.checked = state.ad_storage === "granted";
    if (analytics) analytics.checked = state.analytics_storage === "granted";
  }

  function handleAccept() {
    var state = grantedState();
    persist("accept", state);
    applyConsent(state);
    hideBanner();
  }

  function handleReject() {
    var state = deniedState();
    persist("reject", state);
    applyConsent(state);
    hideBanner();
  }

  function handleSave() {
    var state = currentSettingsFromForm();
    var allOn = KEYS.every(function (k) { return state[k] === "granted"; });
    var allOff = KEYS.every(function (k) { return state[k] === "denied"; });
    var choice = allOn ? "accept" : allOff ? "reject" : "custom";
    persist(choice, state);
    applyConsent(state);
    hideBanner();
  }

  function buildBanner() {
    var stored = loadStored() || deniedState();

    bannerRoot = el("div", {
      id: "cookie-banner",
      className: "cookie-banner",
      role: "dialog",
      "aria-modal": "false",
      "aria-labelledby": "cookie-title",
      "aria-describedby": "cookie-desc"
    });

    var title = el("p", { id: "cookie-title", className: "cookie-title", text: "Cookies on Tickets & Tails" });
    var desc = el("p", {
      id: "cookie-desc",
      className: "cookie-desc",
      text: "We use cookies for Google advertising. Until you accept, ads are non-personalised. Reject, or choose in Settings. See "
    });
    var privacyLink = el("a", { href: "/privacy/", text: "Privacy & Cookies" });
    privacyLink.style.whiteSpace = "nowrap";
    desc.appendChild(privacyLink);
    desc.appendChild(document.createTextNode(" page."));

    var adsBox = el("input", { type: "checkbox", id: "cookie-ads" });
    var anBox = el("input", { type: "checkbox", id: "cookie-analytics" });
    adsBox.checked = stored.ad_storage === "granted";
    anBox.checked = stored.analytics_storage === "granted";

    var settings = el("div", { className: "cookie-settings", id: "cookie-settings-panel", hidden: true }, [
      el("fieldset", {}, [
        el("legend", { text: "Cookie settings" }),
        el("label", { className: "cookie-opt" }, [
          adsBox,
          el("span", { text: "Advertising cookies — Google AdSense (ad storage, ad user data and ad personalisation)." })
        ]),
        el("label", { className: "cookie-opt" }, [
          anBox,
          el("span", { text: "Analytics cookies — help us understand how the journal is read." })
        ])
      ])
    ]);

    var rejectBtn = el("button", { type: "button", id: "cookie-reject", className: "cookie-btn cookie-btn-reject", text: "Reject" });
    var settingsBtn = el("button", { type: "button", id: "cookie-settings-btn", className: "cookie-btn cookie-btn-settings", text: "Settings", "aria-expanded": "false", "aria-controls": "cookie-settings-panel" });
    var acceptBtn = el("button", { type: "button", id: "cookie-accept", className: "cookie-btn cookie-btn-accept", text: "Accept" });
    var saveBtn = el("button", { type: "button", id: "cookie-save", className: "cookie-btn cookie-btn-accept", text: "Save choices" });

    rejectBtn.addEventListener("click", handleReject);
    acceptBtn.addEventListener("click", handleAccept);
    saveBtn.addEventListener("click", handleSave);
    settingsBtn.addEventListener("click", function () {
      openSettingsPanel(!settingsOpen);
      if (settingsOpen) {
        var first = bannerRoot.querySelector("#cookie-ads");
        if (first) first.focus();
      }
    });

    var actions = el("div", { className: "cookie-actions" }, [rejectBtn, settingsBtn, acceptBtn, saveBtn]);
    var inner = el("div", { className: "cookie-inner" }, [title, desc, settings, actions]);
    bannerRoot.appendChild(inner);
    document.body.appendChild(bannerRoot);

    bannerRoot.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && settingsOpen) {
        ev.preventDefault();
        openSettingsPanel(false);
        settingsBtn.focus();
      }
    });
  }

  function applyAffiliateLinks() {
    var tag = (window.TT_CONFIG && window.TT_CONFIG.amazonAssociateTag) || "";
    document.querySelectorAll("a[data-amazon-asin]").forEach(function (link) {
      var asin = link.getAttribute("data-amazon-asin");
      if (!asin || !tag) return;
      link.setAttribute("href", "https://www.amazon.com/dp/" + encodeURIComponent(asin) + "?tag=" + encodeURIComponent(tag));
      var rel = (link.getAttribute("rel") || "").split(/\s+/).filter(Boolean);
      ["sponsored", "nofollow", "noopener"].forEach(function (flag) {
        if (rel.indexOf(flag) === -1) rel.push(flag);
      });
      link.setAttribute("rel", rel.join(" "));
      if (!link.getAttribute("target")) link.setAttribute("target", "_blank");
    });
  }

  window.TTConsent = {
    open: function () {
      lastFocus = document.activeElement;
      var stored = loadStored();
      if (stored) syncForm(stored);
      showBanner(true);
    },
    reset: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      applyConsent(deniedState());
      lastFocus = document.activeElement;
      syncForm(deniedState());
      showBanner(false);
    }
  };

  function init() {
    buildBanner();
    applyAffiliateLinks();
    var stored = loadStored();
    window.addEventListener("resize", syncPad);
    if (stored) {
      applyConsent(stored);
      hideBanner();
    } else {
      showBanner(false);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
