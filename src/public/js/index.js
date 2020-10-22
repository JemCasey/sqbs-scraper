function loadNextPlayer() {
    $('#player-info').text('');
    $('#player-options').children().not('.btn-secondary').remove();
    $.ajax({
        url: '/player',
        success: function (data) {
            $('#player-info').text(JSON.stringify(data.playerDetails));

            for (var option of data.matchOptions) {
                let url = `/merge/${data.playerDetails.player_id}/${option.id}`;
                let handleClick = function () {
                    //debugger;
                    //alert(url);
                    $.post({
                        url: url,
                        success: loadNextPlayer,
                        error: function() {
                            alert("error occurred!");
                        }
                    });
                };

                var btn = $('<button/>',
                {
                    text: option.name,
                    class: 'btn btn-primary',
                    click: handleClick
                });
                $("#player-options").append(btn);
            }

        }
    });
};

$(document).ready(function () {
    $('#clear-btn').click(loadNextPlayer);
    loadNextPlayer();
});