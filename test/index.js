import * as path from 'path';
import * as fs from 'fs';
import assert from 'power-assert';
import * as babel from 'babel-core';
import plugin from '../src/index';

function trim(str) {
  return str.toString().replace(/^\s+|\s+$/, '');
}

const skipTests = [
  '.babelrc',
  '.DS_Store',
];


const fixturesDir = path.join(__dirname, 'fixtures');
const baseDir = path.join(__dirname, '..');

describe('emit asserts for: ', () => {
  fs.readdirSync(fixturesDir).map((caseName) => {
    if (skipTests.indexOf(caseName) >= 0) return;

    it(`output match: ${caseName}`, () => {
      const fixtureDir = path.join(fixturesDir, caseName);

      // Ensure messages are deleted
      // const actualGeneratedMessagesPath = path.join(fixtureDir, 'actualMessages.js');
      // if (fs.existsSync(actualGeneratedMessagesPath)) fs.unlinkSync(actualGeneratedMessagesPath);
      let isUpdated = false;
      if (caseName === 'componentWithNewMessages') isUpdated = true;

      const actualFileName = isUpdated ? 'actualWithNew' : 'actual';
      const actualFile = actualFileName + '.js';

      const actual = transform(path.join(fixtureDir, actualFile));

      // Check code output
      const expected = fs.readFileSync(path.join(fixtureDir, 'expected.js'));
      assert.equal(trim(actual), trim(expected));

      // Check generated message output
      const expectedGenMessages = fs.readFileSync(path.join(fixtureDir, 'expectedMessages.js'));
      const actualGenMessages = fs.readFileSync(path.join(fixtureDir, actualFileName + 'Messages.js'));
      assert.equal(trim(actualGenMessages), trim(expectedGenMessages));
    });
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
