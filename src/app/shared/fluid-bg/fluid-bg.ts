// import {
//   Component,
//   ElementRef,
//   ViewChild,
//   AfterViewInit,
//   OnDestroy
// } from '@angular/core';

// @Component({
//   selector: 'app-fluid-bg',
//   standalone: true,
//   imports: [],
//   template: `<canvas #canvas class="fluid-canvas"></canvas>`,
//   styles: [`
//     .fluid-canvas {
//       position: fixed;
//       inset: 0;
//       z-index: -1;
//       width: 100vw;
//       height: 100vh;
//       pointer-events: none;
//       display: block;
//     }
//   `]
// })
// export class FluidBg implements AfterViewInit, OnDestroy {
//   @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

//   private gl!: WebGL2RenderingContext;
//   private raf = 0;
//   private startTime = performance.now();

//   private dyeA!: { fbo: WebGLFramebuffer; tex: WebGLTexture };
//   private dyeB!: { fbo: WebGLFramebuffer; tex: WebGLTexture };
//   private simWidth = 384;
//   private simHeight = 384;

//   private simProgram!: WebGLProgram;
//   private displayProgram!: WebGLProgram;
//   private quadBuffer!: WebGLBuffer;

//   private mouse = { x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5 };
//   private laggedMouse = { x: 0.5, y: 0.5 };
//   private moveBoost = 0;

//   private onMouseMove = (e: MouseEvent) => {
//     const canvas = this.canvasRef.nativeElement;
//     this.mouse.prevX = this.mouse.x;
//     this.mouse.prevY = this.mouse.y;
//     this.mouse.x = e.clientX / canvas.clientWidth;
//     this.mouse.y = 1.0 - e.clientY / canvas.clientHeight;

//     const dx = this.mouse.x - this.mouse.prevX;
//     const dy = this.mouse.y - this.mouse.prevY;
//     const dist = Math.sqrt(dx * dx + dy * dy);
//     this.moveBoost = Math.min(this.moveBoost + dist * 6, 1.0);
//   };

//   private onResize = () => this.resizeCanvas();

//   ngAfterViewInit(): void {
//     const canvas = this.canvasRef.nativeElement;
//     const gl = canvas.getContext('webgl2', { alpha: false });
//     if (!gl) {
//       console.warn('WebGL2 not supported — fluid background disabled.');
//       return;
//     }
//     this.gl = gl;

//     this.resizeCanvas();
//     this.setupBuffers();
//     this.setupPrograms();
//     this.createDyeFBOs();

//     window.addEventListener('mousemove', this.onMouseMove);
//     window.addEventListener('resize', this.onResize);

//     this.loop();
//   }

//   ngOnDestroy(): void {
//     cancelAnimationFrame(this.raf);
//     window.removeEventListener('mousemove', this.onMouseMove);
//     window.removeEventListener('resize', this.onResize);
//   }

//   private resizeCanvas() {
//     const canvas = this.canvasRef.nativeElement;
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     if (this.gl) this.gl.viewport(0, 0, canvas.width, canvas.height);
//   }

//   private setupBuffers() {
//     const gl = this.gl;
//     this.quadBuffer = gl.createBuffer()!;
//     gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
//     gl.bufferData(
//       gl.ARRAY_BUFFER,
//       new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
//       gl.STATIC_DRAW
//     );
//   }

//   private compile(type: number, source: string): WebGLShader {
//     const gl = this.gl;
//     const shader = gl.createShader(type)!;
//     gl.shaderSource(shader, source);
//     gl.compileShader(shader);
//     if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
//       console.error(gl.getShaderInfoLog(shader));
//     }
//     return shader;
//   }

//   private link(vsSrc: string, fsSrc: string): WebGLProgram {
//     const gl = this.gl;
//     const program = gl.createProgram()!;
//     gl.attachShader(program, this.compile(gl.VERTEX_SHADER, vsSrc));
//     gl.attachShader(program, this.compile(gl.FRAGMENT_SHADER, fsSrc));
//     gl.linkProgram(program);
//     if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
//       console.error(gl.getProgramInfoLog(program));
//     }
//     return program;
//   }

