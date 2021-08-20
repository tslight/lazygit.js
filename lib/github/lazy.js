const args = require('./args');
const git = require('./git');
const Resources = require('./resources.js');
const axios = require('axios');
const token = args.chkToken();
const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: {'Authorization': `token ${token}`}
});
const outputFilters = {
  attributes: args.attributes,
  filterKey: args.filter_key,
  filterValue: args.filter_value,
  sortKey: args.order,
};
const lazy = {};

lazy._get = (slug, page = 1, pages = []) => {
  return api.get(slug + `?per_page=100&page=${page}`)
    .then((response) => {
      let retrivedPages = pages.concat(response.data);
      if (response.headers.link != undefined &&
	  response.headers.link.includes('rel="next"')) {
	page++;
	return lazy._get(slug, page, retrivedPages);
      }
      return retrivedPages;
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
};

lazy.getResource = (resource, out=outputFilters) => {
  return lazy._get(resource)
    .then((response) => {
      return Resources.out(response, out);
    });
};

lazy.getRepoUrls = (slug) => {
  let protocol = args.http ? ['clone_url'] : ['ssh_url'];
  return lazy.getResource(slug, {attributes: protocol})
    .then((response) => {
      return response;
    });
};

lazy.init = () => {
  if (args.show != undefined) {
    return lazy.getResource(args.show)
      .then((response) => {
	console.log(JSON.stringify(response, null, 2));
	// console.log(JSON.stringify(response, null, 2));
      });
  } else if (args.user != undefined) {
    return lazy.getRepoUrls(`/users/${args.user}/repos`)
      .then((urls) => {
	return urls.map((url) => {
	  git.run(url, args.run);
	});
      });
  } else if (args.repo != undefined) {
    return lazy.getRepoUrls(`/repos/${args.repo}`)
      .then((urls) => {
	return urls.map((url) => {
	  git.run(url, args.run);
	});
      });
  } else {
    return lazy.getRepoUrls('/user/repos')
      .then((urls) => {
	return urls.map((url) => {
	  git.run(url, args.run);
	});
      });
  }
};

module.exports = lazy;
