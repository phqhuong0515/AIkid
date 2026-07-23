"use strict";
/**
 * @storymee/sdk — product capability modules for multi-app clients.
 *
 * Usage:
 *   import { createStorymeeClient, createAuthApi, createGenerateApi, ... } from '@storymee/sdk';
 *   const client = createStorymeeClient({ baseURL, getAccessToken, ... });
 *   const auth = createAuthApi(client);
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStorymeeApis = createStorymeeApis;
__exportStar(require("./core"), exports);
__exportStar(require("./auth"), exports);
__exportStar(require("./generate"), exports);
__exportStar(require("./billing"), exports);
__exportStar(require("./family"), exports);
__exportStar(require("./profile"), exports);
__exportStar(require("./media"), exports);
__exportStar(require("./lms"), exports);
__exportStar(require("./notifications"), exports);
const auth_1 = require("./auth");
const billing_1 = require("./billing");
const family_1 = require("./family");
const generate_1 = require("./generate");
const profile_1 = require("./profile");
const media_1 = require("./media");
const lms_1 = require("./lms");
const notifications_1 = require("./notifications");
/** Bundle all capability APIs on one client */
function createStorymeeApis(client) {
    return {
        auth: (0, auth_1.createAuthApi)(client),
        generate: (0, generate_1.createGenerateApi)(client),
        billing: (0, billing_1.createBillingApi)(client),
        family: (0, family_1.createFamilyApi)(client),
        profile: (0, profile_1.createProfileApi)(client),
        media: (0, media_1.createMediaApi)(client),
        lms: (0, lms_1.createLmsApi)(client),
        notifications: (0, notifications_1.createNotificationsApi)(client),
        client,
    };
}
//# sourceMappingURL=index.js.map