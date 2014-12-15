package handlers;

import android.app.Activity;
import android.content.Context;
import android.util.Log;

import com.realtime.todo.MainActivity;

import java.util.LinkedHashMap;

import co.realtime.storage.ItemAttribute;
import co.realtime.storage.ItemSnapshot;
import co.realtime.storage.StorageRef;
import co.realtime.storage.TableRef;
import co.realtime.storage.ext.OnError;
import co.realtime.storage.ext.OnItemSnapshot;
import co.realtime.storage.ext.OnReconnected;
import co.realtime.storage.ext.OnReconnecting;
import co.realtime.storage.ext.StorageException;
import config.Config;

public class StorageHandler {
    private static String TAG = "StorageHandler";
    private static StorageHandler instance = null;
    private StorageRef storage;
    private Context context;
    private String listName;

    private StorageHandler(final Context context) {
        try {
            this.context = context;
            storage = new StorageRef(Config.APPKEY, Config.TOKEN, true, false,Config.CLUSTERURL);
            storage.onReconnected(new OnReconnected(){
                @Override
                public void run(StorageRef sender) {
                    ((Activity)context).runOnUiThread(new Runnable(){
                        @Override
                        public void run() {
                            ((MainActivity)context).clearItems();
                            getItems();
                        }});
                }
            });

            storage.onReconnecting(new OnReconnecting() {
                @Override
                public void run(StorageRef storageRef) {
                    Log.i(TAG, "Reconnecting to storage");
                }
            });
        } catch (StorageException e) {
            e.printStackTrace();
        }
    }

    public static StorageHandler getInstance(Context context) {
        if (instance == null) {
           instance = new StorageHandler(context);
        }
        return instance;
    }

    private OnError onError = new OnError(){
        @Override
        public void run(Integer code, String errorMessage) {
            Log.e(TAG,String.format("%d (%s)", code, errorMessage));
        }
    };

    private OnItemSnapshot onPutUpdate = new OnItemSnapshot(){
        @Override
        public void run(final ItemSnapshot itemSnapshot) {
            if(itemSnapshot != null) {
                ((MainActivity)context).updateItems(itemSnapshot);
            }
        }
    };

    private OnItemSnapshot onDelete = new OnItemSnapshot(){
        @Override
        public void run(final ItemSnapshot itemSnapshot) {
            if(itemSnapshot != null) {
                ((MainActivity) context).deleteItems(itemSnapshot);
            }
        }
    };

    public void getItems(){
        TableRef tr = storage.table(Config.TABLE_NAME).equals(Config.PRIMARY_KEY, new ItemAttribute(listName));
        tr.getItems(new OnItemSnapshot(){
            @Override
            public void run(ItemSnapshot item) {
                ((MainActivity)context).getItems(item);
            }}, onError);
    }

    public void storageOn(){
        storage.table(Config.TABLE_NAME).on(StorageRef.StorageEvent.PUT, new ItemAttribute(listName), onPutUpdate);
        storage.table(Config.TABLE_NAME).on(StorageRef.StorageEvent.UPDATE, new ItemAttribute(listName), onPutUpdate);
        storage.table(Config.TABLE_NAME).on(StorageRef.StorageEvent.DELETE, new ItemAttribute(listName), onDelete);
    }

    public void storageOff(){
        storage.table(Config.TABLE_NAME).off(StorageRef.StorageEvent.PUT, new ItemAttribute(listName), onPutUpdate);
        storage.table(Config.TABLE_NAME).off(StorageRef.StorageEvent.UPDATE, new ItemAttribute(listName), onPutUpdate);
        storage.table(Config.TABLE_NAME).off(StorageRef.StorageEvent.DELETE, new ItemAttribute(listName), onDelete);
    }

    public void storagePush(LinkedHashMap<String, ItemAttribute> itemToPut){
        storage.table(Config.TABLE_NAME).push(itemToPut, null, onError);
    }

    public void storageDel(LinkedHashMap<String, ItemAttribute> item){
        storage.table(Config.TABLE_NAME).item(item.get(Config.PRIMARY_KEY), item.get(Config.SECONDARY_KEY)).del(null, onError);
    }

    public void storageSet(LinkedHashMap<String, ItemAttribute> item){
        storage.table(Config.TABLE_NAME).item(item.get(Config.PRIMARY_KEY), item.get(Config.SECONDARY_KEY)).set(item, null, onError);
    }

    public String getListName() {
        return listName;
    }

    public void setListName(String listName) {
        this.listName = listName;
    }

}