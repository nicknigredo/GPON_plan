export default class Box {
  constructor(map, latlng, params) {
    this.map = map;
    this.latlng = latlng;
    this.params = params;

    // Размер бокса в пикселях
    this.width = 60;
    this.height = 60;

    this._create();
  }

  _create() {
    const svgIcon = L.divIcon({
      className: '',
      html: this._getSVG(),
      iconSize: [this.width, this.height],
      iconAnchor: [this.width / 2, this.height / 2]
    });

    this.marker = L.marker(this.latlng, {
      icon: svgIcon,
      draggable: false
    }).addTo(this.map);

    this.marker.on('dblclick', () => this._showDetails());
  }

  _getSVG() {
    const { id } = this.params;
    return `
      <svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${this.width}" height="${this.height}" fill="#3399ff" stroke="black" stroke-width="2" />
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              font-size="12" font-weight="bold" fill="white">${id}</text>

        <!-- Точки привязки -->
        ${this._anchorPoints().map(pt => `
          <circle cx="${pt[0]}" cy="${pt[1]}" r="3" fill="black" />
        `).join('')}
      </svg>
    `;
  }

  _anchorPoints() {
    // Центр, четыре угла и середины сторон (8 точек привязки)
    const w = this.width;
    const h = this.height;
    return [
      [w/2, h/2],          // центр
      [0, 0], [w, 0],      // верхние углы
      [0, h], [w, h],      // нижние углы
      [w/2, 0], [w/2, h],  // середины по вертикали
      [0, h/2], [w, h/2]   // середины по горизонтали
    ];
  }

  _showDetails() {
    const { id, splitter, address, location } = this.params;
    const msg = `Бокс: ${id}\nСпліттер: ${splitter}\nАдреса: ${address}\nМісце: ${location}`;
    alert(msg);
  }
}
