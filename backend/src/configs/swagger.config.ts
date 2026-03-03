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
        {
            name: "Admin",
            description: "Admin endpoints",
        },
        {
            name: "Management",
            description: "Management endpoints",
        },
    ],
    paths: {},
};
export { swaggerDocument, swaggerUi };
