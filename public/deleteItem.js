function deleteItem(id){
    console.log("in the function");    
    $.ajax({
        url: '/items/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
