# uflix-app
YouTube video search application using YouTube rest api, Javascript, jQuery and Nodejs.

**DEMO**
 - Deployed to Heroku Cloud: 
 
 	https://uflix-app.herokuapp.com/
	
**Note:** It is only running on a free dyno, so it may take some time before it responds.
	
**Features**
1. The application is using the data from youtube rest api and display and play multiple videos at a time.
2. The application implements the auto-complete search functionality by calling google's search API.
3. In order to see the video on youtube, it shows link below the videos which will redirect to youtube.
4. At max 50 videos will be shown which is the limitation of the youtube rest api.


**Steps for executing:**
1. Get the Youtube API KEY in order to access the Rest API. You need to register from [here](https://developers.google.com/youtube/v3/getting-started).

2. Download/Clone the repository.

3. Replace the **"process.env.YOUTUBE_API_KEY"** variable with your key and **"process.env.PORT"** variable with your desire port number in server.js

4. Run the server.js on the node server.
   ```
	    node server.js
   ```
   
5. Run the URL in your web browser on your localhost ip and port number which is assigned in server.js
   ```
	    http://127.0.0.1:7070
   ```
  
**References**	
1. https://developers.google.com/youtube/v3/code_samples/code_snippets
2. https://developers.google.com/youtube/v3/guides/implementation/search
3. https://getbootstrap.com/docs/4.0/getting-started/introduction/
4. https://devcenter.heroku.com/articles/deploying-nodejs
