"use server"

import { RichTableSortDir } from "@dashboard/components/table/interface";
import prisma from "@database/prisma";
import { ITEMS_PER_PAGE } from "utils/configs";

export async function paginatedLoanList(
  page: number,
  limit: number,
  search?: string,
  sortBy?: string,
  sortDir?: RichTableSortDir,
  accountId?: number) {
  try {
    let where: any = {};

    // Add account filter if accountId is provided
    if (accountId) {
      where.accountId = accountId;
    }

    // Existing search logic
    if (search) {
      where = {
        ...where, // Keep the account filter if it exists
        account: {
          OR: [
            {
              code: { contains: search.toLowerCase(), mode: 'insensitive' },
            },
            {
              user: {
                OR: [
                  { firstName: { contains: search.toLowerCase(), mode: 'insensitive' } },
                  { lastName: { contains: search.toLowerCase(), mode: 'insensitive' } },
                ],
              }
            }
          ],
        },
      }
    }

    const [data, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        include: {
          account: {
            include: {
              user: {
                select: { id: true, fullName: true }
              }
            }
          }
        },
        take: limit ?? ITEMS_PER_PAGE,
        skip: (page - 1) * (limit ?? ITEMS_PER_PAGE),
        orderBy: {
          [sortBy ?? 'createdAt']: sortDir == '+' ? 'asc' : 'desc',
        },
      }),
      prisma.loan.count({
        where,
      })
    ]);

    return { total, data };
  } catch (error) {
    throw new Error("Failed to load loans list");
  }
}

export async function getLoan(id: number) {
  try {
    const [loan, currentPayment, paymentRemainAmount] = await Promise.all([
      prisma.loan.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              payments: {
                where: {
                  paidAt: { not: null }
                }
              }
            },
          },
          account: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true
                }
              }
            }
          },
          payments: true
        },
      }),
      prisma.payment.findFirst({
        where: {
          loanId: id,
          paidAt: null,
        },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.payment.aggregate({
        _sum: {
          amount: true
        },
        where: {
          loanId: id,
          paidAt: null
        }
      })
    ]);
    return { loan, currentPayment, paymentRemainAmount };
  } catch (error) {
    throw new Error("Failed to fetch the loan information");
  }
}