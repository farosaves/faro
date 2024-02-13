import { f as get_store_value, s as safe_not_equal, h as null_to_empty, n as noop$1, r as run_all, i as is_function, b as binding_callbacks, j as add_flush_callback, e as component_subscribe, k as set_store_value, o as onMount, l as subscribe } from "../chunks/scheduler.9_m0mCEV.js";
import { S as SvelteComponent, i as init, g as element, m as text, s as space, e as empty, h as claim_element, j as children, n as claim_text, f as detach, c as claim_space, k as attr, B as toggle_class, a as insert_hydration, x as append_hydration, z as set_input_value, A as listen, o as set_data, C as destroy_each, H as HtmlTagHydration, D as claim_html_tag, E as prevent_default, y as get_svelte_dataset, F as bind$1, r as create_component, u as claim_component, l as set_style, v as mount_component, d as transition_in, t as transition_out, w as destroy_component, p as group_outros, b as check_outros } from "../chunks/index.Iyl_OSSJ.js";
import { p as page } from "../chunks/stores.fMIk4gAR.js";
import { i as identity$1, h as has, F as Foldable, A as API_ADDRESS, _ as _function, g as getNotes, s as some, n as none, l as logIfError, p as partition_by_id, m as map$1, a as gotoSnippet, b as getSession } from "../chunks/utils.LWF-TT7I.js";
import { w as writable, k as derived } from "../chunks/singletons.iJVCNPft.js";
import { c as commonjsGlobal } from "../chunks/_commonjsHelpers.jUUCeJQL.js";
function ensure_array_like(array_like_or_iterator) {
  return array_like_or_iterator?.length !== void 0 ? array_like_or_iterator : Array.from(array_like_or_iterator);
}
var last = function() {
  return { concat: function(_2, y) {
    return y;
  } };
};
var Eq$1 = {
  equals: function(first, second) {
    return first === second;
  }
};
var Ord$1 = {
  equals: Eq$1.equals,
  compare: function(first, second) {
    return first < second ? -1 : first > second ? 1 : 0;
  }
};
function fromFoldable$1(M, F) {
  var fromFoldableMapM = fromFoldableMap(M, F);
  return function(fka) {
    return fromFoldableMapM(fka, identity$1);
  };
}
function fromFoldableMap(M, F) {
  return function(ta, f) {
    return F.reduce(ta, {}, function(r, a) {
      var _a = f(a), k = _a[0], b = _a[1];
      r[k] = has.call(r, k) ? M.concat(r[k], b) : b;
      return r;
    });
  };
}
var __assign = function() {
  __assign = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
var keys_ = function(O) {
  return function(r) {
    return Object.keys(r).sort(O.compare);
  };
};
function collect(O) {
  if (typeof O === "function") {
    return collect(Ord$1)(O);
  }
  var keysO = keys_(O);
  return function(f) {
    return function(r) {
      var out = [];
      for (var _i = 0, _a = keysO(r); _i < _a.length; _i++) {
        var key = _a[_i];
        out.push(f(key, r[key]));
      }
      return out;
    };
  };
}
var toArray = /* @__PURE__ */ collect(Ord$1)(function(k, a) {
  return [
    k,
    a
  ];
});
function fromFoldable(M, F) {
  return fromFoldable$1(M, F);
}
var fromEntries = function(fa) {
  return fromFoldable(last(), Foldable)(fa);
};
function identity(x) {
  return x;
}
function pipeFromArray(fns) {
  if (fns.length === 0) {
    return identity;
  }
  if (fns.length === 1) {
    return fns[0];
  }
  return function piped(input) {
    return fns.reduce((prev, fn) => fn(prev), input);
  };
}
function observable(subscribe2) {
  const self = {
    subscribe(observer) {
      let teardownRef = null;
      let isDone = false;
      let unsubscribed = false;
      let teardownImmediately = false;
      function unsubscribe() {
        if (teardownRef === null) {
          teardownImmediately = true;
          return;
        }
        if (unsubscribed) {
          return;
        }
        unsubscribed = true;
        if (typeof teardownRef === "function") {
          teardownRef();
        } else if (teardownRef) {
          teardownRef.unsubscribe();
        }
      }
      teardownRef = subscribe2({
        next(value) {
          if (isDone) {
            return;
          }
          observer.next?.(value);
        },
        error(err2) {
          if (isDone) {
            return;
          }
          isDone = true;
          observer.error?.(err2);
          unsubscribe();
        },
        complete() {
          if (isDone) {
            return;
          }
          isDone = true;
          observer.complete?.();
          unsubscribe();
        }
      });
      if (teardownImmediately) {
        unsubscribe();
      }
      return {
        unsubscribe
      };
    },
    pipe(...operations) {
      return pipeFromArray(operations)(self);
    }
  };
  return self;
}
function share(_opts) {
  return (originalObserver) => {
    let refCount = 0;
    let subscription = null;
    const observers = [];
    function startIfNeeded() {
      if (subscription) {
        return;
      }
      subscription = originalObserver.subscribe({
        next(value) {
          for (const observer of observers) {
            observer.next?.(value);
          }
        },
        error(error) {
          for (const observer of observers) {
            observer.error?.(error);
          }
        },
        complete() {
          for (const observer of observers) {
            observer.complete?.();
          }
        }
      });
    }
    function resetIfNeeded() {
      if (refCount === 0 && subscription) {
        const _sub = subscription;
        subscription = null;
        _sub.unsubscribe();
      }
    }
    return {
      subscribe(observer) {
        refCount++;
        observers.push(observer);
        startIfNeeded();
        return {
          unsubscribe() {
            refCount--;
            resetIfNeeded();
            const index = observers.findIndex((v) => v === observer);
            if (index > -1) {
              observers.splice(index, 1);
            }
          }
        };
      }
    };
  };
}
class ObservableAbortError extends Error {
  constructor(message) {
    super(message);
    this.name = "ObservableAbortError";
    Object.setPrototypeOf(this, ObservableAbortError.prototype);
  }
}
function observableToPromise(observable2) {
  let abort;
  const promise = new Promise((resolve, reject) => {
    let isDone = false;
    function onDone() {
      if (isDone) {
        return;
      }
      isDone = true;
      reject(new ObservableAbortError("This operation was aborted."));
      obs$.unsubscribe();
    }
    const obs$ = observable2.subscribe({
      next(data) {
        isDone = true;
        resolve(data);
        onDone();
      },
      error(data) {
        isDone = true;
        reject(data);
        onDone();
      },
      complete() {
        isDone = true;
        onDone();
      }
    });
    abort = onDone;
  });
  return {
    promise,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    abort
  };
}
function createChain(opts) {
  return observable((observer) => {
    function execute(index = 0, op = opts.op) {
      const next = opts.links[index];
      if (!next) {
        throw new Error("No more links to execute - did you forget to add an ending link?");
      }
      const subscription = next({
        op,
        next(nextOp) {
          const nextObserver = execute(index + 1, nextOp);
          return nextObserver;
        }
      });
      return subscription;
    }
    const obs$ = execute();
    return obs$.subscribe(observer);
  });
}
function invert(obj) {
  const newObj = /* @__PURE__ */ Object.create(null);
  for (const key in obj) {
    const v = obj[key];
    newObj[v] = key;
  }
  return newObj;
}
const TRPC_ERROR_CODES_BY_KEY = {
  /**
  * Invalid JSON was received by the server.
  * An error occurred on the server while parsing the JSON text.
  */
  PARSE_ERROR: -32700,
  /**
  * The JSON sent is not a valid Request object.
  */
  BAD_REQUEST: -32600,
  // Internal JSON-RPC error
  INTERNAL_SERVER_ERROR: -32603,
  NOT_IMPLEMENTED: -32603,
  // Implementation specific errors
  UNAUTHORIZED: -32001,
  FORBIDDEN: -32003,
  NOT_FOUND: -32004,
  METHOD_NOT_SUPPORTED: -32005,
  TIMEOUT: -32008,
  CONFLICT: -32009,
  PRECONDITION_FAILED: -32012,
  PAYLOAD_TOO_LARGE: -32013,
  UNPROCESSABLE_CONTENT: -32022,
  TOO_MANY_REQUESTS: -32029,
  CLIENT_CLOSED_REQUEST: -32099
};
invert(TRPC_ERROR_CODES_BY_KEY);
invert(TRPC_ERROR_CODES_BY_KEY);
const noop = () => {
};
function createInnerProxy(callback, path) {
  const proxy = new Proxy(noop, {
    get(_obj, key) {
      if (typeof key !== "string" || key === "then") {
        return void 0;
      }
      return createInnerProxy(callback, [
        ...path,
        key
      ]);
    },
    apply(_1, _2, args) {
      const isApply = path[path.length - 1] === "apply";
      return callback({
        args: isApply ? args.length >= 2 ? args[1] : [] : args,
        path: isApply ? path.slice(0, -1) : path
      });
    }
  });
  return proxy;
}
const createRecursiveProxy = (callback) => createInnerProxy(callback, []);
const createFlatProxy = (callback) => {
  return new Proxy(noop, {
    get(_obj, name) {
      if (typeof name !== "string" || name === "then") {
        return void 0;
      }
      return callback(name);
    }
  });
};
function isObject$1(value) {
  return !!value && !Array.isArray(value) && typeof value === "object";
}
class UnknownCauseError extends Error {
}
function getCauseFromUnknown(cause) {
  if (cause instanceof Error) {
    return cause;
  }
  const type = typeof cause;
  if (type === "undefined" || type === "function" || cause === null) {
    return void 0;
  }
  if (type !== "object") {
    return new Error(String(cause));
  }
  if (isObject$1(cause)) {
    const err2 = new UnknownCauseError();
    for (const key in cause) {
      err2[key] = cause[key];
    }
    return err2;
  }
  return void 0;
}
function isObject(value) {
  return !!value && !Array.isArray(value) && typeof value === "object";
}
function transformResultInner(response, runtime) {
  if ("error" in response) {
    const error = runtime.transformer.deserialize(response.error);
    return {
      ok: false,
      error: {
        ...response,
        error
      }
    };
  }
  const result = {
    ...response.result,
    ...(!response.result.type || response.result.type === "data") && {
      type: "data",
      data: runtime.transformer.deserialize(response.result.data)
    }
  };
  return {
    ok: true,
    result
  };
}
class TransformResultError extends Error {
  constructor() {
    super("Unable to transform response from server");
  }
}
function transformResult(response, runtime) {
  let result;
  try {
    result = transformResultInner(response, runtime);
  } catch (err2) {
    throw new TransformResultError();
  }
  if (!result.ok && (!isObject(result.error.error) || typeof result.error.error.code !== "number")) {
    throw new TransformResultError();
  }
  if (result.ok && !isObject(result.result)) {
    throw new TransformResultError();
  }
  return result;
}
function isTRPCClientError(cause) {
  return cause instanceof TRPCClientError || /**
  * @deprecated
  * Delete in next major
  */
  cause instanceof Error && cause.name === "TRPCClientError";
}
function isTRPCErrorResponse(obj) {
  return isObject(obj) && isObject(obj.error) && typeof obj.error.code === "number" && typeof obj.error.message === "string";
}
class TRPCClientError extends Error {
  static from(_cause, opts = {}) {
    const cause = _cause;
    if (isTRPCClientError(cause)) {
      if (opts.meta) {
        cause.meta = {
          ...cause.meta,
          ...opts.meta
        };
      }
      return cause;
    }
    if (isTRPCErrorResponse(cause)) {
      return new TRPCClientError(cause.error.message, {
        ...opts,
        result: cause
      });
    }
    if (!(cause instanceof Error)) {
      return new TRPCClientError("Unknown error", {
        ...opts,
        cause
      });
    }
    return new TRPCClientError(cause.message, {
      ...opts,
      cause: getCauseFromUnknown(cause)
    });
  }
  constructor(message, opts) {
    const cause = opts?.cause;
    super(message, {
      cause
    });
    this.meta = opts?.meta;
    this.cause = cause;
    this.shape = opts?.result?.error;
    this.data = opts?.result?.error.data;
    this.name = "TRPCClientError";
    Object.setPrototypeOf(this, TRPCClientError.prototype);
  }
}
const isFunction = (fn) => typeof fn === "function";
function getFetch(customFetchImpl) {
  if (customFetchImpl) {
    return customFetchImpl;
  }
  if (typeof window !== "undefined" && isFunction(window.fetch)) {
    return window.fetch;
  }
  if (typeof globalThis !== "undefined" && isFunction(globalThis.fetch)) {
    return globalThis.fetch;
  }
  throw new Error("No fetch implementation found");
}
function getAbortController(customAbortControllerImpl) {
  if (customAbortControllerImpl) {
    return customAbortControllerImpl;
  }
  if (typeof window !== "undefined" && window.AbortController) {
    return window.AbortController;
  }
  if (typeof globalThis !== "undefined" && globalThis.AbortController) {
    return globalThis.AbortController;
  }
  return null;
}
function resolveHTTPLinkOptions(opts) {
  return {
    url: opts.url.toString().replace(/\/$/, ""),
    fetch: opts.fetch,
    AbortController: getAbortController(opts.AbortController)
  };
}
function arrayToDict(array) {
  const dict = {};
  for (let index = 0; index < array.length; index++) {
    const element2 = array[index];
    dict[index] = element2;
  }
  return dict;
}
const METHOD = {
  query: "GET",
  mutation: "POST"
};
function getInput(opts) {
  return "input" in opts ? opts.runtime.transformer.serialize(opts.input) : arrayToDict(opts.inputs.map((_input) => opts.runtime.transformer.serialize(_input)));
}
const getUrl = (opts) => {
  let url = opts.url + "/" + opts.path;
  const queryParts = [];
  if ("inputs" in opts) {
    queryParts.push("batch=1");
  }
  if (opts.type === "query") {
    const input = getInput(opts);
    if (input !== void 0) {
      queryParts.push(`input=${encodeURIComponent(JSON.stringify(input))}`);
    }
  }
  if (queryParts.length) {
    url += "?" + queryParts.join("&");
  }
  return url;
};
const getBody = (opts) => {
  if (opts.type === "query") {
    return void 0;
  }
  const input = getInput(opts);
  return input !== void 0 ? JSON.stringify(input) : void 0;
};
const jsonHttpRequester = (opts) => {
  return httpRequest({
    ...opts,
    contentTypeHeader: "application/json",
    getUrl,
    getBody
  });
};
async function fetchHTTPResponse(opts, ac) {
  const url = opts.getUrl(opts);
  const body = opts.getBody(opts);
  const { type } = opts;
  const resolvedHeaders = await opts.headers();
  /* istanbul ignore if -- @preserve */
  if (type === "subscription") {
    throw new Error("Subscriptions should use wsLink");
  }
  const headers = {
    ...opts.contentTypeHeader ? {
      "content-type": opts.contentTypeHeader
    } : {},
    ...opts.batchModeHeader ? {
      "trpc-batch-mode": opts.batchModeHeader
    } : {},
    ...resolvedHeaders
  };
  return getFetch(opts.fetch)(url, {
    method: METHOD[type],
    signal: ac?.signal,
    body,
    headers
  });
}
function httpRequest(opts) {
  const ac = opts.AbortController ? new opts.AbortController() : null;
  const meta = {};
  let done = false;
  const promise = new Promise((resolve, reject) => {
    fetchHTTPResponse(opts, ac).then((_res) => {
      meta.response = _res;
      done = true;
      return _res.json();
    }).then((json) => {
      meta.responseJSON = json;
      resolve({
        json,
        meta
      });
    }).catch((err2) => {
      done = true;
      reject(TRPCClientError.from(err2, {
        meta
      }));
    });
  });
  const cancel = () => {
    if (!done) {
      ac?.abort();
    }
  };
  return {
    promise,
    cancel
  };
}
const throwFatalError = () => {
  throw new Error("Something went wrong. Please submit an issue at https://github.com/trpc/trpc/issues/new");
};
function dataLoader(batchLoader) {
  let pendingItems = null;
  let dispatchTimer = null;
  const destroyTimerAndPendingItems = () => {
    clearTimeout(dispatchTimer);
    dispatchTimer = null;
    pendingItems = null;
  };
  function groupItems(items) {
    const groupedItems = [
      []
    ];
    let index = 0;
    while (true) {
      const item = items[index];
      if (!item) {
        break;
      }
      const lastGroup = groupedItems[groupedItems.length - 1];
      if (item.aborted) {
        item.reject?.(new Error("Aborted"));
        index++;
        continue;
      }
      const isValid = batchLoader.validate(lastGroup.concat(item).map((it) => it.key));
      if (isValid) {
        lastGroup.push(item);
        index++;
        continue;
      }
      if (lastGroup.length === 0) {
        item.reject?.(new Error("Input is too big for a single dispatch"));
        index++;
        continue;
      }
      groupedItems.push([]);
    }
    return groupedItems;
  }
  function dispatch() {
    const groupedItems = groupItems(pendingItems);
    destroyTimerAndPendingItems();
    for (const items of groupedItems) {
      if (!items.length) {
        continue;
      }
      const batch = {
        items,
        cancel: throwFatalError
      };
      for (const item of items) {
        item.batch = batch;
      }
      const unitResolver = (index, value) => {
        const item = batch.items[index];
        item.resolve?.(value);
        item.batch = null;
        item.reject = null;
        item.resolve = null;
      };
      const { promise, cancel } = batchLoader.fetch(batch.items.map((_item) => _item.key), unitResolver);
      batch.cancel = cancel;
      promise.then((result) => {
        for (let i = 0; i < result.length; i++) {
          const value = result[i];
          unitResolver(i, value);
        }
        for (const item of batch.items) {
          item.reject?.(new Error("Missing result"));
          item.batch = null;
        }
      }).catch((cause) => {
        for (const item of batch.items) {
          item.reject?.(cause);
          item.batch = null;
        }
      });
    }
  }
  function load(key) {
    const item = {
      aborted: false,
      key,
      batch: null,
      resolve: throwFatalError,
      reject: throwFatalError
    };
    const promise = new Promise((resolve, reject) => {
      item.reject = reject;
      item.resolve = resolve;
      if (!pendingItems) {
        pendingItems = [];
      }
      pendingItems.push(item);
    });
    if (!dispatchTimer) {
      dispatchTimer = setTimeout(dispatch);
    }
    const cancel = () => {
      item.aborted = true;
      if (item.batch?.items.every((item2) => item2.aborted)) {
        item.batch.cancel();
        item.batch = null;
      }
    };
    return {
      promise,
      cancel
    };
  }
  return {
    load
  };
}
function createHTTPBatchLink(requester) {
  return function httpBatchLink2(opts) {
    const resolvedOpts = resolveHTTPLinkOptions(opts);
    const maxURLLength = opts.maxURLLength ?? Infinity;
    return (runtime) => {
      const batchLoader = (type) => {
        const validate = (batchOps) => {
          if (maxURLLength === Infinity) {
            return true;
          }
          const path = batchOps.map((op) => op.path).join(",");
          const inputs = batchOps.map((op) => op.input);
          const url = getUrl({
            ...resolvedOpts,
            runtime,
            type,
            path,
            inputs
          });
          return url.length <= maxURLLength;
        };
        const fetch = requester({
          ...resolvedOpts,
          runtime,
          type,
          opts
        });
        return {
          validate,
          fetch
        };
      };
      const query = dataLoader(batchLoader("query"));
      const mutation = dataLoader(batchLoader("mutation"));
      const subscription = dataLoader(batchLoader("subscription"));
      const loaders = {
        query,
        subscription,
        mutation
      };
      return ({ op }) => {
        return observable((observer) => {
          const loader = loaders[op.type];
          const { promise, cancel } = loader.load(op);
          let _res = void 0;
          promise.then((res) => {
            _res = res;
            const transformed = transformResult(res.json, runtime);
            if (!transformed.ok) {
              observer.error(TRPCClientError.from(transformed.error, {
                meta: res.meta
              }));
              return;
            }
            observer.next({
              context: res.meta,
              result: transformed.result
            });
            observer.complete();
          }).catch((err2) => {
            observer.error(TRPCClientError.from(err2, {
              meta: _res?.meta
            }));
          });
          return () => {
            cancel();
          };
        });
      };
    };
  };
}
const batchRequester = (requesterOpts) => {
  return (batchOps) => {
    const path = batchOps.map((op) => op.path).join(",");
    const inputs = batchOps.map((op) => op.input);
    const { promise, cancel } = jsonHttpRequester({
      ...requesterOpts,
      path,
      inputs,
      headers() {
        if (!requesterOpts.opts.headers) {
          return {};
        }
        if (typeof requesterOpts.opts.headers === "function") {
          return requesterOpts.opts.headers({
            opList: batchOps
          });
        }
        return requesterOpts.opts.headers;
      }
    });
    return {
      promise: promise.then((res) => {
        const resJSON = Array.isArray(res.json) ? res.json : batchOps.map(() => res.json);
        const result = resJSON.map((item) => ({
          meta: res.meta,
          json: item
        }));
        return result;
      }),
      cancel
    };
  };
};
const httpBatchLink = createHTTPBatchLink(batchRequester);
class TRPCUntypedClient {
  $request({ type, input, path, context = {} }) {
    const chain$ = createChain({
      links: this.links,
      op: {
        id: ++this.requestId,
        type,
        path,
        input,
        context
      }
    });
    return chain$.pipe(share());
  }
  requestAsPromise(opts) {
    const req$ = this.$request(opts);
    const { promise, abort } = observableToPromise(req$);
    const abortablePromise = new Promise((resolve, reject) => {
      opts.signal?.addEventListener("abort", abort);
      promise.then((envelope) => {
        resolve(envelope.result.data);
      }).catch((err2) => {
        reject(TRPCClientError.from(err2));
      });
    });
    return abortablePromise;
  }
  query(path, input, opts) {
    return this.requestAsPromise({
      type: "query",
      path,
      input,
      context: opts?.context,
      signal: opts?.signal
    });
  }
  mutation(path, input, opts) {
    return this.requestAsPromise({
      type: "mutation",
      path,
      input,
      context: opts?.context,
      signal: opts?.signal
    });
  }
  subscription(path, input, opts) {
    const observable$ = this.$request({
      type: "subscription",
      path,
      input,
      context: opts?.context
    });
    return observable$.subscribe({
      next(envelope) {
        if (envelope.result.type === "started") {
          opts.onStarted?.();
        } else if (envelope.result.type === "stopped") {
          opts.onStopped?.();
        } else {
          opts.onData?.(envelope.result.data);
        }
      },
      error(err2) {
        opts.onError?.(err2);
      },
      complete() {
        opts.onComplete?.();
      }
    });
  }
  constructor(opts) {
    this.requestId = 0;
    const combinedTransformer = (() => {
      const transformer = opts.transformer;
      if (!transformer) {
        return {
          input: {
            serialize: (data) => data,
            deserialize: (data) => data
          },
          output: {
            serialize: (data) => data,
            deserialize: (data) => data
          }
        };
      }
      if ("input" in transformer) {
        return opts.transformer;
      }
      return {
        input: transformer,
        output: transformer
      };
    })();
    this.runtime = {
      transformer: {
        serialize: (data) => combinedTransformer.input.serialize(data),
        deserialize: (data) => combinedTransformer.output.deserialize(data)
      },
      combinedTransformer
    };
    this.links = opts.links.map((link) => link(this.runtime));
  }
}
const clientCallTypeMap = {
  query: "query",
  mutate: "mutation",
  subscribe: "subscription"
};
const clientCallTypeToProcedureType = (clientCallType) => {
  return clientCallTypeMap[clientCallType];
};
function createTRPCClientProxy(client) {
  return createFlatProxy((key) => {
    if (client.hasOwnProperty(key)) {
      return client[key];
    }
    if (key === "__untypedClient") {
      return client;
    }
    return createRecursiveProxy(({ path, args }) => {
      const pathCopy = [
        key,
        ...path
      ];
      const procedureType = clientCallTypeToProcedureType(pathCopy.pop());
      const fullPath = pathCopy.join(".");
      return client[procedureType](fullPath, ...args);
    });
  });
}
function createTRPCProxyClient(opts) {
  const client = new TRPCUntypedClient(opts);
  const proxy = createTRPCClientProxy(client);
  return proxy;
}
function createTRPCClient({ links, url = "/trpc", transformer, init: init2, headers } = {
  url: "/trpc"
}) {
  if (links)
    return createTRPCProxyClient({ transformer, links });
  if (typeof window === "undefined" && !init2) {
    throw new Error("Calling createTRPCClient() on the server requires passing a valid LoadEvent argument");
  }
  return createTRPCProxyClient({
    transformer,
    links: [
      httpBatchLink({
        url: typeof window === "undefined" ? `${init2.url.origin}${url}` : `${location.origin}${url}`,
        fetch: typeof window === "undefined" ? init2.fetch : init2?.fetch ?? window.fetch,
        headers
      })
    ]
  });
}
typeof window === "undefined" || "Deno" in window || globalThis.process?.env?.NODE_ENV === "test" || !!globalThis.process?.env?.JEST_WORKER_ID || !!globalThis.process?.env?.VITEST_WORKER_ID;
let browserClient;
function trpc(init2) {
  const isBrowser = typeof window !== "undefined";
  if (isBrowser && browserClient)
    return browserClient;
  const client = createTRPCClient({
    init: init2,
    //@ts-ignore
    links: [
      httpBatchLink({
        url: API_ADDRESS + "/trpc"
        // this works even though warns,
      })
    ]
  });
  if (isBrowser)
    browserClient = client;
  return client;
}
var stores = {
  local: {},
  session: {}
};
function getStorage(type) {
  return type === "local" ? localStorage : sessionStorage;
}
function persisted(key, initialValue, options) {
  var _a, _b, _c, _d;
  const serializer = (_a = options == null ? void 0 : options.serializer) != null ? _a : JSON;
  const storageType = (_b = options == null ? void 0 : options.storage) != null ? _b : "local";
  const syncTabs = (_c = options == null ? void 0 : options.syncTabs) != null ? _c : true;
  const onError = (_d = options == null ? void 0 : options.onError) != null ? _d : (e) => console.error(`Error when writing value from persisted store "${key}" to ${storageType}`, e);
  const browser = typeof window !== "undefined" && typeof document !== "undefined";
  const storage = browser ? getStorage(storageType) : null;
  function updateStorage(key2, value) {
    try {
      storage == null ? void 0 : storage.setItem(key2, serializer.stringify(value));
    } catch (e) {
      onError(e);
    }
  }
  function maybeLoadInitial() {
    const json = storage == null ? void 0 : storage.getItem(key);
    if (json) {
      return serializer.parse(json);
    }
    return initialValue;
  }
  if (!stores[storageType][key]) {
    const initial = maybeLoadInitial();
    const store = writable(initial, (set2) => {
      if (browser && storageType == "local" && syncTabs) {
        const handleStorage = (event) => {
          if (event.key === key)
            set2(event.newValue ? serializer.parse(event.newValue) : null);
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
      }
    });
    const { subscribe: subscribe2, set } = store;
    stores[storageType][key] = {
      set(value) {
        set(value);
        updateStorage(key, value);
      },
      update(callback) {
        return store.update((last2) => {
          const value = callback(last2);
          updateStorage(key, value);
          return value;
        });
      },
      subscribe: subscribe2
    };
  }
  return stores[storageType][key];
}
const _scratches = {
  "pl.wikipedia.org;Kalanchoe": ""
};
const scratches = persisted("scratches", _scratches);
const __source_ids = {
  "pl.wikipedia.org;Kalanchoe": 15
};
const _source_ids = new Proxy(__source_ids, {
  get: (target, name) => name in target ? target[name] : -1
});
const source_ids = persisted("source_ids", _source_ids);
let sub = (note_sync) => (title, url) => {
  let update_source_ids = (sb) => async (nn) => {
    const { data, error } = await sb.from("sources").select("domain, title").eq("id", nn.source_id).maybeSingle();
    if (!data)
      return;
    const id = [data.domain, data.title].join(";");
    source_ids.update((n) => {
      n[id] = nn.source_id;
      return n;
    });
  };
  note_sync.sb.channel("notes").on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "notes",
      filter: `user_id=eq.${note_sync.user_id}`
    },
    // at least url should be the same so no need to filter
    (payload) => {
      const nn = payload.new;
      console.log("received new", nn.quote);
      update_source_ids(note_sync.sb)(nn);
      note_sync.notestore.update((n) => {
        let id = nn.source_id;
        n[id] = n[id] || [];
        n[id] = n[id].filter((n2) => n2.snippet_uuid !== nn.snippet_uuid);
        n[id] = [...n[id], { ...nn, sources: { title, url } }];
        return n;
      });
    }
  ).subscribe();
};
let getSourceId = (sb) => async (domain, title) => {
  let query = async (sb2, domain2, title2) => {
    const id2 = [domain2, title2].join(";");
    const { data, error } = await sb2.from("sources").select("id").eq("domain", domain2).eq("title", title2).maybeSingle();
    if (!data) {
      console.log("source not there yet probably", error);
      return;
    }
    source_ids.update((n) => {
      n[id2] = data.id;
      return n;
    });
  };
  const id = [domain, title].join(";");
  if (!(id in get_store_value(source_ids)))
    source_ids.update((n) => {
      n[id] = -1;
      return n;
    });
  query(sb, domain, title).then(() => console.log("updated sid"));
  return derived(source_ids, (n) => n[id]);
};
var NonEmptyArray = {};
var Apply = {};
var internal = {};
(function(exports) {
  var __spreadArray = commonjsGlobal && commonjsGlobal.__spreadArray || function(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.flatMapReader = exports.flatMapTask = exports.flatMapIO = exports.flatMapEither = exports.flatMapOption = exports.flatMapNullable = exports.liftOption = exports.liftNullable = exports.fromReadonlyNonEmptyArray = exports.has = exports.emptyRecord = exports.emptyReadonlyArray = exports.tail = exports.head = exports.isNonEmpty = exports.singleton = exports.right = exports.left = exports.isRight = exports.isLeft = exports.some = exports.none = exports.isSome = exports.isNone = void 0;
  var function_12 = _function;
  var isNone = function(fa) {
    return fa._tag === "None";
  };
  exports.isNone = isNone;
  var isSome = function(fa) {
    return fa._tag === "Some";
  };
  exports.isSome = isSome;
  exports.none = { _tag: "None" };
  var some2 = function(a) {
    return { _tag: "Some", value: a };
  };
  exports.some = some2;
  var isLeft = function(ma) {
    return ma._tag === "Left";
  };
  exports.isLeft = isLeft;
  var isRight = function(ma) {
    return ma._tag === "Right";
  };
  exports.isRight = isRight;
  var left = function(e) {
    return { _tag: "Left", left: e };
  };
  exports.left = left;
  var right = function(a) {
    return { _tag: "Right", right: a };
  };
  exports.right = right;
  var singleton = function(a) {
    return [a];
  };
  exports.singleton = singleton;
  var isNonEmpty = function(as2) {
    return as2.length > 0;
  };
  exports.isNonEmpty = isNonEmpty;
  var head = function(as2) {
    return as2[0];
  };
  exports.head = head;
  var tail = function(as2) {
    return as2.slice(1);
  };
  exports.tail = tail;
  exports.emptyReadonlyArray = [];
  exports.emptyRecord = {};
  exports.has = Object.prototype.hasOwnProperty;
  var fromReadonlyNonEmptyArray = function(as2) {
    return __spreadArray([as2[0]], as2.slice(1), true);
  };
  exports.fromReadonlyNonEmptyArray = fromReadonlyNonEmptyArray;
  var liftNullable = function(F) {
    return function(f, onNullable) {
      return function() {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          a[_i] = arguments[_i];
        }
        var o = f.apply(void 0, a);
        return F.fromEither(o == null ? (0, exports.left)(onNullable.apply(void 0, a)) : (0, exports.right)(o));
      };
    };
  };
  exports.liftNullable = liftNullable;
  var liftOption = function(F) {
    return function(f, onNone) {
      return function() {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          a[_i] = arguments[_i];
        }
        var o = f.apply(void 0, a);
        return F.fromEither((0, exports.isNone)(o) ? (0, exports.left)(onNone.apply(void 0, a)) : (0, exports.right)(o.value));
      };
    };
  };
  exports.liftOption = liftOption;
  var flatMapNullable = function(F, M) {
    return /* @__PURE__ */ (0, function_12.dual)(3, function(self, f, onNullable) {
      return M.flatMap(self, (0, exports.liftNullable)(F)(f, onNullable));
    });
  };
  exports.flatMapNullable = flatMapNullable;
  var flatMapOption = function(F, M) {
    return /* @__PURE__ */ (0, function_12.dual)(3, function(self, f, onNone) {
      return M.flatMap(self, (0, exports.liftOption)(F)(f, onNone));
    });
  };
  exports.flatMapOption = flatMapOption;
  var flatMapEither = function(F, M) {
    return /* @__PURE__ */ (0, function_12.dual)(2, function(self, f) {
      return M.flatMap(self, function(a) {
        return F.fromEither(f(a));
      });
    });
  };
  exports.flatMapEither = flatMapEither;
  var flatMapIO = function(F, M) {
    return /* @__PURE__ */ (0, function_12.dual)(2, function(self, f) {
      return M.flatMap(self, function(a) {
        return F.fromIO(f(a));
      });
    });
  };
  exports.flatMapIO = flatMapIO;
  var flatMapTask = function(F, M) {
    return /* @__PURE__ */ (0, function_12.dual)(2, function(self, f) {
      return M.flatMap(self, function(a) {
        return F.fromTask(f(a));
      });
    });
  };
  exports.flatMapTask = flatMapTask;
  var flatMapReader = function(F, M) {
    return /* @__PURE__ */ (0, function_12.dual)(2, function(self, f) {
      return M.flatMap(self, function(a) {
        return F.fromReader(f(a));
      });
    });
  };
  exports.flatMapReader = flatMapReader;
})(internal);
var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = { enumerable: true, get: function() {
      return m[k];
    } };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k in mod)
      if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
        __createBinding(result, mod, k);
  }
  __setModuleDefault(result, mod);
  return result;
};
Object.defineProperty(Apply, "__esModule", { value: true });
Apply.sequenceS = Apply.sequenceT = Apply.getApplySemigroup = Apply.apS = Apply.apSecond = Apply.apFirst = Apply.ap = void 0;
var function_1$1 = _function;
var _ = __importStar(internal);
function ap(F, G) {
  return function(fa) {
    return function(fab) {
      return F.ap(F.map(fab, function(gab) {
        return function(ga) {
          return G.ap(gab, ga);
        };
      }), fa);
    };
  };
}
Apply.ap = ap;
function apFirst(A) {
  return function(second) {
    return function(first) {
      return A.ap(A.map(first, function(a) {
        return function() {
          return a;
        };
      }), second);
    };
  };
}
Apply.apFirst = apFirst;
function apSecond(A) {
  return function(second) {
    return function(first) {
      return A.ap(A.map(first, function() {
        return function(b) {
          return b;
        };
      }), second);
    };
  };
}
Apply.apSecond = apSecond;
function apS(F) {
  return function(name, fb) {
    return function(fa) {
      return F.ap(F.map(fa, function(a) {
        return function(b) {
          var _a;
          return Object.assign({}, a, (_a = {}, _a[name] = b, _a));
        };
      }), fb);
    };
  };
}
Apply.apS = apS;
function getApplySemigroup(F) {
  return function(S) {
    return {
      concat: function(first, second) {
        return F.ap(F.map(first, function(x) {
          return function(y) {
            return S.concat(x, y);
          };
        }), second);
      }
    };
  };
}
Apply.getApplySemigroup = getApplySemigroup;
function curried(f, n, acc) {
  return function(x) {
    var combined = Array(acc.length + 1);
    for (var i = 0; i < acc.length; i++) {
      combined[i] = acc[i];
    }
    combined[acc.length] = x;
    return n === 0 ? f.apply(null, combined) : curried(f, n - 1, combined);
  };
}
var tupleConstructors = {
  1: function(a) {
    return [a];
  },
  2: function(a) {
    return function(b) {
      return [a, b];
    };
  },
  3: function(a) {
    return function(b) {
      return function(c) {
        return [a, b, c];
      };
    };
  },
  4: function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return [a, b, c, d];
        };
      };
    };
  },
  5: function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return function(e) {
            return [a, b, c, d, e];
          };
        };
      };
    };
  }
};
function getTupleConstructor(len) {
  if (!_.has.call(tupleConstructors, len)) {
    tupleConstructors[len] = curried(function_1$1.tuple, len - 1, []);
  }
  return tupleConstructors[len];
}
function sequenceT(F) {
  return function() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    var len = args.length;
    var f = getTupleConstructor(len);
    var fas = F.map(args[0], f);
    for (var i = 1; i < len; i++) {
      fas = F.ap(fas, args[i]);
    }
    return fas;
  };
}
Apply.sequenceT = sequenceT;
function getRecordConstructor(keys) {
  var len = keys.length;
  switch (len) {
    case 1:
      return function(a) {
        var _a;
        return _a = {}, _a[keys[0]] = a, _a;
      };
    case 2:
      return function(a) {
        return function(b) {
          var _a;
          return _a = {}, _a[keys[0]] = a, _a[keys[1]] = b, _a;
        };
      };
    case 3:
      return function(a) {
        return function(b) {
          return function(c) {
            var _a;
            return _a = {}, _a[keys[0]] = a, _a[keys[1]] = b, _a[keys[2]] = c, _a;
          };
        };
      };
    case 4:
      return function(a) {
        return function(b) {
          return function(c) {
            return function(d) {
              var _a;
              return _a = {}, _a[keys[0]] = a, _a[keys[1]] = b, _a[keys[2]] = c, _a[keys[3]] = d, _a;
            };
          };
        };
      };
    case 5:
      return function(a) {
        return function(b) {
          return function(c) {
            return function(d) {
              return function(e) {
                var _a;
                return _a = {}, _a[keys[0]] = a, _a[keys[1]] = b, _a[keys[2]] = c, _a[keys[3]] = d, _a[keys[4]] = e, _a;
              };
            };
          };
        };
      };
    default:
      return curried(function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        var r = {};
        for (var i = 0; i < len; i++) {
          r[keys[i]] = args[i];
        }
        return r;
      }, len - 1, []);
  }
}
function sequenceS(F) {
  return function(r) {
    var keys = Object.keys(r);
    var len = keys.length;
    var f = getRecordConstructor(keys);
    var fr = F.map(r[keys[0]], f);
    for (var i = 1; i < len; i++) {
      fr = F.ap(fr, r[keys[i]]);
    }
    return fr;
  };
}
Apply.sequenceS = sequenceS;
var Chain = {};
Object.defineProperty(Chain, "__esModule", { value: true });
Chain.bind = Chain.tap = Chain.chainFirst = void 0;
function chainFirst(M) {
  var tapM = tap(M);
  return function(f) {
    return function(first) {
      return tapM(first, f);
    };
  };
}
Chain.chainFirst = chainFirst;
function tap(M) {
  return function(first, f) {
    return M.chain(first, function(a) {
      return M.map(f(a), function() {
        return a;
      });
    });
  };
}
Chain.tap = tap;
function bind(M) {
  return function(name, f) {
    return function(ma) {
      return M.chain(ma, function(a) {
        return M.map(f(a), function(b) {
          var _a;
          return Object.assign({}, a, (_a = {}, _a[name] = b, _a));
        });
      });
    };
  };
}
Chain.bind = bind;
var Functor = {};
Object.defineProperty(Functor, "__esModule", { value: true });
Functor.asUnit = Functor.as = Functor.getFunctorComposition = Functor.let = Functor.bindTo = Functor.flap = Functor.map = void 0;
var function_1 = _function;
function map(F, G) {
  return function(f) {
    return function(fa) {
      return F.map(fa, function(ga) {
        return G.map(ga, f);
      });
    };
  };
}
Functor.map = map;
function flap(F) {
  return function(a) {
    return function(fab) {
      return F.map(fab, function(f) {
        return f(a);
      });
    };
  };
}
Functor.flap = flap;
function bindTo(F) {
  return function(name) {
    return function(fa) {
      return F.map(fa, function(a) {
        var _a;
        return _a = {}, _a[name] = a, _a;
      });
    };
  };
}
Functor.bindTo = bindTo;
function let_(F) {
  return function(name, f) {
    return function(fa) {
      return F.map(fa, function(a) {
        var _a;
        return Object.assign({}, a, (_a = {}, _a[name] = f(a), _a));
      });
    };
  };
}
Functor.let = let_;
function getFunctorComposition(F, G) {
  var _map = map(F, G);
  return {
    map: function(fga, f) {
      return (0, function_1.pipe)(fga, _map(f));
    }
  };
}
Functor.getFunctorComposition = getFunctorComposition;
function as(F) {
  return function(self, b) {
    return F.map(self, function() {
      return b;
    });
  };
}
Functor.as = as;
function asUnit(F) {
  var asM = as(F);
  return function(self) {
    return asM(self, void 0);
  };
}
Functor.asUnit = asUnit;
var Ord = {};
var Eq = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.eqDate = exports.eqNumber = exports.eqString = exports.eqBoolean = exports.eq = exports.strictEqual = exports.getStructEq = exports.getTupleEq = exports.Contravariant = exports.getMonoid = exports.getSemigroup = exports.eqStrict = exports.URI = exports.contramap = exports.tuple = exports.struct = exports.fromEquals = void 0;
  var function_12 = _function;
  var fromEquals = function(equals) {
    return {
      equals: function(x, y) {
        return x === y || equals(x, y);
      }
    };
  };
  exports.fromEquals = fromEquals;
  var struct = function(eqs) {
    return (0, exports.fromEquals)(function(first, second) {
      for (var key in eqs) {
        if (!eqs[key].equals(first[key], second[key])) {
          return false;
        }
      }
      return true;
    });
  };
  exports.struct = struct;
  var tuple = function() {
    var eqs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      eqs[_i] = arguments[_i];
    }
    return (0, exports.fromEquals)(function(first, second) {
      return eqs.every(function(E, i) {
        return E.equals(first[i], second[i]);
      });
    });
  };
  exports.tuple = tuple;
  var contramap_ = function(fa, f) {
    return (0, function_12.pipe)(fa, (0, exports.contramap)(f));
  };
  var contramap = function(f) {
    return function(fa) {
      return (0, exports.fromEquals)(function(x, y) {
        return fa.equals(f(x), f(y));
      });
    };
  };
  exports.contramap = contramap;
  exports.URI = "Eq";
  exports.eqStrict = {
    equals: function(a, b) {
      return a === b;
    }
  };
  var empty2 = {
    equals: function() {
      return true;
    }
  };
  var getSemigroup = function() {
    return {
      concat: function(x, y) {
        return (0, exports.fromEquals)(function(a, b) {
          return x.equals(a, b) && y.equals(a, b);
        });
      }
    };
  };
  exports.getSemigroup = getSemigroup;
  var getMonoid = function() {
    return {
      concat: (0, exports.getSemigroup)().concat,
      empty: empty2
    };
  };
  exports.getMonoid = getMonoid;
  exports.Contravariant = {
    URI: exports.URI,
    contramap: contramap_
  };
  exports.getTupleEq = exports.tuple;
  exports.getStructEq = exports.struct;
  exports.strictEqual = exports.eqStrict.equals;
  exports.eq = exports.Contravariant;
  exports.eqBoolean = exports.eqStrict;
  exports.eqString = exports.eqStrict;
  exports.eqNumber = exports.eqStrict;
  exports.eqDate = {
    equals: function(first, second) {
      return first.valueOf() === second.valueOf();
    }
  };
})(Eq);
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.ordDate = exports.ordNumber = exports.ordString = exports.ordBoolean = exports.ord = exports.getDualOrd = exports.getTupleOrd = exports.between = exports.clamp = exports.max = exports.min = exports.geq = exports.leq = exports.gt = exports.lt = exports.equals = exports.trivial = exports.Contravariant = exports.getMonoid = exports.getSemigroup = exports.URI = exports.contramap = exports.reverse = exports.tuple = exports.fromCompare = exports.equalsDefault = void 0;
  var Eq_1 = Eq;
  var function_12 = _function;
  var equalsDefault = function(compare2) {
    return function(first, second) {
      return first === second || compare2(first, second) === 0;
    };
  };
  exports.equalsDefault = equalsDefault;
  var fromCompare = function(compare2) {
    return {
      equals: (0, exports.equalsDefault)(compare2),
      compare: function(first, second) {
        return first === second ? 0 : compare2(first, second);
      }
    };
  };
  exports.fromCompare = fromCompare;
  var tuple = function() {
    var ords = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      ords[_i] = arguments[_i];
    }
    return (0, exports.fromCompare)(function(first, second) {
      var i = 0;
      for (; i < ords.length - 1; i++) {
        var r = ords[i].compare(first[i], second[i]);
        if (r !== 0) {
          return r;
        }
      }
      return ords[i].compare(first[i], second[i]);
    });
  };
  exports.tuple = tuple;
  var reverse2 = function(O) {
    return (0, exports.fromCompare)(function(first, second) {
      return O.compare(second, first);
    });
  };
  exports.reverse = reverse2;
  var contramap_ = function(fa, f) {
    return (0, function_12.pipe)(fa, (0, exports.contramap)(f));
  };
  var contramap = function(f) {
    return function(fa) {
      return (0, exports.fromCompare)(function(first, second) {
        return fa.compare(f(first), f(second));
      });
    };
  };
  exports.contramap = contramap;
  exports.URI = "Ord";
  var getSemigroup = function() {
    return {
      concat: function(first, second) {
        return (0, exports.fromCompare)(function(a, b) {
          var ox = first.compare(a, b);
          return ox !== 0 ? ox : second.compare(a, b);
        });
      }
    };
  };
  exports.getSemigroup = getSemigroup;
  var getMonoid = function() {
    return {
      concat: (0, exports.getSemigroup)().concat,
      empty: (0, exports.fromCompare)(function() {
        return 0;
      })
    };
  };
  exports.getMonoid = getMonoid;
  exports.Contravariant = {
    URI: exports.URI,
    contramap: contramap_
  };
  exports.trivial = {
    equals: function_12.constTrue,
    compare: /* @__PURE__ */ (0, function_12.constant)(0)
  };
  var equals = function(O) {
    return function(second) {
      return function(first) {
        return first === second || O.compare(first, second) === 0;
      };
    };
  };
  exports.equals = equals;
  var lt = function(O) {
    return function(first, second) {
      return O.compare(first, second) === -1;
    };
  };
  exports.lt = lt;
  var gt = function(O) {
    return function(first, second) {
      return O.compare(first, second) === 1;
    };
  };
  exports.gt = gt;
  var leq = function(O) {
    return function(first, second) {
      return O.compare(first, second) !== 1;
    };
  };
  exports.leq = leq;
  var geq = function(O) {
    return function(first, second) {
      return O.compare(first, second) !== -1;
    };
  };
  exports.geq = geq;
  var min = function(O) {
    return function(first, second) {
      return first === second || O.compare(first, second) < 1 ? first : second;
    };
  };
  exports.min = min;
  var max = function(O) {
    return function(first, second) {
      return first === second || O.compare(first, second) > -1 ? first : second;
    };
  };
  exports.max = max;
  var clamp = function(O) {
    var minO = (0, exports.min)(O);
    var maxO = (0, exports.max)(O);
    return function(low, hi) {
      return function(a) {
        return maxO(minO(a, hi), low);
      };
    };
  };
  exports.clamp = clamp;
  var between = function(O) {
    var ltO = (0, exports.lt)(O);
    var gtO = (0, exports.gt)(O);
    return function(low, hi) {
      return function(a) {
        return ltO(a, low) || gtO(a, hi) ? false : true;
      };
    };
  };
  exports.between = between;
  exports.getTupleOrd = exports.tuple;
  exports.getDualOrd = exports.reverse;
  exports.ord = exports.Contravariant;
  function compare(first, second) {
    return first < second ? -1 : first > second ? 1 : 0;
  }
  var strictOrd = {
    equals: Eq_1.eqStrict.equals,
    compare
  };
  exports.ordBoolean = strictOrd;
  exports.ordString = strictOrd;
  exports.ordNumber = strictOrd;
  exports.ordDate = (0, function_12.pipe)(
    exports.ordNumber,
    /* @__PURE__ */ (0, exports.contramap)(function(date) {
      return date.valueOf();
    })
  );
})(Ord);
var ReadonlyNonEmptyArray = {};
var Semigroup = {};
var Magma = {};
Object.defineProperty(Magma, "__esModule", { value: true });
Magma.concatAll = Magma.endo = Magma.filterSecond = Magma.filterFirst = Magma.reverse = void 0;
var reverse = function(M) {
  return {
    concat: function(first, second) {
      return M.concat(second, first);
    }
  };
};
Magma.reverse = reverse;
var filterFirst = function(predicate) {
  return function(M) {
    return {
      concat: function(first, second) {
        return predicate(first) ? M.concat(first, second) : second;
      }
    };
  };
};
Magma.filterFirst = filterFirst;
var filterSecond = function(predicate) {
  return function(M) {
    return {
      concat: function(first, second) {
        return predicate(second) ? M.concat(first, second) : first;
      }
    };
  };
};
Magma.filterSecond = filterSecond;
var endo = function(f) {
  return function(M) {
    return {
      concat: function(first, second) {
        return M.concat(f(first), f(second));
      }
    };
  };
};
Magma.endo = endo;
var concatAll = function(M) {
  return function(startWith) {
    return function(as2) {
      return as2.reduce(function(a, acc) {
        return M.concat(a, acc);
      }, startWith);
    };
  };
};
Magma.concatAll = concatAll;
(function(exports) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding2(result, mod, k);
    }
    __setModuleDefault2(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.semigroupProduct = exports.semigroupSum = exports.semigroupString = exports.getFunctionSemigroup = exports.semigroupAny = exports.semigroupAll = exports.fold = exports.getIntercalateSemigroup = exports.getMeetSemigroup = exports.getJoinSemigroup = exports.getDualSemigroup = exports.getStructSemigroup = exports.getTupleSemigroup = exports.getFirstSemigroup = exports.getLastSemigroup = exports.getObjectSemigroup = exports.semigroupVoid = exports.concatAll = exports.last = exports.first = exports.intercalate = exports.tuple = exports.struct = exports.reverse = exports.constant = exports.max = exports.min = void 0;
  var function_12 = _function;
  var _2 = __importStar2(internal);
  var M = __importStar2(Magma);
  var Or = __importStar2(Ord);
  var min = function(O) {
    return {
      concat: Or.min(O)
    };
  };
  exports.min = min;
  var max = function(O) {
    return {
      concat: Or.max(O)
    };
  };
  exports.max = max;
  var constant = function(a) {
    return {
      concat: function() {
        return a;
      }
    };
  };
  exports.constant = constant;
  exports.reverse = M.reverse;
  var struct = function(semigroups) {
    return {
      concat: function(first2, second) {
        var r = {};
        for (var k in semigroups) {
          if (_2.has.call(semigroups, k)) {
            r[k] = semigroups[k].concat(first2[k], second[k]);
          }
        }
        return r;
      }
    };
  };
  exports.struct = struct;
  var tuple = function() {
    var semigroups = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      semigroups[_i] = arguments[_i];
    }
    return {
      concat: function(first2, second) {
        return semigroups.map(function(s, i) {
          return s.concat(first2[i], second[i]);
        });
      }
    };
  };
  exports.tuple = tuple;
  var intercalate = function(middle) {
    return function(S) {
      return {
        concat: function(x, y) {
          return S.concat(x, S.concat(middle, y));
        }
      };
    };
  };
  exports.intercalate = intercalate;
  var first = function() {
    return { concat: function_12.identity };
  };
  exports.first = first;
  var last2 = function() {
    return { concat: function(_3, y) {
      return y;
    } };
  };
  exports.last = last2;
  exports.concatAll = M.concatAll;
  exports.semigroupVoid = (0, exports.constant)(void 0);
  var getObjectSemigroup = function() {
    return {
      concat: function(first2, second) {
        return Object.assign({}, first2, second);
      }
    };
  };
  exports.getObjectSemigroup = getObjectSemigroup;
  exports.getLastSemigroup = exports.last;
  exports.getFirstSemigroup = exports.first;
  exports.getTupleSemigroup = exports.tuple;
  exports.getStructSemigroup = exports.struct;
  exports.getDualSemigroup = exports.reverse;
  exports.getJoinSemigroup = exports.max;
  exports.getMeetSemigroup = exports.min;
  exports.getIntercalateSemigroup = exports.intercalate;
  function fold(S) {
    var concatAllS = (0, exports.concatAll)(S);
    return function(startWith, as2) {
      return as2 === void 0 ? concatAllS(startWith) : concatAllS(startWith)(as2);
    };
  }
  exports.fold = fold;
  exports.semigroupAll = {
    concat: function(x, y) {
      return x && y;
    }
  };
  exports.semigroupAny = {
    concat: function(x, y) {
      return x || y;
    }
  };
  exports.getFunctionSemigroup = function_12.getSemigroup;
  exports.semigroupString = {
    concat: function(x, y) {
      return x + y;
    }
  };
  exports.semigroupSum = {
    concat: function(x, y) {
      return x + y;
    }
  };
  exports.semigroupProduct = {
    concat: function(x, y) {
      return x * y;
    }
  };
})(Semigroup);
(function(exports) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding2(result, mod, k);
    }
    __setModuleDefault2(result, mod);
    return result;
  };
  var __spreadArray = commonjsGlobal && commonjsGlobal.__spreadArray || function(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.reduceRight = exports.foldMap = exports.reduce = exports.mapWithIndex = exports.map = exports.flatten = exports.duplicate = exports.extend = exports.flatMap = exports.ap = exports.alt = exports.altW = exports.of = exports.chunksOf = exports.splitAt = exports.chop = exports.chainWithIndex = exports.intersperse = exports.prependAll = exports.unzip = exports.zip = exports.zipWith = exports.modifyAt = exports.updateAt = exports.sort = exports.groupBy = exports.group = exports.reverse = exports.concat = exports.concatW = exports.fromArray = exports.unappend = exports.unprepend = exports.range = exports.replicate = exports.makeBy = exports.fromReadonlyArray = exports.rotate = exports.union = exports.sortBy = exports.uniq = exports.unsafeUpdateAt = exports.unsafeInsertAt = exports.append = exports.appendW = exports.prepend = exports.prependW = exports.isOutOfBound = exports.isNonEmpty = exports.empty = void 0;
  exports.groupSort = exports.chain = exports.intercalate = exports.updateLast = exports.modifyLast = exports.updateHead = exports.modifyHead = exports.matchRight = exports.matchLeft = exports.concatAll = exports.max = exports.min = exports.init = exports.last = exports.tail = exports.head = exports.apS = exports.bind = exports.let = exports.bindTo = exports.Do = exports.Comonad = exports.Alt = exports.TraversableWithIndex = exports.Traversable = exports.FoldableWithIndex = exports.Foldable = exports.Monad = exports.chainFirst = exports.Chain = exports.Applicative = exports.apSecond = exports.apFirst = exports.Apply = exports.FunctorWithIndex = exports.Pointed = exports.flap = exports.Functor = exports.getUnionSemigroup = exports.getEq = exports.getSemigroup = exports.getShow = exports.URI = exports.extract = exports.traverseWithIndex = exports.sequence = exports.traverse = exports.reduceRightWithIndex = exports.foldMapWithIndex = exports.reduceWithIndex = void 0;
  exports.readonlyNonEmptyArray = exports.fold = exports.prependToAll = exports.insertAt = exports.snoc = exports.cons = exports.unsnoc = exports.uncons = exports.filterWithIndex = exports.filter = void 0;
  var Apply_1 = Apply;
  var Chain_1 = Chain;
  var Eq_1 = Eq;
  var function_12 = _function;
  var Functor_1 = Functor;
  var _2 = __importStar2(internal);
  var Ord_1 = Ord;
  var Se = __importStar2(Semigroup);
  exports.empty = _2.emptyReadonlyArray;
  exports.isNonEmpty = _2.isNonEmpty;
  var isOutOfBound = function(i, as2) {
    return i < 0 || i >= as2.length;
  };
  exports.isOutOfBound = isOutOfBound;
  var prependW = function(head) {
    return function(tail) {
      return __spreadArray([head], tail, true);
    };
  };
  exports.prependW = prependW;
  exports.prepend = exports.prependW;
  var appendW = function(end) {
    return function(init3) {
      return __spreadArray(__spreadArray([], init3, true), [end], false);
    };
  };
  exports.appendW = appendW;
  exports.append = exports.appendW;
  var unsafeInsertAt = function(i, a, as2) {
    if ((0, exports.isNonEmpty)(as2)) {
      var xs = _2.fromReadonlyNonEmptyArray(as2);
      xs.splice(i, 0, a);
      return xs;
    }
    return [a];
  };
  exports.unsafeInsertAt = unsafeInsertAt;
  var unsafeUpdateAt = function(i, a, as2) {
    if (as2[i] === a) {
      return as2;
    } else {
      var xs = _2.fromReadonlyNonEmptyArray(as2);
      xs[i] = a;
      return xs;
    }
  };
  exports.unsafeUpdateAt = unsafeUpdateAt;
  var uniq = function(E) {
    return function(as2) {
      if (as2.length === 1) {
        return as2;
      }
      var out = [(0, exports.head)(as2)];
      var rest = (0, exports.tail)(as2);
      var _loop_1 = function(a2) {
        if (out.every(function(o) {
          return !E.equals(o, a2);
        })) {
          out.push(a2);
        }
      };
      for (var _i = 0, rest_1 = rest; _i < rest_1.length; _i++) {
        var a = rest_1[_i];
        _loop_1(a);
      }
      return out;
    };
  };
  exports.uniq = uniq;
  var sortBy = function(ords) {
    if ((0, exports.isNonEmpty)(ords)) {
      var M = (0, Ord_1.getMonoid)();
      return (0, exports.sort)(ords.reduce(M.concat, M.empty));
    }
    return function_12.identity;
  };
  exports.sortBy = sortBy;
  var union = function(E) {
    var uniqE = (0, exports.uniq)(E);
    return function(second) {
      return function(first) {
        return uniqE((0, function_12.pipe)(first, concat(second)));
      };
    };
  };
  exports.union = union;
  var rotate = function(n) {
    return function(as2) {
      var len = as2.length;
      var m = Math.round(n) % len;
      if ((0, exports.isOutOfBound)(Math.abs(m), as2) || m === 0) {
        return as2;
      }
      if (m < 0) {
        var _a = (0, exports.splitAt)(-m)(as2), f = _a[0], s = _a[1];
        return (0, function_12.pipe)(s, concat(f));
      } else {
        return (0, exports.rotate)(m - len)(as2);
      }
    };
  };
  exports.rotate = rotate;
  var fromReadonlyArray = function(as2) {
    return (0, exports.isNonEmpty)(as2) ? _2.some(as2) : _2.none;
  };
  exports.fromReadonlyArray = fromReadonlyArray;
  var makeBy = function(f) {
    return function(n) {
      var j = Math.max(0, Math.floor(n));
      var out = [f(0)];
      for (var i = 1; i < j; i++) {
        out.push(f(i));
      }
      return out;
    };
  };
  exports.makeBy = makeBy;
  var replicate = function(a) {
    return (0, exports.makeBy)(function() {
      return a;
    });
  };
  exports.replicate = replicate;
  var range = function(start, end) {
    return start <= end ? (0, exports.makeBy)(function(i) {
      return start + i;
    })(end - start + 1) : [start];
  };
  exports.range = range;
  var unprepend = function(as2) {
    return [(0, exports.head)(as2), (0, exports.tail)(as2)];
  };
  exports.unprepend = unprepend;
  var unappend = function(as2) {
    return [(0, exports.init)(as2), (0, exports.last)(as2)];
  };
  exports.unappend = unappend;
  var fromArray = function(as2) {
    return (0, exports.fromReadonlyArray)(as2.slice());
  };
  exports.fromArray = fromArray;
  function concatW(second) {
    return function(first) {
      return first.concat(second);
    };
  }
  exports.concatW = concatW;
  function concat(x, y) {
    return y ? x.concat(y) : function(y2) {
      return y2.concat(x);
    };
  }
  exports.concat = concat;
  var reverse2 = function(as2) {
    return as2.length === 1 ? as2 : __spreadArray([(0, exports.last)(as2)], as2.slice(0, -1).reverse(), true);
  };
  exports.reverse = reverse2;
  function group(E) {
    return function(as2) {
      var len = as2.length;
      if (len === 0) {
        return exports.empty;
      }
      var out = [];
      var head = as2[0];
      var nea = [head];
      for (var i = 1; i < len; i++) {
        var a = as2[i];
        if (E.equals(a, head)) {
          nea.push(a);
        } else {
          out.push(nea);
          head = a;
          nea = [head];
        }
      }
      out.push(nea);
      return out;
    };
  }
  exports.group = group;
  var groupBy = function(f) {
    return function(as2) {
      var out = {};
      for (var _i = 0, as_1 = as2; _i < as_1.length; _i++) {
        var a = as_1[_i];
        var k = f(a);
        if (_2.has.call(out, k)) {
          out[k].push(a);
        } else {
          out[k] = [a];
        }
      }
      return out;
    };
  };
  exports.groupBy = groupBy;
  var sort = function(O) {
    return function(as2) {
      return as2.length === 1 ? as2 : as2.slice().sort(O.compare);
    };
  };
  exports.sort = sort;
  var updateAt = function(i, a) {
    return (0, exports.modifyAt)(i, function() {
      return a;
    });
  };
  exports.updateAt = updateAt;
  var modifyAt = function(i, f) {
    return function(as2) {
      return (0, exports.isOutOfBound)(i, as2) ? _2.none : _2.some((0, exports.unsafeUpdateAt)(i, f(as2[i]), as2));
    };
  };
  exports.modifyAt = modifyAt;
  var zipWith = function(as2, bs, f) {
    var cs = [f(as2[0], bs[0])];
    var len = Math.min(as2.length, bs.length);
    for (var i = 1; i < len; i++) {
      cs[i] = f(as2[i], bs[i]);
    }
    return cs;
  };
  exports.zipWith = zipWith;
  function zip(as2, bs) {
    if (bs === void 0) {
      return function(bs2) {
        return zip(bs2, as2);
      };
    }
    return (0, exports.zipWith)(as2, bs, function(a, b) {
      return [a, b];
    });
  }
  exports.zip = zip;
  var unzip = function(abs) {
    var fa = [abs[0][0]];
    var fb = [abs[0][1]];
    for (var i = 1; i < abs.length; i++) {
      fa[i] = abs[i][0];
      fb[i] = abs[i][1];
    }
    return [fa, fb];
  };
  exports.unzip = unzip;
  var prependAll = function(middle) {
    return function(as2) {
      var out = [middle, as2[0]];
      for (var i = 1; i < as2.length; i++) {
        out.push(middle, as2[i]);
      }
      return out;
    };
  };
  exports.prependAll = prependAll;
  var intersperse = function(middle) {
    return function(as2) {
      var rest = (0, exports.tail)(as2);
      return (0, exports.isNonEmpty)(rest) ? (0, function_12.pipe)(rest, (0, exports.prependAll)(middle), (0, exports.prepend)((0, exports.head)(as2))) : as2;
    };
  };
  exports.intersperse = intersperse;
  var chainWithIndex = function(f) {
    return function(as2) {
      var out = _2.fromReadonlyNonEmptyArray(f(0, (0, exports.head)(as2)));
      for (var i = 1; i < as2.length; i++) {
        out.push.apply(out, f(i, as2[i]));
      }
      return out;
    };
  };
  exports.chainWithIndex = chainWithIndex;
  var chop = function(f) {
    return function(as2) {
      var _a = f(as2), b = _a[0], rest = _a[1];
      var out = [b];
      var next = rest;
      while ((0, exports.isNonEmpty)(next)) {
        var _b = f(next), b_1 = _b[0], rest_2 = _b[1];
        out.push(b_1);
        next = rest_2;
      }
      return out;
    };
  };
  exports.chop = chop;
  var splitAt = function(n) {
    return function(as2) {
      var m = Math.max(1, n);
      return m >= as2.length ? [as2, exports.empty] : [(0, function_12.pipe)(as2.slice(1, m), (0, exports.prepend)((0, exports.head)(as2))), as2.slice(m)];
    };
  };
  exports.splitAt = splitAt;
  var chunksOf = function(n) {
    return (0, exports.chop)((0, exports.splitAt)(n));
  };
  exports.chunksOf = chunksOf;
  var _map = function(fa, f) {
    return (0, function_12.pipe)(fa, (0, exports.map)(f));
  };
  var _mapWithIndex = function(fa, f) {
    return (0, function_12.pipe)(fa, (0, exports.mapWithIndex)(f));
  };
  var _ap = function(fab, fa) {
    return (0, function_12.pipe)(fab, (0, exports.ap)(fa));
  };
  var _extend = function(wa, f) {
    return (0, function_12.pipe)(wa, (0, exports.extend)(f));
  };
  var _reduce = function(fa, b, f) {
    return (0, function_12.pipe)(fa, (0, exports.reduce)(b, f));
  };
  var _foldMap = function(M) {
    var foldMapM = (0, exports.foldMap)(M);
    return function(fa, f) {
      return (0, function_12.pipe)(fa, foldMapM(f));
    };
  };
  var _reduceRight = function(fa, b, f) {
    return (0, function_12.pipe)(fa, (0, exports.reduceRight)(b, f));
  };
  var _traverse = function(F) {
    var traverseF = (0, exports.traverse)(F);
    return function(ta, f) {
      return (0, function_12.pipe)(ta, traverseF(f));
    };
  };
  var _alt = function(fa, that) {
    return (0, function_12.pipe)(fa, (0, exports.alt)(that));
  };
  var _reduceWithIndex = function(fa, b, f) {
    return (0, function_12.pipe)(fa, (0, exports.reduceWithIndex)(b, f));
  };
  var _foldMapWithIndex = function(M) {
    var foldMapWithIndexM = (0, exports.foldMapWithIndex)(M);
    return function(fa, f) {
      return (0, function_12.pipe)(fa, foldMapWithIndexM(f));
    };
  };
  var _reduceRightWithIndex = function(fa, b, f) {
    return (0, function_12.pipe)(fa, (0, exports.reduceRightWithIndex)(b, f));
  };
  var _traverseWithIndex = function(F) {
    var traverseWithIndexF = (0, exports.traverseWithIndex)(F);
    return function(ta, f) {
      return (0, function_12.pipe)(ta, traverseWithIndexF(f));
    };
  };
  exports.of = _2.singleton;
  var altW = function(that) {
    return function(as2) {
      return (0, function_12.pipe)(as2, concatW(that()));
    };
  };
  exports.altW = altW;
  exports.alt = exports.altW;
  var ap2 = function(as2) {
    return (0, exports.flatMap)(function(f) {
      return (0, function_12.pipe)(as2, (0, exports.map)(f));
    });
  };
  exports.ap = ap2;
  exports.flatMap = (0, function_12.dual)(2, function(ma, f) {
    return (0, function_12.pipe)(ma, (0, exports.chainWithIndex)(function(i, a) {
      return f(a, i);
    }));
  });
  var extend = function(f) {
    return function(as2) {
      var next = (0, exports.tail)(as2);
      var out = [f(as2)];
      while ((0, exports.isNonEmpty)(next)) {
        out.push(f(next));
        next = (0, exports.tail)(next);
      }
      return out;
    };
  };
  exports.extend = extend;
  exports.duplicate = /* @__PURE__ */ (0, exports.extend)(function_12.identity);
  exports.flatten = /* @__PURE__ */ (0, exports.flatMap)(function_12.identity);
  var map2 = function(f) {
    return (0, exports.mapWithIndex)(function(_3, a) {
      return f(a);
    });
  };
  exports.map = map2;
  var mapWithIndex = function(f) {
    return function(as2) {
      var out = [f(0, (0, exports.head)(as2))];
      for (var i = 1; i < as2.length; i++) {
        out.push(f(i, as2[i]));
      }
      return out;
    };
  };
  exports.mapWithIndex = mapWithIndex;
  var reduce = function(b, f) {
    return (0, exports.reduceWithIndex)(b, function(_3, b2, a) {
      return f(b2, a);
    });
  };
  exports.reduce = reduce;
  var foldMap = function(S) {
    return function(f) {
      return function(as2) {
        return as2.slice(1).reduce(function(s, a) {
          return S.concat(s, f(a));
        }, f(as2[0]));
      };
    };
  };
  exports.foldMap = foldMap;
  var reduceRight = function(b, f) {
    return (0, exports.reduceRightWithIndex)(b, function(_3, b2, a) {
      return f(b2, a);
    });
  };
  exports.reduceRight = reduceRight;
  var reduceWithIndex = function(b, f) {
    return function(as2) {
      return as2.reduce(function(b2, a, i) {
        return f(i, b2, a);
      }, b);
    };
  };
  exports.reduceWithIndex = reduceWithIndex;
  var foldMapWithIndex = function(S) {
    return function(f) {
      return function(as2) {
        return as2.slice(1).reduce(function(s, a, i) {
          return S.concat(s, f(i + 1, a));
        }, f(0, as2[0]));
      };
    };
  };
  exports.foldMapWithIndex = foldMapWithIndex;
  var reduceRightWithIndex = function(b, f) {
    return function(as2) {
      return as2.reduceRight(function(b2, a, i) {
        return f(i, a, b2);
      }, b);
    };
  };
  exports.reduceRightWithIndex = reduceRightWithIndex;
  var traverse = function(F) {
    var traverseWithIndexF = (0, exports.traverseWithIndex)(F);
    return function(f) {
      return traverseWithIndexF(function(_3, a) {
        return f(a);
      });
    };
  };
  exports.traverse = traverse;
  var sequence = function(F) {
    return (0, exports.traverseWithIndex)(F)(function_12.SK);
  };
  exports.sequence = sequence;
  var traverseWithIndex = function(F) {
    return function(f) {
      return function(as2) {
        var out = F.map(f(0, (0, exports.head)(as2)), exports.of);
        for (var i = 1; i < as2.length; i++) {
          out = F.ap(F.map(out, function(bs) {
            return function(b) {
              return (0, function_12.pipe)(bs, (0, exports.append)(b));
            };
          }), f(i, as2[i]));
        }
        return out;
      };
    };
  };
  exports.traverseWithIndex = traverseWithIndex;
  exports.extract = _2.head;
  exports.URI = "ReadonlyNonEmptyArray";
  var getShow = function(S) {
    return {
      show: function(as2) {
        return "[".concat(as2.map(S.show).join(", "), "]");
      }
    };
  };
  exports.getShow = getShow;
  var getSemigroup = function() {
    return {
      concat
    };
  };
  exports.getSemigroup = getSemigroup;
  var getEq = function(E) {
    return (0, Eq_1.fromEquals)(function(xs, ys) {
      return xs.length === ys.length && xs.every(function(x, i) {
        return E.equals(x, ys[i]);
      });
    });
  };
  exports.getEq = getEq;
  var getUnionSemigroup = function(E) {
    var unionE = (0, exports.union)(E);
    return {
      concat: function(first, second) {
        return unionE(second)(first);
      }
    };
  };
  exports.getUnionSemigroup = getUnionSemigroup;
  exports.Functor = {
    URI: exports.URI,
    map: _map
  };
  exports.flap = (0, Functor_1.flap)(exports.Functor);
  exports.Pointed = {
    URI: exports.URI,
    of: exports.of
  };
  exports.FunctorWithIndex = {
    URI: exports.URI,
    map: _map,
    mapWithIndex: _mapWithIndex
  };
  exports.Apply = {
    URI: exports.URI,
    map: _map,
    ap: _ap
  };
  exports.apFirst = (0, Apply_1.apFirst)(exports.Apply);
  exports.apSecond = (0, Apply_1.apSecond)(exports.Apply);
  exports.Applicative = {
    URI: exports.URI,
    map: _map,
    ap: _ap,
    of: exports.of
  };
  exports.Chain = {
    URI: exports.URI,
    map: _map,
    ap: _ap,
    chain: exports.flatMap
  };
  exports.chainFirst = (0, Chain_1.chainFirst)(exports.Chain);
  exports.Monad = {
    URI: exports.URI,
    map: _map,
    ap: _ap,
    of: exports.of,
    chain: exports.flatMap
  };
  exports.Foldable = {
    URI: exports.URI,
    reduce: _reduce,
    foldMap: _foldMap,
    reduceRight: _reduceRight
  };
  exports.FoldableWithIndex = {
    URI: exports.URI,
    reduce: _reduce,
    foldMap: _foldMap,
    reduceRight: _reduceRight,
    reduceWithIndex: _reduceWithIndex,
    foldMapWithIndex: _foldMapWithIndex,
    reduceRightWithIndex: _reduceRightWithIndex
  };
  exports.Traversable = {
    URI: exports.URI,
    map: _map,
    reduce: _reduce,
    foldMap: _foldMap,
    reduceRight: _reduceRight,
    traverse: _traverse,
    sequence: exports.sequence
  };
  exports.TraversableWithIndex = {
    URI: exports.URI,
    map: _map,
    mapWithIndex: _mapWithIndex,
    reduce: _reduce,
    foldMap: _foldMap,
    reduceRight: _reduceRight,
    traverse: _traverse,
    sequence: exports.sequence,
    reduceWithIndex: _reduceWithIndex,
    foldMapWithIndex: _foldMapWithIndex,
    reduceRightWithIndex: _reduceRightWithIndex,
    traverseWithIndex: _traverseWithIndex
  };
  exports.Alt = {
    URI: exports.URI,
    map: _map,
    alt: _alt
  };
  exports.Comonad = {
    URI: exports.URI,
    map: _map,
    extend: _extend,
    extract: exports.extract
  };
  exports.Do = (0, exports.of)(_2.emptyRecord);
  exports.bindTo = (0, Functor_1.bindTo)(exports.Functor);
  var let_2 = /* @__PURE__ */ (0, Functor_1.let)(exports.Functor);
  exports.let = let_2;
  exports.bind = (0, Chain_1.bind)(exports.Chain);
  exports.apS = (0, Apply_1.apS)(exports.Apply);
  exports.head = exports.extract;
  exports.tail = _2.tail;
  var last2 = function(as2) {
    return as2[as2.length - 1];
  };
  exports.last = last2;
  var init2 = function(as2) {
    return as2.slice(0, -1);
  };
  exports.init = init2;
  var min = function(O) {
    var S = Se.min(O);
    return function(as2) {
      return as2.reduce(S.concat);
    };
  };
  exports.min = min;
  var max = function(O) {
    var S = Se.max(O);
    return function(as2) {
      return as2.reduce(S.concat);
    };
  };
  exports.max = max;
  var concatAll2 = function(S) {
    return function(as2) {
      return as2.reduce(S.concat);
    };
  };
  exports.concatAll = concatAll2;
  var matchLeft = function(f) {
    return function(as2) {
      return f((0, exports.head)(as2), (0, exports.tail)(as2));
    };
  };
  exports.matchLeft = matchLeft;
  var matchRight = function(f) {
    return function(as2) {
      return f((0, exports.init)(as2), (0, exports.last)(as2));
    };
  };
  exports.matchRight = matchRight;
  var modifyHead = function(f) {
    return function(as2) {
      return __spreadArray([f((0, exports.head)(as2))], (0, exports.tail)(as2), true);
    };
  };
  exports.modifyHead = modifyHead;
  var updateHead = function(a) {
    return (0, exports.modifyHead)(function() {
      return a;
    });
  };
  exports.updateHead = updateHead;
  var modifyLast = function(f) {
    return function(as2) {
      return (0, function_12.pipe)((0, exports.init)(as2), (0, exports.append)(f((0, exports.last)(as2))));
    };
  };
  exports.modifyLast = modifyLast;
  var updateLast = function(a) {
    return (0, exports.modifyLast)(function() {
      return a;
    });
  };
  exports.updateLast = updateLast;
  var intercalate = function(S) {
    var concatAllS = (0, exports.concatAll)(S);
    return function(middle) {
      return (0, function_12.flow)((0, exports.intersperse)(middle), concatAllS);
    };
  };
  exports.intercalate = intercalate;
  exports.chain = exports.flatMap;
  function groupSort(O) {
    var sortO = (0, exports.sort)(O);
    var groupO = group(O);
    return function(as2) {
      return (0, exports.isNonEmpty)(as2) ? groupO(sortO(as2)) : exports.empty;
    };
  }
  exports.groupSort = groupSort;
  function filter(predicate) {
    return (0, exports.filterWithIndex)(function(_3, a) {
      return predicate(a);
    });
  }
  exports.filter = filter;
  var filterWithIndex = function(predicate) {
    return function(as2) {
      return (0, exports.fromReadonlyArray)(as2.filter(function(a, i) {
        return predicate(i, a);
      }));
    };
  };
  exports.filterWithIndex = filterWithIndex;
  exports.uncons = exports.unprepend;
  exports.unsnoc = exports.unappend;
  function cons(head, tail) {
    return tail === void 0 ? (0, exports.prepend)(head) : (0, function_12.pipe)(tail, (0, exports.prepend)(head));
  }
  exports.cons = cons;
  var snoc = function(init3, end) {
    return (0, function_12.pipe)(init3, concat([end]));
  };
  exports.snoc = snoc;
  var insertAt = function(i, a) {
    return function(as2) {
      return i < 0 || i > as2.length ? _2.none : _2.some((0, exports.unsafeInsertAt)(i, a, as2));
    };
  };
  exports.insertAt = insertAt;
  exports.prependToAll = exports.prependAll;
  exports.fold = exports.concatAll;
  exports.readonlyNonEmptyArray = {
    URI: exports.URI,
    of: exports.of,
    map: _map,
    mapWithIndex: _mapWithIndex,
    ap: _ap,
    chain: exports.flatMap,
    extend: _extend,
    extract: exports.extract,
    reduce: _reduce,
    foldMap: _foldMap,
    reduceRight: _reduceRight,
    traverse: _traverse,
    sequence: exports.sequence,
    reduceWithIndex: _reduceWithIndex,
    foldMapWithIndex: _foldMapWithIndex,
    reduceRightWithIndex: _reduceRightWithIndex,
    traverseWithIndex: _traverseWithIndex,
    alt: _alt
  };
})(ReadonlyNonEmptyArray);
(function(exports) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding2(result, mod, k);
    }
    __setModuleDefault2(result, mod);
    return result;
  };
  var __spreadArray = commonjsGlobal && commonjsGlobal.__spreadArray || function(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.mapWithIndex = exports.map = exports.flatten = exports.duplicate = exports.extend = exports.flatMap = exports.ap = exports.alt = exports.altW = exports.chunksOf = exports.splitAt = exports.chop = exports.chainWithIndex = exports.foldMap = exports.foldMapWithIndex = exports.intersperse = exports.prependAll = exports.unzip = exports.zip = exports.zipWith = exports.of = exports.copy = exports.modifyAt = exports.updateAt = exports.insertAt = exports.sort = exports.groupBy = exports.group = exports.reverse = exports.concat = exports.concatW = exports.unappend = exports.unprepend = exports.range = exports.replicate = exports.makeBy = exports.fromArray = exports.fromReadonlyNonEmptyArray = exports.rotate = exports.union = exports.sortBy = exports.uniq = exports.unsafeUpdateAt = exports.unsafeInsertAt = exports.append = exports.appendW = exports.prepend = exports.prependW = exports.isOutOfBound = exports.isNonEmpty = void 0;
  exports.chain = exports.intercalate = exports.updateLast = exports.modifyLast = exports.updateHead = exports.modifyHead = exports.matchRight = exports.matchLeft = exports.concatAll = exports.max = exports.min = exports.init = exports.last = exports.tail = exports.head = exports.apS = exports.bind = exports.let = exports.bindTo = exports.Do = exports.Comonad = exports.Alt = exports.TraversableWithIndex = exports.Traversable = exports.FoldableWithIndex = exports.Foldable = exports.Monad = exports.chainFirst = exports.Chain = exports.Applicative = exports.apSecond = exports.apFirst = exports.Apply = exports.FunctorWithIndex = exports.Pointed = exports.flap = exports.Functor = exports.getUnionSemigroup = exports.getEq = exports.getSemigroup = exports.getShow = exports.URI = exports.extract = exports.traverseWithIndex = exports.sequence = exports.traverse = exports.reduceRightWithIndex = exports.reduceRight = exports.reduceWithIndex = exports.reduce = void 0;
  exports.nonEmptyArray = exports.fold = exports.prependToAll = exports.snoc = exports.cons = exports.unsnoc = exports.uncons = exports.filterWithIndex = exports.filter = exports.groupSort = void 0;
  var Apply_1 = Apply;
  var Chain_1 = Chain;
  var function_12 = _function;
  var Functor_1 = Functor;
  var _2 = __importStar2(internal);
  var Ord_1 = Ord;
  var RNEA = __importStar2(ReadonlyNonEmptyArray);
  var isNonEmpty = function(as2) {
    return as2.length > 0;
  };
  exports.isNonEmpty = isNonEmpty;
  var isOutOfBound = function(i, as2) {
    return i < 0 || i >= as2.length;
  };
  exports.isOutOfBound = isOutOfBound;
  var prependW = function(head) {
    return function(tail2) {
      return __spreadArray([head], tail2, true);
    };
  };
  exports.prependW = prependW;
  exports.prepend = exports.prependW;
  var appendW = function(end) {
    return function(init3) {
      return __spreadArray(__spreadArray([], init3, true), [end], false);
    };
  };
  exports.appendW = appendW;
  exports.append = exports.appendW;
  var unsafeInsertAt = function(i, a, as2) {
    if ((0, exports.isNonEmpty)(as2)) {
      var xs = (0, exports.fromReadonlyNonEmptyArray)(as2);
      xs.splice(i, 0, a);
      return xs;
    }
    return [a];
  };
  exports.unsafeInsertAt = unsafeInsertAt;
  var unsafeUpdateAt = function(i, a, as2) {
    var xs = (0, exports.fromReadonlyNonEmptyArray)(as2);
    xs[i] = a;
    return xs;
  };
  exports.unsafeUpdateAt = unsafeUpdateAt;
  var uniq = function(E) {
    return function(as2) {
      if (as2.length === 1) {
        return (0, exports.copy)(as2);
      }
      var out = [(0, exports.head)(as2)];
      var rest = (0, exports.tail)(as2);
      var _loop_1 = function(a2) {
        if (out.every(function(o) {
          return !E.equals(o, a2);
        })) {
          out.push(a2);
        }
      };
      for (var _i = 0, rest_1 = rest; _i < rest_1.length; _i++) {
        var a = rest_1[_i];
        _loop_1(a);
      }
      return out;
    };
  };
  exports.uniq = uniq;
  var sortBy = function(ords) {
    if ((0, exports.isNonEmpty)(ords)) {
      var M = (0, Ord_1.getMonoid)();
      return (0, exports.sort)(ords.reduce(M.concat, M.empty));
    }
    return exports.copy;
  };
  exports.sortBy = sortBy;
  var union = function(E) {
    var uniqE = (0, exports.uniq)(E);
    return function(second) {
      return function(first) {
        return uniqE((0, function_12.pipe)(first, concat(second)));
      };
    };
  };
  exports.union = union;
  var rotate = function(n) {
    return function(as2) {
      var len = as2.length;
      var m = Math.round(n) % len;
      if ((0, exports.isOutOfBound)(Math.abs(m), as2) || m === 0) {
        return (0, exports.copy)(as2);
      }
      if (m < 0) {
        var _a = (0, exports.splitAt)(-m)(as2), f = _a[0], s = _a[1];
        return (0, function_12.pipe)(s, concat(f));
      } else {
        return (0, exports.rotate)(m - len)(as2);
      }
    };
  };
  exports.rotate = rotate;
  exports.fromReadonlyNonEmptyArray = _2.fromReadonlyNonEmptyArray;
  var fromArray = function(as2) {
    return (0, exports.isNonEmpty)(as2) ? _2.some(as2) : _2.none;
  };
  exports.fromArray = fromArray;
  var makeBy = function(f) {
    return function(n) {
      var j = Math.max(0, Math.floor(n));
      var out = [f(0)];
      for (var i = 1; i < j; i++) {
        out.push(f(i));
      }
      return out;
    };
  };
  exports.makeBy = makeBy;
  var replicate = function(a) {
    return (0, exports.makeBy)(function() {
      return a;
    });
  };
  exports.replicate = replicate;
  var range = function(start, end) {
    return start <= end ? (0, exports.makeBy)(function(i) {
      return start + i;
    })(end - start + 1) : [start];
  };
  exports.range = range;
  var unprepend = function(as2) {
    return [(0, exports.head)(as2), (0, exports.tail)(as2)];
  };
  exports.unprepend = unprepend;
  var unappend = function(as2) {
    return [(0, exports.init)(as2), (0, exports.last)(as2)];
  };
  exports.unappend = unappend;
  function concatW(second) {
    return function(first) {
      return first.concat(second);
    };
  }
  exports.concatW = concatW;
  function concat(x, y) {
    return y ? x.concat(y) : function(y2) {
      return y2.concat(x);
    };
  }
  exports.concat = concat;
  var reverse2 = function(as2) {
    return __spreadArray([(0, exports.last)(as2)], as2.slice(0, -1).reverse(), true);
  };
  exports.reverse = reverse2;
  function group(E) {
    return function(as2) {
      var len = as2.length;
      if (len === 0) {
        return [];
      }
      var out = [];
      var head = as2[0];
      var nea = [head];
      for (var i = 1; i < len; i++) {
        var a = as2[i];
        if (E.equals(a, head)) {
          nea.push(a);
        } else {
          out.push(nea);
          head = a;
          nea = [head];
        }
      }
      out.push(nea);
      return out;
    };
  }
  exports.group = group;
  var groupBy = function(f) {
    return function(as2) {
      var out = {};
      for (var _i = 0, as_1 = as2; _i < as_1.length; _i++) {
        var a = as_1[_i];
        var k = f(a);
        if (_2.has.call(out, k)) {
          out[k].push(a);
        } else {
          out[k] = [a];
        }
      }
      return out;
    };
  };
  exports.groupBy = groupBy;
  var sort = function(O) {
    return function(as2) {
      return as2.slice().sort(O.compare);
    };
  };
  exports.sort = sort;
  var insertAt = function(i, a) {
    return function(as2) {
      return i < 0 || i > as2.length ? _2.none : _2.some((0, exports.unsafeInsertAt)(i, a, as2));
    };
  };
  exports.insertAt = insertAt;
  var updateAt = function(i, a) {
    return (0, exports.modifyAt)(i, function() {
      return a;
    });
  };
  exports.updateAt = updateAt;
  var modifyAt = function(i, f) {
    return function(as2) {
      return (0, exports.isOutOfBound)(i, as2) ? _2.none : _2.some((0, exports.unsafeUpdateAt)(i, f(as2[i]), as2));
    };
  };
  exports.modifyAt = modifyAt;
  exports.copy = exports.fromReadonlyNonEmptyArray;
  var of = function(a) {
    return [a];
  };
  exports.of = of;
  var zipWith = function(as2, bs, f) {
    var cs = [f(as2[0], bs[0])];
    var len = Math.min(as2.length, bs.length);
    for (var i = 1; i < len; i++) {
      cs[i] = f(as2[i], bs[i]);
    }
    return cs;
  };
  exports.zipWith = zipWith;
  function zip(as2, bs) {
    if (bs === void 0) {
      return function(bs2) {
        return zip(bs2, as2);
      };
    }
    return (0, exports.zipWith)(as2, bs, function(a, b) {
      return [a, b];
    });
  }
  exports.zip = zip;
  var unzip = function(abs) {
    var fa = [abs[0][0]];
    var fb = [abs[0][1]];
    for (var i = 1; i < abs.length; i++) {
      fa[i] = abs[i][0];
      fb[i] = abs[i][1];
    }
    return [fa, fb];
  };
  exports.unzip = unzip;
  var prependAll = function(middle) {
    return function(as2) {
      var out = [middle, as2[0]];
      for (var i = 1; i < as2.length; i++) {
        out.push(middle, as2[i]);
      }
      return out;
    };
  };
  exports.prependAll = prependAll;
  var intersperse = function(middle) {
    return function(as2) {
      var rest = (0, exports.tail)(as2);
      return (0, exports.isNonEmpty)(rest) ? (0, function_12.pipe)(rest, (0, exports.prependAll)(middle), (0, exports.prepend)((0, exports.head)(as2))) : (0, exports.copy)(as2);
    };
  };
  exports.intersperse = intersperse;
  exports.foldMapWithIndex = RNEA.foldMapWithIndex;
  exports.foldMap = RNEA.foldMap;
  var chainWithIndex = function(f) {
    return function(as2) {
      var out = (0, exports.fromReadonlyNonEmptyArray)(f(0, (0, exports.head)(as2)));
      for (var i = 1; i < as2.length; i++) {
        out.push.apply(out, f(i, as2[i]));
      }
      return out;
    };
  };
  exports.chainWithIndex = chainWithIndex;
  var chop = function(f) {
    return function(as2) {
      var _a = f(as2), b = _a[0], rest = _a[1];
      var out = [b];
      var next = rest;
      while ((0, exports.isNonEmpty)(next)) {
        var _b = f(next), b_1 = _b[0], rest_2 = _b[1];
        out.push(b_1);
        next = rest_2;
      }
      return out;
    };
  };
  exports.chop = chop;
  var splitAt = function(n) {
    return function(as2) {
      var m = Math.max(1, n);
      return m >= as2.length ? [(0, exports.copy)(as2), []] : [(0, function_12.pipe)(as2.slice(1, m), (0, exports.prepend)((0, exports.head)(as2))), as2.slice(m)];
    };
  };
  exports.splitAt = splitAt;
  var chunksOf = function(n) {
    return (0, exports.chop)((0, exports.splitAt)(n));
  };
  exports.chunksOf = chunksOf;
  var _map = function(fa, f) {
    return (0, function_12.pipe)(fa, (0, exports.map)(f));
  };
  var _mapWithIndex = function(fa, f) {
    return (0, function_12.pipe)(fa, (0, exports.mapWithIndex)(f));
  };
  var _ap = function(fab, fa) {
    return (0, function_12.pipe)(fab, (0, exports.ap)(fa));
  };
  var _extend = function(wa, f) {
    return (0, function_12.pipe)(wa, (0, exports.extend)(f));
  };
  var _reduce = function(fa, b, f) {
    return (0, function_12.pipe)(fa, (0, exports.reduce)(b, f));
  };
  var _foldMap = function(M) {
    var foldMapM = (0, exports.foldMap)(M);
    return function(fa, f) {
      return (0, function_12.pipe)(fa, foldMapM(f));
    };
  };
  var _reduceRight = function(fa, b, f) {
    return (0, function_12.pipe)(fa, (0, exports.reduceRight)(b, f));
  };
  var _traverse = function(F) {
    var traverseF = (0, exports.traverse)(F);
    return function(ta, f) {
      return (0, function_12.pipe)(ta, traverseF(f));
    };
  };
  var _alt = function(fa, that) {
    return (0, function_12.pipe)(fa, (0, exports.alt)(that));
  };
  var _reduceWithIndex = function(fa, b, f) {
    return (0, function_12.pipe)(fa, (0, exports.reduceWithIndex)(b, f));
  };
  var _foldMapWithIndex = function(M) {
    var foldMapWithIndexM = (0, exports.foldMapWithIndex)(M);
    return function(fa, f) {
      return (0, function_12.pipe)(fa, foldMapWithIndexM(f));
    };
  };
  var _reduceRightWithIndex = function(fa, b, f) {
    return (0, function_12.pipe)(fa, (0, exports.reduceRightWithIndex)(b, f));
  };
  var _traverseWithIndex = function(F) {
    var traverseWithIndexF = (0, exports.traverseWithIndex)(F);
    return function(ta, f) {
      return (0, function_12.pipe)(ta, traverseWithIndexF(f));
    };
  };
  var altW = function(that) {
    return function(as2) {
      return (0, function_12.pipe)(as2, concatW(that()));
    };
  };
  exports.altW = altW;
  exports.alt = exports.altW;
  var ap2 = function(as2) {
    return (0, exports.flatMap)(function(f) {
      return (0, function_12.pipe)(as2, (0, exports.map)(f));
    });
  };
  exports.ap = ap2;
  exports.flatMap = (0, function_12.dual)(2, function(ma, f) {
    return (0, function_12.pipe)(ma, (0, exports.chainWithIndex)(function(i, a) {
      return f(a, i);
    }));
  });
  var extend = function(f) {
    return function(as2) {
      var next = (0, exports.tail)(as2);
      var out = [f(as2)];
      while ((0, exports.isNonEmpty)(next)) {
        out.push(f(next));
        next = (0, exports.tail)(next);
      }
      return out;
    };
  };
  exports.extend = extend;
  exports.duplicate = (0, exports.extend)(function_12.identity);
  exports.flatten = (0, exports.flatMap)(function_12.identity);
  var map2 = function(f) {
    return (0, exports.mapWithIndex)(function(_3, a) {
      return f(a);
    });
  };
  exports.map = map2;
  var mapWithIndex = function(f) {
    return function(as2) {
      var out = [f(0, (0, exports.head)(as2))];
      for (var i = 1; i < as2.length; i++) {
        out.push(f(i, as2[i]));
      }
      return out;
    };
  };
  exports.mapWithIndex = mapWithIndex;
  exports.reduce = RNEA.reduce;
  exports.reduceWithIndex = RNEA.reduceWithIndex;
  exports.reduceRight = RNEA.reduceRight;
  exports.reduceRightWithIndex = RNEA.reduceRightWithIndex;
  var traverse = function(F) {
    var traverseWithIndexF = (0, exports.traverseWithIndex)(F);
    return function(f) {
      return traverseWithIndexF(function(_3, a) {
        return f(a);
      });
    };
  };
  exports.traverse = traverse;
  var sequence = function(F) {
    return (0, exports.traverseWithIndex)(F)(function(_3, a) {
      return a;
    });
  };
  exports.sequence = sequence;
  var traverseWithIndex = function(F) {
    return function(f) {
      return function(as2) {
        var out = F.map(f(0, (0, exports.head)(as2)), exports.of);
        for (var i = 1; i < as2.length; i++) {
          out = F.ap(F.map(out, function(bs) {
            return function(b) {
              return (0, function_12.pipe)(bs, (0, exports.append)(b));
            };
          }), f(i, as2[i]));
        }
        return out;
      };
    };
  };
  exports.traverseWithIndex = traverseWithIndex;
  exports.extract = RNEA.head;
  exports.URI = "NonEmptyArray";
  exports.getShow = RNEA.getShow;
  var getSemigroup = function() {
    return {
      concat
    };
  };
  exports.getSemigroup = getSemigroup;
  exports.getEq = RNEA.getEq;
  var getUnionSemigroup = function(E) {
    var unionE = (0, exports.union)(E);
    return {
      concat: function(first, second) {
        return unionE(second)(first);
      }
    };
  };
  exports.getUnionSemigroup = getUnionSemigroup;
  exports.Functor = {
    URI: exports.URI,
    map: _map
  };
  exports.flap = (0, Functor_1.flap)(exports.Functor);
  exports.Pointed = {
    URI: exports.URI,
    of: exports.of
  };
  exports.FunctorWithIndex = {
    URI: exports.URI,
    map: _map,
    mapWithIndex: _mapWithIndex
  };
  exports.Apply = {
    URI: exports.URI,
    map: _map,
    ap: _ap
  };
  exports.apFirst = (0, Apply_1.apFirst)(exports.Apply);
  exports.apSecond = (0, Apply_1.apSecond)(exports.Apply);
  exports.Applicative = {
    URI: exports.URI,
    map: _map,
    ap: _ap,
    of: exports.of
  };
  exports.Chain = {
    URI: exports.URI,
    map: _map,
    ap: _ap,
    chain: exports.flatMap
  };
  exports.chainFirst = /* @__PURE__ */ (0, Chain_1.chainFirst)(exports.Chain);
  exports.Monad = {
    URI: exports.URI,
    map: _map,
    ap: _ap,
    of: exports.of,
    chain: exports.flatMap
  };
  exports.Foldable = {
    URI: exports.URI,
    reduce: _reduce,
    foldMap: _foldMap,
    reduceRight: _reduceRight
  };
  exports.FoldableWithIndex = {
    URI: exports.URI,
    reduce: _reduce,
    foldMap: _foldMap,
    reduceRight: _reduceRight,
    reduceWithIndex: _reduceWithIndex,
    foldMapWithIndex: _foldMapWithIndex,
    reduceRightWithIndex: _reduceRightWithIndex
  };
  exports.Traversable = {
    URI: exports.URI,
    map: _map,
    reduce: _reduce,
    foldMap: _foldMap,
    reduceRight: _reduceRight,
    traverse: _traverse,
    sequence: exports.sequence
  };
  exports.TraversableWithIndex = {
    URI: exports.URI,
    map: _map,
    mapWithIndex: _mapWithIndex,
    reduce: _reduce,
    foldMap: _foldMap,
    reduceRight: _reduceRight,
    traverse: _traverse,
    sequence: exports.sequence,
    reduceWithIndex: _reduceWithIndex,
    foldMapWithIndex: _foldMapWithIndex,
    reduceRightWithIndex: _reduceRightWithIndex,
    traverseWithIndex: _traverseWithIndex
  };
  exports.Alt = {
    URI: exports.URI,
    map: _map,
    alt: _alt
  };
  exports.Comonad = {
    URI: exports.URI,
    map: _map,
    extend: _extend,
    extract: exports.extract
  };
  exports.Do = (0, exports.of)(_2.emptyRecord);
  exports.bindTo = (0, Functor_1.bindTo)(exports.Functor);
  var let_2 = /* @__PURE__ */ (0, Functor_1.let)(exports.Functor);
  exports.let = let_2;
  exports.bind = (0, Chain_1.bind)(exports.Chain);
  exports.apS = (0, Apply_1.apS)(exports.Apply);
  exports.head = RNEA.head;
  var tail = function(as2) {
    return as2.slice(1);
  };
  exports.tail = tail;
  exports.last = RNEA.last;
  var init2 = function(as2) {
    return as2.slice(0, -1);
  };
  exports.init = init2;
  exports.min = RNEA.min;
  exports.max = RNEA.max;
  var concatAll2 = function(S) {
    return function(as2) {
      return as2.reduce(S.concat);
    };
  };
  exports.concatAll = concatAll2;
  var matchLeft = function(f) {
    return function(as2) {
      return f((0, exports.head)(as2), (0, exports.tail)(as2));
    };
  };
  exports.matchLeft = matchLeft;
  var matchRight = function(f) {
    return function(as2) {
      return f((0, exports.init)(as2), (0, exports.last)(as2));
    };
  };
  exports.matchRight = matchRight;
  var modifyHead = function(f) {
    return function(as2) {
      return __spreadArray([f((0, exports.head)(as2))], (0, exports.tail)(as2), true);
    };
  };
  exports.modifyHead = modifyHead;
  var updateHead = function(a) {
    return (0, exports.modifyHead)(function() {
      return a;
    });
  };
  exports.updateHead = updateHead;
  var modifyLast = function(f) {
    return function(as2) {
      return (0, function_12.pipe)((0, exports.init)(as2), (0, exports.append)(f((0, exports.last)(as2))));
    };
  };
  exports.modifyLast = modifyLast;
  var updateLast = function(a) {
    return (0, exports.modifyLast)(function() {
      return a;
    });
  };
  exports.updateLast = updateLast;
  exports.intercalate = RNEA.intercalate;
  exports.chain = exports.flatMap;
  function groupSort(O) {
    var sortO = (0, exports.sort)(O);
    var groupO = group(O);
    return function(as2) {
      return (0, exports.isNonEmpty)(as2) ? groupO(sortO(as2)) : [];
    };
  }
  exports.groupSort = groupSort;
  function filter(predicate) {
    return (0, exports.filterWithIndex)(function(_3, a) {
      return predicate(a);
    });
  }
  exports.filter = filter;
  var filterWithIndex = function(predicate) {
    return function(as2) {
      return (0, exports.fromArray)(as2.filter(function(a, i) {
        return predicate(i, a);
      }));
    };
  };
  exports.filterWithIndex = filterWithIndex;
  exports.uncons = exports.unprepend;
  exports.unsnoc = exports.unappend;
  function cons(head, tail2) {
    return tail2 === void 0 ? (0, exports.prepend)(head) : (0, function_12.pipe)(tail2, (0, exports.prepend)(head));
  }
  exports.cons = cons;
  var snoc = function(init3, end) {
    return (0, function_12.pipe)(init3, (0, exports.append)(end));
  };
  exports.snoc = snoc;
  exports.prependToAll = exports.prependAll;
  exports.fold = RNEA.concatAll;
  exports.nonEmptyArray = {
    URI: exports.URI,
    of: exports.of,
    map: _map,
    mapWithIndex: _mapWithIndex,
    ap: _ap,
    chain: exports.flatMap,
    extend: _extend,
    extract: exports.extract,
    reduce: _reduce,
    foldMap: _foldMap,
    reduceRight: _reduceRight,
    traverse: _traverse,
    sequence: exports.sequence,
    reduceWithIndex: _reduceWithIndex,
    foldMapWithIndex: _foldMapWithIndex,
    reduceRightWithIndex: _reduceRightWithIndex,
    traverseWithIndex: _traverseWithIndex,
    alt: _alt
  };
})(NonEmptyArray);
const notes = {};
const notestore = persisted("notestore", notes);
const _note_del_queue = [];
const note_del_queue = persisted("note_del_queue", _note_del_queue);
class NoteSync {
  sb;
  notestore;
  user_id;
  note_del_queue;
  constructor(sb, user_id) {
    this.sb = sb;
    this.notestore = notestore;
    this.user_id = user_id;
    this.note_del_queue = note_del_queue;
  }
  panel(id) {
    return derived(this.notestore, (v) => v[id]);
  }
  alltags = () => derived(
    this.notestore,
    (v) => Object.entries(v).flatMap(([_2, notess]) => notess.flatMap((n) => n.tags || []))
  );
  async update_one_page(id) {
    if (!this.user_id) {
      console.log("no user in NoteSync");
      return;
    }
    const newnotes = await getNotes(this.sb, some(id), this.user_id);
    if (newnotes !== null)
      this.notestore.update((s) => {
        s[id] = newnotes;
        return s;
      });
  }
  async update_all_pages() {
    if (!this.user_id) {
      console.log("no user in NoteSync");
      return;
    }
    const newnotes = await getNotes(this.sb, none, this.user_id);
    let groupnotes = (notes2) => _function.pipe(
      notes2,
      NonEmptyArray.groupBy((n) => n.source_id.toString()),
      toArray
    );
    if (newnotes !== null)
      this.notestore.update((s) => {
        let grouped = groupnotes(newnotes);
        grouped.forEach(([x, notes2]) => s[notes2[0].source_id] = notes2);
        return s;
      });
  }
  get_groups() {
    return derived(
      this.notestore,
      (kvs) => _function.pipe(
        Object.entries(kvs),
        // @ts-ignore
        map$1(([k, v]) => [v[0] ? v[0].sources.title : "never!", v]),
        fromEntries,
        toArray
      )
    );
  }
  addit = async (n) => {
    const cache = get_store_value(this.notestore)[n.source_id];
    let { title, url } = cache[0] ? cache[0].sources : (await this.sb.from("sources").select().eq("id", n.source_id).maybeSingle()).data || {};
    title = title || "title missing";
    url = url || "";
    this.notestore.update((s) => {
      s[n.source_id] = [...s[n.source_id], { ...n, sources: { title, url } }];
      return s;
    });
    const { sources, ...reNote } = n;
    this.sb.from("notes").insert(reNote).then(logIfError).then(this._restoreIE(n, cache));
  };
  restoredelete = () => {
    this.note_del_queue.update((ns) => {
      let [r, ...rs] = ns;
      if (!r)
        return ns;
      this.addit(r);
      return rs;
    });
  };
  savedelete = (n) => this.note_del_queue.update((ns) => [n, ...ns]);
  deleteit = (n) => {
    const cache = get_store_value(this.notestore)[n.source_id];
    this.notestore.update((s) => {
      let parts = partition_by_id(n.id)(s[n.source_id]);
      s[n.source_id] = parts.left;
      this.savedelete(parts.right[0]);
      return s;
    });
    this.sb.from("notes").delete().eq("id", n.id).then(logIfError).then(this._restoreIE(n, cache));
  };
  // @ts-ignore
  _restoreIE = (n, cache) => (r) => r.error && this.notestore.update((s) => {
    s[n.source_id] = cache;
    return s;
  });
  tagUpdate = (note) => (tag, tags) => {
    console.log(note.highlights);
    this.notestore.update((n) => {
      n[note.source_id].filter((_note) => _note.id == note.id)[0].tags = tags;
      return n;
    });
    this.sb.from("notes").update({ tags }).eq("id", note.id).then(logIfError);
  };
}
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[51] = list[i];
  child_ctx[53] = i;
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[14] = list[i];
  child_ctx[55] = i;
  return child_ctx;
}
function create_if_block_1(ctx) {
  let each_1_anchor;
  let each_value_1 = ensure_array_like(
    /*tags*/
    ctx[0]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    l(nodes) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(nodes);
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert_hydration(target, each_1_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*onTagClick, tags, removeTag, disable, readonly, autoCompleteShowKey*/
      132897) {
        each_value_1 = ensure_array_like(
          /*tags*/
          ctx2[0]
        );
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1(ctx2, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_1.length;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_else_block$1(ctx) {
  let t_value = (
    /*tag*/
    ctx[14][
      /*autoCompleteShowKey*/
      ctx[10]
    ] + ""
  );
  let t;
  return {
    c() {
      t = text(t_value);
    },
    l(nodes) {
      t = claim_text(nodes, t_value);
    },
    m(target, anchor) {
      insert_hydration(target, t, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*tags, autoCompleteShowKey*/
      1025 && t_value !== (t_value = /*tag*/
      ctx2[14][
        /*autoCompleteShowKey*/
        ctx2[10]
      ] + ""))
        set_data(t, t_value);
    },
    d(detaching) {
      if (detaching) {
        detach(t);
      }
    }
  };
}
function create_if_block_3(ctx) {
  let t_value = (
    /*tag*/
    ctx[14] + ""
  );
  let t;
  return {
    c() {
      t = text(t_value);
    },
    l(nodes) {
      t = claim_text(nodes, t_value);
    },
    m(target, anchor) {
      insert_hydration(target, t, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*tags*/
      1 && t_value !== (t_value = /*tag*/
      ctx2[14] + ""))
        set_data(t, t_value);
    },
    d(detaching) {
      if (detaching) {
        detach(t);
      }
    }
  };
}
function create_if_block_2(ctx) {
  let span;
  let textContent = "×";
  let mounted;
  let dispose;
  function pointerdown_handler() {
    return (
      /*pointerdown_handler*/
      ctx[41](
        /*i*/
        ctx[55]
      )
    );
  }
  return {
    c() {
      span = element("span");
      span.textContent = textContent;
      this.h();
    },
    l(nodes) {
      span = claim_element(nodes, "SPAN", { class: true, ["data-svelte-h"]: true });
      if (get_svelte_dataset(span) !== "svelte-1ml49b9")
        span.textContent = textContent;
      this.h();
    },
    h() {
      attr(span, "class", "svelte-tags-input-tag-remove svelte-1fyv6bg");
    },
    m(target, anchor) {
      insert_hydration(target, span, anchor);
      if (!mounted) {
        dispose = listen(span, "pointerdown", pointerdown_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_each_block_1(ctx) {
  let button;
  let t0;
  let t1;
  let mounted;
  let dispose;
  function select_block_type(ctx2, dirty) {
    if (typeof /*tag*/
    ctx2[14] === "string")
      return create_if_block_3;
    return create_else_block$1;
  }
  let current_block_type = select_block_type(ctx);
  let if_block0 = current_block_type(ctx);
  let if_block1 = !/*disable*/
  ctx[5] && !/*readonly*/
  ctx[8] && create_if_block_2(ctx);
  return {
    c() {
      button = element("button");
      if_block0.c();
      t0 = space();
      if (if_block1)
        if_block1.c();
      t1 = space();
      this.h();
    },
    l(nodes) {
      button = claim_element(nodes, "BUTTON", { type: true, class: true });
      var button_nodes = children(button);
      if_block0.l(button_nodes);
      t0 = claim_space(button_nodes);
      if (if_block1)
        if_block1.l(button_nodes);
      t1 = claim_space(button_nodes);
      button_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(button, "type", "button");
      attr(button, "class", "svelte-tags-input-tag svelte-1fyv6bg");
    },
    m(target, anchor) {
      insert_hydration(target, button, anchor);
      if_block0.m(button, null);
      append_hydration(button, t0);
      if (if_block1)
        if_block1.m(button, null);
      append_hydration(button, t1);
      if (!mounted) {
        dispose = listen(button, "click", function() {
          if (is_function(
            /*onTagClick*/
            ctx[9](
              /*tag*/
              ctx[14]
            )
          ))
            ctx[9](
              /*tag*/
              ctx[14]
            ).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
        if_block0.p(ctx, dirty);
      } else {
        if_block0.d(1);
        if_block0 = current_block_type(ctx);
        if (if_block0) {
          if_block0.c();
          if_block0.m(button, t0);
        }
      }
      if (!/*disable*/
      ctx[5] && !/*readonly*/
      ctx[8]) {
        if (if_block1) {
          if_block1.p(ctx, dirty);
        } else {
          if_block1 = create_if_block_2(ctx);
          if_block1.c();
          if_block1.m(button, t1);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(button);
      }
      if_block0.d();
      if (if_block1)
        if_block1.d();
      mounted = false;
      dispose();
    }
  };
}
function create_if_block$1(ctx) {
  let div;
  let ul;
  let ul_id_value;
  let each_value = ensure_array_like(
    /*arrelementsmatch*/
    ctx[11]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  }
  return {
    c() {
      div = element("div");
      ul = element("ul");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      ul = claim_element(div_nodes, "UL", { id: true, class: true });
      var ul_nodes = children(ul);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(ul_nodes);
      }
      ul_nodes.forEach(detach);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(ul, "id", ul_id_value = /*id*/
      ctx[4] + "_matchs");
      attr(ul, "class", "svelte-tags-input-matchs svelte-1fyv6bg");
      attr(div, "class", "svelte-tags-input-matchs-parent svelte-1fyv6bg");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      append_hydration(div, ul);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(ul, null);
        }
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*autoCompleteIndex, addTag, arrelementsmatch*/
      71680) {
        each_value = ensure_array_like(
          /*arrelementsmatch*/
          ctx2[11]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$1(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(ul, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (dirty[0] & /*id*/
      16 && ul_id_value !== (ul_id_value = /*id*/
      ctx2[4] + "_matchs")) {
        attr(ul, "id", ul_id_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_each_block$1(ctx) {
  let li;
  let html_tag;
  let raw_value = (
    /*element*/
    ctx[51].search + ""
  );
  let t;
  let mounted;
  let dispose;
  function pointerdown_handler_1() {
    return (
      /*pointerdown_handler_1*/
      ctx[45](
        /*element*/
        ctx[51]
      )
    );
  }
  return {
    c() {
      li = element("li");
      html_tag = new HtmlTagHydration(false);
      t = space();
      this.h();
    },
    l(nodes) {
      li = claim_element(nodes, "LI", { tabindex: true, class: true });
      var li_nodes = children(li);
      html_tag = claim_html_tag(li_nodes, false);
      t = claim_space(li_nodes);
      li_nodes.forEach(detach);
      this.h();
    },
    h() {
      html_tag.a = t;
      attr(li, "tabindex", "-1");
      attr(li, "class", "svelte-1fyv6bg");
      toggle_class(
        li,
        "focus",
        /*index*/
        ctx[53] === /*autoCompleteIndex*/
        ctx[12]
      );
    },
    m(target, anchor) {
      insert_hydration(target, li, anchor);
      html_tag.m(raw_value, li);
      append_hydration(li, t);
      if (!mounted) {
        dispose = listen(li, "pointerdown", prevent_default(pointerdown_handler_1));
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*arrelementsmatch*/
      2048 && raw_value !== (raw_value = /*element*/
      ctx[51].search + ""))
        html_tag.p(raw_value);
      if (dirty[0] & /*autoCompleteIndex*/
      4096) {
        toggle_class(
          li,
          "focus",
          /*index*/
          ctx[53] === /*autoCompleteIndex*/
          ctx[12]
        );
      }
    },
    d(detaching) {
      if (detaching) {
        detach(li);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$4(ctx) {
  let div;
  let label;
  let t0;
  let label_class_value;
  let t1;
  let t2;
  let input;
  let input_disabled_value;
  let t3;
  let if_block1_anchor;
  let mounted;
  let dispose;
  let if_block0 = (
    /*tags*/
    ctx[0].length > 0 && create_if_block_1(ctx)
  );
  let if_block1 = (
    /*autoComplete*/
    ctx[2] && /*arrelementsmatch*/
    ctx[11].length > 0 && create_if_block$1(ctx)
  );
  return {
    c() {
      div = element("div");
      label = element("label");
      t0 = text(
        /*labelText*/
        ctx[6]
      );
      t1 = space();
      if (if_block0)
        if_block0.c();
      t2 = space();
      input = element("input");
      t3 = space();
      if (if_block1)
        if_block1.c();
      if_block1_anchor = empty();
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      label = claim_element(div_nodes, "LABEL", { for: true, class: true });
      var label_nodes = children(label);
      t0 = claim_text(
        label_nodes,
        /*labelText*/
        ctx[6]
      );
      label_nodes.forEach(detach);
      t1 = claim_space(div_nodes);
      if (if_block0)
        if_block0.l(div_nodes);
      t2 = claim_space(div_nodes);
      input = claim_element(div_nodes, "INPUT", {
        type: true,
        id: true,
        name: true,
        class: true,
        placeholder: true,
        autocomplete: true
      });
      div_nodes.forEach(detach);
      t3 = claim_space(nodes);
      if (if_block1)
        if_block1.l(nodes);
      if_block1_anchor = empty();
      this.h();
    },
    h() {
      attr(
        label,
        "for",
        /*id*/
        ctx[4]
      );
      attr(label, "class", label_class_value = null_to_empty(
        /*labelShow*/
        ctx[7] ? "" : "sr-only"
      ) + " svelte-1fyv6bg");
      attr(input, "type", "text");
      attr(
        input,
        "id",
        /*id*/
        ctx[4]
      );
      attr(
        input,
        "name",
        /*name*/
        ctx[3]
      );
      attr(input, "class", "svelte-tags-input svelte-1fyv6bg");
      attr(
        input,
        "placeholder",
        /*placeholder*/
        ctx[1]
      );
      input.disabled = input_disabled_value = /*disable*/
      ctx[5] || /*readonly*/
      ctx[8];
      attr(input, "autocomplete", "off");
      attr(div, "class", "svelte-tags-input-layout svelte-1fyv6bg");
      toggle_class(
        div,
        "sti-layout-disable",
        /*disable*/
        ctx[5]
      );
      toggle_class(
        div,
        "sti-layout-readonly",
        /*readonly*/
        ctx[8]
      );
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      append_hydration(div, label);
      append_hydration(label, t0);
      append_hydration(div, t1);
      if (if_block0)
        if_block0.m(div, null);
      append_hydration(div, t2);
      append_hydration(div, input);
      set_input_value(
        input,
        /*tag*/
        ctx[14]
      );
      ctx[44](div);
      insert_hydration(target, t3, anchor);
      if (if_block1)
        if_block1.m(target, anchor);
      insert_hydration(target, if_block1_anchor, anchor);
      if (!mounted) {
        dispose = [
          listen(
            input,
            "input",
            /*input_input_handler*/
            ctx[42]
          ),
          listen(
            input,
            "keydown",
            /*setTag*/
            ctx[15]
          ),
          listen(
            input,
            "keyup",
            /*getMatchElements*/
            ctx[23]
          ),
          listen(
            input,
            "paste",
            /*onPaste*/
            ctx[18]
          ),
          listen(
            input,
            "drop",
            /*onDrop*/
            ctx[19]
          ),
          listen(
            input,
            "focus",
            /*onFocus*/
            ctx[20]
          ),
          listen(
            input,
            "blur",
            /*blur_handler*/
            ctx[43]
          ),
          listen(
            input,
            "pointerdown",
            /*onClick*/
            ctx[22]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*labelText*/
      64)
        set_data(
          t0,
          /*labelText*/
          ctx2[6]
        );
      if (dirty[0] & /*id*/
      16) {
        attr(
          label,
          "for",
          /*id*/
          ctx2[4]
        );
      }
      if (dirty[0] & /*labelShow*/
      128 && label_class_value !== (label_class_value = null_to_empty(
        /*labelShow*/
        ctx2[7] ? "" : "sr-only"
      ) + " svelte-1fyv6bg")) {
        attr(label, "class", label_class_value);
      }
      if (
        /*tags*/
        ctx2[0].length > 0
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_1(ctx2);
          if_block0.c();
          if_block0.m(div, t2);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty[0] & /*id*/
      16) {
        attr(
          input,
          "id",
          /*id*/
          ctx2[4]
        );
      }
      if (dirty[0] & /*name*/
      8) {
        attr(
          input,
          "name",
          /*name*/
          ctx2[3]
        );
      }
      if (dirty[0] & /*placeholder*/
      2) {
        attr(
          input,
          "placeholder",
          /*placeholder*/
          ctx2[1]
        );
      }
      if (dirty[0] & /*disable, readonly*/
      288 && input_disabled_value !== (input_disabled_value = /*disable*/
      ctx2[5] || /*readonly*/
      ctx2[8])) {
        input.disabled = input_disabled_value;
      }
      if (dirty[0] & /*tag*/
      16384 && input.value !== /*tag*/
      ctx2[14]) {
        set_input_value(
          input,
          /*tag*/
          ctx2[14]
        );
      }
      if (dirty[0] & /*disable*/
      32) {
        toggle_class(
          div,
          "sti-layout-disable",
          /*disable*/
          ctx2[5]
        );
      }
      if (dirty[0] & /*readonly*/
      256) {
        toggle_class(
          div,
          "sti-layout-readonly",
          /*readonly*/
          ctx2[8]
        );
      }
      if (
        /*autoComplete*/
        ctx2[2] && /*arrelementsmatch*/
        ctx2[11].length > 0
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block$1(ctx2);
          if_block1.c();
          if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching) {
        detach(div);
        detach(t3);
        detach(if_block1_anchor);
      }
      if (if_block0)
        if_block0.d();
      ctx[44](null);
      if (if_block1)
        if_block1.d(detaching);
      mounted = false;
      run_all(dispose);
    }
  };
}
function getClipboardData(e) {
  if (window.clipboardData) {
    return window.clipboardData.getData("Text");
  }
  if (e.clipboardData) {
    return e.clipboardData.getData("text/plain");
  }
  return "";
}
function escapeHTML(string) {
  const htmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;"
  };
  return ("" + string).replace(/[&<>"'\/]/g, (match) => htmlEscapes[match]);
}
function uniqueID() {
  return "sti_" + Math.random().toString(36).substring(2, 11);
}
function instance$4($$self, $$props, $$invalidate) {
  let matchsID;
  let tag = "";
  let arrelementsmatch = [];
  let autoCompleteIndex = -1;
  let regExpEscape = (s) => {
    return s.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
  };
  let { tags } = $$props;
  let { addKeys } = $$props;
  let { maxTags } = $$props;
  let { onlyUnique } = $$props;
  let { removeKeys } = $$props;
  let { placeholder } = $$props;
  let { allowPaste } = $$props;
  let { allowDrop } = $$props;
  let { splitWith } = $$props;
  let { autoComplete } = $$props;
  let { autoCompleteFilter } = $$props;
  let { autoCompleteKey } = $$props;
  let { autoCompleteMarkupKey } = $$props;
  let { name } = $$props;
  let { id } = $$props;
  let { allowBlur } = $$props;
  let { disable } = $$props;
  let { minChars } = $$props;
  let { onlyAutocomplete } = $$props;
  let { labelText } = $$props;
  let { labelShow } = $$props;
  let { readonly } = $$props;
  let { onTagClick } = $$props;
  let { autoCompleteShowKey } = $$props;
  let { onTagAdded } = $$props;
  let { onTagRemoved } = $$props;
  let { cleanOnBlur } = $$props;
  let { customValidation } = $$props;
  let layoutElement;
  let storePlaceholder = placeholder;
  function setTag(e) {
    const currentTag = e.target.value;
    if (addKeys) {
      addKeys.forEach(function(key) {
        if (key === e.keyCode) {
          if (currentTag)
            e.preventDefault();
          if (autoComplete && onlyAutocomplete && document.getElementById(matchsID)) {
            addTag(arrelementsmatch?.[autoCompleteIndex]?.label);
          } else {
            addTag(currentTag);
          }
        }
      });
    }
    if (removeKeys) {
      removeKeys.forEach(function(key) {
        if (key === e.keyCode && tag === "") {
          tags.pop();
          $$invalidate(0, tags);
          $$invalidate(11, arrelementsmatch = []);
          document.getElementById(id).readOnly = false;
          $$invalidate(1, placeholder = storePlaceholder);
          document.getElementById(id).focus();
        }
      });
    }
    if (e.keyCode === 40 && autoComplete && document.getElementById(matchsID)) {
      if (autoCompleteIndex + 1 === arrelementsmatch.length)
        $$invalidate(12, autoCompleteIndex = 0);
      else
        $$invalidate(12, autoCompleteIndex++, autoCompleteIndex);
    } else if (e.keyCode === 38) {
      if (autoCompleteIndex <= 0)
        $$invalidate(12, autoCompleteIndex = arrelementsmatch.length - 1);
      else
        $$invalidate(12, autoCompleteIndex--, autoCompleteIndex);
    } else if (e.keyCode === 27) {
      $$invalidate(11, arrelementsmatch = []);
      document.getElementById(id).focus();
    }
  }
  function addTag(currentTag) {
    if (typeof currentTag === "object" && currentTag !== null) {
      if (!autoCompleteKey) {
        return console.error("'autoCompleteKey' is necessary if 'autoComplete' result is an array of objects");
      }
      if (onlyUnique) {
        let found = tags?.find((elem) => elem[autoCompleteKey] === currentTag[autoCompleteKey]);
        if (found)
          return;
      }
      var currentObjTags = currentTag;
      currentTag = currentTag[autoCompleteKey].trim();
    } else {
      currentTag = currentTag.trim();
    }
    if (currentTag == "")
      return;
    if (maxTags && tags.length == maxTags)
      return;
    if (onlyUnique && tags.includes(currentTag))
      return;
    if (onlyAutocomplete && arrelementsmatch.length === 0)
      return;
    if (customValidation && !customValidation(currentTag))
      return;
    tags.push(currentObjTags ? currentObjTags : currentTag);
    $$invalidate(0, tags);
    $$invalidate(14, tag = "");
    onTagAdded(currentTag, tags);
    $$invalidate(11, arrelementsmatch = []);
    $$invalidate(12, autoCompleteIndex = -1);
    document.getElementById(id).focus();
    if (maxTags && tags.length == maxTags) {
      document.getElementById(id).readOnly = true;
      $$invalidate(1, placeholder = "");
    }
  }
  function removeTag(i) {
    tags.splice(i, 1);
    onTagRemoved(tags[i], tags);
    $$invalidate(0, tags);
    $$invalidate(11, arrelementsmatch = []);
    document.getElementById(id).readOnly = false;
    $$invalidate(1, placeholder = storePlaceholder);
    document.getElementById(id).focus();
  }
  function onPaste(e) {
    if (!allowPaste)
      return;
    e.preventDefault();
    const data = getClipboardData(e);
    splitTags(data).map((tag2) => addTag(tag2));
  }
  function onDrop(e) {
    if (!allowDrop)
      return;
    e.preventDefault();
    const data = e.dataTransfer.getData("Text");
    splitTags(data).map((tag2) => addTag(tag2));
  }
  function onFocus() {
    layoutElement.classList.add("focus");
  }
  function onBlur(e, currentTag) {
    layoutElement.classList.remove("focus");
    if (allowBlur) {
      if (arrelementsmatch.length && autoCompleteIndex > -1) {
        addTag(arrelementsmatch?.[autoCompleteIndex]?.label);
      } else if (!arrelementsmatch.length) {
        e.preventDefault();
        addTag(currentTag);
      }
    }
    if (cleanOnBlur) {
      $$invalidate(14, tag = "");
    }
    $$invalidate(11, arrelementsmatch = []);
    $$invalidate(12, autoCompleteIndex = -1);
  }
  function onClick() {
    minChars == 0 && getMatchElements();
  }
  function splitTags(data) {
    return data.split(splitWith).map((tag2) => tag2.trim());
  }
  function buildMatchMarkup(search, value) {
    return escapeHTML(value).replace(RegExp(regExpEscape(search.toLowerCase()), "i"), "<strong>$&</strong>");
  }
  async function getMatchElements(input) {
    if (!autoComplete)
      return;
    if (maxTags && tags.length >= maxTags)
      return;
    let value = input ? input.target.value : "";
    let autoCompleteValues = [];
    if (Array.isArray(autoComplete)) {
      autoCompleteValues = autoComplete;
    }
    if (typeof autoComplete === "function") {
      if (autoComplete.constructor.name === "AsyncFunction") {
        autoCompleteValues = await autoComplete(value);
      } else {
        autoCompleteValues = autoComplete(value);
      }
    }
    if (autoCompleteValues.constructor.name === "Promise") {
      autoCompleteValues = await autoCompleteValues;
    }
    if (minChars > 0 && value == "" || input && input.keyCode === 27 || value.length < minChars) {
      $$invalidate(11, arrelementsmatch = []);
      return;
    }
    let matchs = autoCompleteValues;
    if (typeof autoCompleteValues[0] === "object" && autoCompleteValues !== null) {
      if (!autoCompleteKey) {
        return console.error("'autoCompleteValue' is necessary if 'autoComplete' result is an array of objects");
      }
      if (autoCompleteFilter !== false) {
        matchs = autoCompleteValues.filter((e) => e[autoCompleteKey].toLowerCase().includes(value.toLowerCase()));
      }
      matchs = matchs.map((matchTag) => {
        return {
          label: matchTag,
          search: autoCompleteMarkupKey ? matchTag[autoCompleteMarkupKey] : buildMatchMarkup(value, matchTag[autoCompleteKey])
        };
      });
    } else {
      if (autoCompleteFilter !== false) {
        matchs = autoCompleteValues.filter((e) => e.toLowerCase().includes(value.toLowerCase()));
      }
      matchs = matchs.map((matchTag) => {
        return {
          label: matchTag,
          search: buildMatchMarkup(value, matchTag)
        };
      });
    }
    if (onlyUnique === true && !autoCompleteKey) {
      matchs = matchs.filter((tag2) => !tags.includes(tag2.label));
    }
    $$invalidate(11, arrelementsmatch = matchs);
  }
  const pointerdown_handler = (i) => removeTag(i);
  function input_input_handler() {
    tag = this.value;
    $$invalidate(14, tag);
  }
  const blur_handler = (e) => onBlur(e, tag);
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      layoutElement = $$value;
      $$invalidate(13, layoutElement);
    });
  }
  const pointerdown_handler_1 = (element2) => addTag(element2.label);
  $$self.$$set = ($$props2) => {
    if ("tags" in $$props2)
      $$invalidate(0, tags = $$props2.tags);
    if ("addKeys" in $$props2)
      $$invalidate(24, addKeys = $$props2.addKeys);
    if ("maxTags" in $$props2)
      $$invalidate(25, maxTags = $$props2.maxTags);
    if ("onlyUnique" in $$props2)
      $$invalidate(26, onlyUnique = $$props2.onlyUnique);
    if ("removeKeys" in $$props2)
      $$invalidate(27, removeKeys = $$props2.removeKeys);
    if ("placeholder" in $$props2)
      $$invalidate(1, placeholder = $$props2.placeholder);
    if ("allowPaste" in $$props2)
      $$invalidate(28, allowPaste = $$props2.allowPaste);
    if ("allowDrop" in $$props2)
      $$invalidate(29, allowDrop = $$props2.allowDrop);
    if ("splitWith" in $$props2)
      $$invalidate(30, splitWith = $$props2.splitWith);
    if ("autoComplete" in $$props2)
      $$invalidate(2, autoComplete = $$props2.autoComplete);
    if ("autoCompleteFilter" in $$props2)
      $$invalidate(31, autoCompleteFilter = $$props2.autoCompleteFilter);
    if ("autoCompleteKey" in $$props2)
      $$invalidate(32, autoCompleteKey = $$props2.autoCompleteKey);
    if ("autoCompleteMarkupKey" in $$props2)
      $$invalidate(33, autoCompleteMarkupKey = $$props2.autoCompleteMarkupKey);
    if ("name" in $$props2)
      $$invalidate(3, name = $$props2.name);
    if ("id" in $$props2)
      $$invalidate(4, id = $$props2.id);
    if ("allowBlur" in $$props2)
      $$invalidate(34, allowBlur = $$props2.allowBlur);
    if ("disable" in $$props2)
      $$invalidate(5, disable = $$props2.disable);
    if ("minChars" in $$props2)
      $$invalidate(35, minChars = $$props2.minChars);
    if ("onlyAutocomplete" in $$props2)
      $$invalidate(36, onlyAutocomplete = $$props2.onlyAutocomplete);
    if ("labelText" in $$props2)
      $$invalidate(6, labelText = $$props2.labelText);
    if ("labelShow" in $$props2)
      $$invalidate(7, labelShow = $$props2.labelShow);
    if ("readonly" in $$props2)
      $$invalidate(8, readonly = $$props2.readonly);
    if ("onTagClick" in $$props2)
      $$invalidate(9, onTagClick = $$props2.onTagClick);
    if ("autoCompleteShowKey" in $$props2)
      $$invalidate(10, autoCompleteShowKey = $$props2.autoCompleteShowKey);
    if ("onTagAdded" in $$props2)
      $$invalidate(37, onTagAdded = $$props2.onTagAdded);
    if ("onTagRemoved" in $$props2)
      $$invalidate(38, onTagRemoved = $$props2.onTagRemoved);
    if ("cleanOnBlur" in $$props2)
      $$invalidate(39, cleanOnBlur = $$props2.cleanOnBlur);
    if ("customValidation" in $$props2)
      $$invalidate(40, customValidation = $$props2.customValidation);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*tags*/
    1) {
      $$invalidate(0, tags = tags || []);
    }
    if ($$self.$$.dirty[0] & /*addKeys*/
    16777216) {
      $$invalidate(24, addKeys = addKeys || [13]);
    }
    if ($$self.$$.dirty[0] & /*maxTags*/
    33554432) {
      $$invalidate(25, maxTags = maxTags || false);
    }
    if ($$self.$$.dirty[0] & /*onlyUnique*/
    67108864) {
      $$invalidate(26, onlyUnique = onlyUnique || false);
    }
    if ($$self.$$.dirty[0] & /*removeKeys*/
    134217728) {
      $$invalidate(27, removeKeys = removeKeys || [8]);
    }
    if ($$self.$$.dirty[0] & /*placeholder*/
    2) {
      $$invalidate(1, placeholder = placeholder || "");
    }
    if ($$self.$$.dirty[0] & /*allowPaste*/
    268435456) {
      $$invalidate(28, allowPaste = allowPaste || false);
    }
    if ($$self.$$.dirty[0] & /*allowDrop*/
    536870912) {
      $$invalidate(29, allowDrop = allowDrop || false);
    }
    if ($$self.$$.dirty[0] & /*splitWith*/
    1073741824) {
      $$invalidate(30, splitWith = splitWith || ",");
    }
    if ($$self.$$.dirty[0] & /*autoComplete*/
    4) {
      $$invalidate(2, autoComplete = autoComplete || false);
    }
    if ($$self.$$.dirty[1] & /*autoCompleteFilter*/
    1) {
      $$invalidate(31, autoCompleteFilter = typeof autoCompleteFilter == "undefined" ? true : false);
    }
    if ($$self.$$.dirty[1] & /*autoCompleteKey*/
    2) {
      $$invalidate(32, autoCompleteKey = autoCompleteKey || false);
    }
    if ($$self.$$.dirty[1] & /*autoCompleteMarkupKey*/
    4) {
      $$invalidate(33, autoCompleteMarkupKey = autoCompleteMarkupKey || false);
    }
    if ($$self.$$.dirty[0] & /*name*/
    8) {
      $$invalidate(3, name = name || "svelte-tags-input");
    }
    if ($$self.$$.dirty[0] & /*id*/
    16) {
      $$invalidate(4, id = id || uniqueID());
    }
    if ($$self.$$.dirty[1] & /*allowBlur*/
    8) {
      $$invalidate(34, allowBlur = allowBlur || false);
    }
    if ($$self.$$.dirty[0] & /*disable*/
    32) {
      $$invalidate(5, disable = disable || false);
    }
    if ($$self.$$.dirty[1] & /*minChars*/
    16) {
      $$invalidate(35, minChars = minChars ?? 1);
    }
    if ($$self.$$.dirty[1] & /*onlyAutocomplete*/
    32) {
      $$invalidate(36, onlyAutocomplete = onlyAutocomplete || false);
    }
    if ($$self.$$.dirty[0] & /*labelText, name*/
    72) {
      $$invalidate(6, labelText = labelText || name);
    }
    if ($$self.$$.dirty[0] & /*labelShow*/
    128) {
      $$invalidate(7, labelShow = labelShow || false);
    }
    if ($$self.$$.dirty[0] & /*readonly*/
    256) {
      $$invalidate(8, readonly = readonly || false);
    }
    if ($$self.$$.dirty[0] & /*onTagClick*/
    512) {
      $$invalidate(9, onTagClick = onTagClick || function() {
      });
    }
    if ($$self.$$.dirty[0] & /*autoCompleteShowKey*/
    1024 | $$self.$$.dirty[1] & /*autoCompleteKey*/
    2) {
      $$invalidate(10, autoCompleteShowKey = autoCompleteShowKey || autoCompleteKey);
    }
    if ($$self.$$.dirty[1] & /*onTagAdded*/
    64) {
      $$invalidate(37, onTagAdded = onTagAdded || function() {
      });
    }
    if ($$self.$$.dirty[1] & /*onTagRemoved*/
    128) {
      $$invalidate(38, onTagRemoved = onTagRemoved || function() {
      });
    }
    if ($$self.$$.dirty[1] & /*cleanOnBlur*/
    256) {
      $$invalidate(39, cleanOnBlur = cleanOnBlur || false);
    }
    if ($$self.$$.dirty[1] & /*customValidation*/
    512) {
      $$invalidate(40, customValidation = customValidation || false);
    }
    if ($$self.$$.dirty[0] & /*id*/
    16) {
      matchsID = id + "_matchs";
    }
  };
  return [
    tags,
    placeholder,
    autoComplete,
    name,
    id,
    disable,
    labelText,
    labelShow,
    readonly,
    onTagClick,
    autoCompleteShowKey,
    arrelementsmatch,
    autoCompleteIndex,
    layoutElement,
    tag,
    setTag,
    addTag,
    removeTag,
    onPaste,
    onDrop,
    onFocus,
    onBlur,
    onClick,
    getMatchElements,
    addKeys,
    maxTags,
    onlyUnique,
    removeKeys,
    allowPaste,
    allowDrop,
    splitWith,
    autoCompleteFilter,
    autoCompleteKey,
    autoCompleteMarkupKey,
    allowBlur,
    minChars,
    onlyAutocomplete,
    onTagAdded,
    onTagRemoved,
    cleanOnBlur,
    customValidation,
    pointerdown_handler,
    input_input_handler,
    blur_handler,
    div_binding,
    pointerdown_handler_1
  ];
}
class Tags extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$4,
      create_fragment$4,
      safe_not_equal,
      {
        tags: 0,
        addKeys: 24,
        maxTags: 25,
        onlyUnique: 26,
        removeKeys: 27,
        placeholder: 1,
        allowPaste: 28,
        allowDrop: 29,
        splitWith: 30,
        autoComplete: 2,
        autoCompleteFilter: 31,
        autoCompleteKey: 32,
        autoCompleteMarkupKey: 33,
        name: 3,
        id: 4,
        allowBlur: 34,
        disable: 5,
        minChars: 35,
        onlyAutocomplete: 36,
        labelText: 6,
        labelShow: 7,
        readonly: 8,
        onTagClick: 9,
        autoCompleteShowKey: 10,
        onTagAdded: 37,
        onTagRemoved: 38,
        cleanOnBlur: 39,
        customValidation: 40
      },
      null,
      [-1, -1]
    );
  }
}
function create_fragment$3(ctx) {
  let div3;
  let input;
  let t0;
  let div0;
  let html_tag;
  let t1;
  let div2;
  let tags_1;
  let updating_tags;
  let t2;
  let div1;
  let button;
  let textContent = "DELETE";
  let current;
  let mounted;
  let dispose;
  function tags_1_tags_binding(value) {
    ctx[12](value);
  }
  let tags_1_props = {
    autoComplete: (
      /*$all_tags*/
      ctx[7]
    ),
    onlyUnique: true,
    onTagAdded: (
      /*onTagAdded*/
      ctx[9]
    ),
    onTagRemoved: (
      /*onTagRemoved*/
      ctx[10]
    )
  };
  if (
    /*tags*/
    ctx[6] !== void 0
  ) {
    tags_1_props.tags = /*tags*/
    ctx[6];
  }
  tags_1 = new Tags({ props: tags_1_props });
  binding_callbacks.push(() => bind$1(tags_1, "tags", tags_1_tags_binding));
  return {
    c() {
      div3 = element("div");
      input = element("input");
      t0 = space();
      div0 = element("div");
      html_tag = new HtmlTagHydration(false);
      t1 = space();
      div2 = element("div");
      create_component(tags_1.$$.fragment);
      t2 = space();
      div1 = element("div");
      button = element("button");
      button.textContent = textContent;
      this.h();
    },
    l(nodes) {
      div3 = claim_element(nodes, "DIV", { class: true });
      var div3_nodes = children(div3);
      input = claim_element(div3_nodes, "INPUT", { type: true });
      t0 = claim_space(div3_nodes);
      div0 = claim_element(div3_nodes, "DIV", { class: true, style: true });
      var div0_nodes = children(div0);
      html_tag = claim_html_tag(div0_nodes, false);
      div0_nodes.forEach(detach);
      t1 = claim_space(div3_nodes);
      div2 = claim_element(div3_nodes, "DIV", { class: true });
      var div2_nodes = children(div2);
      claim_component(tags_1.$$.fragment, div2_nodes);
      t2 = claim_space(div2_nodes);
      div1 = claim_element(div2_nodes, "DIV", { class: true });
      var div1_nodes = children(div1);
      button = claim_element(div1_nodes, "BUTTON", {
        class: true,
        style: true,
        ["data-svelte-h"]: true
      });
      if (get_svelte_dataset(button) !== "svelte-zjetis")
        button.textContent = textContent;
      div1_nodes.forEach(detach);
      div2_nodes.forEach(detach);
      div3_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(input, "type", "checkbox");
      html_tag.a = null;
      attr(div0, "class", "collapse-title text-center");
      set_style(div0, "font-size", "0.95rem");
      set_style(div0, "padding", "0.5rem");
      set_style(div0, "grid-column-start", "1");
      attr(button, "class", "btn btn-xs join-item grow");
      set_style(button, "color", "red");
      attr(div1, "class", "join w-full");
      attr(div2, "class", "collapse-content z-40");
      attr(div3, "class", "collapse bg-base-200");
    },
    m(target, anchor) {
      insert_hydration(target, div3, anchor);
      append_hydration(div3, input);
      input.checked = /*showing_content*/
      ctx[0];
      append_hydration(div3, t0);
      append_hydration(div3, div0);
      html_tag.m(
        /*text*/
        ctx[5],
        div0
      );
      append_hydration(div3, t1);
      append_hydration(div3, div2);
      mount_component(tags_1, div2, null);
      append_hydration(div2, t2);
      append_hydration(div2, div1);
      append_hydration(div1, button);
      current = true;
      if (!mounted) {
        dispose = [
          listen(
            input,
            "change",
            /*input_change_handler*/
            ctx[11]
          ),
          listen(input, "click", function() {
            if (is_function(
              /*close_all_notes*/
              ctx[2]
            ))
              ctx[2].apply(this, arguments);
          }),
          listen(input, "dblclick", function() {
            if (is_function(
              /*goto_function*/
              ctx[4]
            ))
              ctx[4].apply(this, arguments);
          }),
          listen(
            button,
            "click",
            /*click_handler*/
            ctx[13]
          )
        ];
        mounted = true;
      }
    },
    p(new_ctx, [dirty]) {
      ctx = new_ctx;
      if (dirty & /*showing_content*/
      1) {
        input.checked = /*showing_content*/
        ctx[0];
      }
      if (!current || dirty & /*text*/
      32)
        html_tag.p(
          /*text*/
          ctx[5]
        );
      const tags_1_changes = {};
      if (dirty & /*$all_tags*/
      128)
        tags_1_changes.autoComplete = /*$all_tags*/
        ctx[7];
      if (!updating_tags && dirty & /*tags*/
      64) {
        updating_tags = true;
        tags_1_changes.tags = /*tags*/
        ctx[6];
        add_flush_callback(() => updating_tags = false);
      }
      tags_1.$set(tags_1_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(tags_1.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(tags_1.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div3);
      }
      destroy_component(tags_1);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$3($$self, $$props, $$invalidate) {
  let tags;
  let text2;
  let $all_tags;
  let { note_data } = $$props;
  let { showing_content } = $$props;
  let { close_all_notes } = $$props;
  let { note_sync } = $$props;
  let { goto_function } = $$props;
  let all_tags = note_sync.alltags();
  component_subscribe($$self, all_tags, (value) => $$invalidate(7, $all_tags = value));
  let replacer = (capture) => `<b class="text-yellow-200">` + capture + `</b>`;
  const onTagAdded = note_sync.tagUpdate(note_data);
  const onTagRemoved = note_sync.tagUpdate(note_data);
  function input_change_handler() {
    showing_content = this.checked;
    $$invalidate(0, showing_content);
  }
  function tags_1_tags_binding(value) {
    tags = value;
    $$invalidate(6, tags), $$invalidate(1, note_data);
  }
  const click_handler = (e) => {
    note_sync.deleteit(note_data);
    close_all_notes(e);
  };
  $$self.$$set = ($$props2) => {
    if ("note_data" in $$props2)
      $$invalidate(1, note_data = $$props2.note_data);
    if ("showing_content" in $$props2)
      $$invalidate(0, showing_content = $$props2.showing_content);
    if ("close_all_notes" in $$props2)
      $$invalidate(2, close_all_notes = $$props2.close_all_notes);
    if ("note_sync" in $$props2)
      $$invalidate(3, note_sync = $$props2.note_sync);
    if ("goto_function" in $$props2)
      $$invalidate(4, goto_function = $$props2.goto_function);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*note_data*/
    2) {
      $$invalidate(6, tags = note_data.tags || []);
    }
    if ($$self.$$.dirty & /*note_data*/
    2) {
      $$invalidate(5, text2 = note_data.highlights ? note_data.quote.replaceAll(note_data.highlights[0], replacer) : note_data.quote);
    }
  };
  return [
    showing_content,
    note_data,
    close_all_notes,
    note_sync,
    goto_function,
    text2,
    tags,
    $all_tags,
    all_tags,
    onTagAdded,
    onTagRemoved,
    input_change_handler,
    tags_1_tags_binding,
    click_handler
  ];
}
class Note extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, {
      note_data: 1,
      showing_content: 0,
      close_all_notes: 2,
      note_sync: 3,
      goto_function: 4
    });
  }
}
function create_fragment$2(ctx) {
  let note;
  let updating_showing_content;
  let current;
  function note_showing_content_binding(value) {
    ctx[5](value);
  }
  let note_props = {
    note_data: (
      /*note_data*/
      ctx[2]
    ),
    note_sync: (
      /*note_sync*/
      ctx[1]
    ),
    close_all_notes: (
      /*close_all_notes*/
      ctx[3]
    ),
    goto_function: (
      /*goto_function*/
      ctx[4]
    )
  };
  if (
    /*showing_content*/
    ctx[0] !== void 0
  ) {
    note_props.showing_content = /*showing_content*/
    ctx[0];
  }
  note = new Note({ props: note_props });
  binding_callbacks.push(() => bind$1(note, "showing_content", note_showing_content_binding));
  return {
    c() {
      create_component(note.$$.fragment);
    },
    l(nodes) {
      claim_component(note.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(note, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const note_changes = {};
      if (dirty & /*note_data*/
      4)
        note_changes.note_data = /*note_data*/
        ctx2[2];
      if (dirty & /*note_sync*/
      2)
        note_changes.note_sync = /*note_sync*/
        ctx2[1];
      if (dirty & /*close_all_notes*/
      8)
        note_changes.close_all_notes = /*close_all_notes*/
        ctx2[3];
      if (!updating_showing_content && dirty & /*showing_content*/
      1) {
        updating_showing_content = true;
        note_changes.showing_content = /*showing_content*/
        ctx2[0];
        add_flush_callback(() => updating_showing_content = false);
      }
      note.$set(note_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(note.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(note.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(note, detaching);
    }
  };
}
function instance$2($$self, $$props, $$invalidate) {
  let { note_sync } = $$props;
  let { note_data } = $$props;
  let { showing_content } = $$props;
  let { close_all_notes } = $$props;
  let goto_function = () => gotoSnippet(note_data.snippet_uuid);
  function note_showing_content_binding(value) {
    showing_content = value;
    $$invalidate(0, showing_content);
  }
  $$self.$$set = ($$props2) => {
    if ("note_sync" in $$props2)
      $$invalidate(1, note_sync = $$props2.note_sync);
    if ("note_data" in $$props2)
      $$invalidate(2, note_data = $$props2.note_data);
    if ("showing_content" in $$props2)
      $$invalidate(0, showing_content = $$props2.showing_content);
    if ("close_all_notes" in $$props2)
      $$invalidate(3, close_all_notes = $$props2.close_all_notes);
  };
  return [
    showing_content,
    note_sync,
    note_data,
    close_all_notes,
    goto_function,
    note_showing_content_binding
  ];
}
class Note_1 extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, {
      note_sync: 1,
      note_data: 2,
      showing_content: 0,
      close_all_notes: 3
    });
  }
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[7] = list[i];
  child_ctx[8] = list;
  child_ctx[9] = i;
  return child_ctx;
}
function create_else_block(ctx) {
  let t;
  return {
    c() {
      t = text("If you just installed the extension, you need to reload the page.");
    },
    l(nodes) {
      t = claim_text(nodes, "If you just installed the extension, you need to reload the page.");
    },
    m(target, anchor) {
      insert_hydration(target, t, anchor);
    },
    d(detaching) {
      if (detaching) {
        detach(t);
      }
    }
  };
}
function create_each_block(ctx) {
  let note;
  let updating_showing_content;
  let current;
  function note_showing_content_binding(value) {
    ctx[6](
      value,
      /*i*/
      ctx[9]
    );
  }
  let note_props = {
    note_data: (
      /*note_data*/
      ctx[7]
    ),
    close_all_notes: (
      /*close_all_notes*/
      ctx[5]
    ),
    note_sync: (
      /*note_sync*/
      ctx[0]
    )
  };
  if (
    /*showing_contents*/
    ctx[2][
      /*i*/
      ctx[9]
    ] !== void 0
  ) {
    note_props.showing_content = /*showing_contents*/
    ctx[2][
      /*i*/
      ctx[9]
    ];
  }
  note = new Note_1({ props: note_props });
  binding_callbacks.push(() => bind$1(note, "showing_content", note_showing_content_binding));
  return {
    c() {
      create_component(note.$$.fragment);
    },
    l(nodes) {
      claim_component(note.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(note, target, anchor);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const note_changes = {};
      if (dirty & /*$note_store, source_id*/
      10)
        note_changes.note_data = /*note_data*/
        ctx[7];
      if (dirty & /*note_sync*/
      1)
        note_changes.note_sync = /*note_sync*/
        ctx[0];
      if (!updating_showing_content && dirty & /*showing_contents*/
      4) {
        updating_showing_content = true;
        note_changes.showing_content = /*showing_contents*/
        ctx[2][
          /*i*/
          ctx[9]
        ];
        add_flush_callback(() => updating_showing_content = false);
      }
      note.$set(note_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(note.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(note.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(note, detaching);
    }
  };
}
function create_fragment$1(ctx) {
  let each_1_anchor;
  let current;
  let each_value = ensure_array_like(
    /*$note_store*/
    ctx[3][
      /*source_id*/
      ctx[1]
    ]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  let each_1_else = null;
  if (!each_value.length) {
    each_1_else = create_else_block();
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
      if (each_1_else) {
        each_1_else.c();
      }
    },
    l(nodes) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(nodes);
      }
      each_1_anchor = empty();
      if (each_1_else) {
        each_1_else.l(nodes);
      }
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert_hydration(target, each_1_anchor, anchor);
      if (each_1_else) {
        each_1_else.m(target, anchor);
      }
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & /*$note_store, source_id, close_all_notes, note_sync, showing_contents*/
      47) {
        each_value = ensure_array_like(
          /*$note_store*/
          ctx2[3][
            /*source_id*/
            ctx2[1]
          ]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        group_outros();
        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
        if (each_value.length) {
          if (each_1_else) {
            each_1_else.d(1);
            each_1_else = null;
          }
        } else if (!each_1_else) {
          each_1_else = create_else_block();
          each_1_else.c();
          each_1_else.m(each_1_anchor.parentNode, each_1_anchor);
        }
      }
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
      if (each_1_else)
        each_1_else.d(detaching);
    }
  };
}
function instance$1($$self, $$props, $$invalidate) {
  let $note_store;
  let { note_sync } = $$props;
  let note_store = note_sync.notestore;
  component_subscribe($$self, note_store, (value) => $$invalidate(3, $note_store = value));
  let { source_id } = $$props;
  if (!(source_id in $note_store))
    set_store_value(note_store, $note_store[source_id] = [], $note_store);
  let showing_contents = $note_store[source_id].map((_2) => false);
  let close_all_notes = () => {
    $$invalidate(2, showing_contents = showing_contents.map((_2) => false));
  };
  function note_showing_content_binding(value, i) {
    if ($$self.$$.not_equal(showing_contents[i], value)) {
      showing_contents[i] = value;
      $$invalidate(2, showing_contents);
    }
  }
  $$self.$$set = ($$props2) => {
    if ("note_sync" in $$props2)
      $$invalidate(0, note_sync = $$props2.note_sync);
    if ("source_id" in $$props2)
      $$invalidate(1, source_id = $$props2.source_id);
  };
  return [
    note_sync,
    source_id,
    showing_contents,
    $note_store,
    note_store,
    close_all_notes,
    note_showing_content_binding
  ];
}
class NotePanel extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, { note_sync: 0, source_id: 1 });
  }
}
const mock = {
  id: -1,
  predicted_topic: "",
  created_at: "",
  tags: [],
  user_id: "",
  user_note: ""
};
/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */
const Z_FIXED$1 = 4;
const Z_BINARY = 0;
const Z_TEXT = 1;
const Z_UNKNOWN$1 = 2;
function zero$1(buf) {
  let len = buf.length;
  while (--len >= 0) {
    buf[len] = 0;
  }
}
const STORED_BLOCK = 0;
const STATIC_TREES = 1;
const DYN_TREES = 2;
const MIN_MATCH$1 = 3;
const MAX_MATCH$1 = 258;
const LENGTH_CODES$1 = 29;
const LITERALS$1 = 256;
const L_CODES$1 = LITERALS$1 + 1 + LENGTH_CODES$1;
const D_CODES$1 = 30;
const BL_CODES$1 = 19;
const HEAP_SIZE$1 = 2 * L_CODES$1 + 1;
const MAX_BITS$1 = 15;
const Buf_size = 16;
const MAX_BL_BITS = 7;
const END_BLOCK = 256;
const REP_3_6 = 16;
const REPZ_3_10 = 17;
const REPZ_11_138 = 18;
const extra_lbits = (
  /* extra bits for each length code */
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0])
);
const extra_dbits = (
  /* extra bits for each distance code */
  new Uint8Array([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13])
);
const extra_blbits = (
  /* extra bits for each bit length code */
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7])
);
const bl_order = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
const DIST_CODE_LEN = 512;
const static_ltree = new Array((L_CODES$1 + 2) * 2);
zero$1(static_ltree);
const static_dtree = new Array(D_CODES$1 * 2);
zero$1(static_dtree);
const _dist_code = new Array(DIST_CODE_LEN);
zero$1(_dist_code);
const _length_code = new Array(MAX_MATCH$1 - MIN_MATCH$1 + 1);
zero$1(_length_code);
const base_length = new Array(LENGTH_CODES$1);
zero$1(base_length);
const base_dist = new Array(D_CODES$1);
zero$1(base_dist);
function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
  this.static_tree = static_tree;
  this.extra_bits = extra_bits;
  this.extra_base = extra_base;
  this.elems = elems;
  this.max_length = max_length;
  this.has_stree = static_tree && static_tree.length;
}
let static_l_desc;
let static_d_desc;
let static_bl_desc;
function TreeDesc(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;
  this.max_code = 0;
  this.stat_desc = stat_desc;
}
const d_code = (dist) => {
  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
};
const put_short = (s, w) => {
  s.pending_buf[s.pending++] = w & 255;
  s.pending_buf[s.pending++] = w >>> 8 & 255;
};
const send_bits = (s, value, length) => {
  if (s.bi_valid > Buf_size - length) {
    s.bi_buf |= value << s.bi_valid & 65535;
    put_short(s, s.bi_buf);
    s.bi_buf = value >> Buf_size - s.bi_valid;
    s.bi_valid += length - Buf_size;
  } else {
    s.bi_buf |= value << s.bi_valid & 65535;
    s.bi_valid += length;
  }
};
const send_code = (s, c, tree) => {
  send_bits(
    s,
    tree[c * 2],
    tree[c * 2 + 1]
    /*.Len*/
  );
};
const bi_reverse = (code, len) => {
  let res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
};
const bi_flush = (s) => {
  if (s.bi_valid === 16) {
    put_short(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;
  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 255;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
};
const gen_bitlen = (s, desc) => {
  const tree = desc.dyn_tree;
  const max_code = desc.max_code;
  const stree = desc.stat_desc.static_tree;
  const has_stree = desc.stat_desc.has_stree;
  const extra = desc.stat_desc.extra_bits;
  const base = desc.stat_desc.extra_base;
  const max_length = desc.stat_desc.max_length;
  let h;
  let n, m;
  let bits;
  let xbits;
  let f;
  let overflow = 0;
  for (bits = 0; bits <= MAX_BITS$1; bits++) {
    s.bl_count[bits] = 0;
  }
  tree[s.heap[s.heap_max] * 2 + 1] = 0;
  for (h = s.heap_max + 1; h < HEAP_SIZE$1; h++) {
    n = s.heap[h];
    bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n * 2 + 1] = bits;
    if (n > max_code) {
      continue;
    }
    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n - base];
    }
    f = tree[n * 2];
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n * 2 + 1] + xbits);
    }
  }
  if (overflow === 0) {
    return;
  }
  do {
    bits = max_length - 1;
    while (s.bl_count[bits] === 0) {
      bits--;
    }
    s.bl_count[bits]--;
    s.bl_count[bits + 1] += 2;
    s.bl_count[max_length]--;
    overflow -= 2;
  } while (overflow > 0);
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) {
        continue;
      }
      if (tree[m * 2 + 1] !== bits) {
        s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
        tree[m * 2 + 1] = bits;
      }
      n--;
    }
  }
};
const gen_codes = (tree, max_code, bl_count) => {
  const next_code = new Array(MAX_BITS$1 + 1);
  let code = 0;
  let bits;
  let n;
  for (bits = 1; bits <= MAX_BITS$1; bits++) {
    code = code + bl_count[bits - 1] << 1;
    next_code[bits] = code;
  }
  for (n = 0; n <= max_code; n++) {
    let len = tree[n * 2 + 1];
    if (len === 0) {
      continue;
    }
    tree[n * 2] = bi_reverse(next_code[len]++, len);
  }
};
const tr_static_init = () => {
  let n;
  let bits;
  let length;
  let code;
  let dist;
  const bl_count = new Array(MAX_BITS$1 + 1);
  length = 0;
  for (code = 0; code < LENGTH_CODES$1 - 1; code++) {
    base_length[code] = length;
    for (n = 0; n < 1 << extra_lbits[code]; n++) {
      _length_code[length++] = code;
    }
  }
  _length_code[length - 1] = code;
  dist = 0;
  for (code = 0; code < 16; code++) {
    base_dist[code] = dist;
    for (n = 0; n < 1 << extra_dbits[code]; n++) {
      _dist_code[dist++] = code;
    }
  }
  dist >>= 7;
  for (; code < D_CODES$1; code++) {
    base_dist[code] = dist << 7;
    for (n = 0; n < 1 << extra_dbits[code] - 7; n++) {
      _dist_code[256 + dist++] = code;
    }
  }
  for (bits = 0; bits <= MAX_BITS$1; bits++) {
    bl_count[bits] = 0;
  }
  n = 0;
  while (n <= 143) {
    static_ltree[n * 2 + 1] = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree[n * 2 + 1] = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree[n * 2 + 1] = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree[n * 2 + 1] = 8;
    n++;
    bl_count[8]++;
  }
  gen_codes(static_ltree, L_CODES$1 + 1, bl_count);
  for (n = 0; n < D_CODES$1; n++) {
    static_dtree[n * 2 + 1] = 5;
    static_dtree[n * 2] = bi_reverse(n, 5);
  }
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS$1 + 1, L_CODES$1, MAX_BITS$1);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES$1, MAX_BITS$1);
  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES$1, MAX_BL_BITS);
};
const init_block = (s) => {
  let n;
  for (n = 0; n < L_CODES$1; n++) {
    s.dyn_ltree[n * 2] = 0;
  }
  for (n = 0; n < D_CODES$1; n++) {
    s.dyn_dtree[n * 2] = 0;
  }
  for (n = 0; n < BL_CODES$1; n++) {
    s.bl_tree[n * 2] = 0;
  }
  s.dyn_ltree[END_BLOCK * 2] = 1;
  s.opt_len = s.static_len = 0;
  s.sym_next = s.matches = 0;
};
const bi_windup = (s) => {
  if (s.bi_valid > 8) {
    put_short(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
};
const smaller = (tree, n, m, depth) => {
  const _n2 = n * 2;
  const _m2 = m * 2;
  return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
};
const pqdownheap = (s, tree, k) => {
  const v = s.heap[k];
  let j = k << 1;
  while (j <= s.heap_len) {
    if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
      j++;
    }
    if (smaller(tree, v, s.heap[j], s.depth)) {
      break;
    }
    s.heap[k] = s.heap[j];
    k = j;
    j <<= 1;
  }
  s.heap[k] = v;
};
const compress_block = (s, ltree, dtree) => {
  let dist;
  let lc;
  let sx = 0;
  let code;
  let extra;
  if (s.sym_next !== 0) {
    do {
      dist = s.pending_buf[s.sym_buf + sx++] & 255;
      dist += (s.pending_buf[s.sym_buf + sx++] & 255) << 8;
      lc = s.pending_buf[s.sym_buf + sx++];
      if (dist === 0) {
        send_code(s, lc, ltree);
      } else {
        code = _length_code[lc];
        send_code(s, code + LITERALS$1 + 1, ltree);
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra);
        }
        dist--;
        code = d_code(dist);
        send_code(s, code, dtree);
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra);
        }
      }
    } while (sx < s.sym_next);
  }
  send_code(s, END_BLOCK, ltree);
};
const build_tree = (s, desc) => {
  const tree = desc.dyn_tree;
  const stree = desc.stat_desc.static_tree;
  const has_stree = desc.stat_desc.has_stree;
  const elems = desc.stat_desc.elems;
  let n, m;
  let max_code = -1;
  let node;
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE$1;
  for (n = 0; n < elems; n++) {
    if (tree[n * 2] !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;
    } else {
      tree[n * 2 + 1] = 0;
    }
  }
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
    tree[node * 2] = 1;
    s.depth[node] = 0;
    s.opt_len--;
    if (has_stree) {
      s.static_len -= stree[node * 2 + 1];
    }
  }
  desc.max_code = max_code;
  for (n = s.heap_len >> 1; n >= 1; n--) {
    pqdownheap(s, tree, n);
  }
  node = elems;
  do {
    n = s.heap[
      1
      /*SMALLEST*/
    ];
    s.heap[
      1
      /*SMALLEST*/
    ] = s.heap[s.heap_len--];
    pqdownheap(
      s,
      tree,
      1
      /*SMALLEST*/
    );
    m = s.heap[
      1
      /*SMALLEST*/
    ];
    s.heap[--s.heap_max] = n;
    s.heap[--s.heap_max] = m;
    tree[node * 2] = tree[n * 2] + tree[m * 2];
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n * 2 + 1] = tree[m * 2 + 1] = node;
    s.heap[
      1
      /*SMALLEST*/
    ] = node++;
    pqdownheap(
      s,
      tree,
      1
      /*SMALLEST*/
    );
  } while (s.heap_len >= 2);
  s.heap[--s.heap_max] = s.heap[
    1
    /*SMALLEST*/
  ];
  gen_bitlen(s, desc);
  gen_codes(tree, max_code, s.bl_count);
};
const scan_tree = (s, tree, max_code) => {
  let n;
  let prevlen = -1;
  let curlen;
  let nextlen = tree[0 * 2 + 1];
  let count = 0;
  let max_count = 7;
  let min_count = 4;
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code + 1) * 2 + 1] = 65535;
  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1];
    if (++count < max_count && curlen === nextlen) {
      continue;
    } else if (count < min_count) {
      s.bl_tree[curlen * 2] += count;
    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        s.bl_tree[curlen * 2]++;
      }
      s.bl_tree[REP_3_6 * 2]++;
    } else if (count <= 10) {
      s.bl_tree[REPZ_3_10 * 2]++;
    } else {
      s.bl_tree[REPZ_11_138 * 2]++;
    }
    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;
    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};
