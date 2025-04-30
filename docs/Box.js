export default class Box {
  constructor(map, latlng, data) {
    this.map = map;
    this.latlng = latlng;
    this.data = data;
    this.createSVGElement();
  }

  createSVGElement() {
    const icon = L.divIcon({
      className: '',
      html: `
        <svg width="50" height="50">
          <rect class="box-rect" x="5" y="5" width="40" height="40"></rect>
          <text x="25" y="30" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${this.data.id}</text>
        </svg>
      `,
      iconSize: [50, 50]
    });

    const marker = L.marker(this.latlng, { icon }).addTo(this.map);
    marker.bindPopup(`
      <b>Бокс №${this.data.id}</b><br>
      Спліттер: ${this.data.splitter}<br>
      Адреса: ${this.data.address}<br>
      Місце: ${this.data.location}
    `);

    this.marker = marker;
  }
}
