# babel-plugin-react-intl-messages-generator
Build skeleton `messages` files with `defineMessage` format for each component that contains explicit texts

___This is a fork of that fixes some issues on Windows systems.___
Hopefully the fork will become obsolete after the issues have been fixed or the solutions merged.
The original project is located at https://github.com/p10ns11y/babel-plugin-react-intl-messages-generator and https://www.npmjs.com/package/babel-plugin-react-intl-messages-generator.

## Installation

```sh
$ npm install babel-plugin-react-intl-messages-generator
```

## Usage

**This Babel plugin only visits ES6 JSX modules.**

All the explicit texts will be extracted from the component and corresponding messages file generated.

```
// app/components/Foo.js
import React, {Component} from 'react';

export default class Foo extends Component {
  render() {
    return (
      <div>
        <span>Hello</span>
        world
      </div>
    );
  }
}
```

The above component will produce

```
import { defineMessages } from 'react-intl';

export default defineMessages({
  NameTheKey: {
    id: 'app.components.Foo...',
    defaultMessage: 'Hello'
  },
  NameTheKey: {
    id: 'app.components.Foo...',
    defaultMessage: 'world'
  },
});

```

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": [
    ["react-intl-messages-generator", {
        "messagesDir": "./build/messages/"
    }]
  ]
}
```

(Confidently Recommended 😏)

Even better use the root directory [`"messagesDir": "./"`] so it will place the messages file where the component exists. So they files are co-located. No worries if you have edited the file already.
Only new unique `defaultMessage` appended as `descriptor` at the end of previous list of `descriptors`

#### Options

- **`messagesDir`**: The target location where the plugin will output a `.js` file corresponding to each component from which messages were extracted. If not provided, the extracted message descriptors will only be accessible via Babel's API.

- **`intendation`**: A string that will be used to intend the generated messages. Defaults to `"    "` (four spaces ).

### Via CLI

```sh
$ babel --plugins react-intl-messages-generator script.js
```

### Via Node API

The explicit texts converted as descriptors are available via the `metadata` property on the object returned from Babel's `transform()` API:

```javascript
require('babel-core').transform('code', {
  plugins: ['react-intl-messages-generator']
}) // => { code, map, ast, metadata['react-intl-defineMessages'].generatedDescriptors };
```
