const views = [...document.querySelectorAll('[data-view]')];
const routeLinks = [...document.querySelectorAll('[data-route]')];
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.main-nav');
const projectRows = [...document.querySelectorAll('[data-project]')];
let openProjectItem = null;

const projects = {
  utopia: {
    title: 'Utopia / Dystopia',
    kicker: 'Furniture, lighting / 2026',
    slides: [
      { type: 'image', src: 'Projekte/Utopia Dystopia/Raumund Licht - Bench (3).jpg', alt: 'Curved fur-covered bench' },
      { type: 'image', src: 'Projekte/Utopia Dystopia/Raumund Licht - bench and person.jpg', alt: 'Circular fur-covered bench with a person sitting on it' },
      { type: 'image', src: 'Projekte/Utopia Dystopia/Raumund Licht - Bench (2).jpg', alt: 'Curved fur-covered bench detail' },
      { type: 'image', src: 'Projekte/Utopia Dystopia/Raumund Licht - Bench (1).jpg', alt: 'Curved fur-covered bench in a room' },
      { type: 'image', src: 'Projekte/Utopia Dystopia/Raumund Licht - Lamp (3).jpg', alt: 'Standing lamp with translucent shade' },
      { type: 'image', src: 'Projekte/Utopia Dystopia/Raumund Licht - Lamp (2).jpg', alt: 'Standing lamp detail' }
    ],
    description: [
      'The spatial concept developed by Studio Raumund Licht is built around a modular system of benches, allowing for changing configurations from individual seating to larger spatial compositions.',
      'Each bench combines cool, industrial aluminium profiles with a soft organic fur surface. Concealed construction details keep the form visually reduced, creating a clear and minimal object language.',
      'The standing lamp continues the material and formal language of the modular benches, using the same aluminium profiles in its stand. A translucent polypropylene sheet forms the shade, diffusing the light into a soft, ghostly glow, while graphics by Daryn Roongrawewan give its surface a distinctive visual texture.'
    ]
  },
  bubble: {
    title: 'Bubble Station',
    kicker: 'Spatial installation / 2026',
    slides: [{ type: 'video', src: 'Projekte/Bubble Station/bubble station flyover.mp4', poster: 'Projekte/Utopia Dystopia/Raumund Licht - bench and person.jpg' }],
    description: ['Bubble Station is a spatial installation exploring movement, scale and the temporary architecture of encounter.']
  }
};

function renderSlide(projectId, projectItem, slideIndex) {
  const project = projects[projectId];
  const slide = project.slides[slideIndex];
  const mediaStage = projectItem.querySelector('.inline-media-stage');
  const counter = projectItem.querySelector('.inline-counter');
  const thumb = projectItem.querySelector('.project-thumb');
  const currentMedia = thumb.querySelector('img, video');
  const mediaTag = slide.type === 'video' ? 'VIDEO' : 'IMG';
  if (currentMedia.tagName !== mediaTag) {
    const replacement = document.createElement(slide.type === 'video' ? 'video' : 'img');
    currentMedia.replaceWith(replacement);
  }
  const media = thumb.querySelector('img, video');
  media.src = slide.src;
  if (slide.type === 'video') {
    media.autoplay = true;
    media.muted = true;
    media.loop = true;
    media.playsInline = true;
    media.poster = slide.poster;
    media.controls = false;
  } else {
    media.alt = slide.alt;
  }
  if (thumb.parentElement !== mediaStage) mediaStage.appendChild(thumb);
  counter.textContent = `${String(slideIndex + 1).padStart(2, '0')} / ${String(project.slides.length).padStart(2, '0')}`;
  projectItem.querySelector('.media-prev').disabled = project.slides.length < 2;
  projectItem.querySelector('.media-next').disabled = project.slides.length < 2;
}

function openProject(projectId, projectItem) {
  const project = projects[projectId];
  if (!project) return;
  if (openProjectItem && openProjectItem !== projectItem) closeProject(openProjectItem);
  const row = projectItem.querySelector('.project-row');
  const details = projectItem.querySelector('.project-inline');
  const isOpen = !details.hidden;
  if (isOpen) {
    closeProject(projectItem);
    return;
  }
  const description = projectItem.querySelector('.inline-description');
  description.innerHTML = project.description.map((paragraph) => `<p>${paragraph}</p>`).join('');
  details.hidden = false;
  row.setAttribute('aria-expanded', 'true');
  projectItem.classList.add('is-open');
  projectItem.querySelector('.project-thumb').classList.add('is-expanded-media');
  openProjectItem = projectItem;
  projectItem.dataset.slide = '0';
  renderSlide(projectId, projectItem, 0);
  window.location.hash = `project-${projectId}`;
  projectItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeProject(projectItem) {
  if (!projectItem) return;
  projectItem.querySelector('.project-inline').hidden = true;
  projectItem.querySelector('.project-row').setAttribute('aria-expanded', 'false');
  const thumb = projectItem.querySelector('.project-thumb');
  thumb.classList.remove('is-expanded-media');
  projectItem.querySelector('.project-row').appendChild(thumb);
  projectItem.classList.remove('is-open');
  projectItem.querySelector('.inline-media-stage').innerHTML = '';
  if (openProjectItem === projectItem) openProjectItem = null;
  if (window.location.hash.startsWith('#project-')) window.location.hash = '#projects';
}

function showRoute() {
  const route = window.location.hash.replace('#', '').split('-')[0] || 'projects';
  const activeRoute = ['projects', 'about', 'contact'].includes(route) ? route : 'projects';
  views.forEach((view) => { view.hidden = view.dataset.view !== activeRoute; });
  routeLinks.forEach((link) => { link.classList.toggle('active', link.dataset.route === activeRoute); });
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  if (!window.location.hash.startsWith('#project-') && openProjectItem) closeProject(openProjectItem);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

menuButton.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
projectRows.forEach((row) => row.addEventListener('click', (event) => {
  event.preventDefault();
  openProject(row.dataset.project, row.closest('.project-item'));
}));
document.querySelectorAll('.project-item').forEach((item) => {
  item.addEventListener('click', (event) => {
    if (!item.classList.contains('is-open') || event.target.closest('.media-button') || event.target.closest('.project-row')) return;
    closeProject(item);
  });
  item.querySelector('.media-prev').addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const project = projects[item.dataset.projectItem];
    const currentSlide = Number(item.dataset.slide || 0);
    const nextSlide = (currentSlide - 1 + project.slides.length) % project.slides.length;
    item.dataset.slide = String(nextSlide);
    renderSlide(item.dataset.projectItem, item, nextSlide);
  });
  item.querySelector('.media-next').addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const project = projects[item.dataset.projectItem];
    const currentSlide = Number(item.dataset.slide || 0);
    const nextSlide = (currentSlide + 1) % project.slides.length;
    item.dataset.slide = String(nextSlide);
    renderSlide(item.dataset.projectItem, item, nextSlide);
  });
});
document.addEventListener('keydown', (event) => {
  if (!openProjectItem) return;
  if (event.key === 'Escape') closeProject(openProjectItem);
  if (event.key === 'ArrowLeft') openProjectItem.querySelector('.media-prev').click();
  if (event.key === 'ArrowRight') openProjectItem.querySelector('.media-next').click();
});
window.addEventListener('hashchange', showRoute);
showRoute();
