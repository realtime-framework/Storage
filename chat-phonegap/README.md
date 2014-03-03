## The Realtime Cloud Storage Group Chat example for PhoneGap 
This example uses the PhoneGap framework and the Realtime Cloud Storage JavaScript SDK to save and retrieve group chat messages from the cloud.

Use the [Adobe PhoneGap Build](https://build.phonegap.com/) to generate the cross-platform chat app (iOS, Android and WindowsPhone). 

## The example table schema
This example uses a table named MESSAGES with the following key schema:

- Primary key: ChatRoom (string)
- Secondary key: timeStamp (number)

## About the Realtime Cloud Storage Service
Part of the [The Realtime® Framework](http://framework.realtime.co), the Realtime Cloud Storage Service is a highly-scalable backend-as-a-service powered by Amazon DynamoDB. We've added real-time notifications to keep data synchronized between users of your application.


## Security note
This samples uses a public unauthenticated demonstration key. If you want to keep your chat messages private, please get your free Realtime Cloud Storage application key [here](https://accounts.realtime.co/signup/) and change the key used in the sample. 
 
## Documentation
The complete Realtime Cloud Storage API reference is available [here](http://framework.realtime.co/storage/#documentation)