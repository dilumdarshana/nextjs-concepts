import { pgTable, serial, varchar, doublePrecision } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  price: doublePrecision('price').notNull(),
});
