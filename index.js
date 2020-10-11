#!/usr/bin/env node

const app = require("express")();
const bodyParser = require("body-parser");
const { port } = require("./config.json");
const { markComplete, changeDate } = require("./modules/trelloListener");


app.use(bodyParser.json());

app.head("/trelloListener", (req, res) => {
    console.log(req.body);
    res.status(200).end()
});

app.post("/trelloListener", (req, res) => {
    var action = req.body.action;
    switch(action.display.translationKey){

        case "action_marked_the_due_date_complete":
            markComplete(action.data.list.id, action.data.card.id);
            break;

        case "action_changed_a_due_date":
            changeDate(action.data.list.id, action.data.card.id, action.idMemberCreator);
            break;

        default:
            console.log(req.body.action.data);

    }
    res.status(200).end()
})

app.listen(port, () => console.log(`Hello this is working at ${port}`))
