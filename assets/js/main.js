const areas = {
  mariabad: { name: 'Mariabad', subtitle: 'Southeastern Quetta', color: '#1D9E75', sites: ['Site 1', 'Site 2', 'Site 3'] },
  hazaratown: { name: 'Hazara Town', subtitle: 'Western Quetta', color: '#7F77DD', sites: ['Site 4', 'Site 5', 'Site 6'] },
  central: { name: 'Central zones', subtitle: 'Mixed-population urban areas', color: '#D85A30', sites: ['Site 7', 'Site 8', 'Site 9', 'Site 10'] }
}

let map = null

function openArea(id) {
  const a = areas[id]
  document.getElementById('area-title').textContent = a.name
  document.getElementById('area-subtitle').textContent = a.subtitle
  renderGallery(a)
  document.querySelectorAll('.subtab').forEach((t, i) => t.classList.toggle('active', i === 0))
  document.querySelectorAll('.subpage').forEach((p, i) => p.classList.toggle('active', i === 0))
  goPage('area')
}

function renderGallery(a) {
  const gallery = document.getElementById('photo-gallery')
  gallery.innerHTML = ''
  a.sites.forEach((s, index) => {
    const item = document.createElement('div')
    item.className = 'gallery-item'

    const imgSrc = (a.name === 'Mariabad' && index === 0)
      ? '<img src="assets/img/panoramic-1.jpg" alt="Site 1 panorama, Mariabad"/>'
      : `<span style="color:#999;font-size:13px">[ Panoramic photo — ${s} ]</span>`

    item.innerHTML = `
      <div class="gallery-panorama">${imgSrc}</div>
      <div class="gallery-caption">${s} &nbsp;·&nbsp; ${a.name} &nbsp;·&nbsp; General area only</div>
    `
    gallery.appendChild(item)
  })
}

function renderIbList(a) {
  const list = document.getElementById('ib-list')
  list.innerHTML = ''
  a.sites.forEach(s => {
    const row = document.createElement('div')
    row.className = 'ib-row'
    row.innerHTML = `
      <div>
        <div class="ib-name">${s}</div>
        <div class="ib-note">General area only — exact location withheld</div>
      </div>
      <i class="ti ti-chevron-right" style="color:#ccc"></i>
    `
    row.onclick = () => openIb(s)
    list.appendChild(row)
  })
}

function openIb(name) {
  document.getElementById('ib-detail-name').textContent = name
  document.getElementById('ib-list-view').style.display = 'none'
  document.getElementById('ib-detail-view').classList.add('active')
  document.querySelectorAll('.toggle-btn').forEach((b, i) => b.classList.toggle('active', i === 0))
}

function closeIb() {
  document.getElementById('ib-list-view').style.display = 'block'
  document.getElementById('ib-detail-view').classList.remove('active')
}

function goPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
  document.getElementById('page-' + id).classList.add('active')
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'))
  const nl = document.getElementById('nl-' + id)
  if (nl) nl.classList.add('active')
  if (id === 'map') initMap()
}

function initMap() {
  if (map) return
  map = L.map('map-container').setView([30.185, 67.007], 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)
  const zones = [
    { name: 'Mariabad', coords: [30.162, 67.032], color: '#1D9E75' },
    { name: 'Hazara Town', coords: [30.197, 66.971], color: '#7F77DD' },
    { name: 'Central zones', coords: [30.195, 67.015], color: '#D85A30' }
  ]
  zones.forEach(z => {
    L.circleMarker(z.coords, {
      radius: 18, color: z.color, fillColor: z.color, fillOpacity: 0.2, weight: 2
    }).addTo(map).bindPopup(z.name)
  })
}

function setSubtab(el, id) {
  document.querySelectorAll('.subtab').forEach(t => t.classList.remove('active'))
  el.classList.add('active')
  document.querySelectorAll('.subpage').forEach(p => p.classList.remove('active'))
  document.getElementById('sub-' + id).classList.add('active')
  if (id === 'imambargahs') {
    document.getElementById('ib-list-view').style.display = 'block'
    document.getElementById('ib-detail-view').classList.remove('active')
  }
}

function setToggle(el) {
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'))
  el.classList.add('active')
}

function setCtab(el) {
  document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'))
  el.classList.add('active')
}

function toggleLang(btn) {
  const isEn = btn.textContent.trim() === 'EN / فارسی'
  btn.textContent = isEn ? 'فارسی / EN' : 'EN / فارسی'
  document.documentElement.lang = isEn ? 'fa' : 'en'
  document.documentElement.dir = isEn ? 'rtl' : 'ltr'
}

document.addEventListener('mousedown', e => {
  const el = e.target.closest('.gallery-panorama')
  if (!el) return
  el.isDragging = true
  el.startX = e.pageX - el.offsetLeft
  el.scrollStart = el.scrollLeft
})

document.addEventListener('mousemove', e => {
  document.querySelectorAll('.gallery-panorama').forEach(el => {
    if (!el.isDragging) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    el.scrollLeft = el.scrollStart - (x - el.startX)
  })
})

document.addEventListener('mouseup', () => {
  document.querySelectorAll('.gallery-panorama').forEach(el => el.isDragging = false)
})