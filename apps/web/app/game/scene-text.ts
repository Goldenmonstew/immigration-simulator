import styles from './town-canvas.module.css';

type Camera = {
  zoom: number;
  getWorldPoint: (x: number, y: number) => { x: number; y: number };
};

export function textPosition(camera: Camera, x: number, y: number) {
  // These cameras do not rotate. Invert the rendered matrix via the public API;
  // worldView rounds its origin and can drift at fractional zoom.
  const origin = camera.getWorldPoint(0, 0);
  return { x: (x - origin.x) * camera.zoom, y: (y - origin.y) * camera.zoom };
}

/** Screen-sized DOM text with a world-space anchor, also usable by tweens. */
export class SceneText {
  readonly element: HTMLSpanElement;
  alpha = 1;
  visible = true;

  constructor(
    layer: HTMLDivElement,
    public x: number,
    public y: number,
    text: string,
    private kind: 'label' | 'homeLabel' | 'badge' | 'feedback' | 'bubble',
  ) {
    this.element = layer.ownerDocument.createElement('span');
    this.element.className = `${styles.sceneText} ${styles[kind]}`;
    this.setText(text);
    layer.appendChild(this.element);
  }

  setText(text: string) {
    this.element.textContent = text;
    return this;
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    return this;
  }

  render(camera: Camera) {
    const { x, y } = textPosition(camera, this.x, this.y);
    this.element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, ${this.kind === 'label' ? '0' : '-100%'})`;
    this.element.style.opacity = String(this.alpha);
    this.element.style.visibility = this.visible ? 'visible' : 'hidden';
  }

  destroy() {
    this.element.remove();
  }
}
