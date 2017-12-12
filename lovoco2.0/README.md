# What is Lovoco Life

A powerful web application for people to make a meeting or presenting with different coyntries people. It supports real time translation and subtitle.

* Screen and Video recording
* Presenter can share the screen and video to obsevers
* The video and audio can be recorded and rewatch by users
* User System
* Real time subtitle generating follow the presenter's speaking (new feature)
* Real time translation follow the subtitle generating (new feature)


## Bugs

* Translation Server was shut down by Lovoco Company, we cannot control it
* It is not good support for IOS users, no matter in which browsers
* Unfriedly user interface
* SocketIO server has security problem when new user wants to use, they have to add SocketIO server into whitelist

## Set up Application on AWS

1. Zip all the files in to a zip package
2. Sign in the AWS and click Host a static website on Dashboard
3. Click add Website and give the name
4. Drag the zip package into the box
5. Waiting to automatically setting up

## Set up Application on Localhost

1. Download the zip file from github and then extract all files in to a folder
2. User CMD switch into the folder path
3. type npm install
4. type node to check the nodejs was installed
5. type node serve.js







