/* eslint-disable no-plusplus */
// const fetch = require('node-fetch');
const { Configuration, OpenAIApi } = require("openai");

const {MODEL, OPENAI_API_KEY} = require('../config');

const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports = (router) => {
    // a temporary static prompt, subjective to change

    router.route('/predict').post(async (req, res) => {
        const question = JSON.stringify(req.body.question).replace(/['"]+/g, '');

        // this is ugly, change it later
        const staticPrompt = 
`'''
Table covid, columns = [index, date, geoid, state, cases, cases_avg, cases_avg_per_100k, deaths, deaths_avg, deaths_avg_per_100k]

Create a query for each of the following utterances:
'''

Utterance: Show me some insights into Washington's covid cases.
Query: select date, SUBSET(cases, cases_avg, cases_avg_per_100k, deaths, deaths_avg, deaths_avg_per_100k) fom covid where state = ANY($state, default='Washington');

Utterance: Show me the covid cases per day in each American state.
Query: select date, cases from covid where state = ANY($state);

Utterance: What is the total number of cases in Washington?
Query: select ANY(SUM(cases), SUM(deaths), default=SUM(cases)) from covid where state = ANY($state, default='Washington');

Utterance: ${question}
Query:`;

        console.log(staticPrompt);
        // console.log(JSON.stringify(req.body.question).replace(/['"]+/g, ''));
        const response = await openai.createCompletion({
            model: MODEL,
            prompt: staticPrompt,
            max_tokens: 100,
            temperature: 0,
            stop: ';',
          });
        
        const choice = response.data.choices[0];
        console.log(choice);

        res.json(choice);
    });
};
