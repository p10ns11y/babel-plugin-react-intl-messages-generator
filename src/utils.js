export const defineMessageFormat = (descriptors) =>
`import { defineMessages } from 'react-intl';

export default defineMessages({\n${descriptors}});

`;

export const removeDefindeMessageFormat = (fileContent) =>
  fileContent
  .replace(`import { defineMessages } from 'react-intl';\n\n`, '')
  .replace(`export default defineMessages({\n`, '')
  .replace('\n});', '');

export const createDescriptorsWithKey = (descriptor) => {
  const lintFixedDescriptor = JSON.stringify(descriptor, null, 4)
    .replace('}', '  }')
    .replace('"id"', 'id')
    .replace('"defaultMessage"', 'defaultMessage')
    .replace(/\"/g, "'");

  const descriptorsWithKey = `  NameTheKey: ${lintFixedDescriptor},\n`;
  return descriptorsWithKey;
};
