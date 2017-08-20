const { SwitchmateDevice } = require('node-switchmate');
const Toggle = require('./SwitchmateToggle');

const devices = {};

function onFound(name, auth) {
  return (Switchmate) => {
    console.log('found');
    devices[name] = Switchmate;
    Switchmate.setAuthCode(auth);
    const ToggleMode = new Toggle(Switchmate);

    ToggleMode.event.on('msg', (data) => {
      console.log('msg', data);
    });
    ToggleMode.event.on('success', (data) => {
      console.log('success', data);
      if (Switchmate.callback) {
        Switchmate.callback();
        Switchmate.callback = undefined;
      }
    });
    ToggleMode.event.on('fail', (data) => {
      console.log('fail', data);
    });

    const onToggleSuccess = () => {
      clearTimeout(ToggleMode._toggleTimeout);
      if (ToggleMode.TargetState === 'identify' && ToggleMode.Identify === null) {
        ToggleMode.Identify = true;
        ToggleMode.TargetBool = !ToggleMode.TargetBool;
        ToggleMode.doToggle();
      } else {
        ToggleMode.ToggleSuccess = true;
        ToggleMode.onDisconnect(true);
      }
    };

    Switchmate.removeListener('toggleSuccess', ToggleMode.onToggleSuccess);
    ToggleMode.onToggleSuccess = onToggleSuccess;
    Switchmate.on('toggleSuccess', onToggleSuccess);

    devices[name].ToggleMode = ToggleMode;
    ToggleMode.TurnOff();
  };
}

function toggle(name, callback, state) {
  const Switchmate = devices[name];
  Switchmate.callback = callback;

  if (state === 'toggle') {
    if (Switchmate.ToggleState) {
      Switchmate.ToggleMode.TurnOff();
    } else {
      Switchmate.ToggleMode.TurnOn();
    }
  } else if (state === 'on') {
    Switchmate.ToggleState = false;
    Switchmate.ToggleMode.TurnOn();
  } else if (state === 'off') {
    Switchmate.ToggleState = true;
    Switchmate.ToggleMode.TurnOff();
  } else {
    Switchmate.callback = undefined;
    callback();
  }
}

module.exports = {
  init(config) {
    config.devices.forEach((device) => {
      SwitchmateDevice.discoverById(device.id, onFound(device.name, device.auth));
    });
  },
  toggle,
  devices,
};
