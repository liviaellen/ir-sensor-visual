import * as y from "three";
import { Vector3 as b, Vector2 as H, Vector4 as Y, Matrix3 as J, Matrix4 as Q, Color as V, Texture as X, MathUtils as Z } from "three";
import D from "glsl-tokenizer";
import T from "glsl-token-descope";
import K from "glsl-token-string";
import A from "glsl-token-functions";
import G from "three-custom-shader-material/vanilla";
const ee = {
  normal: "normal",
  add: "add",
  subtract: "subtract",
  multiply: "multiply",
  lighten: "lighten",
  darken: "darken",
  divide: "divide",
  overlay: "overlay",
  screen: "screen",
  softlight: "softlight",
  negation: "negation",
  reflect: "reflect"
}, R = {
  perlin: "perlin",
  simplex: "simplex",
  cell: "cell",
  curl: "curl",
  white: "white"
}, k = {
  local: "local",
  world: "world",
  uv: "uv"
}, ae = {
  phong: y.MeshPhongMaterial,
  physical: y.MeshPhysicalMaterial,
  toon: y.MeshToonMaterial,
  basic: y.MeshBasicMaterial,
  lambert: y.MeshLambertMaterial,
  standard: y.MeshStandardMaterial
};
function q(r) {
  return typeof r == "string" ? new V(r).convertLinearToSRGB() : r;
}
function te(r) {
  switch (r) {
    case "alpha":
      return {
        min: 0,
        max: 1
      };
    case "scale":
      return {
        min: 0
      };
    case "map":
      return {
        image: void 0
      };
    default:
      return {};
  }
}
function ve({ color: r, alpha: a, lighting: e, name: t, ...n } = {}) {
  return [
    {
      color: r,
      alpha: a,
      lighting: e,
      name: t
    },
    n
  ];
}
function E(r) {
  return r instanceof b || r instanceof H || r instanceof Y || r instanceof J || r instanceof Q;
}
function I(r) {
  return E(r) ? r.toArray() : r instanceof V ? "#" + r.clone().convertLinearToSRGB().getHexString() : r instanceof X ? r.image.src : r;
}
class x {
  constructor(a, e, t) {
    this.uuid = Z.generateUUID().replace(/-/g, "_"), this.name = "LayerMaterial", this.mode = "normal", this.visible = !0;
    const i = Object.getOwnPropertyNames(a).filter((c) => c.startsWith("u_")).reduce((c, l) => {
      var m;
      let f = (m = Object.getOwnPropertyDescriptor(a, l)) == null ? void 0 : m.value;
      return (E(f) || f instanceof V) && (f = f.clone()), {
        ...c,
        [l.slice(1)]: f
      };
    }, {});
    for (const c in i) {
      const l = c.split("_")[1];
      (e == null ? void 0 : e[l]) !== void 0 && (i[c] = e[l]);
    }
    e && Object.keys(e).map((c) => {
      e[c] !== void 0 && (this[c] = e[c]);
    }), this.uniforms = {}, this.schema = [];
    const o = {};
    Object.keys(i).map((c) => {
      const l = c.split("_")[1];
      this.uniforms[`u_${this.uuid}_${l}`] = {
        value: q(i[c])
      }, this.schema.push({
        value: i[c],
        label: l
      }), o[l] = {
        set: (f) => {
          this.uniforms[`u_${this.uuid}_${l}`].value = q(f);
        },
        get: () => this.uniforms[`u_${this.uuid}_${l}`].value
      };
    }), e != null && e.name && (this.name = e.name), e != null && e.mode && (this.mode = e.mode), e != null && e.visible && (this.visible = e.visible), Object.defineProperties(this, o), this.vertexShader = "", this.fragmentShader = "", this.vertexVariables = "", this.fragmentVariables = "", this.onParse = t, this.buildShaders(a), this.schema.push({
      value: this.mode,
      label: "mode",
      options: Object.values(ee)
    }), this.schema.push({
      value: this.visible,
      label: "visible"
    });
  }
  buildShaders(a) {
    var f;
    const e = Object.getOwnPropertyNames(a).filter((m) => m === "fragmentShader" || m === "vertexShader").reduce(
      (m, w) => {
        var P;
        return {
          ...m,
          [w]: (P = Object.getOwnPropertyDescriptor(a, w)) == null ? void 0 : P.value
        };
      },
      {}
    ), t = {
      vert: D(e.vertexShader || ""),
      frag: D(e.fragmentShader || "")
    }, n = {
      vert: T(t.vert, this.renameTokens.bind(this)),
      frag: T(t.frag, this.renameTokens.bind(this))
    }, i = {
      vert: A(n.vert),
      frag: A(n.frag)
    }, o = {
      vert: i.vert.map((m) => m.name).indexOf("main"),
      frag: i.frag.map((m) => m.name).indexOf("main")
    }, c = {
      vert: o.vert >= 0 ? K(n.vert.slice(0, i.vert[o.vert].outer[0])) : "",
      frag: o.frag >= 0 ? K(n.frag.slice(0, i.frag[o.frag].outer[0])) : ""
    }, l = {
      vert: o.vert >= 0 ? this.getShaderFromIndex(n.vert, i.vert[o.vert].body) : "",
      frag: o.frag >= 0 ? this.getShaderFromIndex(n.frag, i.frag[o.frag].body) : ""
    };
    this.vertexShader = this.processFinal(l.vert, !0), this.fragmentShader = this.processFinal(l.frag), this.vertexVariables = c.vert, this.fragmentVariables = c.frag, (f = this.onParse) == null || f.call(this, this), this.schema = this.schema.filter((m, w) => {
      const P = m.label;
      return w === this.schema.findIndex((U) => U.label === P);
    });
  }
  renameTokens(a) {
    if (a.startsWith("u_")) {
      const e = a.slice(2);
      return `u_${this.uuid}_${e}`;
    } else if (a.startsWith("v_")) {
      const e = a.slice(2);
      return `v_${this.uuid}_${e}`;
    } else if (a.startsWith("f_")) {
      const e = a.slice(2);
      return `f_${this.uuid}_${e}`;
    } else
      return a;
  }
  processFinal(a, e) {
    const t = a.replace(/\sf_/gm, ` f_${this.uuid}_`).replace(/\(f_/gm, `(f_${this.uuid}_`), n = t.match(/^.*return.*$/gm);
    let i = t.replace(/^.*return.*$/gm, "");
    if (n != null && n[0]) {
      const o = n[0].replace("return", "").trim().replace(";", ""), c = this.getBlendMode(o, "lamina_finalColor");
      i += e ? `lamina_finalPosition = ${o};` : `lamina_finalColor = ${c};`;
    }
    return i;
  }
  getShaderFromIndex(a, e) {
    return K(a.slice(e[0], e[1]));
  }
  getBlendMode(a, e) {
    switch (this.mode) {
      default:
      case "normal":
        return `lamina_blend_alpha(${e}, ${a}, ${a}.a)`;
      case "add":
        return `lamina_blend_add(${e}, ${a}, ${a}.a)`;
      case "subtract":
        return `lamina_blend_subtract(${e}, ${a}, ${a}.a)`;
      case "multiply":
        return `lamina_blend_multiply(${e}, ${a}, ${a}.a)`;
      case "lighten":
        return `lamina_blend_lighten(${e}, ${a}, ${a}.a)`;
      case "darken":
        return `lamina_blend_darken(${e}, ${a}, ${a}.a)`;
      case "divide":
        return `lamina_blend_divide(${e}, ${a}, ${a}.a)`;
      case "overlay":
        return `lamina_blend_overlay(${e}, ${a}, ${a}.a)`;
      case "screen":
        return `lamina_blend_screen(${e}, ${a}, ${a}.a)`;
      case "softlight":
        return `lamina_blend_softlight(${e}, ${a}, ${a}.a)`;
      case "reflect":
        return `lamina_blend_reflect(${e}, ${a}, ${a}.a)`;
      case "negation":
        return `lamina_blend_negation(${e}, ${a}, ${a}.a)`;
    }
  }
  getSchema() {
    return this.schema.map(({ label: e, options: t, ...n }) => ({
      label: e,
      options: t,
      ...te(e),
      ...n,
      // @ts-ignore
      value: I(this[e])
    }));
  }
  serialize() {
    const a = this.constructor.name.split("$")[0];
    let e = Object.keys(this);
    e = e.filter(
      (i) => ![
        "uuid",
        "uniforms",
        "schema",
        "fragmentShader",
        "vertexShader",
        "fragmentVariables",
        "vertexVariables",
        "attribs",
        "events",
        "__r3f",
        "onParse"
      ].includes(i)
    );
    const t = {};
    e.forEach((i) => {
      t[i] = this[i];
    });
    const n = {};
    for (const i in this.uniforms) {
      const o = i.replace(`u_${this.uuid}_`, "");
      n[o] = I(this.uniforms[i].value);
    }
    return {
      constructor: a,
      properties: {
        ...n,
        ...t
      }
    };
  }
}
const z = class z extends x {
  constructor(a) {
    super(z, {
      name: "Color",
      ...a
    });
  }
};
z.u_color = "red", z.u_alpha = 1, z.fragmentShader = `   
    uniform vec3 u_color;
    uniform float u_alpha;

    void main() {
      return vec4(u_color, u_alpha);
    }
  `;
let S = z;
const v = class v extends x {
  constructor(a) {
    super(
      v,
      {
        name: "Depth",
        ...a
      },
      (e) => {
        e.schema.push({
          value: e.mapping,
          label: "mapping",
          options: ["vector", "world", "camera"]
        });
        const t = v.getMapping(e.uuid, e.mapping);
        e.fragmentShader = e.fragmentShader.replace("lamina_mapping_template", t);
      }
    ), this.mapping = "vector";
  }
  static getMapping(a, e) {
    switch (e) {
      default:
      case "vector":
        return `length(v_${a}_worldPosition - u_${a}_origin)`;
      case "world":
        return `length(v_${a}_position - vec3(0.))`;
      case "camera":
        return `length(v_${a}_worldPosition - cameraPosition)`;
    }
  }
};
v.u_near = 2, v.u_far = 10, v.u_origin = new b(0, 0, 0), v.u_colorA = "white", v.u_colorB = "black", v.u_alpha = 1, v.vertexShader = `
  varying vec3 v_worldPosition;
  varying vec3 v_position;

  void main() {
    v_worldPosition = (vec4(position, 1.0) * modelMatrix).xyz;
    v_position = position;
  }
  `, v.fragmentShader = `   
    uniform float u_alpha;
    uniform float u_near;
    uniform float u_far;
    uniform float u_isVector;
    uniform vec3 u_origin;
    uniform vec3 u_colorA;
    uniform vec3 u_colorB;

    varying vec3 v_worldPosition;
    varying vec3 v_position;

    void main() {
      float f_dist = lamina_mapping_template;
      float f_depth = (f_dist - u_near) / (u_far - u_near);
			vec3 f_depthColor =  mix(u_colorB, u_colorA, 1.0 - clamp(f_depth, 0., 1.));
  
  
      return vec4(f_depthColor, u_alpha);
    }
  `;
let $ = v;
const u = class u extends x {
  constructor(a) {
    super(
      u,
      {
        name: "Displace",
        ...a
      },
      (e) => {
        e.schema.push({
          value: e.type,
          label: "type",
          options: Object.values(R)
        }), e.schema.push({
          value: e.mapping,
          label: "mapping",
          options: Object.values(k)
        });
        const t = u.getNoiseFunction(e.type), n = u.getMapping(e.mapping);
        e.vertexVariables = e.vertexVariables.replace("lamina_mapping_template", n), e.vertexVariables = e.vertexVariables.replace("lamina_noise_template", t);
      }
    ), this.type = "perlin", this.mapping = "local";
  }
  static getNoiseFunction(a) {
    switch (a) {
      default:
      case "perlin":
        return "lamina_noise_perlin";
      case "simplex":
        return "lamina_noise_simplex";
      case "cell":
        return "lamina_noise_worley";
      case "white":
        return "lamina_noise_white";
      case "curl":
        return "lamina_noise_swirl";
    }
  }
  static getMapping(a) {
    switch (a) {
      default:
      case "local":
        return "p";
      case "world":
        return "(modelMatrix * vec4(p,1.0)).xyz";
      case "uv":
        return "vec3(uv, 0.)";
    }
  }
};
u.u_strength = 1, u.u_scale = 1, u.u_offset = new b(0, 0, 0), u.vertexShader = `
       
      uniform float u_strength;
      uniform float u_scale;
      uniform vec3 u_offset;

      vec3 displace(vec3 p) {
				vec3 f_position = lamina_mapping_template;
        float f_n = lamina_noise_template((f_position + u_offset) * u_scale) * u_strength;
        vec3 f_newPosition = p + (f_n * normal);

				return f_newPosition;
      }

      
			vec3 orthogonal(vec3 v) {
  		  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
  		  : vec3(0.0, -v.z, v.y));
  		}
  		vec3 recalcNormals(vec3 newPos) {
  		  float offset = 0.001;
  		  vec3 tangent = orthogonal(normal);
  		  vec3 bitangent = normalize(cross(normal, tangent));
  		  vec3 neighbour1 = position + tangent * offset;
  		  vec3 neighbour2 = position + bitangent * offset;
  		  vec3 displacedNeighbour1 = displace(neighbour1);
  		  vec3 displacedNeighbour2 = displace(neighbour2);
  		  vec3 displacedTangent = displacedNeighbour1 - newPos;
  		  vec3 displacedBitangent = displacedNeighbour2 - newPos;
  		  return normalize(cross(displacedTangent, displacedBitangent));
  		}
  
  
      void main() {
       
				vec3 f_newPosition = displace(position);
        lamina_finalNormal = recalcNormals(f_newPosition);

        return f_newPosition;
      }
    `;
let j = u;
const _ = class _ extends x {
  constructor(a) {
    super(_, {
      name: "Fresnel",
      ...a
    });
  }
};
_.u_color = "white", _.u_alpha = 1, _.u_bias = 0, _.u_intensity = 1, _.u_power = 2, _.u_factor = 1, _.vertexShader = `
    varying vec3 v_worldPosition;
    varying vec3 v_worldNormal;

    void main() {
        v_worldPosition = vec3(-viewMatrix[0][2], -viewMatrix[1][2], -viewMatrix[2][2]);
        v_worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
        
    }
  `, _.fragmentShader = `   
    uniform vec3 u_color;
    uniform float u_alpha;
    uniform float u_bias;
    uniform float u_intensity;
    uniform float u_power;
    uniform float u_factor;

    varying vec3 v_worldPosition;
    varying vec3 v_worldNormal;

    void main() {
        float f_a = (u_factor  + dot(v_worldPosition, v_worldNormal));
        float f_fresnel = u_bias + u_intensity * pow(abs(f_a), u_power);

        f_fresnel = clamp(f_fresnel, 0.0, 1.0);
        return vec4(f_fresnel * u_color, u_alpha);
    }
  `;
let M = _;
const d = class d extends x {
  constructor(a) {
    super(
      d,
      {
        name: "Gradient",
        ...a
      },
      (e) => {
        e.schema.push({
          value: e.axes,
          label: "axes",
          options: ["x", "y", "z"]
        }), e.schema.push({
          value: e.mapping,
          label: "mapping",
          options: Object.values(k)
        });
        const t = d.getMapping(e.mapping);
        e.vertexShader = e.vertexShader.replace("lamina_mapping_template", t || "local"), e.fragmentShader = e.fragmentShader.replace("axes_template", e.axes || "x");
      }
    ), this.axes = "x", this.mapping = "local";
  }
  static getMapping(a) {
    switch (a) {
      default:
      case "local":
        return "position";
      case "world":
        return "(modelMatrix * vec4(position,1.0)).xyz";
      case "uv":
        return "vec3(uv, 0.)";
    }
  }
};
d.u_colorA = "white", d.u_colorB = "black", d.u_alpha = 1, d.u_start = 1, d.u_end = -1, d.u_contrast = 1, d.vertexShader = `
		varying vec3 v_position;

		vod main() {
      v_position = lamina_mapping_template;
		}
  `, d.fragmentShader = `   
    uniform vec3 u_colorA;
    uniform vec3 u_colorB;
    uniform vec3 u_axis;
    uniform float u_alpha;
    uniform float u_start;
    uniform float u_end;
    uniform float u_contrast;

		varying vec3 v_position;

    void main() {

      float f_step = smoothstep(u_start, u_end, v_position.axes_template * u_contrast);
      vec3 f_color = mix(u_colorA, u_colorB, f_step);

      return vec4(f_color, u_alpha);
    }
  `;
let F = d;
const p = class p extends x {
  constructor(a) {
    super(p, {
      name: "Matcap",
      ...a
    });
  }
};
p.u_alpha = 1, p.u_map = void 0, p.vertexShader = `
    varying vec3 v_position;
    varying vec3 v_normal;
    
    void main() {
      v_position = normalize( vec3( modelViewMatrix * vec4( position, 1.0 ) ) );
      v_normal = normalize( normalMatrix * normal );
    }
    `, p.fragmentShader = ` 
		uniform sampler2D u_map;  
		uniform float u_alpha;  
		varying vec3 v_position;
		varying vec3 v_normal;

		
    void main() {
			vec3 f_r = reflect( v_position, v_normal );
			float f_m = 2. * sqrt( pow( f_r.x, 2. ) + pow( f_r.y, 2. ) + pow( f_r.z + 1., 2. ) );
			vec2 f_vN = f_r.xy / f_m + .5;

			vec3 f_base = texture2D(u_map, f_vN).rgb;

      return vec4(f_base, u_alpha);
    }
  `;
let C = p;
const s = class s extends x {
  constructor(a) {
    super(
      s,
      {
        name: "noise",
        ...a
      },
      (e) => {
        e.schema.push({
          value: e.type,
          label: "type",
          options: Object.values(R)
        }), e.schema.push({
          value: e.mapping,
          label: "mapping",
          options: Object.values(k)
        });
        const t = s.getNoiseFunction(e.type), n = s.getMapping(e.mapping);
        e.vertexShader = e.vertexShader.replace("lamina_mapping_template", n), e.fragmentShader = e.fragmentShader.replace("lamina_noise_template", t);
      }
    ), this.type = "perlin", this.mapping = "local";
  }
  static getNoiseFunction(a) {
    switch (a) {
      default:
      case "perlin":
        return "lamina_noise_perlin";
      case "simplex":
        return "lamina_noise_simplex";
      case "cell":
        return "lamina_noise_worley";
      case "white":
        return "lamina_noise_white";
      case "curl":
        return "lamina_noise_swirl";
    }
  }
  static getMapping(a) {
    switch (a) {
      default:
      case "local":
        return "position";
      case "world":
        return "(modelMatrix * vec4(position,1.0)).xyz";
      case "uv":
        return "vec3(uv, 0.)";
    }
  }
};
s.u_colorA = "#666666", s.u_colorB = "#666666", s.u_colorC = "#FFFFFF", s.u_colorD = "#FFFFFF", s.u_alpha = 1, s.u_scale = 1, s.u_offset = new b(0, 0, 0), s.vertexShader = `
    varying vec3 v_position;

    void main() {
        v_position = lamina_mapping_template;
    }
  `, s.fragmentShader = `   
    uniform vec3 u_colorA;
    uniform vec3 u_colorB;
    uniform vec3 u_colorC;
    uniform vec3 u_colorD;
    uniform vec3 u_offset;

    uniform float u_alpha;
    uniform float u_scale;

    varying vec3 v_position;


    void main() {
        float f_n = lamina_noise_template((v_position + u_offset) * u_scale);

        float f_step1 = 0.;
        float f_step2 = 0.2;
        float f_step3 = 0.6;
        float f_step4 = 1.;

        vec3 f_color = mix(u_colorA, u_colorB, smoothstep(f_step1, f_step2, f_n));
        f_color = mix(f_color, u_colorC, smoothstep(f_step2, f_step3, f_n));
        f_color = mix(f_color, u_colorD, smoothstep(f_step3, f_step4, f_n));

        return vec4(f_color, u_alpha);
    }
  `;
let O = s;
const h = class h extends x {
  constructor(a) {
    super(h, {
      name: "Normal",
      ...a
    });
  }
};
h.u_alpha = 1, h.u_direction = new b(1, 1, 1), h.vertexShader = `   
  varying vec3 v_normals; 

  void main() {
    v_normals = normal;
  }
`, h.fragmentShader = `   
  	uniform float u_alpha;
  	uniform vec3 u_color;
  	uniform vec3 u_direction;

		varying vec3 v_normals;

    void main() {
			vec3 f_normalColor = vec3(1.);
      f_normalColor.x = v_normals.x * u_direction.x;
      f_normalColor.y = v_normals.y * u_direction.y;
      f_normalColor.z = v_normals.z * u_direction.z;

      return vec4(f_normalColor, u_alpha);
    }
  `;
let B = h;
const g = class g extends x {
  constructor(a) {
    super(g, {
      name: "Texture",
      ...a
    });
  }
};
g.u_alpha = 1, g.u_map = void 0, g.vertexShader = `
    varying vec2 v_uv;
    
    void main() {
        v_uv = uv;
    }
    `, g.fragmentShader = ` 
		uniform sampler2D u_map;  
		uniform float u_alpha;  
		varying vec2 v_uv;

    void main() {
			vec4 f_color = texture2D(u_map, v_uv);
      return vec4(f_color.rgb, f_color.a * u_alpha);
    }
  `;
let N = g;
const ie = (
  /* glsl */
  `
vec4 lamina_blend_add(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4(min(x.xyz + y.xyz, 1.0) * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec3 lamina_blend_alpha(const in vec3 x, const in vec3 y, const in float opacity) {

	return y * opacity + x * (1.0 - opacity);

}

vec4 lamina_blend_alpha(const in vec4 x, const in vec4 y, const in float opacity) {

	float a = min(y.a, opacity);

	return vec4(lamina_blend_alpha(x.rgb, y.rgb, a), x.a);

}
vec4 lamina_blend_average(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4((x.xyz + y.xyz) * 0.5 * opacity + x.xyz * (1.0 - opacity), x.a);

}
float lamina_blend_color_burn(const in float x, const in float y) {

	return (y == 0.0) ? y : max(1.0 - (1.0 - x) / y, 0.0);

}

vec4 lamina_blend_color_burn(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = vec4(
		lamina_blend_color_burn(x.r, y.r),
		lamina_blend_color_burn(x.g, y.g),
		lamina_blend_color_burn(x.b, y.b),
		lamina_blend_color_burn(x.a, y.a)
	);

	return vec4(z.xyz * opacity + x.xyz * (1.0 - opacity), x.a);

}
float lamina_blend_color_dodge(const in float x, const in float y) {

	return (y == 1.0) ? y : min(x / (1.0 - y), 1.0);

}

vec4 lamina_blend_color_dodge(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = vec4(
		lamina_blend_color_dodge(x.r, y.r),
		lamina_blend_color_dodge(x.g, y.g),
		lamina_blend_color_dodge(x.b, y.b),
		lamina_blend_color_dodge(x.a, y.a)
	);

	return vec4(z.xyz * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_darken(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4(min(x.xyz, y.xyz) * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_difference(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4(abs(x.xyz - y.xyz) * opacity + x.xyz * (1.0 - opacity), x.a);

}
float lamina_blend_divide(const in float x, const in float y) {

	return (y > 0.0) ? min(x / y, 1.0) : 1.0;

}

vec4 lamina_blend_divide(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = vec4(
		lamina_blend_divide(x.r, y.r),
		lamina_blend_divide(x.g, y.g),
		lamina_blend_divide(x.b, y.b),
		lamina_blend_divide(x.a, y.a)
	);

	return vec4(z.xyz * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_exclusion(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4((x.xyz + y.xyz - 2.0 * x.xyz * y.xyz) * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_lighten(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4(max(x.xyz, y.xyz) * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_multiply(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4( x.xyz * y.xyz * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_negation(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4((1.0 - abs(1.0 - x.xyz - y.xyz)) * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_normal(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4(y.xyz * opacity + x.xyz * (1.0 - opacity), x.a);

}
float lamina_blend_overlay(const in float x, const in float y) {

	return (x < 0.5) ? (2.0 * x * y) : (1.0 - 2.0 * (1.0 - x) * (1.0 - y));

}

vec4 lamina_blend_overlay(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = vec4(
		lamina_blend_overlay(x.r, y.r),
		lamina_blend_overlay(x.g, y.g),
		lamina_blend_overlay(x.b, y.b),
		lamina_blend_overlay(x.a, y.a)
	);

	return vec4(z.xyz * opacity + x.xyz * (1.0 - opacity), x.a);

}
float lamina_blend_reflect(const in float x, const in float y) {

	return (y == 1.0) ? y : min(x * x / (1.0 - y), 1.0);

}

vec4 lamina_blend_reflect(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = vec4(
		lamina_blend_reflect(x.r, y.r),
		lamina_blend_reflect(x.g, y.g),
		lamina_blend_reflect(x.b, y.b),
		lamina_blend_reflect(x.a, y.a)
	);

	return vec4(z.xyz * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_screen(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4((1.0 - (1.0 - x.xyz) * (1.0 - y.xyz)) * opacity + x.xyz * (1.0 - opacity), x.a);

}
float lamina_blend_softlight(const in float x, const in float y) {

	return (y < 0.5) ?
		(2.0 * x * y + x * x * (1.0 - 2.0 * y)) :
		(sqrt(x) * (2.0 * y - 1.0) + 2.0 * x * (1.0 - y));

}

vec4 lamina_blend_softlight(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = vec4(
		lamina_blend_softlight(x.r, y.r),
		lamina_blend_softlight(x.g, y.g),
		lamina_blend_softlight(x.b, y.b),
		lamina_blend_softlight(x.a, y.a)
	);

	return vec4(z.xyz * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_subtract(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4(max(x.xyz + y.xyz - 1.0, 0.0) * opacity + x.xyz * (1.0 - opacity), x.a);

}

`
), L = (
  /* glsl */
  `

float lamina_map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float lamina_normalize(float v) { return lamina_map(v, -1.0, 1.0, 0.0, 1.0); }
`
), W = (
  /* glsl */
  `

// From: https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
// Huge thanks to the creators of these algorithms

float lamina_noise_mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 lamina_noise_mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 lamina_noise_perm(vec4 x){return lamina_noise_mod289(((x * 34.0) + 1.0) * x);}
vec4 lamina_noise_permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 lamina_noise_taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }


float lamina_noise_white(vec2 p) {
  return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) *
               (0.1 + abs(sin(p.y * 13.0 + p.x))));
}

float lamina_noise_white(vec3 p) {
  return lamina_noise_white(p.xy);
}


vec3 lamina_noise_fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float lamina_noise_perlin(vec3 P) {
  vec3 Pi0 = floor(P);        // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);        // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = lamina_noise_permute(lamina_noise_permute(ix) + iy);
  vec4 ixy0 = lamina_noise_permute(ixy + iz0);
  vec4 ixy1 = lamina_noise_permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

  vec4 norm0 = lamina_noise_taylorInvSqrt(
      vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = lamina_noise_taylorInvSqrt(
      vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = lamina_noise_fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111),
                 fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return lamina_normalize(2.2 * n_xyz);
}

float lamina_noise_simplex(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  //  x0 = x0 - 0. + 0.0 * C
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

  // Permutations
  i = mod(i, 289.0);
  vec4 p = lamina_noise_permute(lamina_noise_permute(lamina_noise_permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y +
                             vec4(0.0, i1.y, i2.y, 1.0)) +
                    i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Gradients
  // ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0 / 7.0; // N=7
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_); // mod(j,N)

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  // Normalise gradients
  vec4 norm =
      lamina_noise_taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m =
      max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return lamina_normalize(42.0 *
         dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3))));
}

vec3 lamina_noise_simplex3(vec3 x) {
  float s = lamina_noise_simplex(vec3(x));
  float s1 = lamina_noise_simplex(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
  float s2 = lamina_noise_simplex(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
  vec3 c = vec3(s, s1, s2);
  return c;
}

vec3 lamina_noise_curl(vec3 p) {
  const float e = .1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);

  vec3 p_x0 = lamina_noise_simplex3(p - dx);
  vec3 p_x1 = lamina_noise_simplex3(p + dx);
  vec3 p_y0 = lamina_noise_simplex3(p - dy);
  vec3 p_y1 = lamina_noise_simplex3(p + dy);
  vec3 p_z0 = lamina_noise_simplex3(p - dz);
  vec3 p_z1 = lamina_noise_simplex3(p + dz);

  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  const float divisor = 1.0 / (2.0 * e);
  return normalize(vec3(x, y, z) * divisor);
}

vec3 lamina_permute(vec3 x) {
  return mod((34.0 * x + 1.0) * x, 289.0);
}

vec3 lamina_dist(vec3 x, vec3 y, vec3 z,  bool manhattanDistance) {
  return manhattanDistance ?  abs(x) + abs(y) + abs(z) :  (x * x + y * y + z * z);
}

// From: https://github.com/Erkaman/glsl-worley
float lamina_noise_worley(vec3 P) {
  float jitter = 1.;
  bool manhattanDistance = false; 

  float K = 0.142857142857; // 1/7
  float Ko = 0.428571428571; // 1/2-K/2
  float  K2 = 0.020408163265306; // 1/(7*7)
  float Kz = 0.166666666667; // 1/6
  float Kzo = 0.416666666667; // 1/2-1/6*2

	vec3 Pi = mod(floor(P), 289.0);
 	vec3 Pf = fract(P) - 0.5;

	vec3 Pfx = Pf.x + vec3(1.0, 0.0, -1.0);
	vec3 Pfy = Pf.y + vec3(1.0, 0.0, -1.0);
	vec3 Pfz = Pf.z + vec3(1.0, 0.0, -1.0);

	vec3 p = lamina_permute(Pi.x + vec3(-1.0, 0.0, 1.0));
	vec3 p1 = lamina_permute(p + Pi.y - 1.0);
	vec3 p2 = lamina_permute(p + Pi.y);
	vec3 p3 = lamina_permute(p + Pi.y + 1.0);

	vec3 p11 = lamina_permute(p1 + Pi.z - 1.0);
	vec3 p12 = lamina_permute(p1 + Pi.z);
	vec3 p13 = lamina_permute(p1 + Pi.z + 1.0);

	vec3 p21 = lamina_permute(p2 + Pi.z - 1.0);
	vec3 p22 = lamina_permute(p2 + Pi.z);
	vec3 p23 = lamina_permute(p2 + Pi.z + 1.0);

	vec3 p31 = lamina_permute(p3 + Pi.z - 1.0);
	vec3 p32 = lamina_permute(p3 + Pi.z);
	vec3 p33 = lamina_permute(p3 + Pi.z + 1.0);

	vec3 ox11 = fract(p11*K) - Ko;
	vec3 oy11 = mod(floor(p11*K), 7.0)*K - Ko;
	vec3 oz11 = floor(p11*K2)*Kz - Kzo; // p11 < 289 guaranteed

	vec3 ox12 = fract(p12*K) - Ko;
	vec3 oy12 = mod(floor(p12*K), 7.0)*K - Ko;
	vec3 oz12 = floor(p12*K2)*Kz - Kzo;

	vec3 ox13 = fract(p13*K) - Ko;
	vec3 oy13 = mod(floor(p13*K), 7.0)*K - Ko;
	vec3 oz13 = floor(p13*K2)*Kz - Kzo;

	vec3 ox21 = fract(p21*K) - Ko;
	vec3 oy21 = mod(floor(p21*K), 7.0)*K - Ko;
	vec3 oz21 = floor(p21*K2)*Kz - Kzo;

	vec3 ox22 = fract(p22*K) - Ko;
	vec3 oy22 = mod(floor(p22*K), 7.0)*K - Ko;
	vec3 oz22 = floor(p22*K2)*Kz - Kzo;

	vec3 ox23 = fract(p23*K) - Ko;
	vec3 oy23 = mod(floor(p23*K), 7.0)*K - Ko;
	vec3 oz23 = floor(p23*K2)*Kz - Kzo;

	vec3 ox31 = fract(p31*K) - Ko;
	vec3 oy31 = mod(floor(p31*K), 7.0)*K - Ko;
	vec3 oz31 = floor(p31*K2)*Kz - Kzo;

	vec3 ox32 = fract(p32*K) - Ko;
	vec3 oy32 = mod(floor(p32*K), 7.0)*K - Ko;
	vec3 oz32 = floor(p32*K2)*Kz - Kzo;

	vec3 ox33 = fract(p33*K) - Ko;
	vec3 oy33 = mod(floor(p33*K), 7.0)*K - Ko;
	vec3 oz33 = floor(p33*K2)*Kz - Kzo;

	vec3 dx11 = Pfx + jitter*ox11;
	vec3 dy11 = Pfy.x + jitter*oy11;
	vec3 dz11 = Pfz.x + jitter*oz11;

	vec3 dx12 = Pfx + jitter*ox12;
	vec3 dy12 = Pfy.x + jitter*oy12;
	vec3 dz12 = Pfz.y + jitter*oz12;

	vec3 dx13 = Pfx + jitter*ox13;
	vec3 dy13 = Pfy.x + jitter*oy13;
	vec3 dz13 = Pfz.z + jitter*oz13;

	vec3 dx21 = Pfx + jitter*ox21;
	vec3 dy21 = Pfy.y + jitter*oy21;
	vec3 dz21 = Pfz.x + jitter*oz21;

	vec3 dx22 = Pfx + jitter*ox22;
	vec3 dy22 = Pfy.y + jitter*oy22;
	vec3 dz22 = Pfz.y + jitter*oz22;

	vec3 dx23 = Pfx + jitter*ox23;
	vec3 dy23 = Pfy.y + jitter*oy23;
	vec3 dz23 = Pfz.z + jitter*oz23;

	vec3 dx31 = Pfx + jitter*ox31;
	vec3 dy31 = Pfy.z + jitter*oy31;
	vec3 dz31 = Pfz.x + jitter*oz31;

	vec3 dx32 = Pfx + jitter*ox32;
	vec3 dy32 = Pfy.z + jitter*oy32;
	vec3 dz32 = Pfz.y + jitter*oz32;

	vec3 dx33 = Pfx + jitter*ox33;
	vec3 dy33 = Pfy.z + jitter*oy33;
	vec3 dz33 = Pfz.z + jitter*oz33;

	vec3 d11 = lamina_dist(dx11, dy11, dz11, manhattanDistance);
	vec3 d12 = lamina_dist(dx12, dy12, dz12, manhattanDistance);
	vec3 d13 = lamina_dist(dx13, dy13, dz13, manhattanDistance);
	vec3 d21 = lamina_dist(dx21, dy21, dz21, manhattanDistance);
	vec3 d22 = lamina_dist(dx22, dy22, dz22, manhattanDistance);
	vec3 d23 = lamina_dist(dx23, dy23, dz23, manhattanDistance);
	vec3 d31 = lamina_dist(dx31, dy31, dz31, manhattanDistance);
	vec3 d32 = lamina_dist(dx32, dy32, dz32, manhattanDistance);
	vec3 d33 = lamina_dist(dx33, dy33, dz33, manhattanDistance);

	vec3 d1a = min(d11, d12);
	d12 = max(d11, d12);
	d11 = min(d1a, d13); // Smallest now not in d12 or d13
	d13 = max(d1a, d13);
	d12 = min(d12, d13); // 2nd smallest now not in d13
	vec3 d2a = min(d21, d22);
	d22 = max(d21, d22);
	d21 = min(d2a, d23); // Smallest now not in d22 or d23
	d23 = max(d2a, d23);
	d22 = min(d22, d23); // 2nd smallest now not in d23
	vec3 d3a = min(d31, d32);
	d32 = max(d31, d32);
	d31 = min(d3a, d33); // Smallest now not in d32 or d33
	d33 = max(d3a, d33);
	d32 = min(d32, d33); // 2nd smallest now not in d33
	vec3 da = min(d11, d21);
	d21 = max(d11, d21);
	d11 = min(da, d31); // Smallest now in d11
	d31 = max(da, d31); // 2nd smallest now not in d31
	d11.xy = (d11.x < d11.y) ? d11.xy : d11.yx;
	d11.xz = (d11.x < d11.z) ? d11.xz : d11.zx; // d11.x now smallest
	d12 = min(d12, d21); // 2nd smallest now not in d21
	d12 = min(d12, d22); // nor in d22
	d12 = min(d12, d31); // nor in d31
	d12 = min(d12, d32); // nor in d32
	d11.yz = min(d11.yz,d12.xy); // nor in d12.yz
	d11.y = min(d11.y,d12.z); // Only two more to go
	d11.y = min(d11.y,d11.z); // Done! (Phew!)

  vec2 F = sqrt(d11.xy);
	return F.x; // F1, F2

}

float lamina_noise_swirl(vec3 position) {
    float scale = 0.1;
    float freq = 4. * scale;
    float t = 1.;

    vec3 pos = (position * scale) + lamina_noise_curl(position * 7. * scale);

    float worley1 = 1. - lamina_noise_worley((pos * (freq * 2.)) +  (t * 2.));
    float worley2 = 1. - lamina_noise_worley((pos * (freq * 4.)) +  (t * 4.));
    float worley3 = 1. - lamina_noise_worley((pos * (freq * 8.)) +  (t * 8.));
    float worley4 = 1. - lamina_noise_worley((pos * (freq * 16.)) +  (t * 16.));
    
    float fbm1 = worley1 * .625 + worley2 * .25 + worley3 * .125;
    float fbm2 = worley2 * .625 + worley3 * .25 + worley4 * .125;
    float fbm3 = worley3 * .75 + worley4 * .25;

    vec3 curlWorleyFbm = vec3(fbm1, fbm2, fbm3);
    float curlWorley = curlWorleyFbm.r * .625 + curlWorleyFbm.g * .25 + 
        curlWorleyFbm.b * .125;

    return curlWorley;
}
  
  
`
);
class ne extends G {
  constructor({ color: a, alpha: e, lighting: t, layers: n, name: i, ...o } = {}) {
    super({
      baseMaterial: ae[t || "basic"],
      ...o
    }), this.name = "LayerMaterial", this.layers = [], this.lighting = "basic";
    const c = a || "white", l = e ?? 1;
    this.uniforms = {
      u_lamina_color: {
        value: typeof c == "string" ? new y.Color(c).convertSRGBToLinear() : c
      },
      u_lamina_alpha: {
        value: l
      }
    }, this.layers = n || this.layers, this.lighting = t || this.lighting, this.name = i || this.name, this.refresh();
  }
  genShaders() {
    let a = "", e = "", t = "", n = "", i = {};
    return this.layers.filter((o) => o.visible).forEach((o) => {
      a += o.vertexVariables + `
`, e += o.fragmentVariables + `
`, t += o.vertexShader + `
`, n += o.fragmentShader + `
`, i = {
        ...i,
        ...o.uniforms
      };
    }), i = {
      ...i,
      ...this.uniforms
    }, {
      uniforms: i,
      vertexShader: `
        ${L}
        ${W}
        ${a}

        void main() {
          vec3 lamina_finalPosition = position;
          vec3 lamina_finalNormal = normal;

          ${t}

          csm_Position = lamina_finalPosition;
          csm_Normal = lamina_finalNormal;
        }
        `,
      fragmentShader: `
        ${L}
        ${W}
        ${ie}
        ${e}

        uniform vec3 u_lamina_color;
        uniform float u_lamina_alpha;

        void main() {
          vec4 lamina_finalColor = vec4(u_lamina_color, u_lamina_alpha);

          ${n}

          csm_DiffuseColor = lamina_finalColor;
         
        }
        `
    };
  }
  refresh() {
    const { uniforms: a, fragmentShader: e, vertexShader: t } = this.genShaders();
    super.update({ fragmentShader: e, vertexShader: t, uniforms: a });
  }
  serialize() {
    return {
      constructor: "LayerMaterial",
      properties: {
        color: this.color,
        alpha: this.alpha,
        name: this.name,
        lighting: this.lighting
      }
    };
  }
  set color(a) {
    var e, t;
    (t = (e = this.uniforms) == null ? void 0 : e.u_lamina_color) != null && t.value && (this.uniforms.u_lamina_color.value = typeof a == "string" ? new y.Color(a).convertSRGBToLinear() : a);
  }
  get color() {
    var a, e;
    return (e = (a = this.uniforms) == null ? void 0 : a.u_lamina_color) == null ? void 0 : e.value;
  }
  set alpha(a) {
    this.uniforms.u_lamina_alpha.value = a;
  }
  get alpha() {
    return this.uniforms.u_lamina_alpha.value;
  }
}
const de = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Abstract: x,
  Color: S,
  Depth: $,
  Displace: j,
  Fresnel: M,
  Gradient: F,
  LayerMaterial: ne,
  Matcap: C,
  Noise: O,
  Normal: B,
  Texture: N
}, Symbol.toStringTag, { value: "Module" }));
export {
  x as A,
  S as C,
  j as D,
  M as F,
  F as G,
  de as L,
  C as M,
  B as N,
  ae as S,
  N as T,
  ne as a,
  q as b,
  O as c,
  $ as d,
  ve as g
};
//# sourceMappingURL=vanilla-BEVDQrzM.js.map
