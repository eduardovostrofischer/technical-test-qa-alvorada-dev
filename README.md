# technical-test-qa-alvorada-dev
Take home assignment for senior qa


# How to run the project

1. Install Node
    1. Go to nodejs.org
    2. Download the LTS version
    3. Run the installer and follow the steps
    4. Verify in your terminal: node -v

2. Install dependencies
    1. npm install

3. Run api mocks
    1. Open terminal
    2. cd /Alvorada-Project/Mocks/api
    3. Node {specific_server_name_mock}.js
    4. Repeat for every server

4. Run Web Mocks    
    1. Open terminal
    2. cd /Alvorada-Project/Mocks/web
    3. cd {specific_mock_page}
    4. npx serve. -p (PORT)
        PORT must be 8000 for Upload, 8001 for Processing, 8002 for Review and 8003 for Finalize

# How to run tests
1. npx cypress open
2. select the test you want to run