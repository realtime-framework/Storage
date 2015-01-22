package handlers;

import co.realtime.storage.ItemAttribute;
import co.realtime.storage.ItemSnapshot;
import co.realtime.storage.StorageRef;
import co.realtime.storage.TableRef;
import co.realtime.storage.ext.OnError;
import co.realtime.storage.ext.OnItemSnapshot;
import co.realtime.storage.ext.StorageException;
import config.Config;
import domains.Channel;
import domains.Message;
import interfaces.InterfaceRefresher;
import preferences.PreferencesManager;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.LinkedHashMap;

import android.content.Context;
import android.util.Log;

public class StorageHandler{

    public static StorageHandler selfHandler;

    public static StorageRef storageRef = null;
    public HashMap<String, Channel> messages;
    public Boolean isConnected;
    public InterfaceRefresher rootView;
    public Context context;
    public InterfaceRefresher chatRoom;
    public InterfaceRefresher messagesView;

    final public static String STORAGE_TAG = "STORAGE";

    public static void addChannel(String channel)
    {
        selfHandler.messages.put(channel, new Channel(channel));

        TableRef tableRef = storageRef.table(Config.TABLE_NAME);

        tableRef.enablePushNotifications().on(StorageRef.StorageEvent.UPDATE, new ItemAttribute(channel), new OnItemSnapshot() {
            @Override
            public void run(ItemSnapshot itemSnapshot) {
                if (itemSnapshot != null) {
                    Log.d(STORAGE_TAG, String.format("Item inserted: %s", itemSnapshot.val()));
                    String channel = itemSnapshot.val().get(Config.PRIMARY_KEY).toString();
                    String msg = itemSnapshot.val().get(Config.ITEM_PROPERTY_MESSAGE).toString();
                    String nickName = itemSnapshot.val().get(Config.ITEM_PROPERTY_NICKNAME).toString();
                    String date = itemSnapshot.val().get(Config.ITEM_PROPERTY_DATE).toString();
                    selfHandler.handleMessage(channel, nickName, msg, date);
                }
            }
        }, new OnError() {
            @Override
            public void run(Integer integer, String exception) {
                Log.e("Storage", "Exception :"+ exception);
            }
        });

    }

    public static void prepareClient(Context context, InterfaceRefresher rootView){

        selfHandler = new StorageHandler();
        selfHandler.context = context;
        selfHandler.rootView = rootView;
        selfHandler.messages = new HashMap<String, Channel>();

        try {

            storageRef = new StorageRef(Config.APPKEY, Config.TOKEN, Config.PROJECT_ID, context);

            ArrayList<String> channels = PreferencesManager.getInstance(selfHandler.context).loadChannels();
            for (String channel : channels) {
                addChannel(channel);
            }

            StorageHandler.selfHandler.isConnected = true;
            StorageHandler.selfHandler.rootView.refreshData(null);

        } catch (StorageException e) {
            e.printStackTrace();
        }

    }

    public void pushMsg(Message msg, String channel) {

        LinkedHashMap<String,ItemAttribute> lhm = new LinkedHashMap<String,ItemAttribute>();
        lhm.put(Config.PRIMARY_KEY, new ItemAttribute(channel));
        Calendar calendar = Calendar.getInstance();
        Long currentTime = System.currentTimeMillis();
        calendar.setTimeInMillis(currentTime);
        //For match with i0S timestamp
        calendar.add(Calendar.YEAR,-31);
        String timeStamp = String.valueOf(calendar.getTimeInMillis()/1000);

        lhm.put(Config.SECONDARY_KEY, new ItemAttribute(timeStamp));
        lhm.put(Config.ITEM_PROPERTY_NICKNAME, new ItemAttribute(msg.user));
        lhm.put(Config.ITEM_PROPERTY_DATE, new ItemAttribute(msg.date));
        lhm.put(Config.ITEM_PROPERTY_MESSAGE, new ItemAttribute(msg.content));
        TableRef tableRef = storageRef.table(Config.TABLE_NAME);
        tableRef.push(lhm,new OnItemSnapshot() {
            @Override
            public void run(ItemSnapshot itemSnapshot) {
                if (itemSnapshot != null) {
                    Log.d("TableRef", "Item inserted: " + itemSnapshot.val());
                }
            }
        }, new OnError() {
            @Override
            public void run(Integer integer, String errorMessage) {
                Log.e("TableRef", "Error inserting item: " + errorMessage);
            }
        });
    }

    private void handleMessage(String channel, String user, String content, String date) {

        Message newMsg = new Message(user, content, date);

        if(messages != null) {
            Channel list = messages.get(channel);
            if(list != null) {
                list.setUnRead(list.getUnRead() + 1);
                list.addMessage(newMsg);

                if (messagesView != null)
                    messagesView.refreshData(newMsg);

                if (chatRoom != null)
                    chatRoom.refreshData(newMsg);
            }
        }

    }
}
