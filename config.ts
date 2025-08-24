/**
 * =============================================================================
 * CRITICAL SECURITY WARNING
 * =============================================================================
 *
 * This file is for demonstration purposes ONLY.
 *
 * DO NOT store real database credentials or any other sensitive information
 * in your frontend application code. This code is visible to anyone who uses
 * your website, and storing credentials here would create a massive
 * security vulnerability.
 *
 * In a real-world application, all database connections and queries MUST be
 * handled by a secure, server-side backend (e.g., using Node.js, Python,
 * Java, etc.). The frontend application should only communicate with this
 * backend via a secure API.
 *
 * The credentials below are placeholders to illustrate the structure. They
 * are not real and will not connect to any database.
 */
export const dbConfig = {
    host: 'jiira-dashboard.cevjasueletz.ap-south-1.rds.amazonaws.com',
    user: 'admin',
    password: '********', // This should never be in frontend code
    database: 'wsr_pmo',
};

// This export is here to prevent "file is not a module" errors
// in projects with isolatedModules enabled.
export {};