/* =========================================================
   WORKS — edit this list to change the works section.
   image:  path in assets/works/  (or images: [a, b] to show several side by side)
   art:    "blend"  -> white background melts into the page
           "frame"  -> small shadow, for screenshots / photos
   ========================================================= */
const WORKS = [
  {
    title: "Flag Portrait",
    subtitle: "digital painting",
    year: "2026",
    medium: "digital oil",
    for: "personal",
    text: "A grinning face over a hand-drawn flag. Thick, oily strokes, crooked stars and dark red hair falling over everything. Loud on purpose, painted fast and never cleaned up.",
    image: "assets/works/w6.jpg",
    art: "frame",
  },
  {
    title: "Lorem Ipsum",
    subtitle: "crayon poster",
    year: "2026",
    medium: "digital crayon",
    for: "personal",
    text: "A wide open mouth with coloured crayon scribbles instead of teeth, and placeholder text as the punchline. A poster about saying a lot and nothing at all.",
    image: "assets/works/w7.jpg",
    art: "frame",
  },
  {
    title: "Gasoline",
    subtitle: "two-colour print",
    year: "2026",
    medium: "print / red + black",
    for: "personal",
    text: "A study after old petrol-station graphics. Only red and black, heavy stripes, a helmet that is a little too big for its circle. Printed on cheap paper so the ink could bleed and misregister on purpose.",
    image: "assets/works/w1.jpg",
    art: "frame",
  },
  {
    title: "Quiet Face",
    subtitle: "crayon line drawing",
    year: "2026",
    medium: "digital crayon",
    for: "personal",
    text: "One red line, eyes closed. Drawn in a single sitting and left alone afterwards — no cleaning, no second pass. Somewhere between a mask, a saint and a tired man on the metro.",
    image: "assets/works/w2.jpg",
    art: "blend",
  },
  {
    title: "Two Horses",
    subtitle: "dry brush / silhouette",
    year: "2026",
    medium: "digital brush, vector",
    for: "print series",
    text: "Two shapes leaning into each other until they become one animal with eight legs. First as fast, wet black brush strokes, then cut down to a flat silhouette with long stiff legs.",
    images: ["assets/works/w3.jpg", "assets/works/w3b.jpg"],
    art: "blend",
  },
];

/* =========================================================
   CUT-OUT LETTER FONT
   three alphabets cut from the scans:
   cr = crayon, bg = plastic bags, cl = clothes
   ========================================================= */
const SETS = {
  cr: "ABCDEFGHIJKLMNOPQRSTUVWXYZ!?",
  bg: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  cl: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
};
const SET_KEYS = Object.keys(SETS);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function letterSrc(set, ch) {
  const name = { "?": "qmark", "!": "excl" }[ch] || ch;
  return `assets/letters/${set}-${name}.webp`;
}
function setsFor(ch) {
  return SET_KEYS.filter((k) => SETS[k].includes(ch));
}

/* render text as cut-out letters.
   mix: "cr" (one set for all) or "cl bg cr ..." (one set per letter) */
function cutout(el, text, mix, animate = true) {
  const mixes = (mix || "").split(/\s+/).filter(Boolean);
  el.textContent = "";
  let idx = 0;
  text.split(" ").forEach((word) => {
    const w = document.createElement("span");
    w.className = "word";
    [...word.toUpperCase()].forEach((ch) => {
      const options = setsFor(ch);
      if (!options.length) return;
      let set = mixes.length ? mixes[Math.min(idx, mixes.length - 1)] : pick(options);
      if (mixes.length === 1) set = mixes[0];
      if (!options.includes(set)) set = pick(options);
      const img = document.createElement("img");
      img.className = "ltr";
      img.alt = "";
      img.draggable = false;
      img.dataset.set = set;
      img.dataset.ch = ch;
      img.src = letterSrc(set, ch);
      img.style.setProperty("--r", rand(-7, 7).toFixed(1) + "deg");
      img.style.setProperty("--dy", rand(-8, 8).toFixed(0) + "px");
      img.style.setProperty("--s", rand(0.93, 1.05).toFixed(2));
      img.style.setProperty("--d", (idx * 0.07).toFixed(2) + "s");
      if (animate) img.classList.add("in");
      img.addEventListener("click", () => swapLetter(img));
      w.appendChild(img);
      idx++;
    });
    el.appendChild(w);
  });
}

/* clicking a letter swaps it for the same letter from another alphabet */
function swapLetter(img) {
  const ch = img.dataset.ch;
  const others = setsFor(ch).filter((s) => s !== img.dataset.set);
  if (!others.length) return;
  const set = pick(others);
  img.classList.remove("in");
  void img.offsetWidth;
  img.dataset.set = set;
  img.src = letterSrc(set, ch);
  img.style.setProperty("--r", rand(-8, 8).toFixed(1) + "deg");
  img.style.setProperty("--d", "0s");
  img.classList.add("in");
}

function initCutouts(root = document) {
  root.querySelectorAll(".cut[data-cut]").forEach((el) => {
    if (el.dataset.ready) return;
    el.dataset.ready = "1";
    const isCover = el.classList.contains("cover__title");
    if (isCover) {
      cutout(el, el.dataset.cut, el.dataset.mix, true);
      return;
    }
    // section titles drop in when scrolled into view
    cutout(el, el.dataset.cut, el.dataset.mix, false);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll(".ltr").forEach((l) => l.classList.add("in"));
        io.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    io.observe(el);
  });
}

/* =========================================================
   WORKS — one spread per work, straight on the white page:
   text + plaque on the left, the artwork on the right
   ========================================================= */
const pad = (n) => String(n).padStart(2, "0");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const PLAQUES = ["assets/paper/p29.jpg", "assets/paper/p26.jpg", "assets/paper/p21.jpg", "assets/paper/p01.jpg", "assets/paper/p04.jpg"];
const TILTS = [-0.8, 0.6, -0.5, 0.9, -0.6];

function workHTML(w, i) {
  const n = i + 1;
  return `
    <article class="work${i % 2 ? " work--flip" : ""}" id="work-${n}">
      <div class="work__text">
        <p class="pg-num">№ ${pad(n)}</p>
        <h3 class="pg-title">${esc(w.title)}</h3>
        <p class="pg-sub">${esc(w.subtitle)}</p>
        <div class="plaque" style="--plq:url(${PLAQUES[i % PLAQUES.length]});--tilt:${TILTS[i % TILTS.length]}deg">
          <p><b>year</b> ${esc(w.year)}</p>
          <p><b>medium</b> ${esc(w.medium)}</p>
          <p><b>for</b> ${esc(w.for)}</p>
        </div>
        <p class="desc">${esc(w.text)}</p>
      </div>
      <figure class="work__art work__art--${w.art}">
        ${(w.images || [w.image]).length > 1
          ? `<div class="work__set">${w.images.map((src, k) => `<img src="${src}" alt="${esc(w.title)} ${k + 1}" loading="lazy">`).join("")}</div>`
          : `<img src="${w.image}" alt="${esc(w.title)}" loading="lazy">`}
        <figcaption>fig. ${n}</figcaption>
      </figure>
    </article>`;
}

document.getElementById("worksList").innerHTML = WORKS.map(workHTML).join("");

// images shown side by side get widths in proportion to their shape, so they end up the same height
document.querySelectorAll(".work__set img").forEach((img) => {
  const fit = () => { if (img.naturalWidth) img.style.flexGrow = img.naturalWidth / img.naturalHeight; };
  img.complete ? fit() : img.addEventListener("load", fit);
});

/* ---------- go ---------- */
initCutouts();