//   private setupPrograms() {
//     const vs = `#version 300 es
//       in vec2 aPosition;
//       out vec2 vUv;
//       void main() {
//         vUv = aPosition * 0.5 + 0.5;
//         gl_Position = vec4(aPosition, 0.0, 1.0);
//       }
//     `;

//     const simFs = `#version 300 es
//       precision highp float;
//       in vec2 vUv;
//       out vec4 fragColor;
//       uniform sampler2D uDye;
//       uniform float uTime;
//       uniform float uDecay;
//       uniform float uAspect;

//       uniform vec2 uVortexCenter;
//       uniform float uVortexAmount;

//       uniform vec2 uCorePos;
//       uniform vec3 uCoreColor;
//       uniform float uCoreStrength;

//       uniform vec2 uHaloPos;
//       uniform vec3 uHaloColor;
//       uniform float uHaloStrength;

//       uniform vec2 uTailPos;
//       uniform vec3 uTailColor;
//       uniform float uTailStrength;

//       vec2 mod289(vec2 x){return x - floor(x*(1.0/289.0))*289.0;}
//       vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
//       vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
//       float snoise(vec2 v){
//         const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
//         vec2 i = floor(v + dot(v, C.yy));
//         vec2 x0 = v - i + dot(i, C.xx);
//         vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
//         vec4 x12 = x0.xyxy + C.xxzz;
//         x12.xy -= i1;
//         i = mod289(i);
//         vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
//         vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
//         m = m*m; m = m*m;
//         vec3 x = 2.0 * fract(p * 0.024390243902439) - 1.0;
//         vec3 h = abs(x) - 0.5;
//         vec3 ox = floor(x + 0.5);
//         vec3 a0 = x - ox;
//         m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
//         vec3 g;
//         g.x = a0.x * x0.x + h.x * x0.y;
//         g.yz = a0.yz * x12.xz + h.yz * x12.yw;
//         return 130.0 * dot(m, g);
//       }

//       void main(){
//         vec2 uv = vUv;

//         vec2 flowUv = uv * 2.0 + uTime * 0.02;
//         float n = snoise(flowUv);
//         vec2 ambient = vec2(cos(n * 6.28), sin(n * 6.28)) * 0.00015;

//         vec2 toCenter = uv - uVortexCenter;
//         toCenter.x /= uAspect;
//         float d = length(toCenter) + 0.0001;
//         vec2 tangent = vec2(-toCenter.y, toCenter.x) / d;
//         float radial = exp(-d * d / 0.018);
//         vec2 spin = tangent * radial * uVortexAmount;
//         vec2 pull = -normalize(toCenter) * radial * uVortexAmount * 0.15;

//         vec2 vel = ambient + spin + pull;

//         vec2 backUv = uv - vel;
//         vec4 dye = texture(uDye, backUv) * uDecay;

//         vec2 dc = uv - uCorePos; dc.x *= uAspect;
//         float fc = exp(-dot(dc, dc) / 0.0009);
//         dye.rgb += uCoreColor * fc * uCoreStrength;

//         vec2 dh = uv - uHaloPos; dh.x *= uAspect;
//         float fh = exp(-dot(dh, dh) / 0.006);
//         dye.rgb += uHaloColor * fh * uHaloStrength;

//         vec2 dt = uv - uTailPos; dt.x *= uAspect;
//         float ft = exp(-dot(dt, dt) / 0.0035);
//         dye.rgb += uTailColor * ft * uTailStrength;

//         dye = clamp(dye, 0.0, 1.2);

//         fragColor = dye;
//       }
//     `;

//     const displayFs = `#version 300 es
//       precision highp float;
//       in vec2 vUv;
//       out vec4 fragColor;
//       uniform sampler2D uDye;
//       uniform vec3 uBg;
//       uniform vec2 uTexel;

