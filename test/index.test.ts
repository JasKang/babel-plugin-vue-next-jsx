import { transformSync } from '@babel/core';
import BabelPluginVueNextJsx from '../src';

const plugins = [BabelPluginVueNextJsx];

const parseCode = (example: string) =>
  transformSync(example, { plugins })!.code;

it('parses the jsx', () => {
  const example = `const A = () => {} 
const Comp = () => <A sx={{ mb: '3rem', lineHeight: 4 }} />`;
  const code = parseCode(example);
  expect(code).toMatch(`const A = () => {};

const Comp = () => h(A, {
  "sx": {
    mb: '3rem',
    lineHeight: 4
  }
}, []);`);
});
