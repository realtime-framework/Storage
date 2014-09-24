## The Realtime Cloud Storage Todo example for PHP + JavaScript 
This example uses the Cloud Storage REST API in conjunction with the Realtime Cloud Storage JavaScript library and it can be used with the other samples, namely with the on-line demo at [http://storage-public.realtime.co/samples/todo-lbl](http://storage-public.realtime.co/samples/todo-lbl). 

All data will be synchronized between apps.

## About the Realtime Cloud Storage Service
Part of the [The Realtime® Framework](http://framework.realtime.co), the Realtime Cloud Storage Service is a highly-scalable backend-as-a-service powered by Amazon DynamoDB. We've added real-time notifications to keep data synchronized between users of your application.

## Storage table definition
This sample requires that a table named `todoTable` exists with the following key definition:

- Primary Key: listName (string)
- Secondary Key: timestamp (number)

## Security note
This samples uses a public unauthenticated demonstration key. If you want to keep your todo lists private, please get your free Realtime Cloud Storage application key [here](https://accounts.realtime.co/signup/) and change the key used in the sample. 
 
## Documentation
The complete Realtime Cloud Storage API reference is available [here](http://framework.realtime.co/storage/#documentation)