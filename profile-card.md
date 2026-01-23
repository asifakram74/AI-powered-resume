{
  "name": "Profile Cards",
  "item": [
    {
      "name": "Get Profile Cards",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/profile-card",
          "host": ["{{base_url}}"],
          "path": ["profile-card"]
        }
      },
      "response": []
    },
    {
      "name": "Create Profile Card",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"slug\": \"john-doe\",\n  \"display_name\": \"John Doe\",\n  \"headline\": \"Software Engineer\",\n  \"bio\": \"Experienced developer\",\n  \"avatar_url\": \"profile.jpg\",\n  \"is_listed\": true,\n  \"attachments\": {\n    \"cv_id\": 12,\n    \"cover_letter_id\": 5\n  },\n  \"links\": [\n    {\n      \"label\": \"LinkedIn\",\n      \"url\": \"https://linkedin.com/in/johndoe\"\n    },\n    {\n      \"label\": \"GitHub\",\n      \"url\": \"https://github.com/johndoe\"\n    }\n  ]\n}"
        },
        "url": {
          "raw": "{{base_url}}/profile-card",
          "host": ["{{base_url}}"],
          "path": ["profile-card"]
        }
      },
      "response": []
    },
    {
      "name": "Get Profile Card by ID",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/profile-card/1",
          "host": ["{{base_url}}"],
          "path": ["profile-card", "1"]
        }
      },
      "response": []
    },
    {
      "name": "Update Profile Card",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"display_name\": \"Updated Name\",\n  \"headline\": \"Updated Job Title\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/profile-card/1",
          "host": ["{{base_url}}"],
          "path": ["profile-card", "1"]
        }
      },
      "response": []
    },
    {
      "name": "Delete Profile Card",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/profile-card/1",
          "host": ["{{base_url}}"],
          "path": ["profile-card", "1"]
        }
      },
      "response": []
    },
    {
      "name": "Get Public Profile Card (by slug)",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{web_base_url}}/profile-card/public/{{slug}}",
          "host": ["{{web_base_url}}"],
          "path": ["profile-card", "public", "{{slug}}"]
        }
      },
      "response": []
    }
  ]
}
