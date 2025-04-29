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
  document.getElementById('nameInputContainer').classList.remove('hidden');
  document.getElementById('nodeName').focus();
}

function saveNodeName() {
  const name = document.getElementById('nodeName').value;
  if (name && currentFeature) {
    const iconHtml = currentFeature.type === 'box'
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

    marker.bindPopup(`${name} (${currentFeature.type})`);
    marker.name = name;

    markers.push({ marker, name, type: currentFeature.type, latlng: currentFeature.latlng });

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

  const from = findNearestMarker(cablePath[0]);
  const to = findNearestMarker(cablePath[cablePath.length - 1]);

  const distance = L.GeometryUtil.length(cablePath) / 1000; // в км

  const info = {
    type: cableType,
    from: from ? from.name : `(${cablePath[0].lat.toFixed(5)}, ${cablePath[0].lng.toFixed(5)})`,
    to: to ? to.name : `(${cablePath[cablePath.length - 1].lat.toFixed(5)}, ${cablePath[cablePath.length - 1].lng.toFixed(5)})`,
    length: distance.toFixed(2) + ' км'
  };

  polyline.bindPopup(`Кабель: ${cableType} волокон<br>Довжина: ${info.length}<br>Від: ${info.from}<br>До: ${info.to}`);

  cables.push({ polyline, info });
  cablePath = [];
  updateCableTable();
}

function findNearestMarker(latlng) {
  let minDist = Infinity;
  let nearest = null;
  markers.forEach(m => {
    const d = map.distance(latlng, m.latlng);
    if (d < 20) nearest = m;
  });
  return nearest;
}

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
