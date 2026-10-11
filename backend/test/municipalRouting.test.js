import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contains, routeMunicipality } from '../src/utils/municipalRouting.js';

test('Dakshineswar routes to Kamarhati; saved west-bank coordinates remain Bally', () => {
  assert.equal(routeMunicipality(22.57, 88.36, 5).municipalBody, 'Kolkata Municipal Corporation');
  assert.equal(routeMunicipality(22.657, 88.365, 5).municipalBody, 'Kamarhati Municipality');
  assert.equal(routeMunicipality(22.65305981856205, 88.34413075555244, 5).municipalBody, 'Bally Municipality');
});
test('unknown, invalid and imprecise locations require review rather than nearest-office guessing', () => {
  for (const args of [[null, null], [NaN, 88], [91, 88], [22, 200], [28.6, 77.2], [22.657, 88.365, 3000]]) {
    const result = routeMunicipality(...args);
    assert.equal(result.municipalBody, null);
    assert.equal(result.confidence, 'review');
  }
});
test('geometry respects polygon holes and multipolygons', () => {
  const polygon = { type: 'Polygon', coordinates: [[[0,0],[10,0],[10,10],[0,10],[0,0]],[[4,4],[6,4],[6,6],[4,6],[4,4]]] };
  assert.equal(contains(polygon, 2, 2), true);
  assert.equal(contains(polygon, 5, 5), false);
  assert.equal(contains({type:'MultiPolygon', coordinates:[polygon.coordinates]}, 2, 2), true);
});
