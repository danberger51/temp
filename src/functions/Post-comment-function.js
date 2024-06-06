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
    createIfNotExists: true
});

app.http('addComment', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'films/{filmId}/comments',
    extraInputs: [cosmosInput],
    extraOutputs: [cosmosOutput],
    handler: async (request, context) => {
        const data = {
            id: uuidv4(),
            userId: request.body.userId,
            content: request.body.content,
            date: new Date().toISOString()}

        data.id = (Math.random() + 1).toString(36);

        console.log(data);

        context.extraOutputs.set(cosmosOutput, data);

        return { body: JSON.stringify(data), status: 201 };
        

    
    }
});