
const mysql = require("mysql");
const {host, user, password, database} = require("../config.json");

var con = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MySQL Database", database);
});

function make_query (sql) {
    return new Promise((resolve, reject) => {
        con.query(sql, (err, result) => {
            if (err) throw err;
            resolve(result);
        });
    });
}

module.exports.getAllListsID = () => {
    let sql = `SELECT trello_id FROM Projects`;
    return make_query(sql);
}

module.exports.getList = (list_id) => {
    let sql = `SELECT * FROM Projects WHERE trello_id = '${list_id}'`;
    return make_query(sql);
}

module.exports.getCard = (card_id, role) => {
    let sql = `SELECT * from ${role} WHERE trello_id = '${card_id}'`;
    return make_query(sql);
}

module.exports.getNum = (card_id, role) =>{
    let sql = `SELECT chapter from ${role} WHERE trello_id = '${card_id}'`;
    return make_query(sql);
}

module.exports.getMember = (member_id) => {
    let sql = `SELECT * from Members WHERE trello_id = '${member_id}'`;
    return make_query(sql);
}

module.exports.updateCard = (role, chapter, card_id) => {
    let sql = `UPDATE ${role} SET chapter = ${chapter} WHERE trello_id = '${card_id}'`;
    return make_query(sql);
}

module.exports.con = con;

