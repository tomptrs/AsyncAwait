# Asynchroon Programmeren

Het verbeteren van responsiveness en performantieproblemen kan verkregen worden door asynchroon programmeren. Vroeger was dit complex om te coderen, maar vanaf .NET 4.5 is dit zeer makkelijk geworden.
Asynchroon programmeren is essentieel voor tijdrovende activiteiten!
 

De async and await keywoorden in C# zijn het hart van async programmeren. Het await keywoord duidt aan dat een stuk code asynchroon moet wachten op een ander stuk code. Met het asyc keywoord kan je methoden markeren als task gebaseerde asynchrone methoden.
Het concept is .net heet het task based async pattern. Er bestaat namelijk een type Task, dan je nodig hebt om aynchroon te programmeren.
 

Waarom tasks? Dit is eigenlijk gewoon een evolutie, want er bestonden reeds threads, anync delegates, background workers. Maar met tasks hebben we de mogelijkheid om een task te onderbreken, om makkelijk met exception handling te werken…



### Extra info

Async-methoden zijn bedoeld om non-blocking bewerkingen te zijn. Een await expressie in een async-methode blokkeert de huidige thread niet terwijl de taak wordt uitgevoerd.
Async gebruikt de tijd op de thread alleen als de methode actief is.

De async-gebaseerde benadering van asynchrone programmering heeft in bijna alle gevallen de voorkeur boven bestaande benaderingen. In het bijzonder is deze aanpak beter dan BackgroundWorker voor IO-gebonden operaties omdat de code eenvoudiger is en je niet hoeft te waken tegen raceomstandigheden. 

## Tasks

Een task stelt een asynchrone operatie voor, en is een unit of work
Aan te roepen via task.run( ACTION )
Een task wordt op een thread op een processor uitgevoerd.
Extra:
Een action is een delegate of een anonymous funciton:

```
        //Login!
        private void Button_Click(object sender, RoutedEventArgs e)
        {
            Task.Run(() => Thread.Sleep(2000));

        }
```
Nu zie je natuurlijk niet of er iets gebeurt!!

### Continuation 
> schedule iets dat moet gebeuren eens de async operatie completed is.
Een task geeft een task terug, en zo kan je een continuation schedulen:

```
private void Button_Click(object sender, RoutedEventArgs e)
        {
            btLogin.IsEnabled = false;
            var task = Task.Run(() =>
            {
                Thread.Sleep(2000);
            });


            task.ContinueWith((t) =>  // t is task
            {
                btLogin.IsEnabled = true;
            });
        }

```

Als je dit runt, krijg je een foutmelding, want je voert een UI operatie uit op de niet UI thread.


```


  private void Button_Click(object sender, RoutedEventArgs e)
        {
            btLogin.IsEnabled = false;
            var task = Task.Run(() =>
            {
                Thread.Sleep(2000);
            });


            task.ContinueWith((t) =>  // t is task
            {
                Dispatcher.Invoke(() => btLogin.IsEnabled = true);
                
            });
        }

```
Als er binnen een task.run een exception voorkomt, dan moet je deze opvangen.

```

private void Button_Click(object sender, RoutedEventArgs e)
        {
            btLogin.IsEnabled = false;
            var task = Task.Run(() =>
            {
                try
                {
                    throw new UnauthorizedAccessException();
                    Thread.Sleep(2000);
                    return "login success!";
                }
                catch(Exception)
                {
                    return "login failed";
                }
            });


            task.ContinueWith((t) =>  // t is task
            {
                
                    Dispatcher.Invoke(() =>
                    {
                        btLogin.IsEnabled = true;
                        btLogin.Content = t.Result;
                    });
                
                
            });

```

Ipv met continuewith is er nog een andere mogelijkheid:
Zo hoeven we niet met dispatcher werken.
Task.configureAwait => zo kunnen we configureren waar we de continuation doen (dus op de UI thread, via een true configuratie).
.getAwaiter => de configureAwait geeft een awaiter object, en met getawaiter hebben we de mogelijkheid om te weten te komen of een task completed is.

