PhoneGap and Sencha Touch 2
===========================

Developing
----------

The Sencha Touch 2 SDK was not added to the repository. So in order to retrieve the "sdk" folder needed to compile this application, download the SDK (v2.0.1.1 was used here) and the SDK tools. When the tools are installed, create a new application somewhere using the command `sencha app create APP <directory>`, then move the "sdk" folder from there to this directory.

Now you should be able to develop for Android by opening the project in the "android" directory and editing the appropriate paths of the builder configurations (project > Properties > Builders).