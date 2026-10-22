/**
 * Shaders for the landing texture, exactly as the Claude Code desktop app
 * generates them (constants already filled in). Extracted verbatim; see
 * landingTexture.ts for the renderer that drives them.
 */

export const WIND_VS = `#version 300 es
precision highp float;
precision highp int;
uniform uint u_seed;
uniform float u_time;
uniform vec4 u_wind;
uniform vec2 u_canvasCss;
out vec4 v_air;

uint pcg(uint v) {
  uint s = v * 747796405u + 2891336453u;
  uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u;
  return (w >> 22u) ^ w;
}
float unit(uint h) { return float(h >> 8u) * (1.0 / 16777216.0); }


float value(uint v) { return unit(pcg(v)) * 2.0 - 1.0; }
// Value noise on an integer lattice hashed with the visit's seed, from -1 to 1.
float noise(vec3 p, uint salt) {
  vec3 fl = floor(p), f = p - fl;
  ivec3 i = ivec3(fl);
  vec3 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  uint x0 = uint(i.x), x1 = uint(i.x + 1), y0 = uint(i.y), y1 = uint(i.y + 1);
  uint z0 = pcg(uint(i.z) ^ u_seed ^ salt), z1 = pcg(uint(i.z + 1) ^ u_seed ^ salt);
  uint a = pcg(y0 ^ z0), b = pcg(y1 ^ z0), c = pcg(y0 ^ z1), d = pcg(y1 ^ z1);
  return mix(
    mix(mix(value(x0 ^ a), value(x1 ^ a), w.x), mix(value(x0 ^ b), value(x1 ^ b), w.x), w.y),
    mix(mix(value(x0 ^ c), value(x1 ^ c), w.x), mix(value(x0 ^ d), value(x1 ^ d), w.x), w.y),
    w.z);
}

void main() {
  vec2 corner = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
  vec2 heading = vec2(cos(u_wind.x), sin(u_wind.x));
  // It surges and slackens as it goes.
  float carried = u_wind.y * (u_time + 1.0 * noise(vec3(u_time * 0.09, 3.7, 0.0), 0x58u));
  v_air = vec4(heading, carried, 0.58 * (abs(heading.x) * u_canvasCss.x + abs(heading.y) * u_canvasCss.y));
}`;

