import { OpenAPIV3 } from "openapi-types";
import swaggerUi from "swagger-ui-express";

const swaggerDocument: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: {
        title: "AutoRia Clone API Documentation",
        version: "1.0.0",
        description: "API documentations for AutoRia Clone",
    },
    servers: [
        {
            url: "http://localhost:5000",
            description: "Local server",
        },
    ],
    tags: [
        { name: "Admin", description: "Admin endpoints" },
        { name: "Management", description: "Management endpoints" },
        { name: "Auth", description: "Authentication endpoints" },
        { name: "Users", description: "Users endpoints" },
        { name: "Cars", description: "Cars endpoints" },
        { name: "Brands", description: "Brands endpoints" },
    ],
    paths: {
        "/admin/create": {
            post: {
                tags: ["Admin"],
                summary: "Create first admin",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: [
                                    "name",
                                    "surname",
                                    "age",
                                    "email",
                                    "password",
                                    "phone",
                                    "region",
                                    "city",
                                    "key",
                                ],
                                properties: {
                                    name: { type: "string" },
                                    surname: { type: "string" },
                                    age: { type: "integer" },
                                    email: { type: "string" },
                                    password: { type: "string" },
                                    phone: { type: "string" },
                                    city: { type: "string" },
                                    region: { type: "string" },
                                    key: {
                                        type: "string",
                                        example: "super-secret-key-123",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Admin created",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/UserResponse",
                                },
                            },
                        },
                    },
                    "400": {
                        description:
                            "Validation error (e.g., age < 18, invalid email format)",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden. Invalid initialization key.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "409": {
                        description: "Email or phone already exist",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/admin/manager": {
            post: {
                tags: ["Admin"],
                summary: "Create a manager",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: [
                                    "name",
                                    "surname",
                                    "age",
                                    "email",
                                    "password",
                                    "phone",
                                    "region",
                                    "city",
                                ],
                                properties: {
                                    name: { type: "string" },
                                    surname: { type: "string" },
                                    age: { type: "integer" },
                                    email: { type: "string" },
                                    password: { type: "string" },
                                    phone: { type: "string" },
                                    city: { type: "string" },
                                    region: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Manager created",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/UserResponse",
                                },
                            },
                        },
                    },
                    "400": {
                        description:
                            "Validation error (e.g., age < 18, invalid email format)",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "403": {
                        description:
                            "Forbidden: You don't have the required permission",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "409": {
                        description: "Email or phone already exist",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/admin/{userId}/upgrade-role": {
            patch: {
                tags: ["Admin"],
                summary: "Upgrade user role or account type",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "userId",
                        in: "path",
                        required: true,
                        description: "ID of the user to upgrade",
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpgradeRoleDto",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "User successfully upgraded",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/UserResponse",
                                },
                            },
                        },
                    },
                    "400": {
                        description:
                            "Bad request: Invalid role or account type or userId",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "403": {
                        description:
                            "Forbidden. Reasons: 1. Insufficient permissions. 2. Admins cannot change their own role.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "User not found",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/management/users": {
            get: {
                tags: ["Management"],
                summary: "Get all users with filters",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "page",
                        in: "query",
                        schema: { type: "integer", default: 1 },
                    },
                    {
                        name: "pageSize",
                        in: "query",
                        schema: { type: "integer", default: 10 },
                    },
                    { name: "search", in: "query", schema: { type: "string" } },
                    {
                        name: "orderBy",
                        in: "query",
                        schema: {
                            type: "string",
                            enum: ["name", "age"],
                            default: "name",
                        },
                    },
                    {
                        name: "order",
                        in: "query",
                        schema: {
                            type: "string",
                            enum: ["asc", "desc"],
                            default: "asc",
                        },
                    },
                    {
                        name: "role",
                        in: "query",
                        schema: {
                            type: "string",
                            enum: ["buyer", "seller", "manager", "admin"],
                        },
                    },
                    {
                        name: "isBanned",
                        in: "query",
                        schema: { type: "boolean", default: false },
                    },
                    {
                        name: "isDeleted",
                        in: "query",
                        schema: { type: "boolean", default: false },
                    },
                ],
                responses: {
                    "200": {
                        description: "List of users",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/UserListResponse",
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad request (Validation Error)",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/management/{userId}/ban": {
            patch: {
                tags: ["Management"],
                summary: "Ban user",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "userId",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": { description: "Banned" },
                    "400": {
                        description: "Bad request (Validation Error)",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "403": {
                        description:
                            "Reasons: 1. You cannot ban yourself, 2. Manager cannot ban an admin. 3. Forbidden: You don't have the required permission",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/management/{userId}/unban": {
            patch: {
                tags: ["Management"],
                summary: "Unban user",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "userId",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": { description: "Unbanned" },
                    "400": {
                        description: "Bad request (Validation Error)",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "User not found",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "management/{userId}": {
            delete: {
                tags: ["Management"],
                summary: "Delete user",
                security: [{ bearerAut: [] }],
                parameters: [
                    {
                        name: "userId",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "204": { description: "No content" },
                    "400": {
                        description: "Bad request (Validation Error)",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "403": {
                        description:
                            "Reasons: 1. You don't have permission to delete users. 2. Administrative accounts cannot be self-deleted",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "User not found",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/management/{carId}/validate": {
            patch: {
                tags: ["Management"],
                summary: "Validate car listing",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "carId",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": { description: "Validated" },
                    "400": {
                        description: "Bad request (Validation Error)",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "403": {
                        description:
                            "Forbidden: You don't have the required permission",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Car not found",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/management/brand-models": {
            post: {
                tags: ["Management"],
                summary: "Add brand and models",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["brand", "models"],
                                properties: {
                                    brand: { type: "string", example: "BMW" },
                                    models: {
                                        type: "array",
                                        items: { type: "string" },
                                        example: ["X5", "M3"],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Brand and models successfully added",
                        content: {
                            "application/json": {
                                schema: {
                                    allOf: [
                                        {
                                            $ref: "#/components/schemas/BrandConfig",
                                        },
                                        {
                                            type: "object",
                                            properties: {
                                                createdAt: {
                                                    type: "string",
                                                    format: "date-time",
                                                },
                                                updatedAt: {
                                                    type: "string",
                                                    format: "date-time",
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad request (Validation Error)",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "403": {
                        description:
                            "Forbidden: You don't have the required permission",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/auth/sign-up": {
            post: {
                tags: ["Auth"],
                summary: "Register a new user",
                requestBody: {
                    required: true,
                    content: {
                        "application-json": {
                            schema: {
                                type: "object",
                                required: [
                                    "name",
                                    "surname",
                                    "age",
                                    "email",
                                    "password",
                                    "phone",
                                ],
                                properties: {
                                    name: {
                                        type: "string",
                                        example: "Alexander",
                                    },
                                    surname: {
                                        type: "string",
                                        example: "Novak",
                                    },
                                    age: {
                                        type: "integer",
                                        example: 34,
                                    },
                                    email: {
                                        type: "string",
                                        example: "alex@gmail.com",
                                    },
                                    password: {
                                        type: "string",
                                        example: "Password1234$",
                                    },
                                    phone: {
                                        type: "string",
                                        example: "+3809.......",
                                    },
                                    city: {
                                        type: "string",
                                        example: "Lviv",
                                    },
                                    region: {
                                        type: "string",
                                        example: "Lviv",
                                    },
                                    role: {
                                        type: "string",
                                        enum: ["buyer", "seller"],
                                        default: "buyer",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "User registered successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/AuthResponse",
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad request (Validation Error)",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "409": {
                        description: "Email or Phone already exists",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/auth/sign-in": {
            post: {
                tags: ["Auth"],
                summary: "Login to account",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string" },
                                    password: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Logged in successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/AuthResponse",
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad request (Validation Error)",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/auth/refresh": {
            post: {
                tags: ["Auth"],
                summary: "Refresh tokens (Requires Refresh Token)",
                description:
                    "Send your **Refresh Token** in the Authorization header to get a new pair of tokens.",
                security: [{ bearerAuth: [] }],
                responses: {
                    "201": {
                        description: "Tokens refreshed successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/TokenPair",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/TokenPair",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/auth/verify-email": {
            post: {
                tags: ["Auth"],
                summary: "Send verification email",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email"],
                                properties: { email: { type: "string" } },
                            },
                        },
                    },
                },
                responses: {
                    "204": { description: "No Content" },
                    "400": {
                        description: "Bad request (Validation Error)",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "User not found or account is disabled",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "409": {
                        description: "Email already verified",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/auth/verify/{token}": {
            get: {
                tags: ["Auth"],
                summary: "Confirm email via token",
                parameters: [
                    {
                        name: "token",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": { description: "Email verified" },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/auth/forgot-password": {
            post: {
                tags: ["Auth"],
                summary: "Send forgot password email",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email"],
                                properties: { email: { type: "string" } },
                            },
                        },
                    },
                },
                responses: {
                    "204": { description: "No Content" },
                    "400": {
                        description: "Bad request (Validation Error)",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "User not found or account is disabled",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ["Auth"],
                summary: "Set new password",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["password", "actionToken"],
                                properties: {
                                    password: {
                                        type: "string",
                                        example: "NewPassword123!",
                                    },
                                    actionToken: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "204": { description: "No Content" },
                    "400": {
                        description: "Bad request (Validation Error)",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Invalid token",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "409": {
                        description:
                            "This password was used in the last 180 days",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/auth/logout": {
            post: {
                tags: ["Auth"],
                summary: "Logout user (Requires Refresh Token)",
                description:
                    "Send your **Refresh Token** in the Authorization header to logout.",
                security: [{ bearerAuth: [] }],
                responses: {
                    "204": { description: "Logged out successfully" },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "403": {
                        description: "Invalid token",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/users/me": {
            get: {
                tags: ["Users"],
                summary: "Get current user profile",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Profile retrieved successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/UserResponse",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ["Users"],
                summary: "Update current user profile",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UserUpdateDto",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Profile updated successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/UserResponse",
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad request (Validation Error)",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden. Account is not verified.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ["Users"],
                summary: "Soft delete current account",
                security: [{ bearerAuth: [] }],
                responses: {
                    "204": { description: "Account successfully deactivated" },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden. Account is not verified.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/users/me/avatar": {
            post: {
                tags: ["Users"],
                summary: "Upload profile avatar",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    avatar: {
                                        type: "string",
                                        format: "binary",
                                        description:
                                            "User profile picture (jpg, jpeg, png, webp)",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Avatar uploaded successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/UserResponse",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden. Account is not verified.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "File not found",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ["Users"],
                summary: "Delete profile avatar",
                security: [{ bearerAuth: [] }],
                responses: {
                    "204": { description: "Avatar removed successfully" },
                    "400": {
                        description: "User has no avatar to delete",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden. Account is not verified.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/users/me/premium": {
            patch: {
                tags: ["Users"],
                summary: "Purchase premium status",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Upgraded to premium, new tokens issued",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/AuthResponse",
                                },
                            },
                        },
                    },
                    "400": {
                        description: "User already has a premium account",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden. Account is not verified.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/users/me/upgrade-seller": {
            patch: {
                tags: ["Users"],
                summary: "Upgrade role to seller",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Upgraded to seller, new tokens issued",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/AuthResponse",
                                },
                            },
                        },
                    },
                    "400": {
                        description: "User already has a premium account",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden. Account is not verified.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "409": {
                        description: "You already have the right to sell a car",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/users/{userId}": {
            get: {
                tags: ["Users"],
                summary: "Get user by ID",
                description:
                    "Returns full data for Admins/Managers and limited data for regular users.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "userId",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": {
                        description:
                            "User details retrieved (structure depends on your role)",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        user: {
                                            oneOf: [
                                                {
                                                    $ref: "#/components/schemas/UserResponse",
                                                },
                                                {
                                                    $ref: "#/components/schemas/PublicUserResponse",
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad request (Validation Error)",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "User not found",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/brands": {
            get: {
                tags: ["Brands"],
                summary: "Get all car brands and models",
                responses: {
                    "200": {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/BrandResponse",
                                    },
                                },
                            },
                        },
                    },
                    "500": {
                        description: "Internal Server Error",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/brands/report": {
            post: {
                tags: ["Brands"],
                summary: "Report a missing brand",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["brand"],
                                properties: {
                                    brand: {
                                        type: "string",
                                        example: "Tesla",
                                        description:
                                            "Name of the brand you want to add",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Report sent successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example:
                                                "Your message has been sent to the administration. Thank you for your help!",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad Request (Validation Error)",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden. Account is not verified.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError",
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
        schemas: {
            UserListResponse: {
                type: "object",
                properties: {
                    data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/UserResponse" },
                    },
                    total: { type: "integer" },
                    totalPages: { type: "integer" },
                    query: {
                        type: "object",
                        properties: {
                            pageSize: { type: "integer" },
                            page: { type: "integer" },
                            orderBy: { type: "string" },
                            order: { type: "string" },
                        },
                    },
                },
            },
            UserResponse: {
                type: "object",
                properties: {
                    _id: { type: "string", example: "65e1f..." },
                    name: { type: "string", example: "Ivan" },
                    surname: { type: "string", example: "Ivanov" },
                    email: { type: "string", example: "ivan@example.com" },
                    age: { type: "integer", example: 25 },
                    phone: { type: "string", example: "+380671234567" },
                    role: { type: "string", example: "manager" },
                    permissions: { type: "array", items: { type: "string" } },
                    accountType: { type: "string", example: "base" },
                    city: { type: "string", nullable: true },
                    region: { type: "string", nullable: true },
                    avatar: { type: "string", nullable: true },
                    isBanned: { type: "boolean" },
                    isActive: { type: "boolean" },
                    isVerified: { type: "boolean" },
                    isDeleted: { type: "boolean" },
                },
            },
            PublicUserResponse: {
                type: "object",
                properties: {
                    _id: {
                        type: "string",
                        example: "69aed2bc97545e4d065683f4",
                    },
                    name: { type: "string", example: "Alex" },
                    surname: { type: "string", example: "Novak" },
                    phone: { type: "string", example: "+380935212311" },
                    avatar: { type: "string", nullable: true, example: null },
                },
            },
            UpgradeRoleDto: {
                type: "object",
                description:
                    "Fields to upgrade user status. At least one field is required.",
                properties: {
                    role: {
                        type: "string",
                        enum: ["buyer", "seller"],
                        description:
                            "You can only change role to Buyer or Seller.",
                    },
                    accountType: {
                        type: "string",
                        enum: ["base", "premium"],
                    },
                },
                example: {
                    role: "seller",
                    accountType: "premium",
                },
            },
            TokenPair: {
                type: "object",
                properties: {
                    accessToken: { type: "string", example: "eyJhbG..." },
                    refreshToken: { type: "string", example: "eyJhbG..." },
                },
            },
            AuthResponse: {
                type: "object",
                properties: {
                    user: { $ref: "#/components/schemas/UserResponse" },
                    tokens: { $ref: "#/components/schemas/TokenPair" },
                },
            },
            BrandResponse: {
                type: "object",
                properties: {
                    _id: {
                        type: "string",
                    },
                    brand: { type: "string", example: "LAMBORGHINI" },
                    models: {
                        type: "array",
                        items: { type: "string" },
                        example: ["URUS", "HURACAN"],
                    },
                },
            },
            ApiError: {
                type: "object",
                properties: {
                    status: {
                        type: "integer",
                    },
                    message: {
                        type: "string",
                    },
                },
            },
        },
    },
};
export { swaggerDocument, swaggerUi };
