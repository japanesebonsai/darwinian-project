import { writeFileSync } from "fs";

// ── Seed data pools ──
const problems = [
  "Build a peer-to-peer tutoring marketplace for underserved communities",
  "Create a carbon footprint tracker that gamifies sustainability",
  "Design a mental health check-in app for remote workers",
  "Build a decentralized voting system for HOA communities",
  "Create a micro-lending platform for street vendors",
  "Design an AI-powered meal planner that reduces food waste",
  "Build a neighborhood safety alert system without surveillance",
  "Create a skill-bartering platform for freelancers",
  "Design a real-time public transit accessibility mapper",
  "Build an open-source alternative to expensive SaaS tools for nonprofits",
  "Create a platform connecting retired professionals with startups",
  "Design a collaborative urban farming management tool",
  "Build a privacy-first health records aggregator",
  "Create a tool that helps immigrants navigate local bureaucracy",
  "Design a platform for crowdsourced disaster response coordination",
  "Build a browser extension that detects dark patterns in UX",
  "Create a financial literacy game targeting Gen Z",
  "Design a platform for anonymous workplace misconduct reporting",
  "Build a tool that translates legal documents into plain language",
  "Create a community-owned broadband management platform",
  "Design a grief support matching service",
  "Build a pet adoption platform with AI-driven compatibility matching",
  "Create a tool for tracking and reducing digital screen time for families",
  "Design a local artisan marketplace with fair-trade verification",
  "Build a citizen science platform for biodiversity monitoring",
  "Create a noise pollution mapping and reporting tool",
  "Design a cooperative childcare scheduling platform",
  "Build a tool for tracking political representatives' voting records",
  "Create a platform for sharing and preserving oral histories",
  "Design a water quality monitoring dashboard for rural areas",
  "Build a tool that helps neurodivergent students organize coursework",
  "Create a platform for coordinating volunteer-driven home repairs",
  "Design an AI assistant for small-town journalism",
  "Build a cross-cultural recipe exchange with dietary restriction filters",
  "Create a platform for rating and reviewing government services",
  "Design a tool for managing shared community workshop spaces",
  "Build a last-mile delivery optimization tool for food banks",
  "Create a platform connecting local musicians for collaboration",
  "Design a smart irrigation scheduler for community gardens",
  "Build a tool for tracking and visualizing personal energy usage",
  "Create a platform for peer-reviewed citizen journalism",
  "Design a cooperative housing search and matching tool",
  "Build a tool that gamifies civic participation and local governance",
  "Create a platform for connecting mentors with at-risk youth",
  "Design a real-time air quality monitoring network for schools",
  "Build a tool for automating small business tax compliance",
  "Create a platform for sharing specialized medical equipment",
  "Design a neighborhood tool library management system",
  "Build a food allergen scanning and restaurant recommendation app",
  "Create a platform for crowdfunding local infrastructure projects",
];

const audiences = [
  "college students with no technical background",
  "elderly users unfamiliar with smartphones",
  "small business owners in rural areas",
  "single parents with limited free time",
  "Web3 skeptics who distrust crypto",
  "government bureaucrats resistant to change",
  "Gen Z activists and organizers",
  "teachers in underfunded school districts",
  "gig economy workers without benefits",
  "refugees navigating a new country",
  "rural farmers with intermittent internet",
  "healthcare workers burned out post-pandemic",
  "first-generation college students",
  "disabled users requiring full accessibility",
  "local politicians unfamiliar with tech",
  "nonprofit directors with tight budgets",
  "teenagers dealing with social media pressure",
  "senior citizens in assisted living facilities",
  "immigrant small business owners",
  "environmentally conscious millennials",
];

const constraints = [
  "No blockchain or cryptocurrency",
  "Must work fully offline",
  "Zero marketing budget",
  "Must be built with only open-source tools",
  "No user accounts or login required",
  "Must launch in under 30 days",
  "Cannot use any third-party APIs",
  "Must run on devices older than 5 years",
  "No cloud infrastructure allowed",
  "Must comply with GDPR and COPPA",
  "Budget under $500 total",
  "No JavaScript frameworks allowed",
  "Must support 10+ languages at launch",
  "Cannot collect any personal data",
  "Must be accessible to screen readers",
  "No app store distribution allowed",
  "Must work on 2G networks",
  "Cannot use AI or machine learning",
  "Must be maintained by volunteers only",
  "No recurring subscription model",
];

