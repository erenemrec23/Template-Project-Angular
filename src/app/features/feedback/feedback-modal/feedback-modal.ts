import { Component, ElementRef, ViewChild, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import html2canvas from 'html2canvas-pro';

export interface FeedbackData {
  comment: string;
  screenshotBase64: string;
  pageUrl: string;
}

@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './feedback-modal.html'
})
export class FeedbackModalComponent {
  isOpen = signal(false);
  isCapturing = signal(false);
  comment = signal('');
  validationError = signal(false);

  saved = output<FeedbackData>();
  closed = output<void>();

  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private pendingCapture: HTMLCanvasElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;

  // Canvas @if(isOpen()) içinde. DOM'a girdiği anda setter tetiklenir → setTimeout hack'ine gerek yok.
  @ViewChild('canvasElement')
  set canvasRef(ref: ElementRef<HTMLCanvasElement> | undefined) {
    this.canvasEl = ref?.nativeElement ?? null;
    if (this.canvasEl && this.pendingCapture) {
      this.initCanvasWithImage(this.canvasEl, this.pendingCapture);
      this.pendingCapture = null;
    }
  }
private pageUrl = '';

  async openFeedback(): Promise<void> {
    if (this.isCapturing()) return;
    this.isCapturing.set(true);
     this.pageUrl = window.location.href;

    try {
      const pageCanvas = await html2canvas(document.body, {
        ignoreElements: (el) => el.classList.contains('no-screenshot'),
        useCORS: true,
        logging: false,
        scale: 1,                 // devicePixelRatio yerine 1 → base64 boyutu ciddi küçülür
        backgroundColor: '#ffffff'
      });

      this.pendingCapture = pageCanvas;
      this.comment.set('');
      this.validationError.set(false);
      this.isOpen.set(true);      // CD çalışınca canvasRef setter'ı initCanvasWithImage'ı çağırır
    } catch (err) {
      console.error('Ekran görüntüsü alınırken hata oluştu:', err);
    } finally {
      this.isCapturing.set(false);
    }
  }

  private initCanvasWithImage(canvas: HTMLCanvasElement, source: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = source.width;
    canvas.height = source.height;
    ctx.drawImage(source, 0, 0);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.ctx = ctx;
  }

  private toCanvasPoint(event: PointerEvent): { x: number; y: number } {
    const canvas = this.canvasEl!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  startDrawing(event: PointerEvent): void {
    if (!this.ctx || !this.canvasEl) return;
    this.isDrawing = true;
    this.canvasEl.setPointerCapture(event.pointerId);
    const p = this.toCanvasPoint(event);
    this.ctx.beginPath();
    this.ctx.moveTo(p.x, p.y);
  }

  draw(event: PointerEvent): void {
    if (!this.isDrawing || !this.ctx) return;
    const p = this.toCanvasPoint(event);
    this.ctx.lineTo(p.x, p.y);
    this.ctx.stroke();
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  save(): void {
    if (!this.comment().trim()) {
      this.validationError.set(true);
      return;
    }
    if (!this.canvasEl) return;

    const screenshotBase64 = this.canvasEl.toDataURL('image/jpeg', 0.85);
    this.saved.emit({ comment: 
      this.comment().trim(),
    screenshotBase64 ,
    pageUrl: this.pageUrl  });
    this.close();
  }

  close(): void {
    this.isOpen.set(false);
    this.comment.set('');
    this.validationError.set(false);
    this.ctx = null;
    this.canvasEl = null;
    this.pendingCapture = null;
    this.closed.emit();
  }
}