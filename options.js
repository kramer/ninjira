function onError(error) {
    console.log(`Error: ${error}`);
}

function notifyStatusChange(newStatus) {
    let status = document.getElementById("status");
    status.textContent = newStatus;
    //Clear the notification after a second
    setTimeout(function() {
        status.textContent = "";
    }, 2500);
}

function optionsChanged() {
    let actionButtonText = document.getElementById("actionButtonText").value;
    let generatedMessageFormat = document.getElementById("generatedMessageFormat").value;

    let optionData = {
        actionButtonText: actionButtonText,
        generatedMessageFormat: generatedMessageFormat
    }

    chrome.storage.local.set(optionData).then(null, onError);
    notifyStatusChange("Options saved!");
}

function restoreOptions() {
    chrome.storage.local.get({
        actionButtonText: "",
        generatedMessageFormat: ""
    }, function(items) {
        if (items.actionButtonText === "") {
            items.actionButtonText = "C";
        }

        if (items.generatedMessageFormat === "") {
            items.generatedMessageFormat = "%STORY_ID% [%TASK_ID%] %STORY_DESC% [%TASK_DESC%] ...";
        }

        document.getElementById("actionButtonText").value = items.actionButtonText;
        document.getElementById("generatedMessageFormat").value = items.generatedMessageFormat;
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("optionsForm").addEventListener("change", optionsChanged);