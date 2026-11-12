import { ApiApplication, SchemaValidator } from '../src/index.js';
import assert from 'node:assert';

// --- SchemaValidator Tests ---

const validator = new SchemaValidator();

const test1 = {
    test() {
        const errors = validator.validate('hello', { type: 'string' });
        assert.strictEqual(errors.length, 0);
    }
};

const test2 = {
    test() {
        const errors = validator.validate(42, { type: 'string' });
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0].message, 'Expected string');
    }
};

const test3 = {
    test() {
        const errors = validator.validate(undefined, { type: 'string', required: true });
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0].message, 'Field is required');
    }
};

const test4 = {
    test() {
        const errors = validator.validate('ab', { type: 'string', minLength: 3 });
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0].message, 'Minimum length is 3');
    }
};

const test5 = {
    test() {
        const errors = validator.validate(5, { type: 'number', minimum: 10 });
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0].message, 'Minimum value is 10');
    }
};

const test6 = {
    test() {
        const errors = validator.validate('invalid', { type: 'string', pattern: '^[0-9]+$' });
        assert.strictEqual(errors.length, 1);
        assert.ok(errors[0].message.includes('pattern'));
    }
};

const test7 = {
    test() {
        const errors = validator.validate('red', { type: 'string', enum: ['red', 'green', 'blue'] });
        assert.strictEqual(errors.length, 0);
    }
};

const test8 = {
    test() {
        const errors = validator.validate('yellow', { type: 'string', enum: ['red', 'green', 'blue'] });
        assert.strictEqual(errors.length, 1);
    }
};

const test9 = {
    test() {
        const errors = validator.validate([1, 2, 3], { type: 'array', items: { type: 'number' } });
        assert.strictEqual(errors.length, 0);
    }
};

const test10 = {
    test() {
        const errors = validator.validate(
            { name: 'Alice', age: 30 },
            { 
                type: 'object', 
                properties: { 
                    name: { type: 'string' }, 
                    age: { type: 'number' } 
                } 
            }
        );
        assert.strictEqual(errors.length, 0);
    }
};

// --- ApiApplication Tests ---

const test11 = {
    async test() {
        const app = new ApiApplication({
            name: 'Test API',
            version: '1.0.0'
        });

        app.addRoute({
            path: '/hello',
            method: 'GET',
            handler: () => ({ status: 200, body: { message: 'Hello World' } }),
            responses: {
                '200': { description: 'Success' }
            }
        });

        const response = await app.handleRequest('GET', '/hello');
        assert.strictEqual(response.success, true);
        assert.deepStrictEqual(response.data, { message: 'Hello World' });
    }
};

const test12 = {
    async test() {
        const app = new ApiApplication({
            name: 'Test API',
            version: '1.0.0'
        });

        const response = await app.handleRequest('GET', '/nonexistent');
        assert.strictEqual(response.success, false);
        assert.strictEqual(response.error?.code, 'NOT_FOUND');
    }
};

const test13 = {
    async test() {
        const app = new ApiApplication({
            name: 'Test API',
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

        const response = await app.handleRequest('GET', '/users/123');
        assert.strictEqual(response.success, true);
        assert.deepStrictEqual(response.data, { id: '123' });
    }
};

const test14 = {
    async test() {
        const app = new ApiApplication({
            name: 'Test API',
            version: '1.0.0'
        });

        app.addRoute({
            path: '/error',
            method: 'GET',
            handler: () => { throw new Error('Something went wrong'); },
            responses: {}
        });

        const response = await app.handleRequest('GET', '/error');
        assert.strictEqual(response.success, false);
        assert.ok(response.error?.message.includes('Something went wrong'));
    }
};

const test15 = {
    test() {
        const app = new ApiApplication({
            name: 'Test API',
            version: '1.0.0',
            description: 'A test API',
            servers: [{ url: 'https://api.example.com', description: 'Production' }]
        });

        app.addRoute({
            path: '/items',
            method: 'GET',
            handler: () => ({ status: 200, body: [] }),
            summary: 'List items',
            responses: { '200': { description: 'List of items' } }
        });

        const spec = app.generateOpenApi();
        assert.strictEqual(spec.openapi, '3.0.0');
        assert.strictEqual((spec.info as Record<string, unknown>).title, 'Test API');
        assert.ok(spec.paths['/items']);
    }
};

export const tests = [
    test1, test2, test3, test4, test5, test6, test7, test8, test9, test10,
    test11, test12, test13, test14, test15
];