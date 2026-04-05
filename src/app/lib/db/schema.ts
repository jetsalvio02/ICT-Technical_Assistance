import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "User",
  "Technician",
  "Administrator",
]);

export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const priorityEnum = pgEnum("priority_level", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const categoryTypeEnum = pgEnum("category_type", [
  "hardware",
  "software",
  "network",
  "other",
]);

export const findingStatusEnum = pgEnum("finding_status", [
  "good",
  "authorized",
  "replacement",
  "unserviceable",
]);

export const settings = pgTable("settings", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  facebookLink: text("facebook_link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;

export const systemSettings = pgTable("system_settings", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  infoOfficerId: uuid("info_officer_id").references(() => users.id, {
    onDelete: "set null",
  }),
  facebookLink: text("facebook_link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// 1. Users
// ─────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  middleName: text("middle_name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  officeId: uuid("office_id"),
  districtId: uuid("district_id").references(() => districts.id),
  role: userRoleEnum("role").notNull().default("User"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ─────────────────────────────────────────────
// 2. Districts
// ─────────────────────────────────────────────

export const districts = pgTable("districts", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  type: text("type").notNull().default("District"), // 'District' or 'Cluster'
  code: text("code"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type District = typeof districts.$inferSelect;
export type NewDistrict = typeof districts.$inferInsert;

// ─────────────────────────────────────────────
// 3. Offices
// ─────────────────────────────────────────────

export const offices = pgTable("offices", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull().default("Office"), // 'Office' or 'School'
  districtId: uuid("district_id")
    .references(() => districts.id)
    .notNull(),
  schoolHead: text("school_head"),
  schoolHeadContact: text("school_head_contact"),
  ictCoordinator: text("ict_coordinator"),
  ictCoordinatorContact: text("ict_coordinator_contact"),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Office = typeof offices.$inferSelect;
export type NewOffice = typeof offices.$inferInsert;

// ─────────────────────────────────────────────
// 4. Service Requests
// ─────────────────────────────────────────────

export const serviceRequests = pgTable("service_requests", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  requestNumber: text("request_number").notNull().unique(),
  requesterId: uuid("requester_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  officeId: uuid("office_id")
    .references(() => offices.id)
    .notNull(),
  districtId: uuid("district_id")
    .references(() => districts.id)
    .notNull(),

  // Contact overrides (may differ from office defaults per request)
  schoolHead: text("school_head"),
  schoolHeadContact: text("school_head_contact"),
  ictCoordinator: text("ict_coordinator"),
  ictCoordinatorContact: text("ict_coordinator_contact"),
  depEdEmail: text("deped_email"),
  recoveryPersonalEmail: text("recovery_personal_email"),
  recoveryMobileNumber: text("recovery_mobile_number"),

  // Problem
  problemDescription: text("problem_description").notNull(),

  // Scheduling & workflow
  dateOfRequest: timestamp("date_of_request").notNull(),
  timeOfRequest: text("time_of_request"),
  status: requestStatusEnum("status").notNull().default("pending"),
  priority: priorityEnum("priority").notNull().default("medium"),
  assignedToId: uuid("assigned_to_id").references(() => users.id, {
    onDelete: "set null",
  }),
  assignedAt: timestamp("assigned_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type NewServiceRequest = typeof serviceRequests.$inferInsert;

// ─────────────────────────────────────────────
// 5. Request Categories (nature of request)
// ─────────────────────────────────────────────

export const requestCategories = pgTable("request_categories", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  requestId: uuid("request_id")
    .references(() => serviceRequests.id, { onDelete: "cascade" })
    .notNull(),
  categoryType: categoryTypeEnum("category_type").notNull(),
  subCategory: text("sub_category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RequestCategory = typeof requestCategories.$inferSelect;
export type NewRequestCategory = typeof requestCategories.$inferInsert;

// ─────────────────────────────────────────────
// 6. Findings
// ─────────────────────────────────────────────

export const findings = pgTable("findings", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  requestId: uuid("request_id")
    .references(() => serviceRequests.id, { onDelete: "cascade" })
    .notNull(),
  technicianId: uuid("technician_id").references(() => users.id, {
    onDelete: "set null",
  }),
  itemDescription: text("item_description").notNull(),
  serialNumber: text("serial_number"),
  problemIssue: text("problem_issue").notNull(),
  status: findingStatusEnum("status"),
  recommendationDescription: text("recommendation_description"),
  actionTaken: text("action_taken"),
  inspectedAt: timestamp("inspected_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Finding = typeof findings.$inferSelect;
export type NewFinding = typeof findings.$inferInsert;

// ─────────────────────────────────────────────
// 7. Notifications
// ─────────────────────────────────────────────

export const notifications = pgTable("notifications", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  requestId: uuid("request_id").references(() => serviceRequests.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// ─────────────────────────────────────────────
// 8. Audit Log
// ─────────────────────────────────────────────

export const auditLog = pgTable("audit_log", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  tableName: text("table_name").notNull(),
  recordId: uuid("record_id").notNull(),
  action: text("action").notNull(),
  oldValues: text("old_values"),
  newValues: text("new_values"),
  performedBy: uuid("performed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;

// ─────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  office: one(offices, {
    fields: [users.officeId],
    references: [offices.id],
  }),
  district: one(districts, {
    fields: [users.districtId],
    references: [districts.id],
  }),
  submittedRequests: many(serviceRequests, { relationName: "requester" }),
  assignedRequests: many(serviceRequests, { relationName: "assignedTo" }),
  findings: many(findings),
  notifications: many(notifications),
  auditLogs: many(auditLog),
}));

export const districtsRelations = relations(districts, ({ many }) => ({
  offices: many(offices),
  serviceRequests: many(serviceRequests),
}));

export const officesRelations = relations(offices, ({ one, many }) => ({
  district: one(districts, {
    fields: [offices.districtId],
    references: [districts.id],
  }),
  users: many(users),
  serviceRequests: many(serviceRequests),
}));

export const serviceRequestsRelations = relations(
  serviceRequests,
  ({ one, many }) => ({
    requester: one(users, {
      fields: [serviceRequests.requesterId],
      references: [users.id],
      relationName: "requester",
    }),
    assignedTo: one(users, {
      fields: [serviceRequests.assignedToId],
      references: [users.id],
      relationName: "assignedTo",
    }),
    office: one(offices, {
      fields: [serviceRequests.officeId],
      references: [offices.id],
    }),
    district: one(districts, {
      fields: [serviceRequests.districtId],
      references: [districts.id],
    }),
    categories: many(requestCategories),
    findings: many(findings),
    notifications: many(notifications),
  }),
);

export const requestCategoriesRelations = relations(
  requestCategories,
  ({ one }) => ({
    request: one(serviceRequests, {
      fields: [requestCategories.requestId],
      references: [serviceRequests.id],
    }),
  }),
);

export const findingsRelations = relations(findings, ({ one }) => ({
  request: one(serviceRequests, {
    fields: [findings.requestId],
    references: [serviceRequests.id],
  }),
  technician: one(users, {
    fields: [findings.technicianId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  request: one(serviceRequests, {
    fields: [notifications.requestId],
    references: [serviceRequests.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  performer: one(users, {
    fields: [auditLog.performedBy],
    references: [users.id],
  }),
}));
