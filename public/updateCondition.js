function updateCondition(id){
    $.ajax({
        url: '/conditions/' + id,
        type: 'PUT',
        data: $('#update-condition').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};