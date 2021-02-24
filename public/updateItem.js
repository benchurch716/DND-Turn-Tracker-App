function updateItem(id){
    $.ajax({
        url: '/items/' + id,
        type: 'PUT',
        data: $('#update-item').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};