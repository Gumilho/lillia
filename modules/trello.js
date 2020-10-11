const fetch = require("node-fetch");
const { URL, URLSearchParams } = require('url');

class Trello {
    constructor(key, token) {
        this.key = key;
        this.token = token;
        this.prefix = "https://api.trello.com";
    }
    make_request(method, url, params) {
        url = this.makeUrl(url, params);
        return new Promise((resolve, reject) => {
            resolve(
                fetch(url, {
                    method: method,
                    headers: {'Accept': 'application/json'}
                }).then(response => {
                    console.log(
                        `Response: ${response.status} ${response.statusText}`
                    );
                    if (response.status != 200)
                        console.log(response.text());
                    return response.text();
                }).then(text => {
                    //console.log(text);
                    return text;
                }).catch(err => console.error(err))
            );
        });
    }
    makeUrl(url, params) {
        var url = new URL(url);
        params.key = this.key;
        params.token = this.token;
        url.search = new URLSearchParams(params).toString();
        return url;
    }
    getCard(id, params) {
        let url = this.prefix + '/1/cards/' + id + '?';
        return this.make_request('GET', url, params);
    }
    updateCard(id, params) {
        let url = this.prefix + '/1/cards/' + id + '?';
        return this.make_request('PUT', url, params);
    }
    getCardsFromList(id) {
        var url = this.prefix + '/1/lists/' + id + '/cards?';
        return this.make_request('GET', url, {});
    }
    getAllListFromBoard(id) {
        var url = this.prefix + '/1/boards/' + id + '/lists/open?';
        return this.make_request('GET', url, {});
    }
    deleteLabel(id, idLabel) {
        var url = this.prefix + '/1/cards/' + id + '/idLabels/' + idLabel + '?';
        return this.make_request('DELETE', url, {});
    }
    addLabel(id, params) {
        let url = this.prefix + '/1/cards/' + id + '/idLabels?';
        return this.make_request('POST', url, params);
    }
}








module.exports = Trello