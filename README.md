# Pepites hypermedia client 

This repository hosts a client for the pepites API (can be found [here](https://github.com/Renaud8469/pepites-hypermedia-api) ).
This is a work in progress.

## Client behavior 

### Root URL `/`

When the client is accessed on the root URL, the following actions are performed :
- call to the API `application/ping` resource to check API connection
- call to the API `establisment` and `pepite` resources to display the name of the PEPITE in charge of CentraleSupélec
- creating a minimal `application` resource with only some personal information
- update this `application` to make it complete 
- send it to the PEPITE for review. 

### Review URLs `/accept-application` and `/refuse-application`

When the client is accessed on these URLs : 
- if an `application` has been created already (from the root URL) it accepts or rejects it 
- else it displays an error message to indicate you should access the root URL first. 

### Status URL `/application-status` 

When the client is accessed on this URL : 
- if an `application` has been created already (from the root URL) it displays its status ('saved', 'sent', 'accepted' or 'rejected') 
- else it displays an error message to indicate you should access the root URL first. 

