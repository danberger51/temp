const { app, output } = require('@azure/functions');

const cosmosOutput = output.cosmosDB({
    databaseName: "FilmDatabase",
    containerName: "Films",
    connectionStringSetting: "CosmosDB",
    createIfNotExists: true,
});

app.http('addMovie', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'add/films',
    extraOutputs: [cosmosOutput],
    handler: async (request, context) => {
        const data = await request.json();
        data.id = (Math.random() + 1).toString(36);

        console.log(data)

        context.extraOutputs.set(cosmosOutput, data);

        return { body: JSON.stringify(data), status: 201}
    }
    
})

