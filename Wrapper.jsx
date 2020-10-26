const { React, contextMenu, getModule, i18n: { Messages } } = require('powercord/webpack');
const { REPO_URL } = require('powercord/constants');
const { join } = require('path');
const { shell } = require('electron');
const { ContextMenu } = require('powercord/components');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { Modal } = require('powercord/components/modal');
const Plugins = require('./../pc-moduleManager/components/manage/Plugins');
const { promisify } = require('util');
const cp = require('child_process');
const exec = promisify(cp.exec);
module.exports = class Wrapper extends Plugins {
  constructor (props) {
    super(props);
    this.state = {
      key: `${super.constructor.name.toUpperCase()}`,
      search: ''
    };
    this.parser = getModule([ 'parse', 'parseTopic' ], false);
  }

  openOverflowMenu (e) {
    contextMenu.openContextMenu(e, () =>
      React.createElement(ContextMenu, {
        width: '50px',
        itemGroups: [ [
          {
            type: 'button',
            name: Messages[`POWERCORD_${this.state.key}_OPEN_FOLDER`],
            onClick: () => shell.openPath(join(__dirname, '..', '..', super.constructor.name.toLowerCase()))
          },
          {
            type: 'button',
            name: Messages[`POWERCORD_${this.state.key}_LOAD_MISSING`],
            onClick: () => this.fetchMissing()
          },
          {
            type: 'button',
            name: 'Generate Clone Command',
            onClick: () => this.openCloneModal()
          }
        ] ]
      })
    );
  }

  async openCloneModal () {
    const plugins = await this.getPlugins();
    const clones = plugins.map(e => `git clone ${e}`);
    openModal(() => (
      <Modal className='powercord-text'>
        <Modal.Header>
            Git Clone Generator
        </Modal.Header>
        <Modal.Content>
          {this.parser.parse(`\`\`\`bash\n${clones.join(' && ')}\`\`\``)[0]}
        </Modal.Content>
      </Modal>
    ));
  }

  getPlugins () {
    return new Promise((resolve) => {
      const urls = [];
      [ ...powercord.pluginManager.plugins.values() ].forEach(async (e, i, a) => {
        const origin = (await exec('git config --get remote.origin.url', { cwd: e.entityPath })).stdout;
        if (!origin.includes(REPO_URL)) {
          urls.push(origin.replace('\n', ''));
        }
        if (i === a.length - 1) {
          resolve(urls);
        }
      });
    });
  }
};
