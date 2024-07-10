// src/db.ts
import { drizzle } from 'drizzle-orm/libsql';
import { goldPrices } from './schema';
import type { GoldPriceData } from './types';
import { createClient } from '@libsql/client';
import { config } from "dotenv";
import * as schema from "./schema";

config({ path: ".env"});

const client = createClient({
    url: process.env.DATABASE_URL as string,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

export const db = drizzle(client, { schema });

export async function insertGoldPrice(data: GoldPriceData) {
    console.log('Inserting gold price data:', data);
    try {
      await db.insert(goldPrices).values({
        kt22: data['22kt'],
        kt24: data['24kt'],
        updatedTime: data.updated_time,
    });
      console.log('Gold price data inserted successfully');
    } catch (error) {
      console.error('Error inserting gold price data:', error);
      throw error;
    }
  }

