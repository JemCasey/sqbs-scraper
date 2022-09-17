function loadNextPlayer() {
    $('#player-info').text('');
    $('#player-options').children().not('.btn-secondary').remove();
    $.ajax({
        url: '/player',
        success: function (data) {
            $('.container').html(data.results.map(p => `
                <div class="player-div">
                    <div id="${p.id}-player-info"></div>
                    <div id="${p.id}-player-options"></div>
                </div>
                <br/>
            `).join(''));

            for (var player of data.results) {
                $(`#${player.id}-player-info`).text(JSON.stringify(player.playerDetails));

                for (var option of player.matchOptions) {
                    let url = `/merge/${player.playerDetails.player_id}/${option.id}`;
                    let handleClick = function (e) {                 
                        $.post({
                            url: url,
                            success: () => {
                                $(e.target).closest('.player-div').hide();
                            },
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
                    $(`#${player.id}-player-options`).append(btn);
                }
            }
        }
    });
};

$(document).ready(function () {
    //$('#clear-btn').click(loadNextPlayer);
    loadNextPlayer();
});