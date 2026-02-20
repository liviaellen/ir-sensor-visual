#include <SoftwareSerial.h>

SoftwareSerial ble(3, 2);  // RX=D3, TX=D2

int sensorPin = A0;

void setup() {
  Serial.begin(9600);
  ble.begin(9600);

  delay(1000);
  Serial.println("Bluefruit Ready");
}

void loop() {
  int raw = analogRead(sensorPin);
  float distance = 109.6 - (0.31 * raw) - (0.00023 * raw * raw);

  // Clamp to valid range, avoid NaN
  if (isnan(distance) || distance < 10) {
    distance = 10;
  } else if (distance > 150) {
    distance = 150;
  }

  // Send via BLE
  ble.print("D:");
  ble.println(distance, 1);

  // Also print to Serial for debugging
  Serial.print("Distance: ");
  Serial.println(distance, 1);

  delay(1000);
}