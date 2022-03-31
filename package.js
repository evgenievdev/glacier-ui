// Information about this package:
Package.describe({
  // Short two-sentence summary
  summary: 'Lightweight, modular, responsive, front-end framework',
  // Version number
  version: '0.0.1',
  // Optional, default is package directory name
  name: 'iel1g13:glacier-ui',
  // Optional GitHub URL to your source repository
  git: 'https://github.com/evgenievdev/glacier-ui.git'
});

// This defines your actual package:
Package.onUse((api) => {
  // If no version is specified for an `api.use` dependency, use the one defined
  // in Meteor 1.4.3.1.
  api.versionsFrom('1.4.3.1');
  // Specify the source code for the package.
  api.addFiles('dist/glacier.min.js', 'client');
});
