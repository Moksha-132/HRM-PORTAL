# Feature Update Summary (Chat Popup + History Fix)

## Purpose
This file documents the code changes made for:
- Admin-edited chatbot response notification visibility for users.
- Popup + sound notifications for employee/manager.
- Employee chat history retrieval fix.

## Files Changed (Feature Scope)
1. employee.js
- Added popup notification UI for unread notifications.
- Added sound alert when popup is shown.
- Added announce-on-load and polling-based popup flow.

2. manager.js
- Added popup notification UI for unread notifications.
- Added sound alert when popup is shown.
- Added announce-on-load and polling-based popup flow.
- Fixed notification email source to prefer shnoor_admin_email.

3. controllers/chatController.js
- Normalized userId/role processing in chat message handling.
- Stored chat userId in lowercase for consistency.
- Improved history authorization logic with token email + safe fallbacks.
- Made history query case-insensitive for userId.
- Added sequelize import used in controller query paths.

4. controllers/superAdminController.js
- Added email to JWT payload for reliable history identity matching.

## Notes
- The workspace folder currently does not expose .git metadata, so this list is based on the implemented code changes in this environment.