export const WIND_FS = `#version 300 es
precision highp float;
precision highp int;
uniform uint u_seed;
uniform vec2 u_sampleCss, u_originCss, u_paneCss;
uniform float u_time, u_reveal;
// The wind: its heading, its speed, and the length and width of a gust.
uniform vec4 u_wind;
// How far its path is bent and the size of a bend; then how much lull lies between gusts, and how streaked a gust is.
uniform vec4 u_gust;
// A gust's shape: how broken its outline, how sharp its start, how far the air curls, how many strands trail it.
uniform vec4 u_shape;
// How far behind itself a gust fades out, 0 to 1; and how far gusts keep to the crests of the wind's long swells.
uniform float u_tail, u_sweep;
// How fast a gust changes shape as it travels, against a slow 1.
uniform float u_morph;
in vec4 v_air;
out vec4 o;

const float TAU = 6.2831853;
const vec2 CALM = vec2(250.0, 80.0);
const float CALM_LEFT = 1.0; // 0.3 in the app: dims the area behind its prompt box
const float CARD_Y = 0.45;

uint pcg(uint v) {
  uint s = v * 747796405u + 2891336453u;
  uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u;
  return (w >> 22u) ^ w;
}
float unit(uint h) { return float(h >> 8u) * (1.0 / 16777216.0); }


float value(uint v) { return unit(pcg(v)) * 2.0 - 1.0; }
// Value noise on an integer lattice hashed with the visit's seed, from -1 to 1.
float noise(vec3 p, uint salt) {
  vec3 fl = floor(p), f = p - fl;
  ivec3 i = ivec3(fl);
  vec3 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  uint x0 = uint(i.x), x1 = uint(i.x + 1), y0 = uint(i.y), y1 = uint(i.y + 1);
  uint z0 = pcg(uint(i.z) ^ u_seed ^ salt), z1 = pcg(uint(i.z + 1) ^ u_seed ^ salt);
  uint a = pcg(y0 ^ z0), b = pcg(y1 ^ z0), c = pcg(y0 ^ z1), d = pcg(y1 ^ z1);
  return mix(
    mix(mix(value(x0 ^ a), value(x1 ^ a), w.x), mix(value(x0 ^ b), value(x1 ^ b), w.x), w.y),
    mix(mix(value(x0 ^ c), value(x1 ^ c), w.x), mix(value(x0 ^ d), value(x1 ^ d), w.x), w.y),
    w.z);
}


uniform float u_now;
uniform int u_tapCount;
// Each: where, when, and how hard.
uniform vec4 u_taps[6];
// How far out a heart's outline lies in a direction (a unit vector, y down), against a circle's 1.
float heart(vec2 u) {
  float k = -u.x * u.x * u.y * u.y * u.y;
  float c = sign(k) * pow(abs(k), 1.0 / 3.0);
  float r = 1.0;
  for (int i = 0; i < 6; i++) r = sqrt(max(0.05, 1.0 + c * pow(r, 5.0 / 3.0)));
  return r;
}
// At a place: the air's push in CSS pixels (xy), the wind raised or lowered (z), how roused (w). Out: a ripple's colour (x), its afterlight (y).
vec4 tapsAt(vec2 p, out vec2 glow) {
  vec4 sum = vec4(0.0);
  glow = vec2(0.0);
  // A click is a blow: a front runs out and slows, trough and weaker crest behind, shoving the air outward. Less than nothing: a heart.
  for (int i = 0; i < 6; i++) {
    if (i >= u_tapCount) break;
    vec4 tap = u_taps[i];
    float age = u_now - tap.z;
    vec2 away = p - tap.xy;
    float d = length(away);
    float reach = tap.w < 0.0 ? d / heart(away / max(d, 1.0)) : d;
    float behind = 620.0 * (1.0 - exp(-age / 1.3)) - reach;
    float width = 85.0 + 60.0 * age;
    float front = smoothstep(-16.0, 10.0, behind) * exp(-behind * behind / (width * width));
    float swell = abs(tap.w) * exp(-age / 1.5) * front;
    sum.xy += (away / max(d, 1.0)) * (44.0 * swell);
    sum.z += 1.9 * swell * (0.25 + 0.75 * cos(behind * (6.2831853 / 130.0)));
    sum.w += swell;
    // Far ahead of the front the fade would overflow, and nothing times that is not nothing.
    float trail = smoothstep(0.0, 70.0, behind) * exp(-max(behind, 0.0) / 260.0);
    glow.x += abs(tap.w) * (exp(-age / 1.0) * front + 0.7 * exp(-age / 1.3) * trail);
    glow.y += abs(tap.w) * (1.0 - exp(-age / 0.2)) * exp(-age / 1.2) * trail;
  }
  return sum;
}


uniform int u_wakeCount;
// Each stretch of the hand's path: its middle, how warm it is by now, and one over the square of how far that reaches.
uniform vec4 u_wakes[48];
// And which way it runs (xy), with half its length (z).
uniform vec4 u_ways[48];
// A moving hand warms the air where it is and cools behind in a short tail. No front, no push: ripples are a click's.
float warmthAt(vec2 p) {
  float warmth = 0.0;
  for (int i = 0; i < 48; i++) {
    if (i >= u_wakeCount) break;
    vec4 wake = u_wakes[i];
    vec3 way = u_ways[i].xyz;
    // Each is a stretch of the path, not a point on it, so that the quickest stroke still leaves one trail.
    vec2 away = p - wake.xy;
    away -= way.xy * clamp(dot(away, way.xy), -way.z, way.z);
    warmth += wake.z * exp(-dot(away, away) * wake.w);
  }
  // However hard the air is stirred, it is only ever warmed so far.
  return 1.0 - exp(-1.5 * warmth);
}


// Gradient noise on the same lattice, about -1 to 1: it crosses zero between every pair of points, so it has no soft blobs.
vec3 slope(uint v) {
  uint h = pcg(v);
  return vec3(float(h & 1023u), float((h >> 10u) & 1023u), float((h >> 20u) & 1023u)) * (2.0 / 1023.0) - 1.0;
}
float swirl(vec3 p, uint salt) {
  vec3 fl = floor(p), f = p - fl;
  ivec3 i = ivec3(fl);
  vec3 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  uint x0 = uint(i.x), x1 = uint(i.x + 1), y0 = uint(i.y), y1 = uint(i.y + 1);
  uint z0 = pcg(uint(i.z) ^ u_seed ^ salt), z1 = pcg(uint(i.z + 1) ^ u_seed ^ salt);
  uint a = pcg(y0 ^ z0), b = pcg(y1 ^ z0), c = pcg(y0 ^ z1), d = pcg(y1 ^ z1);
  return 1.5 * mix(
    mix(mix(dot(slope(x0 ^ a), f), dot(slope(x1 ^ a), f - vec3(1.0, 0.0, 0.0)), w.x),
        mix(dot(slope(x0 ^ b), f - vec3(0.0, 1.0, 0.0)), dot(slope(x1 ^ b), f - vec3(1.0, 1.0, 0.0)), w.x), w.y),
    mix(mix(dot(slope(x0 ^ c), f - vec3(0.0, 0.0, 1.0)), dot(slope(x1 ^ c), f - vec3(1.0, 0.0, 1.0)), w.x),
        mix(dot(slope(x0 ^ d), f - vec3(0.0, 1.0, 1.0)), dot(slope(x1 ^ d), f - vec3(1.0)), w.x), w.y),
    w.z);
}

// The gusts in the wind's own frame: longer along it than across, four sizes travelling nearly together, and thin strands between.
float gustsAt(vec2 at, float carried) {
  float gain = mix(0.38, 0.62, u_shape.x);
  float gust = 0.0, weight = 1.0, power = 0.0;
  vec2 size = vec2(0.85, 0.75) * u_wind.zw;
  for (int i = 0; i < 4; i++) {
    float k = float(i);
    gust += weight * swirl(vec3((at.x - carried * (1.0 + 0.1 * k)) / size.x, at.y / size.y, u_morph * u_time * (0.03 + 0.018 * k) + 11.0 * k), 0x60u + uint(i));
    power += weight * weight;
    weight *= gain;
    size *= vec2(0.5, 0.58);
  }
  float strand = 1.0 - abs(swirl(vec3((at.x - 1.15 * carried) / (0.7 * u_wind.z), at.y / (0.95 * u_wind.w), u_morph * u_time * 0.05 + 2.0), 0x66u));
  // Long swells, about one to the pane: gusts gather on a crest, so what is lit keeps together and the pane is seldom full or empty.
  float span = v_air.w;
  // A crest runs now ahead of its time and now behind it, by up to half the way to the next: it keeps no beat.
  float swell = cos((at.x - carried + 0.5 * span * noise(vec3(u_time * 0.045, at.y / (2.5 * u_wind.w), 7.0), 0x67u)) * (TAU / span));
  return gust * inversesqrt(power) + u_shape.w * 0.5 * (strand * strand * strand - 0.35) + u_sweep * swell;
}

void main() {
  vec2 p = u_originCss + gl_FragCoord.xy * u_sampleCss;
  vec2 heading = v_air.xy;
  vec2 across = vec2(-heading.y, heading.x);
  // What the hand has done here, read a little off true, so that a ripple's outline is never a drawn circle.
  vec4 hand = vec4(0.0);
  float warm = 0.0;
  if (u_tapCount + u_wakeCount > 0) {
    vec2 near = p + 24.0 * vec2(
      noise(vec3(p / 95.0, u_now * 0.12), 0x71u),
      noise(vec3(p / 95.0 + 9.1, u_now * 0.12 + 4.0), 0x72u));
    vec2 glow;
    hand = tapsAt(near, glow);
    // The warmth lights the characters by itself, calm air or not; a little of it also raises whatever wind is passing.
    warm = warmthAt(near);
    hand.zw += vec2(0.25, 0.05) * warm;
  }
  // Air that has been pushed shows here what was over there.
  vec2 from = p - hand.xy;
  // The wind's path bends, slowly, and what it carries bends with it.
  vec2 turn = vec2(
    noise(vec3(from / u_gust.y, u_time * 0.04), 0x51u),
    noise(vec3(from / u_gust.y + 17.3, u_time * 0.04 + 5.0), 0x52u));
  vec2 bent = from + u_gust.x * turn;
  vec2 q = vec2(dot(bent, heading), dot(bent, across));
  float carried = v_air.z;

  // The air curls as it travels: small eddies carried on large, and every gust's outline dragged through both.
  vec2 riding = vec2(q.x - 0.85 * carried, q.y);
  float eddySize = 1.15 * u_wind.w, fineSize = 0.38 * u_wind.w;
  vec2 eddy = vec2(
    swirl(vec3(riding / eddySize, u_morph * u_time * 0.04), 0x59u),
    swirl(vec3(riding / eddySize + 31.7, u_morph * u_time * 0.04 + 3.0), 0x5au));
  vec2 folded = riding + u_shape.z * 0.9 * u_wind.w * eddy;
  vec2 fine = vec2(
    swirl(vec3(folded / fineSize, u_morph * u_time * 0.06), 0x5bu),
    swirl(vec3(folded / fineSize + 13.1, u_morph * u_time * 0.06 + 7.0), 0x5cu));
  // And the smallest folds, two or three rows of characters across, so that no edge runs straight down the rows.
  vec2 creased = (folded + 0.3 * u_wind.w * fine) / 24.0;
  vec2 tiny = vec2(
    swirl(vec3(creased, u_time * 0.07), 0x5du),
    swirl(vec3(creased + 5.3, u_time * 0.07 + 1.0), 0x5eu));
  // Roused air curls further.
  vec2 pull = u_shape.z * (1.0 + 0.9 * min(hand.w, 1.5)) * (u_wind.w * (0.9 * eddy + 0.3 * fine) + u_shape.x * 30.0 * tiny);
  vec2 curled = q + pull;
  vec2 blows = normalize(heading + 0.6 * turn + hand.xy / 14.0 + u_shape.z * ((0.45 * eddy.x + 0.25 * fine.x) * heading + (0.45 * eddy.y + 0.25 * fine.y) * across));

  float still = gustsAt(curled, carried);
  float field = still + hand.z;

  // Light begins at once on the side a gust is heading for and thins out behind, so a still frame shows which way the wind goes.
  float level = mix(0.02, 0.82, u_gust.z);
  float band = mix(0.26, 0.03, u_shape.y);
  // Under this nothing shows, whatever lies ahead; and that is most of the pane, where the rest is not worked out.
  bool blowing = field > level - band - 0.55 * u_tail;
  float strength = 0.0, streaks = 0.0;
  if (blowing || warm > 0.0) {
    // Within a gust, thin quick streaks, as wind draws on water.
    float thread = noise(vec3((curled.x - carried * 1.6) / 140.0, curled.y / 30.0, u_time * 0.16), 0x57u);
    streaks = 1.0 - smoothstep(0.0, 0.5, abs(thread));
  }
  if (blowing) {
    float ahead = gustsAt(curled + vec2(56.0, 0.0), carried);
    float leaving = smoothstep(-0.05, 0.07, ahead - still);
    float lit = smoothstep(level - band - 0.55 * u_tail * leaving, level + band, field);
    float broad = lit * lit * mix(0.45, 1.0, clamp((field - level) / 0.45, 0.0, 1.0)) * (0.82 + 0.18 * fine.y);
    strength = broad * mix(1.0, 0.25 + 0.95 * streaks, u_gust.w);
  }
  if (warm > 0.0) {
    // Where the hand has warmed the air it shows, wind or no wind, in the air's own fine grain, which drifts with it.
    float grain = 0.55 * fine.y + 0.45 * tiny.x + 0.3 * (streaks - 0.4);
    strength = 1.0 - (1.0 - strength) * (1.0 - 0.85 * warm * smoothstep(-0.5, 0.25, grain));
  }

  // Thinner behind the content.
  vec2 e = (p - vec2(0.5 * u_paneCss.x, CARD_Y * u_paneCss.y)) / CALM;
  float calm = 1.0 - (1.0 - CALM_LEFT) * exp(-0.9 * dot(e, e));
  // What the hand does shows at once, however little of the wind has arrived.
  float shown = max(u_reveal, min(1.0, 2.0 * hand.w + warm));
  o = vec4(strength * calm * shown, blows * 0.5 + 0.5, calm * shown);
}`;

