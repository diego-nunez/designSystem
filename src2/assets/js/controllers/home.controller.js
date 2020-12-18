console.log('home controller prueba A');
var clickBtn = function(){
    let btn = document.getElementsByClassName('boton')[0];
    console.log(btn,'btn');
    $('.boton').click(function(){
        alert(92819)
    })
}
clickBtn();