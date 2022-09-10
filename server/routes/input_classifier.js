/* eslint-disable no-plusplus */
// const fetch = require('node-fetch');
const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');
const initSqlJs = require('sql.js');

const {MODEL, OPENAI_API_KEY} = require('../config');

const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

let dbSchema = null;

module.exports = (router) => {
    // a temporary static prompt, subjective to change

    router.route('/predict').post(async (req, res) => {
        if (dbSchema == null) {
            res.status(400);
            res.send("No database has been uploaded");
            return;
        }

        const question = JSON.stringify(req.body.question).replace(/['"]+/g, '');

        const staticPrompt = 
`CREATE TABLE "author" (
    "aid" int,
    "homepage" text,
    "name" text,
    "oid" int,
    primary key("aid")
    );
    
    CREATE TABLE "conference" (
    "cid" int,
    "homepage" text,
    "name" text,
    primary key ("cid")
    );
    
    CREATE TABLE "domain" (
    "did" int,
    "name" text,
    primary key ("did")
    );
    
    CREATE TABLE "domain_author" (
    "aid" int, 
    "did" int,
    primary key ("did", "aid"),
    foreign key("aid") references \`author\`("aid"),
    foreign key("did") references \`domain\`("did")
    );
    
    CREATE TABLE "domain_conference" (
    "cid" int,
    "did" int,
    primary key ("did", "cid"),
    foreign key("cid") references \`conference\`("cid"),
    foreign key("did") references \`domain\`("did")
    );
    
    CREATE TABLE "journal" (
    "homepage" text,
    "jid" int,
    "name" text,
    primary key("jid")
    );
    
    CREATE TABLE "domain_journal" (
    "did" int,
    "jid" int,
    primary key ("did", "jid"),
    foreign key("jid") references "journal"("jid"),
    foreign key("did") references "domain"("did")
    );
    
    CREATE TABLE "keyword" (
    "keyword" text,
    "kid" int,
    primary key("kid")
    );
    
    CREATE TABLE "domain_keyword" (
    "did" int,
    "kid" int,
    primary key ("did", "kid"),
    foreign key("kid") references "keyword"("kid"),
    foreign key("did") references "domain"("did")
    );
    
    CREATE TABLE "publication" (
    "abstract" text,
    "cid" text,
    "citation_num" int,
    "jid" int,
    "pid" int,
    "reference_num" int,
    "title" text,
    "year" int,
    primary key("pid"),
    foreign key("jid") references "journal"("jid"),
    foreign key("cid") references "conference"("cid")
    );
    
    CREATE TABLE "domain_publication" (
    "did" int,
    "pid" int,
    primary key ("did", "pid"),
    foreign key("pid") references "publication"("pid"),
    foreign key("did") references "domain"("did")
    );
    
    CREATE TABLE "organization" (
    "continent" text,
    "homepage" text,
    "name" text,
    "oid" int,
    primary key("oid")
    );
    
    CREATE TABLE "publication_keyword" (
    "pid" int,
    "kid" int,
    primary key ("kid", "pid"),
    foreign key("pid") references "publication"("pid"),
    foreign key("kid") references "keyword"("kid")
    );
    
    CREATE TABLE "writes" (
    "aid" int,
    "pid" int,
    primary key ("aid", "pid"),
    foreign key("pid") references "publication"("pid"),
    foreign key("aid") references "author"("aid")
    );
    
    CREATE TABLE "cite" (
    "cited" int,
    "citing"  int,
    foreign key("cited") references "publication"("pid"),
    foreign key("citing") references "publication"("pid")
    );
    
    -- Using Structurally Parameterized SQL, answer the following questions for the tables provided above.
    
    -- Return me the area of PVLDB.
    SELECT t3.name FROM domain AS t3 JOIN domain_journal AS t1 ON t3.did = t1.did JOIN journal AS t2 ON t2.jid = t1.jid WHERE t2.name = ANY($t2.name, default="PVLDB");
    
    -- Return me the authors who have papers in PVLDB 2010.
    SELECT t1.name FROM publication AS t4 JOIN journal AS t2 ON t4.jid = t2.jid JOIN writes AS t3 ON t3.pid = t4.pid JOIN author AS t1 ON t3.aid = t1.aid WHERE t2.name = ANY($t2.name, default="PVLDB") AND t4.year = ANY($t4.year, default=2010);
    
    -- Return me the authors who have papers in PVLDB after 2010.
    SELECT t1.name FROM publication AS t4 JOIN journal AS t2 ON t4.jid = t2.jid JOIN writes AS t3 ON t3.pid = t4.pid JOIN author AS t1 ON t3.aid = t1.aid WHERE t2.name = ANY($t2.name, default="PVLDB") AND t4.year > ANY($t4.year, default=2010);
    
    -- Show me the authors who have papaers in PVLDB or JMLR.
    SELECT t1.name FROM publication AS t4 JOIN journal AS t2 ON t4.jid = t2.jid JOIN writes AS t3 ON t3.pid = t4.pid JOIN author AS t1 ON t3.aid = t1.aid WHERE t2.name = ANY("PVLDB", "JMLR");
    
    -- Show me the authors who have papaers in PVLDB or JMLR after 2010.
    SELECT t1.name FROM publication AS t4 JOIN journal AS t2 ON t4.jid = t2.jid JOIN writes AS t3 ON t3.pid = t4.pid JOIN author AS t1 ON t3.aid = t1.aid WHERE t2.name = ANY("PVLDB", "JMLR") AND t4.year > ANY($t4.year, default=2010);
    
    -- Show me the authors who have papaers in PVLDB or JMLR in 2010 or 2014.
    SELECT t1.name FROM publication AS t4 JOIN journal AS t2 ON t4.jid = t2.jid JOIN writes AS t3 ON t3.pid = t4.pid JOIN author AS t1 ON t3.aid = t1.aid WHERE t2.name = ANY("PVLDB", "JMLR") AND t4.year > ANY(2010, 2014);
    
    -- Show me the authors who have papaers in PVLDB or JMLR around year 2010.
    SELECT t1.name FROM publication AS t4 JOIN journal AS t2 ON t4.jid = t2.jid JOIN writes AS t3 ON t3.pid = t4.pid JOIN author AS t1 ON t3.aid = t1.aid WHERE t2.name = ANY("PVLDB", "JMLR") AND t4.year = ANY(2008-2012, default = 2010);
    
    -- What are the keywords for Noah Smith's most recent papers?
    SELECT t1.keyword FROM publication_keyword AS t1 JOIN publication AS t2 ON t1.pid = t2.pid JOIN writes AS t3 ON t2.pid = t3.pid JOIN author AS t4 ON t3.aid = t4.aid WHERE t4.name = ANY($t4.name, default = "Noah Smith") ORDER BY t2.year DESC LIMIT ANY(1-100, default = 1);
    
    -- What are Noah Smith's publications in year 2014?
    SELECT t1.title FROM publication AS t1 JOIN writes AS t2 ON t1.pid = t2.pid JOIN author AS t3 ON t2.aid = t3.aid WHERE t3.name = ANY($t3.name, default = "Noah Smith") AND t1.year = ANY($t1.year, default = 2014);
    
    -- What are Noah Smith's publications around year 2014?
    SELECT t1.title FROM publication AS t1 JOIN writes AS t2 ON t1.pid = t2.pid JOIN author AS t3 ON t2.aid = t3.aid WHERE t3.name = ANY($t3.name, default = "Noah Smith") AND t1.year = ANY(2012-2016, default = 2014);
    
    -- Show me Noah Smith's publications in 2014 or 2016.
    SELECT t1.title FROM publication AS t1 JOIN writes AS t2 ON t1.pid = t2.pid JOIN author AS t3 ON t2.aid = t3.aid WHERE t3.name = ANY($t3.name, default = "Noah Smith") AND t1.year = ANY(2014, 2016);
    
    -- Show me Noah Smith's publications from 2014 to 2016.
    SELECT t1.title FROM publication AS t1 JOIN writes AS t2 ON t1.pid = t2.pid JOIN author AS t3 ON t2.aid = t3.aid WHERE t3.name = ANY($t3.name, default = "Noah Smith") AND t1.year BETWEEN ANY($t1.year, default = 2014) AND ANY($t1.year, default = 2016);
    
    -- What are the publications with around 500 citations?
    SELECT title FROM publication WHERE citation_num BETWEEN ANY($citation_num, default = 450) AND ANY($citation_num, default = 550);
    
    -- Show me the number of citations of "Making database systems usable".
    SELECT citation_num FROM publication WHERE title = "Making database systems usable";
    
    -- Show me the author of "Making database systems usable".
    SELECT t1.name FROM author AS t1 JOIN writes AS A2 ON t1.aid = t2.aid JOIN publication AS t3 ON t2.pid = t3.pid WHERE t3.title = "Making database systems usable";
    
    -- Return me the conferences in the deep learning domain.
    SELECT t1.name FROM conference AS t1 JOIN domain_conference AS t2 ON t1.cid = t2.cid JOIN domain AS t3 ON t2.did = t3.did WHERE t3.name = ANY($t3.name, default = "deep learning");
    
    -- Show me the area of conference ACL.
    SELECT t1.name FROM domain as t1 JOIN domain_conference AS t2 ON t1.did = t2.did JOIN conference AS t3 on t2.cid = t3.cid WHERE t3.name = ANY($t3.name, default = "ACL");
    
    -- List all papers published by "University of Washington".
    SELECT t1.title FROM publication AS t1 JOIN writes AS t2 on t1.pid = t2.pid JOIN author AS t3 on t2.aid = t3.aid JOIN organization AS t4 ON t3.oid = t4.oid WHERE t4.name = ANY($t4.name, default = "University of Washington");
    
    
    CREATE TABLE "musical" (
    "Musical_ID" int,
    "Name" text,
    "Year" int,
    "Award" text,
    "Category" text,
    "Nominee" text,
    "Result" text,
    PRIMARY KEY ("Musical_ID")
    );
    
    CREATE TABLE "actor" (
    "Actor_ID" int,
    "Name" text,
    "Musical_ID" int,
    "Character" text,
    "Duration" text,
    "age" int,
    PRIMARY KEY ("Actor_ID"),
    FOREIGN KEY ("Musical_ID") REFERENCES "actor"("Actor_ID")
    );
    
    -- Using Structurally Parameterized SQL, answer the following questions for the tables provided above.
    
    -- What are the names of actors who have been in the musical titled The Phantom of the Opera?
    SELECT t1.Name FROM actor AS t1 JOIN musical AS t2 ON T1.Musical_ID  = t2.Musical_ID WHERE t2.Name = ANY($t2.name, default = "The Phantom of the Opera");
    
    -- Show the nominees that have nominated musicals for both Tony Award and Drama Desk Award.
    SELECT Nominee FROM musical WHERE Award = ANY($Award, default = "Tony Award") INTERSECT SELECT Nominee FROM musical WHERE Award = ANY($Award, default = "Drama Desk Award");
    
    -- Show the nominees that have nominated musicals for Tony Award or Drama Desk Award.
    SELECT Nominee FROM musical WHERE Award = ANY("Tony Award", "Drama Desk Award");
    
    -- What are the awards won by Ian Smith?
    SELECT t1.Award, t1.Category FROM musical AS t1 JOIN actor AS t2 ON t1.Musical_ID = t2.Musical_ID WHERE t2.Name = ANY($t2.Name, default = "Ian Smith") AND t1.Result = ANY($t1.Result, "won");
    
    -- List all actors that are around age 55.
    SELECT Name FROM actor WHERE age BETWEEN ANY($Name, default = 50) AND ANY($Name, default = 60);
    
    
    CREATE TABLE \`follows\` (
    \`f1\` int(11) NOT NULL,
    \`f2\` int(11) NOT NULL,
    PRIMARY KEY (\`f1\`,\`f2\`),
    FOREIGN KEY (\`f1\`) REFERENCES \`user_profiles\`(\`uid\`),
    FOREIGN KEY (\`f2\`) REFERENCES \`user_profiles\`(\`uid\`)
    );
    
    CREATE TABLE \`tweets\` (
    \`id\` bigint(20) NOT NULL,
    \`uid\` int(11) NOT NULL,
    \`text\` char(140) NOT NULL,
    \`createdate\` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    FOREIGN KEY (\`uid\`) REFERENCES \`user_profiles\`(\`uid\`)
    );
    
    CREATE TABLE "user_profiles" (
    \`uid\` int(11) NOT NULL,
    \`name\` varchar(255) DEFAULT NULL,
    \`email\` varchar(255) DEFAULT NULL,
    \`partitionid\` int(11) DEFAULT NULL,
    \`followers\` int(11) DEFAULT NULL,
    PRIMARY KEY (\`uid\`)
    );
    
    -- Using Structurally Parameterized SQL, answer the following questions for the tables provided above.
    
    -- Find the name and email of the users who have more than 1000 followers.
    SELECT name, email FROM user_profiles WHERE followers > ANY($followers, default = 1000);
    
    -- Find the name and email of the users who have around 1000 followers.
    SELECT name, email FROM user_profiles WHERE followers BETWEEN ANY($followers, default = 950) AND ANY($followers, default = 1050);
    
    -- How many the users did Taylor Swift follow?
    SELECT COUNT(*) FROM user_profiles AS t1 JOIN follows AS t2 ON t1.uid = t2.f1 JOIN user_profiles AS t3 ON t2.f2 = t3.uid WHERE t1.uid = ANY($t1.uid, default = "Taylor Swift");
    
    
    ${dbSchema}
    -- Using Structurally Parameterized SQL, answer the following questions for the tables provided above.
    
    -- ${question}
    SELECT`;

        console.log(staticPrompt);
        // console.log(JSON.stringify(req.body.question).replace(/['"]+/g, ''));
        const response = await openai.createCompletion({
            model: MODEL,
            prompt: staticPrompt,
            max_tokens: 1000,
            temperature: 0,
            stop: ';',
          });
        
        const choice = response.data.choices[0];
        console.log(choice);

        res.json(choice);
    });

    router.route('/uploadDB').post(async (req, res) => {
        const filename = JSON.stringify(req.body.filename).replace(/['"]+/g, '');
        console.log(`connecting to database ${filename}`);

        const rootDir = "C:/Users/zhaoj/Desktop/";
        const databasePath = `${rootDir}${filename.split('.')[0]}/${filename}`
        
        // rootDir + filename.split('.')[0] + "/" + filename;
        const filebuffer = fs.readFileSync(databasePath);

        // load the db
        const SQL = await initSqlJs();
        const db = new SQL.Database(filebuffer);

        // read db schema
        const schemaSQL = "select sql from sqlite_master where type='table';";
        const schemaRows = db.exec(schemaSQL);
        let schemaResult;
        let schema = "";
        // eslint-disable-next-line
        for (const row of schemaRows.values()) {
            schemaResult = row;        
        }

        // eslint-disable-next-line
        for (const val of schemaResult.values) {
            schema += val[0];
            schema += ";\n\n";
        }

        // console.log(schema);
        dbSchema = schema;

        const tableSQL = "select tbl_name from sqlite_master where type='table';";
        const tableRows = db.exec(tableSQL);
        let tableResult;
        /* eslint-disable */
        for (const row of tableRows.values()) {
            tableResult = row;      
        }

        const data = {}
        for (const val of tableResult.values) {
            table = val[0];

            const items = []
            const dataSQL = `select * from ${table} limit 10;`;
            const stmt = db.prepare(dataSQL)
            while (stmt.step()) {
                items.push(stmt.getAsObject());
            }
            columns = stmt.getColumnNames();
            data[table] = {"columns": columns, "values": items};
        }
        // console.log(data)
        /* eslint-enable */

        res.json(data);
    })
};
