
# Home Assistant for Homebridge

Control your accessories from [Home Assistant](http://home-assistant.io) with
Siri and HomeKit. Set it up and poof, all of your supported accessories will be
instantly controllable via Siri.

## Device Support

Home Assistant is a home automation platform already, so this plugin aims to
just expose your devices in a way that you can control them with Siri. While
you can integrate your accessories into HomeKit for automations, the goals of
this plugin are strictly to allow Siri to be a frontend for your accessories.

When you set up the Home Assistant plugin, all you have to do is point it at
your Home Assistant server. The plugin pulls all your devices and exposes them
automatically. Easy peasey.

Here's a list of the devices that are currently exposed:

* **Lights** - on/off/brightness
* **Switches** - on/off
* **Scenes** - exposed as an on/off switch
* **Media Players** - exposed as an on/off switch

### Scene Support

Scenes will appear to HomeKit as switches. To trigger them, you can simply say
"turn on party time". In some cases, scene names are already reserved in
HomeKit...like "Good Morning" and "Good Night". These scenes already exist and
cannot be deleted. Simply add your Home Assistant scene to them and set the
state you would like them to be when executed. That's most like the ON state.

### Media Player Support

Media players on your Home Assistant will be added to your HomeKit as a switch.
While this seems like a hack at first, it's actually quite useful. While you
can't control everything a media player does, it will give you the ability to
toggle them on or off.

There are some rules to know about how on/off treats your media player. If
your media player supports play/pause, then turning them on and off via
HomeKit will play and pause them. If they do not support play/pause but instead
support on/off they will be turned on and off.

## Installation

After installing and setting up [Homebridge](https://github.com/nfarina/homebridge), you can install the Home Assistant plugin with:

    npm install -g homebridge-homeassistant

Once installed, update your Homebridge's `config.json`.

## Configuration

As with other Homebridge plugins, you configure the Home Assistant plugin by
adding it to your `config.json`.

```json
"platforms": [
  {
    "platform": "HomeAssistant",
    "name": "HomeAssistant",
    "host": "http://192.168.1.16:8123",
    "password": "yourapipassword",
    "supported_types": ["light", "switch", "media_player", "scene"]
  }
]
```

You can optionally whitelist the device types that are exposed to HomeKit with the `supported_types` array. Just remove a device type that you don't want and they will be ignored.

## Contributions

* fork
* create a feature branch
* open a Pull Request
