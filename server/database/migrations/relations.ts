import { relations } from "drizzle-orm/relations";
import { _order, deliveryaddress, customer, orderline, package } from "./schema";

export const deliveryaddressRelations = relations(deliveryaddress, ({one}) => ({
	_order: one(_order, {
		fields: [deliveryaddress.orderId],
		references: [_order.id]
	}),
}));

export const _orderRelations = relations(_order, ({one, many}) => ({
	deliveryaddresses: many(deliveryaddress),
	customer: one(customer, {
		fields: [_order.customerId],
		references: [customer.id]
	}),
	orderlines: many(orderline),
}));

export const customerRelations = relations(customer, ({many}) => ({
	_orders: many(_order),
}));

export const orderlineRelations = relations(orderline, ({one, many}) => ({
	_order: one(_order, {
		fields: [orderline.orderId],
		references: [_order.id]
	}),
	packages: many(package),
}));

export const packageRelations = relations(package, ({one}) => ({
	orderline: one(orderline, {
		fields: [package.lineId],
		references: [orderline.id]
	}),
}));