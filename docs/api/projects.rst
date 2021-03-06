========
Projects
========

This allows list, retrieve, create, update, and delete of Projects.

Retrieve
--------

.. sourcecode:: http

   GET /api/projects/ HTTP/1.1

.. sourcecode:: http

   HTTP/1.1 200 OK

    {
      "count": 150,
      "next": "https://.../api/projects/?page=2",
      "previous": null,
      "results": [
        {
          "id": "zVQYrye",
          "name": "Test Project",
          "repo_url": "https://github.com/SFDO-Tooling/test-project",
          "repo_owner": "SFDO-Tooling",
          "repo_name": "test-project",
          "description": "This is *safely* rendered Markdown.",
          "description_rendered": "<p>This is <em>safely</em> rendered Markdown.</p>",
          "is_managed": false,
          "slug": "test-project",
          "old_slugs": [],
          "branch_prefix": "",
          "github_users": [
            {
              "id": "12345",
              "login": "username",
              "avatar_url": "https://avatars0.githubusercontent.com/u/someId?v=4"
            }
          ],
          "repo_image_url": "https://repository-images.githubusercontent.com/123456/123-456"
        }
        ...
      ]
    }

Refresh GitHub Users
--------------------

.. sourcecode:: http

   POST /api/projects/:id/refresh_github_users/ HTTP/1.1

.. sourcecode:: http

   HTTP/1.1 202 ACCEPTED
