export function select(param) {
    class customizeEachSelect{
        constructor(){

            // Para mandar a llamar las funcionalidades
            this.functionalities = new SelectFunctionalities();
        }
        createSelect(){

            // Se crean los elementos select
            const allSelectElements = document.getElementsByTagName('select'),
                excludeClass = param.exclude,
                isFloatLabel = param.floatLabel;
    
            for(var item of allSelectElements){
                // si no contiene la clase que excluye los items a crear
                if(!item.classList.contains((excludeClass != '')? excludeClass : '')){
                    
                    var option = '',
                        selectName = item.getAttribute('name'),
                        ulElement = document.createElement('ul'),
                        wrapElement = document.createElement('div'),
                        inputElement = '',
                        elementId = item.getAttribute('id'),
                        arrowClasses = item.getAttribute('data-arrow-classes') || '',
                        actualClasses = item.getAttribute("class").split(' ');
                        wrapElement.classList.add("CE-select__select", `${(isFloatLabel)? 'CE-select__item--float' : false}` ,...actualClasses);
                        wrapElement.setAttribute("tabindex",'0')
                        wrapElement.setAttribute("id",elementId)
    
                    // se crean los options en una lista
                    Array.from(item.getElementsByTagName('option')).forEach((el) => {
                      
                        
                        if(el.value ===""){
                            inputElement += `<span class="CE-select__select--selected " tabindex="0">
                            <span class="CE-select__label ${(isFloatLabel)? 'CE-select__label--float' : ''}">${el.text}</span>
                            ${(isFloatLabel)? '<span class="CE-select__label--result"></span>' : ''}
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
                    item.classList.add('toDeleteSelect');
                    
                    // se establece la funcionalidad
                    this.functionalities.selectFunctionality(wrapElement)
                }
            }
            // se manda a llamar la función para borrar los elementos iniciales
            this.deleteItem(document.getElementsByClassName('toDeleteSelect'));
        }
        deleteItem(items){
            // función que borra los elementos con clase toDelete
            [...items].forEach(item=>{
                item.remove();
            })
        }
    }
    class SelectFunctionalities{

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
        
    }
    var selectItems = new customizeEachSelect();
    selectItems.createSelect();
}