```
private void Button_Click(object sender, RoutedEventArgs e)
        {
            btLogin.IsEnabled = false;
            var task = Task.Run(() =>
            {
                try
                {
                    //throw new UnauthorizedAccessException();
                    Thread.Sleep(2000);
                    return "login succes!";
                }
                catch(Exception)
                {
                    return "login failed";
                }
            });


            /* task.ContinueWith((t) =>  // t is task
             {

                     Dispatcher.Invoke(() =>
                     {
                         btLogin.IsEnabled = true;
                         btLogin.Content = t.Result;
                     });


             });*/

            task.ConfigureAwait(true)
                .GetAwaiter()
                .OnCompleted(() => {
                    btLogin.IsEnabled = true;
                    btLogin.Content = task.Result;
                });
        }
    }

```

## Async / Await
Het async en await keyword is nieuw vanaf .net 4.5. Het geeft ons de mogelijkheid om asynchrone code op een veel cleanere en verstaanbare manier te coderen.
Wat we willen is een asynchrone taak starten, en als deze taak gedaan is een continuation aan vasthangen die het resultaat van de voorgaande taak gebruikt.
We kunnen dit realiseren met async en await.

1.	Eerst markeren we de methode async. Let op met het markeren van de methode als async wordt de methode nog niet asynchroon uitgevoerd!

```

private async void Button_Click(object sender, RoutedEventArgs e)
{
            Thread.Sleep(2000);
}

```
Dus om onze taak asynchroon uit te voeren, werken we opnieuw met een task:

```

private async void Button_Click(object sender, RoutedEventArgs e)
        {
            Task.Run(()=>
            {
                Thread.Sleep(2000);
            });

            btLogin.Content = "Succes!";

        }

```
Als je deze bovenstaande code runt, merk je dat de content van de knop onmiddellijk veranderd is, want task.run loopt asynchroon, dus de volgende codeblok wordt direct uitgevoerd.
Waar we in voorgaande voorbeelden met continuewith gewerkt hebben, kunnen we nu een nieuw keywoord introduceren,namelijk await, wat aangeeft dat alle code na de task pas uitgevoerd wordt (dus een continuation) wanneer de taak compleet is.

```

private async void Button_Click(object sender, RoutedEventArgs e)
        {
            btLogin.IsEnabled = false;
            await Task.Run(()=>
            {
                Thread.Sleep(2000);
            });

            btLogin.Content = "Succes!";
            btLogin.IsEnabled = true;
        }
        
```

En dit wanneer de UI responsief blijft!!
Het grote verschil met continueWith is ook dat toen de code niet in de UI thread werd uitgevoerd, terwijl we nu nog steeds in de UI thread zitten. Ook is de code veel simpeler geworden.

Wanneer we nu een resultaat van onze asynchrone taak willen gebruiken, het await keywoord wacht op complete, en vangt het resultaat op. Dus kunnen we onze code veranderen naar:

```

private async void Button_Click(object sender, RoutedEventArgs e)
        {
            btLogin.IsEnabled = false;
            var result = await Task.Run(()=>
            {
                Thread.Sleep(2000);
                return "Succes!";
            });

            btLogin.Content = result;
            btLogin.IsEnabled = true;
        }

```
## Refactor

Normaal gaan we onze async operatie in een aparte methode stoppen. Meestal wordt er ook aan de methode naam het “Async” woordje gehangen:

```

  private void Button_Click(object sender, RoutedEventArgs e)
        {
            LoginAsync();
        }
           

        private async void LoginAsync()
        {
                btLogin.IsEnabled = false;
                var result = await Task.Run(() =>
                {
                    Thread.Sleep(2000);
                    return "Succes!";
                });

                btLogin.Content = result;
                btLogin.IsEnabled = true;
            }
        }

```
Throw exception:

