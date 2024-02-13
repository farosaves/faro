import { n as noop, s as safe_not_equal, l as subscribe, r as run_all, i as is_function } from "./scheduler.9_m0mCEV.js";
const subscriber_queue = [];
function readable(value, start) {
  return {
    subscribe: writable(value, start).subscribe
  };
}
function writable(value, start = noop) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run, invalidate = noop) {
    const subscriber = [run, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set, update) || noop;
    }
    run(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0 && stop) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function derived(stores2, fn, initial_value) {
  const single = !Array.isArray(stores2);
  const stores_array = single ? [stores2] : stores2;
  if (!stores_array.every(Boolean)) {
    throw new Error("derived() expects stores as input, got a falsy value");
  }
  const auto = fn.length < 2;
  return readable(initial_value, (set, update) => {
    let started = false;
    const values = [];
    let pending = 0;
    let cleanup = noop;
    const sync = () => {
      if (pending) {
        return;
      }
      cleanup();
      const result = fn(single ? values[0] : values, set, update);
      if (auto) {
        set(result);
      } else {
        cleanup = is_function(result) ? result : noop;
      }
    };
    const unsubscribers = stores_array.map(
      (store, i) => subscribe(
        store,
        (value) => {
          values[i] = value;
          pending &= ~(1 << i);
          if (started) {
            sync();
          }
        },
        () => {
          pending |= 1 << i;
        }
      )
    );
    started = true;
    sync();
    return function stop() {
      run_all(unsubscribers);
      cleanup();
      started = false;
    };
  });
}
const base = globalThis.__sveltekit_13o77yz?.base ?? "";
const assets = globalThis.__sveltekit_13o77yz?.assets ?? base;
const version = "1707831945937";
const SNAPSHOT_KEY = "sveltekit:snapshot";
const SCROLL_KEY = "sveltekit:scroll";
const STATES_KEY = "sveltekit:states";
const PAGE_URL_KEY = "sveltekit:pageurl";
const HISTORY_INDEX = "sveltekit:history";
const NAVIGATION_INDEX = "sveltekit:navigation";
const PRELOAD_PRIORITIES = (
  /** @type {const} */
  {
    tap: 1,
    hover: 2,
    viewport: 3,
    eager: 4,
    off: -1,
    false: -1
  }
);
const origin = location.origin;
function resolve_url(url) {
  if (url instanceof URL)
    return url;
  let baseURI = document.baseURI;
  if (!baseURI) {
    const baseTags = document.getElementsByTagName("base");
    baseURI = baseTags.length ? baseTags[0].href : document.URL;
  }
  return new URL(url, baseURI);
}
function scroll_state() {
  return {
    x: pageXOffset,
    y: pageYOffset
  };
}
function link_option(element, name) {
  const value = (
    /** @type {ValidLinkOptions<T> | null} */
    element.getAttribute(`data-sveltekit-${name}`)
  );
  return value;
}
const levels = {
  ...PRELOAD_PRIORITIES,
  "": PRELOAD_PRIORITIES.hover
};
function parent_element(element) {
  let parent = element.assignedSlot ?? element.parentNode;
  if (parent?.nodeType === 11)
    parent = parent.host;
  return (
    /** @type {Element} */
    parent
  );
}
function find_anchor(element, target) {
  while (element && element !== target) {
    if (element.nodeName.toUpperCase() === "A" && element.hasAttribute("href")) {
      return (
        /** @type {HTMLAnchorElement | SVGAElement} */
        element
      );
    }
    element = /** @type {Element} */
    parent_element(element);
  }
}
function get_link_info(a, base2) {
  let url;
  try {
    url = new URL(a instanceof SVGAElement ? a.href.baseVal : a.href, document.baseURI);
  } catch {
  }
  const target = a instanceof SVGAElement ? a.target.baseVal : a.target;
  const external = !url || !!target || is_external_url(url, base2) || (a.getAttribute("rel") || "").split(/\s+/).includes("external");
  const download = url?.origin === origin && a.hasAttribute("download");
  return { url, external, target, download };
}
function get_router_options(element) {
  let keepfocus = null;
  let noscroll = null;
  let preload_code = null;
  let preload_data = null;
  let reload = null;
  let replace_state = null;
  let el = element;
  while (el && el !== document.documentElement) {
    if (preload_code === null)
      preload_code = link_option(el, "preload-code");
    if (preload_data === null)
      preload_data = link_option(el, "preload-data");
    if (keepfocus === null)
      keepfocus = link_option(el, "keepfocus");
    if (noscroll === null)
      noscroll = link_option(el, "noscroll");
    if (reload === null)
      reload = link_option(el, "reload");
    if (replace_state === null)
      replace_state = link_option(el, "replacestate");
    el = /** @type {Element} */
    parent_element(el);
  }
  function get_option_state(value) {
    switch (value) {
      case "":
      case "true":
        return true;
      case "off":
      case "false":
        return false;
      default:
        return void 0;
    }
  }
  return {
    preload_code: levels[preload_code ?? "off"],
    preload_data: levels[preload_data ?? "off"],
    keepfocus: get_option_state(keepfocus),
    noscroll: get_option_state(noscroll),
    reload: get_option_state(reload),
    replace_state: get_option_state(replace_state)
  };
}
function notifiable_store(value) {
  const store = writable(value);
  let ready = true;
  function notify() {
    ready = true;
    store.update((val) => val);
  }
  function set(new_value) {
    ready = false;
    store.set(new_value);
  }
  function subscribe2(run) {
    let old_value;
    return store.subscribe((new_value) => {
      if (old_value === void 0 || ready && new_value !== old_value) {
        run(old_value = new_value);
      }
    });
  }
  return { notify, set, subscribe: subscribe2 };
}
function create_updated_store() {
  const { set, subscribe: subscribe2 } = writable(false);
  let timeout;
  async function check() {
    clearTimeout(timeout);
    try {
      const res = await fetch(`${assets}/${"app/version.json"}`, {
        headers: {
          pragma: "no-cache",
          "cache-control": "no-cache"
        }
      });
      if (!res.ok) {
        return false;
      }
      const data = await res.json();
      const updated = data.version !== version;
      if (updated) {
        set(true);
        clearTimeout(timeout);
      }
      return updated;
    } catch {
      return false;
    }
  }
  return {
    subscribe: subscribe2,
    check
  };
}
function is_external_url(url, base2) {
  return url.origin !== origin || !url.pathname.startsWith(base2);
}
function init(opts) {
  opts.client;
}
const stores = {
  url: /* @__PURE__ */ notifiable_store({}),
  page: /* @__PURE__ */ notifiable_store({}),
  navigating: /* @__PURE__ */ writable(
    /** @type {import('@sveltejs/kit').Navigation | null} */
    null
  ),
  updated: /* @__PURE__ */ create_updated_store()
};
export {
  HISTORY_INDEX as H,
  NAVIGATION_INDEX as N,
  PAGE_URL_KEY as P,
  SCROLL_KEY as S,
  STATES_KEY as a,
  SNAPSHOT_KEY as b,
  get_router_options as c,
  stores as d,
  base as e,
  find_anchor as f,
  get_link_info as g,
  PRELOAD_PRIORITIES as h,
  is_external_url as i,
  init as j,
  derived as k,
  origin as o,
  resolve_url as r,
  scroll_state as s,
  writable as w
};
