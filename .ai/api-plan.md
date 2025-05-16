# REST API Plan

## 1. Resources
- **Users**: Represented by the `users` table.
- **Flashcards**: Represented by the `flashcards` table.
- **Generations**: Represented by the `generations` table, logging AI generation sessions.
- **Generation Error Logs**: Represented by the `generation_error_logs` table, storing errors from AI generation processes.

## 2. Endpoints

### A. Flashcards

1. **List Flashcards**
   - **Method**: GET
   - **URL**: `/flashcards`
   - **Description**: Retrieve a paginated list of the user's flashcards.
   - **Query Parameters**: 
     - `page` (optional)
     - `limit` (optional)
     - `sort` (optional e.g., `created_at`)
     - `order` (optional e.g., `asc` or `desc`)
   - **Response**:
   - **Response**:
     ```json
     {
       "data": [
         {
           "id": 1,
           "front": "Question text",
           "back": "Answer text",
           "source": "manual | ai-full | ai-edited",
           "created_at": "timestamp",
           "updated_at": "timestamp"
         }
       ],
       "pagination": {
         "page": 1,
         "limit": 10,
         "total": 100
       }
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 401 Unauthorized

2. **Create Flashcards**
   - **Method**: POST
   - **URL**: `/flashcards`
   - **Description**: Create one or multiple flashcards. Supports both manual creation and AI-generated flashcards.
   - **Request Payload**:
     ```json
     {
       "flashcards": [
         {
           "front": "Question 1",
           "back": "Answer 2",
           "source": "ai-full",
           "generation_id": null
         },
         {
           "front": "Question 2",
           "back": "Answer 2",
           "source": "ai-edited",
           "generation_id": 123
         }
       ]
     }
     ```
   - **Response**:
     ```json
     {
       "flashcards": [
         {
           "id": 1,
           "front": "Question text",
           "back": "Answer text",
           "source": "manual",
           "user_id": "user-uuid",
           "created_at": "timestamp"
         }
       ],
     }
     ```
   - **Field Validation**:
     - `front`:
       - Required
       - String
       - Min length: 10 characters
       - Max length: 200 characters
     - `back`:
       - Required
       - String
       - Min length: 10 characters
       - Max length: 500 characters
     - `source`:
       - Required
       - String
       - Allowed values: "manual", "ai-full", "ai-edited"
     - `generation_id`:
       - Optional
       - Integer
       - Required when source is "ai-full" or "ai-edited"
       - Must reference existing generation
   - **Success Codes**: 201 Created
   - **Error Codes**: 
     - 400 Bad Request (invalid payload format)
     - 401 Unauthorized
     - 207 Multi-Status (when some flashcards were created successfully while others failed)

3. **Get Flashcard Details**
   - **Method**: GET
   - **URL**: `/flashcards/:id`
   - **Description**: Retrieve details of a single flashcard.
   - **Response**:
     ```json
     {
        "id": 1,
        "front": "Question text",
        "back": "Answer text",
        "source": "manual | ai-full | ai-edited",
        "created_at": "timestamp",
        "updated_at": "timestamp"
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 401 Unauthorized, 404 Not Found

4. **Update Flashcard**
   - **Method**: PUT
   - **URL**: `/flashcards/:id`
   - **Description**: Update an existing flashcard.
   - **Request Payload**:
     ```json
     {
       "front": "Updated question text (100-200 chars)",
       "back": "Updated answer text (100-500 chars)",
       "source": "manual | ai-full | ai-edited",
     }
     ```
   - **Response**:
     ```json
     {
       "id": 1,
       "front": "Updated question text",
       "back": "Updated answer text",
       "source": "manual",
       "updated_at": "timestamp"
     }
     ```
   - **Field Validation**:
     - `front`:
       - Required
       - String
       - Min length: 10 characters
       - Max length: 200 characters
     - `back`:
       - Required
       - String
       - Min length: 10 characters
       - Max length: 500 characters
     - `source`:
       - Required
       - String
       - Allowed values: "manual", "ai-full", "ai-edited"
   - **Success Codes**: 200 OK
   - **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

5. **Delete Flashcard**
   - **Method**: DELETE
   - **URL**: `/flashcards/:id`
   - **Description**: Delete a flashcard.
   - **Success Codes**: 204 No Content
   - **Error Codes**: 401 Unauthorized, 404 Not Found

### C. Generations (AI Sessions)

6. **Generate Flashcards using AI**
   - **Method**: POST
   - **URL**: `/generations`
   - **Description**: Submit text to an AI service for flashcard proposals generation. The input text must be between 1000 and 10000 characters.
   - **Request Payload**:
     ```json
     {
       "source_text": "Input text for flashcard generation"
     }
     ```
   - **Response**:
     ```json
     {
       "generation_id": 123,
       "flashcards_proposals": [
         {
           "id": 1, 
           "front": "Generated question",
           "back": "Generated answer",
           "source": "ai-full"
         }
       ],
       "generated_count": 5
     }
     ```
   - **Success Codes**: 200 OK or 201 Created
   - **Error Codes**: 400 Bad Request (if text length is invalid), 401 Unauthorized, 500 Internal Server Error

7. **List Generation Sessions**
   - **Method**: GET
   - **URL**: `/generations`
   - **Description**: Retrieve a list of AI generation sessions for the current user.
   - **Response**:
     ```json
     [
       {
         "id": "generation-id",
         "model": "model-name",
         "generated_count": 5,
         "created_at": "timestamp"
       }
     ]
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 401 Unauthorized

8. **Get Generation Session Details**
   - **Method**: GET
   - **URL**: `/generations/:id`
   - **Description**: Retrieve details about a specific generation session including associated flashcards.
   - **Response**:
     ```json
     {
       "id": "generation-id",
       "model": "model-name",
       "generated_count": 5,
       "accepted_unedited_count": 2,
       "accepted_edited_count": 1,
       "created_at": "timestamp"
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 401 Unauthorized, 404 Not Found

### D. Generation Error Logs

1. **List Generation Error Logs**
   - **Method**: GET
   - **URL**: `/generation-error-logs`
   - **Description**: Retrieve a list of generation error logs for the current user.
   - **Response**:
     ```json
     [
       {
         "id": 1,
         "model": "model-name",
         "error_code": "ERROR_CODE",
         "error_message": "Detailed error message",
         "created_at": "timestamp"
       }
     ]
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 401 Unauthorized

## 3. Authentication and Authorization

- **Mechanism**: JWT-based authentication using Supabase Auth. 
- **Implementation Details**:
  - All endpoints (except `/auth/register` and `/auth/login`) require a valid JWT token in the `Authorization: Bearer <token>` header.
  - Supabase Row Level Security (RLS) policies ensure that users can only access and modify their own records.
  - Additional measures include rate limiting and secure error handling.

## 4. Validation and Business Logic

- **Flashcards Validation**:
  - The `front` field must be between 100 and 200 characters.
  - The `back` field must be between 100 and 500 characters.

- **Generation Validation**:
  - The input text for AI generation must be between 1000 and 10000 characters.

- **Business Logic**:
  - The AI generations endpoint calls an external LLM API to generate flashcard proposals and logs the session in the `generations` table.
  - Users can review, approve, and edit generated proposed flashcards. Approved flashcards can then be created via the flashcards endpoints.
  
- **Error Handling**:
  - Consistent error responses (400, 401, 404, 500) with informative messages.
  - Generation errors are logged in the `generation_error_logs` table for further analysis and debugging.

## 5. Additional Considerations

- **Pagination, Filtering, and Sorting**: Supported on list endpoints to manage large datasets.
- **Performance & Security**:
  - Endpoints ensure that users access only their data, enforced by JWT and RLS.
  - Rate limiting and input validations are implemented to prevent abuse and ensure optimal performance. 