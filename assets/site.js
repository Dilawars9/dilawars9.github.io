(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const theme = document.createElement('button');
  theme.className = 'theme-toggle';
  theme.type = 'button';
  theme.setAttribute('aria-label', 'Dark mode');
  let dark = false;
  try { dark = localStorage.getItem('portfolio-theme') === 'dark'; } catch {}
  function setTheme(value) {
    dark = value;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    theme.textContent = dark ? '☀ Light' : '☾ Dark';
    theme.setAttribute('aria-pressed', String(dark));
    try { localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light'); } catch {}
  }
  theme.addEventListener('click', () => setTheme(!dark));
  document.querySelector('nav').append(theme);
  setTheme(dark);
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('entered');
        observer.unobserve(entry.target);
      }
    }, {threshold: 0.05});
    document.querySelectorAll('.section,.project,.closing').forEach(section => {
      section.classList.add('reveal');
      observer.observe(section);
    });
  }
  const orbital = document.querySelector('.orbital');
  if (orbital) {
    const controls = document.createElement('div');
    controls.className = 'science-controls';
    controls.innerHTML = '<label for="orientation">Explore the illustration <output id="angle">0°</output></label><input id="orientation" type="range" min="-90" max="90" value="0" step="1" aria-label="Illustration orientation in degrees"><p>Rotate the conceptual motif. This is not a molecular simulation.</p>';
    orbital.after(controls);
    const input = controls.querySelector('input');
    input.addEventListener('input', () => {
      orbital.style.setProperty('--rotation', input.value + 'deg');
      controls.querySelector('output').value = input.value + '°';
    });
  }
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);
  function updateProgress() {
    const height = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${height > 0 ? Math.min(1, scrollY / height) : 0})`;
  }
  addEventListener('scroll', updateProgress, {passive:true});
  addEventListener('resize', updateProgress);
  updateProgress();
  const form = document.querySelector('.filters');
  if (!form) return;
  const search = document.querySelector('#search');
  const topic = document.querySelector('#topic');
  const papers = [...document.querySelectorAll('#papers .publication')];
  function filter() {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    for (const paper of papers) {
      const show = paper.textContent.toLocaleLowerCase().includes(query) && (topic.value === 'all' || paper.dataset.topic === topic.value);
      paper.hidden = !show;
      count += Number(show);
    }
    document.querySelector('#result-count').textContent = `${count} of ${papers.length} entries`;
    document.querySelector('#empty').hidden = count !== 0;
  }
  form.hidden = false;
  form.addEventListener('submit', event => event.preventDefault());
  search.addEventListener('input', filter);
  topic.addEventListener('change', filter);
  form.addEventListener('reset', () => { setTimeout(filter, 0); });
})();