//       void main(){
//         vec3 sum = vec3(0.0);
//         float total = 0.0;
//         for (int x = -2; x <= 2; x++) {
//           for (int y = -2; y <= 2; y++) {
//             vec2 offset = vec2(float(x), float(y)) * uTexel * 1.5;
//             float w = 1.0 - length(offset) * 40.0;
//             w = max(w, 0.0);
//             sum += texture(uDye, vUv + offset).rgb * w;
//             total += w;
//           }
//         }
//         vec3 bloom = sum / max(total, 0.001);
//         vec3 base = texture(uDye, vUv).rgb;
//         vec3 hdr = base * 1.1 + bloom * 0.4;

//         vec3 toned = 1.0 - exp(-hdr * 1.2);
//         vec3 col = uBg + toned;

//         float vig = smoothstep(1.1, 0.3, length(vUv - 0.5));
//         col *= mix(0.8, 1.0, vig);

//         fragColor = vec4(col, 1.0);
//       }
//     `;

//     this.simProgram = this.link(vs, simFs);
//     this.displayProgram = this.link(vs, displayFs);
//   }

//   private createFBO(w: number, h: number) {
//     const gl = this.gl;
//     const tex = gl.createTexture()!;
//     gl.bindTexture(gl.TEXTURE_2D, tex);
//     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

//     const fbo = gl.createFramebuffer()!;
//     gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
//     gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
//     gl.bindFramebuffer(gl.FRAMEBUFFER, null);
//     return { fbo, tex };
//   }

//   private createDyeFBOs() {
//     this.dyeA = this.createFBO(this.simWidth, this.simHeight) as any;
//     this.dyeB = this.createFBO(this.simWidth, this.simHeight) as any;
//   }

//   private bindQuad(program: WebGLProgram) {
//     const gl = this.gl;
//     gl.useProgram(program);
//     gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
//     const loc = gl.getAttribLocation(program, 'aPosition');
//     gl.enableVertexAttribArray(loc);
//     gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
//   }

//   private loop = () => {
//     const gl = this.gl;
//     const canvas = this.canvasRef.nativeElement;
//     const time = (performance.now() - this.startTime) / 1000;

//     this.laggedMouse.x += (this.mouse.x - this.laggedMouse.x) * 0.05;
//     this.laggedMouse.y += (this.mouse.y - this.laggedMouse.y) * 0.05;

//     this.moveBoost *= 0.93;

//     gl.bindFramebuffer(gl.FRAMEBUFFER, this.dyeB.fbo);
//     gl.viewport(0, 0, this.simWidth, this.simHeight);
//     this.bindQuad(this.simProgram);

//     gl.activeTexture(gl.TEXTURE0);
//     gl.bindTexture(gl.TEXTURE_2D, this.dyeA.tex);
//     gl.uniform1i(gl.getUniformLocation(this.simProgram, 'uDye'), 0);
//     gl.uniform1f(gl.getUniformLocation(this.simProgram, 'uTime'), time);
//     gl.uniform1f(gl.getUniformLocation(this.simProgram, 'uDecay'), 0.94);
//     gl.uniform1f(
//       gl.getUniformLocation(this.simProgram, 'uAspect'),
//       this.simWidth / this.simHeight
//     );

//     gl.uniform2f(gl.getUniformLocation(this.simProgram, 'uVortexCenter'), this.mouse.x, this.mouse.y);
//     gl.uniform1f(gl.getUniformLocation(this.simProgram, 'uVortexAmount'), 0.003 + this.moveBoost * 0.01);

//     gl.uniform2f(gl.getUniformLocation(this.simProgram, 'uCorePos'), this.mouse.x, this.mouse.y);
//     gl.uniform3f(gl.getUniformLocation(this.simProgram, 'uCoreColor'), 1.0, 0.3, 0.95);
//     gl.uniform1f(gl.getUniformLocation(this.simProgram, 'uCoreStrength'), 0.006 + this.moveBoost * 0.3);

