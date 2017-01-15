import * as p from 'path';
import * as fs from 'fs';
import {transformFileSync} from 'babel-core';
import plugin from '../src/index';

const baseDir = p.resolve(`${__dirname}/../test/fixtures`);

/* TODO: Support extractSourceLocation option */
const fixtures = [
  'componentMessages',
];

fixtures.forEach((fixture) => {
  let name = fixture;
  let options = {};

  // For additional options support
  if (Array.isArray(fixture)) {
    [name, options] = fixture;
  }

  let {code, metadata} = transformFileSync(`${baseDir}/${name}/actual.js`, {
    plugins: [
      [plugin, {
        ...options,
        messagesDir: false,
      }],
    ],
  });

  let generatedDescriptors = metadata['react-intl-generator'].generatedTexts;
  let namedDescriptors = generatedDescriptors.reduce((descriptorsWithKey, descriptor) => {
    descriptorsWithKey += `  NameTheKey: ${JSON.stringify(descriptor, null, 4).replace('}', '  }')},\n`;
    return descriptorsWithKey;
  }, '');

  let generatedDescriptorFile = `import { defineMessages } from 'react-intl'\n\nexport default defineMessages({\n${namedDescriptors}})`;

  fs.writeFileSync(`${baseDir}/${name}/expected.js`, `${code}\n`);
  fs.writeFileSync(`${baseDir}/${name}/expectedMessages.js`, `${generatedDescriptorFile}\n`);

});
