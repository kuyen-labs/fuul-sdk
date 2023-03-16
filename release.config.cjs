const config = {
    branches: ['master'],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        "@semantic-release/npm",
        ["@semantic-release/git", {
            "assets": ["lib/**/*.{js,css}", "package.json"],
            "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
        }]
    ]
};

module.exports = config;