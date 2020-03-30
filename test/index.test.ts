import { transformSync } from '@babel/core';
import BabelPluginVueNextJsx from '../src';

const plugins = [BabelPluginVueNextJsx];

const parseCode = (example: string) =>
  transformSync(example, { plugins })!.code;

it('base', () => {
  const example = `const A = () => {} 
const Comp = () => <A style={{ height: '3rem', lineHeight: 4 }} />`;
  const code = parseCode(example);
  expect(code).toMatch(`const A = () => {};

const Comp = () => h(A, {
  "style": {
    height: '3rem',
    lineHeight: 4
  }
}, []);`);
});

it('children', () => {
  const example = `const A = () => {} 
const Comp = () => (
<A style={{ height: '3rem', lineHeight: 4 }}>
  <div>test</div>
  <div style={{height:'4px'}}>test</div>
</A>
)`;
  const code = parseCode(example);
  expect(code).toMatch(`const A = () => {};

const Comp = () => h(A, {
  "style": {
    height: '3rem',
    lineHeight: 4
  }
}, [h("div", {}, ["test"]), h("div", {
  "style": {
    height: '4px'
  }
}, ["test"])]);`);
});
