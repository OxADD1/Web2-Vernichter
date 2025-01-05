function fillButton(dataToFill, ids, text, dbname){
    ids.forEach(function(id) {
        console.log(id);
        console.log(dbname);
        //holt die Dropdowns fuer Kontos
        var button = document.getElementById(id);
        //Erstellt default option
        var option = document.createElement("option");
        option.value = 0;
        option.innerHTML = text;
        //append an button
        button.appendChild(option);
        dataToFill.forEach(function(item){
            console.log(dbname);
            var option = document.createElement("option");
            option.value = item.id;
            option.innerHTML = item[dbname];
            button.appendChild(option);
        })
    })
}