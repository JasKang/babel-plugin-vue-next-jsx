import babel, { PluginItem } from '@babel/core'
import * as BabelTypes from '@babel/types'
import PluginSyntaxJsx from '@babel/plugin-syntax-jsx'
import {
  JSXAttribute,
  JSXSpreadAttribute,
  JSXElement,
  JSXIdentifier,
  Expression,
  ImportDeclaration,
  ImportSpecifier
} from '@babel/types'

type BaseBabel = typeof babel

type BaseTypes = typeof BabelTypes

interface ITypes extends BaseTypes {
  react: any
}
interface IBabel extends BaseBabel {
  types: ITypes
}

const getAttrs = (attrs: Array<JSXAttribute | JSXSpreadAttribute>, t: ITypes) => {
  const props: any[] = []
  attrs.forEach(attr => {
    if (attr.type === 'JSXAttribute') {
      const name = attr.name.name as string
      const value = attr.value
      if (t.isJSXExpressionContainer(value)) {
        props.push(t.objectProperty(t.stringLiteral(name), value.expression as Expression))
      } else {
        props.push(t.objectProperty(t.stringLiteral(name), value!))
      }
    } else if (attr.type === 'JSXSpreadAttribute') {
      props.push(t.spreadElement(attr.argument))
    }
  })

  return t.objectExpression(props)
}

const plugin = ({ types: t }: IBabel) => {
  return {
    name: 'babel-plugin-vue-next-jsx',
    inherits: PluginSyntaxJsx,
    visitor: {
      JSXNamespacedName(path) {
        throw path.buildCodeFrameError(
          'Namespaced tags/attributes are not supported. JSX is not XML.\n' +
            'For attributes like xlink:href, use xlinkHref instead.'
        )
      },
      JSXElement: {
        exit(path) {
          // 获取 jsx
          const openingPath = path.get('openingElement')
          const parent = openingPath.parent as JSXElement
          // children:Array
          const children = t.react.buildChildren(parent)

          const name = openingPath.node.name as JSXIdentifier
          const tagNode = t.react.isCompatTag(name.name) ? t.stringLiteral(name.name) : t.identifier(name.name)

          // // 创建 Vue h
          const createElement = t.identifier('h')
          const attrs = getAttrs(openingPath.node.attributes, t)
          const callExpr = t.callExpression(createElement, [tagNode, attrs, t.arrayExpression(children)])
          path.replaceWith(t.inherits(callExpr, path.node))
        }
      },
      JSXAttribute(path) {
        if (t.isJSXElement(path.node.value)) {
          path.node.value = t.jsxExpressionContainer(path.node.value)
        }
      },
      Program: {
        exit(path) {
          const hasImportedVue = path.node.body
            .filter(p => p.type === 'ImportDeclaration')
            .some(p => (p as ImportDeclaration).source.value == 'vue')

          // 注入 h 函数
          if (path.node.start === 0) {
            if (!hasImportedVue) {
              path.node.body.unshift(
                t.importDeclaration([t.importSpecifier(t.identifier('h'), t.identifier('h'))], t.stringLiteral('vue'))
              )
            } else {
              const vueSource = path.node.body
                .filter(p => p.type === 'ImportDeclaration')
                .find(p => (p as ImportDeclaration).source.value == 'vue') as ImportDeclaration
              const key = vueSource.specifiers
                .filter(s => s.type === 'ImportSpecifier')
                .map(s => (s as ImportSpecifier).imported.name)
              if (key.includes('h')) {
                // 已经引入 h 函数了
              } else {
                vueSource.specifiers.unshift(t.importSpecifier(t.identifier('h'), t.identifier('h')))
              }
            }
          }
        }
      }
    }
  } as PluginItem
}
export default plugin
