const schemaPutUser = {
    type: "object",
    properties: {
        name: { type: "string" },
        job: { type: "string" },
        updatedAt: { type: "string" }
    },
    required: ["name", "job", "updatedAt"],
    additionalProperties: false
}

const schemaPatchUser = {
    type: "object",
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        job: { type: "string" },
        updatedAt: { type: "string" }
    },
    required: ["updatedAt"],
    additionalProperties: false
}


module.exports = {
    schemaPutUser,
    schemaPatchUser,
}