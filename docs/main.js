let map = L.map('map').setView([48.3794, 31.1656], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let mode = null;
let cablePath = [];
let cableSegments = [];
let markers = [];
let cables = [];
let currentFeature = null;

function setMode(m) {
  mode = m;
  cablePath = [];
  currentFeature = null;
}

map.on('click', function(e) {
  if (mode === 'box' || mode === 'splice') {
    currentFeature = {
      type: mode,
      latlng: e.latlng
    };
    showInputBox();
  } else if (mode === 'cable') {
    cablePath.push(e.latlng);
    if (cablePath.length >= 2) {
      drawCable();
    }
  }
});

function showInputBox() {
  const container = document.getElementById('nameInputContainer');
  container.classList.remove('hidden');

  // Установим позицию окна рядом с местом клика
  const mapPos = map.latLngToContainerPoint(currentFeature.latlng);
  container.style.top = `${mapPos.y + 50}px`;
  container.style.left = `${mapPos.x + 50}px`;

  document.getElementById('nodeName').focus();
}

function saveNodeName() {
  const name = document.getElementById('nodeName').value;
  if (name && currentFeature) {
    const type = currentFeature.type; // передаем тип из currentFeature

    const iconHtml = type === 'box'
      ? `<div style="color: blue; font-weight: bold;">🟥<br>${name}</div>`
      : `<div style="color: green; font-weight: bold;">🔵<br>${name}</div>`;

    const icon = L.divIcon({
      html: iconHtml,
      iconSize: [50, 50],
      className: ''
    });

    const marker = L.marker(currentFeature.latlng, {
      icon: icon,
      draggable: false
    }).addTo(map);

    marker.bindPopup(`${name} (${type})`);
    marker.name = name;

    markers.push({ id: Date.now(), marker, name, type, latlng: currentFeature.latlng });

    currentFeature = null;
  }

  document.getElementById('nodeName').value = '';
  document.getElementById('nameInputContainer').classList.add('hidden');
}

function drawCable() {
  const cableType = document.getElementById('cableType').value;

  const polyline = L.polyline(cablePath, {
    color: 'red',
    weight: 3,
    dashArray: '5,5'
  }).addTo(map);

  // Расчет длины кабеля
  let totalLength = 0;
  for (let i = 1; i < cablePath.length; i++) {
    totalLength += map.distance(cablePath[i - 1], cablePath[i]);
  }

  const from = findNearestMarker(cablePath[0]);
  const to = findNearestMarker(cablePath[cablePath.length - 1]);

  const fiberCount = prompt('Кількість волокон у кабелі?', '8');
  const comment = prompt('Коментар до кабелю:', '');

  const info = {
    type: cableType,
    fromId: from?.id,
    from: from?.name ?? '...',
    toId: to?.id,
    to: to?.name ?? '...',
    length: totalLength.toFixed(2),
    fiberCount,
    comment
  };

  cables.push({ path: polyline, info });
  cablePath = [];
  updateCableTable();
}

function findNearestMarker(latlng) {
  let nearest = null;
  let minDistance = Infinity;
  for (const m of markers) {
    const dist = map.distance(latlng, m.latlng);
    if (dist < minDistance && dist < 50) { // радиус поиска 50 м
      minDistance = dist;
      nearest = m;
    }
  }
  return nearest;
}

const boxes = [];

function addBoxAt(latlng) {
  const params = {
    id: prompt('Номер бокса?', 'BX-001'),
    splitter: prompt('Номер спліттера?', 'SPL-1'),
    address: prompt('Адреса?', 'вул. Центральна, 1'),
    location: prompt('Місце установки?', 'підвал')
  };
  const box = new Box(map, latlng, params);
  boxes.push(box);
}

map.on('click', function(e) {
  if (mode === 'box') {
    addBoxAt(e.latlng);
  }
});

function updateCableTable() {
  const tbody = document.getElementById('cableTableBody');
  tbody.innerHTML = '';
  cables.forEach((c, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${c.info.type}</td>
      <td>${c.info.from}</td>
      <td>${c.info.to}</td>
      <td>${c.info.length}</td>
    `;
    tbody.appendChild(row);
  });
}
