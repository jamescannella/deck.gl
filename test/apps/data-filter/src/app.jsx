/* global window, document */
/* eslint-disable no-console */
import React, {Component} from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL, {GeoJsonLayer, COORDINATE_SYSTEM} from 'deck.gl';
import {DataFilterExtension} from '@deck.gl/extensions';

import {DATA, SHAPE_NAMES} from './data-sample';

const dataFilterExtension = new DataFilterExtension({
  filterSize: 2,
  softMargin: true,
  countItems: true
});

const INITIAL_VIEW_STATE = {longitude: -122.45, latitude: 37.78, zoom: 12};

const LABELS = {};
for (const shape of Object.values(SHAPE_NAMES)) {
  LABELS[shape] = Math.random() < 0.3;
}

class Root extends Component {
  constructor(props) {
    super(props);

    this.state = {time: 1000, labels: LABELS};

    this._animate = this._animate.bind(this);
  }

  componentDidMount() {
    // this._animate();
  }

  _animate() {
    this.setState({time: Date.now()});
    window.requestAnimationFrame(this._animate);
  }

  _renderLayers() {
    const t = (this.state.time / 4000) % 1;
    const cos = Math.abs(Math.cos(t * Math.PI));
    const sin = Math.abs(Math.sin(t * Math.PI));

    const filterRange = [
      [-cos * 5000, cos * 5000], // x
      [-sin * 5000, sin * 5000] // y
    ];
    const filterSoftRange = [
      [-cos * 5000 + 1000, cos * 5000 - 1000], // x
      [-sin * 5000 + 1000, sin * 5000 - 1000] // y
    ];
    const filterCategoryList = Object.entries(this.state.labels)
      .filter(([k, v]) => v)
      .map(([k, v]) => k);

    return [
      new GeoJsonLayer({
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: [-122.45, 37.78],
        data: DATA,

        // Data accessors
        getFillColor: f => f.properties.color,
        getLineWidth: 10,
        getRadius: f => f.properties.radius,
        getFilterValue: f => f.properties.centroid,
        getFilterCategory: f => f.properties.label,

        // onFilteredItemsChange: console.log, // eslint-disable-line

        // Filter
        filterRange,
        filterSoftRange,
        filterCategoryList,

        extensions: [dataFilterExtension]
      })
    ];
  }

  render() {
    return (
      <div>
        <DeckGL
          controller={true}
          initialViewState={INITIAL_VIEW_STATE}
          layers={this._renderLayers()}
        />
        <MultiSelect obj={LABELS} onChange={obj => this.setState({labels: obj})} />
      </div>
    );
  }
}

function MultiSelect({obj, onChange}) {
  return (
    <div style={{position: 'relative', padding: 4, margin: 2, width: 200}}>
      {Object.entries(obj).map(([key, value]) => (
        <Checkbox
          key={key}
          label={key}
          value={value}
          onChange={e => {
            obj[key] = e.target.checked;
            onChange(obj);
          }}
        />
      ))}
    </div>
  );
}

function Checkbox({label, value, onChange}) {
  return (
    <label>
      {label}:
      <input type="checkbox" checked={value} onChange={onChange} />
      <br />
    </label>
  );
}

const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);
