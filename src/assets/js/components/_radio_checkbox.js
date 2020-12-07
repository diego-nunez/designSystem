export function radio_checkbox(param) {
    class customizeEachSelect{
        createCheck(){
            var allCheckboxElements = document.querySelectorAll('[type="checkbox"]'),
                allRadioElements =  document.querySelectorAll('[type="radio"]'),
                allCheckElements = [...allCheckboxElements,...allRadioElements];
                
            const excludeClass = param.exclude;

                // para crrear los elementos checkbox y radio buttons
                allCheckElements.forEach(item=>{
                    // si no contiene la clase que excluye los items a crear
                    if(!item.classList.contains((excludeClass != '')? excludeClass: '')){

                        var idElement = item.getAttribute('id'),
                            labelElement = document.querySelector('[for="'+idElement+'"]'),
                            labelText = labelElement.innerHTML,
                            checkElement = '';
                            item.classList.add('CE__element--d-none');

                            //se crea la estructura custom
                            checkElement = `<span class="CE-check__element CE-check__${item.getAttribute('type')}"></span>
                            <span class="CE-check__label">${labelText}</span>`;
                            
                            labelElement.textContent = '';
                            labelElement.appendChild(item);
                            labelElement.innerHTML += checkElement;  
                            labelElement.classList.add('CE-check');
                    }
                })
                

        }
    }
    var radioCheckboxItems = new customizeEachSelect();
    radioCheckboxItems.createCheck();
}