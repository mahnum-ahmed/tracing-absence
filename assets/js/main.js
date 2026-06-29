const areas = {
  mariabad: {
    name: 'Mariabad', subtitle: 'Southeastern Quetta', color: '#B54A2A',
    sites: [
      {
        id: 'Imam Bargah Baab Al-Raza Gligiti (Ladakh)',
        hotspots: [
          { x: 240, y: 230, content: { type: 'image', src: 'assets/img/panoramic-1-1.png', caption: '' } },
          { x: 800, y: 310, content: { type: 'quote', text: '"You only know it\'s there if you\'ve always known it\'s there."', attribution: 'Local shopkeeper, Mariabad' } },
          { x: 1480, y: 230, content: { type: 'note', text: 'The far edge of the compound, where the boundary meets the adjoining street.' } }
        ]
      },
      { id: 'Site 2', hotspots: [] },
      { id: 'Site 3', hotspots: [] }
    ]
  },
  hazaratown: {
    name: 'Hazara Town', subtitle: 'Western Quetta', color: '#3A6B8A',
    sites: [
      { id: 'Site 4', hotspots: [] },
      { id: 'Site 5', hotspots: [] },
      { id: 'Site 6', hotspots: [] }
    ]
  },
  central: {
    name: 'Central zones', subtitle: 'Mixed-population urban areas', color: '#8B6914',
    sites: [
      { id: 'Site 7', hotspots: [] },
      { id: 'Site 8', hotspots: [] },
      { id: 'Site 9', hotspots: [] },
      { id: 'Site 10', hotspots: [] }
    ]
  }
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
  a.sites.forEach((site, index) => {
    const s = typeof site === 'string' ? { id: site, hotspots: [] } : site
    const item = document.createElement('div')
    item.className = 'gallery-item'

    const isRealImage = (a.name === 'Mariabad' && index === 0)
    const imgContent = isRealImage
      ? `<img src="assets/img/panoramic-1.jpg" alt="${s.id} panorama, ${a.name}"/>`
      : `<span class="panorama-placeholder">[ Panoramic photo — ${s.id} ]</span>`

    const pinsHtml = (s.hotspots || []).map((h, hi) => `
      <button class="hotspot-pin" style="left:${h.x}px;top:${h.y ?? 275}px" data-index="${hi}">
        <img src="assets/img/hotspot-icon.png" class="hotspot-pin-img" alt=""
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="hotspot-pin-fallback"></div>
      </button>
    `).join('')

    item.innerHTML = `
      <div class="gallery-panorama">
        <div class="panorama-inner">
          ${imgContent}
          ${pinsHtml}
        </div>
      </div>
      <div class="gallery-caption">${s.id} &nbsp;·&nbsp; ${a.name} &nbsp;·&nbsp; General area only</div>
    `

    item.querySelectorAll('.hotspot-pin').forEach(pin => {
      pin.addEventListener('click', e => {
        e.stopPropagation()
        const hi = parseInt(pin.dataset.index)
        showHotspotPopup(item, s.hotspots[hi], pin)
      })
    })

    // close popup when clicking outside it
    item.querySelector('.gallery-panorama').addEventListener('click', e => {
      if (!e.target.closest('.hotspot-popup') && !e.target.closest('.hotspot-pin')) {
        item.querySelector('.hotspot-popup')?.remove()
      }
    })

    gallery.appendChild(item)
  })
}

