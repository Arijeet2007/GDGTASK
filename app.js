const canvas = document.getElementById('canvas');
const layerList = document.getElementById('layer-list');
const propsPanel = document.getElementById('properties-panel');
const deleteButton = document.getElementById('delete-selected');

const state = {
  elements: [],
  selectedId: null,
  nextId: 1,
  nextZ: 1,
  interaction: null,
};

const MIN_SIZE = 40;
const HANDLE_DIRECTIONS = ['nw', 'ne', 'sw', 'se'];

function createElement(type) {
  const base = {
    id: `el-${state.nextId++}`,
    type,
    x: 40 + state.elements.length * 16,
    y: 40 + state.elements.length * 16,
    w: 140,
    h: type === 'text' ? 70 : 100,
    z: state.nextZ++,
    text: type === 'text' ? 'Editable text block' : 'Image',
  };
  if (type === 'rectangle') {
    base.w = 160;
    base.h = 110;
  }
  state.elements.push(base);
  selectElement(base.id);
  render();
}

function selectElement(id) {
  state.selectedId = id;
  const selected = getSelected();
  if (selected) {
    selected.z = state.nextZ++;
  }
}

function getSelected() {
  return state.elements.find((el) => el.id === state.selectedId) || null;
}

function removeSelected() {
  if (!state.selectedId) return;
  state.elements = state.elements.filter((el) => el.id !== state.selectedId);
  state.selectedId = null;
  render();
}

function clampToCanvas(el) {
  const maxX = canvas.clientWidth - el.w;
  const maxY = canvas.clientHeight - el.h;
  el.x = Math.max(0, Math.min(el.x, maxX));
  el.y = Math.max(0, Math.min(el.y, maxY));
}

function startMove(event, element) {
  event.stopPropagation();
  selectElement(element.id);
  state.interaction = {
    mode: 'move',
    id: element.id,
    startX: event.clientX,
    startY: event.clientY,
    originalX: element.x,
    originalY: element.y,
  };
  render();
}

function startResize(event, element, dir) {
  event.stopPropagation();
  selectElement(element.id);
  state.interaction = {
    mode: 'resize',
    dir,
    id: element.id,
    startX: event.clientX,
    startY: event.clientY,
    original: { ...element },
  };
  render();
}

function onPointerMove(event) {
  if (!state.interaction) return;
  const active = state.elements.find((el) => el.id === state.interaction.id);
  if (!active) return;

  const dx = event.clientX - state.interaction.startX;
  const dy = event.clientY - state.interaction.startY;

  if (state.interaction.mode === 'move') {
    active.x = state.interaction.originalX + dx;
    active.y = state.interaction.originalY + dy;
    clampToCanvas(active);
  }

  if (state.interaction.mode === 'resize') {
    const o = state.interaction.original;
    if (state.interaction.dir.includes('e')) {
      active.w = Math.max(MIN_SIZE, o.w + dx);
    }
    if (state.interaction.dir.includes('s')) {
      active.h = Math.max(MIN_SIZE, o.h + dy);
    }
    if (state.interaction.dir.includes('w')) {
      active.w = Math.max(MIN_SIZE, o.w - dx);
      active.x = o.x + dx;
      if (active.w === MIN_SIZE) {
        active.x = o.x + (o.w - MIN_SIZE);
      }
    }
    if (state.interaction.dir.includes('n')) {
      active.h = Math.max(MIN_SIZE, o.h - dy);
      active.y = o.y + dy;
      if (active.h === MIN_SIZE) {
        active.y = o.y + (o.h - MIN_SIZE);
      }
    }
    clampToCanvas(active);
  }

  render();
}

function onPointerUp() {
  state.interaction = null;
}

function updateProperty(key, value) {
  const selected = getSelected();
  if (!selected) return;
  selected[key] = Number(value);
  if (key === 'w' || key === 'h') {
    selected[key] = Math.max(MIN_SIZE, selected[key]);
  }
  clampToCanvas(selected);
  render();
}

function renderProperties() {
  const selected = getSelected();
  if (!selected) {
    propsPanel.textContent = 'Select an element';
    return;
  }

  propsPanel.innerHTML = '';
  [['X', 'x'], ['Y', 'y'], ['W', 'w'], ['H', 'h']].forEach(([label, key]) => {
    const row = document.createElement('label');
    row.className = 'prop-row';
    row.innerHTML = `<span>${label}</span>`;
    const input = document.createElement('input');
    input.type = 'number';
    input.value = Math.round(selected[key]);
    input.addEventListener('input', (e) => updateProperty(key, e.target.value));
    row.appendChild(input);
    propsPanel.appendChild(row);
  });
}

function renderLayers() {
  layerList.innerHTML = '';
  [...state.elements]
    .sort((a, b) => b.z - a.z)
    .forEach((el) => {
      const item = document.createElement('li');
      item.className = `layer-item ${state.selectedId === el.id ? 'selected' : ''}`;
      item.textContent = `${el.type} (${el.id})`;
      item.onclick = () => {
        selectElement(el.id);
        render();
      };
      layerList.appendChild(item);
    });
}

function renderCanvas() {
  canvas.innerHTML = '';

  [...state.elements]
    .sort((a, b) => a.z - b.z)
    .forEach((el) => {
      const node = document.createElement('div');
      node.className = `element ${el.type} ${state.selectedId === el.id ? 'selected' : ''}`;
      node.style.left = `${el.x}px`;
      node.style.top = `${el.y}px`;
      node.style.width = `${el.w}px`;
      node.style.height = `${el.h}px`;
      node.style.zIndex = el.z;

      if (el.type === 'text') {
        node.textContent = el.text;
      }

      if (el.type === 'image') {
        node.textContent = 'Image Placeholder';
      }

      node.addEventListener('pointerdown', (e) => startMove(e, el));
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        selectElement(el.id);
        render();
      });

      if (state.selectedId === el.id) {
        HANDLE_DIRECTIONS.forEach((dir) => {
          const handle = document.createElement('div');
          handle.className = `resize-handle ${dir}`;
          handle.addEventListener('pointerdown', (e) => startResize(e, el, dir));
          node.appendChild(handle);
        });
      }

      canvas.appendChild(node);
    });
}

function render() {
  renderCanvas();
  renderLayers();
  renderProperties();
}

canvas.addEventListener('click', () => {
  state.selectedId = null;
  render();
});

document.querySelectorAll('[data-add]').forEach((button) => {
  button.addEventListener('click', () => createElement(button.dataset.add));
});

deleteButton.addEventListener('click', removeSelected);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Delete' || event.key === 'Backspace') {
    removeSelected();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
    event.preventDefault();
    const selected = getSelected();
    if (!selected) return;
    const clone = { ...selected, id: `el-${state.nextId++}`, x: selected.x + 20, y: selected.y + 20, z: state.nextZ++ };
    state.elements.push(clone);
    selectElement(clone.id);
    render();
  }
});

window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);

render();
