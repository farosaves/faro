import { c as commonjsGlobal } from "./_commonjsHelpers.jUUCeJQL.js";
var __spreadArray = function(to, from, pack) {
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
function identity(a) {
  return a;
}
function pipe(a, ab, bc, cd, de, ef, fg, gh, hi) {
  switch (arguments.length) {
    case 1:
      return a;
    case 2:
      return ab(a);
    case 3:
      return bc(ab(a));
    case 4:
      return cd(bc(ab(a)));
    case 5:
      return de(cd(bc(ab(a))));
    case 6:
      return ef(de(cd(bc(ab(a)))));
    case 7:
      return fg(ef(de(cd(bc(ab(a))))));
    case 8:
      return gh(fg(ef(de(cd(bc(ab(a)))))));
    case 9:
      return hi(gh(fg(ef(de(cd(bc(ab(a))))))));
    default: {
      var ret = arguments[0];
      for (var i = 1; i < arguments.length; i++) {
        ret = arguments[i](ret);
      }
      return ret;
    }
  }
}
var dual = function(arity, body) {
  var isDataFirst = typeof arity === "number" ? function(args) {
    return args.length >= arity;
  } : arity;
  return function() {
    var args = Array.from(arguments);
    if (isDataFirst(arguments)) {
      return body.apply(this, args);
    }
    return function(self) {
      return body.apply(void 0, __spreadArray([self], args, false));
    };
  };
};
(function(to, from, pack) {
  if (pack || arguments.length === 2)
    for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar)
          ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
  return to.concat(ar || Array.prototype.slice.call(from));
});
var none$1 = { _tag: "None" };
var some$1 = function(a) {
  return { _tag: "Some", value: a };
};
var has = Object.prototype.hasOwnProperty;
var separated = function(left, right) {
  return { left, right };
};
(function(to, from, pack) {
  if (pack || arguments.length === 2)
    for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar)
          ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
  return to.concat(ar || Array.prototype.slice.call(from));
});
var foldMapWithIndex = function(M) {
  return function(f) {
    return function(fa) {
      return fa.reduce(function(b, a, i) {
        return M.concat(b, f(i, a));
      }, M.empty);
    };
  };
};
var reduce$1 = function(b, f) {
  return reduceWithIndex(b, function(_, b2, a) {
    return f(b2, a);
  });
};
var foldMap$1 = function(M) {
  var foldMapWithIndexM = foldMapWithIndex(M);
  return function(f) {
    return foldMapWithIndexM(function(_, a) {
      return f(a);
    });
  };
};
var reduceWithIndex = function(b, f) {
  return function(fa) {
    var len = fa.length;
    var out = b;
    for (var i = 0; i < len; i++) {
      out = f(i, out, fa[i]);
    }
    return out;
  };
};
var reduceRight$1 = function(b, f) {
  return reduceRightWithIndex(b, function(_, a, b2) {
    return f(a, b2);
  });
};
var reduceRightWithIndex = function(b, f) {
  return function(fa) {
    return fa.reduceRight(function(b2, a, i) {
      return f(i, a, b2);
    }, b);
  };
};
var _reduce = function(fa, b, f) {
  return pipe(fa, reduce(b, f));
};
var _foldMap = function(M) {
  var foldMapM = foldMap(M);
  return function(fa, f) {
    return pipe(fa, foldMapM(f));
  };
};
var _reduceRight = function(fa, b, f) {
  return pipe(fa, reduceRight(b, f));
};
var map = function(f) {
  return function(fa) {
    return fa.map(function(a) {
      return f(a);
    });
  };
};
var partition = function(predicate) {
  return partitionWithIndex(function(_, a) {
    return predicate(a);
  });
};
var partitionWithIndex = function(predicateWithIndex) {
  return function(as) {
    var left = [];
    var right = [];
    for (var i = 0; i < as.length; i++) {
      var b = as[i];
      if (predicateWithIndex(i, b)) {
        right.push(b);
      } else {
        left.push(b);
      }
    }
    return separated(left, right);
  };
};
var foldMap = foldMap$1;
var reduce = reduce$1;
var reduceRight = reduceRight$1;
var URI = "Array";
var Foldable = {
  URI,
  reduce: _reduce,
  foldMap: _foldMap,
  reduceRight: _reduceRight
};
var none = none$1;
var some = some$1;
var flatMap = /* @__PURE__ */ dual(2, function(ma, f) {
  return isNone(ma) ? none : f(ma.value);
});
var isNone = function(fa) {
  return fa._tag === "None";
};
var matchW = function(onNone, onSome) {
  return function(ma) {
    return isNone(ma) ? onNone() : onSome(ma.value);
  };
};
var match = matchW;
var fold = match;
var fromNullable = function(a) {
  return a == null ? none : some(a);
};
var chain = flatMap;
var _function = {};
(function(exports) {
  var __spreadArray2 = commonjsGlobal && commonjsGlobal.__spreadArray || function(to, from, pack) {
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
  exports.dual = exports.getEndomorphismMonoid = exports.not = exports.SK = exports.hole = exports.pipe = exports.untupled = exports.tupled = exports.absurd = exports.decrement = exports.increment = exports.tuple = exports.flow = exports.flip = exports.constVoid = exports.constUndefined = exports.constNull = exports.constFalse = exports.constTrue = exports.constant = exports.unsafeCoerce = exports.identity = exports.apply = exports.getRing = exports.getSemiring = exports.getMonoid = exports.getSemigroup = exports.getBooleanAlgebra = void 0;
  var getBooleanAlgebra = function(B) {
    return function() {
      return {
        meet: function(x, y) {
          return function(a) {
            return B.meet(x(a), y(a));
          };
        },
        join: function(x, y) {
          return function(a) {
            return B.join(x(a), y(a));
          };
        },
        zero: function() {
          return B.zero;
        },
        one: function() {
          return B.one;
        },
        implies: function(x, y) {
          return function(a) {
            return B.implies(x(a), y(a));
          };
        },
        not: function(x) {
          return function(a) {
            return B.not(x(a));
          };
        }
      };
    };
  };
  exports.getBooleanAlgebra = getBooleanAlgebra;
  var getSemigroup = function(S) {
    return function() {
      return {
        concat: function(f, g) {
          return function(a) {
            return S.concat(f(a), g(a));
          };
        }
      };
    };
  };
  exports.getSemigroup = getSemigroup;
  var getMonoid = function(M) {
    var getSemigroupM = (0, exports.getSemigroup)(M);
    return function() {
      return {
        concat: getSemigroupM().concat,
        empty: function() {
          return M.empty;
        }
      };
    };
  };
  exports.getMonoid = getMonoid;
  var getSemiring = function(S) {
    return {
      add: function(f, g) {
        return function(x) {
          return S.add(f(x), g(x));
        };
      },
      zero: function() {
        return S.zero;
      },
      mul: function(f, g) {
        return function(x) {
          return S.mul(f(x), g(x));
        };
      },
      one: function() {
        return S.one;
      }
    };
  };
  exports.getSemiring = getSemiring;
  var getRing = function(R) {
    var S = (0, exports.getSemiring)(R);
    return {
      add: S.add,
      mul: S.mul,
      one: S.one,
      zero: S.zero,
      sub: function(f, g) {
        return function(x) {
          return R.sub(f(x), g(x));
        };
      }
    };
  };
  exports.getRing = getRing;
  var apply = function(a) {
    return function(f) {
      return f(a);
    };
  };
  exports.apply = apply;
  function identity2(a) {
    return a;
  }
  exports.identity = identity2;
  exports.unsafeCoerce = identity2;
  function constant(a) {
    return function() {
      return a;
    };
  }
  exports.constant = constant;
  exports.constTrue = constant(true);
  exports.constFalse = constant(false);
  exports.constNull = constant(null);
  exports.constUndefined = constant(void 0);
  exports.constVoid = exports.constUndefined;
  function flip(f) {
    return function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      if (args.length > 1) {
        return f(args[1], args[0]);
      }
      return function(a) {
        return f(a)(args[0]);
      };
    };
  }
  exports.flip = flip;
  function flow(ab, bc, cd, de, ef, fg, gh, hi, ij) {
    switch (arguments.length) {
      case 1:
        return ab;
      case 2:
        return function() {
          return bc(ab.apply(this, arguments));
        };
      case 3:
        return function() {
          return cd(bc(ab.apply(this, arguments)));
        };
      case 4:
        return function() {
          return de(cd(bc(ab.apply(this, arguments))));
        };
      case 5:
        return function() {
          return ef(de(cd(bc(ab.apply(this, arguments)))));
        };
      case 6:
        return function() {
          return fg(ef(de(cd(bc(ab.apply(this, arguments))))));
        };
      case 7:
        return function() {
          return gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))));
        };
      case 8:
        return function() {
          return hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments))))))));
        };
      case 9:
        return function() {
          return ij(hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))))));
        };
    }
    return;
  }
  exports.flow = flow;
  function tuple() {
    var t = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      t[_i] = arguments[_i];
    }
    return t;
  }
  exports.tuple = tuple;
  function increment(n) {
    return n + 1;
  }
  exports.increment = increment;
  function decrement(n) {
    return n - 1;
  }
  exports.decrement = decrement;
  function absurd(_) {
    throw new Error("Called `absurd` function which should be uncallable");
  }
  exports.absurd = absurd;
  function tupled(f) {
    return function(a) {
      return f.apply(void 0, a);
    };
  }
  exports.tupled = tupled;
  function untupled(f) {
    return function() {
      var a = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        a[_i] = arguments[_i];
      }
      return f(a);
    };
  }
  exports.untupled = untupled;
  function pipe2(a, ab, bc, cd, de, ef, fg, gh, hi) {
    switch (arguments.length) {
      case 1:
        return a;
      case 2:
        return ab(a);
      case 3:
        return bc(ab(a));
      case 4:
        return cd(bc(ab(a)));
      case 5:
        return de(cd(bc(ab(a))));
      case 6:
        return ef(de(cd(bc(ab(a)))));
      case 7:
        return fg(ef(de(cd(bc(ab(a))))));
      case 8:
        return gh(fg(ef(de(cd(bc(ab(a)))))));
      case 9:
        return hi(gh(fg(ef(de(cd(bc(ab(a))))))));
      default: {
        var ret = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
          ret = arguments[i](ret);
        }
        return ret;
      }
    }
  }
  exports.pipe = pipe2;
  exports.hole = absurd;
  var SK = function(_, b) {
    return b;
  };
  exports.SK = SK;
  function not(predicate) {
    return function(a) {
      return !predicate(a);
    };
  }
  exports.not = not;
  var getEndomorphismMonoid = function() {
    return {
      concat: function(first, second) {
        return flow(first, second);
      },
      empty: identity2
    };
  };
  exports.getEndomorphismMonoid = getEndomorphismMonoid;
  var dual2 = function(arity, body) {
    var isDataFirst = typeof arity === "number" ? function(args) {
      return args.length >= arity;
    } : arity;
    return function() {
      var args = Array.from(arguments);
      if (isDataFirst(arguments)) {
        return body.apply(this, args);
      }
      return function(self) {
        return body.apply(void 0, __spreadArray2([self], args, false));
      };
    };
  };
  exports.dual = dual2;
})(_function);
let partition_by_id = (id) => partition((v) => v.id == id);
function logIfError(r) {
  const { error } = r;
  error && console.log("error from logIfError util function\n", error);
  return r;
}
async function getNotes(supabase, source_id, user_id, prevnotes = []) {
  let q = supabase.from("notes").select("*, sources (title, url)").eq("user_id", user_id);
  q = match(
    () => q,
    (id) => q.eq("source_id", id)
  )(source_id);
  const { data } = await q;
  if (data === null)
    return prevnotes;
  let get = (v, fld, missing) => _function.pipe(
    v.sources,
    fromNullable,
    chain((v2) => fromNullable(v2[fld])),
    fold(() => missing, _function.identity)
  );
  return data.map(
    (v) => {
      const title = get(v, "title", "missing Title");
      const url = get(v, "url", "");
      return { ...v, sources: { title, url } };
    }
    // pipe(
    // 	v.sources,
    // 	O.fromNullable,
    // 	O.chain(({title}) => O.fromNullable(title)),
    // 	O.fold(() => 'missing Title', identity),
    // 	(title) => ({ ...v, sources: { title } })
    // )
    // const _sources= match(sources)
    // 	.with(null, () => ({ title: 'missing Title' }))
    // 	.with({ title: null }, () => ({ title: 'missing Title' }))
    // 	.with({ title: P.select() }, (title) => ({ title }))
    // 	.exhaustive();
  );
}
let API_ADDRESS = "http://localhost:5173".replace(/\/$/, "");
let getSession = async (supabase, tokens) => {
  if (!tokens)
    return;
  const { access_token, refresh_token } = tokens;
  await supabase.auth.setSession({ access_token, refresh_token }).then(logIfError);
  const {
    data: { session }
  } = await supabase.auth.getSession().then(logIfError);
  return session;
};
async function gotoSnippet(uuid) {
  console.log("going to..", uuid);
  const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
  chrome.tabs.sendMessage(tab.id, { action: "goto", uuid });
}
export {
  API_ADDRESS as A,
  Foldable as F,
  _function as _,
  gotoSnippet as a,
  getSession as b,
  getNotes as g,
  has as h,
  identity as i,
  logIfError as l,
  map as m,
  none as n,
  partition_by_id as p,
  some as s
};
