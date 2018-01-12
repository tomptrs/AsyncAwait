function QuoteService() {
    
    this.QuoteOfTheDay = function(callback) {
        $.get(" http://quotes.rest/qod.json", function (data, status) {
        
            if(data.success){
            callback(data.contents.quotes[0].quote);
            }
        });
    }
    //function(fullfill,reject)
    this.QuoteOfTheDayPromise = function(){
        return new Promise(function(resolve,error){
            $.get(" http://quotes.rest/qod.json", function (data, status) {
        
            if(data.success){
                console.log("promise gelukt");
                resolve(data.contents.quotes[0].quote);
            }
            });
        });
    }
 }
