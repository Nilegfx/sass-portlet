var fs = require('fs-extra'),
    path = require('path'),
    colors = require('colors'),
    open = require("open"),
    readline = require('readline');


var rli = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });

var projectFolder = path.join(__dirname,"..",".."),
    sassFolder = path.join(projectFolder, "css","sass"),
    sassAssetsName = "_",
    sassAssetsFolder = path.join(sassFolder,sassAssetsName);

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}


rli.question('What type of portlets you want to create? '.cyan+getDirectories(sassAssetsFolder).map(function(el,i){

  return "\n["+(i)+"] "+el.substr(1);

})+"\n\n", function(answer) {
    if(
      !isNaN(answer) && //provided answer is a valid number
       answer != "" &&  // not an empty string
       answer < getDirectories(sassAssetsFolder).length //provided answer matches already exists folders
      ){

      //ask for portlet name
      rli.question("name the file?",function(filename){
        if(filename !=""){
          createPortletFile(getDirectories(sassAssetsFolder)[answer], filename);
        }else{
          console.log("wrong file name".red);
        }
        rli.close();
      });
    }else {
      console.log("invalid directory, please try again and choose from givin directories".red);
      rli.close();
    }
    
});

function createPortletFile(folder,filename){
    var fullFileName = "_"+filename+".scss",
        fileToCreate = path.join(sassAssetsFolder,folder,fullFileName);
  //check if the file already exists
  if(!fs.existsSync(fileToCreate)){
    console.log(("file is not exist yet, going to create \n" + fileToCreate).green);
    fs.createFile(fileToCreate, function(err) {

      //report any error and abort file creation
      if(err){console.log(("couldn't create the file due to the following error:\n" + err).red);return;}

      //reference new created file in screen.scss
      addPortletReference(folder, fullFileName,filename);

      //open the file after creating it.
      open(fileToCreate);
      console.log("file created and opened".green);

    });
  }else{
    console.log(("file already exists\n" + fileToCreate +" ").yellow);
    open(fileToCreate);
  }
}

function addPortletReference(folder, fullFileName,filename){
  lines = [],
  currentScreenFile = path.join(sassFolder,"screen.scss"),
  backupFolder = path.join(sassFolder,"screen_backups"),
  newScreenFile = path.join(backupFolder,"screen_before_"+filename+".scss"),
  commentToAddAfter = "//node added ["+folder+"] EOF";

  //backup the current screen.js
  fs.ensureDir(backupFolder,function(err){
    if(err){console.log(err.red);return;}
    fs.copySync(currentScreenFile,newScreenFile);
  });

  //read and add new reference
  fs.readFileSync(currentScreenFile).toString().split('\n').forEach(function (line) { 
      if(line.indexOf(commentToAddAfter)>-1){
        importedFile = sassAssetsName +'/'+folder+'/'+filename;
        line = '@import "'+importedFile+'";\n' + line;
      }
      lines.push(line);
  });

  //write new screen.scss
  fs.ensureFile(currentScreenFile, function(err){
    fs.writeFileSync(currentScreenFile, lines.join("\n"));
  });
}




function addPortletReference2(portletName){
  var search = "var LocalStrategy = require('passport-local').Strategy;";
      // line = line || 0;

  var body = fs.readFileSync('example.js').toString();

  if (body.indexOf(search) < 0 ) {

    body = body.split('\n');
    body.splice(line + 1,0,search);
    body = body.filter(function(str){ return str; }); // remove empty lines
    var output = body.join('\n');
    fs.writeFileSync('example.js', output);
  }
}
