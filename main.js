let map = L.map('map').setView([48.3794, 31.1656], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let mode = null;
let tempLine = [];
let cableSegments = [];
let markers = [];
let currentFeature = null;
let cableStart = null;
let boxes = []; // Список для хранения боксов и муфт
let cables = []; // Список для хранения данных о кабелях

function setMode(m) {
  mode = m;
  tempLine = [];
  cableStart = null;
}

map.on('click', function(e) {
  if (mode === 'box' || mode === 'splice') {
    currentFeature = {
      type: mode,
      latlng: e.latlng,
      id: generateId() // Генерируем уникальный ID для объекта
    };
    boxes.push(currentFeature); // Добавляем бокс или муфту в массив
    showInputBox();
  } else if (mode === 'cable') {
    if (cableStart === null) {
      cableStart = e.latlng;
    } else {
      const cableEnd = e.latlng;
      const cableType = document.getElementById('cableType').value;

      // Сохраняем данные о кабеле с привязкой к номерам боксов/муфт
      cables.push({
        from: getBoxId(cableStart), // Получаем ID начального объекта
        to: getBoxId(cableEnd), // Получаем ID конечного объекта
        type: cableType
      });

      cableStart = null;
      generateCableTable(); // Генерация таблицы кабелей после добавления
    }
  }
});

function getBoxId(latlng) {
  // Функция для поиска объекта по координатам
  for (let box of boxes) {
    if (isSameLocation(latlng, box.latlng)) {
      return box.id;
    }
  }
  return null;
}

function isSameLocation(latlng1, latlng2) {
  return latlng1.lat === latlng2.lat && latlng1.lng === latlng2.lng;
}

function generateId() {
  return uuid.v4(); // Используем uuid для генерации уникального ID
}

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
      draggable: true
    }).addTo(map);

    marker.bindPopup(`${name} (${currentFeature.type})`);
    marker.on('click', () => showBoxDetails(currentFeature.id));

    markers.push({marker, name, type: currentFeature.type});
    currentFeature = null;
  }

  document.getElementById('nodeName').value = '';
  document.getElementById('nameInputContainer').classList.add('hidden');
}

function generateCableTable() {
  let table = `<table><thead><tr><th>От (ID)</th><th>Куда (ID)</th><th>Тип кабеля</th></tr></thead><tbody>`;
  
  cables.forEach(cable => {
    table += `<tr>
                <td>${cable.from}</td>
                <td>${cable.to}</td>
                <td>${cable.type} волокон</td>
              </tr>`;
  });
  
  table += `</tbody></table>`;
  document.getElementById('cableTableContainer').innerHTML = table;
}

function showBoxDetails(boxId) {
  const attachedCables = cables.filter(cable => cable.from === boxId || cable.to === boxId);
  let details = `<h3>Кабели, привязанные к объекту ${boxId}</h3>`;
  
  if (attachedCables.length === 0) {
    details += '<p>К этому объекту не привязано кабелей.</p>';
  } else {
    details += `<table><thead><tr><th>От (ID)</th><th>Куда (ID)</th><th>Тип кабеля</th></tr></thead><tbody>`;
    
    attachedCables.forEach(cable => {
      details += `<tr>
                    <td>${cable.from}</td>
                    <td>${cable.to}</td>
                    <td>${cable.type} волокон</td>
                  </tr>`;
    });
    
    details += `</tbody></table>`;
  }
  
  document.getElementById('modalContent').innerHTML = details;
  document.getElementById('modal').style.display = 'block';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}
