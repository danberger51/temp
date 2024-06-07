const { app, input, output } = require('@azure/functions');

const cosmosInput = input.cosmosDB({
    databaseName: 'FilmDatabase',
    containerName: 'Films',
    connection: 'CosmosDB',
    sqlQuery: "SELECT VALUE comment.content FROM c JOIN comment IN c.comments WHERE c.id = {filmId}",
    parameters: [
        {
            name: "@filmId",
            value: ""
        }
    ]
});

const cosmosOutput = output.cosmosDB({
    databaseName: 'FilmDatabase',
    containerName: 'Films',
    connection: 'CosmosDB',
    createIfNotExists: false
});

app.http('putItems', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    extraInputs: [cosmosInput],
    extraOutputs: [cosmosOutput],
    route: 'films/{filmId}/comments',
    handler: async (request, context) => {
        const items = context.extraInputs.get(cosmosInput);
        const data = await request.json();
        data.id = item[0].id;

        context.extraOutputs.set(cosmosOutput, data)

        return {
            body: JSON.stringify(data),
            status: 200
        };
    }
});
