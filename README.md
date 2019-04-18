# mSupply Mobile

A user friendly, offline-first mobile app for use with [mSupply](http://msupply.org.nz). Provides electronic inventory control for medical stock. Designed and built by [Sustainable Solutions](http://sussol.net) for use in developing countries, the app is now open source and free to use. Hello

### Features

- Receiving and issuing goods with automatic inventory adjustments
- Stocktaking
- Forecasts of required stock based on usage
- Ordering stock from suppliers
- Viewing stock on hand
- Syncs with an mSupply server when internet is available

See http://msupply.org.nz/mobile for a detailed description of these and other features

### Building from Source

See the instructions on the [setup page](https://github.com/sussol/mobile/wiki/Setup#building-from-source)

### Use with an mSupply Server

Instructions on the [setup page](https://github.com/sussol/mobile/wiki/Setup#setting-up-msupply-server)

### Set Up for Development

Instructions on the [setup page](https://github.com/sussol/mobile/wiki/Setup)

### Contribute

As an open source software project, we welcome contributions from external developers.

1. Find a bug or feature you'd like to work on from the [issues page](https://github.com/sussol/mobile/issues), or submit your own
2. Comment on the issue to indicate you're going to work on it, and follow up with progress and/or questions
3. Read the [documentation](https://github.com/sussol/mobile/wiki/Code-Design) - at least the coding conventions as well as any areas you are working around
4. Fork the repository
5. Set up your development environment using [our instructions](https://github.com/sussol/mobile/wiki/Setup)
6. Code
7. Make a pull request ensuring you have

- Made it to the appropriate branch
- Adhered to our conventions/style
- Respected module boundaries
- Tested that your additions work and haven't caused regressions

8. We'll review the PR and merge it if it adds value for a general use case (not just one user)
9. Sit back and enjoy the warm glow :-)

#### Branch Structure

We are using the [GitFlow](https://datasift.github.io/gitflow/IntroducingGitFlow.html) approach to branch/feature management.
**Branches:**

- master: This branch represents the current release. Generally don't branch off it unless for a hotfix. Release branches and hotfixs are PRed here.
- development: Branch off/PR into this branch if making new features. This is the dirty edge of the app.
- release branches: e.g. "2.1.0" release branches will be made from development branch. This effectively locks down the feature set of the release. When thoroughly tested and bug fixed, this will be merged into master with tag of the release. Release release candidates should be made from this branch (e.g. 2.1.0-rc10)