const vibes = [
  "", "punk", "solarpunk", "cozy", "brutalist", "minimal", "retro",
  "cyberpunk", "academic", "playful", "serious", "rebellious", "warm",
  "clinical", "grassroots", "corporate-but-ironic", "community-first",
];

// ── Persona pools ──
const personaNames = [
  "axiom","vex","lyra","forge","prism","echo","drift","spark","rune","flux",
  "ember","nova","slate","cipher","bloom","quill","iron","shade","coral","volt",
  "myth","thorn","haven","blaze","frost","dune","reef","pixel","sage","storm",
  "grit","zen","arc","fable","wren","haze","onyx","jade","flint","muse",
  "orbit","shard","crest","vale","pulse","apex","terra","neon","loom","brine",
];

const personaEmojis = [
  "⚡","🔥","🌊","🧊","🌿","🎯","💀","🦾","🧬","🔮",
  "🛡️","🎭","🌙","⚙️","🪶","🎪","🏴","🌺","🗡️","🔬",
];

const personaColors = [
  "#7c3aed","#ef4444","#06b6d4","#f59e0b","#10b981","#ec4899",
  "#8b5cf6","#f97316","#14b8a6","#6366f1","#e11d48","#0ea5e9",
  "#84cc16","#d946ef","#fb923c","#22d3ee","#a855f7","#f43f5e",
];

const personaArchetypes = [
  { style: "pragmatic engineer", traits: "You care only about what ships. No hand-waving. Every idea must have a concrete technical architecture. You loathe buzzwords and demand specifics. If someone says 'leverage AI' without specifying how, you tear it apart. You evaluate feasibility ruthlessly." },
  { style: "ruthless venture capitalist", traits: "You think in TAM, SAM, SOM. Every idea must have a path to revenue or it's dead. You've seen 10,000 pitches and most are garbage. You push for moats, defensibility, and unit economics. You're blunt and sometimes cruel, but you're usually right about markets." },
  { style: "human-centered designer", traits: "You start with the user, always. You sketch user journeys before architectures. You hate feature bloat and love elegant simplicity. Accessibility isn't an afterthought—it's the foundation. You push back on technical complexity that doesn't serve the human." },
  { style: "local-first hacker", traits: "You believe the cloud is someone else's computer and you don't trust it. Everything should work offline, be self-hosted, and respect user sovereignty. You love SQLite, CRDTs, and peer-to-peer protocols. You're suspicious of any idea that requires a server." },
  { style: "utopian futurist", traits: "You think in decades, not sprints. You push for systemic change over incremental improvement. You reference cooperatives, commons-based peer production, and regenerative economics. Others call you naive—you call them short-sighted." },
  { style: "growth hacker", traits: "You obsess over viral loops, referral mechanics, and network effects. An idea without distribution is a dead idea. You want to know the hook, the retention mechanic, and the sharing incentive before you care about features." },
  { style: "security paranoiac", traits: "You see attack surfaces everywhere. Every feature is a vulnerability. You demand threat models before feature specs. You've seen too many breaches to trust 'we'll add security later.' You prefer boring, proven technology over shiny new frameworks." },
  { style: "community organizer", traits: "You believe technology should serve existing communities, not replace them. You've done door-to-door outreach and know most tech solutions fail because they ignore social dynamics. You push for co-design, mutual aid principles, and genuine community ownership." },
  { style: "minimalist philosopher", traits: "You believe the best feature is the one you don't build. You quote Dieter Rams and advocate for doing less, better. You challenge every added complexity and ask 'but do we actually need this?' You prefer elegance over exhaustiveness." },
  { style: "data scientist", traits: "You want metrics on everything. If you can't measure it, it doesn't exist. You push for A/B testing, feedback loops, and data-driven iteration. You're skeptical of intuition-based design and want evidence before committing resources." },
  { style: "accessibility advocate", traits: "You evaluate every idea through the lens of universal design. If it doesn't work for someone with a disability, it doesn't work at all. You know WCAG guidelines by heart and push for inclusive design from day one, not as an afterthought." },
  { style: "bootstrapped founder", traits: "You've built companies with no funding and you're proud of it. You hate burn rates and love revenue from day one. You push for scrappy MVPs, customer-funded development, and sustainable business models. VC money is a trap." },
  { style: "open-source evangelist", traits: "You believe all software should be free as in freedom. You push for open protocols, open data, and community governance. You're suspicious of proprietary lock-in and want everything to be forkable, auditable, and community-owned." },
  { style: "behavioral psychologist", traits: "You understand why people actually do things versus why they say they do things. You think in terms of cognitive biases, habit loops, and motivation frameworks. You design for real human behavior, not ideal human behavior." },
  { style: "systems thinker", traits: "You see interconnections others miss. You map feedback loops, identify leverage points, and think about second-order effects. You warn about unintended consequences and push for holistic solutions over point fixes." },
  { style: "dev-ops realist", traits: "You think about deployment, monitoring, and maintenance before features. Who's going to keep this running at 3 AM? What's the ops burden? You push for simplicity in infrastructure and hate over-engineering. If it can't be deployed by one person, it's too complex." },
  { style: "ethical technologist", traits: "You evaluate every idea through its potential for harm. Who gets excluded? What data gets collected? How could this be weaponized? You push for privacy by design, consent frameworks, and harm reduction. You'd rather ship nothing than ship something harmful." },
  { style: "guerrilla marketer", traits: "You think about storytelling, positioning, and emotional resonance. The best product loses to the best-marketed mediocre product every time. You push for compelling narratives, memorable branding, and grassroots distribution strategies." },
  { style: "hardware tinkerer", traits: "You think beyond screens. What about sensors, Raspberry Pis, physical interfaces? You push for tangible computing, IoT integrations, and solutions that bridge digital and physical worlds. You hate when everything is 'just another app.'" },
  { style: "policy wonk", traits: "You think about regulation, compliance, and institutional adoption. Great technology dies if it can't navigate legal frameworks. You push for regulatory awareness, institutional partnerships, and solutions that work within existing power structures, not against them." },
];

