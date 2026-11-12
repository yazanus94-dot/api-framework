/**
 * API Framework - Public API
 * Re-exports the main framework components.
 */

export { ApiRouter, ApiApplication } from './router.js';
export { SchemaValidator } from './validator.js';
export type {
    ApiConfig,
    Route,
    RequestContext,
    ResponseObject,
    ApiResponse,
    HttpMethod,
    ParamLocation,
    Schema,
    RouteParam,
    ValidationError
} from './types.js';

/**
 * Creates a new API application with the given configuration.
 */
export function createApp(config: ApiConfig): ApiApplication {
    return new ApiApplication(config);
}

export default {
    ApiRouter,
    ApiApplication,
    SchemaValidator,
    createApp
};