```

private async void LoginAsync()
        {
                btLogin.IsEnabled = false;
                var result = await Task.Run(() =>
                {
                    throw new UnauthorizedAccessException();
                    Thread.Sleep(2000);
                    return "Succes!";
                });

                btLogin.Content = result;
                btLogin.IsEnabled = true;
            }
        }

```
We zien dat de applicatie crasht.
Als je een exceptie throwt , dan moet je dit met try catch opvangen:

```

private void Button_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                LoginAsync();
            }
            catch (Exception)
            {

            }
        }
           

        private async void LoginAsync()
        {
                btLogin.IsEnabled = false;
                var result = await Task.Run(() =>
                {
                    throw new UnauthorizedAccessException();
                    Thread.Sleep(2000);
                    return "Succes!";
                });

                btLogin.Content = result;
                btLogin.IsEnabled = true;
            }
        }

```

Nu zien we dat de applicatie nog steeds crasht.
Oplossing 1. We gaan de async methode in een try catch steken:

```

private void Button_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                LoginAsync();
            }
            catch (Exception)
            {

            }
        }
           

        private async void LoginAsync()
        {
            try
            {
                btLogin.IsEnabled = false;
                var result = await Task.Run(() =>
                {
                    throw new UnauthorizedAccessException();
                    Thread.Sleep(2000);
                    return "Succes!";
                });

                btLogin.Content = result;
                btLogin.IsEnabled = true;
            }
            catch (Exception)
            {

            }
               
            }
        }

```
Nu komen we in de catch van de async method uit. Maar de applicatie crasht niet meer.

Wat als we de UnAuthorizedException bovenaan de methode plaatsen:

```

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                LoginAsync();
            }
            catch (Exception)
            {

            }
        }
           

        private async void LoginAsync()
        {
            throw new UnauthorizedAccessException();
            try
            {
                btLogin.IsEnabled = false;
                var result = await Task.Run(() =>
                {
                  
                    Thread.Sleep(2000);
                    return "Succes!";
                });

                btLogin.Content = result;
                btLogin.IsEnabled = true;
            }
            catch (Exception)
            {

            }
               
            }
        }
        
```

We zien dat de applicatie opnieuw crasht, alhoewel we zouden verwachten dat de try catch van de buttonclick nu zou moeten werken, dit is dus niet het geval.
Wanneer je een async methode markeert en een exception throwt, dan moet de compiler de exceptie op een task zetten, daarom veranderen we de void methode van LoginAsync naar Task:

```

  private void Button_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                LoginAsync();

            }
            catch (Exception)
            {

            }

        }
           

        private async Task LoginAsync()
        {
            throw new UnauthorizedAccessException();
            try
            {
                btLogin.IsEnabled = false;
                var result = await Task.Run(() =>
                {
                  
                    Thread.Sleep(2000);
                    return "Succes!";
                });

                btLogin.Content = result;
                btLogin.IsEnabled = true;
            }
            catch (Exception)
            {

            }
               
            }
        }
```

En nu werkt alles weer.
Je hoeft zelfs niets meer in een eerste try catch te zetten, want we komen niet in die eerste catch
Dus wie onze LoginAsync methode aanroept moet  ervoor zorgen dat hij weet of de methode succesvol is, dit doen we met async / await:

```

private async void Button_Click(object sender, RoutedEventArgs e)
        {
            
               await LoginAsync();

            

        }
           

        private async Task LoginAsync()
        {
            throw new UnauthorizedAccessException();
            try
            {
                btLogin.IsEnabled = false;
                var result = await Task.Run(() =>
                {
                  
                    Thread.Sleep(2000);
                    return "Succes!";
                });

                btLogin.Content = result;
                btLogin.IsEnabled = true;
            }
            catch (Exception)
            {

            }
               
            }
        }
        
```

Als je dit uitvoert crasht de applicatie opnieuw, wat eigenlijk goed is, want we throwen een exception, maar nu kan je deze wel opvangen!

