#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <Ticker.h>
#include <ArduinoJson.h>

// Pin definitions
const int LED_PIN = BUILTIN_LED;
const int SENSOR_PIN = A0;

// WiFi information
const char WIFI_SSID[] = "";
const char WIFI_PSK[] = "";
 
// Remote site information
const char http_site[] = "";
const int http_port = ;

const String userCredentials = "";

void Sm_Idle(void);
void Sm_SendingPulse(void);
void Sm_ConnectingToWiFi(void);
void Sm_RequestingToken(void);

// Global variables
WiFiClient client;
Ticker watchdog;

int watchdogCount;
int oldValue;
String token;

typedef enum {
  IDLE,
  SENDING_PULSE,
  CONNECTING_TO_WIFI,
  REQUESTING_TOKEN
} StateType;

typedef struct {
  StateType State;
  void (* func) (void);
} StateMachineType;

StateMachineType StateMachine[] = {
  {IDLE, Sm_Idle},
  {SENDING_PULSE, Sm_SendingPulse},
  {CONNECTING_TO_WIFI, Sm_ConnectingToWiFi},
  {REQUESTING_TOKEN, Sm_RequestingToken}
};

StateType SmState = IDLE;

void Sm_ConnectingToWiFi(void){
  Serial.println();
  Serial.println("State --- Connecting to WiFi");
  connectWifi();
  SmState = SENDING_PULSE;
}

void Sm_Idle(void){
  int sensorValue = analogRead(SENSOR_PIN);
  if(sensorValue < oldValue - 15){
    Serial.println();
    Serial.println("State --- Idle");
    Serial.print("SensorValue: ");
    Serial.println(sensorValue);
    SmState = SENDING_PULSE;      
  }
  oldValue = sensorValue;
}

void Sm_SendingPulse(void){
  Serial.println();
  Serial.println("State --- Sending pulse");
  digitalWrite(LED_PIN, LOW);
  if (sendPulse()){
    SmState = IDLE;
  }
  digitalWrite(LED_PIN, HIGH);  
}

void Sm_RequestingToken(void){
  Serial.println();
  Serial.println("State --- Requesting token");
  if(requestToken()){
    SmState = SENDING_PULSE;
  }
}

void ISRwatchdog(void){
  watchdogCount++;
  if(watchdogCount == 8){
    Serial.println("WD reset");
    ESP.reset();
  }
}

void setup() {
  // Setup serial
  Serial.begin(9600);
  Serial.println("Startup");

  // Setup BUILTIN_LED
  pinMode(LED_PIN, OUTPUT);

  // Setup watchdog
  watchdog.attach(1,ISRwatchdog);

  // Connect to WiFi
  connectWifi();
}
 
void loop() {
  if(SmState < 4){
    (*StateMachine[SmState].func)();
  }else{
    ESP.reset();
  }
  watchdogCount = 0;
}

void connectWifi() {
  // Set WiFi mode to station (client)
  WiFi.mode(WIFI_STA);
  
  // Initiate connection with SSID and PSK
  WiFi.begin(WIFI_SSID, WIFI_PSK);
  
  // Blink LED while we wait for WiFi connection
  while ( WiFi.status() != WL_CONNECTED ) {
    digitalWrite(LED_PIN, LOW);
    delay(50);
    digitalWrite(LED_PIN, HIGH);
    delay(50);
  }
}

bool sendPulse(){
  // Attempt to make a connection to the remote server
  if(WiFi.status() != WL_CONNECTED ){
    Serial.println("No connection to WiFi");
    SmState = CONNECTING_TO_WIFI;
    return false;
  }
  Serial.println("Connected to WiFi.");
  if (!client.connect(http_site, http_port) ) {
    Serial.println("Could not connect to website");
    return false;
  }
  Serial.println("Connected to website.");
  // Send serial confirmation
  String userInformation = "name=Mauro";
  // Make an HTTP POST request
  client.println("POST /api/measurements HTTP/1.1");
  client.print("Host: ");
  client.println(http_site);
  client.println("Content-Type: application/x-www-form-urlencoded");
  client.print("x-access-token: ");
  client.println(token);
  client.print("Content-Length: ");
  client.println(userInformation.length());
  client.println();
  client.println(userInformation); 
  
  String result;
  delay(500);
  if ( client.available() ) {
    result = client.readString();
  }
  result.remove(0,result.indexOf('{'));
  DynamicJsonBuffer jsonBuffer;
  JsonObject& json = jsonBuffer.parseObject(result);
  String successString = json[String("success")];
  if(successString == "false"){
    Serial.println("Verification failed");
    SmState = REQUESTING_TOKEN;
    return false;
  }
  Serial.println("Pulse registered");
  return true;
}

bool requestToken(){
  Serial.println("Requesting token");
  if(WiFi.status() != WL_CONNECTED ){
    SmState = CONNECTING_TO_WIFI;
    return false;
  }
  Serial.println("Connected to WiFi");
  
  if (client.connect(http_site, http_port) ) {
    client.println("POST /api/authenticate HTTP/1.1");
    client.print("Host: ");
    client.println(http_site);
    client.println("Content-Type: application/x-www-form-urlencoded");
    client.println("Connection: close");
    client.print("Content-Length: ");
    client.println(userCredentials.length());
    client.println();
    client.println(userCredentials);
  }
  Serial.println("Posted credentials");
  String result;
  delay(500);
  
  if ( client.available() ) {
    result = client.readString();
  }
  result.remove(0,result.indexOf('{'));
  DynamicJsonBuffer jsonBuffer;
  JsonObject& json = jsonBuffer.parseObject(result);
  String successString = json[String("success")];
  String tokenString = json[String("token")];
  token = tokenString;
  if(successString == "true"){
    Serial.print("Received new token: ");
    Serial.println(token);
    return true;
  }  
  return false;
}
