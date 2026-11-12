/**
 * API Framework - Core Types
 * Type-safe API definitions with runtime validation.
 */

/**
 * HTTP methods supported by the framework.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

/**
 * Parameter location in a request.
 */
export type ParamLocation = 'path' | 'query' | 'header' | 'cookie' | 'body';

/**
 * Schema definition for request/response validation.
 */
export interface Schema {
    type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null';
    format?: string;
    description?: string;
    required?: boolean;
    default?: unknown;
    enum?: unknown[];
    items?: Schema;
    properties?: Record<string, Schema>;
    additionalProperties?: boolean | Schema;
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    pattern?: string;
}

/**
 * Route parameter definition.
 */
export interface RouteParam {
    name: string;
    location: ParamLocation;
    required?: boolean;
    schema?: Schema;
}

/**
 * Route definition.
 */
export interface Route {
    path: string;
    method: HttpMethod;
    handler: RequestHandler;
    summary?: string;
    description?: string;
    params?: RouteParam[];
    requestBody?: {
        required?: boolean;
        content: Record<string, { schema: Schema }>;
    };
    responses: Record<string, {
        description: string;
        content?: Record<string, { schema: Schema }>;
    }>;
    tags?: string[];
    deprecated?: boolean;
}

/**
 * Request context passed to handlers.
 */
export interface RequestContext {
    params: Record<string, string>;
    query: Record<string, string>;
    headers: Record<string, string>;
    body: unknown;
    method: string;
    path: string;
}

/**
 * Response object.
 */
export interface ResponseObject {
    status: number;
    headers?: Record<string, string>;
    body?: unknown;
}

/**
 * Request handler function signature.
 */
export type RequestHandler = (ctx: RequestContext) => Promise<ResponseObject> | ResponseObject;

/**
 * API application configuration.
 */
export interface ApiConfig {
    name: string;
    version: string;
    description?: string;
    servers?: Array<{
        url: string;
        description?: string;
    }>;
    tags?: Array<{
        name: string;
        description?: string;
    }>;
}

/**
 * Validation error details.
 */
export interface ValidationError {
    field: string;
    message: string;
    value?: unknown;
}

/**
 * API response envelope.
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: ValidationError[];
    };
    meta?: {
        timestamp: string;
        request_id?: string;
    };
}