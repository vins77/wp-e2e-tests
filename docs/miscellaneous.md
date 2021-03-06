# Other Information

## Table of Contents

- [NodeJS Version](#nodejs-version)
- [Git Pre-Commit Hook](#git-pre-commit-hook)
- [Launch Logged-In Window](#launch-logged-in-window)
- [User account requirements](#user-account-requirements)
- [List of wrapper repos & friends](#list-of-wrapper-repos--friends)

## NodeJS Version

The node version should be defined in the `.nvmrc` file for use with the [nvm](https://github.com/creationix/nvm) project.

## Git Pre-Commit Hook

The file `/scripts/git-pre-commit-circleci-validate` will run `circleci validate` against the CircleCI config file prior to every commit.  This prevents the constant back-and-forth when making updates only to find that they fail immediately on CI.  Instructions in the file direct how to install the hook in your local Git environment (it won't run without this).

## Launch Logged-In Window

To facilitate manual testing, the [launch-wpcom-login.js](/scripts/launch-wpcom-login.js) file in `/scripts` will launch a Chrome browser window to WordPress.com and log in with the account definition given on the command line.  The only config requirement for this is that the `local-${NODE_ENV}.json` file needs to have the `testAccounts` object defined.  If no account is given on the command line, `defaultUser` will be used.

Example:

```bash
./node_modules/.bin/babel-node scripts/launch-wpcom-login.js multiSiteUser
```

## User account requirements

### jetpackUserPRESSABLE for PRESSABLE Target

- Selected main site (in Account Settings)
- Working Twitter Publicize integration
- Free plan
- Theme which is displaying tags and categories (e.g. Twenty Fifteen)
- Installed "Hello Dolly" plugin

## List of wrapper repos & friends

Wrapper repo is basically the same Main repo but with parameterized `./run.sh` command which provide variety of ways to run the tests.  We set things up this way to make it easy to differentiate build types on Circle CI, for example: [history of WooCommerce e2e test runs](https://circleci.com/build-insights/gh/Automattic/wp-e2e-tests-woocommerce/master).

1. [Main repo](https://github.com/Automattic/wp-e2e-tests) - Main repo as it is :)
1. [Canary tests](https://github.com/Automattic/wp-e2e-tests-canary) - `@canary` tagged tests which runs on every Calypso `master` merge
1. [IE11 tests](https://github.com/Automattic/wp-e2e-tests-ie11) - IE11 tests running in Sauce Labs. Triggered by `cron` job
1. [Jetpack stable](https://github.com/Automattic/wp-e2e-tests-jetpack) - Jetpack centric tests (specs tagged with `@jetpack` tag) which uses stable Jetpack releases and hosted on Pressable
1. [Jetpack bleeding edge](https://github.com/Automattic/wp-e2e-tests-jetpack-be) - Jetpack centric tests (specs tagged with `@jetpack` tag) which uses 'bleeding edge' Jetpack releases and hosted on Pressable
1. [Branches tests](https://github.com/Automattic/wp-e2e-tests-for-branches) - Repo which is used to run e2e tests both canary and full suite against Calypso PR's. Triggered by GitHub labels
1. [Woo tests](https://github.com/Automattic/wp-e2e-tests-woocommerce) - Runs WooCommerce specs
1. [Visdiff tests](https://github.com/Automattic/wp-e2e-tests-visdiff) - Runs VisDiff tests. Triggered by `cron` job
1. [I18N tests](https://github.com/Automattic/wp-e2e-tests-i18n) - Runs I18N test suite. Triggered by `cron` job

Friends:

- [E2E tests Github bridge](https://github.com/Automattic/wp-e2e-tests-gh-bridge) - middleware used to trigger Branches repo by github labels
- [WP-Desktop Github bridge](https://github.com/Automattic/wp-desktop-gh-bridge) - middleware used to trigger e2e tests to run against wp-desktop by github labels
