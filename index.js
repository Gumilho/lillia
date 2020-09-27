const app = require('express')();
const fs = require('fs');
const formidable = require('formidable');

/*
var con = mysql.createConnection({
    host: "localhost",
    user: "gumi",
    password: "210705tykows"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });
*/

app.post('/fileupload', (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.filetoupload.path;
        var newpath = '/home/gumi/programs/web_server/' + files.filetoupload.name;
        fs.copyFile(oldpath, newpath, function (err) {
            if (err) throw err;
            res.write('File uploaded and moved!');
            res.end();
        });
    });
});

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
    //__dirname : It will resolve to your project folder.
});
/*
app.get('/', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
});
*/
app.listen(3000, console.log('Server listening in 3000'));