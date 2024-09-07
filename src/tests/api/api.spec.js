const { test, expect } = require('@playwright/test');
const { HttpStatusCode } = require('axios');
const { schemaCreateUser } = require('../../schema/create-user.schema');
const { schemaPutUser, schemaPatchUser } = require('../../schema/edit-user.schema');
const { schemaGetSingleUser, schemaGetSingleUserResource } = require('../../schema/get-single-user.schema');
const { createUserData, updateUserData, patchUserData } = require('../../test-data/api');

const Ajv = require("ajv");
const ajv = new Ajv();

test.describe('GET - SINGLE USER', () => {
    test('TC-001: Successful', async ({ request }) => {
        const resonse = await request.get('/api/users/2');
        const header = resonse.headers()['content-type'];

        // Response code
        expect(resonse.status()).toBe(HttpStatusCode.Ok);
        // Response header content-type
        expect(header).toContain('application/json');

        const data = await resonse.json();
        const validate = ajv.compile(schemaGetSingleUser);
        // JSON schema
        expect(validate(data)).toBe(true);
    });

    test('TC-002: Not found', async ({ request }) => {
        const resonse = await request.get('/api/users/23');
        const header = resonse.headers()['content-type'];

        // Response code
        expect(resonse.status()).toBe(HttpStatusCode.NotFound);
        // Response header content-type
        expect(header).toContain('application/json');

        const data = await resonse.json();
        expect(Object.keys(data).length).toBe(0);
    });
});

test.describe('GET - SINGLE USER<RESOURCE>', () => {
    test('TC-003: Successful', async ({ request }) => {
        const resonse = await request.get('/api/unknown/2');
        const header = resonse.headers()['content-type'];

        // Response code
        expect(resonse.status()).toBe(HttpStatusCode.Ok);
        // Response header content-type
        expect(header).toContain('application/json');

        const data = await resonse.json();
        const validate = ajv.compile(schemaGetSingleUserResource);
        // JSON schema
        expect(validate(data)).toBe(true);
    });

    test('TC-004: Not found', async ({ request }) => {
        const resonse = await request.get('/api/unknown/23');
        const header = resonse.headers()['content-type'];

        // Response code
        expect(resonse.status()).toBe(HttpStatusCode.NotFound);
        // Response header content-type
        expect(header).toContain('application/json');

        const data = await resonse.json();
        expect(Object.keys(data).length).toBe(0);
    });
});

test.describe('POST - CREATE USER', () => {
    test('TC-005: Successful', async ({ request }) => {
        const resonse = await request.post('/api/users', {
            data: createUserData,
        });
        const header = resonse.headers()['content-type'];

        // Response code
        expect(resonse.status()).toBe(HttpStatusCode.Created);
        // Response header content-type
        expect(header).toContain('application/json');

        const data = await resonse.json();
        const validate = ajv.compile(schemaCreateUser);
        // JSON schema
        expect(validate(data)).toBe(true);

        // JSON data response
        expect(data).toEqual(expect.objectContaining(createUserData));
    });
});

test.describe('PUT - UPDATE', () => {
    test('TC-006: Successful', async ({ request }) => {
        const resonse = await request.put('/api/users/2', {
            data: updateUserData,
        });
        const header = resonse.headers()['content-type'];

        // Response code
        expect(resonse.status()).toBe(HttpStatusCode.Ok);
        // Response header content-type
        expect(header).toContain('application/json');

        const data = await resonse.json();
        const validate = ajv.compile(schemaPutUser);
        // JSON schema
        expect(validate(data)).toBe(true);

        // JSON data response
        expect(data).toEqual(expect.objectContaining(updateUserData));
    });
});

test.describe('PATCH - PARTIAL UPDATE', () => {
    test('TC-007: Successful', async ({ request }) => {
        const resonse = await request.patch('/api/users/2', {
            data: patchUserData,
        });
        const header = resonse.headers()['content-type'];

        // Response code
        expect(resonse.status()).toBe(HttpStatusCode.Ok);
        // Response header content-type
        expect(header).toContain('application/json');

        const data = await resonse.json();
        const validate = ajv.compile(schemaPatchUser);
        // JSON schema
        expect(validate(data)).toBe(true);

        // JSON data response
        expect(data).toEqual(expect.objectContaining(patchUserData));
    });
});

test.describe('DELETE - DELETE', () => {
    test('TC-008: Successful', async ({ request }) => {
        const resonse = await request.delete('/api/users/2');

        // Response code
        expect(resonse.status()).toBe(HttpStatusCode.NoContent);
    });
});
