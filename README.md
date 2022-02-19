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
As for IE/Edge, there has been no demand or motivation.
