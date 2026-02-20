#include <SoftwareSerial.h>
#include <Wire.h>

SoftwareSerial ble(3, 2);  // RX=D3, TX=D2

int sensorPin = A0;

// ── MPU-6050 I2C address (AD0 pin → GND = 0x68, AD0 → 3.3V = 0x69) ──
#define MPU_ADDR 0x68

// ── Choose gyroscope range ─────────────────────────────────────────────
// GYRO_250  → ±250  °/s  — most sensitive, best for slow/precise rotation
// GYRO_500  → ±500  °/s
// GYRO_1000 → ±1000 °/s
// GYRO_2000 → ±2000 °/s  — least sensitive, best for fast spins
#define GYRO_RANGE   GYRO_250

// ── Choose accelerometer range ─────────────────────────────────────────
// ACCEL_2G  → ±2g   — most sensitive, best for tilt/slow movement
// ACCEL_4G  → ±4g
// ACCEL_8G  → ±8g
// ACCEL_16G → ±16g  — least sensitive, best for impacts/vibration
#define ACCEL_RANGE  ACCEL_2G

// ── Register values & sensitivities for each range ────────────────────
// Gyro: GYRO_CONFIG register (0x1B)
#define GYRO_250   0x00   // 131.0 LSB/°/s
#define GYRO_500   0x08   //  65.5 LSB/°/s
#define GYRO_1000  0x10   //  32.8 LSB/°/s
#define GYRO_2000  0x18   //  16.4 LSB/°/s

// Accel: ACCEL_CONFIG register (0x1C)
#define ACCEL_2G   0x00   // 16384 LSB/g
#define ACCEL_4G   0x08   //  8192 LSB/g
#define ACCEL_8G   0x10   //  4096 LSB/g
#define ACCEL_16G  0x18   //  2048 LSB/g

// Sensitivity lookup based on chosen range
#if GYRO_RANGE == GYRO_250
  #define GYRO_SENS  131.0
#elif GYRO_RANGE == GYRO_500
  #define GYRO_SENS  65.5
#elif GYRO_RANGE == GYRO_1000
  #define GYRO_SENS  32.8
#else
  #define GYRO_SENS  16.4
#endif

#if ACCEL_RANGE == ACCEL_2G
  #define ACCEL_SENS  16384.0
#elif ACCEL_RANGE == ACCEL_4G
  #define ACCEL_SENS  8192.0
#elif ACCEL_RANGE == ACCEL_8G
  #define ACCEL_SENS  4096.0
#else
  #define ACCEL_SENS  2048.0
#endif

// ── MPU-6050 register addresses ───────────────────────────────────────
#define REG_PWR_MGMT_1   0x6B
#define REG_GYRO_CONFIG  0x1B
#define REG_ACCEL_CONFIG 0x1C
#define REG_ACCEL_XOUT_H 0x3B   // 14 bytes: ACCEL XYZ + TEMP + GYRO XYZ

void writeReg(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission(true);
}

void setup() {
  Serial.begin(9600);
  ble.begin(9600);

  Wire.begin();

  writeReg(REG_PWR_MGMT_1,   0x00);        // Wake up, use internal 8MHz clock
  writeReg(REG_GYRO_CONFIG,  GYRO_RANGE);  // Set gyro full-scale range
  writeReg(REG_ACCEL_CONFIG, ACCEL_RANGE); // Set accel full-scale range

  delay(1000);
  Serial.println("GY-521 MPU-6050 Ready");
  Serial.print("Gyro range:  ±");
  if      (GYRO_RANGE == GYRO_250)  Serial.println("250 °/s");
  else if (GYRO_RANGE == GYRO_500)  Serial.println("500 °/s");
  else if (GYRO_RANGE == GYRO_1000) Serial.println("1000 °/s");
  else                              Serial.println("2000 °/s");
  Serial.print("Accel range: ±");
  if      (ACCEL_RANGE == ACCEL_2G)  Serial.println("2g");
  else if (ACCEL_RANGE == ACCEL_4G)  Serial.println("4g");
  else if (ACCEL_RANGE == ACCEL_8G)  Serial.println("8g");
  else                               Serial.println("16g");
}