const send_tree = (s, tree, max_code) => {
  let n;
  let prevlen = -1;
  let curlen;
  let nextlen = tree[0 * 2 + 1];
  let count = 0;
  let max_count = 7;
  let min_count = 4;
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1];
    if (++count < max_count && curlen === nextlen) {
      continue;
    } else if (count < min_count) {
      do {
        send_code(s, curlen, s.bl_tree);
      } while (--count !== 0);
    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s, curlen, s.bl_tree);
        count--;
      }
      send_code(s, REP_3_6, s.bl_tree);
      send_bits(s, count - 3, 2);
    } else if (count <= 10) {
      send_code(s, REPZ_3_10, s.bl_tree);
      send_bits(s, count - 3, 3);
    } else {
      send_code(s, REPZ_11_138, s.bl_tree);
      send_bits(s, count - 11, 7);
    }
    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;
    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};
const build_bl_tree = (s) => {
  let max_blindex;
  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
  build_tree(s, s.bl_desc);
  for (max_blindex = BL_CODES$1 - 1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
      break;
    }
  }
  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
  return max_blindex;
};
const send_all_trees = (s, lcodes, dcodes, blcodes) => {
  let rank2;
  send_bits(s, lcodes - 257, 5);
  send_bits(s, dcodes - 1, 5);
  send_bits(s, blcodes - 4, 4);
  for (rank2 = 0; rank2 < blcodes; rank2++) {
    send_bits(s, s.bl_tree[bl_order[rank2] * 2 + 1], 3);
  }
  send_tree(s, s.dyn_ltree, lcodes - 1);
  send_tree(s, s.dyn_dtree, dcodes - 1);
};
const detect_data_type = (s) => {
  let block_mask = 4093624447;
  let n;
  for (n = 0; n <= 31; n++, block_mask >>>= 1) {
    if (block_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
      return Z_BINARY;
    }
  }
  if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
    return Z_TEXT;
  }
  for (n = 32; n < LITERALS$1; n++) {
    if (s.dyn_ltree[n * 2] !== 0) {
      return Z_TEXT;
    }
  }
  return Z_BINARY;
};
let static_init_done = false;
const _tr_init$1 = (s) => {
  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }
  s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
  s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
  s.bi_buf = 0;
  s.bi_valid = 0;
  init_block(s);
};
const _tr_stored_block$1 = (s, buf, stored_len, last2) => {
  send_bits(s, (STORED_BLOCK << 1) + (last2 ? 1 : 0), 3);
  bi_windup(s);
  put_short(s, stored_len);
  put_short(s, ~stored_len);
  if (stored_len) {
    s.pending_buf.set(s.window.subarray(buf, buf + stored_len), s.pending);
  }
  s.pending += stored_len;
};
const _tr_align$1 = (s) => {
  send_bits(s, STATIC_TREES << 1, 3);
  send_code(s, END_BLOCK, static_ltree);
  bi_flush(s);
};
const _tr_flush_block$1 = (s, buf, stored_len, last2) => {
  let opt_lenb, static_lenb;
  let max_blindex = 0;
  if (s.level > 0) {
    if (s.strm.data_type === Z_UNKNOWN$1) {
      s.strm.data_type = detect_data_type(s);
    }
    build_tree(s, s.l_desc);
    build_tree(s, s.d_desc);
    max_blindex = build_bl_tree(s);
    opt_lenb = s.opt_len + 3 + 7 >>> 3;
    static_lenb = s.static_len + 3 + 7 >>> 3;
    if (static_lenb <= opt_lenb) {
      opt_lenb = static_lenb;
    }
  } else {
    opt_lenb = static_lenb = stored_len + 5;
  }
  if (stored_len + 4 <= opt_lenb && buf !== -1) {
    _tr_stored_block$1(s, buf, stored_len, last2);
  } else if (s.strategy === Z_FIXED$1 || static_lenb === opt_lenb) {
    send_bits(s, (STATIC_TREES << 1) + (last2 ? 1 : 0), 3);
    compress_block(s, static_ltree, static_dtree);
  } else {
    send_bits(s, (DYN_TREES << 1) + (last2 ? 1 : 0), 3);
    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
    compress_block(s, s.dyn_ltree, s.dyn_dtree);
  }
  init_block(s);
  if (last2) {
    bi_windup(s);
  }
};
const _tr_tally$1 = (s, dist, lc) => {
  s.pending_buf[s.sym_buf + s.sym_next++] = dist;
  s.pending_buf[s.sym_buf + s.sym_next++] = dist >> 8;
  s.pending_buf[s.sym_buf + s.sym_next++] = lc;
  if (dist === 0) {
    s.dyn_ltree[lc * 2]++;
  } else {
    s.matches++;
    dist--;
    s.dyn_ltree[(_length_code[lc] + LITERALS$1 + 1) * 2]++;
    s.dyn_dtree[d_code(dist) * 2]++;
  }
  return s.sym_next === s.sym_end;
};
var _tr_init_1 = _tr_init$1;
var _tr_stored_block_1 = _tr_stored_block$1;
var _tr_flush_block_1 = _tr_flush_block$1;
var _tr_tally_1 = _tr_tally$1;
var _tr_align_1 = _tr_align$1;
var trees = {
  _tr_init: _tr_init_1,
  _tr_stored_block: _tr_stored_block_1,
  _tr_flush_block: _tr_flush_block_1,
  _tr_tally: _tr_tally_1,
  _tr_align: _tr_align_1
};
const adler32 = (adler, buf, len, pos) => {
  let s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
  while (len !== 0) {
    n = len > 2e3 ? 2e3 : len;
    len -= n;
    do {
      s1 = s1 + buf[pos++] | 0;
      s2 = s2 + s1 | 0;
    } while (--n);
    s1 %= 65521;
    s2 %= 65521;
  }
  return s1 | s2 << 16 | 0;
};
var adler32_1 = adler32;
const makeTable = () => {
  let c, table = [];
  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    }
    table[n] = c;
  }
  return table;
};
const crcTable = new Uint32Array(makeTable());
const crc32 = (crc, buf, len, pos) => {
  const t = crcTable;
  const end = pos + len;
  crc ^= -1;
  for (let i = pos; i < end; i++) {
    crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
  }
  return crc ^ -1;
};
var crc32_1 = crc32;
var messages = {
  2: "need dictionary",
  /* Z_NEED_DICT       2  */
  1: "stream end",
  /* Z_STREAM_END      1  */
  0: "",
  /* Z_OK              0  */
  "-1": "file error",
  /* Z_ERRNO         (-1) */
  "-2": "stream error",
  /* Z_STREAM_ERROR  (-2) */
  "-3": "data error",
  /* Z_DATA_ERROR    (-3) */
  "-4": "insufficient memory",
  /* Z_MEM_ERROR     (-4) */
  "-5": "buffer error",
  /* Z_BUF_ERROR     (-5) */
  "-6": "incompatible version"
  /* Z_VERSION_ERROR (-6) */
};
var constants$2 = {
  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH: 0,
  Z_PARTIAL_FLUSH: 1,
  Z_SYNC_FLUSH: 2,
  Z_FULL_FLUSH: 3,
  Z_FINISH: 4,
  Z_BLOCK: 5,
  Z_TREES: 6,
  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK: 0,
  Z_STREAM_END: 1,
  Z_NEED_DICT: 2,
  Z_ERRNO: -1,
  Z_STREAM_ERROR: -2,
  Z_DATA_ERROR: -3,
  Z_MEM_ERROR: -4,
  Z_BUF_ERROR: -5,
  //Z_VERSION_ERROR: -6,
  /* compression levels */
  Z_NO_COMPRESSION: 0,
  Z_BEST_SPEED: 1,
  Z_BEST_COMPRESSION: 9,
  Z_DEFAULT_COMPRESSION: -1,
  Z_FILTERED: 1,
  Z_HUFFMAN_ONLY: 2,
  Z_RLE: 3,
  Z_FIXED: 4,
  Z_DEFAULT_STRATEGY: 0,
  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY: 0,
  Z_TEXT: 1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN: 2,
  /* The deflate compression method */
  Z_DEFLATED: 8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};
