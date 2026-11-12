/**
 * API Framework - Schema Validation
 * Runtime validation against JSON Schema-like definitions.
 */

import type { Schema, ValidationError } from './types.js';

export class SchemaValidator {
    /**
     * Validates a value against a schema.
     */
    validate(value: unknown, schema: Schema, field: string = 'root'): ValidationError[] {
        const errors: ValidationError[] = [];

        if (schema.required && value === undefined) {
            errors.push({ field, message: 'Field is required', value });
            return errors;
        }

        if (value === undefined || value === null) {
            return errors;
        }

        switch (schema.type) {
            case 'string':
                this.validateString(value, schema, field, errors);
                break;
            case 'number':
            case 'integer':
                this.validateNumber(value, schema, field, errors);
                break;
            case 'boolean':
                this.validateBoolean(value, schema, field, errors);
                break;
            case 'array':
                this.validateArray(value, schema, field, errors);
                break;
            case 'object':
                this.validateObject(value, schema, field, errors);
                break;
        }

        if (schema.enum && !schema.enum.includes(value)) {
            errors.push({ 
                field, 
                message: `Must be one of: ${schema.enum.join(', ')}`,
                value 
            });
        }

        return errors;
    }

    private validateString(value: unknown, schema: Schema, field: string, errors: ValidationError[]): void {
        if (typeof value !== 'string') {
            errors.push({ field, message: 'Expected string', value });
            return;
        }
        if (schema.minLength !== undefined && value.length < schema.minLength) {
            errors.push({ field, message: `Minimum length is ${schema.minLength}`, value });
        }
        if (schema.maxLength !== undefined && value.length > schema.maxLength) {
            errors.push({ field, message: `Maximum length is ${schema.maxLength}`, value });
        }
        if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
            errors.push({ field, message: `Does not match pattern: ${schema.pattern}`, value });
        }
    }

    private validateNumber(value: unknown, schema: Schema, field: string, errors: ValidationError[]): void {
        if (typeof value !== 'number') {
            errors.push({ field, message: 'Expected number', value });
            return;
        }
        if (schema.type === 'integer' && !Number.isInteger(value)) {
            errors.push({ field, message: 'Expected integer', value });
        }
        if (schema.minimum !== undefined && value < schema.minimum) {
            errors.push({ field, message: `Minimum value is ${schema.minimum}`, value });
        }
        if (schema.maximum !== undefined && value > schema.maximum) {
            errors.push({ field, message: `Maximum value is ${schema.maximum}`, value });
        }
    }

    private validateBoolean(value: unknown, schema: Schema, field: string, errors: ValidationError[]): void {
        if (typeof value !== 'boolean') {
            errors.push({ field, message: 'Expected boolean', value });
        }
    }

    private validateArray(value: unknown, schema: Schema, field: string, errors: ValidationError[]): void {
        if (!Array.isArray(value)) {
            errors.push({ field, message: 'Expected array', value });
            return;
        }
        if (schema.items) {
            value.forEach((item, index) => {
                const itemErrors = this.validate(item, schema.items!, `${field}[${index}]`);
                errors.push(...itemErrors);
            });
        }
    }

    private validateObject(value: unknown, schema: Schema, field: string, errors: ValidationError[]): void {
        if (typeof value !== 'object' || value === null) {
            errors.push({ field, message: 'Expected object', value });
            return;
        }
        const obj = value as Record<string, unknown>;
        if (schema.properties) {
            for (const [key, propSchema] of Object.entries(schema.properties)) {
                const propErrors = this.validate(obj[key], propSchema, `${field}.${key}`);
                errors.push(...propErrors);
            }
        }
    }
}

export default SchemaValidator;