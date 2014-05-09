#boats

A Real-time rowing regatta viewing application in Meteor.

##Features
1. View race schedules
2. View results of races
3. Watch competitors progress on race course map in real time
4. Competitors can review their races 

##Status
This project is in early stage development and is not ready for deployment.

##Phonegap/Cordova
In order for boats to collect GPS and accelerometer data when a mobile device is asleep it must run as an installed app. This feature is only useful for competitors and system administrators (to describe venues). Non-competitors can simply use the HTML5 directly from the web page.

from http://zeroasterisk.com/2013/08/22/meteor-phonegapcordova-roundup-fall-2013/
> ###Hijacking DOM
> The PhoneGap / Cordova files live on the device in the PhoneGap www folder.  The App starts up with the local index.html file, but then JS “hijacks” the DOM, it does an AJAX request to the Meteor app and rewrites the document with the boats document, triggering all the events needed for Meteor to startup. 
> This gives Meteor access to all the PhoneGap JS (already loaded) but the PhoneGap JS is bundled for each device/version within PhoneGap.  It also puts all of the PhoneGap JS into the global scope alongside Meteor JS.
https://github.com/zeroasterisk/MeteorRider
> 
> ####Pros
> * Simple to manage, because all the device-specific code is within PhoneGap (each version is bundled)
> * Pretty fast, the base level AJAX request is pretty fast
> * Scope is easy, because PhoneGap is available to Meteor directly
> * App JS can be tested independent of Meteor (just don’t load it)
> 
> ####Cons
> * Scope collision is possible
> * may experience some complications with App hardware plugins, perhaps due to scope?