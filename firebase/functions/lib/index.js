"use strict";
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPaymentCreated = exports.getUserAnalytics = exports.monthlyAnalyticsAggregation = exports.sendAdminBroadcast = exports.dailyReminderCheck = void 0;
const admin = __importStar(require("firebase-admin"));
const reminders_1 = require("./reminders");
Object.defineProperty(exports, "dailyReminderCheck", { enumerable: true, get: function () { return reminders_1.dailyReminderCheck; } });
const notifications_1 = require("./notifications");
Object.defineProperty(exports, "sendAdminBroadcast", { enumerable: true, get: function () { return notifications_1.sendAdminBroadcast; } });
const analytics_1 = require("./analytics");
Object.defineProperty(exports, "monthlyAnalyticsAggregation", { enumerable: true, get: function () { return analytics_1.monthlyAnalyticsAggregation; } });
Object.defineProperty(exports, "getUserAnalytics", { enumerable: true, get: function () { return analytics_1.getUserAnalytics; } });
const payments_1 = require("./payments");
Object.defineProperty(exports, "onPaymentCreated", { enumerable: true, get: function () { return payments_1.onPaymentCreated; } });
// Initialize Firebase Admin SDK
admin.initializeApp();
//# sourceMappingURL=index.js.map