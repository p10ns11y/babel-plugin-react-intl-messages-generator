# babel-plugin-react-intl-messages-generator
Build skeleton `messages` files with `defineMessage` format for each component that contains explicit texts

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

#### Options

- **`messagesDir`**: The target location where the plugin will output a `.js` file corresponding to each component from which messages were extracted. If not provided, the extracted message descriptors will only be accessible via Babel's API.


### Via CLI

```sh
$ babel --plugins react-intl-messages-generator script.js
```

### Via Node API

The extract message descriptors are available via the `metadata` property on the object returned from Babel's `transform()` API:

```javascript
require('babel-core').transform('code', {
  plugins: ['react-intl-messages-generator']
}) // => { code, map, ast, metadata['react-intl-defineMessages'].messages };
```
