function updateEncounter(id){
    $.ajax({
        url: '/encounters/' + id,
        type: 'PUT',
        data: $('#update-encounter').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};