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

	this.temperatureDisplayUnits = Characteristic.TemperatureDisplayUnits.CELSIUS;
	this.temperature = 0;
	this.relativeHumidity = 0;
	this.heatingCoolingState = Characteristic.CurrentHeatingCoolingState.OFF;
	this.targetTemperature = 0;
	this.targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.OFF;

  this.client = client
  this.log = log;
}

HomeAssistantThermostat.prototype = {
	
	// Required
	getCurrentHeatingCoolingState: function(callback) {

    this.client.fetchState(this.entity_id, function(data){
      if (data) {

				currentHeatingCoolingState = Characteristic.CurrentHeatingCoolingState.OFF;
				
				if(data.attributes.current_operation) {		
					if(data.attributes.current_operation == "idle") {
						currentHeatingCoolingState = Characteristic.CurrentHeatingCoolingState.OFF;						
					} else if(data.attributes.current_operation == "cool") {
						currentHeatingCoolingState = Characteristic.CurrentHeatingCoolingState.COOL;					
					} else if(data.attributes.current_operation == "heat") {
						currentHeatingCoolingState = Characteristic.CurrentHeatingCoolingState.HEAT;					
					}
				} else {
					if(data.attributes.away_mode == "off") {
						currentHeatingCoolingState = Characteristic.CurrentHeatingCoolingState.COOL;						
					} else {
						currentHeatingCoolingState = Characteristic.CurrentHeatingCoolingState.OFF;						
					}
				}
				
	      callback(null, currentHeatingCoolingState)
      }else{
        callback(communicationError)
      }
    }.bind(this))

	},

	getTargetHeatingCoolingState: function(callback) {
		this.log("getTargetHeatingCoolingState");

    this.client.fetchState(this.entity_id, function(data){
      if (data) {

				targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.OFF;
				
				// TODO: Seems like all the platforms use different stuff for this, try to get hvac_mode
				// If that one is not available, use operation
				// If that is not available use away mode
				// """Return current hvac mode ie. auto, auxHeatOnly, cool, heat, off."""
				
				state = false
				if(data.attributes.hvac_mode) {
					state = data.attributes.hvac_mode
				} else if(data.attributes.current_operation) {
					state = data.attributes.current_operation
				}
				
				if(state != false) {
					if(state == "idle") {
						targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.OFF;						
					} else if(state == "cool") {
						targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.COOL;					
					} else if(state == "heat" || state == "auxHeatOnly") {
						targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.HEAT;					
					} else if(state == "auto") {
						targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.AUTO;					
					}						
				} else {
					if(data.attributes.away_mode == "off") {
						targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.AUTO;						
					} else {
						targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.OFF;						
					}
				}
				
	      callback(null, targetHeatingCoolingState)
      }else{
        callback(communicationError)
      }
    }.bind(this))

	},
	setTargetHeatingCoolingState: function(value, callback) {
		this.log("setTargetHeatingCoolingState from/to:", this.targetHeatingCoolingState, value);
		this.targetHeatingCoolingState = value;
		var service_data = {}

    this.client.fetchState(this.entity_id, function(data){
	    if (data) {
				if(data.attributes.hvac_mode) {
			
					if(value == Characteristic.TargetHeatingCoolingState.OFF) {
						service_data.hvac_mode = "off";
					} else if(value == Characteristic.TargetHeatingCoolingState.HEAT) {
						service_data.hvac_mode = "heat";
					} else if(value == Characteristic.TargetHeatingCoolingState.COOL) {
						service_data.hvac_mode = "cool";
					} else if(value == Characteristic.TargetHeatingCoolingState.AUTO) {
						service_data.hvac_mode = "auto";
					}		
			
		      this.client.callService(this.domain, 'set_hvac_mode', service_data, function(data){
		        if (data) {
		          this.log("Successfully set thermostat hvac_mode on the '"+this.name+"' to %s", service_data.hvac_mode);
		          callback()
		        }else{
		          callback(communicationError)
		        }
		      }.bind(this))			
			
				} else {
			
					if(value == Characteristic.TargetHeatingCoolingState.OFF) {
						service_data.away_mode = true;
					} else {
						service_data.away_mode = false;
						this.targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.AUTO;
					}
			
		      this.client.callService(this.domain, 'set_away_mode', service_data, function(data){
		        if (data) {
		          this.log("Successfully set thermostat power state using away_mode on the '"+this.name+"' to %d", service_data.away_mode);
		          callback()
		        }else{
		          callback(communicationError)
		        }
		      }.bind(this))
				}
			}
		}.bind(this))
	},
	getCurrentTemperature: function(callback) {
		this.log("getCurrentTemperature");

    this.client.fetchState(this.entity_id, function(data){
      if (data) {

				currentTemperature = 0;
				if(data.attributes.current_temperature) {
					currentTemperature = data.attributes.current_temperature;
				}
				
	      callback(null, currentTemperature)
      }else{
        callback(communicationError)
      }
    }.bind(this))

	},
	getTargetTemperature: function(callback) {
		this.log("getTargetTemperature");
    this.client.fetchState(this.entity_id, function(data){
      if (data) {

				targetTemperature = 0;
				if(data.attributes.temperature) {
					targetTemperature = data.attributes.temperature;
				}
				
	      callback(null, targetTemperature)
      }else{
        callback(communicationError)
      }
    }.bind(this))
	},
	setTargetTemperature: function(value, callback) {

    this.log("Setting target temperature on the '"+this.name+"' to %d", value);
		this.targetTemperature = value;

		var service_data = {}
    service_data.entity_id = this.entity_id
    service_data.temperature = value

    this.client.callService(this.domain, 'set_temperature', service_data, function(data){
      if (data) {
        this.log("Successfully set temperature on the '"+this.name+"' to %d", value);
        callback()
      }else{
        callback(communicationError)
      }
    }.bind(this))

	},
	getTemperatureDisplayUnits: function(callback) {
		this.log("getTemperatureDisplayUnits");

		temperatureDisplayUnits = Characteristic.TemperatureDisplayUnits.CELSIUS
    this.client.fetchState(this.entity_id, function(data){
      if (data) {

				if(data.attributes.unit_of_measurement == '°C') {
					temperatureDisplayUnits = Characteristic.TemperatureDisplayUnits.CELSIUS;
				} else {
					temperatureDisplayUnits = Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
				}
				
	      callback(null, targetTemperature)
      }else{
        callback(communicationError)
      }
    }.bind(this))
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

			var thermostatService = new Service.Thermostat(this.name);

					// Required Characteristics
					thermostatService
						.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
						.on('get', this.getCurrentHeatingCoolingState.bind(this));

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
						.on('get', this.getTemperatureDisplayUnits.bind(this));

					thermostatService
						.getCharacteristic(Characteristic.Name)
						.on('get', this.getName.bind(this));			
			
    return [informationService, thermostatService];
  }

}
