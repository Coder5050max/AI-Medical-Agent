// my-app/config/schema.ts
import { integer, json, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
});

// IMPORTANT: Ensure voiceId and agentPrompt are included here
export type DoctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string; // Must be here
  voiceId: string;     // Must be here
};

export const SessionChatTable = pgTable('sessionChatTable', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  sessionID: varchar('session_id').notNull().unique(),
  notes: text('notes'),
  SelectedDoctor: json('selected_doctor').notNull(), // Stores the full DoctorAgent object
  agentPrompt: text('agent_prompt').notNull(),       // Redundant but good for direct access
  voiceId: text("voice_id").notNull(),               // Redundant but good for direct access
  conversation: json('conversation'),
  report: json('report'),
  createdBy: varchar('created_by').references(() => usersTable.email),
  createdOn: varchar('created_on').notNull(),
});