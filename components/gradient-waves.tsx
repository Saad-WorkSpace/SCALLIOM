'use client';

import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';

type GradientWavesProps = {
  className?: string;
};

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

// Adapted from the ReactBits Gradient Waves component and tuned for Scallium.
const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 uMouse;
out vec4 fragColor;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += 34.0 * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += 20.0 * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * 2.2 + sin(my * freq.y) * 1.85 + 4.8);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 62; i++) {
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < 20000.0)) return 20000.0;
  }
  return dist;
}

void main() {
  float T = iTime * 0.16;
  vec2 freq = vec2(0.072, 0.15);
  vec4 tc = vec4(T / 0.13, T / 0.81, T / 0.2, T / 0.71);
  vec2 uv = gl_FragCoord.xy / iResolution.xy - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = (3.14159 / 2.35) * ulen;
  float c = cos(xrot);
  float s = sin(xrot);
  dir = mat3(1.0,0.0,0.0,0.0,c,-s,0.0,s,c) * dir;
  vec2 nuv = ulen > 0.00001 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c,-s,0.0,s,c,0.0,0.0,0.0,1.0) * dir;
  c = cos(1.08); s = sin(1.08);
  dir = mat3(c,0.0,s,0.0,1.0,0.0,-s,0.0,c) * dir;

  float yaw = (uMouse.x - 0.5) * 0.11;
  float pitch = (uMouse.y - 0.5) * 0.08;
  c = cos(yaw); s = sin(yaw);
  dir = mat3(c,0.0,s,0.0,1.0,0.0,-s,0.0,c) * dir;
  c = cos(pitch); s = sin(pitch);
  dir = mat3(1.0,0.0,0.0,0.0,c,-s,0.0,s,c) * dir;

  float dist = raymarch(vec3(0.0, 0.0, 30.0), dir, freq, tc);
  vec3 pos = vec3(0.0, 0.0, 30.0) + dist * dir;
  float fog = clamp(17.0 / max(dist, 0.001), 0.0, 1.0);
  vec3 horizon = vec3(0.925, 0.935, 0.948);
  vec3 body = mix(vec3(0.52, 0.55, 0.60), vec3(0.93, 0.945, 0.96), clamp(pos.z * 0.075 + 0.5, 0.0, 1.0));
  vec3 col = mix(horizon, body, fog);
  float grain = (hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0) - 0.5) * 0.018;
  float alpha = clamp(fog * 0.74 + grain, 0.0, 0.78);
  fragColor = vec4(col * alpha, alpha);
}
`;

export function GradientWaves({ className = '' }: GradientWavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
      program.uniforms.iResolution.value[0] = gl.drawingBufferWidth;
      program.uniforms.iResolution.value[1] = gl.drawingBufferHeight;
    };
    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(container);
    setSize();

    const current = [0.5, 0.5];
    const target = [0.5, 0.5];
    const onPointerMove = (event: PointerEvent) => {
      target[0] = event.clientX / window.innerWidth;
      target[1] = 1 - event.clientY / window.innerHeight;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const startedAt = performance.now();
    let frame = 0;
    const render = (time: number) => {
      current[0] += (target[0] - current[0]) * 0.035;
      current[1] += (target[1] - current[1]) * 0.035;
      program.uniforms.iTime.value = (time - startedAt) * 0.001;
      program.uniforms.uMouse.value[0] = current[0];
      program.uniforms.uMouse.value[1] = current[1];
      renderer.render({ scene: mesh });
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      canvas.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <div ref={containerRef} className={`gradient-waves ${className}`} aria-hidden="true" />;
}
