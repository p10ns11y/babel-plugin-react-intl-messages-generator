import * as p from 'path';
import * as fs from 'fs';
import {transformFileSync} from 'babel-core';
import plugin from '../src/index';

const baseDir = p.resolve(`${__dirname}/../test/fixtures`);

function generateFiles(metadata, name, code) {
  let generatedDescriptors = metadata['react-intl-defineMessages'].generatedDescriptors;
  let namedDescriptors = generatedDescriptors.reduce((descriptorsWithKey, descriptor) => {
    const lintFixedDescriptor = JSON.stringify(
      descriptor, null, 4
    )
    .replace('}', '  }')
    .replace('\"id\"', 'id')
    .replace('\"defaultMessage\"', 'defaultMessage')
    .replace(/\"/g, '\'');

    descriptorsWithKey += `  NameTheKey: ${lintFixedDescriptor},\n`;
    return descriptorsWithKey;
  }, '');

  let generatedDescriptorFile = `import { defineMessages } from 'react-intl';\n\nexport default defineMessages({\n${namedDescriptors}});`;

  fs.writeFileSync(`${baseDir}/${name}/expected.js`, `${code}\n`);
  fs.writeFileSync(`${baseDir}/${name}/expectedMessages.js`, `${generatedDescriptorFile}\n`);
}


/* TODO: Support extractSourceLocation option */
const fixtures = [
  'componentMessages',
  'statelessComponentMessages',
  'duplicateMessages',
  'skipNumberMessages',
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

  generateFiles(metadata, name, code);
});


// component updated after extraction
let {code, metadata} = transformFileSync(`${baseDir}/componentWithNewMessages/actualWithNew.js`, {
  plugins: [
    [plugin, {
      messagesDir: false,
    }],
  ],
});

generateFiles(metadata, 'componentWithNewMessages', code);