```

  private async void Button_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                await LoginAsync();
            }
            catch (Exception)
            {
                btLogin.Content = "FAIL";
            }

            

        }
           

        private async Task LoginAsync()
        {
            throw new UnauthorizedAccessException();
            try
            {
                btLogin.IsEnabled = false;
                var result = await Task.Run(() =>
                {
                  
                    Thread.Sleep(2000);
                    return "Succes!";
                });

                btLogin.Content = result;
                btLogin.IsEnabled = true;
            }
            catch (Exception)
            {

            }
               
            }
        }

```

We willen nu in onze async methode geen UI handling doen, maar dit in de klik methode.
Dit geeft een fout:

```

private async Task LoginAsync()
        {
            throw new UnauthorizedAccessException();
            try
            {
                btLogin.IsEnabled = false;
                var result = await Task.Run(() =>
                {
                  
                    Thread.Sleep(2000);
                    return "Succes!";
                });

                return result;
            }
            catch (Exception)
            {

            }
               
            }
        }

```

Want we returnen een task, dit is makkelijk op te lossen door :


```

private async Task<string> LoginAsync()
        {
            throw new UnauthorizedAccessException();
            try
            {
                btLogin.IsEnabled = false;
                var result = await Task.Run(() =>
                {
                  
                    Thread.Sleep(2000);
                    return "Succes!";
                });

                return result;
            }
            catch (Exception)
            {

            }
               
            }
        }
        
``` 

Omdat we in deze methode het await keywoord gebruiken, kunnen we het resultaat van de task opvangen:

```

private async void Button_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                await LoginAsync();
            }
            catch (Exception)
            {
                btLogin.Content = "FAIL";
            }

            

        }
```

Het resultaat = 

```

private async void Button_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var result = await LoginAsync();
                btLogin.Content = result;
            }
            catch (Exception)
            {
                btLogin.Content = "Internal ERRO";
            }

            

        }
           

        private async Task<string> LoginAsync()
        {
            throw new UnauthorizedAccessException();
            try
            {
                btLogin.IsEnabled = false;
                var result = await Task.Run(() =>
                {
                  
                    Thread.Sleep(2000);
                    return "Succes!";
                });

                return result;
            }
            catch (Exception)
            {
                return "Fail!";

            }
               
            }
        }
```
Speel met waar je de exception throwt:

```

private async void Button_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var result = await LoginAsync();
                btLogin.Content = result;
            }
            catch (Exception)
            {
                btLogin.Content = "Internal ERROR";
            }

            

        }
           

        private async Task<string> LoginAsync()
        {
           
            try
            {
                throw new UnauthorizedAccessException();
                btLogin.IsEnabled = false;
                var result = await Task.Run(() =>
                {
                  
                    Thread.Sleep(2000);
                    return "Succes!";
                });

                return result;
            }
            catch (Exception)
            {
                return "Fail!";

            }
               
            }
        }
        
```
Nu maken we onze UI compleet:


```

private async void Button_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                btLogin.IsEnabled = false;

                var result = await LoginAsync();

                btLogin.Content = result;
                btLogin.IsEnabled = true;
            }
            catch (Exception)
            {
                btLogin.Content = "Internal ERROR";
            }

        }

```
# Async / Await in ASP.NET

We gaan bijvoorbeeld een quote van de dag ophalen van een RET API: http://quotes.rest/qod.json.
Dit kunnen we doen via de HttpClient : 

```

public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            var client = new HttpClient();
            var msg = client.GetAsync("http://quotes.rest/qod.json");
            

            return View();
        }

```

De GetAsync methode geeft aan dat men de quote asynchroon gaat ophalen, daarom gaan we op het resultaat wachten vooraleer we verder gaan:

```

public async IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            var client = new HttpClient();
            var msg = await client.GetAsync("http://quotes.rest/qod.json");
            var result = msg.Content;

            return View();
        }
```

Als je het await keywoord gebruikt, dan moet je de methode natuurlijk markeren als async, en dan retourneren we natuurlijk een task:

