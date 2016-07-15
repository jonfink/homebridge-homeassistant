var Service, Characteristic, communicationError;

module.exports = function (oService, oCharacteristic, oCommunicationError) {
  Service = oService;
  Characteristic = oCharacteristic;
  communicationError = oCommunicationError;

  return HomeAssistantThermostat;
};
module.exports.HomeAssistantThermostat = HomeAssistantThermostat;

function HomeAssistantThermostat(log, data, client, type) {
  // device info
  this.domain = type || "thermostat"
  this.data = data
  this.entity_id = data.entity_id
  if (data.attributes && data.attributes.friendly_name) {
    this.name = data.attributes.friendly_name
  }else{
    this.name = data.entity_id.split('.').pop().replace(/_/g, ' ')
  }

  this.client = client
  this.log = log;
}

HomeAssistantThermostat.prototype = {
  getPowerState: function(callback){
    this.log("fetching thermostat power state for: " + this.name);		
    this.client.fetchState(this.entity_id, function(data){
			this.log("Fetched thermo state Data: " + JSON.stringify(data, null, 4));
      if (data) {
			  if(data.attributes.away_mode == 'on') {
		  		powerState = false;
			  } else {
			  	powerState = true;
			  }
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
			service_data.away_mode = false;
      this.log("Setting thermostat power state on the '"+this.name+"' to on");

      this.client.callService(this.domain, 'set_away_mode', service_data, function(data){
        if (data) {
          that.log("Successfully set thermostat power state on the '"+that.name+"' to on");
          callback()
        }else{
          callback(communicationError)
        }
      }.bind(this))
    }else{
			service_data.away_mode = true;
      this.log("Setting thermostat power state on the '"+this.name+"' to off");

      this.client.callService(this.domain, 'set_away_mode', service_data, function(data){
        if (data) {
          that.log("Successfully  set thermostat power state on the '"+that.name+"' to off");
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

    model = "thermostat";

    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Home Assistant")
      .setCharacteristic(Characteristic.Model, model)
      .setCharacteristic(Characteristic.SerialNumber, "xxx");

    switchService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getPowerState.bind(this))
      .on('set', this.setPowerState.bind(this));	
			
    return [informationService, switchService];
  }

}
