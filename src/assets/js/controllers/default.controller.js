var includeLinkAssets = function(callback){
    let containerAssets = document.getElementsByClassName('DS__container--assets');

    [...containerAssets].forEach(item=>{
        let containerHtml = item.innerHTML,
            elementType = item.getAttribute('type'),
            headElement = document.getElementsByTagName('head')[0],
            bodyElement = document.getElementsByTagName('body')[0],
            patternToChange = containerHtml.match( /\{\{([^ \{\}])+\}\}/g ),
            regX = /[\{\{\}\}]*/g;

            patternToChange.forEach((element,index) =>{
                console.log(element)
                let toReplace = new RegExp(patternToChange[index],"g"),
                    elementToReplace = patternToChange[index].replace(regX,'');

                    if(elementType == "link"){
                        let link = document.createElement('link');
                            link.type = 'text/css';
                            link.rel = 'stylesheet';
                            link.href = elementToReplace;
                            headElement.appendChild(link);
                    }else{
                        let scripTag = document.createElement('script');
                        scripTag.src = elementToReplace;
                        scripTag.setAttribute("type",elementType);
                        document.body.appendChild(scripTag)
                    }


            })
    })

    callback();
}


includeLinkAssets(function(){
    let loader = document.getElementsByClassName('CE__loader ');
    setTimeout(function(){loader[0].classList.add('CE__loader--hidden')},200)
   //loader[0].classList.add('CE__loader--hidden');
    
});

