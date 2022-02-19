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
    const parentGroup = button.parents("div.ghx-parent-group");

    const storyKey = parentGroup.find("span.ghx-key");
    if(storyKey.length != 1) {
        console.log("Expected to find one story-key but found " + storyKey.length);
        return null;
    }
    const storyId = $(storyKey[0]).text();

    const storySummary = parentGroup.find("span.ghx-summary");
    if(storySummary.length != 1) {
        console.log("Expected to find one story-summary but found " + storySummary.length);
        return null;
    }
    const storyDesc = $(storySummary[0]).text();

    const subTaskLink = button.siblings("a.ghx-key-link");
    if(subTaskLink.length != 1) {
        console.log("Expected to find one sub-task-link but found " + subTaskLink.length);
        return null;
    }
    const taskId = $(subTaskLink[0]).attr("title");

    const taskFields = button.parents("div.ghx-issue-fields");
    if(taskFields.length != 1) {
        console.log("Expected to find one task-fields but found " + taskFields.length);
        return null;
    }
    const taskDesc = $(taskFields[0]).find("div.ghx-summary").attr("title");

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
        const issues = $(cardParent).find("div.ghx-key");
        for(const issue of issues) {
            var button = $("<a></a>", {
                class: cssClass + " ghx-key-link",
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

function addWrapperDivObserver() {
    var targetNodes = $("div#ghx-work");
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
        const cards = $(mutation.addedNodes).find(".ghx-parent-group");
        if(cards.length == 0) {
            continue;
        }
        console.log("Ninjira noticed taskboard change!");
        loadSettings(addCopyActionButton, cards);
    }
}

document.onload = addWrapperDivObserver();