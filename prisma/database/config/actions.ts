"use server";

import prisma from "@database/prisma";
import { revalidateTag } from "next/cache";
import { SaveCurrencyResponseType, saveCurrencySchema } from "utils/form-validations/config/saveCurrencyConfig";
import { SaveGeneralConfigResponseType, saveGeneralConfigSchema } from "utils/form-validations/config/saveGlobalConfig";
import { GlobalConfigType } from "utils/types/configs";
import { getGlobalConfigs } from "./data";

export async function saveCurrencyConfig(formData: FormData): Promise<SaveCurrencyResponseType> {
  // validate the form data on the server
  const validatedFields = saveCurrencySchema.safeParse({
    name: formData.get('name'),
    symbol: formData.get('symbol'),
  })
  // Return early if the form data is invalid
  if (!validatedFields.success) {
    return {
      status: "ERROR",
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  // save data to the database
  try {
    const config = (await getGlobalConfigs()) as GlobalConfigType;
    const newConfig: GlobalConfigType = {
      ...config,
      currency: {
        name: validatedFields.data.name,
        symbol: validatedFields.data.symbol,
      }
    }

    await prisma.config.upsert({
      where: {
        name: "global"
      },
      update: {
        value: newConfig,
      },
      create: {
        name: 'global',
        value: newConfig
      }
    });

    revalidateTag('global-config');
    return {
      status: "SUCCESS",
      message: "Currency saved successfully",
    }
  } catch (error) {
    console.error(error);
    return {
      status: "ERROR",
      message: "Failed to save currency",
    }
  }
}

export async function saveGeneralConfig(formData: FormData): Promise<SaveGeneralConfigResponseType> {
  // validate the form data on the server
  const validatedFields = saveGeneralConfigSchema.safeParse({
    applicationName: formData.get('applicationName'),
    dateType: formData.get('dateType'),
  })
  // Return early if the form data is invalid
  if (!validatedFields.success) {
    return {
      status: "ERROR",
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  // save data to the database
  try {
    const config = (await getGlobalConfigs()) as GlobalConfigType;
    const newConfig: GlobalConfigType = {
      applicationName: validatedFields.data.applicationName,
      dateType: validatedFields.data.dateType,
      ...config
    }

    await prisma.config.upsert({
      where: {
        name: "global"
      },
      update: {
        value: newConfig,
      },
      create: {
        name: 'global',
        value: newConfig
      },
    });

    revalidateTag('global-config');
    return {
      status: "SUCCESS",
      message: "Currency saved successfully",
    }
  } catch (error) {
    console.error(error);
    return {
      status: "ERROR",
      message: "Failed to save currency",
    }
  }
}