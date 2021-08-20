const Resources  = {};

Resources.getNamespaces = (namespaces, resources) => {
  // Filter group objects by match to namespace argument - defaults to an
  // empty string, so if no namespace argument - returns all groups & projects.
  return namespaces.map((namespace) => {
    return resources.filter((resource) => {
      if (resource.path_with_namespace != undefined) {
	return resource.path_with_namespace.startsWith(namespace);
      } else if (resource.full_path != undefined) {
	return resource.full_path.startsWith(namespace);
      } else {
	return resource;
      }
    });
  }).flat();
};

Resources.getNames = (names, resources) => {
  return names.map((name) => {
    return resources.filter((resource) => {
      return resource.name == name;
    });
  }).flat();
};

Resources.filter = (resources, key, value) => {
  if (key != undefined && value != undefined) {
    return resources.filter((attr) => {
      return (attr[key] == value ? attr : null);
    });
  } else {
    return resources;
  }
};

Resources.sort = (resources, key) => {
  // https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
  if (key != undefined) {
    return resources.sort((a, b) => {
      return a[key] > b[key] ? 1 : -1;
    });
  } else {
    return resources;
  }
};

Resources.trim = (resources, attributes) => {
  if (attributes != undefined) {
    if (attributes.length > 1) {
      return resources.map((res) => {
	let newObj = {};
	attributes.map((attr) => {
	  newObj[attr] = res[attr];
	});
	return newObj;
      }).flat();
    } else {
      return resources.map((res) => {
	return attributes.map((attr) => {
	  return res[attr];
	});
      }).flat();
    }
  } else {
    return resources;
  }
};

Resources.limit = (resources, limit) => {
  if (limit != undefined) {
    return resources.slice(1).slice(-limit);
  }
  return resources;
};

Resources.out = (resources, out) => {
  return new Promise((resolve, reject) => {
    resolve(resources.flat());
  })
    .then((resources) => {
      return Resources.filter(resources, out.filterKey, out.filterValue);
    })
    .then((resources) => {
      return Resources.sort(resources, out.sortKey);
    })
    .then((resources) => {
      return Resources.trim(resources, out.attributes);
    })
    .then((resources) => {
      return Resources.limit(resources, out.limit);
    });
};

module.exports = Resources;