function showHotspotPopup(galleryItem, hotspot, pin) {
  galleryItem.querySelector('.hotspot-popup')?.remove()

  const popup = document.createElement('div')
  popup.className = 'hotspot-popup'

  const c = hotspot.content
  let body = ''
  if (c.type === 'quote') {
    body = `<blockquote class="popup-quote">${c.text}</blockquote>
            ${c.attribution ? `<cite class="popup-cite">${c.attribution}</cite>` : ''}`
  } else if (c.type === 'image') {
    body = `<img src="${c.src}" class="popup-img" alt="${c.caption || ''}">
            ${c.caption ? `<p class="popup-caption">${c.caption}</p>` : ''}`
  } else if (c.type === 'audio') {
    const bars = Array.from({ length: 32 }, (_, i) => {
      const h = 6 + Math.round(Math.sin(i * 0.7) * 8 + Math.random() * 8)
      return `<span style="height:${h}px"></span>`
    }).join('')
    body = `
      <p class="popup-audio-label">${c.label || 'Field recording'}</p>
      <div class="popup-audio-controls">
        <button class="audio-play-btn" data-src="${c.src}" aria-label="Play">&#9654;</button>
        <div class="audio-progress-wrap">
          <div class="audio-waveform">${bars}</div>
          <div class="audio-progress-track">
            <div class="audio-progress-fill"></div>
          </div>
        </div>
        <span class="audio-time">0:00</span>
      </div>`
  } else {
    body = `<p class="popup-text">${c.text}</p>`
  }

  popup.innerHTML = `
    <button class="popup-close">×</button>
    <div class="popup-body">${body}</div>
  `
  popup.querySelector('.popup-close').addEventListener('click', () => {
    popup.querySelector('audio')?.pause()
    popup.remove()
  })

  if (hotspot.content.type === 'audio') {
    const btn = popup.querySelector('.audio-play-btn')
    const fill = popup.querySelector('.audio-progress-fill')
    const track = popup.querySelector('.audio-progress-track')
    const timeEl = popup.querySelector('.audio-time')
    const waveSpans = popup.querySelectorAll('.audio-waveform span')
    const audio = new Audio(btn.dataset.src)

    const fmt = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`

    audio.addEventListener('timeupdate', () => {
      const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0
      fill.style.width = pct + '%'
      timeEl.textContent = fmt(audio.currentTime)
      waveSpans.forEach((s, i) => s.classList.toggle('passed', i / waveSpans.length < pct / 100))
    })

    audio.addEventListener('ended', () => {
      btn.innerHTML = '&#9654;'
      fill.style.width = '0%'
      timeEl.textContent = '0:00'
      waveSpans.forEach(s => s.classList.remove('passed'))
    })

    track.addEventListener('click', e => {
      if (!audio.duration) return
      const rect = track.getBoundingClientRect()
      audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration
    })

    btn.addEventListener('click', () => {
      if (audio.paused) { audio.play(); btn.innerHTML = '&#9646;&#9646;' }
      else { audio.pause(); btn.innerHTML = '&#9654;' }
    })
  }

  const panorama = galleryItem.querySelector('.panorama-inner')
  panorama.appendChild(popup)

  // position next to the pin using its data coords, then clamp after render
  const pinX = hotspot.x
  const pinY = hotspot.y ?? 275
  const pinSize = 50
  popup.style.left = (pinX + pinSize + 10) + 'px'
  popup.style.top = (pinY - 20) + 'px'

  // after browser lays out the popup, clamp so it stays inside panorama-inner
  requestAnimationFrame(() => {
    const popupW = popup.offsetWidth
    const popupH = popup.offsetHeight
    const panW = panorama.scrollWidth
    const panH = panorama.offsetHeight
    let left = pinX + pinSize + 10
    let top = pinY - 20
    if (left + popupW > panW - 8) left = pinX - popupW - 10
    top = Math.max(8, Math.min(top, panH - popupH - 8))
    popup.style.left = left + 'px'
    popup.style.top = top + 'px'
  })
}

function renderIbList(a) {
  const list = document.getElementById('ib-list')
  list.innerHTML = ''
  a.sites.forEach(site => {
    const s = typeof site === 'string' ? { id: site } : site
    const row = document.createElement('div')
    row.className = 'ib-row'
    row.innerHTML = `
      <div>
        <div class="ib-name">${s.id}</div>
        <div class="ib-note">General area only — exact location withheld</div>
      </div>
      <i class="ti ti-chevron-right" style="color:#ccc"></i>
    `
    row.onclick = () => openIb(s.id)
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
  if (e.target.closest('.hotspot-pin') || e.target.closest('.hotspot-popup')) return
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

function initSiteAudioPlayers() {
  const fmt = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`

  document.querySelectorAll('.site-audio-player').forEach(player => {
    const waveform = player.querySelector('.site-audio-waveform')
    const bars = Array.from({ length: 40 }, (_, i) => {
      const h = 6 + Math.round(Math.abs(Math.sin(i * 0.6 + 1)) * 14 + Math.abs(Math.cos(i * 1.1)) * 8)
      const span = document.createElement('span')
      span.style.height = h + 'px'
      return span
    })
    bars.forEach(b => waveform.appendChild(b))

    const btn = player.querySelector('.site-audio-play-btn')
    const fill = player.querySelector('.site-audio-fill')
    const track = player.querySelector('.site-audio-track')
    const timeEl = player.querySelector('.site-audio-time')
    const audio = new Audio(player.dataset.src)

    audio.addEventListener('timeupdate', () => {
      const pct = audio.duration ? audio.currentTime / audio.duration : 0
      fill.style.width = (pct * 100) + '%'
      timeEl.textContent = fmt(audio.currentTime)
      bars.forEach((b, i) => b.classList.toggle('passed', i / bars.length < pct))
    })

    audio.addEventListener('ended', () => {
      btn.innerHTML = '&#9654;'
      fill.style.width = '0%'
      timeEl.textContent = '0:00'
      bars.forEach(b => b.classList.remove('passed'))
    })

    track.addEventListener('click', e => {
      if (!audio.duration) return
      const rect = track.getBoundingClientRect()
      audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration
    })

    btn.addEventListener('click', () => {
      if (audio.paused) { audio.play(); btn.innerHTML = '&#9646;&#9646;' }
      else { audio.pause(); btn.innerHTML = '&#9654;' }
    })
  })
}

document.addEventListener('DOMContentLoaded', initSiteAudioPlayers)