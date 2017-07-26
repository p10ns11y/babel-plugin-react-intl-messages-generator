/*
 * Copyright 2017-Present, Peramanathan Sathyamoorthy.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import * as p from 'path';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { sync as mkdirpSync } from 'mkdirp';
import eol from 'eol';

import {
  createDescriptorsWithKey,
  defineMessageFormat,
  removeDefindeMessageFormat,
} from './utils';

const EXTRACTED_TAG = Symbol('DescriptorGenerated');

export default function({ types: t }) { // eslint-disable-line no-unused-vars

  function isTextIgnorable(text) {
    const hasWords = /^\w+/.test(text); // covers empty string
    const isNumber = /^\d+$/.test(text);
    return text.length === 1 || isNumber || !hasWords;
  }

  function generateDescriptorFromText(defaultMessage, path, state) {
    const {
      file,
      reactIntlMessages: { generatedDescriptors, proxyTexts },
    } = state;

    defaultMessage = defaultMessage.trim();

    if (isTextIgnorable(defaultMessage) || proxyTexts.has(defaultMessage))
      return;

    proxyTexts.add(defaultMessage);

    const prefixId = p
      .relative(process.cwd(), file.opts.filename)
      .split(p.sep)
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
          const { basename, filename } = file.opts;

          let generatedDescriptors = reactIntlMessages.generatedDescriptors;
          file.metadata['react-intl-defineMessages'] = { generatedDescriptors };

          if (opts.messagesDir && generatedDescriptors.length > 0) {
            let relativePath = p.join(
              p.sep,
              p.relative(process.cwd(), filename)
            ).replace(/\\/g, '/');

            let generatedMessagesFilename = p.join(
              opts.messagesDir,
              p.dirname(relativePath),
              basename + 'Messages.js'
            );

            let existingContent;
            if (existsSync(generatedMessagesFilename)) {
              existingContent = readFileSync(
                generatedMessagesFilename,
                'utf-8'
              );
            }

            let namedDesriptors = generatedDescriptors.reduce(
              (descriptorsWithKey, descriptor) => {

                if (existingContent) {
                  const { defaultMessage } = descriptor;
                  const messageExist = new RegExp(
                    `defaultMessage: '${defaultMessage}'`
                  );

                  if (messageExist.test(existingContent)) {
                    return descriptorsWithKey;
                  }
                }

                descriptorsWithKey += createDescriptorsWithKey(descriptor, opts);
                return descriptorsWithKey;
              },
              ''
            );

            mkdirpSync(p.dirname(generatedMessagesFilename));

            // updating existing file
            if (existingContent && namedDesriptors) {
              let oldDescriptors = removeDefindeMessageFormat(existingContent);

              let updatedNamedDescriptors = oldDescriptors + namedDesriptors;
              let updatedDescriptorFile = defineMessageFormat(
                updatedNamedDescriptors
              );

              writeFileSync(generatedMessagesFilename, eol.lf(updatedDescriptorFile));
            }

            // new file
            if (!existingContent && namedDesriptors) {
              let generatedDescriptorFile = defineMessageFormat(namedDesriptors);
              writeFileSync(generatedMessagesFilename, eol.lf(generatedDescriptorFile));
            }
            // else keep the file untouched
          }
        }, // exit ends
      }, // Program ends

      JSXText(path, state) {
        if (wasExtracted(path)) {
          return;
        }

        generateDescriptorFromText(path.node.value, path, state);

        // Tag the AST node so we don't try to extract it twice.
        tagAsExtracted(path);
      },

    }, // visitor ends
  };
}
