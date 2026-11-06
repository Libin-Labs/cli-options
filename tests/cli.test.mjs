import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCliOptions } from '../dist/esm/index.js';
const schema = {
  verbose: { type: 'boolean', short: 'v' },
  output: { type: 'string', short: 'o' },
  count: { type: 'number', default: 1 },
  tag: { type: 'string', repeat: true },
};
test('parses long, short, typed and default options', () => {
  const parsed = parseCliOptions(['--verbose', '-o', 'out.txt', '--count=3'], schema);
  assert.equal(parsed.values.verbose, true);
  assert.equal(parsed.values.output, 'out.txt');
  assert.equal(parsed.values.count, 3);
});
test('collects repeat options and positional arguments', () => {
  const parsed = parseCliOptions(['--tag', 'a', '--tag=b', 'file'], schema);
  assert.deepEqual(parsed.values.tag, ['a', 'b']);
  assert.deepEqual(parsed.positional, ['file']);
});
test('supports combined boolean flags and attached short values', () => {
  const parsed = parseCliOptions(['-v', '-oresult'], schema);
  assert.equal(parsed.values.verbose, true);
  assert.equal(parsed.values.output, 'result');
});
test('honors -- terminator', () => {
  assert.deepEqual(parseCliOptions(['--', '--verbose'], schema).positional, ['--verbose']);
});
test('reports unknown options and missing values', () => {
  assert.throws(() => parseCliOptions(['--missing'], schema), /Unknown/);
  assert.throws(() => parseCliOptions(['--output'], schema), /requires a value/);
});
test('validates finite numeric values and duplicate single options', () => {
  assert.throws(() => parseCliOptions(['--count=NaN'], schema), /finite number/);
  assert.throws(() => parseCliOptions(['--verbose', '-v'], schema), /more than once/);
});
test('rejects invalid short-name collisions', () => {
  assert.throws(() =>
    parseCliOptions([], {
      one: { type: 'boolean', short: 'x' },
      two: { type: 'boolean', short: 'x' },
    }),
  );
});
