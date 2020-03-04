var mongoClient = require("mongodb").MongoClient;

async function getDbInstance() {
	const conn = await mongoClient.connect("mongodb+srv://betterbet:tXGvRktFZpXWZUq3@betterbet-cfnll.mongodb.net/test?retryWrites=true&w=majority")
	return conn.db('better_bet');
}

module.exports = {getDbInstance};