import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isTiptapNode(node: unknown): node is TiptapNode {
  if (!isPlainObject(node)) return false;
  if (typeof node.type !== 'string' || node.type.length === 0) return false;

  // attrs 可选，但必须是对象
  if (
    'attrs' in node &&
    node.attrs !== undefined &&
    !isPlainObject(node.attrs)
  ) {
    return false;
  }

  // text 可选，但必须是字符串（TipTap 的 text node）
  if (
    'text' in node &&
    node.text !== undefined &&
    typeof node.text !== 'string'
  ) {
    return false;
  }

  // marks 可选，但必须是数组且每个 mark 有 type
  if ('marks' in node && node.marks !== undefined) {
    if (!Array.isArray(node.marks)) return false;
    for (const m of node.marks) {
      if (
        !isPlainObject(m) ||
        typeof m.type !== 'string' ||
        m.type.length === 0
      ) {
        return false;
      }
      if ('attrs' in m && m.attrs !== undefined && !isPlainObject(m.attrs)) {
        return false;
      }
    }
  }

  // content 可选，但必须是数组且每个元素递归是 node
  if ('content' in node && node.content !== undefined) {
    if (!Array.isArray(node.content)) return false;
    // 递归校验（深度不做限制；如担心 DoS 可加 depth limit）
    for (const child of node.content) {
      if (!isTiptapNode(child)) return false;
    }
  }

  return true;
}

/**
 * TipTap 根文档一般是 { type: 'doc', content: [...] }
 */
export function IsTiptapJson(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTiptapJson',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (!isPlainObject(value)) return false;
          // 要求根节点必须是 doc（你也可以放宽）
          if (value.type !== 'doc') return false;
          return isTiptapNode(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} 必须是有效的 TipTap JSON（ProseMirror）结构`;
        },
      },
    });
  };
}
