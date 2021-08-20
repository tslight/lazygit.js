const args = require('./args');
const api = require('./api');
const git = require('./git');
const Runners = require('./runners');
const file = args.chkFile();
const outputFilters = {
  attributes: args.attributes,
  filterKey: args.filter_key,
  filterValue: args.filter_value,
  sortKey: args.order,
  limit: args.limit,
};
const getMembersAccessLevel = (members) => {
  let levels = {
    50: 'Owner',
    40: 'Maintainer',
    30: 'Developer',
    20: 'Reporter',
    10: 'Guest',
  };
  return members.map((member) => {
    member['access_level'] = levels[member['access_level']];
    return member;
  });
};
const lazy = {};

lazy.run = (cmd) => {
  return api.getResources('projects', {
    attributes: args.http ? ['http_url_to_repo'] : ['ssh_url_to_repo']
  })
    .then((urls) => {
      return urls.map((url) => {
	return git.run(url, cmd);
      });
    });
};

lazy.urls = () => {
  if (args.groups != undefined) {
    return api.getResources('groups', {attributes: ['projects']})
      .then((projects) => {
	return projects.flat().map((project) => {
	  return (args.http ? project.http_url_to_repo : project.ssh_url_to_repo);
	});
      });
  } else {
    return api.getResources('projects', {
      attributes: args.http ? ['http_url_to_repo'] : ['ssh_url_to_repo']
    });
  }
};

lazy.members = () => {
  if (args.groups != undefined) {
    return api.getSubResources('groups', 'members/all', {
      sortKey: 'name',
      attributes: ['name', 'access_level'],
    })
      .then((members) => {
	return getMembersAccessLevel(members);
      });
  } else {
    return api.getSubResources('projects', 'members/all', {
      sortKey: 'name',
      attributes: ['name', 'access_level'],
    })
      .then((members) => {
	return getMembersAccessLevel(members);
      });
  }
};

lazy.show = () => {
  switch(args.show) {
  case 'groups':
  case 'namespaces':
  case 'projects':
  case 'runners':
    return api.getResources(args.show, outputFilters);
  case 'urls':
    return lazy.urls();
  case 'commits':
    return api.getSubResources('projects', 'repository/commits', {
      sortKey: 'created_at',
      attributes: ['title', 'author_name'],
      limit: 10
    });
  case 'ps':
  case 'schedules':
    return api.getSubResources('projects', 'pipeline_schedules', {
      sortKey: 'next_run_at',
      attributes: ['description', 'cron'],
    });
  case 'am':
  case 'all_members':
    return lazy.members();
  case 'lfj':
  case 'latest_failed_job':
    // pipe this to less -Rr for maximum win!
    return api.getSubResources('projects', 'jobs', {
      sortKey: 'created_at',
      attributes: ['id'],
      filterKey: 'status',
      filterValue: 'failed',
      limit: 1
    })
      .then((jobs) => {
	let logs = jobs.map((id) => {
	  return api.getSubResources('projects', `jobs/${id}/trace`, outputFilters);
	});
	return Promise.all(logs)
	  .then((logs) => {
	    return logs.flat();
	  });
      });
  default:
    if (args.groups != undefined) {
      return api.getSubResources('groups', args.show, outputFilters);
    } else {
      return api.getSubResources('projects', args.show, outputFilters);
    }
    break;
  }
};

lazy.init = () => {
  if (args.show != undefined) {
    return lazy.show()
      .then((data) => {
	data.map((d) => {
	  // parse ansi escape codes & remove need to pipe job logs to jq . -rc
	  var isString = typeof d === "string" || d instanceof String;
	  console.log(isString ? d : JSON.stringify(d, null, 2));
	});
	// console.log(`Total: ${data.length}`);
      });
  } else if (args.create != undefined) {
    return Runners.makeBashScript(args.create, file);
  } else {
    return lazy.run(args.run);
  }
};

module.exports = lazy;
