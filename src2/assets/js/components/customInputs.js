'use strict';
// agregando comentario parte 2

class customizeEachInput{
    constructor(){

        // Para mandar a llamar las funcionalidades
        this.functionalities = new InputFunctionalities();
    }

    createSelect(args){

        // Se crean los elementos select
        var allSelectElements = document.getElementsByTagName('select');

        for(var item of allSelectElements){
            // si no contiene la clase que excluye los items a crear
            if(!item.classList.contains((args[0] != '')? args[0] : '')){
                
                var option = '',
                    selectName = item.getAttribute('name'),
                    ulElement = document.createElement('ul'),
                    wrapElement = document.createElement('div'),
                    inputElement = '',
                    arrowClasses = item.getAttribute('data-arrow-classes') || '',
                    actualClasses = item.getAttribute("class").split(' ');
                    wrapElement.classList.add("CE-select__select", `${(args[1])? 'CE-select__item--float' : false}` ,...actualClasses);
                    wrapElement.setAttribute("tabindex",'0')

                // se crean los options en una lista
                Array.from(item.getElementsByTagName('option')).forEach((el) => {
                  
                    
                    if(el.value ===""){
                        inputElement += `<span class="CE-select__select--selected " tabindex="0">
                        <span class="CE-select__label ${(args[1])? 'CE-select__label--float' : ''}">${el.text}</span>
                        ${(args[1])? '<span class="CE-select__label--result"></span>' : ''}
                        <span class="CE-select__arrow ${arrowClasses}"></span>
                        </span>
                        <input type="hidden" class="CE-select__input" name="${selectName || '' }"/>`;
                    }else{
                        option += `<li data-value="${el.value}" tabindex="-1">${el.text}</li>`;
                    }
                });

                // se hace el append de los options
                ulElement.innerHTML = option;
                wrapElement.innerHTML = inputElement;
                wrapElement.appendChild(ulElement)
                item.parentNode.insertBefore(wrapElement, item.nextSibling);

                // se agrega la clase toDelete para que después de haber sido creado el custom select se borre el select inicial
                item.classList.add('toDelete');
                
                // se establece la funcionalidad
                this.functionalities.selectFunctionality(wrapElement)
            }
        }
        // se manda a llamar la función para borrar los elementos iniciales
        this.deleteItem(document.getElementsByClassName('toDelete'));
    }
    createCheck(args){
        var allCheckboxElements = document.querySelectorAll('[type="checkbox"]'),
            allRadioElements =  document.querySelectorAll('[type="radio"]'),
            allCheckElements = [...allCheckboxElements,...allRadioElements];
            
            // para crrear los elementos checkbox y radio buttons
            allCheckElements.forEach(item=>{
                // si no contiene la clase que excluye los items a crear
                if(!item.classList.contains((args[0] != '')? args[0] : '')){

                    var idElement = item.getAttribute('id'),
                        labelElement = document.querySelector('[for="'+idElement+'"]'),
                        labelText = labelElement.textContent,
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
    createGeneral(args){
        // Sólo aplica para elementos float label
        if(args[1]){

            var allGeneralElements = document.getElementsByClassName(args[0]);

        [...allGeneralElements].forEach(item=>{
            var idElement = item.getAttribute('id'),
            labelElement = document.querySelector('[for="'+idElement+'"]'),
            inputElement = item.cloneNode(true),
            wrapElement = document.createElement('div'),
            actualClasses = item.getAttribute("class").split(' ');
            item.setAttribute("class",'toDelete')
            
            // Se crea la estructura para el float label
            wrapElement.classList.add("CE-general","CE-item__float",...actualClasses);
            labelElement.classList.add('CE-item__label--float',`CE-item__label--${(item.tagName).toLowerCase()}`);
            inputElement.classList.add('CE-item__input--float');
            wrapElement.appendChild(labelElement);
            wrapElement.appendChild(inputElement);

            item.parentNode.insertBefore(wrapElement, item.nextSibling);

            // se manda a llamar la funcionalidad
            this.functionalities.floatLabelFunctionality(wrapElement);
        })
        // se manda a llamar la función para borrar los elementos iniciales
        this.deleteItem(document.getElementsByClassName('toDelete'));

        }
        
        
    }
    
    deleteItem(items){
        // función que borra los elementos con clase toDelete
        [...items].forEach(item=>{
            item.remove();
        })
    }

}

class InputFunctionalities{

    selectFunctionality(element){
        //Funcionalidad del select
        var selectElement = element.getElementsByClassName('CE-select__select--selected'),
            ulElement = element.getElementsByTagName('ul'),
            listElement = ulElement[0].getElementsByTagName('li'),
            actualFocus = -1;

        selectElement[0].addEventListener('click', (e) => {
            // se agrega el click para abrir el select
            var that = e.target,
                siblingList = element.getElementsByTagName('ul');

                if(!element.classList.contains('CE-select__select--open')){
                    element.classList.add('CE-select__select--open');
                }else{
                    element.classList.remove('CE-select__select--open');
                }
            
        })

        ulElement[0].addEventListener('click', (e) => {
            // Si el click es en un elemento de lista manda a llamar la function setValueSalect sino cierra el selecr
            var that = e.target;
            (that.tagName == 'LI') ? this.setValueSelect(that) : element.classList.remove('CE-select__select--open');
        });


        document.onclick = function(e){
            // esta function sirve para cerrar el select cuando das click en otro elemento
            var allSelects = document.getElementsByClassName('CE-select__select');
              [...allSelects].forEach(item=>{
                item.classList.remove('CE-select__select--open');
              })
            if(e.target.closest('.CE-select__select') != null && e.target.tagName != 'LI'){
                    e.target.closest('.CE-select__select').classList.add('CE-select__select--open')
            }
        };

        element.addEventListener('keydown', (e) => {

            // function para el funcionamiento de las flechas y enter dentro del select

            e.preventDefault();
            if(e.which == 40){
                if(actualFocus < (listElement.length - 1)){
                     actualFocus++
                }else{
                    actualFocus = 0;
                }
                element.classList.add('CE-select__select--open');
                element.getElementsByTagName('li')[actualFocus].focus()

            }else if( e.which == 38){
                (actualFocus > 0) ?  actualFocus-- : actualFocus = listElement.length - 1;
                element.getElementsByTagName('li')[actualFocus].focus()
            }else if( e.which == 13){
                this.setValueSelect(element.getElementsByTagName('li')[actualFocus]);
            }
        });
        
    }

    setValueSelect(item){
        //function que setea el valor del select cuando se selecciona un elemento
        var parentElement = item.closest('.CE-select__select'),
            thatValue = item.getAttribute('data-value'),
            siblingInput = parentElement.getElementsByClassName('CE-select__input');

        siblingInput[0].setAttribute('value',thatValue);
        item.classList.add('CE-select__li--selected')
        parentElement.classList.add('CE-select__float--active');
        setTimeout(function(){
            if(parentElement.classList.contains('CE-select__item--float')){
                parentElement.getElementsByClassName('CE-select__label--result')[0].innerHTML = thatValue
            }else{
                parentElement.getElementsByClassName('CE-select__label')[0].innerHTML = thatValue
            }
        },100)

        parentElement.classList.remove('CE-select__select--open');
    }
    
    
    floatLabelFunctionality(element){
        element.addEventListener('click', (e) => {
            // function para activar el float label
            var that = e.target;
            if(that.tagName == 'LABEL' && !that.classList.contains('CE-item__label--active')){
                that.classList.add('CE-item__label--active');
            }
        })
        //'CE-item__input--float'
        element.getElementsByClassName('CE-item__input--float')[0].addEventListener('focusout', (e) => {
            // function para desactivar el float label
            var that = e.target,
                idElement = that.getAttribute('id'),
                labelSibling = document.querySelector('[for="'+idElement+'"]');
            if(that.value == ''){
                labelSibling.classList.remove('CE-item__label--active')
            }
        });
    }
}

class customizeInputs{
    constructor(args){
        this.select = (args.selects == false)? false:true,
        this.checkbox = (args.checkbox == false)? false:true,
        this.general = (args.general == false)? false:args.general,
        this.exclude = args.exclude || false,
        this.floatLabel = (args.floatLabel == false)? false: args.floatLabel
    }
    customInputs(){
        var allInputsItems = Object.getOwnPropertyNames(this);
        allInputsItems.map(item=>{
            var callFunctionName = `create${(item == 'checkbox' || item == 'radio')? 'Check' :item.charAt(0).toUpperCase() + item.substring(1)}`;
            
            if(this[item] && (item != 'exclude' && item != 'floatLabel')){
                var singleItem = new customizeEachInput();
                singleItem[callFunctionName]([(item == 'general') ? this['general']: this['exclude'],this.floatLabel[item]]);
            }
        })
    }
}


// Ejemplo - inicializar la función y llamarla

/* ---------------------

var input = new customizeInputs({
    exclude: 'noSelected',
    general: 'customizeInput',
    floatLabel: {
        'select': true,
        'general': true,
        'excludeClasses': ['noFloatLabel']
    }
})

input.customInputs(); 

-------------------------- */