```

public async Task<ActionResult> About()
        {
            ViewData["Message"] = "Your application description page.";

            var client = new HttpClient();
            var msg = await client.GetAsync("http://quotes.rest/qod.json");
            var result = msg.Content;

            return View();
        }
```

Het lezen van het resultaat is ook een asynchrone taak:

```

public async Task<ActionResult> About()
        {
            ViewData["Message"] = "Your application description page.";

            var client = new HttpClient();
            var msg = await client.GetAsync("http://quotes.rest/qod.json");
            var result = await msg.Content.ReadAsStringAsync();


            return View();
        }
```

We kunnen ons json object makkelijk uitlezen door:

```

var client = new HttpClient();
            var msg = await  client.GetAsync("http://quotes.rest/qod.json");

            var content = await msg.Content.ReadAsStringAsync();

            //http://json2csharp.com/#
            RootObject r = JsonConvert.DeserializeObject<RootObject>(content);
            string quote = r.contents.quotes[0].quote;
            ViewData["quote"] = quote;
            return View();

```


## Asynchroon programmeren in JavaScript

1. Callback Hell
2. Promises
3. Async / Await


### Intro

De eerste oplossing kwam in de vorm van geneste functies als callbacks. Deze oplossing leidde tot iets genaamd callback hell.

Toen kwamen er "Promises". Dit patroon maakte de code een stuk gemakkelijker om te lezen, maar het stond ver af van het Do not Repeat Yourself (DRY) -principe. Er waren nog steeds te veel gevallen waarin je dezelfde stukjes code moest herhalen om de applicatie goed te beheren. 

Nu zijn er asynchrone / await-statements, en maakt asynchrone code eindelijk in JavaScript net zo gemakkelijk te lezen en te schrijven als elk ander stuk code.

### Async / Await


Promises maakten de weg vrij voor een van de coolste verbeteringen in JavaScript. ECMAScript 2017 bracht Promises in JavaScript in de vorm van asynchrone en await-statements.

Ze stellen ons in staat om op Promise gebaseerde code te schrijven alsof deze synchroon is, maar zonder de main thread te blokkeren.

Await is enkel toegestaan binnen een async functie!

Async-functies zijn de volgende logische stap in de evolutie van asynchrone programmeren in JavaScript. Ze zullen de code veel cleaner en gemakkelijker in onderhoud maken. Als u een functie als async declareert, zorgt u ervoor dat deze altijd een belofte retourneert, zodat u zich daar geen zorgen meer over hoeft te maken.

- De code is veel cleaner.
- Foutafhandeling is veel eenvoudiger en het is afhankelijk van try / catch, net als in een andere synchrone code.
- Foutopsporing is veel eenvoudiger. Je kan door de wachtende code stappen alsof het synchrone calls zijn.

```

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="QuoteService.js"></script>
    <script>
        var quoteService = new QuoteService();
        $(function () {
                    /*
                    Get async call to quote of the day
                    http://quotes.rest/qod.json
                    */
                        $(".callback").click(function (event) {
                        var result = quoteService.QuoteOfTheDay(function (result) {
                            $("h2").text(result);
                        });
                        });
                        
                        $(".promise").click(function (event) {
                            var result = quoteService.QuoteOfTheDayPromise().then(function(data){
                                console.log(data);
                            });

                        });
            
            
                          $(".AsyncAwait").click(async function (event) {
                            var result = await quoteService.QuoteOfTheDayPromise();
                            console.log("async await");
                            console.log(result);
                            });

                       
                    });
    </script>
</head>

<body>
    <h2></h2> <a class="callback" href="#">Get Quote</a>
     <a class="promise" href="#">Get Quote with promise</a> 
     <a class="promise" href="#">Get Quote with promise</a> 
     <a class="AsyncAwait" href="#">Get Quote with AsycnAwait</a> 
    </body>

</html>

```

### The QuoteService

```

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
 
```
