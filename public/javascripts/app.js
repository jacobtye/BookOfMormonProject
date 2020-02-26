/*global axios */
/*global Vue */
/*global firebase*/
var config=  {
    apiKey: "AIzaSyDDctP3h3X2S4W4hKTvX75Zzphj8cLzzFA",
    authDomain: "authpractice-4a44f.firebaseapp.com",
    databaseURL: "https://authpractice-4a44f.firebaseio.com",
    projectId: "authpractice-4a44f",
    storageBucket: "authpractice-4a44f.appspot.com",
    messagingSenderId: "235770987569",
    appId: "1:235770987569:web:8f6455f604384902790110",
    measurementId: "G-RYQ7B1L8LY"
}
let app = '';
firebase.initializeApp(config);
    firebase.auth().onAuthStateChanged((firebaseUser) => {
    if(!app){
        app = new Vue({
          el: '#app',
          data: {
            docs: {},
            words : "",
            file : "",
            saved : true,
            currentFile : "",
            signInStatus: false,
            buttonText : "LOADING...",
            currentUser: null,
        
          },
          created: async function() {

          },
          mounted: async function(){
            this.updateFiles();
            console.log(this.docs);
            this.initApp();
            this.getTemp();
          },
          watch: {
          },
          methods: {
            async saveAs(){
                if (this.file == "" || this.file == null){
                    this.file = prompt("Please enter file name", "");
                }
                if (this.file == "" || this.file == null){
                    return;
                }
                let docsMap = this.docs.map(item => {
                    return item.name;
                });
                let index = docsMap.indexOf(this.file);
                if(index != -1){
                    if(!confirm("Are you sure you want to overwirte " + this.file)){
                        return;
                    }
                }
                this.currentFile = this.file;
                await this.save();
            },
            async save() {
                if (!this.signInStatus){
                    alert("Please Sign In!\n ");
                    return;
                }
                if(this.currentFile == "README.txt"){
                    alert("Cannot Change or Delete README");
                    return;
                }
                console.log(this.currentFile);
                if (this.currentFile == "" || this.currentFile == null || this.currentFile == "recovery"){
                    this.saveAs();
                    return;
                }
                console.log("in save");

                let docsMap = this.docs.map(item => {
                    return item.fileName;
                });
                console.log(docsMap);
                let index = docsMap.indexOf(this.currentFile);
                if(index != -1){
                    await this.deleteFileNoComfirm();
                }
                try {
                const response = await axios.post("/saveDocument", {
                  userName: this.currentUser.uid,
                  fileName: this.currentFile,
                  contents: this.words,
                });
                alert("Saved to " + this.currentFile);
                this.file = "";
                this.saved = true;
                this.updateFiles();
              } catch (error) {
                console.log(error);
                alert("Error Saving to " + this.currentFile);
              }
                
            },
            async getREADME(){
                console.log("Getting Readme");
                const response = await axios.get("/getREADME");
                this.docs = [];
                this.docs.push(response.data);
                
            },
            async updateFiles(){
                if (!this.signInStatus){
                    await this.getREADME();
                    return;
                }
                try{
                    console.log("GETTING FILES 1");
                    const response = await axios.get("/getDocuments/"+this.currentUser.uid);
                    console.log(response.data);
                    await this.getREADME();
                    this.docs = this.docs.concat(response.data);
                    console.log(this.docs);
                }catch(error){
                    console.log(error);
                    alert("Error Getting Files");
                }
            },
            async loadFile(){
                if (this.file == "" || this.file == null){
                    this.file = prompt("Please enter file name", "");
                }
                if (this.file == "" || this.file == null){
                    return;
                }
                console.log("DOCS");
                console.log(this.docs);
                let docsMap = this.docs.map(item => {
                    return item.fileName;
                });
                let i = docsMap.indexOf(this.file);
                this.words = this.docs[i].contents;
                this.currentFile = this.file;
                this.file = "";
                this.saved = true;
            },
            async deleteFile(){
                if(this.file == "README.txt"){
                    alert("Cannot Change or Delete README");
                    return;
                }
                if (this.file == "" || this.file == null){
                    this.file = prompt("Please enter file name", "");
                }
                if (this.file == "" || this.file == null){
                    return;
                }
                console.log("IN DELETE");
                if(!confirm("Are you sure you want to delete " + this.file)){
                    return;
                }
                console.log("DOCUMENTS");
                console.log(this.docs);
                let docsMap = this.docs.map(item => {
                    return item.fileName;
                });
                let index = docsMap.indexOf(this.file);
                if (index == -1){
                    alert("No file " + this.file);
                    return;
                }
                console.log(docsMap);
                console.log( docsMap[index]);
                try {
                    const response = await axios.delete("/deleteFile/"+ this.docs[index]._id);
                alert("Deleted " + this.file);
                this.file = "";
                this.updateFiles();
              } catch (error) {
                console.log(error);
                alert("Error Deleting " + this.file);
              }
            },
            async deleteFileNoComfirm(){
                console.log("IN DELETE");
                if(this.file == "README.txt"){
                    alert("Cannot Change or Delete README");
                    return;
                }
                let docsMap = this.docs.map(item => {
                    return item.fileName;
                });
                let index = docsMap.indexOf(this.currentFile);
                console.log(docsMap);
                console.log( docsMap[index]);
                try {
                const response = await axios.delete("/deleteFile/" + this.docs[index]._id);
                this.file = "";
                this.updateFiles();
              } catch (error) {
                console.log(error);
                alert("Error Deleting " + this.file);
              }
            },
            async newFile(){
                if (!this.saved){
                    if (confirm("Would you like to save first?")){
                        this.save();
                    }
                }
                this.words = "";
                this.currentFile = "";
                this.file = "";
                this.saved = true;
            },
            async saveTemp(){
                // console.log(this.docs);
                console.log("in temp " + this.words);
                const response = await axios.post("/saveTemp/"+this.currentUser.uid, {
                  contents: this.words,
                });
            },
            async getTemp(){
                console.log("in temp " + this.words);
                const response = await axios.get("/getTemp/" + this.currentUser.uid);
                this.words = response.data[0].contents;
            },
            async toggleSignIn() {
              console.log("Trying sign in");
              this.currentUser = firebase.auth().currentUser;
              console.log(this.currentUser);
              if (this.currentUser == null) {
                  console.log("LOGGING IN");
                // var provider = new firebase.auth.GithubAuthProvider();
                var provider = new firebase.auth.GoogleAuthProvider();
                var user;
                  await firebase.auth().signInWithPopup(provider).then(function(result) {
                  var token = result.credential.accessToken;
                  user = result.user;
                }).catch(function(error) {
                    alert("Error on Log In");
                });
                if (user != null){
                  this.signInStatus = true;
                  this.buttonText = 'Sign out';
                  this.currentUser = user;
                  this.getTemp();
                  this.updateFiles();
                }
                // [END signin]
              } else {
                  console.log("SIGNNG OUT")
                // [START signout]
                firebase.auth().signOut();
                this.currentUser = null;
                this.signInStatus = false;
                this.words = "";
                this.buttonText = 'Sign in with Google';
                this.updateFiles();
                // [END signout]
              }
            },
            initApp() {
            console.log(this.currentUser);
            this.currentUser = firebase.auth().currentUser;
            console.log(this.currentUser);
                if (this.currentUser != null){
                  this.signInStatus = true;
                  this.buttonText = 'Sign out';
                  this.updateFiles();
                }
                else{
                    this.signInStatus = false;
                    this.buttonText = 'Sign in with Google';
                    this.updateFiles();
                }
            }
          }
        });
    }
})