const cssClass = "ninjira";

var actionButtonText = "Copy formatted message";
var generatedMessageFormat = "%STORY_ID% [%TASK_ID%] %STORY_DESC% [%TASK_DESC%] ...";

// copy given string into the OS clipboard
function copy(message) {
    navigator.clipboard.writeText(message).then(function() {
        console.log("Message copied to clipboard successfully!");
    }, function() {
        console.error("Unable to write message to clipboard. :-(");
    });
}

// Injects given function (string) into the page as script, 
// causing it to be run immediately and removes the script afterwards.
function injectScriptToPage(func) {
    var actualCode = "(" + func + ")();";
	var script = document.createElement('script');
	script.textContent = actualCode;
	(document.head||document.documentElement).appendChild(script);
	script.remove();
}

// extracts storyId, storyDesc, taskId, taskDesc from a 
// given issue-parent element and returns the formatted message.
// returns null if any of the 4 elements is not found.
function generateMessage(button) {
    const storyCard = button.closest("div[data-testid=\"software-board.board-container.board.card-group.card-group\"]");
    if(storyCard.length != 1) {
        console.log("Expected to find one story card but found " + storyCard.length);
        return null;
    }

    const storyHeader = storyCard.find("div[data-testid=\"software-board.board-container.board.card-group.card-group-header\"]");
    if(storyHeader.length != 1) {
        console.log("Expected to find one story header but found " + storyHeader.length);
        return null;
    }

    const storyId = storyHeader.find("span")[0].innerHTML;
    console.log("storyId: " + storyId);

    const storyDesc = storyHeader.find("span")[1].innerHTML;
    console.log("storyDesc: " + storyDesc);

    const taskCard = storyCard.find("div[data-testid=\"platform-board-kit.ui.card.card\"]");
    if(taskCard.length != 1) {
        console.log("Expected to find one task card but found " + taskCard.length);
        return null;
    }

    const taskIdElem = taskCard.find("div[data-testid=\"platform-card.common.ui.key.key\"]");
    if(taskIdElem.length != 1) {
        console.log("Expected to find one task key but found " + taskIdElem.length);
        return null;
    }
    const taskId = taskIdElem.text();
    console.log("taskId: " + taskId);

    const taskDescElem = taskCard.find("span[data-testid=\"issue-field-single-line-text-readview-card.ui.single-line-text.container.box\"]");
    if(taskDescElem.length != 1) {
        console.log("Expected to find one task desc but found " + taskDescElem.length);
        return null;
    }
    const taskDesc = taskDescElem.contents()
        .filter(function () {
            return this.nodeType === Node.TEXT_NODE;
        })
        .text()
        .trim();
    console.log("taskDesc: " + taskDesc);

    return generatedMessageFormat
        .replace("%STORY_ID%", storyId)
        .replace("%STORY_DESC%", storyDesc)
        .replace("%TASK_ID%", taskId)
        .replace("%TASK_DESC%", taskDesc);
}

function handleButtonClick(event) {
	event.stopPropagation();

    const button = $(event.target);
    var message = generateMessage(button);
    if(message == null) {
        return;
    }

    copy(message);
    // couldn't find a graceful way to pass variable to the
    // (separated-context) window of main page, so text replace it is.
    injectScriptToPage(function() {
        window.AJS.messages.info($("div#announcement-banner")[0], {
            title: "Message copied to clipboard!",
            body: "<p>PLACEHOLDER</p>",
            fadeout: true,
            closeable: true
        });
    }.toString().replace("PLACEHOLDER", message));
}

function addCopyActionButton(cards) {
    $("a." + cssClass).remove();
    for(const cardParent of cards) {
        const issues = $(cardParent).find("div[data-testid=\"platform-card.common.ui.custom-fields.custom-card-field-list\"]");
        for(const issue of issues) {
            var button = $("<a></a>", {
                class: cssClass,
                text: actionButtonText,
                title: "Copy to clipboard as formatted message"
            });
            button.click(handleButtonClick);
            button.appendTo(issue);
        }
    }
}

function loadSettings(callback, cards) {
    chrome.storage.local.get({
        actionButtonText: "",
        generatedMessageFormat: ""
    }, function(items) {
        if (items.actionButtonText !== "") {
            actionButtonText = items.actionButtonText;
        }
        if (items.generatedMessageFormat !== "") {
            generatedMessageFormat = items.generatedMessageFormat;
        }
        if (typeof callback === 'function') {
            callback(cards);
        }
    });
}

function load() {
    const board = $("div[data-testid=\"software-board.board-area\"]");    
    const cards = board.find("div[data-testid=\"software-board.board-container.board.card-group.card-group\"]");
    if(cards.length == 0) {
        console.log("Ninjira found no cards!");
    }
    loadSettings(addCopyActionButton, cards);
    
    addWrapperDivObserver()
}

function addWrapperDivObserver() {
    var targetNodes = $("div[data-testid=\"software-board.board-area\"]");    
    if(targetNodes.length == 1) {
        new MutationObserver(onWrapperDivMutation)
            .observe(targetNodes[0], { childList: true, subtree: true });
        console.log("Ninjira is now observing taskboard changes...");
    } else { 
        console.log("Ninjira expected 1 target but found " + targetNodes.length);
    }
}

function onWrapperDivMutation(mutationsList, observer) {
    for(const mutation of mutationsList) {
        if (mutation.type != "childList") {
            continue;
        }
        const cards = $(mutation.addedNodes).find("div[data-testid=\"software-board.board-container.board.card-group.card-group\"]");
        if(cards.length == 0) {
            continue;
        }
        console.log("Ninjira noticed taskboard change!");
        loadSettings(addCopyActionButton, cards);
    }
}

document.onload = load();