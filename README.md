# SLACK OFF. BE A LAZY GIT.

Run git commands or query api on all projects or groups of an authenticated
GitLab or GitHub user.

So far only GitLab & GitHub are supported and the git commands - `clone`,
`pull`, `fetch` & `status`.

**Coming soon** - A wider array of commands and configuration...

## INSTALLATION

Clone the repo, run `npm install` in the project root, to download
dependancies, and then `npm link` to install as a CLI app called `lazygitlab`.

**Coming soon** - official npm package...

## CONFIGURATION

Copy `config.example.json` to `config.json` and edit to your tastes. It should
be fairly self explantatory...

### TOKENS

Generate a Gitlab Personal Access Token from
[here](https://gitlab.com/profile/personal_access_tokens).

### DESTINATION

To specify which directory you'd like to clone/update change the `destination`
value in `config.json`.

### EXAMPLE

```javascript
{
  "github": {
	"destination": "/path/to/location/for/github/repos",
	"token": "GITHUB_TOKEN"
  },
  "gitlab": {
	"destination": "/path/to/location/for/gitlab/projects",
	"token": "GITLAB_TOKEN"
  }
}
```

Alternatively you can pass command line arguments to overwrite the default
configuration...

## OPTIONS

`lazygitlab`:

``` text
  --version           Show version number                              [boolean]
  --create, -c        Create a gitlab runner registering script         [string]
  --file, -f          Destination file for gitlab runner script         [string]
  --destination, -d   Destination directory to operate on               [string]
  --http              Use http url to access projects                  [boolean]
  --ssh               Use ssh url to access projects   [boolean] [default: true]
  --namespaces, -n    Enter namespaces to operate on       [array] [default: ""]
  --projects, -p      Enter projects to operate on                       [array]
  --groups, -g        Enter groups to operate on                         [array]
  --run, -r           Git command to run     [string] [default: "pull-or-clone"]
  --show, -s          API resources to show                             [string]
  --order, -o         Attribute to order API resources by               [string]
  --attributes, -a    Only show these attributes of a resource           [array]
  --filter_key, -K    Key to filter API resources by                    [string]
  --filter_value, -V  Value to filter API resources by                  [string]
  --token, -t         Gitlab API token                                  [string]
  --verbose, -v       Increase verbosity                               [boolean]
  -h, --help          Show help
  [boolean]
```

`lazygithub`:

``` text
  --version           Show version number                              [boolean]
  --destination, -d   Destination directory to operate on               [string]
  --http              Use http url to access projects                  [boolean]
  --ssh               Use ssh url to access projects   [boolean] [default: true]
  --projects, -p      Enter projects to operate on                       [array]
  --run, -r           Git command to run     [string] [default: "pull-or-clone"]
  --repo, -R          Repo to work with                                 [string]
  --user, -u          Alternate GitHub user to work with                [string]
  --show, -s          API resources to show                             [string]
  --order, -o         Attribute to order API resources by               [string]
  --attributes, -a    Only show these attributes of a resource           [array]
  --filter_key, -K    Key to filter API resources by                    [string]
  --filter_value, -V  Value to filter API resources by                  [string]
  --token, -t         Github API token                                  [string]
  --verbose, -v       Increase verbosity                               [boolean]
  -h, --help          Show help                                        [boolean]
```

## EXAMPLES

**Want to see the job logs of your the latest failed GitLab CI job?**

`lazygitlab --projects your-project-name --show latest_failed_job` or, if you
don't like typing - `lgl -p project-name -s lfj`

Pipe this to `less -Rr` for maximum win: `lgl -p lazygit -s lfj | less -Rr`. Bosh.

**How about all of the pipeline schedules of a GitLab group ordered by when they
are next going to run at?**

`lazygitlab --namespace group/subgroup --show schedules` or `lgl -n group/subgroup -s ps`

Pipe this to `jq -rc` for more colorful/terser output.
