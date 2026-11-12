# API Framework

A type-safe API framework with OpenAPI schema generation and runtime validation for TypeScript.

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-18-green)
![License](https://img.shields.io/badge/License-MIT-green)

## Overview

API Framework provides a declarative, type-safe way to define HTTP APIs with automatic OpenAPI 3.0 specification generation. Routes are defined with full type safety, and the framework handles request validation, error handling, and response formatting automatically.

## Key Features

- **Type-Safe Routes**: Full TypeScript support with strict typing
- **OpenAPI Generation**: Automatic OpenAPI 3.0 spec from route definitions
- **Runtime Validation**: Schema-based request validation
- **Consistent Responses**: Standardized success/error response format
- **Path Parameters**: Support for `:param` style route parameters
- **Zero Dependencies**: Core framework has no runtime dependencies

## Architecture

```
┌─────────────────────────────────────────┐
│           ApiApplication                 │
│  ┌──────────────────────────────────┐   │
│  │            ApiRouter              │   │
│  │  ┌──────┐  ┌──────┐  ┌──────┐    │   │
│  │  │GET   │  │POST  │  │PUT   │    │   │
│  │  │/users│  │/users│  │/users│    │   │
│  │  └──────┘  └──────┘  └──────┘    │   │
│  └──────────────────────────────────┘   │
│                    ↓                     │
│         SchemaValidator                  │
│  (runtime validation)                    │
└─────────────────────────────────────────┘
```

## Installation

```bash
npm install api-framework
```

## Quick Start

```typescript
import { ApiApplication } from 'api-framework';

const app = new ApiApplication({
    name: 'My API',
    version: '1.0.0'
});

app.addRoute({
    path: '/users/:id',
    method: 'GET',
    handler: (ctx) => ({
        status: 200,
        body: { id: ctx.params.id }
    }),
    responses: {
        '200': { description: 'User object' }
    }
});

// Handle a request
const response = await app.handleRequest('GET', '/users/123');
console.log(response.data); // { id: '123' }

// Generate OpenAPI spec
const spec = app.generateOpenApi();
```

## Testing

```bash
npm test
```

## License

MIT