//     gl.uniform2f(gl.getUniformLocation(this.simProgram, 'uHaloPos'), this.mouse.x, this.mouse.y);
//     gl.uniform3f(gl.getUniformLocation(this.simProgram, 'uHaloColor'), 0.55, 0.15, 0.9);
//     gl.uniform1f(gl.getUniformLocation(this.simProgram, 'uHaloStrength'), 0.003 + this.moveBoost * 0.13);

//     gl.uniform2f(gl.getUniformLocation(this.simProgram, 'uTailPos'), this.laggedMouse.x, this.laggedMouse.y);
//     gl.uniform3f(gl.getUniformLocation(this.simProgram, 'uTailColor'), 0.35, 0.1, 0.6);
//     gl.uniform1f(gl.getUniformLocation(this.simProgram, 'uTailStrength'), 0.0015 + this.moveBoost * 0.08);

//     gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

//     [this.dyeA, this.dyeB] = [this.dyeB, this.dyeA];

//     gl.bindFramebuffer(gl.FRAMEBUFFER, null);
//     gl.viewport(0, 0, canvas.width, canvas.height);
//     this.bindQuad(this.displayProgram);

//     gl.activeTexture(gl.TEXTURE0);
//     gl.bindTexture(gl.TEXTURE_2D, this.dyeA.tex);
//     gl.uniform1i(gl.getUniformLocation(this.displayProgram, 'uDye'), 0);
//     gl.uniform3f(gl.getUniformLocation(this.displayProgram, 'uBg'), 0.03, 0.01, 0.05);
//     gl.uniform2f(
//       gl.getUniformLocation(this.displayProgram, 'uTexel'),
//       1 / this.simWidth,
//       1 / this.simHeight
//     );

//     gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

//     this.raf = requestAnimationFrame(this.loop);
//   };
// }


import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

