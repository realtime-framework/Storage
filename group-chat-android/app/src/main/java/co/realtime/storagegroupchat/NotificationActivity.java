package co.realtime.storagegroupchat;

import android.app.ProgressDialog;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TableLayout;
import android.widget.TextView;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.LinkedHashMap;

import co.realtime.storage.ItemAttribute;
import co.realtime.storage.ItemSnapshot;
import co.realtime.storage.StorageRef;
import co.realtime.storage.TableRef;
import co.realtime.storage.ext.OnError;
import co.realtime.storage.ext.OnItemSnapshot;
import co.realtime.storage.ext.StorageException;
import config.Config;
import domains.Message;
import preferences.PreferencesManager;

import ui.MessageTableRow;


public class NotificationActivity extends ActionBarActivity {

    private StorageRef storageRef;
    private String channel;
    private static boolean mIsInForegroundMode;
    final public static String STORAGE_TAG = "STORAGE_TAG";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notification);

        channel = getIntent().getStringExtra("channel");
        setTitle(channel);

        try {
            storageRef = new StorageRef(Config.APPKEY, Config.TOKEN);
            TableRef tableRef = storageRef.table(Config.TABLE_NAME);

            final ProgressDialog pd = new ProgressDialog(this);
            pd.setCancelable(false);
            pd.setProgressStyle(android.R.style.Widget_ProgressBar_Small);
            pd.show();

            tableRef.equals(Config.PRIMARY_KEY,new ItemAttribute(channel)).getItems(new OnItemSnapshot() {
                @Override
                public void run(ItemSnapshot itemSnapshot) {
                    if (itemSnapshot != null) {
                        final String content = itemSnapshot.val().get(Config.ITEM_PROPERTY_MESSAGE).toString();
                        final String date = itemSnapshot.val().get(Config.ITEM_PROPERTY_DATE).toString();
                        final String user = itemSnapshot.val().get(Config.ITEM_PROPERTY_NICKNAME).toString();
                        NotificationActivity.this.runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                refreshUI(user,content, date);
                            }
                        });
                    } else {
                        pd.dismiss();
                    }
                }
            }, new OnError() {
                @Override
                public void run(Integer integer, String exception) {
                    pd.dismiss();
                    Log.e(STORAGE_TAG, "Exception " + exception);
                }
            });

            tableRef.on(StorageRef.StorageEvent.UPDATE, new ItemAttribute(channel), new OnItemSnapshot() {
                @Override
                public void run(ItemSnapshot itemSnapshot) {
                    if (itemSnapshot != null) {
                        Log.d(STORAGE_TAG, String.format("Item inserted: %s", itemSnapshot.val()));
                        final String msg = itemSnapshot.val().get(Config.ITEM_PROPERTY_MESSAGE).toString();
                        final String date = itemSnapshot.val().get(Config.ITEM_PROPERTY_DATE).toString();
                        final String user = itemSnapshot.val().get(Config.ITEM_PROPERTY_NICKNAME).toString();
                        NotificationActivity.this.runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                refreshUI(user, msg, date);
                            }
                        });
                    }
                }
            });
        } catch (StorageException e) {
            e.printStackTrace();
        }

        final TextView charNumber = (TextView) findViewById(R.id.charNumber);
        charNumber.setText("" + 260);

        final EditText text = (EditText) this.findViewById(R.id.editMessage);

        text.addTextChangedListener(new TextWatcher() {
            public void afterTextChanged(Editable s) {
                charNumber.setText("" + (260 - text.getText().toString().length()));
            }

            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            public void onTextChanged(CharSequence s, int start, int before, int count) {
            }
        });

        final Button saveBtn = (Button) findViewById(R.id.btnSave);
        saveBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String user = PreferencesManager.getInstance(NotificationActivity.this).loadUser();
                String msg = text.getText().toString();
                SimpleDateFormat sdf = new SimpleDateFormat(Config.DATE_FORMAT);
                Message newMsg = new Message(user, msg, sdf.format(new Date()));
                pushMsg(newMsg);
                text.clearFocus();
                InputMethodManager imm = (InputMethodManager) getSystemService(
                        INPUT_METHOD_SERVICE);
                imm.hideSoftInputFromWindow(text.getWindowToken(), 0);
            }
        });
    }

    @Override
    protected void onPause() {
        super.onPause();
        mIsInForegroundMode = false;
    }

    @Override
    protected void onResume() {
        super.onResume();
        mIsInForegroundMode = true;
    }

    public static boolean isInForeground() {
        return mIsInForegroundMode;
    }

    private void refreshUI(String user, String content, String date) {
        Message newMsg = new Message(user, content, date);

        TableLayout tableMessages = (TableLayout) findViewById(R.id.tableMessages);

        if (newMsg.user.equals(PreferencesManager.getInstance(NotificationActivity.this).loadUser())) {
            new MessageTableRow(NotificationActivity.this, tableMessages, true, newMsg);
        } else {
            new MessageTableRow(NotificationActivity.this, tableMessages, false, newMsg);
        }
    }

    private void pushMsg(Message msg) {
        LinkedHashMap<String, ItemAttribute> lhm = new LinkedHashMap<String, ItemAttribute>();
        // Put elements to the map
        lhm.put(Config.PRIMARY_KEY, new ItemAttribute(channel));
        Calendar calendar = Calendar.getInstance();
        Long currentTime = System.currentTimeMillis();
        calendar.setTimeInMillis(currentTime);
        //For match with i0S timestamp
        calendar.add(Calendar.YEAR,-31);
        String timeStamp = String.valueOf(calendar.getTimeInMillis()/1000);
        lhm.put(Config.SECONDARY_KEY, new ItemAttribute(timeStamp));
        lhm.put(Config.ITEM_PROPERTY_MESSAGE, new ItemAttribute(msg.content));
        lhm.put(Config.ITEM_PROPERTY_DATE, new ItemAttribute(msg.date));
        lhm.put(Config.ITEM_PROPERTY_NICKNAME, new ItemAttribute(msg.user));
        TableRef tableRef = storageRef.table(Config.TABLE_NAME);
        tableRef.push(lhm, new OnItemSnapshot() {
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
}
