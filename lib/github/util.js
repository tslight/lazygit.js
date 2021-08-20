const args = require('./args');
const fs   = require('fs');
const home = require('os').homedir();
const path = require('path');
const util = {};

util.expandPath = (filepath) => {
  if (filepath[0] === '~') {
    return path.join(home, filepath.slice(1));
  }
  return filepath;
};

util.chkDir = (dir) => {
  //https://stackove rflow.com/a/40686853
  if (fs.existsSync(dir) == false) {
    if (args.verbose) {
      console.log(`${dir} doesn't exist. Creating...`);
    }
    fs.mkdirSync(dir, { recursive: true });
  }
};

module.exports = util;
