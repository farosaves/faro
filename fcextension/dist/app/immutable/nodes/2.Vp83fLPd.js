import { s as safe_not_equal, n as noop, o as onMount } from "../chunks/scheduler.9_m0mCEV.js";
import { S as SvelteComponent, i as init, e as empty, a as insert_hydration, f as detach, g as element, s as space, h as claim_element, j as children, y as get_svelte_dataset, c as claim_space, k as attr, z as set_input_value, x as append_hydration, A as listen, m as text, n as claim_text, o as set_data } from "../chunks/index.Iyl_OSSJ.js";
import { A as API_ADDRESS } from "../chunks/utils.LWF-TT7I.js";
function create_else_block(ctx) {
  let div9;
  let div8;
  let div7;
  let h2;
  let textContent = "Create Flashcard";
  let t1;
  let div0;
  let t2;
  let div1;
  let t3;
  let div2;
  let textContent_1 = `<label class="label"><span class="label-text">Add tags</span></label> <input type="text" placeholder="Add tags" class="input input-bordered"/>`;
  let t6;
  let div3;
  let label1;
  let textContent_2 = `<span class="label-text">Input</span>`;
  let t8;
  let input1;
  let t9;
  let div4;
  let textContent_3 = `<label class="label"><span class="label-text">Flashcard preview...</span></label> <textarea class="textarea textarea-bordered" placeholder="Flashcard preview..."></textarea>`;
  let t12;
  let div5;
  let label3;
  let textContent_4 = `<span class="label-text">Select deck...</span>`;
  let t14;
  let select;
  let option;
  let textContent_5 = "Select deck...";
  let t16;
  let div6;
  let textContent_6 = `<button class="btn btn-primary">Create</button> <button class="btn btn-neutral">Cancel</button> <button class="btn btn-error">Delete</button>`;
  let mounted;
  let dispose;
  return {
    c() {
      div9 = element("div");
      div8 = element("div");
      div7 = element("div");
      h2 = element("h2");
      h2.textContent = textContent;
      t1 = space();
      div0 = element("div");
      t2 = space();
      div1 = element("div");
      t3 = space();
      div2 = element("div");
      div2.innerHTML = textContent_1;
      t6 = space();
      div3 = element("div");
      label1 = element("label");
      label1.innerHTML = textContent_2;
      t8 = space();
      input1 = element("input");
      t9 = space();
      div4 = element("div");
      div4.innerHTML = textContent_3;
      t12 = space();
      div5 = element("div");
      label3 = element("label");
      label3.innerHTML = textContent_4;
      t14 = space();
      select = element("select");
      option = element("option");
      option.textContent = textContent_5;
      t16 = space();
      div6 = element("div");
      div6.innerHTML = textContent_6;
      this.h();
    },
    l(nodes) {
      div9 = claim_element(nodes, "DIV", { id: true, class: true });
      var div9_nodes = children(div9);
      div8 = claim_element(div9_nodes, "DIV", { class: true });
      var div8_nodes = children(div8);
      div7 = claim_element(div8_nodes, "DIV", { class: true });
      var div7_nodes = children(div7);
      h2 = claim_element(div7_nodes, "H2", { class: true, ["data-svelte-h"]: true });
      if (get_svelte_dataset(h2) !== "svelte-10aj9dm")
        h2.textContent = textContent;
      t1 = claim_space(div7_nodes);
      div0 = claim_element(div7_nodes, "DIV", { class: true, value: true });
      children(div0).forEach(detach);
      t2 = claim_space(div7_nodes);
      div1 = claim_element(div7_nodes, "DIV", { class: true, value: true });
      children(div1).forEach(detach);
      t3 = claim_space(div7_nodes);
      div2 = claim_element(div7_nodes, "DIV", { class: true, ["data-svelte-h"]: true });
      if (get_svelte_dataset(div2) !== "svelte-gdd29s")
        div2.innerHTML = textContent_1;
      t6 = claim_space(div7_nodes);
      div3 = claim_element(div7_nodes, "DIV", { class: true });
      var div3_nodes = children(div3);
      label1 = claim_element(div3_nodes, "LABEL", { class: true, ["data-svelte-h"]: true });
      if (get_svelte_dataset(label1) !== "svelte-1x9w50w")
        label1.innerHTML = textContent_2;
      t8 = claim_space(div3_nodes);
      input1 = claim_element(div3_nodes, "INPUT", {
        type: true,
        placeholder: true,
        class: true
      });
      div3_nodes.forEach(detach);
      t9 = claim_space(div7_nodes);
      div4 = claim_element(div7_nodes, "DIV", { class: true, ["data-svelte-h"]: true });
      if (get_svelte_dataset(div4) !== "svelte-1i35djv")
        div4.innerHTML = textContent_3;
      t12 = claim_space(div7_nodes);
      div5 = claim_element(div7_nodes, "DIV", { class: true });
      var div5_nodes = children(div5);
      label3 = claim_element(div5_nodes, "LABEL", { class: true, ["data-svelte-h"]: true });
      if (get_svelte_dataset(label3) !== "svelte-19zg967")
        label3.innerHTML = textContent_4;
      t14 = claim_space(div5_nodes);
      select = claim_element(div5_nodes, "SELECT", { class: true });
      var select_nodes = children(select);
      option = claim_element(select_nodes, "OPTION", { ["data-svelte-h"]: true });
      if (get_svelte_dataset(option) !== "svelte-1l7vjhm")
        option.textContent = textContent_5;
      select_nodes.forEach(detach);
      div5_nodes.forEach(detach);
      t16 = claim_space(div7_nodes);
      div6 = claim_element(div7_nodes, "DIV", { class: true, ["data-svelte-h"]: true });
      if (get_svelte_dataset(div6) !== "svelte-1ke5gd1")
        div6.innerHTML = textContent_6;
      div7_nodes.forEach(detach);
      div8_nodes.forEach(detach);
      div9_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(h2, "class", "card-title");
      attr(div0, "class", "progress progress-primary");
      attr(div0, "value", "70");
      attr(div1, "class", "mt-2 progress progress-secondary");
      attr(div1, "value", "100");
      attr(div2, "class", "form-control");
      attr(label1, "class", "label");
      attr(input1, "type", "text");
      attr(input1, "placeholder", "Highlighted text will appear here");
      attr(input1, "class", "input input-bordered");
      attr(div3, "class", "mt-2 form-control");
      attr(div4, "class", "mt-2 form-control");
      attr(label3, "class", "label");
      option.disabled = true;
      option.selected = true;
      option.__value = "Select deck...";
      set_input_value(option, option.__value);
      attr(select, "class", "select select-bordered");
      attr(div5, "class", "mt-2 form-control");
      attr(div6, "class", "justify-between mt-5 card-actions");
      attr(div7, "class", "card-body");
      attr(div8, "class", "card bordered");
      attr(div9, "id", "flashcardContent");
      attr(div9, "class", "max-w-sm p-4 mx-auto");
    },
    m(target, anchor) {
      insert_hydration(target, div9, anchor);
      append_hydration(div9, div8);
      append_hydration(div8, div7);
      append_hydration(div7, h2);
      append_hydration(div7, t1);
      append_hydration(div7, div0);
      append_hydration(div7, t2);
      append_hydration(div7, div1);
      append_hydration(div7, t3);
      append_hydration(div7, div2);
      append_hydration(div7, t6);
      append_hydration(div7, div3);
      append_hydration(div3, label1);
      append_hydration(div3, t8);
      append_hydration(div3, input1);
      set_input_value(
        input1,
        /*highlightedText*/
        ctx[2]
      );
      append_hydration(div7, t9);
      append_hydration(div7, div4);
      append_hydration(div7, t12);
      append_hydration(div7, div5);
      append_hydration(div5, label3);
      append_hydration(div5, t14);
      append_hydration(div5, select);
      append_hydration(select, option);
      append_hydration(div7, t16);
      append_hydration(div7, div6);
      if (!mounted) {
        dispose = listen(
          input1,
          "input",
          /*input1_input_handler*/
          ctx[4]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*highlightedText*/
      4 && input1.value !== /*highlightedText*/
      ctx2[2]) {
        set_input_value(
          input1,
          /*highlightedText*/
          ctx2[2]
        );
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div9);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_if_block(ctx) {
  let div2;
  let div1;
  let div0;
  let p;
  let t0;
  let t1;
  let div3;
  let textContent = `<a href="${`${API_ADDRESS}`}" target="_blank" class="w-full btn btn-primary">Log in</a>`;
  return {
    c() {
      div2 = element("div");
      div1 = element("div");
      div0 = element("div");
      p = element("p");
      t0 = text(
        /*loginStatusMessage*/
        ctx[1]
      );
      t1 = space();
      div3 = element("div");
      div3.innerHTML = textContent;
      this.h();
    },
    l(nodes) {
      div2 = claim_element(nodes, "DIV", { id: true, class: true });
      var div2_nodes = children(div2);
      div1 = claim_element(div2_nodes, "DIV", { class: true });
      var div1_nodes = children(div1);
      div0 = claim_element(div1_nodes, "DIV", { class: true });
      var div0_nodes = children(div0);
      p = claim_element(div0_nodes, "P", { id: true, class: true });
      var p_nodes = children(p);
      t0 = claim_text(
        p_nodes,
        /*loginStatusMessage*/
        ctx[1]
      );
      p_nodes.forEach(detach);
      div0_nodes.forEach(detach);
      div1_nodes.forEach(detach);
      div2_nodes.forEach(detach);
      t1 = claim_space(nodes);
      div3 = claim_element(nodes, "DIV", {
        id: true,
        class: true,
        ["data-svelte-h"]: true
      });
      if (get_svelte_dataset(div3) !== "svelte-1c2by7i")
        div3.innerHTML = textContent;
      this.h();
    },
    h() {
      attr(p, "id", "loginStatusLabel");
      attr(p, "class", "mx-auto text-base");
      attr(div0, "class", "card-body");
      attr(div1, "class", "shadow-xl card bg-base-100");
      attr(div2, "id", "loginStatus");
      attr(div2, "class", "mx-4 my-4");
      attr(div3, "id", "loginButtonContainer");
      attr(div3, "class", "max-w-sm p-4 mx-auto");
    },
    m(target, anchor) {
      insert_hydration(target, div2, anchor);
      append_hydration(div2, div1);
      append_hydration(div1, div0);
      append_hydration(div0, p);
      append_hydration(p, t0);
      insert_hydration(target, t1, anchor);
      insert_hydration(target, div3, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & /*loginStatusMessage*/
      2)
        set_data(
          t0,
          /*loginStatusMessage*/
          ctx2[1]
        );
    },
    d(detaching) {
      if (detaching) {
        detach(div2);
        detach(t1);
        detach(div3);
      }
    }
  };
}
function create_fragment(ctx) {
  let if_block_anchor;
  function select_block_type(ctx2, dirty) {
    if (!/*isLoggedIn*/
    ctx2[0])
      return create_if_block;
    return create_else_block;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    l(nodes) {
      if_block.l(nodes);
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_block.m(target, anchor);
      insert_hydration(target, if_block_anchor, anchor);
    },
    p(ctx2, [dirty]) {
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }
      if_block.d(detaching);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let isLoggedIn = false;
  let loginStatusMessage = "Please click login below to continue.";
  let highlightedText = "";
  let { data } = $$props;
  onMount(async () => {
    if (typeof window === "undefined")
      return;
    try {
      const response = await fetch(`${API_ADDRESS}/api/check-login`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" }
      });
      if (response.ok) {
        const data2 = await response.json();
        $$invalidate(0, isLoggedIn = data2.isLoggedIn);
      }
    } catch (error) {
      console.error("Error:", error);
      $$invalidate(1, loginStatusMessage = "Failed to check login status.");
    }
    try {
      const response = await fetch(`${API_ADDRESS}/api/check-login`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" }
      });
      if (response.ok) {
        const data2 = await response.json();
        $$invalidate(0, isLoggedIn = data2.isLoggedIn);
        $$invalidate(1, loginStatusMessage = isLoggedIn ? "Logged in successfully." : loginStatusMessage);
      } else {
        $$invalidate(1, loginStatusMessage = "Error checking login status.");
      }
    } catch (error) {
      console.error("Error:", error);
      $$invalidate(1, loginStatusMessage = "Failed to check login status.");
    }
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "highlightedText") {
        console.log(request.text);
        $$invalidate(2, highlightedText = request.text);
      }
    });
  });
  function input1_input_handler() {
    highlightedText = this.value;
    $$invalidate(2, highlightedText);
  }
  $$self.$$set = ($$props2) => {
    if ("data" in $$props2)
      $$invalidate(3, data = $$props2.data);
  };
  return [isLoggedIn, loginStatusMessage, highlightedText, data, input1_input_handler];
}
class Page extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { data: 3 });
  }
}
export {
  Page as component
};
