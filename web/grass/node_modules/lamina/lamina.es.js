import { jsx as u, jsxs as A, Fragment as G } from "react/jsx-runtime";
import { extend as D } from "@react-three/fiber";
import s, { useImperativeHandle as E, useMemo as w } from "react";
import { createRoot as B } from "react-dom/client";
import { useCreateStore as H, useControls as x, button as C, LevaPanel as U } from "leva";
import { TextureLoader as I, Color as V } from "three";
import { L as O, a as T, S as X, g as P, b as q, N as Y, D as K, T as Q, M as W, G as Z, F as k, c as p, C as ee, d as te } from "./vanilla-BEVDQrzM.js";
function N(e) {
  const t = O[e.constructor], l = new t();
  let r = "";
  return Object.entries(e.properties).forEach(([n, a]) => {
    const i = t["u_" + n] ?? l[n];
    switch (n) {
      case "name":
        a !== e.constructor && (r += ` ${n}={${JSON.stringify(a)}}`);
        break;
      case "visible":
        a || (r += ` ${n}={${JSON.stringify(a)}}`);
        break;
      default:
        a !== i && (r += ` ${n}={${JSON.stringify(a)}}`);
        break;
    }
  }), r;
}
function re(e, t) {
  return `
    <LayerMaterial${N(t)}>
      ${e.map((n) => {
    const a = N(n);
    return `<${n.constructor}${a} />`;
  }).join(`
	`)}
    </LayerMaterial>
    `;
}
function J(e) {
  const t = O[e.constructor], l = new t();
  let r = "	";
  return Object.entries(e.properties).forEach(([a, i], d) => {
    var L;
    const g = `
		`;
    if (a.includes("color")) {
      const $ = typeof i == "string" ? i : "#" + i.getHexString();
      r += `${a}: ${JSON.stringify($)},${g}`;
    } else {
      const $ = (L = t["u_" + a]) != null ? L : l[a];
      switch (a) {
        case "name":
          i !== e.constructor && (r += `${a}: ${JSON.stringify(i)},${g}`);
          break;
        case "visible":
          i || (r += `${a}:${JSON.stringify(i)},${g}`);
          break;
        default:
          i !== $ && (r += `${a}: ${JSON.stringify(i)},${g}`);
          break;
      }
    }
  }), r;
}
function ae(e, t) {
  const l = J(t), r = `${e.map((a) => `new ${a.constructor}({
      ${J(a)}
      })`).join(`,
		`)}`;
  return `
  new LayerMaterial({
    ${l}
    layers: [
      ${r}
    ]
  })`;
}
D({
  LayerMaterial: T
});
function ne({
  name: e,
  layers: t,
  store: l,
  setUpdate: r
}) {
  return x(
    e,
    () => {
      const n = {};
      return t.forEach((a, i) => {
        const d = `${a.label} ~${i}`;
        n[d] = a, n[d].onChange = () => r([`${e}.${d}`, a.label]);
      }), n;
    },
    { store: l },
    [t, e]
  ), null;
}
const de = s.forwardRef(({ children: e, ...t }, l) => {
  var j, v, M;
  const r = s.useRef(null);
  E(l, () => r.current);
  const n = H(), [a, i] = s.useState({}), [d, L] = s.useState(["", ""]), g = w(() => new I(), []);
  x(
    {
      "Copy JSX": C(() => {
        const c = r.current.layers.map((f) => f.serialize()), o = re(c, r.current.serialize());
        navigator.clipboard.writeText(o);
      }),
      "Copy JS": C(() => {
        const c = r.current.layers.map((f) => f.serialize()), o = ae(c, r.current.serialize());
        navigator.clipboard.writeText(o);
      })
    },
    { store: n }
  );
  const { Lighting: $ } = x(
    "Base",
    {
      Color: {
        value: "#" + new V(((j = r.current) == null ? void 0 : j.color) || (t == null ? void 0 : t.color) || "white").convertLinearToSRGB().getHexString(),
        onChange: (c) => {
          r.current.color = c;
        }
      },
      Alpha: {
        value: ((v = r.current) == null ? void 0 : v.alpha) || (t == null ? void 0 : t.alpha) || 1,
        min: 0,
        max: 1,
        onChange: (c) => {
          r.current.alpha = c;
        }
      },
      Lighting: {
        value: ((M = r.current) == null ? void 0 : M.lighting) || (t == null ? void 0 : t.lighting) || "basic",
        options: Object.keys(X)
      }
    },
    { store: n }
  ), [R, z] = w(() => P({ ...t, lighting: $ }), [t, $]);
  return s.useEffect(() => {
    const c = r.current.layers, o = {};
    c.forEach((f, _) => {
      f.getSchema && (o[`${f.name} ~${_}`] = f.getSchema());
    }), i(o);
  }, [e]), s.useEffect(() => {
    const o = n.getData()[d[0]];
    if (o) {
      const f = d[0].split("."), _ = parseInt(f[0].split(" ~")[1]), h = d[1], F = r.current.layers[_].uuid, b = r.current.uniforms[`u_${F}_${h}`], y = r.current.layers[_];
      h !== "map" ? (y[h] = o.value, b ? b.value = q(o.value) : (y.buildShaders(y.constructor), r.current.refresh())) : (async () => {
        try {
          if (o.value) {
            const S = await g.loadAsync(o.value);
            y[h] = S, b.value = S;
          } else
            y[h] = void 0, b.value = void 0;
        } catch (S) {
          console.error(S);
        }
      })();
    }
  }, [d]), s.useLayoutEffect(() => {
    var c;
    r.current.layers = (c = r.current.__r3f.children) == null ? void 0 : c.map((o) => o.object), r.current.refresh();
  }, [e, R]), s.useLayoutEffect(() => {
    const c = document.body.querySelector("#root"), o = document.createElement("div");
    return c && (c.appendChild(o), B(o).render(
      /* @__PURE__ */ u(
        U,
        {
          titleBar: {
            title: t.name || r.current.name
          },
          store: n
        }
      )
    )), () => {
      o.remove();
    };
  }, [t.name]), /* @__PURE__ */ A(G, { children: [
    Object.entries(a).map(([c, o], f) => /* @__PURE__ */ u(ne, { name: c, layers: o, store: n, setUpdate: L }, `${c} ~${f}`)),
    /* @__PURE__ */ u("layerMaterial", { args: [R], ref: r, ...z, children: e })
  ] });
});
D({
  LayerMaterial: T,
  Depth_: te,
  Color_: ee,
  Noise_: p,
  Fresnel_: k,
  Gradient_: Z,
  Matcap_: W,
  Texture_: Q,
  Displace_: K,
  Normal_: Y
});
const me = s.forwardRef(({ children: e, ...t }, l) => {
  const r = s.useRef(null);
  E(l, () => r.current), s.useLayoutEffect(() => {
    var i;
    r.current.layers = (i = r.current.__r3f.children) == null ? void 0 : i.map((d) => d.object), r.current.refresh();
  }, [e]);
  const [n, a] = w(() => P(t), [t]);
  return /* @__PURE__ */ u("layerMaterial", { args: [n], ref: r, ...a, children: e });
});
function m(e) {
  return [
    {
      mode: e == null ? void 0 : e.mode,
      visible: e == null ? void 0 : e.visible,
      type: e == null ? void 0 : e.type,
      mapping: e == null ? void 0 : e.mapping,
      map: e == null ? void 0 : e.map,
      axes: e == null ? void 0 : e.axes
    }
  ];
}
const ge = s.forwardRef((e, t) => /* @__PURE__ */ u("depth_", { args: m(e), ref: t, ...e })), $e = s.forwardRef((e, t) => /* @__PURE__ */ u("color_", { ref: t, args: m(e), ...e })), he = s.forwardRef((e, t) => /* @__PURE__ */ u("noise_", { ref: t, args: m(e), ...e })), ye = s.forwardRef((e, t) => /* @__PURE__ */ u("fresnel_", { ref: t, args: m(e), ...e })), Le = s.forwardRef((e, t) => /* @__PURE__ */ u("gradient_", { ref: t, args: m(e), ...e })), _e = s.forwardRef((e, t) => /* @__PURE__ */ u("matcap_", { ref: t, args: m(e), ...e })), be = s.forwardRef((e, t) => /* @__PURE__ */ u("texture_", { ref: t, args: m(e), ...e })), Se = s.forwardRef((e, t) => /* @__PURE__ */ u("displace_", { ref: t, args: m(e), ...e })), we = s.forwardRef((e, t) => /* @__PURE__ */ u("normal_", { ref: t, args: m(e), ...e }));
export {
  $e as Color,
  de as DebugLayerMaterial,
  ge as Depth,
  Se as Displace,
  ye as Fresnel,
  Le as Gradient,
  me as LayerMaterial,
  _e as Matcap,
  he as Noise,
  we as Normal,
  be as Texture
};
//# sourceMappingURL=lamina.es.js.map
