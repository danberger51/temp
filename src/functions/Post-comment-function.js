
const { app, input, output } = require('@azure/functions');


const cosmosOutput = output.cosmosDB({
    databaseName: "FilmDatabase",
    containerName: "Films",
    connection: "CosmosDB",
    createIfNotExists: true,
});

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

app.http('addComment', {
    methods: ['POST'], 
    authLevel: 'anonymous', 
    route: 'add/films/{filmId}/comments', 
    extraInputs: [cosmosInput], 
    extraOutputs: [cosmosOutput],
    
    handler: async (request, context) => {
        // Lesen der Film-ID aus der URL der Anfrage
        const filmId = request.params.filmId;
        // Lesen der Benutzer-ID und des Kommentars aus dem Anfragekörper
        const { userId, comment } = request.body;
        

        
        if (!filmId) {
            console.log("Film ID is missing in the request body.");
            return {
                status: 400,
                body: "Film ID is missing in the request body."
            };
        }

        // Aktualisieren des Werts der Film-ID in den Parametern der Cosmos DB-Eingabe
        cosmosInput.parameters[0].value = filmId;
        console.log("Cosmos Input Parameters:", cosmosInput.parameters);

        // Abfragen der Cosmos DB, um den Film mit der angegebenen ID zu erhalten
        const filmResult = await context.extraInputs.get(cosmosInput);
        console.log("Film Result:", filmResult);

        
        if (filmResult.length === 0) {
            console.log("Film not found.");
            return {
                status: 404,
                body: "Film not found."
            };
        }

        // Der gefundene Film wird in der Variable 'film' gespeichert
        const film = filmResult[0];
        console.log("Film:", film);

        
        const newComment = {
            userId: userId,
            comment: comment,
            date: new Date().toISOString()
        };
        console.log("Comment:", newComment);

        
        if (!film.comments) {
            film.comments = [];
        }
        // Hinzufügen des neuen Kommentars zum Array der Filmkommentare
        film.comments.push(newComment);

        // Definieren der Eigenschaft cosmosOutput, falls sie nicht bereits vorhanden ist
        // Definieren der Eigenschaft cosmosOutput, falls sie nicht bereits vorhanden ist
context.bindings = context.bindings || {};

// Schreiben Sie den aktualisierten Film in die Cosmos DB
context.bindings.cosmosOutput = film;



        
        return {
            status: 201,
            body: film
        };
    }
});
