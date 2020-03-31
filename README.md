# TSDX Bootstrap

```javascript
const A = () => {};

const a = { a: '1', b: '2' };

const Comp = () => (
  <A style={{ height: '3rem', lineHeight: 4 }} {...a}>
    <div>test</div>
    <div style={{ height: '4px' }}>test</div>
  </A>
);
```

```javascript
import { h } from 'vue';

const A = () => {};

const a = {
  a: '1',
  b: '2',
};

const Comp = () =>
  h(
    A,
    {
      style: {
        height: '3rem',
        lineHeight: 4,
      },
      ...a,
    },
    [
      h('div', {}, ['test']),
      h(
        'div',
        {
          style: {
            height: '4px',
          },
        },
        ['test']
      ),
    ]
  );
```
