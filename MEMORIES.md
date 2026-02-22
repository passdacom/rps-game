# Memories & Lessons

- **ALWAYS** operate in [ARCHITECT MODE] first and transition to [BUILDER MODE] only after plan approval.
- **NEVER** import MediaPipe from a CDN in a Vite project. ALWAYS install via npm (`@mediapipe/tasks-vision`) and handle WASM paths.
- **NEVER** call `setState` inside `requestAnimationFrame` for high-frequency landmarks.
- **ALWAYS** request camera permissions BEFORE initializing MediaPipe to avoid hardware race conditions.
- **ALWAYS** mirror (flip) the canvas horizontally (`ctx.scale(-1, 1)`) when drawing webcam feeds for natural user experience.
