export function general_inputs(param) {
    class customizeEachInput{
        constructor(){
    
            // Para mandar a llamar las funcionalidades
            this.functionalities = new floatLabelFunctionalities();
        }
        createGeneral(){

            var allGeneralElements = document.getElementsByClassName(param.class);

            [...allGeneralElements].forEach(item=>{
                var idElement = item.getAttribute('id'),
                labelElement = document.querySelector('[for="'+idElement+'"]'),
                inputElement = item.cloneNode(true),
                wrapElement = document.createElement('div'),
                actualClasses = item.getAttribute("class").split(' ');
                item.setAttribute("class",'toDeleteGeneral')
                
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
            this.deleteItem(document.getElementsByClassName('toDeleteGeneral'));
            
            
        }
        
        deleteItem(items){
            // función que borra los elementos con clase toDelete
            [...items].forEach(item=>{
                item.remove();
            })
        }
    } 
    class floatLabelFunctionalities{
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

    const generalInput = new customizeEachInput();
    generalInput.createGeneral();
}