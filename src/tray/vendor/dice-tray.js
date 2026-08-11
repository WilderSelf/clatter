var rc = Object.defineProperty;
var oc = (r, e, t) => e in r ? rc(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var Yo = (r, e, t) => (oc(r, typeof e != "symbol" ? e + "" : e, t), t);
class Kt {
  constructor(e) {
    e === void 0 && (e = [0, 0, 0, 0, 0, 0, 0, 0, 0]), this.elements = e;
  }
  identity() {
    const e = this.elements;
    e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 1, e[5] = 0, e[6] = 0, e[7] = 0, e[8] = 1;
  }
  setZero() {
    const e = this.elements;
    e[0] = 0, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = 0, e[6] = 0, e[7] = 0, e[8] = 0;
  }
  setTrace(e) {
    const t = this.elements;
    t[0] = e.x, t[4] = e.y, t[8] = e.z;
  }
  getTrace(e) {
    e === void 0 && (e = new S());
    const t = this.elements;
    return e.x = t[0], e.y = t[4], e.z = t[8], e;
  }
  vmult(e, t) {
    t === void 0 && (t = new S());
    const n = this.elements, i = e.x, s = e.y, o = e.z;
    return t.x = n[0] * i + n[1] * s + n[2] * o, t.y = n[3] * i + n[4] * s + n[5] * o, t.z = n[6] * i + n[7] * s + n[8] * o, t;
  }
  smult(e) {
    for (let t = 0; t < this.elements.length; t++)
      this.elements[t] *= e;
  }
  mmult(e, t) {
    t === void 0 && (t = new Kt());
    const n = this.elements, i = e.elements, s = t.elements, o = n[0], a = n[1], l = n[2], c = n[3], h = n[4], d = n[5], u = n[6], m = n[7], g = n[8], _ = i[0], f = i[1], p = i[2], v = i[3], M = i[4], x = i[5], A = i[6], T = i[7], C = i[8];
    return s[0] = o * _ + a * v + l * A, s[1] = o * f + a * M + l * T, s[2] = o * p + a * x + l * C, s[3] = c * _ + h * v + d * A, s[4] = c * f + h * M + d * T, s[5] = c * p + h * x + d * C, s[6] = u * _ + m * v + g * A, s[7] = u * f + m * M + g * T, s[8] = u * p + m * x + g * C, t;
  }
  scale(e, t) {
    t === void 0 && (t = new Kt());
    const n = this.elements, i = t.elements;
    for (let s = 0; s !== 3; s++)
      i[3 * s + 0] = e.x * n[3 * s + 0], i[3 * s + 1] = e.y * n[3 * s + 1], i[3 * s + 2] = e.z * n[3 * s + 2];
    return t;
  }
  solve(e, t) {
    t === void 0 && (t = new S());
    const n = 3, i = 4, s = [];
    let o, a;
    for (o = 0; o < n * i; o++)
      s.push(0);
    for (o = 0; o < 3; o++)
      for (a = 0; a < 3; a++)
        s[o + i * a] = this.elements[o + 3 * a];
    s[3 + 4 * 0] = e.x, s[3 + 4 * 1] = e.y, s[3 + 4 * 2] = e.z;
    let l = 3;
    const c = l;
    let h;
    const d = 4;
    let u;
    do {
      if (o = c - l, s[o + i * o] === 0) {
        for (a = o + 1; a < c; a++)
          if (s[o + i * a] !== 0) {
            h = d;
            do
              u = d - h, s[u + i * o] += s[u + i * a];
            while (--h);
            break;
          }
      }
      if (s[o + i * o] !== 0)
        for (a = o + 1; a < c; a++) {
          const m = s[o + i * a] / s[o + i * o];
          h = d;
          do
            u = d - h, s[u + i * a] = u <= o ? 0 : s[u + i * a] - s[u + i * o] * m;
          while (--h);
        }
    } while (--l);
    if (t.z = s[2 * i + 3] / s[2 * i + 2], t.y = (s[1 * i + 3] - s[1 * i + 2] * t.z) / s[1 * i + 1], t.x = (s[0 * i + 3] - s[0 * i + 2] * t.z - s[0 * i + 1] * t.y) / s[0 * i + 0], isNaN(t.x) || isNaN(t.y) || isNaN(t.z) || t.x === 1 / 0 || t.y === 1 / 0 || t.z === 1 / 0)
      throw `Could not solve equation! Got x=[${t.toString()}], b=[${e.toString()}], A=[${this.toString()}]`;
    return t;
  }
  e(e, t, n) {
    if (n === void 0)
      return this.elements[t + 3 * e];
    this.elements[t + 3 * e] = n;
  }
  copy(e) {
    for (let t = 0; t < e.elements.length; t++)
      this.elements[t] = e.elements[t];
    return this;
  }
  toString() {
    let e = "";
    const t = ",";
    for (let n = 0; n < 9; n++)
      e += this.elements[n] + t;
    return e;
  }
  reverse(e) {
    e === void 0 && (e = new Kt());
    const t = 3, n = 6, i = ac;
    let s, o;
    for (s = 0; s < 3; s++)
      for (o = 0; o < 3; o++)
        i[s + n * o] = this.elements[s + 3 * o];
    i[3 + 6 * 0] = 1, i[3 + 6 * 1] = 0, i[3 + 6 * 2] = 0, i[4 + 6 * 0] = 0, i[4 + 6 * 1] = 1, i[4 + 6 * 2] = 0, i[5 + 6 * 0] = 0, i[5 + 6 * 1] = 0, i[5 + 6 * 2] = 1;
    let a = 3;
    const l = a;
    let c;
    const h = n;
    let d;
    do {
      if (s = l - a, i[s + n * s] === 0) {
        for (o = s + 1; o < l; o++)
          if (i[s + n * o] !== 0) {
            c = h;
            do
              d = h - c, i[d + n * s] += i[d + n * o];
            while (--c);
            break;
          }
      }
      if (i[s + n * s] !== 0)
        for (o = s + 1; o < l; o++) {
          const u = i[s + n * o] / i[s + n * s];
          c = h;
          do
            d = h - c, i[d + n * o] = d <= s ? 0 : i[d + n * o] - i[d + n * s] * u;
          while (--c);
        }
    } while (--a);
    s = 2;
    do {
      o = s - 1;
      do {
        const u = i[s + n * o] / i[s + n * s];
        c = n;
        do
          d = n - c, i[d + n * o] = i[d + n * o] - i[d + n * s] * u;
        while (--c);
      } while (o--);
    } while (--s);
    s = 2;
    do {
      const u = 1 / i[s + n * s];
      c = n;
      do
        d = n - c, i[d + n * s] = i[d + n * s] * u;
      while (--c);
    } while (s--);
    s = 2;
    do {
      o = 2;
      do {
        if (d = i[t + o + n * s], isNaN(d) || d === 1 / 0)
          throw `Could not reverse! A=[${this.toString()}]`;
        e.e(s, o, d);
      } while (o--);
    } while (s--);
    return e;
  }
  setRotationFromQuaternion(e) {
    const t = e.x, n = e.y, i = e.z, s = e.w, o = t + t, a = n + n, l = i + i, c = t * o, h = t * a, d = t * l, u = n * a, m = n * l, g = i * l, _ = s * o, f = s * a, p = s * l, v = this.elements;
    return v[3 * 0 + 0] = 1 - (u + g), v[3 * 0 + 1] = h - p, v[3 * 0 + 2] = d + f, v[3 * 1 + 0] = h + p, v[3 * 1 + 1] = 1 - (c + g), v[3 * 1 + 2] = m - _, v[3 * 2 + 0] = d - f, v[3 * 2 + 1] = m + _, v[3 * 2 + 2] = 1 - (c + u), this;
  }
  transpose(e) {
    e === void 0 && (e = new Kt());
    const t = this.elements, n = e.elements;
    let i;
    return n[0] = t[0], n[4] = t[4], n[8] = t[8], i = t[1], n[1] = t[3], n[3] = i, i = t[2], n[2] = t[6], n[6] = i, i = t[5], n[5] = t[7], n[7] = i, e;
  }
}
const ac = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
class S {
  constructor(e, t, n) {
    e === void 0 && (e = 0), t === void 0 && (t = 0), n === void 0 && (n = 0), this.x = e, this.y = t, this.z = n;
  }
  cross(e, t) {
    t === void 0 && (t = new S());
    const n = e.x, i = e.y, s = e.z, o = this.x, a = this.y, l = this.z;
    return t.x = a * s - l * i, t.y = l * n - o * s, t.z = o * i - a * n, t;
  }
  set(e, t, n) {
    return this.x = e, this.y = t, this.z = n, this;
  }
  setZero() {
    this.x = this.y = this.z = 0;
  }
  vadd(e, t) {
    if (t)
      t.x = e.x + this.x, t.y = e.y + this.y, t.z = e.z + this.z;
    else
      return new S(this.x + e.x, this.y + e.y, this.z + e.z);
  }
  vsub(e, t) {
    if (t)
      t.x = this.x - e.x, t.y = this.y - e.y, t.z = this.z - e.z;
    else
      return new S(this.x - e.x, this.y - e.y, this.z - e.z);
  }
  crossmat() {
    return new Kt([0, -this.z, this.y, this.z, 0, -this.x, -this.y, this.x, 0]);
  }
  normalize() {
    const e = this.x, t = this.y, n = this.z, i = Math.sqrt(e * e + t * t + n * n);
    if (i > 0) {
      const s = 1 / i;
      this.x *= s, this.y *= s, this.z *= s;
    } else
      this.x = 0, this.y = 0, this.z = 0;
    return i;
  }
  unit(e) {
    e === void 0 && (e = new S());
    const t = this.x, n = this.y, i = this.z;
    let s = Math.sqrt(t * t + n * n + i * i);
    return s > 0 ? (s = 1 / s, e.x = t * s, e.y = n * s, e.z = i * s) : (e.x = 1, e.y = 0, e.z = 0), e;
  }
  length() {
    const e = this.x, t = this.y, n = this.z;
    return Math.sqrt(e * e + t * t + n * n);
  }
  lengthSquared() {
    return this.dot(this);
  }
  distanceTo(e) {
    const t = this.x, n = this.y, i = this.z, s = e.x, o = e.y, a = e.z;
    return Math.sqrt((s - t) * (s - t) + (o - n) * (o - n) + (a - i) * (a - i));
  }
  distanceSquared(e) {
    const t = this.x, n = this.y, i = this.z, s = e.x, o = e.y, a = e.z;
    return (s - t) * (s - t) + (o - n) * (o - n) + (a - i) * (a - i);
  }
  scale(e, t) {
    t === void 0 && (t = new S());
    const n = this.x, i = this.y, s = this.z;
    return t.x = e * n, t.y = e * i, t.z = e * s, t;
  }
  vmul(e, t) {
    return t === void 0 && (t = new S()), t.x = e.x * this.x, t.y = e.y * this.y, t.z = e.z * this.z, t;
  }
  addScaledVector(e, t, n) {
    return n === void 0 && (n = new S()), n.x = this.x + e * t.x, n.y = this.y + e * t.y, n.z = this.z + e * t.z, n;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z;
  }
  isZero() {
    return this.x === 0 && this.y === 0 && this.z === 0;
  }
  negate(e) {
    return e === void 0 && (e = new S()), e.x = -this.x, e.y = -this.y, e.z = -this.z, e;
  }
  tangents(e, t) {
    const n = this.length();
    if (n > 0) {
      const i = lc, s = 1 / n;
      i.set(this.x * s, this.y * s, this.z * s);
      const o = cc;
      Math.abs(i.x) < 0.9 ? (o.set(1, 0, 0), i.cross(o, e)) : (o.set(0, 1, 0), i.cross(o, e)), i.cross(e, t);
    } else
      e.set(1, 0, 0), t.set(0, 1, 0);
  }
  toString() {
    return `${this.x},${this.y},${this.z}`;
  }
  toArray() {
    return [this.x, this.y, this.z];
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this.z = e.z, this;
  }
  lerp(e, t, n) {
    const i = this.x, s = this.y, o = this.z;
    n.x = i + (e.x - i) * t, n.y = s + (e.y - s) * t, n.z = o + (e.z - o) * t;
  }
  almostEquals(e, t) {
    return t === void 0 && (t = 1e-6), !(Math.abs(this.x - e.x) > t || Math.abs(this.y - e.y) > t || Math.abs(this.z - e.z) > t);
  }
  almostZero(e) {
    return e === void 0 && (e = 1e-6), !(Math.abs(this.x) > e || Math.abs(this.y) > e || Math.abs(this.z) > e);
  }
  isAntiparallelTo(e, t) {
    return this.negate(jo), jo.almostEquals(e, t);
  }
  clone() {
    return new S(this.x, this.y, this.z);
  }
}
S.ZERO = new S(0, 0, 0);
S.UNIT_X = new S(1, 0, 0);
S.UNIT_Y = new S(0, 1, 0);
S.UNIT_Z = new S(0, 0, 1);
const lc = new S(), cc = new S(), jo = new S();
class Ut {
  constructor(e) {
    e === void 0 && (e = {}), this.lowerBound = new S(), this.upperBound = new S(), e.lowerBound && this.lowerBound.copy(e.lowerBound), e.upperBound && this.upperBound.copy(e.upperBound);
  }
  setFromPoints(e, t, n, i) {
    const s = this.lowerBound, o = this.upperBound, a = n;
    s.copy(e[0]), a && a.vmult(s, s), o.copy(s);
    for (let l = 1; l < e.length; l++) {
      let c = e[l];
      a && (a.vmult(c, Ko), c = Ko), c.x > o.x && (o.x = c.x), c.x < s.x && (s.x = c.x), c.y > o.y && (o.y = c.y), c.y < s.y && (s.y = c.y), c.z > o.z && (o.z = c.z), c.z < s.z && (s.z = c.z);
    }
    return t && (t.vadd(s, s), t.vadd(o, o)), i && (s.x -= i, s.y -= i, s.z -= i, o.x += i, o.y += i, o.z += i), this;
  }
  copy(e) {
    return this.lowerBound.copy(e.lowerBound), this.upperBound.copy(e.upperBound), this;
  }
  clone() {
    return new Ut().copy(this);
  }
  extend(e) {
    this.lowerBound.x = Math.min(this.lowerBound.x, e.lowerBound.x), this.upperBound.x = Math.max(this.upperBound.x, e.upperBound.x), this.lowerBound.y = Math.min(this.lowerBound.y, e.lowerBound.y), this.upperBound.y = Math.max(this.upperBound.y, e.upperBound.y), this.lowerBound.z = Math.min(this.lowerBound.z, e.lowerBound.z), this.upperBound.z = Math.max(this.upperBound.z, e.upperBound.z);
  }
  overlaps(e) {
    const t = this.lowerBound, n = this.upperBound, i = e.lowerBound, s = e.upperBound, o = i.x <= n.x && n.x <= s.x || t.x <= s.x && s.x <= n.x, a = i.y <= n.y && n.y <= s.y || t.y <= s.y && s.y <= n.y, l = i.z <= n.z && n.z <= s.z || t.z <= s.z && s.z <= n.z;
    return o && a && l;
  }
  volume() {
    const e = this.lowerBound, t = this.upperBound;
    return (t.x - e.x) * (t.y - e.y) * (t.z - e.z);
  }
  contains(e) {
    const t = this.lowerBound, n = this.upperBound, i = e.lowerBound, s = e.upperBound;
    return t.x <= i.x && n.x >= s.x && t.y <= i.y && n.y >= s.y && t.z <= i.z && n.z >= s.z;
  }
  getCorners(e, t, n, i, s, o, a, l) {
    const c = this.lowerBound, h = this.upperBound;
    e.copy(c), t.set(h.x, c.y, c.z), n.set(h.x, h.y, c.z), i.set(c.x, h.y, h.z), s.set(h.x, c.y, h.z), o.set(c.x, h.y, c.z), a.set(c.x, c.y, h.z), l.copy(h);
  }
  toLocalFrame(e, t) {
    const n = Zo, i = n[0], s = n[1], o = n[2], a = n[3], l = n[4], c = n[5], h = n[6], d = n[7];
    this.getCorners(i, s, o, a, l, c, h, d);
    for (let u = 0; u !== 8; u++) {
      const m = n[u];
      e.pointToLocal(m, m);
    }
    return t.setFromPoints(n);
  }
  toWorldFrame(e, t) {
    const n = Zo, i = n[0], s = n[1], o = n[2], a = n[3], l = n[4], c = n[5], h = n[6], d = n[7];
    this.getCorners(i, s, o, a, l, c, h, d);
    for (let u = 0; u !== 8; u++) {
      const m = n[u];
      e.pointToWorld(m, m);
    }
    return t.setFromPoints(n);
  }
  overlapsRay(e) {
    const {
      direction: t,
      from: n
    } = e, i = 1 / t.x, s = 1 / t.y, o = 1 / t.z, a = (this.lowerBound.x - n.x) * i, l = (this.upperBound.x - n.x) * i, c = (this.lowerBound.y - n.y) * s, h = (this.upperBound.y - n.y) * s, d = (this.lowerBound.z - n.z) * o, u = (this.upperBound.z - n.z) * o, m = Math.max(Math.max(Math.min(a, l), Math.min(c, h)), Math.min(d, u)), g = Math.min(Math.min(Math.max(a, l), Math.max(c, h)), Math.max(d, u));
    return !(g < 0 || m > g);
  }
}
const Ko = new S(), Zo = [new S(), new S(), new S(), new S(), new S(), new S(), new S(), new S()];
class $o {
  constructor() {
    this.matrix = [];
  }
  get(e, t) {
    let {
      index: n
    } = e, {
      index: i
    } = t;
    if (i > n) {
      const s = i;
      i = n, n = s;
    }
    return this.matrix[(n * (n + 1) >> 1) + i - 1];
  }
  set(e, t, n) {
    let {
      index: i
    } = e, {
      index: s
    } = t;
    if (s > i) {
      const o = s;
      s = i, i = o;
    }
    this.matrix[(i * (i + 1) >> 1) + s - 1] = n ? 1 : 0;
  }
  reset() {
    for (let e = 0, t = this.matrix.length; e !== t; e++)
      this.matrix[e] = 0;
  }
  setNumObjects(e) {
    this.matrix.length = e * (e - 1) >> 1;
  }
}
class ml {
  addEventListener(e, t) {
    this._listeners === void 0 && (this._listeners = {});
    const n = this._listeners;
    return n[e] === void 0 && (n[e] = []), n[e].includes(t) || n[e].push(t), this;
  }
  hasEventListener(e, t) {
    if (this._listeners === void 0)
      return !1;
    const n = this._listeners;
    return !!(n[e] !== void 0 && n[e].includes(t));
  }
  hasAnyEventListener(e) {
    return this._listeners === void 0 ? !1 : this._listeners[e] !== void 0;
  }
  removeEventListener(e, t) {
    if (this._listeners === void 0)
      return this;
    const n = this._listeners;
    if (n[e] === void 0)
      return this;
    const i = n[e].indexOf(t);
    return i !== -1 && n[e].splice(i, 1), this;
  }
  dispatchEvent(e) {
    if (this._listeners === void 0)
      return this;
    const n = this._listeners[e.type];
    if (n !== void 0) {
      e.target = this;
      for (let i = 0, s = n.length; i < s; i++)
        n[i].call(this, e);
    }
    return this;
  }
}
class ft {
  constructor(e, t, n, i) {
    e === void 0 && (e = 0), t === void 0 && (t = 0), n === void 0 && (n = 0), i === void 0 && (i = 1), this.x = e, this.y = t, this.z = n, this.w = i;
  }
  set(e, t, n, i) {
    return this.x = e, this.y = t, this.z = n, this.w = i, this;
  }
  toString() {
    return `${this.x},${this.y},${this.z},${this.w}`;
  }
  toArray() {
    return [this.x, this.y, this.z, this.w];
  }
  setFromAxisAngle(e, t) {
    const n = Math.sin(t * 0.5);
    return this.x = e.x * n, this.y = e.y * n, this.z = e.z * n, this.w = Math.cos(t * 0.5), this;
  }
  toAxisAngle(e) {
    e === void 0 && (e = new S()), this.normalize();
    const t = 2 * Math.acos(this.w), n = Math.sqrt(1 - this.w * this.w);
    return n < 1e-3 ? (e.x = this.x, e.y = this.y, e.z = this.z) : (e.x = this.x / n, e.y = this.y / n, e.z = this.z / n), [e, t];
  }
  setFromVectors(e, t) {
    if (e.isAntiparallelTo(t)) {
      const n = hc, i = uc;
      e.tangents(n, i), this.setFromAxisAngle(n, Math.PI);
    } else {
      const n = e.cross(t);
      this.x = n.x, this.y = n.y, this.z = n.z, this.w = Math.sqrt(e.length() ** 2 * t.length() ** 2) + e.dot(t), this.normalize();
    }
    return this;
  }
  mult(e, t) {
    t === void 0 && (t = new ft());
    const n = this.x, i = this.y, s = this.z, o = this.w, a = e.x, l = e.y, c = e.z, h = e.w;
    return t.x = n * h + o * a + i * c - s * l, t.y = i * h + o * l + s * a - n * c, t.z = s * h + o * c + n * l - i * a, t.w = o * h - n * a - i * l - s * c, t;
  }
  inverse(e) {
    e === void 0 && (e = new ft());
    const t = this.x, n = this.y, i = this.z, s = this.w;
    this.conjugate(e);
    const o = 1 / (t * t + n * n + i * i + s * s);
    return e.x *= o, e.y *= o, e.z *= o, e.w *= o, e;
  }
  conjugate(e) {
    return e === void 0 && (e = new ft()), e.x = -this.x, e.y = -this.y, e.z = -this.z, e.w = this.w, e;
  }
  normalize() {
    let e = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    return e === 0 ? (this.x = 0, this.y = 0, this.z = 0, this.w = 0) : (e = 1 / e, this.x *= e, this.y *= e, this.z *= e, this.w *= e), this;
  }
  normalizeFast() {
    const e = (3 - (this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)) / 2;
    return e === 0 ? (this.x = 0, this.y = 0, this.z = 0, this.w = 0) : (this.x *= e, this.y *= e, this.z *= e, this.w *= e), this;
  }
  vmult(e, t) {
    t === void 0 && (t = new S());
    const n = e.x, i = e.y, s = e.z, o = this.x, a = this.y, l = this.z, c = this.w, h = c * n + a * s - l * i, d = c * i + l * n - o * s, u = c * s + o * i - a * n, m = -o * n - a * i - l * s;
    return t.x = h * c + m * -o + d * -l - u * -a, t.y = d * c + m * -a + u * -o - h * -l, t.z = u * c + m * -l + h * -a - d * -o, t;
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this.z = e.z, this.w = e.w, this;
  }
  toEuler(e, t) {
    t === void 0 && (t = "YZX");
    let n, i, s;
    const o = this.x, a = this.y, l = this.z, c = this.w;
    switch (t) {
      case "YZX":
        const h = o * a + l * c;
        if (h > 0.499 && (n = 2 * Math.atan2(o, c), i = Math.PI / 2, s = 0), h < -0.499 && (n = -2 * Math.atan2(o, c), i = -Math.PI / 2, s = 0), n === void 0) {
          const d = o * o, u = a * a, m = l * l;
          n = Math.atan2(2 * a * c - 2 * o * l, 1 - 2 * u - 2 * m), i = Math.asin(2 * h), s = Math.atan2(2 * o * c - 2 * a * l, 1 - 2 * d - 2 * m);
        }
        break;
      default:
        throw new Error(`Euler order ${t} not supported yet.`);
    }
    e.y = n, e.z = i, e.x = s;
  }
  setFromEuler(e, t, n, i) {
    i === void 0 && (i = "XYZ");
    const s = Math.cos(e / 2), o = Math.cos(t / 2), a = Math.cos(n / 2), l = Math.sin(e / 2), c = Math.sin(t / 2), h = Math.sin(n / 2);
    return i === "XYZ" ? (this.x = l * o * a + s * c * h, this.y = s * c * a - l * o * h, this.z = s * o * h + l * c * a, this.w = s * o * a - l * c * h) : i === "YXZ" ? (this.x = l * o * a + s * c * h, this.y = s * c * a - l * o * h, this.z = s * o * h - l * c * a, this.w = s * o * a + l * c * h) : i === "ZXY" ? (this.x = l * o * a - s * c * h, this.y = s * c * a + l * o * h, this.z = s * o * h + l * c * a, this.w = s * o * a - l * c * h) : i === "ZYX" ? (this.x = l * o * a - s * c * h, this.y = s * c * a + l * o * h, this.z = s * o * h - l * c * a, this.w = s * o * a + l * c * h) : i === "YZX" ? (this.x = l * o * a + s * c * h, this.y = s * c * a + l * o * h, this.z = s * o * h - l * c * a, this.w = s * o * a - l * c * h) : i === "XZY" && (this.x = l * o * a - s * c * h, this.y = s * c * a - l * o * h, this.z = s * o * h + l * c * a, this.w = s * o * a + l * c * h), this;
  }
  clone() {
    return new ft(this.x, this.y, this.z, this.w);
  }
  slerp(e, t, n) {
    n === void 0 && (n = new ft());
    const i = this.x, s = this.y, o = this.z, a = this.w;
    let l = e.x, c = e.y, h = e.z, d = e.w, u, m, g, _, f;
    return m = i * l + s * c + o * h + a * d, m < 0 && (m = -m, l = -l, c = -c, h = -h, d = -d), 1 - m > 1e-6 ? (u = Math.acos(m), g = Math.sin(u), _ = Math.sin((1 - t) * u) / g, f = Math.sin(t * u) / g) : (_ = 1 - t, f = t), n.x = _ * i + f * l, n.y = _ * s + f * c, n.z = _ * o + f * h, n.w = _ * a + f * d, n;
  }
  integrate(e, t, n, i) {
    i === void 0 && (i = new ft());
    const s = e.x * n.x, o = e.y * n.y, a = e.z * n.z, l = this.x, c = this.y, h = this.z, d = this.w, u = t * 0.5;
    return i.x += u * (s * d + o * h - a * c), i.y += u * (o * d + a * l - s * h), i.z += u * (a * d + s * c - o * l), i.w += u * (-s * l - o * c - a * h), i;
  }
}
const hc = new S(), uc = new S(), dc = {
  SPHERE: 1,
  PLANE: 2,
  BOX: 4,
  COMPOUND: 8,
  CONVEXPOLYHEDRON: 16,
  HEIGHTFIELD: 32,
  PARTICLE: 64,
  CYLINDER: 128,
  TRIMESH: 256
};
class me {
  constructor(e) {
    e === void 0 && (e = {}), this.id = me.idCounter++, this.type = e.type || 0, this.boundingSphereRadius = 0, this.collisionResponse = e.collisionResponse ? e.collisionResponse : !0, this.collisionFilterGroup = e.collisionFilterGroup !== void 0 ? e.collisionFilterGroup : 1, this.collisionFilterMask = e.collisionFilterMask !== void 0 ? e.collisionFilterMask : -1, this.material = e.material ? e.material : null, this.body = null;
  }
  updateBoundingSphereRadius() {
    throw `computeBoundingSphereRadius() not implemented for shape type ${this.type}`;
  }
  volume() {
    throw `volume() not implemented for shape type ${this.type}`;
  }
  calculateLocalInertia(e, t) {
    throw `calculateLocalInertia() not implemented for shape type ${this.type}`;
  }
  calculateWorldAABB(e, t, n, i) {
    throw `calculateWorldAABB() not implemented for shape type ${this.type}`;
  }
}
me.idCounter = 0;
me.types = dc;
class Ke {
  constructor(e) {
    e === void 0 && (e = {}), this.position = new S(), this.quaternion = new ft(), e.position && this.position.copy(e.position), e.quaternion && this.quaternion.copy(e.quaternion);
  }
  pointToLocal(e, t) {
    return Ke.pointToLocalFrame(this.position, this.quaternion, e, t);
  }
  pointToWorld(e, t) {
    return Ke.pointToWorldFrame(this.position, this.quaternion, e, t);
  }
  vectorToWorldFrame(e, t) {
    return t === void 0 && (t = new S()), this.quaternion.vmult(e, t), t;
  }
  static pointToLocalFrame(e, t, n, i) {
    return i === void 0 && (i = new S()), n.vsub(e, i), t.conjugate(Jo), Jo.vmult(i, i), i;
  }
  static pointToWorldFrame(e, t, n, i) {
    return i === void 0 && (i = new S()), t.vmult(n, i), i.vadd(e, i), i;
  }
  static vectorToWorldFrame(e, t, n) {
    return n === void 0 && (n = new S()), e.vmult(t, n), n;
  }
  static vectorToLocalFrame(e, t, n, i) {
    return i === void 0 && (i = new S()), t.w *= -1, t.vmult(n, i), t.w *= -1, i;
  }
}
const Jo = new ft();
class Qn extends me {
  constructor(e) {
    e === void 0 && (e = {});
    const {
      vertices: t = [],
      faces: n = [],
      normals: i = [],
      axes: s,
      boundingSphereRadius: o
    } = e;
    super({
      type: me.types.CONVEXPOLYHEDRON
    }), this.vertices = t, this.faces = n, this.faceNormals = i, this.faceNormals.length === 0 && this.computeNormals(), o ? this.boundingSphereRadius = o : this.updateBoundingSphereRadius(), this.worldVertices = [], this.worldVerticesNeedsUpdate = !0, this.worldFaceNormals = [], this.worldFaceNormalsNeedsUpdate = !0, this.uniqueAxes = s ? s.slice() : null, this.uniqueEdges = [], this.computeEdges();
  }
  computeEdges() {
    const e = this.faces, t = this.vertices, n = this.uniqueEdges;
    n.length = 0;
    const i = new S();
    for (let s = 0; s !== e.length; s++) {
      const o = e[s], a = o.length;
      for (let l = 0; l !== a; l++) {
        const c = (l + 1) % a;
        t[o[l]].vsub(t[o[c]], i), i.normalize();
        let h = !1;
        for (let d = 0; d !== n.length; d++)
          if (n[d].almostEquals(i) || n[d].almostEquals(i)) {
            h = !0;
            break;
          }
        h || n.push(i.clone());
      }
    }
  }
  computeNormals() {
    this.faceNormals.length = this.faces.length;
    for (let e = 0; e < this.faces.length; e++) {
      for (let i = 0; i < this.faces[e].length; i++)
        if (!this.vertices[this.faces[e][i]])
          throw new Error(`Vertex ${this.faces[e][i]} not found!`);
      const t = this.faceNormals[e] || new S();
      this.getFaceNormal(e, t), t.negate(t), this.faceNormals[e] = t;
      const n = this.vertices[this.faces[e][0]];
      if (t.dot(n) < 0) {
        console.error(`.faceNormals[${e}] = Vec3(${t.toString()}) looks like it points into the shape? The vertices follow. Make sure they are ordered CCW around the normal, using the right hand rule.`);
        for (let i = 0; i < this.faces[e].length; i++)
          console.warn(`.vertices[${this.faces[e][i]}] = Vec3(${this.vertices[this.faces[e][i]].toString()})`);
      }
    }
  }
  getFaceNormal(e, t) {
    const n = this.faces[e], i = this.vertices[n[0]], s = this.vertices[n[1]], o = this.vertices[n[2]];
    Qn.computeNormal(i, s, o, t);
  }
  static computeNormal(e, t, n, i) {
    const s = new S(), o = new S();
    t.vsub(e, o), n.vsub(t, s), s.cross(o, i), i.isZero() || i.normalize();
  }
  clipAgainstHull(e, t, n, i, s, o, a, l, c) {
    const h = new S();
    let d = -1, u = -Number.MAX_VALUE;
    for (let g = 0; g < n.faces.length; g++) {
      h.copy(n.faceNormals[g]), s.vmult(h, h);
      const _ = h.dot(o);
      _ > u && (u = _, d = g);
    }
    const m = [];
    for (let g = 0; g < n.faces[d].length; g++) {
      const _ = n.vertices[n.faces[d][g]], f = new S();
      f.copy(_), s.vmult(f, f), i.vadd(f, f), m.push(f);
    }
    d >= 0 && this.clipFaceAgainstHull(o, e, t, m, a, l, c);
  }
  findSeparatingAxis(e, t, n, i, s, o, a, l) {
    const c = new S(), h = new S(), d = new S(), u = new S(), m = new S(), g = new S();
    let _ = Number.MAX_VALUE;
    const f = this;
    if (f.uniqueAxes)
      for (let p = 0; p !== f.uniqueAxes.length; p++) {
        n.vmult(f.uniqueAxes[p], c);
        const v = f.testSepAxis(c, e, t, n, i, s);
        if (v === !1)
          return !1;
        v < _ && (_ = v, o.copy(c));
      }
    else {
      const p = a ? a.length : f.faces.length;
      for (let v = 0; v < p; v++) {
        const M = a ? a[v] : v;
        c.copy(f.faceNormals[M]), n.vmult(c, c);
        const x = f.testSepAxis(c, e, t, n, i, s);
        if (x === !1)
          return !1;
        x < _ && (_ = x, o.copy(c));
      }
    }
    if (e.uniqueAxes)
      for (let p = 0; p !== e.uniqueAxes.length; p++) {
        s.vmult(e.uniqueAxes[p], h);
        const v = f.testSepAxis(h, e, t, n, i, s);
        if (v === !1)
          return !1;
        v < _ && (_ = v, o.copy(h));
      }
    else {
      const p = l ? l.length : e.faces.length;
      for (let v = 0; v < p; v++) {
        const M = l ? l[v] : v;
        h.copy(e.faceNormals[M]), s.vmult(h, h);
        const x = f.testSepAxis(h, e, t, n, i, s);
        if (x === !1)
          return !1;
        x < _ && (_ = x, o.copy(h));
      }
    }
    for (let p = 0; p !== f.uniqueEdges.length; p++) {
      n.vmult(f.uniqueEdges[p], u);
      for (let v = 0; v !== e.uniqueEdges.length; v++)
        if (s.vmult(e.uniqueEdges[v], m), u.cross(m, g), !g.almostZero()) {
          g.normalize();
          const M = f.testSepAxis(g, e, t, n, i, s);
          if (M === !1)
            return !1;
          M < _ && (_ = M, o.copy(g));
        }
    }
    return i.vsub(t, d), d.dot(o) > 0 && o.negate(o), !0;
  }
  testSepAxis(e, t, n, i, s, o) {
    const a = this;
    Qn.project(a, e, n, i, Ks), Qn.project(t, e, s, o, Zs);
    const l = Ks[0], c = Ks[1], h = Zs[0], d = Zs[1];
    if (l < d || h < c)
      return !1;
    const u = l - d, m = h - c;
    return u < m ? u : m;
  }
  calculateLocalInertia(e, t) {
    const n = new S(), i = new S();
    this.computeLocalAABB(i, n);
    const s = n.x - i.x, o = n.y - i.y, a = n.z - i.z;
    t.x = 1 / 12 * e * (2 * o * 2 * o + 2 * a * 2 * a), t.y = 1 / 12 * e * (2 * s * 2 * s + 2 * a * 2 * a), t.z = 1 / 12 * e * (2 * o * 2 * o + 2 * s * 2 * s);
  }
  getPlaneConstantOfFace(e) {
    const t = this.faces[e], n = this.faceNormals[e], i = this.vertices[t[0]];
    return -n.dot(i);
  }
  clipFaceAgainstHull(e, t, n, i, s, o, a) {
    const l = new S(), c = new S(), h = new S(), d = new S(), u = new S(), m = new S(), g = new S(), _ = new S(), f = this, p = [], v = i, M = p;
    let x = -1, A = Number.MAX_VALUE;
    for (let y = 0; y < f.faces.length; y++) {
      l.copy(f.faceNormals[y]), n.vmult(l, l);
      const P = l.dot(e);
      P < A && (A = P, x = y);
    }
    if (x < 0)
      return;
    const T = f.faces[x];
    T.connectedFaces = [];
    for (let y = 0; y < f.faces.length; y++)
      for (let P = 0; P < f.faces[y].length; P++)
        T.indexOf(f.faces[y][P]) !== -1 && y !== x && T.connectedFaces.indexOf(y) === -1 && T.connectedFaces.push(y);
    const C = T.length;
    for (let y = 0; y < C; y++) {
      const P = f.vertices[T[y]], B = f.vertices[T[(y + 1) % C]];
      P.vsub(B, c), h.copy(c), n.vmult(h, h), t.vadd(h, h), d.copy(this.faceNormals[x]), n.vmult(d, d), t.vadd(d, d), h.cross(d, u), u.negate(u), m.copy(P), n.vmult(m, m), t.vadd(m, m);
      const L = T.connectedFaces[y];
      g.copy(this.faceNormals[L]);
      const U = this.getPlaneConstantOfFace(L);
      _.copy(g), n.vmult(_, _);
      const O = U - _.dot(t);
      for (this.clipFaceAgainstPlane(v, M, _, O); v.length; )
        v.shift();
      for (; M.length; )
        v.push(M.shift());
    }
    g.copy(this.faceNormals[x]);
    const D = this.getPlaneConstantOfFace(x);
    _.copy(g), n.vmult(_, _);
    const b = D - _.dot(t);
    for (let y = 0; y < v.length; y++) {
      let P = _.dot(v[y]) + b;
      if (P <= s && (console.log(`clamped: depth=${P} to minDist=${s}`), P = s), P <= o) {
        const B = v[y];
        if (P <= 1e-6) {
          const L = {
            point: B,
            normal: _,
            depth: P
          };
          a.push(L);
        }
      }
    }
  }
  clipFaceAgainstPlane(e, t, n, i) {
    let s, o;
    const a = e.length;
    if (a < 2)
      return t;
    let l = e[e.length - 1], c = e[0];
    s = n.dot(l) + i;
    for (let h = 0; h < a; h++) {
      if (c = e[h], o = n.dot(c) + i, s < 0)
        if (o < 0) {
          const d = new S();
          d.copy(c), t.push(d);
        } else {
          const d = new S();
          l.lerp(c, s / (s - o), d), t.push(d);
        }
      else if (o < 0) {
        const d = new S();
        l.lerp(c, s / (s - o), d), t.push(d), t.push(c);
      }
      l = c, s = o;
    }
    return t;
  }
  computeWorldVertices(e, t) {
    for (; this.worldVertices.length < this.vertices.length; )
      this.worldVertices.push(new S());
    const n = this.vertices, i = this.worldVertices;
    for (let s = 0; s !== this.vertices.length; s++)
      t.vmult(n[s], i[s]), e.vadd(i[s], i[s]);
    this.worldVerticesNeedsUpdate = !1;
  }
  computeLocalAABB(e, t) {
    const n = this.vertices;
    e.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE), t.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
    for (let i = 0; i < this.vertices.length; i++) {
      const s = n[i];
      s.x < e.x ? e.x = s.x : s.x > t.x && (t.x = s.x), s.y < e.y ? e.y = s.y : s.y > t.y && (t.y = s.y), s.z < e.z ? e.z = s.z : s.z > t.z && (t.z = s.z);
    }
  }
  computeWorldFaceNormals(e) {
    const t = this.faceNormals.length;
    for (; this.worldFaceNormals.length < t; )
      this.worldFaceNormals.push(new S());
    const n = this.faceNormals, i = this.worldFaceNormals;
    for (let s = 0; s !== t; s++)
      e.vmult(n[s], i[s]);
    this.worldFaceNormalsNeedsUpdate = !1;
  }
  updateBoundingSphereRadius() {
    let e = 0;
    const t = this.vertices;
    for (let n = 0; n !== t.length; n++) {
      const i = t[n].lengthSquared();
      i > e && (e = i);
    }
    this.boundingSphereRadius = Math.sqrt(e);
  }
  calculateWorldAABB(e, t, n, i) {
    const s = this.vertices;
    let o, a, l, c, h, d, u = new S();
    for (let m = 0; m < s.length; m++) {
      u.copy(s[m]), t.vmult(u, u), e.vadd(u, u);
      const g = u;
      (o === void 0 || g.x < o) && (o = g.x), (c === void 0 || g.x > c) && (c = g.x), (a === void 0 || g.y < a) && (a = g.y), (h === void 0 || g.y > h) && (h = g.y), (l === void 0 || g.z < l) && (l = g.z), (d === void 0 || g.z > d) && (d = g.z);
    }
    n.set(o, a, l), i.set(c, h, d);
  }
  volume() {
    return 4 * Math.PI * this.boundingSphereRadius / 3;
  }
  getAveragePointLocal(e) {
    e === void 0 && (e = new S());
    const t = this.vertices;
    for (let n = 0; n < t.length; n++)
      e.vadd(t[n], e);
    return e.scale(1 / t.length, e), e;
  }
  transformAllPoints(e, t) {
    const n = this.vertices.length, i = this.vertices;
    if (t) {
      for (let s = 0; s < n; s++) {
        const o = i[s];
        t.vmult(o, o);
      }
      for (let s = 0; s < this.faceNormals.length; s++) {
        const o = this.faceNormals[s];
        t.vmult(o, o);
      }
    }
    if (e)
      for (let s = 0; s < n; s++) {
        const o = i[s];
        o.vadd(e, o);
      }
  }
  pointIsInside(e) {
    const t = this.vertices, n = this.faces, i = this.faceNormals, s = null, o = new S();
    this.getAveragePointLocal(o);
    for (let a = 0; a < this.faces.length; a++) {
      let l = i[a];
      const c = t[n[a][0]], h = new S();
      e.vsub(c, h);
      const d = l.dot(h), u = new S();
      o.vsub(c, u);
      const m = l.dot(u);
      if (d < 0 && m > 0 || d > 0 && m < 0)
        return !1;
    }
    return s ? 1 : -1;
  }
  static project(e, t, n, i, s) {
    const o = e.vertices.length, a = fc;
    let l = 0, c = 0;
    const h = pc, d = e.vertices;
    h.setZero(), Ke.vectorToLocalFrame(n, i, t, a), Ke.pointToLocalFrame(n, i, h, h);
    const u = h.dot(a);
    c = l = d[0].dot(a);
    for (let m = 1; m < o; m++) {
      const g = d[m].dot(a);
      g > l && (l = g), g < c && (c = g);
    }
    if (c -= u, l -= u, c > l) {
      const m = c;
      c = l, l = m;
    }
    s[0] = l, s[1] = c;
  }
}
const Ks = [], Zs = [];
new S();
const fc = new S(), pc = new S();
class So extends me {
  constructor(e) {
    super({
      type: me.types.BOX
    }), this.halfExtents = e, this.convexPolyhedronRepresentation = null, this.updateConvexPolyhedronRepresentation(), this.updateBoundingSphereRadius();
  }
  updateConvexPolyhedronRepresentation() {
    const e = this.halfExtents.x, t = this.halfExtents.y, n = this.halfExtents.z, i = S, s = [new i(-e, -t, -n), new i(e, -t, -n), new i(e, t, -n), new i(-e, t, -n), new i(-e, -t, n), new i(e, -t, n), new i(e, t, n), new i(-e, t, n)], o = [
      [3, 2, 1, 0],
      [4, 5, 6, 7],
      [5, 4, 0, 1],
      [2, 3, 7, 6],
      [0, 4, 7, 3],
      [1, 2, 6, 5]
    ], a = [new i(0, 0, 1), new i(0, 1, 0), new i(1, 0, 0)], l = new Qn({
      vertices: s,
      faces: o,
      axes: a
    });
    this.convexPolyhedronRepresentation = l, l.material = this.material;
  }
  calculateLocalInertia(e, t) {
    return t === void 0 && (t = new S()), So.calculateInertia(this.halfExtents, e, t), t;
  }
  static calculateInertia(e, t, n) {
    const i = e;
    n.x = 1 / 12 * t * (2 * i.y * 2 * i.y + 2 * i.z * 2 * i.z), n.y = 1 / 12 * t * (2 * i.x * 2 * i.x + 2 * i.z * 2 * i.z), n.z = 1 / 12 * t * (2 * i.y * 2 * i.y + 2 * i.x * 2 * i.x);
  }
  getSideNormals(e, t) {
    const n = e, i = this.halfExtents;
    if (n[0].set(i.x, 0, 0), n[1].set(0, i.y, 0), n[2].set(0, 0, i.z), n[3].set(-i.x, 0, 0), n[4].set(0, -i.y, 0), n[5].set(0, 0, -i.z), t !== void 0)
      for (let s = 0; s !== n.length; s++)
        t.vmult(n[s], n[s]);
    return n;
  }
  volume() {
    return 8 * this.halfExtents.x * this.halfExtents.y * this.halfExtents.z;
  }
  updateBoundingSphereRadius() {
    this.boundingSphereRadius = this.halfExtents.length();
  }
  forEachWorldCorner(e, t, n) {
    const i = this.halfExtents, s = [[i.x, i.y, i.z], [-i.x, i.y, i.z], [-i.x, -i.y, i.z], [-i.x, -i.y, -i.z], [i.x, -i.y, -i.z], [i.x, i.y, -i.z], [-i.x, i.y, -i.z], [i.x, -i.y, i.z]];
    for (let o = 0; o < s.length; o++)
      wn.set(s[o][0], s[o][1], s[o][2]), t.vmult(wn, wn), e.vadd(wn, wn), n(wn.x, wn.y, wn.z);
  }
  calculateWorldAABB(e, t, n, i) {
    const s = this.halfExtents;
    en[0].set(s.x, s.y, s.z), en[1].set(-s.x, s.y, s.z), en[2].set(-s.x, -s.y, s.z), en[3].set(-s.x, -s.y, -s.z), en[4].set(s.x, -s.y, -s.z), en[5].set(s.x, s.y, -s.z), en[6].set(-s.x, s.y, -s.z), en[7].set(s.x, -s.y, s.z);
    const o = en[0];
    t.vmult(o, o), e.vadd(o, o), i.copy(o), n.copy(o);
    for (let a = 1; a < 8; a++) {
      const l = en[a];
      t.vmult(l, l), e.vadd(l, l);
      const c = l.x, h = l.y, d = l.z;
      c > i.x && (i.x = c), h > i.y && (i.y = h), d > i.z && (i.z = d), c < n.x && (n.x = c), h < n.y && (n.y = h), d < n.z && (n.z = d);
    }
  }
}
const wn = new S(), en = [new S(), new S(), new S(), new S(), new S(), new S(), new S(), new S()], Eo = {
  DYNAMIC: 1,
  STATIC: 2,
  KINEMATIC: 4
}, bo = {
  AWAKE: 0,
  SLEEPY: 1,
  SLEEPING: 2
};
class oe extends ml {
  constructor(e) {
    e === void 0 && (e = {}), super(), this.id = oe.idCounter++, this.index = -1, this.world = null, this.vlambda = new S(), this.collisionFilterGroup = typeof e.collisionFilterGroup == "number" ? e.collisionFilterGroup : 1, this.collisionFilterMask = typeof e.collisionFilterMask == "number" ? e.collisionFilterMask : -1, this.collisionResponse = typeof e.collisionResponse == "boolean" ? e.collisionResponse : !0, this.position = new S(), this.previousPosition = new S(), this.interpolatedPosition = new S(), this.initPosition = new S(), e.position && (this.position.copy(e.position), this.previousPosition.copy(e.position), this.interpolatedPosition.copy(e.position), this.initPosition.copy(e.position)), this.velocity = new S(), e.velocity && this.velocity.copy(e.velocity), this.initVelocity = new S(), this.force = new S();
    const t = typeof e.mass == "number" ? e.mass : 0;
    this.mass = t, this.invMass = t > 0 ? 1 / t : 0, this.material = e.material || null, this.linearDamping = typeof e.linearDamping == "number" ? e.linearDamping : 0.01, this.type = t <= 0 ? oe.STATIC : oe.DYNAMIC, typeof e.type == typeof oe.STATIC && (this.type = e.type), this.allowSleep = typeof e.allowSleep < "u" ? e.allowSleep : !0, this.sleepState = oe.AWAKE, this.sleepSpeedLimit = typeof e.sleepSpeedLimit < "u" ? e.sleepSpeedLimit : 0.1, this.sleepTimeLimit = typeof e.sleepTimeLimit < "u" ? e.sleepTimeLimit : 1, this.timeLastSleepy = 0, this.wakeUpAfterNarrowphase = !1, this.torque = new S(), this.quaternion = new ft(), this.initQuaternion = new ft(), this.previousQuaternion = new ft(), this.interpolatedQuaternion = new ft(), e.quaternion && (this.quaternion.copy(e.quaternion), this.initQuaternion.copy(e.quaternion), this.previousQuaternion.copy(e.quaternion), this.interpolatedQuaternion.copy(e.quaternion)), this.angularVelocity = new S(), e.angularVelocity && this.angularVelocity.copy(e.angularVelocity), this.initAngularVelocity = new S(), this.shapes = [], this.shapeOffsets = [], this.shapeOrientations = [], this.inertia = new S(), this.invInertia = new S(), this.invInertiaWorld = new Kt(), this.invMassSolve = 0, this.invInertiaSolve = new S(), this.invInertiaWorldSolve = new Kt(), this.fixedRotation = typeof e.fixedRotation < "u" ? e.fixedRotation : !1, this.angularDamping = typeof e.angularDamping < "u" ? e.angularDamping : 0.01, this.linearFactor = new S(1, 1, 1), e.linearFactor && this.linearFactor.copy(e.linearFactor), this.angularFactor = new S(1, 1, 1), e.angularFactor && this.angularFactor.copy(e.angularFactor), this.aabb = new Ut(), this.aabbNeedsUpdate = !0, this.boundingRadius = 0, this.wlambda = new S(), this.isTrigger = Boolean(e.isTrigger), e.shape && this.addShape(e.shape), this.updateMassProperties();
  }
  wakeUp() {
    const e = this.sleepState;
    this.sleepState = oe.AWAKE, this.wakeUpAfterNarrowphase = !1, e === oe.SLEEPING && this.dispatchEvent(oe.wakeupEvent);
  }
  sleep() {
    this.sleepState = oe.SLEEPING, this.velocity.set(0, 0, 0), this.angularVelocity.set(0, 0, 0), this.wakeUpAfterNarrowphase = !1;
  }
  sleepTick(e) {
    if (this.allowSleep) {
      const t = this.sleepState, n = this.velocity.lengthSquared() + this.angularVelocity.lengthSquared(), i = this.sleepSpeedLimit ** 2;
      t === oe.AWAKE && n < i ? (this.sleepState = oe.SLEEPY, this.timeLastSleepy = e, this.dispatchEvent(oe.sleepyEvent)) : t === oe.SLEEPY && n > i ? this.wakeUp() : t === oe.SLEEPY && e - this.timeLastSleepy > this.sleepTimeLimit && (this.sleep(), this.dispatchEvent(oe.sleepEvent));
    }
  }
  updateSolveMassProperties() {
    this.sleepState === oe.SLEEPING || this.type === oe.KINEMATIC ? (this.invMassSolve = 0, this.invInertiaSolve.setZero(), this.invInertiaWorldSolve.setZero()) : (this.invMassSolve = this.invMass, this.invInertiaSolve.copy(this.invInertia), this.invInertiaWorldSolve.copy(this.invInertiaWorld));
  }
  pointToLocalFrame(e, t) {
    return t === void 0 && (t = new S()), e.vsub(this.position, t), this.quaternion.conjugate().vmult(t, t), t;
  }
  vectorToLocalFrame(e, t) {
    return t === void 0 && (t = new S()), this.quaternion.conjugate().vmult(e, t), t;
  }
  pointToWorldFrame(e, t) {
    return t === void 0 && (t = new S()), this.quaternion.vmult(e, t), t.vadd(this.position, t), t;
  }
  vectorToWorldFrame(e, t) {
    return t === void 0 && (t = new S()), this.quaternion.vmult(e, t), t;
  }
  addShape(e, t, n) {
    const i = new S(), s = new ft();
    return t && i.copy(t), n && s.copy(n), this.shapes.push(e), this.shapeOffsets.push(i), this.shapeOrientations.push(s), this.updateMassProperties(), this.updateBoundingRadius(), this.aabbNeedsUpdate = !0, e.body = this, this;
  }
  removeShape(e) {
    const t = this.shapes.indexOf(e);
    return t === -1 ? (console.warn("Shape does not belong to the body"), this) : (this.shapes.splice(t, 1), this.shapeOffsets.splice(t, 1), this.shapeOrientations.splice(t, 1), this.updateMassProperties(), this.updateBoundingRadius(), this.aabbNeedsUpdate = !0, e.body = null, this);
  }
  updateBoundingRadius() {
    const e = this.shapes, t = this.shapeOffsets, n = e.length;
    let i = 0;
    for (let s = 0; s !== n; s++) {
      const o = e[s];
      o.updateBoundingSphereRadius();
      const a = t[s].length(), l = o.boundingSphereRadius;
      a + l > i && (i = a + l);
    }
    this.boundingRadius = i;
  }
  updateAABB() {
    const e = this.shapes, t = this.shapeOffsets, n = this.shapeOrientations, i = e.length, s = mc, o = gc, a = this.quaternion, l = this.aabb, c = _c;
    for (let h = 0; h !== i; h++) {
      const d = e[h];
      a.vmult(t[h], s), s.vadd(this.position, s), a.mult(n[h], o), d.calculateWorldAABB(s, o, c.lowerBound, c.upperBound), h === 0 ? l.copy(c) : l.extend(c);
    }
    this.aabbNeedsUpdate = !1;
  }
  updateInertiaWorld(e) {
    const t = this.invInertia;
    if (!(t.x === t.y && t.y === t.z && !e)) {
      const n = vc, i = xc;
      n.setRotationFromQuaternion(this.quaternion), n.transpose(i), n.scale(t, n), n.mmult(i, this.invInertiaWorld);
    }
  }
  applyForce(e, t) {
    if (t === void 0 && (t = new S()), this.type !== oe.DYNAMIC)
      return;
    this.sleepState === oe.SLEEPING && this.wakeUp();
    const n = Mc;
    t.cross(e, n), this.force.vadd(e, this.force), this.torque.vadd(n, this.torque);
  }
  applyLocalForce(e, t) {
    if (t === void 0 && (t = new S()), this.type !== oe.DYNAMIC)
      return;
    const n = Sc, i = Ec;
    this.vectorToWorldFrame(e, n), this.vectorToWorldFrame(t, i), this.applyForce(n, i);
  }
  applyTorque(e) {
    this.type === oe.DYNAMIC && (this.sleepState === oe.SLEEPING && this.wakeUp(), this.torque.vadd(e, this.torque));
  }
  applyImpulse(e, t) {
    if (t === void 0 && (t = new S()), this.type !== oe.DYNAMIC)
      return;
    this.sleepState === oe.SLEEPING && this.wakeUp();
    const n = t, i = bc;
    i.copy(e), i.scale(this.invMass, i), this.velocity.vadd(i, this.velocity);
    const s = wc;
    n.cross(e, s), this.invInertiaWorld.vmult(s, s), this.angularVelocity.vadd(s, this.angularVelocity);
  }
  applyLocalImpulse(e, t) {
    if (t === void 0 && (t = new S()), this.type !== oe.DYNAMIC)
      return;
    const n = Tc, i = Ac;
    this.vectorToWorldFrame(e, n), this.vectorToWorldFrame(t, i), this.applyImpulse(n, i);
  }
  updateMassProperties() {
    const e = Cc;
    this.invMass = this.mass > 0 ? 1 / this.mass : 0;
    const t = this.inertia, n = this.fixedRotation;
    this.updateAABB(), e.set((this.aabb.upperBound.x - this.aabb.lowerBound.x) / 2, (this.aabb.upperBound.y - this.aabb.lowerBound.y) / 2, (this.aabb.upperBound.z - this.aabb.lowerBound.z) / 2), So.calculateInertia(e, this.mass, t), this.invInertia.set(t.x > 0 && !n ? 1 / t.x : 0, t.y > 0 && !n ? 1 / t.y : 0, t.z > 0 && !n ? 1 / t.z : 0), this.updateInertiaWorld(!0);
  }
  getVelocityAtWorldPoint(e, t) {
    const n = new S();
    return e.vsub(this.position, n), this.angularVelocity.cross(n, t), this.velocity.vadd(t, t), t;
  }
  integrate(e, t, n) {
    if (this.previousPosition.copy(this.position), this.previousQuaternion.copy(this.quaternion), !(this.type === oe.DYNAMIC || this.type === oe.KINEMATIC) || this.sleepState === oe.SLEEPING)
      return;
    const i = this.velocity, s = this.angularVelocity, o = this.position, a = this.force, l = this.torque, c = this.quaternion, h = this.invMass, d = this.invInertiaWorld, u = this.linearFactor, m = h * e;
    i.x += a.x * m * u.x, i.y += a.y * m * u.y, i.z += a.z * m * u.z;
    const g = d.elements, _ = this.angularFactor, f = l.x * _.x, p = l.y * _.y, v = l.z * _.z;
    s.x += e * (g[0] * f + g[1] * p + g[2] * v), s.y += e * (g[3] * f + g[4] * p + g[5] * v), s.z += e * (g[6] * f + g[7] * p + g[8] * v), o.x += i.x * e, o.y += i.y * e, o.z += i.z * e, c.integrate(this.angularVelocity, e, this.angularFactor, c), t && (n ? c.normalizeFast() : c.normalize()), this.aabbNeedsUpdate = !0, this.updateInertiaWorld();
  }
}
oe.idCounter = 0;
oe.COLLIDE_EVENT_NAME = "collide";
oe.DYNAMIC = Eo.DYNAMIC;
oe.STATIC = Eo.STATIC;
oe.KINEMATIC = Eo.KINEMATIC;
oe.AWAKE = bo.AWAKE;
oe.SLEEPY = bo.SLEEPY;
oe.SLEEPING = bo.SLEEPING;
oe.wakeupEvent = {
  type: "wakeup"
};
oe.sleepyEvent = {
  type: "sleepy"
};
oe.sleepEvent = {
  type: "sleep"
};
const mc = new S(), gc = new ft(), _c = new Ut(), vc = new Kt(), xc = new Kt(), yc = new Kt(), Mc = new S(), Sc = new S(), Ec = new S(), bc = new S(), wc = new S(), Tc = new S(), Ac = new S(), Cc = new S();
class Rc {
  constructor() {
    this.world = null, this.useBoundingBoxes = !1, this.dirty = !0;
  }
  collisionPairs(e, t, n) {
    throw new Error("collisionPairs not implemented for this BroadPhase class!");
  }
  needBroadphaseCollision(e, t) {
    return !((e.collisionFilterGroup & t.collisionFilterMask) === 0 || (t.collisionFilterGroup & e.collisionFilterMask) === 0 || ((e.type & oe.STATIC) !== 0 || e.sleepState === oe.SLEEPING) && ((t.type & oe.STATIC) !== 0 || t.sleepState === oe.SLEEPING));
  }
  intersectionTest(e, t, n, i) {
    this.useBoundingBoxes ? this.doBoundingBoxBroadphase(e, t, n, i) : this.doBoundingSphereBroadphase(e, t, n, i);
  }
  doBoundingSphereBroadphase(e, t, n, i) {
    const s = Pc;
    t.position.vsub(e.position, s);
    const o = (e.boundingRadius + t.boundingRadius) ** 2;
    s.lengthSquared() < o && (n.push(e), i.push(t));
  }
  doBoundingBoxBroadphase(e, t, n, i) {
    e.aabbNeedsUpdate && e.updateAABB(), t.aabbNeedsUpdate && t.updateAABB(), e.aabb.overlaps(t.aabb) && (n.push(e), i.push(t));
  }
  makePairsUnique(e, t) {
    const n = Dc, i = Lc, s = Fc, o = e.length;
    for (let a = 0; a !== o; a++)
      i[a] = e[a], s[a] = t[a];
    e.length = 0, t.length = 0;
    for (let a = 0; a !== o; a++) {
      const l = i[a].id, c = s[a].id, h = l < c ? `${l},${c}` : `${c},${l}`;
      n[h] = a, n.keys.push(h);
    }
    for (let a = 0; a !== n.keys.length; a++) {
      const l = n.keys.pop(), c = n[l];
      e.push(i[c]), t.push(s[c]), delete n[l];
    }
  }
  setWorld(e) {
  }
  static boundingSphereCheck(e, t) {
    const n = new S();
    e.position.vsub(t.position, n);
    const i = e.shapes[0], s = t.shapes[0];
    return Math.pow(i.boundingSphereRadius + s.boundingSphereRadius, 2) > n.lengthSquared();
  }
  aabbQuery(e, t, n) {
    return console.warn(".aabbQuery is not implemented in this Broadphase subclass."), [];
  }
}
const Pc = new S();
new S();
new ft();
new S();
const Dc = {
  keys: []
}, Lc = [], Fc = [];
new S();
new S();
new S();
class gl extends Rc {
  constructor() {
    super();
  }
  collisionPairs(e, t, n) {
    const i = e.bodies, s = i.length;
    let o, a;
    for (let l = 0; l !== s; l++)
      for (let c = 0; c !== l; c++)
        o = i[l], a = i[c], this.needBroadphaseCollision(o, a) && this.intersectionTest(o, a, t, n);
  }
  aabbQuery(e, t, n) {
    n === void 0 && (n = []);
    for (let i = 0; i < e.bodies.length; i++) {
      const s = e.bodies[i];
      s.aabbNeedsUpdate && s.updateAABB(), s.aabb.overlaps(t) && n.push(s);
    }
    return n;
  }
}
class ks {
  constructor() {
    this.rayFromWorld = new S(), this.rayToWorld = new S(), this.hitNormalWorld = new S(), this.hitPointWorld = new S(), this.hasHit = !1, this.shape = null, this.body = null, this.hitFaceIndex = -1, this.distance = -1, this.shouldStop = !1;
  }
  reset() {
    this.rayFromWorld.setZero(), this.rayToWorld.setZero(), this.hitNormalWorld.setZero(), this.hitPointWorld.setZero(), this.hasHit = !1, this.shape = null, this.body = null, this.hitFaceIndex = -1, this.distance = -1, this.shouldStop = !1;
  }
  abort() {
    this.shouldStop = !0;
  }
  set(e, t, n, i, s, o, a) {
    this.rayFromWorld.copy(e), this.rayToWorld.copy(t), this.hitNormalWorld.copy(n), this.hitPointWorld.copy(i), this.shape = s, this.body = o, this.distance = a;
  }
}
let _l, vl, xl, yl, Ml, Sl, El;
const wo = {
  CLOSEST: 1,
  ANY: 2,
  ALL: 4
};
_l = me.types.SPHERE;
vl = me.types.PLANE;
xl = me.types.BOX;
yl = me.types.CYLINDER;
Ml = me.types.CONVEXPOLYHEDRON;
Sl = me.types.HEIGHTFIELD;
El = me.types.TRIMESH;
class dt {
  get [_l]() {
    return this._intersectSphere;
  }
  get [vl]() {
    return this._intersectPlane;
  }
  get [xl]() {
    return this._intersectBox;
  }
  get [yl]() {
    return this._intersectConvex;
  }
  get [Ml]() {
    return this._intersectConvex;
  }
  get [Sl]() {
    return this._intersectHeightfield;
  }
  get [El]() {
    return this._intersectTrimesh;
  }
  constructor(e, t) {
    e === void 0 && (e = new S()), t === void 0 && (t = new S()), this.from = e.clone(), this.to = t.clone(), this.direction = new S(), this.precision = 1e-4, this.checkCollisionResponse = !0, this.skipBackfaces = !1, this.collisionFilterMask = -1, this.collisionFilterGroup = -1, this.mode = dt.ANY, this.result = new ks(), this.hasHit = !1, this.callback = (n) => {
    };
  }
  intersectWorld(e, t) {
    return this.mode = t.mode || dt.ANY, this.result = t.result || new ks(), this.skipBackfaces = !!t.skipBackfaces, this.collisionFilterMask = typeof t.collisionFilterMask < "u" ? t.collisionFilterMask : -1, this.collisionFilterGroup = typeof t.collisionFilterGroup < "u" ? t.collisionFilterGroup : -1, this.checkCollisionResponse = typeof t.checkCollisionResponse < "u" ? t.checkCollisionResponse : !0, t.from && this.from.copy(t.from), t.to && this.to.copy(t.to), this.callback = t.callback || (() => {
    }), this.hasHit = !1, this.result.reset(), this.updateDirection(), this.getAABB(Qo), $s.length = 0, e.broadphase.aabbQuery(e, Qo, $s), this.intersectBodies($s), this.hasHit;
  }
  intersectBody(e, t) {
    t && (this.result = t, this.updateDirection());
    const n = this.checkCollisionResponse;
    if (n && !e.collisionResponse || (this.collisionFilterGroup & e.collisionFilterMask) === 0 || (e.collisionFilterGroup & this.collisionFilterMask) === 0)
      return;
    const i = Ic, s = Uc;
    for (let o = 0, a = e.shapes.length; o < a; o++) {
      const l = e.shapes[o];
      if (!(n && !l.collisionResponse) && (e.quaternion.mult(e.shapeOrientations[o], s), e.quaternion.vmult(e.shapeOffsets[o], i), i.vadd(e.position, i), this.intersectShape(l, s, i, e), this.result.shouldStop))
        break;
    }
  }
  intersectBodies(e, t) {
    t && (this.result = t, this.updateDirection());
    for (let n = 0, i = e.length; !this.result.shouldStop && n < i; n++)
      this.intersectBody(e[n]);
  }
  updateDirection() {
    this.to.vsub(this.from, this.direction), this.direction.normalize();
  }
  intersectShape(e, t, n, i) {
    const s = this.from;
    if (Kc(s, this.direction, n) > e.boundingSphereRadius)
      return;
    const a = this[e.type];
    a && a.call(this, e, t, n, i, e);
  }
  _intersectBox(e, t, n, i, s) {
    return this._intersectConvex(e.convexPolyhedronRepresentation, t, n, i, s);
  }
  _intersectPlane(e, t, n, i, s) {
    const o = this.from, a = this.to, l = this.direction, c = new S(0, 0, 1);
    t.vmult(c, c);
    const h = new S();
    o.vsub(n, h);
    const d = h.dot(c);
    a.vsub(n, h);
    const u = h.dot(c);
    if (d * u > 0 || o.distanceTo(a) < d)
      return;
    const m = c.dot(l);
    if (Math.abs(m) < this.precision)
      return;
    const g = new S(), _ = new S(), f = new S();
    o.vsub(n, g);
    const p = -c.dot(g) / m;
    l.scale(p, _), o.vadd(_, f), this.reportIntersection(c, f, s, i, -1);
  }
  getAABB(e) {
    const {
      lowerBound: t,
      upperBound: n
    } = e, i = this.to, s = this.from;
    t.x = Math.min(i.x, s.x), t.y = Math.min(i.y, s.y), t.z = Math.min(i.z, s.z), n.x = Math.max(i.x, s.x), n.y = Math.max(i.y, s.y), n.z = Math.max(i.z, s.z);
  }
  _intersectHeightfield(e, t, n, i, s) {
    e.data, e.elementSize;
    const o = Nc;
    o.from.copy(this.from), o.to.copy(this.to), Ke.pointToLocalFrame(n, t, o.from, o.from), Ke.pointToLocalFrame(n, t, o.to, o.to), o.updateDirection();
    const a = Oc;
    let l, c, h, d;
    l = c = 0, h = d = e.data.length - 1;
    const u = new Ut();
    o.getAABB(u), e.getIndexOfPosition(u.lowerBound.x, u.lowerBound.y, a, !0), l = Math.max(l, a[0]), c = Math.max(c, a[1]), e.getIndexOfPosition(u.upperBound.x, u.upperBound.y, a, !0), h = Math.min(h, a[0] + 1), d = Math.min(d, a[1] + 1);
    for (let m = l; m < h; m++)
      for (let g = c; g < d; g++) {
        if (this.result.shouldStop)
          return;
        if (e.getAabbAtIndex(m, g, u), !!u.overlapsRay(o)) {
          if (e.getConvexTrianglePillar(m, g, !1), Ke.pointToWorldFrame(n, t, e.pillarOffset, rs), this._intersectConvex(e.pillarConvex, t, rs, i, s, ea), this.result.shouldStop)
            return;
          e.getConvexTrianglePillar(m, g, !0), Ke.pointToWorldFrame(n, t, e.pillarOffset, rs), this._intersectConvex(e.pillarConvex, t, rs, i, s, ea);
        }
      }
  }
  _intersectSphere(e, t, n, i, s) {
    const o = this.from, a = this.to, l = e.radius, c = (a.x - o.x) ** 2 + (a.y - o.y) ** 2 + (a.z - o.z) ** 2, h = 2 * ((a.x - o.x) * (o.x - n.x) + (a.y - o.y) * (o.y - n.y) + (a.z - o.z) * (o.z - n.z)), d = (o.x - n.x) ** 2 + (o.y - n.y) ** 2 + (o.z - n.z) ** 2 - l ** 2, u = h ** 2 - 4 * c * d, m = Bc, g = zc;
    if (!(u < 0))
      if (u === 0)
        o.lerp(a, u, m), m.vsub(n, g), g.normalize(), this.reportIntersection(g, m, s, i, -1);
      else {
        const _ = (-h - Math.sqrt(u)) / (2 * c), f = (-h + Math.sqrt(u)) / (2 * c);
        if (_ >= 0 && _ <= 1 && (o.lerp(a, _, m), m.vsub(n, g), g.normalize(), this.reportIntersection(g, m, s, i, -1)), this.result.shouldStop)
          return;
        f >= 0 && f <= 1 && (o.lerp(a, f, m), m.vsub(n, g), g.normalize(), this.reportIntersection(g, m, s, i, -1));
      }
  }
  _intersectConvex(e, t, n, i, s, o) {
    const a = kc, l = ta, c = o && o.faceList || null, h = e.faces, d = e.vertices, u = e.faceNormals, m = this.direction, g = this.from, _ = this.to, f = g.distanceTo(_), p = c ? c.length : h.length, v = this.result;
    for (let M = 0; !v.shouldStop && M < p; M++) {
      const x = c ? c[M] : M, A = h[x], T = u[x], C = t, D = n;
      l.copy(d[A[0]]), C.vmult(l, l), l.vadd(D, l), l.vsub(g, l), C.vmult(T, a);
      const b = m.dot(a);
      if (Math.abs(b) < this.precision)
        continue;
      const y = a.dot(l) / b;
      if (!(y < 0)) {
        m.scale(y, Ct), Ct.vadd(g, Ct), Wt.copy(d[A[0]]), C.vmult(Wt, Wt), D.vadd(Wt, Wt);
        for (let P = 1; !v.shouldStop && P < A.length - 1; P++) {
          tn.copy(d[A[P]]), nn.copy(d[A[P + 1]]), C.vmult(tn, tn), C.vmult(nn, nn), D.vadd(tn, tn), D.vadd(nn, nn);
          const B = Ct.distanceTo(g);
          !(dt.pointInTriangle(Ct, Wt, tn, nn) || dt.pointInTriangle(Ct, tn, Wt, nn)) || B > f || this.reportIntersection(a, Ct, s, i, x);
        }
      }
    }
  }
  _intersectTrimesh(e, t, n, i, s, o) {
    const a = Vc, l = Yc, c = jc, h = ta, d = Hc, u = Gc, m = Wc, g = qc, _ = Xc, f = e.indices;
    e.vertices;
    const p = this.from, v = this.to, M = this.direction;
    c.position.copy(n), c.quaternion.copy(t), Ke.vectorToLocalFrame(n, t, M, d), Ke.pointToLocalFrame(n, t, p, u), Ke.pointToLocalFrame(n, t, v, m), m.x *= e.scale.x, m.y *= e.scale.y, m.z *= e.scale.z, u.x *= e.scale.x, u.y *= e.scale.y, u.z *= e.scale.z, m.vsub(u, d), d.normalize();
    const x = u.distanceSquared(m);
    e.tree.rayQuery(this, c, l);
    for (let A = 0, T = l.length; !this.result.shouldStop && A !== T; A++) {
      const C = l[A];
      e.getNormal(C, a), e.getVertex(f[C * 3], Wt), Wt.vsub(u, h);
      const D = d.dot(a), b = a.dot(h) / D;
      if (b < 0)
        continue;
      d.scale(b, Ct), Ct.vadd(u, Ct), e.getVertex(f[C * 3 + 1], tn), e.getVertex(f[C * 3 + 2], nn);
      const y = Ct.distanceSquared(u);
      !(dt.pointInTriangle(Ct, tn, Wt, nn) || dt.pointInTriangle(Ct, Wt, tn, nn)) || y > x || (Ke.vectorToWorldFrame(t, a, _), Ke.pointToWorldFrame(n, t, Ct, g), this.reportIntersection(_, g, s, i, C));
    }
    l.length = 0;
  }
  reportIntersection(e, t, n, i, s) {
    const o = this.from, a = this.to, l = o.distanceTo(t), c = this.result;
    if (!(this.skipBackfaces && e.dot(this.direction) > 0))
      switch (c.hitFaceIndex = typeof s < "u" ? s : -1, this.mode) {
        case dt.ALL:
          this.hasHit = !0, c.set(o, a, e, t, n, i, l), c.hasHit = !0, this.callback(c);
          break;
        case dt.CLOSEST:
          (l < c.distance || !c.hasHit) && (this.hasHit = !0, c.hasHit = !0, c.set(o, a, e, t, n, i, l));
          break;
        case dt.ANY:
          this.hasHit = !0, c.hasHit = !0, c.set(o, a, e, t, n, i, l), c.shouldStop = !0;
          break;
      }
  }
  static pointInTriangle(e, t, n, i) {
    i.vsub(t, jn), n.vsub(t, Ii), e.vsub(t, Js);
    const s = jn.dot(jn), o = jn.dot(Ii), a = jn.dot(Js), l = Ii.dot(Ii), c = Ii.dot(Js);
    let h, d;
    return (h = l * a - o * c) >= 0 && (d = s * c - o * a) >= 0 && h + d < s * l - o * o;
  }
}
dt.CLOSEST = wo.CLOSEST;
dt.ANY = wo.ANY;
dt.ALL = wo.ALL;
const Qo = new Ut(), $s = [], Ii = new S(), Js = new S(), Ic = new S(), Uc = new ft(), Ct = new S(), Wt = new S(), tn = new S(), nn = new S();
new S();
new ks();
const ea = {
  faceList: [0]
}, rs = new S(), Nc = new dt(), Oc = [], Bc = new S(), zc = new S(), kc = new S();
new S();
new S();
const ta = new S(), Vc = new S(), Hc = new S(), Gc = new S(), Wc = new S(), Xc = new S(), qc = new S();
new Ut();
const Yc = [], jc = new Ke(), jn = new S(), os = new S();
function Kc(r, e, t) {
  t.vsub(r, jn);
  const n = jn.dot(e);
  return e.scale(n, os), os.vadd(r, os), t.distanceTo(os);
}
class Zc {
  static defaults(e, t) {
    e === void 0 && (e = {});
    for (let n in t)
      n in e || (e[n] = t[n]);
    return e;
  }
}
class na {
  constructor() {
    this.spatial = new S(), this.rotational = new S();
  }
  multiplyElement(e) {
    return e.spatial.dot(this.spatial) + e.rotational.dot(this.rotational);
  }
  multiplyVectors(e, t) {
    return e.dot(this.spatial) + t.dot(this.rotational);
  }
}
class Zi {
  constructor(e, t, n, i) {
    n === void 0 && (n = -1e6), i === void 0 && (i = 1e6), this.id = Zi.idCounter++, this.minForce = n, this.maxForce = i, this.bi = e, this.bj = t, this.a = 0, this.b = 0, this.eps = 0, this.jacobianElementA = new na(), this.jacobianElementB = new na(), this.enabled = !0, this.multiplier = 0, this.setSpookParams(1e7, 4, 1 / 60);
  }
  setSpookParams(e, t, n) {
    const i = t, s = e, o = n;
    this.a = 4 / (o * (1 + 4 * i)), this.b = 4 * i / (1 + 4 * i), this.eps = 4 / (o * o * s * (1 + 4 * i));
  }
  computeB(e, t, n) {
    const i = this.computeGW(), s = this.computeGq(), o = this.computeGiMf();
    return -s * e - i * t - o * n;
  }
  computeGq() {
    const e = this.jacobianElementA, t = this.jacobianElementB, n = this.bi, i = this.bj, s = n.position, o = i.position;
    return e.spatial.dot(s) + t.spatial.dot(o);
  }
  computeGW() {
    const e = this.jacobianElementA, t = this.jacobianElementB, n = this.bi, i = this.bj, s = n.velocity, o = i.velocity, a = n.angularVelocity, l = i.angularVelocity;
    return e.multiplyVectors(s, a) + t.multiplyVectors(o, l);
  }
  computeGWlambda() {
    const e = this.jacobianElementA, t = this.jacobianElementB, n = this.bi, i = this.bj, s = n.vlambda, o = i.vlambda, a = n.wlambda, l = i.wlambda;
    return e.multiplyVectors(s, a) + t.multiplyVectors(o, l);
  }
  computeGiMf() {
    const e = this.jacobianElementA, t = this.jacobianElementB, n = this.bi, i = this.bj, s = n.force, o = n.torque, a = i.force, l = i.torque, c = n.invMassSolve, h = i.invMassSolve;
    return s.scale(c, ia), a.scale(h, sa), n.invInertiaWorldSolve.vmult(o, ra), i.invInertiaWorldSolve.vmult(l, oa), e.multiplyVectors(ia, ra) + t.multiplyVectors(sa, oa);
  }
  computeGiMGt() {
    const e = this.jacobianElementA, t = this.jacobianElementB, n = this.bi, i = this.bj, s = n.invMassSolve, o = i.invMassSolve, a = n.invInertiaWorldSolve, l = i.invInertiaWorldSolve;
    let c = s + o;
    return a.vmult(e.rotational, as), c += as.dot(e.rotational), l.vmult(t.rotational, as), c += as.dot(t.rotational), c;
  }
  addToWlambda(e) {
    const t = this.jacobianElementA, n = this.jacobianElementB, i = this.bi, s = this.bj, o = $c;
    i.vlambda.addScaledVector(i.invMassSolve * e, t.spatial, i.vlambda), s.vlambda.addScaledVector(s.invMassSolve * e, n.spatial, s.vlambda), i.invInertiaWorldSolve.vmult(t.rotational, o), i.wlambda.addScaledVector(e, o, i.wlambda), s.invInertiaWorldSolve.vmult(n.rotational, o), s.wlambda.addScaledVector(e, o, s.wlambda);
  }
  computeC() {
    return this.computeGiMGt() + this.eps;
  }
}
Zi.idCounter = 0;
const ia = new S(), sa = new S(), ra = new S(), oa = new S(), as = new S(), $c = new S();
class Jc extends Zi {
  constructor(e, t, n) {
    n === void 0 && (n = 1e6), super(e, t, 0, n), this.restitution = 0, this.ri = new S(), this.rj = new S(), this.ni = new S();
  }
  computeB(e) {
    const t = this.a, n = this.b, i = this.bi, s = this.bj, o = this.ri, a = this.rj, l = Qc, c = eh, h = i.velocity, d = i.angularVelocity;
    i.force, i.torque;
    const u = s.velocity, m = s.angularVelocity;
    s.force, s.torque;
    const g = th, _ = this.jacobianElementA, f = this.jacobianElementB, p = this.ni;
    o.cross(p, l), a.cross(p, c), p.negate(_.spatial), l.negate(_.rotational), f.spatial.copy(p), f.rotational.copy(c), g.copy(s.position), g.vadd(a, g), g.vsub(i.position, g), g.vsub(o, g);
    const v = p.dot(g), M = this.restitution + 1, x = M * u.dot(p) - M * h.dot(p) + m.dot(c) - d.dot(l), A = this.computeGiMf();
    return -v * t - x * n - e * A;
  }
  getImpactVelocityAlongNormal() {
    const e = nh, t = ih, n = sh, i = rh, s = oh;
    return this.bi.position.vadd(this.ri, n), this.bj.position.vadd(this.rj, i), this.bi.getVelocityAtWorldPoint(n, e), this.bj.getVelocityAtWorldPoint(i, t), e.vsub(t, s), this.ni.dot(s);
  }
}
const Qc = new S(), eh = new S(), th = new S(), nh = new S(), ih = new S(), sh = new S(), rh = new S(), oh = new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
class aa extends Zi {
  constructor(e, t, n) {
    super(e, t, -n, n), this.ri = new S(), this.rj = new S(), this.t = new S();
  }
  computeB(e) {
    this.a;
    const t = this.b;
    this.bi, this.bj;
    const n = this.ri, i = this.rj, s = ah, o = lh, a = this.t;
    n.cross(a, s), i.cross(a, o);
    const l = this.jacobianElementA, c = this.jacobianElementB;
    a.negate(l.spatial), s.negate(l.rotational), c.spatial.copy(a), c.rotational.copy(o);
    const h = this.computeGW(), d = this.computeGiMf();
    return -h * t - e * d;
  }
}
const ah = new S(), lh = new S();
class ei {
  constructor(e, t, n) {
    n = Zc.defaults(n, {
      friction: 0.3,
      restitution: 0.3,
      contactEquationStiffness: 1e7,
      contactEquationRelaxation: 3,
      frictionEquationStiffness: 1e7,
      frictionEquationRelaxation: 3
    }), this.id = ei.idCounter++, this.materials = [e, t], this.friction = n.friction, this.restitution = n.restitution, this.contactEquationStiffness = n.contactEquationStiffness, this.contactEquationRelaxation = n.contactEquationRelaxation, this.frictionEquationStiffness = n.frictionEquationStiffness, this.frictionEquationRelaxation = n.frictionEquationRelaxation;
  }
}
ei.idCounter = 0;
class ti {
  constructor(e) {
    e === void 0 && (e = {});
    let t = "";
    typeof e == "string" && (t = e, e = {}), this.name = t, this.id = ti.idCounter++, this.friction = typeof e.friction < "u" ? e.friction : -1, this.restitution = typeof e.restitution < "u" ? e.restitution : -1;
  }
}
ti.idCounter = 0;
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new dt();
new S();
new S();
new S();
new S(1, 0, 0), new S(0, 1, 0), new S(0, 0, 1);
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
class ch extends Qn {
  constructor(e, t, n, i) {
    if (e === void 0 && (e = 1), t === void 0 && (t = 1), n === void 0 && (n = 1), i === void 0 && (i = 8), e < 0)
      throw new Error("The cylinder radiusTop cannot be negative.");
    if (t < 0)
      throw new Error("The cylinder radiusBottom cannot be negative.");
    const s = i, o = [], a = [], l = [], c = [], h = [], d = Math.cos, u = Math.sin;
    o.push(new S(-t * u(0), -n * 0.5, t * d(0))), c.push(0), o.push(new S(-e * u(0), n * 0.5, e * d(0))), h.push(1);
    for (let g = 0; g < s; g++) {
      const _ = 2 * Math.PI / s * (g + 1), f = 2 * Math.PI / s * (g + 0.5);
      g < s - 1 ? (o.push(new S(-t * u(_), -n * 0.5, t * d(_))), c.push(2 * g + 2), o.push(new S(-e * u(_), n * 0.5, e * d(_))), h.push(2 * g + 3), l.push([2 * g, 2 * g + 1, 2 * g + 3, 2 * g + 2])) : l.push([2 * g, 2 * g + 1, 1, 0]), (s % 2 === 1 || g < s / 2) && a.push(new S(-u(f), 0, d(f)));
    }
    l.push(c), a.push(new S(0, 1, 0));
    const m = [];
    for (let g = 0; g < h.length; g++)
      m.push(h[h.length - g - 1]);
    l.push(m), super({
      vertices: o,
      faces: l,
      axes: a
    }), this.type = me.types.CYLINDER, this.radiusTop = e, this.radiusBottom = t, this.height = n, this.numSegments = i;
  }
}
class Ui extends me {
  constructor() {
    super({
      type: me.types.PLANE
    }), this.worldNormal = new S(), this.worldNormalNeedsUpdate = !0, this.boundingSphereRadius = Number.MAX_VALUE;
  }
  computeWorldNormal(e) {
    const t = this.worldNormal;
    t.set(0, 0, 1), e.vmult(t, t), this.worldNormalNeedsUpdate = !1;
  }
  calculateLocalInertia(e, t) {
    return t === void 0 && (t = new S()), t;
  }
  volume() {
    return Number.MAX_VALUE;
  }
  calculateWorldAABB(e, t, n, i) {
    hn.set(0, 0, 1), t.vmult(hn, hn);
    const s = Number.MAX_VALUE;
    n.set(-s, -s, -s), i.set(s, s, s), hn.x === 1 ? i.x = e.x : hn.x === -1 && (n.x = e.x), hn.y === 1 ? i.y = e.y : hn.y === -1 && (n.y = e.y), hn.z === 1 ? i.z = e.z : hn.z === -1 && (n.z = e.z);
  }
  updateBoundingSphereRadius() {
    this.boundingSphereRadius = Number.MAX_VALUE;
  }
}
const hn = new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new Ut();
new S();
new Ut();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new Ut();
new S();
new Ke();
new Ut();
class hh {
  constructor() {
    this.equations = [];
  }
  solve(e, t) {
    return 0;
  }
  addEquation(e) {
    e.enabled && !e.bi.isTrigger && !e.bj.isTrigger && this.equations.push(e);
  }
  removeEquation(e) {
    const t = this.equations, n = t.indexOf(e);
    n !== -1 && t.splice(n, 1);
  }
  removeAllEquations() {
    this.equations.length = 0;
  }
}
class uh extends hh {
  constructor() {
    super(), this.iterations = 10, this.tolerance = 1e-7;
  }
  solve(e, t) {
    let n = 0;
    const i = this.iterations, s = this.tolerance * this.tolerance, o = this.equations, a = o.length, l = t.bodies, c = l.length, h = e;
    let d, u, m, g, _, f;
    if (a !== 0)
      for (let x = 0; x !== c; x++)
        l[x].updateSolveMassProperties();
    const p = fh, v = ph, M = dh;
    p.length = a, v.length = a, M.length = a;
    for (let x = 0; x !== a; x++) {
      const A = o[x];
      M[x] = 0, v[x] = A.computeB(h), p[x] = 1 / A.computeC();
    }
    if (a !== 0) {
      for (let T = 0; T !== c; T++) {
        const C = l[T], D = C.vlambda, b = C.wlambda;
        D.set(0, 0, 0), b.set(0, 0, 0);
      }
      for (n = 0; n !== i; n++) {
        g = 0;
        for (let T = 0; T !== a; T++) {
          const C = o[T];
          d = v[T], u = p[T], f = M[T], _ = C.computeGWlambda(), m = u * (d - _ - C.eps * f), f + m < C.minForce ? m = C.minForce - f : f + m > C.maxForce && (m = C.maxForce - f), M[T] += m, g += m > 0 ? m : -m, C.addToWlambda(m);
        }
        if (g * g < s)
          break;
      }
      for (let T = 0; T !== c; T++) {
        const C = l[T], D = C.velocity, b = C.angularVelocity;
        C.vlambda.vmul(C.linearFactor, C.vlambda), D.vadd(C.vlambda, D), C.wlambda.vmul(C.angularFactor, C.wlambda), b.vadd(C.wlambda, b);
      }
      let x = o.length;
      const A = 1 / h;
      for (; x--; )
        o[x].multiplier = M[x] * A;
    }
    return n;
  }
}
const dh = [], fh = [], ph = [];
oe.STATIC;
class mh {
  constructor() {
    this.objects = [], this.type = Object;
  }
  release() {
    const e = arguments.length;
    for (let t = 0; t !== e; t++)
      this.objects.push(t < 0 || arguments.length <= t ? void 0 : arguments[t]);
    return this;
  }
  get() {
    return this.objects.length === 0 ? this.constructObject() : this.objects.pop();
  }
  constructObject() {
    throw new Error("constructObject() not implemented in this Pool subclass yet!");
  }
  resize(e) {
    const t = this.objects;
    for (; t.length > e; )
      t.pop();
    for (; t.length < e; )
      t.push(this.constructObject());
    return this;
  }
}
class gh extends mh {
  constructor() {
    super(...arguments), this.type = S;
  }
  constructObject() {
    return new S();
  }
}
const nt = {
  sphereSphere: me.types.SPHERE,
  spherePlane: me.types.SPHERE | me.types.PLANE,
  boxBox: me.types.BOX | me.types.BOX,
  sphereBox: me.types.SPHERE | me.types.BOX,
  planeBox: me.types.PLANE | me.types.BOX,
  convexConvex: me.types.CONVEXPOLYHEDRON,
  sphereConvex: me.types.SPHERE | me.types.CONVEXPOLYHEDRON,
  planeConvex: me.types.PLANE | me.types.CONVEXPOLYHEDRON,
  boxConvex: me.types.BOX | me.types.CONVEXPOLYHEDRON,
  sphereHeightfield: me.types.SPHERE | me.types.HEIGHTFIELD,
  boxHeightfield: me.types.BOX | me.types.HEIGHTFIELD,
  convexHeightfield: me.types.CONVEXPOLYHEDRON | me.types.HEIGHTFIELD,
  sphereParticle: me.types.PARTICLE | me.types.SPHERE,
  planeParticle: me.types.PLANE | me.types.PARTICLE,
  boxParticle: me.types.BOX | me.types.PARTICLE,
  convexParticle: me.types.PARTICLE | me.types.CONVEXPOLYHEDRON,
  cylinderCylinder: me.types.CYLINDER,
  sphereCylinder: me.types.SPHERE | me.types.CYLINDER,
  planeCylinder: me.types.PLANE | me.types.CYLINDER,
  boxCylinder: me.types.BOX | me.types.CYLINDER,
  convexCylinder: me.types.CONVEXPOLYHEDRON | me.types.CYLINDER,
  heightfieldCylinder: me.types.HEIGHTFIELD | me.types.CYLINDER,
  particleCylinder: me.types.PARTICLE | me.types.CYLINDER,
  sphereTrimesh: me.types.SPHERE | me.types.TRIMESH,
  planeTrimesh: me.types.PLANE | me.types.TRIMESH
};
class _h {
  get [nt.sphereSphere]() {
    return this.sphereSphere;
  }
  get [nt.spherePlane]() {
    return this.spherePlane;
  }
  get [nt.boxBox]() {
    return this.boxBox;
  }
  get [nt.sphereBox]() {
    return this.sphereBox;
  }
  get [nt.planeBox]() {
    return this.planeBox;
  }
  get [nt.convexConvex]() {
    return this.convexConvex;
  }
  get [nt.sphereConvex]() {
    return this.sphereConvex;
  }
  get [nt.planeConvex]() {
    return this.planeConvex;
  }
  get [nt.boxConvex]() {
    return this.boxConvex;
  }
  get [nt.sphereHeightfield]() {
    return this.sphereHeightfield;
  }
  get [nt.boxHeightfield]() {
    return this.boxHeightfield;
  }
  get [nt.convexHeightfield]() {
    return this.convexHeightfield;
  }
  get [nt.sphereParticle]() {
    return this.sphereParticle;
  }
  get [nt.planeParticle]() {
    return this.planeParticle;
  }
  get [nt.boxParticle]() {
    return this.boxParticle;
  }
  get [nt.convexParticle]() {
    return this.convexParticle;
  }
  get [nt.cylinderCylinder]() {
    return this.convexConvex;
  }
  get [nt.sphereCylinder]() {
    return this.sphereConvex;
  }
  get [nt.planeCylinder]() {
    return this.planeConvex;
  }
  get [nt.boxCylinder]() {
    return this.boxConvex;
  }
  get [nt.convexCylinder]() {
    return this.convexConvex;
  }
  get [nt.heightfieldCylinder]() {
    return this.heightfieldCylinder;
  }
  get [nt.particleCylinder]() {
    return this.particleCylinder;
  }
  get [nt.sphereTrimesh]() {
    return this.sphereTrimesh;
  }
  get [nt.planeTrimesh]() {
    return this.planeTrimesh;
  }
  constructor(e) {
    this.contactPointPool = [], this.frictionEquationPool = [], this.result = [], this.frictionResult = [], this.v3pool = new gh(), this.world = e, this.currentContactMaterial = e.defaultContactMaterial, this.enableFrictionReduction = !1;
  }
  createContactEquation(e, t, n, i, s, o) {
    let a;
    this.contactPointPool.length ? (a = this.contactPointPool.pop(), a.bi = e, a.bj = t) : a = new Jc(e, t), a.enabled = e.collisionResponse && t.collisionResponse && n.collisionResponse && i.collisionResponse;
    const l = this.currentContactMaterial;
    a.restitution = l.restitution, a.setSpookParams(l.contactEquationStiffness, l.contactEquationRelaxation, this.world.dt);
    const c = n.material || e.material, h = i.material || t.material;
    return c && h && c.restitution >= 0 && h.restitution >= 0 && (a.restitution = c.restitution * h.restitution), a.si = s || n, a.sj = o || i, a;
  }
  createFrictionEquationsFromContact(e, t) {
    const n = e.bi, i = e.bj, s = e.si, o = e.sj, a = this.world, l = this.currentContactMaterial;
    let c = l.friction;
    const h = s.material || n.material, d = o.material || i.material;
    if (h && d && h.friction >= 0 && d.friction >= 0 && (c = h.friction * d.friction), c > 0) {
      const u = c * (a.frictionGravity || a.gravity).length();
      let m = n.invMass + i.invMass;
      m > 0 && (m = 1 / m);
      const g = this.frictionEquationPool, _ = g.length ? g.pop() : new aa(n, i, u * m), f = g.length ? g.pop() : new aa(n, i, u * m);
      return _.bi = f.bi = n, _.bj = f.bj = i, _.minForce = f.minForce = -u * m, _.maxForce = f.maxForce = u * m, _.ri.copy(e.ri), _.rj.copy(e.rj), f.ri.copy(e.ri), f.rj.copy(e.rj), e.ni.tangents(_.t, f.t), _.setSpookParams(l.frictionEquationStiffness, l.frictionEquationRelaxation, a.dt), f.setSpookParams(l.frictionEquationStiffness, l.frictionEquationRelaxation, a.dt), _.enabled = f.enabled = e.enabled, t.push(_, f), !0;
    }
    return !1;
  }
  createFrictionFromAverage(e) {
    let t = this.result[this.result.length - 1];
    if (!this.createFrictionEquationsFromContact(t, this.frictionResult) || e === 1)
      return;
    const n = this.frictionResult[this.frictionResult.length - 2], i = this.frictionResult[this.frictionResult.length - 1];
    zn.setZero(), oi.setZero(), ai.setZero();
    const s = t.bi;
    t.bj;
    for (let a = 0; a !== e; a++)
      t = this.result[this.result.length - 1 - a], t.bi !== s ? (zn.vadd(t.ni, zn), oi.vadd(t.ri, oi), ai.vadd(t.rj, ai)) : (zn.vsub(t.ni, zn), oi.vadd(t.rj, oi), ai.vadd(t.ri, ai));
    const o = 1 / e;
    oi.scale(o, n.ri), ai.scale(o, n.rj), i.ri.copy(n.ri), i.rj.copy(n.rj), zn.normalize(), zn.tangents(n.t, i.t);
  }
  getContacts(e, t, n, i, s, o, a) {
    this.contactPointPool = s, this.frictionEquationPool = a, this.result = i, this.frictionResult = o;
    const l = yh, c = Mh, h = vh, d = xh;
    for (let u = 0, m = e.length; u !== m; u++) {
      const g = e[u], _ = t[u];
      let f = null;
      g.material && _.material && (f = n.getContactMaterial(g.material, _.material) || null);
      const p = g.type & oe.KINEMATIC && _.type & oe.STATIC || g.type & oe.STATIC && _.type & oe.KINEMATIC || g.type & oe.KINEMATIC && _.type & oe.KINEMATIC;
      for (let v = 0; v < g.shapes.length; v++) {
        g.quaternion.mult(g.shapeOrientations[v], l), g.quaternion.vmult(g.shapeOffsets[v], h), h.vadd(g.position, h);
        const M = g.shapes[v];
        for (let x = 0; x < _.shapes.length; x++) {
          _.quaternion.mult(_.shapeOrientations[x], c), _.quaternion.vmult(_.shapeOffsets[x], d), d.vadd(_.position, d);
          const A = _.shapes[x];
          if (!(M.collisionFilterMask & A.collisionFilterGroup && A.collisionFilterMask & M.collisionFilterGroup) || h.distanceTo(d) > M.boundingSphereRadius + A.boundingSphereRadius)
            continue;
          let T = null;
          M.material && A.material && (T = n.getContactMaterial(M.material, A.material) || null), this.currentContactMaterial = T || f || n.defaultContactMaterial;
          const C = M.type | A.type, D = this[C];
          if (D) {
            let b = !1;
            M.type < A.type ? b = D.call(this, M, A, h, d, l, c, g, _, M, A, p) : b = D.call(this, A, M, d, h, c, l, _, g, M, A, p), b && p && (n.shapeOverlapKeeper.set(M.id, A.id), n.bodyOverlapKeeper.set(g.id, _.id));
          }
        }
      }
    }
  }
  sphereSphere(e, t, n, i, s, o, a, l, c, h, d) {
    if (d)
      return n.distanceSquared(i) < (e.radius + t.radius) ** 2;
    const u = this.createContactEquation(a, l, e, t, c, h);
    i.vsub(n, u.ni), u.ni.normalize(), u.ri.copy(u.ni), u.rj.copy(u.ni), u.ri.scale(e.radius, u.ri), u.rj.scale(-t.radius, u.rj), u.ri.vadd(n, u.ri), u.ri.vsub(a.position, u.ri), u.rj.vadd(i, u.rj), u.rj.vsub(l.position, u.rj), this.result.push(u), this.createFrictionEquationsFromContact(u, this.frictionResult);
  }
  spherePlane(e, t, n, i, s, o, a, l, c, h, d) {
    const u = this.createContactEquation(a, l, e, t, c, h);
    if (u.ni.set(0, 0, 1), o.vmult(u.ni, u.ni), u.ni.negate(u.ni), u.ni.normalize(), u.ni.scale(e.radius, u.ri), n.vsub(i, ls), u.ni.scale(u.ni.dot(ls), la), ls.vsub(la, u.rj), -ls.dot(u.ni) <= e.radius) {
      if (d)
        return !0;
      const m = u.ri, g = u.rj;
      m.vadd(n, m), m.vsub(a.position, m), g.vadd(i, g), g.vsub(l.position, g), this.result.push(u), this.createFrictionEquationsFromContact(u, this.frictionResult);
    }
  }
  boxBox(e, t, n, i, s, o, a, l, c, h, d) {
    return e.convexPolyhedronRepresentation.material = e.material, t.convexPolyhedronRepresentation.material = t.material, e.convexPolyhedronRepresentation.collisionResponse = e.collisionResponse, t.convexPolyhedronRepresentation.collisionResponse = t.collisionResponse, this.convexConvex(e.convexPolyhedronRepresentation, t.convexPolyhedronRepresentation, n, i, s, o, a, l, e, t, d);
  }
  sphereBox(e, t, n, i, s, o, a, l, c, h, d) {
    const u = this.v3pool, m = Yh;
    n.vsub(i, cs), t.getSideNormals(m, o);
    const g = e.radius;
    let _ = !1;
    const f = Kh, p = Zh, v = $h;
    let M = null, x = 0, A = 0, T = 0, C = null;
    for (let F = 0, K = m.length; F !== K && _ === !1; F++) {
      const V = Wh;
      V.copy(m[F]);
      const $ = V.length();
      V.normalize();
      const se = cs.dot(V);
      if (se < $ + g && se > 0) {
        const de = Xh, ne = qh;
        de.copy(m[(F + 1) % 3]), ne.copy(m[(F + 2) % 3]);
        const ke = de.length(), Y = ne.length();
        de.normalize(), ne.normalize();
        const ie = cs.dot(de), ge = cs.dot(ne);
        if (ie < ke && ie > -ke && ge < Y && ge > -Y) {
          const ae = Math.abs(se - $ - g);
          if ((C === null || ae < C) && (C = ae, A = ie, T = ge, M = $, f.copy(V), p.copy(de), v.copy(ne), x++, d))
            return !0;
        }
      }
    }
    if (x) {
      _ = !0;
      const F = this.createContactEquation(a, l, e, t, c, h);
      f.scale(-g, F.ri), F.ni.copy(f), F.ni.negate(F.ni), f.scale(M, f), p.scale(A, p), f.vadd(p, f), v.scale(T, v), f.vadd(v, F.rj), F.ri.vadd(n, F.ri), F.ri.vsub(a.position, F.ri), F.rj.vadd(i, F.rj), F.rj.vsub(l.position, F.rj), this.result.push(F), this.createFrictionEquationsFromContact(F, this.frictionResult);
    }
    let D = u.get();
    const b = jh;
    for (let F = 0; F !== 2 && !_; F++)
      for (let K = 0; K !== 2 && !_; K++)
        for (let V = 0; V !== 2 && !_; V++)
          if (D.set(0, 0, 0), F ? D.vadd(m[0], D) : D.vsub(m[0], D), K ? D.vadd(m[1], D) : D.vsub(m[1], D), V ? D.vadd(m[2], D) : D.vsub(m[2], D), i.vadd(D, b), b.vsub(n, b), b.lengthSquared() < g * g) {
            if (d)
              return !0;
            _ = !0;
            const $ = this.createContactEquation(a, l, e, t, c, h);
            $.ri.copy(b), $.ri.normalize(), $.ni.copy($.ri), $.ri.scale(g, $.ri), $.rj.copy(D), $.ri.vadd(n, $.ri), $.ri.vsub(a.position, $.ri), $.rj.vadd(i, $.rj), $.rj.vsub(l.position, $.rj), this.result.push($), this.createFrictionEquationsFromContact($, this.frictionResult);
          }
    u.release(D), D = null;
    const y = u.get(), P = u.get(), B = u.get(), L = u.get(), U = u.get(), O = m.length;
    for (let F = 0; F !== O && !_; F++)
      for (let K = 0; K !== O && !_; K++)
        if (F % 3 !== K % 3) {
          m[K].cross(m[F], y), y.normalize(), m[F].vadd(m[K], P), B.copy(n), B.vsub(P, B), B.vsub(i, B);
          const V = B.dot(y);
          y.scale(V, L);
          let $ = 0;
          for (; $ === F % 3 || $ === K % 3; )
            $++;
          U.copy(n), U.vsub(L, U), U.vsub(P, U), U.vsub(i, U);
          const se = Math.abs(V), de = U.length();
          if (se < m[$].length() && de < g) {
            if (d)
              return !0;
            _ = !0;
            const ne = this.createContactEquation(a, l, e, t, c, h);
            P.vadd(L, ne.rj), ne.rj.copy(ne.rj), U.negate(ne.ni), ne.ni.normalize(), ne.ri.copy(ne.rj), ne.ri.vadd(i, ne.ri), ne.ri.vsub(n, ne.ri), ne.ri.normalize(), ne.ri.scale(g, ne.ri), ne.ri.vadd(n, ne.ri), ne.ri.vsub(a.position, ne.ri), ne.rj.vadd(i, ne.rj), ne.rj.vsub(l.position, ne.rj), this.result.push(ne), this.createFrictionEquationsFromContact(ne, this.frictionResult);
          }
        }
    u.release(y, P, B, L, U);
  }
  planeBox(e, t, n, i, s, o, a, l, c, h, d) {
    return t.convexPolyhedronRepresentation.material = t.material, t.convexPolyhedronRepresentation.collisionResponse = t.collisionResponse, t.convexPolyhedronRepresentation.id = t.id, this.planeConvex(e, t.convexPolyhedronRepresentation, n, i, s, o, a, l, e, t, d);
  }
  convexConvex(e, t, n, i, s, o, a, l, c, h, d, u, m) {
    const g = du;
    if (!(n.distanceTo(i) > e.boundingSphereRadius + t.boundingSphereRadius) && e.findSeparatingAxis(t, n, s, i, o, g, u, m)) {
      const _ = [], f = fu;
      e.clipAgainstHull(n, s, t, i, o, g, -100, 100, _);
      let p = 0;
      for (let v = 0; v !== _.length; v++) {
        if (d)
          return !0;
        const M = this.createContactEquation(a, l, e, t, c, h), x = M.ri, A = M.rj;
        g.negate(M.ni), _[v].normal.negate(f), f.scale(_[v].depth, f), _[v].point.vadd(f, x), A.copy(_[v].point), x.vsub(n, x), A.vsub(i, A), x.vadd(n, x), x.vsub(a.position, x), A.vadd(i, A), A.vsub(l.position, A), this.result.push(M), p++, this.enableFrictionReduction || this.createFrictionEquationsFromContact(M, this.frictionResult);
      }
      this.enableFrictionReduction && p && this.createFrictionFromAverage(p);
    }
  }
  sphereConvex(e, t, n, i, s, o, a, l, c, h, d) {
    const u = this.v3pool;
    n.vsub(i, Jh);
    const m = t.faceNormals, g = t.faces, _ = t.vertices, f = e.radius;
    let p = !1;
    for (let v = 0; v !== _.length; v++) {
      const M = _[v], x = nu;
      o.vmult(M, x), i.vadd(x, x);
      const A = tu;
      if (x.vsub(n, A), A.lengthSquared() < f * f) {
        if (d)
          return !0;
        p = !0;
        const T = this.createContactEquation(a, l, e, t, c, h);
        T.ri.copy(A), T.ri.normalize(), T.ni.copy(T.ri), T.ri.scale(f, T.ri), x.vsub(i, T.rj), T.ri.vadd(n, T.ri), T.ri.vsub(a.position, T.ri), T.rj.vadd(i, T.rj), T.rj.vsub(l.position, T.rj), this.result.push(T), this.createFrictionEquationsFromContact(T, this.frictionResult);
        return;
      }
    }
    for (let v = 0, M = g.length; v !== M && p === !1; v++) {
      const x = m[v], A = g[v], T = iu;
      o.vmult(x, T);
      const C = su;
      o.vmult(_[A[0]], C), C.vadd(i, C);
      const D = ru;
      T.scale(-f, D), n.vadd(D, D);
      const b = ou;
      D.vsub(C, b);
      const y = b.dot(T), P = au;
      if (n.vsub(C, P), y < 0 && P.dot(T) > 0) {
        const B = [];
        for (let L = 0, U = A.length; L !== U; L++) {
          const O = u.get();
          o.vmult(_[A[L]], O), i.vadd(O, O), B.push(O);
        }
        if (Gh(B, T, n)) {
          if (d)
            return !0;
          p = !0;
          const L = this.createContactEquation(a, l, e, t, c, h);
          T.scale(-f, L.ri), T.negate(L.ni);
          const U = u.get();
          T.scale(-y, U);
          const O = u.get();
          T.scale(-f, O), n.vsub(i, L.rj), L.rj.vadd(O, L.rj), L.rj.vadd(U, L.rj), L.rj.vadd(i, L.rj), L.rj.vsub(l.position, L.rj), L.ri.vadd(n, L.ri), L.ri.vsub(a.position, L.ri), u.release(U), u.release(O), this.result.push(L), this.createFrictionEquationsFromContact(L, this.frictionResult);
          for (let F = 0, K = B.length; F !== K; F++)
            u.release(B[F]);
          return;
        } else
          for (let L = 0; L !== A.length; L++) {
            const U = u.get(), O = u.get();
            o.vmult(_[A[(L + 1) % A.length]], U), o.vmult(_[A[(L + 2) % A.length]], O), i.vadd(U, U), i.vadd(O, O);
            const F = Qh;
            O.vsub(U, F);
            const K = eu;
            F.unit(K);
            const V = u.get(), $ = u.get();
            n.vsub(U, $);
            const se = $.dot(K);
            K.scale(se, V), V.vadd(U, V);
            const de = u.get();
            if (V.vsub(n, de), se > 0 && se * se < F.lengthSquared() && de.lengthSquared() < f * f) {
              if (d)
                return !0;
              const ne = this.createContactEquation(a, l, e, t, c, h);
              V.vsub(i, ne.rj), V.vsub(n, ne.ni), ne.ni.normalize(), ne.ni.scale(f, ne.ri), ne.rj.vadd(i, ne.rj), ne.rj.vsub(l.position, ne.rj), ne.ri.vadd(n, ne.ri), ne.ri.vsub(a.position, ne.ri), this.result.push(ne), this.createFrictionEquationsFromContact(ne, this.frictionResult);
              for (let ke = 0, Y = B.length; ke !== Y; ke++)
                u.release(B[ke]);
              u.release(U), u.release(O), u.release(V), u.release(de), u.release($);
              return;
            }
            u.release(U), u.release(O), u.release(V), u.release(de), u.release($);
          }
        for (let L = 0, U = B.length; L !== U; L++)
          u.release(B[L]);
      }
    }
  }
  planeConvex(e, t, n, i, s, o, a, l, c, h, d) {
    const u = lu, m = cu;
    m.set(0, 0, 1), s.vmult(m, m);
    let g = 0;
    const _ = hu;
    for (let f = 0; f !== t.vertices.length; f++)
      if (u.copy(t.vertices[f]), o.vmult(u, u), i.vadd(u, u), u.vsub(n, _), m.dot(_) <= 0) {
        if (d)
          return !0;
        const v = this.createContactEquation(a, l, e, t, c, h), M = uu;
        m.scale(m.dot(_), M), u.vsub(M, M), M.vsub(n, v.ri), v.ni.copy(m), u.vsub(i, v.rj), v.ri.vadd(n, v.ri), v.ri.vsub(a.position, v.ri), v.rj.vadd(i, v.rj), v.rj.vsub(l.position, v.rj), this.result.push(v), g++, this.enableFrictionReduction || this.createFrictionEquationsFromContact(v, this.frictionResult);
      }
    this.enableFrictionReduction && g && this.createFrictionFromAverage(g);
  }
  boxConvex(e, t, n, i, s, o, a, l, c, h, d) {
    return e.convexPolyhedronRepresentation.material = e.material, e.convexPolyhedronRepresentation.collisionResponse = e.collisionResponse, this.convexConvex(e.convexPolyhedronRepresentation, t, n, i, s, o, a, l, e, t, d);
  }
  sphereHeightfield(e, t, n, i, s, o, a, l, c, h, d) {
    const u = t.data, m = e.radius, g = t.elementSize, _ = wu, f = bu;
    Ke.pointToLocalFrame(i, o, n, f);
    let p = Math.floor((f.x - m) / g) - 1, v = Math.ceil((f.x + m) / g) + 1, M = Math.floor((f.y - m) / g) - 1, x = Math.ceil((f.y + m) / g) + 1;
    if (v < 0 || x < 0 || p > u.length || M > u[0].length)
      return;
    p < 0 && (p = 0), v < 0 && (v = 0), M < 0 && (M = 0), x < 0 && (x = 0), p >= u.length && (p = u.length - 1), v >= u.length && (v = u.length - 1), x >= u[0].length && (x = u[0].length - 1), M >= u[0].length && (M = u[0].length - 1);
    const A = [];
    t.getRectMinMax(p, M, v, x, A);
    const T = A[0], C = A[1];
    if (f.z - m > C || f.z + m < T)
      return;
    const D = this.result;
    for (let b = p; b < v; b++)
      for (let y = M; y < x; y++) {
        const P = D.length;
        let B = !1;
        if (t.getConvexTrianglePillar(b, y, !1), Ke.pointToWorldFrame(i, o, t.pillarOffset, _), n.distanceTo(_) < t.pillarConvex.boundingSphereRadius + e.boundingSphereRadius && (B = this.sphereConvex(e, t.pillarConvex, n, _, s, o, a, l, e, t, d)), d && B || (t.getConvexTrianglePillar(b, y, !0), Ke.pointToWorldFrame(i, o, t.pillarOffset, _), n.distanceTo(_) < t.pillarConvex.boundingSphereRadius + e.boundingSphereRadius && (B = this.sphereConvex(e, t.pillarConvex, n, _, s, o, a, l, e, t, d)), d && B))
          return !0;
        if (D.length - P > 2)
          return;
      }
  }
  boxHeightfield(e, t, n, i, s, o, a, l, c, h, d) {
    return e.convexPolyhedronRepresentation.material = e.material, e.convexPolyhedronRepresentation.collisionResponse = e.collisionResponse, this.convexHeightfield(e.convexPolyhedronRepresentation, t, n, i, s, o, a, l, e, t, d);
  }
  convexHeightfield(e, t, n, i, s, o, a, l, c, h, d) {
    const u = t.data, m = t.elementSize, g = e.boundingSphereRadius, _ = Su, f = Eu, p = Mu;
    Ke.pointToLocalFrame(i, o, n, p);
    let v = Math.floor((p.x - g) / m) - 1, M = Math.ceil((p.x + g) / m) + 1, x = Math.floor((p.y - g) / m) - 1, A = Math.ceil((p.y + g) / m) + 1;
    if (M < 0 || A < 0 || v > u.length || x > u[0].length)
      return;
    v < 0 && (v = 0), M < 0 && (M = 0), x < 0 && (x = 0), A < 0 && (A = 0), v >= u.length && (v = u.length - 1), M >= u.length && (M = u.length - 1), A >= u[0].length && (A = u[0].length - 1), x >= u[0].length && (x = u[0].length - 1);
    const T = [];
    t.getRectMinMax(v, x, M, A, T);
    const C = T[0], D = T[1];
    if (!(p.z - g > D || p.z + g < C))
      for (let b = v; b < M; b++)
        for (let y = x; y < A; y++) {
          let P = !1;
          if (t.getConvexTrianglePillar(b, y, !1), Ke.pointToWorldFrame(i, o, t.pillarOffset, _), n.distanceTo(_) < t.pillarConvex.boundingSphereRadius + e.boundingSphereRadius && (P = this.convexConvex(e, t.pillarConvex, n, _, s, o, a, l, null, null, d, f, null)), d && P || (t.getConvexTrianglePillar(b, y, !0), Ke.pointToWorldFrame(i, o, t.pillarOffset, _), n.distanceTo(_) < t.pillarConvex.boundingSphereRadius + e.boundingSphereRadius && (P = this.convexConvex(e, t.pillarConvex, n, _, s, o, a, l, null, null, d, f, null)), d && P))
            return !0;
        }
  }
  sphereParticle(e, t, n, i, s, o, a, l, c, h, d) {
    const u = _u;
    if (u.set(0, 0, 1), i.vsub(n, u), u.lengthSquared() <= e.radius * e.radius) {
      if (d)
        return !0;
      const g = this.createContactEquation(l, a, t, e, c, h);
      u.normalize(), g.rj.copy(u), g.rj.scale(e.radius, g.rj), g.ni.copy(u), g.ni.negate(g.ni), g.ri.set(0, 0, 0), this.result.push(g), this.createFrictionEquationsFromContact(g, this.frictionResult);
    }
  }
  planeParticle(e, t, n, i, s, o, a, l, c, h, d) {
    const u = pu;
    u.set(0, 0, 1), a.quaternion.vmult(u, u);
    const m = mu;
    if (i.vsub(a.position, m), u.dot(m) <= 0) {
      if (d)
        return !0;
      const _ = this.createContactEquation(l, a, t, e, c, h);
      _.ni.copy(u), _.ni.negate(_.ni), _.ri.set(0, 0, 0);
      const f = gu;
      u.scale(u.dot(i), f), i.vsub(f, f), _.rj.copy(f), this.result.push(_), this.createFrictionEquationsFromContact(_, this.frictionResult);
    }
  }
  boxParticle(e, t, n, i, s, o, a, l, c, h, d) {
    return e.convexPolyhedronRepresentation.material = e.material, e.convexPolyhedronRepresentation.collisionResponse = e.collisionResponse, this.convexParticle(e.convexPolyhedronRepresentation, t, n, i, s, o, a, l, e, t, d);
  }
  convexParticle(e, t, n, i, s, o, a, l, c, h, d) {
    let u = -1;
    const m = xu, g = yu;
    let _ = null;
    const f = vu;
    if (f.copy(i), f.vsub(n, f), s.conjugate(ca), ca.vmult(f, f), e.pointIsInside(f)) {
      e.worldVerticesNeedsUpdate && e.computeWorldVertices(n, s), e.worldFaceNormalsNeedsUpdate && e.computeWorldFaceNormals(s);
      for (let p = 0, v = e.faces.length; p !== v; p++) {
        const M = [e.worldVertices[e.faces[p][0]]], x = e.worldFaceNormals[p];
        i.vsub(M[0], ha);
        const A = -x.dot(ha);
        if (_ === null || Math.abs(A) < Math.abs(_)) {
          if (d)
            return !0;
          _ = A, u = p, m.copy(x);
        }
      }
      if (u !== -1) {
        const p = this.createContactEquation(l, a, t, e, c, h);
        m.scale(_, g), g.vadd(i, g), g.vsub(n, g), p.rj.copy(g), m.negate(p.ni), p.ri.set(0, 0, 0);
        const v = p.ri, M = p.rj;
        v.vadd(i, v), v.vsub(l.position, v), M.vadd(n, M), M.vsub(a.position, M), this.result.push(p), this.createFrictionEquationsFromContact(p, this.frictionResult);
      } else
        console.warn("Point found inside convex, but did not find penetrating face!");
    }
  }
  heightfieldCylinder(e, t, n, i, s, o, a, l, c, h, d) {
    return this.convexHeightfield(t, e, i, n, o, s, l, a, c, h, d);
  }
  particleCylinder(e, t, n, i, s, o, a, l, c, h, d) {
    return this.convexParticle(t, e, i, n, o, s, l, a, c, h, d);
  }
  sphereTrimesh(e, t, n, i, s, o, a, l, c, h, d) {
    const u = Rh, m = Ph, g = Dh, _ = Lh, f = Fh, p = Ih, v = Bh, M = Ch, x = Th, A = zh;
    Ke.pointToLocalFrame(i, o, n, f);
    const T = e.radius;
    v.lowerBound.set(f.x - T, f.y - T, f.z - T), v.upperBound.set(f.x + T, f.y + T, f.z + T), t.getTrianglesInAABB(v, A);
    const C = Ah, D = e.radius * e.radius;
    for (let L = 0; L < A.length; L++)
      for (let U = 0; U < 3; U++)
        if (t.getVertex(t.indices[A[L] * 3 + U], C), C.vsub(f, x), x.lengthSquared() <= D) {
          if (M.copy(C), Ke.pointToWorldFrame(i, o, M, C), C.vsub(n, x), d)
            return !0;
          let O = this.createContactEquation(a, l, e, t, c, h);
          O.ni.copy(x), O.ni.normalize(), O.ri.copy(O.ni), O.ri.scale(e.radius, O.ri), O.ri.vadd(n, O.ri), O.ri.vsub(a.position, O.ri), O.rj.copy(C), O.rj.vsub(l.position, O.rj), this.result.push(O), this.createFrictionEquationsFromContact(O, this.frictionResult);
        }
    for (let L = 0; L < A.length; L++)
      for (let U = 0; U < 3; U++) {
        t.getVertex(t.indices[A[L] * 3 + U], u), t.getVertex(t.indices[A[L] * 3 + (U + 1) % 3], m), m.vsub(u, g), f.vsub(m, p);
        const O = p.dot(g);
        f.vsub(u, p);
        let F = p.dot(g);
        if (F > 0 && O < 0 && (f.vsub(u, p), _.copy(g), _.normalize(), F = p.dot(_), _.scale(F, p), p.vadd(u, p), p.distanceTo(f) < e.radius)) {
          if (d)
            return !0;
          const V = this.createContactEquation(a, l, e, t, c, h);
          p.vsub(f, V.ni), V.ni.normalize(), V.ni.scale(e.radius, V.ri), V.ri.vadd(n, V.ri), V.ri.vsub(a.position, V.ri), Ke.pointToWorldFrame(i, o, p, p), p.vsub(l.position, V.rj), Ke.vectorToWorldFrame(o, V.ni, V.ni), Ke.vectorToWorldFrame(o, V.ri, V.ri), this.result.push(V), this.createFrictionEquationsFromContact(V, this.frictionResult);
        }
      }
    const b = Uh, y = Nh, P = Oh, B = wh;
    for (let L = 0, U = A.length; L !== U; L++) {
      t.getTriangleVertices(A[L], b, y, P), t.getNormal(A[L], B), f.vsub(b, p);
      let O = p.dot(B);
      if (B.scale(O, p), f.vsub(p, p), O = p.distanceTo(f), dt.pointInTriangle(p, b, y, P) && O < e.radius) {
        if (d)
          return !0;
        let F = this.createContactEquation(a, l, e, t, c, h);
        p.vsub(f, F.ni), F.ni.normalize(), F.ni.scale(e.radius, F.ri), F.ri.vadd(n, F.ri), F.ri.vsub(a.position, F.ri), Ke.pointToWorldFrame(i, o, p, p), p.vsub(l.position, F.rj), Ke.vectorToWorldFrame(o, F.ni, F.ni), Ke.vectorToWorldFrame(o, F.ri, F.ri), this.result.push(F), this.createFrictionEquationsFromContact(F, this.frictionResult);
      }
    }
    A.length = 0;
  }
  planeTrimesh(e, t, n, i, s, o, a, l, c, h, d) {
    const u = new S(), m = Sh;
    m.set(0, 0, 1), s.vmult(m, m);
    for (let g = 0; g < t.vertices.length / 3; g++) {
      t.getVertex(g, u);
      const _ = new S();
      _.copy(u), Ke.pointToWorldFrame(i, o, _, u);
      const f = Eh;
      if (u.vsub(n, f), m.dot(f) <= 0) {
        if (d)
          return !0;
        const v = this.createContactEquation(a, l, e, t, c, h);
        v.ni.copy(m);
        const M = bh;
        m.scale(f.dot(m), M), u.vsub(M, M), v.ri.copy(M), v.ri.vsub(a.position, v.ri), v.rj.copy(u), v.rj.vsub(l.position, v.rj), this.result.push(v), this.createFrictionEquationsFromContact(v, this.frictionResult);
      }
    }
  }
}
const zn = new S(), oi = new S(), ai = new S(), vh = new S(), xh = new S(), yh = new ft(), Mh = new ft(), Sh = new S(), Eh = new S(), bh = new S(), wh = new S(), Th = new S();
new S();
const Ah = new S(), Ch = new S(), Rh = new S(), Ph = new S(), Dh = new S(), Lh = new S(), Fh = new S(), Ih = new S(), Uh = new S(), Nh = new S(), Oh = new S(), Bh = new Ut(), zh = [], ls = new S(), la = new S(), kh = new S(), Vh = new S(), Hh = new S();
function Gh(r, e, t) {
  let n = null;
  const i = r.length;
  for (let s = 0; s !== i; s++) {
    const o = r[s], a = kh;
    r[(s + 1) % i].vsub(o, a);
    const l = Vh;
    a.cross(e, l);
    const c = Hh;
    t.vsub(o, c);
    const h = l.dot(c);
    if (n === null || h > 0 && n === !0 || h <= 0 && n === !1) {
      n === null && (n = h > 0);
      continue;
    } else
      return !1;
  }
  return !0;
}
const cs = new S(), Wh = new S(), Xh = new S(), qh = new S(), Yh = [new S(), new S(), new S(), new S(), new S(), new S()], jh = new S(), Kh = new S(), Zh = new S(), $h = new S(), Jh = new S(), Qh = new S(), eu = new S(), tu = new S(), nu = new S(), iu = new S(), su = new S(), ru = new S(), ou = new S(), au = new S();
new S();
new S();
const lu = new S(), cu = new S(), hu = new S(), uu = new S(), du = new S(), fu = new S(), pu = new S(), mu = new S(), gu = new S(), _u = new S(), ca = new ft(), vu = new S();
new S();
const xu = new S(), ha = new S(), yu = new S(), Mu = new S(), Su = new S(), Eu = [0], bu = new S(), wu = new S();
class ua {
  constructor() {
    this.current = [], this.previous = [];
  }
  getKey(e, t) {
    if (t < e) {
      const n = t;
      t = e, e = n;
    }
    return e << 16 | t;
  }
  set(e, t) {
    const n = this.getKey(e, t), i = this.current;
    let s = 0;
    for (; n > i[s]; )
      s++;
    if (n !== i[s]) {
      for (let o = i.length - 1; o >= s; o--)
        i[o + 1] = i[o];
      i[s] = n;
    }
  }
  tick() {
    const e = this.current;
    this.current = this.previous, this.previous = e, this.current.length = 0;
  }
  getDiff(e, t) {
    const n = this.current, i = this.previous, s = n.length, o = i.length;
    let a = 0;
    for (let l = 0; l < s; l++) {
      let c = !1;
      const h = n[l];
      for (; h > i[a]; )
        a++;
      c = h === i[a], c || da(e, h);
    }
    a = 0;
    for (let l = 0; l < o; l++) {
      let c = !1;
      const h = i[l];
      for (; h > n[a]; )
        a++;
      c = n[a] === h, c || da(t, h);
    }
  }
}
function da(r, e) {
  r.push((e & 4294901760) >> 16, e & 65535);
}
const Qs = (r, e) => r < e ? `${r}-${e}` : `${e}-${r}`;
class Tu {
  constructor() {
    this.data = {
      keys: []
    };
  }
  get(e, t) {
    const n = Qs(e, t);
    return this.data[n];
  }
  set(e, t, n) {
    const i = Qs(e, t);
    this.get(e, t) || this.data.keys.push(i), this.data[i] = n;
  }
  delete(e, t) {
    const n = Qs(e, t), i = this.data.keys.indexOf(n);
    i !== -1 && this.data.keys.splice(i, 1), delete this.data[n];
  }
  reset() {
    const e = this.data, t = e.keys;
    for (; t.length > 0; ) {
      const n = t.pop();
      delete e[n];
    }
  }
}
class Au extends ml {
  constructor(e) {
    e === void 0 && (e = {}), super(), this.dt = -1, this.allowSleep = !!e.allowSleep, this.contacts = [], this.frictionEquations = [], this.quatNormalizeSkip = e.quatNormalizeSkip !== void 0 ? e.quatNormalizeSkip : 0, this.quatNormalizeFast = e.quatNormalizeFast !== void 0 ? e.quatNormalizeFast : !1, this.time = 0, this.stepnumber = 0, this.default_dt = 1 / 60, this.nextId = 0, this.gravity = new S(), e.gravity && this.gravity.copy(e.gravity), e.frictionGravity && (this.frictionGravity = new S(), this.frictionGravity.copy(e.frictionGravity)), this.broadphase = e.broadphase !== void 0 ? e.broadphase : new gl(), this.bodies = [], this.hasActiveBodies = !1, this.solver = e.solver !== void 0 ? e.solver : new uh(), this.constraints = [], this.narrowphase = new _h(this), this.collisionMatrix = new $o(), this.collisionMatrixPrevious = new $o(), this.bodyOverlapKeeper = new ua(), this.shapeOverlapKeeper = new ua(), this.contactmaterials = [], this.contactMaterialTable = new Tu(), this.defaultMaterial = new ti("default"), this.defaultContactMaterial = new ei(this.defaultMaterial, this.defaultMaterial, {
      friction: 0.3,
      restitution: 0
    }), this.doProfiling = !1, this.profile = {
      solve: 0,
      makeContactConstraints: 0,
      broadphase: 0,
      integrate: 0,
      narrowphase: 0
    }, this.accumulator = 0, this.subsystems = [], this.addBodyEvent = {
      type: "addBody",
      body: null
    }, this.removeBodyEvent = {
      type: "removeBody",
      body: null
    }, this.idToBodyMap = {}, this.broadphase.setWorld(this);
  }
  getContactMaterial(e, t) {
    return this.contactMaterialTable.get(e.id, t.id);
  }
  collisionMatrixTick() {
    const e = this.collisionMatrixPrevious;
    this.collisionMatrixPrevious = this.collisionMatrix, this.collisionMatrix = e, this.collisionMatrix.reset(), this.bodyOverlapKeeper.tick(), this.shapeOverlapKeeper.tick();
  }
  addConstraint(e) {
    this.constraints.push(e);
  }
  removeConstraint(e) {
    const t = this.constraints.indexOf(e);
    t !== -1 && this.constraints.splice(t, 1);
  }
  rayTest(e, t, n) {
    n instanceof ks ? this.raycastClosest(e, t, {
      skipBackfaces: !0
    }, n) : this.raycastAll(e, t, {
      skipBackfaces: !0
    }, n);
  }
  raycastAll(e, t, n, i) {
    return n === void 0 && (n = {}), n.mode = dt.ALL, n.from = e, n.to = t, n.callback = i, er.intersectWorld(this, n);
  }
  raycastAny(e, t, n, i) {
    return n === void 0 && (n = {}), n.mode = dt.ANY, n.from = e, n.to = t, n.result = i, er.intersectWorld(this, n);
  }
  raycastClosest(e, t, n, i) {
    return n === void 0 && (n = {}), n.mode = dt.CLOSEST, n.from = e, n.to = t, n.result = i, er.intersectWorld(this, n);
  }
  addBody(e) {
    this.bodies.includes(e) || (e.index = this.bodies.length, this.bodies.push(e), e.world = this, e.initPosition.copy(e.position), e.initVelocity.copy(e.velocity), e.timeLastSleepy = this.time, e instanceof oe && (e.initAngularVelocity.copy(e.angularVelocity), e.initQuaternion.copy(e.quaternion)), this.collisionMatrix.setNumObjects(this.bodies.length), this.addBodyEvent.body = e, this.idToBodyMap[e.id] = e, this.dispatchEvent(this.addBodyEvent));
  }
  removeBody(e) {
    e.world = null;
    const t = this.bodies.length - 1, n = this.bodies, i = n.indexOf(e);
    if (i !== -1) {
      n.splice(i, 1);
      for (let s = 0; s !== n.length; s++)
        n[s].index = s;
      this.collisionMatrix.setNumObjects(t), this.removeBodyEvent.body = e, delete this.idToBodyMap[e.id], this.dispatchEvent(this.removeBodyEvent);
    }
  }
  getBodyById(e) {
    return this.idToBodyMap[e];
  }
  getShapeById(e) {
    const t = this.bodies;
    for (let n = 0; n < t.length; n++) {
      const i = t[n].shapes;
      for (let s = 0; s < i.length; s++) {
        const o = i[s];
        if (o.id === e)
          return o;
      }
    }
    return null;
  }
  addContactMaterial(e) {
    this.contactmaterials.push(e), this.contactMaterialTable.set(e.materials[0].id, e.materials[1].id, e);
  }
  removeContactMaterial(e) {
    const t = this.contactmaterials.indexOf(e);
    t !== -1 && (this.contactmaterials.splice(t, 1), this.contactMaterialTable.delete(e.materials[0].id, e.materials[1].id));
  }
  fixedStep(e, t) {
    e === void 0 && (e = 1 / 60), t === void 0 && (t = 10);
    const n = pt.now() / 1e3;
    if (!this.lastCallTime)
      this.step(e, void 0, t);
    else {
      const i = n - this.lastCallTime;
      this.step(e, i, t);
    }
    this.lastCallTime = n;
  }
  step(e, t, n) {
    if (n === void 0 && (n = 10), t === void 0)
      this.internalStep(e), this.time += e;
    else {
      this.accumulator += t;
      const i = pt.now();
      let s = 0;
      for (; this.accumulator >= e && s < n && (this.internalStep(e), this.accumulator -= e, s++, !(pt.now() - i > e * 1e3)); )
        ;
      this.accumulator = this.accumulator % e;
      const o = this.accumulator / e;
      for (let a = 0; a !== this.bodies.length; a++) {
        const l = this.bodies[a];
        l.previousPosition.lerp(l.position, o, l.interpolatedPosition), l.previousQuaternion.slerp(l.quaternion, o, l.interpolatedQuaternion), l.previousQuaternion.normalize();
      }
      this.time += t;
    }
  }
  internalStep(e) {
    this.dt = e;
    const t = this.contacts, n = Lu, i = Fu, s = this.bodies.length, o = this.bodies, a = this.solver, l = this.gravity, c = this.doProfiling, h = this.profile, d = oe.DYNAMIC;
    let u = -1 / 0;
    const m = this.constraints, g = Du;
    l.length();
    const _ = l.x, f = l.y, p = l.z;
    let v = 0;
    for (c && (u = pt.now()), v = 0; v !== s; v++) {
      const L = o[v];
      if (L.type === d) {
        const U = L.force, O = L.mass;
        U.x += O * _, U.y += O * f, U.z += O * p;
      }
    }
    for (let L = 0, U = this.subsystems.length; L !== U; L++)
      this.subsystems[L].update();
    c && (u = pt.now()), n.length = 0, i.length = 0, this.broadphase.collisionPairs(this, n, i), c && (h.broadphase = pt.now() - u);
    let M = m.length;
    for (v = 0; v !== M; v++) {
      const L = m[v];
      if (!L.collideConnected)
        for (let U = n.length - 1; U >= 0; U -= 1)
          (L.bodyA === n[U] && L.bodyB === i[U] || L.bodyB === n[U] && L.bodyA === i[U]) && (n.splice(U, 1), i.splice(U, 1));
    }
    this.collisionMatrixTick(), c && (u = pt.now());
    const x = Pu, A = t.length;
    for (v = 0; v !== A; v++)
      x.push(t[v]);
    t.length = 0;
    const T = this.frictionEquations.length;
    for (v = 0; v !== T; v++)
      g.push(this.frictionEquations[v]);
    for (this.frictionEquations.length = 0, this.narrowphase.getContacts(
      n,
      i,
      this,
      t,
      x,
      this.frictionEquations,
      g
    ), c && (h.narrowphase = pt.now() - u), c && (u = pt.now()), v = 0; v < this.frictionEquations.length; v++)
      a.addEquation(this.frictionEquations[v]);
    const C = t.length;
    for (let L = 0; L !== C; L++) {
      const U = t[L], O = U.bi, F = U.bj, K = U.si, V = U.sj;
      let $;
      if (O.material && F.material ? $ = this.getContactMaterial(O.material, F.material) || this.defaultContactMaterial : $ = this.defaultContactMaterial, $.friction, O.material && F.material && (O.material.friction >= 0 && F.material.friction >= 0 && O.material.friction * F.material.friction, O.material.restitution >= 0 && F.material.restitution >= 0 && (U.restitution = O.material.restitution * F.material.restitution)), a.addEquation(U), O.allowSleep && O.type === oe.DYNAMIC && O.sleepState === oe.SLEEPING && F.sleepState === oe.AWAKE && F.type !== oe.STATIC) {
        const se = F.velocity.lengthSquared() + F.angularVelocity.lengthSquared(), de = F.sleepSpeedLimit ** 2;
        se >= de * 2 && (O.wakeUpAfterNarrowphase = !0);
      }
      if (F.allowSleep && F.type === oe.DYNAMIC && F.sleepState === oe.SLEEPING && O.sleepState === oe.AWAKE && O.type !== oe.STATIC) {
        const se = O.velocity.lengthSquared() + O.angularVelocity.lengthSquared(), de = O.sleepSpeedLimit ** 2;
        se >= de * 2 && (F.wakeUpAfterNarrowphase = !0);
      }
      this.collisionMatrix.set(O, F, !0), this.collisionMatrixPrevious.get(O, F) || (Ni.body = F, Ni.contact = U, O.dispatchEvent(Ni), Ni.body = O, F.dispatchEvent(Ni)), this.bodyOverlapKeeper.set(O.id, F.id), this.shapeOverlapKeeper.set(K.id, V.id);
    }
    for (this.emitContactEvents(), c && (h.makeContactConstraints = pt.now() - u, u = pt.now()), v = 0; v !== s; v++) {
      const L = o[v];
      L.wakeUpAfterNarrowphase && (L.wakeUp(), L.wakeUpAfterNarrowphase = !1);
    }
    for (M = m.length, v = 0; v !== M; v++) {
      const L = m[v];
      L.update();
      for (let U = 0, O = L.equations.length; U !== O; U++) {
        const F = L.equations[U];
        a.addEquation(F);
      }
    }
    a.solve(e, this), c && (h.solve = pt.now() - u), a.removeAllEquations();
    const D = Math.pow;
    for (v = 0; v !== s; v++) {
      const L = o[v];
      if (L.type & d) {
        const U = D(1 - L.linearDamping, e), O = L.velocity;
        O.scale(U, O);
        const F = L.angularVelocity;
        if (F) {
          const K = D(1 - L.angularDamping, e);
          F.scale(K, F);
        }
      }
    }
    this.dispatchEvent(Ru), c && (u = pt.now());
    const y = this.stepnumber % (this.quatNormalizeSkip + 1) === 0, P = this.quatNormalizeFast;
    for (v = 0; v !== s; v++)
      o[v].integrate(e, y, P);
    this.clearForces(), this.broadphase.dirty = !0, c && (h.integrate = pt.now() - u), this.stepnumber += 1, this.dispatchEvent(Cu);
    let B = !0;
    if (this.allowSleep)
      for (B = !1, v = 0; v !== s; v++) {
        const L = o[v];
        L.sleepTick(this.time), L.sleepState !== oe.SLEEPING && (B = !0);
      }
    this.hasActiveBodies = B;
  }
  emitContactEvents() {
    const e = this.hasAnyEventListener("beginContact"), t = this.hasAnyEventListener("endContact");
    if ((e || t) && this.bodyOverlapKeeper.getDiff(un, dn), e) {
      for (let s = 0, o = un.length; s < o; s += 2)
        Oi.bodyA = this.getBodyById(un[s]), Oi.bodyB = this.getBodyById(un[s + 1]), this.dispatchEvent(Oi);
      Oi.bodyA = Oi.bodyB = null;
    }
    if (t) {
      for (let s = 0, o = dn.length; s < o; s += 2)
        Bi.bodyA = this.getBodyById(dn[s]), Bi.bodyB = this.getBodyById(dn[s + 1]), this.dispatchEvent(Bi);
      Bi.bodyA = Bi.bodyB = null;
    }
    un.length = dn.length = 0;
    const n = this.hasAnyEventListener("beginShapeContact"), i = this.hasAnyEventListener("endShapeContact");
    if ((n || i) && this.shapeOverlapKeeper.getDiff(un, dn), n) {
      for (let s = 0, o = un.length; s < o; s += 2) {
        const a = this.getShapeById(un[s]), l = this.getShapeById(un[s + 1]);
        fn.shapeA = a, fn.shapeB = l, a && (fn.bodyA = a.body), l && (fn.bodyB = l.body), this.dispatchEvent(fn);
      }
      fn.bodyA = fn.bodyB = fn.shapeA = fn.shapeB = null;
    }
    if (i) {
      for (let s = 0, o = dn.length; s < o; s += 2) {
        const a = this.getShapeById(dn[s]), l = this.getShapeById(dn[s + 1]);
        pn.shapeA = a, pn.shapeB = l, a && (pn.bodyA = a.body), l && (pn.bodyB = l.body), this.dispatchEvent(pn);
      }
      pn.bodyA = pn.bodyB = pn.shapeA = pn.shapeB = null;
    }
  }
  clearForces() {
    const e = this.bodies, t = e.length;
    for (let n = 0; n !== t; n++) {
      const i = e[n];
      i.force, i.torque, i.force.set(0, 0, 0), i.torque.set(0, 0, 0);
    }
  }
}
new Ut();
const er = new dt(), pt = globalThis.performance || {};
if (!pt.now) {
  let r = Date.now();
  pt.timing && pt.timing.navigationStart && (r = pt.timing.navigationStart), pt.now = () => Date.now() - r;
}
new S();
const Cu = {
  type: "postStep"
}, Ru = {
  type: "preStep"
}, Ni = {
  type: oe.COLLIDE_EVENT_NAME,
  body: null,
  contact: null
}, Pu = [], Du = [], Lu = [], Fu = [], un = [], dn = [], Oi = {
  type: "beginContact",
  bodyA: null,
  bodyB: null
}, Bi = {
  type: "endContact",
  bodyA: null,
  bodyB: null
}, fn = {
  type: "beginShapeContact",
  bodyA: null,
  bodyB: null,
  shapeA: null,
  shapeB: null
}, pn = {
  type: "endShapeContact",
  bodyA: null,
  bodyB: null,
  shapeA: null,
  shapeB: null
};
/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
const To = "176", Iu = 0, fa = 1, Uu = 2, bl = 1, wl = 2, yn = 3, Un = 0, Pt = 1, Mn = 2, Fn = 0, bi = 1, pa = 2, ma = 3, ga = 4, Nu = 5, Kn = 100, Ou = 101, Bu = 102, zu = 103, ku = 104, Vu = 200, Hu = 201, Gu = 202, Wu = 203, Ir = 204, Ur = 205, Xu = 206, qu = 207, Yu = 208, ju = 209, Ku = 210, Zu = 211, $u = 212, Ju = 213, Qu = 214, Nr = 0, Or = 1, Br = 2, Ti = 3, zr = 4, kr = 5, Vr = 6, Hr = 7, Ao = 0, ed = 1, td = 2, In = 0, nd = 1, id = 2, sd = 3, rd = 4, od = 5, ad = 6, ld = 7, Tl = 300, Ai = 301, Ci = 302, Gr = 303, Wr = 304, Xs = 306, Xr = 1e3, $n = 1001, qr = 1002, Jt = 1003, cd = 1004, hs = 1005, rn = 1006, tr = 1007, Jn = 1008, an = 1009, Al = 1010, Cl = 1011, Xi = 1012, Co = 1013, ni = 1014, Sn = 1015, $i = 1016, Ro = 1017, Po = 1018, qi = 1020, Rl = 35902, Pl = 1021, Dl = 1022, Zt = 1023, Yi = 1026, ji = 1027, Ll = 1028, Do = 1029, Fl = 1030, Lo = 1031, Fo = 1033, Ls = 33776, Fs = 33777, Is = 33778, Us = 33779, Yr = 35840, jr = 35841, Kr = 35842, Zr = 35843, $r = 36196, Jr = 37492, Qr = 37496, eo = 37808, to = 37809, no = 37810, io = 37811, so = 37812, ro = 37813, oo = 37814, ao = 37815, lo = 37816, co = 37817, ho = 37818, uo = 37819, fo = 37820, po = 37821, Ns = 36492, mo = 36494, go = 36495, Il = 36283, _o = 36284, vo = 36285, xo = 36286, hd = 3200, ud = 3201, Io = 0, dd = 1, Ln = "", Vt = "srgb", Ri = "srgb-linear", Vs = "linear", Qe = "srgb", li = 7680, _a = 519, fd = 512, pd = 513, md = 514, Ul = 515, gd = 516, _d = 517, vd = 518, xd = 519, va = 35044, xa = "300 es", En = 2e3, Hs = 2001;
class Di {
  addEventListener(e, t) {
    this._listeners === void 0 && (this._listeners = {});
    const n = this._listeners;
    n[e] === void 0 && (n[e] = []), n[e].indexOf(t) === -1 && n[e].push(t);
  }
  hasEventListener(e, t) {
    const n = this._listeners;
    return n === void 0 ? !1 : n[e] !== void 0 && n[e].indexOf(t) !== -1;
  }
  removeEventListener(e, t) {
    const n = this._listeners;
    if (n === void 0)
      return;
    const i = n[e];
    if (i !== void 0) {
      const s = i.indexOf(t);
      s !== -1 && i.splice(s, 1);
    }
  }
  dispatchEvent(e) {
    const t = this._listeners;
    if (t === void 0)
      return;
    const n = t[e.type];
    if (n !== void 0) {
      e.target = this;
      const i = n.slice(0);
      for (let s = 0, o = i.length; s < o; s++)
        i[s].call(this, e);
      e.target = null;
    }
  }
}
const Mt = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"], nr = Math.PI / 180, Gs = 180 / Math.PI;
function Ji() {
  const r = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
  return (Mt[r & 255] + Mt[r >> 8 & 255] + Mt[r >> 16 & 255] + Mt[r >> 24 & 255] + "-" + Mt[e & 255] + Mt[e >> 8 & 255] + "-" + Mt[e >> 16 & 15 | 64] + Mt[e >> 24 & 255] + "-" + Mt[t & 63 | 128] + Mt[t >> 8 & 255] + "-" + Mt[t >> 16 & 255] + Mt[t >> 24 & 255] + Mt[n & 255] + Mt[n >> 8 & 255] + Mt[n >> 16 & 255] + Mt[n >> 24 & 255]).toLowerCase();
}
function Be(r, e, t) {
  return Math.max(e, Math.min(t, r));
}
function yd(r, e) {
  return (r % e + e) % e;
}
function ir(r, e, t) {
  return (1 - t) * r + t * e;
}
function zi(r, e) {
  switch (e.constructor) {
    case Float32Array:
      return r;
    case Uint32Array:
      return r / 4294967295;
    case Uint16Array:
      return r / 65535;
    case Uint8Array:
      return r / 255;
    case Int32Array:
      return Math.max(r / 2147483647, -1);
    case Int16Array:
      return Math.max(r / 32767, -1);
    case Int8Array:
      return Math.max(r / 127, -1);
    default:
      throw new Error("Invalid component type.");
  }
}
function Rt(r, e) {
  switch (e.constructor) {
    case Float32Array:
      return r;
    case Uint32Array:
      return Math.round(r * 4294967295);
    case Uint16Array:
      return Math.round(r * 65535);
    case Uint8Array:
      return Math.round(r * 255);
    case Int32Array:
      return Math.round(r * 2147483647);
    case Int16Array:
      return Math.round(r * 32767);
    case Int8Array:
      return Math.round(r * 127);
    default:
      throw new Error("Invalid component type.");
  }
}
class ze {
  constructor(e = 0, t = 0) {
    ze.prototype.isVector2 = !0, this.x = e, this.y = t;
  }
  get width() {
    return this.x;
  }
  set width(e) {
    this.x = e;
  }
  get height() {
    return this.y;
  }
  set height(e) {
    this.y = e;
  }
  set(e, t) {
    return this.x = e, this.y = t, this;
  }
  setScalar(e) {
    return this.x = e, this.y = e, this;
  }
  setX(e) {
    return this.x = e, this;
  }
  setY(e) {
    return this.y = e, this;
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      default:
        throw new Error("index is out of range: " + e);
    }
    return this;
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y);
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this;
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this;
  }
  addScalar(e) {
    return this.x += e, this.y += e, this;
  }
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this;
  }
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this;
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this;
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this;
  }
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this;
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this;
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this;
  }
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  applyMatrix3(e) {
    const t = this.x, n = this.y, i = e.elements;
    return this.x = i[0] * t + i[3] * n + i[6], this.y = i[1] * t + i[4] * n + i[7], this;
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this;
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this;
  }
  clamp(e, t) {
    return this.x = Be(this.x, e.x, t.x), this.y = Be(this.y, e.y, t.y), this;
  }
  clampScalar(e, t) {
    return this.x = Be(this.x, e, t), this.y = Be(this.y, e, t), this;
  }
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Be(n, e, t));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y;
  }
  cross(e) {
    return this.x * e.y - this.y * e.x;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  angle() {
    return Math.atan2(-this.y, -this.x) + Math.PI;
  }
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0)
      return Math.PI / 2;
    const n = this.dot(e) / t;
    return Math.acos(Be(n, -1, 1));
  }
  distanceTo(e) {
    return Math.sqrt(this.distanceToSquared(e));
  }
  distanceToSquared(e) {
    const t = this.x - e.x, n = this.y - e.y;
    return t * t + n * n;
  }
  manhattanDistanceTo(e) {
    return Math.abs(this.x - e.x) + Math.abs(this.y - e.y);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this;
  }
  lerpVectors(e, t, n) {
    return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y;
  }
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e;
  }
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this;
  }
  rotateAround(e, t) {
    const n = Math.cos(t), i = Math.sin(t), s = this.x - e.x, o = this.y - e.y;
    return this.x = s * n - o * i + e.x, this.y = s * i + o * n + e.y, this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y;
  }
}
class Ie {
  constructor(e, t, n, i, s, o, a, l, c) {
    Ie.prototype.isMatrix3 = !0, this.elements = [
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ], e !== void 0 && this.set(e, t, n, i, s, o, a, l, c);
  }
  set(e, t, n, i, s, o, a, l, c) {
    const h = this.elements;
    return h[0] = e, h[1] = i, h[2] = a, h[3] = t, h[4] = s, h[5] = l, h[6] = n, h[7] = o, h[8] = c, this;
  }
  identity() {
    return this.set(
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ), this;
  }
  copy(e) {
    const t = this.elements, n = e.elements;
    return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], this;
  }
  extractBasis(e, t, n) {
    return e.setFromMatrix3Column(this, 0), t.setFromMatrix3Column(this, 1), n.setFromMatrix3Column(this, 2), this;
  }
  setFromMatrix4(e) {
    const t = e.elements;
    return this.set(
      t[0],
      t[4],
      t[8],
      t[1],
      t[5],
      t[9],
      t[2],
      t[6],
      t[10]
    ), this;
  }
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  multiplyMatrices(e, t) {
    const n = e.elements, i = t.elements, s = this.elements, o = n[0], a = n[3], l = n[6], c = n[1], h = n[4], d = n[7], u = n[2], m = n[5], g = n[8], _ = i[0], f = i[3], p = i[6], v = i[1], M = i[4], x = i[7], A = i[2], T = i[5], C = i[8];
    return s[0] = o * _ + a * v + l * A, s[3] = o * f + a * M + l * T, s[6] = o * p + a * x + l * C, s[1] = c * _ + h * v + d * A, s[4] = c * f + h * M + d * T, s[7] = c * p + h * x + d * C, s[2] = u * _ + m * v + g * A, s[5] = u * f + m * M + g * T, s[8] = u * p + m * x + g * C, this;
  }
  multiplyScalar(e) {
    const t = this.elements;
    return t[0] *= e, t[3] *= e, t[6] *= e, t[1] *= e, t[4] *= e, t[7] *= e, t[2] *= e, t[5] *= e, t[8] *= e, this;
  }
  determinant() {
    const e = this.elements, t = e[0], n = e[1], i = e[2], s = e[3], o = e[4], a = e[5], l = e[6], c = e[7], h = e[8];
    return t * o * h - t * a * c - n * s * h + n * a * l + i * s * c - i * o * l;
  }
  invert() {
    const e = this.elements, t = e[0], n = e[1], i = e[2], s = e[3], o = e[4], a = e[5], l = e[6], c = e[7], h = e[8], d = h * o - a * c, u = a * l - h * s, m = c * s - o * l, g = t * d + n * u + i * m;
    if (g === 0)
      return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const _ = 1 / g;
    return e[0] = d * _, e[1] = (i * c - h * n) * _, e[2] = (a * n - i * o) * _, e[3] = u * _, e[4] = (h * t - i * l) * _, e[5] = (i * s - a * t) * _, e[6] = m * _, e[7] = (n * l - c * t) * _, e[8] = (o * t - n * s) * _, this;
  }
  transpose() {
    let e;
    const t = this.elements;
    return e = t[1], t[1] = t[3], t[3] = e, e = t[2], t[2] = t[6], t[6] = e, e = t[5], t[5] = t[7], t[7] = e, this;
  }
  getNormalMatrix(e) {
    return this.setFromMatrix4(e).invert().transpose();
  }
  transposeIntoArray(e) {
    const t = this.elements;
    return e[0] = t[0], e[1] = t[3], e[2] = t[6], e[3] = t[1], e[4] = t[4], e[5] = t[7], e[6] = t[2], e[7] = t[5], e[8] = t[8], this;
  }
  setUvTransform(e, t, n, i, s, o, a) {
    const l = Math.cos(s), c = Math.sin(s);
    return this.set(
      n * l,
      n * c,
      -n * (l * o + c * a) + o + e,
      -i * c,
      i * l,
      -i * (-c * o + l * a) + a + t,
      0,
      0,
      1
    ), this;
  }
  scale(e, t) {
    return this.premultiply(sr.makeScale(e, t)), this;
  }
  rotate(e) {
    return this.premultiply(sr.makeRotation(-e)), this;
  }
  translate(e, t) {
    return this.premultiply(sr.makeTranslation(e, t)), this;
  }
  makeTranslation(e, t) {
    return e.isVector2 ? this.set(
      1,
      0,
      e.x,
      0,
      1,
      e.y,
      0,
      0,
      1
    ) : this.set(
      1,
      0,
      e,
      0,
      1,
      t,
      0,
      0,
      1
    ), this;
  }
  makeRotation(e) {
    const t = Math.cos(e), n = Math.sin(e);
    return this.set(
      t,
      -n,
      0,
      n,
      t,
      0,
      0,
      0,
      1
    ), this;
  }
  makeScale(e, t) {
    return this.set(
      e,
      0,
      0,
      0,
      t,
      0,
      0,
      0,
      1
    ), this;
  }
  equals(e) {
    const t = this.elements, n = e.elements;
    for (let i = 0; i < 9; i++)
      if (t[i] !== n[i])
        return !1;
    return !0;
  }
  fromArray(e, t = 0) {
    for (let n = 0; n < 9; n++)
      this.elements[n] = e[n + t];
    return this;
  }
  toArray(e = [], t = 0) {
    const n = this.elements;
    return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e;
  }
  clone() {
    return new this.constructor().fromArray(this.elements);
  }
}
const sr = /* @__PURE__ */ new Ie();
function Nl(r) {
  for (let e = r.length - 1; e >= 0; --e)
    if (r[e] >= 65535)
      return !0;
  return !1;
}
function Ws(r) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", r);
}
function Md() {
  const r = Ws("canvas");
  return r.style.display = "block", r;
}
const ya = {};
function Os(r) {
  r in ya || (ya[r] = !0, console.warn(r));
}
function Sd(r, e, t) {
  return new Promise(function(n, i) {
    function s() {
      switch (r.clientWaitSync(e, r.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case r.WAIT_FAILED:
          i();
          break;
        case r.TIMEOUT_EXPIRED:
          setTimeout(s, t);
          break;
        default:
          n();
      }
    }
    setTimeout(s, t);
  });
}
function Ed(r) {
  const e = r.elements;
  e[2] = 0.5 * e[2] + 0.5 * e[3], e[6] = 0.5 * e[6] + 0.5 * e[7], e[10] = 0.5 * e[10] + 0.5 * e[11], e[14] = 0.5 * e[14] + 0.5 * e[15];
}
function bd(r) {
  const e = r.elements;
  e[11] === -1 ? (e[10] = -e[10] - 1, e[14] = -e[14]) : (e[10] = -e[10], e[14] = -e[14] + 1);
}
const Ma = /* @__PURE__ */ new Ie().set(
  0.4123908,
  0.3575843,
  0.1804808,
  0.212639,
  0.7151687,
  0.0721923,
  0.0193308,
  0.1191948,
  0.9505322
), Sa = /* @__PURE__ */ new Ie().set(
  3.2409699,
  -1.5373832,
  -0.4986108,
  -0.9692436,
  1.8759675,
  0.0415551,
  0.0556301,
  -0.203977,
  1.0569715
);
function wd() {
  const r = {
    enabled: !0,
    workingColorSpace: Ri,
    spaces: {},
    convert: function(i, s, o) {
      return this.enabled === !1 || s === o || !s || !o || (this.spaces[s].transfer === Qe && (i.r = bn(i.r), i.g = bn(i.g), i.b = bn(i.b)), this.spaces[s].primaries !== this.spaces[o].primaries && (i.applyMatrix3(this.spaces[s].toXYZ), i.applyMatrix3(this.spaces[o].fromXYZ)), this.spaces[o].transfer === Qe && (i.r = wi(i.r), i.g = wi(i.g), i.b = wi(i.b))), i;
    },
    fromWorkingColorSpace: function(i, s) {
      return this.convert(i, this.workingColorSpace, s);
    },
    toWorkingColorSpace: function(i, s) {
      return this.convert(i, s, this.workingColorSpace);
    },
    getPrimaries: function(i) {
      return this.spaces[i].primaries;
    },
    getTransfer: function(i) {
      return i === Ln ? Vs : this.spaces[i].transfer;
    },
    getLuminanceCoefficients: function(i, s = this.workingColorSpace) {
      return i.fromArray(this.spaces[s].luminanceCoefficients);
    },
    define: function(i) {
      Object.assign(this.spaces, i);
    },
    _getMatrix: function(i, s, o) {
      return i.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ);
    },
    _getDrawingBufferColorSpace: function(i) {
      return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace;
    },
    _getUnpackColorSpace: function(i = this.workingColorSpace) {
      return this.spaces[i].workingColorSpaceConfig.unpackColorSpace;
    }
  }, e = [0.64, 0.33, 0.3, 0.6, 0.15, 0.06], t = [0.2126, 0.7152, 0.0722], n = [0.3127, 0.329];
  return r.define({
    [Ri]: {
      primaries: e,
      whitePoint: n,
      transfer: Vs,
      toXYZ: Ma,
      fromXYZ: Sa,
      luminanceCoefficients: t,
      workingColorSpaceConfig: { unpackColorSpace: Vt },
      outputColorSpaceConfig: { drawingBufferColorSpace: Vt }
    },
    [Vt]: {
      primaries: e,
      whitePoint: n,
      transfer: Qe,
      toXYZ: Ma,
      fromXYZ: Sa,
      luminanceCoefficients: t,
      outputColorSpaceConfig: { drawingBufferColorSpace: Vt }
    }
  }), r;
}
const Ye = /* @__PURE__ */ wd();
function bn(r) {
  return r < 0.04045 ? r * 0.0773993808 : Math.pow(r * 0.9478672986 + 0.0521327014, 2.4);
}
function wi(r) {
  return r < 31308e-7 ? r * 12.92 : 1.055 * Math.pow(r, 0.41666) - 0.055;
}
let ci;
class Td {
  static getDataURL(e, t = "image/png") {
    if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u")
      return e.src;
    let n;
    if (e instanceof HTMLCanvasElement)
      n = e;
    else {
      ci === void 0 && (ci = Ws("canvas")), ci.width = e.width, ci.height = e.height;
      const i = ci.getContext("2d");
      e instanceof ImageData ? i.putImageData(e, 0, 0) : i.drawImage(e, 0, 0, e.width, e.height), n = ci;
    }
    return n.toDataURL(t);
  }
  static sRGBToLinear(e) {
    if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
      const t = Ws("canvas");
      t.width = e.width, t.height = e.height;
      const n = t.getContext("2d");
      n.drawImage(e, 0, 0, e.width, e.height);
      const i = n.getImageData(0, 0, e.width, e.height), s = i.data;
      for (let o = 0; o < s.length; o++)
        s[o] = bn(s[o] / 255) * 255;
      return n.putImageData(i, 0, 0), t;
    } else if (e.data) {
      const t = e.data.slice(0);
      for (let n = 0; n < t.length; n++)
        t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[n] = Math.floor(bn(t[n] / 255) * 255) : t[n] = bn(t[n]);
      return {
        data: t,
        width: e.width,
        height: e.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
  }
}
let Ad = 0;
class Uo {
  constructor(e = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: Ad++ }), this.uuid = Ji(), this.data = e, this.dataReady = !0, this.version = 0;
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    if (!t && e.images[this.uuid] !== void 0)
      return e.images[this.uuid];
    const n = {
      uuid: this.uuid,
      url: ""
    }, i = this.data;
    if (i !== null) {
      let s;
      if (Array.isArray(i)) {
        s = [];
        for (let o = 0, a = i.length; o < a; o++)
          i[o].isDataTexture ? s.push(rr(i[o].image)) : s.push(rr(i[o]));
      } else
        s = rr(i);
      n.url = s;
    }
    return t || (e.images[this.uuid] = n), n;
  }
}
function rr(r) {
  return typeof HTMLImageElement < "u" && r instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && r instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && r instanceof ImageBitmap ? Td.getDataURL(r) : r.data ? {
    data: Array.from(r.data),
    width: r.width,
    height: r.height,
    type: r.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let Cd = 0;
class bt extends Di {
  constructor(e = bt.DEFAULT_IMAGE, t = bt.DEFAULT_MAPPING, n = $n, i = $n, s = rn, o = Jn, a = Zt, l = an, c = bt.DEFAULT_ANISOTROPY, h = Ln) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: Cd++ }), this.uuid = Ji(), this.name = "", this.source = new Uo(e), this.mipmaps = [], this.mapping = t, this.channel = 0, this.wrapS = n, this.wrapT = i, this.magFilter = s, this.minFilter = o, this.anisotropy = c, this.format = a, this.internalFormat = null, this.type = l, this.offset = new ze(0, 0), this.repeat = new ze(1, 1), this.center = new ze(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Ie(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = !1, this.isTextureArray = !1, this.pmremVersion = 0;
  }
  get image() {
    return this.source.data;
  }
  set image(e = null) {
    this.source.data = e;
  }
  updateMatrix() {
    this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.name = e.name, this.source = e.source, this.mipmaps = e.mipmaps.slice(0), this.mapping = e.mapping, this.channel = e.channel, this.wrapS = e.wrapS, this.wrapT = e.wrapT, this.magFilter = e.magFilter, this.minFilter = e.minFilter, this.anisotropy = e.anisotropy, this.format = e.format, this.internalFormat = e.internalFormat, this.type = e.type, this.offset.copy(e.offset), this.repeat.copy(e.repeat), this.center.copy(e.center), this.rotation = e.rotation, this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrix.copy(e.matrix), this.generateMipmaps = e.generateMipmaps, this.premultiplyAlpha = e.premultiplyAlpha, this.flipY = e.flipY, this.unpackAlignment = e.unpackAlignment, this.colorSpace = e.colorSpace, this.renderTarget = e.renderTarget, this.isRenderTargetTexture = e.isRenderTargetTexture, this.isTextureArray = e.isTextureArray, this.userData = JSON.parse(JSON.stringify(e.userData)), this.needsUpdate = !0, this;
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    if (!t && e.textures[this.uuid] !== void 0)
      return e.textures[this.uuid];
    const n = {
      metadata: {
        version: 4.6,
        type: "Texture",
        generator: "Texture.toJSON"
      },
      uuid: this.uuid,
      name: this.name,
      image: this.source.toJSON(e).uuid,
      mapping: this.mapping,
      channel: this.channel,
      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,
      wrap: [this.wrapS, this.wrapT],
      format: this.format,
      internalFormat: this.internalFormat,
      type: this.type,
      colorSpace: this.colorSpace,
      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,
      flipY: this.flipY,
      generateMipmaps: this.generateMipmaps,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment
    };
    return Object.keys(this.userData).length > 0 && (n.userData = this.userData), t || (e.textures[this.uuid] = n), n;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  transformUv(e) {
    if (this.mapping !== Tl)
      return e;
    if (e.applyMatrix3(this.matrix), e.x < 0 || e.x > 1)
      switch (this.wrapS) {
        case Xr:
          e.x = e.x - Math.floor(e.x);
          break;
        case $n:
          e.x = e.x < 0 ? 0 : 1;
          break;
        case qr:
          Math.abs(Math.floor(e.x) % 2) === 1 ? e.x = Math.ceil(e.x) - e.x : e.x = e.x - Math.floor(e.x);
          break;
      }
    if (e.y < 0 || e.y > 1)
      switch (this.wrapT) {
        case Xr:
          e.y = e.y - Math.floor(e.y);
          break;
        case $n:
          e.y = e.y < 0 ? 0 : 1;
          break;
        case qr:
          Math.abs(Math.floor(e.y) % 2) === 1 ? e.y = Math.ceil(e.y) - e.y : e.y = e.y - Math.floor(e.y);
          break;
      }
    return this.flipY && (e.y = 1 - e.y), e;
  }
  set needsUpdate(e) {
    e === !0 && (this.version++, this.source.needsUpdate = !0);
  }
  set needsPMREMUpdate(e) {
    e === !0 && this.pmremVersion++;
  }
}
bt.DEFAULT_IMAGE = null;
bt.DEFAULT_MAPPING = Tl;
bt.DEFAULT_ANISOTROPY = 1;
class lt {
  constructor(e = 0, t = 0, n = 0, i = 1) {
    lt.prototype.isVector4 = !0, this.x = e, this.y = t, this.z = n, this.w = i;
  }
  get width() {
    return this.z;
  }
  set width(e) {
    this.z = e;
  }
  get height() {
    return this.w;
  }
  set height(e) {
    this.w = e;
  }
  set(e, t, n, i) {
    return this.x = e, this.y = t, this.z = n, this.w = i, this;
  }
  setScalar(e) {
    return this.x = e, this.y = e, this.z = e, this.w = e, this;
  }
  setX(e) {
    return this.x = e, this;
  }
  setY(e) {
    return this.y = e, this;
  }
  setZ(e) {
    return this.z = e, this;
  }
  setW(e) {
    return this.w = e, this;
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      case 2:
        this.z = t;
        break;
      case 3:
        this.w = t;
        break;
      default:
        throw new Error("index is out of range: " + e);
    }
    return this;
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.w);
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this.z = e.z, this.w = e.w !== void 0 ? e.w : 1, this;
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this.z += e.z, this.w += e.w, this;
  }
  addScalar(e) {
    return this.x += e, this.y += e, this.z += e, this.w += e, this;
  }
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this.w = e.w + t.w, this;
  }
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this.w += e.w * t, this;
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this.z -= e.z, this.w -= e.w, this;
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this.z -= e, this.w -= e, this;
  }
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this.w = e.w - t.w, this;
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this.z *= e.z, this.w *= e.w, this;
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this.z *= e, this.w *= e, this;
  }
  applyMatrix4(e) {
    const t = this.x, n = this.y, i = this.z, s = this.w, o = e.elements;
    return this.x = o[0] * t + o[4] * n + o[8] * i + o[12] * s, this.y = o[1] * t + o[5] * n + o[9] * i + o[13] * s, this.z = o[2] * t + o[6] * n + o[10] * i + o[14] * s, this.w = o[3] * t + o[7] * n + o[11] * i + o[15] * s, this;
  }
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this.z /= e.z, this.w /= e.w, this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  setAxisAngleFromQuaternion(e) {
    this.w = 2 * Math.acos(e.w);
    const t = Math.sqrt(1 - e.w * e.w);
    return t < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = e.x / t, this.y = e.y / t, this.z = e.z / t), this;
  }
  setAxisAngleFromRotationMatrix(e) {
    let t, n, i, s;
    const l = e.elements, c = l[0], h = l[4], d = l[8], u = l[1], m = l[5], g = l[9], _ = l[2], f = l[6], p = l[10];
    if (Math.abs(h - u) < 0.01 && Math.abs(d - _) < 0.01 && Math.abs(g - f) < 0.01) {
      if (Math.abs(h + u) < 0.1 && Math.abs(d + _) < 0.1 && Math.abs(g + f) < 0.1 && Math.abs(c + m + p - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      t = Math.PI;
      const M = (c + 1) / 2, x = (m + 1) / 2, A = (p + 1) / 2, T = (h + u) / 4, C = (d + _) / 4, D = (g + f) / 4;
      return M > x && M > A ? M < 0.01 ? (n = 0, i = 0.707106781, s = 0.707106781) : (n = Math.sqrt(M), i = T / n, s = C / n) : x > A ? x < 0.01 ? (n = 0.707106781, i = 0, s = 0.707106781) : (i = Math.sqrt(x), n = T / i, s = D / i) : A < 0.01 ? (n = 0.707106781, i = 0.707106781, s = 0) : (s = Math.sqrt(A), n = C / s, i = D / s), this.set(n, i, s, t), this;
    }
    let v = Math.sqrt((f - g) * (f - g) + (d - _) * (d - _) + (u - h) * (u - h));
    return Math.abs(v) < 1e-3 && (v = 1), this.x = (f - g) / v, this.y = (d - _) / v, this.z = (u - h) / v, this.w = Math.acos((c + m + p - 1) / 2), this;
  }
  setFromMatrixPosition(e) {
    const t = e.elements;
    return this.x = t[12], this.y = t[13], this.z = t[14], this.w = t[15], this;
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this.w = Math.min(this.w, e.w), this;
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this.w = Math.max(this.w, e.w), this;
  }
  clamp(e, t) {
    return this.x = Be(this.x, e.x, t.x), this.y = Be(this.y, e.y, t.y), this.z = Be(this.z, e.z, t.z), this.w = Be(this.w, e.w, t.w), this;
  }
  clampScalar(e, t) {
    return this.x = Be(this.x, e, t), this.y = Be(this.y, e, t), this.z = Be(this.z, e, t), this.w = Be(this.w, e, t), this;
  }
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Be(n, e, t));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this.w += (e.w - this.w) * t, this;
  }
  lerpVectors(e, t, n) {
    return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this.w = e.w + (t.w - e.w) * n, this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y && e.z === this.z && e.w === this.w;
  }
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this.w = e[t + 3], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e[t + 3] = this.w, e;
  }
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this.w = e.getW(t), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z, yield this.w;
  }
}
class Rd extends Di {
  constructor(e = 1, t = 1, n = {}) {
    super(), this.isRenderTarget = !0, this.width = e, this.height = t, this.depth = n.depth ? n.depth : 1, this.scissor = new lt(0, 0, e, t), this.scissorTest = !1, this.viewport = new lt(0, 0, e, t);
    const i = { width: e, height: t, depth: this.depth };
    n = Object.assign({
      generateMipmaps: !1,
      internalFormat: null,
      minFilter: rn,
      depthBuffer: !0,
      stencilBuffer: !1,
      resolveDepthBuffer: !0,
      resolveStencilBuffer: !0,
      depthTexture: null,
      samples: 0,
      count: 1,
      multiview: !1
    }, n);
    const s = new bt(i, n.mapping, n.wrapS, n.wrapT, n.magFilter, n.minFilter, n.format, n.type, n.anisotropy, n.colorSpace);
    s.flipY = !1, s.generateMipmaps = n.generateMipmaps, s.internalFormat = n.internalFormat, this.textures = [];
    const o = n.count;
    for (let a = 0; a < o; a++)
      this.textures[a] = s.clone(), this.textures[a].isRenderTargetTexture = !0, this.textures[a].renderTarget = this;
    this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this._depthTexture = null, this.depthTexture = n.depthTexture, this.samples = n.samples, this.multiview = n.multiview;
  }
  get texture() {
    return this.textures[0];
  }
  set texture(e) {
    this.textures[0] = e;
  }
  set depthTexture(e) {
    this._depthTexture !== null && (this._depthTexture.renderTarget = null), e !== null && (e.renderTarget = this), this._depthTexture = e;
  }
  get depthTexture() {
    return this._depthTexture;
  }
  setSize(e, t, n = 1) {
    if (this.width !== e || this.height !== t || this.depth !== n) {
      this.width = e, this.height = t, this.depth = n;
      for (let i = 0, s = this.textures.length; i < s; i++)
        this.textures[i].image.width = e, this.textures[i].image.height = t, this.textures[i].image.depth = n;
      this.dispose();
    }
    this.viewport.set(0, 0, e, t), this.scissor.set(0, 0, e, t);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.width = e.width, this.height = e.height, this.depth = e.depth, this.scissor.copy(e.scissor), this.scissorTest = e.scissorTest, this.viewport.copy(e.viewport), this.textures.length = 0;
    for (let t = 0, n = e.textures.length; t < n; t++) {
      this.textures[t] = e.textures[t].clone(), this.textures[t].isRenderTargetTexture = !0, this.textures[t].renderTarget = this;
      const i = Object.assign({}, e.textures[t].image);
      this.textures[t].source = new Uo(i);
    }
    return this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class ii extends Rd {
  constructor(e = 1, t = 1, n = {}) {
    super(e, t, n), this.isWebGLRenderTarget = !0;
  }
}
class Ol extends bt {
  constructor(e = null, t = 1, n = 1, i = 1) {
    super(null), this.isDataArrayTexture = !0, this.image = { data: e, width: t, height: n, depth: i }, this.magFilter = Jt, this.minFilter = Jt, this.wrapR = $n, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
  }
  addLayerUpdate(e) {
    this.layerUpdates.add(e);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}
class Pd extends bt {
  constructor(e = null, t = 1, n = 1, i = 1) {
    super(null), this.isData3DTexture = !0, this.image = { data: e, width: t, height: n, depth: i }, this.magFilter = Jt, this.minFilter = Jt, this.wrapR = $n, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
class Qi {
  constructor(e = 0, t = 0, n = 0, i = 1) {
    this.isQuaternion = !0, this._x = e, this._y = t, this._z = n, this._w = i;
  }
  static slerpFlat(e, t, n, i, s, o, a) {
    let l = n[i + 0], c = n[i + 1], h = n[i + 2], d = n[i + 3];
    const u = s[o + 0], m = s[o + 1], g = s[o + 2], _ = s[o + 3];
    if (a === 0) {
      e[t + 0] = l, e[t + 1] = c, e[t + 2] = h, e[t + 3] = d;
      return;
    }
    if (a === 1) {
      e[t + 0] = u, e[t + 1] = m, e[t + 2] = g, e[t + 3] = _;
      return;
    }
    if (d !== _ || l !== u || c !== m || h !== g) {
      let f = 1 - a;
      const p = l * u + c * m + h * g + d * _, v = p >= 0 ? 1 : -1, M = 1 - p * p;
      if (M > Number.EPSILON) {
        const A = Math.sqrt(M), T = Math.atan2(A, p * v);
        f = Math.sin(f * T) / A, a = Math.sin(a * T) / A;
      }
      const x = a * v;
      if (l = l * f + u * x, c = c * f + m * x, h = h * f + g * x, d = d * f + _ * x, f === 1 - a) {
        const A = 1 / Math.sqrt(l * l + c * c + h * h + d * d);
        l *= A, c *= A, h *= A, d *= A;
      }
    }
    e[t] = l, e[t + 1] = c, e[t + 2] = h, e[t + 3] = d;
  }
  static multiplyQuaternionsFlat(e, t, n, i, s, o) {
    const a = n[i], l = n[i + 1], c = n[i + 2], h = n[i + 3], d = s[o], u = s[o + 1], m = s[o + 2], g = s[o + 3];
    return e[t] = a * g + h * d + l * m - c * u, e[t + 1] = l * g + h * u + c * d - a * m, e[t + 2] = c * g + h * m + a * u - l * d, e[t + 3] = h * g - a * d - l * u - c * m, e;
  }
  get x() {
    return this._x;
  }
  set x(e) {
    this._x = e, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(e) {
    this._y = e, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(e) {
    this._z = e, this._onChangeCallback();
  }
  get w() {
    return this._w;
  }
  set w(e) {
    this._w = e, this._onChangeCallback();
  }
  set(e, t, n, i) {
    return this._x = e, this._y = t, this._z = n, this._w = i, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._w);
  }
  copy(e) {
    return this._x = e.x, this._y = e.y, this._z = e.z, this._w = e.w, this._onChangeCallback(), this;
  }
  setFromEuler(e, t = !0) {
    const n = e._x, i = e._y, s = e._z, o = e._order, a = Math.cos, l = Math.sin, c = a(n / 2), h = a(i / 2), d = a(s / 2), u = l(n / 2), m = l(i / 2), g = l(s / 2);
    switch (o) {
      case "XYZ":
        this._x = u * h * d + c * m * g, this._y = c * m * d - u * h * g, this._z = c * h * g + u * m * d, this._w = c * h * d - u * m * g;
        break;
      case "YXZ":
        this._x = u * h * d + c * m * g, this._y = c * m * d - u * h * g, this._z = c * h * g - u * m * d, this._w = c * h * d + u * m * g;
        break;
      case "ZXY":
        this._x = u * h * d - c * m * g, this._y = c * m * d + u * h * g, this._z = c * h * g + u * m * d, this._w = c * h * d - u * m * g;
        break;
      case "ZYX":
        this._x = u * h * d - c * m * g, this._y = c * m * d + u * h * g, this._z = c * h * g - u * m * d, this._w = c * h * d + u * m * g;
        break;
      case "YZX":
        this._x = u * h * d + c * m * g, this._y = c * m * d + u * h * g, this._z = c * h * g - u * m * d, this._w = c * h * d - u * m * g;
        break;
      case "XZY":
        this._x = u * h * d - c * m * g, this._y = c * m * d - u * h * g, this._z = c * h * g + u * m * d, this._w = c * h * d + u * m * g;
        break;
      default:
        console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + o);
    }
    return t === !0 && this._onChangeCallback(), this;
  }
  setFromAxisAngle(e, t) {
    const n = t / 2, i = Math.sin(n);
    return this._x = e.x * i, this._y = e.y * i, this._z = e.z * i, this._w = Math.cos(n), this._onChangeCallback(), this;
  }
  setFromRotationMatrix(e) {
    const t = e.elements, n = t[0], i = t[4], s = t[8], o = t[1], a = t[5], l = t[9], c = t[2], h = t[6], d = t[10], u = n + a + d;
    if (u > 0) {
      const m = 0.5 / Math.sqrt(u + 1);
      this._w = 0.25 / m, this._x = (h - l) * m, this._y = (s - c) * m, this._z = (o - i) * m;
    } else if (n > a && n > d) {
      const m = 2 * Math.sqrt(1 + n - a - d);
      this._w = (h - l) / m, this._x = 0.25 * m, this._y = (i + o) / m, this._z = (s + c) / m;
    } else if (a > d) {
      const m = 2 * Math.sqrt(1 + a - n - d);
      this._w = (s - c) / m, this._x = (i + o) / m, this._y = 0.25 * m, this._z = (l + h) / m;
    } else {
      const m = 2 * Math.sqrt(1 + d - n - a);
      this._w = (o - i) / m, this._x = (s + c) / m, this._y = (l + h) / m, this._z = 0.25 * m;
    }
    return this._onChangeCallback(), this;
  }
  setFromUnitVectors(e, t) {
    let n = e.dot(t) + 1;
    return n < Number.EPSILON ? (n = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = n)) : (this._x = e.y * t.z - e.z * t.y, this._y = e.z * t.x - e.x * t.z, this._z = e.x * t.y - e.y * t.x, this._w = n), this.normalize();
  }
  angleTo(e) {
    return 2 * Math.acos(Math.abs(Be(this.dot(e), -1, 1)));
  }
  rotateTowards(e, t) {
    const n = this.angleTo(e);
    if (n === 0)
      return this;
    const i = Math.min(1, t / n);
    return this.slerp(e, i), this;
  }
  identity() {
    return this.set(0, 0, 0, 1);
  }
  invert() {
    return this.conjugate();
  }
  conjugate() {
    return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
  }
  dot(e) {
    return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w;
  }
  lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
  }
  length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
  }
  normalize() {
    let e = this.length();
    return e === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (e = 1 / e, this._x = this._x * e, this._y = this._y * e, this._z = this._z * e, this._w = this._w * e), this._onChangeCallback(), this;
  }
  multiply(e) {
    return this.multiplyQuaternions(this, e);
  }
  premultiply(e) {
    return this.multiplyQuaternions(e, this);
  }
  multiplyQuaternions(e, t) {
    const n = e._x, i = e._y, s = e._z, o = e._w, a = t._x, l = t._y, c = t._z, h = t._w;
    return this._x = n * h + o * a + i * c - s * l, this._y = i * h + o * l + s * a - n * c, this._z = s * h + o * c + n * l - i * a, this._w = o * h - n * a - i * l - s * c, this._onChangeCallback(), this;
  }
  slerp(e, t) {
    if (t === 0)
      return this;
    if (t === 1)
      return this.copy(e);
    const n = this._x, i = this._y, s = this._z, o = this._w;
    let a = o * e._w + n * e._x + i * e._y + s * e._z;
    if (a < 0 ? (this._w = -e._w, this._x = -e._x, this._y = -e._y, this._z = -e._z, a = -a) : this.copy(e), a >= 1)
      return this._w = o, this._x = n, this._y = i, this._z = s, this;
    const l = 1 - a * a;
    if (l <= Number.EPSILON) {
      const m = 1 - t;
      return this._w = m * o + t * this._w, this._x = m * n + t * this._x, this._y = m * i + t * this._y, this._z = m * s + t * this._z, this.normalize(), this;
    }
    const c = Math.sqrt(l), h = Math.atan2(c, a), d = Math.sin((1 - t) * h) / c, u = Math.sin(t * h) / c;
    return this._w = o * d + this._w * u, this._x = n * d + this._x * u, this._y = i * d + this._y * u, this._z = s * d + this._z * u, this._onChangeCallback(), this;
  }
  slerpQuaternions(e, t, n) {
    return this.copy(e).slerp(t, n);
  }
  random() {
    const e = 2 * Math.PI * Math.random(), t = 2 * Math.PI * Math.random(), n = Math.random(), i = Math.sqrt(1 - n), s = Math.sqrt(n);
    return this.set(
      i * Math.sin(e),
      i * Math.cos(e),
      s * Math.sin(t),
      s * Math.cos(t)
    );
  }
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w;
  }
  fromArray(e, t = 0) {
    return this._x = e[t], this._y = e[t + 1], this._z = e[t + 2], this._w = e[t + 3], this._onChangeCallback(), this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._w, e;
  }
  fromBufferAttribute(e, t) {
    return this._x = e.getX(t), this._y = e.getY(t), this._z = e.getZ(t), this._w = e.getW(t), this._onChangeCallback(), this;
  }
  toJSON() {
    return this.toArray();
  }
  _onChange(e) {
    return this._onChangeCallback = e, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._w;
  }
}
class H {
  constructor(e = 0, t = 0, n = 0) {
    H.prototype.isVector3 = !0, this.x = e, this.y = t, this.z = n;
  }
  set(e, t, n) {
    return n === void 0 && (n = this.z), this.x = e, this.y = t, this.z = n, this;
  }
  setScalar(e) {
    return this.x = e, this.y = e, this.z = e, this;
  }
  setX(e) {
    return this.x = e, this;
  }
  setY(e) {
    return this.y = e, this;
  }
  setZ(e) {
    return this.z = e, this;
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      case 2:
        this.z = t;
        break;
      default:
        throw new Error("index is out of range: " + e);
    }
    return this;
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z);
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this.z = e.z, this;
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this.z += e.z, this;
  }
  addScalar(e) {
    return this.x += e, this.y += e, this.z += e, this;
  }
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this;
  }
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this;
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this.z -= e.z, this;
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this.z -= e, this;
  }
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this;
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this.z *= e.z, this;
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this.z *= e, this;
  }
  multiplyVectors(e, t) {
    return this.x = e.x * t.x, this.y = e.y * t.y, this.z = e.z * t.z, this;
  }
  applyEuler(e) {
    return this.applyQuaternion(Ea.setFromEuler(e));
  }
  applyAxisAngle(e, t) {
    return this.applyQuaternion(Ea.setFromAxisAngle(e, t));
  }
  applyMatrix3(e) {
    const t = this.x, n = this.y, i = this.z, s = e.elements;
    return this.x = s[0] * t + s[3] * n + s[6] * i, this.y = s[1] * t + s[4] * n + s[7] * i, this.z = s[2] * t + s[5] * n + s[8] * i, this;
  }
  applyNormalMatrix(e) {
    return this.applyMatrix3(e).normalize();
  }
  applyMatrix4(e) {
    const t = this.x, n = this.y, i = this.z, s = e.elements, o = 1 / (s[3] * t + s[7] * n + s[11] * i + s[15]);
    return this.x = (s[0] * t + s[4] * n + s[8] * i + s[12]) * o, this.y = (s[1] * t + s[5] * n + s[9] * i + s[13]) * o, this.z = (s[2] * t + s[6] * n + s[10] * i + s[14]) * o, this;
  }
  applyQuaternion(e) {
    const t = this.x, n = this.y, i = this.z, s = e.x, o = e.y, a = e.z, l = e.w, c = 2 * (o * i - a * n), h = 2 * (a * t - s * i), d = 2 * (s * n - o * t);
    return this.x = t + l * c + o * d - a * h, this.y = n + l * h + a * c - s * d, this.z = i + l * d + s * h - o * c, this;
  }
  project(e) {
    return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix);
  }
  unproject(e) {
    return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld);
  }
  transformDirection(e) {
    const t = this.x, n = this.y, i = this.z, s = e.elements;
    return this.x = s[0] * t + s[4] * n + s[8] * i, this.y = s[1] * t + s[5] * n + s[9] * i, this.z = s[2] * t + s[6] * n + s[10] * i, this.normalize();
  }
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this.z /= e.z, this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this;
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this;
  }
  clamp(e, t) {
    return this.x = Be(this.x, e.x, t.x), this.y = Be(this.y, e.y, t.y), this.z = Be(this.z, e.z, t.z), this;
  }
  clampScalar(e, t) {
    return this.x = Be(this.x, e, t), this.y = Be(this.y, e, t), this.z = Be(this.z, e, t), this;
  }
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Be(n, e, t));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this;
  }
  lerpVectors(e, t, n) {
    return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this;
  }
  cross(e) {
    return this.crossVectors(this, e);
  }
  crossVectors(e, t) {
    const n = e.x, i = e.y, s = e.z, o = t.x, a = t.y, l = t.z;
    return this.x = i * l - s * a, this.y = s * o - n * l, this.z = n * a - i * o, this;
  }
  projectOnVector(e) {
    const t = e.lengthSq();
    if (t === 0)
      return this.set(0, 0, 0);
    const n = e.dot(this) / t;
    return this.copy(e).multiplyScalar(n);
  }
  projectOnPlane(e) {
    return or.copy(this).projectOnVector(e), this.sub(or);
  }
  reflect(e) {
    return this.sub(or.copy(e).multiplyScalar(2 * this.dot(e)));
  }
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0)
      return Math.PI / 2;
    const n = this.dot(e) / t;
    return Math.acos(Be(n, -1, 1));
  }
  distanceTo(e) {
    return Math.sqrt(this.distanceToSquared(e));
  }
  distanceToSquared(e) {
    const t = this.x - e.x, n = this.y - e.y, i = this.z - e.z;
    return t * t + n * n + i * i;
  }
  manhattanDistanceTo(e) {
    return Math.abs(this.x - e.x) + Math.abs(this.y - e.y) + Math.abs(this.z - e.z);
  }
  setFromSpherical(e) {
    return this.setFromSphericalCoords(e.radius, e.phi, e.theta);
  }
  setFromSphericalCoords(e, t, n) {
    const i = Math.sin(t) * e;
    return this.x = i * Math.sin(n), this.y = Math.cos(t) * e, this.z = i * Math.cos(n), this;
  }
  setFromCylindrical(e) {
    return this.setFromCylindricalCoords(e.radius, e.theta, e.y);
  }
  setFromCylindricalCoords(e, t, n) {
    return this.x = e * Math.sin(t), this.y = n, this.z = e * Math.cos(t), this;
  }
  setFromMatrixPosition(e) {
    const t = e.elements;
    return this.x = t[12], this.y = t[13], this.z = t[14], this;
  }
  setFromMatrixScale(e) {
    const t = this.setFromMatrixColumn(e, 0).length(), n = this.setFromMatrixColumn(e, 1).length(), i = this.setFromMatrixColumn(e, 2).length();
    return this.x = t, this.y = n, this.z = i, this;
  }
  setFromMatrixColumn(e, t) {
    return this.fromArray(e.elements, t * 4);
  }
  setFromMatrix3Column(e, t) {
    return this.fromArray(e.elements, t * 3);
  }
  setFromEuler(e) {
    return this.x = e._x, this.y = e._y, this.z = e._z, this;
  }
  setFromColor(e) {
    return this.x = e.r, this.y = e.g, this.z = e.b, this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y && e.z === this.z;
  }
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e;
  }
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
  }
  randomDirection() {
    const e = Math.random() * Math.PI * 2, t = Math.random() * 2 - 1, n = Math.sqrt(1 - t * t);
    return this.x = n * Math.cos(e), this.y = t, this.z = n * Math.sin(e), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z;
  }
}
const or = /* @__PURE__ */ new H(), Ea = /* @__PURE__ */ new Qi();
class es {
  constructor(e = new H(1 / 0, 1 / 0, 1 / 0), t = new H(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = !0, this.min = e, this.max = t;
  }
  set(e, t) {
    return this.min.copy(e), this.max.copy(t), this;
  }
  setFromArray(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t += 3)
      this.expandByPoint(Xt.fromArray(e, t));
    return this;
  }
  setFromBufferAttribute(e) {
    this.makeEmpty();
    for (let t = 0, n = e.count; t < n; t++)
      this.expandByPoint(Xt.fromBufferAttribute(e, t));
    return this;
  }
  setFromPoints(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t++)
      this.expandByPoint(e[t]);
    return this;
  }
  setFromCenterAndSize(e, t) {
    const n = Xt.copy(t).multiplyScalar(0.5);
    return this.min.copy(e).sub(n), this.max.copy(e).add(n), this;
  }
  setFromObject(e, t = !1) {
    return this.makeEmpty(), this.expandByObject(e, t);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.min.copy(e.min), this.max.copy(e.max), this;
  }
  makeEmpty() {
    return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this;
  }
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  }
  getCenter(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min);
  }
  expandByPoint(e) {
    return this.min.min(e), this.max.max(e), this;
  }
  expandByVector(e) {
    return this.min.sub(e), this.max.add(e), this;
  }
  expandByScalar(e) {
    return this.min.addScalar(-e), this.max.addScalar(e), this;
  }
  expandByObject(e, t = !1) {
    e.updateWorldMatrix(!1, !1);
    const n = e.geometry;
    if (n !== void 0) {
      const s = n.getAttribute("position");
      if (t === !0 && s !== void 0 && e.isInstancedMesh !== !0)
        for (let o = 0, a = s.count; o < a; o++)
          e.isMesh === !0 ? e.getVertexPosition(o, Xt) : Xt.fromBufferAttribute(s, o), Xt.applyMatrix4(e.matrixWorld), this.expandByPoint(Xt);
      else
        e.boundingBox !== void 0 ? (e.boundingBox === null && e.computeBoundingBox(), us.copy(e.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), us.copy(n.boundingBox)), us.applyMatrix4(e.matrixWorld), this.union(us);
    }
    const i = e.children;
    for (let s = 0, o = i.length; s < o; s++)
      this.expandByObject(i[s], t);
    return this;
  }
  containsPoint(e) {
    return e.x >= this.min.x && e.x <= this.max.x && e.y >= this.min.y && e.y <= this.max.y && e.z >= this.min.z && e.z <= this.max.z;
  }
  containsBox(e) {
    return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z;
  }
  getParameter(e, t) {
    return t.set(
      (e.x - this.min.x) / (this.max.x - this.min.x),
      (e.y - this.min.y) / (this.max.y - this.min.y),
      (e.z - this.min.z) / (this.max.z - this.min.z)
    );
  }
  intersectsBox(e) {
    return e.max.x >= this.min.x && e.min.x <= this.max.x && e.max.y >= this.min.y && e.min.y <= this.max.y && e.max.z >= this.min.z && e.min.z <= this.max.z;
  }
  intersectsSphere(e) {
    return this.clampPoint(e.center, Xt), Xt.distanceToSquared(e.center) <= e.radius * e.radius;
  }
  intersectsPlane(e) {
    let t, n;
    return e.normal.x > 0 ? (t = e.normal.x * this.min.x, n = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, n = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, n += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, n += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, n += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, n += e.normal.z * this.min.z), t <= -e.constant && n >= -e.constant;
  }
  intersectsTriangle(e) {
    if (this.isEmpty())
      return !1;
    this.getCenter(ki), ds.subVectors(this.max, ki), hi.subVectors(e.a, ki), ui.subVectors(e.b, ki), di.subVectors(e.c, ki), Tn.subVectors(ui, hi), An.subVectors(di, ui), kn.subVectors(hi, di);
    let t = [
      0,
      -Tn.z,
      Tn.y,
      0,
      -An.z,
      An.y,
      0,
      -kn.z,
      kn.y,
      Tn.z,
      0,
      -Tn.x,
      An.z,
      0,
      -An.x,
      kn.z,
      0,
      -kn.x,
      -Tn.y,
      Tn.x,
      0,
      -An.y,
      An.x,
      0,
      -kn.y,
      kn.x,
      0
    ];
    return !ar(t, hi, ui, di, ds) || (t = [1, 0, 0, 0, 1, 0, 0, 0, 1], !ar(t, hi, ui, di, ds)) ? !1 : (fs.crossVectors(Tn, An), t = [fs.x, fs.y, fs.z], ar(t, hi, ui, di, ds));
  }
  clampPoint(e, t) {
    return t.copy(e).clamp(this.min, this.max);
  }
  distanceToPoint(e) {
    return this.clampPoint(e, Xt).distanceTo(e);
  }
  getBoundingSphere(e) {
    return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(Xt).length() * 0.5), e;
  }
  intersect(e) {
    return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
  }
  union(e) {
    return this.min.min(e.min), this.max.max(e.max), this;
  }
  applyMatrix4(e) {
    return this.isEmpty() ? this : (mn[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), mn[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), mn[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), mn[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), mn[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), mn[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), mn[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), mn[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(mn), this);
  }
  translate(e) {
    return this.min.add(e), this.max.add(e), this;
  }
  equals(e) {
    return e.min.equals(this.min) && e.max.equals(this.max);
  }
}
const mn = [
  /* @__PURE__ */ new H(),
  /* @__PURE__ */ new H(),
  /* @__PURE__ */ new H(),
  /* @__PURE__ */ new H(),
  /* @__PURE__ */ new H(),
  /* @__PURE__ */ new H(),
  /* @__PURE__ */ new H(),
  /* @__PURE__ */ new H()
], Xt = /* @__PURE__ */ new H(), us = /* @__PURE__ */ new es(), hi = /* @__PURE__ */ new H(), ui = /* @__PURE__ */ new H(), di = /* @__PURE__ */ new H(), Tn = /* @__PURE__ */ new H(), An = /* @__PURE__ */ new H(), kn = /* @__PURE__ */ new H(), ki = /* @__PURE__ */ new H(), ds = /* @__PURE__ */ new H(), fs = /* @__PURE__ */ new H(), Vn = /* @__PURE__ */ new H();
function ar(r, e, t, n, i) {
  for (let s = 0, o = r.length - 3; s <= o; s += 3) {
    Vn.fromArray(r, s);
    const a = i.x * Math.abs(Vn.x) + i.y * Math.abs(Vn.y) + i.z * Math.abs(Vn.z), l = e.dot(Vn), c = t.dot(Vn), h = n.dot(Vn);
    if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > a)
      return !1;
  }
  return !0;
}
const Dd = /* @__PURE__ */ new es(), Vi = /* @__PURE__ */ new H(), lr = /* @__PURE__ */ new H();
class Ki {
  constructor(e = new H(), t = -1) {
    this.isSphere = !0, this.center = e, this.radius = t;
  }
  set(e, t) {
    return this.center.copy(e), this.radius = t, this;
  }
  setFromPoints(e, t) {
    const n = this.center;
    t !== void 0 ? n.copy(t) : Dd.setFromPoints(e).getCenter(n);
    let i = 0;
    for (let s = 0, o = e.length; s < o; s++)
      i = Math.max(i, n.distanceToSquared(e[s]));
    return this.radius = Math.sqrt(i), this;
  }
  copy(e) {
    return this.center.copy(e.center), this.radius = e.radius, this;
  }
  isEmpty() {
    return this.radius < 0;
  }
  makeEmpty() {
    return this.center.set(0, 0, 0), this.radius = -1, this;
  }
  containsPoint(e) {
    return e.distanceToSquared(this.center) <= this.radius * this.radius;
  }
  distanceToPoint(e) {
    return e.distanceTo(this.center) - this.radius;
  }
  intersectsSphere(e) {
    const t = this.radius + e.radius;
    return e.center.distanceToSquared(this.center) <= t * t;
  }
  intersectsBox(e) {
    return e.intersectsSphere(this);
  }
  intersectsPlane(e) {
    return Math.abs(e.distanceToPoint(this.center)) <= this.radius;
  }
  clampPoint(e, t) {
    const n = this.center.distanceToSquared(e);
    return t.copy(e), n > this.radius * this.radius && (t.sub(this.center).normalize(), t.multiplyScalar(this.radius).add(this.center)), t;
  }
  getBoundingBox(e) {
    return this.isEmpty() ? (e.makeEmpty(), e) : (e.set(this.center, this.center), e.expandByScalar(this.radius), e);
  }
  applyMatrix4(e) {
    return this.center.applyMatrix4(e), this.radius = this.radius * e.getMaxScaleOnAxis(), this;
  }
  translate(e) {
    return this.center.add(e), this;
  }
  expandByPoint(e) {
    if (this.isEmpty())
      return this.center.copy(e), this.radius = 0, this;
    Vi.subVectors(e, this.center);
    const t = Vi.lengthSq();
    if (t > this.radius * this.radius) {
      const n = Math.sqrt(t), i = (n - this.radius) * 0.5;
      this.center.addScaledVector(Vi, i / n), this.radius += i;
    }
    return this;
  }
  union(e) {
    return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (lr.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(Vi.copy(e.center).add(lr)), this.expandByPoint(Vi.copy(e.center).sub(lr))), this);
  }
  equals(e) {
    return e.center.equals(this.center) && e.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const gn = /* @__PURE__ */ new H(), cr = /* @__PURE__ */ new H(), ps = /* @__PURE__ */ new H(), Cn = /* @__PURE__ */ new H(), hr = /* @__PURE__ */ new H(), ms = /* @__PURE__ */ new H(), ur = /* @__PURE__ */ new H();
class Bl {
  constructor(e = new H(), t = new H(0, 0, -1)) {
    this.origin = e, this.direction = t;
  }
  set(e, t) {
    return this.origin.copy(e), this.direction.copy(t), this;
  }
  copy(e) {
    return this.origin.copy(e.origin), this.direction.copy(e.direction), this;
  }
  at(e, t) {
    return t.copy(this.origin).addScaledVector(this.direction, e);
  }
  lookAt(e) {
    return this.direction.copy(e).sub(this.origin).normalize(), this;
  }
  recast(e) {
    return this.origin.copy(this.at(e, gn)), this;
  }
  closestPointToPoint(e, t) {
    t.subVectors(e, this.origin);
    const n = t.dot(this.direction);
    return n < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, n);
  }
  distanceToPoint(e) {
    return Math.sqrt(this.distanceSqToPoint(e));
  }
  distanceSqToPoint(e) {
    const t = gn.subVectors(e, this.origin).dot(this.direction);
    return t < 0 ? this.origin.distanceToSquared(e) : (gn.copy(this.origin).addScaledVector(this.direction, t), gn.distanceToSquared(e));
  }
  distanceSqToSegment(e, t, n, i) {
    cr.copy(e).add(t).multiplyScalar(0.5), ps.copy(t).sub(e).normalize(), Cn.copy(this.origin).sub(cr);
    const s = e.distanceTo(t) * 0.5, o = -this.direction.dot(ps), a = Cn.dot(this.direction), l = -Cn.dot(ps), c = Cn.lengthSq(), h = Math.abs(1 - o * o);
    let d, u, m, g;
    if (h > 0)
      if (d = o * l - a, u = o * a - l, g = s * h, d >= 0)
        if (u >= -g)
          if (u <= g) {
            const _ = 1 / h;
            d *= _, u *= _, m = d * (d + o * u + 2 * a) + u * (o * d + u + 2 * l) + c;
          } else
            u = s, d = Math.max(0, -(o * u + a)), m = -d * d + u * (u + 2 * l) + c;
        else
          u = -s, d = Math.max(0, -(o * u + a)), m = -d * d + u * (u + 2 * l) + c;
      else
        u <= -g ? (d = Math.max(0, -(-o * s + a)), u = d > 0 ? -s : Math.min(Math.max(-s, -l), s), m = -d * d + u * (u + 2 * l) + c) : u <= g ? (d = 0, u = Math.min(Math.max(-s, -l), s), m = u * (u + 2 * l) + c) : (d = Math.max(0, -(o * s + a)), u = d > 0 ? s : Math.min(Math.max(-s, -l), s), m = -d * d + u * (u + 2 * l) + c);
    else
      u = o > 0 ? -s : s, d = Math.max(0, -(o * u + a)), m = -d * d + u * (u + 2 * l) + c;
    return n && n.copy(this.origin).addScaledVector(this.direction, d), i && i.copy(cr).addScaledVector(ps, u), m;
  }
  intersectSphere(e, t) {
    gn.subVectors(e.center, this.origin);
    const n = gn.dot(this.direction), i = gn.dot(gn) - n * n, s = e.radius * e.radius;
    if (i > s)
      return null;
    const o = Math.sqrt(s - i), a = n - o, l = n + o;
    return l < 0 ? null : a < 0 ? this.at(l, t) : this.at(a, t);
  }
  intersectsSphere(e) {
    return this.distanceSqToPoint(e.center) <= e.radius * e.radius;
  }
  distanceToPlane(e) {
    const t = e.normal.dot(this.direction);
    if (t === 0)
      return e.distanceToPoint(this.origin) === 0 ? 0 : null;
    const n = -(this.origin.dot(e.normal) + e.constant) / t;
    return n >= 0 ? n : null;
  }
  intersectPlane(e, t) {
    const n = this.distanceToPlane(e);
    return n === null ? null : this.at(n, t);
  }
  intersectsPlane(e) {
    const t = e.distanceToPoint(this.origin);
    return t === 0 || e.normal.dot(this.direction) * t < 0;
  }
  intersectBox(e, t) {
    let n, i, s, o, a, l;
    const c = 1 / this.direction.x, h = 1 / this.direction.y, d = 1 / this.direction.z, u = this.origin;
    return c >= 0 ? (n = (e.min.x - u.x) * c, i = (e.max.x - u.x) * c) : (n = (e.max.x - u.x) * c, i = (e.min.x - u.x) * c), h >= 0 ? (s = (e.min.y - u.y) * h, o = (e.max.y - u.y) * h) : (s = (e.max.y - u.y) * h, o = (e.min.y - u.y) * h), n > o || s > i || ((s > n || isNaN(n)) && (n = s), (o < i || isNaN(i)) && (i = o), d >= 0 ? (a = (e.min.z - u.z) * d, l = (e.max.z - u.z) * d) : (a = (e.max.z - u.z) * d, l = (e.min.z - u.z) * d), n > l || a > i) || ((a > n || n !== n) && (n = a), (l < i || i !== i) && (i = l), i < 0) ? null : this.at(n >= 0 ? n : i, t);
  }
  intersectsBox(e) {
    return this.intersectBox(e, gn) !== null;
  }
  intersectTriangle(e, t, n, i, s) {
    hr.subVectors(t, e), ms.subVectors(n, e), ur.crossVectors(hr, ms);
    let o = this.direction.dot(ur), a;
    if (o > 0) {
      if (i)
        return null;
      a = 1;
    } else if (o < 0)
      a = -1, o = -o;
    else
      return null;
    Cn.subVectors(this.origin, e);
    const l = a * this.direction.dot(ms.crossVectors(Cn, ms));
    if (l < 0)
      return null;
    const c = a * this.direction.dot(hr.cross(Cn));
    if (c < 0 || l + c > o)
      return null;
    const h = -a * Cn.dot(ur);
    return h < 0 ? null : this.at(h / o, s);
  }
  applyMatrix4(e) {
    return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this;
  }
  equals(e) {
    return e.origin.equals(this.origin) && e.direction.equals(this.direction);
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class rt {
  constructor(e, t, n, i, s, o, a, l, c, h, d, u, m, g, _, f) {
    rt.prototype.isMatrix4 = !0, this.elements = [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ], e !== void 0 && this.set(e, t, n, i, s, o, a, l, c, h, d, u, m, g, _, f);
  }
  set(e, t, n, i, s, o, a, l, c, h, d, u, m, g, _, f) {
    const p = this.elements;
    return p[0] = e, p[4] = t, p[8] = n, p[12] = i, p[1] = s, p[5] = o, p[9] = a, p[13] = l, p[2] = c, p[6] = h, p[10] = d, p[14] = u, p[3] = m, p[7] = g, p[11] = _, p[15] = f, this;
  }
  identity() {
    return this.set(
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  clone() {
    return new rt().fromArray(this.elements);
  }
  copy(e) {
    const t = this.elements, n = e.elements;
    return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], t[9] = n[9], t[10] = n[10], t[11] = n[11], t[12] = n[12], t[13] = n[13], t[14] = n[14], t[15] = n[15], this;
  }
  copyPosition(e) {
    const t = this.elements, n = e.elements;
    return t[12] = n[12], t[13] = n[13], t[14] = n[14], this;
  }
  setFromMatrix3(e) {
    const t = e.elements;
    return this.set(
      t[0],
      t[3],
      t[6],
      0,
      t[1],
      t[4],
      t[7],
      0,
      t[2],
      t[5],
      t[8],
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  extractBasis(e, t, n) {
    return e.setFromMatrixColumn(this, 0), t.setFromMatrixColumn(this, 1), n.setFromMatrixColumn(this, 2), this;
  }
  makeBasis(e, t, n) {
    return this.set(
      e.x,
      t.x,
      n.x,
      0,
      e.y,
      t.y,
      n.y,
      0,
      e.z,
      t.z,
      n.z,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  extractRotation(e) {
    const t = this.elements, n = e.elements, i = 1 / fi.setFromMatrixColumn(e, 0).length(), s = 1 / fi.setFromMatrixColumn(e, 1).length(), o = 1 / fi.setFromMatrixColumn(e, 2).length();
    return t[0] = n[0] * i, t[1] = n[1] * i, t[2] = n[2] * i, t[3] = 0, t[4] = n[4] * s, t[5] = n[5] * s, t[6] = n[6] * s, t[7] = 0, t[8] = n[8] * o, t[9] = n[9] * o, t[10] = n[10] * o, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
  }
  makeRotationFromEuler(e) {
    const t = this.elements, n = e.x, i = e.y, s = e.z, o = Math.cos(n), a = Math.sin(n), l = Math.cos(i), c = Math.sin(i), h = Math.cos(s), d = Math.sin(s);
    if (e.order === "XYZ") {
      const u = o * h, m = o * d, g = a * h, _ = a * d;
      t[0] = l * h, t[4] = -l * d, t[8] = c, t[1] = m + g * c, t[5] = u - _ * c, t[9] = -a * l, t[2] = _ - u * c, t[6] = g + m * c, t[10] = o * l;
    } else if (e.order === "YXZ") {
      const u = l * h, m = l * d, g = c * h, _ = c * d;
      t[0] = u + _ * a, t[4] = g * a - m, t[8] = o * c, t[1] = o * d, t[5] = o * h, t[9] = -a, t[2] = m * a - g, t[6] = _ + u * a, t[10] = o * l;
    } else if (e.order === "ZXY") {
      const u = l * h, m = l * d, g = c * h, _ = c * d;
      t[0] = u - _ * a, t[4] = -o * d, t[8] = g + m * a, t[1] = m + g * a, t[5] = o * h, t[9] = _ - u * a, t[2] = -o * c, t[6] = a, t[10] = o * l;
    } else if (e.order === "ZYX") {
      const u = o * h, m = o * d, g = a * h, _ = a * d;
      t[0] = l * h, t[4] = g * c - m, t[8] = u * c + _, t[1] = l * d, t[5] = _ * c + u, t[9] = m * c - g, t[2] = -c, t[6] = a * l, t[10] = o * l;
    } else if (e.order === "YZX") {
      const u = o * l, m = o * c, g = a * l, _ = a * c;
      t[0] = l * h, t[4] = _ - u * d, t[8] = g * d + m, t[1] = d, t[5] = o * h, t[9] = -a * h, t[2] = -c * h, t[6] = m * d + g, t[10] = u - _ * d;
    } else if (e.order === "XZY") {
      const u = o * l, m = o * c, g = a * l, _ = a * c;
      t[0] = l * h, t[4] = -d, t[8] = c * h, t[1] = u * d + _, t[5] = o * h, t[9] = m * d - g, t[2] = g * d - m, t[6] = a * h, t[10] = _ * d + u;
    }
    return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
  }
  makeRotationFromQuaternion(e) {
    return this.compose(Ld, e, Fd);
  }
  lookAt(e, t, n) {
    const i = this.elements;
    return Lt.subVectors(e, t), Lt.lengthSq() === 0 && (Lt.z = 1), Lt.normalize(), Rn.crossVectors(n, Lt), Rn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? Lt.x += 1e-4 : Lt.z += 1e-4, Lt.normalize(), Rn.crossVectors(n, Lt)), Rn.normalize(), gs.crossVectors(Lt, Rn), i[0] = Rn.x, i[4] = gs.x, i[8] = Lt.x, i[1] = Rn.y, i[5] = gs.y, i[9] = Lt.y, i[2] = Rn.z, i[6] = gs.z, i[10] = Lt.z, this;
  }
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  multiplyMatrices(e, t) {
    const n = e.elements, i = t.elements, s = this.elements, o = n[0], a = n[4], l = n[8], c = n[12], h = n[1], d = n[5], u = n[9], m = n[13], g = n[2], _ = n[6], f = n[10], p = n[14], v = n[3], M = n[7], x = n[11], A = n[15], T = i[0], C = i[4], D = i[8], b = i[12], y = i[1], P = i[5], B = i[9], L = i[13], U = i[2], O = i[6], F = i[10], K = i[14], V = i[3], $ = i[7], se = i[11], de = i[15];
    return s[0] = o * T + a * y + l * U + c * V, s[4] = o * C + a * P + l * O + c * $, s[8] = o * D + a * B + l * F + c * se, s[12] = o * b + a * L + l * K + c * de, s[1] = h * T + d * y + u * U + m * V, s[5] = h * C + d * P + u * O + m * $, s[9] = h * D + d * B + u * F + m * se, s[13] = h * b + d * L + u * K + m * de, s[2] = g * T + _ * y + f * U + p * V, s[6] = g * C + _ * P + f * O + p * $, s[10] = g * D + _ * B + f * F + p * se, s[14] = g * b + _ * L + f * K + p * de, s[3] = v * T + M * y + x * U + A * V, s[7] = v * C + M * P + x * O + A * $, s[11] = v * D + M * B + x * F + A * se, s[15] = v * b + M * L + x * K + A * de, this;
  }
  multiplyScalar(e) {
    const t = this.elements;
    return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this;
  }
  determinant() {
    const e = this.elements, t = e[0], n = e[4], i = e[8], s = e[12], o = e[1], a = e[5], l = e[9], c = e[13], h = e[2], d = e[6], u = e[10], m = e[14], g = e[3], _ = e[7], f = e[11], p = e[15];
    return g * (+s * l * d - i * c * d - s * a * u + n * c * u + i * a * m - n * l * m) + _ * (+t * l * m - t * c * u + s * o * u - i * o * m + i * c * h - s * l * h) + f * (+t * c * d - t * a * m - s * o * d + n * o * m + s * a * h - n * c * h) + p * (-i * a * h - t * l * d + t * a * u + i * o * d - n * o * u + n * l * h);
  }
  transpose() {
    const e = this.elements;
    let t;
    return t = e[1], e[1] = e[4], e[4] = t, t = e[2], e[2] = e[8], e[8] = t, t = e[6], e[6] = e[9], e[9] = t, t = e[3], e[3] = e[12], e[12] = t, t = e[7], e[7] = e[13], e[13] = t, t = e[11], e[11] = e[14], e[14] = t, this;
  }
  setPosition(e, t, n) {
    const i = this.elements;
    return e.isVector3 ? (i[12] = e.x, i[13] = e.y, i[14] = e.z) : (i[12] = e, i[13] = t, i[14] = n), this;
  }
  invert() {
    const e = this.elements, t = e[0], n = e[1], i = e[2], s = e[3], o = e[4], a = e[5], l = e[6], c = e[7], h = e[8], d = e[9], u = e[10], m = e[11], g = e[12], _ = e[13], f = e[14], p = e[15], v = d * f * c - _ * u * c + _ * l * m - a * f * m - d * l * p + a * u * p, M = g * u * c - h * f * c - g * l * m + o * f * m + h * l * p - o * u * p, x = h * _ * c - g * d * c + g * a * m - o * _ * m - h * a * p + o * d * p, A = g * d * l - h * _ * l - g * a * u + o * _ * u + h * a * f - o * d * f, T = t * v + n * M + i * x + s * A;
    if (T === 0)
      return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const C = 1 / T;
    return e[0] = v * C, e[1] = (_ * u * s - d * f * s - _ * i * m + n * f * m + d * i * p - n * u * p) * C, e[2] = (a * f * s - _ * l * s + _ * i * c - n * f * c - a * i * p + n * l * p) * C, e[3] = (d * l * s - a * u * s - d * i * c + n * u * c + a * i * m - n * l * m) * C, e[4] = M * C, e[5] = (h * f * s - g * u * s + g * i * m - t * f * m - h * i * p + t * u * p) * C, e[6] = (g * l * s - o * f * s - g * i * c + t * f * c + o * i * p - t * l * p) * C, e[7] = (o * u * s - h * l * s + h * i * c - t * u * c - o * i * m + t * l * m) * C, e[8] = x * C, e[9] = (g * d * s - h * _ * s - g * n * m + t * _ * m + h * n * p - t * d * p) * C, e[10] = (o * _ * s - g * a * s + g * n * c - t * _ * c - o * n * p + t * a * p) * C, e[11] = (h * a * s - o * d * s - h * n * c + t * d * c + o * n * m - t * a * m) * C, e[12] = A * C, e[13] = (h * _ * i - g * d * i + g * n * u - t * _ * u - h * n * f + t * d * f) * C, e[14] = (g * a * i - o * _ * i - g * n * l + t * _ * l + o * n * f - t * a * f) * C, e[15] = (o * d * i - h * a * i + h * n * l - t * d * l - o * n * u + t * a * u) * C, this;
  }
  scale(e) {
    const t = this.elements, n = e.x, i = e.y, s = e.z;
    return t[0] *= n, t[4] *= i, t[8] *= s, t[1] *= n, t[5] *= i, t[9] *= s, t[2] *= n, t[6] *= i, t[10] *= s, t[3] *= n, t[7] *= i, t[11] *= s, this;
  }
  getMaxScaleOnAxis() {
    const e = this.elements, t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2], n = e[4] * e[4] + e[5] * e[5] + e[6] * e[6], i = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
    return Math.sqrt(Math.max(t, n, i));
  }
  makeTranslation(e, t, n) {
    return e.isVector3 ? this.set(
      1,
      0,
      0,
      e.x,
      0,
      1,
      0,
      e.y,
      0,
      0,
      1,
      e.z,
      0,
      0,
      0,
      1
    ) : this.set(
      1,
      0,
      0,
      e,
      0,
      1,
      0,
      t,
      0,
      0,
      1,
      n,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationX(e) {
    const t = Math.cos(e), n = Math.sin(e);
    return this.set(
      1,
      0,
      0,
      0,
      0,
      t,
      -n,
      0,
      0,
      n,
      t,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationY(e) {
    const t = Math.cos(e), n = Math.sin(e);
    return this.set(
      t,
      0,
      n,
      0,
      0,
      1,
      0,
      0,
      -n,
      0,
      t,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationZ(e) {
    const t = Math.cos(e), n = Math.sin(e);
    return this.set(
      t,
      -n,
      0,
      0,
      n,
      t,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationAxis(e, t) {
    const n = Math.cos(t), i = Math.sin(t), s = 1 - n, o = e.x, a = e.y, l = e.z, c = s * o, h = s * a;
    return this.set(
      c * o + n,
      c * a - i * l,
      c * l + i * a,
      0,
      c * a + i * l,
      h * a + n,
      h * l - i * o,
      0,
      c * l - i * a,
      h * l + i * o,
      s * l * l + n,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeScale(e, t, n) {
    return this.set(
      e,
      0,
      0,
      0,
      0,
      t,
      0,
      0,
      0,
      0,
      n,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeShear(e, t, n, i, s, o) {
    return this.set(
      1,
      n,
      s,
      0,
      e,
      1,
      o,
      0,
      t,
      i,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  compose(e, t, n) {
    const i = this.elements, s = t._x, o = t._y, a = t._z, l = t._w, c = s + s, h = o + o, d = a + a, u = s * c, m = s * h, g = s * d, _ = o * h, f = o * d, p = a * d, v = l * c, M = l * h, x = l * d, A = n.x, T = n.y, C = n.z;
    return i[0] = (1 - (_ + p)) * A, i[1] = (m + x) * A, i[2] = (g - M) * A, i[3] = 0, i[4] = (m - x) * T, i[5] = (1 - (u + p)) * T, i[6] = (f + v) * T, i[7] = 0, i[8] = (g + M) * C, i[9] = (f - v) * C, i[10] = (1 - (u + _)) * C, i[11] = 0, i[12] = e.x, i[13] = e.y, i[14] = e.z, i[15] = 1, this;
  }
  decompose(e, t, n) {
    const i = this.elements;
    let s = fi.set(i[0], i[1], i[2]).length();
    const o = fi.set(i[4], i[5], i[6]).length(), a = fi.set(i[8], i[9], i[10]).length();
    this.determinant() < 0 && (s = -s), e.x = i[12], e.y = i[13], e.z = i[14], qt.copy(this);
    const c = 1 / s, h = 1 / o, d = 1 / a;
    return qt.elements[0] *= c, qt.elements[1] *= c, qt.elements[2] *= c, qt.elements[4] *= h, qt.elements[5] *= h, qt.elements[6] *= h, qt.elements[8] *= d, qt.elements[9] *= d, qt.elements[10] *= d, t.setFromRotationMatrix(qt), n.x = s, n.y = o, n.z = a, this;
  }
  makePerspective(e, t, n, i, s, o, a = En) {
    const l = this.elements, c = 2 * s / (t - e), h = 2 * s / (n - i), d = (t + e) / (t - e), u = (n + i) / (n - i);
    let m, g;
    if (a === En)
      m = -(o + s) / (o - s), g = -2 * o * s / (o - s);
    else if (a === Hs)
      m = -o / (o - s), g = -o * s / (o - s);
    else
      throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + a);
    return l[0] = c, l[4] = 0, l[8] = d, l[12] = 0, l[1] = 0, l[5] = h, l[9] = u, l[13] = 0, l[2] = 0, l[6] = 0, l[10] = m, l[14] = g, l[3] = 0, l[7] = 0, l[11] = -1, l[15] = 0, this;
  }
  makeOrthographic(e, t, n, i, s, o, a = En) {
    const l = this.elements, c = 1 / (t - e), h = 1 / (n - i), d = 1 / (o - s), u = (t + e) * c, m = (n + i) * h;
    let g, _;
    if (a === En)
      g = (o + s) * d, _ = -2 * d;
    else if (a === Hs)
      g = s * d, _ = -1 * d;
    else
      throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + a);
    return l[0] = 2 * c, l[4] = 0, l[8] = 0, l[12] = -u, l[1] = 0, l[5] = 2 * h, l[9] = 0, l[13] = -m, l[2] = 0, l[6] = 0, l[10] = _, l[14] = -g, l[3] = 0, l[7] = 0, l[11] = 0, l[15] = 1, this;
  }
  equals(e) {
    const t = this.elements, n = e.elements;
    for (let i = 0; i < 16; i++)
      if (t[i] !== n[i])
        return !1;
    return !0;
  }
  fromArray(e, t = 0) {
    for (let n = 0; n < 16; n++)
      this.elements[n] = e[n + t];
    return this;
  }
  toArray(e = [], t = 0) {
    const n = this.elements;
    return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e[t + 9] = n[9], e[t + 10] = n[10], e[t + 11] = n[11], e[t + 12] = n[12], e[t + 13] = n[13], e[t + 14] = n[14], e[t + 15] = n[15], e;
  }
}
const fi = /* @__PURE__ */ new H(), qt = /* @__PURE__ */ new rt(), Ld = /* @__PURE__ */ new H(0, 0, 0), Fd = /* @__PURE__ */ new H(1, 1, 1), Rn = /* @__PURE__ */ new H(), gs = /* @__PURE__ */ new H(), Lt = /* @__PURE__ */ new H(), ba = /* @__PURE__ */ new rt(), wa = /* @__PURE__ */ new Qi();
class Qt {
  constructor(e = 0, t = 0, n = 0, i = Qt.DEFAULT_ORDER) {
    this.isEuler = !0, this._x = e, this._y = t, this._z = n, this._order = i;
  }
  get x() {
    return this._x;
  }
  set x(e) {
    this._x = e, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(e) {
    this._y = e, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(e) {
    this._z = e, this._onChangeCallback();
  }
  get order() {
    return this._order;
  }
  set order(e) {
    this._order = e, this._onChangeCallback();
  }
  set(e, t, n, i = this._order) {
    return this._x = e, this._y = t, this._z = n, this._order = i, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._order);
  }
  copy(e) {
    return this._x = e._x, this._y = e._y, this._z = e._z, this._order = e._order, this._onChangeCallback(), this;
  }
  setFromRotationMatrix(e, t = this._order, n = !0) {
    const i = e.elements, s = i[0], o = i[4], a = i[8], l = i[1], c = i[5], h = i[9], d = i[2], u = i[6], m = i[10];
    switch (t) {
      case "XYZ":
        this._y = Math.asin(Be(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(-h, m), this._z = Math.atan2(-o, s)) : (this._x = Math.atan2(u, c), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-Be(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(a, m), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-d, s), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(Be(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._y = Math.atan2(-d, m), this._z = Math.atan2(-o, c)) : (this._y = 0, this._z = Math.atan2(l, s));
        break;
      case "ZYX":
        this._y = Math.asin(-Be(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._x = Math.atan2(u, m), this._z = Math.atan2(l, s)) : (this._x = 0, this._z = Math.atan2(-o, c));
        break;
      case "YZX":
        this._z = Math.asin(Be(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-d, s)) : (this._x = 0, this._y = Math.atan2(a, m));
        break;
      case "XZY":
        this._z = Math.asin(-Be(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(u, c), this._y = Math.atan2(a, s)) : (this._x = Math.atan2(-h, m), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + t);
    }
    return this._order = t, n === !0 && this._onChangeCallback(), this;
  }
  setFromQuaternion(e, t, n) {
    return ba.makeRotationFromQuaternion(e), this.setFromRotationMatrix(ba, t, n);
  }
  setFromVector3(e, t = this._order) {
    return this.set(e.x, e.y, e.z, t);
  }
  reorder(e) {
    return wa.setFromEuler(this), this.setFromQuaternion(wa, e);
  }
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order;
  }
  fromArray(e) {
    return this._x = e[0], this._y = e[1], this._z = e[2], e[3] !== void 0 && (this._order = e[3]), this._onChangeCallback(), this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._order, e;
  }
  _onChange(e) {
    return this._onChangeCallback = e, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._order;
  }
}
Qt.DEFAULT_ORDER = "XYZ";
class No {
  constructor() {
    this.mask = 1;
  }
  set(e) {
    this.mask = (1 << e | 0) >>> 0;
  }
  enable(e) {
    this.mask |= 1 << e | 0;
  }
  enableAll() {
    this.mask = -1;
  }
  toggle(e) {
    this.mask ^= 1 << e | 0;
  }
  disable(e) {
    this.mask &= ~(1 << e | 0);
  }
  disableAll() {
    this.mask = 0;
  }
  test(e) {
    return (this.mask & e.mask) !== 0;
  }
  isEnabled(e) {
    return (this.mask & (1 << e | 0)) !== 0;
  }
}
let Id = 0;
const Ta = /* @__PURE__ */ new H(), pi = /* @__PURE__ */ new Qi(), _n = /* @__PURE__ */ new rt(), _s = /* @__PURE__ */ new H(), Hi = /* @__PURE__ */ new H(), Ud = /* @__PURE__ */ new H(), Nd = /* @__PURE__ */ new Qi(), Aa = /* @__PURE__ */ new H(1, 0, 0), Ca = /* @__PURE__ */ new H(0, 1, 0), Ra = /* @__PURE__ */ new H(0, 0, 1), Pa = { type: "added" }, Od = { type: "removed" }, mi = { type: "childadded", child: null }, dr = { type: "childremoved", child: null };
class xt extends Di {
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: Id++ }), this.uuid = Ji(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = xt.DEFAULT_UP.clone();
    const e = new H(), t = new Qt(), n = new Qi(), i = new H(1, 1, 1);
    function s() {
      n.setFromEuler(t, !1);
    }
    function o() {
      t.setFromQuaternion(n, void 0, !1);
    }
    t._onChange(s), n._onChange(o), Object.defineProperties(this, {
      position: {
        configurable: !0,
        enumerable: !0,
        value: e
      },
      rotation: {
        configurable: !0,
        enumerable: !0,
        value: t
      },
      quaternion: {
        configurable: !0,
        enumerable: !0,
        value: n
      },
      scale: {
        configurable: !0,
        enumerable: !0,
        value: i
      },
      modelViewMatrix: {
        value: new rt()
      },
      normalMatrix: {
        value: new Ie()
      }
    }), this.matrix = new rt(), this.matrixWorld = new rt(), this.matrixAutoUpdate = xt.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = xt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new No(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.customDepthMaterial = void 0, this.customDistanceMaterial = void 0, this.userData = {};
  }
  onBeforeShadow() {
  }
  onAfterShadow() {
  }
  onBeforeRender() {
  }
  onAfterRender() {
  }
  applyMatrix4(e) {
    this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(e), this.matrix.decompose(this.position, this.quaternion, this.scale);
  }
  applyQuaternion(e) {
    return this.quaternion.premultiply(e), this;
  }
  setRotationFromAxisAngle(e, t) {
    this.quaternion.setFromAxisAngle(e, t);
  }
  setRotationFromEuler(e) {
    this.quaternion.setFromEuler(e, !0);
  }
  setRotationFromMatrix(e) {
    this.quaternion.setFromRotationMatrix(e);
  }
  setRotationFromQuaternion(e) {
    this.quaternion.copy(e);
  }
  rotateOnAxis(e, t) {
    return pi.setFromAxisAngle(e, t), this.quaternion.multiply(pi), this;
  }
  rotateOnWorldAxis(e, t) {
    return pi.setFromAxisAngle(e, t), this.quaternion.premultiply(pi), this;
  }
  rotateX(e) {
    return this.rotateOnAxis(Aa, e);
  }
  rotateY(e) {
    return this.rotateOnAxis(Ca, e);
  }
  rotateZ(e) {
    return this.rotateOnAxis(Ra, e);
  }
  translateOnAxis(e, t) {
    return Ta.copy(e).applyQuaternion(this.quaternion), this.position.add(Ta.multiplyScalar(t)), this;
  }
  translateX(e) {
    return this.translateOnAxis(Aa, e);
  }
  translateY(e) {
    return this.translateOnAxis(Ca, e);
  }
  translateZ(e) {
    return this.translateOnAxis(Ra, e);
  }
  localToWorld(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(_n.copy(this.matrixWorld).invert());
  }
  lookAt(e, t, n) {
    e.isVector3 ? _s.copy(e) : _s.set(e, t, n);
    const i = this.parent;
    this.updateWorldMatrix(!0, !1), Hi.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? _n.lookAt(Hi, _s, this.up) : _n.lookAt(_s, Hi, this.up), this.quaternion.setFromRotationMatrix(_n), i && (_n.extractRotation(i.matrixWorld), pi.setFromRotationMatrix(_n), this.quaternion.premultiply(pi.invert()));
  }
  add(e) {
    if (arguments.length > 1) {
      for (let t = 0; t < arguments.length; t++)
        this.add(arguments[t]);
      return this;
    }
    return e === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.removeFromParent(), e.parent = this, this.children.push(e), e.dispatchEvent(Pa), mi.child = e, this.dispatchEvent(mi), mi.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", e), this);
  }
  remove(e) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++)
        this.remove(arguments[n]);
      return this;
    }
    const t = this.children.indexOf(e);
    return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(Od), dr.child = e, this.dispatchEvent(dr), dr.child = null), this;
  }
  removeFromParent() {
    const e = this.parent;
    return e !== null && e.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(e) {
    return this.updateWorldMatrix(!0, !1), _n.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), _n.multiply(e.parent.matrixWorld)), e.applyMatrix4(_n), e.removeFromParent(), e.parent = this, this.children.push(e), e.updateWorldMatrix(!1, !0), e.dispatchEvent(Pa), mi.child = e, this.dispatchEvent(mi), mi.child = null, this;
  }
  getObjectById(e) {
    return this.getObjectByProperty("id", e);
  }
  getObjectByName(e) {
    return this.getObjectByProperty("name", e);
  }
  getObjectByProperty(e, t) {
    if (this[e] === t)
      return this;
    for (let n = 0, i = this.children.length; n < i; n++) {
      const o = this.children[n].getObjectByProperty(e, t);
      if (o !== void 0)
        return o;
    }
  }
  getObjectsByProperty(e, t, n = []) {
    this[e] === t && n.push(this);
    const i = this.children;
    for (let s = 0, o = i.length; s < o; s++)
      i[s].getObjectsByProperty(e, t, n);
    return n;
  }
  getWorldPosition(e) {
    return this.updateWorldMatrix(!0, !1), e.setFromMatrixPosition(this.matrixWorld);
  }
  getWorldQuaternion(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Hi, e, Ud), e;
  }
  getWorldScale(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Hi, Nd, e), e;
  }
  getWorldDirection(e) {
    this.updateWorldMatrix(!0, !1);
    const t = this.matrixWorld.elements;
    return e.set(t[8], t[9], t[10]).normalize();
  }
  raycast() {
  }
  traverse(e) {
    e(this);
    const t = this.children;
    for (let n = 0, i = t.length; n < i; n++)
      t[n].traverse(e);
  }
  traverseVisible(e) {
    if (this.visible === !1)
      return;
    e(this);
    const t = this.children;
    for (let n = 0, i = t.length; n < i; n++)
      t[n].traverseVisible(e);
  }
  traverseAncestors(e) {
    const t = this.parent;
    t !== null && (e(t), t.traverseAncestors(e));
  }
  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
  }
  updateMatrixWorld(e) {
    this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || e) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, e = !0);
    const t = this.children;
    for (let n = 0, i = t.length; n < i; n++)
      t[n].updateMatrixWorld(e);
  }
  updateWorldMatrix(e, t) {
    const n = this.parent;
    if (e === !0 && n !== null && n.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), t === !0) {
      const i = this.children;
      for (let s = 0, o = i.length; s < o; s++)
        i[s].updateWorldMatrix(!1, !0);
    }
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string", n = {};
    t && (e = {
      geometries: {},
      materials: {},
      textures: {},
      images: {},
      shapes: {},
      skeletons: {},
      animations: {},
      nodes: {}
    }, n.metadata = {
      version: 4.6,
      type: "Object",
      generator: "Object3D.toJSON"
    });
    const i = {};
    i.uuid = this.uuid, i.type = this.type, this.name !== "" && (i.name = this.name), this.castShadow === !0 && (i.castShadow = !0), this.receiveShadow === !0 && (i.receiveShadow = !0), this.visible === !1 && (i.visible = !1), this.frustumCulled === !1 && (i.frustumCulled = !1), this.renderOrder !== 0 && (i.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (i.userData = this.userData), i.layers = this.layers.mask, i.matrix = this.matrix.toArray(), i.up = this.up.toArray(), this.matrixAutoUpdate === !1 && (i.matrixAutoUpdate = !1), this.isInstancedMesh && (i.type = "InstancedMesh", i.count = this.count, i.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (i.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (i.type = "BatchedMesh", i.perObjectFrustumCulled = this.perObjectFrustumCulled, i.sortObjects = this.sortObjects, i.drawRanges = this._drawRanges, i.reservedRanges = this._reservedRanges, i.geometryInfo = this._geometryInfo.map((a) => ({
      ...a,
      boundingBox: a.boundingBox ? {
        min: a.boundingBox.min.toArray(),
        max: a.boundingBox.max.toArray()
      } : void 0,
      boundingSphere: a.boundingSphere ? {
        radius: a.boundingSphere.radius,
        center: a.boundingSphere.center.toArray()
      } : void 0
    })), i.instanceInfo = this._instanceInfo.map((a) => ({ ...a })), i.availableInstanceIds = this._availableInstanceIds.slice(), i.availableGeometryIds = this._availableGeometryIds.slice(), i.nextIndexStart = this._nextIndexStart, i.nextVertexStart = this._nextVertexStart, i.geometryCount = this._geometryCount, i.maxInstanceCount = this._maxInstanceCount, i.maxVertexCount = this._maxVertexCount, i.maxIndexCount = this._maxIndexCount, i.geometryInitialized = this._geometryInitialized, i.matricesTexture = this._matricesTexture.toJSON(e), i.indirectTexture = this._indirectTexture.toJSON(e), this._colorsTexture !== null && (i.colorsTexture = this._colorsTexture.toJSON(e)), this.boundingSphere !== null && (i.boundingSphere = {
      center: this.boundingSphere.center.toArray(),
      radius: this.boundingSphere.radius
    }), this.boundingBox !== null && (i.boundingBox = {
      min: this.boundingBox.min.toArray(),
      max: this.boundingBox.max.toArray()
    }));
    function s(a, l) {
      return a[l.uuid] === void 0 && (a[l.uuid] = l.toJSON(e)), l.uuid;
    }
    if (this.isScene)
      this.background && (this.background.isColor ? i.background = this.background.toJSON() : this.background.isTexture && (i.background = this.background.toJSON(e).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (i.environment = this.environment.toJSON(e).uuid);
    else if (this.isMesh || this.isLine || this.isPoints) {
      i.geometry = s(e.geometries, this.geometry);
      const a = this.geometry.parameters;
      if (a !== void 0 && a.shapes !== void 0) {
        const l = a.shapes;
        if (Array.isArray(l))
          for (let c = 0, h = l.length; c < h; c++) {
            const d = l[c];
            s(e.shapes, d);
          }
        else
          s(e.shapes, l);
      }
    }
    if (this.isSkinnedMesh && (i.bindMode = this.bindMode, i.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (s(e.skeletons, this.skeleton), i.skeleton = this.skeleton.uuid)), this.material !== void 0)
      if (Array.isArray(this.material)) {
        const a = [];
        for (let l = 0, c = this.material.length; l < c; l++)
          a.push(s(e.materials, this.material[l]));
        i.material = a;
      } else
        i.material = s(e.materials, this.material);
    if (this.children.length > 0) {
      i.children = [];
      for (let a = 0; a < this.children.length; a++)
        i.children.push(this.children[a].toJSON(e).object);
    }
    if (this.animations.length > 0) {
      i.animations = [];
      for (let a = 0; a < this.animations.length; a++) {
        const l = this.animations[a];
        i.animations.push(s(e.animations, l));
      }
    }
    if (t) {
      const a = o(e.geometries), l = o(e.materials), c = o(e.textures), h = o(e.images), d = o(e.shapes), u = o(e.skeletons), m = o(e.animations), g = o(e.nodes);
      a.length > 0 && (n.geometries = a), l.length > 0 && (n.materials = l), c.length > 0 && (n.textures = c), h.length > 0 && (n.images = h), d.length > 0 && (n.shapes = d), u.length > 0 && (n.skeletons = u), m.length > 0 && (n.animations = m), g.length > 0 && (n.nodes = g);
    }
    return n.object = i, n;
    function o(a) {
      const l = [];
      for (const c in a) {
        const h = a[c];
        delete h.metadata, l.push(h);
      }
      return l;
    }
  }
  clone(e) {
    return new this.constructor().copy(this, e);
  }
  copy(e, t = !0) {
    if (this.name = e.name, this.up.copy(e.up), this.position.copy(e.position), this.rotation.order = e.rotation.order, this.quaternion.copy(e.quaternion), this.scale.copy(e.scale), this.matrix.copy(e.matrix), this.matrixWorld.copy(e.matrixWorld), this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrixWorldAutoUpdate = e.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate, this.layers.mask = e.layers.mask, this.visible = e.visible, this.castShadow = e.castShadow, this.receiveShadow = e.receiveShadow, this.frustumCulled = e.frustumCulled, this.renderOrder = e.renderOrder, this.animations = e.animations.slice(), this.userData = JSON.parse(JSON.stringify(e.userData)), t === !0)
      for (let n = 0; n < e.children.length; n++) {
        const i = e.children[n];
        this.add(i.clone());
      }
    return this;
  }
}
xt.DEFAULT_UP = /* @__PURE__ */ new H(0, 1, 0);
xt.DEFAULT_MATRIX_AUTO_UPDATE = !0;
xt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const Yt = /* @__PURE__ */ new H(), vn = /* @__PURE__ */ new H(), fr = /* @__PURE__ */ new H(), xn = /* @__PURE__ */ new H(), gi = /* @__PURE__ */ new H(), _i = /* @__PURE__ */ new H(), Da = /* @__PURE__ */ new H(), pr = /* @__PURE__ */ new H(), mr = /* @__PURE__ */ new H(), gr = /* @__PURE__ */ new H(), _r = /* @__PURE__ */ new lt(), vr = /* @__PURE__ */ new lt(), xr = /* @__PURE__ */ new lt();
class jt {
  constructor(e = new H(), t = new H(), n = new H()) {
    this.a = e, this.b = t, this.c = n;
  }
  static getNormal(e, t, n, i) {
    i.subVectors(n, t), Yt.subVectors(e, t), i.cross(Yt);
    const s = i.lengthSq();
    return s > 0 ? i.multiplyScalar(1 / Math.sqrt(s)) : i.set(0, 0, 0);
  }
  static getBarycoord(e, t, n, i, s) {
    Yt.subVectors(i, t), vn.subVectors(n, t), fr.subVectors(e, t);
    const o = Yt.dot(Yt), a = Yt.dot(vn), l = Yt.dot(fr), c = vn.dot(vn), h = vn.dot(fr), d = o * c - a * a;
    if (d === 0)
      return s.set(0, 0, 0), null;
    const u = 1 / d, m = (c * l - a * h) * u, g = (o * h - a * l) * u;
    return s.set(1 - m - g, g, m);
  }
  static containsPoint(e, t, n, i) {
    return this.getBarycoord(e, t, n, i, xn) === null ? !1 : xn.x >= 0 && xn.y >= 0 && xn.x + xn.y <= 1;
  }
  static getInterpolation(e, t, n, i, s, o, a, l) {
    return this.getBarycoord(e, t, n, i, xn) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(s, xn.x), l.addScaledVector(o, xn.y), l.addScaledVector(a, xn.z), l);
  }
  static getInterpolatedAttribute(e, t, n, i, s, o) {
    return _r.setScalar(0), vr.setScalar(0), xr.setScalar(0), _r.fromBufferAttribute(e, t), vr.fromBufferAttribute(e, n), xr.fromBufferAttribute(e, i), o.setScalar(0), o.addScaledVector(_r, s.x), o.addScaledVector(vr, s.y), o.addScaledVector(xr, s.z), o;
  }
  static isFrontFacing(e, t, n, i) {
    return Yt.subVectors(n, t), vn.subVectors(e, t), Yt.cross(vn).dot(i) < 0;
  }
  set(e, t, n) {
    return this.a.copy(e), this.b.copy(t), this.c.copy(n), this;
  }
  setFromPointsAndIndices(e, t, n, i) {
    return this.a.copy(e[t]), this.b.copy(e[n]), this.c.copy(e[i]), this;
  }
  setFromAttributeAndIndices(e, t, n, i) {
    return this.a.fromBufferAttribute(e, t), this.b.fromBufferAttribute(e, n), this.c.fromBufferAttribute(e, i), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this;
  }
  getArea() {
    return Yt.subVectors(this.c, this.b), vn.subVectors(this.a, this.b), Yt.cross(vn).length() * 0.5;
  }
  getMidpoint(e) {
    return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  getNormal(e) {
    return jt.getNormal(this.a, this.b, this.c, e);
  }
  getPlane(e) {
    return e.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(e, t) {
    return jt.getBarycoord(e, this.a, this.b, this.c, t);
  }
  getInterpolation(e, t, n, i, s) {
    return jt.getInterpolation(e, this.a, this.b, this.c, t, n, i, s);
  }
  containsPoint(e) {
    return jt.containsPoint(e, this.a, this.b, this.c);
  }
  isFrontFacing(e) {
    return jt.isFrontFacing(this.a, this.b, this.c, e);
  }
  intersectsBox(e) {
    return e.intersectsTriangle(this);
  }
  closestPointToPoint(e, t) {
    const n = this.a, i = this.b, s = this.c;
    let o, a;
    gi.subVectors(i, n), _i.subVectors(s, n), pr.subVectors(e, n);
    const l = gi.dot(pr), c = _i.dot(pr);
    if (l <= 0 && c <= 0)
      return t.copy(n);
    mr.subVectors(e, i);
    const h = gi.dot(mr), d = _i.dot(mr);
    if (h >= 0 && d <= h)
      return t.copy(i);
    const u = l * d - h * c;
    if (u <= 0 && l >= 0 && h <= 0)
      return o = l / (l - h), t.copy(n).addScaledVector(gi, o);
    gr.subVectors(e, s);
    const m = gi.dot(gr), g = _i.dot(gr);
    if (g >= 0 && m <= g)
      return t.copy(s);
    const _ = m * c - l * g;
    if (_ <= 0 && c >= 0 && g <= 0)
      return a = c / (c - g), t.copy(n).addScaledVector(_i, a);
    const f = h * g - m * d;
    if (f <= 0 && d - h >= 0 && m - g >= 0)
      return Da.subVectors(s, i), a = (d - h) / (d - h + (m - g)), t.copy(i).addScaledVector(Da, a);
    const p = 1 / (f + _ + u);
    return o = _ * p, a = u * p, t.copy(n).addScaledVector(gi, o).addScaledVector(_i, a);
  }
  equals(e) {
    return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
  }
}
const zl = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
}, Pn = { h: 0, s: 0, l: 0 }, vs = { h: 0, s: 0, l: 0 };
function yr(r, e, t) {
  return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? r + (e - r) * 6 * t : t < 1 / 2 ? e : t < 2 / 3 ? r + (e - r) * 6 * (2 / 3 - t) : r;
}
class Oe {
  constructor(e, t, n) {
    return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(e, t, n);
  }
  set(e, t, n) {
    if (t === void 0 && n === void 0) {
      const i = e;
      i && i.isColor ? this.copy(i) : typeof i == "number" ? this.setHex(i) : typeof i == "string" && this.setStyle(i);
    } else
      this.setRGB(e, t, n);
    return this;
  }
  setScalar(e) {
    return this.r = e, this.g = e, this.b = e, this;
  }
  setHex(e, t = Vt) {
    return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, Ye.toWorkingColorSpace(this, t), this;
  }
  setRGB(e, t, n, i = Ye.workingColorSpace) {
    return this.r = e, this.g = t, this.b = n, Ye.toWorkingColorSpace(this, i), this;
  }
  setHSL(e, t, n, i = Ye.workingColorSpace) {
    if (e = yd(e, 1), t = Be(t, 0, 1), n = Be(n, 0, 1), t === 0)
      this.r = this.g = this.b = n;
    else {
      const s = n <= 0.5 ? n * (1 + t) : n + t - n * t, o = 2 * n - s;
      this.r = yr(o, s, e + 1 / 3), this.g = yr(o, s, e), this.b = yr(o, s, e - 1 / 3);
    }
    return Ye.toWorkingColorSpace(this, i), this;
  }
  setStyle(e, t = Vt) {
    function n(s) {
      s !== void 0 && parseFloat(s) < 1 && console.warn("THREE.Color: Alpha component of " + e + " will be ignored.");
    }
    let i;
    if (i = /^(\w+)\(([^\)]*)\)/.exec(e)) {
      let s;
      const o = i[1], a = i[2];
      switch (o) {
        case "rgb":
        case "rgba":
          if (s = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))
            return n(s[4]), this.setRGB(
              Math.min(255, parseInt(s[1], 10)) / 255,
              Math.min(255, parseInt(s[2], 10)) / 255,
              Math.min(255, parseInt(s[3], 10)) / 255,
              t
            );
          if (s = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))
            return n(s[4]), this.setRGB(
              Math.min(100, parseInt(s[1], 10)) / 100,
              Math.min(100, parseInt(s[2], 10)) / 100,
              Math.min(100, parseInt(s[3], 10)) / 100,
              t
            );
          break;
        case "hsl":
        case "hsla":
          if (s = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))
            return n(s[4]), this.setHSL(
              parseFloat(s[1]) / 360,
              parseFloat(s[2]) / 100,
              parseFloat(s[3]) / 100,
              t
            );
          break;
        default:
          console.warn("THREE.Color: Unknown color model " + e);
      }
    } else if (i = /^\#([A-Fa-f\d]+)$/.exec(e)) {
      const s = i[1], o = s.length;
      if (o === 3)
        return this.setRGB(
          parseInt(s.charAt(0), 16) / 15,
          parseInt(s.charAt(1), 16) / 15,
          parseInt(s.charAt(2), 16) / 15,
          t
        );
      if (o === 6)
        return this.setHex(parseInt(s, 16), t);
      console.warn("THREE.Color: Invalid hex color " + e);
    } else if (e && e.length > 0)
      return this.setColorName(e, t);
    return this;
  }
  setColorName(e, t = Vt) {
    const n = zl[e.toLowerCase()];
    return n !== void 0 ? this.setHex(n, t) : console.warn("THREE.Color: Unknown color " + e), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(e) {
    return this.r = e.r, this.g = e.g, this.b = e.b, this;
  }
  copySRGBToLinear(e) {
    return this.r = bn(e.r), this.g = bn(e.g), this.b = bn(e.b), this;
  }
  copyLinearToSRGB(e) {
    return this.r = wi(e.r), this.g = wi(e.g), this.b = wi(e.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(e = Vt) {
    return Ye.fromWorkingColorSpace(St.copy(this), e), Math.round(Be(St.r * 255, 0, 255)) * 65536 + Math.round(Be(St.g * 255, 0, 255)) * 256 + Math.round(Be(St.b * 255, 0, 255));
  }
  getHexString(e = Vt) {
    return ("000000" + this.getHex(e).toString(16)).slice(-6);
  }
  getHSL(e, t = Ye.workingColorSpace) {
    Ye.fromWorkingColorSpace(St.copy(this), t);
    const n = St.r, i = St.g, s = St.b, o = Math.max(n, i, s), a = Math.min(n, i, s);
    let l, c;
    const h = (a + o) / 2;
    if (a === o)
      l = 0, c = 0;
    else {
      const d = o - a;
      switch (c = h <= 0.5 ? d / (o + a) : d / (2 - o - a), o) {
        case n:
          l = (i - s) / d + (i < s ? 6 : 0);
          break;
        case i:
          l = (s - n) / d + 2;
          break;
        case s:
          l = (n - i) / d + 4;
          break;
      }
      l /= 6;
    }
    return e.h = l, e.s = c, e.l = h, e;
  }
  getRGB(e, t = Ye.workingColorSpace) {
    return Ye.fromWorkingColorSpace(St.copy(this), t), e.r = St.r, e.g = St.g, e.b = St.b, e;
  }
  getStyle(e = Vt) {
    Ye.fromWorkingColorSpace(St.copy(this), e);
    const t = St.r, n = St.g, i = St.b;
    return e !== Vt ? `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})` : `rgb(${Math.round(t * 255)},${Math.round(n * 255)},${Math.round(i * 255)})`;
  }
  offsetHSL(e, t, n) {
    return this.getHSL(Pn), this.setHSL(Pn.h + e, Pn.s + t, Pn.l + n);
  }
  add(e) {
    return this.r += e.r, this.g += e.g, this.b += e.b, this;
  }
  addColors(e, t) {
    return this.r = e.r + t.r, this.g = e.g + t.g, this.b = e.b + t.b, this;
  }
  addScalar(e) {
    return this.r += e, this.g += e, this.b += e, this;
  }
  sub(e) {
    return this.r = Math.max(0, this.r - e.r), this.g = Math.max(0, this.g - e.g), this.b = Math.max(0, this.b - e.b), this;
  }
  multiply(e) {
    return this.r *= e.r, this.g *= e.g, this.b *= e.b, this;
  }
  multiplyScalar(e) {
    return this.r *= e, this.g *= e, this.b *= e, this;
  }
  lerp(e, t) {
    return this.r += (e.r - this.r) * t, this.g += (e.g - this.g) * t, this.b += (e.b - this.b) * t, this;
  }
  lerpColors(e, t, n) {
    return this.r = e.r + (t.r - e.r) * n, this.g = e.g + (t.g - e.g) * n, this.b = e.b + (t.b - e.b) * n, this;
  }
  lerpHSL(e, t) {
    this.getHSL(Pn), e.getHSL(vs);
    const n = ir(Pn.h, vs.h, t), i = ir(Pn.s, vs.s, t), s = ir(Pn.l, vs.l, t);
    return this.setHSL(n, i, s), this;
  }
  setFromVector3(e) {
    return this.r = e.x, this.g = e.y, this.b = e.z, this;
  }
  applyMatrix3(e) {
    const t = this.r, n = this.g, i = this.b, s = e.elements;
    return this.r = s[0] * t + s[3] * n + s[6] * i, this.g = s[1] * t + s[4] * n + s[7] * i, this.b = s[2] * t + s[5] * n + s[8] * i, this;
  }
  equals(e) {
    return e.r === this.r && e.g === this.g && e.b === this.b;
  }
  fromArray(e, t = 0) {
    return this.r = e[t], this.g = e[t + 1], this.b = e[t + 2], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.r, e[t + 1] = this.g, e[t + 2] = this.b, e;
  }
  fromBufferAttribute(e, t) {
    return this.r = e.getX(t), this.g = e.getY(t), this.b = e.getZ(t), this;
  }
  toJSON() {
    return this.getHex();
  }
  *[Symbol.iterator]() {
    yield this.r, yield this.g, yield this.b;
  }
}
const St = /* @__PURE__ */ new Oe();
Oe.NAMES = zl;
let Bd = 0;
class si extends Di {
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Bd++ }), this.uuid = Ji(), this.name = "", this.type = "Material", this.blending = bi, this.side = Un, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = Ir, this.blendDst = Ur, this.blendEquation = Kn, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Oe(0, 0, 0), this.blendAlpha = 0, this.depthFunc = Ti, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = _a, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = li, this.stencilZFail = li, this.stencilZPass = li, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.allowOverride = !0, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
  }
  get alphaTest() {
    return this._alphaTest;
  }
  set alphaTest(e) {
    this._alphaTest > 0 != e > 0 && this.version++, this._alphaTest = e;
  }
  onBeforeRender() {
  }
  onBeforeCompile() {
  }
  customProgramCacheKey() {
    return this.onBeforeCompile.toString();
  }
  setValues(e) {
    if (e !== void 0)
      for (const t in e) {
        const n = e[t];
        if (n === void 0) {
          console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);
          continue;
        }
        const i = this[t];
        if (i === void 0) {
          console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);
          continue;
        }
        i && i.isColor ? i.set(n) : i && i.isVector3 && n && n.isVector3 ? i.copy(n) : this[t] = n;
      }
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    t && (e = {
      textures: {},
      images: {}
    });
    const n = {
      metadata: {
        version: 4.6,
        type: "Material",
        generator: "Material.toJSON"
      }
    };
    n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(e).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(e).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(e).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(e).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(e).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(e).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(e).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(e).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(e).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(e).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(e).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(e).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(e).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(e).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(e).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(e).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(e).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(e).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(e).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== bi && (n.blending = this.blending), this.side !== Un && (n.side = this.side), this.vertexColors === !0 && (n.vertexColors = !0), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === !0 && (n.transparent = !0), this.blendSrc !== Ir && (n.blendSrc = this.blendSrc), this.blendDst !== Ur && (n.blendDst = this.blendDst), this.blendEquation !== Kn && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== Ti && (n.depthFunc = this.depthFunc), this.depthTest === !1 && (n.depthTest = this.depthTest), this.depthWrite === !1 && (n.depthWrite = this.depthWrite), this.colorWrite === !1 && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== _a && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== li && (n.stencilFail = this.stencilFail), this.stencilZFail !== li && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== li && (n.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === !0 && (n.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === !0 && (n.dithering = !0), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === !0 && (n.alphaHash = !0), this.alphaToCoverage === !0 && (n.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0), this.forceSinglePass === !0 && (n.forceSinglePass = !0), this.wireframe === !0 && (n.wireframe = !0), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (n.flatShading = !0), this.visible === !1 && (n.visible = !1), this.toneMapped === !1 && (n.toneMapped = !1), this.fog === !1 && (n.fog = !1), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
    function i(s) {
      const o = [];
      for (const a in s) {
        const l = s[a];
        delete l.metadata, o.push(l);
      }
      return o;
    }
    if (t) {
      const s = i(e.textures), o = i(e.images);
      s.length > 0 && (n.textures = s), o.length > 0 && (n.images = o);
    }
    return n;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.name = e.name, this.blending = e.blending, this.side = e.side, this.vertexColors = e.vertexColors, this.opacity = e.opacity, this.transparent = e.transparent, this.blendSrc = e.blendSrc, this.blendDst = e.blendDst, this.blendEquation = e.blendEquation, this.blendSrcAlpha = e.blendSrcAlpha, this.blendDstAlpha = e.blendDstAlpha, this.blendEquationAlpha = e.blendEquationAlpha, this.blendColor.copy(e.blendColor), this.blendAlpha = e.blendAlpha, this.depthFunc = e.depthFunc, this.depthTest = e.depthTest, this.depthWrite = e.depthWrite, this.stencilWriteMask = e.stencilWriteMask, this.stencilFunc = e.stencilFunc, this.stencilRef = e.stencilRef, this.stencilFuncMask = e.stencilFuncMask, this.stencilFail = e.stencilFail, this.stencilZFail = e.stencilZFail, this.stencilZPass = e.stencilZPass, this.stencilWrite = e.stencilWrite;
    const t = e.clippingPlanes;
    let n = null;
    if (t !== null) {
      const i = t.length;
      n = new Array(i);
      for (let s = 0; s !== i; ++s)
        n[s] = t[s].clone();
    }
    return this.clippingPlanes = n, this.clipIntersection = e.clipIntersection, this.clipShadows = e.clipShadows, this.shadowSide = e.shadowSide, this.colorWrite = e.colorWrite, this.precision = e.precision, this.polygonOffset = e.polygonOffset, this.polygonOffsetFactor = e.polygonOffsetFactor, this.polygonOffsetUnits = e.polygonOffsetUnits, this.dithering = e.dithering, this.alphaTest = e.alphaTest, this.alphaHash = e.alphaHash, this.alphaToCoverage = e.alphaToCoverage, this.premultipliedAlpha = e.premultipliedAlpha, this.forceSinglePass = e.forceSinglePass, this.visible = e.visible, this.toneMapped = e.toneMapped, this.userData = JSON.parse(JSON.stringify(e.userData)), this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
}
class kl extends si {
  constructor(e) {
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new Oe(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Qt(), this.combine = Ao, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
  }
}
const ut = /* @__PURE__ */ new H(), xs = /* @__PURE__ */ new ze();
let zd = 0;
class on {
  constructor(e, t, n = !1) {
    if (Array.isArray(e))
      throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
    this.isBufferAttribute = !0, Object.defineProperty(this, "id", { value: zd++ }), this.name = "", this.array = e, this.itemSize = t, this.count = e !== void 0 ? e.length / t : 0, this.normalized = n, this.usage = va, this.updateRanges = [], this.gpuType = Sn, this.version = 0;
  }
  onUploadCallback() {
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  setUsage(e) {
    return this.usage = e, this;
  }
  addUpdateRange(e, t) {
    this.updateRanges.push({ start: e, count: t });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(e) {
    return this.name = e.name, this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.count = e.count, this.normalized = e.normalized, this.usage = e.usage, this.gpuType = e.gpuType, this;
  }
  copyAt(e, t, n) {
    e *= this.itemSize, n *= t.itemSize;
    for (let i = 0, s = this.itemSize; i < s; i++)
      this.array[e + i] = t.array[n + i];
    return this;
  }
  copyArray(e) {
    return this.array.set(e), this;
  }
  applyMatrix3(e) {
    if (this.itemSize === 2)
      for (let t = 0, n = this.count; t < n; t++)
        xs.fromBufferAttribute(this, t), xs.applyMatrix3(e), this.setXY(t, xs.x, xs.y);
    else if (this.itemSize === 3)
      for (let t = 0, n = this.count; t < n; t++)
        ut.fromBufferAttribute(this, t), ut.applyMatrix3(e), this.setXYZ(t, ut.x, ut.y, ut.z);
    return this;
  }
  applyMatrix4(e) {
    for (let t = 0, n = this.count; t < n; t++)
      ut.fromBufferAttribute(this, t), ut.applyMatrix4(e), this.setXYZ(t, ut.x, ut.y, ut.z);
    return this;
  }
  applyNormalMatrix(e) {
    for (let t = 0, n = this.count; t < n; t++)
      ut.fromBufferAttribute(this, t), ut.applyNormalMatrix(e), this.setXYZ(t, ut.x, ut.y, ut.z);
    return this;
  }
  transformDirection(e) {
    for (let t = 0, n = this.count; t < n; t++)
      ut.fromBufferAttribute(this, t), ut.transformDirection(e), this.setXYZ(t, ut.x, ut.y, ut.z);
    return this;
  }
  set(e, t = 0) {
    return this.array.set(e, t), this;
  }
  getComponent(e, t) {
    let n = this.array[e * this.itemSize + t];
    return this.normalized && (n = zi(n, this.array)), n;
  }
  setComponent(e, t, n) {
    return this.normalized && (n = Rt(n, this.array)), this.array[e * this.itemSize + t] = n, this;
  }
  getX(e) {
    let t = this.array[e * this.itemSize];
    return this.normalized && (t = zi(t, this.array)), t;
  }
  setX(e, t) {
    return this.normalized && (t = Rt(t, this.array)), this.array[e * this.itemSize] = t, this;
  }
  getY(e) {
    let t = this.array[e * this.itemSize + 1];
    return this.normalized && (t = zi(t, this.array)), t;
  }
  setY(e, t) {
    return this.normalized && (t = Rt(t, this.array)), this.array[e * this.itemSize + 1] = t, this;
  }
  getZ(e) {
    let t = this.array[e * this.itemSize + 2];
    return this.normalized && (t = zi(t, this.array)), t;
  }
  setZ(e, t) {
    return this.normalized && (t = Rt(t, this.array)), this.array[e * this.itemSize + 2] = t, this;
  }
  getW(e) {
    let t = this.array[e * this.itemSize + 3];
    return this.normalized && (t = zi(t, this.array)), t;
  }
  setW(e, t) {
    return this.normalized && (t = Rt(t, this.array)), this.array[e * this.itemSize + 3] = t, this;
  }
  setXY(e, t, n) {
    return e *= this.itemSize, this.normalized && (t = Rt(t, this.array), n = Rt(n, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this;
  }
  setXYZ(e, t, n, i) {
    return e *= this.itemSize, this.normalized && (t = Rt(t, this.array), n = Rt(n, this.array), i = Rt(i, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this;
  }
  setXYZW(e, t, n, i, s) {
    return e *= this.itemSize, this.normalized && (t = Rt(t, this.array), n = Rt(n, this.array), i = Rt(i, this.array), s = Rt(s, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this.array[e + 3] = s, this;
  }
  onUpload(e) {
    return this.onUploadCallback = e, this;
  }
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this);
  }
  toJSON() {
    const e = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized
    };
    return this.name !== "" && (e.name = this.name), this.usage !== va && (e.usage = this.usage), e;
  }
}
class Vl extends on {
  constructor(e, t, n) {
    super(new Uint16Array(e), t, n);
  }
}
class Hl extends on {
  constructor(e, t, n) {
    super(new Uint32Array(e), t, n);
  }
}
class Et extends on {
  constructor(e, t, n) {
    super(new Float32Array(e), t, n);
  }
}
let kd = 0;
const zt = /* @__PURE__ */ new rt(), Mr = /* @__PURE__ */ new xt(), vi = /* @__PURE__ */ new H(), Ft = /* @__PURE__ */ new es(), Gi = /* @__PURE__ */ new es(), _t = /* @__PURE__ */ new H();
class ln extends Di {
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: kd++ }), this.uuid = Ji(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(e) {
    return Array.isArray(e) ? this.index = new (Nl(e) ? Hl : Vl)(e, 1) : this.index = e, this;
  }
  setIndirect(e) {
    return this.indirect = e, this;
  }
  getIndirect() {
    return this.indirect;
  }
  getAttribute(e) {
    return this.attributes[e];
  }
  setAttribute(e, t) {
    return this.attributes[e] = t, this;
  }
  deleteAttribute(e) {
    return delete this.attributes[e], this;
  }
  hasAttribute(e) {
    return this.attributes[e] !== void 0;
  }
  addGroup(e, t, n = 0) {
    this.groups.push({
      start: e,
      count: t,
      materialIndex: n
    });
  }
  clearGroups() {
    this.groups = [];
  }
  setDrawRange(e, t) {
    this.drawRange.start = e, this.drawRange.count = t;
  }
  applyMatrix4(e) {
    const t = this.attributes.position;
    t !== void 0 && (t.applyMatrix4(e), t.needsUpdate = !0);
    const n = this.attributes.normal;
    if (n !== void 0) {
      const s = new Ie().getNormalMatrix(e);
      n.applyNormalMatrix(s), n.needsUpdate = !0;
    }
    const i = this.attributes.tangent;
    return i !== void 0 && (i.transformDirection(e), i.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  applyQuaternion(e) {
    return zt.makeRotationFromQuaternion(e), this.applyMatrix4(zt), this;
  }
  rotateX(e) {
    return zt.makeRotationX(e), this.applyMatrix4(zt), this;
  }
  rotateY(e) {
    return zt.makeRotationY(e), this.applyMatrix4(zt), this;
  }
  rotateZ(e) {
    return zt.makeRotationZ(e), this.applyMatrix4(zt), this;
  }
  translate(e, t, n) {
    return zt.makeTranslation(e, t, n), this.applyMatrix4(zt), this;
  }
  scale(e, t, n) {
    return zt.makeScale(e, t, n), this.applyMatrix4(zt), this;
  }
  lookAt(e) {
    return Mr.lookAt(e), Mr.updateMatrix(), this.applyMatrix4(Mr.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(vi).negate(), this.translate(vi.x, vi.y, vi.z), this;
  }
  setFromPoints(e) {
    const t = this.getAttribute("position");
    if (t === void 0) {
      const n = [];
      for (let i = 0, s = e.length; i < s; i++) {
        const o = e[i];
        n.push(o.x, o.y, o.z || 0);
      }
      this.setAttribute("position", new Et(n, 3));
    } else {
      const n = Math.min(e.length, t.count);
      for (let i = 0; i < n; i++) {
        const s = e[i];
        t.setXYZ(i, s.x, s.y, s.z || 0);
      }
      e.length > t.count && console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."), t.needsUpdate = !0;
    }
    return this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new es());
    const e = this.attributes.position, t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(
        new H(-1 / 0, -1 / 0, -1 / 0),
        new H(1 / 0, 1 / 0, 1 / 0)
      );
      return;
    }
    if (e !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(e), t)
        for (let n = 0, i = t.length; n < i; n++) {
          const s = t[n];
          Ft.setFromBufferAttribute(s), this.morphTargetsRelative ? (_t.addVectors(this.boundingBox.min, Ft.min), this.boundingBox.expandByPoint(_t), _t.addVectors(this.boundingBox.max, Ft.max), this.boundingBox.expandByPoint(_t)) : (this.boundingBox.expandByPoint(Ft.min), this.boundingBox.expandByPoint(Ft.max));
        }
    } else
      this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new Ki());
    const e = this.attributes.position, t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new H(), 1 / 0);
      return;
    }
    if (e) {
      const n = this.boundingSphere.center;
      if (Ft.setFromBufferAttribute(e), t)
        for (let s = 0, o = t.length; s < o; s++) {
          const a = t[s];
          Gi.setFromBufferAttribute(a), this.morphTargetsRelative ? (_t.addVectors(Ft.min, Gi.min), Ft.expandByPoint(_t), _t.addVectors(Ft.max, Gi.max), Ft.expandByPoint(_t)) : (Ft.expandByPoint(Gi.min), Ft.expandByPoint(Gi.max));
        }
      Ft.getCenter(n);
      let i = 0;
      for (let s = 0, o = e.count; s < o; s++)
        _t.fromBufferAttribute(e, s), i = Math.max(i, n.distanceToSquared(_t));
      if (t)
        for (let s = 0, o = t.length; s < o; s++) {
          const a = t[s], l = this.morphTargetsRelative;
          for (let c = 0, h = a.count; c < h; c++)
            _t.fromBufferAttribute(a, c), l && (vi.fromBufferAttribute(e, c), _t.add(vi)), i = Math.max(i, n.distanceToSquared(_t));
        }
      this.boundingSphere.radius = Math.sqrt(i), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
    }
  }
  computeTangents() {
    const e = this.index, t = this.attributes;
    if (e === null || t.position === void 0 || t.normal === void 0 || t.uv === void 0) {
      console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
      return;
    }
    const n = t.position, i = t.normal, s = t.uv;
    this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new on(new Float32Array(4 * n.count), 4));
    const o = this.getAttribute("tangent"), a = [], l = [];
    for (let D = 0; D < n.count; D++)
      a[D] = new H(), l[D] = new H();
    const c = new H(), h = new H(), d = new H(), u = new ze(), m = new ze(), g = new ze(), _ = new H(), f = new H();
    function p(D, b, y) {
      c.fromBufferAttribute(n, D), h.fromBufferAttribute(n, b), d.fromBufferAttribute(n, y), u.fromBufferAttribute(s, D), m.fromBufferAttribute(s, b), g.fromBufferAttribute(s, y), h.sub(c), d.sub(c), m.sub(u), g.sub(u);
      const P = 1 / (m.x * g.y - g.x * m.y);
      !isFinite(P) || (_.copy(h).multiplyScalar(g.y).addScaledVector(d, -m.y).multiplyScalar(P), f.copy(d).multiplyScalar(m.x).addScaledVector(h, -g.x).multiplyScalar(P), a[D].add(_), a[b].add(_), a[y].add(_), l[D].add(f), l[b].add(f), l[y].add(f));
    }
    let v = this.groups;
    v.length === 0 && (v = [{
      start: 0,
      count: e.count
    }]);
    for (let D = 0, b = v.length; D < b; ++D) {
      const y = v[D], P = y.start, B = y.count;
      for (let L = P, U = P + B; L < U; L += 3)
        p(
          e.getX(L + 0),
          e.getX(L + 1),
          e.getX(L + 2)
        );
    }
    const M = new H(), x = new H(), A = new H(), T = new H();
    function C(D) {
      A.fromBufferAttribute(i, D), T.copy(A);
      const b = a[D];
      M.copy(b), M.sub(A.multiplyScalar(A.dot(b))).normalize(), x.crossVectors(T, b);
      const P = x.dot(l[D]) < 0 ? -1 : 1;
      o.setXYZW(D, M.x, M.y, M.z, P);
    }
    for (let D = 0, b = v.length; D < b; ++D) {
      const y = v[D], P = y.start, B = y.count;
      for (let L = P, U = P + B; L < U; L += 3)
        C(e.getX(L + 0)), C(e.getX(L + 1)), C(e.getX(L + 2));
    }
  }
  computeVertexNormals() {
    const e = this.index, t = this.getAttribute("position");
    if (t !== void 0) {
      let n = this.getAttribute("normal");
      if (n === void 0)
        n = new on(new Float32Array(t.count * 3), 3), this.setAttribute("normal", n);
      else
        for (let u = 0, m = n.count; u < m; u++)
          n.setXYZ(u, 0, 0, 0);
      const i = new H(), s = new H(), o = new H(), a = new H(), l = new H(), c = new H(), h = new H(), d = new H();
      if (e)
        for (let u = 0, m = e.count; u < m; u += 3) {
          const g = e.getX(u + 0), _ = e.getX(u + 1), f = e.getX(u + 2);
          i.fromBufferAttribute(t, g), s.fromBufferAttribute(t, _), o.fromBufferAttribute(t, f), h.subVectors(o, s), d.subVectors(i, s), h.cross(d), a.fromBufferAttribute(n, g), l.fromBufferAttribute(n, _), c.fromBufferAttribute(n, f), a.add(h), l.add(h), c.add(h), n.setXYZ(g, a.x, a.y, a.z), n.setXYZ(_, l.x, l.y, l.z), n.setXYZ(f, c.x, c.y, c.z);
        }
      else
        for (let u = 0, m = t.count; u < m; u += 3)
          i.fromBufferAttribute(t, u + 0), s.fromBufferAttribute(t, u + 1), o.fromBufferAttribute(t, u + 2), h.subVectors(o, s), d.subVectors(i, s), h.cross(d), n.setXYZ(u + 0, h.x, h.y, h.z), n.setXYZ(u + 1, h.x, h.y, h.z), n.setXYZ(u + 2, h.x, h.y, h.z);
      this.normalizeNormals(), n.needsUpdate = !0;
    }
  }
  normalizeNormals() {
    const e = this.attributes.normal;
    for (let t = 0, n = e.count; t < n; t++)
      _t.fromBufferAttribute(e, t), _t.normalize(), e.setXYZ(t, _t.x, _t.y, _t.z);
  }
  toNonIndexed() {
    function e(a, l) {
      const c = a.array, h = a.itemSize, d = a.normalized, u = new c.constructor(l.length * h);
      let m = 0, g = 0;
      for (let _ = 0, f = l.length; _ < f; _++) {
        a.isInterleavedBufferAttribute ? m = l[_] * a.data.stride + a.offset : m = l[_] * h;
        for (let p = 0; p < h; p++)
          u[g++] = c[m++];
      }
      return new on(u, h, d);
    }
    if (this.index === null)
      return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const t = new ln(), n = this.index.array, i = this.attributes;
    for (const a in i) {
      const l = i[a], c = e(l, n);
      t.setAttribute(a, c);
    }
    const s = this.morphAttributes;
    for (const a in s) {
      const l = [], c = s[a];
      for (let h = 0, d = c.length; h < d; h++) {
        const u = c[h], m = e(u, n);
        l.push(m);
      }
      t.morphAttributes[a] = l;
    }
    t.morphTargetsRelative = this.morphTargetsRelative;
    const o = this.groups;
    for (let a = 0, l = o.length; a < l; a++) {
      const c = o[a];
      t.addGroup(c.start, c.count, c.materialIndex);
    }
    return t;
  }
  toJSON() {
    const e = {
      metadata: {
        version: 4.6,
        type: "BufferGeometry",
        generator: "BufferGeometry.toJSON"
      }
    };
    if (e.uuid = this.uuid, e.type = this.type, this.name !== "" && (e.name = this.name), Object.keys(this.userData).length > 0 && (e.userData = this.userData), this.parameters !== void 0) {
      const l = this.parameters;
      for (const c in l)
        l[c] !== void 0 && (e[c] = l[c]);
      return e;
    }
    e.data = { attributes: {} };
    const t = this.index;
    t !== null && (e.data.index = {
      type: t.array.constructor.name,
      array: Array.prototype.slice.call(t.array)
    });
    const n = this.attributes;
    for (const l in n) {
      const c = n[l];
      e.data.attributes[l] = c.toJSON(e.data);
    }
    const i = {};
    let s = !1;
    for (const l in this.morphAttributes) {
      const c = this.morphAttributes[l], h = [];
      for (let d = 0, u = c.length; d < u; d++) {
        const m = c[d];
        h.push(m.toJSON(e.data));
      }
      h.length > 0 && (i[l] = h, s = !0);
    }
    s && (e.data.morphAttributes = i, e.data.morphTargetsRelative = this.morphTargetsRelative);
    const o = this.groups;
    o.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(o)));
    const a = this.boundingSphere;
    return a !== null && (e.data.boundingSphere = {
      center: a.center.toArray(),
      radius: a.radius
    }), e;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
    const t = {};
    this.name = e.name;
    const n = e.index;
    n !== null && this.setIndex(n.clone());
    const i = e.attributes;
    for (const c in i) {
      const h = i[c];
      this.setAttribute(c, h.clone(t));
    }
    const s = e.morphAttributes;
    for (const c in s) {
      const h = [], d = s[c];
      for (let u = 0, m = d.length; u < m; u++)
        h.push(d[u].clone(t));
      this.morphAttributes[c] = h;
    }
    this.morphTargetsRelative = e.morphTargetsRelative;
    const o = e.groups;
    for (let c = 0, h = o.length; c < h; c++) {
      const d = o[c];
      this.addGroup(d.start, d.count, d.materialIndex);
    }
    const a = e.boundingBox;
    a !== null && (this.boundingBox = a.clone());
    const l = e.boundingSphere;
    return l !== null && (this.boundingSphere = l.clone()), this.drawRange.start = e.drawRange.start, this.drawRange.count = e.drawRange.count, this.userData = e.userData, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
const La = /* @__PURE__ */ new rt(), Hn = /* @__PURE__ */ new Bl(), ys = /* @__PURE__ */ new Ki(), Fa = /* @__PURE__ */ new H(), Ms = /* @__PURE__ */ new H(), Ss = /* @__PURE__ */ new H(), Es = /* @__PURE__ */ new H(), Sr = /* @__PURE__ */ new H(), bs = /* @__PURE__ */ new H(), Ia = /* @__PURE__ */ new H(), ws = /* @__PURE__ */ new H();
class $t extends xt {
  constructor(e = new ln(), t = new kl()) {
    super(), this.isMesh = !0, this.type = "Mesh", this.geometry = e, this.material = t, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets();
  }
  copy(e, t) {
    return super.copy(e, t), e.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = e.morphTargetInfluences.slice()), e.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary)), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  updateMorphTargets() {
    const t = this.geometry.morphAttributes, n = Object.keys(t);
    if (n.length > 0) {
      const i = t[n[0]];
      if (i !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let s = 0, o = i.length; s < o; s++) {
          const a = i[s].name || String(s);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[a] = s;
        }
      }
    }
  }
  getVertexPosition(e, t) {
    const n = this.geometry, i = n.attributes.position, s = n.morphAttributes.position, o = n.morphTargetsRelative;
    t.fromBufferAttribute(i, e);
    const a = this.morphTargetInfluences;
    if (s && a) {
      bs.set(0, 0, 0);
      for (let l = 0, c = s.length; l < c; l++) {
        const h = a[l], d = s[l];
        h !== 0 && (Sr.fromBufferAttribute(d, e), o ? bs.addScaledVector(Sr, h) : bs.addScaledVector(Sr.sub(t), h));
      }
      t.add(bs);
    }
    return t;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.material, s = this.matrixWorld;
    i !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), ys.copy(n.boundingSphere), ys.applyMatrix4(s), Hn.copy(e.ray).recast(e.near), !(ys.containsPoint(Hn.origin) === !1 && (Hn.intersectSphere(ys, Fa) === null || Hn.origin.distanceToSquared(Fa) > (e.far - e.near) ** 2)) && (La.copy(s).invert(), Hn.copy(e.ray).applyMatrix4(La), !(n.boundingBox !== null && Hn.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(e, t, Hn)));
  }
  _computeIntersections(e, t, n) {
    let i;
    const s = this.geometry, o = this.material, a = s.index, l = s.attributes.position, c = s.attributes.uv, h = s.attributes.uv1, d = s.attributes.normal, u = s.groups, m = s.drawRange;
    if (a !== null)
      if (Array.isArray(o))
        for (let g = 0, _ = u.length; g < _; g++) {
          const f = u[g], p = o[f.materialIndex], v = Math.max(f.start, m.start), M = Math.min(a.count, Math.min(f.start + f.count, m.start + m.count));
          for (let x = v, A = M; x < A; x += 3) {
            const T = a.getX(x), C = a.getX(x + 1), D = a.getX(x + 2);
            i = Ts(this, p, e, n, c, h, d, T, C, D), i && (i.faceIndex = Math.floor(x / 3), i.face.materialIndex = f.materialIndex, t.push(i));
          }
        }
      else {
        const g = Math.max(0, m.start), _ = Math.min(a.count, m.start + m.count);
        for (let f = g, p = _; f < p; f += 3) {
          const v = a.getX(f), M = a.getX(f + 1), x = a.getX(f + 2);
          i = Ts(this, o, e, n, c, h, d, v, M, x), i && (i.faceIndex = Math.floor(f / 3), t.push(i));
        }
      }
    else if (l !== void 0)
      if (Array.isArray(o))
        for (let g = 0, _ = u.length; g < _; g++) {
          const f = u[g], p = o[f.materialIndex], v = Math.max(f.start, m.start), M = Math.min(l.count, Math.min(f.start + f.count, m.start + m.count));
          for (let x = v, A = M; x < A; x += 3) {
            const T = x, C = x + 1, D = x + 2;
            i = Ts(this, p, e, n, c, h, d, T, C, D), i && (i.faceIndex = Math.floor(x / 3), i.face.materialIndex = f.materialIndex, t.push(i));
          }
        }
      else {
        const g = Math.max(0, m.start), _ = Math.min(l.count, m.start + m.count);
        for (let f = g, p = _; f < p; f += 3) {
          const v = f, M = f + 1, x = f + 2;
          i = Ts(this, o, e, n, c, h, d, v, M, x), i && (i.faceIndex = Math.floor(f / 3), t.push(i));
        }
      }
  }
}
function Vd(r, e, t, n, i, s, o, a) {
  let l;
  if (e.side === Pt ? l = n.intersectTriangle(o, s, i, !0, a) : l = n.intersectTriangle(i, s, o, e.side === Un, a), l === null)
    return null;
  ws.copy(a), ws.applyMatrix4(r.matrixWorld);
  const c = t.ray.origin.distanceTo(ws);
  return c < t.near || c > t.far ? null : {
    distance: c,
    point: ws.clone(),
    object: r
  };
}
function Ts(r, e, t, n, i, s, o, a, l, c) {
  r.getVertexPosition(a, Ms), r.getVertexPosition(l, Ss), r.getVertexPosition(c, Es);
  const h = Vd(r, e, t, n, Ms, Ss, Es, Ia);
  if (h) {
    const d = new H();
    jt.getBarycoord(Ia, Ms, Ss, Es, d), i && (h.uv = jt.getInterpolatedAttribute(i, a, l, c, d, new ze())), s && (h.uv1 = jt.getInterpolatedAttribute(s, a, l, c, d, new ze())), o && (h.normal = jt.getInterpolatedAttribute(o, a, l, c, d, new H()), h.normal.dot(n.direction) > 0 && h.normal.multiplyScalar(-1));
    const u = {
      a,
      b: l,
      c,
      normal: new H(),
      materialIndex: 0
    };
    jt.getNormal(Ms, Ss, Es, u.normal), h.face = u, h.barycoord = d;
  }
  return h;
}
class ts extends ln {
  constructor(e = 1, t = 1, n = 1, i = 1, s = 1, o = 1) {
    super(), this.type = "BoxGeometry", this.parameters = {
      width: e,
      height: t,
      depth: n,
      widthSegments: i,
      heightSegments: s,
      depthSegments: o
    };
    const a = this;
    i = Math.floor(i), s = Math.floor(s), o = Math.floor(o);
    const l = [], c = [], h = [], d = [];
    let u = 0, m = 0;
    g("z", "y", "x", -1, -1, n, t, e, o, s, 0), g("z", "y", "x", 1, -1, n, t, -e, o, s, 1), g("x", "z", "y", 1, 1, e, n, t, i, o, 2), g("x", "z", "y", 1, -1, e, n, -t, i, o, 3), g("x", "y", "z", 1, -1, e, t, n, i, s, 4), g("x", "y", "z", -1, -1, e, t, -n, i, s, 5), this.setIndex(l), this.setAttribute("position", new Et(c, 3)), this.setAttribute("normal", new Et(h, 3)), this.setAttribute("uv", new Et(d, 2));
    function g(_, f, p, v, M, x, A, T, C, D, b) {
      const y = x / C, P = A / D, B = x / 2, L = A / 2, U = T / 2, O = C + 1, F = D + 1;
      let K = 0, V = 0;
      const $ = new H();
      for (let se = 0; se < F; se++) {
        const de = se * P - L;
        for (let ne = 0; ne < O; ne++) {
          const ke = ne * y - B;
          $[_] = ke * v, $[f] = de * M, $[p] = U, c.push($.x, $.y, $.z), $[_] = 0, $[f] = 0, $[p] = T > 0 ? 1 : -1, h.push($.x, $.y, $.z), d.push(ne / C), d.push(1 - se / D), K += 1;
        }
      }
      for (let se = 0; se < D; se++)
        for (let de = 0; de < C; de++) {
          const ne = u + de + O * se, ke = u + de + O * (se + 1), Y = u + (de + 1) + O * (se + 1), ie = u + (de + 1) + O * se;
          l.push(ne, ke, ie), l.push(ke, Y, ie), V += 6;
        }
      a.addGroup(m, V, b), m += V, u += K;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new ts(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments);
  }
}
function Pi(r) {
  const e = {};
  for (const t in r) {
    e[t] = {};
    for (const n in r[t]) {
      const i = r[t][n];
      i && (i.isColor || i.isMatrix3 || i.isMatrix4 || i.isVector2 || i.isVector3 || i.isVector4 || i.isTexture || i.isQuaternion) ? i.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), e[t][n] = null) : e[t][n] = i.clone() : Array.isArray(i) ? e[t][n] = i.slice() : e[t][n] = i;
    }
  }
  return e;
}
function Tt(r) {
  const e = {};
  for (let t = 0; t < r.length; t++) {
    const n = Pi(r[t]);
    for (const i in n)
      e[i] = n[i];
  }
  return e;
}
function Hd(r) {
  const e = [];
  for (let t = 0; t < r.length; t++)
    e.push(r[t].clone());
  return e;
}
function Gl(r) {
  const e = r.getRenderTarget();
  return e === null ? r.outputColorSpace : e.isXRRenderTarget === !0 ? e.texture.colorSpace : Ye.workingColorSpace;
}
const Gd = { clone: Pi, merge: Tt };
var Wd = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, Xd = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class Nn extends si {
  constructor(e) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = Wd, this.fragmentShader = Xd, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
      clipCullDistance: !1,
      multiDraw: !1
    }, this.defaultAttributeValues = {
      color: [1, 1, 1],
      uv: [0, 0],
      uv1: [0, 0]
    }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, e !== void 0 && this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = Pi(e.uniforms), this.uniformsGroups = Hd(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    t.glslVersion = this.glslVersion, t.uniforms = {};
    for (const i in this.uniforms) {
      const o = this.uniforms[i].value;
      o && o.isTexture ? t.uniforms[i] = {
        type: "t",
        value: o.toJSON(e).uuid
      } : o && o.isColor ? t.uniforms[i] = {
        type: "c",
        value: o.getHex()
      } : o && o.isVector2 ? t.uniforms[i] = {
        type: "v2",
        value: o.toArray()
      } : o && o.isVector3 ? t.uniforms[i] = {
        type: "v3",
        value: o.toArray()
      } : o && o.isVector4 ? t.uniforms[i] = {
        type: "v4",
        value: o.toArray()
      } : o && o.isMatrix3 ? t.uniforms[i] = {
        type: "m3",
        value: o.toArray()
      } : o && o.isMatrix4 ? t.uniforms[i] = {
        type: "m4",
        value: o.toArray()
      } : t.uniforms[i] = {
        value: o
      };
    }
    Object.keys(this.defines).length > 0 && (t.defines = this.defines), t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader, t.lights = this.lights, t.clipping = this.clipping;
    const n = {};
    for (const i in this.extensions)
      this.extensions[i] === !0 && (n[i] = !0);
    return Object.keys(n).length > 0 && (t.extensions = n), t;
  }
}
class Wl extends xt {
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new rt(), this.projectionMatrix = new rt(), this.projectionMatrixInverse = new rt(), this.coordinateSystem = En;
  }
  copy(e, t) {
    return super.copy(e, t), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this.projectionMatrixInverse.copy(e.projectionMatrixInverse), this.coordinateSystem = e.coordinateSystem, this;
  }
  getWorldDirection(e) {
    return super.getWorldDirection(e).negate();
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  updateWorldMatrix(e, t) {
    super.updateWorldMatrix(e, t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Dn = /* @__PURE__ */ new H(), Ua = /* @__PURE__ */ new ze(), Na = /* @__PURE__ */ new ze();
class It extends Wl {
  constructor(e = 50, t = 1, n = 0.1, i = 2e3) {
    super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = e, this.zoom = 1, this.near = n, this.far = i, this.focus = 10, this.aspect = t, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
  }
  copy(e, t) {
    return super.copy(e, t), this.fov = e.fov, this.zoom = e.zoom, this.near = e.near, this.far = e.far, this.focus = e.focus, this.aspect = e.aspect, this.view = e.view === null ? null : Object.assign({}, e.view), this.filmGauge = e.filmGauge, this.filmOffset = e.filmOffset, this;
  }
  setFocalLength(e) {
    const t = 0.5 * this.getFilmHeight() / e;
    this.fov = Gs * 2 * Math.atan(t), this.updateProjectionMatrix();
  }
  getFocalLength() {
    const e = Math.tan(nr * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / e;
  }
  getEffectiveFOV() {
    return Gs * 2 * Math.atan(
      Math.tan(nr * 0.5 * this.fov) / this.zoom
    );
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  getViewBounds(e, t, n) {
    Dn.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), t.set(Dn.x, Dn.y).multiplyScalar(-e / Dn.z), Dn.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(Dn.x, Dn.y).multiplyScalar(-e / Dn.z);
  }
  getViewSize(e, t) {
    return this.getViewBounds(e, Ua, Na), t.subVectors(Na, Ua);
  }
  setViewOffset(e, t, n, i, s, o) {
    this.aspect = e / t, this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = i, this.view.width = s, this.view.height = o, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const e = this.near;
    let t = e * Math.tan(nr * 0.5 * this.fov) / this.zoom, n = 2 * t, i = this.aspect * n, s = -0.5 * i;
    const o = this.view;
    if (this.view !== null && this.view.enabled) {
      const l = o.fullWidth, c = o.fullHeight;
      s += o.offsetX * i / l, t -= o.offsetY * n / c, i *= o.width / l, n *= o.height / c;
    }
    const a = this.filmOffset;
    a !== 0 && (s += e * a / this.getFilmWidth()), this.projectionMatrix.makePerspective(s, s + i, t, t - n, e, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.fov = this.fov, t.object.zoom = this.zoom, t.object.near = this.near, t.object.far = this.far, t.object.focus = this.focus, t.object.aspect = this.aspect, this.view !== null && (t.object.view = Object.assign({}, this.view)), t.object.filmGauge = this.filmGauge, t.object.filmOffset = this.filmOffset, t;
  }
}
const xi = -90, yi = 1;
class qd extends xt {
  constructor(e, t, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const i = new It(xi, yi, e, t);
    i.layers = this.layers, this.add(i);
    const s = new It(xi, yi, e, t);
    s.layers = this.layers, this.add(s);
    const o = new It(xi, yi, e, t);
    o.layers = this.layers, this.add(o);
    const a = new It(xi, yi, e, t);
    a.layers = this.layers, this.add(a);
    const l = new It(xi, yi, e, t);
    l.layers = this.layers, this.add(l);
    const c = new It(xi, yi, e, t);
    c.layers = this.layers, this.add(c);
  }
  updateCoordinateSystem() {
    const e = this.coordinateSystem, t = this.children.concat(), [n, i, s, o, a, l] = t;
    for (const c of t)
      this.remove(c);
    if (e === En)
      n.up.set(0, 1, 0), n.lookAt(1, 0, 0), i.up.set(0, 1, 0), i.lookAt(-1, 0, 0), s.up.set(0, 0, -1), s.lookAt(0, 1, 0), o.up.set(0, 0, 1), o.lookAt(0, -1, 0), a.up.set(0, 1, 0), a.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
    else if (e === Hs)
      n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), i.up.set(0, -1, 0), i.lookAt(1, 0, 0), s.up.set(0, 0, 1), s.lookAt(0, 1, 0), o.up.set(0, 0, -1), o.lookAt(0, -1, 0), a.up.set(0, -1, 0), a.lookAt(0, 0, 1), l.up.set(0, -1, 0), l.lookAt(0, 0, -1);
    else
      throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + e);
    for (const c of t)
      this.add(c), c.updateMatrixWorld();
  }
  update(e, t) {
    this.parent === null && this.updateMatrixWorld();
    const { renderTarget: n, activeMipmapLevel: i } = this;
    this.coordinateSystem !== e.coordinateSystem && (this.coordinateSystem = e.coordinateSystem, this.updateCoordinateSystem());
    const [s, o, a, l, c, h] = this.children, d = e.getRenderTarget(), u = e.getActiveCubeFace(), m = e.getActiveMipmapLevel(), g = e.xr.enabled;
    e.xr.enabled = !1;
    const _ = n.texture.generateMipmaps;
    n.texture.generateMipmaps = !1, e.setRenderTarget(n, 0, i), e.render(t, s), e.setRenderTarget(n, 1, i), e.render(t, o), e.setRenderTarget(n, 2, i), e.render(t, a), e.setRenderTarget(n, 3, i), e.render(t, l), e.setRenderTarget(n, 4, i), e.render(t, c), n.texture.generateMipmaps = _, e.setRenderTarget(n, 5, i), e.render(t, h), e.setRenderTarget(d, u, m), e.xr.enabled = g, n.texture.needsPMREMUpdate = !0;
  }
}
class Xl extends bt {
  constructor(e = [], t = Ai, n, i, s, o, a, l, c, h) {
    super(e, t, n, i, s, o, a, l, c, h), this.isCubeTexture = !0, this.flipY = !1;
  }
  get images() {
    return this.image;
  }
  set images(e) {
    this.image = e;
  }
}
class Yd extends ii {
  constructor(e = 1, t = {}) {
    super(e, e, t), this.isWebGLCubeRenderTarget = !0;
    const n = { width: e, height: e, depth: 1 }, i = [n, n, n, n, n, n];
    this.texture = new Xl(i, t.mapping, t.wrapS, t.wrapT, t.magFilter, t.minFilter, t.format, t.type, t.anisotropy, t.colorSpace), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = t.generateMipmaps !== void 0 ? t.generateMipmaps : !1, this.texture.minFilter = t.minFilter !== void 0 ? t.minFilter : rn;
  }
  fromEquirectangularTexture(e, t) {
    this.texture.type = t.type, this.texture.colorSpace = t.colorSpace, this.texture.generateMipmaps = t.generateMipmaps, this.texture.minFilter = t.minFilter, this.texture.magFilter = t.magFilter;
    const n = {
      uniforms: {
        tEquirect: { value: null }
      },
      vertexShader: `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,
      fragmentShader: `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
    }, i = new ts(5, 5, 5), s = new Nn({
      name: "CubemapFromEquirect",
      uniforms: Pi(n.uniforms),
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader,
      side: Pt,
      blending: Fn
    });
    s.uniforms.tEquirect.value = t;
    const o = new $t(i, s), a = t.minFilter;
    return t.minFilter === Jn && (t.minFilter = rn), new qd(1, 10, this).update(e, o), t.minFilter = a, o.geometry.dispose(), o.material.dispose(), this;
  }
  clear(e, t = !0, n = !0, i = !0) {
    const s = e.getRenderTarget();
    for (let o = 0; o < 6; o++)
      e.setRenderTarget(this, o), e.clear(t, n, i);
    e.setRenderTarget(s);
  }
}
class As extends xt {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}
const jd = { type: "move" };
class Er {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new As(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new As(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new H(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new H()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new As(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new H(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new H()), this._grip;
  }
  dispatchEvent(e) {
    return this._targetRay !== null && this._targetRay.dispatchEvent(e), this._grip !== null && this._grip.dispatchEvent(e), this._hand !== null && this._hand.dispatchEvent(e), this;
  }
  connect(e) {
    if (e && e.hand) {
      const t = this._hand;
      if (t)
        for (const n of e.hand.values())
          this._getHandJoint(t, n);
    }
    return this.dispatchEvent({ type: "connected", data: e }), this;
  }
  disconnect(e) {
    return this.dispatchEvent({ type: "disconnected", data: e }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this;
  }
  update(e, t, n) {
    let i = null, s = null, o = null;
    const a = this._targetRay, l = this._grip, c = this._hand;
    if (e && t.session.visibilityState !== "visible-blurred") {
      if (c && e.hand) {
        o = !0;
        for (const _ of e.hand.values()) {
          const f = t.getJointPose(_, n), p = this._getHandJoint(c, _);
          f !== null && (p.matrix.fromArray(f.transform.matrix), p.matrix.decompose(p.position, p.rotation, p.scale), p.matrixWorldNeedsUpdate = !0, p.jointRadius = f.radius), p.visible = f !== null;
        }
        const h = c.joints["index-finger-tip"], d = c.joints["thumb-tip"], u = h.position.distanceTo(d.position), m = 0.02, g = 5e-3;
        c.inputState.pinching && u > m + g ? (c.inputState.pinching = !1, this.dispatchEvent({
          type: "pinchend",
          handedness: e.handedness,
          target: this
        })) : !c.inputState.pinching && u <= m - g && (c.inputState.pinching = !0, this.dispatchEvent({
          type: "pinchstart",
          handedness: e.handedness,
          target: this
        }));
      } else
        l !== null && e.gripSpace && (s = t.getPose(e.gripSpace, n), s !== null && (l.matrix.fromArray(s.transform.matrix), l.matrix.decompose(l.position, l.rotation, l.scale), l.matrixWorldNeedsUpdate = !0, s.linearVelocity ? (l.hasLinearVelocity = !0, l.linearVelocity.copy(s.linearVelocity)) : l.hasLinearVelocity = !1, s.angularVelocity ? (l.hasAngularVelocity = !0, l.angularVelocity.copy(s.angularVelocity)) : l.hasAngularVelocity = !1));
      a !== null && (i = t.getPose(e.targetRaySpace, n), i === null && s !== null && (i = s), i !== null && (a.matrix.fromArray(i.transform.matrix), a.matrix.decompose(a.position, a.rotation, a.scale), a.matrixWorldNeedsUpdate = !0, i.linearVelocity ? (a.hasLinearVelocity = !0, a.linearVelocity.copy(i.linearVelocity)) : a.hasLinearVelocity = !1, i.angularVelocity ? (a.hasAngularVelocity = !0, a.angularVelocity.copy(i.angularVelocity)) : a.hasAngularVelocity = !1, this.dispatchEvent(jd)));
    }
    return a !== null && (a.visible = i !== null), l !== null && (l.visible = s !== null), c !== null && (c.visible = o !== null), this;
  }
  _getHandJoint(e, t) {
    if (e.joints[t.jointName] === void 0) {
      const n = new As();
      n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n);
    }
    return e.joints[t.jointName];
  }
}
class Kd extends xt {
  constructor() {
    super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new Qt(), this.environmentIntensity = 1, this.environmentRotation = new Qt(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(e, t) {
    return super.copy(e, t), e.background !== null && (this.background = e.background.clone()), e.environment !== null && (this.environment = e.environment.clone()), e.fog !== null && (this.fog = e.fog.clone()), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, this.backgroundRotation.copy(e.backgroundRotation), this.environmentIntensity = e.environmentIntensity, this.environmentRotation.copy(e.environmentRotation), e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()), this.matrixAutoUpdate = e.matrixAutoUpdate, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.fog !== null && (t.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (t.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (t.object.backgroundIntensity = this.backgroundIntensity), t.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (t.object.environmentIntensity = this.environmentIntensity), t.object.environmentRotation = this.environmentRotation.toArray(), t;
  }
}
const br = /* @__PURE__ */ new H(), Zd = /* @__PURE__ */ new H(), $d = /* @__PURE__ */ new Ie();
class qn {
  constructor(e = new H(1, 0, 0), t = 0) {
    this.isPlane = !0, this.normal = e, this.constant = t;
  }
  set(e, t) {
    return this.normal.copy(e), this.constant = t, this;
  }
  setComponents(e, t, n, i) {
    return this.normal.set(e, t, n), this.constant = i, this;
  }
  setFromNormalAndCoplanarPoint(e, t) {
    return this.normal.copy(e), this.constant = -t.dot(this.normal), this;
  }
  setFromCoplanarPoints(e, t, n) {
    const i = br.subVectors(n, t).cross(Zd.subVectors(e, t)).normalize();
    return this.setFromNormalAndCoplanarPoint(i, e), this;
  }
  copy(e) {
    return this.normal.copy(e.normal), this.constant = e.constant, this;
  }
  normalize() {
    const e = 1 / this.normal.length();
    return this.normal.multiplyScalar(e), this.constant *= e, this;
  }
  negate() {
    return this.constant *= -1, this.normal.negate(), this;
  }
  distanceToPoint(e) {
    return this.normal.dot(e) + this.constant;
  }
  distanceToSphere(e) {
    return this.distanceToPoint(e.center) - e.radius;
  }
  projectPoint(e, t) {
    return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e));
  }
  intersectLine(e, t) {
    const n = e.delta(br), i = this.normal.dot(n);
    if (i === 0)
      return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
    const s = -(e.start.dot(this.normal) + this.constant) / i;
    return s < 0 || s > 1 ? null : t.copy(e.start).addScaledVector(n, s);
  }
  intersectsLine(e) {
    const t = this.distanceToPoint(e.start), n = this.distanceToPoint(e.end);
    return t < 0 && n > 0 || n < 0 && t > 0;
  }
  intersectsBox(e) {
    return e.intersectsPlane(this);
  }
  intersectsSphere(e) {
    return e.intersectsPlane(this);
  }
  coplanarPoint(e) {
    return e.copy(this.normal).multiplyScalar(-this.constant);
  }
  applyMatrix4(e, t) {
    const n = t || $d.getNormalMatrix(e), i = this.coplanarPoint(br).applyMatrix4(e), s = this.normal.applyMatrix3(n).normalize();
    return this.constant = -i.dot(s), this;
  }
  translate(e) {
    return this.constant -= e.dot(this.normal), this;
  }
  equals(e) {
    return e.normal.equals(this.normal) && e.constant === this.constant;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Gn = /* @__PURE__ */ new Ki(), Cs = /* @__PURE__ */ new H();
class Oo {
  constructor(e = new qn(), t = new qn(), n = new qn(), i = new qn(), s = new qn(), o = new qn()) {
    this.planes = [e, t, n, i, s, o];
  }
  set(e, t, n, i, s, o) {
    const a = this.planes;
    return a[0].copy(e), a[1].copy(t), a[2].copy(n), a[3].copy(i), a[4].copy(s), a[5].copy(o), this;
  }
  copy(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++)
      t[n].copy(e.planes[n]);
    return this;
  }
  setFromProjectionMatrix(e, t = En) {
    const n = this.planes, i = e.elements, s = i[0], o = i[1], a = i[2], l = i[3], c = i[4], h = i[5], d = i[6], u = i[7], m = i[8], g = i[9], _ = i[10], f = i[11], p = i[12], v = i[13], M = i[14], x = i[15];
    if (n[0].setComponents(l - s, u - c, f - m, x - p).normalize(), n[1].setComponents(l + s, u + c, f + m, x + p).normalize(), n[2].setComponents(l + o, u + h, f + g, x + v).normalize(), n[3].setComponents(l - o, u - h, f - g, x - v).normalize(), n[4].setComponents(l - a, u - d, f - _, x - M).normalize(), t === En)
      n[5].setComponents(l + a, u + d, f + _, x + M).normalize();
    else if (t === Hs)
      n[5].setComponents(a, d, _, M).normalize();
    else
      throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
    return this;
  }
  intersectsObject(e) {
    if (e.boundingSphere !== void 0)
      e.boundingSphere === null && e.computeBoundingSphere(), Gn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
    else {
      const t = e.geometry;
      t.boundingSphere === null && t.computeBoundingSphere(), Gn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld);
    }
    return this.intersectsSphere(Gn);
  }
  intersectsSprite(e) {
    return Gn.center.set(0, 0, 0), Gn.radius = 0.7071067811865476, Gn.applyMatrix4(e.matrixWorld), this.intersectsSphere(Gn);
  }
  intersectsSphere(e) {
    const t = this.planes, n = e.center, i = -e.radius;
    for (let s = 0; s < 6; s++)
      if (t[s].distanceToPoint(n) < i)
        return !1;
    return !0;
  }
  intersectsBox(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++) {
      const i = t[n];
      if (Cs.x = i.normal.x > 0 ? e.max.x : e.min.x, Cs.y = i.normal.y > 0 ? e.max.y : e.min.y, Cs.z = i.normal.z > 0 ? e.max.z : e.min.z, i.distanceToPoint(Cs) < 0)
        return !1;
    }
    return !0;
  }
  containsPoint(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++)
      if (t[n].distanceToPoint(e) < 0)
        return !1;
    return !0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class Oa extends bt {
  constructor(e, t, n, i, s, o, a, l, c) {
    super(e, t, n, i, s, o, a, l, c), this.isCanvasTexture = !0, this.needsUpdate = !0;
  }
}
class ql extends bt {
  constructor(e, t, n = ni, i, s, o, a = Jt, l = Jt, c, h = Yi) {
    if (h !== Yi && h !== ji)
      throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    super(null, i, s, o, a, l, h, n, c), this.isDepthTexture = !0, this.image = { width: e, height: t }, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
  }
  copy(e) {
    return super.copy(e), this.source = new Uo(Object.assign({}, e.image)), this.compareFunction = e.compareFunction, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.compareFunction !== null && (t.compareFunction = this.compareFunction), t;
  }
}
class Bo extends ln {
  constructor(e = 1, t = 1, n = 1, i = 32, s = 1, o = !1, a = 0, l = Math.PI * 2) {
    super(), this.type = "CylinderGeometry", this.parameters = {
      radiusTop: e,
      radiusBottom: t,
      height: n,
      radialSegments: i,
      heightSegments: s,
      openEnded: o,
      thetaStart: a,
      thetaLength: l
    };
    const c = this;
    i = Math.floor(i), s = Math.floor(s);
    const h = [], d = [], u = [], m = [];
    let g = 0;
    const _ = [], f = n / 2;
    let p = 0;
    v(), o === !1 && (e > 0 && M(!0), t > 0 && M(!1)), this.setIndex(h), this.setAttribute("position", new Et(d, 3)), this.setAttribute("normal", new Et(u, 3)), this.setAttribute("uv", new Et(m, 2));
    function v() {
      const x = new H(), A = new H();
      let T = 0;
      const C = (t - e) / n;
      for (let D = 0; D <= s; D++) {
        const b = [], y = D / s, P = y * (t - e) + e;
        for (let B = 0; B <= i; B++) {
          const L = B / i, U = L * l + a, O = Math.sin(U), F = Math.cos(U);
          A.x = P * O, A.y = -y * n + f, A.z = P * F, d.push(A.x, A.y, A.z), x.set(O, C, F).normalize(), u.push(x.x, x.y, x.z), m.push(L, 1 - y), b.push(g++);
        }
        _.push(b);
      }
      for (let D = 0; D < i; D++)
        for (let b = 0; b < s; b++) {
          const y = _[b][D], P = _[b + 1][D], B = _[b + 1][D + 1], L = _[b][D + 1];
          (e > 0 || b !== 0) && (h.push(y, P, L), T += 3), (t > 0 || b !== s - 1) && (h.push(P, B, L), T += 3);
        }
      c.addGroup(p, T, 0), p += T;
    }
    function M(x) {
      const A = g, T = new ze(), C = new H();
      let D = 0;
      const b = x === !0 ? e : t, y = x === !0 ? 1 : -1;
      for (let B = 1; B <= i; B++)
        d.push(0, f * y, 0), u.push(0, y, 0), m.push(0.5, 0.5), g++;
      const P = g;
      for (let B = 0; B <= i; B++) {
        const U = B / i * l + a, O = Math.cos(U), F = Math.sin(U);
        C.x = b * F, C.y = f * y, C.z = b * O, d.push(C.x, C.y, C.z), u.push(0, y, 0), T.x = O * 0.5 + 0.5, T.y = F * 0.5 * y + 0.5, m.push(T.x, T.y), g++;
      }
      for (let B = 0; B < i; B++) {
        const L = A + B, U = P + B;
        x === !0 ? h.push(U, U + 1, L) : h.push(U + 1, U, L), D += 3;
      }
      c.addGroup(p, D, x === !0 ? 1 : 2), p += D;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new Bo(e.radiusTop, e.radiusBottom, e.height, e.radialSegments, e.heightSegments, e.openEnded, e.thetaStart, e.thetaLength);
  }
}
class ns extends ln {
  constructor(e = 1, t = 1, n = 1, i = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: e,
      height: t,
      widthSegments: n,
      heightSegments: i
    };
    const s = e / 2, o = t / 2, a = Math.floor(n), l = Math.floor(i), c = a + 1, h = l + 1, d = e / a, u = t / l, m = [], g = [], _ = [], f = [];
    for (let p = 0; p < h; p++) {
      const v = p * u - o;
      for (let M = 0; M < c; M++) {
        const x = M * d - s;
        g.push(x, -v, 0), _.push(0, 0, 1), f.push(M / a), f.push(1 - p / l);
      }
    }
    for (let p = 0; p < l; p++)
      for (let v = 0; v < a; v++) {
        const M = v + c * p, x = v + c * (p + 1), A = v + 1 + c * (p + 1), T = v + 1 + c * p;
        m.push(M, x, T), m.push(x, A, T);
      }
    this.setIndex(m), this.setAttribute("position", new Et(g, 3)), this.setAttribute("normal", new Et(_, 3)), this.setAttribute("uv", new Et(f, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new ns(e.width, e.height, e.widthSegments, e.heightSegments);
  }
}
class Jd extends si {
  constructor(e) {
    super(), this.isShadowMaterial = !0, this.type = "ShadowMaterial", this.color = new Oe(0), this.transparent = !0, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.fog = e.fog, this;
  }
}
class Qd extends si {
  constructor(e) {
    super(), this.isMeshStandardMaterial = !0, this.type = "MeshStandardMaterial", this.defines = { STANDARD: "" }, this.color = new Oe(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Oe(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = Io, this.normalScale = new ze(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Qt(), this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.defines = { STANDARD: "" }, this.color.copy(e.color), this.roughness = e.roughness, this.metalness = e.metalness, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.roughnessMap = e.roughnessMap, this.metalnessMap = e.metalnessMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.envMapIntensity = e.envMapIntensity, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}
class ef extends si {
  constructor(e) {
    super(), this.isMeshPhongMaterial = !0, this.type = "MeshPhongMaterial", this.color = new Oe(16777215), this.specular = new Oe(1118481), this.shininess = 30, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Oe(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = Io, this.normalScale = new ze(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Qt(), this.combine = Ao, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.specular.copy(e.specular), this.shininess = e.shininess, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}
class tf extends si {
  constructor(e) {
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = hd, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
  }
}
class nf extends si {
  constructor(e) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
  }
}
class Yl extends xt {
  constructor(e, t = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new Oe(e), this.intensity = t;
  }
  dispose() {
  }
  copy(e, t) {
    return super.copy(e, t), this.color.copy(e.color), this.intensity = e.intensity, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.color = this.color.getHex(), t.object.intensity = this.intensity, this.groundColor !== void 0 && (t.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (t.object.distance = this.distance), this.angle !== void 0 && (t.object.angle = this.angle), this.decay !== void 0 && (t.object.decay = this.decay), this.penumbra !== void 0 && (t.object.penumbra = this.penumbra), this.shadow !== void 0 && (t.object.shadow = this.shadow.toJSON()), this.target !== void 0 && (t.object.target = this.target.uuid), t;
  }
}
class sf extends Yl {
  constructor(e, t, n) {
    super(e, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(xt.DEFAULT_UP), this.updateMatrix(), this.groundColor = new Oe(t);
  }
  copy(e, t) {
    return super.copy(e, t), this.groundColor.copy(e.groundColor), this;
  }
}
const wr = /* @__PURE__ */ new rt(), Ba = /* @__PURE__ */ new H(), za = /* @__PURE__ */ new H();
class rf {
  constructor(e) {
    this.camera = e, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new ze(512, 512), this.mapType = an, this.map = null, this.mapPass = null, this.matrix = new rt(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new Oo(), this._frameExtents = new ze(1, 1), this._viewportCount = 1, this._viewports = [
      new lt(0, 0, 1, 1)
    ];
  }
  getViewportCount() {
    return this._viewportCount;
  }
  getFrustum() {
    return this._frustum;
  }
  updateMatrices(e) {
    const t = this.camera, n = this.matrix;
    Ba.setFromMatrixPosition(e.matrixWorld), t.position.copy(Ba), za.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(za), t.updateMatrixWorld(), wr.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this._frustum.setFromProjectionMatrix(wr), n.set(
      0.5,
      0,
      0,
      0.5,
      0,
      0.5,
      0,
      0.5,
      0,
      0,
      0.5,
      0.5,
      0,
      0,
      0,
      1
    ), n.multiply(wr);
  }
  getViewport(e) {
    return this._viewports[e];
  }
  getFrameExtents() {
    return this._frameExtents;
  }
  dispose() {
    this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
  }
  copy(e) {
    return this.camera = e.camera.clone(), this.intensity = e.intensity, this.bias = e.bias, this.radius = e.radius, this.autoUpdate = e.autoUpdate, this.needsUpdate = e.needsUpdate, this.normalBias = e.normalBias, this.blurSamples = e.blurSamples, this.mapSize.copy(e.mapSize), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    const e = {};
    return this.intensity !== 1 && (e.intensity = this.intensity), this.bias !== 0 && (e.bias = this.bias), this.normalBias !== 0 && (e.normalBias = this.normalBias), this.radius !== 1 && (e.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (e.mapSize = this.mapSize.toArray()), e.camera = this.camera.toJSON(!1).object, delete e.camera.matrix, e;
  }
}
class of extends rf {
  constructor() {
    super(new It(50, 1, 0.5, 500)), this.isSpotLightShadow = !0, this.focus = 1;
  }
  updateMatrices(e) {
    const t = this.camera, n = Gs * 2 * e.angle * this.focus, i = this.mapSize.width / this.mapSize.height, s = e.distance || t.far;
    (n !== t.fov || i !== t.aspect || s !== t.far) && (t.fov = n, t.aspect = i, t.far = s, t.updateProjectionMatrix()), super.updateMatrices(e);
  }
  copy(e) {
    return super.copy(e), this.focus = e.focus, this;
  }
}
class af extends Yl {
  constructor(e, t, n = 0, i = Math.PI / 3, s = 0, o = 2) {
    super(e, t), this.isSpotLight = !0, this.type = "SpotLight", this.position.copy(xt.DEFAULT_UP), this.updateMatrix(), this.target = new xt(), this.distance = n, this.angle = i, this.penumbra = s, this.decay = o, this.map = null, this.shadow = new of();
  }
  get power() {
    return this.intensity * Math.PI;
  }
  set power(e) {
    this.intensity = e / Math.PI;
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e, t) {
    return super.copy(e, t), this.distance = e.distance, this.angle = e.angle, this.penumbra = e.penumbra, this.decay = e.decay, this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
  }
}
class lf extends Wl {
  constructor(e = -1, t = 1, n = 1, i = -1, s = 0.1, o = 2e3) {
    super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = e, this.right = t, this.top = n, this.bottom = i, this.near = s, this.far = o, this.updateProjectionMatrix();
  }
  copy(e, t) {
    return super.copy(e, t), this.left = e.left, this.right = e.right, this.top = e.top, this.bottom = e.bottom, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this.view = e.view === null ? null : Object.assign({}, e.view), this;
  }
  setViewOffset(e, t, n, i, s, o) {
    this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = i, this.view.width = s, this.view.height = o, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const e = (this.right - this.left) / (2 * this.zoom), t = (this.top - this.bottom) / (2 * this.zoom), n = (this.right + this.left) / 2, i = (this.top + this.bottom) / 2;
    let s = n - e, o = n + e, a = i + t, l = i - t;
    if (this.view !== null && this.view.enabled) {
      const c = (this.right - this.left) / this.view.fullWidth / this.zoom, h = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      s += c * this.view.offsetX, o = s + c * this.view.width, a -= h * this.view.offsetY, l = a - h * this.view.height;
    }
    this.projectionMatrix.makeOrthographic(s, o, a, l, this.near, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.zoom = this.zoom, t.object.left = this.left, t.object.right = this.right, t.object.top = this.top, t.object.bottom = this.bottom, t.object.near = this.near, t.object.far = this.far, this.view !== null && (t.object.view = Object.assign({}, this.view)), t;
  }
}
class cf extends It {
  constructor(e = []) {
    super(), this.isArrayCamera = !0, this.isMultiViewCamera = !1, this.cameras = e;
  }
}
const ka = /* @__PURE__ */ new rt();
class hf {
  constructor(e, t, n = 0, i = 1 / 0) {
    this.ray = new Bl(e, t), this.near = n, this.far = i, this.camera = null, this.layers = new No(), this.params = {
      Mesh: {},
      Line: { threshold: 1 },
      LOD: {},
      Points: { threshold: 1 },
      Sprite: {}
    };
  }
  set(e, t) {
    this.ray.set(e, t);
  }
  setFromCamera(e, t) {
    t.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(e.x, e.y, 0.5).unproject(t).sub(this.ray.origin).normalize(), this.camera = t) : t.isOrthographicCamera ? (this.ray.origin.set(e.x, e.y, (t.near + t.far) / (t.near - t.far)).unproject(t), this.ray.direction.set(0, 0, -1).transformDirection(t.matrixWorld), this.camera = t) : console.error("THREE.Raycaster: Unsupported camera type: " + t.type);
  }
  setFromXRController(e) {
    return ka.identity().extractRotation(e.matrixWorld), this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(ka), this;
  }
  intersectObject(e, t = !0, n = []) {
    return yo(e, this, n, t), n.sort(Va), n;
  }
  intersectObjects(e, t = !0, n = []) {
    for (let i = 0, s = e.length; i < s; i++)
      yo(e[i], this, n, t);
    return n.sort(Va), n;
  }
}
function Va(r, e) {
  return r.distance - e.distance;
}
function yo(r, e, t, n) {
  let i = !0;
  if (r.layers.test(e.layers) && r.raycast(e, t) === !1 && (i = !1), i === !0 && n === !0) {
    const s = r.children;
    for (let o = 0, a = s.length; o < a; o++)
      yo(s[o], e, t, !0);
  }
}
function Ha(r, e, t, n) {
  const i = uf(n);
  switch (t) {
    case Pl:
      return r * e;
    case Ll:
      return r * e / i.components * i.byteLength;
    case Do:
      return r * e / i.components * i.byteLength;
    case Fl:
      return r * e * 2 / i.components * i.byteLength;
    case Lo:
      return r * e * 2 / i.components * i.byteLength;
    case Dl:
      return r * e * 3 / i.components * i.byteLength;
    case Zt:
      return r * e * 4 / i.components * i.byteLength;
    case Fo:
      return r * e * 4 / i.components * i.byteLength;
    case Ls:
    case Fs:
      return Math.floor((r + 3) / 4) * Math.floor((e + 3) / 4) * 8;
    case Is:
    case Us:
      return Math.floor((r + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case jr:
    case Zr:
      return Math.max(r, 16) * Math.max(e, 8) / 4;
    case Yr:
    case Kr:
      return Math.max(r, 8) * Math.max(e, 8) / 2;
    case $r:
    case Jr:
      return Math.floor((r + 3) / 4) * Math.floor((e + 3) / 4) * 8;
    case Qr:
      return Math.floor((r + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case eo:
      return Math.floor((r + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case to:
      return Math.floor((r + 4) / 5) * Math.floor((e + 3) / 4) * 16;
    case no:
      return Math.floor((r + 4) / 5) * Math.floor((e + 4) / 5) * 16;
    case io:
      return Math.floor((r + 5) / 6) * Math.floor((e + 4) / 5) * 16;
    case so:
      return Math.floor((r + 5) / 6) * Math.floor((e + 5) / 6) * 16;
    case ro:
      return Math.floor((r + 7) / 8) * Math.floor((e + 4) / 5) * 16;
    case oo:
      return Math.floor((r + 7) / 8) * Math.floor((e + 5) / 6) * 16;
    case ao:
      return Math.floor((r + 7) / 8) * Math.floor((e + 7) / 8) * 16;
    case lo:
      return Math.floor((r + 9) / 10) * Math.floor((e + 4) / 5) * 16;
    case co:
      return Math.floor((r + 9) / 10) * Math.floor((e + 5) / 6) * 16;
    case ho:
      return Math.floor((r + 9) / 10) * Math.floor((e + 7) / 8) * 16;
    case uo:
      return Math.floor((r + 9) / 10) * Math.floor((e + 9) / 10) * 16;
    case fo:
      return Math.floor((r + 11) / 12) * Math.floor((e + 9) / 10) * 16;
    case po:
      return Math.floor((r + 11) / 12) * Math.floor((e + 11) / 12) * 16;
    case Ns:
    case mo:
    case go:
      return Math.ceil(r / 4) * Math.ceil(e / 4) * 16;
    case Il:
    case _o:
      return Math.ceil(r / 4) * Math.ceil(e / 4) * 8;
    case vo:
    case xo:
      return Math.ceil(r / 4) * Math.ceil(e / 4) * 16;
  }
  throw new Error(
    `Unable to determine texture byte length for ${t} format.`
  );
}
function uf(r) {
  switch (r) {
    case an:
    case Al:
      return { byteLength: 1, components: 1 };
    case Xi:
    case Cl:
    case $i:
      return { byteLength: 2, components: 1 };
    case Ro:
    case Po:
      return { byteLength: 2, components: 4 };
    case ni:
    case Co:
    case Sn:
      return { byteLength: 4, components: 1 };
    case Rl:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${r}.`);
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
  revision: To
} }));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = To);
/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
function jl() {
  let r = null, e = !1, t = null, n = null;
  function i(s, o) {
    t(s, o), n = r.requestAnimationFrame(i);
  }
  return {
    start: function() {
      e !== !0 && t !== null && (n = r.requestAnimationFrame(i), e = !0);
    },
    stop: function() {
      r.cancelAnimationFrame(n), e = !1;
    },
    setAnimationLoop: function(s) {
      t = s;
    },
    setContext: function(s) {
      r = s;
    }
  };
}
function df(r) {
  const e = /* @__PURE__ */ new WeakMap();
  function t(a, l) {
    const c = a.array, h = a.usage, d = c.byteLength, u = r.createBuffer();
    r.bindBuffer(l, u), r.bufferData(l, c, h), a.onUploadCallback();
    let m;
    if (c instanceof Float32Array)
      m = r.FLOAT;
    else if (c instanceof Uint16Array)
      a.isFloat16BufferAttribute ? m = r.HALF_FLOAT : m = r.UNSIGNED_SHORT;
    else if (c instanceof Int16Array)
      m = r.SHORT;
    else if (c instanceof Uint32Array)
      m = r.UNSIGNED_INT;
    else if (c instanceof Int32Array)
      m = r.INT;
    else if (c instanceof Int8Array)
      m = r.BYTE;
    else if (c instanceof Uint8Array)
      m = r.UNSIGNED_BYTE;
    else if (c instanceof Uint8ClampedArray)
      m = r.UNSIGNED_BYTE;
    else
      throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + c);
    return {
      buffer: u,
      type: m,
      bytesPerElement: c.BYTES_PER_ELEMENT,
      version: a.version,
      size: d
    };
  }
  function n(a, l, c) {
    const h = l.array, d = l.updateRanges;
    if (r.bindBuffer(c, a), d.length === 0)
      r.bufferSubData(c, 0, h);
    else {
      d.sort((m, g) => m.start - g.start);
      let u = 0;
      for (let m = 1; m < d.length; m++) {
        const g = d[u], _ = d[m];
        _.start <= g.start + g.count + 1 ? g.count = Math.max(
          g.count,
          _.start + _.count - g.start
        ) : (++u, d[u] = _);
      }
      d.length = u + 1;
      for (let m = 0, g = d.length; m < g; m++) {
        const _ = d[m];
        r.bufferSubData(
          c,
          _.start * h.BYTES_PER_ELEMENT,
          h,
          _.start,
          _.count
        );
      }
      l.clearUpdateRanges();
    }
    l.onUploadCallback();
  }
  function i(a) {
    return a.isInterleavedBufferAttribute && (a = a.data), e.get(a);
  }
  function s(a) {
    a.isInterleavedBufferAttribute && (a = a.data);
    const l = e.get(a);
    l && (r.deleteBuffer(l.buffer), e.delete(a));
  }
  function o(a, l) {
    if (a.isInterleavedBufferAttribute && (a = a.data), a.isGLBufferAttribute) {
      const h = e.get(a);
      (!h || h.version < a.version) && e.set(a, {
        buffer: a.buffer,
        type: a.type,
        bytesPerElement: a.elementSize,
        version: a.version
      });
      return;
    }
    const c = e.get(a);
    if (c === void 0)
      e.set(a, t(a, l));
    else if (c.version < a.version) {
      if (c.size !== a.array.byteLength)
        throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
      n(c.buffer, a, l), c.version = a.version;
    }
  }
  return {
    get: i,
    remove: s,
    update: o
  };
}
var ff = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, pf = `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`, mf = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, gf = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, _f = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, vf = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, xf = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`, yf = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, Mf = `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`, Sf = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, Ef = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, bf = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, wf = `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`, Tf = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`, Af = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`, Cf = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`, Rf = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, Pf = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, Df = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, Lf = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, Ff = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, If = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, Uf = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`, Nf = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`, Of = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`, Bf = `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`, zf = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, kf = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, Vf = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, Hf = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, Gf = "gl_FragColor = linearToOutputTexel( gl_FragColor );", Wf = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`, Xf = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`, qf = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, Yf = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`, jf = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, Kf = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`, Zf = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, $f = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, Jf = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, Qf = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, ep = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`, tp = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, np = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, ip = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, sp = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`, rp = `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`, op = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, ap = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, lp = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, cp = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, hp = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`, up = `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`, dp = `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`, fp = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`, pp = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, mp = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, gp = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, _p = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, vp = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, xp = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, yp = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, Mp = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`, Sp = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, Ep = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, bp = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, wp = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, Tp = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, Ap = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, Cp = `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`, Rp = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, Pp = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`, Dp = `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`, Lp = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, Fp = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, Ip = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, Up = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`, Np = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, Op = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, Bp = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, zp = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, kp = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, Vp = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`, Hp = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, Gp = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, Wp = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, Xp = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, qp = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, Yp = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, jp = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`, Kp = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`, Zp = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`, $p = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`, Jp = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, Qp = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`, em = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, tm = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`, nm = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, im = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, sm = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, rm = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`, om = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`, am = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`, lm = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`, cm = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`, hm = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`, um = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const dm = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, fm = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, pm = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, mm = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, gm = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, _m = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, vm = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`, xm = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`, ym = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`, Mm = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`, Sm = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, Em = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, bm = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`, wm = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`, Tm = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`, Am = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Cm = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, Rm = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Pm = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`, Dm = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Lm = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`, Fm = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`, Im = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, Um = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Nm = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`, Om = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Bm = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, zm = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, km = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`, Vm = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`, Hm = `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, Gm = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`, Wm = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`, Xm = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`, Ne = {
  alphahash_fragment: ff,
  alphahash_pars_fragment: pf,
  alphamap_fragment: mf,
  alphamap_pars_fragment: gf,
  alphatest_fragment: _f,
  alphatest_pars_fragment: vf,
  aomap_fragment: xf,
  aomap_pars_fragment: yf,
  batching_pars_vertex: Mf,
  batching_vertex: Sf,
  begin_vertex: Ef,
  beginnormal_vertex: bf,
  bsdfs: wf,
  iridescence_fragment: Tf,
  bumpmap_pars_fragment: Af,
  clipping_planes_fragment: Cf,
  clipping_planes_pars_fragment: Rf,
  clipping_planes_pars_vertex: Pf,
  clipping_planes_vertex: Df,
  color_fragment: Lf,
  color_pars_fragment: Ff,
  color_pars_vertex: If,
  color_vertex: Uf,
  common: Nf,
  cube_uv_reflection_fragment: Of,
  defaultnormal_vertex: Bf,
  displacementmap_pars_vertex: zf,
  displacementmap_vertex: kf,
  emissivemap_fragment: Vf,
  emissivemap_pars_fragment: Hf,
  colorspace_fragment: Gf,
  colorspace_pars_fragment: Wf,
  envmap_fragment: Xf,
  envmap_common_pars_fragment: qf,
  envmap_pars_fragment: Yf,
  envmap_pars_vertex: jf,
  envmap_physical_pars_fragment: rp,
  envmap_vertex: Kf,
  fog_vertex: Zf,
  fog_pars_vertex: $f,
  fog_fragment: Jf,
  fog_pars_fragment: Qf,
  gradientmap_pars_fragment: ep,
  lightmap_pars_fragment: tp,
  lights_lambert_fragment: np,
  lights_lambert_pars_fragment: ip,
  lights_pars_begin: sp,
  lights_toon_fragment: op,
  lights_toon_pars_fragment: ap,
  lights_phong_fragment: lp,
  lights_phong_pars_fragment: cp,
  lights_physical_fragment: hp,
  lights_physical_pars_fragment: up,
  lights_fragment_begin: dp,
  lights_fragment_maps: fp,
  lights_fragment_end: pp,
  logdepthbuf_fragment: mp,
  logdepthbuf_pars_fragment: gp,
  logdepthbuf_pars_vertex: _p,
  logdepthbuf_vertex: vp,
  map_fragment: xp,
  map_pars_fragment: yp,
  map_particle_fragment: Mp,
  map_particle_pars_fragment: Sp,
  metalnessmap_fragment: Ep,
  metalnessmap_pars_fragment: bp,
  morphinstance_vertex: wp,
  morphcolor_vertex: Tp,
  morphnormal_vertex: Ap,
  morphtarget_pars_vertex: Cp,
  morphtarget_vertex: Rp,
  normal_fragment_begin: Pp,
  normal_fragment_maps: Dp,
  normal_pars_fragment: Lp,
  normal_pars_vertex: Fp,
  normal_vertex: Ip,
  normalmap_pars_fragment: Up,
  clearcoat_normal_fragment_begin: Np,
  clearcoat_normal_fragment_maps: Op,
  clearcoat_pars_fragment: Bp,
  iridescence_pars_fragment: zp,
  opaque_fragment: kp,
  packing: Vp,
  premultiplied_alpha_fragment: Hp,
  project_vertex: Gp,
  dithering_fragment: Wp,
  dithering_pars_fragment: Xp,
  roughnessmap_fragment: qp,
  roughnessmap_pars_fragment: Yp,
  shadowmap_pars_fragment: jp,
  shadowmap_pars_vertex: Kp,
  shadowmap_vertex: Zp,
  shadowmask_pars_fragment: $p,
  skinbase_vertex: Jp,
  skinning_pars_vertex: Qp,
  skinning_vertex: em,
  skinnormal_vertex: tm,
  specularmap_fragment: nm,
  specularmap_pars_fragment: im,
  tonemapping_fragment: sm,
  tonemapping_pars_fragment: rm,
  transmission_fragment: om,
  transmission_pars_fragment: am,
  uv_pars_fragment: lm,
  uv_pars_vertex: cm,
  uv_vertex: hm,
  worldpos_vertex: um,
  background_vert: dm,
  background_frag: fm,
  backgroundCube_vert: pm,
  backgroundCube_frag: mm,
  cube_vert: gm,
  cube_frag: _m,
  depth_vert: vm,
  depth_frag: xm,
  distanceRGBA_vert: ym,
  distanceRGBA_frag: Mm,
  equirect_vert: Sm,
  equirect_frag: Em,
  linedashed_vert: bm,
  linedashed_frag: wm,
  meshbasic_vert: Tm,
  meshbasic_frag: Am,
  meshlambert_vert: Cm,
  meshlambert_frag: Rm,
  meshmatcap_vert: Pm,
  meshmatcap_frag: Dm,
  meshnormal_vert: Lm,
  meshnormal_frag: Fm,
  meshphong_vert: Im,
  meshphong_frag: Um,
  meshphysical_vert: Nm,
  meshphysical_frag: Om,
  meshtoon_vert: Bm,
  meshtoon_frag: zm,
  points_vert: km,
  points_frag: Vm,
  shadow_vert: Hm,
  shadow_frag: Gm,
  sprite_vert: Wm,
  sprite_frag: Xm
}, re = {
  common: {
    diffuse: { value: /* @__PURE__ */ new Oe(16777215) },
    opacity: { value: 1 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Ie() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Ie() },
    alphaTest: { value: 0 }
  },
  specularmap: {
    specularMap: { value: null },
    specularMapTransform: { value: /* @__PURE__ */ new Ie() }
  },
  envmap: {
    envMap: { value: null },
    envMapRotation: { value: /* @__PURE__ */ new Ie() },
    flipEnvMap: { value: -1 },
    reflectivity: { value: 1 },
    ior: { value: 1.5 },
    refractionRatio: { value: 0.98 }
  },
  aomap: {
    aoMap: { value: null },
    aoMapIntensity: { value: 1 },
    aoMapTransform: { value: /* @__PURE__ */ new Ie() }
  },
  lightmap: {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: /* @__PURE__ */ new Ie() }
  },
  bumpmap: {
    bumpMap: { value: null },
    bumpMapTransform: { value: /* @__PURE__ */ new Ie() },
    bumpScale: { value: 1 }
  },
  normalmap: {
    normalMap: { value: null },
    normalMapTransform: { value: /* @__PURE__ */ new Ie() },
    normalScale: { value: /* @__PURE__ */ new ze(1, 1) }
  },
  displacementmap: {
    displacementMap: { value: null },
    displacementMapTransform: { value: /* @__PURE__ */ new Ie() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }
  },
  emissivemap: {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: /* @__PURE__ */ new Ie() }
  },
  metalnessmap: {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: /* @__PURE__ */ new Ie() }
  },
  roughnessmap: {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: /* @__PURE__ */ new Ie() }
  },
  gradientmap: {
    gradientMap: { value: null }
  },
  fog: {
    fogDensity: { value: 25e-5 },
    fogNear: { value: 1 },
    fogFar: { value: 2e3 },
    fogColor: { value: /* @__PURE__ */ new Oe(16777215) }
  },
  lights: {
    ambientLightColor: { value: [] },
    lightProbe: { value: [] },
    directionalLights: { value: [], properties: {
      direction: {},
      color: {}
    } },
    directionalLightShadows: { value: [], properties: {
      shadowIntensity: 1,
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {}
    } },
    directionalShadowMap: { value: [] },
    directionalShadowMatrix: { value: [] },
    spotLights: { value: [], properties: {
      color: {},
      position: {},
      direction: {},
      distance: {},
      coneCos: {},
      penumbraCos: {},
      decay: {}
    } },
    spotLightShadows: { value: [], properties: {
      shadowIntensity: 1,
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {}
    } },
    spotLightMap: { value: [] },
    spotShadowMap: { value: [] },
    spotLightMatrix: { value: [] },
    pointLights: { value: [], properties: {
      color: {},
      position: {},
      decay: {},
      distance: {}
    } },
    pointLightShadows: { value: [], properties: {
      shadowIntensity: 1,
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {},
      shadowCameraNear: {},
      shadowCameraFar: {}
    } },
    pointShadowMap: { value: [] },
    pointShadowMatrix: { value: [] },
    hemisphereLights: { value: [], properties: {
      direction: {},
      skyColor: {},
      groundColor: {}
    } },
    rectAreaLights: { value: [], properties: {
      color: {},
      position: {},
      width: {},
      height: {}
    } },
    ltc_1: { value: null },
    ltc_2: { value: null }
  },
  points: {
    diffuse: { value: /* @__PURE__ */ new Oe(16777215) },
    opacity: { value: 1 },
    size: { value: 1 },
    scale: { value: 1 },
    map: { value: null },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Ie() },
    alphaTest: { value: 0 },
    uvTransform: { value: /* @__PURE__ */ new Ie() }
  },
  sprite: {
    diffuse: { value: /* @__PURE__ */ new Oe(16777215) },
    opacity: { value: 1 },
    center: { value: /* @__PURE__ */ new ze(0.5, 0.5) },
    rotation: { value: 0 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Ie() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Ie() },
    alphaTest: { value: 0 }
  }
}, sn = {
  basic: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.specularmap,
      re.envmap,
      re.aomap,
      re.lightmap,
      re.fog
    ]),
    vertexShader: Ne.meshbasic_vert,
    fragmentShader: Ne.meshbasic_frag
  },
  lambert: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.specularmap,
      re.envmap,
      re.aomap,
      re.lightmap,
      re.emissivemap,
      re.bumpmap,
      re.normalmap,
      re.displacementmap,
      re.fog,
      re.lights,
      {
        emissive: { value: /* @__PURE__ */ new Oe(0) }
      }
    ]),
    vertexShader: Ne.meshlambert_vert,
    fragmentShader: Ne.meshlambert_frag
  },
  phong: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.specularmap,
      re.envmap,
      re.aomap,
      re.lightmap,
      re.emissivemap,
      re.bumpmap,
      re.normalmap,
      re.displacementmap,
      re.fog,
      re.lights,
      {
        emissive: { value: /* @__PURE__ */ new Oe(0) },
        specular: { value: /* @__PURE__ */ new Oe(1118481) },
        shininess: { value: 30 }
      }
    ]),
    vertexShader: Ne.meshphong_vert,
    fragmentShader: Ne.meshphong_frag
  },
  standard: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.envmap,
      re.aomap,
      re.lightmap,
      re.emissivemap,
      re.bumpmap,
      re.normalmap,
      re.displacementmap,
      re.roughnessmap,
      re.metalnessmap,
      re.fog,
      re.lights,
      {
        emissive: { value: /* @__PURE__ */ new Oe(0) },
        roughness: { value: 1 },
        metalness: { value: 0 },
        envMapIntensity: { value: 1 }
      }
    ]),
    vertexShader: Ne.meshphysical_vert,
    fragmentShader: Ne.meshphysical_frag
  },
  toon: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.aomap,
      re.lightmap,
      re.emissivemap,
      re.bumpmap,
      re.normalmap,
      re.displacementmap,
      re.gradientmap,
      re.fog,
      re.lights,
      {
        emissive: { value: /* @__PURE__ */ new Oe(0) }
      }
    ]),
    vertexShader: Ne.meshtoon_vert,
    fragmentShader: Ne.meshtoon_frag
  },
  matcap: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.bumpmap,
      re.normalmap,
      re.displacementmap,
      re.fog,
      {
        matcap: { value: null }
      }
    ]),
    vertexShader: Ne.meshmatcap_vert,
    fragmentShader: Ne.meshmatcap_frag
  },
  points: {
    uniforms: /* @__PURE__ */ Tt([
      re.points,
      re.fog
    ]),
    vertexShader: Ne.points_vert,
    fragmentShader: Ne.points_frag
  },
  dashed: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.fog,
      {
        scale: { value: 1 },
        dashSize: { value: 1 },
        totalSize: { value: 2 }
      }
    ]),
    vertexShader: Ne.linedashed_vert,
    fragmentShader: Ne.linedashed_frag
  },
  depth: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.displacementmap
    ]),
    vertexShader: Ne.depth_vert,
    fragmentShader: Ne.depth_frag
  },
  normal: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.bumpmap,
      re.normalmap,
      re.displacementmap,
      {
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Ne.meshnormal_vert,
    fragmentShader: Ne.meshnormal_frag
  },
  sprite: {
    uniforms: /* @__PURE__ */ Tt([
      re.sprite,
      re.fog
    ]),
    vertexShader: Ne.sprite_vert,
    fragmentShader: Ne.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: { value: /* @__PURE__ */ new Ie() },
      t2D: { value: null },
      backgroundIntensity: { value: 1 }
    },
    vertexShader: Ne.background_vert,
    fragmentShader: Ne.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 },
      backgroundBlurriness: { value: 0 },
      backgroundIntensity: { value: 1 },
      backgroundRotation: { value: /* @__PURE__ */ new Ie() }
    },
    vertexShader: Ne.backgroundCube_vert,
    fragmentShader: Ne.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: { value: null },
      tFlip: { value: -1 },
      opacity: { value: 1 }
    },
    vertexShader: Ne.cube_vert,
    fragmentShader: Ne.cube_frag
  },
  equirect: {
    uniforms: {
      tEquirect: { value: null }
    },
    vertexShader: Ne.equirect_vert,
    fragmentShader: Ne.equirect_frag
  },
  distanceRGBA: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.displacementmap,
      {
        referencePosition: { value: /* @__PURE__ */ new H() },
        nearDistance: { value: 1 },
        farDistance: { value: 1e3 }
      }
    ]),
    vertexShader: Ne.distanceRGBA_vert,
    fragmentShader: Ne.distanceRGBA_frag
  },
  shadow: {
    uniforms: /* @__PURE__ */ Tt([
      re.lights,
      re.fog,
      {
        color: { value: /* @__PURE__ */ new Oe(0) },
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Ne.shadow_vert,
    fragmentShader: Ne.shadow_frag
  }
};
sn.physical = {
  uniforms: /* @__PURE__ */ Tt([
    sn.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: /* @__PURE__ */ new Ie() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: /* @__PURE__ */ new Ie() },
      clearcoatNormalScale: { value: /* @__PURE__ */ new ze(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new Ie() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: /* @__PURE__ */ new Ie() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new Ie() },
      sheen: { value: 0 },
      sheenColor: { value: /* @__PURE__ */ new Oe(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: /* @__PURE__ */ new Ie() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: /* @__PURE__ */ new Ie() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: /* @__PURE__ */ new Ie() },
      transmissionSamplerSize: { value: /* @__PURE__ */ new ze() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: /* @__PURE__ */ new Ie() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: /* @__PURE__ */ new Oe(0) },
      specularColor: { value: /* @__PURE__ */ new Oe(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: /* @__PURE__ */ new Ie() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: /* @__PURE__ */ new Ie() },
      anisotropyVector: { value: /* @__PURE__ */ new ze() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: /* @__PURE__ */ new Ie() }
    }
  ]),
  vertexShader: Ne.meshphysical_vert,
  fragmentShader: Ne.meshphysical_frag
};
const Rs = { r: 0, b: 0, g: 0 }, Wn = /* @__PURE__ */ new Qt(), qm = /* @__PURE__ */ new rt();
function Ym(r, e, t, n, i, s, o) {
  const a = new Oe(0);
  let l = s === !0 ? 0 : 1, c, h, d = null, u = 0, m = null;
  function g(M) {
    let x = M.isScene === !0 ? M.background : null;
    return x && x.isTexture && (x = (M.backgroundBlurriness > 0 ? t : e).get(x)), x;
  }
  function _(M) {
    let x = !1;
    const A = g(M);
    A === null ? p(a, l) : A && A.isColor && (p(A, 1), x = !0);
    const T = r.xr.getEnvironmentBlendMode();
    T === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, o) : T === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, o), (r.autoClear || x) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), r.clear(r.autoClearColor, r.autoClearDepth, r.autoClearStencil));
  }
  function f(M, x) {
    const A = g(x);
    A && (A.isCubeTexture || A.mapping === Xs) ? (h === void 0 && (h = new $t(
      new ts(1, 1, 1),
      new Nn({
        name: "BackgroundCubeMaterial",
        uniforms: Pi(sn.backgroundCube.uniforms),
        vertexShader: sn.backgroundCube.vertexShader,
        fragmentShader: sn.backgroundCube.fragmentShader,
        side: Pt,
        depthTest: !1,
        depthWrite: !1,
        fog: !1,
        allowOverride: !1
      })
    ), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(T, C, D) {
      this.matrixWorld.copyPosition(D.matrixWorld);
    }, Object.defineProperty(h.material, "envMap", {
      get: function() {
        return this.uniforms.envMap.value;
      }
    }), i.update(h)), Wn.copy(x.backgroundRotation), Wn.x *= -1, Wn.y *= -1, Wn.z *= -1, A.isCubeTexture && A.isRenderTargetTexture === !1 && (Wn.y *= -1, Wn.z *= -1), h.material.uniforms.envMap.value = A, h.material.uniforms.flipEnvMap.value = A.isCubeTexture && A.isRenderTargetTexture === !1 ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = x.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = x.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(qm.makeRotationFromEuler(Wn)), h.material.toneMapped = Ye.getTransfer(A.colorSpace) !== Qe, (d !== A || u !== A.version || m !== r.toneMapping) && (h.material.needsUpdate = !0, d = A, u = A.version, m = r.toneMapping), h.layers.enableAll(), M.unshift(h, h.geometry, h.material, 0, 0, null)) : A && A.isTexture && (c === void 0 && (c = new $t(
      new ns(2, 2),
      new Nn({
        name: "BackgroundMaterial",
        uniforms: Pi(sn.background.uniforms),
        vertexShader: sn.background.vertexShader,
        fragmentShader: sn.background.fragmentShader,
        side: Un,
        depthTest: !1,
        depthWrite: !1,
        fog: !1,
        allowOverride: !1
      })
    ), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", {
      get: function() {
        return this.uniforms.t2D.value;
      }
    }), i.update(c)), c.material.uniforms.t2D.value = A, c.material.uniforms.backgroundIntensity.value = x.backgroundIntensity, c.material.toneMapped = Ye.getTransfer(A.colorSpace) !== Qe, A.matrixAutoUpdate === !0 && A.updateMatrix(), c.material.uniforms.uvTransform.value.copy(A.matrix), (d !== A || u !== A.version || m !== r.toneMapping) && (c.material.needsUpdate = !0, d = A, u = A.version, m = r.toneMapping), c.layers.enableAll(), M.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function p(M, x) {
    M.getRGB(Rs, Gl(r)), n.buffers.color.setClear(Rs.r, Rs.g, Rs.b, x, o);
  }
  function v() {
    h !== void 0 && (h.geometry.dispose(), h.material.dispose(), h = void 0), c !== void 0 && (c.geometry.dispose(), c.material.dispose(), c = void 0);
  }
  return {
    getClearColor: function() {
      return a;
    },
    setClearColor: function(M, x = 1) {
      a.set(M), l = x, p(a, l);
    },
    getClearAlpha: function() {
      return l;
    },
    setClearAlpha: function(M) {
      l = M, p(a, l);
    },
    render: _,
    addToRenderList: f,
    dispose: v
  };
}
function jm(r, e) {
  const t = r.getParameter(r.MAX_VERTEX_ATTRIBS), n = {}, i = u(null);
  let s = i, o = !1;
  function a(y, P, B, L, U) {
    let O = !1;
    const F = d(L, B, P);
    s !== F && (s = F, c(s.object)), O = m(y, L, B, U), O && g(y, L, B, U), U !== null && e.update(U, r.ELEMENT_ARRAY_BUFFER), (O || o) && (o = !1, x(y, P, B, L), U !== null && r.bindBuffer(r.ELEMENT_ARRAY_BUFFER, e.get(U).buffer));
  }
  function l() {
    return r.createVertexArray();
  }
  function c(y) {
    return r.bindVertexArray(y);
  }
  function h(y) {
    return r.deleteVertexArray(y);
  }
  function d(y, P, B) {
    const L = B.wireframe === !0;
    let U = n[y.id];
    U === void 0 && (U = {}, n[y.id] = U);
    let O = U[P.id];
    O === void 0 && (O = {}, U[P.id] = O);
    let F = O[L];
    return F === void 0 && (F = u(l()), O[L] = F), F;
  }
  function u(y) {
    const P = [], B = [], L = [];
    for (let U = 0; U < t; U++)
      P[U] = 0, B[U] = 0, L[U] = 0;
    return {
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: P,
      enabledAttributes: B,
      attributeDivisors: L,
      object: y,
      attributes: {},
      index: null
    };
  }
  function m(y, P, B, L) {
    const U = s.attributes, O = P.attributes;
    let F = 0;
    const K = B.getAttributes();
    for (const V in K)
      if (K[V].location >= 0) {
        const se = U[V];
        let de = O[V];
        if (de === void 0 && (V === "instanceMatrix" && y.instanceMatrix && (de = y.instanceMatrix), V === "instanceColor" && y.instanceColor && (de = y.instanceColor)), se === void 0 || se.attribute !== de || de && se.data !== de.data)
          return !0;
        F++;
      }
    return s.attributesNum !== F || s.index !== L;
  }
  function g(y, P, B, L) {
    const U = {}, O = P.attributes;
    let F = 0;
    const K = B.getAttributes();
    for (const V in K)
      if (K[V].location >= 0) {
        let se = O[V];
        se === void 0 && (V === "instanceMatrix" && y.instanceMatrix && (se = y.instanceMatrix), V === "instanceColor" && y.instanceColor && (se = y.instanceColor));
        const de = {};
        de.attribute = se, se && se.data && (de.data = se.data), U[V] = de, F++;
      }
    s.attributes = U, s.attributesNum = F, s.index = L;
  }
  function _() {
    const y = s.newAttributes;
    for (let P = 0, B = y.length; P < B; P++)
      y[P] = 0;
  }
  function f(y) {
    p(y, 0);
  }
  function p(y, P) {
    const B = s.newAttributes, L = s.enabledAttributes, U = s.attributeDivisors;
    B[y] = 1, L[y] === 0 && (r.enableVertexAttribArray(y), L[y] = 1), U[y] !== P && (r.vertexAttribDivisor(y, P), U[y] = P);
  }
  function v() {
    const y = s.newAttributes, P = s.enabledAttributes;
    for (let B = 0, L = P.length; B < L; B++)
      P[B] !== y[B] && (r.disableVertexAttribArray(B), P[B] = 0);
  }
  function M(y, P, B, L, U, O, F) {
    F === !0 ? r.vertexAttribIPointer(y, P, B, U, O) : r.vertexAttribPointer(y, P, B, L, U, O);
  }
  function x(y, P, B, L) {
    _();
    const U = L.attributes, O = B.getAttributes(), F = P.defaultAttributeValues;
    for (const K in O) {
      const V = O[K];
      if (V.location >= 0) {
        let $ = U[K];
        if ($ === void 0 && (K === "instanceMatrix" && y.instanceMatrix && ($ = y.instanceMatrix), K === "instanceColor" && y.instanceColor && ($ = y.instanceColor)), $ !== void 0) {
          const se = $.normalized, de = $.itemSize, ne = e.get($);
          if (ne === void 0)
            continue;
          const ke = ne.buffer, Y = ne.type, ie = ne.bytesPerElement, ge = Y === r.INT || Y === r.UNSIGNED_INT || $.gpuType === Co;
          if ($.isInterleavedBufferAttribute) {
            const ae = $.data, we = ae.stride, je = $.offset;
            if (ae.isInstancedInterleavedBuffer) {
              for (let Re = 0; Re < V.locationSize; Re++)
                p(V.location + Re, ae.meshPerAttribute);
              y.isInstancedMesh !== !0 && L._maxInstanceCount === void 0 && (L._maxInstanceCount = ae.meshPerAttribute * ae.count);
            } else
              for (let Re = 0; Re < V.locationSize; Re++)
                f(V.location + Re);
            r.bindBuffer(r.ARRAY_BUFFER, ke);
            for (let Re = 0; Re < V.locationSize; Re++)
              M(
                V.location + Re,
                de / V.locationSize,
                Y,
                se,
                we * ie,
                (je + de / V.locationSize * Re) * ie,
                ge
              );
          } else {
            if ($.isInstancedBufferAttribute) {
              for (let ae = 0; ae < V.locationSize; ae++)
                p(V.location + ae, $.meshPerAttribute);
              y.isInstancedMesh !== !0 && L._maxInstanceCount === void 0 && (L._maxInstanceCount = $.meshPerAttribute * $.count);
            } else
              for (let ae = 0; ae < V.locationSize; ae++)
                f(V.location + ae);
            r.bindBuffer(r.ARRAY_BUFFER, ke);
            for (let ae = 0; ae < V.locationSize; ae++)
              M(
                V.location + ae,
                de / V.locationSize,
                Y,
                se,
                de * ie,
                de / V.locationSize * ae * ie,
                ge
              );
          }
        } else if (F !== void 0) {
          const se = F[K];
          if (se !== void 0)
            switch (se.length) {
              case 2:
                r.vertexAttrib2fv(V.location, se);
                break;
              case 3:
                r.vertexAttrib3fv(V.location, se);
                break;
              case 4:
                r.vertexAttrib4fv(V.location, se);
                break;
              default:
                r.vertexAttrib1fv(V.location, se);
            }
        }
      }
    }
    v();
  }
  function A() {
    D();
    for (const y in n) {
      const P = n[y];
      for (const B in P) {
        const L = P[B];
        for (const U in L)
          h(L[U].object), delete L[U];
        delete P[B];
      }
      delete n[y];
    }
  }
  function T(y) {
    if (n[y.id] === void 0)
      return;
    const P = n[y.id];
    for (const B in P) {
      const L = P[B];
      for (const U in L)
        h(L[U].object), delete L[U];
      delete P[B];
    }
    delete n[y.id];
  }
  function C(y) {
    for (const P in n) {
      const B = n[P];
      if (B[y.id] === void 0)
        continue;
      const L = B[y.id];
      for (const U in L)
        h(L[U].object), delete L[U];
      delete B[y.id];
    }
  }
  function D() {
    b(), o = !0, s !== i && (s = i, c(s.object));
  }
  function b() {
    i.geometry = null, i.program = null, i.wireframe = !1;
  }
  return {
    setup: a,
    reset: D,
    resetDefaultState: b,
    dispose: A,
    releaseStatesOfGeometry: T,
    releaseStatesOfProgram: C,
    initAttributes: _,
    enableAttribute: f,
    disableUnusedAttributes: v
  };
}
function Km(r, e, t) {
  let n;
  function i(c) {
    n = c;
  }
  function s(c, h) {
    r.drawArrays(n, c, h), t.update(h, n, 1);
  }
  function o(c, h, d) {
    d !== 0 && (r.drawArraysInstanced(n, c, h, d), t.update(h, n, d));
  }
  function a(c, h, d) {
    if (d === 0)
      return;
    e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, c, 0, h, 0, d);
    let m = 0;
    for (let g = 0; g < d; g++)
      m += h[g];
    t.update(m, n, 1);
  }
  function l(c, h, d, u) {
    if (d === 0)
      return;
    const m = e.get("WEBGL_multi_draw");
    if (m === null)
      for (let g = 0; g < c.length; g++)
        o(c[g], h[g], u[g]);
    else {
      m.multiDrawArraysInstancedWEBGL(n, c, 0, h, 0, u, 0, d);
      let g = 0;
      for (let _ = 0; _ < d; _++)
        g += h[_] * u[_];
      t.update(g, n, 1);
    }
  }
  this.setMode = i, this.render = s, this.renderInstances = o, this.renderMultiDraw = a, this.renderMultiDrawInstances = l;
}
function Zm(r, e, t, n) {
  let i;
  function s() {
    if (i !== void 0)
      return i;
    if (e.has("EXT_texture_filter_anisotropic") === !0) {
      const C = e.get("EXT_texture_filter_anisotropic");
      i = r.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else
      i = 0;
    return i;
  }
  function o(C) {
    return !(C !== Zt && n.convert(C) !== r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function a(C) {
    const D = C === $i && (e.has("EXT_color_buffer_half_float") || e.has("EXT_color_buffer_float"));
    return !(C !== an && n.convert(C) !== r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE) && C !== Sn && !D);
  }
  function l(C) {
    if (C === "highp") {
      if (r.getShaderPrecisionFormat(r.VERTEX_SHADER, r.HIGH_FLOAT).precision > 0 && r.getShaderPrecisionFormat(r.FRAGMENT_SHADER, r.HIGH_FLOAT).precision > 0)
        return "highp";
      C = "mediump";
    }
    return C === "mediump" && r.getShaderPrecisionFormat(r.VERTEX_SHADER, r.MEDIUM_FLOAT).precision > 0 && r.getShaderPrecisionFormat(r.FRAGMENT_SHADER, r.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let c = t.precision !== void 0 ? t.precision : "highp";
  const h = l(c);
  h !== c && (console.warn("THREE.WebGLRenderer:", c, "not supported, using", h, "instead."), c = h);
  const d = t.logarithmicDepthBuffer === !0, u = t.reverseDepthBuffer === !0 && e.has("EXT_clip_control"), m = r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS), g = r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS), _ = r.getParameter(r.MAX_TEXTURE_SIZE), f = r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE), p = r.getParameter(r.MAX_VERTEX_ATTRIBS), v = r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS), M = r.getParameter(r.MAX_VARYING_VECTORS), x = r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS), A = g > 0, T = r.getParameter(r.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    getMaxAnisotropy: s,
    getMaxPrecision: l,
    textureFormatReadable: o,
    textureTypeReadable: a,
    precision: c,
    logarithmicDepthBuffer: d,
    reverseDepthBuffer: u,
    maxTextures: m,
    maxVertexTextures: g,
    maxTextureSize: _,
    maxCubemapSize: f,
    maxAttributes: p,
    maxVertexUniforms: v,
    maxVaryings: M,
    maxFragmentUniforms: x,
    vertexTextures: A,
    maxSamples: T
  };
}
function $m(r) {
  const e = this;
  let t = null, n = 0, i = !1, s = !1;
  const o = new qn(), a = new Ie(), l = { value: null, needsUpdate: !1 };
  this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(d, u) {
    const m = d.length !== 0 || u || n !== 0 || i;
    return i = u, n = d.length, m;
  }, this.beginShadows = function() {
    s = !0, h(null);
  }, this.endShadows = function() {
    s = !1;
  }, this.setGlobalState = function(d, u) {
    t = h(d, u, 0);
  }, this.setState = function(d, u, m) {
    const g = d.clippingPlanes, _ = d.clipIntersection, f = d.clipShadows, p = r.get(d);
    if (!i || g === null || g.length === 0 || s && !f)
      s ? h(null) : c();
    else {
      const v = s ? 0 : n, M = v * 4;
      let x = p.clippingState || null;
      l.value = x, x = h(g, u, M, m);
      for (let A = 0; A !== M; ++A)
        x[A] = t[A];
      p.clippingState = x, this.numIntersection = _ ? this.numPlanes : 0, this.numPlanes += v;
    }
  };
  function c() {
    l.value !== t && (l.value = t, l.needsUpdate = n > 0), e.numPlanes = n, e.numIntersection = 0;
  }
  function h(d, u, m, g) {
    const _ = d !== null ? d.length : 0;
    let f = null;
    if (_ !== 0) {
      if (f = l.value, g !== !0 || f === null) {
        const p = m + _ * 4, v = u.matrixWorldInverse;
        a.getNormalMatrix(v), (f === null || f.length < p) && (f = new Float32Array(p));
        for (let M = 0, x = m; M !== _; ++M, x += 4)
          o.copy(d[M]).applyMatrix4(v, a), o.normal.toArray(f, x), f[x + 3] = o.constant;
      }
      l.value = f, l.needsUpdate = !0;
    }
    return e.numPlanes = _, e.numIntersection = 0, f;
  }
}
function Jm(r) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(o, a) {
    return a === Gr ? o.mapping = Ai : a === Wr && (o.mapping = Ci), o;
  }
  function n(o) {
    if (o && o.isTexture) {
      const a = o.mapping;
      if (a === Gr || a === Wr)
        if (e.has(o)) {
          const l = e.get(o).texture;
          return t(l, o.mapping);
        } else {
          const l = o.image;
          if (l && l.height > 0) {
            const c = new Yd(l.height);
            return c.fromEquirectangularTexture(r, o), e.set(o, c), o.addEventListener("dispose", i), t(c.texture, o.mapping);
          } else
            return null;
        }
    }
    return o;
  }
  function i(o) {
    const a = o.target;
    a.removeEventListener("dispose", i);
    const l = e.get(a);
    l !== void 0 && (e.delete(a), l.dispose());
  }
  function s() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: n,
    dispose: s
  };
}
const Si = 4, Ga = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], Zn = 20, Tr = /* @__PURE__ */ new lf(), Wa = /* @__PURE__ */ new Oe();
let Ar = null, Cr = 0, Rr = 0, Pr = !1;
const Yn = (1 + Math.sqrt(5)) / 2, Mi = 1 / Yn, Xa = [
  /* @__PURE__ */ new H(-Yn, Mi, 0),
  /* @__PURE__ */ new H(Yn, Mi, 0),
  /* @__PURE__ */ new H(-Mi, 0, Yn),
  /* @__PURE__ */ new H(Mi, 0, Yn),
  /* @__PURE__ */ new H(0, Yn, -Mi),
  /* @__PURE__ */ new H(0, Yn, Mi),
  /* @__PURE__ */ new H(-1, 1, -1),
  /* @__PURE__ */ new H(1, 1, -1),
  /* @__PURE__ */ new H(-1, 1, 1),
  /* @__PURE__ */ new H(1, 1, 1)
], Qm = /* @__PURE__ */ new H();
class qa {
  constructor(e) {
    this._renderer = e, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
  }
  fromScene(e, t = 0, n = 0.1, i = 100, s = {}) {
    const {
      size: o = 256,
      position: a = Qm
    } = s;
    Ar = this._renderer.getRenderTarget(), Cr = this._renderer.getActiveCubeFace(), Rr = this._renderer.getActiveMipmapLevel(), Pr = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(o);
    const l = this._allocateTargets();
    return l.depthBuffer = !0, this._sceneToCubeUV(e, n, i, l, a), t > 0 && this._blur(l, 0, 0, t), this._applyPMREM(l), this._cleanup(l), l;
  }
  fromEquirectangular(e, t = null) {
    return this._fromTexture(e, t);
  }
  fromCubemap(e, t = null) {
    return this._fromTexture(e, t);
  }
  compileCubemapShader() {
    this._cubemapMaterial === null && (this._cubemapMaterial = Ka(), this._compileMaterial(this._cubemapMaterial));
  }
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = ja(), this._compileMaterial(this._equirectMaterial));
  }
  dispose() {
    this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose();
  }
  _setSize(e) {
    this._lodMax = Math.floor(Math.log2(e)), this._cubeSize = Math.pow(2, this._lodMax);
  }
  _dispose() {
    this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
    for (let e = 0; e < this._lodPlanes.length; e++)
      this._lodPlanes[e].dispose();
  }
  _cleanup(e) {
    this._renderer.setRenderTarget(Ar, Cr, Rr), this._renderer.xr.enabled = Pr, e.scissorTest = !1, Ps(e, 0, 0, e.width, e.height);
  }
  _fromTexture(e, t) {
    e.mapping === Ai || e.mapping === Ci ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), Ar = this._renderer.getRenderTarget(), Cr = this._renderer.getActiveCubeFace(), Rr = this._renderer.getActiveMipmapLevel(), Pr = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
    const n = t || this._allocateTargets();
    return this._textureToCubeUV(e, n), this._applyPMREM(n), this._cleanup(n), n;
  }
  _allocateTargets() {
    const e = 3 * Math.max(this._cubeSize, 112), t = 4 * this._cubeSize, n = {
      magFilter: rn,
      minFilter: rn,
      generateMipmaps: !1,
      type: $i,
      format: Zt,
      colorSpace: Ri,
      depthBuffer: !1
    }, i = Ya(e, t, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Ya(e, t, n);
      const { _lodMax: s } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = eg(s)), this._blurMaterial = tg(s, e, t);
    }
    return i;
  }
  _compileMaterial(e) {
    const t = new $t(this._lodPlanes[0], e);
    this._renderer.compile(t, Tr);
  }
  _sceneToCubeUV(e, t, n, i, s) {
    const l = new It(90, 1, t, n), c = [1, -1, 1, 1, 1, 1], h = [1, 1, 1, -1, -1, -1], d = this._renderer, u = d.autoClear, m = d.toneMapping;
    d.getClearColor(Wa), d.toneMapping = In, d.autoClear = !1;
    const g = new kl({
      name: "PMREM.Background",
      side: Pt,
      depthWrite: !1,
      depthTest: !1
    }), _ = new $t(new ts(), g);
    let f = !1;
    const p = e.background;
    p ? p.isColor && (g.color.copy(p), e.background = null, f = !0) : (g.color.copy(Wa), f = !0);
    for (let v = 0; v < 6; v++) {
      const M = v % 3;
      M === 0 ? (l.up.set(0, c[v], 0), l.position.set(s.x, s.y, s.z), l.lookAt(s.x + h[v], s.y, s.z)) : M === 1 ? (l.up.set(0, 0, c[v]), l.position.set(s.x, s.y, s.z), l.lookAt(s.x, s.y + h[v], s.z)) : (l.up.set(0, c[v], 0), l.position.set(s.x, s.y, s.z), l.lookAt(s.x, s.y, s.z + h[v]));
      const x = this._cubeSize;
      Ps(i, M * x, v > 2 ? x : 0, x, x), d.setRenderTarget(i), f && d.render(_, l), d.render(e, l);
    }
    _.geometry.dispose(), _.material.dispose(), d.toneMapping = m, d.autoClear = u, e.background = p;
  }
  _textureToCubeUV(e, t) {
    const n = this._renderer, i = e.mapping === Ai || e.mapping === Ci;
    i ? (this._cubemapMaterial === null && (this._cubemapMaterial = Ka()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = ja());
    const s = i ? this._cubemapMaterial : this._equirectMaterial, o = new $t(this._lodPlanes[0], s), a = s.uniforms;
    a.envMap.value = e;
    const l = this._cubeSize;
    Ps(t, 0, 0, 3 * l, 2 * l), n.setRenderTarget(t), n.render(o, Tr);
  }
  _applyPMREM(e) {
    const t = this._renderer, n = t.autoClear;
    t.autoClear = !1;
    const i = this._lodPlanes.length;
    for (let s = 1; s < i; s++) {
      const o = Math.sqrt(this._sigmas[s] * this._sigmas[s] - this._sigmas[s - 1] * this._sigmas[s - 1]), a = Xa[(i - s - 1) % Xa.length];
      this._blur(e, s - 1, s, o, a);
    }
    t.autoClear = n;
  }
  _blur(e, t, n, i, s) {
    const o = this._pingPongRenderTarget;
    this._halfBlur(
      e,
      o,
      t,
      n,
      i,
      "latitudinal",
      s
    ), this._halfBlur(
      o,
      e,
      n,
      n,
      i,
      "longitudinal",
      s
    );
  }
  _halfBlur(e, t, n, i, s, o, a) {
    const l = this._renderer, c = this._blurMaterial;
    o !== "latitudinal" && o !== "longitudinal" && console.error(
      "blur direction must be either latitudinal or longitudinal!"
    );
    const h = 3, d = new $t(this._lodPlanes[i], c), u = c.uniforms, m = this._sizeLods[n] - 1, g = isFinite(s) ? Math.PI / (2 * m) : 2 * Math.PI / (2 * Zn - 1), _ = s / g, f = isFinite(s) ? 1 + Math.floor(h * _) : Zn;
    f > Zn && console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${f} samples when the maximum is set to ${Zn}`);
    const p = [];
    let v = 0;
    for (let C = 0; C < Zn; ++C) {
      const D = C / _, b = Math.exp(-D * D / 2);
      p.push(b), C === 0 ? v += b : C < f && (v += 2 * b);
    }
    for (let C = 0; C < p.length; C++)
      p[C] = p[C] / v;
    u.envMap.value = e.texture, u.samples.value = f, u.weights.value = p, u.latitudinal.value = o === "latitudinal", a && (u.poleAxis.value = a);
    const { _lodMax: M } = this;
    u.dTheta.value = g, u.mipInt.value = M - n;
    const x = this._sizeLods[i], A = 3 * x * (i > M - Si ? i - M + Si : 0), T = 4 * (this._cubeSize - x);
    Ps(t, A, T, 3 * x, 2 * x), l.setRenderTarget(t), l.render(d, Tr);
  }
}
function eg(r) {
  const e = [], t = [], n = [];
  let i = r;
  const s = r - Si + 1 + Ga.length;
  for (let o = 0; o < s; o++) {
    const a = Math.pow(2, i);
    t.push(a);
    let l = 1 / a;
    o > r - Si ? l = Ga[o - r + Si - 1] : o === 0 && (l = 0), n.push(l);
    const c = 1 / (a - 2), h = -c, d = 1 + c, u = [h, h, d, h, d, d, h, h, d, d, h, d], m = 6, g = 6, _ = 3, f = 2, p = 1, v = new Float32Array(_ * g * m), M = new Float32Array(f * g * m), x = new Float32Array(p * g * m);
    for (let T = 0; T < m; T++) {
      const C = T % 3 * 2 / 3 - 1, D = T > 2 ? 0 : -1, b = [
        C,
        D,
        0,
        C + 2 / 3,
        D,
        0,
        C + 2 / 3,
        D + 1,
        0,
        C,
        D,
        0,
        C + 2 / 3,
        D + 1,
        0,
        C,
        D + 1,
        0
      ];
      v.set(b, _ * g * T), M.set(u, f * g * T);
      const y = [T, T, T, T, T, T];
      x.set(y, p * g * T);
    }
    const A = new ln();
    A.setAttribute("position", new on(v, _)), A.setAttribute("uv", new on(M, f)), A.setAttribute("faceIndex", new on(x, p)), e.push(A), i > Si && i--;
  }
  return { lodPlanes: e, sizeLods: t, sigmas: n };
}
function Ya(r, e, t) {
  const n = new ii(r, e, t);
  return n.texture.mapping = Xs, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, n;
}
function Ps(r, e, t, n, i) {
  r.viewport.set(e, t, n, i), r.scissor.set(e, t, n, i);
}
function tg(r, e, t) {
  const n = new Float32Array(Zn), i = new H(0, 1, 0);
  return new Nn({
    name: "SphericalGaussianBlur",
    defines: {
      n: Zn,
      CUBEUV_TEXEL_WIDTH: 1 / e,
      CUBEUV_TEXEL_HEIGHT: 1 / t,
      CUBEUV_MAX_MIP: `${r}.0`
    },
    uniforms: {
      envMap: { value: null },
      samples: { value: 1 },
      weights: { value: n },
      latitudinal: { value: !1 },
      dTheta: { value: 0 },
      mipInt: { value: 0 },
      poleAxis: { value: i }
    },
    vertexShader: zo(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,
    blending: Fn,
    depthTest: !1,
    depthWrite: !1
  });
}
function ja() {
  return new Nn({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: { value: null }
    },
    vertexShader: zo(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,
    blending: Fn,
    depthTest: !1,
    depthWrite: !1
  });
}
function Ka() {
  return new Nn({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: zo(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,
    blending: Fn,
    depthTest: !1,
    depthWrite: !1
  });
}
function zo() {
  return `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`;
}
function ng(r) {
  let e = /* @__PURE__ */ new WeakMap(), t = null;
  function n(a) {
    if (a && a.isTexture) {
      const l = a.mapping, c = l === Gr || l === Wr, h = l === Ai || l === Ci;
      if (c || h) {
        let d = e.get(a);
        const u = d !== void 0 ? d.texture.pmremVersion : 0;
        if (a.isRenderTargetTexture && a.pmremVersion !== u)
          return t === null && (t = new qa(r)), d = c ? t.fromEquirectangular(a, d) : t.fromCubemap(a, d), d.texture.pmremVersion = a.pmremVersion, e.set(a, d), d.texture;
        if (d !== void 0)
          return d.texture;
        {
          const m = a.image;
          return c && m && m.height > 0 || h && m && i(m) ? (t === null && (t = new qa(r)), d = c ? t.fromEquirectangular(a) : t.fromCubemap(a), d.texture.pmremVersion = a.pmremVersion, e.set(a, d), a.addEventListener("dispose", s), d.texture) : null;
        }
      }
    }
    return a;
  }
  function i(a) {
    let l = 0;
    const c = 6;
    for (let h = 0; h < c; h++)
      a[h] !== void 0 && l++;
    return l === c;
  }
  function s(a) {
    const l = a.target;
    l.removeEventListener("dispose", s);
    const c = e.get(l);
    c !== void 0 && (e.delete(l), c.dispose());
  }
  function o() {
    e = /* @__PURE__ */ new WeakMap(), t !== null && (t.dispose(), t = null);
  }
  return {
    get: n,
    dispose: o
  };
}
function ig(r) {
  const e = {};
  function t(n) {
    if (e[n] !== void 0)
      return e[n];
    let i;
    switch (n) {
      case "WEBGL_depth_texture":
        i = r.getExtension("WEBGL_depth_texture") || r.getExtension("MOZ_WEBGL_depth_texture") || r.getExtension("WEBKIT_WEBGL_depth_texture");
        break;
      case "EXT_texture_filter_anisotropic":
        i = r.getExtension("EXT_texture_filter_anisotropic") || r.getExtension("MOZ_EXT_texture_filter_anisotropic") || r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        break;
      case "WEBGL_compressed_texture_s3tc":
        i = r.getExtension("WEBGL_compressed_texture_s3tc") || r.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        break;
      case "WEBGL_compressed_texture_pvrtc":
        i = r.getExtension("WEBGL_compressed_texture_pvrtc") || r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        i = r.getExtension(n);
    }
    return e[n] = i, i;
  }
  return {
    has: function(n) {
      return t(n) !== null;
    },
    init: function() {
      t("EXT_color_buffer_float"), t("WEBGL_clip_cull_distance"), t("OES_texture_float_linear"), t("EXT_color_buffer_half_float"), t("WEBGL_multisampled_render_to_texture"), t("WEBGL_render_shared_exponent");
    },
    get: function(n) {
      const i = t(n);
      return i === null && Os("THREE.WebGLRenderer: " + n + " extension not supported."), i;
    }
  };
}
function sg(r, e, t, n) {
  const i = {}, s = /* @__PURE__ */ new WeakMap();
  function o(d) {
    const u = d.target;
    u.index !== null && e.remove(u.index);
    for (const g in u.attributes)
      e.remove(u.attributes[g]);
    u.removeEventListener("dispose", o), delete i[u.id];
    const m = s.get(u);
    m && (e.remove(m), s.delete(u)), n.releaseStatesOfGeometry(u), u.isInstancedBufferGeometry === !0 && delete u._maxInstanceCount, t.memory.geometries--;
  }
  function a(d, u) {
    return i[u.id] === !0 || (u.addEventListener("dispose", o), i[u.id] = !0, t.memory.geometries++), u;
  }
  function l(d) {
    const u = d.attributes;
    for (const m in u)
      e.update(u[m], r.ARRAY_BUFFER);
  }
  function c(d) {
    const u = [], m = d.index, g = d.attributes.position;
    let _ = 0;
    if (m !== null) {
      const v = m.array;
      _ = m.version;
      for (let M = 0, x = v.length; M < x; M += 3) {
        const A = v[M + 0], T = v[M + 1], C = v[M + 2];
        u.push(A, T, T, C, C, A);
      }
    } else if (g !== void 0) {
      const v = g.array;
      _ = g.version;
      for (let M = 0, x = v.length / 3 - 1; M < x; M += 3) {
        const A = M + 0, T = M + 1, C = M + 2;
        u.push(A, T, T, C, C, A);
      }
    } else
      return;
    const f = new (Nl(u) ? Hl : Vl)(u, 1);
    f.version = _;
    const p = s.get(d);
    p && e.remove(p), s.set(d, f);
  }
  function h(d) {
    const u = s.get(d);
    if (u) {
      const m = d.index;
      m !== null && u.version < m.version && c(d);
    } else
      c(d);
    return s.get(d);
  }
  return {
    get: a,
    update: l,
    getWireframeAttribute: h
  };
}
function rg(r, e, t) {
  let n;
  function i(u) {
    n = u;
  }
  let s, o;
  function a(u) {
    s = u.type, o = u.bytesPerElement;
  }
  function l(u, m) {
    r.drawElements(n, m, s, u * o), t.update(m, n, 1);
  }
  function c(u, m, g) {
    g !== 0 && (r.drawElementsInstanced(n, m, s, u * o, g), t.update(m, n, g));
  }
  function h(u, m, g) {
    if (g === 0)
      return;
    e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, m, 0, s, u, 0, g);
    let f = 0;
    for (let p = 0; p < g; p++)
      f += m[p];
    t.update(f, n, 1);
  }
  function d(u, m, g, _) {
    if (g === 0)
      return;
    const f = e.get("WEBGL_multi_draw");
    if (f === null)
      for (let p = 0; p < u.length; p++)
        c(u[p] / o, m[p], _[p]);
    else {
      f.multiDrawElementsInstancedWEBGL(n, m, 0, s, u, 0, _, 0, g);
      let p = 0;
      for (let v = 0; v < g; v++)
        p += m[v] * _[v];
      t.update(p, n, 1);
    }
  }
  this.setMode = i, this.setIndex = a, this.render = l, this.renderInstances = c, this.renderMultiDraw = h, this.renderMultiDrawInstances = d;
}
function og(r) {
  const e = {
    geometries: 0,
    textures: 0
  }, t = {
    frame: 0,
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0
  };
  function n(s, o, a) {
    switch (t.calls++, o) {
      case r.TRIANGLES:
        t.triangles += a * (s / 3);
        break;
      case r.LINES:
        t.lines += a * (s / 2);
        break;
      case r.LINE_STRIP:
        t.lines += a * (s - 1);
        break;
      case r.LINE_LOOP:
        t.lines += a * s;
        break;
      case r.POINTS:
        t.points += a * s;
        break;
      default:
        console.error("THREE.WebGLInfo: Unknown draw mode:", o);
        break;
    }
  }
  function i() {
    t.calls = 0, t.triangles = 0, t.points = 0, t.lines = 0;
  }
  return {
    memory: e,
    render: t,
    programs: null,
    autoReset: !0,
    reset: i,
    update: n
  };
}
function ag(r, e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = new lt();
  function s(o, a, l) {
    const c = o.morphTargetInfluences, h = a.morphAttributes.position || a.morphAttributes.normal || a.morphAttributes.color, d = h !== void 0 ? h.length : 0;
    let u = n.get(a);
    if (u === void 0 || u.count !== d) {
      let b = function() {
        C.dispose(), n.delete(a), a.removeEventListener("dispose", b);
      };
      u !== void 0 && u.texture.dispose();
      const m = a.morphAttributes.position !== void 0, g = a.morphAttributes.normal !== void 0, _ = a.morphAttributes.color !== void 0, f = a.morphAttributes.position || [], p = a.morphAttributes.normal || [], v = a.morphAttributes.color || [];
      let M = 0;
      m === !0 && (M = 1), g === !0 && (M = 2), _ === !0 && (M = 3);
      let x = a.attributes.position.count * M, A = 1;
      x > e.maxTextureSize && (A = Math.ceil(x / e.maxTextureSize), x = e.maxTextureSize);
      const T = new Float32Array(x * A * 4 * d), C = new Ol(T, x, A, d);
      C.type = Sn, C.needsUpdate = !0;
      const D = M * 4;
      for (let y = 0; y < d; y++) {
        const P = f[y], B = p[y], L = v[y], U = x * A * 4 * y;
        for (let O = 0; O < P.count; O++) {
          const F = O * D;
          m === !0 && (i.fromBufferAttribute(P, O), T[U + F + 0] = i.x, T[U + F + 1] = i.y, T[U + F + 2] = i.z, T[U + F + 3] = 0), g === !0 && (i.fromBufferAttribute(B, O), T[U + F + 4] = i.x, T[U + F + 5] = i.y, T[U + F + 6] = i.z, T[U + F + 7] = 0), _ === !0 && (i.fromBufferAttribute(L, O), T[U + F + 8] = i.x, T[U + F + 9] = i.y, T[U + F + 10] = i.z, T[U + F + 11] = L.itemSize === 4 ? i.w : 1);
        }
      }
      u = {
        count: d,
        texture: C,
        size: new ze(x, A)
      }, n.set(a, u), a.addEventListener("dispose", b);
    }
    if (o.isInstancedMesh === !0 && o.morphTexture !== null)
      l.getUniforms().setValue(r, "morphTexture", o.morphTexture, t);
    else {
      let m = 0;
      for (let _ = 0; _ < c.length; _++)
        m += c[_];
      const g = a.morphTargetsRelative ? 1 : 1 - m;
      l.getUniforms().setValue(r, "morphTargetBaseInfluence", g), l.getUniforms().setValue(r, "morphTargetInfluences", c);
    }
    l.getUniforms().setValue(r, "morphTargetsTexture", u.texture, t), l.getUniforms().setValue(r, "morphTargetsTextureSize", u.size);
  }
  return {
    update: s
  };
}
function lg(r, e, t, n) {
  let i = /* @__PURE__ */ new WeakMap();
  function s(l) {
    const c = n.render.frame, h = l.geometry, d = e.get(l, h);
    if (i.get(d) !== c && (e.update(d), i.set(d, c)), l.isInstancedMesh && (l.hasEventListener("dispose", a) === !1 && l.addEventListener("dispose", a), i.get(l) !== c && (t.update(l.instanceMatrix, r.ARRAY_BUFFER), l.instanceColor !== null && t.update(l.instanceColor, r.ARRAY_BUFFER), i.set(l, c))), l.isSkinnedMesh) {
      const u = l.skeleton;
      i.get(u) !== c && (u.update(), i.set(u, c));
    }
    return d;
  }
  function o() {
    i = /* @__PURE__ */ new WeakMap();
  }
  function a(l) {
    const c = l.target;
    c.removeEventListener("dispose", a), t.remove(c.instanceMatrix), c.instanceColor !== null && t.remove(c.instanceColor);
  }
  return {
    update: s,
    dispose: o
  };
}
const Kl = /* @__PURE__ */ new bt(), Za = /* @__PURE__ */ new ql(1, 1), Zl = /* @__PURE__ */ new Ol(), $l = /* @__PURE__ */ new Pd(), Jl = /* @__PURE__ */ new Xl(), $a = [], Ja = [], Qa = new Float32Array(16), el = new Float32Array(9), tl = new Float32Array(4);
function Li(r, e, t) {
  const n = r[0];
  if (n <= 0 || n > 0)
    return r;
  const i = e * t;
  let s = $a[i];
  if (s === void 0 && (s = new Float32Array(i), $a[i] = s), e !== 0) {
    n.toArray(s, 0);
    for (let o = 1, a = 0; o !== e; ++o)
      a += t, r[o].toArray(s, a);
  }
  return s;
}
function mt(r, e) {
  if (r.length !== e.length)
    return !1;
  for (let t = 0, n = r.length; t < n; t++)
    if (r[t] !== e[t])
      return !1;
  return !0;
}
function gt(r, e) {
  for (let t = 0, n = e.length; t < n; t++)
    r[t] = e[t];
}
function qs(r, e) {
  let t = Ja[e];
  t === void 0 && (t = new Int32Array(e), Ja[e] = t);
  for (let n = 0; n !== e; ++n)
    t[n] = r.allocateTextureUnit();
  return t;
}
function cg(r, e) {
  const t = this.cache;
  t[0] !== e && (r.uniform1f(this.addr, e), t[0] = e);
}
function hg(r, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (r.uniform2f(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (mt(t, e))
      return;
    r.uniform2fv(this.addr, e), gt(t, e);
  }
}
function ug(r, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (r.uniform3f(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else if (e.r !== void 0)
    (t[0] !== e.r || t[1] !== e.g || t[2] !== e.b) && (r.uniform3f(this.addr, e.r, e.g, e.b), t[0] = e.r, t[1] = e.g, t[2] = e.b);
  else {
    if (mt(t, e))
      return;
    r.uniform3fv(this.addr, e), gt(t, e);
  }
}
function dg(r, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (r.uniform4f(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (mt(t, e))
      return;
    r.uniform4fv(this.addr, e), gt(t, e);
  }
}
function fg(r, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (mt(t, e))
      return;
    r.uniformMatrix2fv(this.addr, !1, e), gt(t, e);
  } else {
    if (mt(t, n))
      return;
    tl.set(n), r.uniformMatrix2fv(this.addr, !1, tl), gt(t, n);
  }
}
function pg(r, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (mt(t, e))
      return;
    r.uniformMatrix3fv(this.addr, !1, e), gt(t, e);
  } else {
    if (mt(t, n))
      return;
    el.set(n), r.uniformMatrix3fv(this.addr, !1, el), gt(t, n);
  }
}
function mg(r, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (mt(t, e))
      return;
    r.uniformMatrix4fv(this.addr, !1, e), gt(t, e);
  } else {
    if (mt(t, n))
      return;
    Qa.set(n), r.uniformMatrix4fv(this.addr, !1, Qa), gt(t, n);
  }
}
function gg(r, e) {
  const t = this.cache;
  t[0] !== e && (r.uniform1i(this.addr, e), t[0] = e);
}
function _g(r, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (r.uniform2i(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (mt(t, e))
      return;
    r.uniform2iv(this.addr, e), gt(t, e);
  }
}
function vg(r, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (r.uniform3i(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (mt(t, e))
      return;
    r.uniform3iv(this.addr, e), gt(t, e);
  }
}
function xg(r, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (r.uniform4i(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (mt(t, e))
      return;
    r.uniform4iv(this.addr, e), gt(t, e);
  }
}
function yg(r, e) {
  const t = this.cache;
  t[0] !== e && (r.uniform1ui(this.addr, e), t[0] = e);
}
function Mg(r, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (r.uniform2ui(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (mt(t, e))
      return;
    r.uniform2uiv(this.addr, e), gt(t, e);
  }
}
function Sg(r, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (r.uniform3ui(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (mt(t, e))
      return;
    r.uniform3uiv(this.addr, e), gt(t, e);
  }
}
function Eg(r, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (r.uniform4ui(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (mt(t, e))
      return;
    r.uniform4uiv(this.addr, e), gt(t, e);
  }
}
function bg(r, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (r.uniform1i(this.addr, i), n[0] = i);
  let s;
  this.type === r.SAMPLER_2D_SHADOW ? (Za.compareFunction = Ul, s = Za) : s = Kl, t.setTexture2D(e || s, i);
}
function wg(r, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (r.uniform1i(this.addr, i), n[0] = i), t.setTexture3D(e || $l, i);
}
function Tg(r, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (r.uniform1i(this.addr, i), n[0] = i), t.setTextureCube(e || Jl, i);
}
function Ag(r, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (r.uniform1i(this.addr, i), n[0] = i), t.setTexture2DArray(e || Zl, i);
}
function Cg(r) {
  switch (r) {
    case 5126:
      return cg;
    case 35664:
      return hg;
    case 35665:
      return ug;
    case 35666:
      return dg;
    case 35674:
      return fg;
    case 35675:
      return pg;
    case 35676:
      return mg;
    case 5124:
    case 35670:
      return gg;
    case 35667:
    case 35671:
      return _g;
    case 35668:
    case 35672:
      return vg;
    case 35669:
    case 35673:
      return xg;
    case 5125:
      return yg;
    case 36294:
      return Mg;
    case 36295:
      return Sg;
    case 36296:
      return Eg;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return bg;
    case 35679:
    case 36299:
    case 36307:
      return wg;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Tg;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Ag;
  }
}
function Rg(r, e) {
  r.uniform1fv(this.addr, e);
}
function Pg(r, e) {
  const t = Li(e, this.size, 2);
  r.uniform2fv(this.addr, t);
}
function Dg(r, e) {
  const t = Li(e, this.size, 3);
  r.uniform3fv(this.addr, t);
}
function Lg(r, e) {
  const t = Li(e, this.size, 4);
  r.uniform4fv(this.addr, t);
}
function Fg(r, e) {
  const t = Li(e, this.size, 4);
  r.uniformMatrix2fv(this.addr, !1, t);
}
function Ig(r, e) {
  const t = Li(e, this.size, 9);
  r.uniformMatrix3fv(this.addr, !1, t);
}
function Ug(r, e) {
  const t = Li(e, this.size, 16);
  r.uniformMatrix4fv(this.addr, !1, t);
}
function Ng(r, e) {
  r.uniform1iv(this.addr, e);
}
function Og(r, e) {
  r.uniform2iv(this.addr, e);
}
function Bg(r, e) {
  r.uniform3iv(this.addr, e);
}
function zg(r, e) {
  r.uniform4iv(this.addr, e);
}
function kg(r, e) {
  r.uniform1uiv(this.addr, e);
}
function Vg(r, e) {
  r.uniform2uiv(this.addr, e);
}
function Hg(r, e) {
  r.uniform3uiv(this.addr, e);
}
function Gg(r, e) {
  r.uniform4uiv(this.addr, e);
}
function Wg(r, e, t) {
  const n = this.cache, i = e.length, s = qs(t, i);
  mt(n, s) || (r.uniform1iv(this.addr, s), gt(n, s));
  for (let o = 0; o !== i; ++o)
    t.setTexture2D(e[o] || Kl, s[o]);
}
function Xg(r, e, t) {
  const n = this.cache, i = e.length, s = qs(t, i);
  mt(n, s) || (r.uniform1iv(this.addr, s), gt(n, s));
  for (let o = 0; o !== i; ++o)
    t.setTexture3D(e[o] || $l, s[o]);
}
function qg(r, e, t) {
  const n = this.cache, i = e.length, s = qs(t, i);
  mt(n, s) || (r.uniform1iv(this.addr, s), gt(n, s));
  for (let o = 0; o !== i; ++o)
    t.setTextureCube(e[o] || Jl, s[o]);
}
function Yg(r, e, t) {
  const n = this.cache, i = e.length, s = qs(t, i);
  mt(n, s) || (r.uniform1iv(this.addr, s), gt(n, s));
  for (let o = 0; o !== i; ++o)
    t.setTexture2DArray(e[o] || Zl, s[o]);
}
function jg(r) {
  switch (r) {
    case 5126:
      return Rg;
    case 35664:
      return Pg;
    case 35665:
      return Dg;
    case 35666:
      return Lg;
    case 35674:
      return Fg;
    case 35675:
      return Ig;
    case 35676:
      return Ug;
    case 5124:
    case 35670:
      return Ng;
    case 35667:
    case 35671:
      return Og;
    case 35668:
    case 35672:
      return Bg;
    case 35669:
    case 35673:
      return zg;
    case 5125:
      return kg;
    case 36294:
      return Vg;
    case 36295:
      return Hg;
    case 36296:
      return Gg;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Wg;
    case 35679:
    case 36299:
    case 36307:
      return Xg;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return qg;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Yg;
  }
}
class Kg {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.setValue = Cg(t.type);
  }
}
class Zg {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = jg(t.type);
  }
}
class $g {
  constructor(e) {
    this.id = e, this.seq = [], this.map = {};
  }
  setValue(e, t, n) {
    const i = this.seq;
    for (let s = 0, o = i.length; s !== o; ++s) {
      const a = i[s];
      a.setValue(e, t[a.id], n);
    }
  }
}
const Dr = /(\w+)(\])?(\[|\.)?/g;
function nl(r, e) {
  r.seq.push(e), r.map[e.id] = e;
}
function Jg(r, e, t) {
  const n = r.name, i = n.length;
  for (Dr.lastIndex = 0; ; ) {
    const s = Dr.exec(n), o = Dr.lastIndex;
    let a = s[1];
    const l = s[2] === "]", c = s[3];
    if (l && (a = a | 0), c === void 0 || c === "[" && o + 2 === i) {
      nl(t, c === void 0 ? new Kg(a, r, e) : new Zg(a, r, e));
      break;
    } else {
      let d = t.map[a];
      d === void 0 && (d = new $g(a), nl(t, d)), t = d;
    }
  }
}
class Bs {
  constructor(e, t) {
    this.seq = [], this.map = {};
    const n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; ++i) {
      const s = e.getActiveUniform(t, i), o = e.getUniformLocation(t, s.name);
      Jg(s, o, this);
    }
  }
  setValue(e, t, n, i) {
    const s = this.map[t];
    s !== void 0 && s.setValue(e, n, i);
  }
  setOptional(e, t, n) {
    const i = t[n];
    i !== void 0 && this.setValue(e, n, i);
  }
  static upload(e, t, n, i) {
    for (let s = 0, o = t.length; s !== o; ++s) {
      const a = t[s], l = n[a.id];
      l.needsUpdate !== !1 && a.setValue(e, l.value, i);
    }
  }
  static seqWithValue(e, t) {
    const n = [];
    for (let i = 0, s = e.length; i !== s; ++i) {
      const o = e[i];
      o.id in t && n.push(o);
    }
    return n;
  }
}
function il(r, e, t) {
  const n = r.createShader(e);
  return r.shaderSource(n, t), r.compileShader(n), n;
}
const Qg = 37297;
let e_ = 0;
function t_(r, e) {
  const t = r.split(`
`), n = [], i = Math.max(e - 6, 0), s = Math.min(e + 6, t.length);
  for (let o = i; o < s; o++) {
    const a = o + 1;
    n.push(`${a === e ? ">" : " "} ${a}: ${t[o]}`);
  }
  return n.join(`
`);
}
const sl = /* @__PURE__ */ new Ie();
function n_(r) {
  Ye._getMatrix(sl, Ye.workingColorSpace, r);
  const e = `mat3( ${sl.elements.map((t) => t.toFixed(4))} )`;
  switch (Ye.getTransfer(r)) {
    case Vs:
      return [e, "LinearTransferOETF"];
    case Qe:
      return [e, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space: ", r), [e, "LinearTransferOETF"];
  }
}
function rl(r, e, t) {
  const n = r.getShaderParameter(e, r.COMPILE_STATUS), i = r.getShaderInfoLog(e).trim();
  if (n && i === "")
    return "";
  const s = /ERROR: 0:(\d+)/.exec(i);
  if (s) {
    const o = parseInt(s[1]);
    return t.toUpperCase() + `

` + i + `

` + t_(r.getShaderSource(e), o);
  } else
    return i;
}
function i_(r, e) {
  const t = n_(e);
  return [
    `vec4 ${r}( vec4 value ) {`,
    `	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,
    "}"
  ].join(`
`);
}
function s_(r, e) {
  let t;
  switch (e) {
    case nd:
      t = "Linear";
      break;
    case id:
      t = "Reinhard";
      break;
    case sd:
      t = "Cineon";
      break;
    case rd:
      t = "ACESFilmic";
      break;
    case ad:
      t = "AgX";
      break;
    case ld:
      t = "Neutral";
      break;
    case od:
      t = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", e), t = "Linear";
  }
  return "vec3 " + r + "( vec3 color ) { return " + t + "ToneMapping( color ); }";
}
const Ds = /* @__PURE__ */ new H();
function r_() {
  Ye.getLuminanceCoefficients(Ds);
  const r = Ds.x.toFixed(4), e = Ds.y.toFixed(4), t = Ds.z.toFixed(4);
  return [
    "float luminance( const in vec3 rgb ) {",
    `	const vec3 weights = vec3( ${r}, ${e}, ${t} );`,
    "	return dot( weights, rgb );",
    "}"
  ].join(`
`);
}
function o_(r) {
  return [
    r.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
    r.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
  ].filter(Wi).join(`
`);
}
function a_(r) {
  const e = [];
  for (const t in r) {
    const n = r[t];
    n !== !1 && e.push("#define " + t + " " + n);
  }
  return e.join(`
`);
}
function l_(r, e) {
  const t = {}, n = r.getProgramParameter(e, r.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < n; i++) {
    const s = r.getActiveAttrib(e, i), o = s.name;
    let a = 1;
    s.type === r.FLOAT_MAT2 && (a = 2), s.type === r.FLOAT_MAT3 && (a = 3), s.type === r.FLOAT_MAT4 && (a = 4), t[o] = {
      type: s.type,
      location: r.getAttribLocation(e, o),
      locationSize: a
    };
  }
  return t;
}
function Wi(r) {
  return r !== "";
}
function ol(r, e) {
  const t = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
  return r.replace(/NUM_DIR_LIGHTS/g, e.numDirLights).replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, t).replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, e.numPointLights).replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows);
}
function al(r, e) {
  return r.replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection);
}
const c_ = /^[ \t]*#include +<([\w\d./]+)>/gm;
function Mo(r) {
  return r.replace(c_, u_);
}
const h_ = /* @__PURE__ */ new Map();
function u_(r, e) {
  let t = Ne[e];
  if (t === void 0) {
    const n = h_.get(e);
    if (n !== void 0)
      t = Ne[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', e, n);
    else
      throw new Error("Can not resolve #include <" + e + ">");
  }
  return Mo(t);
}
const d_ = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function ll(r) {
  return r.replace(d_, f_);
}
function f_(r, e, t, n) {
  let i = "";
  for (let s = parseInt(e); s < parseInt(t); s++)
    i += n.replace(/\[\s*i\s*\]/g, "[ " + s + " ]").replace(/UNROLLED_LOOP_INDEX/g, s);
  return i;
}
function cl(r) {
  let e = `precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;
  return r.precision === "highp" ? e += `
#define HIGH_PRECISION` : r.precision === "mediump" ? e += `
#define MEDIUM_PRECISION` : r.precision === "lowp" && (e += `
#define LOW_PRECISION`), e;
}
function p_(r) {
  let e = "SHADOWMAP_TYPE_BASIC";
  return r.shadowMapType === bl ? e = "SHADOWMAP_TYPE_PCF" : r.shadowMapType === wl ? e = "SHADOWMAP_TYPE_PCF_SOFT" : r.shadowMapType === yn && (e = "SHADOWMAP_TYPE_VSM"), e;
}
function m_(r) {
  let e = "ENVMAP_TYPE_CUBE";
  if (r.envMap)
    switch (r.envMapMode) {
      case Ai:
      case Ci:
        e = "ENVMAP_TYPE_CUBE";
        break;
      case Xs:
        e = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
  return e;
}
function g_(r) {
  let e = "ENVMAP_MODE_REFLECTION";
  if (r.envMap)
    switch (r.envMapMode) {
      case Ci:
        e = "ENVMAP_MODE_REFRACTION";
        break;
    }
  return e;
}
function __(r) {
  let e = "ENVMAP_BLENDING_NONE";
  if (r.envMap)
    switch (r.combine) {
      case Ao:
        e = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case ed:
        e = "ENVMAP_BLENDING_MIX";
        break;
      case td:
        e = "ENVMAP_BLENDING_ADD";
        break;
    }
  return e;
}
function v_(r) {
  const e = r.envMapCubeUVHeight;
  if (e === null)
    return null;
  const t = Math.log2(e) - 2, n = 1 / e;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, t), 7 * 16)), texelHeight: n, maxMip: t };
}
function x_(r, e, t, n) {
  const i = r.getContext(), s = t.defines;
  let o = t.vertexShader, a = t.fragmentShader;
  const l = p_(t), c = m_(t), h = g_(t), d = __(t), u = v_(t), m = o_(t), g = a_(s), _ = i.createProgram();
  let f, p, v = t.glslVersion ? "#version " + t.glslVersion + `
` : "";
  t.isRawShaderMaterial ? (f = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g
  ].filter(Wi).join(`
`), f.length > 0 && (f += `
`), p = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g
  ].filter(Wi).join(`
`), p.length > 0 && (p += `
`)) : (f = [
    cl(t),
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g,
    t.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
    t.batching ? "#define USE_BATCHING" : "",
    t.batchingColor ? "#define USE_BATCHING_COLOR" : "",
    t.instancing ? "#define USE_INSTANCING" : "",
    t.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
    t.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
    t.useFog && t.fog ? "#define USE_FOG" : "",
    t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "",
    t.map ? "#define USE_MAP" : "",
    t.envMap ? "#define USE_ENVMAP" : "",
    t.envMap ? "#define " + h : "",
    t.lightMap ? "#define USE_LIGHTMAP" : "",
    t.aoMap ? "#define USE_AOMAP" : "",
    t.bumpMap ? "#define USE_BUMPMAP" : "",
    t.normalMap ? "#define USE_NORMALMAP" : "",
    t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    t.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
    t.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    t.anisotropy ? "#define USE_ANISOTROPY" : "",
    t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    t.specularMap ? "#define USE_SPECULARMAP" : "",
    t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    t.metalnessMap ? "#define USE_METALNESSMAP" : "",
    t.alphaMap ? "#define USE_ALPHAMAP" : "",
    t.alphaHash ? "#define USE_ALPHAHASH" : "",
    t.transmission ? "#define USE_TRANSMISSION" : "",
    t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    t.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    t.mapUv ? "#define MAP_UV " + t.mapUv : "",
    t.alphaMapUv ? "#define ALPHAMAP_UV " + t.alphaMapUv : "",
    t.lightMapUv ? "#define LIGHTMAP_UV " + t.lightMapUv : "",
    t.aoMapUv ? "#define AOMAP_UV " + t.aoMapUv : "",
    t.emissiveMapUv ? "#define EMISSIVEMAP_UV " + t.emissiveMapUv : "",
    t.bumpMapUv ? "#define BUMPMAP_UV " + t.bumpMapUv : "",
    t.normalMapUv ? "#define NORMALMAP_UV " + t.normalMapUv : "",
    t.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + t.displacementMapUv : "",
    t.metalnessMapUv ? "#define METALNESSMAP_UV " + t.metalnessMapUv : "",
    t.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + t.roughnessMapUv : "",
    t.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + t.anisotropyMapUv : "",
    t.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + t.clearcoatMapUv : "",
    t.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + t.clearcoatNormalMapUv : "",
    t.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + t.clearcoatRoughnessMapUv : "",
    t.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + t.iridescenceMapUv : "",
    t.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + t.iridescenceThicknessMapUv : "",
    t.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + t.sheenColorMapUv : "",
    t.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + t.sheenRoughnessMapUv : "",
    t.specularMapUv ? "#define SPECULARMAP_UV " + t.specularMapUv : "",
    t.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + t.specularColorMapUv : "",
    t.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + t.specularIntensityMapUv : "",
    t.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + t.transmissionMapUv : "",
    t.thicknessMapUv ? "#define THICKNESSMAP_UV " + t.thicknessMapUv : "",
    t.vertexTangents && t.flatShading === !1 ? "#define USE_TANGENT" : "",
    t.vertexColors ? "#define USE_COLOR" : "",
    t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    t.vertexUv1s ? "#define USE_UV1" : "",
    t.vertexUv2s ? "#define USE_UV2" : "",
    t.vertexUv3s ? "#define USE_UV3" : "",
    t.pointsUvs ? "#define USE_POINTS_UV" : "",
    t.flatShading ? "#define FLAT_SHADED" : "",
    t.skinning ? "#define USE_SKINNING" : "",
    t.morphTargets ? "#define USE_MORPHTARGETS" : "",
    t.morphNormals && t.flatShading === !1 ? "#define USE_MORPHNORMALS" : "",
    t.morphColors ? "#define USE_MORPHCOLORS" : "",
    t.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + t.morphTextureStride : "",
    t.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + t.morphTargetsCount : "",
    t.doubleSided ? "#define DOUBLE_SIDED" : "",
    t.flipSided ? "#define FLIP_SIDED" : "",
    t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    t.shadowMapEnabled ? "#define " + l : "",
    t.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
    t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    t.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
    t.reverseDepthBuffer ? "#define USE_REVERSEDEPTHBUF" : "",
    "uniform mat4 modelMatrix;",
    "uniform mat4 modelViewMatrix;",
    "uniform mat4 projectionMatrix;",
    "uniform mat4 viewMatrix;",
    "uniform mat3 normalMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    "#ifdef USE_INSTANCING",
    "	attribute mat4 instanceMatrix;",
    "#endif",
    "#ifdef USE_INSTANCING_COLOR",
    "	attribute vec3 instanceColor;",
    "#endif",
    "#ifdef USE_INSTANCING_MORPH",
    "	uniform sampler2D morphTexture;",
    "#endif",
    "attribute vec3 position;",
    "attribute vec3 normal;",
    "attribute vec2 uv;",
    "#ifdef USE_UV1",
    "	attribute vec2 uv1;",
    "#endif",
    "#ifdef USE_UV2",
    "	attribute vec2 uv2;",
    "#endif",
    "#ifdef USE_UV3",
    "	attribute vec2 uv3;",
    "#endif",
    "#ifdef USE_TANGENT",
    "	attribute vec4 tangent;",
    "#endif",
    "#if defined( USE_COLOR_ALPHA )",
    "	attribute vec4 color;",
    "#elif defined( USE_COLOR )",
    "	attribute vec3 color;",
    "#endif",
    "#ifdef USE_SKINNING",
    "	attribute vec4 skinIndex;",
    "	attribute vec4 skinWeight;",
    "#endif",
    `
`
  ].filter(Wi).join(`
`), p = [
    cl(t),
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g,
    t.useFog && t.fog ? "#define USE_FOG" : "",
    t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "",
    t.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
    t.map ? "#define USE_MAP" : "",
    t.matcap ? "#define USE_MATCAP" : "",
    t.envMap ? "#define USE_ENVMAP" : "",
    t.envMap ? "#define " + c : "",
    t.envMap ? "#define " + h : "",
    t.envMap ? "#define " + d : "",
    u ? "#define CUBEUV_TEXEL_WIDTH " + u.texelWidth : "",
    u ? "#define CUBEUV_TEXEL_HEIGHT " + u.texelHeight : "",
    u ? "#define CUBEUV_MAX_MIP " + u.maxMip + ".0" : "",
    t.lightMap ? "#define USE_LIGHTMAP" : "",
    t.aoMap ? "#define USE_AOMAP" : "",
    t.bumpMap ? "#define USE_BUMPMAP" : "",
    t.normalMap ? "#define USE_NORMALMAP" : "",
    t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    t.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    t.anisotropy ? "#define USE_ANISOTROPY" : "",
    t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    t.clearcoat ? "#define USE_CLEARCOAT" : "",
    t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    t.dispersion ? "#define USE_DISPERSION" : "",
    t.iridescence ? "#define USE_IRIDESCENCE" : "",
    t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    t.specularMap ? "#define USE_SPECULARMAP" : "",
    t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    t.metalnessMap ? "#define USE_METALNESSMAP" : "",
    t.alphaMap ? "#define USE_ALPHAMAP" : "",
    t.alphaTest ? "#define USE_ALPHATEST" : "",
    t.alphaHash ? "#define USE_ALPHAHASH" : "",
    t.sheen ? "#define USE_SHEEN" : "",
    t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    t.transmission ? "#define USE_TRANSMISSION" : "",
    t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    t.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    t.vertexTangents && t.flatShading === !1 ? "#define USE_TANGENT" : "",
    t.vertexColors || t.instancingColor || t.batchingColor ? "#define USE_COLOR" : "",
    t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    t.vertexUv1s ? "#define USE_UV1" : "",
    t.vertexUv2s ? "#define USE_UV2" : "",
    t.vertexUv3s ? "#define USE_UV3" : "",
    t.pointsUvs ? "#define USE_POINTS_UV" : "",
    t.gradientMap ? "#define USE_GRADIENTMAP" : "",
    t.flatShading ? "#define FLAT_SHADED" : "",
    t.doubleSided ? "#define DOUBLE_SIDED" : "",
    t.flipSided ? "#define FLIP_SIDED" : "",
    t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    t.shadowMapEnabled ? "#define " + l : "",
    t.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
    t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    t.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
    t.decodeVideoTextureEmissive ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE" : "",
    t.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
    t.reverseDepthBuffer ? "#define USE_REVERSEDEPTHBUF" : "",
    "uniform mat4 viewMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    t.toneMapping !== In ? "#define TONE_MAPPING" : "",
    t.toneMapping !== In ? Ne.tonemapping_pars_fragment : "",
    t.toneMapping !== In ? s_("toneMapping", t.toneMapping) : "",
    t.dithering ? "#define DITHERING" : "",
    t.opaque ? "#define OPAQUE" : "",
    Ne.colorspace_pars_fragment,
    i_("linearToOutputTexel", t.outputColorSpace),
    r_(),
    t.useDepthPacking ? "#define DEPTH_PACKING " + t.depthPacking : "",
    `
`
  ].filter(Wi).join(`
`)), o = Mo(o), o = ol(o, t), o = al(o, t), a = Mo(a), a = ol(a, t), a = al(a, t), o = ll(o), a = ll(a), t.isRawShaderMaterial !== !0 && (v = `#version 300 es
`, f = [
    m,
    "#define attribute in",
    "#define varying out",
    "#define texture2D texture"
  ].join(`
`) + `
` + f, p = [
    "#define varying in",
    t.glslVersion === xa ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
    t.glslVersion === xa ? "" : "#define gl_FragColor pc_fragColor",
    "#define gl_FragDepthEXT gl_FragDepth",
    "#define texture2D texture",
    "#define textureCube texture",
    "#define texture2DProj textureProj",
    "#define texture2DLodEXT textureLod",
    "#define texture2DProjLodEXT textureProjLod",
    "#define textureCubeLodEXT textureLod",
    "#define texture2DGradEXT textureGrad",
    "#define texture2DProjGradEXT textureProjGrad",
    "#define textureCubeGradEXT textureGrad"
  ].join(`
`) + `
` + p);
  const M = v + f + o, x = v + p + a, A = il(i, i.VERTEX_SHADER, M), T = il(i, i.FRAGMENT_SHADER, x);
  i.attachShader(_, A), i.attachShader(_, T), t.index0AttributeName !== void 0 ? i.bindAttribLocation(_, 0, t.index0AttributeName) : t.morphTargets === !0 && i.bindAttribLocation(_, 0, "position"), i.linkProgram(_);
  function C(P) {
    if (r.debug.checkShaderErrors) {
      const B = i.getProgramInfoLog(_).trim(), L = i.getShaderInfoLog(A).trim(), U = i.getShaderInfoLog(T).trim();
      let O = !0, F = !0;
      if (i.getProgramParameter(_, i.LINK_STATUS) === !1)
        if (O = !1, typeof r.debug.onShaderError == "function")
          r.debug.onShaderError(i, _, A, T);
        else {
          const K = rl(i, A, "vertex"), V = rl(i, T, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " + i.getError() + " - VALIDATE_STATUS " + i.getProgramParameter(_, i.VALIDATE_STATUS) + `

Material Name: ` + P.name + `
Material Type: ` + P.type + `

Program Info Log: ` + B + `
` + K + `
` + V
          );
        }
      else
        B !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", B) : (L === "" || U === "") && (F = !1);
      F && (P.diagnostics = {
        runnable: O,
        programLog: B,
        vertexShader: {
          log: L,
          prefix: f
        },
        fragmentShader: {
          log: U,
          prefix: p
        }
      });
    }
    i.deleteShader(A), i.deleteShader(T), D = new Bs(i, _), b = l_(i, _);
  }
  let D;
  this.getUniforms = function() {
    return D === void 0 && C(this), D;
  };
  let b;
  this.getAttributes = function() {
    return b === void 0 && C(this), b;
  };
  let y = t.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return y === !1 && (y = i.getProgramParameter(_, Qg)), y;
  }, this.destroy = function() {
    n.releaseStatesOfProgram(this), i.deleteProgram(_), this.program = void 0;
  }, this.type = t.shaderType, this.name = t.shaderName, this.id = e_++, this.cacheKey = e, this.usedTimes = 1, this.program = _, this.vertexShader = A, this.fragmentShader = T, this;
}
let y_ = 0;
class M_ {
  constructor() {
    this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
  }
  update(e) {
    const t = e.vertexShader, n = e.fragmentShader, i = this._getShaderStage(t), s = this._getShaderStage(n), o = this._getShaderCacheForMaterial(e);
    return o.has(i) === !1 && (o.add(i), i.usedTimes++), o.has(s) === !1 && (o.add(s), s.usedTimes++), this;
  }
  remove(e) {
    const t = this.materialCache.get(e);
    for (const n of t)
      n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
    return this.materialCache.delete(e), this;
  }
  getVertexShaderID(e) {
    return this._getShaderStage(e.vertexShader).id;
  }
  getFragmentShaderID(e) {
    return this._getShaderStage(e.fragmentShader).id;
  }
  dispose() {
    this.shaderCache.clear(), this.materialCache.clear();
  }
  _getShaderCacheForMaterial(e) {
    const t = this.materialCache;
    let n = t.get(e);
    return n === void 0 && (n = /* @__PURE__ */ new Set(), t.set(e, n)), n;
  }
  _getShaderStage(e) {
    const t = this.shaderCache;
    let n = t.get(e);
    return n === void 0 && (n = new S_(e), t.set(e, n)), n;
  }
}
class S_ {
  constructor(e) {
    this.id = y_++, this.code = e, this.usedTimes = 0;
  }
}
function E_(r, e, t, n, i, s, o) {
  const a = new No(), l = new M_(), c = /* @__PURE__ */ new Set(), h = [], d = i.logarithmicDepthBuffer, u = i.vertexTextures;
  let m = i.precision;
  const g = {
    MeshDepthMaterial: "depth",
    MeshDistanceMaterial: "distanceRGBA",
    MeshNormalMaterial: "normal",
    MeshBasicMaterial: "basic",
    MeshLambertMaterial: "lambert",
    MeshPhongMaterial: "phong",
    MeshToonMaterial: "toon",
    MeshStandardMaterial: "physical",
    MeshPhysicalMaterial: "physical",
    MeshMatcapMaterial: "matcap",
    LineBasicMaterial: "basic",
    LineDashedMaterial: "dashed",
    PointsMaterial: "points",
    ShadowMaterial: "shadow",
    SpriteMaterial: "sprite"
  };
  function _(b) {
    return c.add(b), b === 0 ? "uv" : `uv${b}`;
  }
  function f(b, y, P, B, L) {
    const U = B.fog, O = L.geometry, F = b.isMeshStandardMaterial ? B.environment : null, K = (b.isMeshStandardMaterial ? t : e).get(b.envMap || F), V = !!K && K.mapping === Xs ? K.image.height : null, $ = g[b.type];
    b.precision !== null && (m = i.getMaxPrecision(b.precision), m !== b.precision && console.warn("THREE.WebGLProgram.getParameters:", b.precision, "not supported, using", m, "instead."));
    const se = O.morphAttributes.position || O.morphAttributes.normal || O.morphAttributes.color, de = se !== void 0 ? se.length : 0;
    let ne = 0;
    O.morphAttributes.position !== void 0 && (ne = 1), O.morphAttributes.normal !== void 0 && (ne = 2), O.morphAttributes.color !== void 0 && (ne = 3);
    let ke, Y, ie, ge;
    if ($) {
      const Je = sn[$];
      ke = Je.vertexShader, Y = Je.fragmentShader;
    } else
      ke = b.vertexShader, Y = b.fragmentShader, l.update(b), ie = l.getVertexShaderID(b), ge = l.getFragmentShaderID(b);
    const ae = r.getRenderTarget(), we = r.state.buffers.depth.getReversed(), je = L.isInstancedMesh === !0, Re = L.isBatchedMesh === !0, ct = !!b.map, st = !!b.matcap, Ve = !!K, I = !!b.aoMap, Nt = !!b.lightMap, We = !!b.bumpMap, He = !!b.normalMap, Se = !!b.displacementMap, tt = !!b.emissiveMap, Me = !!b.metalnessMap, R = !!b.roughnessMap, E = b.anisotropy > 0, G = b.clearcoat > 0, Z = b.dispersion > 0, Q = b.iridescence > 0, j = b.sheen > 0, ye = b.transmission > 0, ce = E && !!b.anisotropyMap, Te = G && !!b.clearcoatMap, Ae = G && !!b.clearcoatNormalMap, ee = G && !!b.clearcoatRoughnessMap, _e = Q && !!b.iridescenceMap, Ce = Q && !!b.iridescenceThicknessMap, De = j && !!b.sheenColorMap, ve = j && !!b.sheenRoughnessMap, Ge = !!b.specularMap, Ue = !!b.specularColorMap, et = !!b.specularIntensityMap, N = ye && !!b.transmissionMap, he = ye && !!b.thicknessMap, q = !!b.gradientMap, J = !!b.alphaMap, fe = b.alphaTest > 0, ue = !!b.alphaHash, Fe = !!b.extensions;
    let ot = In;
    b.toneMapped && (ae === null || ae.isXRRenderTarget === !0) && (ot = r.toneMapping);
    const yt = {
      shaderID: $,
      shaderType: b.type,
      shaderName: b.name,
      vertexShader: ke,
      fragmentShader: Y,
      defines: b.defines,
      customVertexShaderID: ie,
      customFragmentShaderID: ge,
      isRawShaderMaterial: b.isRawShaderMaterial === !0,
      glslVersion: b.glslVersion,
      precision: m,
      batching: Re,
      batchingColor: Re && L._colorsTexture !== null,
      instancing: je,
      instancingColor: je && L.instanceColor !== null,
      instancingMorph: je && L.morphTexture !== null,
      supportsVertexTextures: u,
      outputColorSpace: ae === null ? r.outputColorSpace : ae.isXRRenderTarget === !0 ? ae.texture.colorSpace : Ri,
      alphaToCoverage: !!b.alphaToCoverage,
      map: ct,
      matcap: st,
      envMap: Ve,
      envMapMode: Ve && K.mapping,
      envMapCubeUVHeight: V,
      aoMap: I,
      lightMap: Nt,
      bumpMap: We,
      normalMap: He,
      displacementMap: u && Se,
      emissiveMap: tt,
      normalMapObjectSpace: He && b.normalMapType === dd,
      normalMapTangentSpace: He && b.normalMapType === Io,
      metalnessMap: Me,
      roughnessMap: R,
      anisotropy: E,
      anisotropyMap: ce,
      clearcoat: G,
      clearcoatMap: Te,
      clearcoatNormalMap: Ae,
      clearcoatRoughnessMap: ee,
      dispersion: Z,
      iridescence: Q,
      iridescenceMap: _e,
      iridescenceThicknessMap: Ce,
      sheen: j,
      sheenColorMap: De,
      sheenRoughnessMap: ve,
      specularMap: Ge,
      specularColorMap: Ue,
      specularIntensityMap: et,
      transmission: ye,
      transmissionMap: N,
      thicknessMap: he,
      gradientMap: q,
      opaque: b.transparent === !1 && b.blending === bi && b.alphaToCoverage === !1,
      alphaMap: J,
      alphaTest: fe,
      alphaHash: ue,
      combine: b.combine,
      mapUv: ct && _(b.map.channel),
      aoMapUv: I && _(b.aoMap.channel),
      lightMapUv: Nt && _(b.lightMap.channel),
      bumpMapUv: We && _(b.bumpMap.channel),
      normalMapUv: He && _(b.normalMap.channel),
      displacementMapUv: Se && _(b.displacementMap.channel),
      emissiveMapUv: tt && _(b.emissiveMap.channel),
      metalnessMapUv: Me && _(b.metalnessMap.channel),
      roughnessMapUv: R && _(b.roughnessMap.channel),
      anisotropyMapUv: ce && _(b.anisotropyMap.channel),
      clearcoatMapUv: Te && _(b.clearcoatMap.channel),
      clearcoatNormalMapUv: Ae && _(b.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: ee && _(b.clearcoatRoughnessMap.channel),
      iridescenceMapUv: _e && _(b.iridescenceMap.channel),
      iridescenceThicknessMapUv: Ce && _(b.iridescenceThicknessMap.channel),
      sheenColorMapUv: De && _(b.sheenColorMap.channel),
      sheenRoughnessMapUv: ve && _(b.sheenRoughnessMap.channel),
      specularMapUv: Ge && _(b.specularMap.channel),
      specularColorMapUv: Ue && _(b.specularColorMap.channel),
      specularIntensityMapUv: et && _(b.specularIntensityMap.channel),
      transmissionMapUv: N && _(b.transmissionMap.channel),
      thicknessMapUv: he && _(b.thicknessMap.channel),
      alphaMapUv: J && _(b.alphaMap.channel),
      vertexTangents: !!O.attributes.tangent && (He || E),
      vertexColors: b.vertexColors,
      vertexAlphas: b.vertexColors === !0 && !!O.attributes.color && O.attributes.color.itemSize === 4,
      pointsUvs: L.isPoints === !0 && !!O.attributes.uv && (ct || J),
      fog: !!U,
      useFog: b.fog === !0,
      fogExp2: !!U && U.isFogExp2,
      flatShading: b.flatShading === !0,
      sizeAttenuation: b.sizeAttenuation === !0,
      logarithmicDepthBuffer: d,
      reverseDepthBuffer: we,
      skinning: L.isSkinnedMesh === !0,
      morphTargets: O.morphAttributes.position !== void 0,
      morphNormals: O.morphAttributes.normal !== void 0,
      morphColors: O.morphAttributes.color !== void 0,
      morphTargetsCount: de,
      morphTextureStride: ne,
      numDirLights: y.directional.length,
      numPointLights: y.point.length,
      numSpotLights: y.spot.length,
      numSpotLightMaps: y.spotLightMap.length,
      numRectAreaLights: y.rectArea.length,
      numHemiLights: y.hemi.length,
      numDirLightShadows: y.directionalShadowMap.length,
      numPointLightShadows: y.pointShadowMap.length,
      numSpotLightShadows: y.spotShadowMap.length,
      numSpotLightShadowsWithMaps: y.numSpotLightShadowsWithMaps,
      numLightProbes: y.numLightProbes,
      numClippingPlanes: o.numPlanes,
      numClipIntersection: o.numIntersection,
      dithering: b.dithering,
      shadowMapEnabled: r.shadowMap.enabled && P.length > 0,
      shadowMapType: r.shadowMap.type,
      toneMapping: ot,
      decodeVideoTexture: ct && b.map.isVideoTexture === !0 && Ye.getTransfer(b.map.colorSpace) === Qe,
      decodeVideoTextureEmissive: tt && b.emissiveMap.isVideoTexture === !0 && Ye.getTransfer(b.emissiveMap.colorSpace) === Qe,
      premultipliedAlpha: b.premultipliedAlpha,
      doubleSided: b.side === Mn,
      flipSided: b.side === Pt,
      useDepthPacking: b.depthPacking >= 0,
      depthPacking: b.depthPacking || 0,
      index0AttributeName: b.index0AttributeName,
      extensionClipCullDistance: Fe && b.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: (Fe && b.extensions.multiDraw === !0 || Re) && n.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: b.customProgramCacheKey()
    };
    return yt.vertexUv1s = c.has(1), yt.vertexUv2s = c.has(2), yt.vertexUv3s = c.has(3), c.clear(), yt;
  }
  function p(b) {
    const y = [];
    if (b.shaderID ? y.push(b.shaderID) : (y.push(b.customVertexShaderID), y.push(b.customFragmentShaderID)), b.defines !== void 0)
      for (const P in b.defines)
        y.push(P), y.push(b.defines[P]);
    return b.isRawShaderMaterial === !1 && (v(y, b), M(y, b), y.push(r.outputColorSpace)), y.push(b.customProgramCacheKey), y.join();
  }
  function v(b, y) {
    b.push(y.precision), b.push(y.outputColorSpace), b.push(y.envMapMode), b.push(y.envMapCubeUVHeight), b.push(y.mapUv), b.push(y.alphaMapUv), b.push(y.lightMapUv), b.push(y.aoMapUv), b.push(y.bumpMapUv), b.push(y.normalMapUv), b.push(y.displacementMapUv), b.push(y.emissiveMapUv), b.push(y.metalnessMapUv), b.push(y.roughnessMapUv), b.push(y.anisotropyMapUv), b.push(y.clearcoatMapUv), b.push(y.clearcoatNormalMapUv), b.push(y.clearcoatRoughnessMapUv), b.push(y.iridescenceMapUv), b.push(y.iridescenceThicknessMapUv), b.push(y.sheenColorMapUv), b.push(y.sheenRoughnessMapUv), b.push(y.specularMapUv), b.push(y.specularColorMapUv), b.push(y.specularIntensityMapUv), b.push(y.transmissionMapUv), b.push(y.thicknessMapUv), b.push(y.combine), b.push(y.fogExp2), b.push(y.sizeAttenuation), b.push(y.morphTargetsCount), b.push(y.morphAttributeCount), b.push(y.numDirLights), b.push(y.numPointLights), b.push(y.numSpotLights), b.push(y.numSpotLightMaps), b.push(y.numHemiLights), b.push(y.numRectAreaLights), b.push(y.numDirLightShadows), b.push(y.numPointLightShadows), b.push(y.numSpotLightShadows), b.push(y.numSpotLightShadowsWithMaps), b.push(y.numLightProbes), b.push(y.shadowMapType), b.push(y.toneMapping), b.push(y.numClippingPlanes), b.push(y.numClipIntersection), b.push(y.depthPacking);
  }
  function M(b, y) {
    a.disableAll(), y.supportsVertexTextures && a.enable(0), y.instancing && a.enable(1), y.instancingColor && a.enable(2), y.instancingMorph && a.enable(3), y.matcap && a.enable(4), y.envMap && a.enable(5), y.normalMapObjectSpace && a.enable(6), y.normalMapTangentSpace && a.enable(7), y.clearcoat && a.enable(8), y.iridescence && a.enable(9), y.alphaTest && a.enable(10), y.vertexColors && a.enable(11), y.vertexAlphas && a.enable(12), y.vertexUv1s && a.enable(13), y.vertexUv2s && a.enable(14), y.vertexUv3s && a.enable(15), y.vertexTangents && a.enable(16), y.anisotropy && a.enable(17), y.alphaHash && a.enable(18), y.batching && a.enable(19), y.dispersion && a.enable(20), y.batchingColor && a.enable(21), b.push(a.mask), a.disableAll(), y.fog && a.enable(0), y.useFog && a.enable(1), y.flatShading && a.enable(2), y.logarithmicDepthBuffer && a.enable(3), y.reverseDepthBuffer && a.enable(4), y.skinning && a.enable(5), y.morphTargets && a.enable(6), y.morphNormals && a.enable(7), y.morphColors && a.enable(8), y.premultipliedAlpha && a.enable(9), y.shadowMapEnabled && a.enable(10), y.doubleSided && a.enable(11), y.flipSided && a.enable(12), y.useDepthPacking && a.enable(13), y.dithering && a.enable(14), y.transmission && a.enable(15), y.sheen && a.enable(16), y.opaque && a.enable(17), y.pointsUvs && a.enable(18), y.decodeVideoTexture && a.enable(19), y.decodeVideoTextureEmissive && a.enable(20), y.alphaToCoverage && a.enable(21), b.push(a.mask);
  }
  function x(b) {
    const y = g[b.type];
    let P;
    if (y) {
      const B = sn[y];
      P = Gd.clone(B.uniforms);
    } else
      P = b.uniforms;
    return P;
  }
  function A(b, y) {
    let P;
    for (let B = 0, L = h.length; B < L; B++) {
      const U = h[B];
      if (U.cacheKey === y) {
        P = U, ++P.usedTimes;
        break;
      }
    }
    return P === void 0 && (P = new x_(r, y, b, s), h.push(P)), P;
  }
  function T(b) {
    if (--b.usedTimes === 0) {
      const y = h.indexOf(b);
      h[y] = h[h.length - 1], h.pop(), b.destroy();
    }
  }
  function C(b) {
    l.remove(b);
  }
  function D() {
    l.dispose();
  }
  return {
    getParameters: f,
    getProgramCacheKey: p,
    getUniforms: x,
    acquireProgram: A,
    releaseProgram: T,
    releaseShaderCache: C,
    programs: h,
    dispose: D
  };
}
function b_() {
  let r = /* @__PURE__ */ new WeakMap();
  function e(o) {
    return r.has(o);
  }
  function t(o) {
    let a = r.get(o);
    return a === void 0 && (a = {}, r.set(o, a)), a;
  }
  function n(o) {
    r.delete(o);
  }
  function i(o, a, l) {
    r.get(o)[a] = l;
  }
  function s() {
    r = /* @__PURE__ */ new WeakMap();
  }
  return {
    has: e,
    get: t,
    remove: n,
    update: i,
    dispose: s
  };
}
function w_(r, e) {
  return r.groupOrder !== e.groupOrder ? r.groupOrder - e.groupOrder : r.renderOrder !== e.renderOrder ? r.renderOrder - e.renderOrder : r.material.id !== e.material.id ? r.material.id - e.material.id : r.z !== e.z ? r.z - e.z : r.id - e.id;
}
function hl(r, e) {
  return r.groupOrder !== e.groupOrder ? r.groupOrder - e.groupOrder : r.renderOrder !== e.renderOrder ? r.renderOrder - e.renderOrder : r.z !== e.z ? e.z - r.z : r.id - e.id;
}
function ul() {
  const r = [];
  let e = 0;
  const t = [], n = [], i = [];
  function s() {
    e = 0, t.length = 0, n.length = 0, i.length = 0;
  }
  function o(d, u, m, g, _, f) {
    let p = r[e];
    return p === void 0 ? (p = {
      id: d.id,
      object: d,
      geometry: u,
      material: m,
      groupOrder: g,
      renderOrder: d.renderOrder,
      z: _,
      group: f
    }, r[e] = p) : (p.id = d.id, p.object = d, p.geometry = u, p.material = m, p.groupOrder = g, p.renderOrder = d.renderOrder, p.z = _, p.group = f), e++, p;
  }
  function a(d, u, m, g, _, f) {
    const p = o(d, u, m, g, _, f);
    m.transmission > 0 ? n.push(p) : m.transparent === !0 ? i.push(p) : t.push(p);
  }
  function l(d, u, m, g, _, f) {
    const p = o(d, u, m, g, _, f);
    m.transmission > 0 ? n.unshift(p) : m.transparent === !0 ? i.unshift(p) : t.unshift(p);
  }
  function c(d, u) {
    t.length > 1 && t.sort(d || w_), n.length > 1 && n.sort(u || hl), i.length > 1 && i.sort(u || hl);
  }
  function h() {
    for (let d = e, u = r.length; d < u; d++) {
      const m = r[d];
      if (m.id === null)
        break;
      m.id = null, m.object = null, m.geometry = null, m.material = null, m.group = null;
    }
  }
  return {
    opaque: t,
    transmissive: n,
    transparent: i,
    init: s,
    push: a,
    unshift: l,
    finish: h,
    sort: c
  };
}
function T_() {
  let r = /* @__PURE__ */ new WeakMap();
  function e(n, i) {
    const s = r.get(n);
    let o;
    return s === void 0 ? (o = new ul(), r.set(n, [o])) : i >= s.length ? (o = new ul(), s.push(o)) : o = s[i], o;
  }
  function t() {
    r = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: e,
    dispose: t
  };
}
function A_() {
  const r = {};
  return {
    get: function(e) {
      if (r[e.id] !== void 0)
        return r[e.id];
      let t;
      switch (e.type) {
        case "DirectionalLight":
          t = {
            direction: new H(),
            color: new Oe()
          };
          break;
        case "SpotLight":
          t = {
            position: new H(),
            direction: new H(),
            color: new Oe(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          t = {
            position: new H(),
            color: new Oe(),
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          t = {
            direction: new H(),
            skyColor: new Oe(),
            groundColor: new Oe()
          };
          break;
        case "RectAreaLight":
          t = {
            color: new Oe(),
            position: new H(),
            halfWidth: new H(),
            halfHeight: new H()
          };
          break;
      }
      return r[e.id] = t, t;
    }
  };
}
function C_() {
  const r = {};
  return {
    get: function(e) {
      if (r[e.id] !== void 0)
        return r[e.id];
      let t;
      switch (e.type) {
        case "DirectionalLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new ze()
          };
          break;
        case "SpotLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new ze()
          };
          break;
        case "PointLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new ze(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3
          };
          break;
      }
      return r[e.id] = t, t;
    }
  };
}
let R_ = 0;
function P_(r, e) {
  return (e.castShadow ? 2 : 0) - (r.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (r.map ? 1 : 0);
}
function D_(r) {
  const e = new A_(), t = C_(), n = {
    version: 0,
    hash: {
      directionalLength: -1,
      pointLength: -1,
      spotLength: -1,
      rectAreaLength: -1,
      hemiLength: -1,
      numDirectionalShadows: -1,
      numPointShadows: -1,
      numSpotShadows: -1,
      numSpotMaps: -1,
      numLightProbes: -1
    },
    ambient: [0, 0, 0],
    probe: [],
    directional: [],
    directionalShadow: [],
    directionalShadowMap: [],
    directionalShadowMatrix: [],
    spot: [],
    spotLightMap: [],
    spotShadow: [],
    spotShadowMap: [],
    spotLightMatrix: [],
    rectArea: [],
    rectAreaLTC1: null,
    rectAreaLTC2: null,
    point: [],
    pointShadow: [],
    pointShadowMap: [],
    pointShadowMatrix: [],
    hemi: [],
    numSpotLightShadowsWithMaps: 0,
    numLightProbes: 0
  };
  for (let c = 0; c < 9; c++)
    n.probe.push(new H());
  const i = new H(), s = new rt(), o = new rt();
  function a(c) {
    let h = 0, d = 0, u = 0;
    for (let b = 0; b < 9; b++)
      n.probe[b].set(0, 0, 0);
    let m = 0, g = 0, _ = 0, f = 0, p = 0, v = 0, M = 0, x = 0, A = 0, T = 0, C = 0;
    c.sort(P_);
    for (let b = 0, y = c.length; b < y; b++) {
      const P = c[b], B = P.color, L = P.intensity, U = P.distance, O = P.shadow && P.shadow.map ? P.shadow.map.texture : null;
      if (P.isAmbientLight)
        h += B.r * L, d += B.g * L, u += B.b * L;
      else if (P.isLightProbe) {
        for (let F = 0; F < 9; F++)
          n.probe[F].addScaledVector(P.sh.coefficients[F], L);
        C++;
      } else if (P.isDirectionalLight) {
        const F = e.get(P);
        if (F.color.copy(P.color).multiplyScalar(P.intensity), P.castShadow) {
          const K = P.shadow, V = t.get(P);
          V.shadowIntensity = K.intensity, V.shadowBias = K.bias, V.shadowNormalBias = K.normalBias, V.shadowRadius = K.radius, V.shadowMapSize = K.mapSize, n.directionalShadow[m] = V, n.directionalShadowMap[m] = O, n.directionalShadowMatrix[m] = P.shadow.matrix, v++;
        }
        n.directional[m] = F, m++;
      } else if (P.isSpotLight) {
        const F = e.get(P);
        F.position.setFromMatrixPosition(P.matrixWorld), F.color.copy(B).multiplyScalar(L), F.distance = U, F.coneCos = Math.cos(P.angle), F.penumbraCos = Math.cos(P.angle * (1 - P.penumbra)), F.decay = P.decay, n.spot[_] = F;
        const K = P.shadow;
        if (P.map && (n.spotLightMap[A] = P.map, A++, K.updateMatrices(P), P.castShadow && T++), n.spotLightMatrix[_] = K.matrix, P.castShadow) {
          const V = t.get(P);
          V.shadowIntensity = K.intensity, V.shadowBias = K.bias, V.shadowNormalBias = K.normalBias, V.shadowRadius = K.radius, V.shadowMapSize = K.mapSize, n.spotShadow[_] = V, n.spotShadowMap[_] = O, x++;
        }
        _++;
      } else if (P.isRectAreaLight) {
        const F = e.get(P);
        F.color.copy(B).multiplyScalar(L), F.halfWidth.set(P.width * 0.5, 0, 0), F.halfHeight.set(0, P.height * 0.5, 0), n.rectArea[f] = F, f++;
      } else if (P.isPointLight) {
        const F = e.get(P);
        if (F.color.copy(P.color).multiplyScalar(P.intensity), F.distance = P.distance, F.decay = P.decay, P.castShadow) {
          const K = P.shadow, V = t.get(P);
          V.shadowIntensity = K.intensity, V.shadowBias = K.bias, V.shadowNormalBias = K.normalBias, V.shadowRadius = K.radius, V.shadowMapSize = K.mapSize, V.shadowCameraNear = K.camera.near, V.shadowCameraFar = K.camera.far, n.pointShadow[g] = V, n.pointShadowMap[g] = O, n.pointShadowMatrix[g] = P.shadow.matrix, M++;
        }
        n.point[g] = F, g++;
      } else if (P.isHemisphereLight) {
        const F = e.get(P);
        F.skyColor.copy(P.color).multiplyScalar(L), F.groundColor.copy(P.groundColor).multiplyScalar(L), n.hemi[p] = F, p++;
      }
    }
    f > 0 && (r.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = re.LTC_FLOAT_1, n.rectAreaLTC2 = re.LTC_FLOAT_2) : (n.rectAreaLTC1 = re.LTC_HALF_1, n.rectAreaLTC2 = re.LTC_HALF_2)), n.ambient[0] = h, n.ambient[1] = d, n.ambient[2] = u;
    const D = n.hash;
    (D.directionalLength !== m || D.pointLength !== g || D.spotLength !== _ || D.rectAreaLength !== f || D.hemiLength !== p || D.numDirectionalShadows !== v || D.numPointShadows !== M || D.numSpotShadows !== x || D.numSpotMaps !== A || D.numLightProbes !== C) && (n.directional.length = m, n.spot.length = _, n.rectArea.length = f, n.point.length = g, n.hemi.length = p, n.directionalShadow.length = v, n.directionalShadowMap.length = v, n.pointShadow.length = M, n.pointShadowMap.length = M, n.spotShadow.length = x, n.spotShadowMap.length = x, n.directionalShadowMatrix.length = v, n.pointShadowMatrix.length = M, n.spotLightMatrix.length = x + A - T, n.spotLightMap.length = A, n.numSpotLightShadowsWithMaps = T, n.numLightProbes = C, D.directionalLength = m, D.pointLength = g, D.spotLength = _, D.rectAreaLength = f, D.hemiLength = p, D.numDirectionalShadows = v, D.numPointShadows = M, D.numSpotShadows = x, D.numSpotMaps = A, D.numLightProbes = C, n.version = R_++);
  }
  function l(c, h) {
    let d = 0, u = 0, m = 0, g = 0, _ = 0;
    const f = h.matrixWorldInverse;
    for (let p = 0, v = c.length; p < v; p++) {
      const M = c[p];
      if (M.isDirectionalLight) {
        const x = n.directional[d];
        x.direction.setFromMatrixPosition(M.matrixWorld), i.setFromMatrixPosition(M.target.matrixWorld), x.direction.sub(i), x.direction.transformDirection(f), d++;
      } else if (M.isSpotLight) {
        const x = n.spot[m];
        x.position.setFromMatrixPosition(M.matrixWorld), x.position.applyMatrix4(f), x.direction.setFromMatrixPosition(M.matrixWorld), i.setFromMatrixPosition(M.target.matrixWorld), x.direction.sub(i), x.direction.transformDirection(f), m++;
      } else if (M.isRectAreaLight) {
        const x = n.rectArea[g];
        x.position.setFromMatrixPosition(M.matrixWorld), x.position.applyMatrix4(f), o.identity(), s.copy(M.matrixWorld), s.premultiply(f), o.extractRotation(s), x.halfWidth.set(M.width * 0.5, 0, 0), x.halfHeight.set(0, M.height * 0.5, 0), x.halfWidth.applyMatrix4(o), x.halfHeight.applyMatrix4(o), g++;
      } else if (M.isPointLight) {
        const x = n.point[u];
        x.position.setFromMatrixPosition(M.matrixWorld), x.position.applyMatrix4(f), u++;
      } else if (M.isHemisphereLight) {
        const x = n.hemi[_];
        x.direction.setFromMatrixPosition(M.matrixWorld), x.direction.transformDirection(f), _++;
      }
    }
  }
  return {
    setup: a,
    setupView: l,
    state: n
  };
}
function dl(r) {
  const e = new D_(r), t = [], n = [];
  function i(h) {
    c.camera = h, t.length = 0, n.length = 0;
  }
  function s(h) {
    t.push(h);
  }
  function o(h) {
    n.push(h);
  }
  function a() {
    e.setup(t);
  }
  function l(h) {
    e.setupView(t, h);
  }
  const c = {
    lightsArray: t,
    shadowsArray: n,
    camera: null,
    lights: e,
    transmissionRenderTarget: {}
  };
  return {
    init: i,
    state: c,
    setupLights: a,
    setupLightsView: l,
    pushLight: s,
    pushShadow: o
  };
}
function L_(r) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(i, s = 0) {
    const o = e.get(i);
    let a;
    return o === void 0 ? (a = new dl(r), e.set(i, [a])) : s >= o.length ? (a = new dl(r), o.push(a)) : a = o[s], a;
  }
  function n() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: n
  };
}
const F_ = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, I_ = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;
function U_(r, e, t) {
  let n = new Oo();
  const i = new ze(), s = new ze(), o = new lt(), a = new tf({ depthPacking: ud }), l = new nf(), c = {}, h = t.maxTextureSize, d = { [Un]: Pt, [Pt]: Un, [Mn]: Mn }, u = new Nn({
    defines: {
      VSM_SAMPLES: 8
    },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new ze() },
      radius: { value: 4 }
    },
    vertexShader: F_,
    fragmentShader: I_
  }), m = u.clone();
  m.defines.HORIZONTAL_PASS = 1;
  const g = new ln();
  g.setAttribute(
    "position",
    new on(
      new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
      3
    )
  );
  const _ = new $t(g, u), f = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = bl;
  let p = this.type;
  this.render = function(T, C, D) {
    if (f.enabled === !1 || f.autoUpdate === !1 && f.needsUpdate === !1 || T.length === 0)
      return;
    const b = r.getRenderTarget(), y = r.getActiveCubeFace(), P = r.getActiveMipmapLevel(), B = r.state;
    B.setBlending(Fn), B.buffers.color.setClear(1, 1, 1, 1), B.buffers.depth.setTest(!0), B.setScissorTest(!1);
    const L = p !== yn && this.type === yn, U = p === yn && this.type !== yn;
    for (let O = 0, F = T.length; O < F; O++) {
      const K = T[O], V = K.shadow;
      if (V === void 0) {
        console.warn("THREE.WebGLShadowMap:", K, "has no shadow.");
        continue;
      }
      if (V.autoUpdate === !1 && V.needsUpdate === !1)
        continue;
      i.copy(V.mapSize);
      const $ = V.getFrameExtents();
      if (i.multiply($), s.copy(V.mapSize), (i.x > h || i.y > h) && (i.x > h && (s.x = Math.floor(h / $.x), i.x = s.x * $.x, V.mapSize.x = s.x), i.y > h && (s.y = Math.floor(h / $.y), i.y = s.y * $.y, V.mapSize.y = s.y)), V.map === null || L === !0 || U === !0) {
        const de = this.type !== yn ? { minFilter: Jt, magFilter: Jt } : {};
        V.map !== null && V.map.dispose(), V.map = new ii(i.x, i.y, de), V.map.texture.name = K.name + ".shadowMap", V.camera.updateProjectionMatrix();
      }
      r.setRenderTarget(V.map), r.clear();
      const se = V.getViewportCount();
      for (let de = 0; de < se; de++) {
        const ne = V.getViewport(de);
        o.set(
          s.x * ne.x,
          s.y * ne.y,
          s.x * ne.z,
          s.y * ne.w
        ), B.viewport(o), V.updateMatrices(K, de), n = V.getFrustum(), x(C, D, V.camera, K, this.type);
      }
      V.isPointLightShadow !== !0 && this.type === yn && v(V, D), V.needsUpdate = !1;
    }
    p = this.type, f.needsUpdate = !1, r.setRenderTarget(b, y, P);
  };
  function v(T, C) {
    const D = e.update(_);
    u.defines.VSM_SAMPLES !== T.blurSamples && (u.defines.VSM_SAMPLES = T.blurSamples, m.defines.VSM_SAMPLES = T.blurSamples, u.needsUpdate = !0, m.needsUpdate = !0), T.mapPass === null && (T.mapPass = new ii(i.x, i.y)), u.uniforms.shadow_pass.value = T.map.texture, u.uniforms.resolution.value = T.mapSize, u.uniforms.radius.value = T.radius, r.setRenderTarget(T.mapPass), r.clear(), r.renderBufferDirect(C, null, D, u, _, null), m.uniforms.shadow_pass.value = T.mapPass.texture, m.uniforms.resolution.value = T.mapSize, m.uniforms.radius.value = T.radius, r.setRenderTarget(T.map), r.clear(), r.renderBufferDirect(C, null, D, m, _, null);
  }
  function M(T, C, D, b) {
    let y = null;
    const P = D.isPointLight === !0 ? T.customDistanceMaterial : T.customDepthMaterial;
    if (P !== void 0)
      y = P;
    else if (y = D.isPointLight === !0 ? l : a, r.localClippingEnabled && C.clipShadows === !0 && Array.isArray(C.clippingPlanes) && C.clippingPlanes.length !== 0 || C.displacementMap && C.displacementScale !== 0 || C.alphaMap && C.alphaTest > 0 || C.map && C.alphaTest > 0 || C.alphaToCoverage === !0) {
      const B = y.uuid, L = C.uuid;
      let U = c[B];
      U === void 0 && (U = {}, c[B] = U);
      let O = U[L];
      O === void 0 && (O = y.clone(), U[L] = O, C.addEventListener("dispose", A)), y = O;
    }
    if (y.visible = C.visible, y.wireframe = C.wireframe, b === yn ? y.side = C.shadowSide !== null ? C.shadowSide : C.side : y.side = C.shadowSide !== null ? C.shadowSide : d[C.side], y.alphaMap = C.alphaMap, y.alphaTest = C.alphaToCoverage === !0 ? 0.5 : C.alphaTest, y.map = C.map, y.clipShadows = C.clipShadows, y.clippingPlanes = C.clippingPlanes, y.clipIntersection = C.clipIntersection, y.displacementMap = C.displacementMap, y.displacementScale = C.displacementScale, y.displacementBias = C.displacementBias, y.wireframeLinewidth = C.wireframeLinewidth, y.linewidth = C.linewidth, D.isPointLight === !0 && y.isMeshDistanceMaterial === !0) {
      const B = r.properties.get(y);
      B.light = D;
    }
    return y;
  }
  function x(T, C, D, b, y) {
    if (T.visible === !1)
      return;
    if (T.layers.test(C.layers) && (T.isMesh || T.isLine || T.isPoints) && (T.castShadow || T.receiveShadow && y === yn) && (!T.frustumCulled || n.intersectsObject(T))) {
      T.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse, T.matrixWorld);
      const L = e.update(T), U = T.material;
      if (Array.isArray(U)) {
        const O = L.groups;
        for (let F = 0, K = O.length; F < K; F++) {
          const V = O[F], $ = U[V.materialIndex];
          if ($ && $.visible) {
            const se = M(T, $, b, y);
            T.onBeforeShadow(r, T, C, D, L, se, V), r.renderBufferDirect(D, null, L, se, T, V), T.onAfterShadow(r, T, C, D, L, se, V);
          }
        }
      } else if (U.visible) {
        const O = M(T, U, b, y);
        T.onBeforeShadow(r, T, C, D, L, O, null), r.renderBufferDirect(D, null, L, O, T, null), T.onAfterShadow(r, T, C, D, L, O, null);
      }
    }
    const B = T.children;
    for (let L = 0, U = B.length; L < U; L++)
      x(B[L], C, D, b, y);
  }
  function A(T) {
    T.target.removeEventListener("dispose", A);
    for (const D in c) {
      const b = c[D], y = T.target.uuid;
      y in b && (b[y].dispose(), delete b[y]);
    }
  }
}
const N_ = {
  [Nr]: Or,
  [Br]: Vr,
  [zr]: Hr,
  [Ti]: kr,
  [Or]: Nr,
  [Vr]: Br,
  [Hr]: zr,
  [kr]: Ti
};
function O_(r, e) {
  function t() {
    let N = !1;
    const he = new lt();
    let q = null;
    const J = new lt(0, 0, 0, 0);
    return {
      setMask: function(fe) {
        q !== fe && !N && (r.colorMask(fe, fe, fe, fe), q = fe);
      },
      setLocked: function(fe) {
        N = fe;
      },
      setClear: function(fe, ue, Fe, ot, yt) {
        yt === !0 && (fe *= ot, ue *= ot, Fe *= ot), he.set(fe, ue, Fe, ot), J.equals(he) === !1 && (r.clearColor(fe, ue, Fe, ot), J.copy(he));
      },
      reset: function() {
        N = !1, q = null, J.set(-1, 0, 0, 0);
      }
    };
  }
  function n() {
    let N = !1, he = !1, q = null, J = null, fe = null;
    return {
      setReversed: function(ue) {
        if (he !== ue) {
          const Fe = e.get("EXT_clip_control");
          ue ? Fe.clipControlEXT(Fe.LOWER_LEFT_EXT, Fe.ZERO_TO_ONE_EXT) : Fe.clipControlEXT(Fe.LOWER_LEFT_EXT, Fe.NEGATIVE_ONE_TO_ONE_EXT), he = ue;
          const ot = fe;
          fe = null, this.setClear(ot);
        }
      },
      getReversed: function() {
        return he;
      },
      setTest: function(ue) {
        ue ? ae(r.DEPTH_TEST) : we(r.DEPTH_TEST);
      },
      setMask: function(ue) {
        q !== ue && !N && (r.depthMask(ue), q = ue);
      },
      setFunc: function(ue) {
        if (he && (ue = N_[ue]), J !== ue) {
          switch (ue) {
            case Nr:
              r.depthFunc(r.NEVER);
              break;
            case Or:
              r.depthFunc(r.ALWAYS);
              break;
            case Br:
              r.depthFunc(r.LESS);
              break;
            case Ti:
              r.depthFunc(r.LEQUAL);
              break;
            case zr:
              r.depthFunc(r.EQUAL);
              break;
            case kr:
              r.depthFunc(r.GEQUAL);
              break;
            case Vr:
              r.depthFunc(r.GREATER);
              break;
            case Hr:
              r.depthFunc(r.NOTEQUAL);
              break;
            default:
              r.depthFunc(r.LEQUAL);
          }
          J = ue;
        }
      },
      setLocked: function(ue) {
        N = ue;
      },
      setClear: function(ue) {
        fe !== ue && (he && (ue = 1 - ue), r.clearDepth(ue), fe = ue);
      },
      reset: function() {
        N = !1, q = null, J = null, fe = null, he = !1;
      }
    };
  }
  function i() {
    let N = !1, he = null, q = null, J = null, fe = null, ue = null, Fe = null, ot = null, yt = null;
    return {
      setTest: function(Je) {
        N || (Je ? ae(r.STENCIL_TEST) : we(r.STENCIL_TEST));
      },
      setMask: function(Je) {
        he !== Je && !N && (r.stencilMask(Je), he = Je);
      },
      setFunc: function(Je, Ht, cn) {
        (q !== Je || J !== Ht || fe !== cn) && (r.stencilFunc(Je, Ht, cn), q = Je, J = Ht, fe = cn);
      },
      setOp: function(Je, Ht, cn) {
        (ue !== Je || Fe !== Ht || ot !== cn) && (r.stencilOp(Je, Ht, cn), ue = Je, Fe = Ht, ot = cn);
      },
      setLocked: function(Je) {
        N = Je;
      },
      setClear: function(Je) {
        yt !== Je && (r.clearStencil(Je), yt = Je);
      },
      reset: function() {
        N = !1, he = null, q = null, J = null, fe = null, ue = null, Fe = null, ot = null, yt = null;
      }
    };
  }
  const s = new t(), o = new n(), a = new i(), l = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap();
  let h = {}, d = {}, u = /* @__PURE__ */ new WeakMap(), m = [], g = null, _ = !1, f = null, p = null, v = null, M = null, x = null, A = null, T = null, C = new Oe(0, 0, 0), D = 0, b = !1, y = null, P = null, B = null, L = null, U = null;
  const O = r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let F = !1, K = 0;
  const V = r.getParameter(r.VERSION);
  V.indexOf("WebGL") !== -1 ? (K = parseFloat(/^WebGL (\d)/.exec(V)[1]), F = K >= 1) : V.indexOf("OpenGL ES") !== -1 && (K = parseFloat(/^OpenGL ES (\d)/.exec(V)[1]), F = K >= 2);
  let $ = null, se = {};
  const de = r.getParameter(r.SCISSOR_BOX), ne = r.getParameter(r.VIEWPORT), ke = new lt().fromArray(de), Y = new lt().fromArray(ne);
  function ie(N, he, q, J) {
    const fe = new Uint8Array(4), ue = r.createTexture();
    r.bindTexture(N, ue), r.texParameteri(N, r.TEXTURE_MIN_FILTER, r.NEAREST), r.texParameteri(N, r.TEXTURE_MAG_FILTER, r.NEAREST);
    for (let Fe = 0; Fe < q; Fe++)
      N === r.TEXTURE_3D || N === r.TEXTURE_2D_ARRAY ? r.texImage3D(he, 0, r.RGBA, 1, 1, J, 0, r.RGBA, r.UNSIGNED_BYTE, fe) : r.texImage2D(he + Fe, 0, r.RGBA, 1, 1, 0, r.RGBA, r.UNSIGNED_BYTE, fe);
    return ue;
  }
  const ge = {};
  ge[r.TEXTURE_2D] = ie(r.TEXTURE_2D, r.TEXTURE_2D, 1), ge[r.TEXTURE_CUBE_MAP] = ie(r.TEXTURE_CUBE_MAP, r.TEXTURE_CUBE_MAP_POSITIVE_X, 6), ge[r.TEXTURE_2D_ARRAY] = ie(r.TEXTURE_2D_ARRAY, r.TEXTURE_2D_ARRAY, 1, 1), ge[r.TEXTURE_3D] = ie(r.TEXTURE_3D, r.TEXTURE_3D, 1, 1), s.setClear(0, 0, 0, 1), o.setClear(1), a.setClear(0), ae(r.DEPTH_TEST), o.setFunc(Ti), We(!1), He(fa), ae(r.CULL_FACE), I(Fn);
  function ae(N) {
    h[N] !== !0 && (r.enable(N), h[N] = !0);
  }
  function we(N) {
    h[N] !== !1 && (r.disable(N), h[N] = !1);
  }
  function je(N, he) {
    return d[N] !== he ? (r.bindFramebuffer(N, he), d[N] = he, N === r.DRAW_FRAMEBUFFER && (d[r.FRAMEBUFFER] = he), N === r.FRAMEBUFFER && (d[r.DRAW_FRAMEBUFFER] = he), !0) : !1;
  }
  function Re(N, he) {
    let q = m, J = !1;
    if (N) {
      q = u.get(he), q === void 0 && (q = [], u.set(he, q));
      const fe = N.textures;
      if (q.length !== fe.length || q[0] !== r.COLOR_ATTACHMENT0) {
        for (let ue = 0, Fe = fe.length; ue < Fe; ue++)
          q[ue] = r.COLOR_ATTACHMENT0 + ue;
        q.length = fe.length, J = !0;
      }
    } else
      q[0] !== r.BACK && (q[0] = r.BACK, J = !0);
    J && r.drawBuffers(q);
  }
  function ct(N) {
    return g !== N ? (r.useProgram(N), g = N, !0) : !1;
  }
  const st = {
    [Kn]: r.FUNC_ADD,
    [Ou]: r.FUNC_SUBTRACT,
    [Bu]: r.FUNC_REVERSE_SUBTRACT
  };
  st[zu] = r.MIN, st[ku] = r.MAX;
  const Ve = {
    [Vu]: r.ZERO,
    [Hu]: r.ONE,
    [Gu]: r.SRC_COLOR,
    [Ir]: r.SRC_ALPHA,
    [Ku]: r.SRC_ALPHA_SATURATE,
    [Yu]: r.DST_COLOR,
    [Xu]: r.DST_ALPHA,
    [Wu]: r.ONE_MINUS_SRC_COLOR,
    [Ur]: r.ONE_MINUS_SRC_ALPHA,
    [ju]: r.ONE_MINUS_DST_COLOR,
    [qu]: r.ONE_MINUS_DST_ALPHA,
    [Zu]: r.CONSTANT_COLOR,
    [$u]: r.ONE_MINUS_CONSTANT_COLOR,
    [Ju]: r.CONSTANT_ALPHA,
    [Qu]: r.ONE_MINUS_CONSTANT_ALPHA
  };
  function I(N, he, q, J, fe, ue, Fe, ot, yt, Je) {
    if (N === Fn) {
      _ === !0 && (we(r.BLEND), _ = !1);
      return;
    }
    if (_ === !1 && (ae(r.BLEND), _ = !0), N !== Nu) {
      if (N !== f || Je !== b) {
        if ((p !== Kn || x !== Kn) && (r.blendEquation(r.FUNC_ADD), p = Kn, x = Kn), Je)
          switch (N) {
            case bi:
              r.blendFuncSeparate(r.ONE, r.ONE_MINUS_SRC_ALPHA, r.ONE, r.ONE_MINUS_SRC_ALPHA);
              break;
            case pa:
              r.blendFunc(r.ONE, r.ONE);
              break;
            case ma:
              r.blendFuncSeparate(r.ZERO, r.ONE_MINUS_SRC_COLOR, r.ZERO, r.ONE);
              break;
            case ga:
              r.blendFuncSeparate(r.ZERO, r.SRC_COLOR, r.ZERO, r.SRC_ALPHA);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", N);
              break;
          }
        else
          switch (N) {
            case bi:
              r.blendFuncSeparate(r.SRC_ALPHA, r.ONE_MINUS_SRC_ALPHA, r.ONE, r.ONE_MINUS_SRC_ALPHA);
              break;
            case pa:
              r.blendFunc(r.SRC_ALPHA, r.ONE);
              break;
            case ma:
              r.blendFuncSeparate(r.ZERO, r.ONE_MINUS_SRC_COLOR, r.ZERO, r.ONE);
              break;
            case ga:
              r.blendFunc(r.ZERO, r.SRC_COLOR);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", N);
              break;
          }
        v = null, M = null, A = null, T = null, C.set(0, 0, 0), D = 0, f = N, b = Je;
      }
      return;
    }
    fe = fe || he, ue = ue || q, Fe = Fe || J, (he !== p || fe !== x) && (r.blendEquationSeparate(st[he], st[fe]), p = he, x = fe), (q !== v || J !== M || ue !== A || Fe !== T) && (r.blendFuncSeparate(Ve[q], Ve[J], Ve[ue], Ve[Fe]), v = q, M = J, A = ue, T = Fe), (ot.equals(C) === !1 || yt !== D) && (r.blendColor(ot.r, ot.g, ot.b, yt), C.copy(ot), D = yt), f = N, b = !1;
  }
  function Nt(N, he) {
    N.side === Mn ? we(r.CULL_FACE) : ae(r.CULL_FACE);
    let q = N.side === Pt;
    he && (q = !q), We(q), N.blending === bi && N.transparent === !1 ? I(Fn) : I(N.blending, N.blendEquation, N.blendSrc, N.blendDst, N.blendEquationAlpha, N.blendSrcAlpha, N.blendDstAlpha, N.blendColor, N.blendAlpha, N.premultipliedAlpha), o.setFunc(N.depthFunc), o.setTest(N.depthTest), o.setMask(N.depthWrite), s.setMask(N.colorWrite);
    const J = N.stencilWrite;
    a.setTest(J), J && (a.setMask(N.stencilWriteMask), a.setFunc(N.stencilFunc, N.stencilRef, N.stencilFuncMask), a.setOp(N.stencilFail, N.stencilZFail, N.stencilZPass)), tt(N.polygonOffset, N.polygonOffsetFactor, N.polygonOffsetUnits), N.alphaToCoverage === !0 ? ae(r.SAMPLE_ALPHA_TO_COVERAGE) : we(r.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function We(N) {
    y !== N && (N ? r.frontFace(r.CW) : r.frontFace(r.CCW), y = N);
  }
  function He(N) {
    N !== Iu ? (ae(r.CULL_FACE), N !== P && (N === fa ? r.cullFace(r.BACK) : N === Uu ? r.cullFace(r.FRONT) : r.cullFace(r.FRONT_AND_BACK))) : we(r.CULL_FACE), P = N;
  }
  function Se(N) {
    N !== B && (F && r.lineWidth(N), B = N);
  }
  function tt(N, he, q) {
    N ? (ae(r.POLYGON_OFFSET_FILL), (L !== he || U !== q) && (r.polygonOffset(he, q), L = he, U = q)) : we(r.POLYGON_OFFSET_FILL);
  }
  function Me(N) {
    N ? ae(r.SCISSOR_TEST) : we(r.SCISSOR_TEST);
  }
  function R(N) {
    N === void 0 && (N = r.TEXTURE0 + O - 1), $ !== N && (r.activeTexture(N), $ = N);
  }
  function E(N, he, q) {
    q === void 0 && ($ === null ? q = r.TEXTURE0 + O - 1 : q = $);
    let J = se[q];
    J === void 0 && (J = { type: void 0, texture: void 0 }, se[q] = J), (J.type !== N || J.texture !== he) && ($ !== q && (r.activeTexture(q), $ = q), r.bindTexture(N, he || ge[N]), J.type = N, J.texture = he);
  }
  function G() {
    const N = se[$];
    N !== void 0 && N.type !== void 0 && (r.bindTexture(N.type, null), N.type = void 0, N.texture = void 0);
  }
  function Z() {
    try {
      r.compressedTexImage2D(...arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function Q() {
    try {
      r.compressedTexImage3D(...arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function j() {
    try {
      r.texSubImage2D(...arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function ye() {
    try {
      r.texSubImage3D(...arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function ce() {
    try {
      r.compressedTexSubImage2D(...arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function Te() {
    try {
      r.compressedTexSubImage3D(...arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function Ae() {
    try {
      r.texStorage2D(...arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function ee() {
    try {
      r.texStorage3D(...arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function _e() {
    try {
      r.texImage2D(...arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function Ce() {
    try {
      r.texImage3D(...arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function De(N) {
    ke.equals(N) === !1 && (r.scissor(N.x, N.y, N.z, N.w), ke.copy(N));
  }
  function ve(N) {
    Y.equals(N) === !1 && (r.viewport(N.x, N.y, N.z, N.w), Y.copy(N));
  }
  function Ge(N, he) {
    let q = c.get(he);
    q === void 0 && (q = /* @__PURE__ */ new WeakMap(), c.set(he, q));
    let J = q.get(N);
    J === void 0 && (J = r.getUniformBlockIndex(he, N.name), q.set(N, J));
  }
  function Ue(N, he) {
    const J = c.get(he).get(N);
    l.get(he) !== J && (r.uniformBlockBinding(he, J, N.__bindingPointIndex), l.set(he, J));
  }
  function et() {
    r.disable(r.BLEND), r.disable(r.CULL_FACE), r.disable(r.DEPTH_TEST), r.disable(r.POLYGON_OFFSET_FILL), r.disable(r.SCISSOR_TEST), r.disable(r.STENCIL_TEST), r.disable(r.SAMPLE_ALPHA_TO_COVERAGE), r.blendEquation(r.FUNC_ADD), r.blendFunc(r.ONE, r.ZERO), r.blendFuncSeparate(r.ONE, r.ZERO, r.ONE, r.ZERO), r.blendColor(0, 0, 0, 0), r.colorMask(!0, !0, !0, !0), r.clearColor(0, 0, 0, 0), r.depthMask(!0), r.depthFunc(r.LESS), o.setReversed(!1), r.clearDepth(1), r.stencilMask(4294967295), r.stencilFunc(r.ALWAYS, 0, 4294967295), r.stencilOp(r.KEEP, r.KEEP, r.KEEP), r.clearStencil(0), r.cullFace(r.BACK), r.frontFace(r.CCW), r.polygonOffset(0, 0), r.activeTexture(r.TEXTURE0), r.bindFramebuffer(r.FRAMEBUFFER, null), r.bindFramebuffer(r.DRAW_FRAMEBUFFER, null), r.bindFramebuffer(r.READ_FRAMEBUFFER, null), r.useProgram(null), r.lineWidth(1), r.scissor(0, 0, r.canvas.width, r.canvas.height), r.viewport(0, 0, r.canvas.width, r.canvas.height), h = {}, $ = null, se = {}, d = {}, u = /* @__PURE__ */ new WeakMap(), m = [], g = null, _ = !1, f = null, p = null, v = null, M = null, x = null, A = null, T = null, C = new Oe(0, 0, 0), D = 0, b = !1, y = null, P = null, B = null, L = null, U = null, ke.set(0, 0, r.canvas.width, r.canvas.height), Y.set(0, 0, r.canvas.width, r.canvas.height), s.reset(), o.reset(), a.reset();
  }
  return {
    buffers: {
      color: s,
      depth: o,
      stencil: a
    },
    enable: ae,
    disable: we,
    bindFramebuffer: je,
    drawBuffers: Re,
    useProgram: ct,
    setBlending: I,
    setMaterial: Nt,
    setFlipSided: We,
    setCullFace: He,
    setLineWidth: Se,
    setPolygonOffset: tt,
    setScissorTest: Me,
    activeTexture: R,
    bindTexture: E,
    unbindTexture: G,
    compressedTexImage2D: Z,
    compressedTexImage3D: Q,
    texImage2D: _e,
    texImage3D: Ce,
    updateUBOMapping: Ge,
    uniformBlockBinding: Ue,
    texStorage2D: Ae,
    texStorage3D: ee,
    texSubImage2D: j,
    texSubImage3D: ye,
    compressedTexSubImage2D: ce,
    compressedTexSubImage3D: Te,
    scissor: De,
    viewport: ve,
    reset: et
  };
}
function B_(r, e, t, n, i, s, o) {
  const a = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), c = new ze(), h = /* @__PURE__ */ new WeakMap();
  let d;
  const u = /* @__PURE__ */ new WeakMap();
  let m = !1;
  try {
    m = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function g(R, E) {
    return m ? new OffscreenCanvas(R, E) : Ws("canvas");
  }
  function _(R, E, G) {
    let Z = 1;
    const Q = Me(R);
    if ((Q.width > G || Q.height > G) && (Z = G / Math.max(Q.width, Q.height)), Z < 1)
      if (typeof HTMLImageElement < "u" && R instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && R instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && R instanceof ImageBitmap || typeof VideoFrame < "u" && R instanceof VideoFrame) {
        const j = Math.floor(Z * Q.width), ye = Math.floor(Z * Q.height);
        d === void 0 && (d = g(j, ye));
        const ce = E ? g(j, ye) : d;
        return ce.width = j, ce.height = ye, ce.getContext("2d").drawImage(R, 0, 0, j, ye), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + Q.width + "x" + Q.height + ") to (" + j + "x" + ye + ")."), ce;
      } else
        return "data" in R && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + Q.width + "x" + Q.height + ")."), R;
    return R;
  }
  function f(R) {
    return R.generateMipmaps;
  }
  function p(R) {
    r.generateMipmap(R);
  }
  function v(R) {
    return R.isWebGLCubeRenderTarget ? r.TEXTURE_CUBE_MAP : R.isWebGL3DRenderTarget ? r.TEXTURE_3D : R.isWebGLArrayRenderTarget || R.isCompressedArrayTexture ? r.TEXTURE_2D_ARRAY : r.TEXTURE_2D;
  }
  function M(R, E, G, Z, Q = !1) {
    if (R !== null) {
      if (r[R] !== void 0)
        return r[R];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + R + "'");
    }
    let j = E;
    if (E === r.RED && (G === r.FLOAT && (j = r.R32F), G === r.HALF_FLOAT && (j = r.R16F), G === r.UNSIGNED_BYTE && (j = r.R8)), E === r.RED_INTEGER && (G === r.UNSIGNED_BYTE && (j = r.R8UI), G === r.UNSIGNED_SHORT && (j = r.R16UI), G === r.UNSIGNED_INT && (j = r.R32UI), G === r.BYTE && (j = r.R8I), G === r.SHORT && (j = r.R16I), G === r.INT && (j = r.R32I)), E === r.RG && (G === r.FLOAT && (j = r.RG32F), G === r.HALF_FLOAT && (j = r.RG16F), G === r.UNSIGNED_BYTE && (j = r.RG8)), E === r.RG_INTEGER && (G === r.UNSIGNED_BYTE && (j = r.RG8UI), G === r.UNSIGNED_SHORT && (j = r.RG16UI), G === r.UNSIGNED_INT && (j = r.RG32UI), G === r.BYTE && (j = r.RG8I), G === r.SHORT && (j = r.RG16I), G === r.INT && (j = r.RG32I)), E === r.RGB_INTEGER && (G === r.UNSIGNED_BYTE && (j = r.RGB8UI), G === r.UNSIGNED_SHORT && (j = r.RGB16UI), G === r.UNSIGNED_INT && (j = r.RGB32UI), G === r.BYTE && (j = r.RGB8I), G === r.SHORT && (j = r.RGB16I), G === r.INT && (j = r.RGB32I)), E === r.RGBA_INTEGER && (G === r.UNSIGNED_BYTE && (j = r.RGBA8UI), G === r.UNSIGNED_SHORT && (j = r.RGBA16UI), G === r.UNSIGNED_INT && (j = r.RGBA32UI), G === r.BYTE && (j = r.RGBA8I), G === r.SHORT && (j = r.RGBA16I), G === r.INT && (j = r.RGBA32I)), E === r.RGB && G === r.UNSIGNED_INT_5_9_9_9_REV && (j = r.RGB9_E5), E === r.RGBA) {
      const ye = Q ? Vs : Ye.getTransfer(Z);
      G === r.FLOAT && (j = r.RGBA32F), G === r.HALF_FLOAT && (j = r.RGBA16F), G === r.UNSIGNED_BYTE && (j = ye === Qe ? r.SRGB8_ALPHA8 : r.RGBA8), G === r.UNSIGNED_SHORT_4_4_4_4 && (j = r.RGBA4), G === r.UNSIGNED_SHORT_5_5_5_1 && (j = r.RGB5_A1);
    }
    return (j === r.R16F || j === r.R32F || j === r.RG16F || j === r.RG32F || j === r.RGBA16F || j === r.RGBA32F) && e.get("EXT_color_buffer_float"), j;
  }
  function x(R, E) {
    let G;
    return R ? E === null || E === ni || E === qi ? G = r.DEPTH24_STENCIL8 : E === Sn ? G = r.DEPTH32F_STENCIL8 : E === Xi && (G = r.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : E === null || E === ni || E === qi ? G = r.DEPTH_COMPONENT24 : E === Sn ? G = r.DEPTH_COMPONENT32F : E === Xi && (G = r.DEPTH_COMPONENT16), G;
  }
  function A(R, E) {
    return f(R) === !0 || R.isFramebufferTexture && R.minFilter !== Jt && R.minFilter !== rn ? Math.log2(Math.max(E.width, E.height)) + 1 : R.mipmaps !== void 0 && R.mipmaps.length > 0 ? R.mipmaps.length : R.isCompressedTexture && Array.isArray(R.image) ? E.mipmaps.length : 1;
  }
  function T(R) {
    const E = R.target;
    E.removeEventListener("dispose", T), D(E), E.isVideoTexture && h.delete(E);
  }
  function C(R) {
    const E = R.target;
    E.removeEventListener("dispose", C), y(E);
  }
  function D(R) {
    const E = n.get(R);
    if (E.__webglInit === void 0)
      return;
    const G = R.source, Z = u.get(G);
    if (Z) {
      const Q = Z[E.__cacheKey];
      Q.usedTimes--, Q.usedTimes === 0 && b(R), Object.keys(Z).length === 0 && u.delete(G);
    }
    n.remove(R);
  }
  function b(R) {
    const E = n.get(R);
    r.deleteTexture(E.__webglTexture);
    const G = R.source, Z = u.get(G);
    delete Z[E.__cacheKey], o.memory.textures--;
  }
  function y(R) {
    const E = n.get(R);
    if (R.depthTexture && (R.depthTexture.dispose(), n.remove(R.depthTexture)), R.isWebGLCubeRenderTarget)
      for (let Z = 0; Z < 6; Z++) {
        if (Array.isArray(E.__webglFramebuffer[Z]))
          for (let Q = 0; Q < E.__webglFramebuffer[Z].length; Q++)
            r.deleteFramebuffer(E.__webglFramebuffer[Z][Q]);
        else
          r.deleteFramebuffer(E.__webglFramebuffer[Z]);
        E.__webglDepthbuffer && r.deleteRenderbuffer(E.__webglDepthbuffer[Z]);
      }
    else {
      if (Array.isArray(E.__webglFramebuffer))
        for (let Z = 0; Z < E.__webglFramebuffer.length; Z++)
          r.deleteFramebuffer(E.__webglFramebuffer[Z]);
      else
        r.deleteFramebuffer(E.__webglFramebuffer);
      if (E.__webglDepthbuffer && r.deleteRenderbuffer(E.__webglDepthbuffer), E.__webglMultisampledFramebuffer && r.deleteFramebuffer(E.__webglMultisampledFramebuffer), E.__webglColorRenderbuffer)
        for (let Z = 0; Z < E.__webglColorRenderbuffer.length; Z++)
          E.__webglColorRenderbuffer[Z] && r.deleteRenderbuffer(E.__webglColorRenderbuffer[Z]);
      E.__webglDepthRenderbuffer && r.deleteRenderbuffer(E.__webglDepthRenderbuffer);
    }
    const G = R.textures;
    for (let Z = 0, Q = G.length; Z < Q; Z++) {
      const j = n.get(G[Z]);
      j.__webglTexture && (r.deleteTexture(j.__webglTexture), o.memory.textures--), n.remove(G[Z]);
    }
    n.remove(R);
  }
  let P = 0;
  function B() {
    P = 0;
  }
  function L() {
    const R = P;
    return R >= i.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + R + " texture units while this GPU supports only " + i.maxTextures), P += 1, R;
  }
  function U(R) {
    const E = [];
    return E.push(R.wrapS), E.push(R.wrapT), E.push(R.wrapR || 0), E.push(R.magFilter), E.push(R.minFilter), E.push(R.anisotropy), E.push(R.internalFormat), E.push(R.format), E.push(R.type), E.push(R.generateMipmaps), E.push(R.premultiplyAlpha), E.push(R.flipY), E.push(R.unpackAlignment), E.push(R.colorSpace), E.join();
  }
  function O(R, E) {
    const G = n.get(R);
    if (R.isVideoTexture && Se(R), R.isRenderTargetTexture === !1 && R.version > 0 && G.__version !== R.version) {
      const Z = R.image;
      if (Z === null)
        console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if (Z.complete === !1)
        console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        Y(G, R, E);
        return;
      }
    }
    t.bindTexture(r.TEXTURE_2D, G.__webglTexture, r.TEXTURE0 + E);
  }
  function F(R, E) {
    const G = n.get(R);
    if (R.version > 0 && G.__version !== R.version) {
      Y(G, R, E);
      return;
    }
    t.bindTexture(r.TEXTURE_2D_ARRAY, G.__webglTexture, r.TEXTURE0 + E);
  }
  function K(R, E) {
    const G = n.get(R);
    if (R.version > 0 && G.__version !== R.version) {
      Y(G, R, E);
      return;
    }
    t.bindTexture(r.TEXTURE_3D, G.__webglTexture, r.TEXTURE0 + E);
  }
  function V(R, E) {
    const G = n.get(R);
    if (R.version > 0 && G.__version !== R.version) {
      ie(G, R, E);
      return;
    }
    t.bindTexture(r.TEXTURE_CUBE_MAP, G.__webglTexture, r.TEXTURE0 + E);
  }
  const $ = {
    [Xr]: r.REPEAT,
    [$n]: r.CLAMP_TO_EDGE,
    [qr]: r.MIRRORED_REPEAT
  }, se = {
    [Jt]: r.NEAREST,
    [cd]: r.NEAREST_MIPMAP_NEAREST,
    [hs]: r.NEAREST_MIPMAP_LINEAR,
    [rn]: r.LINEAR,
    [tr]: r.LINEAR_MIPMAP_NEAREST,
    [Jn]: r.LINEAR_MIPMAP_LINEAR
  }, de = {
    [fd]: r.NEVER,
    [xd]: r.ALWAYS,
    [pd]: r.LESS,
    [Ul]: r.LEQUAL,
    [md]: r.EQUAL,
    [vd]: r.GEQUAL,
    [gd]: r.GREATER,
    [_d]: r.NOTEQUAL
  };
  function ne(R, E) {
    if (E.type === Sn && e.has("OES_texture_float_linear") === !1 && (E.magFilter === rn || E.magFilter === tr || E.magFilter === hs || E.magFilter === Jn || E.minFilter === rn || E.minFilter === tr || E.minFilter === hs || E.minFilter === Jn) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), r.texParameteri(R, r.TEXTURE_WRAP_S, $[E.wrapS]), r.texParameteri(R, r.TEXTURE_WRAP_T, $[E.wrapT]), (R === r.TEXTURE_3D || R === r.TEXTURE_2D_ARRAY) && r.texParameteri(R, r.TEXTURE_WRAP_R, $[E.wrapR]), r.texParameteri(R, r.TEXTURE_MAG_FILTER, se[E.magFilter]), r.texParameteri(R, r.TEXTURE_MIN_FILTER, se[E.minFilter]), E.compareFunction && (r.texParameteri(R, r.TEXTURE_COMPARE_MODE, r.COMPARE_REF_TO_TEXTURE), r.texParameteri(R, r.TEXTURE_COMPARE_FUNC, de[E.compareFunction])), e.has("EXT_texture_filter_anisotropic") === !0) {
      if (E.magFilter === Jt || E.minFilter !== hs && E.minFilter !== Jn || E.type === Sn && e.has("OES_texture_float_linear") === !1)
        return;
      if (E.anisotropy > 1 || n.get(E).__currentAnisotropy) {
        const G = e.get("EXT_texture_filter_anisotropic");
        r.texParameterf(R, G.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(E.anisotropy, i.getMaxAnisotropy())), n.get(E).__currentAnisotropy = E.anisotropy;
      }
    }
  }
  function ke(R, E) {
    let G = !1;
    R.__webglInit === void 0 && (R.__webglInit = !0, E.addEventListener("dispose", T));
    const Z = E.source;
    let Q = u.get(Z);
    Q === void 0 && (Q = {}, u.set(Z, Q));
    const j = U(E);
    if (j !== R.__cacheKey) {
      Q[j] === void 0 && (Q[j] = {
        texture: r.createTexture(),
        usedTimes: 0
      }, o.memory.textures++, G = !0), Q[j].usedTimes++;
      const ye = Q[R.__cacheKey];
      ye !== void 0 && (Q[R.__cacheKey].usedTimes--, ye.usedTimes === 0 && b(E)), R.__cacheKey = j, R.__webglTexture = Q[j].texture;
    }
    return G;
  }
  function Y(R, E, G) {
    let Z = r.TEXTURE_2D;
    (E.isDataArrayTexture || E.isCompressedArrayTexture) && (Z = r.TEXTURE_2D_ARRAY), E.isData3DTexture && (Z = r.TEXTURE_3D);
    const Q = ke(R, E), j = E.source;
    t.bindTexture(Z, R.__webglTexture, r.TEXTURE0 + G);
    const ye = n.get(j);
    if (j.version !== ye.__version || Q === !0) {
      t.activeTexture(r.TEXTURE0 + G);
      const ce = Ye.getPrimaries(Ye.workingColorSpace), Te = E.colorSpace === Ln ? null : Ye.getPrimaries(E.colorSpace), Ae = E.colorSpace === Ln || ce === Te ? r.NONE : r.BROWSER_DEFAULT_WEBGL;
      r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, E.flipY), r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL, E.premultiplyAlpha), r.pixelStorei(r.UNPACK_ALIGNMENT, E.unpackAlignment), r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL, Ae);
      let ee = _(E.image, !1, i.maxTextureSize);
      ee = tt(E, ee);
      const _e = s.convert(E.format, E.colorSpace), Ce = s.convert(E.type);
      let De = M(E.internalFormat, _e, Ce, E.colorSpace, E.isVideoTexture);
      ne(Z, E);
      let ve;
      const Ge = E.mipmaps, Ue = E.isVideoTexture !== !0, et = ye.__version === void 0 || Q === !0, N = j.dataReady, he = A(E, ee);
      if (E.isDepthTexture)
        De = x(E.format === ji, E.type), et && (Ue ? t.texStorage2D(r.TEXTURE_2D, 1, De, ee.width, ee.height) : t.texImage2D(r.TEXTURE_2D, 0, De, ee.width, ee.height, 0, _e, Ce, null));
      else if (E.isDataTexture)
        if (Ge.length > 0) {
          Ue && et && t.texStorage2D(r.TEXTURE_2D, he, De, Ge[0].width, Ge[0].height);
          for (let q = 0, J = Ge.length; q < J; q++)
            ve = Ge[q], Ue ? N && t.texSubImage2D(r.TEXTURE_2D, q, 0, 0, ve.width, ve.height, _e, Ce, ve.data) : t.texImage2D(r.TEXTURE_2D, q, De, ve.width, ve.height, 0, _e, Ce, ve.data);
          E.generateMipmaps = !1;
        } else
          Ue ? (et && t.texStorage2D(r.TEXTURE_2D, he, De, ee.width, ee.height), N && t.texSubImage2D(r.TEXTURE_2D, 0, 0, 0, ee.width, ee.height, _e, Ce, ee.data)) : t.texImage2D(r.TEXTURE_2D, 0, De, ee.width, ee.height, 0, _e, Ce, ee.data);
      else if (E.isCompressedTexture)
        if (E.isCompressedArrayTexture) {
          Ue && et && t.texStorage3D(r.TEXTURE_2D_ARRAY, he, De, Ge[0].width, Ge[0].height, ee.depth);
          for (let q = 0, J = Ge.length; q < J; q++)
            if (ve = Ge[q], E.format !== Zt)
              if (_e !== null)
                if (Ue) {
                  if (N)
                    if (E.layerUpdates.size > 0) {
                      const fe = Ha(ve.width, ve.height, E.format, E.type);
                      for (const ue of E.layerUpdates) {
                        const Fe = ve.data.subarray(
                          ue * fe / ve.data.BYTES_PER_ELEMENT,
                          (ue + 1) * fe / ve.data.BYTES_PER_ELEMENT
                        );
                        t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY, q, 0, 0, ue, ve.width, ve.height, 1, _e, Fe);
                      }
                      E.clearLayerUpdates();
                    } else
                      t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY, q, 0, 0, 0, ve.width, ve.height, ee.depth, _e, ve.data);
                } else
                  t.compressedTexImage3D(r.TEXTURE_2D_ARRAY, q, De, ve.width, ve.height, ee.depth, 0, ve.data, 0, 0);
              else
                console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
            else
              Ue ? N && t.texSubImage3D(r.TEXTURE_2D_ARRAY, q, 0, 0, 0, ve.width, ve.height, ee.depth, _e, Ce, ve.data) : t.texImage3D(r.TEXTURE_2D_ARRAY, q, De, ve.width, ve.height, ee.depth, 0, _e, Ce, ve.data);
        } else {
          Ue && et && t.texStorage2D(r.TEXTURE_2D, he, De, Ge[0].width, Ge[0].height);
          for (let q = 0, J = Ge.length; q < J; q++)
            ve = Ge[q], E.format !== Zt ? _e !== null ? Ue ? N && t.compressedTexSubImage2D(r.TEXTURE_2D, q, 0, 0, ve.width, ve.height, _e, ve.data) : t.compressedTexImage2D(r.TEXTURE_2D, q, De, ve.width, ve.height, 0, ve.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : Ue ? N && t.texSubImage2D(r.TEXTURE_2D, q, 0, 0, ve.width, ve.height, _e, Ce, ve.data) : t.texImage2D(r.TEXTURE_2D, q, De, ve.width, ve.height, 0, _e, Ce, ve.data);
        }
      else if (E.isDataArrayTexture)
        if (Ue) {
          if (et && t.texStorage3D(r.TEXTURE_2D_ARRAY, he, De, ee.width, ee.height, ee.depth), N)
            if (E.layerUpdates.size > 0) {
              const q = Ha(ee.width, ee.height, E.format, E.type);
              for (const J of E.layerUpdates) {
                const fe = ee.data.subarray(
                  J * q / ee.data.BYTES_PER_ELEMENT,
                  (J + 1) * q / ee.data.BYTES_PER_ELEMENT
                );
                t.texSubImage3D(r.TEXTURE_2D_ARRAY, 0, 0, 0, J, ee.width, ee.height, 1, _e, Ce, fe);
              }
              E.clearLayerUpdates();
            } else
              t.texSubImage3D(r.TEXTURE_2D_ARRAY, 0, 0, 0, 0, ee.width, ee.height, ee.depth, _e, Ce, ee.data);
        } else
          t.texImage3D(r.TEXTURE_2D_ARRAY, 0, De, ee.width, ee.height, ee.depth, 0, _e, Ce, ee.data);
      else if (E.isData3DTexture)
        Ue ? (et && t.texStorage3D(r.TEXTURE_3D, he, De, ee.width, ee.height, ee.depth), N && t.texSubImage3D(r.TEXTURE_3D, 0, 0, 0, 0, ee.width, ee.height, ee.depth, _e, Ce, ee.data)) : t.texImage3D(r.TEXTURE_3D, 0, De, ee.width, ee.height, ee.depth, 0, _e, Ce, ee.data);
      else if (E.isFramebufferTexture) {
        if (et)
          if (Ue)
            t.texStorage2D(r.TEXTURE_2D, he, De, ee.width, ee.height);
          else {
            let q = ee.width, J = ee.height;
            for (let fe = 0; fe < he; fe++)
              t.texImage2D(r.TEXTURE_2D, fe, De, q, J, 0, _e, Ce, null), q >>= 1, J >>= 1;
          }
      } else if (Ge.length > 0) {
        if (Ue && et) {
          const q = Me(Ge[0]);
          t.texStorage2D(r.TEXTURE_2D, he, De, q.width, q.height);
        }
        for (let q = 0, J = Ge.length; q < J; q++)
          ve = Ge[q], Ue ? N && t.texSubImage2D(r.TEXTURE_2D, q, 0, 0, _e, Ce, ve) : t.texImage2D(r.TEXTURE_2D, q, De, _e, Ce, ve);
        E.generateMipmaps = !1;
      } else if (Ue) {
        if (et) {
          const q = Me(ee);
          t.texStorage2D(r.TEXTURE_2D, he, De, q.width, q.height);
        }
        N && t.texSubImage2D(r.TEXTURE_2D, 0, 0, 0, _e, Ce, ee);
      } else
        t.texImage2D(r.TEXTURE_2D, 0, De, _e, Ce, ee);
      f(E) && p(Z), ye.__version = j.version, E.onUpdate && E.onUpdate(E);
    }
    R.__version = E.version;
  }
  function ie(R, E, G) {
    if (E.image.length !== 6)
      return;
    const Z = ke(R, E), Q = E.source;
    t.bindTexture(r.TEXTURE_CUBE_MAP, R.__webglTexture, r.TEXTURE0 + G);
    const j = n.get(Q);
    if (Q.version !== j.__version || Z === !0) {
      t.activeTexture(r.TEXTURE0 + G);
      const ye = Ye.getPrimaries(Ye.workingColorSpace), ce = E.colorSpace === Ln ? null : Ye.getPrimaries(E.colorSpace), Te = E.colorSpace === Ln || ye === ce ? r.NONE : r.BROWSER_DEFAULT_WEBGL;
      r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, E.flipY), r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL, E.premultiplyAlpha), r.pixelStorei(r.UNPACK_ALIGNMENT, E.unpackAlignment), r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL, Te);
      const Ae = E.isCompressedTexture || E.image[0].isCompressedTexture, ee = E.image[0] && E.image[0].isDataTexture, _e = [];
      for (let J = 0; J < 6; J++)
        !Ae && !ee ? _e[J] = _(E.image[J], !0, i.maxCubemapSize) : _e[J] = ee ? E.image[J].image : E.image[J], _e[J] = tt(E, _e[J]);
      const Ce = _e[0], De = s.convert(E.format, E.colorSpace), ve = s.convert(E.type), Ge = M(E.internalFormat, De, ve, E.colorSpace), Ue = E.isVideoTexture !== !0, et = j.__version === void 0 || Z === !0, N = Q.dataReady;
      let he = A(E, Ce);
      ne(r.TEXTURE_CUBE_MAP, E);
      let q;
      if (Ae) {
        Ue && et && t.texStorage2D(r.TEXTURE_CUBE_MAP, he, Ge, Ce.width, Ce.height);
        for (let J = 0; J < 6; J++) {
          q = _e[J].mipmaps;
          for (let fe = 0; fe < q.length; fe++) {
            const ue = q[fe];
            E.format !== Zt ? De !== null ? Ue ? N && t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + J, fe, 0, 0, ue.width, ue.height, De, ue.data) : t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + J, fe, Ge, ue.width, ue.height, 0, ue.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : Ue ? N && t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + J, fe, 0, 0, ue.width, ue.height, De, ve, ue.data) : t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + J, fe, Ge, ue.width, ue.height, 0, De, ve, ue.data);
          }
        }
      } else {
        if (q = E.mipmaps, Ue && et) {
          q.length > 0 && he++;
          const J = Me(_e[0]);
          t.texStorage2D(r.TEXTURE_CUBE_MAP, he, Ge, J.width, J.height);
        }
        for (let J = 0; J < 6; J++)
          if (ee) {
            Ue ? N && t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + J, 0, 0, 0, _e[J].width, _e[J].height, De, ve, _e[J].data) : t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + J, 0, Ge, _e[J].width, _e[J].height, 0, De, ve, _e[J].data);
            for (let fe = 0; fe < q.length; fe++) {
              const Fe = q[fe].image[J].image;
              Ue ? N && t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + J, fe + 1, 0, 0, Fe.width, Fe.height, De, ve, Fe.data) : t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + J, fe + 1, Ge, Fe.width, Fe.height, 0, De, ve, Fe.data);
            }
          } else {
            Ue ? N && t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + J, 0, 0, 0, De, ve, _e[J]) : t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + J, 0, Ge, De, ve, _e[J]);
            for (let fe = 0; fe < q.length; fe++) {
              const ue = q[fe];
              Ue ? N && t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + J, fe + 1, 0, 0, De, ve, ue.image[J]) : t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + J, fe + 1, Ge, De, ve, ue.image[J]);
            }
          }
      }
      f(E) && p(r.TEXTURE_CUBE_MAP), j.__version = Q.version, E.onUpdate && E.onUpdate(E);
    }
    R.__version = E.version;
  }
  function ge(R, E, G, Z, Q, j) {
    const ye = s.convert(G.format, G.colorSpace), ce = s.convert(G.type), Te = M(G.internalFormat, ye, ce, G.colorSpace), Ae = n.get(E), ee = n.get(G);
    if (ee.__renderTarget = E, !Ae.__hasExternalTextures) {
      const _e = Math.max(1, E.width >> j), Ce = Math.max(1, E.height >> j);
      Q === r.TEXTURE_3D || Q === r.TEXTURE_2D_ARRAY ? t.texImage3D(Q, j, Te, _e, Ce, E.depth, 0, ye, ce, null) : t.texImage2D(Q, j, Te, _e, Ce, 0, ye, ce, null);
    }
    t.bindFramebuffer(r.FRAMEBUFFER, R), He(E) ? a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER, Z, Q, ee.__webglTexture, 0, We(E)) : (Q === r.TEXTURE_2D || Q >= r.TEXTURE_CUBE_MAP_POSITIVE_X && Q <= r.TEXTURE_CUBE_MAP_NEGATIVE_Z) && r.framebufferTexture2D(r.FRAMEBUFFER, Z, Q, ee.__webglTexture, j), t.bindFramebuffer(r.FRAMEBUFFER, null);
  }
  function ae(R, E, G) {
    if (r.bindRenderbuffer(r.RENDERBUFFER, R), E.depthBuffer) {
      const Z = E.depthTexture, Q = Z && Z.isDepthTexture ? Z.type : null, j = x(E.stencilBuffer, Q), ye = E.stencilBuffer ? r.DEPTH_STENCIL_ATTACHMENT : r.DEPTH_ATTACHMENT, ce = We(E);
      He(E) ? a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER, ce, j, E.width, E.height) : G ? r.renderbufferStorageMultisample(r.RENDERBUFFER, ce, j, E.width, E.height) : r.renderbufferStorage(r.RENDERBUFFER, j, E.width, E.height), r.framebufferRenderbuffer(r.FRAMEBUFFER, ye, r.RENDERBUFFER, R);
    } else {
      const Z = E.textures;
      for (let Q = 0; Q < Z.length; Q++) {
        const j = Z[Q], ye = s.convert(j.format, j.colorSpace), ce = s.convert(j.type), Te = M(j.internalFormat, ye, ce, j.colorSpace), Ae = We(E);
        G && He(E) === !1 ? r.renderbufferStorageMultisample(r.RENDERBUFFER, Ae, Te, E.width, E.height) : He(E) ? a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER, Ae, Te, E.width, E.height) : r.renderbufferStorage(r.RENDERBUFFER, Te, E.width, E.height);
      }
    }
    r.bindRenderbuffer(r.RENDERBUFFER, null);
  }
  function we(R, E) {
    if (E && E.isWebGLCubeRenderTarget)
      throw new Error("Depth Texture with cube render targets is not supported");
    if (t.bindFramebuffer(r.FRAMEBUFFER, R), !(E.depthTexture && E.depthTexture.isDepthTexture))
      throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    const Z = n.get(E.depthTexture);
    Z.__renderTarget = E, (!Z.__webglTexture || E.depthTexture.image.width !== E.width || E.depthTexture.image.height !== E.height) && (E.depthTexture.image.width = E.width, E.depthTexture.image.height = E.height, E.depthTexture.needsUpdate = !0), O(E.depthTexture, 0);
    const Q = Z.__webglTexture, j = We(E);
    if (E.depthTexture.format === Yi)
      He(E) ? a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER, r.DEPTH_ATTACHMENT, r.TEXTURE_2D, Q, 0, j) : r.framebufferTexture2D(r.FRAMEBUFFER, r.DEPTH_ATTACHMENT, r.TEXTURE_2D, Q, 0);
    else if (E.depthTexture.format === ji)
      He(E) ? a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER, r.DEPTH_STENCIL_ATTACHMENT, r.TEXTURE_2D, Q, 0, j) : r.framebufferTexture2D(r.FRAMEBUFFER, r.DEPTH_STENCIL_ATTACHMENT, r.TEXTURE_2D, Q, 0);
    else
      throw new Error("Unknown depthTexture format");
  }
  function je(R) {
    const E = n.get(R), G = R.isWebGLCubeRenderTarget === !0;
    if (E.__boundDepthTexture !== R.depthTexture) {
      const Z = R.depthTexture;
      if (E.__depthDisposeCallback && E.__depthDisposeCallback(), Z) {
        const Q = () => {
          delete E.__boundDepthTexture, delete E.__depthDisposeCallback, Z.removeEventListener("dispose", Q);
        };
        Z.addEventListener("dispose", Q), E.__depthDisposeCallback = Q;
      }
      E.__boundDepthTexture = Z;
    }
    if (R.depthTexture && !E.__autoAllocateDepthBuffer) {
      if (G)
        throw new Error("target.depthTexture not supported in Cube render targets");
      const Z = R.texture.mipmaps;
      Z && Z.length > 0 ? we(E.__webglFramebuffer[0], R) : we(E.__webglFramebuffer, R);
    } else if (G) {
      E.__webglDepthbuffer = [];
      for (let Z = 0; Z < 6; Z++)
        if (t.bindFramebuffer(r.FRAMEBUFFER, E.__webglFramebuffer[Z]), E.__webglDepthbuffer[Z] === void 0)
          E.__webglDepthbuffer[Z] = r.createRenderbuffer(), ae(E.__webglDepthbuffer[Z], R, !1);
        else {
          const Q = R.stencilBuffer ? r.DEPTH_STENCIL_ATTACHMENT : r.DEPTH_ATTACHMENT, j = E.__webglDepthbuffer[Z];
          r.bindRenderbuffer(r.RENDERBUFFER, j), r.framebufferRenderbuffer(r.FRAMEBUFFER, Q, r.RENDERBUFFER, j);
        }
    } else {
      const Z = R.texture.mipmaps;
      if (Z && Z.length > 0 ? t.bindFramebuffer(r.FRAMEBUFFER, E.__webglFramebuffer[0]) : t.bindFramebuffer(r.FRAMEBUFFER, E.__webglFramebuffer), E.__webglDepthbuffer === void 0)
        E.__webglDepthbuffer = r.createRenderbuffer(), ae(E.__webglDepthbuffer, R, !1);
      else {
        const Q = R.stencilBuffer ? r.DEPTH_STENCIL_ATTACHMENT : r.DEPTH_ATTACHMENT, j = E.__webglDepthbuffer;
        r.bindRenderbuffer(r.RENDERBUFFER, j), r.framebufferRenderbuffer(r.FRAMEBUFFER, Q, r.RENDERBUFFER, j);
      }
    }
    t.bindFramebuffer(r.FRAMEBUFFER, null);
  }
  function Re(R, E, G) {
    const Z = n.get(R);
    E !== void 0 && ge(Z.__webglFramebuffer, R, R.texture, r.COLOR_ATTACHMENT0, r.TEXTURE_2D, 0), G !== void 0 && je(R);
  }
  function ct(R) {
    const E = R.texture, G = n.get(R), Z = n.get(E);
    R.addEventListener("dispose", C);
    const Q = R.textures, j = R.isWebGLCubeRenderTarget === !0, ye = Q.length > 1;
    if (ye || (Z.__webglTexture === void 0 && (Z.__webglTexture = r.createTexture()), Z.__version = E.version, o.memory.textures++), j) {
      G.__webglFramebuffer = [];
      for (let ce = 0; ce < 6; ce++)
        if (E.mipmaps && E.mipmaps.length > 0) {
          G.__webglFramebuffer[ce] = [];
          for (let Te = 0; Te < E.mipmaps.length; Te++)
            G.__webglFramebuffer[ce][Te] = r.createFramebuffer();
        } else
          G.__webglFramebuffer[ce] = r.createFramebuffer();
    } else {
      if (E.mipmaps && E.mipmaps.length > 0) {
        G.__webglFramebuffer = [];
        for (let ce = 0; ce < E.mipmaps.length; ce++)
          G.__webglFramebuffer[ce] = r.createFramebuffer();
      } else
        G.__webglFramebuffer = r.createFramebuffer();
      if (ye)
        for (let ce = 0, Te = Q.length; ce < Te; ce++) {
          const Ae = n.get(Q[ce]);
          Ae.__webglTexture === void 0 && (Ae.__webglTexture = r.createTexture(), o.memory.textures++);
        }
      if (R.samples > 0 && He(R) === !1) {
        G.__webglMultisampledFramebuffer = r.createFramebuffer(), G.__webglColorRenderbuffer = [], t.bindFramebuffer(r.FRAMEBUFFER, G.__webglMultisampledFramebuffer);
        for (let ce = 0; ce < Q.length; ce++) {
          const Te = Q[ce];
          G.__webglColorRenderbuffer[ce] = r.createRenderbuffer(), r.bindRenderbuffer(r.RENDERBUFFER, G.__webglColorRenderbuffer[ce]);
          const Ae = s.convert(Te.format, Te.colorSpace), ee = s.convert(Te.type), _e = M(Te.internalFormat, Ae, ee, Te.colorSpace, R.isXRRenderTarget === !0), Ce = We(R);
          r.renderbufferStorageMultisample(r.RENDERBUFFER, Ce, _e, R.width, R.height), r.framebufferRenderbuffer(r.FRAMEBUFFER, r.COLOR_ATTACHMENT0 + ce, r.RENDERBUFFER, G.__webglColorRenderbuffer[ce]);
        }
        r.bindRenderbuffer(r.RENDERBUFFER, null), R.depthBuffer && (G.__webglDepthRenderbuffer = r.createRenderbuffer(), ae(G.__webglDepthRenderbuffer, R, !0)), t.bindFramebuffer(r.FRAMEBUFFER, null);
      }
    }
    if (j) {
      t.bindTexture(r.TEXTURE_CUBE_MAP, Z.__webglTexture), ne(r.TEXTURE_CUBE_MAP, E);
      for (let ce = 0; ce < 6; ce++)
        if (E.mipmaps && E.mipmaps.length > 0)
          for (let Te = 0; Te < E.mipmaps.length; Te++)
            ge(G.__webglFramebuffer[ce][Te], R, E, r.COLOR_ATTACHMENT0, r.TEXTURE_CUBE_MAP_POSITIVE_X + ce, Te);
        else
          ge(G.__webglFramebuffer[ce], R, E, r.COLOR_ATTACHMENT0, r.TEXTURE_CUBE_MAP_POSITIVE_X + ce, 0);
      f(E) && p(r.TEXTURE_CUBE_MAP), t.unbindTexture();
    } else if (ye) {
      for (let ce = 0, Te = Q.length; ce < Te; ce++) {
        const Ae = Q[ce], ee = n.get(Ae);
        t.bindTexture(r.TEXTURE_2D, ee.__webglTexture), ne(r.TEXTURE_2D, Ae), ge(G.__webglFramebuffer, R, Ae, r.COLOR_ATTACHMENT0 + ce, r.TEXTURE_2D, 0), f(Ae) && p(r.TEXTURE_2D);
      }
      t.unbindTexture();
    } else {
      let ce = r.TEXTURE_2D;
      if ((R.isWebGL3DRenderTarget || R.isWebGLArrayRenderTarget) && (ce = R.isWebGL3DRenderTarget ? r.TEXTURE_3D : r.TEXTURE_2D_ARRAY), t.bindTexture(ce, Z.__webglTexture), ne(ce, E), E.mipmaps && E.mipmaps.length > 0)
        for (let Te = 0; Te < E.mipmaps.length; Te++)
          ge(G.__webglFramebuffer[Te], R, E, r.COLOR_ATTACHMENT0, ce, Te);
      else
        ge(G.__webglFramebuffer, R, E, r.COLOR_ATTACHMENT0, ce, 0);
      f(E) && p(ce), t.unbindTexture();
    }
    R.depthBuffer && je(R);
  }
  function st(R) {
    const E = R.textures;
    for (let G = 0, Z = E.length; G < Z; G++) {
      const Q = E[G];
      if (f(Q)) {
        const j = v(R), ye = n.get(Q).__webglTexture;
        t.bindTexture(j, ye), p(j), t.unbindTexture();
      }
    }
  }
  const Ve = [], I = [];
  function Nt(R) {
    if (R.samples > 0) {
      if (He(R) === !1) {
        const E = R.textures, G = R.width, Z = R.height;
        let Q = r.COLOR_BUFFER_BIT;
        const j = R.stencilBuffer ? r.DEPTH_STENCIL_ATTACHMENT : r.DEPTH_ATTACHMENT, ye = n.get(R), ce = E.length > 1;
        if (ce)
          for (let Ae = 0; Ae < E.length; Ae++)
            t.bindFramebuffer(r.FRAMEBUFFER, ye.__webglMultisampledFramebuffer), r.framebufferRenderbuffer(r.FRAMEBUFFER, r.COLOR_ATTACHMENT0 + Ae, r.RENDERBUFFER, null), t.bindFramebuffer(r.FRAMEBUFFER, ye.__webglFramebuffer), r.framebufferTexture2D(r.DRAW_FRAMEBUFFER, r.COLOR_ATTACHMENT0 + Ae, r.TEXTURE_2D, null, 0);
        t.bindFramebuffer(r.READ_FRAMEBUFFER, ye.__webglMultisampledFramebuffer);
        const Te = R.texture.mipmaps;
        Te && Te.length > 0 ? t.bindFramebuffer(r.DRAW_FRAMEBUFFER, ye.__webglFramebuffer[0]) : t.bindFramebuffer(r.DRAW_FRAMEBUFFER, ye.__webglFramebuffer);
        for (let Ae = 0; Ae < E.length; Ae++) {
          if (R.resolveDepthBuffer && (R.depthBuffer && (Q |= r.DEPTH_BUFFER_BIT), R.stencilBuffer && R.resolveStencilBuffer && (Q |= r.STENCIL_BUFFER_BIT)), ce) {
            r.framebufferRenderbuffer(r.READ_FRAMEBUFFER, r.COLOR_ATTACHMENT0, r.RENDERBUFFER, ye.__webglColorRenderbuffer[Ae]);
            const ee = n.get(E[Ae]).__webglTexture;
            r.framebufferTexture2D(r.DRAW_FRAMEBUFFER, r.COLOR_ATTACHMENT0, r.TEXTURE_2D, ee, 0);
          }
          r.blitFramebuffer(0, 0, G, Z, 0, 0, G, Z, Q, r.NEAREST), l === !0 && (Ve.length = 0, I.length = 0, Ve.push(r.COLOR_ATTACHMENT0 + Ae), R.depthBuffer && R.resolveDepthBuffer === !1 && (Ve.push(j), I.push(j), r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER, I)), r.invalidateFramebuffer(r.READ_FRAMEBUFFER, Ve));
        }
        if (t.bindFramebuffer(r.READ_FRAMEBUFFER, null), t.bindFramebuffer(r.DRAW_FRAMEBUFFER, null), ce)
          for (let Ae = 0; Ae < E.length; Ae++) {
            t.bindFramebuffer(r.FRAMEBUFFER, ye.__webglMultisampledFramebuffer), r.framebufferRenderbuffer(r.FRAMEBUFFER, r.COLOR_ATTACHMENT0 + Ae, r.RENDERBUFFER, ye.__webglColorRenderbuffer[Ae]);
            const ee = n.get(E[Ae]).__webglTexture;
            t.bindFramebuffer(r.FRAMEBUFFER, ye.__webglFramebuffer), r.framebufferTexture2D(r.DRAW_FRAMEBUFFER, r.COLOR_ATTACHMENT0 + Ae, r.TEXTURE_2D, ee, 0);
          }
        t.bindFramebuffer(r.DRAW_FRAMEBUFFER, ye.__webglMultisampledFramebuffer);
      } else if (R.depthBuffer && R.resolveDepthBuffer === !1 && l) {
        const E = R.stencilBuffer ? r.DEPTH_STENCIL_ATTACHMENT : r.DEPTH_ATTACHMENT;
        r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER, [E]);
      }
    }
  }
  function We(R) {
    return Math.min(i.maxSamples, R.samples);
  }
  function He(R) {
    const E = n.get(R);
    return R.samples > 0 && e.has("WEBGL_multisampled_render_to_texture") === !0 && E.__useRenderToTexture !== !1;
  }
  function Se(R) {
    const E = o.render.frame;
    h.get(R) !== E && (h.set(R, E), R.update());
  }
  function tt(R, E) {
    const G = R.colorSpace, Z = R.format, Q = R.type;
    return R.isCompressedTexture === !0 || R.isVideoTexture === !0 || G !== Ri && G !== Ln && (Ye.getTransfer(G) === Qe ? (Z !== Zt || Q !== an) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", G)), E;
  }
  function Me(R) {
    return typeof HTMLImageElement < "u" && R instanceof HTMLImageElement ? (c.width = R.naturalWidth || R.width, c.height = R.naturalHeight || R.height) : typeof VideoFrame < "u" && R instanceof VideoFrame ? (c.width = R.displayWidth, c.height = R.displayHeight) : (c.width = R.width, c.height = R.height), c;
  }
  this.allocateTextureUnit = L, this.resetTextureUnits = B, this.setTexture2D = O, this.setTexture2DArray = F, this.setTexture3D = K, this.setTextureCube = V, this.rebindTextures = Re, this.setupRenderTarget = ct, this.updateRenderTargetMipmap = st, this.updateMultisampleRenderTarget = Nt, this.setupDepthRenderbuffer = je, this.setupFrameBufferTexture = ge, this.useMultisampledRTT = He;
}
function z_(r, e) {
  function t(n, i = Ln) {
    let s;
    const o = Ye.getTransfer(i);
    if (n === an)
      return r.UNSIGNED_BYTE;
    if (n === Ro)
      return r.UNSIGNED_SHORT_4_4_4_4;
    if (n === Po)
      return r.UNSIGNED_SHORT_5_5_5_1;
    if (n === Rl)
      return r.UNSIGNED_INT_5_9_9_9_REV;
    if (n === Al)
      return r.BYTE;
    if (n === Cl)
      return r.SHORT;
    if (n === Xi)
      return r.UNSIGNED_SHORT;
    if (n === Co)
      return r.INT;
    if (n === ni)
      return r.UNSIGNED_INT;
    if (n === Sn)
      return r.FLOAT;
    if (n === $i)
      return r.HALF_FLOAT;
    if (n === Pl)
      return r.ALPHA;
    if (n === Dl)
      return r.RGB;
    if (n === Zt)
      return r.RGBA;
    if (n === Yi)
      return r.DEPTH_COMPONENT;
    if (n === ji)
      return r.DEPTH_STENCIL;
    if (n === Ll)
      return r.RED;
    if (n === Do)
      return r.RED_INTEGER;
    if (n === Fl)
      return r.RG;
    if (n === Lo)
      return r.RG_INTEGER;
    if (n === Fo)
      return r.RGBA_INTEGER;
    if (n === Ls || n === Fs || n === Is || n === Us)
      if (o === Qe)
        if (s = e.get("WEBGL_compressed_texture_s3tc_srgb"), s !== null) {
          if (n === Ls)
            return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (n === Fs)
            return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (n === Is)
            return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (n === Us)
            return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else
          return null;
      else if (s = e.get("WEBGL_compressed_texture_s3tc"), s !== null) {
        if (n === Ls)
          return s.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (n === Fs)
          return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (n === Is)
          return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (n === Us)
          return s.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else
        return null;
    if (n === Yr || n === jr || n === Kr || n === Zr)
      if (s = e.get("WEBGL_compressed_texture_pvrtc"), s !== null) {
        if (n === Yr)
          return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === jr)
          return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === Kr)
          return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === Zr)
          return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else
        return null;
    if (n === $r || n === Jr || n === Qr)
      if (s = e.get("WEBGL_compressed_texture_etc"), s !== null) {
        if (n === $r || n === Jr)
          return o === Qe ? s.COMPRESSED_SRGB8_ETC2 : s.COMPRESSED_RGB8_ETC2;
        if (n === Qr)
          return o === Qe ? s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : s.COMPRESSED_RGBA8_ETC2_EAC;
      } else
        return null;
    if (n === eo || n === to || n === no || n === io || n === so || n === ro || n === oo || n === ao || n === lo || n === co || n === ho || n === uo || n === fo || n === po)
      if (s = e.get("WEBGL_compressed_texture_astc"), s !== null) {
        if (n === eo)
          return o === Qe ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : s.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === to)
          return o === Qe ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : s.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === no)
          return o === Qe ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : s.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === io)
          return o === Qe ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : s.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === so)
          return o === Qe ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : s.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === ro)
          return o === Qe ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : s.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === oo)
          return o === Qe ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : s.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === ao)
          return o === Qe ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : s.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === lo)
          return o === Qe ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : s.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === co)
          return o === Qe ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : s.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === ho)
          return o === Qe ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : s.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === uo)
          return o === Qe ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : s.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === fo)
          return o === Qe ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : s.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === po)
          return o === Qe ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : s.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else
        return null;
    if (n === Ns || n === mo || n === go)
      if (s = e.get("EXT_texture_compression_bptc"), s !== null) {
        if (n === Ns)
          return o === Qe ? s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : s.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === mo)
          return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === go)
          return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else
        return null;
    if (n === Il || n === _o || n === vo || n === xo)
      if (s = e.get("EXT_texture_compression_rgtc"), s !== null) {
        if (n === Ns)
          return s.COMPRESSED_RED_RGTC1_EXT;
        if (n === _o)
          return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === vo)
          return s.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === xo)
          return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else
        return null;
    return n === qi ? r.UNSIGNED_INT_24_8 : r[n] !== void 0 ? r[n] : null;
  }
  return { convert: t };
}
const k_ = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, V_ = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;
class H_ {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  init(e, t, n) {
    if (this.texture === null) {
      const i = new bt(), s = e.properties.get(i);
      s.__webglTexture = t.texture, (t.depthNear !== n.depthNear || t.depthFar !== n.depthFar) && (this.depthNear = t.depthNear, this.depthFar = t.depthFar), this.texture = i;
    }
  }
  getMesh(e) {
    if (this.texture !== null && this.mesh === null) {
      const t = e.cameras[0].viewport, n = new Nn({
        vertexShader: k_,
        fragmentShader: V_,
        uniforms: {
          depthColor: { value: this.texture },
          depthWidth: { value: t.z },
          depthHeight: { value: t.w }
        }
      });
      this.mesh = new $t(new ns(20, 20), n);
    }
    return this.mesh;
  }
  reset() {
    this.texture = null, this.mesh = null;
  }
  getDepthTexture() {
    return this.texture;
  }
}
class G_ extends Di {
  constructor(e, t) {
    super();
    const n = this;
    let i = null, s = 1, o = null, a = "local-floor", l = 1, c = null, h = null, d = null, u = null, m = null, g = null;
    const _ = new H_(), f = t.getContextAttributes();
    let p = null, v = null;
    const M = [], x = [], A = new ze();
    let T = null;
    const C = new It();
    C.viewport = new lt();
    const D = new It();
    D.viewport = new lt();
    const b = [C, D], y = new cf();
    let P = null, B = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(Y) {
      let ie = M[Y];
      return ie === void 0 && (ie = new Er(), M[Y] = ie), ie.getTargetRaySpace();
    }, this.getControllerGrip = function(Y) {
      let ie = M[Y];
      return ie === void 0 && (ie = new Er(), M[Y] = ie), ie.getGripSpace();
    }, this.getHand = function(Y) {
      let ie = M[Y];
      return ie === void 0 && (ie = new Er(), M[Y] = ie), ie.getHandSpace();
    };
    function L(Y) {
      const ie = x.indexOf(Y.inputSource);
      if (ie === -1)
        return;
      const ge = M[ie];
      ge !== void 0 && (ge.update(Y.inputSource, Y.frame, c || o), ge.dispatchEvent({ type: Y.type, data: Y.inputSource }));
    }
    function U() {
      i.removeEventListener("select", L), i.removeEventListener("selectstart", L), i.removeEventListener("selectend", L), i.removeEventListener("squeeze", L), i.removeEventListener("squeezestart", L), i.removeEventListener("squeezeend", L), i.removeEventListener("end", U), i.removeEventListener("inputsourceschange", O);
      for (let Y = 0; Y < M.length; Y++) {
        const ie = x[Y];
        ie !== null && (x[Y] = null, M[Y].disconnect(ie));
      }
      P = null, B = null, _.reset(), e.setRenderTarget(p), m = null, u = null, d = null, i = null, v = null, ke.stop(), n.isPresenting = !1, e.setPixelRatio(T), e.setSize(A.width, A.height, !1), n.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function(Y) {
      s = Y, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function(Y) {
      a = Y, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return c || o;
    }, this.setReferenceSpace = function(Y) {
      c = Y;
    }, this.getBaseLayer = function() {
      return u !== null ? u : m;
    }, this.getBinding = function() {
      return d;
    }, this.getFrame = function() {
      return g;
    }, this.getSession = function() {
      return i;
    }, this.setSession = async function(Y) {
      if (i = Y, i !== null) {
        if (p = e.getRenderTarget(), i.addEventListener("select", L), i.addEventListener("selectstart", L), i.addEventListener("selectend", L), i.addEventListener("squeeze", L), i.addEventListener("squeezestart", L), i.addEventListener("squeezeend", L), i.addEventListener("end", U), i.addEventListener("inputsourceschange", O), f.xrCompatible !== !0 && await t.makeXRCompatible(), T = e.getPixelRatio(), e.getSize(A), typeof XRWebGLBinding < "u" && "createProjectionLayer" in XRWebGLBinding.prototype) {
          let ge = null, ae = null, we = null;
          f.depth && (we = f.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, ge = f.stencil ? ji : Yi, ae = f.stencil ? qi : ni);
          const je = {
            colorFormat: t.RGBA8,
            depthFormat: we,
            scaleFactor: s
          };
          d = new XRWebGLBinding(i, t), u = d.createProjectionLayer(je), i.updateRenderState({ layers: [u] }), e.setPixelRatio(1), e.setSize(u.textureWidth, u.textureHeight, !1), v = new ii(
            u.textureWidth,
            u.textureHeight,
            {
              format: Zt,
              type: an,
              depthTexture: new ql(u.textureWidth, u.textureHeight, ae, void 0, void 0, void 0, void 0, void 0, void 0, ge),
              stencilBuffer: f.stencil,
              colorSpace: e.outputColorSpace,
              samples: f.antialias ? 4 : 0,
              resolveDepthBuffer: u.ignoreDepthValues === !1,
              resolveStencilBuffer: u.ignoreDepthValues === !1
            }
          );
        } else {
          const ge = {
            antialias: f.antialias,
            alpha: !0,
            depth: f.depth,
            stencil: f.stencil,
            framebufferScaleFactor: s
          };
          m = new XRWebGLLayer(i, t, ge), i.updateRenderState({ baseLayer: m }), e.setPixelRatio(1), e.setSize(m.framebufferWidth, m.framebufferHeight, !1), v = new ii(
            m.framebufferWidth,
            m.framebufferHeight,
            {
              format: Zt,
              type: an,
              colorSpace: e.outputColorSpace,
              stencilBuffer: f.stencil,
              resolveDepthBuffer: m.ignoreDepthValues === !1,
              resolveStencilBuffer: m.ignoreDepthValues === !1
            }
          );
        }
        v.isXRRenderTarget = !0, this.setFoveation(l), c = null, o = await i.requestReferenceSpace(a), ke.setContext(i), ke.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (i !== null)
        return i.environmentBlendMode;
    }, this.getDepthTexture = function() {
      return _.getDepthTexture();
    };
    function O(Y) {
      for (let ie = 0; ie < Y.removed.length; ie++) {
        const ge = Y.removed[ie], ae = x.indexOf(ge);
        ae >= 0 && (x[ae] = null, M[ae].disconnect(ge));
      }
      for (let ie = 0; ie < Y.added.length; ie++) {
        const ge = Y.added[ie];
        let ae = x.indexOf(ge);
        if (ae === -1) {
          for (let je = 0; je < M.length; je++)
            if (je >= x.length) {
              x.push(ge), ae = je;
              break;
            } else if (x[je] === null) {
              x[je] = ge, ae = je;
              break;
            }
          if (ae === -1)
            break;
        }
        const we = M[ae];
        we && we.connect(ge);
      }
    }
    const F = new H(), K = new H();
    function V(Y, ie, ge) {
      F.setFromMatrixPosition(ie.matrixWorld), K.setFromMatrixPosition(ge.matrixWorld);
      const ae = F.distanceTo(K), we = ie.projectionMatrix.elements, je = ge.projectionMatrix.elements, Re = we[14] / (we[10] - 1), ct = we[14] / (we[10] + 1), st = (we[9] + 1) / we[5], Ve = (we[9] - 1) / we[5], I = (we[8] - 1) / we[0], Nt = (je[8] + 1) / je[0], We = Re * I, He = Re * Nt, Se = ae / (-I + Nt), tt = Se * -I;
      if (ie.matrixWorld.decompose(Y.position, Y.quaternion, Y.scale), Y.translateX(tt), Y.translateZ(Se), Y.matrixWorld.compose(Y.position, Y.quaternion, Y.scale), Y.matrixWorldInverse.copy(Y.matrixWorld).invert(), we[10] === -1)
        Y.projectionMatrix.copy(ie.projectionMatrix), Y.projectionMatrixInverse.copy(ie.projectionMatrixInverse);
      else {
        const Me = Re + Se, R = ct + Se, E = We - tt, G = He + (ae - tt), Z = st * ct / R * Me, Q = Ve * ct / R * Me;
        Y.projectionMatrix.makePerspective(E, G, Z, Q, Me, R), Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert();
      }
    }
    function $(Y, ie) {
      ie === null ? Y.matrixWorld.copy(Y.matrix) : Y.matrixWorld.multiplyMatrices(ie.matrixWorld, Y.matrix), Y.matrixWorldInverse.copy(Y.matrixWorld).invert();
    }
    this.updateCamera = function(Y) {
      if (i === null)
        return;
      let ie = Y.near, ge = Y.far;
      _.texture !== null && (_.depthNear > 0 && (ie = _.depthNear), _.depthFar > 0 && (ge = _.depthFar)), y.near = D.near = C.near = ie, y.far = D.far = C.far = ge, (P !== y.near || B !== y.far) && (i.updateRenderState({
        depthNear: y.near,
        depthFar: y.far
      }), P = y.near, B = y.far), C.layers.mask = Y.layers.mask | 2, D.layers.mask = Y.layers.mask | 4, y.layers.mask = C.layers.mask | D.layers.mask;
      const ae = Y.parent, we = y.cameras;
      $(y, ae);
      for (let je = 0; je < we.length; je++)
        $(we[je], ae);
      we.length === 2 ? V(y, C, D) : y.projectionMatrix.copy(C.projectionMatrix), se(Y, y, ae);
    };
    function se(Y, ie, ge) {
      ge === null ? Y.matrix.copy(ie.matrixWorld) : (Y.matrix.copy(ge.matrixWorld), Y.matrix.invert(), Y.matrix.multiply(ie.matrixWorld)), Y.matrix.decompose(Y.position, Y.quaternion, Y.scale), Y.updateMatrixWorld(!0), Y.projectionMatrix.copy(ie.projectionMatrix), Y.projectionMatrixInverse.copy(ie.projectionMatrixInverse), Y.isPerspectiveCamera && (Y.fov = Gs * 2 * Math.atan(1 / Y.projectionMatrix.elements[5]), Y.zoom = 1);
    }
    this.getCamera = function() {
      return y;
    }, this.getFoveation = function() {
      if (!(u === null && m === null))
        return l;
    }, this.setFoveation = function(Y) {
      l = Y, u !== null && (u.fixedFoveation = Y), m !== null && m.fixedFoveation !== void 0 && (m.fixedFoveation = Y);
    }, this.hasDepthSensing = function() {
      return _.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return _.getMesh(y);
    };
    let de = null;
    function ne(Y, ie) {
      if (h = ie.getViewerPose(c || o), g = ie, h !== null) {
        const ge = h.views;
        m !== null && (e.setRenderTargetFramebuffer(v, m.framebuffer), e.setRenderTarget(v));
        let ae = !1;
        ge.length !== y.cameras.length && (y.cameras.length = 0, ae = !0);
        for (let Re = 0; Re < ge.length; Re++) {
          const ct = ge[Re];
          let st = null;
          if (m !== null)
            st = m.getViewport(ct);
          else {
            const I = d.getViewSubImage(u, ct);
            st = I.viewport, Re === 0 && (e.setRenderTargetTextures(
              v,
              I.colorTexture,
              I.depthStencilTexture
            ), e.setRenderTarget(v));
          }
          let Ve = b[Re];
          Ve === void 0 && (Ve = new It(), Ve.layers.enable(Re), Ve.viewport = new lt(), b[Re] = Ve), Ve.matrix.fromArray(ct.transform.matrix), Ve.matrix.decompose(Ve.position, Ve.quaternion, Ve.scale), Ve.projectionMatrix.fromArray(ct.projectionMatrix), Ve.projectionMatrixInverse.copy(Ve.projectionMatrix).invert(), Ve.viewport.set(st.x, st.y, st.width, st.height), Re === 0 && (y.matrix.copy(Ve.matrix), y.matrix.decompose(y.position, y.quaternion, y.scale)), ae === !0 && y.cameras.push(Ve);
        }
        const we = i.enabledFeatures;
        if (we && we.includes("depth-sensing") && i.depthUsage == "gpu-optimized" && d) {
          const Re = d.getDepthInformation(ge[0]);
          Re && Re.isValid && Re.texture && _.init(e, Re, i.renderState);
        }
      }
      for (let ge = 0; ge < M.length; ge++) {
        const ae = x[ge], we = M[ge];
        ae !== null && we !== void 0 && we.update(ae, ie, c || o);
      }
      de && de(Y, ie), ie.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: ie }), g = null;
    }
    const ke = new jl();
    ke.setAnimationLoop(ne), this.setAnimationLoop = function(Y) {
      de = Y;
    }, this.dispose = function() {
    };
  }
}
const Xn = /* @__PURE__ */ new Qt(), W_ = /* @__PURE__ */ new rt();
function X_(r, e) {
  function t(f, p) {
    f.matrixAutoUpdate === !0 && f.updateMatrix(), p.value.copy(f.matrix);
  }
  function n(f, p) {
    p.color.getRGB(f.fogColor.value, Gl(r)), p.isFog ? (f.fogNear.value = p.near, f.fogFar.value = p.far) : p.isFogExp2 && (f.fogDensity.value = p.density);
  }
  function i(f, p, v, M, x) {
    p.isMeshBasicMaterial || p.isMeshLambertMaterial ? s(f, p) : p.isMeshToonMaterial ? (s(f, p), d(f, p)) : p.isMeshPhongMaterial ? (s(f, p), h(f, p)) : p.isMeshStandardMaterial ? (s(f, p), u(f, p), p.isMeshPhysicalMaterial && m(f, p, x)) : p.isMeshMatcapMaterial ? (s(f, p), g(f, p)) : p.isMeshDepthMaterial ? s(f, p) : p.isMeshDistanceMaterial ? (s(f, p), _(f, p)) : p.isMeshNormalMaterial ? s(f, p) : p.isLineBasicMaterial ? (o(f, p), p.isLineDashedMaterial && a(f, p)) : p.isPointsMaterial ? l(f, p, v, M) : p.isSpriteMaterial ? c(f, p) : p.isShadowMaterial ? (f.color.value.copy(p.color), f.opacity.value = p.opacity) : p.isShaderMaterial && (p.uniformsNeedUpdate = !1);
  }
  function s(f, p) {
    f.opacity.value = p.opacity, p.color && f.diffuse.value.copy(p.color), p.emissive && f.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity), p.map && (f.map.value = p.map, t(p.map, f.mapTransform)), p.alphaMap && (f.alphaMap.value = p.alphaMap, t(p.alphaMap, f.alphaMapTransform)), p.bumpMap && (f.bumpMap.value = p.bumpMap, t(p.bumpMap, f.bumpMapTransform), f.bumpScale.value = p.bumpScale, p.side === Pt && (f.bumpScale.value *= -1)), p.normalMap && (f.normalMap.value = p.normalMap, t(p.normalMap, f.normalMapTransform), f.normalScale.value.copy(p.normalScale), p.side === Pt && f.normalScale.value.negate()), p.displacementMap && (f.displacementMap.value = p.displacementMap, t(p.displacementMap, f.displacementMapTransform), f.displacementScale.value = p.displacementScale, f.displacementBias.value = p.displacementBias), p.emissiveMap && (f.emissiveMap.value = p.emissiveMap, t(p.emissiveMap, f.emissiveMapTransform)), p.specularMap && (f.specularMap.value = p.specularMap, t(p.specularMap, f.specularMapTransform)), p.alphaTest > 0 && (f.alphaTest.value = p.alphaTest);
    const v = e.get(p), M = v.envMap, x = v.envMapRotation;
    M && (f.envMap.value = M, Xn.copy(x), Xn.x *= -1, Xn.y *= -1, Xn.z *= -1, M.isCubeTexture && M.isRenderTargetTexture === !1 && (Xn.y *= -1, Xn.z *= -1), f.envMapRotation.value.setFromMatrix4(W_.makeRotationFromEuler(Xn)), f.flipEnvMap.value = M.isCubeTexture && M.isRenderTargetTexture === !1 ? -1 : 1, f.reflectivity.value = p.reflectivity, f.ior.value = p.ior, f.refractionRatio.value = p.refractionRatio), p.lightMap && (f.lightMap.value = p.lightMap, f.lightMapIntensity.value = p.lightMapIntensity, t(p.lightMap, f.lightMapTransform)), p.aoMap && (f.aoMap.value = p.aoMap, f.aoMapIntensity.value = p.aoMapIntensity, t(p.aoMap, f.aoMapTransform));
  }
  function o(f, p) {
    f.diffuse.value.copy(p.color), f.opacity.value = p.opacity, p.map && (f.map.value = p.map, t(p.map, f.mapTransform));
  }
  function a(f, p) {
    f.dashSize.value = p.dashSize, f.totalSize.value = p.dashSize + p.gapSize, f.scale.value = p.scale;
  }
  function l(f, p, v, M) {
    f.diffuse.value.copy(p.color), f.opacity.value = p.opacity, f.size.value = p.size * v, f.scale.value = M * 0.5, p.map && (f.map.value = p.map, t(p.map, f.uvTransform)), p.alphaMap && (f.alphaMap.value = p.alphaMap, t(p.alphaMap, f.alphaMapTransform)), p.alphaTest > 0 && (f.alphaTest.value = p.alphaTest);
  }
  function c(f, p) {
    f.diffuse.value.copy(p.color), f.opacity.value = p.opacity, f.rotation.value = p.rotation, p.map && (f.map.value = p.map, t(p.map, f.mapTransform)), p.alphaMap && (f.alphaMap.value = p.alphaMap, t(p.alphaMap, f.alphaMapTransform)), p.alphaTest > 0 && (f.alphaTest.value = p.alphaTest);
  }
  function h(f, p) {
    f.specular.value.copy(p.specular), f.shininess.value = Math.max(p.shininess, 1e-4);
  }
  function d(f, p) {
    p.gradientMap && (f.gradientMap.value = p.gradientMap);
  }
  function u(f, p) {
    f.metalness.value = p.metalness, p.metalnessMap && (f.metalnessMap.value = p.metalnessMap, t(p.metalnessMap, f.metalnessMapTransform)), f.roughness.value = p.roughness, p.roughnessMap && (f.roughnessMap.value = p.roughnessMap, t(p.roughnessMap, f.roughnessMapTransform)), p.envMap && (f.envMapIntensity.value = p.envMapIntensity);
  }
  function m(f, p, v) {
    f.ior.value = p.ior, p.sheen > 0 && (f.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen), f.sheenRoughness.value = p.sheenRoughness, p.sheenColorMap && (f.sheenColorMap.value = p.sheenColorMap, t(p.sheenColorMap, f.sheenColorMapTransform)), p.sheenRoughnessMap && (f.sheenRoughnessMap.value = p.sheenRoughnessMap, t(p.sheenRoughnessMap, f.sheenRoughnessMapTransform))), p.clearcoat > 0 && (f.clearcoat.value = p.clearcoat, f.clearcoatRoughness.value = p.clearcoatRoughness, p.clearcoatMap && (f.clearcoatMap.value = p.clearcoatMap, t(p.clearcoatMap, f.clearcoatMapTransform)), p.clearcoatRoughnessMap && (f.clearcoatRoughnessMap.value = p.clearcoatRoughnessMap, t(p.clearcoatRoughnessMap, f.clearcoatRoughnessMapTransform)), p.clearcoatNormalMap && (f.clearcoatNormalMap.value = p.clearcoatNormalMap, t(p.clearcoatNormalMap, f.clearcoatNormalMapTransform), f.clearcoatNormalScale.value.copy(p.clearcoatNormalScale), p.side === Pt && f.clearcoatNormalScale.value.negate())), p.dispersion > 0 && (f.dispersion.value = p.dispersion), p.iridescence > 0 && (f.iridescence.value = p.iridescence, f.iridescenceIOR.value = p.iridescenceIOR, f.iridescenceThicknessMinimum.value = p.iridescenceThicknessRange[0], f.iridescenceThicknessMaximum.value = p.iridescenceThicknessRange[1], p.iridescenceMap && (f.iridescenceMap.value = p.iridescenceMap, t(p.iridescenceMap, f.iridescenceMapTransform)), p.iridescenceThicknessMap && (f.iridescenceThicknessMap.value = p.iridescenceThicknessMap, t(p.iridescenceThicknessMap, f.iridescenceThicknessMapTransform))), p.transmission > 0 && (f.transmission.value = p.transmission, f.transmissionSamplerMap.value = v.texture, f.transmissionSamplerSize.value.set(v.width, v.height), p.transmissionMap && (f.transmissionMap.value = p.transmissionMap, t(p.transmissionMap, f.transmissionMapTransform)), f.thickness.value = p.thickness, p.thicknessMap && (f.thicknessMap.value = p.thicknessMap, t(p.thicknessMap, f.thicknessMapTransform)), f.attenuationDistance.value = p.attenuationDistance, f.attenuationColor.value.copy(p.attenuationColor)), p.anisotropy > 0 && (f.anisotropyVector.value.set(p.anisotropy * Math.cos(p.anisotropyRotation), p.anisotropy * Math.sin(p.anisotropyRotation)), p.anisotropyMap && (f.anisotropyMap.value = p.anisotropyMap, t(p.anisotropyMap, f.anisotropyMapTransform))), f.specularIntensity.value = p.specularIntensity, f.specularColor.value.copy(p.specularColor), p.specularColorMap && (f.specularColorMap.value = p.specularColorMap, t(p.specularColorMap, f.specularColorMapTransform)), p.specularIntensityMap && (f.specularIntensityMap.value = p.specularIntensityMap, t(p.specularIntensityMap, f.specularIntensityMapTransform));
  }
  function g(f, p) {
    p.matcap && (f.matcap.value = p.matcap);
  }
  function _(f, p) {
    const v = e.get(p).light;
    f.referencePosition.value.setFromMatrixPosition(v.matrixWorld), f.nearDistance.value = v.shadow.camera.near, f.farDistance.value = v.shadow.camera.far;
  }
  return {
    refreshFogUniforms: n,
    refreshMaterialUniforms: i
  };
}
function q_(r, e, t, n) {
  let i = {}, s = {}, o = [];
  const a = r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(v, M) {
    const x = M.program;
    n.uniformBlockBinding(v, x);
  }
  function c(v, M) {
    let x = i[v.id];
    x === void 0 && (g(v), x = h(v), i[v.id] = x, v.addEventListener("dispose", f));
    const A = M.program;
    n.updateUBOMapping(v, A);
    const T = e.render.frame;
    s[v.id] !== T && (u(v), s[v.id] = T);
  }
  function h(v) {
    const M = d();
    v.__bindingPointIndex = M;
    const x = r.createBuffer(), A = v.__size, T = v.usage;
    return r.bindBuffer(r.UNIFORM_BUFFER, x), r.bufferData(r.UNIFORM_BUFFER, A, T), r.bindBuffer(r.UNIFORM_BUFFER, null), r.bindBufferBase(r.UNIFORM_BUFFER, M, x), x;
  }
  function d() {
    for (let v = 0; v < a; v++)
      if (o.indexOf(v) === -1)
        return o.push(v), v;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function u(v) {
    const M = i[v.id], x = v.uniforms, A = v.__cache;
    r.bindBuffer(r.UNIFORM_BUFFER, M);
    for (let T = 0, C = x.length; T < C; T++) {
      const D = Array.isArray(x[T]) ? x[T] : [x[T]];
      for (let b = 0, y = D.length; b < y; b++) {
        const P = D[b];
        if (m(P, T, b, A) === !0) {
          const B = P.__offset, L = Array.isArray(P.value) ? P.value : [P.value];
          let U = 0;
          for (let O = 0; O < L.length; O++) {
            const F = L[O], K = _(F);
            typeof F == "number" || typeof F == "boolean" ? (P.__data[0] = F, r.bufferSubData(r.UNIFORM_BUFFER, B + U, P.__data)) : F.isMatrix3 ? (P.__data[0] = F.elements[0], P.__data[1] = F.elements[1], P.__data[2] = F.elements[2], P.__data[3] = 0, P.__data[4] = F.elements[3], P.__data[5] = F.elements[4], P.__data[6] = F.elements[5], P.__data[7] = 0, P.__data[8] = F.elements[6], P.__data[9] = F.elements[7], P.__data[10] = F.elements[8], P.__data[11] = 0) : (F.toArray(P.__data, U), U += K.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          r.bufferSubData(r.UNIFORM_BUFFER, B, P.__data);
        }
      }
    }
    r.bindBuffer(r.UNIFORM_BUFFER, null);
  }
  function m(v, M, x, A) {
    const T = v.value, C = M + "_" + x;
    if (A[C] === void 0)
      return typeof T == "number" || typeof T == "boolean" ? A[C] = T : A[C] = T.clone(), !0;
    {
      const D = A[C];
      if (typeof T == "number" || typeof T == "boolean") {
        if (D !== T)
          return A[C] = T, !0;
      } else if (D.equals(T) === !1)
        return D.copy(T), !0;
    }
    return !1;
  }
  function g(v) {
    const M = v.uniforms;
    let x = 0;
    const A = 16;
    for (let C = 0, D = M.length; C < D; C++) {
      const b = Array.isArray(M[C]) ? M[C] : [M[C]];
      for (let y = 0, P = b.length; y < P; y++) {
        const B = b[y], L = Array.isArray(B.value) ? B.value : [B.value];
        for (let U = 0, O = L.length; U < O; U++) {
          const F = L[U], K = _(F), V = x % A, $ = V % K.boundary, se = V + $;
          x += $, se !== 0 && A - se < K.storage && (x += A - se), B.__data = new Float32Array(K.storage / Float32Array.BYTES_PER_ELEMENT), B.__offset = x, x += K.storage;
        }
      }
    }
    const T = x % A;
    return T > 0 && (x += A - T), v.__size = x, v.__cache = {}, this;
  }
  function _(v) {
    const M = {
      boundary: 0,
      storage: 0
    };
    return typeof v == "number" || typeof v == "boolean" ? (M.boundary = 4, M.storage = 4) : v.isVector2 ? (M.boundary = 8, M.storage = 8) : v.isVector3 || v.isColor ? (M.boundary = 16, M.storage = 12) : v.isVector4 ? (M.boundary = 16, M.storage = 16) : v.isMatrix3 ? (M.boundary = 48, M.storage = 48) : v.isMatrix4 ? (M.boundary = 64, M.storage = 64) : v.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", v), M;
  }
  function f(v) {
    const M = v.target;
    M.removeEventListener("dispose", f);
    const x = o.indexOf(M.__bindingPointIndex);
    o.splice(x, 1), r.deleteBuffer(i[M.id]), delete i[M.id], delete s[M.id];
  }
  function p() {
    for (const v in i)
      r.deleteBuffer(i[v]);
    o = [], i = {}, s = {};
  }
  return {
    bind: l,
    update: c,
    dispose: p
  };
}
class Y_ {
  constructor(e = {}) {
    const {
      canvas: t = Md(),
      context: n = null,
      depth: i = !0,
      stencil: s = !1,
      alpha: o = !1,
      antialias: a = !1,
      premultipliedAlpha: l = !0,
      preserveDrawingBuffer: c = !1,
      powerPreference: h = "default",
      failIfMajorPerformanceCaveat: d = !1,
      reverseDepthBuffer: u = !1
    } = e;
    this.isWebGLRenderer = !0;
    let m;
    if (n !== null) {
      if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext)
        throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      m = n.getContextAttributes().alpha;
    } else
      m = o;
    const g = new Uint32Array(4), _ = new Int32Array(4);
    let f = null, p = null;
    const v = [], M = [];
    this.domElement = t, this.debug = {
      checkShaderErrors: !0,
      onShaderError: null
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this.toneMapping = In, this.toneMappingExposure = 1, this.transmissionResolutionScale = 1;
    const x = this;
    let A = !1;
    this._outputColorSpace = Vt;
    let T = 0, C = 0, D = null, b = -1, y = null;
    const P = new lt(), B = new lt();
    let L = null;
    const U = new Oe(0);
    let O = 0, F = t.width, K = t.height, V = 1, $ = null, se = null;
    const de = new lt(0, 0, F, K), ne = new lt(0, 0, F, K);
    let ke = !1;
    const Y = new Oo();
    let ie = !1, ge = !1;
    const ae = new rt(), we = new rt(), je = new H(), Re = new lt(), ct = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 };
    let st = !1;
    function Ve() {
      return D === null ? V : 1;
    }
    let I = n;
    function Nt(w, z) {
      return t.getContext(w, z);
    }
    try {
      const w = {
        alpha: !0,
        depth: i,
        stencil: s,
        antialias: a,
        premultipliedAlpha: l,
        preserveDrawingBuffer: c,
        powerPreference: h,
        failIfMajorPerformanceCaveat: d
      };
      if ("setAttribute" in t && t.setAttribute("data-engine", `three.js r${To}`), t.addEventListener("webglcontextlost", J, !1), t.addEventListener("webglcontextrestored", fe, !1), t.addEventListener("webglcontextcreationerror", ue, !1), I === null) {
        const z = "webgl2";
        if (I = Nt(z, w), I === null)
          throw Nt(z) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (w) {
      throw console.error("THREE.WebGLRenderer: " + w.message), w;
    }
    let We, He, Se, tt, Me, R, E, G, Z, Q, j, ye, ce, Te, Ae, ee, _e, Ce, De, ve, Ge, Ue, et, N;
    function he() {
      We = new ig(I), We.init(), Ue = new z_(I, We), He = new Zm(I, We, e, Ue), Se = new O_(I, We), He.reverseDepthBuffer && u && Se.buffers.depth.setReversed(!0), tt = new og(I), Me = new b_(), R = new B_(I, We, Se, Me, He, Ue, tt), E = new Jm(x), G = new ng(x), Z = new df(I), et = new jm(I, Z), Q = new sg(I, Z, tt, et), j = new lg(I, Q, Z, tt), De = new ag(I, He, R), ee = new $m(Me), ye = new E_(x, E, G, We, He, et, ee), ce = new X_(x, Me), Te = new T_(), Ae = new L_(We), Ce = new Ym(x, E, G, Se, j, m, l), _e = new U_(x, j, He), N = new q_(I, tt, He, Se), ve = new Km(I, We, tt), Ge = new rg(I, We, tt), tt.programs = ye.programs, x.capabilities = He, x.extensions = We, x.properties = Me, x.renderLists = Te, x.shadowMap = _e, x.state = Se, x.info = tt;
    }
    he();
    const q = new G_(x, I);
    this.xr = q, this.getContext = function() {
      return I;
    }, this.getContextAttributes = function() {
      return I.getContextAttributes();
    }, this.forceContextLoss = function() {
      const w = We.get("WEBGL_lose_context");
      w && w.loseContext();
    }, this.forceContextRestore = function() {
      const w = We.get("WEBGL_lose_context");
      w && w.restoreContext();
    }, this.getPixelRatio = function() {
      return V;
    }, this.setPixelRatio = function(w) {
      w !== void 0 && (V = w, this.setSize(F, K, !1));
    }, this.getSize = function(w) {
      return w.set(F, K);
    }, this.setSize = function(w, z, W = !0) {
      if (q.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      F = w, K = z, t.width = Math.floor(w * V), t.height = Math.floor(z * V), W === !0 && (t.style.width = w + "px", t.style.height = z + "px"), this.setViewport(0, 0, w, z);
    }, this.getDrawingBufferSize = function(w) {
      return w.set(F * V, K * V).floor();
    }, this.setDrawingBufferSize = function(w, z, W) {
      F = w, K = z, V = W, t.width = Math.floor(w * W), t.height = Math.floor(z * W), this.setViewport(0, 0, w, z);
    }, this.getCurrentViewport = function(w) {
      return w.copy(P);
    }, this.getViewport = function(w) {
      return w.copy(de);
    }, this.setViewport = function(w, z, W, X) {
      w.isVector4 ? de.set(w.x, w.y, w.z, w.w) : de.set(w, z, W, X), Se.viewport(P.copy(de).multiplyScalar(V).round());
    }, this.getScissor = function(w) {
      return w.copy(ne);
    }, this.setScissor = function(w, z, W, X) {
      w.isVector4 ? ne.set(w.x, w.y, w.z, w.w) : ne.set(w, z, W, X), Se.scissor(B.copy(ne).multiplyScalar(V).round());
    }, this.getScissorTest = function() {
      return ke;
    }, this.setScissorTest = function(w) {
      Se.setScissorTest(ke = w);
    }, this.setOpaqueSort = function(w) {
      $ = w;
    }, this.setTransparentSort = function(w) {
      se = w;
    }, this.getClearColor = function(w) {
      return w.copy(Ce.getClearColor());
    }, this.setClearColor = function() {
      Ce.setClearColor(...arguments);
    }, this.getClearAlpha = function() {
      return Ce.getClearAlpha();
    }, this.setClearAlpha = function() {
      Ce.setClearAlpha(...arguments);
    }, this.clear = function(w = !0, z = !0, W = !0) {
      let X = 0;
      if (w) {
        let k = !1;
        if (D !== null) {
          const te = D.texture.format;
          k = te === Fo || te === Lo || te === Do;
        }
        if (k) {
          const te = D.texture.type, le = te === an || te === ni || te === Xi || te === qi || te === Ro || te === Po, pe = Ce.getClearColor(), xe = Ce.getClearAlpha(), Le = pe.r, Pe = pe.g, Ee = pe.b;
          le ? (g[0] = Le, g[1] = Pe, g[2] = Ee, g[3] = xe, I.clearBufferuiv(I.COLOR, 0, g)) : (_[0] = Le, _[1] = Pe, _[2] = Ee, _[3] = xe, I.clearBufferiv(I.COLOR, 0, _));
        } else
          X |= I.COLOR_BUFFER_BIT;
      }
      z && (X |= I.DEPTH_BUFFER_BIT), W && (X |= I.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), I.clear(X);
    }, this.clearColor = function() {
      this.clear(!0, !1, !1);
    }, this.clearDepth = function() {
      this.clear(!1, !0, !1);
    }, this.clearStencil = function() {
      this.clear(!1, !1, !0);
    }, this.dispose = function() {
      t.removeEventListener("webglcontextlost", J, !1), t.removeEventListener("webglcontextrestored", fe, !1), t.removeEventListener("webglcontextcreationerror", ue, !1), Ce.dispose(), Te.dispose(), Ae.dispose(), Me.dispose(), E.dispose(), G.dispose(), j.dispose(), et.dispose(), N.dispose(), ye.dispose(), q.dispose(), q.removeEventListener("sessionstart", ko), q.removeEventListener("sessionend", Vo), On.stop();
    };
    function J(w) {
      w.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), A = !0;
    }
    function fe() {
      console.log("THREE.WebGLRenderer: Context Restored."), A = !1;
      const w = tt.autoReset, z = _e.enabled, W = _e.autoUpdate, X = _e.needsUpdate, k = _e.type;
      he(), tt.autoReset = w, _e.enabled = z, _e.autoUpdate = W, _e.needsUpdate = X, _e.type = k;
    }
    function ue(w) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", w.statusMessage);
    }
    function Fe(w) {
      const z = w.target;
      z.removeEventListener("dispose", Fe), ot(z);
    }
    function ot(w) {
      yt(w), Me.remove(w);
    }
    function yt(w) {
      const z = Me.get(w).programs;
      z !== void 0 && (z.forEach(function(W) {
        ye.releaseProgram(W);
      }), w.isShaderMaterial && ye.releaseShaderCache(w));
    }
    this.renderBufferDirect = function(w, z, W, X, k, te) {
      z === null && (z = ct);
      const le = k.isMesh && k.matrixWorld.determinant() < 0, pe = Ql(w, z, W, X, k);
      Se.setMaterial(X, le);
      let xe = W.index, Le = 1;
      if (X.wireframe === !0) {
        if (xe = Q.getWireframeAttribute(W), xe === void 0)
          return;
        Le = 2;
      }
      const Pe = W.drawRange, Ee = W.attributes.position;
      let Xe = Pe.start * Le, Ze = (Pe.start + Pe.count) * Le;
      te !== null && (Xe = Math.max(Xe, te.start * Le), Ze = Math.min(Ze, (te.start + te.count) * Le)), xe !== null ? (Xe = Math.max(Xe, 0), Ze = Math.min(Ze, xe.count)) : Ee != null && (Xe = Math.max(Xe, 0), Ze = Math.min(Ze, Ee.count));
      const ht = Ze - Xe;
      if (ht < 0 || ht === 1 / 0)
        return;
      et.setup(k, X, pe, W, xe);
      let at, qe = ve;
      if (xe !== null && (at = Z.get(xe), qe = Ge, qe.setIndex(at)), k.isMesh)
        X.wireframe === !0 ? (Se.setLineWidth(X.wireframeLinewidth * Ve()), qe.setMode(I.LINES)) : qe.setMode(I.TRIANGLES);
      else if (k.isLine) {
        let be = X.linewidth;
        be === void 0 && (be = 1), Se.setLineWidth(be * Ve()), k.isLineSegments ? qe.setMode(I.LINES) : k.isLineLoop ? qe.setMode(I.LINE_LOOP) : qe.setMode(I.LINE_STRIP);
      } else
        k.isPoints ? qe.setMode(I.POINTS) : k.isSprite && qe.setMode(I.TRIANGLES);
      if (k.isBatchedMesh)
        if (k._multiDrawInstances !== null)
          Os("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."), qe.renderMultiDrawInstances(k._multiDrawStarts, k._multiDrawCounts, k._multiDrawCount, k._multiDrawInstances);
        else if (We.get("WEBGL_multi_draw"))
          qe.renderMultiDraw(k._multiDrawStarts, k._multiDrawCounts, k._multiDrawCount);
        else {
          const be = k._multiDrawStarts, vt = k._multiDrawCounts, $e = k._multiDrawCount, Gt = xe ? Z.get(xe).bytesPerElement : 1, ri = Me.get(X).currentProgram.getUniforms();
          for (let Dt = 0; Dt < $e; Dt++)
            ri.setValue(I, "_gl_DrawID", Dt), qe.render(be[Dt] / Gt, vt[Dt]);
        }
      else if (k.isInstancedMesh)
        qe.renderInstances(Xe, ht, k.count);
      else if (W.isInstancedBufferGeometry) {
        const be = W._maxInstanceCount !== void 0 ? W._maxInstanceCount : 1 / 0, vt = Math.min(W.instanceCount, be);
        qe.renderInstances(Xe, ht, vt);
      } else
        qe.render(Xe, ht);
    };
    function Je(w, z, W) {
      w.transparent === !0 && w.side === Mn && w.forceSinglePass === !1 ? (w.side = Pt, w.needsUpdate = !0, ss(w, z, W), w.side = Un, w.needsUpdate = !0, ss(w, z, W), w.side = Mn) : ss(w, z, W);
    }
    this.compile = function(w, z, W = null) {
      W === null && (W = w), p = Ae.get(W), p.init(z), M.push(p), W.traverseVisible(function(k) {
        k.isLight && k.layers.test(z.layers) && (p.pushLight(k), k.castShadow && p.pushShadow(k));
      }), w !== W && w.traverseVisible(function(k) {
        k.isLight && k.layers.test(z.layers) && (p.pushLight(k), k.castShadow && p.pushShadow(k));
      }), p.setupLights();
      const X = /* @__PURE__ */ new Set();
      return w.traverse(function(k) {
        if (!(k.isMesh || k.isPoints || k.isLine || k.isSprite))
          return;
        const te = k.material;
        if (te)
          if (Array.isArray(te))
            for (let le = 0; le < te.length; le++) {
              const pe = te[le];
              Je(pe, W, k), X.add(pe);
            }
          else
            Je(te, W, k), X.add(te);
      }), p = M.pop(), X;
    }, this.compileAsync = function(w, z, W = null) {
      const X = this.compile(w, z, W);
      return new Promise((k) => {
        function te() {
          if (X.forEach(function(le) {
            Me.get(le).currentProgram.isReady() && X.delete(le);
          }), X.size === 0) {
            k(w);
            return;
          }
          setTimeout(te, 10);
        }
        We.get("KHR_parallel_shader_compile") !== null ? te() : setTimeout(te, 10);
      });
    };
    let Ht = null;
    function cn(w) {
      Ht && Ht(w);
    }
    function ko() {
      On.stop();
    }
    function Vo() {
      On.start();
    }
    const On = new jl();
    On.setAnimationLoop(cn), typeof self < "u" && On.setContext(self), this.setAnimationLoop = function(w) {
      Ht = w, q.setAnimationLoop(w), w === null ? On.stop() : On.start();
    }, q.addEventListener("sessionstart", ko), q.addEventListener("sessionend", Vo), this.render = function(w, z) {
      if (z !== void 0 && z.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (A === !0)
        return;
      if (w.matrixWorldAutoUpdate === !0 && w.updateMatrixWorld(), z.parent === null && z.matrixWorldAutoUpdate === !0 && z.updateMatrixWorld(), q.enabled === !0 && q.isPresenting === !0 && (q.cameraAutoUpdate === !0 && q.updateCamera(z), z = q.getCamera()), w.isScene === !0 && w.onBeforeRender(x, w, z, D), p = Ae.get(w, M.length), p.init(z), M.push(p), we.multiplyMatrices(z.projectionMatrix, z.matrixWorldInverse), Y.setFromProjectionMatrix(we), ge = this.localClippingEnabled, ie = ee.init(this.clippingPlanes, ge), f = Te.get(w, v.length), f.init(), v.push(f), q.enabled === !0 && q.isPresenting === !0) {
        const te = x.xr.getDepthSensingMesh();
        te !== null && Ys(te, z, -1 / 0, x.sortObjects);
      }
      Ys(w, z, 0, x.sortObjects), f.finish(), x.sortObjects === !0 && f.sort($, se), st = q.enabled === !1 || q.isPresenting === !1 || q.hasDepthSensing() === !1, st && Ce.addToRenderList(f, w), this.info.render.frame++, ie === !0 && ee.beginShadows();
      const W = p.state.shadowsArray;
      _e.render(W, w, z), ie === !0 && ee.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const X = f.opaque, k = f.transmissive;
      if (p.setupLights(), z.isArrayCamera) {
        const te = z.cameras;
        if (k.length > 0)
          for (let le = 0, pe = te.length; le < pe; le++) {
            const xe = te[le];
            Go(X, k, w, xe);
          }
        st && Ce.render(w);
        for (let le = 0, pe = te.length; le < pe; le++) {
          const xe = te[le];
          Ho(f, w, xe, xe.viewport);
        }
      } else
        k.length > 0 && Go(X, k, w, z), st && Ce.render(w), Ho(f, w, z);
      D !== null && C === 0 && (R.updateMultisampleRenderTarget(D), R.updateRenderTargetMipmap(D)), w.isScene === !0 && w.onAfterRender(x, w, z), et.resetDefaultState(), b = -1, y = null, M.pop(), M.length > 0 ? (p = M[M.length - 1], ie === !0 && ee.setGlobalState(x.clippingPlanes, p.state.camera)) : p = null, v.pop(), v.length > 0 ? f = v[v.length - 1] : f = null;
    };
    function Ys(w, z, W, X) {
      if (w.visible === !1)
        return;
      if (w.layers.test(z.layers)) {
        if (w.isGroup)
          W = w.renderOrder;
        else if (w.isLOD)
          w.autoUpdate === !0 && w.update(z);
        else if (w.isLight)
          p.pushLight(w), w.castShadow && p.pushShadow(w);
        else if (w.isSprite) {
          if (!w.frustumCulled || Y.intersectsSprite(w)) {
            X && Re.setFromMatrixPosition(w.matrixWorld).applyMatrix4(we);
            const le = j.update(w), pe = w.material;
            pe.visible && f.push(w, le, pe, W, Re.z, null);
          }
        } else if ((w.isMesh || w.isLine || w.isPoints) && (!w.frustumCulled || Y.intersectsObject(w))) {
          const le = j.update(w), pe = w.material;
          if (X && (w.boundingSphere !== void 0 ? (w.boundingSphere === null && w.computeBoundingSphere(), Re.copy(w.boundingSphere.center)) : (le.boundingSphere === null && le.computeBoundingSphere(), Re.copy(le.boundingSphere.center)), Re.applyMatrix4(w.matrixWorld).applyMatrix4(we)), Array.isArray(pe)) {
            const xe = le.groups;
            for (let Le = 0, Pe = xe.length; Le < Pe; Le++) {
              const Ee = xe[Le], Xe = pe[Ee.materialIndex];
              Xe && Xe.visible && f.push(w, le, Xe, W, Re.z, Ee);
            }
          } else
            pe.visible && f.push(w, le, pe, W, Re.z, null);
        }
      }
      const te = w.children;
      for (let le = 0, pe = te.length; le < pe; le++)
        Ys(te[le], z, W, X);
    }
    function Ho(w, z, W, X) {
      const k = w.opaque, te = w.transmissive, le = w.transparent;
      p.setupLightsView(W), ie === !0 && ee.setGlobalState(x.clippingPlanes, W), X && Se.viewport(P.copy(X)), k.length > 0 && is(k, z, W), te.length > 0 && is(te, z, W), le.length > 0 && is(le, z, W), Se.buffers.depth.setTest(!0), Se.buffers.depth.setMask(!0), Se.buffers.color.setMask(!0), Se.setPolygonOffset(!1);
    }
    function Go(w, z, W, X) {
      if ((W.isScene === !0 ? W.overrideMaterial : null) !== null)
        return;
      p.state.transmissionRenderTarget[X.id] === void 0 && (p.state.transmissionRenderTarget[X.id] = new ii(1, 1, {
        generateMipmaps: !0,
        type: We.has("EXT_color_buffer_half_float") || We.has("EXT_color_buffer_float") ? $i : an,
        minFilter: Jn,
        samples: 4,
        stencilBuffer: s,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: Ye.workingColorSpace
      }));
      const te = p.state.transmissionRenderTarget[X.id], le = X.viewport || P;
      te.setSize(le.z * x.transmissionResolutionScale, le.w * x.transmissionResolutionScale);
      const pe = x.getRenderTarget();
      x.setRenderTarget(te), x.getClearColor(U), O = x.getClearAlpha(), O < 1 && x.setClearColor(16777215, 0.5), x.clear(), st && Ce.render(W);
      const xe = x.toneMapping;
      x.toneMapping = In;
      const Le = X.viewport;
      if (X.viewport !== void 0 && (X.viewport = void 0), p.setupLightsView(X), ie === !0 && ee.setGlobalState(x.clippingPlanes, X), is(w, W, X), R.updateMultisampleRenderTarget(te), R.updateRenderTargetMipmap(te), We.has("WEBGL_multisampled_render_to_texture") === !1) {
        let Pe = !1;
        for (let Ee = 0, Xe = z.length; Ee < Xe; Ee++) {
          const Ze = z[Ee], ht = Ze.object, at = Ze.geometry, qe = Ze.material, be = Ze.group;
          if (qe.side === Mn && ht.layers.test(X.layers)) {
            const vt = qe.side;
            qe.side = Pt, qe.needsUpdate = !0, Wo(ht, W, X, at, qe, be), qe.side = vt, qe.needsUpdate = !0, Pe = !0;
          }
        }
        Pe === !0 && (R.updateMultisampleRenderTarget(te), R.updateRenderTargetMipmap(te));
      }
      x.setRenderTarget(pe), x.setClearColor(U, O), Le !== void 0 && (X.viewport = Le), x.toneMapping = xe;
    }
    function is(w, z, W) {
      const X = z.isScene === !0 ? z.overrideMaterial : null;
      for (let k = 0, te = w.length; k < te; k++) {
        const le = w[k], pe = le.object, xe = le.geometry, Le = le.group;
        let Pe = le.material;
        Pe.allowOverride === !0 && X !== null && (Pe = X), pe.layers.test(W.layers) && Wo(pe, z, W, xe, Pe, Le);
      }
    }
    function Wo(w, z, W, X, k, te) {
      w.onBeforeRender(x, z, W, X, k, te), w.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse, w.matrixWorld), w.normalMatrix.getNormalMatrix(w.modelViewMatrix), k.onBeforeRender(x, z, W, X, w, te), k.transparent === !0 && k.side === Mn && k.forceSinglePass === !1 ? (k.side = Pt, k.needsUpdate = !0, x.renderBufferDirect(W, z, X, k, w, te), k.side = Un, k.needsUpdate = !0, x.renderBufferDirect(W, z, X, k, w, te), k.side = Mn) : x.renderBufferDirect(W, z, X, k, w, te), w.onAfterRender(x, z, W, X, k, te);
    }
    function ss(w, z, W) {
      z.isScene !== !0 && (z = ct);
      const X = Me.get(w), k = p.state.lights, te = p.state.shadowsArray, le = k.state.version, pe = ye.getParameters(w, k.state, te, z, W), xe = ye.getProgramCacheKey(pe);
      let Le = X.programs;
      X.environment = w.isMeshStandardMaterial ? z.environment : null, X.fog = z.fog, X.envMap = (w.isMeshStandardMaterial ? G : E).get(w.envMap || X.environment), X.envMapRotation = X.environment !== null && w.envMap === null ? z.environmentRotation : w.envMapRotation, Le === void 0 && (w.addEventListener("dispose", Fe), Le = /* @__PURE__ */ new Map(), X.programs = Le);
      let Pe = Le.get(xe);
      if (Pe !== void 0) {
        if (X.currentProgram === Pe && X.lightsStateVersion === le)
          return qo(w, pe), Pe;
      } else
        pe.uniforms = ye.getUniforms(w), w.onBeforeCompile(pe, x), Pe = ye.acquireProgram(pe, xe), Le.set(xe, Pe), X.uniforms = pe.uniforms;
      const Ee = X.uniforms;
      return (!w.isShaderMaterial && !w.isRawShaderMaterial || w.clipping === !0) && (Ee.clippingPlanes = ee.uniform), qo(w, pe), X.needsLights = tc(w), X.lightsStateVersion = le, X.needsLights && (Ee.ambientLightColor.value = k.state.ambient, Ee.lightProbe.value = k.state.probe, Ee.directionalLights.value = k.state.directional, Ee.directionalLightShadows.value = k.state.directionalShadow, Ee.spotLights.value = k.state.spot, Ee.spotLightShadows.value = k.state.spotShadow, Ee.rectAreaLights.value = k.state.rectArea, Ee.ltc_1.value = k.state.rectAreaLTC1, Ee.ltc_2.value = k.state.rectAreaLTC2, Ee.pointLights.value = k.state.point, Ee.pointLightShadows.value = k.state.pointShadow, Ee.hemisphereLights.value = k.state.hemi, Ee.directionalShadowMap.value = k.state.directionalShadowMap, Ee.directionalShadowMatrix.value = k.state.directionalShadowMatrix, Ee.spotShadowMap.value = k.state.spotShadowMap, Ee.spotLightMatrix.value = k.state.spotLightMatrix, Ee.spotLightMap.value = k.state.spotLightMap, Ee.pointShadowMap.value = k.state.pointShadowMap, Ee.pointShadowMatrix.value = k.state.pointShadowMatrix), X.currentProgram = Pe, X.uniformsList = null, Pe;
    }
    function Xo(w) {
      if (w.uniformsList === null) {
        const z = w.currentProgram.getUniforms();
        w.uniformsList = Bs.seqWithValue(z.seq, w.uniforms);
      }
      return w.uniformsList;
    }
    function qo(w, z) {
      const W = Me.get(w);
      W.outputColorSpace = z.outputColorSpace, W.batching = z.batching, W.batchingColor = z.batchingColor, W.instancing = z.instancing, W.instancingColor = z.instancingColor, W.instancingMorph = z.instancingMorph, W.skinning = z.skinning, W.morphTargets = z.morphTargets, W.morphNormals = z.morphNormals, W.morphColors = z.morphColors, W.morphTargetsCount = z.morphTargetsCount, W.numClippingPlanes = z.numClippingPlanes, W.numIntersection = z.numClipIntersection, W.vertexAlphas = z.vertexAlphas, W.vertexTangents = z.vertexTangents, W.toneMapping = z.toneMapping;
    }
    function Ql(w, z, W, X, k) {
      z.isScene !== !0 && (z = ct), R.resetTextureUnits();
      const te = z.fog, le = X.isMeshStandardMaterial ? z.environment : null, pe = D === null ? x.outputColorSpace : D.isXRRenderTarget === !0 ? D.texture.colorSpace : Ri, xe = (X.isMeshStandardMaterial ? G : E).get(X.envMap || le), Le = X.vertexColors === !0 && !!W.attributes.color && W.attributes.color.itemSize === 4, Pe = !!W.attributes.tangent && (!!X.normalMap || X.anisotropy > 0), Ee = !!W.morphAttributes.position, Xe = !!W.morphAttributes.normal, Ze = !!W.morphAttributes.color;
      let ht = In;
      X.toneMapped && (D === null || D.isXRRenderTarget === !0) && (ht = x.toneMapping);
      const at = W.morphAttributes.position || W.morphAttributes.normal || W.morphAttributes.color, qe = at !== void 0 ? at.length : 0, be = Me.get(X), vt = p.state.lights;
      if (ie === !0 && (ge === !0 || w !== y)) {
        const wt = w === y && X.id === b;
        ee.setState(X, w, wt);
      }
      let $e = !1;
      X.version === be.__version ? (be.needsLights && be.lightsStateVersion !== vt.state.version || be.outputColorSpace !== pe || k.isBatchedMesh && be.batching === !1 || !k.isBatchedMesh && be.batching === !0 || k.isBatchedMesh && be.batchingColor === !0 && k.colorTexture === null || k.isBatchedMesh && be.batchingColor === !1 && k.colorTexture !== null || k.isInstancedMesh && be.instancing === !1 || !k.isInstancedMesh && be.instancing === !0 || k.isSkinnedMesh && be.skinning === !1 || !k.isSkinnedMesh && be.skinning === !0 || k.isInstancedMesh && be.instancingColor === !0 && k.instanceColor === null || k.isInstancedMesh && be.instancingColor === !1 && k.instanceColor !== null || k.isInstancedMesh && be.instancingMorph === !0 && k.morphTexture === null || k.isInstancedMesh && be.instancingMorph === !1 && k.morphTexture !== null || be.envMap !== xe || X.fog === !0 && be.fog !== te || be.numClippingPlanes !== void 0 && (be.numClippingPlanes !== ee.numPlanes || be.numIntersection !== ee.numIntersection) || be.vertexAlphas !== Le || be.vertexTangents !== Pe || be.morphTargets !== Ee || be.morphNormals !== Xe || be.morphColors !== Ze || be.toneMapping !== ht || be.morphTargetsCount !== qe) && ($e = !0) : ($e = !0, be.__version = X.version);
      let Gt = be.currentProgram;
      $e === !0 && (Gt = ss(X, z, k));
      let ri = !1, Dt = !1, Fi = !1;
      const it = Gt.getUniforms(), Ot = be.uniforms;
      if (Se.useProgram(Gt.program) && (ri = !0, Dt = !0, Fi = !0), X.id !== b && (b = X.id, Dt = !0), ri || y !== w) {
        Se.buffers.depth.getReversed() ? (ae.copy(w.projectionMatrix), Ed(ae), bd(ae), it.setValue(I, "projectionMatrix", ae)) : it.setValue(I, "projectionMatrix", w.projectionMatrix), it.setValue(I, "viewMatrix", w.matrixWorldInverse);
        const At = it.map.cameraPosition;
        At !== void 0 && At.setValue(I, je.setFromMatrixPosition(w.matrixWorld)), He.logarithmicDepthBuffer && it.setValue(
          I,
          "logDepthBufFC",
          2 / (Math.log(w.far + 1) / Math.LN2)
        ), (X.isMeshPhongMaterial || X.isMeshToonMaterial || X.isMeshLambertMaterial || X.isMeshBasicMaterial || X.isMeshStandardMaterial || X.isShaderMaterial) && it.setValue(I, "isOrthographic", w.isOrthographicCamera === !0), y !== w && (y = w, Dt = !0, Fi = !0);
      }
      if (k.isSkinnedMesh) {
        it.setOptional(I, k, "bindMatrix"), it.setOptional(I, k, "bindMatrixInverse");
        const wt = k.skeleton;
        wt && (wt.boneTexture === null && wt.computeBoneTexture(), it.setValue(I, "boneTexture", wt.boneTexture, R));
      }
      k.isBatchedMesh && (it.setOptional(I, k, "batchingTexture"), it.setValue(I, "batchingTexture", k._matricesTexture, R), it.setOptional(I, k, "batchingIdTexture"), it.setValue(I, "batchingIdTexture", k._indirectTexture, R), it.setOptional(I, k, "batchingColorTexture"), k._colorsTexture !== null && it.setValue(I, "batchingColorTexture", k._colorsTexture, R));
      const Bt = W.morphAttributes;
      if ((Bt.position !== void 0 || Bt.normal !== void 0 || Bt.color !== void 0) && De.update(k, W, Gt), (Dt || be.receiveShadow !== k.receiveShadow) && (be.receiveShadow = k.receiveShadow, it.setValue(I, "receiveShadow", k.receiveShadow)), X.isMeshGouraudMaterial && X.envMap !== null && (Ot.envMap.value = xe, Ot.flipEnvMap.value = xe.isCubeTexture && xe.isRenderTargetTexture === !1 ? -1 : 1), X.isMeshStandardMaterial && X.envMap === null && z.environment !== null && (Ot.envMapIntensity.value = z.environmentIntensity), Dt && (it.setValue(I, "toneMappingExposure", x.toneMappingExposure), be.needsLights && ec(Ot, Fi), te && X.fog === !0 && ce.refreshFogUniforms(Ot, te), ce.refreshMaterialUniforms(Ot, X, V, K, p.state.transmissionRenderTarget[w.id]), Bs.upload(I, Xo(be), Ot, R)), X.isShaderMaterial && X.uniformsNeedUpdate === !0 && (Bs.upload(I, Xo(be), Ot, R), X.uniformsNeedUpdate = !1), X.isSpriteMaterial && it.setValue(I, "center", k.center), it.setValue(I, "modelViewMatrix", k.modelViewMatrix), it.setValue(I, "normalMatrix", k.normalMatrix), it.setValue(I, "modelMatrix", k.matrixWorld), X.isShaderMaterial || X.isRawShaderMaterial) {
        const wt = X.uniformsGroups;
        for (let At = 0, js = wt.length; At < js; At++) {
          const Bn = wt[At];
          N.update(Bn, Gt), N.bind(Bn, Gt);
        }
      }
      return Gt;
    }
    function ec(w, z) {
      w.ambientLightColor.needsUpdate = z, w.lightProbe.needsUpdate = z, w.directionalLights.needsUpdate = z, w.directionalLightShadows.needsUpdate = z, w.pointLights.needsUpdate = z, w.pointLightShadows.needsUpdate = z, w.spotLights.needsUpdate = z, w.spotLightShadows.needsUpdate = z, w.rectAreaLights.needsUpdate = z, w.hemisphereLights.needsUpdate = z;
    }
    function tc(w) {
      return w.isMeshLambertMaterial || w.isMeshToonMaterial || w.isMeshPhongMaterial || w.isMeshStandardMaterial || w.isShadowMaterial || w.isShaderMaterial && w.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return T;
    }, this.getActiveMipmapLevel = function() {
      return C;
    }, this.getRenderTarget = function() {
      return D;
    }, this.setRenderTargetTextures = function(w, z, W) {
      const X = Me.get(w);
      X.__autoAllocateDepthBuffer = w.resolveDepthBuffer === !1, X.__autoAllocateDepthBuffer === !1 && (X.__useRenderToTexture = !1), Me.get(w.texture).__webglTexture = z, Me.get(w.depthTexture).__webglTexture = X.__autoAllocateDepthBuffer ? void 0 : W, X.__hasExternalTextures = !0;
    }, this.setRenderTargetFramebuffer = function(w, z) {
      const W = Me.get(w);
      W.__webglFramebuffer = z, W.__useDefaultFramebuffer = z === void 0;
    };
    const nc = I.createFramebuffer();
    this.setRenderTarget = function(w, z = 0, W = 0) {
      D = w, T = z, C = W;
      let X = !0, k = null, te = !1, le = !1;
      if (w) {
        const xe = Me.get(w);
        if (xe.__useDefaultFramebuffer !== void 0)
          Se.bindFramebuffer(I.FRAMEBUFFER, null), X = !1;
        else if (xe.__webglFramebuffer === void 0)
          R.setupRenderTarget(w);
        else if (xe.__hasExternalTextures)
          R.rebindTextures(w, Me.get(w.texture).__webglTexture, Me.get(w.depthTexture).__webglTexture);
        else if (w.depthBuffer) {
          const Ee = w.depthTexture;
          if (xe.__boundDepthTexture !== Ee) {
            if (Ee !== null && Me.has(Ee) && (w.width !== Ee.image.width || w.height !== Ee.image.height))
              throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            R.setupDepthRenderbuffer(w);
          }
        }
        const Le = w.texture;
        (Le.isData3DTexture || Le.isDataArrayTexture || Le.isCompressedArrayTexture) && (le = !0);
        const Pe = Me.get(w).__webglFramebuffer;
        w.isWebGLCubeRenderTarget ? (Array.isArray(Pe[z]) ? k = Pe[z][W] : k = Pe[z], te = !0) : w.samples > 0 && R.useMultisampledRTT(w) === !1 ? k = Me.get(w).__webglMultisampledFramebuffer : Array.isArray(Pe) ? k = Pe[W] : k = Pe, P.copy(w.viewport), B.copy(w.scissor), L = w.scissorTest;
      } else
        P.copy(de).multiplyScalar(V).floor(), B.copy(ne).multiplyScalar(V).floor(), L = ke;
      if (W !== 0 && (k = nc), Se.bindFramebuffer(I.FRAMEBUFFER, k) && X && Se.drawBuffers(w, k), Se.viewport(P), Se.scissor(B), Se.setScissorTest(L), te) {
        const xe = Me.get(w.texture);
        I.framebufferTexture2D(I.FRAMEBUFFER, I.COLOR_ATTACHMENT0, I.TEXTURE_CUBE_MAP_POSITIVE_X + z, xe.__webglTexture, W);
      } else if (le) {
        const xe = Me.get(w.texture), Le = z;
        I.framebufferTextureLayer(I.FRAMEBUFFER, I.COLOR_ATTACHMENT0, xe.__webglTexture, W, Le);
      } else if (w !== null && W !== 0) {
        const xe = Me.get(w.texture);
        I.framebufferTexture2D(I.FRAMEBUFFER, I.COLOR_ATTACHMENT0, I.TEXTURE_2D, xe.__webglTexture, W);
      }
      b = -1;
    }, this.readRenderTargetPixels = function(w, z, W, X, k, te, le) {
      if (!(w && w.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let pe = Me.get(w).__webglFramebuffer;
      if (w.isWebGLCubeRenderTarget && le !== void 0 && (pe = pe[le]), pe) {
        Se.bindFramebuffer(I.FRAMEBUFFER, pe);
        try {
          const xe = w.texture, Le = xe.format, Pe = xe.type;
          if (!He.textureFormatReadable(Le)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!He.textureTypeReadable(Pe)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          z >= 0 && z <= w.width - X && W >= 0 && W <= w.height - k && I.readPixels(z, W, X, k, Ue.convert(Le), Ue.convert(Pe), te);
        } finally {
          const xe = D !== null ? Me.get(D).__webglFramebuffer : null;
          Se.bindFramebuffer(I.FRAMEBUFFER, xe);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(w, z, W, X, k, te, le) {
      if (!(w && w.isWebGLRenderTarget))
        throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let pe = Me.get(w).__webglFramebuffer;
      if (w.isWebGLCubeRenderTarget && le !== void 0 && (pe = pe[le]), pe)
        if (z >= 0 && z <= w.width - X && W >= 0 && W <= w.height - k) {
          Se.bindFramebuffer(I.FRAMEBUFFER, pe);
          const xe = w.texture, Le = xe.format, Pe = xe.type;
          if (!He.textureFormatReadable(Le))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
          if (!He.textureTypeReadable(Pe))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
          const Ee = I.createBuffer();
          I.bindBuffer(I.PIXEL_PACK_BUFFER, Ee), I.bufferData(I.PIXEL_PACK_BUFFER, te.byteLength, I.STREAM_READ), I.readPixels(z, W, X, k, Ue.convert(Le), Ue.convert(Pe), 0);
          const Xe = D !== null ? Me.get(D).__webglFramebuffer : null;
          Se.bindFramebuffer(I.FRAMEBUFFER, Xe);
          const Ze = I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE, 0);
          return I.flush(), await Sd(I, Ze, 4), I.bindBuffer(I.PIXEL_PACK_BUFFER, Ee), I.getBufferSubData(I.PIXEL_PACK_BUFFER, 0, te), I.deleteBuffer(Ee), I.deleteSync(Ze), te;
        } else
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
    }, this.copyFramebufferToTexture = function(w, z = null, W = 0) {
      const X = Math.pow(2, -W), k = Math.floor(w.image.width * X), te = Math.floor(w.image.height * X), le = z !== null ? z.x : 0, pe = z !== null ? z.y : 0;
      R.setTexture2D(w, 0), I.copyTexSubImage2D(I.TEXTURE_2D, W, 0, 0, le, pe, k, te), Se.unbindTexture();
    };
    const ic = I.createFramebuffer(), sc = I.createFramebuffer();
    this.copyTextureToTexture = function(w, z, W = null, X = null, k = 0, te = null) {
      te === null && (k !== 0 ? (Os("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."), te = k, k = 0) : te = 0);
      let le, pe, xe, Le, Pe, Ee, Xe, Ze, ht;
      const at = w.isCompressedTexture ? w.mipmaps[te] : w.image;
      if (W !== null)
        le = W.max.x - W.min.x, pe = W.max.y - W.min.y, xe = W.isBox3 ? W.max.z - W.min.z : 1, Le = W.min.x, Pe = W.min.y, Ee = W.isBox3 ? W.min.z : 0;
      else {
        const Bt = Math.pow(2, -k);
        le = Math.floor(at.width * Bt), pe = Math.floor(at.height * Bt), w.isDataArrayTexture ? xe = at.depth : w.isData3DTexture ? xe = Math.floor(at.depth * Bt) : xe = 1, Le = 0, Pe = 0, Ee = 0;
      }
      X !== null ? (Xe = X.x, Ze = X.y, ht = X.z) : (Xe = 0, Ze = 0, ht = 0);
      const qe = Ue.convert(z.format), be = Ue.convert(z.type);
      let vt;
      z.isData3DTexture ? (R.setTexture3D(z, 0), vt = I.TEXTURE_3D) : z.isDataArrayTexture || z.isCompressedArrayTexture ? (R.setTexture2DArray(z, 0), vt = I.TEXTURE_2D_ARRAY) : (R.setTexture2D(z, 0), vt = I.TEXTURE_2D), I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL, z.flipY), I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL, z.premultiplyAlpha), I.pixelStorei(I.UNPACK_ALIGNMENT, z.unpackAlignment);
      const $e = I.getParameter(I.UNPACK_ROW_LENGTH), Gt = I.getParameter(I.UNPACK_IMAGE_HEIGHT), ri = I.getParameter(I.UNPACK_SKIP_PIXELS), Dt = I.getParameter(I.UNPACK_SKIP_ROWS), Fi = I.getParameter(I.UNPACK_SKIP_IMAGES);
      I.pixelStorei(I.UNPACK_ROW_LENGTH, at.width), I.pixelStorei(I.UNPACK_IMAGE_HEIGHT, at.height), I.pixelStorei(I.UNPACK_SKIP_PIXELS, Le), I.pixelStorei(I.UNPACK_SKIP_ROWS, Pe), I.pixelStorei(I.UNPACK_SKIP_IMAGES, Ee);
      const it = w.isDataArrayTexture || w.isData3DTexture, Ot = z.isDataArrayTexture || z.isData3DTexture;
      if (w.isDepthTexture) {
        const Bt = Me.get(w), wt = Me.get(z), At = Me.get(Bt.__renderTarget), js = Me.get(wt.__renderTarget);
        Se.bindFramebuffer(I.READ_FRAMEBUFFER, At.__webglFramebuffer), Se.bindFramebuffer(I.DRAW_FRAMEBUFFER, js.__webglFramebuffer);
        for (let Bn = 0; Bn < xe; Bn++)
          it && (I.framebufferTextureLayer(I.READ_FRAMEBUFFER, I.COLOR_ATTACHMENT0, Me.get(w).__webglTexture, k, Ee + Bn), I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER, I.COLOR_ATTACHMENT0, Me.get(z).__webglTexture, te, ht + Bn)), I.blitFramebuffer(Le, Pe, le, pe, Xe, Ze, le, pe, I.DEPTH_BUFFER_BIT, I.NEAREST);
        Se.bindFramebuffer(I.READ_FRAMEBUFFER, null), Se.bindFramebuffer(I.DRAW_FRAMEBUFFER, null);
      } else if (k !== 0 || w.isRenderTargetTexture || Me.has(w)) {
        const Bt = Me.get(w), wt = Me.get(z);
        Se.bindFramebuffer(I.READ_FRAMEBUFFER, ic), Se.bindFramebuffer(I.DRAW_FRAMEBUFFER, sc);
        for (let At = 0; At < xe; At++)
          it ? I.framebufferTextureLayer(I.READ_FRAMEBUFFER, I.COLOR_ATTACHMENT0, Bt.__webglTexture, k, Ee + At) : I.framebufferTexture2D(I.READ_FRAMEBUFFER, I.COLOR_ATTACHMENT0, I.TEXTURE_2D, Bt.__webglTexture, k), Ot ? I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER, I.COLOR_ATTACHMENT0, wt.__webglTexture, te, ht + At) : I.framebufferTexture2D(I.DRAW_FRAMEBUFFER, I.COLOR_ATTACHMENT0, I.TEXTURE_2D, wt.__webglTexture, te), k !== 0 ? I.blitFramebuffer(Le, Pe, le, pe, Xe, Ze, le, pe, I.COLOR_BUFFER_BIT, I.NEAREST) : Ot ? I.copyTexSubImage3D(vt, te, Xe, Ze, ht + At, Le, Pe, le, pe) : I.copyTexSubImage2D(vt, te, Xe, Ze, Le, Pe, le, pe);
        Se.bindFramebuffer(I.READ_FRAMEBUFFER, null), Se.bindFramebuffer(I.DRAW_FRAMEBUFFER, null);
      } else
        Ot ? w.isDataTexture || w.isData3DTexture ? I.texSubImage3D(vt, te, Xe, Ze, ht, le, pe, xe, qe, be, at.data) : z.isCompressedArrayTexture ? I.compressedTexSubImage3D(vt, te, Xe, Ze, ht, le, pe, xe, qe, at.data) : I.texSubImage3D(vt, te, Xe, Ze, ht, le, pe, xe, qe, be, at) : w.isDataTexture ? I.texSubImage2D(I.TEXTURE_2D, te, Xe, Ze, le, pe, qe, be, at.data) : w.isCompressedTexture ? I.compressedTexSubImage2D(I.TEXTURE_2D, te, Xe, Ze, at.width, at.height, qe, at.data) : I.texSubImage2D(I.TEXTURE_2D, te, Xe, Ze, le, pe, qe, be, at);
      I.pixelStorei(I.UNPACK_ROW_LENGTH, $e), I.pixelStorei(I.UNPACK_IMAGE_HEIGHT, Gt), I.pixelStorei(I.UNPACK_SKIP_PIXELS, ri), I.pixelStorei(I.UNPACK_SKIP_ROWS, Dt), I.pixelStorei(I.UNPACK_SKIP_IMAGES, Fi), te === 0 && z.generateMipmaps && I.generateMipmap(vt), Se.unbindTexture();
    }, this.copyTextureToTexture3D = function(w, z, W = null, X = null, k = 0) {
      return Os('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'), this.copyTextureToTexture(w, z, W, X, k);
    }, this.initRenderTarget = function(w) {
      Me.get(w).__webglFramebuffer === void 0 && R.setupRenderTarget(w);
    }, this.initTexture = function(w) {
      w.isCubeTexture ? R.setTextureCube(w, 0) : w.isData3DTexture ? R.setTexture3D(w, 0) : w.isDataArrayTexture || w.isCompressedArrayTexture ? R.setTexture2DArray(w, 0) : R.setTexture2D(w, 0), Se.unbindTexture();
    }, this.resetState = function() {
      T = 0, C = 0, D = null, Se.reset(), et.reset();
    }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  get coordinateSystem() {
    return En;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(e) {
    this._outputColorSpace = e;
    const t = this.getContext();
    t.drawingBufferColorSpace = Ye._getDrawingBufferColorSpace(e), t.unpackColorSpace = Ye._getUnpackColorSpace();
  }
}
const j_ = {
  // Clatter draws on one surface. The renderer clears to transparent and the
  // desk is a shadow catcher, so the colour a player sees comes from the
  // element behind the canvas. src/tray/scene.ts sets it. This entry names the
  // surface material only, which the sound path of Unit 3.6 reads.
  felt: {
    surface: "felt"
  }
}, Lr = {
  cloudy: {
    name: "Clouds (Transparent)",
    composite: "destination-in",
    source: "textures/cloudy.webp",
    source_bump: "textures/cloudy.alt.webp"
  },
  cloudy_2: {
    name: "Clouds",
    composite: "multiply",
    source: "textures/cloudy.alt.webp",
    source_bump: "textures/cloudy.alt.webp"
  },
  fire: {
    name: "Fire",
    composite: "multiply",
    source: "textures/fire.webp",
    source_bump: "textures/fire.webp",
    material: "metal"
  },
  marble: {
    name: "Marble",
    composite: "multiply",
    source: "textures/marble.webp",
    source_bump: "",
    material: "glass"
  },
  water: {
    name: "Water",
    composite: "destination-in",
    source: "textures/water.webp",
    source_bump: "textures/water.webp",
    material: "glass"
  },
  ice: {
    name: "Ice",
    composite: "destination-in",
    source: "textures/ice.webp",
    source_bump: "textures/ice.webp",
    material: "glass"
  },
  paper: {
    name: "Paper",
    composite: "multiply",
    source: "textures/paper.webp",
    source_bump: "textures/paper-bump.webp",
    material: "wood"
  },
  speckles: {
    name: "Speckles",
    composite: "multiply",
    source: "textures/speckles.webp",
    source_bump: "textures/speckles.webp",
    material: "none"
  },
  glitter: {
    name: "Glitter",
    composite: "multiply",
    source: "textures/glitter.webp",
    source_bump: "textures/glitter-bump.webp",
    material: "none"
  },
  glitter_2: {
    name: "Glitter (Transparent)",
    composite: "destination-in",
    source: "textures/glitter-alpha.webp",
    source_bump: "",
    material: "none"
  },
  stars: {
    name: "Stars",
    composite: "multiply",
    source: "textures/stars.webp",
    source_bump: "textures/stars.webp",
    material: "none"
  },
  stainedglass: {
    name: "Stained Glass",
    composite: "multiply",
    source: "textures/stainedglass.webp",
    source_bump: "textures/stainedglass-bump.webp",
    material: "glass"
  },
  wood: {
    name: "Wood",
    composite: "multiply",
    source: "textures/wood.webp",
    source_bump: "textures/wood.webp",
    material: "wood"
  },
  metal: {
    name: "Stainless Steel",
    composite: "multiply",
    source: "textures/metal.webp",
    source_bump: "textures/metal-bump.webp",
    material: "metal"
  },
  skulls: {
    name: "Skulls",
    composite: "multiply",
    source: "textures/skulls.webp",
    source_bump: "textures/skulls.webp"
  },
  leopard: {
    name: "Leopard",
    composite: "multiply",
    source: "textures/leopard.webp",
    source_bump: "textures/leopard.webp",
    material: "wood"
  },
  tiger: {
    name: "Tiger",
    composite: "multiply",
    source: "textures/tiger.webp",
    source_bump: "textures/tiger.webp",
    material: "wood"
  },
  cheetah: {
    name: "Cheetah",
    composite: "multiply",
    source: "textures/cheetah.webp",
    source_bump: "textures/cheetah.webp",
    material: "wood"
  },
  dragon: {
    name: "Dragon",
    composite: "multiply",
    source: "textures/dragon.webp",
    source_bump: "textures/dragon-bump.webp",
    material: "none"
  },
  lizard: {
    name: "Lizard",
    composite: "multiply",
    source: "textures/lizard.webp",
    source_bump: "textures/lizard.webp",
    material: "none"
  },
  bird: {
    name: "Bird",
    composite: "multiply",
    source: "textures/feather.webp",
    source_bump: "textures/feather-bump.webp",
    material: "wood"
  },
  astral: {
    name: "Astral Sea",
    composite: "multiply",
    source: "textures/astral.webp",
    source_bump: "textures/stars.webp",
    material: "none"
  },
  acleaf: {
    name: "AC Leaf",
    composite: "multiply",
    source: "textures/acleaf.webp",
    source_bump: "textures/acleaf.webp",
    material: "none"
  },
  thecage: {
    name: "Nicholas Cage",
    composite: "multiply",
    source: "textures/thecage.webp",
    source_bump: "",
    material: "metal"
  },
  isabelle: {
    name: "Isabelle",
    composite: "source-over",
    source: "textures/isabelle.webp",
    source_bump: "",
    material: "none"
  },
  bronze01: {
    name: "bronze01",
    composite: "difference",
    source: "textures/bronze01.webp",
    source_bump: "",
    material: "metal"
  },
  bronze02: {
    name: "bronze02",
    composite: "difference",
    source: "textures/bronze02.webp",
    source_bump: "",
    material: "metal"
  },
  bronze03: {
    name: "bronze03",
    composite: "difference",
    source: "textures/bronze03.webp",
    source_bump: "",
    material: "metal"
  },
  bronze03a: {
    name: "bronze03a",
    composite: "difference",
    source: "textures/bronze03a.webp",
    source_bump: "",
    material: "metal"
  },
  bronze03b: {
    name: "bronze03b",
    composite: "difference",
    source: "textures/bronze03b.webp",
    source_bump: "",
    material: "metal"
  },
  bronze04: {
    name: "bronze04",
    composite: "difference",
    source: "textures/bronze04.webp",
    source_bump: "",
    material: "metal"
  },
  none: {
    name: "none",
    composite: "source-over",
    source: "",
    source_bump: "",
    material: ""
  },
  "": {
    name: "~ Preset ~",
    composite: "source-over",
    source: "",
    source_bump: "",
    material: ""
  }
}, fl = {
  bone: {
    name: "Bone",
    category: "Clatter",
    foreground: "#33291D",
    background: "#EDE3CE",
    outline: "#B9AA8C",
    texture: "none",
    description: "Bone"
  }
};
class K_ {
  constructor(e = {}) {
    this.colorsets = [], this.assetPath = e.assetPath;
  }
  async ImageLoader(e) {
    if (Array.isArray(e)) {
      for (let t = 0, n = e.length; t < n; t++)
        e[t] = await this.ImageLoader(e[t]);
      return e;
    }
    return e.source && e.source != "" && (e.texture = await this.loadImage(e.source)), e.source_bump && e.source_bump != "" && (e.bump = await this.loadImage(e.source_bump)), e;
  }
  loadImage(e) {
    return new Promise((t, n) => {
      let i = new Image();
      i.onload = () => t(i), i.crossOrigin = "anonymous", i.src = this.assetPath + e, i.onerror = (s) => n(s);
    }).catch((t) => {
      console.error("Unable to load image texture");
    });
  }
  async getColorSet(e) {
    let t, n;
    if (typeof e == "string" && (t = e), typeof e == "object" && (t = e.colorset), this.colorsets.hasOwnProperty(t))
      return this.colorsets[t];
    let i = fl[t];
    return n = e.texture || i.texture, i.texture = this.getTexture(n), i.texture = await this.ImageLoader(i.texture), e.material && (i.texture.material = e.material), this.colorsets[t] = i, i;
  }
  async makeColorSet(e = {}) {
    if (this.colorsets.hasOwnProperty(e.name))
      return this.colorsets[e.name];
    let t = fl.bone, n = Object.assign({}, t, e), i = this.getTexture(n.texture);
    return n.texture = await this.ImageLoader(i), e.material && (n.texture.material = e.material), n.name.toLowerCase() === "bone" && (n.name = `${Date.now()}`), this.colorsets[n.name] = n, n;
  }
  getTexture(e) {
    if (Array.isArray(e)) {
      let t = [];
      for (let n = 0, i = e.length; n < i; n++)
        t.push(this.getTexture(e[n]));
      return t;
    }
    return Lr.hasOwnProperty(e) ? Lr[e] : Lr.none;
  }
}
const Fr = {
  d2: {
    name: "d2",
    labels: ["1", "2"],
    values: [1, 2],
    inertia: 8,
    mass: 400,
    scale: 0.9,
    system: "dweird"
  },
  dc: {
    type: "d2",
    name: "Coin",
    labels: ["textures/silvercoin/tail.png", "textures/silvercoin/heads.png"],
    setBumpMaps: ["textures/silvercoin/tail_bump.png", "textures/silvercoin/heads_bump.png"],
    values: [0, 1],
    inertia: 8,
    mass: 400,
    scale: 0.9,
    colorset: "coin_silver"
  },
  d1: {
    name: "One-sided Dice",
    type: "d6",
    labels: ["1"],
    values: [1, 1],
    scale: 0.9,
    system: "dweird"
  },
  d3: {
    name: "Three-Sided Dice",
    type: "d6",
    labels: ["1", "2", "3"],
    values: [1, 3],
    scale: 0.9,
    system: "dweird"
  },
  df: {
    name: "Fudge Dice",
    type: "d6",
    labels: ["-", "0", "+"],
    values: [-1, 1],
    scale: 0.9,
    system: "dweird"
  },
  d4: {
    name: "Four-Sided Dice",
    labels: ["1", "2", "3", "4"],
    values: [1, 4],
    inertia: 5,
    scale: 1.2
  },
  d6: {
    name: "Six-Sided Dice (Numbers)",
    labels: ["1", "2", "3", "4", "5", "6"],
    values: [1, 6],
    scale: 0.9
  },
  dpip: {
    name: "Six-Sided Dice (Pips)",
    type: "d6",
    labels: [`   
 \u2B24 
   `, `\u2B24  
   
  \u2B24`, `\u2B24  
 \u2B24 
  \u2B24`, `\u2B24 \u2B24
   
\u2B24 \u2B24`, `\u2B24 \u2B24
 \u2B24 
\u2B24 \u2B24`, `\u2B24 \u2B24
\u2B24 \u2B24
\u2B24 \u2B24`],
    values: [1, 6],
    scale: 0.9,
    font: "monospace"
  },
  dsex: {
    name: "Sex-Sided Emoji Dice",
    type: "d6",
    labels: ["\u{1F346}", "\u{1F351}", "\u{1F44C}", "\u{1F4A6}", "\u{1F64F}", "\u{1F4A5}"],
    values: [1, 6],
    scale: 0.9,
    display: "labels",
    system: "dweird"
  },
  dpoker: {
    name: "Poker Dice (9-Ace)",
    type: "d6",
    labels: ["A", "9", "10", "J", "Q", "K"],
    values: [1, 6],
    scale: 0.9,
    display: "labels",
    system: "dweird",
    font: "Times New Roman"
  },
  dspanpoker: {
    name: "Spanish Poker Dice (7-Ace)",
    type: "d8",
    labels: ["A", "7", "8", "9", "10", "J", "Q", "K"],
    values: [1, 8],
    display: "labels",
    system: "dweird",
    font: "Times New Roman"
  },
  disotope: {
    name: "Radioactive Twelve-Sided Dice",
    type: "d12",
    labels: ["", "", "", "", "", "", "", "", "", "", "", "\u2622\uFE0F"],
    values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    mass: 350,
    inertia: 8,
    scale: 0.9,
    system: "dweird"
  },
  dsuit: {
    name: "Four-Suited Dice",
    type: "d4",
    labels: ["\u2660\uFE0F", "\u2665\uFE0F", "\u2666\uFE0F", "\u2663\uFE0F"],
    values: [1, 4],
    inertia: 5,
    scale: 1.2,
    display: "labels",
    system: "dweird"
  },
  d8: {
    name: "Eight-Sided Dice",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8"],
    values: [1, 8]
  },
  d10: {
    name: "Ten-Sided Dice (Single Digit)",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    values: [1, 10],
    mass: 350,
    inertia: 9,
    scale: 0.9
  },
  d100: {
    name: "Ten-Sided Dice (Tens Digit)",
    type: "d10",
    labels: ["10", "20", "30", "40", "50", "60", "70", "80", "90", "00"],
    values: [10, 100, 10],
    mass: 350,
    inertia: 9,
    scale: 0.9
  },
  d12: {
    name: "Twelve-Sided Dice",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    values: [1, 12],
    mass: 350,
    inertia: 8,
    scale: 0.9
  },
  d20: {
    name: "Twenty-Sided Dice",
    labels: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20"
    ],
    values: [1, 20],
    mass: 400,
    inertia: 6
  },
}, kt = {
  d4: {
    vertices: [
      [1, 1, 1],
      [-1, -1, 1],
      [-1, 1, -1],
      [1, -1, -1]
    ],
    faces: [
      [1, 0, 2, 1],
      [0, 1, 3, 2],
      [0, 3, 2, 3],
      [1, 2, 3, 4]
    ]
  },
  d6: {
    vertices: [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1]
    ],
    faces: [
      [0, 3, 2, 1, 1],
      [1, 2, 6, 5, 2],
      [0, 1, 5, 4, 3],
      [3, 7, 6, 2, 4],
      [0, 4, 7, 3, 5],
      [4, 5, 6, 7, 6]
    ]
  },
  d8: {
    vertices: [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1]
    ],
    faces: [
      [0, 2, 4, 1],
      [0, 4, 3, 2],
      [0, 3, 5, 3],
      [0, 5, 2, 4],
      [1, 3, 4, 5],
      [1, 4, 2, 6],
      [1, 2, 5, 7],
      [1, 5, 3, 8]
    ]
  },
  d10: {
    vertices: [
      [1, 0, -0.105],
      [0.809, 0.5877, 0.105],
      [0.309, 0.951, -0.105],
      [-0.309, 0.951, 0.105],
      [-0.809, 0.5877, -0.105],
      [-1, 0, 0.105],
      [-0.809, -0.587, -0.105],
      [-0.309, -0.951, 0.105],
      [0.309, -0.951, -0.105],
      [0.809, -0.5877, 0.105],
      [0, 0, -1],
      [0, 0, 1]
    ],
    faces: [
      [5, 6, 7, 11, 0],
      [4, 3, 2, 10, 1],
      [1, 2, 3, 11, 2],
      [0, 9, 8, 10, 3],
      [7, 8, 9, 11, 4],
      [8, 7, 6, 10, 5],
      [9, 0, 1, 11, 6],
      [2, 1, 0, 10, 7],
      [3, 4, 5, 11, 8],
      [6, 5, 4, 10, 9]
    ]
  },
  d12: {
    vertices: [
      [0, 0.618, 1.618],
      [0, 0.618, -1.618],
      [0, -0.618, 1.618],
      [0, -0.618, -1.618],
      [1.618, 0, 0.618],
      [1.618, 0, -0.618],
      [-1.618, 0, 0.618],
      [-1.618, 0, -0.618],
      [0.618, 1.618, 0],
      [0.618, -1.618, 0],
      [-0.618, 1.618, 0],
      [-0.618, -1.618, 0],
      [1, 1, 1],
      [1, 1, -1],
      [1, -1, 1],
      [1, -1, -1],
      [-1, 1, 1],
      [-1, 1, -1],
      [-1, -1, 1],
      [-1, -1, -1]
    ],
    faces: [
      [2, 14, 4, 12, 0, 1],
      [15, 9, 11, 19, 3, 2],
      [16, 10, 17, 7, 6, 3],
      [6, 7, 19, 11, 18, 4],
      [6, 18, 2, 0, 16, 5],
      [18, 11, 9, 14, 2, 6],
      [1, 17, 10, 8, 13, 7],
      [1, 13, 5, 15, 3, 8],
      [13, 8, 12, 4, 5, 9],
      [5, 4, 14, 9, 15, 10],
      [0, 12, 8, 10, 16, 11],
      [3, 19, 7, 17, 1, 12]
    ]
  },
  d20: {
    vertices: [
      [-1, 1.618, 0],
      [1, 1.618, 0],
      [-1, -1.618, 0],
      [1, -1.618, 0],
      [0, -1, 1.618],
      [0, 1, 1.618],
      [0, -1, -1.618],
      [0, 1, -1.618],
      [1.618, 0, -1],
      [1.618, 0, 1],
      [-1.618, 0, -1],
      [-1.618, 0, 1]
    ],
    faces: [
      [0, 11, 5, 1],
      [0, 5, 1, 2],
      [0, 1, 7, 3],
      [0, 7, 10, 4],
      [0, 10, 11, 5],
      [1, 5, 9, 6],
      [5, 11, 4, 7],
      [11, 10, 2, 8],
      [10, 7, 6, 9],
      [7, 1, 8, 10],
      [3, 9, 4, 11],
      [3, 4, 2, 12],
      [3, 2, 6, 13],
      [3, 6, 8, 14],
      [3, 8, 9, 15],
      [4, 9, 5, 16],
      [2, 4, 11, 17],
      [6, 2, 10, 18],
      [8, 6, 7, 19],
      [9, 8, 1, 20]
    ]
  }
}, Z_ = {
  name: "",
  scale: 1,
  font: "Arial",
  color: "",
  labels: [],
  valueMap: [],
  values: [],
  normals: [],
  mass: 300,
  inertia: 13,
  geometry: null,
  display: "values",
  system: "d20"
};
class $_ {
  constructor(e) {
    if (!Fr.hasOwnProperty(e))
      return console.error("dice type unavailable");
    Object.assign(this, Z_, Fr[e]), this.shape = Fr[e].type || e, this.type = e, this.setLabels(this.labels), this.setValues(this.values[0], this.values[1], this.values[2]), this.setValueMap(this.valueMap), this.bumpMaps && this.setBumpMaps(this.bumpMaps);
  }
  setValues(e = 1, t = 20, n = 1) {
    this.values = this.range(e, t, n);
  }
  setValueMap(e) {
    for (let t = 0; t < this.values.length; t++) {
      let n = this.values[t];
      e[n] != null && (this.valueMap[n] = e[n]);
    }
  }
  registerFaces(e, t = "labels") {
    let n;
    if (t == "labels" ? n = this.labels : n = this.normals, n.unshift(""), ["d2", "d10"].includes(this.shape) || n.unshift(""), this.shape == "d4") {
      let i = e[0], s = e[1], o = e[2], a = e[3];
      this.labels = [
        [[], [0, 0, 0], [s, a, o], [i, o, a], [s, i, a], [i, s, o]],
        [[], [0, 0, 0], [s, o, a], [o, i, a], [s, a, i], [o, s, i]],
        [[], [0, 0, 0], [a, o, s], [o, a, i], [a, s, i], [o, i, s]],
        [[], [0, 0, 0], [a, s, o], [i, a, o], [a, i, s], [i, o, s]]
      ];
    } else
      Array.prototype.push.apply(n, e);
  }
  setLabels(e) {
    this.loadTextures(e, this.registerFaces.bind(this), "labels");
  }
  setBumpMaps(e) {
    this.loadTextures(e, this.registerFaces.bind(this), "bump");
  }
  loadTextures(e, t, n) {
    let i = 0, s = e.length, o = /\.(PNG|JPG|GIF|WEBP)$/i, a = Array(e.length), l = !1;
    for (let c = 0; c < s; c++) {
      if (e[c] == "" || !e[c].match(o)) {
        a[c] = e[c], ++i;
        continue;
      }
      l = !0, a[c] = new Image(), a[c].onload = function() {
        ++i >= s && t(a, n);
      }, a[c].src = e[c];
    }
    l || t(a, n);
  }
  range(e, t, n = 1) {
    for (var i = [e], s = e; s < t; )
      i.push(s += n || 1);
    return i;
  }
}
const J_ = {
  none: {
    name: "Plastic"
  },
  perfectmetal: {
    name: "Perfect Metal",
    color: 14540253,
    roughness: 0,
    metalness: 1,
    envMapIntensity: 1
  },
  metal: {
    name: "Metal",
    color: 14540253,
    roughness: 0.5,
    metalness: 0.6,
    envMapIntensity: 1
  },
  wood: {
    name: "Wood",
    color: 14540253,
    roughness: 0.9,
    metalness: 0,
    envMapIntensity: 1
  },
  glass: {
    name: "Glass",
    color: 14540253,
    roughness: 0.1,
    metalness: 0,
    envMapIntensity: 1
  }
}, Q_ = {
  baseScale: 100,
  bumpMapping: !0
}, Ei = class {
  constructor(e) {
    this.geometries = {}, this.materials_cache = {}, this.cache_hits = 0, this.cache_misses = 0, this.label_color = "", this.dice_color = "", this.edge_color = "", this.label_outline = "", this.dice_texture = "", this.dice_material = "", this.material_options = {
      specular: 16777215,
      color: 11908533,
      shininess: 5,
      flatShading: !0
    }, Object.assign(this, Q_, e);
  }
  updateConfig(e = {}) {
    Object.assign(this, e), e.scale && this.scaleGeometry();
  }
  setBumpMapping(e) {
    this.bumpMapping = e, this.materials_cache = {};
  }
  create(e) {
    let t = this.get(e);
    if (!t)
      return null;
    let n = this.geometries[e];
    if (n || (n = this.createGeometry(t.shape, t.scale * this.baseScale), this.geometries[e] = n), !n)
      return null;
    this.setMaterialInfo();
    let i = new $t(n, this.createMaterials(t, this.baseScale / 2, 1));
    switch (i.result = [], i.shape = t.shape, i.rerolls = 0, i.resultReason = "natural", i.mass = t.mass, i.getFaceValue = function() {
      let s = this.resultReason, o = new H(0, 0, this.shape == "d4" ? -1 : 1), a, l = Math.PI * 2, c = this.geometry.getAttribute("normal").array;
      for (let _ = 0, f = this.geometry.groups.length; _ < f; ++_) {
        let p = this.geometry.groups[_];
        if (p.materialIndex == 0)
          continue;
        let v = _ * 9, x = new H(
          c[v],
          c[v + 1],
          c[v + 2]
        ).clone().applyQuaternion(this.body.quaternion).angleTo(o);
        x < l && (l = x, a = p);
      }
      let h = a.materialIndex - 1, d = 2;
      const u = Ei.dice[this.notation.type];
      if (this.shape == "d4") {
        let _ = h - 1 == 0 ? 5 : h;
        return { value: h, label: u.labels[h - 1][_][0], reason: s };
      }
      ["d10", "d2"].includes(this.shape) && (h += 1, d -= 1);
      let m = u.values[(h - 1) % u.values.length], g = u.labels[(h - 1) % (u.labels.length - 2) + d];
      return { value: m, label: g, reason: s };
    }, i.storeRolledValue = function(s) {
      this.resultReason = s || this.resultReason, this.result.push(this.getFaceValue());
    }, i.getLastValue = function() {
      return !this.result || this.result.length < 1 ? { value: void 0, label: "", reason: "" } : this.result[this.result.length - 1];
    }, i.ignoreLastValue = function(s) {
      let o = this.getLastValue();
      o.value !== void 0 && (o.ignore = s, this.setLastValue(o));
    }, i.setLastValue = function(s) {
      if (!(!this.result || this.result.length < 1) && !(!s || s.length < 1))
        return this.result[this.result.length - 1] = s;
    }, t.color && (i.material[0].color = new Oe(t.color), i.material[0].emissive = new Oe(t.color), i.material[0].emissiveIntensity = 1, i.material[0].needsUpdate = !0), t.values.length) {
      case 1:
        return this.fixmaterials(i, 1);
      case 2:
        return this.fixmaterials(i, 2);
      case 3:
        return this.fixmaterials(i, 3);
      default:
        return i;
    }
  }
  get(e) {
    let t;
    return Ei.dice.hasOwnProperty(e) ? t = Ei.dice[e] : (t = new $_(e), Ei.dice[e] = t), t;
  }
  getGeometry(e) {
    return this.geometries[e];
  }
  scaleGeometry() {
  }
  createMaterials(e, t, n, i = !0, s = 0) {
    let o = [], a = e.labels;
    e.shape == "d4" && (a = e.labels[s], t = this.baseScale / 2, n = this.baseScale * 2);
    for (var l = 0; l < a.length; ++l) {
      var c;
      this.dice_material != "none" ? (c = new Qd(J_[this.dice_material]), c.envMapIntensity = 0) : c = new ef(this.material_options);
      let h;
      if (l == 0) {
        let d = { name: "none" };
        this.dice_texture_rand.composite != "source-over" && (d = this.dice_texture_rand), h = this.createTextMaterial(
          e,
          a,
          l,
          t,
          n,
          d,
          this.label_color_rand,
          this.label_outline_rand,
          this.edge_color_rand,
          i
        ), c.map = h.composite;
      } else if (h = this.createTextMaterial(
        e,
        a,
        l,
        t,
        n,
        this.dice_texture_rand,
        this.label_color_rand,
        this.label_outline_rand,
        this.dice_color_rand,
        i
      ), c.map = h.composite, this.bumpMapping) {
        {
          let d = 0.75;
          t > 35 && (d = 1), t > 40 && (d = 2.5), t > 45 && (d = 4), c.bumpScale = d;
        }
        h.bump && (c.bumpMap = h.bump), e.shape != "d4" && e.normals[l] && (c.bumpMap = new bt(e.normals[l]), c.bumpScale = 4, c.bumpMap.needsUpdate = !0);
      }
      c.opacity = 1, c.transparent = !0, c.depthTest = !1, c.needUpdate = !0, o.push(c);
    }
    return o;
  }
  createTextMaterial(e, t, n, i, s, o, a, l, c, h) {
    if (t[n] === void 0)
      return null;
    o = o || this.dice_texture_rand, a = a || this.label_color_rand, l = l || this.label_outline_rand, c = c || this.dice_color_rand, h = h == null ? !0 : h;
    let d = t[n], u = !1, m = d;
    d instanceof HTMLImageElement ? m = d.src : d instanceof Array && d.forEach((D) => {
      m += D.src;
    });
    let g = e.type + m + n + o.name + a + l + c;
    if (e.shape == "d4" && (g = e.type + m + o.name + a + l + c), h && this.materials_cache[g] != null)
      return this.cache_hits++, this.materials_cache[g];
    let _ = document.createElement("canvas"), f = _.getContext("2d", { alpha: !0 });
    f.globalAlpha = 0, f.clearRect(0, 0, _.width, _.height);
    let p = document.createElement("canvas"), v = p.getContext("2d", { alpha: !0 });
    v.globalAlpha = 0, v.clearRect(0, 0, p.width, p.height);
    let M;
    if (e.shape == "d4" ? M = this.calc_texture_size(i + s) * 4 : M = this.calc_texture_size(i + i * 2 * s) * 4, _.width = _.height = M, p.width = p.height = M, f.fillStyle = c, f.fillRect(0, 0, _.width, _.height), v.fillStyle = "#FFFFFF", v.fillRect(0, 0, p.width, p.height), o.texture && o.name != "" && o.name != "none" ? (f.globalCompositeOperation = o.composite || "source-over", f.drawImage(o.texture, 0, 0, _.width, _.height), f.globalCompositeOperation = "source-over", o.bump && (v.globalCompositeOperation = "source-over", v.drawImage(o.bump, 0, 0, _.width, _.height))) : f.globalCompositeOperation = "source-over", f.globalCompositeOperation = "source-over", f.textAlign = "center", f.textBaseline = "middle", v.textAlign = "center", v.textBaseline = "middle", e.shape != "d4") {
      let b = {
        d8: { even: -7.5, odd: -127.5 },
        d10: { all: -6 },
        d12: { all: 5 },
        d20: { all: -7.5 }
      }[e.shape];
      if (b) {
        let y;
        if (b.hasOwnProperty("all") ? y = b.all : n > 0 && n % 2 != 0 ? y = b.odd : y = b.even, y && y != 0) {
          var x = _.width / 2, A = _.height / 2;
          f.translate(x, A), f.rotate(y * (Math.PI / 180)), f.translate(-x, -A), v.translate(x, A), v.rotate(y * (Math.PI / 180)), v.translate(-x, -A);
        }
      }
      if (d instanceof HTMLImageElement)
        u = !0, f.drawImage(d, 0, 0, d.width, d.height, 0, 0, _.width, _.height);
      else {
        let y = M / (1 + 2 * s), P = _.height / 2 + 10, B = _.width / 2;
        e.shape == "d10" ? (y = y * 0.75, P = P * 1.15 - 10) : e.shape == "d20" && (B = B * 0.98), f.font = y + "pt " + e.font, v.font = y + "pt " + e.font;
        let L = f.measureText("M").width * 1.4, U = d.split(`
`);
        U.length > 1 && (y = y / U.length, f.font = y + "pt " + e.font, v.font = y + "pt " + e.font, L = f.measureText("M").width * 1.2, P -= L * U.length / 2);
        for (let O = 0, F = U.length; O < F; O++) {
          let K = U[O].trim();
          l != "none" && l != c && (f.strokeStyle = l, f.lineWidth = 5, f.strokeText(U[O], B, P), v.strokeStyle = "#000000", v.lineWidth = 5, v.strokeText(U[O], B, P), (K == "6" || K == "9") && (f.strokeText("  .", B, P), v.strokeText("  .", B, P))), f.fillStyle = a, f.fillText(U[O], B, P), v.fillStyle = "#000000", v.fillText(U[O], B, P), (K == "6" || K == "9") && (f.fillText("  .", B, P), v.fillText("  .", B, P)), P += L * 1.5;
        }
      }
    } else {
      var x = _.width / 2, A = _.height / 2;
      f.font = M / 128 * 24 + "pt " + e.font, v.font = M / 128 * 24 + "pt " + e.font;
      for (let y = 0; y < d.length; y++) {
        if (d[y] instanceof HTMLImageElement) {
          let P = d[y].width / _.width;
          f.drawImage(
            d[y],
            0,
            0,
            d[y].width,
            d[y].height,
            100 / P,
            25 / P,
            60 / P,
            60 / P
          );
        } else
          l != "none" && l != c && (f.strokeStyle = l, f.lineWidth = 5, f.strokeText(d[y], x, A - M * 0.3), v.strokeStyle = "#000000", v.lineWidth = 5, v.strokeText(d[y], x, A - M * 0.3)), f.fillStyle = a, f.fillText(d[y], x, A - M * 0.3), v.fillStyle = "#000000", v.fillText(d[y], x, A - M * 0.3);
        f.translate(x, A), f.rotate(Math.PI * 2 / 3), f.translate(-x, -A), v.translate(x, A), v.rotate(Math.PI * 2 / 3), v.translate(-x, -A);
      }
    }
    var T = new Oa(_), C;
    T.colorSpace = "srgb";
    return u ? C = null : C = new Oa(p), h && (this.cache_misses++, this.materials_cache[g] = { composite: T, bump: C }), { composite: T, bump: C };
  }
  applyColorSet(e) {
    var t;
    this.colordata = e, this.label_color = e.foreground, this.dice_color = e.background, this.label_outline = e.outline, this.dice_texture = e.texture, this.dice_material = ((t = e == null ? void 0 : e.texture) == null ? void 0 : t.material) || "none", this.edge_color = e.hasOwnProperty("edge") ? e.edge : e.background;
  }
  setMaterialInfo(e = "") {
    let t = this.colordata, n = this.dice_texture, i = this.dice_material;
    if (this.dice_color_rand = "", this.label_color_rand = "", this.label_outline_rand = "", this.dice_texture_rand = "", this.dice_material_rand = "", this.edge_color_rand = "", Array.isArray(this.dice_color)) {
      var s = Math.floor(Math.random() * this.dice_color.length);
      Array.isArray(this.label_color) && this.label_color.length == this.dice_color.length && (this.label_color_rand = this.label_color[s], Array.isArray(this.label_outline) && this.label_outline.length == this.label_color.length && (this.label_outline_rand = this.label_outline[s])), Array.isArray(this.dice_texture) && this.dice_texture.length == this.dice_color.length && (this.dice_texture_rand = this.dice_texture[s], this.dice_material_rand = this.dice_texture_rand.material), Array.isArray(this.edge_color) && this.edge_color.length == this.dice_color.length && (this.edge_color_rand = this.edge_color[s]), this.dice_color_rand = this.dice_color[s];
    } else
      this.dice_color_rand = this.dice_color;
    if (this.edge_color_rand == "")
      if (Array.isArray(this.edge_color)) {
        var s = Math.floor(Math.random() * this.edge_color.length);
        this.edge_color_rand = this.edge_color[s];
      } else
        this.edge_color_rand = this.edge_color;
    if (this.label_color_rand == "" && Array.isArray(this.label_color)) {
      var s = this.label_color[Math.floor(Math.random() * this.label_color.length)];
      Array.isArray(this.label_outline) && this.label_outline.length == this.label_color.length && (this.label_outline_rand = this.label_outline[s]), this.label_color_rand = this.label_color[s];
    } else
      this.label_color_rand == "" && (this.label_color_rand = this.label_color);
    if (this.label_outline_rand == "" && Array.isArray(this.label_outline)) {
      var s = this.label_outline[Math.floor(Math.random() * this.label_outline.length)];
      this.label_outline_rand = this.label_outline[s];
    } else
      this.label_outline_rand == "" && (this.label_outline_rand = this.label_outline);
    this.dice_texture_rand == "" && Array.isArray(this.dice_texture) ? (this.dice_texture_rand = this.dice_texture[Math.floor(Math.random() * this.dice_texture.length)], this.dice_material_rand = this.dice_texture_rand.material || this.dice_material) : this.dice_texture_rand == "" && (this.dice_texture_rand = this.dice_texture, this.dice_material_rand = this.dice_texture_rand.material || this.dice_material), this.dice_material_rand == "" && Array.isArray(this.dice_material) ? this.dice_material_rand = this.dice_material[Math.floor(Math.random() * this.dice_material.length)] : this.dice_material_rand == "" && (this.dice_material_rand = this.dice_material), this.colordata && this.colordata.id != t.id && this.applyColorSet(t, n, i);
  }
  calc_texture_size(e) {
    return Math.pow(2, Math.floor(Math.log(e) / Math.log(2)));
  }
  createGeometry(e, t, n = !1) {
    const i = n ? "create_shape" : "create_geom";
    switch (e) {
      case "d2":
        var s = new Bo(1 * t, 1 * t, 0.1 * t, 32);
        return s.cannon_shape = new ch(1 * t, 1 * t, 0.1 * t, 8), s;
      case "d4":
        return this[i](kt.d4.vertices, kt.d4.faces, t, -0.1, Math.PI * 7 / 6, 0.96);
      case "d6":
        return this[i](kt.d6.vertices, kt.d6.faces, t, 0.1, Math.PI / 4, 0.96);
      case "d8":
        return this[i](kt.d8.vertices, kt.d8.faces, t, 0, -Math.PI / 4 / 2, 0.965);
      case "d10":
        return this[i](kt.d10.vertices, kt.d10.faces, t, 0.3, Math.PI, 0.945);
      case "d12":
        return this[i](kt.d12.vertices, kt.d12.faces, t, 0.2, -Math.PI / 4 / 2, 0.968);
      case "d20":
        return this[i](kt.d20.vertices, kt.d20.faces, t, -0.2, -Math.PI / 4 / 2, 0.955);
      default:
        return console.error(`Geometry for ${e} is not available`), null;
    }
  }
  fixmaterials(e, t) {
    for (let i = 0, s = e.geometry.groups.length; i < s; ++i) {
      var n = e.geometry.groups[i].materialIndex - 2;
      if (n < t)
        continue;
      let o = n % t;
      e.geometry.groups[i].materialIndex = o + 2;
    }
    return e.geometry.elementsNeedUpdate = !0, e;
  }
  create_shape(e, t, n) {
    for (var i = new Array(e.length), s = 0; s < e.length; ++s)
      i[s] = new H().fromArray(e[s]).normalize();
    for (var o = new Array(e.length), a = new Array(t.length), s = 0; s < i.length; ++s) {
      var l = i[s];
      o[s] = new S(l.x * n, l.y * n, l.z * n);
    }
    for (var s = 0; s < t.length; ++s)
      a[s] = t[s].slice(0, t[s].length - 1);
    return new Qn({ vertices: o, faces: a });
  }
  make_geom(e, t, n, i, s) {
    let o = new ln();
    for (let g = 0; g < e.length; ++g)
      e[g] = e[g].multiplyScalar(n);
    let a = [];
    const l = [], c = [], h = new H(), d = new H();
    let u, m = 0;
    for (let g = 0; g < t.length; ++g) {
      let _ = t[g], f = _.length - 1, p = Math.PI * 2 / f;
      u = _[f] + 1;
      for (let M = 0; M < f - 2; ++M)
        a.push(...e[_[0]].toArray()), a.push(...e[_[M + 1]].toArray()), a.push(...e[_[M + 2]].toArray()), h.subVectors(e[_[M + 2]], e[_[M + 1]]), d.subVectors(e[_[0]], e[_[M + 1]]), h.cross(d), h.normalize(), l.push(...h.toArray()), l.push(...h.toArray()), l.push(...h.toArray()), c.push((Math.cos(s) + 1 + i) / 2 / (1 + i), (Math.sin(s) + 1 + i) / 2 / (1 + i)), c.push(
          (Math.cos(p * (M + 1) + s) + 1 + i) / 2 / (1 + i),
          (Math.sin(p * (M + 1) + s) + 1 + i) / 2 / (1 + i)
        ), c.push(
          (Math.cos(p * (M + 2) + s) + 1 + i) / 2 / (1 + i),
          (Math.sin(p * (M + 2) + s) + 1 + i) / 2 / (1 + i)
        );
      let v = (f - 2) * 3;
      for (let M = 0; M < v / 3; M++)
        o.addGroup(m, 3, u), m += 3;
    }
    return o.setAttribute("position", new Et(a, 3)), o.setAttribute("normal", new Et(l, 3)), o.setAttribute("uv", new Et(c, 2)), o.boundingSphere = new Ki(new H(), n), o;
  }
  make_d10_geom(e, t, n, i, s) {
    let o = new ln();
    for (let M = 0; M < e.length; ++M)
      e[M] = e[M].multiplyScalar(n);
    let a = [];
    const l = [], c = [], h = new H(), d = new H();
    let u, m = 0;
    for (let M = 0; M < t.length; ++M) {
      let x = t[M], A = x.length - 1, T = Math.PI * 2 / A;
      u = x[A] + 1;
      var g = 0.65, _ = 0.85, f = 1 - 1 * _, p = 1 - 0.895 / 1.105 * _, v = 1;
      for (let D = 0; D < A - 2; ++D)
        a.push(...e[x[0]].toArray()), a.push(...e[x[D + 1]].toArray()), a.push(...e[x[D + 2]].toArray()), h.subVectors(e[x[D + 2]], e[x[D + 1]]), d.subVectors(e[x[0]], e[x[D + 1]]), h.cross(d), h.normalize(), l.push(...h.toArray()), l.push(...h.toArray()), l.push(...h.toArray()), t[M][t[M].length - 1] == -1 || D >= 2 ? (c.push((Math.cos(s) + 1 + i) / 2 / (1 + i), (Math.sin(s) + 1 + i) / 2 / (1 + i)), c.push(
          (Math.cos(T * (D + 1) + s) + 1 + i) / 2 / (1 + i),
          (Math.sin(T * (D + 1) + s) + 1 + i) / 2 / (1 + i)
        ), c.push(
          (Math.cos(T * (D + 2) + s) + 1 + i) / 2 / (1 + i),
          (Math.sin(T * (D + 2) + s) + 1 + i) / 2 / (1 + i)
        )) : D == 0 ? (c.push(0.5 - g / 2, p), c.push(0.5, f), c.push(0.5 + g / 2, p)) : D == 1 && (c.push(0.5 - g / 2, p), c.push(0.5 + g / 2, p), c.push(0.5, v));
      let C = (A - 2) * 3;
      for (let D = 0; D < C / 3; D++)
        o.addGroup(m, 3, u), m += 3;
    }
    return o.setAttribute("position", new Et(a, 3)), o.setAttribute("normal", new Et(l, 3)), o.setAttribute("uv", new Et(c, 2)), o.boundingSphere = new Ki(new H(), n), o;
  }
  chamfer_geom(e, t, n) {
    for (var i = [], s = [], o = new Array(e.length), a = 0; a < e.length; ++a)
      o[a] = [];
    for (var a = 0; a < t.length; ++a) {
      for (var l = t[a], c = l.length - 1, h = new H(), d = new Array(c), u = 0; u < c; ++u) {
        var m = e[l[u]].clone();
        h.add(m), o[l[u]].push(d[u] = i.push(m) - 1);
      }
      h.divideScalar(c);
      for (var u = 0; u < c; ++u) {
        var m = i[d[u]];
        m.subVectors(m, h).multiplyScalar(n).addVectors(m, h);
      }
      d.push(l[c]), s.push(d);
    }
    for (var a = 0; a < t.length - 1; ++a)
      for (var u = a + 1; u < t.length; ++u) {
        for (var g = [], _ = -1, f = 0; f < t[a].length - 1; ++f) {
          var p = t[u].indexOf(t[a][f]);
          p >= 0 && p < t[u].length - 1 && (_ >= 0 && f != _ + 1 ? g.unshift([a, f], [u, p]) : g.push([a, f], [u, p]), _ = f);
        }
        g.length == 4 && s.push([
          s[g[0][0]][g[0][1]],
          s[g[1][0]][g[1][1]],
          s[g[3][0]][g[3][1]],
          s[g[2][0]][g[2][1]],
          -1
        ]);
      }
    for (var a = 0; a < o.length; ++a) {
      for (var v = o[a], d = [v[0]], M = v.length - 1; M; ) {
        for (var f = t.length; f < s.length; ++f) {
          var x = s[f].indexOf(d[d.length - 1]);
          if (x >= 0 && x < 4) {
            --x == -1 && (x = 3);
            var A = s[f][x];
            if (v.indexOf(A) >= 0) {
              d.push(A);
              break;
            }
          }
        }
        --M;
      }
      d.push(-1), s.push(d);
    }
    return { vectors: i, faces: s };
  }
  create_geom(e, t, n, i, s, o) {
    for (var a = new Array(e.length), l = 0; l < e.length; ++l)
      a[l] = new H().fromArray(e[l]).normalize();
    var c = this.chamfer_geom(a, t, o);
    if (t.length != 10)
      var h = this.make_geom(c.vectors, c.faces, n, i, s);
    else
      var h = this.make_d10_geom(c.vectors, c.faces, n, i, s);
    return h.cannon_shape = this.create_shape(e, t, n), h.name = "d" + t.length, h;
  }
};
let zs = Ei;
Yo(zs, "dice", {});
class pl {
  constructor(e) {
    typeof e == "object" && (e = e.notation), this.set = [], this.setkeys = [], this.setid = 0, this.groups = [], this.totalDice = 0, this.op = "", this.constant = null, this.result = [], this.error = !1, this.boost = 1, this.notation = "", this.vectors = [], (!e || e == "0") && (this.error = !0), this.parseNotation(e);
  }
  parseNotation(e) {
    if (e) {
      let u = e.split("!").length - 1 || 0;
      u > 0 && (this.boost = Math.min(Math.max(u, 0), 3) * 4), e = e.split("!").join(""), e = e.split(" ").join("");
      let m = e.split("(").length - 1, g = e.split(")").length - 1;
      m != g && (this.error = !0);
    }
    const t = this.notation.length > 0 ? "+" : "";
    this.notation += t + e;
    let n = e.split("@"), i = n[0], s = new RegExp(/(\+|\-|\*|\/|\%|\^|){0,1}()(\d*)([a-z]+\d+|[a-z]+|)(?:\{([a-z]+)(.*?|)\}|)()/, "i"), o = new RegExp(/(\b)*(\-\d+|\d+)(\b)*/, "gi"), a, l = 0, c = 30, h = 0, d = 0;
    for (; !this.error && i.length > 0 && (a = s.exec(i)) !== null && l < c; ) {
      l++, i = i.substring(a[0].length);
      let u = a[1], m = a[2] && a[2].length > 0, g = a[3], _ = a[4], f = a[5] || "", p = a[6] || "", v = a[7] && a[7].length > 0, M = !0;
      m && (h += a[2].length), p = p.split(","), (!p || p.length < 1) && (p = ""), p.shift(), l == 1 && i.length == 0 && !_ && u && g ? (_ = "d20", this.op = u, this.constant = parseInt(g), g = 1) : l > 1 && i.length == 0 && !_ && (this.op = u, this.constant = parseInt(g), M = !1), M && this.addSet(g, _, d, h, f, p, u), v && (h -= a[7].length, d += a[7].length);
    }
    !this.error && n[1] && (a = n[1].match(o)) !== null && this.result.push(...a);
  }
  stringify(e = !0) {
    let t = "";
    if (this.set.length < 1)
      return t;
    for (let n = 0; n < this.set.length; n++) {
      let i = this.set[n];
      t += n > 0 && i.op ? i.op : "", t += i.num + i.type, i.func && (t += "{", t += i.func ? i.func : "", t += i.args ? "," + (Array.isArray(i.args) ? i.args.join(",") : i.args) : "", t += "}");
    }
    return t += this.constant ? this.op + "" + Math.abs(this.constant) : "", e && this.result && this.result.length > 0 && (t += "@" + this.result.join(",")), this.boost > 1 && (t += "!".repeat(this.boost / 4)), t;
  }
  addSet(e, t, n = 0, i = 0, s = "", o = "", a = "+") {
    e = Math.abs(parseInt(e || 1));
    let l = a + "" + t + n + i + s + o, c = this.setkeys[l] != null, h = {};
    c && (h = this.set[this.setkeys[l] - 1]), e > 0 && (h.num = c ? e + h.num : e, h.type = t, h.sid = this.setid, h.gid = n, h.glvl = i, s && (h.func = s), o && (h.args = o), a && (h.op = a), c ? this.set[this.setkeys[l] - 1] = h : this.setkeys[l] = this.set.push(h)), c || ++this.setid;
  }
  static mergeNotation(e, t) {
    return {
      ...e,
      constant: e.constant + t.constant,
      notation: e.notation + "+" + t.notation,
      set: [...e.set, ...t.set],
      totalDice: e.vectors.length + t.vectors.length,
      vectors: [...e.vectors, ...t.vectors]
    };
  }
}
const e0 = (r) => {
  let e;
  return function() {
    let t = this, n = arguments;
    e && window.cancelAnimationFrame(e), e = window.requestAnimationFrame(function() {
      r.apply(t, n);
    });
  };
}, t0 = {
  assetPath: "./",
  framerate: 1 / 60,
  // Patched at Unit 3.6. `sounds`, `volume` and `sound_dieMaterial` stood here
  // and belonged to the deleted mp3 path. `onImpact` replaces all three: null
  // reports nothing, which is what a tray with the sound turned off does.
  onImpact: null,
  color_spotlight: 15720405,
  shadows: !0,
  theme_surface: "felt",
  theme_customColorset: null,
  theme_colorset: "bone",
  theme_texture: "",
  theme_material: "glass",
  gravity_multiplier: 400,
  light_intensity: 2,
  baseScale: 100,
  strength: 1,
  iterationLimit: 1e3,
  preserveDrawingBuffer: !1,
  onRollComplete: () => {
  },
  onRerollComplete: () => {
  },
  onAddDiceComplete: () => {
  },
  onRemoveDiceComplete: () => {
  },
  enableDiceSelection: !1,
  onDiceHover: () => {
  },
  onDiceClick: () => {
  }
};
class i0 {
  constructor(e, t = {}) {
    this.initialized = !1, this.container = e instanceof HTMLElement ? e : document.querySelector(e), this.dimensions = new ze(this.container.clientWidth, this.container.clientHeight), this.adaptive_timestep = !1, this.last_time = 0, this.running = !1, this.rolling = !1, this.threadid, this.raycaster = new hf(), this.mouse = new ze(), this.hoveredDice = null, this.display = {
      currentWidth: null,
      currentHeight: null,
      containerWidth: null,
      containerHeight: null,
      aspect: null,
      scale: null
    }, this.cameraHeight = {
      max: null,
      close: null,
      medium: null,
      far: null
    }, this.scene = new Kd(), this.world = new Au(), this.dice_body_material = new ti(), this.iteration, this.renderer, this.barrier, this.camera, this.light, this.light_amb, this.desk, this.box_body = {}, this.bodies = [], this.meshes = [], this.diceList = [], this.notationVectors = null, this.dieIndex = 0, this.animstate = "", this.selector = {
      animate: !0,
      rotate: !0,
      intersected: null,
      dice: []
    }, Object.assign(this, t0, t), this.DiceColors = new K_({ assetPath: this.assetPath }), this.DiceFactory = new zs({
      baseScale: this.baseScale
    }), this.DiceFactory.setBumpMapping(!0), this.surface = j_[this.theme_surface].surface;
  }
  enableShadows() {
    this.shadows = !0, this.renderer && (this.renderer.shadowMap.enabled = this.shadows), this.light && (this.light.castShadow = this.shadows), this.desk && (this.desk.receiveShadow = this.shadows);
  }
  disableShadows() {
    this.shadows = !1, this.renderer && (this.renderer.shadowMap.enabled = this.shadows), this.light && (this.light.castShadow = this.shadows), this.desk && (this.desk.receiveShadow = this.shadows);
  }
  async initialize() {
    this.renderer = new Y_({ antialias: !0, alpha: !0, preserveDrawingBuffer: this.preserveDrawingBuffer === !0 }), this.container.appendChild(this.renderer.domElement), this.renderer.shadowMap.enabled = this.shadows, this.renderer.shadowMap.type = wl, this.renderer.setClearColor(0, 0), this.setDimensions(this.dimensions), this.world.gravity.set(0, 0, -9.8 * this.gravity_multiplier), this.world.broadphase = new gl(), this.world.solver.iterations = 14, this.world.allowSleep = !0, this.makeWorldBox(), this.resizeWorld(), await this.loadTheme({
      colorset: this.theme_colorset,
      texture: this.theme_texture,
      material: this.theme_material
    }).catch((e) => {
      throw new Error("Unable to load theme");
    }), this.initialized = !0, this.renderer.render(this.scene, this.camera), this.enableDiceSelection && (this.container.addEventListener("mousemove", this.onMouseMove.bind(this)), this.container.addEventListener("click", this.onMouseClick.bind(this)));
  }
  makeWorldBox() {
    Object.keys(this.box_body).length && (this.world.removeBody(this.box_body.desk), this.world.removeBody(this.box_body.topWall), this.world.removeBody(this.box_body.bottomWall), this.world.removeBody(this.box_body.leftWall), this.world.removeBody(this.box_body.rightWall));
    const e = new ti(), t = new ti();
    this.world.addContactMaterial(
      new ei(e, this.dice_body_material, {
        mass: 0,
        friction: 0.6,
        restitution: 0.5
      })
    ), this.world.addContactMaterial(
      new ei(t, this.dice_body_material, {
        mass: 0,
        friction: 0.6,
        restitution: 1
      })
    ), this.world.addContactMaterial(
      new ei(this.dice_body_material, this.dice_body_material, {
        mass: 0,
        friction: 0.6,
        restitution: 0.5
      })
    ), this.box_body.desk = new oe({
      allowSleep: !1,
      mass: 0,
      shape: new Ui(),
      material: e
    }), this.world.addBody(this.box_body.desk), this.box_body.topWall = new oe({
      allowSleep: !1,
      mass: 0,
      shape: new Ui(),
      material: t
    }), this.box_body.topWall.quaternion.setFromAxisAngle(new S(1, 0, 0), Math.PI / 2), this.box_body.topWall.position.set(0, this.display.wallY, 0), this.world.addBody(this.box_body.topWall), this.box_body.bottomWall = new oe({
      allowSleep: !1,
      mass: 0,
      shape: new Ui(),
      material: t
    }), this.box_body.bottomWall.quaternion.setFromAxisAngle(new S(1, 0, 0), -Math.PI / 2), this.box_body.bottomWall.position.set(0, -this.display.wallY, 0), this.world.addBody(this.box_body.bottomWall), this.box_body.leftWall = new oe({
      allowSleep: !1,
      mass: 0,
      shape: new Ui(),
      material: t
    }), this.box_body.leftWall.quaternion.setFromAxisAngle(new S(0, 1, 0), -Math.PI / 2), this.box_body.leftWall.position.set(this.display.wallX, 0, 0), this.world.addBody(this.box_body.leftWall), this.box_body.rightWall = new oe({
      allowSleep: !1,
      mass: 0,
      shape: new Ui(),
      material: t
    }), this.box_body.rightWall.quaternion.setFromAxisAngle(new S(0, 1, 0), Math.PI / 2), this.box_body.rightWall.position.set(-this.display.wallX, 0, 0), this.world.addBody(this.box_body.rightWall);
  }
  async loadTheme(e) {
    let t;
    this.theme_customColorset ? t = await this.DiceColors.makeColorSet(this.theme_customColorset) : t = await this.DiceColors.getColorSet(e), this.DiceFactory.applyColorSet(t), this.colorData = t;
  }
  // Patched at Unit 3.6. `loadSounds` and `loadAudio` stood here. They fetched
  // 43 mp3 files from `assetPath`, which Unit 3.1 deleted, so both were a path
  // to a run of 404s. Unit 3.6 synthesises every sound instead.
  async updateConfig(e = {}) {
    Object.apply(this, e), this.theme_customColorset = e.theme_customColorset ? e.theme_customColorset : null, e.theme_colorset && (this.theme_colorset = e.theme_colorset), e.theme_texture && (this.theme_texture = e.theme_texture), e.theme_material && (this.theme_material = e.theme_material), (e.theme_colorset || e.theme_texture || e.theme_material || e.theme_customColorset) && await this.loadTheme({
      colorset: this.theme_colorset,
      texture: this.theme_texture,
      material: this.theme_material
    });
  }
  setDimensions(e) {
    switch (this.display.currentWidth = this.container.clientWidth / 2, this.display.currentHeight = this.container.clientHeight / 2, e ? (this.display.containerWidth = e.x, this.display.containerHeight = e.y) : (this.display.containerWidth = this.display.currentWidth, this.display.containerHeight = this.display.currentHeight), this.display.aspect = Math.min(
      this.display.currentWidth / this.display.containerWidth,
      this.display.currentHeight / this.display.containerHeight
    ), this.display.scale = Math.sqrt(
      this.display.containerWidth * this.display.containerWidth + this.display.containerHeight * this.display.containerHeight
    ) / 13, this.display.wallX = Math.max(this.display.containerWidth - this.baseScale, this.display.containerWidth * 0.4), this.display.wallY = Math.max(this.display.containerHeight - this.baseScale, this.display.containerHeight * 0.4), this.makeWorldBox(), this.renderer.setSize(this.display.currentWidth * 2, this.display.currentHeight * 2), this.cameraHeight.max = this.display.currentHeight / this.display.aspect / Math.tan(10 * Math.PI / 180), this.cameraHeight.medium = this.cameraHeight.max / 1.5, this.cameraHeight.far = this.cameraHeight.max, this.cameraHeight.close = this.cameraHeight.max / 2, this.camera && this.scene.remove(this.camera), this.camera = new It(
      20,
      this.display.currentWidth / this.display.currentHeight,
      1,
      this.cameraHeight.max * 1.3
    ), this.animstate) {
      case "selector":
        this.camera.position.z = this.selector.dice.length > 9 ? this.cameraHeight.far : this.selector.dice.length < 6 ? this.cameraHeight.close : this.cameraHeight.medium;
        break;
      case "throw":
      case "afterthrow":
      default:
        this.camera.position.z = this.cameraHeight.far;
    }
    this.camera.lookAt(new H(0, 0, 0));
    const t = Math.max(this.display.containerWidth, this.display.containerHeight);
    this.light && this.scene.remove(this.light), this.light_amb && this.scene.remove(this.light_amb), this.light = new af(this.color_spotlight, this.light_intensity), this.light.position.set(-t / 2, t / 2, t * 3), this.light.target.position.set(0, 0, 0), this.light.distance = t * 5, this.light.angle = Math.PI / 4, this.light.castShadow = this.shadows, this.light.shadow.camera.near = t / 10, this.light.shadow.camera.far = t * 5, this.light.shadow.camera.fov = 50, this.light.shadow.bias = 1e-3, this.light.shadow.mapSize.width = 1024, this.light.shadow.mapSize.height = 1024, this.scene.add(this.light), this.light_amb = new sf(16777215, 2303019, this.light_intensity), this.scene.add(this.light_amb), this.desk && this.scene.remove(this.desk);
    let n = new Jd();
    n.opacity = 0.5, this.desk = new $t(
      new ns(this.display.containerWidth * 6, this.display.containerHeight * 6, 1, 1),
      n
    ), this.desk.receiveShadow = this.shadows, this.scene.add(this.desk), this.renderer.render(this.scene, this.camera);
  }
  resizeWorld() {
    const t = e0(() => {
      const n = this.renderer.domElement, i = this.container.clientWidth, s = this.container.clientHeight, o = n.width !== i || n.height !== s;
      return o && this.setDimensions(new ze(this.container.clientWidth, this.container.clientHeight)), o;
    });
    window.addEventListener("resize", t);
  }
  vectorRand({ x: e, y: t }) {
    let n = Math.random() * Math.PI / 5 - Math.PI / 5 / 2, i = {
      x: e * Math.cos(n) - t * Math.sin(n),
      y: e * Math.sin(n) + t * Math.cos(n)
    };
    return i.x == 0 && (i.x = 0.01), i.y == 0 && (i.y = 0.01), i;
  }
  getNotationVectors(e, t, n, i) {
    let s = new pl(e);
    for (let o in s.set) {
      const a = this.DiceFactory.get(s.set[o].type);
      let l = s.set[o].num, c = s.set[o].op, h = s.set[o].sid, d = s.set[o].gid, u = s.set[o].glvl, m = s.set[o].func, g = s.set[o].args;
      for (let _ = 0; _ < l; _++) {
        let f = this.vectorRand(t);
        f.x /= i, f.y /= i;
        let p = {
          x: this.display.wallX * (f.x > 0 ? -1 : 1) * 0.9,
          y: this.display.wallY * (f.y > 0 ? -1 : 1) * 0.9,
          z: Math.random() * 200 + 200
        }, v = Math.abs(f.x / f.y);
        v > 1 ? p.y /= v : p.x *= v;
        let M = this.vectorRand(t);
        M.x /= i, M.y /= i;
        let x, A, T;
        a.shape != "d2" ? (x = {
          x: M.x * n,
          y: M.y * n,
          z: -10
        }, A = {
          x: -(Math.random() * f.y * 5 + a.inertia * f.y),
          y: Math.random() * f.x * 5 + a.inertia * f.x,
          z: 0
        }, T = {
          x: Math.random(),
          y: Math.random(),
          z: Math.random(),
          a: Math.random()
        }) : (x = {
          x: M.x * n / 10,
          y: M.y * n / 10,
          z: 3e3
        }, A = {
          x: 12 * a.inertia,
          y: 1 * a.inertia,
          z: 0
        }, T = {
          x: 1,
          y: 1,
          z: Math.random(),
          a: Math.random()
        }), s.vectors.push({
          index: this.dieIndex++,
          type: a.type,
          op: c,
          sid: h,
          gid: d,
          glvl: u,
          func: m,
          args: g,
          pos: p,
          velocity: x,
          angle: A,
          axis: T
        });
      }
    }
    return s;
  }
  swapDiceFace(e, t) {
    const n = this.DiceFactory.get(e.notation.type);
    if (e.resultReason = "forced", n.shape == "d4") {
      this.swapDiceFace_D4(e, t);
      return;
    }
    n.values;
    let i = parseInt(e.getLastValue().value);
    t = parseInt(t), e.notation.type == "d10" && i == 0 && (i = 10), e.notation.type == "d100" && i == 0 && (i = 100), e.notation.type == "d100" && i > 0 && i < 10 && (i *= 10), e.notation.type == "d10" && t == 0 && (t = 10), e.notation.type == "d100" && t == 0 && (t = 100), e.notation.type == "d100" && t > 0 && t < 10 && (t *= 10);
    let s = n.values.indexOf(i), o = n.values.indexOf(t);
    if (s < 0 || o < 0 || s == o)
      return;
    let a = e.geometry.clone(), l = [], c = [], h = 2;
    n.shape == "d10" && (h = 1);
    let d, u = o + h;
    n.shape != "d2" ? (d = s + h, u = o + h) : (d = s + 1, u = o + 1);
    for (var m = 0, g = a.groups.length; m < g; ++m) {
      const f = a.groups[m].materialIndex;
      if (f == d) {
        l.push(m);
        continue;
      }
      if (f == u) {
        c.push(m);
        continue;
      }
    }
    if (!(l.length <= 0 || c.length <= 0)) {
      for (let _ = 0, f = c.length; _ < f; _++)
        a.groups[c[_]].materialIndex = d;
      for (let _ = 0, f = l.length; _ < f; _++)
        a.groups[l[_]].materialIndex = u;
      a.cannon_shape = e.geometry.cannon_shape, e.geometry = a, e.result = [];
    }
  }
  swapDiceFace_D4(e, t) {
    const n = this.DiceFactory.get(e.notation.type);
    let i = parseInt(e.getLastValue().value);
    if (t = parseInt(t), !(i >= 1 && i <= 4))
      return;
    let s = t - i, o = e.geometry.clone();
    for (let a = 0, l = o.groups.length; a < l; ++a) {
      const c = o.groups[a];
      let h = c.materialIndex;
      if (h != 0) {
        for (h += s - 1; h > 4; )
          h -= 4;
        for (; h < 1; )
          h += 4;
        c.materialIndex = h + 1;
      }
    }
    s != 0 && (s < 0 && (s += 4), e.material = this.DiceFactory.createMaterials(n, 0, 0, !1, s)), o.cannon_shape = e.geometry.cannon_shape, e.geometry = o;
  }
  spawnDice(e, t = !1) {
    const { pos: n, axis: i, angle: s, velocity: o } = e;
    let a;
    if (t)
      a = t, a.stopped = 0, this.world.removeBody(a.body);
    else {
      if (a = this.DiceFactory.create(e.type, this.colorData), !a)
        return;
      a.notation = e, a.result = [], a.stopped = 0, a.castShadow = this.shadows, this.scene.add(a), this.diceList.push(a);
    }
    a.body = new oe({
      allowSleep: !0,
      sleepSpeedLimit: 75,
      sleepTimeLimit: 0.9,
      mass: a.mass,
      shape: a.geometry.cannon_shape,
      material: this.dice_body_material
    }), a.body.type = oe.DYNAMIC, a.body.position.set(n.x, n.y, n.z), a.body.quaternion.setFromAxisAngle(new S(i.x, i.y, i.z), i.a * Math.PI * 2), a.body.angularVelocity.set(s.x, s.y, s.z), a.body.velocity.set(o.x, o.y, o.z), a.body.linearDamping = 0.1, a.body.angularDamping = 0.1, a.body.diceShape = a.shape, a.body.sleepState = 0, a.body.addEventListener("collide", this.eventCollide.bind(this)), this.world.addBody(a.body);
  }
  // Patched at Unit 3.6. The published method chose one of the bundled mp3
  // files and played it. Those files are deleted and nothing here loads audio.
  // This method reports the collision and decides nothing: `onImpact` is the
  // application's, and `src/tray/sound.ts` synthesises every sound it makes.
  //
  // `body` is the other body and `target` is the die that carries the listener.
  // A die meeting a wall or the desk reports `surface`, because those bodies
  // carry no mass. Cannon reports a new contact on both bodies, so a die
  // meeting a die is reported twice and the reader drops the second one.
  //
  // Nothing is reported while `animstate` is "simulate". That pass decides
  // every face, and the library then puts the bodies back and replays the same
  // steps for the player to watch, so a collision reported in both passes would
  // sound twice.
  eventCollide({ body, target, contact }) {
    if (this.animstate == "simulate" || !this.onImpact || !body || !target)
      return;
    this.onImpact({
      kind: body.mass > 0 ? "die" : "surface",
      // How hard, not how fast. The closing speed along the contact normal
      // separates a heavy landing from a die skidding past its neighbour, and
      // the length of a velocity vector cannot tell those apart.
      speed: Math.abs(contact ? contact.getImpactVelocityAlongNormal() : target.velocity.length()),
      self: target.id,
      other: body.id
    });
  }
  checkForRethrow(e) {
    let t = e.notation.func ? e.notation.func.toLowerCase() : "", n, i = !1;
    if (t != "" && n && n.method) {
      t = e.notation.func.toLowerCase();
      let s = e.notation.args || "";
      i = n.method(e, s);
    }
    return i;
  }
  throwFinished() {
    const e = this.iteration > this.iterationLimit;
    for (let t = 0, n = this.diceList.length; t < n; ++t) {
      const i = this.diceList[t], s = oe.SLEEPING;
      if (i.body.sleepState < s && !e)
        return !1;
      if (i.body.sleepState == s || e) {
        if (i.body.type === oe.KINEMATIC)
          continue;
        let o = !1;
        if (i.result.length == 0 ? (i.storeRolledValue(i.resultReason), o = this.checkForRethrow(i)) : i.result.length > 0 && i.rerolling && (i.rerolling = !1, i.storeRolledValue("reroll"), o = this.checkForRethrow(i)), o)
          return i.rerolls += 1, i.rerolling = !0, i.body.wakeUp(), i.body.type = oe.DYNAMIC, i.body.angularVelocity = new S(25, 25, 25), i.body.velocity = new S(0, 0, 3e3), !1;
        i.rerolling = !1, i.body.type = oe.KINEMATIC;
      }
    }
    return !0;
  }
  simulateThrow() {
    // Patched. The world clock is put back where the simulation found it, so
    // the replay that follows reads the same clock values the simulation read.
    // A body sleeps when `world.time - timeLastSleepy` passes `sleepTimeLimit`,
    // and 0.9 seconds is exactly 54 steps of the 1/60 second timestep, so that
    // test lands on a step boundary. The published code let the clock run on
    // into the replay, where `world.time` is larger and its accumulated
    // rounding differs, so a die slept one step earlier there and the two
    // passes came to rest in different poses. The face labels are swapped
    // against the simulated pose, so the player then saw a face the rules core
    // never chose.
    const clock = this.world.time;
    for (this.animstate = "simulate", this.iteration = 0, this.rolling = !0; !this.throwFinished(!0); )
      ++this.iteration, this.world.step(this.framerate);
    this.world.time = clock;
  }
  animateThrow(e, t) {
    this.animstate = "throw";
    let n = Date.now();
    this.last_time = this.last_time || n - this.framerate * 1e3;
    let i = (n - this.last_time) / 1e3;
    ++this.iteration;
    let s = Math.floor(i / this.framerate);
    for (let o = 0; o < s; o++)
      this.world.step(this.framerate), ++this.steps;
    for (let o in this.scene.children) {
      let a = this.scene.children[o];
      a.body != null && (a.position.copy(a.body.position), a.quaternion.copy(a.body.quaternion));
    }
    if (this.renderer.render(this.scene, this.camera), this.last_time = this.last_time + s * this.framerate * 1e3, this.running == e && this.throwFinished()) {
      this.running = !1, this.rolling = !1, t && t.call(this, this.notationVectors), this.running = Date.now(), this.animateAfterThrow(this.running);
      return;
    }
    this.running == e && ((o, a, l, c, h) => {
      !l && i < this.framerate ? setTimeout(
        () => {
          requestAnimationFrame(() => {
            o.call(this, a, c, h);
          });
        },
        (this.framerate - i) * 1e3
      ) : requestAnimationFrame(() => {
        o.call(this, a, c, h);
      });
    }).bind(this)(this.animateThrow, e, this.adaptive_timestep, t);
  }
  animateAfterThrow(e) {
    this.animstate = "afterthrow";
    let t = Date.now(), n = (t - this.last_time) / 1e3;
    n > 3 && (n = this.framerate), this.running = !1, this.last_time = t, this.renderer.render(this.scene, this.camera), this.running == e && ((i, s, o) => {
      !o && n < this.framerate ? setTimeout(
        () => {
          requestAnimationFrame(() => {
            i.call(this, s);
          });
        },
        (this.framerate - n) * 1e3
      ) : requestAnimationFrame(() => {
        i.call(this, s);
      });
    }).bind(this)(this.animateAfterThrow, e, this.adaptive_timestep);
  }
  startClickThrow(e) {
    this.rolling && (this.clearDice(), this.rolling = !1);
    let t = {
      x: (Math.random() * 2 - 0.5) * this.display.currentWidth,
      y: -(Math.random() * 2 - 0.5) * this.display.currentHeight
    }, n = Math.sqrt(t.x * t.x + t.y * t.y) + 100, i = (Math.random() + 3) * n * this.strength;
    return this.getNotationVectors(e, t, i, n);
  }
  clearDice() {
    this.running = !1;
    let e;
    for (; e = this.diceList.pop(); )
      this.scene.remove(e), e.body && this.world.removeBody(e.body);
    this.renderer.render(this.scene, this.camera), setTimeout(() => {
      this.renderer.render(this.scene, this.camera);
    }, 100);
  }
  getDiceResults(e) {
    if (e !== void 0) {
      const s = this.diceList[e], o = s.position, a = this.getScreenPosition(o);
      return {
        type: s.shape,
        sides: parseInt(s.shape.substring(1)),
        id: e,
        ...s.result.at(-1),
        position: {
          x: o.x,
          y: o.y,
          z: o.z
        },
        screenPosition: a,
        scale: s.scale.x
      };
    }
    let t = 0;
    const n = this.notationVectors.constant ? parseInt(`${this.notationVectors.op}${this.notationVectors.constant}`) : 0;
    let i = n;
    return {
      notation: this.notationVectors.notation,
      sets: this.notationVectors.set.map((s) => {
        const o = t + s.num - 1;
        let a = 0;
        const l = [];
        for (let h = t; h <= o; h++) {
          if (this.diceList[t].result.at(-1).reason === "remove") {
            t++;
            continue;
          }
          const d = this.diceList[t], u = d.position, m = this.getScreenPosition(u);
          l.push({
            type: s.type,
            sides: parseInt(s.type.substring(1)),
            id: t,
            ...d.result.at(-1),
            position: {
              x: u.x,
              y: u.y,
              z: u.z
            },
            screenPosition: m,
            scale: d.scale.x
          }), a += this.diceList[t].result.at(-1).value, t++;
        }
        const c = {
          num: s.num,
          type: s.type,
          sides: parseInt(s.type.substring(1)),
          rolls: l,
          total: a
        };
        return i += a, c;
      }),
      modifier: n,
      total: i
    };
  }
  async roll(e) {
    if (this.notationVectors = this.startClickThrow(e), this.notationVectors)
      return new Promise((t, n) => {
        this.rollDice(() => {
          const i = this.getDiceResults();
          this.onRollComplete(i);
          const s = new CustomEvent("rollComplete", { detail: i });
          document.dispatchEvent(s), t(i);
        });
      });
  }
  async reroll(ids, forced) {
    const wanted = forced ?? [];
    if (wanted.length !== ids.length) throw new Error("reroll needs one predetermined value per die");
    const notation = ids.map((id) => "1" + this.diceList[id].notation.type).join("+") + "@" + wanted.join(",");
    this.rolling = !1;
    const nv = this.getNotationVectors(
      notation,
      { x: (Math.random() * 2 - 0.5) * this.display.currentWidth, y: -(Math.random() * 2 - 0.5) * this.display.currentHeight },
      (Math.random() + 3) * 500 * this.strength,
      500
    );
    for (let k = 0; k < ids.length; k++) {
      const die = this.diceList[ids[k]];
      die.rerolls += 1, die.rerolling = !1, die.result = [], die.resultReason = "natural";
      this.spawnDice(nv.vectors[k], die);
    }
    this.simulateThrow(), this.steps = 0, this.iteration = 0;
    for (let k = 0; k < ids.length; k++) this.spawnDice(nv.vectors[k], this.diceList[ids[k]]);
    for (let k = 0; k < nv.result.length; k++) {
      const die = this.diceList[ids[k]];
      if (die && die.getLastValue().value != nv.result[k]) this.swapDiceFace(die, nv.result[k]);
    }
    return new Promise((resolve) => {
      this.rolling = !0, this.running = Date.now(), this.last_time = 0;
      this.animateThrow(this.running, () => {
        const out = ids.map((id) => this.getDiceResults(id));
        this.onRerollComplete(out);
        document.dispatchEvent(new CustomEvent("rerollComplete", { detail: out }));
        resolve(out);
      });
    });
  }
  async add(e) {
    let t = this.diceList.length;
    if (!t)
      return this.roll(e);
    let n = this.startClickThrow(e), i = [];
    for (let s = 0, o = n.vectors.length; s < o; ++s)
      this.spawnDice(n.vectors[s]);
    this.simulateThrow(), this.steps = 0, this.iteration = 0;
    for (let s = 0, o = n.vectors.length; s < o; ++s) {
      const a = t + s;
      !this.diceList[a] || (this.spawnDice(n.vectors[s], this.diceList[a]), i.push(a));
    }
    if (n.result && n.result.length > 0)
      for (let s = 0; s < n.result.length; s++) {
        const o = t + s;
        let a = this.diceList[o];
        !a || a.getLastValue().value != n.result[s] && this.swapDiceFace(a, n.result[s]);
      }
    return this.notationVectors = pl.mergeNotation(this.notationVectors, n), new Promise((s, o) => {
      const a = () => {
        const l = i.map((h) => this.getDiceResults(h));
        this.onAddDiceComplete(l);
        const c = new CustomEvent("addDiceComplete", { detail: l });
        document.dispatchEvent(c), s(l);
      };
      this.rolling = !0, this.running = Date.now(), this.last_time = 0, this.animateThrow(this.running, a);
    });
  }
  async remove(e) {
    return new Promise((t, n) => {
      const i = [];
      e.forEach((o) => {
        const a = this.diceList[o];
        a.body && this.world.removeBody(a.body), this.scene.remove(a), a.storeRolledValue("remove"), i.push(this.getDiceResults(o));
      }), this.renderer.render(this.scene, this.camera), this.onRemoveDiceComplete(i);
      const s = new CustomEvent("removeDiceComplete", { detail: i });
      document.dispatchEvent(s), t(i);
    });
  }
  rollDice(e) {
    if (this.notationVectors.error) {
      e.call(this);
      return;
    }
    this.clearDice();
    for (let t = 0, n = this.notationVectors.vectors.length; t < n; ++t)
      this.spawnDice(this.notationVectors.vectors[t]);
    this.simulateThrow(), this.steps = 0, this.iteration = 0;
    for (let t = 0, n = this.diceList.length; t < n; ++t)
      !this.diceList[t] || this.spawnDice(this.notationVectors.vectors[t], this.diceList[t]);
    if (this.notationVectors.result && this.notationVectors.result.length > 0)
      for (let t = 0; t < this.notationVectors.result.length; t++) {
        let n = this.diceList[t];
        !n || n.getLastValue().value != this.notationVectors.result[t] && this.swapDiceFace(n, this.notationVectors.result[t]);
      }
    this.rolling = !0, this.running = Date.now(), this.last_time = 0, this.animateThrow(this.running, e);
  }
  onMouseMove(e) {
    if (!this.enableDiceSelection || this.rolling)
      return;
    const t = this.container.getBoundingClientRect();
    this.mouse.x = (e.clientX - t.left) / t.width * 2 - 1, this.mouse.y = -((e.clientY - t.top) / t.height) * 2 + 1, this.raycaster.setFromCamera(this.mouse, this.camera);
    const n = this.raycaster.intersectObjects(this.diceList);
    if (n.length > 0) {
      const i = n[0].object;
      if (this.hoveredDice !== i) {
        const s = this.getDiceResults(this.diceList.indexOf(i)), o = i.position, a = this.getScreenPosition(o), l = {
          ...s,
          position: {
            x: o.x,
            y: o.y,
            z: o.z
          },
          screenPosition: a,
          scale: i.scale.x
        };
        this.onDiceHover(l);
        const c = new CustomEvent("diceHover", { detail: l });
        document.dispatchEvent(c), this.hoveredDice = i;
      }
    } else if (this.hoveredDice !== null) {
      this.onDiceHover(null);
      const i = new CustomEvent("diceHover", { detail: null });
      document.dispatchEvent(i), this.hoveredDice = null;
    }
  }
  onMouseClick(e) {
    if (!this.enableDiceSelection || this.rolling || !this.hoveredDice)
      return;
    const t = this.getDiceResults(this.diceList.indexOf(this.hoveredDice)), n = this.hoveredDice.position, i = this.getScreenPosition(n), s = {
      ...t,
      position: {
        x: n.x,
        y: n.y,
        z: n.z
      },
      screenPosition: i,
      scale: this.hoveredDice.scale.x
    };
    this.onDiceClick(s);
    const o = new CustomEvent("diceClick", { detail: s });
    document.dispatchEvent(o);
  }
  getScreenPosition(e) {
    if (this.container) {
      const t = this.container.getBoundingClientRect(), n = new H(e.x, e.y, e.z);
      n.project(this.camera);
      const i = (n.x * 0.5 + 0.5) * t.width, s = (-n.y * 0.5 + 0.5) * t.height;
      return { x: i, y: s };
    }
  }
}
export {
  i0 as DiceBox,
  i0 as default,
  Au as PhysicsWorld,
  oe as PhysicsBody,
  ti as PhysicsMaterial,
  zs as DiceFactory,
  t0 as trayDefaults,
  $t as ThreeMesh,
  ln as ThreeBufferGeometry,
  on as ThreeBufferAttribute,
  kl as ThreeMeshBasicMaterial
};
