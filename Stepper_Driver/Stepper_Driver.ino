#define DIR_PIN 2
#define STEP_PIN 3

#include <SPI.h>
#include <BLEPeripheral.h>

// define pins (varies per shield/board)
// https://github.com/sandeepmistry/arduino-BLEPeripheral#pinouts
// Blend
#define BLE_REQ     9
#define BLE_RDY     8
#define BLE_RST     5

// create peripheral instance, see pinouts above
BLEPeripheral blePeripheral = BLEPeripheral(BLE_REQ, BLE_RDY, BLE_RST);

//
BLEService stepperService = BLEService("FF10");

// create switch characteristic
//BLECharCharacteristic switchCharacteristic = BLECharCharacteristic("FF11", BLERead | BLEWrite);
BLEDescriptor switchDescriptor = BLEDescriptor("2901", "Steps");
BLEIntCharacteristic stepperCharacteristic = BLEIntCharacteristic("FF11", BLERead | BLEWrite);

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(DIR_PIN, OUTPUT);
  pinMode(STEP_PIN, OUTPUT);

  //set name and UUID
  blePeripheral.setLocalName("Stepper Driver");
  blePeripheral.setDeviceName("Stepper Driver");
  blePeripheral.setAdvertisedServiceUuid(stepperService.uuid());

    // add service and characteristics
  blePeripheral.addAttribute(stepperService);
  blePeripheral.addAttribute(stepperCharacteristic);
  blePeripheral.addAttribute(switchDescriptor);
  
  stepperCharacteristic.setEventHandler(BLEWritten, stepperCharacteristicWritten);

  blePeripheral.setAdvertisedServiceUuid(stepperService.uuid());
  blePeripheral.setLocalName("Stepper Driver");
  blePeripheral.begin();

  Serial.println(F("Stepper Driver"));
}

void loop() {
  // put your main code here, to run repeatedly:
  blePeripheral.poll();
}

void stepperCharacteristicWritten(BLECentral& central, BLECharacteristic& characteristic) {
  Serial.print(F("Steps to move: "));
  Serial.println(stepperCharacteristic.value());

  rotate(stepperCharacteristic.value(), .5);
}

void rotate(int steps, float speed){ 
  //rotate a specific number of microsteps (8 microsteps per step) - (negitive for reverse movement)
  //speed is any number from .01 -> 1 with 1 being fastest - Slower is stronger
  int dir = (steps > 0)? HIGH:LOW;
  steps = abs(steps);

  digitalWrite(DIR_PIN,dir); 

  float usDelay = (1/speed) * 70;

  for(int i=0; i < steps; i++){ 
    digitalWrite(STEP_PIN, HIGH); 
    delayMicroseconds(usDelay); 

    digitalWrite(STEP_PIN, LOW); 
    delayMicroseconds(usDelay); 
  } 
} 
