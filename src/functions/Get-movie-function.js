const { app, input } = require('@azure/functions');

const cosmosInput = input.cosmosDB({
    databaseName: 'FilmDatabase',
    containerName: 'Films',
    connection: 'CosmosDB',  
    sqlQuery: "SELECT * FROM c"
});

app.http('getFilms', {
    methods: ['GET'],
    authLevel: 'anonymous',
    extraInputs: [cosmosInput],
    route: 'films',
    handler: async (request, context) => {
        const films = context.extraInputs.get(cosmosInput);
        return {
            body: JSON.stringify(films),
            status: 200
        };
    }
});