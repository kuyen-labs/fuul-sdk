const config = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm',
    [
      '@semantic-release/exec',
      {
        verifyReleaseCmd: `echo '{ "version": "\${nextRelease.version}" }' > ./src/release.json`,
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['dist/**/*.{js,css}', 'package.json'],
        message: 'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}',
      },
    ],
  ],
};

module.exports = config;
