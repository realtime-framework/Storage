## The Realtime Cloud Storage Group Chat example for iOS (Objective-C) 
This example uses the Realtime Cloud Storage iOS SDK to save and retrieve group chat messages from the cloud. This sample uses the Mobile Push Notifications feature to engage offline users when new messages are available.

![Group chat](http://storage-public.realtime.co/documentation/starting-guide/1.0.0/img2/rtcs_chat_1.PNG)

![Group chat](http://storage-public.realtime.co/documentation/starting-guide/1.0.0/img2/rtcs_chat_2.PNG)

![Group chat](http://storage-public.realtime.co/documentation/starting-guide/1.0.0/img2/rtcs_chat_3.PNG)

![Group chat](http://storage-public.realtime.co/documentation/starting-guide/1.0.0/img2/rtcs_chat_4.PNG)

## The example table schema
This example uses a table named RTCSChat with the following key schema:

- Primary key: ChatRoom (string)
- Secondary key: timeStamp (number)

## About the Realtime Cloud Storage Service
Part of the [The Realtime® Framework](http://framework.realtime.co), the Realtime Cloud Storage Service is a highly-scalable backend-as-a-service powered by Amazon DynamoDB. We've added real-time notifications to keep data synchronized between users of your application.


## Security note
This samples uses a public unauthenticated demonstration key. If you want to keep your chat messages private, please get your free Realtime Cloud Storage application key [here](https://accounts.realtime.co/signup/) and change the key used in the sample. 
 
## Documentation
The complete Realtime Cloud Storage API reference is available [here](http://framework.realtime.co/storage/#documentation)