# Lakhota Immersion Classroom LTI Tool
This tools lets you send grade to Canvas as an external tool, which can be embedded in assignments.

## To set up
1. Go download localtunnel to your npm
2. Run `npx localtunnel -p 3000` so that it is point to your local machine's port 3000
3. localtunnel prints out a URL, then go to /config/enviroment/development.rb to change the config.host to that url host
4. Go to canvas settings for Prof. H's sandbox > apps, then change the url of the LTI tool to the new url. Or if other people are working, text groupchat first then create a new app.
5. Shared secrets can be found from config/lti-settings.yml. Be sure to set the privacy settings to "Public" when adding the app.
