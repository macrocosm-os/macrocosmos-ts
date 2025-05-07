# Tips on building this package

## How to check what you're building before you publish

There's a script in [package.json](../package.json) that creates the package as it'll be published and puts it in the root directory. 

```bash
npm run pack
```

Don't commit it! You can remove the stuff from the project root by running

```bash
npm run pack:rm
```

## How to update the package version and git-commit the change in one step

```bash
npm run version patch
```
