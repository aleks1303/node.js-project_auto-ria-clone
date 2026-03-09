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
                                    key: { type: "string" },
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
        },
    },
};
export { swaggerDocument, swaggerUi };
