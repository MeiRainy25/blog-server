import { Logger } from '@nestjs/common';
import type { Prisma } from 'lib/prisma/client';

export enum EOperator {
  // 比较操作符
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  EQUAL = 'eq',
  NOT_EQUAL = 'ne',

  // 范围操作符
  BETWEEN = 'between',
  NOT_BETWEEN = 'not_between',

  // 模糊搜索操作符
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
}

export interface FilterCondition {
  logic: 'and' | 'or';
  property: Record<string, { operator: EOperator; value: string | any[] }>;
}

export class BlogQueryBuilder {
  private static readonly logger = new Logger(BlogQueryBuilder.name);

  /**
   * 构建 Prisma where 查询条件
   * @param conditions 过滤条件数组（支持单个条件包装成数组）
   * @returns Prisma.BlogWhereInput
   */
  static buildWhereQuery(conditions: FilterCondition[]): Prisma.BlogWhereInput {
    if (!conditions || conditions.length === 0) {
      return {};
    }

    const andConditions: Prisma.BlogWhereInput[] = [];
    const orConditions: Prisma.BlogWhereInput[] = [];

    conditions.forEach((condition) => {
      const whereClause = this.buildPropertyCondition(condition.property);

      if (condition.logic === 'and') {
        andConditions.push(whereClause);
      } else if (condition.logic === 'or') {
        orConditions.push(whereClause);
      }
    });

    const query: Prisma.BlogWhereInput = {};

    if (andConditions.length > 0) {
      query.AND = andConditions;
    }

    if (orConditions.length > 0) {
      query.OR = orConditions;
    }

    return query;
  }

  /**
   * 构建属性条件
   * @param property 属性条件对象
   * @returns Prisma.BlogWhereInput
   */
  private static buildPropertyCondition(
    property: Record<string, { operator: EOperator; value: string | any[] }>,
  ): Prisma.BlogWhereInput {
    const condition: Prisma.BlogWhereInput = {};

    // 处理每个字段的过滤条件
    for (const [field, fieldCondition] of Object.entries(property)) {
      const { operator, value } = fieldCondition;

      // 如果值为空或空数组，跳过此条件
      if (
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        continue;
      }

      switch (field) {
        case 'title':
          condition.title = this.buildStringFilter(operator, value as string);
          break;
        case 'content':
          condition.content = this.buildStringFilter(operator, value as string);
          break;
        case 'authorId':
          condition.authorId = this.buildStringFilter(
            operator,
            value as string,
          );
          break;
        case 'tags':
          condition.tags = this.buildTagFilter(operator, value as any[]);
          break;
        case 'createdAt':
        case 'updatedAt':
          condition[field] = this.buildDateRangeFilter(
            operator,
            value as any[],
          );
          break;
        default:
          condition[field as keyof Prisma.BlogWhereInput] =
            this.buildGenericFilter(operator, value as string);
      }
    }

    return condition;
  }

  /**
   * 构建字段条件
   */
  private static buildFieldCondition(
    field: string,
    operator: EOperator,
    value: string,
  ): Prisma.BlogWhereInput {
    const condition: Prisma.BlogWhereInput = {};

    switch (field.toLowerCase()) {
      case 'title':
        condition.title = this.buildStringFilter(operator, value);
        break;
      case 'content':
        condition.content = this.buildStringFilter(operator, value);
        break;
      case 'authorid':
        condition.authorId = this.buildStringFilter(operator, value);
        break;
      case 'createdat':
      case 'updatedat':
        condition[field as 'createdAt' | 'updatedAt'] = this.buildDateFilter(
          operator,
          value,
        );
        break;
      default:
        // 其他字段使用通用过滤
        condition[field as keyof Prisma.BlogWhereInput] =
          this.buildGenericFilter(operator, value);
    }

    return condition;
  }

  /**
   * 构建数组条件
   */
  private static buildArrayCondition(
    operator: EOperator,
    value: any[],
  ): Prisma.BlogWhereInput {
    // 主要用于标签ID数组或范围查询
    if (operator === EOperator.BETWEEN || operator === EOperator.NOT_BETWEEN) {
      // 范围查询，用于日期或数字
      return {
        createdAt: this.buildDateRangeFilter(operator, value),
      };
    } else {
      // 标签查询
      return {
        tags: this.buildTagFilter(operator, value),
      };
    }
  }

  /**
   * 构建字符串过滤条件
   */
  private static buildStringFilter(operator: EOperator, value: string): any {
    switch (operator) {
      case EOperator.CONTAINS:
        return { contains: value, mode: 'insensitive' };
      case EOperator.STARTS_WITH:
        return { startsWith: value, mode: 'insensitive' };
      case EOperator.ENDS_WITH:
        return { endsWith: value, mode: 'insensitive' };
      case EOperator.EQUAL:
        return { equals: value };
      case EOperator.NOT_EQUAL:
        return { not: value };
      case EOperator.NOT_CONTAINS:
        return { not: { contains: value, mode: 'insensitive' } };
      default:
        return { contains: value, mode: 'insensitive' };
    }
  }

  /**
   * 构建日期过滤条件
   */
  private static buildDateFilter(
    operator: EOperator,
    value: string,
  ): Prisma.DateTimeFilter {
    const dateValue = new Date(value);

    switch (operator) {
      case EOperator.EQUAL:
        return { equals: dateValue };
      case EOperator.GREATER_THAN:
        return { gt: dateValue };
      case EOperator.GREATER_THAN_OR_EQUAL:
        return { gte: dateValue };
      case EOperator.LESS_THAN:
        return { lt: dateValue };
      case EOperator.LESS_THAN_OR_EQUAL:
        return { lte: dateValue };
      case EOperator.NOT_EQUAL:
        return { not: dateValue };
      default:
        return { equals: dateValue };
    }
  }

  /**
   * 构建日期范围过滤条件
   */
  private static buildDateRangeFilter(operator: EOperator, value: any[]): any {
    if (value.length !== 2) {
      return {};
    }

    const [start, end] = value.map((v) => new Date(v as string));

    switch (operator) {
      case EOperator.BETWEEN:
        return {
          gte: start,
          lte: end,
        };
      case EOperator.NOT_BETWEEN:
        return {
          OR: [{ lt: start }, { gt: end }],
        };
      default:
        return {};
    }
  }

  /**
   * 构建标签过滤条件
   */
  private static buildTagFilter(operator: EOperator, value: any[]): any {
    switch (operator) {
      case EOperator.EQUAL:
      case EOperator.CONTAINS:
        return {
          some: {
            id: { in: value },
          },
        };
      case EOperator.NOT_EQUAL:
      case EOperator.NOT_CONTAINS:
        return {
          none: {
            id: { in: value },
          },
        };
      default:
        return {
          some: {
            id: { in: value },
          },
        };
    }
  }

  /**
   * 构建通用过滤条件
   */
  private static buildGenericFilter(operator: EOperator, value: string): any {
    switch (operator) {
      case EOperator.EQUAL:
        return { equals: value };
      case EOperator.NOT_EQUAL:
        return { not: value };
      case EOperator.CONTAINS:
        return { contains: value, mode: 'insensitive' };
      case EOperator.STARTS_WITH:
        return { startsWith: value, mode: 'insensitive' };
      case EOperator.ENDS_WITH:
        return { endsWith: value, mode: 'insensitive' };
      case EOperator.NOT_CONTAINS:
        return { not: { contains: value, mode: 'insensitive' } };
      default:
        return { equals: value };
    }
  }
}