export const GLYPHS_VS = `#version 300 es
precision highp float;
precision highp int;
uniform highp usampler2D u_boxes;
uniform highp sampler2D u_sequence;
uniform highp sampler2D u_wind;
uniform ivec2 u_grid, u_cell, u_buffer;
uniform uint u_seed;
uniform float u_time, u_fill, u_flick;
uniform int u_count;
// The first cell's middle, and a cell's size, in CSS pixels of the pane.
uniform vec4 u_cellCss;
out vec2 v_shift;
out vec4 v_box;
out vec2 v_glow;
const ivec2 CORNER[6] = ivec2[6](ivec2(0, 0), ivec2(1, 0), ivec2(0, 1), ivec2(0, 1), ivec2(1, 0), ivec2(1, 1));
const ivec2 SAMPLES = ivec2(1, 2);

uint pcg(uint v) {
  uint s = v * 747796405u + 2891336453u;
  uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u;
  return (w >> 22u) ^ w;
}
float unit(uint h) { return float(h >> 8u) * (1.0 / 16777216.0); }


uniform float u_now;
uniform int u_tapCount;
// Each: where, when, and how hard.
uniform vec4 u_taps[6];
// How far out a heart's outline lies in a direction (a unit vector, y down), against a circle's 1.
float heart(vec2 u) {
  float k = -u.x * u.x * u.y * u.y * u.y;
  float c = sign(k) * pow(abs(k), 1.0 / 3.0);
  float r = 1.0;
  for (int i = 0; i < 6; i++) r = sqrt(max(0.05, 1.0 + c * pow(r, 5.0 / 3.0)));
  return r;
}
// At a place: the air's push in CSS pixels (xy), the wind raised or lowered (z), how roused (w). Out: a ripple's colour (x), its afterlight (y).
vec4 tapsAt(vec2 p, out vec2 glow) {
  vec4 sum = vec4(0.0);
  glow = vec2(0.0);
  // A click is a blow: a front runs out and slows, trough and weaker crest behind, shoving the air outward. Less than nothing: a heart.
  for (int i = 0; i < 6; i++) {
    if (i >= u_tapCount) break;
    vec4 tap = u_taps[i];
    float age = u_now - tap.z;
    vec2 away = p - tap.xy;
    float d = length(away);
    float reach = tap.w < 0.0 ? d / heart(away / max(d, 1.0)) : d;
    float behind = 620.0 * (1.0 - exp(-age / 1.3)) - reach;
    float width = 85.0 + 60.0 * age;
    float front = smoothstep(-16.0, 10.0, behind) * exp(-behind * behind / (width * width));
    float swell = abs(tap.w) * exp(-age / 1.5) * front;
    sum.xy += (away / max(d, 1.0)) * (44.0 * swell);
    sum.z += 1.9 * swell * (0.25 + 0.75 * cos(behind * (6.2831853 / 130.0)));
    sum.w += swell;
    // Far ahead of the front the fade would overflow, and nothing times that is not nothing.
    float trail = smoothstep(0.0, 70.0, behind) * exp(-max(behind, 0.0) / 260.0);
    glow.x += abs(tap.w) * (exp(-age / 1.0) * front + 0.7 * exp(-age / 1.3) * trail);
    glow.y += abs(tap.w) * (1.0 - exp(-age / 0.2)) * exp(-age / 1.2) * trail;
  }
  return sum;
}

void none() {
  gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
  v_shift = vec2(0.0);
  v_box = vec4(0.0);
  v_glow = vec2(0.0);
}
void main() {
  int id = gl_VertexID / 6;
  ivec2 c = ivec2(id % u_grid.x, id / u_grid.x);
  uint cell = pcg((uint(c.x) * 0x9E3779B9u) ^ pcg(uint(c.y) ^ u_seed));
  if (unit(cell) >= u_fill) {
    none();
    return;
  }
  // Each cell steps through the set at its own pace, from its own place in it.
  uint pace = pcg(cell);
  int steps = int(floor(u_time * u_flick * (0.6 + 0.8 * unit(pace)) + unit(pcg(pace))));
  vec2 glow = vec2(0.0);
  if (u_tapCount > 0) {
    // A roused cell runs on through its set, and back as it settles.
    steps += int(floor(6.0 * tapsAt(u_cellCss.xy + vec2(c) * u_cellCss.zw, glow).w + unit(pcg(pace ^ 0x33u))));
    // Every cell glows with its neighbours, some a little more than others.
    glow *= 0.65 + 0.35 * unit(pcg(pace ^ 0x51u));
  }
  if (true && glow.x < 0.04 && glow.y < 0.015) {
    // No wind at the cell's samples or those around them: only its resting light is left, which cannot be seen.
    ivec2 first = c * SAMPLES, last = u_grid * SAMPLES - 1;
    float most = 0.0;
    for (int y = -1; y <= SAMPLES.y; y++) {
      for (int x = -1; x <= SAMPLES.x; x++) {
        most = max(most, texelFetch(u_wind, clamp(first + ivec2(x, y), ivec2(0), last), 0).r);
      }
    }
    if (most == 0.0) {
      none();
      return;
    }
  }
  int g = int(texelFetch(u_sequence, ivec2((int(cell >> 8u) + steps) % u_count, 0), 0).r * 255.0 + 0.5);
  uvec4 box = texelFetch(u_boxes, ivec2(g, 0), 0);
  ivec2 origin = c * u_cell;
  ivec2 px = origin + ivec2(box.xy) + CORNER[gl_VertexID - id * 6] * ivec2(box.zw);
  ivec2 home = ivec2(g & 15, g >> 4) * u_cell;
  v_shift = vec2(home - origin);
  v_box = vec4(home, home + u_cell - 1);
  v_glow = glow;
  vec2 n = vec2(px) / vec2(u_buffer) * 2.0 - 1.0;
  gl_Position = vec4(n.x, -n.y, 0.0, 1.0);
}`;

