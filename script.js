const profileFiles = [
  'benny.json'
];

const grid = document.getElementById('profileGrid');
const loadedProfiles = [];

async function loadAllProfiles() {
  for (const filename of profileFiles) {
    try {
      const response = await fetch(`profiles/${filename}`);
      if (!response.ok) throw new Error('File not found');
      
      const profileData = await response.json();
      loadedProfiles.push(profileData);
      
      const card = createProfileCard(profileData);
      grid.appendChild(card);
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
    }
  }
}

function createProfileCard(profile) {
  const card = document.createElement('div');
  card.className = 'profile-card';
  card.dataset.name = profile.name.toLowerCase();
  card.dataset.type = profile.type.join(' ');

  let imageHTML = profile.image 
    ? `<img src="${profile.image}" alt="${profile.name}" class="profile-img" onerror="this.outerHTML='<div class=\\'profile-img fallback\\'>👤</div>'">`
    : `<div class="profile-img fallback">👤</div>`;

  card.innerHTML = `
    ${imageHTML}
    <button class="profile-link-btn">View Details</button>
    <p class="profile-role">${profile.type.join(', ').replace(/\b\w/g, l => l.toUpperCase())}</p>
  `;
  
  card.querySelector('.profile-link-btn').addEventListener('click', () => openModal(profile));
  return card;
}

const modalOverlay = document.getElementById('profileModal');
const closeModalBtn = document.getElementById('closeModal');

const iconMap = {
  discord: 'fa-brands fa-discord',
  tiktok: 'fa-brands fa-tiktok',
  instagram: 'fa-brands fa-instagram',
  website: 'fa-solid fa-globe',
  spotify_podcast: 'fa-brands fa-spotify',
  spotify_artist: 'fa-brands fa-spotify',
  youtube: 'fa-brands fa-youtube'
};

const displayNames = {
  discord: 'Discord Server',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  website: 'Website',
  spotify_podcast: 'Spotify Podcast',
  spotify_artist: 'Spotify Artist',
  youtube: 'YouTube'
};

function openModal(profile) {
  document.getElementById('modalTitle').textContent = profile.name;
  document.getElementById('modalDesc').textContent = profile.description;
  document.getElementById('modalTags').textContent = profile.type.join(', ').replace(/\b\w/g, l => l.toUpperCase());

  document.getElementById('modalImageContainer').innerHTML = profile.image 
    ? `<img src="${profile.image}" alt="${profile.name}" class="modal-img" onerror="this.outerHTML='<div class=\\'modal-img fallback\\' style=\\'display:flex;align-items:center;justify-content:center;font-size:3rem;background:var(--card-bg);border:2px solid var(--text-primary);\\'>👤</div>'">`
    : `<div class="modal-img fallback" style="display:flex;align-items:center;justify-content:center;font-size:3rem;background:var(--card-bg);border:2px solid var(--text-primary);">👤</div>`;

  const modalSocials = document.getElementById('modalSocials');
  const modalPlatforms = document.getElementById('modalPlatforms');
  modalSocials.innerHTML = ''; 
  modalPlatforms.innerHTML = ''; 

  if (profile.links) {
    if (profile.links.socials) {
      for (const [key, url] of Object.entries(profile.links.socials)) {
        if (url && url.trim() !== "") {
          const iconClass = iconMap[key] || 'fa-solid fa-link';
          const label = displayNames[key] || key;
          modalSocials.innerHTML += `
            <a href="${url}" target="_blank" class="social-link">
              <i class="${iconClass}"></i> <span>${label}</span>
            </a>`;
        }
      }
    }
    
    if (profile.links.platforms) {
      for (const [key, url] of Object.entries(profile.links.platforms)) {
        if (url && url.trim() !== "") {
          const iconClass = iconMap[key] || 'fa-solid fa-link';
          const label = displayNames[key] || key;
          modalPlatforms.innerHTML += `
            <a href="${url}" target="_blank" class="platform-link">
              <i class="${iconClass}"></i>
              <div class="platform-btn">${label}</div>
            </a>`;
        }
      }
    }
  }

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden'; 
}

function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = ''; 
}

closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  document.querySelectorAll('.profile-card').forEach(card => {
    card.style.display = card.dataset.name.includes(query) ? 'flex' : 'none';
  });
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  if(btn.id === 'toggleTheme') return;

  btn.addEventListener('click', () => {
    document.querySelectorAll('#filterContainer .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const filterType = btn.dataset.filter;
    const query = searchInput.value.toLowerCase();
    
    document.querySelectorAll('.profile-card').forEach(card => {
      const cardTypes = card.dataset.type.split(' ');
      let matchesFilter = (filterType === 'all' || cardTypes.includes(filterType));
      let matchesSearch = card.dataset.name.includes(query);
      
      card.style.display = (matchesFilter && matchesSearch) ? 'flex' : 'none';
    });
  });
});

const settingsPanel = document.getElementById('settingsPanel');
document.getElementById('settingsBtn').onclick = () => settingsPanel.classList.toggle('show');

const toggleThemeBtn = document.getElementById('toggleTheme');
const themes = ['light', 'dark', 'blue'];

const applyTheme = (theme) => {
  document.body.classList.remove('dark', 'blue');
  if (theme !== 'light') document.body.classList.add(theme);
  toggleThemeBtn.textContent = `Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`;
};

let currentThemeIndex = 0;
const savedTheme = localStorage.getItem('yeraq_theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme && themes.includes(savedTheme)) {
  currentThemeIndex = themes.indexOf(savedTheme);
  applyTheme(savedTheme);
} else if (systemPrefersDark) {
  currentThemeIndex = 1; 
  applyTheme('dark');
} else {
  applyTheme('light');
}

toggleThemeBtn.onclick = () => {
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  const nextTheme = themes[currentThemeIndex];
  applyTheme(nextTheme);
  localStorage.setItem('yeraq_theme', nextTheme);
};

loadAllProfiles();