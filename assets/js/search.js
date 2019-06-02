// For storing youtube player objects.
var ytPlayers = [];

// total results to display.
var curResultArrLen = 0;

// For removing old results.
var prevResultArrLen = 0;

// stores the state of the ytPlayers.
var playerLoaded = false;

// stores the state of no result message.
var noResultMsgLoaded = false;

// stores the state of youtube rest api.
var clientApiLoaded = false;

// copy the response to global variable
// as the youtube API is internally triggering
// the callback function.
var globalResponse;

// track the no. of results to display
var resultCount;

// track the scroll bar pixels
var scrollCount;

/**
 * Loads the IFrame Player API code asynchronously.
 */
function youtubeAPIInit() {
    let tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

/**
 * This function creates an <iframe> or player and gets internally triggered for the first time
 * during API initialization. Then we will call this function directly so that we dont
 * need to initialize API everytime.
 */
function onYouTubeIframeAPIReady(resultStartCount = 0) {
    // max 10 results will be displayed per scroll.
    // for performance reason we are not loading all the
    // videos in one shot but it will get loaded based on
    // the user scroll event.
    const maxResultDisplay = resultStartCount + 10;

    // stop creating if we exceed by the total no. of results
    // we got from the youtube rest api.
    if(maxResultDisplay > curResultArrLen) return;

    // get the body tag for appending new HTML elements.
    const bodyTag = document.getElementsByTagName('body')[0];

    // backup the no. of result we displayed on the page
    // so that we can remove it once user searches new query.
    prevResultArrLen = maxResultDisplay;

    for(var count = resultStartCount; count < maxResultDisplay; count++) {
        // create iframe only if it contains videoId in the JSON response.
        if (globalResponse.items[count].id.hasOwnProperty("videoId")) {

            // get the video id of every item from the response.result.
            const vid = globalResponse.items[count].id.videoId;

            // create a block for an player and title.
            let ytPlayerBlockTag = document.createElement('div');
            ytPlayerBlockTag.setAttribute("id", "ytplayer-block-" + count);
            ytPlayerBlockTag.setAttribute("class", "col-md-6 col-lg-4 col-sm-9 col-12");
            ytPlayerBlockTag.style.display = "inline-block";
            bodyTag.append(ytPlayerBlockTag);

            // set the player attributes
            let ytPlayerTag = document.createElement('div');
            let ytPlayerId = "ytplayer-" + count;
            ytPlayerTag.setAttribute("id", ytPlayerId);
            ytPlayerTag.setAttribute("class", "col-md-11 col-lg-11 col-sm-9 col-11");
            ytPlayerTag.style.marginTop = "35px";
            ytPlayerTag.style.marginBottom = "15px";
            ytPlayerTag.style.marginLeft = "10px";
            ytPlayerTag.style.border = "2px solid red";
            ytPlayerBlockTag.appendChild(ytPlayerTag);

            // call the YT.Player constructor and collect
            // all the objects in an array.
            ytPlayers.push(new YT.Player(ytPlayerId, {
                height: '220',
                width: '400',
                chart: 'mostPopular',
                videoId: vid,
                playerVars: {'modestbranding': 1},
            }));

            // set the link of the title.
            let ytPlayerLinkTag = document.createElement('a');
            ytPlayerLinkTag.setAttribute("href",
                "https://www.youtube.com/watch?v=" + vid);
            ytPlayerLinkTag.setAttribute("target", "_blank");
            ytPlayerBlockTag.appendChild(ytPlayerLinkTag);

            // set the title.
            let ytplayerTitleTag = document.createElement('div');
            const title = globalResponse.items[count].snippet.title;
            ytplayerTitleTag.setAttribute("id", "ytplayer-title" + count);
            ytplayerTitleTag.setAttribute("data-toggle", "tooltip");
            ytplayerTitleTag.setAttribute("title", title);
            ytplayerTitleTag.setAttribute("class", "col-md-11 col-lg-11 col-sm-9 col-11");
            ytplayerTitleTag.innerHTML = title;
            ytplayerTitleTag.style.width = "380px";
            ytplayerTitleTag.style.overflow = "hidden";
            ytplayerTitleTag.style.whiteSpace = "nowrap";
            ytplayerTitleTag.style.textOverflow = "ellipsis";
            ytPlayerLinkTag.appendChild(ytplayerTitleTag);
        }
    }
    // set the player state to true.
    playerLoaded = true;
}

/**
 * Shows the result message if the query results are not found
 */
function showNoResMesg()
{
    // return if already loaded.
    if(noResultMsgLoaded) return;
    noResultMsgLoaded = true;

    // check whether if we need to destroy the players if loaded
    if(playerLoaded) destroyPlayers();

    // create the div element
    let div = document.createElement('div');
    div.setAttribute("id", "NoResults");

    const paraStr = [
        "Your search did not match any video results.",
        "Suggestions:"];

    // create child para tags to store strings.
    for(let count = 0; count < 2; count++)
    {
        let para = document.createElement('p');
        para.innerHTML = paraStr[count];
        para.setAttribute("class", "text-attr");
        div.appendChild(para);
    }

    // create unorder list to store suggestions.
    let unordLst = document.createElement('ul');
    const suggestions = [
        "Make sure all words are spelled correctly.",
        "Try different keywords.",
        "Try more general keywords.",
        "Try fewer keywords."];

    for(let count = 0; count < 4; count++)
    {
        let lst = document.createElement('li');
        lst.innerHTML = suggestions[count];
        lst.setAttribute("class", "text-attr");
        unordLst.appendChild(lst);
    }
    div.appendChild(unordLst);

    // append to the body element, as it is the last one.
    document.getElementsByTagName('body')[0].append(div);
}

/**
 * Removes the no result message.
 */
function removeNoResMesg() {
    noResultMsgLoaded = false;
    let element = document.getElementById("NoResults");
    if(element) element.parentNode.removeChild(element);
}

/**
 *  destroys the players
 */
function destroyPlayers() {
    for(let count = 0; count < prevResultArrLen; count++) {
        if(ytPlayers[count]) ytPlayers[count].destroy();

        element = document.getElementById("ytplayer-block-" + count);
        if(element) element.parentNode.removeChild(element);
    }
    ytPlayers = [];
    playerLoaded = false;
}

/**
 * searches the query and calls the youtube rest API.
 * @returns {PromiseLike<T | never> | Promise<T | never>}
 */
function execute() {
    const query = document.getElementById("search").value;

    // return if the query is empty.
    if(query === "") return;

    // remove the no result message
    if(noResultMsgLoaded) removeNoResMesg();

    // destroy the players.
    if(playerLoaded) destroyPlayers();

    // make post request to the node server to get the query result
    $.ajax({
        url: '/',
        type: 'post',
        data: {'query': query},
        success: (response) => {
            globalResponse = response;
        }
    }).then(function()
    {
        // initialize the variables here.
        curResultArrLen = globalResponse.items.length;
        resultCount = 0;
        scrollCount = 350;

        // if the results are not found then show the no result message.
        if (curResultArrLen === 0) {
            showNoResMesg();
            return;
        }

        // youtubeAPIInit() will be called only for the first time.
        if (!clientApiLoaded) {
            youtubeAPIInit();
            clientApiLoaded = true;
        } else {
            onYouTubeIframeAPIReady();
        }
    });
}

/**
 * Add the lister for tracing the scroll event
 */
window.addEventListener('scroll', function(e) {
    // return if the results are not loaded.
    if(noResultMsgLoaded) return;

    // load the result based on the pixels scroll count
    if (document.documentElement.scrollTop > scrollCount) {
        onYouTubeIframeAPIReady(resultCount += 10);
        scrollCount += 350;
    }
});

/**
 * execute on Enter key
 * @param key
 */
document.getElementById("search").onkeypress = function(key) {
    if(key.code === "Enter" || key.code === "NumpadEnter") {
        // restrict the default activity of the key
        key.preventDefault();
        execute();
    }
};

/**
 * execute on clicking search button
 */
document.getElementById("search-btn").onclick = function() {
    execute();
};

/**
 * Tooltip of all the iframe title
 */
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
});


var suggestCallBack; // global var for autocomplete jsonp

/**
 * AutoComplete search functionality by calling search api.
 */
$(document).ready(function () {
    $("#search").autocomplete({
        source: function(request, response) {
            $.getJSON(
                "https://suggestqueries.google.com/complete/search?callback=?",
                {
                    "hl":"en", // Language
                    "ds":"yt", // Restrict lookup to youtube
                    "jsonp":"suggestCallBack", // jsonp callback function name
                    "q":request.term, // query term
                    "client":"youtube" // force youtube style response, i.e. jsonp
                }
            );
            suggestCallBack = function (data) {
                var suggestions = [];
                $.each(data[1], function (key, val) {
                    suggestions.push({"value": val[0]});
                });

                // dont need search suggestions to display more than 5.
                suggestions.length = suggestions.length > 5 ? 5: suggestions.length;
                response(suggestions);
            };
        },
    });
});