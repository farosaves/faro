var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// export let normalize = (s: string) => s.replaceAll(/[\p{P}\s]/gu, "");
// originally from shared
var elemsOfClass = function (cls) { return document.querySelectorAll(".".concat(cls)); };
var escapeRegExp = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }; // $& means the whole matched string
function desc(first) {
    return function (t1, t2) { return first(t2) - first(t1); };
}
export var gotoText = function (uuid) {
    var elems = elemsOfClass("_" + uuid);
    elems.item(0).scrollIntoView({ block: "center" });
    elems.forEach(function (elem) {
        var sc = elem.style.backgroundColor;
        elem.style.backgroundColor = "#fff200";
        setTimeout(function () {
            elem.style.backgroundColor = sc;
        }, 1000);
    });
};
// export let normalize = (s: string) => s.replaceAll(/[\s+\p{P}\s+]/gu, " ");
export var normalize = function (s) { return s || ""; };
// add this to rangy serialisation
export var reserialize = function (r) {
    return prepostfixes(normalize(r.toString()))
        .map(function (s) { return s.replaceAll("$", "\\$"); })
        .join("$");
};
export var prepostfixes = function (s, nToTake) {
    if (nToTake === void 0) { nToTake = 8; }
    var snorm = normalize(s);
    var l = snorm.length;
    return [snorm.substring(0, nToTake), snorm.substring(l - nToTake, l)];
};
export var subIdxs = function (s, l, r) {
    return s
        .replace(/(?<=type:textContent\|)\d+(?=\$)/, l.toString())
        .replace(/(?<=type:textContent\|\d+\$)\d+(?=\$)/, r.toString());
};
export var start = function (s) { var _a; return parseInt(((_a = s.match(/(?<=type:textContent\|)\d+(?=\$)/)) === null || _a === void 0 ? void 0 : _a[0].toString()) || "0"); };
export var end = function (s) { var _a; return parseInt(((_a = s.match(/(?<=type:textContent\|\d+\$)\d+(?=\$)/)) === null || _a === void 0 ? void 0 : _a[0].toString()) || "0"); };
export var extractPrePost = function (s) { var _a; return (((_a = s.match(/(?<=-[0-9a-f]{12}\$)(.|\n)*$/)) === null || _a === void 0 ? void 0 : _a[0].toString()) || "").split("$"); };
export var stripQuote = function (s) { return s.replace(/(?<=-[0-9a-f]{12}\$)(.|\n)*$/, ""); };
export var prepare2deserialize = function (textContent, s) {
    return extractPrePost(s).length == 2
        ? subIdxs.apply(void 0, __spreadArray([stripQuote(s)], adjIdxs(textContent, extractPrePost(s), start(s), end(s)), false)) : stripQuote(s);
};
export var deserialize = function (applierOptions) { return function (_a) {
    var uuid = _a[0], serialized = _a[1];
    console.log("deserializeing", uuid, serialized);
    if (!serialized)
        return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var _rangy = rangy;
    var hl = _rangy.createHighlighter();
    var app = _rangy.createClassApplier("_" + uuid, applierOptions);
    hl.addClassApplier(app);
    var prepared = prepare2deserialize(document.body.textContent || "", serialized);
    console.log("prep", prepared);
    try {
        hl.deserialize(prepared);
    }
    catch (_b) {
        return;
    }
}; };
export var adjIdxs = function (textContent, pre_post, startIdx, endIdx, nToTake) {
    if (nToTake === void 0) { nToTake = 8; }
    var pre = pre_post[0], post = pre_post[1];
    var len = endIdx - startIdx;
    var matches = function (xfix) { return Array.from(textContent.matchAll(RegExp(escapeRegExp(xfix), "gu"))); };
    var ss = matches(pre);
    var es = matches(post);
    var targetDiff = len - post.length;
    // prettier-ignore
    var aligned = function (left, right) {
        if (!left.length || !right.length)
            return [];
        var lf = left[0], lr = left.slice(1);
        var rf = right[0], rr = right.slice(1);
        var diff = rf.index - lf.index;
        if (diff / targetDiff > 1.1)
            // too far apart -> right too far -> only update left
            return aligned(lr, right);
        else if (diff / targetDiff < 0.9)
            // too close -> left too far -> only update right
            return aligned(left, rr);
        else
            return __spreadArray([[lf, rf]], aligned(lr, rr), true);
    };
    var score = function (l, r) {
        return (1 + Math.abs(r.index - l.index - targetDiff)) * Math.abs(l.index - startIdx);
    };
    var allAligned = aligned(ss, es).toSorted(desc(function (_a) {
        var l = _a[0], r = _a[1];
        return -score(l, r);
    }));
    if (allAligned.length) {
        // TODO: here I changed
        var _a = allAligned[0], l = _a[0], r = _a[1];
        return [l.index, r.index + post.length];
    }
    else if (nToTake == 0) {
        return [0, 0];
    }
    else {
        return adjIdxs(textContent, pre_post, startIdx, endIdx, nToTake - 1);
    }
};
