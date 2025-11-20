/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as appointmentRequests from "../appointmentRequests.js";
import type * as appointments from "../appointments.js";
import type * as brides from "../brides.js";
import type * as crons from "../crons.js";
import type * as emails from "../emails.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as import_ from "../import.js";
import type * as inventory from "../inventory.js";
import type * as migrations from "../migrations.js";
import type * as payments from "../payments.js";
import type * as seed_test_data from "../seed_test_data.js";
import type * as settings from "../settings.js";
import type * as stripe from "../stripe.js";
import type * as tasks from "../tasks.js";
import type * as verify_analytics from "../verify_analytics.js";
import type * as verify_saturday_savior from "../verify_saturday_savior.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  appointmentRequests: typeof appointmentRequests;
  appointments: typeof appointments;
  brides: typeof brides;
  crons: typeof crons;
  emails: typeof emails;
  files: typeof files;
  http: typeof http;
  import: typeof import_;
  inventory: typeof inventory;
  migrations: typeof migrations;
  payments: typeof payments;
  seed_test_data: typeof seed_test_data;
  settings: typeof settings;
  stripe: typeof stripe;
  tasks: typeof tasks;
  verify_analytics: typeof verify_analytics;
  verify_saturday_savior: typeof verify_saturday_savior;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
