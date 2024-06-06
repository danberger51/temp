const { app, input } = require('@azure/functions');

const cosmosInput = input.cosmosDB({
    databaseName: 'FilmDatabase',
    containerName: 'Films',
    connection: 'CosmosDB',
    sqlQuery: "SELECT VALUE rating.rating FROM c JOIN rating IN c.ratings WHERE c.id = {filmId} AND (rating.rating = '👍' OR rating.rating = '👎')",
    parameters: [
        {
            name: "@filmId",
            value: ""
        }
    ]
});

app.http('getRatings', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'films/{filmId}/ratings/rating',
    extraInputs: [cosmosInput],
    handler: async (request, context) => {
        
        const ratings = context.extraInputs.get(cosmosInput);
        
        if (ratings.length > 0) {
            return {
                body: JSON.stringify(ratings),
                status: 200
            };
        } else {
            return {
                status: 404,
                body: "Film nicht gefunden oder keine Bewertungen vorhanden."
            };
        }
    }
});
