const Service = require('node-windows').Service;
const path = require('path');

// Path to your Node.js executable file
const exePath = path.resolve('E:\\nodejs\\localmachine\\avg.js');

// Create a new service object
const svc = new Service({
  name: 'IDS Messenger Service 44',           
  description: 'My IDS application as a Windows service V4.0',
  script: exePath,
  // Log output to specified directory
  logpath: path.resolve('C:\\Users\\Sharath\\Downloads')
});

// Listen for the "install" event, which indicates the service is installed
svc.on('install', function() {
  svc.start();
});

// Capture and log additional events
svc.on('alreadyinstalled', function() {
  console.log('Service is already installed.');
});

svc.on('start', function() {
  console.log('Service has been started.');
});

svc.on('stop', function() {
  console.log('Service has been stopped.');
});

svc.on('uninstall', function() {
  console.log('Service has been uninstalled.');
});

// Install the service
svc.install();
