const mysql = require("./mysql");
const config = require("../config.json");
const Trello = require("./trello")
const trelloClient = new Trello(config.key, config.token);

module.exports.trelloClient = trelloClient;

const role_callback = config.role_callback;
const role_dependency = config.role_dependency;


module.exports.update_label = (card_id, label) => {

    function delete_all_labels(card){
        return card.idLabels.map(idLabel => {
            return trelloClient.deleteLabel(card_id, idLabel);
        });
        
    }
    function switch_label(card){
        Promise.all(delete_all_labels(card))
        .then(trelloClient.addLabel(card_id, {"value": label}));
    }
    return trelloClient.getCard(card_id, {"fields": "idLabels"})
        .then(text => switch_label(JSON.parse(text)));
}

module.exports.parseDate = (card_due, list_id) => {

    return new Promise((resolve, reject) => {
        mysql.getList(list_id)
            .then(list => {
                var date = new Date(card_due);
                date.setDate(date.getDate() + (7 * (list[0]['biweekly'] + 1)));
                resolve(date.toISOString());
            });
    });

}

module.exports.updateDependency = (list_id, card_id, qrole, chapter) => {

    var flag = true;
    const promises = [];
    mysql.getList(list_id)
        .then(results => {
            for (var role of role_dependency[qrole]) {
                if (!flag) break;
                promises.push(mysql.getNum(results[0][role + "_id"], role)
                    .then(num => {
                        if (parseInt(chapter) >= parseInt(num[0]["chapter"])) {
                            promises.push(this.update_label(card_id, config.labels[1]));
                            flag = false;
                        }
                    })
                );
            }
            Promise.all(promises).then(() => {
                if (flag) this.update_label(card_id, config.labels[0]);
            });
        });

}

module.exports.updateCallback = (list_id, qrole) => {

    var role_id = "";
    for (var role of role_callback[qrole]) {
        mysql.getList(list_id)
            .then(results => {
                role_id = results[0][role + "_id"];
                return mysql.getNum(role_id, role);
            }).then((num) => {
                this.updateDependency(list_id, role_id, role, num[0]["chapter"]);
            });
    }
}

module.exports.markComplete = (list_id, card_id) => {

    trelloClient.getCard(card_id, {
        "fields": "name,due"
    }).then(text => {
        var card = JSON.parse(text);
        var split = card.name.split(' ');
        var role = split.slice(0, -1).join(' ');
        var chapter = parseInt(split.slice(-1)) + 1;
        this.parseDate(card.due, list_id)
            .then(date => {

                trelloClient.updateCard(card_id, {
                    "name": role + " " + chapter, 
                    "due": date,
                    "dueComplete": false,
                }).then(mysql.updateCard(role, chapter, card_id))
                .then(this.updateDependency(list_id, card_id, role, chapter))
                .then(this.updateCallback(list_id, role));

            });
    });
}

function changeCardDate (card_id, format, post_date, post_num, biweekly) {
    trelloClient.getCard(card_id, {
        "fields": "name,due"
    }).then(card => {
        card = JSON.parse(card);
        let chapter = parseInt(card.name.split(' ').slice(-1));
        let date = new Date(post_date);
        console.log(date);
        date.setDate(date.getDate() - format - (post_num - chapter) * (7 * biweekly + 7));
        date.setHours(date.getHours() - 3);
        console.log(date);
        trelloClient.updateCard(card_id, { 
            "due": date.toISOString(),
        }).then(() => {
            console.log("done updating")
            console.log(card_id)
            console.log(card.name.split(' ').slice(0, -1).join(' '))
            
        })
    })
}

module.exports.changeDate = (list_id, card_id, member_id) => {
    Promise.all([
        mysql.getMember(member_id),
        mysql.getList(list_id),
        trelloClient.getCard(card_id, {
            "fields": "name,due"
        })
    ]).then(([member, list, card]) => {
        if (member[0]["Hierarchy"] != "AD") return;
        list = list[0];
        card = JSON.parse(card);
        if (!card["name"].startsWith("Postar")) return;
        var chapter = parseInt(card.name.split(' ').slice(-1));
        let PostFormat = list["PostFormat"].split(",");
        var i = 0;
        config.roles.map((role) => {
            if (role == "Postar") return;
            changeCardDate(list[role + "_id"], PostFormat[i++], card["due"], chapter, list["biweekly"]);
        })
    })
}