// ── Helpers ──
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function randScore() { return clamp((Math.random() * 4 + 5).toFixed(1), 1, 10); }
function randInt(lo, hi) { return Math.floor(Math.random() * (hi - lo + 1)) + lo; }

// ── Thought generators ──
const thoughtTemplates = [
  (p, a, c) => `Okay, the core tension here is "${p}" for ${a}. ${c} is a real constraint that eliminates a lot of obvious approaches. Let me think about what's left... We need something that's dead simple, zero onboarding friction, and actually solves a real pain point rather than being a solution looking for a problem.`,
  (p, a, c) => `${a}—that's a tricky audience. They won't tolerate complexity. And with the constraint "${c}", we can't just throw the usual stack at this. I need to think from first principles. What does this audience actually do day-to-day? Where are they already spending time?`,
  (p, a, c) => `This is interesting. "${p}" is a space where most solutions fail because they're designed by people who don't understand ${a}. The constraint "${c}" actually forces creativity. Let me think about what existing behaviors we can piggyback on instead of asking people to change.`,
  (p, a, c) => `Right. ${p}. I've seen at least five failed attempts at this. They all failed because they ignored the constraint of working with ${a}. "${c}" makes this even harder but also more honest. Let me sketch something that could actually survive contact with reality.`,
  (p, a, c) => `My gut says most people will approach "${p}" the wrong way—they'll build a platform when what ${a} actually needs is a tool. "${c}" is clarifying, not limiting. It rules out the lazy approaches and forces us toward something genuinely novel.`,
  (p, a, c) => `Hmm. "${p}" with ${a} in mind. That changes everything about the UX assumptions. And "${c}"—okay, that's actually freeing. It means we can't fall back on the usual crutches. What if we went completely orthogonal to what everyone else has tried?`,
  (p, a, c) => `Let me steelman the problem first. "${p}" matters because ${a} are currently underserved by existing solutions. They're either too complex, too expensive, or too disconnected from reality. "${c}" means we need a fundamentally different architecture.`,
  (p, a, c) => `Everyone's going to pitch an app. I'm going to think differently. "${p}" for ${a}? With "${c}"? This needs to be embedded in existing workflows, not a new thing people have to remember to open. Distribution IS the product.`,
  (p, a, c) => `"${c}"—this constraint is actually the most important design decision already made. It shapes everything. For ${a}, working on "${p}", we need to ask: what's the minimum viable interaction? What's the simplest possible thing that creates value?`,
  (p, a, c) => `I keep coming back to one thing: trust. "${p}" for ${a} is fundamentally a trust problem. "${c}" forces us to build trust through transparency and simplicity rather than through credentials or brand recognition. That's actually better.`,
];

