import { useEffect, useRef, useState } from "react";
import {
  type GestureResponderEvent,
  type LayoutChangeEvent,
  PanResponder,
} from "react-native";

export type ViewBox = { x: number; y: number; w: number; h: number };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function touchDistance(event: GestureResponderEvent) {
  const touches = event.nativeEvent.touches;
  if (touches.length < 2) return 0;
  return Math.hypot(
    touches[0].pageX - touches[1].pageX,
    touches[0].pageY - touches[1].pageY,
  );
}

/**
 * Reusable pan + pinch + animated-zoom engine over an SVG-style viewBox.
 * Drag pans, two fingers pinch-zoom (both immediate); zoomIn/zoomOut/reset/
 * zoomToBBox tween with easing. Spread `panHandlers` and `onLayout` on the
 * container and feed `viewBox` to any <Svg>. Not tied to a specific map.
 */
export function usePanZoom({
  width,
  height,
  minScale = 0.12,
  duration = 350,
  onInteractionChange,
  onTap,
}: {
  width: number;
  height: number;
  minScale?: number;
  duration?: number;
  onInteractionChange?: (active: boolean) => void;
  onTap?: (x: number, y: number) => void;
}) {
  const aspect = width / height;
  const minWidth = width * minScale;

  const [box, setBox] = useState<ViewBox>({ x: 0, y: 0, w: width, h: height });
  const boxRef = useRef(box);
  const layoutWidth = useRef(0);
  const lastGesture = useRef({ dx: 0, dy: 0 });
  const pinchLast = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const onTapRef = useRef(onTap);
  onTapRef.current = onTap;
  const onInteractionRef = useRef(onInteractionChange);
  onInteractionRef.current = onInteractionChange;

  function updateBox(next: ViewBox) {
    boxRef.current = next;
    setBox(next);
  }

  function cancelAnimation() {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function computeBox(centerX: number, centerY: number, targetW: number): ViewBox {
    const w = clamp(targetW, minWidth, width);
    const h = w / aspect;
    return {
      x: clamp(centerX - w / 2, 0, width - w),
      y: clamp(centerY - h / 2, 0, height - h),
      w,
      h,
    };
  }

  function animateTo(target: ViewBox) {
    cancelAnimation();
    const start = boxRef.current;
    let startTime: number | null = null;
    const ease = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const step = (now: number) => {
      if (startTime == null) startTime = now;
      const t = Math.min(1, (now - startTime) / duration);
      const e = ease(t);
      updateBox({
        x: start.x + (target.x - start.x) * e,
        y: start.y + (target.y - start.y) * e,
        w: start.w + (target.w - start.w) * e,
        h: start.h + (target.h - start.h) * e,
      });
      rafRef.current = t < 1 ? requestAnimationFrame(step) : null;
    };
    rafRef.current = requestAnimationFrame(step);
  }

  useEffect(() => cancelAnimation, []);

  function zoomBy(factor: number) {
    const b = boxRef.current;
    animateTo(computeBox(b.x + b.w / 2, b.y + b.h / 2, b.w * factor));
  }

  function reset() {
    animateTo({ x: 0, y: 0, w: width, h: height });
  }

  function zoomToBBox(bbox: [number, number, number, number], pad = 1.5) {
    const [minX, minY, maxX, maxY] = bbox;
    const needW = Math.max((maxX - minX) * pad, (maxY - minY) * pad * aspect);
    animateTo(computeBox((minX + maxX) / 2, (minY + maxY) / 2, needW));
  }

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        cancelAnimation();
        lastGesture.current = { dx: 0, dy: 0 };
        pinchLast.current = null;
        onInteractionRef.current?.(true);
      },
      onPanResponderMove: (event, gesture) => {
        if (gesture.numberActiveTouches >= 2) {
          lastGesture.current = { dx: gesture.dx, dy: gesture.dy };
          const dist = touchDistance(event);
          if (!dist) return;
          if (pinchLast.current == null) {
            pinchLast.current = dist;
            return;
          }
          const scale = pinchLast.current / dist;
          pinchLast.current = dist;
          const b = boxRef.current;
          updateBox(computeBox(b.x + b.w / 2, b.y + b.h / 2, b.w * scale));
          return;
        }

        pinchLast.current = null;
        const ddx = gesture.dx - lastGesture.current.dx;
        const ddy = gesture.dy - lastGesture.current.dy;
        lastGesture.current = { dx: gesture.dx, dy: gesture.dy };
        const cw = layoutWidth.current || 1;
        const ch = cw / aspect;
        const b = boxRef.current;
        updateBox({
          x: clamp(b.x - ddx * (b.w / cw), 0, width - b.w),
          y: clamp(b.y - ddy * (b.h / ch), 0, height - b.h),
          w: b.w,
          h: b.h,
        });
      },
      onPanResponderRelease: (event, gesture) => {
        onInteractionRef.current?.(false);
        if (
          onTapRef.current &&
          Math.abs(gesture.dx) < 8 &&
          Math.abs(gesture.dy) < 8
        ) {
          const lw = layoutWidth.current || 1;
          const lh = lw / aspect;
          const b = boxRef.current;
          const sx = b.x + (event.nativeEvent.locationX / lw) * b.w;
          const sy = b.y + (event.nativeEvent.locationY / lh) * b.h;
          onTapRef.current(sx, sy);
        }
      },
      onPanResponderTerminate: () => onInteractionRef.current?.(false),
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  function onLayout(event: LayoutChangeEvent) {
    layoutWidth.current = event.nativeEvent.layout.width;
  }

  return {
    box,
    aspect,
    viewBox: `${box.x} ${box.y} ${box.w} ${box.h}`,
    panHandlers: pan.panHandlers,
    onLayout,
    zoomIn: () => zoomBy(0.65),
    zoomOut: () => zoomBy(1.5),
    reset,
    zoomToBBox,
    animateTo,
  };
}
