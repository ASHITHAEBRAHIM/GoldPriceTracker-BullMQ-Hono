import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const goldPrices = sqliteTable('gold_prices', {
  id: integer('id').primaryKey(),
  kt22: text("kt22").notNull(),
  kt24: text("kt24").notNull(),
  updatedTime: text("updated_time").notNull(),
})