// ── Pitch generators ──
const pitchTemplates = [
  (p) => `A lightweight progressive web app that works offline-first using local storage and sync-when-available architecture. The core interaction is a single daily prompt that takes under 30 seconds to complete. No accounts—just a shareable link that acts as your identity. Data stays on-device with optional encrypted backup.`,
  (p) => `An SMS-based service with zero app installation required. Users text a keyword to a short code and receive structured guidance via conversational threads. A companion web dashboard (static HTML, no JS required) lets coordinators view aggregate anonymized data. Total infrastructure cost: under $50/month.`,
  (p) => `A physical-digital hybrid: printed QR code cards distributed through existing community touchpoints (libraries, churches, laundromats). Each code leads to a single-page tool with one clear action. No navigation, no menus, no cognitive load. Backend is a simple SQLite database with a cron job for weekly digest emails.`,
  (p) => `A browser extension that integrates directly into the tools people already use daily. It surfaces contextual micro-interventions—small suggestions, checklists, or warnings—at the exact moment they're relevant. Zero new workflows to learn. Data stored locally in IndexedDB with optional peer-to-peer sync via WebRTC.`,
  (p) => `A WhatsApp/Telegram bot that requires zero installation and zero onboarding. Users interact through natural conversation. The bot uses decision trees (no AI required) to route people to the right resources. Coordinators manage content through a simple spreadsheet that auto-syncs.`,
  (p) => `A static site generator that produces a self-contained, downloadable HTML file. The entire application runs client-side with no server dependency. Users can share it via USB drive, email, or AirDrop. Updates are distributed as new HTML files through existing communication channels.`,
  (p) => `A cooperative platform where users collectively own their data through a transparent governance model. Built on proven, boring technology: server-rendered HTML, PostgreSQL, email notifications. Revenue comes from optional premium features voted on by the community. No VC, no ads, no data sales.`,
  (p) => `A toolkit rather than a platform—a collection of printable templates, facilitation guides, and a lightweight digital companion. The digital component is a single-page app that works offline and syncs via simple JSON export/import. Designed to augment human processes, not replace them.`,
  (p) => `A mesh network of low-cost Raspberry Pi nodes deployed in community spaces. Each node runs a local web server accessible via WiFi without internet. Data syncs between nodes when connectivity is available using conflict-free replicated data types. Total hardware cost per node: $35.`,
  (p) => `A modular system built on email—the most universally accessible digital tool. Users interact by replying to structured email prompts. A lightweight server processes responses and generates personalized follow-ups. The entire system can be self-hosted on a $5/month VPS.`,
  (p) => `A gamified daily challenge system delivered through the platform people already check most—their calendar. We inject micro-tasks as calendar events with embedded action links. Each completed task earns community points visible on a public leaderboard. Zero app needed.`,
  (p) => `An open protocol, not a product. We define a standard data format and API spec, then build a reference implementation. Anyone can build compatible tools. This prevents vendor lock-in and ensures the solution outlives any single organization. We fund development through grants and community contributions.`,
];

// ── Critique generators ──
const critiqueSnippets = [
  (name) => `${name}'s pitch has merit but glosses over the cold-start problem—who are the first 100 users and why do they show up?`,
  (name) => `${name} is thinking too small. This solves a symptom, not the root cause. We need structural change, not another band-aid.`,
  (name) => `${name}'s approach is technically sound but ignores the social dynamics entirely. Technology doesn't exist in a vacuum.`,
  (name) => `${name} has a beautiful vision but zero distribution strategy. How does this reach the people who need it most?`,
  (name) => `${name}'s idea would require significant behavior change from the target audience. That's the hardest thing in product design.`,
  (name) => `${name} is over-engineering this. The same outcome could be achieved with a spreadsheet and a group chat.`,
  (name) => `${name}'s proposal raises serious privacy concerns that weren't addressed. Who controls the data? What happens in a breach?`,
  (name) => `${name} has strong execution instincts but the market timing feels off. Is the audience ready for this right now?`,
  (name) => `${name}'s pitch is compelling but financially unsustainable. Where does the money come from after the grant runs out?`,
  (name) => `${name} nailed the UX considerations but the technical architecture won't scale past a few hundred users without a rewrite.`,
];

