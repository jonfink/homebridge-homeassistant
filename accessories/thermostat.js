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

	  Characteristic.TemperatureDisplayUnits.CELSIUS = 0;
		//Characteristic.TemperatureDisplayUnits.FAHRENHEIT = 1;
		this.temperatureDisplayUnits = Characteristic.TemperatureDisplayUnits.CELSIUS;
		this.temperature = 19;
		this.relativeHumidity = 0.70;
		// The value property of CurrentHeatingCoolingState must be one of the following:
		Characteristic.CurrentHeatingCoolingState.OFF = 0;
		//Characteristic.CurrentHeatingCoolingState.HEAT = 1;
		//Characteristic.CurrentHeatingCoolingState.COOL = 2;
		this.heatingCoolingState = Characteristic.CurrentHeatingCoolingState.OFF;
		this.targetTemperature = 21;
		this.targetRelativeHumidity = 0.5;
		this.heatingThresholdTemperature = 25;
		this.coolingThresholdTemperature = 5;
		// The value property of TargetHeatingCoolingState must be one of the following:
		//Characteristic.TargetHeatingCoolingState.OFF = 0;
		//Characteristic.TargetHeatingCoolingState.HEAT = 1;
		//Characteristic.TargetHeatingCoolingState.COOL = 2;
		Characteristic.TargetHeatingCoolingState.AUTO = 3;
		this.targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.AUTO;

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
	
	// Required
	getCurrentHeatingCoolingState: function(callback) {
		this.log("getCurrentHeatingCoolingState from:", this.apiroute+"/status");
		var error = null;
		callback(error);
	},
	setCurrentHeatingCoolingState: function(value, callback) {
		this.log("TO BE REMOVED BECAUSE USELESS setCurrentHeatingCoolingState:", value);
		this.heatingCoolingState = value;
		var error = null;
		callback(error);
	},
	getTargetHeatingCoolingState: function(callback) {
		this.log("getTargetHeatingCoolingState:", this.targetHeatingCoolingState);
		var error = null;
		callback(error, this.targetHeatingCoolingState);
	},
	setTargetHeatingCoolingState: function(value, callback) {
		this.log("setTargetHeatingCoolingState from/to:", this.targetHeatingCoolingState, value);
		this.targetHeatingCoolingState = value;
		var error = null;
		callback(error);
	},
	getCurrentTemperature: function(callback) {
		this.log("getCurrentTemperature from:", this.apiroute+"/status");
		var error = null;
		callback(error, this.targetTemperature);
	},
	getTargetTemperature: function(callback) {
		this.log("getTargetTemperature from:", this.apiroute+"/status");
		var error = null;
		callback(error, this.targetTemperature);
	},
	setTargetTemperature: function(value, callback) {
		this.log("setTargetTemperature from:", this.apiroute+"/targetTemperature/"+value);
		var error = null;
		callback(error);
	},
	getTemperatureDisplayUnits: function(callback) {
		this.log("getTemperatureDisplayUnits:", this.temperatureDisplayUnits);
		var error = null;
		callback(error, this.temperatureDisplayUnits);
	},
	setTemperatureDisplayUnits: function(value, callback) {
		this.log("setTemperatureDisplayUnits from %s to %s", this.temperatureDisplayUnits, value);
		this.temperatureDisplayUnits = value;
		var error = null;
		callback(error);
	},

	// Optional
	getCurrentRelativeHumidity: function(callback) {
		this.log("getCurrentRelativeHumidity from:", this.apiroute+"/status");
		var error = null;
		callback(error, this.targetRelativeHumidity);
	},
	getTargetRelativeHumidity: function(value, callback) {
		this.log("getTargetRelativeHumidity:", this.targetRelativeHumidity);
		var error = null;
		callback(error, this.targetRelativeHumidity);
	},
	setTargetRelativeHumidity: function(value, callback) {
		this.log("setTargetRelativeHumidity from/to :", this.targetRelativeHumidity, value);
		this.targetRelativeHumidity = value;
		var error = null;
		callback(error);
	},
/*	getCoolingThresholdTemperature: function(callback) {
		this.log("getCoolingThresholdTemperature: ", this.coolingThresholdTemperature);
		var error = null;
		callback(error, this.coolingThresholdTemperature);
	},
*/	getHeatingThresholdTemperature: function(callback) {
		this.log("getHeatingThresholdTemperature :" , this.heatingThresholdTemperature);
		var error = null;
		callback(error, this.heatingThresholdTemperature);
	},
	getName: function(callback) {
		this.log("getName :", this.name);
		var error = null;
		callback(error, this.name);
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
			
			
			var thermostatService = new Service.Thermostat(this.name);

					// Required Characteristics
					thermostatService
						.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
						.on('get', this.getCurrentHeatingCoolingState.bind(this))
						.on('set', this.setCurrentHeatingCoolingState.bind(this));

					thermostatService
						.getCharacteristic(Characteristic.TargetHeatingCoolingState)
						.on('get', this.getTargetHeatingCoolingState.bind(this))
						.on('set', this.setTargetHeatingCoolingState.bind(this));

					thermostatService
						.getCharacteristic(Characteristic.CurrentTemperature)
						.on('get', this.getCurrentTemperature.bind(this));

					thermostatService
						.getCharacteristic(Characteristic.TargetTemperature)
						.on('get', this.getTargetTemperature.bind(this))
						.on('set', this.setTargetTemperature.bind(this));

					thermostatService
						.getCharacteristic(Characteristic.TemperatureDisplayUnits)
						.on('get', this.getTemperatureDisplayUnits.bind(this))
						.on('set', this.setTemperatureDisplayUnits.bind(this));

					// Optional Characteristics
					thermostatService
						.getCharacteristic(Characteristic.CurrentRelativeHumidity)
						.on('get', this.getCurrentRelativeHumidity.bind(this));

					thermostatService
						.getCharacteristic(Characteristic.TargetRelativeHumidity)
						.on('get', this.getTargetRelativeHumidity.bind(this))
						.on('set', this.setTargetRelativeHumidity.bind(this));
					/*
					thermostatService
						.getCharacteristic(Characteristic.CoolingThresholdTemperature)
						.on('get', this.getCoolingThresholdTemperature.bind(this));
					*/

					thermostatService
						.getCharacteristic(Characteristic.HeatingThresholdTemperature)
						.on('get', this.getHeatingThresholdTemperature.bind(this));

					thermostatService
						.getCharacteristic(Characteristic.Name)
						.on('get', this.getName.bind(this));			
			
    return [informationService, switchService, thermostatService];
  }

}
