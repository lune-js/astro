const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");

const SECTION_MAP = {
  "Major Changes": "Changed",
  "Minor Changes": "Added",
  "Patch Changes": "Fixed"
};

const SEMVER_HEADING_RE =
  /## (\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?)\n/g;

const CHANGESET_SECTION_HEADING_RE = /### (Major|Minor|Patch) Changes\n/g;

function formatChangelog(content) {
  const date = new Date().toISOString().split("T")[0];
  return content
    .replace(SEMVER_HEADING_RE, (_, version) => `## [${version}] - ${date}\n`)
    .replace(CHANGESET_SECTION_HEADING_RE, (_, type) => `### ${SECTION_MAP[`${type} Changes`]}\n`);
}

const ROOT_CHANGELOG_PATH = path.join(ROOT_DIR, "CHANGELOG.md");
if (fs.existsSync(ROOT_CHANGELOG_PATH)) {
  const content = fs.readFileSync(ROOT_CHANGELOG_PATH, "utf-8");
  const formatted = formatChangelog(content);
  if (formatted !== content) {
    fs.writeFileSync(ROOT_CHANGELOG_PATH, formatted);
  }
}
