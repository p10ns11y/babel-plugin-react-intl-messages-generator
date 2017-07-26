import eol from 'eol';

export const defineMessageFormat = (descriptors) =>
`import { defineMessages } from 'react-intl';

export default defineMessages({\n${descriptors}});

`;

export const removeDefindeMessageFormat = (fileContent) =>
  eol.lf(fileContent)
  .replace(`import { defineMessages } from 'react-intl';\n\n`, '')
  .replace(`export default defineMessages({\n`, '')
  .replace('\n});', '');

export const createDescriptorsWithKey = (descriptor, {intendation = '    '}) => {
  const lintFixedDescriptor = JSON.stringify(descriptor, null, 4)
    .replace('}', `${intendation}}`)
    .replace('"id"', `${intendation}id`)
    .replace('"defaultMessage"', `${intendation}defaultMessage`)
    .replace(/\"/g, "'");

  const descriptorsWithKey = `${intendation}NameTheKey: ${lintFixedDescriptor},\n`;
  return descriptorsWithKey;
};
