# Grassy Blob

View Live: https://farazzshaikh.com/demos/demo-2022-grass

[2025-06-22 16-04-25.webm](https://github.com/user-attachments/assets/d002b8a1-1ec0-4dc1-8e7c-21c4a736a187)

My take on WebGL grass. Was created when ThreeJS Grass rendering was in vogue.

## BLE Sensor Control

The globe spins from GZ (gyroscope yaw) data received over BLE from the GY-521 MPU-6050.

**Sensitivity multiplier: `2.5`**
Located in `src/App.jsx` → `BLERotator` component:
```js
controlsRef.current.setAzimuthalAngle(angle - gyroZRef.current * dt * (Math.PI / 180) * 2.5);
```
- Increase `2.5` → more sensitive (faster globe spin per sensor movement)
- Decrease `2.5` → less sensitive (slower globe spin per sensor movement)

`controlsRef` points to the `OrbitControls` instance — `setAzimuthalAngle` drives the horizontal camera orbit, same as click-and-drag left/right.
