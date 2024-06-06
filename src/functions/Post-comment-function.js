const { app, input, output } = require('@azure/functions');


const cosmosInput = input.cosmosDB({
    databaseName: 'FilmDatabase',
    containerName: 'Films',
    connection: 'CosmosDB',
    sqlQuery: "SELECT * FROM c WHERE c.id = {filmId}",
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

app.http('addComment', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'films/{filmId}/comments',
    handler: async (request, context) => {
        const data = await request.json();
        data.id = (Math.random() + 1).toString(36);

    console.log(data);

    context.extraOutputs.set(cosmosOutput, data);

    return { body: JSON.stringify(data), status: 201 };
            
            
        
        
    }
});