@Component({
  selector: 'app-fluid-bg',
  standalone: true,
  imports: [],
  template: `<canvas #canvas class="fluid-canvas"></canvas>`,
  styles: [`
    .fluid-canvas {
      position: fixed;
      inset: 0;
      z-index: -1;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      display: block;
    }
  `]
})
export class FluidBg implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private gl!: WebGL2RenderingContext;
  private raf = 0;
  private startTime = performance.now();

  private dyeA!: { fbo: WebGLFramebuffer; tex: WebGLTexture };
  private dyeB!: { fbo: WebGLFramebuffer; tex: WebGLTexture };
  private simWidth = 384;
  private simHeight = 384;

  private simProgram!: WebGLProgram;
  private displayProgram!: WebGLProgram;
  private quadBuffer!: WebGLBuffer;

  private mouse = { x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5 };
  private laggedMouse = { x: 0.5, y: 0.5 };
  private moveBoost = 0;

  // Degrees per second the palette rotates through the hue wheel.
  // 15 = full cycle every 24s. Lower = slower/subtler, higher = faster.
  private hueSpeed = 15;

  private onMouseMove = (e: MouseEvent) => {
    const canvas = this.canvasRef.nativeElement;
    this.mouse.prevX = this.mouse.x;
    this.mouse.prevY = this.mouse.y;
    this.mouse.x = e.clientX / canvas.clientWidth;
    this.mouse.y = 1.0 - e.clientY / canvas.clientHeight;

    const dx = this.mouse.x - this.mouse.prevX;
    const dy = this.mouse.y - this.mouse.prevY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.moveBoost = Math.min(this.moveBoost + dist * 6, 1.0);
  };

  private onResize = () => this.resizeCanvas();

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const gl = canvas.getContext('webgl2', { alpha: false });
    if (!gl) {
      console.warn('WebGL2 not supported — fluid background disabled.');
      return;
    }
    this.gl = gl;

    this.resizeCanvas();
    this.setupBuffers();
    this.setupPrograms();
    this.createDyeFBOs();

    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);

    this.loop();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (this.gl) this.gl.viewport(0, 0, canvas.width, canvas.height);
  }

  private setupBuffers() {
    const gl = this.gl;
    this.quadBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
  }

  private compile(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  private link(vsSrc: string, fsSrc: string): WebGLProgram {
    const gl = this.gl;
    const program = gl.createProgram()!;
    gl.attachShader(program, this.compile(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(program, this.compile(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
    }
    return program;
  }

  private setupPrograms() {
    const vs = `#version 300 es
      in vec2 aPosition;
      out vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const simFs = `#version 300 es
      precision highp float;
      in vec2 vUv;
      out vec4 fragColor;
      uniform sampler2D uDye;
      uniform float uTime;
      uniform float uDecay;
      uniform float uAspect;

      uniform vec2 uVortexCenter;
      uniform float uVortexAmount;

      uniform vec2 uCorePos;
      uniform vec3 uCoreColor;
      uniform float uCoreStrength;

      uniform vec2 uHaloPos;
      uniform vec3 uHaloColor;
      uniform float uHaloStrength;

      uniform vec2 uTailPos;
      uniform vec3 uTailColor;
      uniform float uTailStrength;

      vec2 mod289(vec2 x){return x - floor(x*(1.0/289.0))*289.0;}
      vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
      vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * 0.024390243902439) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main(){
        vec2 uv = vUv;

        vec2 flowUv = uv * 2.0 + uTime * 0.02;
        float n = snoise(flowUv);
        vec2 ambient = vec2(cos(n * 6.28), sin(n * 6.28)) * 0.00015;

        vec2 toCenter = uv - uVortexCenter;
        toCenter.x /= uAspect;
        float d = length(toCenter) + 0.0001;
        vec2 tangent = vec2(-toCenter.y, toCenter.x) / d;
        float radial = exp(-d * d / 0.018);
        vec2 spin = tangent * radial * uVortexAmount;
        vec2 pull = -normalize(toCenter) * radial * uVortexAmount * 0.15;

        vec2 vel = ambient + spin + pull;

        vec2 backUv = uv - vel;
        vec4 dye = texture(uDye, backUv) * uDecay;

        vec2 dc = uv - uCorePos; dc.x *= uAspect;
        float fc = exp(-dot(dc, dc) / 0.0009);
        dye.rgb += uCoreColor * fc * uCoreStrength;

        vec2 dh = uv - uHaloPos; dh.x *= uAspect;
        float fh = exp(-dot(dh, dh) / 0.006);
        dye.rgb += uHaloColor * fh * uHaloStrength;

        vec2 dt = uv - uTailPos; dt.x *= uAspect;
        float ft = exp(-dot(dt, dt) / 0.0035);
        dye.rgb += uTailColor * ft * uTailStrength;

        dye = clamp(dye, 0.0, 1.2);

        fragColor = dye;
      }
    `;

    const displayFs = `#version 300 es
      precision highp float;
      in vec2 vUv;
      out vec4 fragColor;
      uniform sampler2D uDye;
      uniform vec3 uBg;
      uniform vec2 uTexel;

      void main(){
        vec3 sum = vec3(0.0);
        float total = 0.0;
        for (int x = -2; x <= 2; x++) {
          for (int y = -2; y <= 2; y++) {
            vec2 offset = vec2(float(x), float(y)) * uTexel * 1.5;
            float w = 1.0 - length(offset) * 40.0;
            w = max(w, 0.0);
            sum += texture(uDye, vUv + offset).rgb * w;
            total += w;
          }
        }
        vec3 bloom = sum / max(total, 0.001);
        vec3 base = texture(uDye, vUv).rgb;
        vec3 hdr = base * 1.1 + bloom * 0.4;

        vec3 toned = 1.0 - exp(-hdr * 1.2);
        vec3 col = uBg + toned;

        float vig = smoothstep(1.1, 0.3, length(vUv - 0.5));
        col *= mix(0.8, 1.0, vig);

        fragColor = vec4(col, 1.0);
      }
    `;

    this.simProgram = this.link(vs, simFs);
    this.displayProgram = this.link(vs, displayFs);
  }

  private createFBO(w: number, h: number) {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fbo, tex };
  }

  private createDyeFBOs() {
    this.dyeA = this.createFBO(this.simWidth, this.simHeight) as any;
    this.dyeB = this.createFBO(this.simWidth, this.simHeight) as any;
  }

  private bindQuad(program: WebGLProgram) {
    const gl = this.gl;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    const loc = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }

  // Converts HSL (h: degrees 0-360, s/l: 0-1) to linear RGB (0-1 each).
  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0), f(8), f(4)];
  }

  private loop = () => {
    const gl = this.gl;
    const canvas = this.canvasRef.nativeElement;
    const time = (performance.now() - this.startTime) / 1000;

    this.laggedMouse.x += (this.mouse.x - this.laggedMouse.x) * 0.05;
    this.laggedMouse.y += (this.mouse.y - this.laggedMouse.y) * 0.05;

    this.moveBoost *= 0.93;

    // Rotate the palette through the hue wheel over time.
    const hue = (time * this.hueSpeed) % 360;
    const coreColor = this.hslToRgb(hue, 0.85, 0.65);
    const haloColor = this.hslToRgb((hue + 30) % 360, 0.75, 0.5);
    const tailColor = this.hslToRgb((hue + 30) % 360, 0.7, 0.35);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.dyeB.fbo);
    gl.viewport(0, 0, this.simWidth, this.simHeight);
    this.bindQuad(this.simProgram);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.dyeA.tex);
    gl.uniform1i(gl.getUniformLocation(this.simProgram, 'uDye'), 0);
    gl.uniform1f(gl.getUniformLocation(this.simProgram, 'uTime'), time);
    gl.uniform1f(gl.getUniformLocation(this.simProgram, 'uDecay'), 0.94);
    gl.uniform1f(
      gl.getUniformLocation(this.simProgram, 'uAspect'),
      this.simWidth / this.simHeight
    );

    gl.uniform2f(gl.getUniformLocation(this.simProgram, 'uVortexCenter'), this.mouse.x, this.mouse.y);
    gl.uniform1f(gl.getUniformLocation(this.simProgram, 'uVortexAmount'), 0.003 + this.moveBoost * 0.01);

    gl.uniform2f(gl.getUniformLocation(this.simProgram, 'uCorePos'), this.mouse.x, this.mouse.y);
    gl.uniform3f(gl.getUniformLocation(this.simProgram, 'uCoreColor'), ...coreColor);
    gl.uniform1f(gl.getUniformLocation(this.simProgram, 'uCoreStrength'), 0.006 + this.moveBoost * 0.3);

    gl.uniform2f(gl.getUniformLocation(this.simProgram, 'uHaloPos'), this.mouse.x, this.mouse.y);
    gl.uniform3f(gl.getUniformLocation(this.simProgram, 'uHaloColor'), ...haloColor);
    gl.uniform1f(gl.getUniformLocation(this.simProgram, 'uHaloStrength'), 0.003 + this.moveBoost * 0.13);

    gl.uniform2f(gl.getUniformLocation(this.simProgram, 'uTailPos'), this.laggedMouse.x, this.laggedMouse.y);
    gl.uniform3f(gl.getUniformLocation(this.simProgram, 'uTailColor'), ...tailColor);
    gl.uniform1f(gl.getUniformLocation(this.simProgram, 'uTailStrength'), 0.0015 + this.moveBoost * 0.08);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    [this.dyeA, this.dyeB] = [this.dyeB, this.dyeA];

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    this.bindQuad(this.displayProgram);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.dyeA.tex);
    gl.uniform1i(gl.getUniformLocation(this.displayProgram, 'uDye'), 0);
    gl.uniform3f(gl.getUniformLocation(this.displayProgram, 'uBg'), 0.03, 0.01, 0.05);
    gl.uniform2f(
      gl.getUniformLocation(this.displayProgram, 'uTexel'),
      1 / this.simWidth,
      1 / this.simHeight
    );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    this.raf = requestAnimationFrame(this.loop);
  };
}