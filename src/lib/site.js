/*
  Main-page content. Copied from the v6 prototype (English only).
  Project write-ups and the collection page live in /content as Markdown.
*/

export const site = {
  name: 'Neo Dijkstra',
  version: '1.5.0',
  birthDate: '2006-08-10T00:00:00Z', // drives the live age counter

  /* Intro animation for the first visit of a session; after that every
     reload picks a random one (see src/lib/hero/automata/index.js).
     Add ?ca=lenia (or life, smoothlife, ant, brain, rule22) to the URL to force one. */
  heroAutomaton: 'rule22',

  /* Optional photo behind the hero, drawn dithered onto the pixel grid.
     Import an image here, e.g.
       import heroPhoto from '$lib/images/hero.jpg';  →  heroImage: heroPhoto
     Leave null for the plain grid background. */
  heroImage: null,

  heroLine:
    'I like to design and program systems where many components communicate with each other, and I like to build the hardware the code runs on too.',

  greeting: "Hello! I'm Neo Dijkstra.",
  // {AGE} is replaced by the live counter, {NL} by the underlined "Netherlands"
  introP1: 'I am a {AGE} years old Applications Development student from the {NL}, currently living in Switzerland.',
  aboutP2:
    'I teach myself coding, maths, CAD in Fusion 360, electronics and electromagnetic physics, with the end goal of building my own radio and optical communications company.',
  introP3:
    'I create fullstack applications, hardware, tinker with algorithms, play with radios, and <a href="{PROJECTS}">make stuff</a>.',
  lookingFor:
    'I am currently in the third year of IMS and am looking for a Praktikumsstelle starting August 2027.',

  beforeIms: {
    title: 'Before IMS',
    text: "Before I got into the IMS, I did my secondary-school diploma (Bez-Abschluss) at the Kreisschule Regio Laufenburg, where I was first exposed to programming in the second year, when we had to make a Pong game with Scratch. I really liked the concept of making a program, which also led me to search for an education somewhere in the IT domain. At this point my German wasn't so good yet, but I could already get through school."
  },
  currently: {
    title: 'Currently',
    text: "Now, in the IMS, I've been able to develop a ton of skills, many of which directly helped my other hobbies like electronics. Learning how to program and navigate all the tools relevant for the development of software has made it much easier to do something new. It has also caused me to think differently about problems, and made me be able to go long without giving up on a harder project."
  },

  education: [
    { title: 'IT Specialist EFZ, Application Development', place: 'Alte Kantonsschule Aarau / Berufsfachschule BBB Baden', date: 'August 2023 – Present' },
    { title: 'Kreisschule Regio Laufenburg, District School', place: 'Laufenburg', date: 'April 2021 – June 2023' },
    { title: 'Bezirksschule, Regional Integration School', place: 'Turgi', date: 'August 2020 – April 2021' },
    { title: 'CPR San Hilario de Pointies, Primary & Secondary School', place: 'Comares, Spain', date: 'September 2017 – June 2020' },
    { title: 'EBS Online, Primary School', place: 'Eindhoven, Netherlands', date: 'September 2010 – July 2017' }
  ],

  hobbies: {
    title: 'Outside of code',
    text: "When I'm not programming, I collect old, simple devices that keep working when the infrastructure goes down: oil lamps, surplus Soviet night vision, and military gear for lighting and power.",
    text2: 'On the collection page: my oil lamps, the night vision gear (and the game of tag that started it all), and two army generators.',
    link: 'See the collection'
  },

  skills: {
    title: 'Technical skills',
    langPlatLabel: 'Languages / Platforms',
    langPlat: ['C# — ASP.NET / WinForms / MAUI', 'JavaScript (light TypeScript)', 'Python', 'HTML / XAML', 'CSS', 'SQL / NoSQL'],
    techLabel: 'Technologies',
    tech: ['Docker', 'Git / GitHub Actions', 'Claude Code', 'OpenCode', 'MCPs', 'Ollama', 'OpenClaw']
  },

  // The contact bar shows two columns of three: `left` and `right`.
  // icon: email, pin, github, linkedin, discord, element, matrix (see ContactIcon.svelte)
  // url '#' shows "coming soon"; copy: true shows the text with a copy button.
  contact: {
    left: [
      { icon: 'email', label: 'Email', text: 'neo@dijkstras.net', url: 'mailto:neo@dijkstras.net' },
      { icon: 'github', label: 'GitHub', text: 'github.com/HerrDextro', url: 'https://github.com/HerrDextro' },
      { icon: 'linkedin', label: 'LinkedIn', text: 'neo-dijkstra', url: 'https://www.linkedin.com/in/neo-dijkstra-90770a405' }
    ],
    right: [
      { icon: 'element', label: 'Matrix', text: '@neow:matrix.keinstein0.ch', url: 'https://matrix.to/#/@neow:matrix.keinstein0.ch' },
      { icon: 'discord', label: 'Discord', text: 'herrdextro', copy: true },
      { icon: 'pin', label: 'Location', text: 'Aargau, Switzerland' }
    ]
  },
  // The CV itself goes into static/cv/ (any file name, see the README).
  // This note shows until a PDF is there; after that the tile shows its size.
  cv: { note: 'PDF coming soon' },

  footer: {
    copyright: '© Neo Dijkstra 2026',
    disclaimer: 'This site is under construction: expect bugs, missing content and many “coming soon”s.',
    // keep this in line with the logos in the contact tile
    trademarks:
      'The Element name and logo are registered trade marks of Element Creations Ltd. GitHub, LinkedIn and Discord logos belong to their owners. Their use here does not imply endorsement or affiliation.'
  }
};
