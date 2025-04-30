class Box {
  constructor(map, latlng, params = {}) {
    this.map = map;
    this.latlng = latlng;
    this.params = {
      id: params.id || `BOX-${Date.now()}`,
      splitter: params.splitter || '',
      address: params.address || '',
      location: params.location || ''
    };
    this.anchorPoints = [];
    this.createSVGElement();
  }

  createSVGElement() {
    const point = this.map.latLngToLayerPoint(this.latlng);

    const svgNS = "http://www.w3.org/2000/svg";
    this.group = document.createElementNS(svgNS, 'g');
    this.group.setAttribute('class', 'box');
    this.group.setAttribute('cursor', 'pointer');

    // Основной прямоугольник
    this.rect = document.createElementNS(svgNS, 'rect');
    this.rect.setAttribute('x', point.x - 20);
    this.rect.setAttribute('y', point.y - 20);
    this.rect.setAttribute('width', 40);
    this.rect.setAttribute('height', 40);
    this.rect.setAttribute('fill', 'blue');
    this.rect.setAttribute('stroke', 'black');
    this.rect.setAttribute('stroke-width', '2');

    // Метка (номер бокса)
    this.label = document.createElementNS(svgNS, 'text');
    this.label.setAttribute('x', point.x);
    this.label.setAttribute('y', point.y + 5);
    this.label.setAttribute('text-anchor', 'middle');
    this.label.setAttribute('fill', 'white');
    this.label.setAttribute('font-size', '12');
    this.label.textContent = this.params.id;

    this.group.appendChild(this.rect);
    this.group.appendChild(this.label);

    // Добавим точки привязки (например 4 стороны)
    this.anchorPoints = [
      { dx: 0, dy: -20 }, // верх
      { dx: 20, dy: 0 },  // право
      { dx: 0, dy: 20 },  // низ
      { dx: -20, dy: 0 }  // лево
    ].map(offset => {
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', point.x + offset.dx);
      circle.setAttribute('cy', point.y + offset.dy);
      circle.setAttribute('r', 4);
      circle.setAttribute('fill', 'yellow');
      this.group.appendChild(circle);
      return circle;
    });

    // Обработчик двойного клика — открыть окно
    this.group.addEventListener('dblclick', () => {
      this.showDetails();
    });

    // Добавим SVG-группу в карту
    const overlayPane = this.map.getPanes().overlayPane;
    if (!this.svgLayer) {
      this.svgLayer = overlayPane.querySelector('svg');
    }
    this.svgLayer.appendChild(this.group);
  }

  showDetails() {
    const info = `
      <b>Бокс:</b> ${this.params.id}<br>
      <b>Спліттер:</b> ${this.params.splitter}<br>
      <b>Адреса:</b> ${this.params.address}<br>
      <b>Місце:</b> ${this.params.location}
    `;
    L.popup()
      .setLatLng(this.latlng)
      .setContent(info)
      .openOn(this.map);
  }
}
