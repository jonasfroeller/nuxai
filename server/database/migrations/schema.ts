import { pgTable, serial, integer, text, numeric, boolean } from "drizzle-orm/pg-core"

export const deliveryaddress = pgTable("deliveryaddress", {
	id: serial("id").primaryKey().notNull(),
	orderId: integer("orderId").references(() => _order.id),
	name: text("name"),
	street: text("street"),
	postalCode: text("postalCode"),
	postalPlace: text("postalPlace"),
	countryCode: text("countryCode"),
});

export const customer = pgTable("customer", {
	id: serial("id").primaryKey().notNull(),
	name: text("name"),
	balance: numeric("balance"),
	isActive: boolean("isActive"),
});

export const _order = pgTable("_order", {
	id: serial("id").primaryKey().notNull(),
	orderDate: text("orderDate"),
	customerId: integer("customerId").references(() => customer.id),
});

export const orderline = pgTable("orderline", {
	id: serial("id").primaryKey().notNull(),
	orderId: integer("orderId").references(() => _order.id),
	product: text("product"),
	amount: numeric("amount", { precision: 10, scale: 2 }),
});

export const package = pgTable("package", {
	packageId: serial("packageId").primaryKey().notNull(),
	lineId: integer("lineId").references(() => orderline.id),
	sscc: text("sscc"),
});