export const GLYPHS_FS = `#version 300 es
precision highp float;
precision highp int;
in vec2 v_shift;
in vec4 v_box;
in vec2 v_glow;
uniform highp sampler2D u_atlas;
uniform highp sampler2D u_wind;
uniform vec3 u_color, u_glowColor;
uniform ivec2 u_buffer;
uniform float u_friction, u_glowAmount, u_inkAlpha;
out vec4 o;
const float REST = 0.03;
const float HEAD = 3.0;
ivec4 box;
float inkAt(ivec2 at) { return texelFetch(u_atlas, clamp(at, box.xy, box.zw), 0).r; }
void main() {
  box = ivec4(floor(v_box + 0.5));
  ivec2 px = ivec2(int(gl_FragCoord.x), u_buffer.y - 1 - int(gl_FragCoord.y));
  ivec2 at = px + ivec2(floor(v_shift + 0.5));
  float ink = inkAt(at);
  if (ink <= 0.0) { o = vec4(0.0); return; }
  vec4 wind = texture(u_wind, (vec2(px) + 0.5) / vec2(u_buffer));
  vec2 blows = wind.gb * 2.0 - 1.0;
  // Which way the stroke's edge faces: into the ink from the side the wind arrives on is a face to the wind.
  vec2 rise = vec2(inkAt(at + ivec2(1, 0)) - inkAt(at - ivec2(1, 0)), inkAt(at + ivec2(0, 1)) - inkAt(at - ivec2(0, 1)));
  float steep = length(rise);
  float facing = steep > 0.02 ? max(0.0, dot(rise / steep, blows)) : 0.35;
  float caught = mix(1.0, 0.45 + 1.1 * facing, u_friction);
  float light = min(1.0, wind.r * caught) + REST * wind.a;
  // The colour comes in whole and goes out quickly: halfway between it and the plain ink is only mud.
  float tint = smoothstep(0.04, 0.3, u_glowAmount * v_glow.x);
  // The canvas is shown HEAD times stronger and the plain light drawn as much weaker, which leaves a glow room above it.
  float bright = min(1.0, light) * mix(u_inkAlpha, HEAD, tint);
  float left = u_glowAmount * 0.3 * v_glow.y * wind.a;
  float a = ink * min(1.0, (bright + left) / HEAD);
  o = vec4((mix(u_color, u_glowColor, tint) * bright + u_glowColor * left) / (bright + left + 0.0001) * a, a);
}`;
