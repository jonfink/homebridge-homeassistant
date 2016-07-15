var Service, Characteristic, communicationError;

module.exports = function (oService, oCharacteristic, oCommunicationError) {
  Service = oService;
  Characteristic = oCharacteristic;
  communicationError = oCommunicationError;

  return HomeAssistantSwitch;
};
module.exports.HomeAssistantSwitch = HomeAssistantSwitch;

function HomeAssistantSwitch(log, data, client, type) {
  // device info
  this.domain = type || "switch"
  this.data = data
  this.entity_id = data.entity_id
  if (data.attributes && data.attributes.friendly_name) {
    this.name = data.attributes.friendly_name		
  }else{
    this.name = data.entity_id.split('.').pop().replace(/_/g, ' ')
  }
	
	if(this.domain == "device_tracker") {
		this.name = "Device: " + this.name
	}


  this.client = client
  this.log = log;
}

HomeAssistantSwitch.prototype = {
  getPowerState: function(callback){
    this.client.fetchState(this.entity_id, function(data){
      if (data) {
        powerState = data.state == 'on'
        callback(null, powerState)
      }else{
        callback(communicationError)
      }
    }.bind(this))
  },
  setPowerState: function(powerOn, callback) {
    var that = this;
    var service_data = {}
    service_data.entity_id = this.entity_id

    if (powerOn) {
      this.log("Setting power state on the '"+this.name+"' to on");

      this.client.callService(this.domain, 'turn_on', service_data, function(data){
        if (data) {
          that.log("Successfully set power state on the '"+that.name+"' to on");
          callback()
        }else{
          callback(communicationError)
        }
      }.bind(this))
    }else{
      this.log("Setting power state on the '"+this.name+"' to off");

      this.client.callService(this.domain, 'turn_off', service_data, function(data){
        if (data) {
          that.log("Successfully set power state on the '"+that.name+"' to off");
          callback()
        }else{
          callback(communicationError)
        }
      }.bind(this))
    }
  },
  getHomeState: function(callback){
    this.client.fetchState(this.entity_id, function(data){
      if (data) {
				this.log("getHomeState data.state: %s", data.state)
				if(data.state == "home") {
					powerState = true				
				} else {
					powerState = false					
				}
        callback(null, powerState)
      }else{
        callback(communicationError)
      }
    }.bind(this))
  },
  setHomeState: function(powerOn, callback) {
    var that = this;
    var service_data = {}
    service_data.dev_id = this.entity_id.split(".")[1]

    if (powerOn) {
      this.log("Setting home state on the '"+this.name+"' to home");

			service_data.location_name = "home"

      this.client.callService(this.domain, 'see', service_data, function(data){
        if (data) {
          that.log("Successfully set home state on the '"+that.name+"' to home");
          callback()
        }else{
          callback(communicationError)
        }
      }.bind(this))
    }else{
      this.log("Setting home state on the '"+this.name+"' to not_home");

			service_data.location_name = "not_home"

      this.client.callService(this.domain, 'see', service_data, function(data){
        if (data) {
          that.log("Successfully set home state on the '"+that.name+"' to not_home");
          callback()
        }else{
          callback(communicationError)
        }
      }.bind(this))
    }
  },	
  getServices: function() {
    var switchService = new Service.Switch();
    var informationService = new Service.AccessoryInformation();
    var model;

    switch (this.domain) {
      case "scene":
        model = "Scene"
        break;
      case "device_tracker":
        model = "device_tracker"
        break;
      default:
        model = "Switch"
    }

    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Home Assistant")
      .setCharacteristic(Characteristic.Model, model)
      .setCharacteristic(Characteristic.SerialNumber, "xxx");

    if (this.domain == 'switch') {
      switchService
        .getCharacteristic(Characteristic.On)
        .on('get', this.getPowerState.bind(this))
        .on('set', this.setPowerState.bind(this));
		} else if(this.domain == 'device_tracker') {
      switchService
      	.getCharacteristic(Characteristic.On)
     	  .on('get', this.getHomeState.bind(this))
      	.on('set', this.setHomeState.bind(this));			
    }else{
      switchService
        .getCharacteristic(Characteristic.On)
        .on('set', this.setPowerState.bind(this));
    }

    return [informationService, switchService];
  }

}