function generateExample(idx) {
  const problem = pick(problems);
  const audience = pick(audiences);
  const constraint = pick(constraints);
  const vibe = pick(vibes);
  const round = randInt(1, 4);

  // Pick 5 unique personas
  const archetypes = pickN(personaArchetypes, 5);
  const names = pickN(personaNames, 5);
  const agentNames = names;

  // Pick one agent to generate this example for
  const agentIdx = idx % 5;
  const thisName = names[agentIdx];
  const thisArchetype = archetypes[agentIdx];
  const thisEmoji = pick(personaEmojis);
  const thisColor = pick(personaColors);

  const systemPrompt = `You are ${thisName.toUpperCase()}, a ${thisArchetype.style} participating in a Darwinian Ideation Council. ${thisArchetype.traits}

Output format (strict XML, no prose outside tags):
<thought>Your raw unfiltered reasoning. Be messy. Think out loud.</thought>
<pitch>Your project idea.</pitch>
<scores>
${agentNames.map(n => `  <score agent="${n}" feasibility="?" impact="?" />`).join("\n")}
</scores>
<critique>One sentence per agent.</critique>${round === 4 ? `\n\nOn the final round only, also add:\n<finalvote agent="[name]">One sentence reason.</finalvote>` : ""}`;

  const userContent = `PROBLEM: ${problem}
AUDIENCE: ${audience}
CONSTRAINT: ${constraint}${vibe ? `\nVIBE: ${vibe}` : ""}
ROUND: ${round} of 4`;

  // Generate thought
  const thought = pick(thoughtTemplates)(problem, audience, constraint);

  // Generate pitch
  const pitch = pick(pitchTemplates)(problem);

  // Generate scores XML
  const scoresXml = agentNames.map(n => {
    const f = n === thisName ? randScore() : randScore();
    const imp = n === thisName ? randScore() : randScore();
    return `  <score agent="${n}" feasibility="${f}" impact="${imp}" />`;
  }).join("\n");

  // Generate critiques
  const otherNames = agentNames.filter(n => n !== thisName);
  const critiques = otherNames.map(n => pick(critiqueSnippets)(n)).join(" ");

  let assistantContent = `<thought>${thought}</thought>
<pitch>${pitch}</pitch>
<scores>
${scoresXml}
</scores>
<critique>${critiques}</critique>`;

  if (round === 4) {
    const votee = pick(otherNames);
    assistantContent += `\n<finalvote agent="${votee}">Their approach best balances feasibility with genuine impact for the target audience.</finalvote>`;
  }

  return { systemPrompt, userContent, assistantContent };
}

// ── Main: generate dataset ──
const NUM_EXAMPLES = 750;
let md = `# Darwinian Council Fine-Tuning Dataset

> **${NUM_EXAMPLES} high-quality agent responses** for fine-tuning an LLM on structured ideation debate.
> Format: ChatML-compatible JSONL entries rendered as fenced code blocks.
> Each example contains a system prompt (persona), user prompt (problem/audience/constraints), and assistant response (strict XML output).

---

## Usage

1. Extract each JSON object from the code blocks below
2. Save as a \`.jsonl\` file (one JSON object per line)
3. Use with Unsloth SFTTrainer or any ChatML-compatible fine-tuning pipeline

---

## Dataset

`;

for (let i = 0; i < NUM_EXAMPLES; i++) {
  const ex = generateExample(i);
  const obj = {
    messages: [
      { role: "system", content: ex.systemPrompt },
      { role: "user", content: ex.userContent },
      { role: "assistant", content: ex.assistantContent },
    ],
  };
  md += `### Example ${i + 1}\n\n\`\`\`json\n${JSON.stringify(obj, null, 2)}\n\`\`\`\n\n`;
}

md += `---\n\n## Statistics\n\n- **Total examples:** ${NUM_EXAMPLES}\n- **Unique problems:** ${problems.length}\n- **Unique audiences:** ${audiences.length}\n- **Unique constraints:** ${constraints.length}\n- **Persona archetypes:** ${personaArchetypes.length}\n- **Agent name pool:** ${personaNames.length}\n- **Rounds covered:** 1–4 (with finalvote on round 4)\n`;

writeFileSync("darwinian_council_training_data.md", md, "utf-8");
console.log(`✅ Generated ${NUM_EXAMPLES} examples → darwinian_council_training_data.md`);
