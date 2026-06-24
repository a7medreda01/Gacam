import {
  Component,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero-background',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #bgCanvas></canvas>`,
  styles: [`
    :host {
      display: block;
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: auto;
    }
  `],
})
export class HeroBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private isBrowser: boolean;

  private ctx!: CanvasRenderingContext2D;
  private animId!: number;
  private t = 0;
  private mouse = { x: -9999, y: -9999 };

  // ═══════════════════════════════════════════════
  // Brand colors from GACAM Visual Identity Guide
  // ═══════════════════════════════════════════════
  private readonly ROYAL_TEAL   = '#003F4A';
  private readonly DEEP_TEAL    = '#0B2D35';
  private readonly GOLD         = '#C9A96B';
  private readonly DEEP_GOLD    = '#A97B36';
  private readonly WHITE        = '#FFFFFF';

  private particles: Particle[] = [];
  private diagLines: DiagLine[]  = [];
  private hexagons: Hexagon[]    = [];

  // ─── Bound event listeners (for cleanup) ────────
  private _onMouseMove!: (e: MouseEvent) => void;
  private _onMouseLeave!: () => void;
  private _onResize!: () => void;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    // ⚠️ من غير الشرط ده، الكود بيتنفذ على السيرفر وقت الـ SSR
    // وبيفشل لأن canvas.getContext('2d') و requestAnimationFrame
    // مش متاحين في بيئة Node.js
    if (!this.isBrowser) return;

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    this.buildScene();
    this.animate();

    this._onMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / r.width;
      const scaleY = canvas.height / r.height;
      this.mouse.x = (e.clientX - r.left) * scaleX;
      this.mouse.y = (e.clientY - r.top)  * scaleY;
    };
    this._onMouseLeave = () => { this.mouse.x = -9999; this.mouse.y = -9999; };
    this._onResize     = () => { this.resize(); this.buildScene(); };

    canvas.addEventListener('mousemove',  this._onMouseMove);
    canvas.addEventListener('mouseleave', this._onMouseLeave);
    window.addEventListener('resize',     this._onResize);
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    cancelAnimationFrame(this.animId);
    const canvas = this.canvasRef.nativeElement;
    canvas.removeEventListener('mousemove',  this._onMouseMove);
    canvas.removeEventListener('mouseleave', this._onMouseLeave);
    window.removeEventListener('resize',     this._onResize);
  }

  // ═══════════════════════════════════════════════
  // Setup
  // ═══════════════════════════════════════════════
  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement!;
    canvas.width  = parent.offsetWidth  || window.innerWidth;
    canvas.height = parent.offsetHeight || window.innerHeight;
  }

  private buildScene(): void {
    const w = this.canvasRef.nativeElement.width;
    const h = this.canvasRef.nativeElement.height;
    const COUNT = Math.min(70, Math.floor((w * h) / 14000));

    this.particles = Array.from({ length: COUNT }, () => ({
      x:     Math.random() * w,
      y:     Math.random() * h,
      r:     Math.random() * 1.8 + 0.5,
      vx:    (Math.random() - 0.5) * 0.38,
      vy:    (Math.random() - 0.5) * 0.24,
      alpha: Math.random() * 0.65 + 0.25,
      gold:  Math.random() > 0.48,
      phase: Math.random() * Math.PI * 2,
    }));

    this.diagLines = Array.from({ length: 8 }, () => ({
      x:     Math.random() * w,
      y:     Math.random() * h,
      len:   Math.random() * 130 + 60,
      angle: (-28 + (Math.random() - 0.5) * 14) * (Math.PI / 180),
      alpha: Math.random() * 0.10 + 0.03,
      speed: (Math.random() - 0.5) * 0.32,
    }));

    this.hexagons = [
      { x: w * 0.10, y: h * 0.16, r: 11, rot: 0,  speed:  0.007 },
      { x: w * 0.90, y: h * 0.80, r: 16, rot: 0,  speed: -0.005 },
      { x: w * 0.55, y: h * 0.08, r:  8, rot: 0,  speed:  0.009 },
    ];
  }

  // ═══════════════════════════════════════════════
  // Main render loop
  // ═══════════════════════════════════════════════
  private animate = (): void => {
    this.draw();
    this.t += 0.016;
    this.animId = requestAnimationFrame(this.animate);
  };

  private draw(): void {
    const ctx = this.ctx;
    const w   = this.canvasRef.nativeElement.width;
    const h   = this.canvasRef.nativeElement.height;

    ctx.clearRect(0, 0, w, h);
    this.drawBackground(w, h);
    this.drawRings(w, h);
    this.drawDiagLines(w, h);
    this.drawParticleNet(w, h);
    this.drawHexagons();
    this.drawScanPulse(w, h);
  }

  // ─── Background gradient ────────────────────────
  private drawBackground(w: number, h: number): void {
    const ctx = this.ctx;
    const g   = ctx.createLinearGradient(0, 0, w * 0.6, h);
    g.addColorStop(0,   this.DEEP_TEAL);    // #0B2D35
    g.addColorStop(0.5, this.ROYAL_TEAL);   // #003F4A
    g.addColorStop(1,   '#04292F');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Subtle radial glow top-right (gold haze)
    const gr = ctx.createRadialGradient(w * 0.88, h * 0.12, 0, w * 0.88, h * 0.12, w * 0.45);
    gr.addColorStop(0,   'rgba(201,169,107,0.08)');
    gr.addColorStop(1,   'rgba(201,169,107,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
  }

  // ─── Decorative concentric rings ───────────────
  private drawRings(w: number, h: number): void {
    const ctx = this.ctx;
    const centers = [
      { cx: w * 0.85, cy: h * 0.22, base: 0.22 * Math.min(w, h) },
      { cx: w * 0.12, cy: h * 0.75, base: 0.18 * Math.min(w, h) },
    ];
    centers.forEach(({ cx, cy, base }) => {
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, base * (1 + i * 0.55), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201,169,107,${0.09 - i * 0.018})`;
        ctx.lineWidth   = 0.6;
        ctx.stroke();
      }
    });
  }

  // ─── Diagonal brand lines ───────────────────────
  private drawDiagLines(w: number, h: number): void {
    const ctx = this.ctx;
    this.diagLines.forEach(dl => {
      dl.x += dl.speed;
      if (dl.x >  w + 200) dl.x = -200;
      if (dl.x < -200)     dl.x =  w + 200;
      ctx.beginPath();
      ctx.moveTo(dl.x, dl.y);
      ctx.lineTo(dl.x + Math.cos(dl.angle) * dl.len, dl.y + Math.sin(dl.angle) * dl.len);
      ctx.strokeStyle = `rgba(201,169,107,${dl.alpha})`;
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    });
  }

  // ─── Particle network ───────────────────────────
  private drawParticleNet(w: number, h: number): void {
    const ctx  = this.ctx;
    const ps   = this.particles;
    const mx   = this.mouse.x;
    const my   = this.mouse.y;
    const LINK = 135;

    ps.forEach(p => {
      // Move
      p.x += p.vx;
      p.y += p.vy;
      p.phase += 0.018;
      if (p.x < -20)  p.x = w + 20;
      if (p.x > w+20) p.x = -20;
      if (p.y < -20)  p.y = h + 20;
      if (p.y > h+20) p.y = -20;

      // Mouse repulsion
      const dx = p.x - mx, dy = p.y - my;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 115 && d > 0) {
        const f = (115 - d) / 115;
        p.x += (dx / d) * f * 1.4;
        p.y += (dy / d) * f * 1.4;
      }
    });

    // Draw links
    for (let i = 0; i < ps.length; i++) {
      for (let j = i + 1; j < ps.length; j++) {
        const ex = ps[i].x - ps[j].x;
        const ey = ps[i].y - ps[j].y;
        const ed = Math.sqrt(ex * ex + ey * ey);
        if (ed < LINK) {
          const la = (1 - ed / LINK) * 0.20;
          ctx.beginPath();
          ctx.moveTo(ps[i].x, ps[i].y);
          ctx.lineTo(ps[j].x, ps[j].y);
          ctx.strokeStyle = (ps[i].gold || ps[j].gold)
            ? `rgba(201,169,107,${la})`
            : `rgba(255,255,255,${la * 0.45})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
    }

    // Draw dots
    ps.forEach(p => {
      const pa = p.alpha * (0.75 + 0.25 * Math.sin(p.phase));
      if (p.gold) {
        // Gold glow halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 1.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,107,${pa * 0.22})`;
        ctx.fill();
        // Gold core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,107,${pa})`;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${pa * 0.5})`;
        ctx.fill();
      }
    });
  }

  // ─── Rotating hexagons ──────────────────────────
  private drawHexagons(): void {
    const ctx = this.ctx;
    this.hexagons.forEach(hx => {
      hx.rot += hx.speed;
      ctx.save();
      ctx.translate(hx.x, hx.y);
      ctx.rotate(hx.rot);
      ctx.beginPath();
      for (let s = 0; s < 6; s++) {
        const a = s * (Math.PI / 3);
        s === 0
          ? ctx.moveTo(Math.cos(a) * hx.r, Math.sin(a) * hx.r)
          : ctx.lineTo(Math.cos(a) * hx.r, Math.sin(a) * hx.r);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(201,169,107,0.25)';
      ctx.lineWidth   = 0.8;
      ctx.stroke();
      ctx.restore();
    });
  }

  // ─── Center scan pulse ──────────────────────────
  private drawScanPulse(w: number, h: number): void {
    const ctx = this.ctx;
    const r   = 80 + Math.sin(this.t * 0.55) * 20;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.5, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(201,169,107,${0.04 + 0.025 * Math.sin(this.t * 0.55)})`;
    ctx.lineWidth   = 0.7;
    ctx.stroke();
  }
}

// ═══════════════════════════════════════════════════
// Local interfaces (no need for a separate file)
// ═══════════════════════════════════════════════════
interface Particle {
  x: number; y: number; r: number;
  vx: number; vy: number;
  alpha: number; gold: boolean; phase: number;
}
interface DiagLine {
  x: number; y: number; len: number;
  angle: number; alpha: number; speed: number;
}
interface Hexagon {
  x: number; y: number; r: number; rot: number; speed: number;
}