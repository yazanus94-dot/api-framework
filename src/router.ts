/**
 * API Framework - Router and Application
 */

import type {
    ApiConfig,
    Route,
    RequestContext,
    ResponseObject,
    ApiResponse,
    HttpMethod,
    ValidationError
} from './types.js';

export class ApiRouter {
    private routes: Route[] = [];

    /**
     * Registers a route with the router.
     */
    addRoute(route: Route): void {
        this.routes.push(route);
    }

    /**
     * Finds a matching route for the given method and path.
     */
    findRoute(method: string, path: string): Route | undefined {
        return this.routes.find(r => 
            r.method === method.toUpperCase() as HttpMethod && 
            this.matchPath(r.path, path)
        );
    }

    /**
     * Simple path matching with parameter support.
     */
    private matchPath(pattern: string, path: string): boolean {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        if (patternParts.length !== pathParts.length) return false;
        return patternParts.every((part, i) => 
            part.startsWith(':') || part === pathParts[i]
        );
    }

    /**
     * Extracts path parameters from the matched route.
     */
    extractParams(pattern: string, path: string): Record<string, string> {
        const params: Record<string, string> = {};
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        patternParts.forEach((part, i) => {
            if (part.startsWith(':')) {
                params(part.slice(1)) = pathParts[i];
            }
        });
        return params;
    }

    /**
     * Returns all registered routes.
     */
    getRoutes(): Route[] {
        return [...this.routes];
    }
}

export class ApiApplication {
    private router: ApiRouter;
    private config: ApiConfig;

    constructor(config: ApiConfig) {
        this.config = config;
        this.router = new ApiRouter();
    }

    /**
     * Adds a route to the application.
     */
    addRoute(route: Route): void {
        this.router.addRoute(route);
    }

    /**
     * Handles an incoming request and returns a response.
     */
    async handleRequest(
        method: string, 
        path: string, 
        options: { headers?: Record<string, string>; body?: unknown; query?: Record<string, string> } = {}
    ): Promise<ApiResponse> {
        const route = this.router.findRoute(method, path);
        if (!route) {
            return this.notFoundResponse(path);
        }

        const params = this.router.extractParams(route.path, path);
        const ctx: RequestContext = {
            params,
            query: options.query || {},
            headers: options.headers || {},
            body: options.body,
            method: method.toUpperCase(),
            path
        };

        try {
            const result = await route.handler(ctx);
            return this.successResponse(result.body);
        } catch (error) {
            return this.errorResponse(error);
        }
    }

    /**
     * Generates the OpenAPI specification.
     */
    generateOpenApi(): Record<string, unknown> {
        const paths: Record<string, unknown> = {};
        
        for (const route of this.router.getRoutes()) {
            if (!paths[route.path]) paths[route.path] = {};
            (paths[route.path] as Record<string, unknown>)[route.method.toLowerCase()] = {
                summary: route.summary,
                description: route.description,
                parameters: route.params?.map(p => ({
                    name: p.name,
                    in: p.location,
                    required: p.required || false,
                    schema: p.schema
                })),
                requestBody: route.requestBody,
                responses: route.responses,
                tags: route.tags,
                deprecated: route.deprecated
            };
        }

        return {
            openapi: '3.0.0',
            info: {
                title: this.config.name,
                version: this.config.version,
                description: this.config.description
            },
            servers: this.config.servers || [],
            tags: this.config.tags || [],
            paths
        };
    }

    private successResponse(data: unknown): ApiResponse {
        return {
            success: true,
            data,
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }

    private notFoundResponse(path: string): ApiResponse {
        return {
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: `Route not found: ${path}`
            },
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }

    private errorResponse(error: unknown): ApiResponse {
        const message = error instanceof Error ? error.message : String(error);
        const details: ValidationError[] = error instanceof Error && 'details' in error 
            ? (error as { details: ValidationError[] }).details 
            : [];
        
        return {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message,
                details
            },
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }
}

export default { ApiRouter, ApiApplication };