const { Plugin } = require('powercord/entities');
const { React } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

const Wrapper = require('./Wrapper');

// https://gomakethings.com/how-to-add-a-new-item-to-an-object-at-a-specific-position-with-vanilla-js/
function addToObject (obj, key, value, index) {
  // Create a temp object and index variable
  const temp = {};
  let i = 0;

  // Loop through the original object
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      // If the indexes match, add the new item
      if (i === index && key && value) {
        temp[key] = value;
      }

      // Add the current item in the loop to the temp obj
      temp[prop] = obj[prop];

      // Increase the count
      i++;
    }
  }

  // If no index, add to the end
  if (!index && key && value) {
    temp[key] = value;
  }

  return temp;
}

module.exports = class BetterPluginSettings extends Plugin {
  startPlugin () {
    const tab = { ...powercord.api.settings.tabs['pc-moduleManager-plugins'] };
    delete powercord.api.settings.tabs['pc-moduleManager-plugins'];
    powercord.api.settings.tabs = addToObject(powercord.api.settings.tabs, 'pc-moduleManager-plugins', tab, 1);


    delete powercord.api.settings.tabs['pc-moduleManager-plugins'].render;
    powercord.api.settings.tabs['pc-moduleManager-plugins'].render = () => React.createElement(Wrapper);
  }

  pluginWillUnload () {
    // uninject('betterplugins');
  }
};
