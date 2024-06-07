const { app, context, input, output } = require('@azure/functions');

const cosmosOutput = output.cosmosDB({
    databaseName: "FilmDatabase",
    containerName: "Films",
    connectionStringSetting: "CosmosDB",
    createIfNotExists: true,
});

const cosmosInput = input.cosmosDB({
    databaseName: 'FilmDatabase',
    containerName: 'Films',
    connectionStringSetting: 'CosmosDB',
    sqlQuery: "SELECT * FROM c WHERE c.id = {filmId}", 
    parameters: [
        {
            name: "@filmId",
            value: ""
        }
    ]
});

app.http('addComment', {
    methods: ['POST'], 
    authLevel: 'anonymous', 
    route: 'add/films/{filmId}/comments', 
    extraInputs: [cosmosInput], 
    extraOutputs: [cosmosOutput],
    
    handler: async (context, request) => {
        console.log("Context:", context);
        console.log("Request:", request);
    
        const filmId = context.params.filmId; // Access route parameters directly from context
        console.log("Film ID:", filmId);
    
        try {
            const requestBody = await parseRequestBody(request);
            const { userId, comment } = requestBody;
    
            console.log("Request body:", requestBody);
            console.log("Film ID:", filmId);
            console.log("User ID:", userId);
            console.log("Comment:", comment);
    
            if (!filmId) {
                console.log("Film ID is missing in the request URL.");
                return {
                    status: 400,
                    body: "Film ID is missing in the request URL."
                };
            }
    
            if (!userId || !comment) {
                console.log("User ID or comment is missing in the request body.");
                return {
                    status: 400,
                    body: "User ID or comment is missing in the request body."
                };
            }
    
            cosmosInput.parameters[0].value = filmId;
            console.log("Cosmos Input Parameters:", cosmosInput.parameters);
    
            const filmResult = await context.extraInputs.get(cosmosInput);
            console.log("Film Result:", filmResult);
    
            if (filmResult.length === 0) {
                console.log("Film not found.");
                return {
                    status: 404,
                    body: "Film not found."
                };
            }
    
            const film = filmResult[0];
            console.log("Film:", film);
    
            const newComment = {
                id: String(film.comments.length + 1),
                userId: userId,
                content: comment,
                date: new Date().toISOString()
            };
            console.log("New Comment:", newComment);
    
            if (!film.comments) {
                film.comments = [];
            }
    
            film.comments.push(newComment);
    
            context.bindings = context.bindings || {};
            context.bindings.cosmosOutput = film;
    
            console.log("Updated Film:", film);
    
            return {
                status: 201,
                body: film
            };
        } catch (error) {
            console.error("Error parsing request body:", error.message);
            return {
                status: 400,
                body: "Invalid request body format."
            };
        }
    }
});

async function parseRequestBody(request) {
    try {
        // Check if the request body exists and is not empty
        if (!request || !request.body) {
            throw new Error('Request body is missing or empty.');
        }
        
        // Parse the request body directly as JSON
        const requestBody = JSON.parse(request.body);
        return requestBody;
    } catch (error) {
        // If parsing fails, reject the promise with the error
        throw new Error('Invalid request body format: ' + error.message);
    }
}

