import { test } from 'node:test';
import assert from 'node:assert/strict';
import { greet } from './greet.mjs';
test('greets the world by default', () => assert.equal(greet(), 'Hello, world!'));
test('greets a named person', () => assert.equal(greet('Shurik'), 'Hello, Shurik!'));
