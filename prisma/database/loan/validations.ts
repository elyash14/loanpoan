"use server"

import { getGlobalConfigs } from "@database/config/data";
import prisma from "@database/prisma";
import Decimal from "decimal.js";
import { GlobalConfigType } from "utils/types/configs";

export async function checkMinAndMaxLoanAmount(amount: number, accountId?: number) {
    const config = (await getGlobalConfigs()) as GlobalConfigType;
    const result = {
        minimumError: false,
        maximumError: false,
        maximum: 0,
        minimum: 0,
    };
    if (config.loan?.restrict) {
        const account = await prisma.account.findFirst({ where: { id: accountId } });
        const maximum = Decimal.mul(account?.balance!, config.loan.maximumFactor);
        if (new Decimal(amount) > maximum) {
            result.maximumError = true;
            result.maximum = maximum.toNumber();
        }
        const minimum = Decimal.mul(account?.balance!, config.loan.minimumFactor);
        if (new Decimal(amount) < minimum) {
            result.maximumError = true;
            result.minimum = minimum.toNumber();
        }
    }
    return result;
}