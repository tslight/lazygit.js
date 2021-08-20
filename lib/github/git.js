const cmd  = require('node-cmd');
const fs   = require('fs');
const clr  = require('./color');
const args = require('./args');
const dest = args.chkDest();
const git  = {};

function updateOutput(data, stderr, err, path) {
  let p = path.replace(`${dest}/`, '');
  let emptyRepo = err && stderr.includes('no such ref was fetched');
  let upToDate = (
    data.includes('Already up to date') || data.endsWith('Fetching origin')
  );

  if (emptyRepo) {
    if (args.verbose) {
      console.log(`${clr.grn}${p}:${clr.mag} Nothing to see here.${clr.off}`);
    }
  } else if (upToDate)  {
    if (args.verbose) {
      console.log(`${clr.grn}${p}:${clr.cyn} Already up to date.${clr.off}`);
    }
  } else if (err) {
    console.log(`${clr.red}${p}:${clr.mag} ERROR...${clr.off}\n${stderr}`);
  } else {
    console.log(`${clr.yel}${p}:${clr.mag} UPDATING...${clr.off}\n${data}`);
  }
}

git.clone = (url, path) => {
  cmd.get(`git clone ${url} ${path}`, (err, data, stderr) => {
    console.log(`${clr.yel}Cloning ${clr.cyn}${url}${clr.yel}` +
		` to ${clr.mag}${path}...${clr.off}`);
  });
};

git.fetch = (path) => {
  cmd.get(`git -C ${path} fetch --all`, (err, data, stderr) => {
    updateOutput(data.trim(), stderr.trim(), err, path);
  });
};

git.pull = (path) => {
  cmd.get(`git -C ${path} pull`, (err, data, stderr) => {
    updateOutput(data.trim(), stderr.trim(), err, path);
  });
};

git.status = (path) => {
  cmd.get(`git -C ${path} status -s`, (err, data, stderr) => {
    let p = path.replace(`${dest}/`, '');
    if (data) {
      console.log(
	`${clr.yel}${p}:${clr.mag} MODIFIED...${clr.off}` +
	  `\n${data.trimRight()}${clr.off}`
      );
    } else {
      if (args.verbose) {
	console.log(`${clr.grn}${p}:${clr.cyn} Nothing to commit.${clr.off}`);
      }
    }
  });
};

git.run = (url, cmd) => {
  let path = dest + '/' + url.substring(url.indexOf(':') + 1);
  path = path.replace('.git', '').replace('//', '/');

  switch(cmd) {
  case 'status':
    return git.status(path);
  case 'fetch':
    return git.fetch(path);
  case 'pull':
    return git.pull(path);
  case 'fetch-or-clone':
    return (fs.existsSync(path) ? git.fetch(path) : git.clone(url, path));
  case 'pull-or-clone':
    return (fs.existsSync(path) ? git.pull(path) : git.clone(url, path));
  }
};

module.exports = git;
