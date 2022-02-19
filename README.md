# ninjira
A Chrome & Firefox compatible extension to augment JIRA to generate formatted (commit) message for a task.

Provides customizable formatted text for a task of a story or defect in JIRA (Agile Management Tool) "Taskboard" page. This is useful for example when the code committers wish to adhere to a format in commit messages. The extension adds a (customizable) action link to each task on the taskboard, when clicked a formatted message is copied to the system clipboard.

# Screenshots
![The action triggering link-button added to each task.](/screenshots/ss1.png)
![When the button is clicked the generated message is written to clipboard.](/screenshots/ss2.png)

# Install
Find ninjira on [chrome web store](https://chrome.google.com/webstore/detail/version-ninja/bbfnnceplmfkmkpklhnfkollaplccdnk?hl=en) or on [Firefox Add-Ons](https://addons.mozilla.org/en-US/firefox/addon/ninjira/).

# Permissions

### Clipboard Write
Needed to write the generated message into clipboard.

### Host (Access your data for jira.corp.entaingroup.com)
Needed to activate the extension script when browsing JIRA pages.

### Local Storage
Needed to persist customized user settings.

# Why no IE/Edge/Safari?
Safari extensions are distributed through Mac AppStore which requires annual paid subscription that doesn't make sense for a tiny free extension.
As for IE and Edge, there has been no demand or motivation.

# Detailed Workflow

### Entry point
The content script ([ninjira.js](/ninjira.js)) is loaded by browsing to a JIRA page which upon completion of document-load registers a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) on the page-content-wrapper `div` element.

`document.onload = addWrapperDivObserver();`

### Reacting to content change
When the wrapper `div`'s content changes, `onWrapperDivMutation(mutationsList, observer)` function is called. This listener function searches for task cards in the page and if any found then loads user settings and adds a new action-link to each card via `loadSettings(addCopyActionButton, cards);`

### Adding action link
`addCopyActionButton(cards)` appends a new `a href` element to each found sub-task (aka issue) card after the card-title with an `onClick` listener of `handleButtonClick(event)`.

### Handling link click
`handleButtonClick(event)` extracts the four main parts of a sub-task from page's DOM via `generateMessage(button)`:
 * Story ID (aka parent task or issue ID)
 * Story Description (aka parent task or issue description)
 * Task ID (aka sub-task ID)
 * Task Description (aka sub-task description)

These four elements are then [formatted according to the customizable message format](/ninjira.js#L59) and written to clipboard via `copy(message)`.
Upon succesful message generation and copy, a notification is shown by [injecting a temporary script element](/ninjira.js#L78) to the page to utilize the existing notification capability in the page DOM ([AJS](https://aui.atlassian.com/aui/7.8/docs/messages.html)).
