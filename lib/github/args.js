const util  = require('./util');
const yargs = require('yargs');
const args  = yargs
      .option('destination', {
	alias: 'd',
	description: 'Destination directory to operate on',
	type: 'string',
      })
      .option('http', {
	description: 'Use http url to access projects',
	type: 'boolean',
      })
      .option('ssh', {
	description: 'Use ssh url to access projects',
	type: 'boolean',
	default: true,
      })
      .option('projects', {
	alias: 'p',
	description: 'Enter projects to operate on',
	type: 'array',
      })
      .option('run', {
	alias: 'r',
	description: 'Git command to run',
	type: 'string',
	default: 'pull-or-clone',
      })
      .option('repo', {
	alias: 'R',
	description: 'Repo to work with',
	type: 'string',
      })
      .option('user', {
	alias: 'u',
	description: 'Alternate GitHub user to work with',
	type: 'string',
      })
      .option('show', {
	alias: 's',
	description: 'API resources to show',
	type: 'string',
      })
      .option('order', {
	alias: 'o',
	description: 'Attribute to order API resources by',
	type: 'string',
      })
      .option('attributes', {
	alias: 'a',
	description: 'Only show these attributes of a resource',
	type: 'array',
      })
      .option('filter_key', {
	alias: 'K',
	description: 'Key to filter API resources by',
	type: 'string',
      })
      .option('filter_value', {
	alias: 'V',
	description: 'Value to filter API resources by',
	type: 'string',
      })
      .option('token', {
	alias: 't',
	description: 'Github API token',
	type: 'string',
      })
      .option('verbose', {
	alias: 'v',
	description: 'Increase verbosity',
	type: 'boolean',
      })
      .help()
      .alias('h', 'help')
      .implies('filter_key', 'filter_value')
      .argv;

args.chkFile = () => {
  if (args.file) {
    return util.expandPath(args.file);
  }
};

args.chkToken = () => {
  if (args.token) {
    return args.token;
  } else {
    try {
      var config = require('../../config');
      if(config.github.token == undefined) {
	console.log("No API token provided. Aborting.");
	process.exit(1);
      }
      return config.github.token;
    } catch(e) {
      console.log(e);
      console.log("Cannot find config file. Aborting.");
      process.exit(1);
    }
  }
};

args.chkDest = () => {
  if (args.destination) {
    util.chkDir(util.expandPath(args.destination));
    return util.expandPath(args.destination);
  } else {
    try {
      var config = require('../../config');
      if(config.github.destination == undefined) {
	console.log("No destination provided. Aborting.");
	process.exit(1);
      }
      util.chkDir(util.expandPath(config.github.destination));
      return util.expandPath(config.github.destination);
    } catch(e) {
      console.log(e);
      console.log("Cannot find config file. Aborting.");
      process.exit(1);
    }
  }
};

module.exports = args;
