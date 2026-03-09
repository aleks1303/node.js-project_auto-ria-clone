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
                    "400": { description: "Invalid role or account type" },
                    "403": {
                        description:
                            "Forbidden. Reasons: 1. Insufficient permissions. 2. Admins cannot change their own role.",
                    },
                    "404": { description: "User not found" },
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
                responses: { "200": { description: "Banned" } },
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
                responses: { "200": { description: "Unbanned" } },
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
                responses: { "200": { description: "Validated" } },
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
                responses: { "201": { description: "Created" } },
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
                    "409": { description: "Email or Phone already exists" },
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
                    "401": { description: "Invalid email or password" },
                },
            },
        },
        "/auth/refresh": {
            post: {
                tags: ["Auth"],
                summary: "Refresh tokens",
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
                },
            },
        },
        "/auth/verify-email": {
            post: {
                tags: ["Auth"],
                summary: "Send verification email again",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: { email: { type: "string" } },
                            },
                        },
                    },
                },
                responses: { "204": { description: "No Content" } },
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
                responses: { "200": { description: "Email verified" } },
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
                                properties: { email: { type: "string" } },
                            },
                        },
                    },
                },
                responses: { "204": { description: "No Content" } },
            },
            put: {
                tags: ["Auth"],
                summary: "Set new password",
                security: [{ bearerAuth: [] }], // Тут перевіряється actionToken
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: { password: { type: "string" } },
                            },
                        },
                    },
                },
                responses: { "204": { description: "No Content" } },
            },
        },
        "/auth/logout": {
            post: {
                tags: ["Auth"],
                summary: "Logout user",
                security: [{ bearerAuth: [] }],
                responses: {
                    "204": { description: "Logged out successfully" },
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
