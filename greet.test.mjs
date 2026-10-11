import { test } from 'node:test';
import assert from 'node:assert/strict';
import { greet } from './greet.mjs';

test('greets the world by default', () => assert.equal(greet(), 'Hello, world!'));
test('greets a named person', () => assert.equal(greet('Shurik'), 'Hello, Shurik!'));

test('greets in English when locale is "en"', () => {
  assert.equal(greet('Shurik', 'en'), 'Hello, Shurik!');
  assert.equal(greet(undefined, 'en'), 'Hello, world!');
});

test('greets in Spanish when locale is "es"', () => {
  assert.equal(greet('Shurik', 'es'), '¡Hola, Shurik!');
  assert.equal(greet('Mundo', 'es'), '¡Hola, Mundo!');
});

test('falls back to English for an unknown locale', () => {
  assert.equal(greet('Shurik', 'fr'), 'Hello, Shurik!');
  assert.equal(greet('Shurik', 'ES'), 'Hello, Shurik!');
  assert.equal(greet('Shurik', 'toString'), 'Hello, Shurik!');
});