void readMPU(float &ax, float &ay, float &az,
             float &gx, float &gy, float &gz,
             float &temp) {
  // Read 14 bytes starting at ACCEL_XOUT_H
  // Order: AX(2) AY(2) AZ(2) TEMP(2) GX(2) GY(2) GZ(2)
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(REG_ACCEL_XOUT_H);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 14, true);

  int16_t rawAX = (Wire.read() << 8) | Wire.read();
  int16_t rawAY = (Wire.read() << 8) | Wire.read();
  int16_t rawAZ = (Wire.read() << 8) | Wire.read();
  int16_t rawT  = (Wire.read() << 8) | Wire.read();
  int16_t rawGX = (Wire.read() << 8) | Wire.read();
  int16_t rawGY = (Wire.read() << 8) | Wire.read();
  int16_t rawGZ = (Wire.read() << 8) | Wire.read();

  ax = rawAX / ACCEL_SENS;   // g
  ay = rawAY / ACCEL_SENS;   // g
  az = rawAZ / ACCEL_SENS;   // g

  gx = rawGX / GYRO_SENS;    // °/s (rotation speed around X axis = pitch rate)
  gy = rawGY / GYRO_SENS;    // °/s (rotation speed around Y axis = roll rate)
  gz = rawGZ / GYRO_SENS;    // °/s (rotation speed around Z axis = yaw rate)

  // Datasheet formula: Temp°C = raw / 340 + 36.53
  temp = (rawT / 340.0) + 36.53;
}

void loop() {
  // ── IR Distance ───────────────────────────────────────────────────
  int raw = analogRead(sensorPin);
  float distance = 109.6 - (0.31 * raw) - (0.00023 * raw * raw);
  if (isnan(distance) || distance < 10) distance = 10;
  else if (distance > 150)              distance = 150;

  // ── MPU-6050 ──────────────────────────────────────────────────────
  float ax, ay, az;
  float gx, gy, gz;
  float temp;
  readMPU(ax, ay, az, gx, gy, gz, temp);

  // Combined magnitudes
  float accelMag = sqrt(ax*ax + ay*ay + az*az);  // ~1.0g when still
  float gyroMag  = sqrt(gx*gx + gy*gy + gz*gz);  // ~0°/s when still

  // ── BLE output ───────────────────────────────────────────────────
  ble.print("D:");   ble.print(distance, 1);
  ble.print(",AX:"); ble.print(ax, 2);
  ble.print(",AY:"); ble.print(ay, 2);
  ble.print(",AZ:"); ble.print(az, 2);
  ble.print(",GX:"); ble.print(gx, 1);
  ble.print(",GY:"); ble.print(gy, 1);
  ble.print(",GZ:"); ble.print(gz, 1);
  ble.print(",T:");  ble.println(temp, 1);

  // ── Serial debug ─────────────────────────────────────────────────
  Serial.println("─────────────────────────────────────");
  Serial.print("IR Distance:    "); Serial.print(distance, 1);   Serial.println(" cm");
  Serial.println();
  Serial.println("Accelerometer (linear acceleration / tilt):");
  Serial.print("  X = "); Serial.print(ax, 3); Serial.println(" g  (forward/back tilt)");
  Serial.print("  Y = "); Serial.print(ay, 3); Serial.println(" g  (left/right tilt)");
  Serial.print("  Z = "); Serial.print(az, 3); Serial.println(" g  (up/down / gravity)");
  Serial.print("  Magnitude = "); Serial.print(accelMag, 2);
  Serial.println(" g  (1.0=still, >1.3=moving/shaking)");
  Serial.println();
  Serial.println("Gyroscope (rotation speed):");
  Serial.print("  GX = "); Serial.print(gx, 1); Serial.println(" °/s  (pitch — nose up/down)");
  Serial.print("  GY = "); Serial.print(gy, 1); Serial.println(" °/s  (roll  — lean left/right)");
  Serial.print("  GZ = "); Serial.print(gz, 1); Serial.println(" °/s  (yaw   — spin left/right)");
  Serial.print("  Total speed = "); Serial.print(gyroMag, 1); Serial.println(" °/s");
  Serial.println();
  Serial.print("Chip Temp:      "); Serial.print(temp, 1); Serial.println(" °C");

  delay(500);
}