const { _tr_init, _tr_stored_block, _tr_flush_block, _tr_tally, _tr_align } = trees;
const {
  Z_NO_FLUSH: Z_NO_FLUSH$2,
  Z_PARTIAL_FLUSH,
  Z_FULL_FLUSH: Z_FULL_FLUSH$1,
  Z_FINISH: Z_FINISH$3,
  Z_BLOCK: Z_BLOCK$1,
  Z_OK: Z_OK$3,
  Z_STREAM_END: Z_STREAM_END$3,
  Z_STREAM_ERROR: Z_STREAM_ERROR$2,
  Z_DATA_ERROR: Z_DATA_ERROR$2,
  Z_BUF_ERROR: Z_BUF_ERROR$1,
  Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION$1,
  Z_FILTERED,
  Z_HUFFMAN_ONLY,
  Z_RLE,
  Z_FIXED,
  Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY$1,
  Z_UNKNOWN,
  Z_DEFLATED: Z_DEFLATED$2
} = constants$2;
const MAX_MEM_LEVEL = 9;
const MAX_WBITS$1 = 15;
const DEF_MEM_LEVEL = 8;
const LENGTH_CODES = 29;
const LITERALS = 256;
const L_CODES = LITERALS + 1 + LENGTH_CODES;
const D_CODES = 30;
const BL_CODES = 19;
const HEAP_SIZE = 2 * L_CODES + 1;
const MAX_BITS = 15;
const MIN_MATCH = 3;
const MAX_MATCH = 258;
const MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
const PRESET_DICT = 32;
const INIT_STATE = 42;
const GZIP_STATE = 57;
const EXTRA_STATE = 69;
const NAME_STATE = 73;
const COMMENT_STATE = 91;
const HCRC_STATE = 103;
const BUSY_STATE = 113;
const FINISH_STATE = 666;
const BS_NEED_MORE = 1;
const BS_BLOCK_DONE = 2;
const BS_FINISH_STARTED = 3;
const BS_FINISH_DONE = 4;
const OS_CODE = 3;
const err = (strm, errorCode) => {
  strm.msg = messages[errorCode];
  return errorCode;
};
const rank = (f) => {
  return f * 2 - (f > 4 ? 9 : 0);
};
const zero = (buf) => {
  let len = buf.length;
  while (--len >= 0) {
    buf[len] = 0;
  }
};
const slide_hash = (s) => {
  let n, m;
  let p;
  let wsize = s.w_size;
  n = s.hash_size;
  p = n;
  do {
    m = s.head[--p];
    s.head[p] = m >= wsize ? m - wsize : 0;
  } while (--n);
  n = wsize;
  p = n;
  do {
    m = s.prev[--p];
    s.prev[p] = m >= wsize ? m - wsize : 0;
  } while (--n);
};
let HASH_ZLIB = (s, prev, data) => (prev << s.hash_shift ^ data) & s.hash_mask;
let HASH = HASH_ZLIB;
const flush_pending = (strm) => {
  const s = strm.state;
  let len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) {
    return;
  }
  strm.output.set(s.pending_buf.subarray(s.pending_out, s.pending_out + len), strm.next_out);
  strm.next_out += len;
  s.pending_out += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
};
const flush_block_only = (s, last2) => {
  _tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last2);
  s.block_start = s.strstart;
  flush_pending(s.strm);
};
const put_byte = (s, b) => {
  s.pending_buf[s.pending++] = b;
};
const putShortMSB = (s, b) => {
  s.pending_buf[s.pending++] = b >>> 8 & 255;
  s.pending_buf[s.pending++] = b & 255;
};
const read_buf = (strm, buf, start, size) => {
  let len = strm.avail_in;
  if (len > size) {
    len = size;
  }
  if (len === 0) {
    return 0;
  }
  strm.avail_in -= len;
  buf.set(strm.input.subarray(strm.next_in, strm.next_in + len), start);
  if (strm.state.wrap === 1) {
    strm.adler = adler32_1(strm.adler, buf, len, start);
  } else if (strm.state.wrap === 2) {
    strm.adler = crc32_1(strm.adler, buf, len, start);
  }
  strm.next_in += len;
  strm.total_in += len;
  return len;
};
const longest_match = (s, cur_match) => {
  let chain_length = s.max_chain_length;
  let scan = s.strstart;
  let match;
  let len;
  let best_len = s.prev_length;
  let nice_match = s.nice_match;
  const limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
  const _win = s.window;
  const wmask = s.w_mask;
  const prev = s.prev;
  const strend = s.strstart + MAX_MATCH;
  let scan_end1 = _win[scan + best_len - 1];
  let scan_end = _win[scan + best_len];
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  if (nice_match > s.lookahead) {
    nice_match = s.lookahead;
  }
  do {
    match = cur_match;
    if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
      continue;
    }
    scan += 2;
    match++;
    do {
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
    len = MAX_MATCH - (strend - scan);
    scan = strend - MAX_MATCH;
    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1 = _win[scan + best_len - 1];
      scan_end = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
};
const fill_window = (s) => {
  const _w_size = s.w_size;
  let n, more, str;
  do {
    more = s.window_size - s.lookahead - s.strstart;
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
      s.window.set(s.window.subarray(_w_size, _w_size + _w_size - more), 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      s.block_start -= _w_size;
      if (s.insert > s.strstart) {
        s.insert = s.strstart;
      }
      slide_hash(s);
      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }
    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;
    if (s.lookahead + s.insert >= MIN_MATCH) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];
      s.ins_h = HASH(s, s.ins_h, s.window[str + 1]);
      while (s.insert) {
        s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);
        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH) {
          break;
        }
      }
    }
  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
};
const deflate_stored = (s, flush) => {
  let min_block = s.pending_buf_size - 5 > s.w_size ? s.w_size : s.pending_buf_size - 5;
  let len, left, have, last2 = 0;
  let used = s.strm.avail_in;
  do {
    len = 65535;
    have = s.bi_valid + 42 >> 3;
    if (s.strm.avail_out < have) {
      break;
    }
    have = s.strm.avail_out - have;
    left = s.strstart - s.block_start;
    if (len > left + s.strm.avail_in) {
      len = left + s.strm.avail_in;
    }
    if (len > have) {
      len = have;
    }
    if (len < min_block && (len === 0 && flush !== Z_FINISH$3 || flush === Z_NO_FLUSH$2 || len !== left + s.strm.avail_in)) {
      break;
    }
    last2 = flush === Z_FINISH$3 && len === left + s.strm.avail_in ? 1 : 0;
    _tr_stored_block(s, 0, 0, last2);
    s.pending_buf[s.pending - 4] = len;
    s.pending_buf[s.pending - 3] = len >> 8;
    s.pending_buf[s.pending - 2] = ~len;
    s.pending_buf[s.pending - 1] = ~len >> 8;
    flush_pending(s.strm);
    if (left) {
      if (left > len) {
        left = len;
      }
      s.strm.output.set(s.window.subarray(s.block_start, s.block_start + left), s.strm.next_out);
      s.strm.next_out += left;
      s.strm.avail_out -= left;
      s.strm.total_out += left;
      s.block_start += left;
      len -= left;
    }
    if (len) {
      read_buf(s.strm, s.strm.output, s.strm.next_out, len);
      s.strm.next_out += len;
      s.strm.avail_out -= len;
      s.strm.total_out += len;
    }
  } while (last2 === 0);
  used -= s.strm.avail_in;
  if (used) {
    if (used >= s.w_size) {
      s.matches = 2;
      s.window.set(s.strm.input.subarray(s.strm.next_in - s.w_size, s.strm.next_in), 0);
      s.strstart = s.w_size;
      s.insert = s.strstart;
    } else {
      if (s.window_size - s.strstart <= used) {
        s.strstart -= s.w_size;
        s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
        if (s.matches < 2) {
          s.matches++;
        }
        if (s.insert > s.strstart) {
          s.insert = s.strstart;
        }
      }
      s.window.set(s.strm.input.subarray(s.strm.next_in - used, s.strm.next_in), s.strstart);
      s.strstart += used;
      s.insert += used > s.w_size - s.insert ? s.w_size - s.insert : used;
    }
    s.block_start = s.strstart;
  }
  if (s.high_water < s.strstart) {
    s.high_water = s.strstart;
  }
  if (last2) {
    return BS_FINISH_DONE;
  }
  if (flush !== Z_NO_FLUSH$2 && flush !== Z_FINISH$3 && s.strm.avail_in === 0 && s.strstart === s.block_start) {
    return BS_BLOCK_DONE;
  }
  have = s.window_size - s.strstart;
  if (s.strm.avail_in > have && s.block_start >= s.w_size) {
    s.block_start -= s.w_size;
    s.strstart -= s.w_size;
    s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
    if (s.matches < 2) {
      s.matches++;
    }
    have += s.w_size;
    if (s.insert > s.strstart) {
      s.insert = s.strstart;
    }
  }
  if (have > s.strm.avail_in) {
    have = s.strm.avail_in;
  }
  if (have) {
    read_buf(s.strm, s.window, s.strstart, have);
    s.strstart += have;
    s.insert += have > s.w_size - s.insert ? s.w_size - s.insert : have;
  }
  if (s.high_water < s.strstart) {
    s.high_water = s.strstart;
  }
  have = s.bi_valid + 42 >> 3;
  have = s.pending_buf_size - have > 65535 ? 65535 : s.pending_buf_size - have;
  min_block = have > s.w_size ? s.w_size : have;
  left = s.strstart - s.block_start;
  if (left >= min_block || (left || flush === Z_FINISH$3) && flush !== Z_NO_FLUSH$2 && s.strm.avail_in === 0 && left <= have) {
    len = left > have ? have : left;
    last2 = flush === Z_FINISH$3 && s.strm.avail_in === 0 && len === left ? 1 : 0;
    _tr_stored_block(s, s.block_start, len, last2);
    s.block_start += len;
    flush_pending(s.strm);
  }
  return last2 ? BS_FINISH_STARTED : BS_NEED_MORE;
};
const deflate_fast = (s, flush) => {
  let hash_head;
  let bflush;
  for (; ; ) {
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break;
      }
    }
    hash_head = 0;
    if (s.lookahead >= MIN_MATCH) {
      s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
    }
    if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
      s.match_length = longest_match(s, hash_head);
    }
    if (s.match_length >= MIN_MATCH) {
      bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
      s.lookahead -= s.match_length;
      if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
        s.match_length--;
        do {
          s.strstart++;
          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        } while (--s.match_length !== 0);
        s.strstart++;
      } else {
        s.strstart += s.match_length;
        s.match_length = 0;
        s.ins_h = s.window[s.strstart];
        s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + 1]);
      }
    } else {
      bflush = _tr_tally(s, 0, s.window[s.strstart]);
      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH$3) {
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_BLOCK_DONE;
};
const deflate_slow = (s, flush) => {
  let hash_head;
  let bflush;
  let max_insert;
  for (; ; ) {
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break;
      }
    }
    hash_head = 0;
    if (s.lookahead >= MIN_MATCH) {
      s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
    }
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH - 1;
    if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
      s.match_length = longest_match(s, hash_head);
      if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) {
        s.match_length = MIN_MATCH - 1;
      }
    }
    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH;
      bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
      s.lookahead -= s.prev_length - 1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH - 1;
      s.strstart++;
      if (bflush) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
    } else if (s.match_available) {
      bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
      if (bflush) {
        flush_block_only(s, false);
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  if (s.match_available) {
    bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH$3) {
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_BLOCK_DONE;
};
const deflate_rle = (s, flush) => {
  let bflush;
  let prev;
  let scan, strend;
  const _win = s.window;
  for (; ; ) {
    if (s.lookahead <= MAX_MATCH) {
      fill_window(s);
      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break;
      }
    }
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH;
        do {
        } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
        s.match_length = MAX_MATCH - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
    }
    if (s.match_length >= MIN_MATCH) {
      bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);
      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      bflush = _tr_tally(s, 0, s.window[s.strstart]);
      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$3) {
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_BLOCK_DONE;
};
const deflate_huff = (s, flush) => {
  let bflush;
  for (; ; ) {
    if (s.lookahead === 0) {
      fill_window(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH$2) {
          return BS_NEED_MORE;
        }
        break;
      }
    }
    s.match_length = 0;
    bflush = _tr_tally(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$3) {
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_BLOCK_DONE;
};
function Config(good_length, max_lazy, nice_length, max_chain, func) {
  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
}
const configuration_table = [
  /*      good lazy nice chain */
  new Config(0, 0, 0, 0, deflate_stored),
  /* 0 store only */
  new Config(4, 4, 8, 4, deflate_fast),
  /* 1 max speed, no lazy matches */
  new Config(4, 5, 16, 8, deflate_fast),
  /* 2 */
  new Config(4, 6, 32, 32, deflate_fast),
  /* 3 */
  new Config(4, 4, 16, 16, deflate_slow),
  /* 4 lazy matches */
  new Config(8, 16, 32, 32, deflate_slow),
  /* 5 */
  new Config(8, 16, 128, 128, deflate_slow),
  /* 6 */
  new Config(8, 32, 128, 256, deflate_slow),
  /* 7 */
  new Config(32, 128, 258, 1024, deflate_slow),
  /* 8 */
  new Config(32, 258, 258, 4096, deflate_slow)
  /* 9 max compression */
];
const lm_init = (s) => {
  s.window_size = 2 * s.w_size;
  zero(s.head);
  s.max_lazy_match = configuration_table[s.level].max_lazy;
  s.good_match = configuration_table[s.level].good_length;
  s.nice_match = configuration_table[s.level].nice_length;
  s.max_chain_length = configuration_table[s.level].max_chain;
  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  s.ins_h = 0;
};
function DeflateState() {
  this.strm = null;
  this.status = 0;
  this.pending_buf = null;
  this.pending_buf_size = 0;
  this.pending_out = 0;
  this.pending = 0;
  this.wrap = 0;
  this.gzhead = null;
  this.gzindex = 0;
  this.method = Z_DEFLATED$2;
  this.last_flush = -1;
  this.w_size = 0;
  this.w_bits = 0;
  this.w_mask = 0;
  this.window = null;
  this.window_size = 0;
  this.prev = null;
  this.head = null;
  this.ins_h = 0;
  this.hash_size = 0;
  this.hash_bits = 0;
  this.hash_mask = 0;
  this.hash_shift = 0;
  this.block_start = 0;
  this.match_length = 0;
  this.prev_match = 0;
  this.match_available = 0;
  this.strstart = 0;
  this.match_start = 0;
  this.lookahead = 0;
  this.prev_length = 0;
  this.max_chain_length = 0;
  this.max_lazy_match = 0;
  this.level = 0;
  this.strategy = 0;
  this.good_match = 0;
  this.nice_match = 0;
  this.dyn_ltree = new Uint16Array(HEAP_SIZE * 2);
  this.dyn_dtree = new Uint16Array((2 * D_CODES + 1) * 2);
  this.bl_tree = new Uint16Array((2 * BL_CODES + 1) * 2);
  zero(this.dyn_ltree);
  zero(this.dyn_dtree);
  zero(this.bl_tree);
  this.l_desc = null;
  this.d_desc = null;
  this.bl_desc = null;
  this.bl_count = new Uint16Array(MAX_BITS + 1);
  this.heap = new Uint16Array(2 * L_CODES + 1);
  zero(this.heap);
  this.heap_len = 0;
  this.heap_max = 0;
  this.depth = new Uint16Array(2 * L_CODES + 1);
  zero(this.depth);
  this.sym_buf = 0;
  this.lit_bufsize = 0;
  this.sym_next = 0;
  this.sym_end = 0;
  this.opt_len = 0;
  this.static_len = 0;
  this.matches = 0;
  this.insert = 0;
  this.bi_buf = 0;
  this.bi_valid = 0;
}
const deflateStateCheck = (strm) => {
  if (!strm) {
    return 1;
  }
  const s = strm.state;
  if (!s || s.strm !== strm || s.status !== INIT_STATE && //#ifdef GZIP
  s.status !== GZIP_STATE && //#endif
  s.status !== EXTRA_STATE && s.status !== NAME_STATE && s.status !== COMMENT_STATE && s.status !== HCRC_STATE && s.status !== BUSY_STATE && s.status !== FINISH_STATE) {
    return 1;
  }
  return 0;
};
const deflateResetKeep = (strm) => {
  if (deflateStateCheck(strm)) {
    return err(strm, Z_STREAM_ERROR$2);
  }
  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN;
  const s = strm.state;
  s.pending = 0;
  s.pending_out = 0;
  if (s.wrap < 0) {
    s.wrap = -s.wrap;
  }
  s.status = //#ifdef GZIP
  s.wrap === 2 ? GZIP_STATE : (
    //#endif
    s.wrap ? INIT_STATE : BUSY_STATE
  );
  strm.adler = s.wrap === 2 ? 0 : 1;
  s.last_flush = -2;
  _tr_init(s);
  return Z_OK$3;
};
const deflateReset = (strm) => {
  const ret = deflateResetKeep(strm);
  if (ret === Z_OK$3) {
    lm_init(strm.state);
  }
  return ret;
};
const deflateSetHeader = (strm, head) => {
  if (deflateStateCheck(strm) || strm.state.wrap !== 2) {
    return Z_STREAM_ERROR$2;
  }
  strm.state.gzhead = head;
  return Z_OK$3;
};
const deflateInit2 = (strm, level, method, windowBits, memLevel, strategy) => {
  if (!strm) {
    return Z_STREAM_ERROR$2;
  }
  let wrap = 1;
  if (level === Z_DEFAULT_COMPRESSION$1) {
    level = 6;
  }
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  } else if (windowBits > 15) {
    wrap = 2;
    windowBits -= 16;
  }
  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED$2 || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED || windowBits === 8 && wrap !== 1) {
    return err(strm, Z_STREAM_ERROR$2);
  }
  if (windowBits === 8) {
    windowBits = 9;
  }
  const s = new DeflateState();
  strm.state = s;
  s.strm = strm;
  s.status = INIT_STATE;
  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;
  s.hash_bits = memLevel + 7;
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
  s.window = new Uint8Array(s.w_size * 2);
  s.head = new Uint16Array(s.hash_size);
  s.prev = new Uint16Array(s.w_size);
  s.lit_bufsize = 1 << memLevel + 6;
  s.pending_buf_size = s.lit_bufsize * 4;
  s.pending_buf = new Uint8Array(s.pending_buf_size);
  s.sym_buf = s.lit_bufsize;
  s.sym_end = (s.lit_bufsize - 1) * 3;
  s.level = level;
  s.strategy = strategy;
  s.method = method;
  return deflateReset(strm);
};
const deflateInit = (strm, level) => {
  return deflateInit2(strm, level, Z_DEFLATED$2, MAX_WBITS$1, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY$1);
};
const deflate$2 = (strm, flush) => {
  if (deflateStateCheck(strm) || flush > Z_BLOCK$1 || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR$2) : Z_STREAM_ERROR$2;
  }
  const s = strm.state;
  if (!strm.output || strm.avail_in !== 0 && !strm.input || s.status === FINISH_STATE && flush !== Z_FINISH$3) {
    return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR$1 : Z_STREAM_ERROR$2);
  }
  const old_flush = s.last_flush;
  s.last_flush = flush;
  if (s.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      s.last_flush = -1;
      return Z_OK$3;
    }
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH$3) {
    return err(strm, Z_BUF_ERROR$1);
  }
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR$1);
  }
  if (s.status === INIT_STATE && s.wrap === 0) {
    s.status = BUSY_STATE;
  }
  if (s.status === INIT_STATE) {
    let header = Z_DEFLATED$2 + (s.w_bits - 8 << 4) << 8;
    let level_flags = -1;
    if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
      level_flags = 0;
    } else if (s.level < 6) {
      level_flags = 1;
    } else if (s.level === 6) {
      level_flags = 2;
    } else {
      level_flags = 3;
    }
    header |= level_flags << 6;
    if (s.strstart !== 0) {
      header |= PRESET_DICT;
    }
    header += 31 - header % 31;
    putShortMSB(s, header);
    if (s.strstart !== 0) {
      putShortMSB(s, strm.adler >>> 16);
      putShortMSB(s, strm.adler & 65535);
    }
    strm.adler = 1;
    s.status = BUSY_STATE;
    flush_pending(strm);
    if (s.pending !== 0) {
      s.last_flush = -1;
      return Z_OK$3;
    }
  }
  if (s.status === GZIP_STATE) {
    strm.adler = 0;
    put_byte(s, 31);
    put_byte(s, 139);
    put_byte(s, 8);
    if (!s.gzhead) {
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
      put_byte(s, OS_CODE);
      s.status = BUSY_STATE;
      flush_pending(strm);
      if (s.pending !== 0) {
        s.last_flush = -1;
        return Z_OK$3;
      }
    } else {
      put_byte(
        s,
        (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16)
      );
      put_byte(s, s.gzhead.time & 255);
      put_byte(s, s.gzhead.time >> 8 & 255);
      put_byte(s, s.gzhead.time >> 16 & 255);
      put_byte(s, s.gzhead.time >> 24 & 255);
      put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
      put_byte(s, s.gzhead.os & 255);
      if (s.gzhead.extra && s.gzhead.extra.length) {
        put_byte(s, s.gzhead.extra.length & 255);
        put_byte(s, s.gzhead.extra.length >> 8 & 255);
      }
      if (s.gzhead.hcrc) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending, 0);
      }
      s.gzindex = 0;
      s.status = EXTRA_STATE;
    }
  }
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra) {
      let beg = s.pending;
      let left = (s.gzhead.extra.length & 65535) - s.gzindex;
      while (s.pending + left > s.pending_buf_size) {
        let copy = s.pending_buf_size - s.pending;
        s.pending_buf.set(s.gzhead.extra.subarray(s.gzindex, s.gzindex + copy), s.pending);
        s.pending = s.pending_buf_size;
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        s.gzindex += copy;
        flush_pending(strm);
        if (s.pending !== 0) {
          s.last_flush = -1;
          return Z_OK$3;
        }
        beg = 0;
        left -= copy;
      }
      let gzhead_extra = new Uint8Array(s.gzhead.extra);
      s.pending_buf.set(gzhead_extra.subarray(s.gzindex, s.gzindex + left), s.pending);
      s.pending += left;
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      s.gzindex = 0;
    }
    s.status = NAME_STATE;
  }
  if (s.status === NAME_STATE) {
    if (s.gzhead.name) {
      let beg = s.pending;
      let val;
      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK$3;
          }
          beg = 0;
        }
        if (s.gzindex < s.gzhead.name.length) {
          val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      s.gzindex = 0;
    }
    s.status = COMMENT_STATE;
  }
  if (s.status === COMMENT_STATE) {
    if (s.gzhead.comment) {
      let beg = s.pending;
      let val;
      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK$3;
          }
          beg = 0;
        }
        if (s.gzindex < s.gzhead.comment.length) {
          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
    }
    s.status = HCRC_STATE;
  }
  if (s.status === HCRC_STATE) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
        if (s.pending !== 0) {
          s.last_flush = -1;
          return Z_OK$3;
        }
      }
      put_byte(s, strm.adler & 255);
      put_byte(s, strm.adler >> 8 & 255);
      strm.adler = 0;
    }
    s.status = BUSY_STATE;
    flush_pending(strm);
    if (s.pending !== 0) {
      s.last_flush = -1;
      return Z_OK$3;
    }
  }
  if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH$2 && s.status !== FINISH_STATE) {
    let bstate = s.level === 0 ? deflate_stored(s, flush) : s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
      }
      return Z_OK$3;
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        _tr_align(s);
      } else if (flush !== Z_BLOCK$1) {
        _tr_stored_block(s, 0, 0, false);
        if (flush === Z_FULL_FLUSH$1) {
          zero(s.head);
          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        return Z_OK$3;
      }
    }
  }
  if (flush !== Z_FINISH$3) {
    return Z_OK$3;
  }
  if (s.wrap <= 0) {
    return Z_STREAM_END$3;
  }
  if (s.wrap === 2) {
    put_byte(s, strm.adler & 255);
    put_byte(s, strm.adler >> 8 & 255);
    put_byte(s, strm.adler >> 16 & 255);
    put_byte(s, strm.adler >> 24 & 255);
    put_byte(s, strm.total_in & 255);
    put_byte(s, strm.total_in >> 8 & 255);
    put_byte(s, strm.total_in >> 16 & 255);
    put_byte(s, strm.total_in >> 24 & 255);
  } else {
    putShortMSB(s, strm.adler >>> 16);
    putShortMSB(s, strm.adler & 65535);
  }
  flush_pending(strm);
  if (s.wrap > 0) {
    s.wrap = -s.wrap;
  }
  return s.pending !== 0 ? Z_OK$3 : Z_STREAM_END$3;
};
const deflateEnd = (strm) => {
  if (deflateStateCheck(strm)) {
    return Z_STREAM_ERROR$2;
  }
  const status = strm.state.status;
  strm.state = null;
  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR$2) : Z_OK$3;
};
const deflateSetDictionary = (strm, dictionary) => {
  let dictLength = dictionary.length;
  if (deflateStateCheck(strm)) {
    return Z_STREAM_ERROR$2;
  }
  const s = strm.state;
  const wrap = s.wrap;
  if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) {
    return Z_STREAM_ERROR$2;
  }
  if (wrap === 1) {
    strm.adler = adler32_1(strm.adler, dictionary, dictLength, 0);
  }
  s.wrap = 0;
  if (dictLength >= s.w_size) {
    if (wrap === 0) {
      zero(s.head);
      s.strstart = 0;
      s.block_start = 0;
      s.insert = 0;
    }
    let tmpDict = new Uint8Array(s.w_size);
    tmpDict.set(dictionary.subarray(dictLength - s.w_size, dictLength), 0);
    dictionary = tmpDict;
    dictLength = s.w_size;
  }
  const avail = strm.avail_in;
  const next = strm.next_in;
  const input = strm.input;
  strm.avail_in = dictLength;
  strm.next_in = 0;
  strm.input = dictionary;
  fill_window(s);
  while (s.lookahead >= MIN_MATCH) {
    let str = s.strstart;
    let n = s.lookahead - (MIN_MATCH - 1);
    do {
      s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);
      s.prev[str & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = str;
      str++;
    } while (--n);
    s.strstart = str;
    s.lookahead = MIN_MATCH - 1;
    fill_window(s);
  }
  s.strstart += s.lookahead;
  s.block_start = s.strstart;
  s.insert = s.lookahead;
  s.lookahead = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  strm.next_in = next;
  strm.input = input;
  strm.avail_in = avail;
  s.wrap = wrap;
  return Z_OK$3;
};
var deflateInit_1 = deflateInit;
var deflateInit2_1 = deflateInit2;
var deflateReset_1 = deflateReset;
var deflateResetKeep_1 = deflateResetKeep;
var deflateSetHeader_1 = deflateSetHeader;
var deflate_2$1 = deflate$2;
var deflateEnd_1 = deflateEnd;
var deflateSetDictionary_1 = deflateSetDictionary;
var deflateInfo = "pako deflate (from Nodeca project)";
var deflate_1$2 = {
  deflateInit: deflateInit_1,
  deflateInit2: deflateInit2_1,
  deflateReset: deflateReset_1,
  deflateResetKeep: deflateResetKeep_1,
  deflateSetHeader: deflateSetHeader_1,
  deflate: deflate_2$1,
  deflateEnd: deflateEnd_1,
  deflateSetDictionary: deflateSetDictionary_1,
  deflateInfo
};
const _has = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
var assign = function(obj) {
  const sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    const source = sources.shift();
    if (!source) {
      continue;
    }
    if (typeof source !== "object") {
      throw new TypeError(source + "must be non-object");
    }
    for (const p in source) {
      if (_has(source, p)) {
        obj[p] = source[p];
      }
    }
  }
  return obj;
};
var flattenChunks = (chunks) => {
  let len = 0;
  for (let i = 0, l = chunks.length; i < l; i++) {
    len += chunks[i].length;
  }
  const result = new Uint8Array(len);
  for (let i = 0, pos = 0, l = chunks.length; i < l; i++) {
    let chunk = chunks[i];
    result.set(chunk, pos);
    pos += chunk.length;
  }
  return result;
};
var common = {
  assign,
  flattenChunks
};
let STR_APPLY_UIA_OK = true;
try {
  String.fromCharCode.apply(null, new Uint8Array(1));
} catch (__) {
  STR_APPLY_UIA_OK = false;
}
const _utf8len = new Uint8Array(256);
for (let q = 0; q < 256; q++) {
  _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
}
_utf8len[254] = _utf8len[254] = 1;
var string2buf = (str) => {
  if (typeof TextEncoder === "function" && TextEncoder.prototype.encode) {
    return new TextEncoder().encode(str);
  }
  let buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 64512) === 56320) {
        c = 65536 + (c - 55296 << 10) + (c2 - 56320);
        m_pos++;
      }
    }
    buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
  }
  buf = new Uint8Array(buf_len);
  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 64512) === 56320) {
        c = 65536 + (c - 55296 << 10) + (c2 - 56320);
        m_pos++;
      }
    }
    if (c < 128) {
      buf[i++] = c;
    } else if (c < 2048) {
      buf[i++] = 192 | c >>> 6;
      buf[i++] = 128 | c & 63;
    } else if (c < 65536) {
      buf[i++] = 224 | c >>> 12;
      buf[i++] = 128 | c >>> 6 & 63;
      buf[i++] = 128 | c & 63;
    } else {
      buf[i++] = 240 | c >>> 18;
      buf[i++] = 128 | c >>> 12 & 63;
      buf[i++] = 128 | c >>> 6 & 63;
      buf[i++] = 128 | c & 63;
    }
  }
  return buf;
};
const buf2binstring = (buf, len) => {
  if (len < 65534) {
    if (buf.subarray && STR_APPLY_UIA_OK) {
      return String.fromCharCode.apply(null, buf.length === len ? buf : buf.subarray(0, len));
    }
  }
  let result = "";
  for (let i = 0; i < len; i++) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
};
var buf2string = (buf, max) => {
  const len = max || buf.length;
  if (typeof TextDecoder === "function" && TextDecoder.prototype.decode) {
    return new TextDecoder().decode(buf.subarray(0, max));
  }
  let i, out;
  const utf16buf = new Array(len * 2);
  for (out = 0, i = 0; i < len; ) {
    let c = buf[i++];
    if (c < 128) {
      utf16buf[out++] = c;
      continue;
    }
    let c_len = _utf8len[c];
    if (c_len > 4) {
      utf16buf[out++] = 65533;
      i += c_len - 1;
      continue;
    }
    c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
    while (c_len > 1 && i < len) {
      c = c << 6 | buf[i++] & 63;
      c_len--;
    }
    if (c_len > 1) {
      utf16buf[out++] = 65533;
      continue;
    }
    if (c < 65536) {
      utf16buf[out++] = c;
    } else {
      c -= 65536;
      utf16buf[out++] = 55296 | c >> 10 & 1023;
      utf16buf[out++] = 56320 | c & 1023;
    }
  }
  return buf2binstring(utf16buf, out);
};
var utf8border = (buf, max) => {
  max = max || buf.length;
  if (max > buf.length) {
    max = buf.length;
  }
  let pos = max - 1;
  while (pos >= 0 && (buf[pos] & 192) === 128) {
    pos--;
  }
  if (pos < 0) {
    return max;
  }
  if (pos === 0) {
    return max;
  }
  return pos + _utf8len[buf[pos]] > max ? pos : max;
};
var strings = {
  string2buf,
  buf2string,
  utf8border
};
function ZStream() {
  this.input = null;
  this.next_in = 0;
  this.avail_in = 0;
  this.total_in = 0;
  this.output = null;
  this.next_out = 0;
  this.avail_out = 0;
  this.total_out = 0;
  this.msg = "";
  this.state = null;
  this.data_type = 2;
  this.adler = 0;
}
var zstream = ZStream;
const toString$1 = Object.prototype.toString;
const {
  Z_NO_FLUSH: Z_NO_FLUSH$1,
  Z_SYNC_FLUSH,
  Z_FULL_FLUSH,
  Z_FINISH: Z_FINISH$2,
  Z_OK: Z_OK$2,
  Z_STREAM_END: Z_STREAM_END$2,
  Z_DEFAULT_COMPRESSION,
  Z_DEFAULT_STRATEGY,
  Z_DEFLATED: Z_DEFLATED$1
} = constants$2;
function Deflate$1(options) {
  this.options = common.assign({
    level: Z_DEFAULT_COMPRESSION,
    method: Z_DEFLATED$1,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: Z_DEFAULT_STRATEGY
  }, options || {});
  let opt = this.options;
  if (opt.raw && opt.windowBits > 0) {
    opt.windowBits = -opt.windowBits;
  } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
    opt.windowBits += 16;
  }
  this.err = 0;
  this.msg = "";
  this.ended = false;
  this.chunks = [];
  this.strm = new zstream();
  this.strm.avail_out = 0;
  let status = deflate_1$2.deflateInit2(
    this.strm,
    opt.level,
    opt.method,
    opt.windowBits,
    opt.memLevel,
    opt.strategy
  );
  if (status !== Z_OK$2) {
    throw new Error(messages[status]);
  }
  if (opt.header) {
    deflate_1$2.deflateSetHeader(this.strm, opt.header);
  }
  if (opt.dictionary) {
    let dict;
    if (typeof opt.dictionary === "string") {
      dict = strings.string2buf(opt.dictionary);
    } else if (toString$1.call(opt.dictionary) === "[object ArrayBuffer]") {
      dict = new Uint8Array(opt.dictionary);
    } else {
      dict = opt.dictionary;
    }
    status = deflate_1$2.deflateSetDictionary(this.strm, dict);
    if (status !== Z_OK$2) {
      throw new Error(messages[status]);
    }
    this._dict_set = true;
  }
}
Deflate$1.prototype.push = function(data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  let status, _flush_mode;
  if (this.ended) {
    return false;
  }
  if (flush_mode === ~~flush_mode)
    _flush_mode = flush_mode;
  else
    _flush_mode = flush_mode === true ? Z_FINISH$2 : Z_NO_FLUSH$1;
  if (typeof data === "string") {
    strm.input = strings.string2buf(data);
  } else if (toString$1.call(data) === "[object ArrayBuffer]") {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }
  strm.next_in = 0;
  strm.avail_in = strm.input.length;
  for (; ; ) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    if ((_flush_mode === Z_SYNC_FLUSH || _flush_mode === Z_FULL_FLUSH) && strm.avail_out <= 6) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }
    status = deflate_1$2.deflate(strm, _flush_mode);
    if (status === Z_STREAM_END$2) {
      if (strm.next_out > 0) {
        this.onData(strm.output.subarray(0, strm.next_out));
      }
      status = deflate_1$2.deflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return status === Z_OK$2;
    }
    if (strm.avail_out === 0) {
      this.onData(strm.output);
      continue;
    }
    if (_flush_mode > 0 && strm.next_out > 0) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }
    if (strm.avail_in === 0)
      break;
  }
  return true;
};
Deflate$1.prototype.onData = function(chunk) {
  this.chunks.push(chunk);
};
Deflate$1.prototype.onEnd = function(status) {
  if (status === Z_OK$2) {
    this.result = common.flattenChunks(this.chunks);
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};
function deflate$1(input, options) {
  const deflator = new Deflate$1(options);
  deflator.push(input, true);
  if (deflator.err) {
    throw deflator.msg || messages[deflator.err];
  }
  return deflator.result;
}
function deflateRaw$1(input, options) {
  options = options || {};
  options.raw = true;
  return deflate$1(input, options);
}
function gzip$1(input, options) {
  options = options || {};
  options.gzip = true;
  return deflate$1(input, options);
}
var Deflate_1$1 = Deflate$1;
var deflate_2 = deflate$1;
var deflateRaw_1$1 = deflateRaw$1;
var gzip_1$1 = gzip$1;
var constants$1 = constants$2;
var deflate_1$1 = {
  Deflate: Deflate_1$1,
  deflate: deflate_2,
  deflateRaw: deflateRaw_1$1,
  gzip: gzip_1$1,
  constants: constants$1
};
const BAD$1 = 16209;
const TYPE$1 = 16191;
var inffast = function inflate_fast(strm, start) {
  let _in;
  let last2;
  let _out;
  let beg;
  let end;
  let dmax;
  let wsize;
  let whave;
  let wnext;
  let s_window;
  let hold;
  let bits;
  let lcode;
  let dcode;
  let lmask;
  let dmask;
  let here;
  let op;
  let len;
  let dist;
  let from;
  let from_source;
  let input, output;
  const state = strm.state;
  _in = strm.next_in;
  input = strm.input;
  last2 = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
  dmax = state.dmax;
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  s_window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;
  top:
    do {
      if (bits < 15) {
        hold += input[_in++] << bits;
        bits += 8;
        hold += input[_in++] << bits;
        bits += 8;
      }
      here = lcode[hold & lmask];
      dolen:
        for (; ; ) {
          op = here >>> 24;
          hold >>>= op;
          bits -= op;
          op = here >>> 16 & 255;
          if (op === 0) {
            output[_out++] = here & 65535;
          } else if (op & 16) {
            len = here & 65535;
            op &= 15;
            if (op) {
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
              len += hold & (1 << op) - 1;
              hold >>>= op;
              bits -= op;
            }
            if (bits < 15) {
              hold += input[_in++] << bits;
              bits += 8;
              hold += input[_in++] << bits;
              bits += 8;
            }
            here = dcode[hold & dmask];
            dodist:
              for (; ; ) {
                op = here >>> 24;
                hold >>>= op;
                bits -= op;
                op = here >>> 16 & 255;
                if (op & 16) {
                  dist = here & 65535;
                  op &= 15;
                  if (bits < op) {
                    hold += input[_in++] << bits;
                    bits += 8;
                    if (bits < op) {
                      hold += input[_in++] << bits;
                      bits += 8;
                    }
                  }
                  dist += hold & (1 << op) - 1;
                  if (dist > dmax) {
                    strm.msg = "invalid distance too far back";
                    state.mode = BAD$1;
                    break top;
                  }
                  hold >>>= op;
                  bits -= op;
                  op = _out - beg;
                  if (dist > op) {
                    op = dist - op;
                    if (op > whave) {
                      if (state.sane) {
                        strm.msg = "invalid distance too far back";
                        state.mode = BAD$1;
                        break top;
                      }
                    }
                    from = 0;
                    from_source = s_window;
                    if (wnext === 0) {
                      from += wsize - op;
                      if (op < len) {
                        len -= op;
                        do {
                          output[_out++] = s_window[from++];
                        } while (--op);
                        from = _out - dist;
                        from_source = output;
                      }
                    } else if (wnext < op) {
                      from += wsize + wnext - op;
                      op -= wnext;
                      if (op < len) {
                        len -= op;
                        do {
                          output[_out++] = s_window[from++];
                        } while (--op);
                        from = 0;
                        if (wnext < len) {
                          op = wnext;
                          len -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = _out - dist;
                          from_source = output;
                        }
                      }
                    } else {
                      from += wnext - op;
                      if (op < len) {
                        len -= op;
                        do {
                          output[_out++] = s_window[from++];
                        } while (--op);
                        from = _out - dist;
                        from_source = output;
                      }
                    }
                    while (len > 2) {
                      output[_out++] = from_source[from++];
                      output[_out++] = from_source[from++];
                      output[_out++] = from_source[from++];
                      len -= 3;
                    }
                    if (len) {
                      output[_out++] = from_source[from++];
                      if (len > 1) {
                        output[_out++] = from_source[from++];
                      }
                    }
                  } else {
                    from = _out - dist;
                    do {
                      output[_out++] = output[from++];
                      output[_out++] = output[from++];
                      output[_out++] = output[from++];
                      len -= 3;
                    } while (len > 2);
                    if (len) {
                      output[_out++] = output[from++];
                      if (len > 1) {
                        output[_out++] = output[from++];
                      }
                    }
                  }
                } else if ((op & 64) === 0) {
                  here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                  continue dodist;
                } else {
                  strm.msg = "invalid distance code";
                  state.mode = BAD$1;
                  break top;
                }
                break;
              }
          } else if ((op & 64) === 0) {
            here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
            continue dolen;
          } else if (op & 32) {
            state.mode = TYPE$1;
            break top;
          } else {
            strm.msg = "invalid literal/length code";
            state.mode = BAD$1;
            break top;
          }
          break;
        }
    } while (_in < last2 && _out < end);
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = _in < last2 ? 5 + (last2 - _in) : 5 - (_in - last2);
  strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
  state.hold = hold;
  state.bits = bits;
  return;
};
const MAXBITS = 15;
const ENOUGH_LENS$1 = 852;
const ENOUGH_DISTS$1 = 592;
const CODES$1 = 0;
const LENS$1 = 1;
const DISTS$1 = 2;
const lbase = new Uint16Array([
  /* Length codes 257..285 base */
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  13,
  15,
  17,
  19,
  23,
  27,
  31,
  35,
  43,
  51,
  59,
  67,
  83,
  99,
  115,
  131,
  163,
  195,
  227,
  258,
  0,
  0
]);
const lext = new Uint8Array([
  /* Length codes 257..285 extra */
  16,
  16,
  16,
  16,
  16,
  16,
  16,
  16,
  17,
  17,
  17,
  17,
  18,
  18,
  18,
  18,
  19,
  19,
  19,
  19,
  20,
  20,
  20,
  20,
  21,
  21,
  21,
  21,
  16,
  72,
  78
]);
const dbase = new Uint16Array([
  /* Distance codes 0..29 base */
  1,
  2,
  3,
  4,
  5,
  7,
  9,
  13,
  17,
  25,
  33,
  49,
  65,
  97,
  129,
  193,
  257,
  385,
  513,
  769,
  1025,
  1537,
  2049,
  3073,
  4097,
  6145,
  8193,
  12289,
  16385,
  24577,
  0,
  0
]);
const dext = new Uint8Array([
  /* Distance codes 0..29 extra */
  16,
  16,
  16,
  16,
  17,
  17,
  18,
  18,
  19,
  19,
  20,
  20,
  21,
  21,
  22,
  22,
  23,
  23,
  24,
  24,
  25,
  25,
  26,
  26,
  27,
  27,
  28,
  28,
  29,
  29,
  64,
  64
]);
const inflate_table = (type, lens, lens_index, codes, table, table_index, work, opts) => {
  const bits = opts.bits;
  let len = 0;
  let sym = 0;
  let min = 0, max = 0;
  let root = 0;
  let curr = 0;
  let drop = 0;
  let left = 0;
  let used = 0;
  let huff = 0;
  let incr;
  let fill;
  let low;
  let mask;
  let next;
  let base = null;
  let match;
  const count = new Uint16Array(MAXBITS + 1);
  const offs = new Uint16Array(MAXBITS + 1);
  let extra = null;
  let here_bits, here_op, here_val;
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) {
      break;
    }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {
    table[table_index++] = 1 << 24 | 64 << 16 | 0;
    table[table_index++] = 1 << 24 | 64 << 16 | 0;
    opts.bits = 1;
    return 0;
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) {
      break;
    }
  }
  if (root < min) {
    root = min;
  }
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }
  }
  if (left > 0 && (type === CODES$1 || max !== 1)) {
    return -1;
  }
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }
  if (type === CODES$1) {
    base = extra = work;
    match = 20;
  } else if (type === LENS$1) {
    base = lbase;
    extra = lext;
    match = 257;
  } else {
    base = dbase;
    extra = dext;
    match = 0;
  }
  huff = 0;
  sym = 0;
  len = min;
  next = table_index;
  curr = root;
  drop = 0;
  low = -1;
  used = 1 << root;
  mask = used - 1;
  if (type === LENS$1 && used > ENOUGH_LENS$1 || type === DISTS$1 && used > ENOUGH_DISTS$1) {
    return 1;
  }
  for (; ; ) {
    here_bits = len - drop;
    if (work[sym] + 1 < match) {
      here_op = 0;
      here_val = work[sym];
    } else if (work[sym] >= match) {
      here_op = extra[work[sym] - match];
      here_val = base[work[sym] - match];
    } else {
      here_op = 32 + 64;
      here_val = 0;
    }
    incr = 1 << len - drop;
    fill = 1 << curr;
    min = fill;
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
    } while (fill !== 0);
    incr = 1 << len - 1;
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }
    sym++;
    if (--count[len] === 0) {
      if (len === max) {
        break;
      }
      len = lens[lens_index + work[sym]];
    }
    if (len > root && (huff & mask) !== low) {
      if (drop === 0) {
        drop = root;
      }
      next += min;
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) {
          break;
        }
        curr++;
        left <<= 1;
      }
      used += 1 << curr;
      if (type === LENS$1 && used > ENOUGH_LENS$1 || type === DISTS$1 && used > ENOUGH_DISTS$1) {
        return 1;
      }
      low = huff & mask;
      table[low] = root << 24 | curr << 16 | next - table_index | 0;
    }
  }
  if (huff !== 0) {
    table[next + huff] = len - drop << 24 | 64 << 16 | 0;
  }
  opts.bits = root;
  return 0;
};
var inftrees = inflate_table;
const CODES = 0;
const LENS = 1;
const DISTS = 2;
const {
  Z_FINISH: Z_FINISH$1,
  Z_BLOCK,
  Z_TREES,
  Z_OK: Z_OK$1,
  Z_STREAM_END: Z_STREAM_END$1,
  Z_NEED_DICT: Z_NEED_DICT$1,
  Z_STREAM_ERROR: Z_STREAM_ERROR$1,
  Z_DATA_ERROR: Z_DATA_ERROR$1,
  Z_MEM_ERROR: Z_MEM_ERROR$1,
  Z_BUF_ERROR,
  Z_DEFLATED
} = constants$2;
const HEAD = 16180;
const FLAGS = 16181;
const TIME = 16182;
const OS = 16183;
const EXLEN = 16184;
const EXTRA = 16185;
const NAME = 16186;
const COMMENT = 16187;
const HCRC = 16188;
const DICTID = 16189;
const DICT = 16190;
const TYPE = 16191;
const TYPEDO = 16192;
const STORED = 16193;
const COPY_ = 16194;
const COPY = 16195;
const TABLE = 16196;
const LENLENS = 16197;
const CODELENS = 16198;
const LEN_ = 16199;
const LEN = 16200;
const LENEXT = 16201;
const DIST = 16202;
const DISTEXT = 16203;
const MATCH = 16204;
const LIT = 16205;
const CHECK = 16206;
const LENGTH = 16207;
const DONE = 16208;
const BAD = 16209;
const MEM = 16210;
const SYNC = 16211;
const ENOUGH_LENS = 852;
const ENOUGH_DISTS = 592;
const MAX_WBITS = 15;
const DEF_WBITS = MAX_WBITS;
const zswap32 = (q) => {
  return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
};
function InflateState() {
  this.strm = null;
  this.mode = 0;
  this.last = false;
  this.wrap = 0;
  this.havedict = false;
  this.flags = 0;
  this.dmax = 0;
  this.check = 0;
  this.total = 0;
  this.head = null;
  this.wbits = 0;
  this.wsize = 0;
  this.whave = 0;
  this.wnext = 0;
  this.window = null;
  this.hold = 0;
  this.bits = 0;
  this.length = 0;
  this.offset = 0;
  this.extra = 0;
  this.lencode = null;
  this.distcode = null;
  this.lenbits = 0;
  this.distbits = 0;
  this.ncode = 0;
  this.nlen = 0;
  this.ndist = 0;
  this.have = 0;
  this.next = null;
  this.lens = new Uint16Array(320);
  this.work = new Uint16Array(288);
  this.lendyn = null;
  this.distdyn = null;
  this.sane = 0;
  this.back = 0;
  this.was = 0;
}
const inflateStateCheck = (strm) => {
  if (!strm) {
    return 1;
  }
  const state = strm.state;
  if (!state || state.strm !== strm || state.mode < HEAD || state.mode > SYNC) {
    return 1;
  }
  return 0;
};
const inflateResetKeep = (strm) => {
  if (inflateStateCheck(strm)) {
    return Z_STREAM_ERROR$1;
  }
  const state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = "";
  if (state.wrap) {
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.flags = -1;
  state.dmax = 32768;
  state.head = null;
  state.hold = 0;
  state.bits = 0;
  state.lencode = state.lendyn = new Int32Array(ENOUGH_LENS);
  state.distcode = state.distdyn = new Int32Array(ENOUGH_DISTS);
  state.sane = 1;
  state.back = -1;
  return Z_OK$1;
};
const inflateReset = (strm) => {
  if (inflateStateCheck(strm)) {
    return Z_STREAM_ERROR$1;
  }
  const state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);
};
const inflateReset2 = (strm, windowBits) => {
  let wrap;
  if (inflateStateCheck(strm)) {
    return Z_STREAM_ERROR$1;
  }
  const state = strm.state;
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  } else {
    wrap = (windowBits >> 4) + 5;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR$1;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
};
const inflateInit2 = (strm, windowBits) => {
  if (!strm) {
    return Z_STREAM_ERROR$1;
  }
  const state = new InflateState();
  strm.state = state;
  state.strm = strm;
  state.window = null;
  state.mode = HEAD;
  const ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK$1) {
    strm.state = null;
  }
  return ret;
};
const inflateInit = (strm) => {
  return inflateInit2(strm, DEF_WBITS);
};
let virgin = true;
let lenfix, distfix;
const fixedtables = (state) => {
  if (virgin) {
    lenfix = new Int32Array(512);
    distfix = new Int32Array(32);
    let sym = 0;
    while (sym < 144) {
      state.lens[sym++] = 8;
    }
    while (sym < 256) {
      state.lens[sym++] = 9;
    }
    while (sym < 280) {
      state.lens[sym++] = 7;
    }
    while (sym < 288) {
      state.lens[sym++] = 8;
    }
    inftrees(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
    sym = 0;
    while (sym < 32) {
      state.lens[sym++] = 5;
    }
    inftrees(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
    virgin = false;
  }
  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
};
const updatewindow = (strm, src, end, copy) => {
  let dist;
  const state = strm.state;
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;
    state.window = new Uint8Array(state.wsize);
  }
  if (copy >= state.wsize) {
    state.window.set(src.subarray(end - state.wsize, end), 0);
    state.wnext = 0;
    state.whave = state.wsize;
  } else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    state.window.set(src.subarray(end - copy, end - copy + dist), state.wnext);
    copy -= dist;
    if (copy) {
      state.window.set(src.subarray(end - copy, end), 0);
      state.wnext = copy;
      state.whave = state.wsize;
    } else {
      state.wnext += dist;
      if (state.wnext === state.wsize) {
        state.wnext = 0;
      }
      if (state.whave < state.wsize) {
        state.whave += dist;
      }
    }
  }
  return 0;
};
const inflate$2 = (strm, flush) => {
  let state;
  let input, output;
  let next;
  let put;
  let have, left;
  let hold;
  let bits;
  let _in, _out;
  let copy;
  let from;
  let from_source;
  let here = 0;
  let here_bits, here_op, here_val;
  let last_bits, last_op, last_val;
  let len;
  let ret;
  const hbuf = new Uint8Array(4);
  let opts;
  let n;
  const order = (
    /* permutation of code lengths */
    new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15])
  );
  if (inflateStateCheck(strm) || !strm.output || !strm.input && strm.avail_in !== 0) {
    return Z_STREAM_ERROR$1;
  }
  state = strm.state;
  if (state.mode === TYPE) {
    state.mode = TYPEDO;
  }
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  _in = have;
  _out = left;
  ret = Z_OK$1;
  inf_leave:
    for (; ; ) {
      switch (state.mode) {
        case HEAD:
          if (state.wrap === 0) {
            state.mode = TYPEDO;
            break;
          }
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state.wrap & 2 && hold === 35615) {
            if (state.wbits === 0) {
              state.wbits = 15;
            }
            state.check = 0;
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            state.check = crc32_1(state.check, hbuf, 2, 0);
            hold = 0;
            bits = 0;
            state.mode = FLAGS;
            break;
          }
          if (state.head) {
            state.head.done = false;
          }
          if (!(state.wrap & 1) || /* check if zlib header allowed */
          (((hold & 255) << 8) + (hold >> 8)) % 31) {
            strm.msg = "incorrect header check";
            state.mode = BAD;
            break;
          }
          if ((hold & 15) !== Z_DEFLATED) {
            strm.msg = "unknown compression method";
            state.mode = BAD;
            break;
          }
          hold >>>= 4;
          bits -= 4;
          len = (hold & 15) + 8;
          if (state.wbits === 0) {
            state.wbits = len;
          }
          if (len > 15 || len > state.wbits) {
            strm.msg = "invalid window size";
            state.mode = BAD;
            break;
          }
          state.dmax = 1 << state.wbits;
          state.flags = 0;
          strm.adler = state.check = 1;
          state.mode = hold & 512 ? DICTID : TYPE;
          hold = 0;
          bits = 0;
          break;
        case FLAGS:
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state.flags = hold;
          if ((state.flags & 255) !== Z_DEFLATED) {
            strm.msg = "unknown compression method";
            state.mode = BAD;
            break;
          }
          if (state.flags & 57344) {
            strm.msg = "unknown header flags set";
            state.mode = BAD;
            break;
          }
          if (state.head) {
            state.head.text = hold >> 8 & 1;
          }
          if (state.flags & 512 && state.wrap & 4) {
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            state.check = crc32_1(state.check, hbuf, 2, 0);
          }
          hold = 0;
          bits = 0;
          state.mode = TIME;
        case TIME:
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state.head) {
            state.head.time = hold;
          }
          if (state.flags & 512 && state.wrap & 4) {
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            hbuf[2] = hold >>> 16 & 255;
            hbuf[3] = hold >>> 24 & 255;
            state.check = crc32_1(state.check, hbuf, 4, 0);
          }
          hold = 0;
          bits = 0;
          state.mode = OS;
        case OS:
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state.head) {
            state.head.xflags = hold & 255;
            state.head.os = hold >> 8;
          }
          if (state.flags & 512 && state.wrap & 4) {
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            state.check = crc32_1(state.check, hbuf, 2, 0);
          }
          hold = 0;
          bits = 0;
          state.mode = EXLEN;
        case EXLEN:
          if (state.flags & 1024) {
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.length = hold;
            if (state.head) {
              state.head.extra_len = hold;
            }
            if (state.flags & 512 && state.wrap & 4) {
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              state.check = crc32_1(state.check, hbuf, 2, 0);
            }
            hold = 0;
            bits = 0;
          } else if (state.head) {
            state.head.extra = null;
          }
          state.mode = EXTRA;
        case EXTRA:
          if (state.flags & 1024) {
            copy = state.length;
            if (copy > have) {
              copy = have;
            }
            if (copy) {
              if (state.head) {
                len = state.head.extra_len - state.length;
                if (!state.head.extra) {
                  state.head.extra = new Uint8Array(state.head.extra_len);
                }
                state.head.extra.set(
                  input.subarray(
                    next,
                    // extra field is limited to 65536 bytes
                    // - no need for additional size check
                    next + copy
                  ),
                  /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                  len
                );
              }
              if (state.flags & 512 && state.wrap & 4) {
                state.check = crc32_1(state.check, input, copy, next);
              }
              have -= copy;
              next += copy;
              state.length -= copy;
            }
            if (state.length) {
              break inf_leave;
            }
          }
          state.length = 0;
          state.mode = NAME;
        case NAME:
          if (state.flags & 2048) {
            if (have === 0) {
              break inf_leave;
            }
            copy = 0;
            do {
              len = input[next + copy++];
              if (state.head && len && state.length < 65536) {
                state.head.name += String.fromCharCode(len);
              }
            } while (len && copy < have);
            if (state.flags & 512 && state.wrap & 4) {
              state.check = crc32_1(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            if (len) {
              break inf_leave;
            }
          } else if (state.head) {
            state.head.name = null;
          }
          state.length = 0;
          state.mode = COMMENT;
        case COMMENT:
          if (state.flags & 4096) {
            if (have === 0) {
              break inf_leave;
            }
            copy = 0;
            do {
              len = input[next + copy++];
              if (state.head && len && state.length < 65536) {
                state.head.comment += String.fromCharCode(len);
              }
            } while (len && copy < have);
            if (state.flags & 512 && state.wrap & 4) {
              state.check = crc32_1(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            if (len) {
              break inf_leave;
            }
          } else if (state.head) {
            state.head.comment = null;
          }
          state.mode = HCRC;
        case HCRC:
          if (state.flags & 512) {
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (state.wrap & 4 && hold !== (state.check & 65535)) {
              strm.msg = "header crc mismatch";
              state.mode = BAD;
              break;
            }
            hold = 0;
            bits = 0;
          }
          if (state.head) {
            state.head.hcrc = state.flags >> 9 & 1;
            state.head.done = true;
          }
          strm.adler = state.check = 0;
          state.mode = TYPE;
          break;
        case DICTID:
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          strm.adler = state.check = zswap32(hold);
          hold = 0;
          bits = 0;
          state.mode = DICT;
        case DICT:
          if (state.havedict === 0) {
            strm.next_out = put;
            strm.avail_out = left;
            strm.next_in = next;
            strm.avail_in = have;
            state.hold = hold;
            state.bits = bits;
            return Z_NEED_DICT$1;
          }
          strm.adler = state.check = 1;
          state.mode = TYPE;
        case TYPE:
          if (flush === Z_BLOCK || flush === Z_TREES) {
            break inf_leave;
          }
        case TYPEDO:
          if (state.last) {
            hold >>>= bits & 7;
            bits -= bits & 7;
            state.mode = CHECK;
            break;
          }
          while (bits < 3) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state.last = hold & 1;
          hold >>>= 1;
          bits -= 1;
          switch (hold & 3) {
            case 0:
              state.mode = STORED;
              break;
            case 1:
              fixedtables(state);
              state.mode = LEN_;
              if (flush === Z_TREES) {
                hold >>>= 2;
                bits -= 2;
                break inf_leave;
              }
              break;
            case 2:
              state.mode = TABLE;
              break;
            case 3:
              strm.msg = "invalid block type";
              state.mode = BAD;
          }
          hold >>>= 2;
          bits -= 2;
          break;
        case STORED:
          hold >>>= bits & 7;
          bits -= bits & 7;
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
            strm.msg = "invalid stored block lengths";
            state.mode = BAD;
            break;
          }
          state.length = hold & 65535;
          hold = 0;
          bits = 0;
          state.mode = COPY_;
          if (flush === Z_TREES) {
            break inf_leave;
          }
        case COPY_:
          state.mode = COPY;
        case COPY:
          copy = state.length;
          if (copy) {
            if (copy > have) {
              copy = have;
            }
            if (copy > left) {
              copy = left;
            }
            if (copy === 0) {
              break inf_leave;
            }
            output.set(input.subarray(next, next + copy), put);
            have -= copy;
            next += copy;
            left -= copy;
            put += copy;
            state.length -= copy;
            break;
          }
          state.mode = TYPE;
          break;
        case TABLE:
          while (bits < 14) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state.nlen = (hold & 31) + 257;
          hold >>>= 5;
          bits -= 5;
          state.ndist = (hold & 31) + 1;
          hold >>>= 5;
          bits -= 5;
          state.ncode = (hold & 15) + 4;
          hold >>>= 4;
          bits -= 4;
          if (state.nlen > 286 || state.ndist > 30) {
            strm.msg = "too many length or distance symbols";
            state.mode = BAD;
            break;
          }
          state.have = 0;
          state.mode = LENLENS;
        case LENLENS:
          while (state.have < state.ncode) {
            while (bits < 3) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.lens[order[state.have++]] = hold & 7;
            hold >>>= 3;
            bits -= 3;
          }
          while (state.have < 19) {
            state.lens[order[state.have++]] = 0;
          }
          state.lencode = state.lendyn;
          state.lenbits = 7;
          opts = { bits: state.lenbits };
          ret = inftrees(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
          state.lenbits = opts.bits;
          if (ret) {
            strm.msg = "invalid code lengths set";
            state.mode = BAD;
            break;
          }
          state.have = 0;
          state.mode = CODELENS;
        case CODELENS:
          while (state.have < state.nlen + state.ndist) {
            for (; ; ) {
              here = state.lencode[hold & (1 << state.lenbits) - 1];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (here_val < 16) {
              hold >>>= here_bits;
              bits -= here_bits;
              state.lens[state.have++] = here_val;
            } else {
              if (here_val === 16) {
                n = here_bits + 2;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                if (state.have === 0) {
                  strm.msg = "invalid bit length repeat";
                  state.mode = BAD;
                  break;
                }
                len = state.lens[state.have - 1];
                copy = 3 + (hold & 3);
                hold >>>= 2;
                bits -= 2;
              } else if (here_val === 17) {
                n = here_bits + 3;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                len = 0;
                copy = 3 + (hold & 7);
                hold >>>= 3;
                bits -= 3;
              } else {
                n = here_bits + 7;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                len = 0;
                copy = 11 + (hold & 127);
                hold >>>= 7;
                bits -= 7;
              }
              if (state.have + copy > state.nlen + state.ndist) {
                strm.msg = "invalid bit length repeat";
                state.mode = BAD;
                break;
              }
              while (copy--) {
                state.lens[state.have++] = len;
              }
            }
          }
          if (state.mode === BAD) {
            break;
          }
          if (state.lens[256] === 0) {
            strm.msg = "invalid code -- missing end-of-block";
            state.mode = BAD;
            break;
          }
          state.lenbits = 9;
          opts = { bits: state.lenbits };
          ret = inftrees(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
          state.lenbits = opts.bits;
          if (ret) {
            strm.msg = "invalid literal/lengths set";
            state.mode = BAD;
            break;
          }
          state.distbits = 6;
          state.distcode = state.distdyn;
          opts = { bits: state.distbits };
          ret = inftrees(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
          state.distbits = opts.bits;
          if (ret) {
            strm.msg = "invalid distances set";
            state.mode = BAD;
            break;
          }
          state.mode = LEN_;
          if (flush === Z_TREES) {
            break inf_leave;
          }
        case LEN_:
          state.mode = LEN;
        case LEN:
          if (have >= 6 && left >= 258) {
            strm.next_out = put;
            strm.avail_out = left;
            strm.next_in = next;
            strm.avail_in = have;
            state.hold = hold;
            state.bits = bits;
            inffast(strm, _out);
            put = strm.next_out;
            output = strm.output;
            left = strm.avail_out;
            next = strm.next_in;
            input = strm.input;
            have = strm.avail_in;
            hold = state.hold;
            bits = state.bits;
            if (state.mode === TYPE) {
              state.back = -1;
            }
            break;
          }
          state.back = 0;
          for (; ; ) {
            here = state.lencode[hold & (1 << state.lenbits) - 1];
            here_bits = here >>> 24;
            here_op = here >>> 16 & 255;
            here_val = here & 65535;
            if (here_bits <= bits) {
              break;
            }
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (here_op && (here_op & 240) === 0) {
            last_bits = here_bits;
            last_op = here_op;
            last_val = here_val;
            for (; ; ) {
              here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (last_bits + here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            hold >>>= last_bits;
            bits -= last_bits;
            state.back += last_bits;
          }
          hold >>>= here_bits;
          bits -= here_bits;
          state.back += here_bits;
          state.length = here_val;
          if (here_op === 0) {
            state.mode = LIT;
            break;
          }
          if (here_op & 32) {
            state.back = -1;
            state.mode = TYPE;
            break;
          }
          if (here_op & 64) {
            strm.msg = "invalid literal/length code";
            state.mode = BAD;
            break;
          }
          state.extra = here_op & 15;
          state.mode = LENEXT;
        case LENEXT:
          if (state.extra) {
            n = state.extra;
            while (bits < n) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.length += hold & (1 << state.extra) - 1;
            hold >>>= state.extra;
            bits -= state.extra;
            state.back += state.extra;
          }
          state.was = state.length;
          state.mode = DIST;
        case DIST:
          for (; ; ) {
            here = state.distcode[hold & (1 << state.distbits) - 1];
            here_bits = here >>> 24;
            here_op = here >>> 16 & 255;
            here_val = here & 65535;
            if (here_bits <= bits) {
              break;
            }
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if ((here_op & 240) === 0) {
            last_bits = here_bits;
            last_op = here_op;
            last_val = here_val;
            for (; ; ) {
              here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (last_bits + here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            hold >>>= last_bits;
            bits -= last_bits;
            state.back += last_bits;
          }
          hold >>>= here_bits;
          bits -= here_bits;
          state.back += here_bits;
          if (here_op & 64) {
            strm.msg = "invalid distance code";
            state.mode = BAD;
            break;
          }
          state.offset = here_val;
          state.extra = here_op & 15;
          state.mode = DISTEXT;
        case DISTEXT:
          if (state.extra) {
            n = state.extra;
            while (bits < n) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.offset += hold & (1 << state.extra) - 1;
            hold >>>= state.extra;
            bits -= state.extra;
            state.back += state.extra;
          }
          if (state.offset > state.dmax) {
            strm.msg = "invalid distance too far back";
            state.mode = BAD;
            break;
          }
          state.mode = MATCH;
        case MATCH:
          if (left === 0) {
            break inf_leave;
          }
          copy = _out - left;
          if (state.offset > copy) {
            copy = state.offset - copy;
            if (copy > state.whave) {
              if (state.sane) {
                strm.msg = "invalid distance too far back";
                state.mode = BAD;
                break;
              }
            }
            if (copy > state.wnext) {
              copy -= state.wnext;
              from = state.wsize - copy;
            } else {
              from = state.wnext - copy;
            }
            if (copy > state.length) {
              copy = state.length;
            }
            from_source = state.window;
          } else {
            from_source = output;
            from = put - state.offset;
            copy = state.length;
          }
          if (copy > left) {
            copy = left;
          }
          left -= copy;
          state.length -= copy;
          do {
            output[put++] = from_source[from++];
          } while (--copy);
          if (state.length === 0) {
            state.mode = LEN;
          }
          break;
        case LIT:
          if (left === 0) {
            break inf_leave;
          }
          output[put++] = state.length;
          left--;
          state.mode = LEN;
          break;
        case CHECK:
          if (state.wrap) {
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold |= input[next++] << bits;
              bits += 8;
            }
            _out -= left;
            strm.total_out += _out;
            state.total += _out;
            if (state.wrap & 4 && _out) {
              strm.adler = state.check = /*UPDATE_CHECK(state.check, put - _out, _out);*/
              state.flags ? crc32_1(state.check, output, _out, put - _out) : adler32_1(state.check, output, _out, put - _out);
            }
            _out = left;
            if (state.wrap & 4 && (state.flags ? hold : zswap32(hold)) !== state.check) {
              strm.msg = "incorrect data check";
              state.mode = BAD;
              break;
            }
            hold = 0;
            bits = 0;
          }
          state.mode = LENGTH;
        case LENGTH:
          if (state.wrap && state.flags) {
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (state.wrap & 4 && hold !== (state.total & 4294967295)) {
              strm.msg = "incorrect length check";
              state.mode = BAD;
              break;
            }
            hold = 0;
            bits = 0;
          }
          state.mode = DONE;
        case DONE:
          ret = Z_STREAM_END$1;
          break inf_leave;
        case BAD:
          ret = Z_DATA_ERROR$1;
          break inf_leave;
        case MEM:
          return Z_MEM_ERROR$1;
        case SYNC:
        default:
          return Z_STREAM_ERROR$1;
      }
    }
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH$1)) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out))
      ;
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if (state.wrap & 4 && _out) {
    strm.adler = state.check = /*UPDATE_CHECK(state.check, strm.next_out - _out, _out);*/
    state.flags ? crc32_1(state.check, output, _out, strm.next_out - _out) : adler32_1(state.check, output, _out, strm.next_out - _out);
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if ((_in === 0 && _out === 0 || flush === Z_FINISH$1) && ret === Z_OK$1) {
    ret = Z_BUF_ERROR;
  }
  return ret;
};
const inflateEnd = (strm) => {
  if (inflateStateCheck(strm)) {
    return Z_STREAM_ERROR$1;
  }
  let state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK$1;
};
const inflateGetHeader = (strm, head) => {
  if (inflateStateCheck(strm)) {
    return Z_STREAM_ERROR$1;
  }
  const state = strm.state;
  if ((state.wrap & 2) === 0) {
    return Z_STREAM_ERROR$1;
  }
  state.head = head;
  head.done = false;
  return Z_OK$1;
};
const inflateSetDictionary = (strm, dictionary) => {
  const dictLength = dictionary.length;
  let state;
  let dictid;
  let ret;
  if (inflateStateCheck(strm)) {
    return Z_STREAM_ERROR$1;
  }
  state = strm.state;
  if (state.wrap !== 0 && state.mode !== DICT) {
    return Z_STREAM_ERROR$1;
  }
  if (state.mode === DICT) {
    dictid = 1;
    dictid = adler32_1(dictid, dictionary, dictLength, 0);
    if (dictid !== state.check) {
      return Z_DATA_ERROR$1;
    }
  }
  ret = updatewindow(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state.mode = MEM;
    return Z_MEM_ERROR$1;
  }
  state.havedict = 1;
  return Z_OK$1;
};
var inflateReset_1 = inflateReset;
var inflateReset2_1 = inflateReset2;
var inflateResetKeep_1 = inflateResetKeep;
var inflateInit_1 = inflateInit;
var inflateInit2_1 = inflateInit2;
var inflate_2$1 = inflate$2;
var inflateEnd_1 = inflateEnd;
var inflateGetHeader_1 = inflateGetHeader;
var inflateSetDictionary_1 = inflateSetDictionary;
var inflateInfo = "pako inflate (from Nodeca project)";
var inflate_1$2 = {
  inflateReset: inflateReset_1,
  inflateReset2: inflateReset2_1,
  inflateResetKeep: inflateResetKeep_1,
  inflateInit: inflateInit_1,
  inflateInit2: inflateInit2_1,
  inflate: inflate_2$1,
  inflateEnd: inflateEnd_1,
  inflateGetHeader: inflateGetHeader_1,
  inflateSetDictionary: inflateSetDictionary_1,
  inflateInfo
};
function GZheader() {
  this.text = 0;
  this.time = 0;
  this.xflags = 0;
  this.os = 0;
  this.extra = null;
  this.extra_len = 0;
  this.name = "";
  this.comment = "";
  this.hcrc = 0;
  this.done = false;
}
var gzheader = GZheader;
const toString = Object.prototype.toString;
const {
  Z_NO_FLUSH,
  Z_FINISH,
  Z_OK,
  Z_STREAM_END,
  Z_NEED_DICT,
  Z_STREAM_ERROR,
  Z_DATA_ERROR,
  Z_MEM_ERROR
} = constants$2;
function Inflate$1(options) {
  this.options = common.assign({
    chunkSize: 1024 * 64,
    windowBits: 15,
    to: ""
  }, options || {});
  const opt = this.options;
  if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) {
      opt.windowBits = -15;
    }
  }
  if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
    opt.windowBits += 32;
  }
  if (opt.windowBits > 15 && opt.windowBits < 48) {
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }
  this.err = 0;
  this.msg = "";
  this.ended = false;
  this.chunks = [];
  this.strm = new zstream();
  this.strm.avail_out = 0;
  let status = inflate_1$2.inflateInit2(
    this.strm,
    opt.windowBits
  );
  if (status !== Z_OK) {
    throw new Error(messages[status]);
  }
  this.header = new gzheader();
  inflate_1$2.inflateGetHeader(this.strm, this.header);
  if (opt.dictionary) {
    if (typeof opt.dictionary === "string") {
      opt.dictionary = strings.string2buf(opt.dictionary);
    } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
      opt.dictionary = new Uint8Array(opt.dictionary);
    }
    if (opt.raw) {
      status = inflate_1$2.inflateSetDictionary(this.strm, opt.dictionary);
      if (status !== Z_OK) {
        throw new Error(messages[status]);
      }
    }
  }
}
Inflate$1.prototype.push = function(data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  const dictionary = this.options.dictionary;
  let status, _flush_mode, last_avail_out;
  if (this.ended)
    return false;
  if (flush_mode === ~~flush_mode)
    _flush_mode = flush_mode;
  else
    _flush_mode = flush_mode === true ? Z_FINISH : Z_NO_FLUSH;
  if (toString.call(data) === "[object ArrayBuffer]") {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }
  strm.next_in = 0;
  strm.avail_in = strm.input.length;
  for (; ; ) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    status = inflate_1$2.inflate(strm, _flush_mode);
    if (status === Z_NEED_DICT && dictionary) {
      status = inflate_1$2.inflateSetDictionary(strm, dictionary);
      if (status === Z_OK) {
        status = inflate_1$2.inflate(strm, _flush_mode);
      } else if (status === Z_DATA_ERROR) {
        status = Z_NEED_DICT;
      }
    }
    while (strm.avail_in > 0 && status === Z_STREAM_END && strm.state.wrap > 0 && data[strm.next_in] !== 0) {
      inflate_1$2.inflateReset(strm);
      status = inflate_1$2.inflate(strm, _flush_mode);
    }
    switch (status) {
      case Z_STREAM_ERROR:
      case Z_DATA_ERROR:
      case Z_NEED_DICT:
      case Z_MEM_ERROR:
        this.onEnd(status);
        this.ended = true;
        return false;
    }
    last_avail_out = strm.avail_out;
    if (strm.next_out) {
      if (strm.avail_out === 0 || status === Z_STREAM_END) {
        if (this.options.to === "string") {
          let next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
          let tail = strm.next_out - next_out_utf8;
          let utf8str = strings.buf2string(strm.output, next_out_utf8);
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail)
            strm.output.set(strm.output.subarray(next_out_utf8, next_out_utf8 + tail), 0);
          this.onData(utf8str);
        } else {
          this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
        }
      }
    }
    if (status === Z_OK && last_avail_out === 0)
      continue;
    if (status === Z_STREAM_END) {
      status = inflate_1$2.inflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return true;
    }
    if (strm.avail_in === 0)
      break;
  }
  return true;
};
Inflate$1.prototype.onData = function(chunk) {
  this.chunks.push(chunk);
};
Inflate$1.prototype.onEnd = function(status) {
  if (status === Z_OK) {
    if (this.options.to === "string") {
      this.result = this.chunks.join("");
    } else {
      this.result = common.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};
function inflate$1(input, options) {
  const inflator = new Inflate$1(options);
  inflator.push(input);
  if (inflator.err)
    throw inflator.msg || messages[inflator.err];
  return inflator.result;
}
function inflateRaw$1(input, options) {
  options = options || {};
  options.raw = true;
  return inflate$1(input, options);
}
var Inflate_1$1 = Inflate$1;
var inflate_2 = inflate$1;
var inflateRaw_1$1 = inflateRaw$1;
var ungzip$1 = inflate$1;
var constants = constants$2;
var inflate_1$1 = {
  Inflate: Inflate_1$1,
  inflate: inflate_2,
  inflateRaw: inflateRaw_1$1,
  ungzip: ungzip$1,
  constants
};
const { Deflate, deflate, deflateRaw, gzip } = deflate_1$1;
const { Inflate, inflate, inflateRaw, ungzip } = inflate_1$1;
var Deflate_1 = Deflate;
var deflate_1 = deflate;
var deflateRaw_1 = deflateRaw;
var gzip_1 = gzip;
var Inflate_1 = Inflate;
var inflate_1 = inflate;
var inflateRaw_1 = inflateRaw;
var ungzip_1 = ungzip;
var constants_1 = constants$2;
var pako = {
  Deflate: Deflate_1,
  deflate: deflate_1,
  deflateRaw: deflateRaw_1,
  gzip: gzip_1,
  Inflate: Inflate_1,
  inflate: inflate_1,
  inflateRaw: inflateRaw_1,
  ungzip: ungzip_1,
  constants: constants_1
};
function create_if_block(ctx) {
  let div;
  let textContent = `<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span>Not logged in! <a href="${API_ADDRESS}" target="_blank">click here</a></span>`;
  return {
    c() {
      div = element("div");
      div.innerHTML = textContent;
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {
        role: true,
        class: true,
        ["data-svelte-h"]: true
      });
      if (get_svelte_dataset(div) !== "svelte-akoz6f")
        div.innerHTML = textContent;
      this.h();
    },
    h() {
      attr(div, "role", "alert");
      attr(div, "class", "alert alert-error");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_fragment(ctx) {
  let t0;
  let t1;
  let t2;
  let div1;
  let div0;
  let t3;
  let t4;
  let notepanel;
  let t5;
  let textarea;
  let current;
  let mounted;
  let dispose;
  let if_block = !/*logged_in*/
  ctx[4] && create_if_block();
  notepanel = new NotePanel({
    props: {
      note_sync: (
        /*note_sync*/
        ctx[1]
      ),
      source_id: (
        /*$source_id*/
        ctx[5]
      )
    }
  });
  return {
    c() {
      t0 = text(
        /*$source_id*/
        ctx[5]
      );
      t1 = space();
      if (if_block)
        if_block.c();
      t2 = space();
      div1 = element("div");
      div0 = element("div");
      t3 = text(
        /*curr_title*/
        ctx[0]
      );
      t4 = space();
      create_component(notepanel.$$.fragment);
      t5 = space();
      textarea = element("textarea");
      this.h();
    },
    l(nodes) {
      t0 = claim_text(
        nodes,
        /*$source_id*/
        ctx[5]
      );
      t1 = claim_space(nodes);
      if (if_block)
        if_block.l(nodes);
      t2 = claim_space(nodes);
      div1 = claim_element(nodes, "DIV", { class: true });
      var div1_nodes = children(div1);
      div0 = claim_element(div1_nodes, "DIV", { class: true });
      var div0_nodes = children(div0);
      t3 = claim_text(
        div0_nodes,
        /*curr_title*/
        ctx[0]
      );
      div0_nodes.forEach(detach);
      t4 = claim_space(div1_nodes);
      claim_component(notepanel.$$.fragment, div1_nodes);
      t5 = claim_space(div1_nodes);
      textarea = claim_element(div1_nodes, "TEXTAREA", { placeholder: true, class: true });
      children(textarea).forEach(detach);
      div1_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "class", "text-xl text-center w-full italic");
      attr(textarea, "placeholder", "scratchy scratch scratch");
      attr(textarea, "class", "w-full");
      attr(div1, "class", "max-w-xs mx-auto space-y-4");
    },
    m(target, anchor) {
      insert_hydration(target, t0, anchor);
      insert_hydration(target, t1, anchor);
      if (if_block)
        if_block.m(target, anchor);
      insert_hydration(target, t2, anchor);
      insert_hydration(target, div1, anchor);
      append_hydration(div1, div0);
      append_hydration(div0, t3);
      append_hydration(div1, t4);
      mount_component(notepanel, div1, null);
      append_hydration(div1, t5);
      append_hydration(div1, textarea);
      set_input_value(
        textarea,
        /*$scratches*/
        ctx[6][
          /*curr_domain_title*/
          ctx[3]
        ]
      );
      current = true;
      if (!mounted) {
        dispose = listen(
          textarea,
          "input",
          /*textarea_input_handler*/
          ctx[8]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (!current || dirty & /*$source_id*/
      32)
        set_data(
          t0,
          /*$source_id*/
          ctx2[5]
        );
      if (!/*logged_in*/
      ctx2[4]) {
        if (if_block)
          ;
        else {
          if_block = create_if_block();
          if_block.c();
          if_block.m(t2.parentNode, t2);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (!current || dirty & /*curr_title*/
      1)
        set_data(
          t3,
          /*curr_title*/
          ctx2[0]
        );
      const notepanel_changes = {};
      if (dirty & /*note_sync*/
      2)
        notepanel_changes.note_sync = /*note_sync*/
        ctx2[1];
      if (dirty & /*$source_id*/
      32)
        notepanel_changes.source_id = /*$source_id*/
        ctx2[5];
      notepanel.$set(notepanel_changes);
      if (dirty & /*$scratches, curr_domain_title*/
      72) {
        set_input_value(
          textarea,
          /*$scratches*/
          ctx2[6][
            /*curr_domain_title*/
            ctx2[3]
          ]
        );
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(notepanel.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(notepanel.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(t0);
        detach(t1);
        detach(t2);
        detach(div1);
      }
      if (if_block)
        if_block.d(detaching);
      destroy_component(notepanel);
      mounted = false;
      dispose();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let $page;
  let $source_id, $$unsubscribe_source_id = noop$1, $$subscribe_source_id = () => ($$unsubscribe_source_id(), $$unsubscribe_source_id = subscribe(source_id, ($$value) => $$invalidate(5, $source_id = $$value)), source_id);
  let $scratches;
  component_subscribe($$self, page, ($$value) => $$invalidate(11, $page = $$value));
  component_subscribe($$self, scratches, ($$value) => $$invalidate(6, $scratches = $$value));
  $$self.$$.on_destroy.push(() => $$unsubscribe_source_id());
  let { data } = $$props;
  let curr_title = "Kalanchoe";
  let curr_url = "";
  let { supabase } = data;
  let session;
  let note_sync = new NoteSync(supabase, void 0);
  let source_id;
  let hostname = (s) => new URL(s).hostname;
  let curr_domain_title = "";
  function getHighlight(source_id2, tab_id) {
    chrome.tabs.sendMessage(tab_id, {
      action: "deserialize",
      uss: (get_store_value(note_sync.notestore)[source_id2] || []).map((n) => [n.snippet_uuid, n.serialized_highlight])
    });
  }
  async function updateActive() {
    let tab;
    try {
      [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    } catch {
      console.log("dev?");
      $$subscribe_source_id($$invalidate(2, source_id = await getSourceId(supabase)("a", "a")));
      return;
    }
    if (!tab.url || !tab.title || !tab.id)
      return;
    $$invalidate(0, curr_title = tab.title);
    curr_url = tab.url;
    let domain = hostname(tab.url);
    $$invalidate(3, curr_domain_title = [domain, tab.title].join(";"));
    if (!(curr_domain_title in $scratches))
      scratches.update((t) => {
        t[curr_domain_title] = "";
        return t;
      });
    $$subscribe_source_id($$invalidate(2, source_id = await getSourceId(supabase)(domain, curr_title)));
    await note_sync.update_one_page($source_id);
    getHighlight($source_id, tab.id);
    console.log("scratches", $scratches);
  }
  let logged_in = true;
  setTimeout(
    () => {
      $$invalidate(4, logged_in = !!session);
    },
    2e3
  );
  onMount(async () => {
    try {
      chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        if (request.action == "update_curr_url")
          updateActive();
        if (request.action === "uploadTextSB") {
          console.log("uplaodtextsb");
          const { action, ...rest } = request;
          rest.context = { html: rest.html, text: rest.html };
          rest.packed_context = String.fromCharCode(...pako.deflate(JSON.stringify(rest.context)));
          const { note_data } = await trpc($page).upload_snippet.mutate(rest);
          if (note_data) {
            console.log(note_data.quote);
            note_sync.notestore.update((n) => {
              n[$source_id] = [...n[$source_id] || [], { ...note_data, ...mock }];
              return n;
            });
          }
        }
      });
    } catch {
      console.log("dev?");
    }
    let { data: data2 } = await supabase.auth.getSession();
    if (!data2.session) {
      console.log("getting session");
      let atokens = await trpc($page).my_email.query();
      atokens || window.open(API_ADDRESS);
      session = await getSession(supabase, atokens);
    } else {
      session = data2.session;
    }
    console.log("session is", session);
    $$invalidate(1, note_sync.user_id = session.user.id, note_sync);
    $$invalidate(4, logged_in = !!session);
    updateActive();
    sub(note_sync)(curr_title, curr_url);
  });
  function textarea_input_handler() {
    $scratches[curr_domain_title] = this.value;
    scratches.set($scratches);
  }
  $$self.$$set = ($$props2) => {
    if ("data" in $$props2)
      $$invalidate(7, data = $$props2.data);
  };
  return [
    curr_title,
    note_sync,
    source_id,
    curr_domain_title,
    logged_in,
    $source_id,
    $scratches,
    data,
    textarea_input_handler
  ];
}
class Page extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { data: 7 });
  }
}
export {
  Page as component
};
