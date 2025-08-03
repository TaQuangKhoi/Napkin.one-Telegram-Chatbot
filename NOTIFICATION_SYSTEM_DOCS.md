# Notification System Documentation

## Overview
This document describes the notification system implementation for the Napkin.one Telegram Chatbot. The system allows sending notifications to all registered users and maintains a history of all sent notifications.

## Features Implemented

### 1. Send Notifications to All Users
- **Endpoint**: `POST /api/notifications/send`
- **Purpose**: Send a notification message to all registered users via Telegram
- **Request Body**: 
  ```json
  {
    "message": "Your notification message here"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Notification sent successfully",
    "stats": {
      "totalUsers": 5,
      "successful": 4,
      "failed": 1
    },
    "notificationId": "notif_1691049000000_abc123def"
  }
  ```

### 2. Notification History Storage
- **Endpoint**: `GET /api/notifications/history`
- **Purpose**: Retrieve the history of all sent notifications
- **Query Parameters**: 
  - `limit` (optional): Number of notifications to retrieve (1-100, default: 50)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Notification history retrieved successfully",
    "notifications": [
      {
        "id": "notif_1691049000000_abc123def",
        "message": "Your notification message",
        "timestamp": "2025-08-03T07:50:00.000Z",
        "sentTo": 4
      }
    ],
    "count": 1,
    "limit": 50
  }
  ```

## Redis Data Structures

### New Keys Added:
1. **`users:list`** (Set): Contains all usernames of registered users
2. **`notifications:history`** (List): Stores notification history (limited to last 100 entries)

### Modified Keys:
- **`{username}`** (Hash): Updated UserData type to include `user_id` field

## Code Changes Made

### 1. Updated UserData Type
```typescript
type UserData = {
    token: string;
    email?: string;
    thoughts?: number;
    user_id?: number; // Added for notification system
};
```

### 2. Enhanced getUserData Function
- Now accepts optional `userId` parameter
- Automatically adds users to `users:list` set
- Stores `user_id` in user data for notification delivery

### 3. Updated All Bot Commands
- All commands now pass `user_id` to `getUserData`
- Ensures all user interactions are tracked for notifications

### 4. New API Endpoints
- `/api/notifications/send` - Send notifications to all users
- `/api/notifications/history` - Retrieve notification history

## Usage Instructions

### For Developers:

1. **Send a notification to all users**:
   ```bash
   curl -X POST http://localhost:3000/api/notifications/send \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello everyone! This is a system notification."}'
   ```

2. **Get notification history**:
   ```bash
   curl http://localhost:3000/api/notifications/history?limit=10
   ```

### For End Users:
- Users are automatically added to the notification list when they interact with the bot
- No additional setup required from users
- Notifications appear as regular Telegram messages with a 📢 prefix

## Error Handling

### Send Notifications Endpoint:
- **400**: Invalid or missing message
- **404**: No users found to send notifications to
- **500**: Server error during notification sending

### History Endpoint:
- **400**: Invalid limit parameter (must be 1-100)
- **500**: Server error during history retrieval

## Testing

A test script `test-notifications.js` is provided to verify the functionality:

```bash
# Make sure the development server is running
npm run dev

# In another terminal, run the test
node test-notifications.js
```

## Security Considerations

1. **Authentication**: Currently no authentication is implemented for the notification endpoints. Consider adding authentication for production use.
2. **Rate Limiting**: No rate limiting is implemented. Consider adding rate limiting to prevent abuse.
3. **Message Validation**: Basic validation is implemented, but consider adding more sophisticated content filtering.

## Performance Considerations

1. **Batch Processing**: Notifications are sent sequentially. For large user bases, consider implementing batch processing.
2. **History Cleanup**: History is automatically limited to 100 entries to prevent unlimited growth.
3. **Error Handling**: Failed notifications don't stop the process, ensuring maximum delivery.

## Future Enhancements

1. **Scheduled Notifications**: Add ability to schedule notifications for future delivery
2. **User Preferences**: Allow users to opt-out of notifications
3. **Notification Categories**: Support different types of notifications
4. **Rich Media**: Support for images, buttons, and other rich media in notifications
5. **Analytics**: Track notification open rates and user engagement

## Environment Variables Required

Ensure these environment variables are set:
- `KV_REST_API_URL`: Upstash Redis URL
- `KV_REST_API_TOKEN`: Upstash Redis token
- `TELEGRAM_TOKEN`: Telegram bot token

## Troubleshooting

### Common Issues:

1. **"No users found"**: Ensure at least one user has interacted with the bot
2. **Telegram API errors**: Check bot token and ensure bot has permission to send messages
3. **Redis connection errors**: Verify Redis credentials and connectivity

### Debug Steps:

1. Check Redis connection and data:
   ```bash
   # Check if users list exists
   redis-cli SMEMBERS users:list
   
   # Check notification history
   redis-cli LRANGE notifications:history 0 -1
   ```

2. Monitor server logs for detailed error messages
3. Use the test script to verify functionality step by step