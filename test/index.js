import * as path from 'path';
import * as fs from 'fs';
import assert from 'power-assert';
import * as babel from 'babel-core';
import plugin from '../src/index';

function trim(str) {
  return str.toString().replace(/^\s+|\s+$/, '');
}

/* Uncomment when we have more cases
const skipTests = [
  '.babelrc',
  '.DS_Store',
];
*/

const fixturesDir = path.join(__dirname, 'fixtures');
const baseDir = path.join(__dirname, '..');

/* Uncomment when we have more cases
describe('emit asserts for: ', () => {
  fs.readdirSync(fixturesDir).map((caseName) => {
    if (skipTests.indexOf(caseName) >= 0) return;

    it(`output match: ${caseName}`, () => {
      const fixtureDir = path.join(fixturesDir, caseName);

      // Ensure messages are deleted
      const actualMessagesPath = path.join(fixtureDir, 'actual.json');
      if (fs.existsSync(actualMessagesPath)) fs.unlinkSync(actualMessagesPath);

      const actual = transform(path.join(fixtureDir, 'actual.js'));

      // Check code output
      const expected = fs.readFileSync(path.join(fixtureDir, 'expected.js'));
      assert.equal(trim(actual), trim(expected));

      // Check message output
      const expectedMessages = fs.readFileSync(path.join(fixtureDir, 'expected.json'));
      const actualMessages = fs.readFileSync(path.join(fixtureDir, 'actual.json'));
      assert.equal(trim(actualMessages), trim(expectedMessages));
    });
  });
});
*/
describe('emit asserts for: ', () => {

  it('output match: componentMessages', () => {
    const fixtureDir = path.join(fixturesDir, 'componentMessages');

    // Ensure generated messages are deleted
    const actualGeneratedMessagesPath = path.join(fixtureDir, 'actualMessages.js');
    if (fs.existsSync(actualGeneratedMessagesPath)) fs.unlinkSync(actualGeneratedMessagesPath);

    const actual = transform(path.join(fixtureDir, 'actual.js'));

    // Check code output
    const expected = fs.readFileSync(path.join(fixtureDir, 'expected.js'));
    assert.equal(trim(actual), trim(expected));

    // Check generated message output
    const expectedGenMessages = fs.readFileSync(path.join(fixtureDir, 'expectedMessages.js'));
    const actualGenMessages = fs.readFileSync(path.join(fixtureDir, 'actualMessages.js'));
    assert.equal(trim(actualGenMessages), trim(expectedGenMessages));
  });


});


const BASE_OPTIONS = {
  messagesDir: baseDir,
};

function transform(filePath, options = {}, {multiplePasses = false} = {}) {
  function getPluginConfig() {
    return [plugin, {
      ...BASE_OPTIONS,
      ...options,
    }];
  }

  return babel.transformFileSync(filePath, {
    plugins: multiplePasses ? [
      getPluginConfig(),
      getPluginConfig(),
    ] : [getPluginConfig()],
  }).code;
}
