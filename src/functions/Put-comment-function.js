const { app, input, output } = require('@azure/functions');

const cosmosInput = input.cosmosDB({
    databaseName: 'FilmDatabase',
    containerName: 'Films',
    connection: 'CosmosDB',
    sqlQuery: "SELECT * FROM c where c.id = {filmId} AND c.comments.id={commentId}",
});

const cosmosOutput = output.cosmosDB({
    databaseName: 'FilmDatabase',
    containerName: 'Films',
    connection: 'CosmosDB',
    createIfNotExists: false
});

app.http('putItems', {
    methods: ['PUT', 'GET'],
    authLevel: 'anonymous',
    extraInputs: [cosmosInput],
    extraOutputs: [cosmosOutput],
    route: 'films/{filmId}/comments/{commentId}',
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
