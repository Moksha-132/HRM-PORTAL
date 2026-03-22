# Feature Change Files

## Feature Scope
- Admin-edited chatbot response triggers user notification visibility improvements.
- Employee/Manager notification experience upgraded with popup + sound on unread notifications.
- Employee chat history retrieval fixed for login identity and case-sensitivity issues.

## Files Changed
1. `employee.js`
- Added popup notification host/UI for unread notifications.
- Added notification sound playback on popup.
- Added announce-on-load and polling-based unread notification popup flow.

2. `manager.js`
- Added popup notification host/UI for unread notifications.
- Added notification sound playback on popup.
- Added announce-on-load and polling-based unread notification popup flow.
- Fixed manager email source for notifications to prefer `shnoor_admin_email` session key.

3. `controllers/chatController.js`
- Normalized chat role and user ID handling for message save path.
- Stored non-public chat `userId` in normalized lowercase format.
- Improved user history authorization flow to use token email first with safe fallback lookups.
- Made history query case-insensitive on `userId`.
- Added missing `sequelize` import used by session/history query logic.

4. `controllers/superAdminController.js`
- Added `email` to JWT payload to make chat-history identity checks reliable after login.

## Note For Push
- This workspace currently has no `.git` metadata available in the folder, so the list above is based on implemented code updates in this environment.
