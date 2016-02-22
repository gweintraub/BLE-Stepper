var STEPPER_SERVICE = 'FF10';
var STEPPER_CHARACTERISTIC = 'FF11';

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        this.showMainPage();
    },
    // Bind any events that are required on startup.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('backbutton', app.onBackButton, false);
        deviceList.addEventListener('click', this.connect, false);
        refreshButton.addEventListener('click', this.refreshDeviceList, false);
        disconnectButton.addEventListener('click', this.disconnect, false);
        submitButton.addEventListener('click', this.onSubmit, false);
       // steps.addEventListener('________', this.moveSteps, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'refreshDeviceList'
    // function, we must explicitly call 'app.refreshDeviceList(...);'
    onDeviceReady: function() {
        FastClick.attach(document.body); // https://github.com/ftlabs/fastclick
        app.refreshDeviceList();
    },
    refreshDeviceList: function(){
        deviceList.innerHTML = '';
        ble.scan([STEPPER_SERVICE], 5, app.onDiscoverDevice, app.onError);
    },
    onDiscoverDevice: function(device){
        var listItem = document.createElement('li');
        listItem.innerHTML = device.name + '<br/>' + device.id + '<br/>' + 'RSSI: ' + device.rssi;
        listItem.dataset.deviceId = device.id;
        deviceList.appendChild(listItem);
    },
    showMainPage: function(){
        mainPage.hidden = false;
        detailPage.hidden = true;
    },
    showDetailPage: function(){
        mainPage.hidden = true;
        detailPage.hidden = false;
    },
    onBackButton: function(e){
        if (mainPage.hidden) {
            app.disconnect();
        } else {
            navigator.app.exitApp();
        }
    },
    connect: function(e) {
        var deviceId = e.target.dataset.deviceId;
        ble.connect(deviceId, app.onConnect, app.onError);
    },
    onConnect: function(peripheral){
        app.peripheral = peripheral;
        app.showDetailPage();
    },
    onSubmit: function(e){
        app.moveSteps();
        console.log("Submit");
    },
    disconnect: function(e){
        if (app.peripheral && app.peripheral.id) {
            ble.disconnect(app.peripheral.id, app.showMainPage, app.onError);
        }
    },
    // submit: function(e){
    //     ble.write(app.peripheral.id,
    //         STEPPER_SERVICE,
    //         data.buffer,
    //         success,
    //         app.onError
    //         );
    // },
    onError: function(reason){
        navigator.navigator.alert(reason, app.showMainPage, 'Error');
    },
    moveSteps: function(value){
        var data = new Uint16Array(1);
        data[0] = steps.value;
        console.log(steps.value);
        console.log(data[0]);

        var success = function() {
            console.log('Move ' + steps.value + " steps.");
        };

        if (app.peripheral && app.peripheral.id) {
            ble.write(
                app.peripheral.id,
                STEPPER_SERVICE,
                STEPPER_CHARACTERISTIC,
                data.buffer,
                success,
                app.onError
                );
            console.log("Success");
        }
    },
    onError: function(reason) {
        navigator.notification.alert(reason, app.showMainPage, 'Error');
    }

};

app.initialize();
