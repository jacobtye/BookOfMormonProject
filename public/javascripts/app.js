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
            scriptures: [],
            isMobile: false,
            words : "",
            books : ["1 Nephi", "2 Nephi", "Jacob", "Enos", 
                    "Jarom", "Omni", "Words of Mormon",
                    "Mosiah", "Alma", "Helaman", "3 Nephi",
                    "4 Nephi", "Mormon", "Ether", "Moroni"],
            book: "1 Nephi",
            chapter: "",
            verse: "",
            reference : "1-Nephi-1-1",
            saved : true,
            publicAllowed: true,
            signInStatus: false,
            buttonText : "LOADING...",
            currentUser: null,
            isMobile: false,
            isChrome: false,
        
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
            async generateReference(){
                let bookr = this.book.replace(" ", "-");
                this.reference = bookr;
                if (this.chapter != "" && this.chapter != null){
                    this.reference = this.reference + "-" + this.chapter;
                    if (this.verse != "" && this.verse != null){
                        this.reference = this.reference + "-" + this.verse;
                    }
                }
            },
            async searchVerse(){
                // if (this.isMobile && this.isChrome){
                //     return;
                // }
                await this.generateReference();
                if(!this.isMobile){
                    await this.findVerse();
                }
            },
            async findVerse(){
                // if (this.isMobile && this.isChrome){
                //     return;
                // }
                try{
                    document.getElementById(this.reference).scrollIntoView();
                    window.scrollTo(0, 0);
                }
                catch(err){
                }

              await this.loadAnnotation();
            },
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
                if(this.reference == "README"){
                    alert("Cannot Change or Delete README");
                    return;
                }
                if (!this.books.includes(this.book)){
                    alert("Invalid Reference");
                    return;
                }
                // console.log("in save");
                await this.generateReference();
                let verse = document.getElementById(this.reference).innerText;
                let scripturesMap = this.scriptures.map(item => {
                    return item.reference;
                });
                // console.log(scripturesMap);
                let index = scripturesMap.indexOf(this.reference);
                if(index != -1){
                    await this.deleteNoComfirm();
                }
                try {
                    // console.log(this.publicAllowed);
                const response = await axios.post("/saveScripture", {
                  userName: this.currentUser.uid,
                  displayName: this.currentUser.displayName,
                  reference: this.reference,
                  contents: this.words,
                  verse: verse,
                  publicAllowed: this.publicAllowed,
                });
                alert("Saved to " + this.reference);
                this.file = "";
                this.saved = true;
                this.updateFiles();
              } catch (error) {
                console.log(error);
                alert("Error Saving to " + this.currentFile);
              }
                
            },
            async getREADME(){
                // console.log("Getting Readme");
                const response = await axios.get("/getREADME");
                this.scriptures = [];
                this.scriptures.push(response.data);
                
            },
            async updateFiles(){
                this.scriptures = [];
                if (!this.signInStatus){
                    // await this.getREADME();
                    return;
                }
                try{
                    // console.log("GETTING FILES 1");
                    const response = await axios.get("/getScriptures/"+this.currentUser.uid);
                    // console.log(response.data);
                    await this.getREADME();
                    this.scriptures = this.scriptures.concat(response.data);
                    // console.log(this.scriptures);
                }catch(error){
                    console.log(error);
                    alert("Error Getting Files");
                }
            },
            async loadAnnotation(){
                try{
                if (this.reference == "" || this.reference == null){
                    return;
                }
                let scripturesMap = this.scriptures.map(item => {
                    return item.reference;
                });
                let i = scripturesMap.indexOf(this.reference);
                this.words = this.scriptures[i].contents;
                }
                catch(err){
                    this.words = "";
                }
            },
            async updateReference(newReference){
                // console.log(newReference);
                this.reference = newReference;
                await this.loadAnnotation();
                await this.findVerse();
            },
            async deleteAnnotation(reference){
                // console.log("in delete");
                if(reference == "README"){
                    alert("Cannot Change or Delete README");
                    return;
                }
                if (reference == "" || reference == null){
                    return;
                }
                if(!confirm("Are you sure you want to delete annotation for " + reference)){
                    return;
                }
                let scripturesMap = this.scriptures.map(item => {
                    return item.reference;
                });
                let index = scripturesMap.indexOf(reference);
                // console.log(index);
                if (index == -1){
                    alert("No annotation for  " + reference);
                    return;
                }
                try {
                    await axios.delete("/deleteScripture/"+ this.scriptures[index]._id);
                alert("Deleted " + reference);
                this.words = "";
                this.reference = "";
                this.updateFiles();
              } catch (error) {
                console.log(error);
                alert("Error Deleting " + this.file);
              }
            },
            async clear(){
                this.book = "";
                this.chapter = "";
                this.version = "";
                this.words = "";
            },
            isNotREADME(reference){
              if (reference == "README"){
                  return false;
              }  
              return true;
            },
            async deleteNoComfirm(){
                // console.log("IN DELETE");
                if(this.reference == "README.txt"){
                    alert("Cannot Change or Delete README");
                    return;
                }
                let scripturesMap = this.scriptures.map(item => {
                    return item.reference;
                });
                let index = scripturesMap.indexOf(this.reference);
            try {
                await axios.delete("/deleteScripture/"+ this.scriptures[index]._id);
              } catch (error) {
                console.log(error);
                alert("Error Deleting " + this.file);
              }
            },
            async saveTemp(){
                // console.log(this.docs);
                // console.log("in temp " + this.words);
                const response = await axios.post("/saveTemp/"+this.currentUser.uid, {
                  contents: this.words,
                });
            },
            async getTemp(){
                // console.log("in temp " + this.words);
                const response = await axios.get("/getTemp/" + this.currentUser.uid);
                // this.words = response.data[0].contents;
            },
            async toggleSignIn() {
            //   console.log("Trying sign in");
              this.currentUser = firebase.auth().currentUser;
            //   console.log(this.currentUser);
              if (this.currentUser == null) {
                //   console.log("LOGGING IN");
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
                //   console.log("SIGNNG OUT")
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
            // console.log(this.currentUser);
            this.currentUser = firebase.auth().currentUser;
            console.log(this.currentUser);
            // console.log(this.currentUser);
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


            var ua = window.navigator.userAgent;
            var msie = ua.indexOf("MSIE ");
        
            if (msie > 0 || !!ua.match(/Trident.*rv\:11\./))  // If Internet Explorer, return version number
            {
                alert("Vuejs does not support Internet Explorer, please use another browser.");
            }
            var isMobile = false; //initiate as false
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)) {
                isMobile = true;
            }
            var isChrome = (/Chrome/i.test(ua));
            var isSamsung = /SamsungBrowser/i.test(ua);
            var isFirefox = /firefox/i.test(ua);
            var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
            console.log("Safari " + isSafari);
            console.log(isChrome + " Chrome");
            console.log(("Samsung " + isSamsung));
            console.log(("Firefox " + isFirefox));
            $("#header").load("header.html");
            if (isMobile && isChrome && !isSafari && !isSamsung && !isFirefox) {
                this.isMobile = true;
                this.isChrome = true;
            }


            }
          }
        });
    }
})