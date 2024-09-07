const schemaGetSingleUser = {
    type: "object",
    properties: {
        data: {
            type: "object",
            properties: {
                id: { type: "integer" },
                email: { type: "string" },
                first_name: { type: "string" },
                last_name: { type: "string" },
                avatar: { type: "string" },
            },
            required: ["id", "email", "first_name", "last_name", "avatar"]
        },
        support: {
            type: "object",
            properties: {
                url: { type: "string" },
                text: { type: "string" }
            },
            required: ["url", "text"]
        },
    },
    required: ["data", "support"],
    additionalProperties: false
}

const schemaGetSingleUserResource = {
    type: "object",
    properties: {
        data: {
            type: "object",
            properties: {
                id: { type: "integer" },
                name: { type: "string" },
                year: { type: "integer" },
                color: { type: "string" },
                pantone_value: { type: "string" },
            },
            required: ["id", "name", "year", "color", "pantone_value"]
        },
        support: {
            type: "object",
            properties: {
                url: { type: "string" },
                text: { type: "string" }
            },
            required: ["url", "text"]
        },
    },
    required: ["data", "support"],
    additionalProperties: false
}

module.exports = {
    schemaGetSingleUser,
    schemaGetSingleUserResource,
}