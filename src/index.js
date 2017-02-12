/*
 * Copyright 2017-Present, Peramanathan Sathyamoorthy.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import * as p from 'path';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { sync as mkdirpSync } from 'mkdirp';

const EXTRACTED_TAG = Symbol('DescriptorGenerated');

export default function ({types: t}) { // eslint-disable-line no-unused-vars

  function isTextIgnorable(text) {
    const hasWords = /^\w+/.test(text); // covers empty string
    const isNumber = /^\d+$/.test(text);
    return (text.length === 1 || isNumber || !hasWords );
  }

  function generateDescriptorFromText(defaultMessage, path, state) {
    const { file, reactIntlMessages : { generatedDescriptors, proxyTexts } } = state;

    defaultMessage = defaultMessage.trim();

    if (isTextIgnorable(defaultMessage) || proxyTexts.has(defaultMessage)) return;

    proxyTexts.add(defaultMessage);

    const prefixId = p.relative(
      process.cwd(),
      file.opts.filename
    ).split('/')
     .join('.')
     .replace(/jsx?/, '..');

    generatedDescriptors.push({ id: prefixId, defaultMessage });
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
          state.reactIntlMessages = {
            generatedDescriptors: [],
            proxyTexts: new Set(),
          };
        },

        exit(path, state) {
          const { file, opts, reactIntlMessages } = state;
          const {basename, filename}    = file.opts;

          let generatedDescriptors = reactIntlMessages.generatedDescriptors;
          file.metadata['react-intl-defineMessages'] = { generatedDescriptors };

          if (opts.messagesDir && generatedDescriptors.length > 0) {
            let relativePath = p.join(p.sep, p.relative(process.cwd(), filename));
            let generatedMessagesFilename = p.join(
              opts.messagesDir, p.dirname(relativePath), basename + 'Messages.js'
            );

            let existingContent;
            if (existsSync(generatedMessagesFilename)) {
              existingContent = readFileSync(generatedMessagesFilename, 'utf-8');
            }

            let namedDesriptors = generatedDescriptors.reduce((descriptorsWithKey, descriptor) => {
              if (existingContent && existingContent.indexOf(descriptor.defaultMessage) > -1) {
                return descriptorsWithKey;
              }

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

            mkdirpSync(p.dirname(generatedMessagesFilename));
            let generatedDescriptorFile = `import { defineMessages } from 'react-intl';\n\nexport default defineMessages({\n${namedDesriptors}});\n`;

            if (existingContent && namedDesriptors) { // updating existing file
              let parsedDescriptors = existingContent
                .replace(`import { defineMessages } from 'react-intl';\n\nexport default defineMessages({\n`, '')
                .replace('\n});', '');
              console.log(parsedDescriptors);

              let updatedNamedDescriptors = parsedDescriptors + namedDesriptors;
              generatedDescriptorFile = `import { defineMessages } from 'react-intl';\n\nexport default defineMessages({\n${updatedNamedDescriptors}});\n`;
              writeFileSync(generatedMessagesFilename, generatedDescriptorFile);
            }

            if(!existingContent && namedDesriptors) { // new file
              writeFileSync(generatedMessagesFilename, generatedDescriptorFile);
            } // else keep the file untouched
          }
        },
      },

      JSXText(path, state) {
        if (wasExtracted(path)) {
          return;
        }

        generateDescriptorFromText(path.node.value, path, state);

        // Tag the AST node so we don't try to extract it twice.
        tagAsExtracted(path);

      },
    },
  };
}
