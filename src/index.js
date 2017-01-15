/*
 * Copyright 2017-Present, Peramanathan Sathyamoorthy.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import * as p from 'path';
import { writeFileSync } from 'fs';
import { sync as mkdirpSync } from 'mkdirp';

const EXTRACTED_TAG = Symbol('DescriptorGenerated');

export default function ({types: t}) { // eslint-disable-line no-unused-vars

  function generateText(defaultMessage, path, state) {
    const { file, reactIntlMessagesGenerator } = state;

    if (!defaultMessage.trim()) return;
    console.log(path.node.parent);
    const pseudoId = p.relative(
      process.cwd(),
      file.opts.filename
    ).split('/')
     .join('.')
     .replace(/jsx?/, '..');

    const generatedDescriptor = { id: pseudoId, defaultMessage: defaultMessage.trim() };
    reactIntlMessagesGenerator.generatedTexts.push(generatedDescriptor);
  }

  function tagAsExtracted(path) {
    path.node[EXTRACTED_TAG] = true;
  }

  function wasExtracted(path) {
    return !!path.node[EXTRACTED_TAG];
  }

  return {
    visitor: {
      Program: {
        enter(path, state) {
          state.reactIntlMessagesGenerator = {
            generatedTexts: [],
          };
        },

        exit(path, state) {
          const { file, opts, reactIntlMessagesGenerator } = state;
          const {basename, filename}    = file.opts;

          let generatedDescriptors = reactIntlMessagesGenerator.generatedTexts;
          file.metadata['react-intl-generator'] = { generatedTexts: generatedDescriptors };

          if (opts.messagesDir && generatedDescriptors.length > 0) {
            let relativePath = p.join(p.sep, p.relative(process.cwd(), filename));
            let generatedMessagesFilename = p.join(opts.messagesDir, p.dirname(relativePath), basename + 'Messages.js' );

            let namedDesriptors = generatedDescriptors.reduce((descriptorsWithKey, descriptor) => {
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

            let generatedDescriptorFile = `import { defineMessages } from 'react-intl';\n\nexport default defineMessages({\n${namedDesriptors}});`;
            mkdirpSync(p.dirname(generatedMessagesFilename));
            writeFileSync(generatedMessagesFilename, generatedDescriptorFile);
          }
        },
      },

      JSXText(path, state) {
        if (wasExtracted(path)) {
          return;
        }
        generateText(path.node.value, path, state);

        // Tag the AST node so we don't try to extract it twice.
        tagAsExtracted(path);

      },
    },
  };
}
