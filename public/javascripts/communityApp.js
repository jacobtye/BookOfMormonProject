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
            id: 0,
            annotations: new Map(),
            allAnnotations: [], 
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
        
          },
          created: async function() {

          },
          mounted: async function(){
            this.getAllPublic();
            this.initApp();
          },
          watch: {
          },
          methods: {
            async getAllPublic(){
                this.scriptures = [];
                try {
                    const response = await axios.get("/getAllPublic");
                    this.scriptures = response.data;
                    console.log(this.scriptures);
                    await this.scriptures.forEach(function (annotation){
                        let key = annotation.reference;
                        if (this.annotations.has(key)){
                            this.annotations.set(key, this.annotations.get(key).push(annotation));
                        }
                        else {
                            this.annotations.set(key, [annotation]);
                        }
                    }, app);
                    
                }
                catch (err){
                    console.log("error " + err);
                }
              console.log(this.annotations);
              this.annotations.forEach(function (value, map) {
                  this.allAnnotations.push([["#r" + value[0].reference,"r" + value[0].reference] , []]);
                  value.forEach(function (annotation){
                      this.allAnnotations[this.allAnnotations.length - 1][1].push(annotation);
                  }, app);
              }, app);
              console.log(this.allAnnotations);
            },
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
                await this.generateReference();
                await this.findVerse();
            },
            async findVerse(){
                try{
                    document.getElementById(this.reference).scrollIntoView();
                    window.scrollTo(0, 0);
                }
                catch(err){
                }

              await this.loadAnnotation();
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
                // [END signout]
              }
            },
            initApp() {
            // console.log(this.currentUser);
            this.currentUser = firebase.auth().currentUser;
            // console.log(this.currentUser);
                if (this.currentUser != null){
                  this.signInStatus = true;
                  this.buttonText = 'Sign out';
                }
                else{
                    this.signInStatus = false;
                    this.buttonText = 'Sign in with Google';
                }
            }
          }
        });
    }
})