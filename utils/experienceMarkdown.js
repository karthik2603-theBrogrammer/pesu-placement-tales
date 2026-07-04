/**
 * Assembles the structured contribute-form answers into a single markdown
 * document. The output mirrors the original experience template so it renders
 * consistently on the browse page (BlockNote markdown renderer).
 *
 * Keeping this pure + isolated means the form only worries about collecting
 * data, and the storage/render format lives in one place.
 */

const trim = (value) => (typeof value === "string" ? value.trim() : "");

/** Renders a labelled bullet only when the value is non-empty. */
function bullet(label, value) {
  const text = trim(value);
  if (!text) return "";
  return `- **${label}:** ${text}\n`;
}

/** Renders a free-text bullet (no label) only when non-empty. */
function line(value) {
  const text = trim(value);
  if (!text) return "";
  return `- ${text}\n`;
}

/** Renders a section only when it has body content. */
function section(heading, body) {
  const text = trim(body);
  if (!text) return "";
  return `## ${heading}\n\n${text}\n`;
}

function buildAbout(about = {}) {
  const body =
    line(about.technical_interests) +
    line(about.background) +
    line(about.hobbies);
  return section("About Me", body);
}

function buildOpinions(opinions = {}) {
  const body =
    bullet("DSA & CP — how necessary?", opinions.dsa_view) +
    bullet("Skills/projects vs DSA", opinions.skills_vs_dsa) +
    bullet("What is a good CGPA?", opinions.good_cgpa);
  return section("Quick Opinions", body);
}

function buildSource(source) {
  if (!trim(source)) return "";
  return section("Placement Source", `- ${trim(source)}\n`);
}

function buildRounds(rounds = []) {
  const validRounds = rounds.filter(
    (round) =>
      trim(round?.description) ||
      trim(round?.questions) ||
      trim(round?.duration) ||
      trim(round?.outcome)
  );

  if (validRounds.length === 0) return "";

  const body = validRounds
    .map((round, index) => {
      const details =
        bullet("Description", round.description) +
        bullet("Key questions", round.questions) +
        bullet("Duration", round.duration) +
        bullet("Outcome", round.outcome);

      const indented = details
        .split("\n")
        .filter(Boolean)
        .map((row) => `  ${row}`)
        .join("\n");

      return `- **Round ${index + 1}**\n${indented}`;
    })
    .join("\n");

  return section("Interview Experience", body);
}

function buildCompensation(comp = {}) {
  const body =
    bullet("Internship stipend", comp.internship_stipend) +
    bullet("Base salary", comp.base_salary) +
    bullet("Total CTC", comp.total_ctc) +
    bullet("Stocks", comp.stocks) +
    bullet("Bonuses", comp.bonuses) +
    bullet("Other benefits", comp.other_benefits);
  return section("Compensation", body);
}

function buildDates(dates = {}) {
  const body =
    bullet("Company arrival", dates.arrival) +
    bullet("Online test", dates.online_test) +
    bullet("Interview", dates.interview) +
    bullet("Placement", dates.placement);
  return section("Key Dates", body);
}

function buildResources(resources = {}) {
  const body =
    bullet("Books", resources.books) +
    bullet("Websites", resources.websites) +
    bullet("Courses", resources.courses) +
    bullet("Practice platforms", resources.platforms) +
    bullet("Others", resources.others);
  return section("Helpful Resources", body);
}

function buildTips(tips) {
  if (!trim(tips)) return "";
  return section("Tips For The Next Batch", `- ${trim(tips)}\n`);
}

function buildRole(jobTitle) {
  if (!trim(jobTitle)) return "";
  return section("Role", `- ${trim(jobTitle)}\n`);
}

/**
 * @param {object} answers - structured contribute answers
 * @param {string} companyName - resolved company name for the title
 * @returns {string} markdown document
 */
export function buildExperienceMarkdown(answers = {}, companyName = "") {
  const jobTitle = trim(answers.person?.job_title);
  const title = companyName
    ? jobTitle
      ? `# Interview & Offer — ${companyName} · ${jobTitle}`
      : `# Interview & Offer — ${companyName}`
    : "# Interview & Offer Experience";

  const sections = [
    buildRole(jobTitle),
    buildAbout(answers.about),
    buildOpinions(answers.opinions),
    buildSource(answers.source),
    buildRounds(answers.rounds),
    buildCompensation(answers.compensation),
    buildDates(answers.dates),
    buildResources(answers.resources),
    buildTips(answers.tips),
  ].filter(Boolean);

  return [title, ...sections].join("\n").trim() + "\n";
}
