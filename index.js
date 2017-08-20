const express = require('express');
const morgan = require('morgan');
const SwitchMateManager = require('./lib/SwitchMateManager');
const config = require('./config');

SwitchMateManager.init(config);

const app = express();
app.use(morgan('combined'));

app.get('/:state/:name', (req, res) => {
  const { state, name } = req.params;
  const device = SwitchMateManager.devices[name];
  if (!device.toggling) {
    device.toggling = true;
    SwitchMateManager.toggle(name, () => {
      device.toggling = false;
      res.json({
        message: '💡',
      });
    }, state);
  } else {
    res.json({
      message: 'Toggle in progress.',
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
