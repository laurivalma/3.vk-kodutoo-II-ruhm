(function(){
   "use strict";

   var ShopList = function(){

     // SEE ON SINGLETON PATTERN
     if(ShopList.instance){
       return ShopList.instance;
     }
     //this viitab ShopList fn
     ShopList.instance = this;

     this.routes = ShopList.routes;
     // this.routes['home-view'].render()

     console.log('nimekirja sees');

     // KÕIK muuutujad, mida muudetakse ja on rakendusega seotud defineeritakse siin
     this.click_count = 0;
     this.currentRoute = null;
     console.log(this);

     // hakkan hoidma kõiki asju nimekirjas
     this.items = [];

     this.init();
   };

   window.ShopList = ShopList; // Paneme muuutja külge

   ShopList.routes = {
     'home-view': {
       'render': function(){
         // käivitame siis kui lehte laeme
         console.log('>>>>avaleht');
       }
     },
     'list-view': {
       'render': function(){
         // käivitame siis kui lehte laeme
         console.log('>>>>loend');

         //simulatsioon laeb kaua
         window.setTimeout(function(){
           document.querySelector('.loading').innerHTML = 'laetud!';
         }, 3000);

       }
     },
     'manage-view': {
       'render': function(){
         // käivitame siis kui lehte laeme
       }
     }
   };

   // Kõik funktsioonid lähevad Moosipurgi külge
   ShopList.prototype = {

     init: function(){
       console.log('Rakendus läks tööle');

       //kuulan aadressirea vahetust
       window.addEventListener('hashchange', this.routeChange.bind(this));

       // kui aadressireal ei ole hashi siis lisan juurde
       if(!window.location.hash){
         window.location.hash = 'home-view';
         // routechange siin ei ole vaja sest käsitsi muutmine käivitab routechange event'i ikka
       }else{
         //esimesel käivitamisel vaatame urli üle ja uuendame menüüd
         this.routeChange();
       }

       //saan kätte purgid localStorage kui on
       if(localStorage.items){
           //võtan stringi ja teen tagasi objektideks
           this.items = JSON.parse(localStorage.items);
           console.log('laadisin localStorageist massiiivi ' + this.items.length);

           //tekitan loendi htmli
           this.items.forEach(function(item){

               var new_item = new Item(item.id, item.title, item.amount);

               var li = new_item.createHtmlElement();
               document.querySelector('.list-of-items').appendChild(li);

           });

       }else{
         var xhttp = new XMLHttpRequest();
          xhttp.onreadystatechange = function() {
          if (xhttp.readyState == 4 && xhttp.status == 200) {

              console.log(xhttp.responseText);
              ShopList.instance.items = JSON.parse(xhttp.responseText);
              console.log(ShopList.instance.items);

              ShopList.instance.items.forEach(function(item){

                var new_item = new Item(item.id, item.title, item.amount);

                var li = new_item.createHtmlElement();
                document.querySelector('.list-of-items').appendChild(li);
              });
              localStorage.setItem('items', JSON.stringify(ShopList.instance.items));
            }
          };

          //teeb päringu
          xhttp.open("GET", "save.php", true);
          xhttp.send();
       }


       // esimene loogika oleks see, et kuulame hiireklikki nupul
       this.bindEvents();

     },

     bindEvents: function(){
       document.querySelector('.add-new-item').addEventListener('click', this.addNewClick.bind(this));

       //kuulan trükkimist otsikastis
       document.querySelector('#search').addEventListener('keyup', this.search.bind(this));

     },
     deleteItem: function(event){
       //millele vajutasin, SPAN
       console.log(event.target);

       //tema parent ehk mille sees ta on, LI
       console.log(event.target.parentNode);

       //mille sees on UL
       console.log(event.target.parentNode.parentNode);

       //id
       console.log(event.target.dataset.id);

       var c = confirm("Oled kindel?");

       // vajutas no või pani kiini
       if(!c){ return; }

       //KUSTUTAN
       console.log('kustutan');

       //   KUSTUTAN HTMLI
       var ul = event.target.parentNode.parentNode;
       var li = event.target.parentNode;

       ul.removeChild(li);

       var delete_id = event.target.dataset.id;
       // KUSTUTAN OBJEKTI JA UUENDAN localStorage
       for(var i=0; i<this.items.length; i++){

         if(this.items[i].id == delete_id){
           //see on see
           this.items.splice(i, 1);
           break;
         }
       }

       localStorage.setItem('items', JSON.stringify(this.items));

     },

     search: function(event){
         //otsikasti väärtus
         var needle = document.querySelector('#search').value.toLowerCase();
         console.log(needle);

         var list = document.querySelectorAll('ul.list-of-items li');
         console.log(list);

         for(var i = 0; i < list.length; i++){

             var li = list[i];

             // ühe listitemi sisu tekst
             var stack = li.querySelector('.content').innerHTML.toLowerCase();

             //kas otsisõna on sisus olemas
             if(stack.indexOf(needle) !== -1){
                 //olemas
                 li.style.display = 'list-item';

             }else{
                 //ei ole, index on -1, peidan
                 li.style.display = 'none';

             }

         }
     },

     addNewClick: function(event){
       //salvestame purgi
       //console.log(event);

       var title = document.querySelector('.title').value;
       var amount = document.querySelector('.amount').value;

       //console.log(title + ' ' + ingredients);
       //1) tekitan uue item'i
       var id = guid();
       var new_item = new Item(id, title, amount);

       //lisan massiiivi purgi
       this.items.push(new_item);
       console.log(JSON.stringify(this.items));
       // JSON'i stringina salvestan localStorage'isse
       localStorage.setItem('items', JSON.stringify(this.items));

      //AJAX
       var xhttp = new XMLHttpRequest();

       //mis juhtub, kui päring lõppeb
        xhttp.onreadystatechange = function() {

          console.log(xhttp.readyState);
          if (xhttp.readyState == 4 && xhttp.status == 200) {
            console.log(xhttp.responseText);
          }
        };

        //teeb päringu
        xhttp.open("GET", "save.php?id="+id+"&title="+title+"&AMOUNT="+amount, true);
        xhttp.send();

       // 2) lisan selle htmli listi juurde
       var li = new_item.createHtmlElement();
       document.querySelector('.list-of-items').appendChild(li);


     },

     routeChange: function(event){

       //kirjutan muuutujasse lehe nime, võtan maha #
       this.currentRoute = location.hash.slice(1);
       console.log(this.currentRoute);

       //kas meil on selline leht olemas?
       if(this.routes[this.currentRoute]){

         //muudan menüü lingi aktiivseks
         this.updateMenu();

         this.routes[this.currentRoute].render();


       }else{
         /// 404 - ei olnud
       }


     },

     updateMenu: function() {
       //http://stackoverflow.com/questions/195951/change-an-elements-class-with-javascript
       //1) võtan maha aktiivse menüülingi kui on
       document.querySelector('.active-menu').className = document.querySelector('.active-menu').className.replace('active-menu', '');

       //2) lisan uuele juurde
       //console.log(location.hash);
       document.querySelector('.'+this.currentRoute).className += ' active-menu';

     }

   }; // MOOSIPURGI LÕPP

   var Item = function(new_id, new_title, new_amount){
     this.id = new_id;
     this.title = new_title;
     this.amount = new_amount;
     console.log('created new item');
   };

   Item.prototype = {
     createHtmlElement: function(){

       // võttes title ja ingredients ->
       /*
       li
        span.letter
          M <- title esimene täht
        span.content
          title | ingredients
       */

       var li = document.createElement('li');

       var span = document.createElement('span');
       span.className = 'letter';

       var letter = document.createTextNode(this.title.charAt(0));
       span.appendChild(letter);

       li.appendChild(span);

       var span_with_content = document.createElement('span');
       span_with_content.className = 'content';

       var content = document.createTextNode(this.title + ' | ' + this.amount);
       span_with_content.appendChild(content);

       li.appendChild(span_with_content);

//Delete nupp
       var span_delete = document.createElement('span');
       span_delete.style.color = "red";
       span_delete.style.cursor = "pointer";

       span_delete.setAttribute("data-id", this.id);

       span_delete.innerHTML = " Delete";
       li.appendChild(span_delete);

       //keegi vajutas nupule
       span_delete.addEventListener('click', ShopList.instance.deleteItem.bind(ShopList.instance));


       return li;

     }
   };

   //HELPER
   function guid(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

   // kui leht laetud käivitan Moosipurgi rakenduse
   window.onload = function(){
     var app = new ShopList();
   };

})();
