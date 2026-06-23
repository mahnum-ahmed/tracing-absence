const areas = {
  mariabad: { name: 'Mariabad', subtitle: 'Southeastern Quetta', color: '#B54A2A', sites: ['Site 1', 'Site 2', 'Site 3'] },
  hazaratown: { name: 'Hazara Town', subtitle: 'Western Quetta', color: '#3A6B8A', sites: ['Site 4', 'Site 5', 'Site 6'] },
  central: { name: 'Central zones', subtitle: 'Mixed-population urban areas', color: '#8B6914', sites: ['Site 7', 'Site 8', 'Site 9', 'Site 10'] }
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
  if (id === 'home') map && map.invalidateSize()
}

function initMap() {
  if (map) return
  const container = document.getElementById('map-container')
  const wrap = container.closest('.home-map-wrap')
  container.style.height = (wrap ? wrap.offsetHeight : 500) + 'px'
  // Centre between the two settlements; zoom 13 fits both comfortably
  map = L.map('map-container', { zoomControl: false }).setView([30.180, 66.993], 12)
  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenTopoMap contributors'
  }).addTo(map)
  L.control.zoom({ position: 'bottomright' }).addTo(map)

  const zones = [
    // Mariabad: southeastern enclave, between Brewery Rd and Airport Rd
    { id: 'mariabad', name: 'Mariabad', coords: [30.158, 67.028], color: '#1D9E75', sub: 'Southeastern Quetta' },
    // Hazara Town: western settlement near Mastung Rd
    { id: 'hazaratown', name: 'Hazara Town', coords: [30.196, 66.958], color: '#7F77DD', sub: 'Western Quetta' },
    // Central zones: Jinnah Rd / Liaquat Bazaar mixed area
    { id: 'central', name: 'Central zones', coords: [30.204, 67.008], color: '#D85A30', sub: 'Mixed-population urban areas' }
  ]

  zones.forEach(z => {
    const icon = L.divIcon({
      className: '',
      html: `<div class="map-area-circle" style="background:${z.color}88;border-color:${z.color}">
               <span class="map-area-label">${z.name}</span>
             </div>`,
      iconSize: [120, 120],
      iconAnchor: [60, 60]
    })
    L.marker(z.coords, { icon })
      .addTo(map)
      .on('click', () => openArea(z.id))
  })
}

initMap()

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

function goToRecording(areaId, siteIndex) {
  openArea(areaId)
  // switch to accessibility tab where audio lives
  const tabs = document.querySelectorAll('.subtab')
  const pages = document.querySelectorAll('.subpage')
  tabs.forEach((t, i) => t.classList.toggle('active', i === 2))
  pages.forEach((p, i) => p.classList.toggle('active', i === 2))
}